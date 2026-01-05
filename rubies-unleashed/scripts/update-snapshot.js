// scripts/update-snapshot.js
/**
 * DUAL-BLOG SNAPSHOT GENERATOR
 * Fetches from both primary and backup blogs
 * Preserves existing snapshot if both blogs fail
 */

const fs = require('fs');
const path = require('path');

const PRIMARY_BLOG = 'rubyapks.blogspot.com';  // Old library (currently down)
const BACKUP_BLOG = 'rubyapk.blogspot.com';    // New uploads (active)
const MAX_RESULTS = 500;

async function fetchAllPosts(blogId, blogName) {
  let allEntries = [];
  let startIndex = 1;
  let hasMore = true;
  
  console.log(`\n🔄 Fetching posts from ${blogName} (${blogId})...`);
  
  while (hasMore) {
    try {
      const timestamp = Date.now();
      const url = `https://${blogId}/feeds/posts/default?alt=json&max-results=${MAX_RESULTS}&start-index=${startIndex}&_t=${timestamp}`;
      
      console.log(`📡 Fetching batch starting at index ${startIndex}...`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`⚠️ ${blogName} returned ${response.status}`);
        hasMore = false;
        break;
      }
      
      const data = await response.json();
      const entries = data.feed?.entry || [];
      
      if (entries.length === 0) {
        hasMore = false;
        break;
      }
      
      allEntries = allEntries.concat(entries);
      console.log(`✅ Fetched ${entries.length} posts (Total so far: ${allEntries.length})`);
      
      if (entries.length < MAX_RESULTS) {
        hasMore = false;
      } else {
        startIndex += MAX_RESULTS;
      }
      
    } catch (error) {
      console.error(`❌ Fetch error from ${blogName}:`, error.message);
      hasMore = false;
    }
  }
  
  return allEntries;
}

async function updateSnapshot() {
  try {
    // ✅ Fetch from BOTH blogs in parallel
    console.log('🚀 Starting dual-blog snapshot generation...\n');
    
    const [primaryPosts, backupPosts] = await Promise.all([
      fetchAllPosts(PRIMARY_BLOG, 'Primary Blog'),
      fetchAllPosts(BACKUP_BLOG, 'Backup Blog')
    ]);
    
    console.log('\n📊 RESULTS:');
    console.log(`   Primary Blog: ${primaryPosts.length} posts`);
    console.log(`   Backup Blog:  ${backupPosts.length} posts`);
    
    // ✅ Merge and deduplicate
    const allPosts = [...primaryPosts, ...backupPosts];
    
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
  return dateB - dateA;
});

console.log(`   Unique Posts: ${uniquePosts.length}`);
    
    console.log(`   Unique Posts: ${uniquePosts.length}`);
    
    // ✅ SAFETY: If we got 0 posts from both sources, preserve existing backup
    if (uniquePosts.length === 0) {
      console.warn('\n⚠️ WARNING: Both blogs returned 0 posts!');
      
      const backupPath = path.join(__dirname, '../src/lib/backup-data.json');
      
      if (fs.existsSync(backupPath)) {
        const existing = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        const existingCount = existing.feed?.entry?.length || 0;
        
        console.warn(`⚠️ Preserving existing snapshot (${existingCount} posts)`);
        console.warn('⚠️ Skipping backup update to prevent data loss\n');
        process.exit(0); // Exit successfully without updating
      } else {
        console.error('❌ No existing backup found and no posts fetched!');
        process.exit(1);
      }
    }
    
    // ✅ Create backup data structure
    const backupData = {
      feed: {
        entry: uniquePosts,
        _metadata: {
          generatedAt: new Date().toISOString(),
          primaryBlogPosts: primaryPosts.length,
          backupBlogPosts: backupPosts.length,
          totalUniquePosts: uniquePosts.length
        }
      }
    };
    
    const backupPath = path.join(__dirname, '../src/lib/backup-data.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`\n✅ Backup saved to: ${backupPath}`);
    console.log(`✅ Total unique posts in backup: ${uniquePosts.length}\n`);
    
  } catch (error) {
    console.error('❌ Snapshot update failed:', error.message);
    
    // ✅ SAFETY: Don't fail the build, preserve existing backup
    const backupPath = path.join(__dirname, '../src/lib/backup-data.json');
    if (fs.existsSync(backupPath)) {
      console.warn('⚠️ Error occurred but existing backup preserved');
      process.exit(0); // Don't fail the build
    } else {
      process.exit(1); // Fail if no backup exists
    }
  }
}

updateSnapshot();