import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { game_id, user_id, issue_type, description } = body;

    // Initialize Supabase Client (Server-Side)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Perform Insert
    const { error } = await supabase
      .from('reports')
      .insert({
        game_id: String(game_id),
        user_id: user_id || null, // Allow anonymous
        issue_type,
        description,
        status: 'pending'
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('API Report Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}