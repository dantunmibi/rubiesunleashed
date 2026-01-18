import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchGameById } from '@/lib/blogger';
import { generateSlug } from '@/lib/game-utils';
import { sendForgeWelcomeEmail } from '@/lib/emailService'; // ✅ ADD

export async function POST(request) {
  // Use Service Role for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Verify Admin Auth
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify Admin Role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 3. Parse Request Body
    const body = await request.json();
    const { blogger_post_ids, target_user_id, target_username } = body;

    if (!blogger_post_ids?.length || !target_user_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: blogger_post_ids, target_user_id' 
      }, { status: 400 });
    }

    console.log(`🎯 Admin ${user.id} assigning ${blogger_post_ids.length} posts to user ${target_user_id}`);

    // 4. Verify Target User Exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, username, developer_name, role, forge_welcome_sent')
      .eq('id', target_user_id)
      .single();
    
    if (userError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // 5. Process Each Blogger Post
    const results = [];
    const errors = [];

    for (const bloggerPostId of blogger_post_ids) {
      try {
        console.log(`📝 Processing Blogger post: ${bloggerPostId}`);
        
        // Fetch full Blogger post data
        const bloggerPost = await fetchGameById(bloggerPostId);

        if (!bloggerPost) {
          errors.push(`Blogger post ${bloggerPostId} not found`);
          continue;
        }

        // Check if already claimed
        const { data: existingProject } = await supabase
          .from('projects')
          .select('id, title')
          .eq('original_blogger_id', bloggerPostId)
          .single();
        
        if (existingProject) {
          errors.push(`Post "${bloggerPost.title}" already claimed (Project ID: ${existingProject.id})`);
          continue;
        }

        // Generate unique slug
        const slug = generateSlug(bloggerPost.title);

        // Better platform detection from Blogger data
        let primaryPlatform = 'Windows'; // Default fallback

        // Strategy 1: Use first download link platform
        if (bloggerPost.downloadLinks && bloggerPost.downloadLinks.length > 0) {
          primaryPlatform = bloggerPost.downloadLinks[0].platform || 'Windows';
          console.log(`📱 Platform from download links: ${primaryPlatform}`);
        } 
        // Strategy 2: Parse from buildPlatform string
        else if (bloggerPost.buildPlatform) {
          const platforms = bloggerPost.buildPlatform.split(/[,&]/).map(p => p.trim());
          primaryPlatform = platforms[0] || 'Windows';
          console.log(`📱 Platform from buildPlatform: ${primaryPlatform} (from "${bloggerPost.buildPlatform}")`);
        }
        // Strategy 3: Detect from download URL patterns
        else if (bloggerPost.downloadUrl) {
          if (bloggerPost.downloadUrl.includes('play.google.com') || 
              bloggerPost.downloadUrl.includes('android')) {
            primaryPlatform = 'Android';
          } else if (bloggerPost.downloadUrl.includes('apps.apple.com') || 
                     bloggerPost.downloadUrl.includes('ios')) {
            primaryPlatform = 'iOS';
          } else if (bloggerPost.downloadUrl.includes('itch.io') || 
                     bloggerPost.downloadUrl.includes('steam')) {
            primaryPlatform = 'Windows';
          }
          console.log(`📱 Platform from URL pattern: ${primaryPlatform}`);
        }

        // Map Blogger data to Supabase schema
        const projectData = {
          // Identity
          user_id: target_user_id,
          slug: slug,
          original_blogger_id: bloggerPostId,
          
          // Content
          title: bloggerPost.title,
          description: bloggerPost.description || '',
          full_description: bloggerPost.fullDescription || bloggerPost.description || '',
          cover_url: bloggerPost.image || null,
          screenshots: bloggerPost.screenshots || [],
          video_url: bloggerPost.video || null,
          html5_embed_url: bloggerPost.gameEmbed || null,
          
          // Distribution
          download_links: bloggerPost.downloadLinks || [],
          download_url: bloggerPost.downloadUrl || null,
          platform: primaryPlatform,
          version: bloggerPost.version || '1.0',
          
          // Metadata
          tags: bloggerPost.tags || [],
          features: bloggerPost.features || [],
          requirements: bloggerPost.requirements || [],
          controls: bloggerPost.controls || [],
          how_it_works: bloggerPost.howItWorks || [],
          social_links: bloggerPost.socialLinks || [],
          
          // Use user's developer_name, fallback to Blogger developer
          developer: targetUser.developer_name || bloggerPost.developer || 'Unknown Developer',
          
          // Content Moderation
          content_warning: bloggerPost.contentWarnings || null,
          age_rating: bloggerPost.ageRating || 'All Ages',
          size: bloggerPost.size || null,
          
          // Type & Status
          type: bloggerPost.type || 'Game',
          license: 'Free',
          status: 'draft',
          
          // Timestamps
          created_at: bloggerPost.publishedDate || new Date().toISOString(),
          updated_at: bloggerPost.lastUpdated || new Date().toISOString()
        };

        console.log(`✅ Project data prepared:`, {
          title: projectData.title,
          platform: projectData.platform,
          download_links_count: projectData.download_links.length,
          developer: projectData.developer
        });

        // Insert project
        const { data: project, error: insertError } = await supabase
          .from('projects')
          .insert(projectData)
          .select()
          .single();
        
        if (insertError) {
          // Handle slug collision with retry
          if (insertError.code === '23505' && insertError.message.includes('slug')) {
            const retrySlug = generateSlug(bloggerPost.title);
            projectData.slug = retrySlug;
            
            const { data: retryProject, error: retryError } = await supabase
              .from('projects')
              .insert(projectData)
              .select()
              .single();
            
            if (retryError) {
              throw retryError;
            }
            
            results.push({
              blogger_id: bloggerPostId,
              project_id: retryProject.id,
              title: retryProject.title,
              slug: retryProject.slug,
              project: retryProject // ✅ Store full project for email
            });
          } else {
            throw insertError;
          }
        } else {
          results.push({
            blogger_id: bloggerPostId,
            project_id: project.id,
            title: project.title,
            slug: project.slug,
            project: project // ✅ Store full project for email
          });
        }

        console.log(`✅ Created project: ${bloggerPost.title} (${project?.id || 'retry'})`);

      } catch (error) {
        console.error(`❌ Failed to process ${bloggerPostId}:`, error);
        errors.push(`${bloggerPostId}: ${error.message}`);
      }
    }

    // 6. Handle User Promotion & Email
    if (results.length > 0) {
      await handleAssignmentNotification(supabase, target_user_id, targetUser, results);
    }

    // 7. Return Results
    const response = {
      assigned_count: results.length,
      error_count: errors.length,
      target_user: target_username,
      results: results.map(r => ({
        blogger_id: r.blogger_id,
        project_id: r.project_id,
        title: r.title,
        slug: r.slug
      })),
      errors: errors.length > 0 ? errors : undefined
    };

    console.log(`🎉 Assignment complete: ${results.length} success, ${errors.length} errors`);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Assignment API Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}

