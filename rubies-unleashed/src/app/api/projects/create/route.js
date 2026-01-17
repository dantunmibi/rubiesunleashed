  import { NextResponse } from 'next/server';
  import { createClient } from '@supabase/supabase-js';
  import { generateSlug } from '@/lib/game-utils';
  import { notifyProjectCreated } from '@/lib/projectNotifications';  // ✅ ADD IMPORT

  export async function POST(request) {
    // Use Service Role to bypass RLS for the initial check, 
    // but we mostly need it to verify the token.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
      // 1. Verify Auth Token
      const authHeader = request.headers.get('Authorization');
      console.log("👉 Auth Header:", authHeader ? "Present" : "Missing"); // DEBUG LOG
      const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
      
      if (!token) {
          return NextResponse.json({ error: 'Missing token' }, { status: 401 });
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // 2. Validate Body
      const body = await request.json();
      const { title, developer } = body;

      if (!title?.trim()) {
        return NextResponse.json({ error: 'Title required' }, { status: 400 });
      }

      // 3. Generate Slug
      const slug = generateSlug(title);

      // 4. Insert Project
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: title.trim(),
          developer: developer || 'Unknown Developer',
          slug,
          status: 'draft'
        })
        .select()
        .single();
        
      if (error) {
        // Retry once with new suffix
        if (error.code === '23505') {
          const retrySlug = generateSlug(title); // Generates new random suffix
          
          const { data: retryProject, error: retryError } = await supabase
            .from('projects')
            .insert({ 
              user_id: user.id, 
              title: title.trim(), 
              developer: developer || 'Unknown Developer',
              slug: retrySlug, 
              status: 'draft' 
            })
            .select()
            .single();
          
          if (!retryError) {
            // ✅ ADD NOTIFICATION FOR RETRY SUCCESS
            notifyProjectCreated(retryProject);
            return NextResponse.json({ project: retryProject }, { status: 201 });
          }
          
          // If retry also fails, return error
          return NextResponse.json({ error: 'Unable to generate unique slug' }, { status: 409 });
        }
        console.error('DB Insert Error:', error);
        throw error;
      }

      // ✅ ADD NOTIFICATION FOR SUCCESS
      notifyProjectCreated(project);

      return NextResponse.json({ project }, { status: 201 });

    } catch (error) {
      console.error('Create API Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }