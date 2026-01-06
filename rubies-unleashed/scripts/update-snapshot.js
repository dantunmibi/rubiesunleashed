// scripts/update-snapshot.js
/**
 * DUAL-BLOG SNAPSHOT GENERATOR (MERGE EDITION)
 * 1. Loads existing snapshot (The Vault)
 * 2. Fetches new posts from backup blog
 * 3. Merges them to preserve history
 */

const fs = require('fs');
const path = require('path');

const PRIMARY_BLOG = 'rubyapks.blogspot.com'; // DEAD
const BACKUP_BLOG = 'rubyapk.blogspot.com';   // ACTIVE
const MAX_RESULTS = 500;
const MINIMUM_SAFE_COUNT = 50; // Keep high to prevent accidental wipes

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
  const backupPath = path.join(__dirname, '../src/lib/backup-data.json');
  
  try {
    console.log('🚀 Starting Smart Snapshot Update (Merge Mode)...\n');

    // 1. Load Existing Snapshot (The Vault)
    let existingPosts = [];
    if (fs.existsSync(backupPath)) {
      try {
        const fileContent = fs.readFileSync(backupPath, 'utf8');
        const json = JSON.parse(fileContent);
        existingPosts = json.feed?.entry || [];
        console.log(`📦 Loaded existing snapshot: ${existingPosts.length} posts`);
      } catch (e) {
        console.warn('⚠️ Existing snapshot corrupted or unreadable');
      }
    }

    // 2. Fetch from Backup Blog (Active Source)
    // Note: We skip Primary Blog fetch since we know it's dead/404 to save build time
    const backupPosts = await fetchAllPosts(BACKUP_BLOG, 'Backup Blog');
    
    // 3. Merge Strategy: Map by ID
    const postMap = new Map();

    // A. Add Old Posts
    existingPosts.forEach(post => {
      const id = post.id?.$t || post.id;
      if (id) postMap.set(id, post);
    });

    // B. Add New Posts (Overwrite if exists to update content)
    backupPosts.forEach(post => {
      const id = post.id?.$t || post.id;
      if (id) postMap.set(id, post);
    });

    // 4. Convert back to array
    const mergedPosts = Array.from(postMap.values());

    // 5. Sort by Date (Newest First)
    mergedPosts.sort((a, b) => {
      const dateA = new Date(a.published?.$t || a.published || 0);
      const dateB = new Date(b.published?.$t || b.published || 0);
      return dateB - dateA;
    });

    console.log(`\n📊 RESULTS:`);
    console.log(`   Old Vault:    ${existingPosts.length} posts`);
    console.log(`   New Fetched:  ${backupPosts.length} posts`);
    console.log(`   Total Merged: ${mergedPosts.length} posts`);

    // 6. Safety Check
    if (mergedPosts.length < MINIMUM_SAFE_COUNT) {
      console.warn(`\n⚠️ CRITICAL WARNING: Total merged count (${mergedPosts.length}) is below safety threshold (${MINIMUM_SAFE_COUNT})!`);
      console.warn('⚠️ Aborting write to prevent data loss.');
      process.exit(0);
    }
    
    // 7. Save to Disk
    const backupData = {
      feed: {
        entry: mergedPosts,
        _metadata: {
          generatedAt: new Date().toISOString(),
          source: "Merge (Vault + Live)",
          totalPosts: mergedPosts.length
        }
      }
    };
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`\n💾 Snapshot updated successfully at: ${backupPath}\n`);
    
  } catch (error) {
    console.error('❌ Snapshot update failed:', error.message);
    if (fs.existsSync(backupPath)) {
      console.warn('⚠️ Preserving existing backup due to error.');
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

updateSnapshot();