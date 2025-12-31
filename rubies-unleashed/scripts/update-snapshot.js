const fs = require('fs');
const path = require('path');

const BLOG_ID = 'rubyapks.blogspot.com';
const MAX_RESULTS = 500; // Maximum per request

async function fetchAllPosts() {
  let allEntries = [];
  let startIndex = 1;
  let hasMore = true;
  
  console.log('🔄 Fetching posts from Blogger...');
  
  while (hasMore) {
    try {
      const timestamp = Date.now();
      const url = `https://${BLOG_ID}/feeds/posts/default?alt=json&max-results=${MAX_RESULTS}&start-index=${startIndex}&_t=${timestamp}`;
      
      console.log(`📡 Fetching batch starting at index ${startIndex}...`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Blogger API error: ${response.status}`);
      }
      
      const data = await response.json();
      const entries = data.feed?.entry || [];
      
      if (entries.length === 0) {
        hasMore = false;
        break;
      }
      
      allEntries = allEntries.concat(entries);
      console.log(`✅ Fetched ${entries.length} posts (Total so far: ${allEntries.length})`);
      
      // Check if there are more posts
      if (entries.length < MAX_RESULTS) {
        hasMore = false;
      } else {
        startIndex += MAX_RESULTS;
      }
      
    } catch (error) {
      console.error('❌ Fetch error:', error.message);
      hasMore = false;
    }
  }
  
  return allEntries;
}

async function updateSnapshot() {
  try {
    const allEntries = await fetchAllPosts();
    
    console.log(`\n✅ Total posts fetched: ${allEntries.length}`);
    
    // Create the feed structure that matches Blogger's format
    const backupData = {
      feed: {
        entry: allEntries
      }
    };
    
    const backupPath = path.join(__dirname, '../src/lib/backup-data.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup saved to: ${backupPath}`);
    console.log(`📊 Total posts in backup: ${allEntries.length}`);
    
  } catch (error) {
    console.error('❌ Snapshot update failed:', error.message);
    process.exit(1);
  }
}

updateSnapshot();