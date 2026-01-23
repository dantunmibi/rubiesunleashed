import { supabase } from '@/lib/supabase'; // Client Singleton
import { createServerClient } from '@/lib/supabase-server'; // New Server Factory
import { fetchGames, fetchGameById } from '@/lib/blogger';
import { processSupabaseProject } from '@/lib/game-utils';

const SUPABASE_FEED_LIMIT = 100;

/**
 * Helper to get the correct client based on environment
 */
const getClient = async () => {
  if (typeof window === 'undefined') {
    // We are on the Server -> Use fresh client with cookies
    return await createServerClient();
  }
  // We are on the Client -> Use singleton
  return supabase;
};

// ✅ Server-safe public client
const getPublicClient = async () => {
  // Server: use server client with cookie handling
  if (typeof window === 'undefined') {
    return await createServerClient();
  }
  // Client: use singleton
  return supabase;
};

/**
 * Get unified feed (Supabase + Blogger)
 * Uses 'projects_public' VIEW for safety and speed.
 */
export async function getUnifiedFeed(options = {}) {
  const { limit = SUPABASE_FEED_LIMIT } = options;
  
  try {
    const client = await getPublicClient(); // ✅ ADDED await
    
    const { data: supabaseProjects, error } = await client
      .from('projects_public')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Supabase fetch error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Error hint:', error?.hint);
    }
    
    console.log('📊 Found Supabase projects:', supabaseProjects?.length || 0);
    
    // Rest stays the same...
    const processedSupabase = (supabaseProjects || [])
      .map(processSupabaseProject)
      .filter(Boolean);
    
    const bloggerGames = await fetchGames();
    
    const claimedBloggerIds = new Set(
      processedSupabase
        .filter(p => p.original_blogger_id)
        .map(p => p.original_blogger_id)
    );
    
    const activeBloggerGames = bloggerGames.filter(
      game => !claimedBloggerIds.has(game.id)
    );
    
    const combined = [...processedSupabase, ...activeBloggerGames];
    combined.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
    
    return combined;
    
  } catch (error) {
    console.error('getUnifiedFeed Critical Failure:', error);
    return await fetchGames();
  }
}

/**
 * Get Single Game (Using Public View)
 */
export async function getGame(slug, userId = null, isAdmin = false, depth = 0) {
  if (depth > 3) {
    console.warn(`getGame recursion limit reached for slug: ${slug}`);
    return null;
  }

  console.log('🔍 Searching for slug:', slug);

  try {
    const client = await getPublicClient(); // ✅ ADDED await
    
    let { data: project, error } = await client
      .from('projects_public')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.log('❌ Supabase query error:', error.message);
    }
    
    if (project) {
      console.log('✅ Found Supabase project:', project.title);
      return processSupabaseProject(project);
    }
    
    console.log('❌ No Supabase project found for slug:', slug);
    
    // Strategy B: Legacy URL Resolution (Blogger ID in slug)
    if (slug.includes('-')) {
      const parts = slug.split('-');
      const possibleBloggerId = parts[parts.length - 1];
      
      console.log('🔍 Trying blogger ID lookup:', possibleBloggerId);
      
      const { data: claimedProject, error: claimedError } = await client
        .from('projects_public')
        .select('*')
        .eq('original_blogger_id', possibleBloggerId)
        .single();
      
      if (claimedProject) {
        console.log('✅ Found claimed project:', claimedProject.title);
        return processSupabaseProject(claimedProject);
      }
      
      if (claimedError && claimedError.code !== 'PGRST116') {
        console.log('❌ Claimed project query error:', claimedError.message);
      }
    }
    
    // Strategy C: Blogger Fallback
    console.log('🔍 Falling back to Blogger...');
    const bloggerGame = await fetchGameById(slug);
    
    if (bloggerGame) {
      console.log('✅ Found Blogger game:', bloggerGame.title);
      
      // Check if this blogger game has been claimed
      const { data: claimed } = await client
        .from('projects_public')
        .select('slug')
        .eq('original_blogger_id', bloggerGame.id)
        .single();
      
      if (claimed) {
        console.log('🔄 Redirecting to claimed version:', claimed.slug);
        return getGame(claimed.slug, userId, isAdmin, depth + 1);
      }
      
      return bloggerGame;
    }
    
    console.log('❌ Game not found anywhere');
    return null;
    
  } catch (error) {
    console.error('❌ getGame critical error:', error);
    return null;
  }
}

/**
 * Get User's Public Portfolio
 * Uses Public View
 */
export async function getUserPublicProjects(userId) {
  const client = await getPublicClient(); // ✅ ADDED await
  
  const { data, error } = await client
    .from('projects_public')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('getUserPublicProjects error:', error);
    return [];
  }
  
  return data.map(processSupabaseProject);
}

/**
 * Sitemap Data
 * Queries Public View
 */
export async function getSitemapData() {
  try {
    const client = await getPublicClient(); // ✅ ADDED await
    const { data } = await client
      .from('projects_public')
      .select('slug, updated_at');
    
    const bloggerGames = await fetchGames();
    const bloggerSlugs = bloggerGames.map(g => ({
      slug: g.slug,
      updated_at: g.publishedDate
    }));
    
    return [...(data || []), ...bloggerSlugs];
  } catch (error) {
    return [];
  }
}

// Keep the authenticated functions for dashboard use
export async function getUserProjects(userId, supabaseClient) {
  const client = supabaseClient || await getClient();
  
  const { data, error } = await client
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('getUserProjects error:', error);
    return [];
  }
  
  return data.map(processSupabaseProject);
}