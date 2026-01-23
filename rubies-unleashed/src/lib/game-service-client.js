import { createClient } from '@supabase/supabase-js';
import { fetchGames, fetchGameById } from '@/lib/blogger';
import { processSupabaseProject } from '@/lib/game-utils';

const SUPABASE_FEED_LIMIT = 100;

// Create a fresh anonymous client (no auth context)
let anonClient = null;

const getPublicClient = () => {
  if (!anonClient) {
    anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false, // Don't use stored sessions
          autoRefreshToken: false,
        },
      }
    );
  }
  return anonClient;
};

export async function getUnifiedFeed(options = {}) {
  const { limit = SUPABASE_FEED_LIMIT, includeArchived = false } = options;
  
  try {
    const client = getPublicClient(); // Now returns the working singleton
    
    console.log('ℹ️ Using projects_public view (hidden content pre-filtered)');
    
    let supabaseProjects = [];
    
    try {
      const { data, error } = await client
        .from('projects_public')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Supabase fetch error:', error);
        console.error('Error code:', error?.code);
        console.error('Error message:', error?.message);
      } else {
        supabaseProjects = data || [];
      }
    } catch (error) {
      console.error('Supabase query failed:', error);
    }
    
    console.log('📊 Found Supabase projects:', supabaseProjects.length);
    
    // Process Supabase projects (no filtering needed - view handles it)
    const processedSupabase = supabaseProjects
      .map(processSupabaseProject)
      .filter(Boolean);
    
    // Fetch Blogger games
    const bloggerGames = await fetchGames();
    
    // Filter out claimed Blogger games
    const claimedBloggerIds = new Set(
      processedSupabase
        .filter(p => p.original_blogger_id)
        .map(p => p.original_blogger_id)
    );
    
    const activeBloggerGames = bloggerGames
      .filter(game => !claimedBloggerIds.has(game.id));
    
    // Merge and sort by date (newest first)
    const combined = [...processedSupabase, ...activeBloggerGames];
    combined.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
    
    console.log(`📊 Unified feed: ${processedSupabase.length} community + ${activeBloggerGames.length} classic = ${combined.length} total`);
    
    return combined;
    
  } catch (error) {
    console.error('getUnifiedFeed Critical Failure:', error);
    return await fetchGames();
  }
}

export async function getGame(slug, userId = null, isAdmin = false, depth = 0) {
  if (depth > 3) {
    console.warn(`getGame recursion limit reached for slug: ${slug}`);
    return null;
  }

  console.log('🔍 Searching for slug:', slug, '| Admin:', isAdmin);

  try {
    const client = getPublicClient();
    
    // ✅ View filters hidden content automatically
    console.log('ℹ️ Using projects_public view (hidden content pre-filtered)');
    
    // Strategy A: Direct slug match (Supabase project)
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
    
    // Strategy B: Blogger ID lookup (claimed Blogger post)
    if (slug.includes('-')) {
      const parts = slug.split('-');
      const possibleBloggerId = parts[parts.length - 1];
      
      const { data: claimedProject } = await client
        .from('projects_public')
        .select('*')
        .eq('original_blogger_id', possibleBloggerId)
        .single();
      
      if (claimedProject) {
        console.log('✅ Found claimed project:', claimedProject.title);
        return processSupabaseProject(claimedProject);
      }
    }
    
    // Strategy C: Blogger Fallback (unclaimed Blogger post)
    const bloggerGame = await fetchGameById(slug);
    
    if (bloggerGame) {
      // Check if it's been claimed
      const { data: claimed } = await client
        .from('projects_public')
        .select('slug')
        .eq('original_blogger_id', bloggerGame.id)
        .single();
      
      if (claimed) {
        console.log('🔄 Redirecting to claimed version');
        return getGame(claimed.slug, userId, isAdmin, depth + 1);
      }
      
      console.log('✅ Found Blogger game:', bloggerGame.title);
      return bloggerGame;
    }
    
    console.log('❌ Game not found');
    return null;
    
  } catch (error) {
    console.error('❌ getGame critical error:', error);
    return null;
  }
}

