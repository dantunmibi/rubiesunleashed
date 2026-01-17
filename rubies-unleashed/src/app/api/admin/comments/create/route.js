import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // ================================================================
    // 1. VERIFY ADMIN AUTH
    // ================================================================
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // ================================================================
    // 2. VALIDATE REQUEST BODY
    // ================================================================
    const body = await request.json();
    const { project_id, comment, comment_type } = body;

    if (!project_id || !comment?.trim() || !comment_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: project_id, comment, comment_type' 
      }, { status: 400 });
    }

    if (!['moderation', 'feedback'].includes(comment_type)) {
      return NextResponse.json({ 
        error: 'Invalid comment_type. Must be "moderation" or "feedback"' 
      }, { status: 400 });
    }

    // ================================================================
    // 3. FETCH PROJECT DETAILS
    // ================================================================
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, user_id, slug')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch developer details
    const { data: developer } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', project.user_id)
      .single();

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // ================================================================
    // 4. CREATE ADMIN COMMENT
    // ================================================================
    const { data: adminComment, error: insertError } = await supabase
      .from('admin_comments')
      .insert({
        project_id: project.id,
        project_title: project.title,
        admin_id: user.id,
        admin_username: profile.username,
        admin_email: user.email,
        comment: comment.trim(),
        comment_type,
        developer_id: project.user_id,
        developer_username: developer.username,
        metadata: {
          project_slug: project.slug
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert Error:', insertError);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    // ================================================================
    // 5. CREATE DATABASE NOTIFICATION FOR DEVELOPER
    // ================================================================
    const typeLabel = comment_type === 'moderation' ? 'moderation note' : 'feedback';
    const icon = comment_type === 'moderation' ? '⚠️' : '💬';
    
    const { error: notificationError } = await supabase
      .from('user_notifications')
      .insert({
        user_id: project.user_id,           // ✅ Target: Developer
        actor_id: user.id,                  // ✅ Actor: Admin
        type: `admin_comment_${comment_type}`,
        message: `Admin left ${typeLabel} on "${project.title}"`,
        icon: icon,
        action_url: `/${developer.username}/dashboard/project/${project.id}`, // ✅ Direct link to cockpit
        metadata: {
          projectId: project.id,
          projectTitle: project.title,
          projectSlug: project.slug,
          commentType: comment_type,
          adminUsername: profile.username,
          commentId: adminComment.id
        }
      });

    if (notificationError) {
      console.error('Notification Error:', notificationError);
      // Don't fail the request if notification fails - comment was still created
    }

    return NextResponse.json({ 
      success: true,
      comment: adminComment,
      notification_sent: !notificationError
    }, { status: 201 });

  } catch (error) {
    console.error('Admin Comment API Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}