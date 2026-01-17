// src/app/api/games/route.js
/**
 * SIMPLIFIED API ROUTE
 * Script handles merging during build
 * This just serves the snapshot and checks for newer posts
 * Posts are sorted by published date (newest first)
 * Respects limit parameter
 * 
 * UPGRADE:
 * - Filters out hidden content (Ban Hammer)
 * - Caches Blogger fetch for 60s to improve performance
 * - ✅ FIX: Updates propagate even for old posts (Live Overwrites Snapshot)
 */

import { NextResponse } from 'next/server';
import BACKUP_DATA from '@/lib/backup-data.json';
import { createServerClient } from "@/lib/supabase-server"; // ✅ CHANGED: Use server client

export const revalidate = 60; // Cache API route output for 60 seconds

export async function GET(request) {
  const BACKUP_BLOG = 'rubyapk.blogspot.com'; // Active blog for real-time updates
  
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '500', 10);
  
  try {
    const timestamp = Date.now();
    
    // Optimized: Cache external fetch for 60s
    // ✅ Fetch MORE items (100) to ensure we catch recent edits to older posts
    const backupResult = await fetch(
      `https://${BACKUP_BLOG}/feeds/posts/default?alt=json&max-results=100`,
      { 
        next: { revalidate: 60 } // Cache for 1 min
      }
    );
    
    let realtimePosts = [];
    
    if (backupResult.ok) {
      const backupData = await backupResult.json();
      realtimePosts = backupData.feed?.entry || [];
      console.log(`✅ Live Feed: Fetched ${realtimePosts.length} posts`);
    }
    
    // ✅ MERGE STRATEGY: Live Data Overwrites Snapshot
    // This ensures that if you edit a link in an old post, the live version takes precedence
    
    const postMap = new Map();

    // 1. Load Snapshot Data into Map
    const snapshotPosts = BACKUP_DATA.feed?.entry || [];
    snapshotPosts.forEach(post => {
        const id = post.id?.$t || post.id;
        postMap.set(id, post);
    });

    // 2. Overwrite with Live Data
    // If ID exists, this replaces the old snapshot version with the fresh one
    realtimePosts.forEach(post => {
        const id = post.id?.$t || post.id;
        postMap.set(id, post);
    });

    // 3. Convert Map back to Array
    const uniquePosts = Array.from(postMap.values());

    // ✅ NEW: Fetch Hidden List from Supabase
    // Note: Supabase fetch is fast, but adds ~50-100ms. 
    // If critical speed needed, cache this too? Supabase client caches somewhat.
    const supabase = await createServerClient(); // ✅ CHANGED: Create server client instance
    const { data: hiddenData } = await supabase.from('hidden_content').select('game_id');
    const hiddenIds = new Set(hiddenData?.map(h => h.game_id) || []);

    // ✅ NEW: Filter out hidden games
    const visiblePosts = uniquePosts.filter(post => {
        const idRaw = post.id?.$t || post.id;
        const id = idRaw.includes('post-') ? idRaw.split('post-')[1] : idRaw;
        // Check slug too if available (covers both ID types)
        const slug = post.slug; 
        return !hiddenIds.has(id) && !hiddenIds.has(slug);
    });
    
    // ✅ SORT BY PUBLISHED DATE (NEWEST FIRST)
    visiblePosts.sort((a, b) => {
      const dateA = new Date(a.published?.$t || a.published || 0);
      const dateB = new Date(b.published?.$t || b.published || 0);
      return dateB - dateA; // Descending (newest first)
    });
    
    console.log(`✅ Total merged: ${uniquePosts.length} -> Visible: ${visiblePosts.length} (Hidden: ${uniquePosts.length - visiblePosts.length})`);
    
    // ✅ Apply limit from query params
    const limitedPosts = limit < visiblePosts.length 
      ? visiblePosts.slice(0, limit) 
      : visiblePosts;
    
    console.log(`📦 Returning ${limitedPosts.length} posts (requested limit: ${limit})`);
    
    return NextResponse.json({
      feed: {
        entry: limitedPosts
      }
    });
    
  } catch (error) {
    console.error("❌ API Error:", error.message);
    
    // Fallback to snapshot
    const snapshotPosts = BACKUP_DATA.feed?.entry || [];
    const limitedFallback = limit < snapshotPosts.length 
      ? snapshotPosts.slice(0, limit) 
      : snapshotPosts;
    
    return NextResponse.json({
      feed: {
        entry: limitedFallback
      }
    });
  }
}