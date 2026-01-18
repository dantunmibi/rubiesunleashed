import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Verify Auth (Enhanced token extraction)
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ NEW: Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.role === 'admin';

    // 2. Parse Query Params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hard = searchParams.get('hard') === 'true';
    const confirmTitle = searchParams.get('confirmTitle'); // For hard delete

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // 3. Fetch Current Project (Verify ownership & status)
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, user_id, title, status')
      .eq('id', id)
      .single();

    if (fetchError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // ✅ MODIFIED: Verify ownership OR admin
    if (project.user_id !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not own this project' },
        { status: 403 }
      );
    }

    // ✅ MODIFIED: Only non-admins are blocked from deleting banned projects
    if (project.status === 'banned' && !isAdmin) {
      return NextResponse.json(
        { error: 'Cannot delete banned project. Contact support for review.' },
        { status: 403 }
      );
    }

    // 4. Handle Hard Delete
    if (hard) {
      // ✅ MODIFIED: Admins don't need title confirmation
      if (!isAdmin) {
        // Require title confirmation for regular users
        if (!confirmTitle || confirmTitle.trim() !== project.title) {
          return NextResponse.json(
            { 
              error: 'Hard delete requires exact title confirmation',
              hint: 'Send ?confirmTitle=<exact project title>'
            },
            { status: 400 }
          );
        }
      }

      // Perform hard delete
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
        // ✅ REMOVED: .eq('user_id', user.id) - so admins can delete any project

      if (error) {
        console.error('Hard delete error:', error);
        throw error;
      }

      return NextResponse.json({ 
        deleted: true, 
        hard: true,
        message: `Project permanently deleted${isAdmin ? ' (admin override)' : ''}`,
        admin_action: isAdmin
      });
    }

    // 5. Handle Soft Delete (Archive)
    const { data: archivedProject, error: archiveError } = await supabase
      .from('projects')
      .update({ status: 'archived' })
      .eq('id', id)
      // ✅ MODIFIED: Don't check user_id for admins
      .select()
      .single();

    if (archiveError) {
      console.error('Soft delete error:', archiveError);
      throw archiveError;
    }

    if (!archivedProject) {
      return NextResponse.json(
        { error: 'Archive failed - project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      deleted: true, 
      hard: false,
      project: archivedProject,
      message: `Project archived${isAdmin ? ' (admin override)' : ''}`,
      admin_action: isAdmin
    });

  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}