// ✅ FIX: Update other functions to use public client
export async function getUserPublicProjects(userId) {
  const client = getPublicClient();
  
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

export async function searchProjects(query, limit = 50) {
  const client = getPublicClient();
  
  try {
    const { data, error } = await client
      .from('projects_public')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Search error:', error);
      return [];
    }
    
    return data.map(processSupabaseProject);
  } catch (error) {
    console.error('Search critical error:', error);
    return [];
  }
}

export async function getSimilarGames({ 
  currentGameId, 
  currentGameType, 
  currentGameTags = [], 
  currentGameDeveloper,
  limit = 4 
}) {
  try {
    // 1. Get unified feed (reuse existing logic)
    const allGames = await getUnifiedFeed({ limit: 200 });
    
    // 2. Filter out current game
    const candidates = allGames.filter(game => game.id !== currentGameId);
    
    if (candidates.length === 0) {
      return getFreshPicks(allGames, limit);
    }
    
    // 3. Score each candidate game
    const scoredGames = candidates.map(game => ({
      ...game,
      similarityScore: calculateSimilarityScore(game, {
        type: currentGameType,
        tags: currentGameTags,
        developer: currentGameDeveloper
      })
    }));
    
    // 4. Sort by score (highest first)
    scoredGames.sort((a, b) => b.similarityScore - a.similarityScore);
    
    // 5. Take top matches
    const similarGames = scoredGames.slice(0, limit);
    
    // 6. If not enough similar games, fill with fresh picks
    if (similarGames.length < limit) {
      const freshPicks = getFreshPicks(allGames, limit - similarGames.length);
      const usedIds = new Set(similarGames.map(g => g.id));
      const newPicks = freshPicks.filter(g => !usedIds.has(g.id));
      similarGames.push(...newPicks);
    }
    
    console.log(`🎯 Similar games found: ${similarGames.length} for ${currentGameType}`);
    
    return similarGames.slice(0, limit);
    
  } catch (error) {
    console.error('❌ Similar games error:', error);
    // Fallback: return fresh picks
    try {
      const allGames = await getUnifiedFeed({ limit: 50 });
      return getFreshPicks(allGames, limit);
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      return [];
    }
  }
}

// ✅ ADD: Helper Functions
function calculateSimilarityScore(candidate, current) {
  let score = 0;
  
  // 1. Same type bonus (Game vs App)
  if (candidate.type === current.type) {
    score += 10;
  }
  
  // 2. Tag overlap scoring
  const candidateTags = candidate.tags || [];
  const currentTags = current.tags || [];
  const commonTags = candidateTags.filter(tag => currentTags.includes(tag));
  score += commonTags.length * 5;
  
  // 3. Same developer bonus
  if (candidate.developer && current.developer && 
      candidate.developer === current.developer) {
    score += 8;
  }
  
  // 4. Supabase preference (community content)
  if (candidate.source === 'supabase') {
    score += 3;
  }
  
  // 5. Recency bonus
  const gameAge = Date.now() - new Date(candidate.publishedDate).getTime();
  const daysSincePublished = gameAge / (1000 * 60 * 60 * 24);
  if (daysSincePublished < 30) {
    score += 2;
  }
  
  // 6. Quality indicators
  if (candidate.features && candidate.features.length > 3) {
    score += 1;
  }
  
  if (candidate.screenshots && candidate.screenshots.length > 2) {
    score += 1;
  }
  
  return score;
}

function getFreshPicks(allGames, limit) {
  const supabaseGames = allGames
    .filter(game => game.source === 'supabase')
    .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
  
  if (supabaseGames.length >= limit) {
    return supabaseGames.slice(0, limit);
  }
  
  const bloggerGames = allGames
    .filter(game => game.source !== 'supabase')
    .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
  
  const freshPicks = [
    ...supabaseGames,
    ...bloggerGames.slice(0, limit - supabaseGames.length)
  ];
  
  console.log(`🆕 Fresh picks: ${freshPicks.length} (${supabaseGames.length} community + ${freshPicks.length - supabaseGames.length} classic)`);
  
  return freshPicks.slice(0, limit);
}