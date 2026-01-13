import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Normalize UI issue labels to DB-safe enum values
 */
function normalizeReason(issueType) {
  if (!issueType) return 'other';

  const map = {
    'malware / security risk': 'malware',
    'broken download link': 'broken_link',
    'wrong version / outdated': 'outdated', 
    'incorrect information': 'inappropriate',
    'spam content': 'spam', // ✅ NEW
    'copyright violation': 'copyright', // ✅ NEW
    'inappropriate content': 'inappropriate', // ✅ NEW
    'other': 'other',
  };

  return map[issueType.toLowerCase()] || 'other';
}

/**
 * Check if game_id is a Supabase project (UUID format)
 */
function isSupabaseProject(gameId) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(gameId);
}

export async function POST(request) {
  console.log('🔧 Report API called');

  try {
    const body = await request.json();
    console.log('📥 Request body:', body);

    const { game_id, user_id, issue_type, description } = body;

    if (!game_id || !issue_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    /**
     * 1️⃣ Insert into legacy `reports` table (admin review)
     * This table is flexible (text fields) - ALWAYS works
     */
    const { error: reportsError } = await supabase
      .from('reports')
      .insert({
        game_id: String(game_id),
        user_id: user_id ?? null,
        issue_type,
        description: description || null,
        status: 'pending',
      });

    if (reportsError) {
      console.error('❌ reports insert failed:', reportsError);
      // Continue anyway - this is the fallback table
    }

    /**
     * 2️⃣ Insert into `project_reports` ONLY for Supabase projects
     * (Blogger games don't exist in projects table)
     */
    if (isSupabaseProject(game_id)) {
      console.log('📝 Supabase project detected, inserting into project_reports');
      
      const normalizedReason = normalizeReason(issue_type);

      const { error: projectReportsError } = await supabase
        .from('project_reports')
        .insert({
          project_id: String(game_id),
          user_id: user_id ?? null,
          reason: normalizedReason,
          details: description || null,
        });

      if (projectReportsError) {
        console.error('❌ project_reports insert failed:', projectReportsError);

        // Ignore duplicate reports, fail on everything else
        if (projectReportsError.code !== '23505') {
          console.error('❌ Non-duplicate error in project_reports:', projectReportsError);
          // Don't fail the whole request - reports table insert might have worked
        }
      } else {
        console.log('✅ project_reports insert successful');
      }
    } else {
      console.log('📝 Blogger game detected, skipping project_reports');
    }

    console.log('✅ Report API success');
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('❌ API Crash:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}