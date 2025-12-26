const fs = require('fs');
const path = require('path');
const https = require('https');

// HARDCODED ID since process.env might not be loaded in scripts
const BLOG_ID = 'rubyapks.blogspot.com'; 
const OUTPUT_FILE = path.join(__dirname, '../src/lib/backup-data.json');

const url = `https://${BLOG_ID}/feeds/posts/default?alt=json&max-results=50`;

console.log('📸 SNAPSHOT: Fetching latest data from Blogger...');

https.get(url, { headers: { 'User-Agent': 'RubySnapshot/1.0' } }, (res) => {
  let data = '';

  res.on('data', (chunk) => { data += chunk; });

  res.on('end', () => {
    try {
      // Validate JSON
      const json = JSON.parse(data);
      if (!json.feed) throw new Error('Invalid Feed Structure');

      // Save to File
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(json, null, 2));
      console.log(`✅ SNAPSHOT SAVED: ${json.feed.entry.length} items to src/lib/backup-data.json`);
    } catch (error) {
      console.error('❌ SNAPSHOT FAILED:', error.message);
      // We do NOT exit with error, so build can continue even if snapshot fails
    }
  });

}).on('error', (err) => {
  console.error('❌ NETWORK ERROR:', err.message);
});