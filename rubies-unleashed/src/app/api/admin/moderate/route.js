// src/app/api/admin/moderate/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    // 1. Get user token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    
    console.log('🔐 Auth header present:', !!authHeader);
    
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    // 2. Create client WITH the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // 3. Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id);

    // 4. Verify Admin Role
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }

    console.log('👤 User role:', adminProfile?.role);

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 5. Parse Request Body
    const body = await request.json();
    const { project_id, action_type, reason } = body;

    console.log('📝 Request:', { project_id, action_type, reason: reason?.substring(0, 30) });

    if (!project_id || !action_type || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields: project_id, action_type, reason' 
      }, { status: 400 });
    }

    // Validate action type
    const validActions = ['hide', 'delete', 'restore', 'ban', 'unban'];
    if (!validActions.includes(action_type)) {
      return NextResponse.json({ 
        error: `Invalid action_type. Must be one of: ${validActions.join(', ')}` 
      }, { status: 400 });
    }

    // 6. Use SERVICE ROLE for the actual moderation actions
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ✅ Check if this is a Blogger post (not a UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isBloggerPost = !uuidRegex.test(project_id);

    console.log('🔍 Is Blogger post?', isBloggerPost);

    let project = null;
    let projectTitle = 'Unknown Project';
    let developerId = null;
    let developerUsername = 'Unknown';

    if (isBloggerPost) {
      // This is a Blogger post
      console.log('📝 Blogger post detected:', project_id);
      
      if (action_type !== 'hide' && action_type !== 'restore') {
        return NextResponse.json({ 
          error: 'Blogger posts can only be hidden or restored. Use "hide" or "restore" action.' 
        }, { status: 400 });
      }

      projectTitle = `Blogger Post ${project_id}`;
      
    } else {
      // This is a Supabase project
      const { data: projectData, error: projectError } = await adminClient
        .from('projects')
        .select('id, title, user_id, status')
        .eq('id', project_id)
        .single();
      
      if (projectError || !projectData) {
        console.error('❌ Project error:', projectError);
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      project = projectData;
      projectTitle = project.title;
      developerId = project.user_id;

      console.log('📦 Found project:', projectTitle);

      // Fetch Developer Details
      const { data: developer } = await adminClient
        .from('profiles')
        .select('id, username')
        .eq('id', project.user_id)
        .single();

      if (developer) {
        developerUsername = developer.username;
      }
    }

    // 7. Execute Action
    let newStatus = project?.status || 'N/A';
    
    console.log('⚡ Executing action:', action_type);

    switch (action_type) {
      case 'hide':
        // Works for BOTH Blogger and Supabase projects
        const { error: hideError } = await adminClient
          .from('hidden_content')
          .upsert({ 
            game_id: project_id.toString(), 
            reason: reason 
          });
        
        if (hideError) {
          console.error('❌ Hide error:', hideError);
          throw hideError;
        }
        
        console.log('✅ Hidden:', project_id);
        break;
        
      case 'restore':
        // Works for BOTH Blogger and Supabase projects
        const { error: restoreError } = await adminClient
          .from('hidden_content')
          .delete()
          .eq('game_id', project_id.toString());
        
        if (restoreError) {
          console.error('❌ Restore error:', restoreError);
          throw restoreError;
        }
        
        // If it's a Supabase project, also update status
        if (!isBloggerPost && project) {
          newStatus = 'published';
          const { error: statusError } = await adminClient
            .from('projects')
            .update({ status: 'published' })
            .eq('id', project_id);
          
          if (statusError) {
            console.error('❌ Status update error:', statusError);
            throw statusError;
          }
        }
        console.log('✅ Restored:', project_id);
        break;
        
      case 'delete':
        if (isBloggerPost) {
          return NextResponse.json({ 
            error: 'Cannot delete Blogger posts. Use "hide" instead.' 
          }, { status: 400 });
        }
        
        newStatus = 'archived';
        await adminClient
          .from('projects')
          .update({ status: 'archived' })
          .eq('id', project_id);
        
        // Remove from hidden_content if it was there
        await adminClient
          .from('hidden_content')
          .delete()
          .eq('game_id', project_id.toString());
        
        console.log('✅ Archived:', project_id);
        break;
        
      case 'ban':
        if (isBloggerPost) {
          return NextResponse.json({ 
            error: 'Cannot ban Blogger posts. Use "hide" instead.' 
          }, { status: 400 });
        }
        
        newStatus = 'banned';
        const { error: banError } = await adminClient
          .from('projects')
          .update({ status: 'banned' })
          .eq('id', project_id);
        
        if (banError) {
          console.error('❌ Ban error:', banError);
          throw banError;
        }
        
        // Remove from hidden_content (banned replaces hidden)
        await adminClient
          .from('hidden_content')
          .delete()
          .eq('game_id', project_id.toString());
        
        console.log('✅ Banned:', project_id);
        break;
        
      case 'unban':
        if (isBloggerPost) {
          return NextResponse.json({ 
            error: 'Blogger posts cannot be unbanned' 
          }, { status: 400 });
        }
        
        newStatus = 'draft';
        await adminClient
          .from('projects')
          .update({ status: 'draft' })
          .eq('id', project_id);
        
        console.log('✅ Unbanned:', project_id);
        break;
    }

    // 8. Log Moderation Action
    const { data: moderationAction, error: logError } = await adminClient
      .from('moderation_actions')
      .insert({
        project_id: isBloggerPost ? null : project_id,
        project_title: projectTitle,
        admin_id: user.id,
        admin_username: adminProfile.username,
        action_type: action_type,
        reason: reason,
        developer_id: developerId,
        developer_username: developerUsername,
        metadata: {
          is_blogger_post: isBloggerPost,
          blogger_post_id: isBloggerPost ? project_id : null,
          previous_status: project?.status || 'N/A',
          new_status: newStatus,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (logError) {
      console.error('⚠️ Failed to log moderation action:', logError);
      // Don't fail the request, just log it
    }

    console.log(`✅ Admin ${adminProfile.username} executed ${action_type} on "${projectTitle}"`);

    return NextResponse.json({ 
      success: true,
      action: action_type,
      project: {
        id: project_id,
        title: projectTitle,
        is_blogger_post: isBloggerPost,
        previous_status: project?.status || 'N/A',
        new_status: newStatus
      },
      moderation_id: moderationAction?.id
    });

  } catch (error) {
    console.error('❌ Moderation API Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}

// GET endpoint: Fetch moderation history
export async function GET(request) {
  try {
    // 1. Verify admin auth
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    // 2. Verify user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Verify admin role
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 4. Use service role to fetch ALL moderation actions
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 5. Fetch moderation history
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: actions, error, count } = await adminClient
      .from('moderation_actions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }

    console.log(`✅ Fetched ${actions?.length || 0} moderation actions (total: ${count})`);

    return NextResponse.json({ 
      actions: actions || [],
      total: count || 0
    });

  } catch (error) {
    console.error('❌ Moderation History Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}