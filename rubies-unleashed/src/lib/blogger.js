// src/lib/blogger.js
import BACKUP_DATA from './backup-data.json'; 

const BLOG_ID = process.env.NEXT_PUBLIC_BLOG_ID;
const API_KEY = process.env.NEXT_PUBLIC_BLOGGER_KEY;
const BASE_URL = "https://www.googleapis.com/blogger/v3/blogs";

function createSlug(title, id) {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${cleanTitle}-${id}`;
}

const cleanText = (str) => {
    if (!str) return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\/>/g, "")
        .replace(/<[^>]*>/g, "")
        .replace(/[ \t]+/g, " ") 
        .trim();
};

const htmlToTextLines = (html) => {
    if (!html) return [];
    const noCss = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    return noCss
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .split('\n')
        .map(l => cleanText(l))
        .filter(l => l.length > 0);
};

function cleanPlatformName(text) {
    const noParens = text.replace(/\([^)]*\)/g, '');
    const lower = noParens.toLowerCase();
    
    const detected = [];
    if (lower.includes('win') || lower.includes('pc')) detected.push('Windows');
    if ((lower.includes('mac') || lower.includes('osx') || lower.includes('apple')) && !lower.includes('ios') && !lower.includes('iphone')) {
        detected.push('Mac');
    }
    if (lower.includes('linux')) detected.push('Linux');
    if (lower.includes('android') || lower.includes('apk')) detected.push('Android');
    if (lower.includes('ios') || lower.includes('iphone') || lower.includes('ipad')) detected.push('iOS');
    if (lower.includes('web') || lower.includes('browser') || lower.includes('html5') || lower.includes('online')) detected.push('Web');
    
    return detected.length > 0 ? detected.join(', ') : text.trim();
}

function refineDownloadLinks(links) {
    if (!links || links.length === 0) return [];
    
    const seen = new Map();
    for (const link of links) {
        const cleanUrl = link.url.trim().replace(/\s+/g, '').replace(/\/$/, '');
        
        if (!seen.has(cleanUrl)) {
            seen.set(cleanUrl, { ...link, url: cleanUrl });
        } else {
            const existing = seen.get(cleanUrl);
            if (existing.platform === 'Download' && link.platform !== 'Download') {
                seen.set(cleanUrl, { ...link, url: cleanUrl });
            }
        }
    }
    
    let unique = Array.from(seen.values());

    const hasSpecific = unique.some(l => l.platform !== 'Download');
    if (hasSpecific) {
        unique = unique.filter(l => l.platform !== 'Download');
    }

    const order = { 
        'Windows': 1, 
        'Mac': 2, 
        'Linux': 3, 
        'Android': 4, 
        'iOS': 5, 
        'Web': 6, 
        'Download': 99 
    };
    unique.sort((a, b) => (order[a.platform] || 50) - (order[b.platform] || 50));

    return unique;
}

// ✅ UPDATED: Now accepts altText parameter
function detectPlatformFromImage(imgUrl, altText = '') {
    const filename = imgUrl.toLowerCase();
    const alt = altText.toLowerCase();
    const parts = filename.split('/').pop().split('.')[0];
    
    // ✅ PRIORITY 1: Check alt text (most explicit)
    if (alt.includes('windows') || alt.includes('win') || alt.includes('pc')) {
        return 'Windows';
    }
    if (alt.includes('mac') || alt.includes('osx') || alt.includes('apple')) {
        return 'Mac';
    }
    if (alt.includes('linux') || alt.includes('ubuntu') || alt.includes('debian')) {
        return 'Linux';
    }
    if (alt.includes('android') || alt.includes('apk')) {
        return 'Android';
    }
    if (alt.includes('ios') || alt.includes('iphone') || alt.includes('ipad') || alt.includes('app store')) {
        return 'iOS';
    }
    if (alt.includes('web') || alt.includes('browser') || alt.includes('online') || alt.includes('play now')) {
        return 'Web';
    }
    
    // ✅ PRIORITY 2: Check filename (existing logic)
    if (/\b(web|browser|online|html5|html|webgl)\b/.test(parts)) return 'Web';
    if (/\b(mac|osx|apple|dmg|darwin)\b/.test(parts)) return 'Mac';
    if (/\b(windows|win64|win32|win|pc)\b/.test(parts)) return 'Windows';
    if (/\b(linux|ubuntu|debian)\b/.test(parts)) return 'Linux';
    if (/\b(android|apk)\b/.test(parts)) return 'Android';
    if (/\bios\b/.test(parts)) return 'iOS';
    
    return null;
}

function isDownloadButton(imgUrl, href = '') {
    const lowerImg = imgUrl.toLowerCase();
    const lowerHref = href.toLowerCase();

    // 🛑 1. IGNORE IMAGE TARGETS
    // If the link points to a .png/.jpg, it is a screenshot/lightbox, NOT a download.
    if (lowerHref.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/)) {
        return false;
    }

    // 🛑 2. IGNORE BLOGGER/GOOGLE IMAGE HOSTING
    // Often these are just full-res views of the image
    if (lowerHref.includes('bp.blogspot.com') || lowerHref.includes('googleusercontent.com')) {
        return false;
    }

    const hasDownloadKeyword = lowerImg.includes('download') || 
                               lowerImg.includes('button') || 
                               lowerImg.includes('btn') || 
                               lowerImg.includes('play') || 
                               lowerImg.includes('get');
    
    const isNotScreenshot = !lowerImg.includes('screenshot') && 
                           !lowerImg.includes('cover') && 
                           !lowerImg.includes('banner') && 
                           !lowerImg.includes('logo') && 
                           !lowerImg.includes('thumb');
    
    return hasDownloadKeyword && isNotScreenshot;
}

function normalizePost(post) {
  const title = post.title.$t || post.title; 
  let contentRaw = post.content ? (post.content.$t || post.content) : '';
  const idRaw = post.id.$t || post.id;
  const id = idRaw.includes('post-') ? idRaw.split('post-')[1] : idRaw;

  // ✅ NEW: Remove JSON-LD schema blocks BEFORE processing
  contentRaw = contentRaw.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

  let developer = "Indie Dev";
  let buildPlatform = null;
  let features = [];
  let requirements = [];
  let controls = [];
  let socialLinks = [];
  let cleanDescriptionLines = [];

  const textLines = htmlToTextLines(contentRaw);
  let captureMode = null; 

  // 🔍 DEBUG: Log text lines
  console.log('📝 Processing:', title);
  console.log('📄 Total text lines:', textLines.length);
  console.log('📄 First 15 lines:', textLines.slice(0, 15));

  for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      const lowerLine = line.toLowerCase();

      // Skip garbage
        // Only skip lines that are JUST price info
    if (lowerLine.startsWith('price:') || lowerLine === '0.00' || lowerLine === '$0.00') continue;
    // Only skip if it's a standalone phrase (likely a link label)
    if (lowerLine === 'play online' || lowerLine === 'play online:') continue;
        // Only skip if it's a standalone line (metadata)
    if (lowerLine === 'also available on' || lowerLine.startsWith('also available on:')) continue;
      if (lowerLine.includes('page link')) continue;
      if (line.trim() === ':') continue;
    // Only skip if the ENTIRE line is just a URL
    if (/^https?:\/\/[^\s]+$/.test(lowerLine)) continue;
      
      // ✅ ENHANCED: Skip JSON-LD remnants
      if (lowerLine.includes('@type') || 
          lowerLine.includes('@context') ||
          lowerLine.includes('"name"') ||
          lowerLine.includes('softwareapplication') ||
          lowerLine.includes('datepublished') ||
          lowerLine.includes('operatingsystem') ||
          lowerLine.includes('softwareversion') ||
          lowerLine.includes('applicationcategory')) {
          console.log('❌ Skipped JSON-LD:', line.substring(0, 50));
          continue;
      }
      
      // Skip code
      if (lowerLine.includes('function') || 
          lowerLine.includes('const ') || 
          lowerLine.includes('let ') || 
          lowerLine.includes('var ') ||
          lowerLine.includes('document.') ||
          lowerLine.includes('queryselector') ||
          lowerLine.includes('foreach') ||
          lowerLine.includes('if (') ||
          lowerLine.includes('} else {') ||
          lowerLine.includes('return ') ||
          lowerLine.includes('.src =') ||
          lowerLine.includes('script.')) continue;
      
      // Skip tag lists (but allow long descriptive paragraphs)
      const commaCount = (line.match(/,/g) || []).length;
      if (commaCount >= 5 && line.length < 100) continue;
      
      if (line === line.toUpperCase() && line.length > 10 && line.includes(',')) continue;

      // Metadata headers
      if (lowerLine.startsWith('developer') || lowerLine.startsWith('studio')) {
          const parts = line.split(/[:\-]/); 
          if (parts.length > 1) developer = parts[1].trim();
          captureMode = 'metadata';
          console.log('🔄 Set metadata mode (developer)');
          continue;
      }
      
      if (lowerLine.startsWith('version')) {
          captureMode = 'metadata';
          console.log('🔄 Set metadata mode (version)');
          continue;
      }
      
      if (lowerLine.startsWith('build') || lowerLine.startsWith('platform')) {
          const parts = line.split(/[:\-]/); 
          const rawBuild = parts.slice(1).join(' ').trim();
          if (rawBuild.length > 0) buildPlatform = cleanPlatformName(rawBuild);
          captureMode = 'metadata';
          console.log('🔄 Set metadata mode (build)');
          continue;
      }

        // Section headers - FEATURES
        if (lowerLine.startsWith('features') || lowerLine === 'features:') { 
            captureMode = 'features'; 
            console.log('🔄 Set features mode');
            continue; 
        }

        // Section headers - REQUIREMENTS
        if (lowerLine.startsWith('requirements') || lowerLine.startsWith('system requirements')) { 
            captureMode = 'requirements'; 
            console.log('🔄 Set requirements mode');
            continue; 
        } 

        // Section headers - CONTROLS (exact match only)
        const controlHeaders = [
            'controls:',
            'controls',
            'how to play:',
            'how to play',
            'keyboard & mouse controls',
            'keyboard and mouse controls',
            'gamepad controls',
            'controller layout',
            'button mapping'
        ];

        if (controlHeaders.includes(lowerLine)) {
            captureMode = 'controls'; 
            console.log('🔄 Set CONTROLS mode');
            continue; 
        }
      // Socials
      if (lowerLine.includes('support this project') || lowerLine.includes('follow') || lowerLine.includes('contact') || lowerLine.startsWith('music -')) {
          captureMode = 'socials';
          if (lowerLine.startsWith('music -')) {
               const url = line.match(/https?:\/\/[^\s]+/);
               if(url) socialLinks.push({ label: 'Soundtrack', url: url[0] });
          }
          continue; 
      }

      // Stop sections
      if (lowerLine === 'screenshots:' ||
          lowerLine === 'download:' || 
          lowerLine === 'trailer:' ||
          lowerLine === 'gameplay:' ||
          lowerLine === 'media:' ||
          lowerLine === 'tags:' ||
          lowerLine === 'categories:') {
          captureMode = 'ignore'; 
          console.log('🔄 Set ignore mode');
          continue; 
      }

      // Capture logic
      if (captureMode === 'features') {
          const clean = line.replace(/^[-•*]\s*|^\d+\.\s*/, '');
          if (clean.length > 2 && clean.length < 1500 && !clean.includes('http')) {
              console.log('✅ Feature added:', clean.substring(0, 50));
              features.push(clean);
          }
      }
      else if (captureMode === 'requirements') {
           const clean = line.replace(/^[-•*]\s*/, '');
           if (clean.length > 2 && !clean.toLowerCase().includes('price')) {
               requirements.push(clean);
           }
      }
      else if (captureMode === 'controls') {
           const clean = line.replace(/^[-•*]\s*/, '');
           
           console.log(`🎮 Checking control line: "${clean.substring(0, 60)}..."`);
           
            const hasControlPattern = clean.includes(':') || 
                                    /^[A-Z][\w\/\s]+:/.test(clean) || 
                                    /^[A-Z][\w\/\s]*\/[A-Z][\w\/\s]*:/.test(clean);

            if (clean.length > 2 && hasControlPattern && !clean.includes('http')) {
                controls.push(clean);
            } else {
               console.log('❌ Control rejected (length:', clean.length, 'hasPattern:', hasControlPattern + ')');
           }
      }
      else if (captureMode === 'socials') {
          const urlMatch = line.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
              let label = 'Website';
              if (urlMatch[0].includes('patreon')) label = 'Patreon';
              else if (urlMatch[0].includes('ko-fi')) label = 'Ko-Fi';
              else if (urlMatch[0].includes('discord')) label = 'Discord';
              else if (urlMatch[0].includes('youtube')) label = 'YouTube';
              else if (urlMatch[0].includes('twitter')) label = 'Twitter';
              else if (urlMatch[0].includes('itch.io')) label = 'Itch.io';
              if (!socialLinks.some(s => s.url === urlMatch[0])) socialLinks.push({ label, url: urlMatch[0] });
          }
      }
      else if (captureMode === 'metadata' || captureMode === 'ignore') {
          continue;
      }
      else {
          // DEFAULT: Add to description
          let finalLine = line.replace(/^[:\-\s]+|[:\-\s]+$/g, '');
          
          // ✅ ENHANCED: Skip JSON remnants in default mode too
          if (finalLine.includes('{') || 
              finalLine.includes('}') || 
              finalLine.includes(';') ||
              finalLine.includes('()') ||
              finalLine.includes('//') ||
              finalLine.startsWith('"@') ||
              finalLine.startsWith('"name"') ||
              finalLine.startsWith('"operatingSystem"')) {
              continue;
          }
          
          if (finalLine.length > 10 && finalLine.length < 1500) {
              cleanDescriptionLines.push(finalLine);
          }
      }
  }

  const description = cleanDescriptionLines.join('\n\n');
  
  // 🔍 DEBUG: Final stats
  console.log('\n📊 FINAL RESULTS:');
  console.log('Description lines:', cleanDescriptionLines.length);
  console.log('Features:', features.length);
  console.log('Controls:', controls.length);
  console.log('Requirements:', requirements.length);
  console.log('Social links:', socialLinks.length);
  console.log('\n🎮 Controls array:', controls);

  // 2. DOWNLOAD LINKS (ENHANCED REGEX)
  let rawLinks = [];
  const imgLinkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;
  let linkMatch;

  while ((linkMatch = imgLinkRegex.exec(contentRaw)) !== null) {
      const href = linkMatch[1];
      const beforeSrc = linkMatch[2];
      const imgSrc = linkMatch[3];
      const afterSrc = linkMatch[4];
      
      const fullImgTag = beforeSrc + afterSrc;
      const altMatch = fullImgTag.match(/alt=["']([^"']*)["']/i);
      const altText = altMatch ? altMatch[1] : '';

      // ✅ FIX: Pass 'href' to the check
      if (isDownloadButton(imgSrc, href)) {
          let platform = detectPlatformFromImage(imgSrc, altText);
          
          if (!platform) {
              const urlLower = href.toLowerCase();
              if (urlLower.includes('/html') || urlLower.includes('play-online') || (urlLower.includes('itch.io') && urlLower.includes('/html'))) {
                  platform = 'Web';
              }
              else if (urlLower.includes('.apk')) platform = 'Android';
              else if (urlLower.includes('.exe') || urlLower.includes('win')) platform = 'Windows';
              else if (urlLower.includes('.dmg') || urlLower.includes('mac')) platform = 'Mac';
          }
          if (!platform) platform = 'Download';
          rawLinks.push({ platform, url: href });
      }
  }

  const downloadLinks = refineDownloadLinks(rawLinks);
  const primaryDownload = downloadLinks.length > 0 ? downloadLinks[0].url : '#';

  // 3. MEDIA EXTRACTION
  let video = null;
  let gameEmbed = null;
  
  const iframeRegex = /<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let iframeMatch;
  
  while ((iframeMatch = iframeRegex.exec(contentRaw)) !== null) {
      const iframeSrc = iframeMatch[1].replace('http:', 'https:');
      const lowerSrc = iframeSrc.toLowerCase();
      
      const isItchEmbed = lowerSrc.includes('itch.io/embed');
      const isItchZone = lowerSrc.includes('itch.zone');
      const isHtml5 = lowerSrc.includes('html5game') || lowerSrc.includes('/html5');
      const isWidgets = lowerSrc.includes('widgets.itch.io');
      const isGamePath = lowerSrc.includes('/game/');
      const isNewgrounds = lowerSrc.includes('newgrounds.com/portal');
      const isKongregate = lowerSrc.includes('kongregate.com/games');
      const isRubyApksOnline = lowerSrc.includes('rubyapks.netlify.app/online');
      
      if (isItchEmbed || isItchZone || isHtml5 || isWidgets || isGamePath || isNewgrounds || isKongregate || isRubyApksOnline) {
          gameEmbed = iframeSrc;
      }
      else if (lowerSrc.includes('youtube.com/embed') || 
               lowerSrc.includes('youtu.be') ||
               lowerSrc.includes('vimeo.com')) {
          video = iframeSrc;
      }
  }
  
  let allImages = [];
  const imgRegex = /src="([^"]+?\.(?:jpg|jpeg|png|webp|gif))"/gi;
  let match;
  while ((match = imgRegex.exec(contentRaw)) !== null) {
      const img = match[1];
      if (!img.toLowerCase().includes('button') && !img.toLowerCase().includes('download')) allImages.push(img);
  }
  
  const processImage = (url) => {
      if (!url) return null;
      if (url.startsWith('http://')) url = url.replace('http://', 'https://');
      if (url.includes('blogspot') || url.includes('googleusercontent')) {
          url = url.replace(/\/s\d+(-c)?\//, '/w800/');
          url = url.replace(/=s\d+(-c)?$/, '=w800');
      }
      return url;
  };
  
  let mainImage = processImage(post.media$thumbnail?.url || allImages[0]);
  if (!mainImage) mainImage = "https://placehold.co/600x900/0b0f19/E0115F.png?text=No+Cover";
  
  const screenshots = allImages.map(processImage).filter(img => img !== mainImage).slice(0, 6);

  const tags = post.category ? post.category.map(c => c.term) : ['Indie'];

  // ROBUST APP DETECTION
  // Check for singular AND plural, uppercase AND lowercase
  const appKeywords = ['app', 'apps', 'application', 'tool', 'tools', 'utility', 'utilities', 'software', 'pwa', 'saas'];
  
  const isApp = tags.some(t => appKeywords.includes(t.toLowerCase()));
  const itemType = isApp ? 'App' : 'Game';

  return { 
    id, 
    slug: createSlug(title, id),
    title, 
    type: itemType,
    image: mainImage,
    video,
    gameEmbed,
    screenshots,
    downloadUrl: primaryDownload,
    downloadLinks, 
    developer,
    buildPlatform,
    features,
    requirements, 
    controls, 
    socialLinks, 
    tag: tags[0] || 'Game', 
    tags, 
    description: description.length > 150 
    ? description.substring(0, 150) + "..." 
    : description,
    fullDescription: description 
  };
}

function getBackupGames(limit) {
    if (!BACKUP_DATA.feed || !BACKUP_DATA.feed.entry) return [];
    // We run normalizePost on backup data too, so the structure matches perfectly
    return BACKUP_DATA.feed.entry
        .slice(0, limit)
        .map(post => {
             try { return normalizePost(post); } catch (e) { return null; }
        })
        .filter(g => g !== null);
}

export async function fetchGames(limit = 12) {
  try {
    const res = await fetch(`/api/games?limit=${limit}`);
    
    // If Network/API Fails -> Use Backup
    if (!res.ok) {
        console.warn(`⚠️ API Error (${res.status}). Using Snapshot.`);
        return getBackupGames(limit);
    }
    
    const data = await res.json();
    if (!data.feed || !data.feed.entry) return getBackupGames(limit);
    
    return data.feed.entry.map(post => normalizePost(post));

  } catch (error) { 
    // If DNS/Offline -> Use Backup
    console.warn("⚠️ Network Unreachable. Using Snapshot.");
    return getBackupGames(limit);
  }
}

// 4. REPLACE fetchGameById WITH THIS ROBUST VERSION
export async function fetchGameById(id) {
    // Check Backup First (Fastest)
    const backupGames = getBackupGames(100);
    const backupMatch = backupGames.find(g => g.id === id || g.slug.includes(id));
    if (backupMatch) return backupMatch;

    // Try Real API (If not in backup)
    try {
        const url = `${BASE_URL}/${BLOG_ID}/posts/${id}?key=${API_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
            const post = await res.json();
            return normalizePost(post);
        }
    } catch (error) {}
    
    return null;
}