// ✅ NEW: Handle user promotion and email notification
async function handleAssignmentNotification(supabase, userId, targetUser, results) {
  console.log('🔥 === ASSIGNMENT EMAIL HANDLER STARTED ===');
  console.log('   User ID:', userId);
  console.log('   Projects assigned:', results.length);
  console.log('   Current role:', targetUser.role);
  console.log('   Forge welcome sent:', targetUser.forge_welcome_sent);

  try {
    // 1. Check if welcome email already sent
    if (targetUser.forge_welcome_sent) {
      console.log('ℹ️ Forge welcome already sent, skipping email');
      
      // Still promote to architect if needed
      if (targetUser.role !== 'architect') {
        console.log('🔧 Promoting to architect (without email)');
        await supabase
          .from('profiles')
          .update({ role: 'architect', archetype: 'architect' })
          .eq('id', userId);
      }
      
      // Auto-populate developer_name if not set
      if (!targetUser.developer_name) {
        const firstProject = results[0].project;
        if (firstProject?.developer && firstProject.developer !== 'Unknown Developer') {
          await supabase
            .from('profiles')
            .update({ developer_name: firstProject.developer })
            .eq('id', userId);
          console.log(`🏷️ Auto-populated developer_name: ${firstProject.developer}`);
        }
      }
      
      return;
    }

    console.log('✅ First time becoming architect! Sending welcome email...');

    // 2. Promote to architect if not already
    if (targetUser.role !== 'architect') {
      console.log('🎓 Promoting user to architect role');
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ 
          role: 'architect',
          archetype: 'architect'
        })
        .eq('id', userId);

      if (roleError) {
        console.error('❌ Failed to update role:', roleError);
      }
    }

    // 3. Auto-populate developer_name if not set
    if (!targetUser.developer_name) {
      const firstProject = results[0].project;
      if (firstProject?.developer && firstProject.developer !== 'Unknown Developer') {
        await supabase
          .from('profiles')
          .update({ developer_name: firstProject.developer })
          .eq('id', userId);
        console.log(`🏷️ Auto-populated developer_name: ${firstProject.developer}`);
      }
    }

    // 4. Get user email
    const { data: { user: authUser }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !authUser?.email) {
      console.error('❌ Failed to get user email:', userError);
      return;
    }

    console.log('📧 Sending Forge welcome email to:', authUser.email);

    // 5. Send the email with first project details
    const firstProject = results[0].project;
    const emailResult = await sendForgeWelcomeEmail({
      to: authUser.email,
      username: targetUser.username,
      projectTitle: firstProject.title,
      projectId: firstProject.id,
      projectCount: results.length // ✅ Include total count
    });

    console.log('📬 Email result:', emailResult);

    // 6. Mark as sent ONLY after successful email
    if (emailResult.success) {
      const { error: flagError } = await supabase
        .from('profiles')
        .update({ forge_welcome_sent: true })
        .eq('id', userId);

      if (flagError) {
        console.error('⚠️ Failed to set forge_welcome_sent flag:', flagError);
      } else {
        console.log('✅ Forge welcome email sent and flagged successfully');
      }
    } else {
      console.error('❌ Forge welcome email failed:', emailResult.error);
    }

  } catch (error) {
    console.error('❌ CRITICAL ERROR in handleAssignmentNotification:', error);
    console.error('Stack:', error.stack);
  }
  
  console.log('🔥 === ASSIGNMENT EMAIL HANDLER FINISHED ===');
}