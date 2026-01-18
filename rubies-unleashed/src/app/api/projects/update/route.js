import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendProjectPublishedEmail } from '@/lib/emailService'; // ✅ ADD

export async function PUT(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Verify Auth
    const authHeader = request.headers.get('Authorization');
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // 3. Get Current Project State
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('status, user_id, slug, title') // ✅ Added slug and title for email
      .eq('id', id)
      .single();

    if (fetchError || !currentProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify ownership
    if (currentProject.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not own this project' },
        { status: 403 }
      );
    }

    // 4. Sanitize Updates
    delete updates.slug;
    delete updates.user_id;
    delete updates.created_at;
    delete updates.original_blogger_id;

    // 5. Status Transition Validation
    if (updates.status) {
      const allowedStatuses = ['draft', 'published', 'archived'];
      
      if (!allowedStatuses.includes(updates.status)) {
        return NextResponse.json(
          { error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      
      if (currentProject.status === 'banned') {
        return NextResponse.json(
          { error: 'Cannot modify banned project. Contact support.' },
          { status: 403 }
        );
      }
    }

    // 6. Validate download_links Structure
    if (updates.download_links !== undefined) {
      if (!Array.isArray(updates.download_links)) {
        return NextResponse.json(
          { error: 'download_links must be an array' },
          { status: 400 }
        );
      }

      const isValid = updates.download_links.every(
        link => 
          link && 
          typeof link === 'object' && 
          link.platform && 
          typeof link.platform === 'string' &&
          link.url && 
          typeof link.url === 'string' &&
          link.url.startsWith('http')
      );

      if (!isValid) {
        return NextResponse.json(
          { error: 'Each download link must have platform (string) and url (valid http/https)' },
          { status: 400 }
        );
      }

      updates.download_url = updates.download_links[0]?.url || null;
    }

    // 7. Validate social_links Structure
    if (updates.social_links !== undefined) {
      if (!Array.isArray(updates.social_links)) {
        return NextResponse.json(
          { error: 'social_links must be an array' },
          { status: 400 }
        );
      }

      const isValid = updates.social_links.every(
        link =>
          link &&
          typeof link === 'object' &&
          link.label &&
          link.url &&
          link.url.startsWith('http')
      );

      if (!isValid) {
        return NextResponse.json(
          { error: 'Each social link must have label and valid url' },
          { status: 400 }
        );
      }
    }

    // 8. Validate Arrays
    const arrayFields = ['tags', 'features', 'requirements', 'controls', 'screenshots'];
    for (const field of arrayFields) {
      if (updates[field] !== undefined && !Array.isArray(updates[field])) {
        return NextResponse.json(
          { error: `${field} must be an array` },
          { status: 400 }
        );
      }
    }

    // ✅ NEW: Detect if publishing for first time
    const isPublishing = updates.status === 'published' && currentProject.status !== 'published';

    // 9. Update Project
    const { data: project, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('DB Update Error:', error);
      throw error;
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Update failed - project not found' },
        { status: 404 }
      );
    }

    // ✅ NEW: Send publishing email if status changed to published
    if (isPublishing) {
      console.log('🚀 Project published! Sending email notification');
      
      try {
        // Get user email
        const { data: { user: authUser }, error: userError } = await supabase.auth.admin.getUserById(user.id);
        
        if (userError || !authUser?.email) {
          console.error('❌ Failed to get user email:', userError);
        } else {
          // Get username
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();

          if (profileError || !profile) {
            console.error('❌ Failed to get profile:', profileError);
          } else {
            // Send publishing email
            const emailResult = await sendProjectPublishedEmail({
              to: authUser.email,
              username: profile.username,
              projectTitle: project.title,
              projectSlug: project.slug
            });

            if (emailResult.success) {
              console.log('✅ Project published email sent to:', authUser.email);
            } else {
              console.error('❌ Publishing email failed:', emailResult.error);
            }
          }
        }
      } catch (emailError) {
        console.error('❌ Publishing email handler error:', emailError);
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Update API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}