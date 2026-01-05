// src/app/api/games/route.js
/**
 * SIMPLIFIED API ROUTE
 * Script handles merging during build
 * This just serves the snapshot and checks for newer posts
 * Posts are sorted by published date (newest first)
 * Respects limit parameter
 */

import { NextResponse } from 'next/server';
import BACKUP_DATA from '@/lib/backup-data.json';

export async function GET(request) {
  const BACKUP_BLOG = 'rubyapk.blogspot.com'; // Active blog for real-time updates
  
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '500', 10);
  
  try {
    const timestamp = Date.now();
    
    // ✅ Check backup blog for posts NEWER than snapshot
    const snapshotDate = new Date(BACKUP_DATA.feed._metadata?.generatedAt || 0);
    
    const backupResult = await fetch(
      `https://${BACKUP_BLOG}/feeds/posts/default?alt=json&max-results=50&_t=${timestamp}`,
      { 
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    );
    
    let realtimePosts = [];
    
    if (backupResult.ok) {
      const backupData = await backupResult.json();
      const allBackupPosts = backupData.feed?.entry || [];
      
      // Only include posts newer than snapshot
      realtimePosts = allBackupPosts.filter(post => {
        const postDate = new Date(post.published?.$t || post.published);
        return postDate > snapshotDate;
      });
      
      console.log(`✅ Found ${realtimePosts.length} new posts since last build`);
    }
    
    // ✅ Merge snapshot + realtime posts
    const snapshotPosts = BACKUP_DATA.feed?.entry || [];
    const allPosts = [...snapshotPosts, ...realtimePosts];
    
    // Deduplicate
    const seen = new Set();
    const uniquePosts = allPosts.filter(post => {
      const id = post.id?.$t || post.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    
    // ✅ SORT BY PUBLISHED DATE (NEWEST FIRST)
    uniquePosts.sort((a, b) => {
      const dateA = new Date(a.published?.$t || a.published || 0);
      const dateB = new Date(b.published?.$t || b.published || 0);
      return dateB - dateA; // Descending (newest first)
    });
    
    console.log(`✅ Total posts available: ${uniquePosts.length} (Snapshot: ${snapshotPosts.length}, New: ${realtimePosts.length})`);
    
    // ✅ Apply limit from query params
    const limitedPosts = limit < uniquePosts.length 
      ? uniquePosts.slice(0, limit) 
      : uniquePosts;
    
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