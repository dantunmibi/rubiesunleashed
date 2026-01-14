import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchGameById } from '@/lib/blogger';
import { generateSlug } from '@/lib/game-utils';

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
      .select('id, username, developer_name')
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

// In the assignment API, replace the platform detection section:

// ✅ FIX: Better platform detection from Blogger data
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
    primaryPlatform = 'Windows'; // Most common for these platforms
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
  
  // Distribution - ✅ FIX: Proper platform handling
  download_links: bloggerPost.downloadLinks || [],
  download_url: bloggerPost.downloadUrl || null,
  platform: primaryPlatform, // ✅ This was the missing piece!
  version: bloggerPost.version || '1.0',
  
  // Metadata
  tags: bloggerPost.tags || [],
  features: bloggerPost.features || [],
  requirements: bloggerPost.requirements || [],
  controls: bloggerPost.controls || [],
  how_it_works: bloggerPost.howItWorks || [],
  social_links: bloggerPost.socialLinks || [],
  
  // ✅ FIX: Use user's developer_name, fallback to Blogger developer
  developer: targetUser.developer_name || bloggerPost.developer || 'Unknown Developer',
  
  // Content Moderation
  content_warning: bloggerPost.contentWarnings || null,
  age_rating: bloggerPost.ageRating || 'All Ages',
  size: bloggerPost.size || null,
  
  // Type & Status
  type: bloggerPost.type || 'Game',
  license: 'Free', // Default for Blogger posts
  status: 'draft', // Create as draft for user review
  
  // Timestamps (preserve original dates)
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
              slug: retryProject.slug
            });
          } else {
            throw insertError;
          }
        } else {
          results.push({
            blogger_id: bloggerPostId,
            project_id: project.id,
            title: project.title,
            slug: project.slug
          });
        }

        console.log(`✅ Created project: ${bloggerPost.title} (${project?.id || 'retry'})`);

      } catch (error) {
        console.error(`❌ Failed to process ${bloggerPostId}:`, error);
        errors.push(`${bloggerPostId}: ${error.message}`);
      }
    }

// 6. Auto-populate developer_name ONLY if not set
if (results.length > 0) {
  // Check if user needs promotion
  if (targetUser.role !== 'architect') {
    console.log(`🎓 Auto-promoting user ${target_user_id} to Architect (received ${results.length} projects)`);
    
    const { error: promotionError } = await supabase
      .from('profiles')
      .update({ 
        role: 'architect',
        archetype: 'architect'
      })
      .eq('id', target_user_id);
    
    if (promotionError) {
      console.error('❌ Failed to promote user:', promotionError);
    } else {
      console.log('✅ User promoted to Architect successfully');
    }
  }
  
  // Auto-populate developer_name ONLY if not set
  if (!targetUser.developer_name) {
    const firstResult = results[0];
    const bloggerPost = await fetchGameById(firstResult.blogger_id);
    
    if (bloggerPost?.developer && bloggerPost.developer !== 'Unknown Developer') {
      await supabase
        .from('profiles')
        .update({ developer_name: bloggerPost.developer })
        .eq('id', target_user_id);
      
      console.log(`🏷️ Auto-populated developer_name: ${bloggerPost.developer}`);
    }
  } else {
    console.log(`ℹ️ User already has developer_name: ${targetUser.developer_name}, not overriding`);
  }
}

    // 7. Return Results
    const response = {
      assigned_count: results.length,
      error_count: errors.length,
      target_user: target_username,
      results: results,
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