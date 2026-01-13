import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Verify Auth Token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get developer name from request
    const { developer_name } = await request.json();
    
    if (!developer_name || !developer_name.trim()) {
      return NextResponse.json({ error: 'Developer name is required' }, { status: 400 });
    }
    
    // 3. Update all user's projects with new developer name
    const { data: updatedProjects, error } = await supabase
      .from('projects')
      .update({ 
        developer: developer_name.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select('id, title');
    
    if (error) {
      console.error('Update projects error:', error);
      return NextResponse.json({ error: 'Failed to update projects' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      updated_count: updatedProjects?.length || 0,
      projects: updatedProjects
    });
    
  } catch (error) {
    console.error('Update developer name error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}