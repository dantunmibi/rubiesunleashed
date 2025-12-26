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
    
    // ✅ REMOVE HIDDEN ELEMENTS BEFORE PROCESSING
    let cleanHtml = html
        // Remove elements with display:none or visibility:hidden
        .replace(/<[^>]*style=["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden)[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '')
        // Remove elements with common hidden classes
        .replace(/<[^>]*class=["'][^"']*(?:hidden|hide|invisible|sr-only|screen-reader|alert|closebtn)[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '')
        // Remove elements with itemprop
        .replace(/<[^>]*itemprop=["'][^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '')
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove <style> tags
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        // Remove <script> tags
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        // Remove noscript
        .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
        // ✅ NEW: Remove ALL img tags completely (self-closing and regular)
        .replace(/<img[^>]*\/?>/gi, "");
    
    return cleanHtml
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n')  // ✅ NEW: Headers create line breaks
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

function detectPlatformFromImage(imgUrl, altText = '') {
    const filename = imgUrl.toLowerCase();
    const alt = altText.toLowerCase();
    const parts = filename.split('/').pop().split('.')[0];
    
    // PRIORITY 1: Check alt text (most explicit)
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
    
    // PRIORITY 2: Check filename
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

    // IGNORE IMAGE TARGETS
    if (lowerHref.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/)) {
        return false;
    }

    // IGNORE BLOGGER/GOOGLE IMAGE HOSTING
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

// ✅ NEW: Helper to truncate description at word boundary
function truncateDescription(text, maxLength = 150) {
    if (!text || text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "...";
}

function normalizePost(post) {
  const title = post.title.$t || post.title; 
  let contentRaw = post.content ? (post.content.$t || post.content) : '';
  const idRaw = post.id.$t || post.id;
  const id = idRaw.includes('post-') ? idRaw.split('post-')[1] : idRaw;

  // ✅ DECODE HTML ENTITIES FIRST
  contentRaw = contentRaw
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&");

  // Remove JSON-LD schema blocks
  contentRaw = contentRaw.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

  let developer = "Indie Dev";
  let buildPlatform = null;
  let features = [];
  let requirements = [];
  let controls = [];
  let socialLinks = [];
    // Add after the socialLinks declaration
    let contentWarnings = [];
  let cleanDescriptionLines = [];

  const textLines = htmlToTextLines(contentRaw);
  let captureMode = null; 

  for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      const lowerLine = line.toLowerCase();

    // ✅ NEW: Skip HTML attribute remnants
    if (line.startsWith('<') || 
        line.match(/^(src|alt|data-|width|height|border|class|style|id)=/i) ||
        line.match(/^[a-z-]+="[^"]*"$/i)) {  // Matches: attribute="value"
        continue;
    }

      // ✅ FIXED: More precise garbage skip conditions
      if (lowerLine.startsWith('price:') || lowerLine === '0.00' || lowerLine === '$0.00') continue;
      if (lowerLine === 'play online' || lowerLine === 'play online:') continue;
      if (lowerLine === 'also available on' || lowerLine.startsWith('also available on:')) continue;
      if (lowerLine.includes('page link')) continue;
      if (line.trim() === ':') continue;
      if (/^https?:\/\/[^\s]+$/.test(lowerLine)) continue;
      
      // Skip JSON-LD remnants
      if (lowerLine.includes('@type') || 
          lowerLine.includes('@context') ||
          lowerLine.includes('"name"') ||
          lowerLine.includes('softwareapplication') ||
          lowerLine.includes('datepublished') ||
          lowerLine.includes('operatingsystem') ||
          lowerLine.includes('softwareversion') ||
          lowerLine.includes('applicationcategory')) {
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
      
      // Skip tag lists
      const commaCount = (line.match(/,/g) || []).length;
      if (commaCount >= 5 && line.length < 100) continue;
      if (line === line.toUpperCase() && line.length > 10 && line.includes(',')) continue;

if (lowerLine.startsWith('developer') || lowerLine.startsWith('studio')) {
    const parts = line.split(/[:\-]/); 
    let rawDev = '';
    
    if (parts.length > 1 && parts[1].trim().length > 0) {
        // Developer name is on same line
        rawDev = parts.slice(1).join('-').trim();
    } else if (i + 1 < textLines.length) {
        // ✅ Developer name is on NEXT line
        rawDev = textLines[i + 1].trim();
        i++; // Skip the next line since we just consumed it
    }
    
    if (rawDev.length > 0) {
        // Remove HTML tags
        rawDev = rawDev.replace(/<[^>]*>/g, '');
        
        // Remove URLs
        rawDev = rawDev.replace(/https?:\/\/[^\s]+/g, '');
        
        // Clean up extra whitespace
        rawDev = rawDev.replace(/\s+/g, ' ').trim();
        
        if (rawDev.length > 0 && rawDev !== 'Unknown') {
            developer = rawDev;
        }
    }
    continue;
}
      
      if (lowerLine.startsWith('version')) {
          continue;
      }
      
if (lowerLine.startsWith('build') || lowerLine.startsWith('platform')) {
    const parts = line.split(/[:\-]/); 
    let rawBuild = '';
    
    if (parts.length > 1 && parts[1].trim().length > 0) {
        // Platform is on same line
        rawBuild = parts.slice(1).join(' ').trim();
    } else if (i + 1 < textLines.length) {
        // ✅ Platform is on NEXT line
        rawBuild = textLines[i + 1].trim();
        i++; // Skip the next line
    }
    
    if (rawBuild.length > 0) {
        buildPlatform = cleanPlatformName(rawBuild);
    }
    continue;
}

// ✅ FIXED: Exact match for section headers
const featureHeaders = [
    'features:',
    'features',
    'game features:',
    'game features',
    'key features:',
    'key features'
];

// ✅ Check for combined "Features:Keyboard" pattern first
if (lowerLine.startsWith('features:') && lowerLine.length > 10) {
    const afterFeatures = line.substring(9).trim();
    
    const controlHeadersLower = [
        'keyboard and mouse input:',
        'keyboard & mouse input:',
        'keyboard and mouse controls',
        'keyboard & mouse controls',
        'controls:',
        'controls'
    ];
    
    if (controlHeadersLower.some(h => afterFeatures.toLowerCase().startsWith(h))) {
        captureMode = 'controls';
        continue;
    }
    
    captureMode = 'features';
    continue;
}

if (featureHeaders.includes(lowerLine)) { 
    captureMode = 'features'; 
    continue; 
}

const requirementHeaders = [
    'requirements:',
    'requirements',
    'system requirements:',
    'system requirements',
    'minimum requirements:',
    'minimum requirements',
    'recommended requirements:',
    'recommended requirements'
];
if (requirementHeaders.includes(lowerLine)) { 
    captureMode = 'requirements'; 
    continue; 
} 

const controlHeaders = [
    'controls:',
    'controls',
    'how to play:',
    'how to play',
    'keyboard & mouse controls',
    'keyboard and mouse controls',
    'keyboard & mouse controls:',
    'keyboard and mouse controls:',
    'keyboard and mouse input',      // ✅ NEW
    'keyboard and mouse input:',     // ✅ NEW
    'keyboard & mouse input',        
    'keyboard & mouse input:',       
    'gamepad controls',
    'gamepad controls:',
    'controller layout',
    'controller layout:',
    'button mapping',
    'button mapping:'
];

if (controlHeaders.includes(lowerLine)) {
    captureMode = 'controls'; 
    continue; 
}

      // ✅ FIXED: More strict social headers
      const socialHeaders = [
          'support this project:',
          'support this project',
          'follow us:',
          'follow us',
          'contact:',
          'contact us:',
          'social links:',
          'links:'
      ];
      if (socialHeaders.includes(lowerLine) || lowerLine.startsWith('music -')) {
          captureMode = 'socials';
          if (lowerLine.startsWith('music -')) {
               const url = line.match(/https?:\/\/[^\s]+/);
               if(url) socialLinks.push({ label: 'Soundtrack', url: url[0] });
          }
          continue; 
      }

const warningHeaders = [
    'content warning:',
    'content warnings:',
    'content warning',      // ✅ ADD THIS
    'content warnings',     // ✅ ADD THIS
    'warning:',
    'warnings:',
    'warning',              // ✅ ADD THIS
    'warnings',             // ✅ ADD THIS
    'age rating:',
    'age rating',           // ✅ ADD THIS
    'rated:',
    'rated'                 // ✅ ADD THIS
];

if (warningHeaders.includes(lowerLine)) {
    captureMode = 'warnings';
    continue;
}

      // ✅ FIXED: Stop parsing completely at media sections
      if (lowerLine === 'screenshots:' ||
          lowerLine === 'download:' || 
          lowerLine === 'trailer:' ||
          lowerLine === 'gameplay:' ||
          lowerLine === 'media:' ||
          lowerLine === 'tags:' ||
          lowerLine === 'categories:') {
          break;
      }

      // Capture logic
      if (captureMode === 'features') {
          const clean = line.replace(/^[-•*]\s*|^\d+\.\s*/, '');
          if (clean.length > 2 && clean.length < 500 && !clean.includes('http')) {
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
            const clean = line.replace(/^[-•*]\s*/, '').trim();
            
            if (clean.length < 2 || clean.includes('http')) continue;
            
            // ✅ ENHANCED: More flexible control pattern detection
            const hasControlPattern = 
                clean.includes(':') ||                                    // Any line with colon
                /^[A-Z][\w\/\s]+:/.test(clean) ||                        // Uppercase start: "WASD: Move"
                /^[A-Z][\w\/\s]*\/[A-Z][\w\/\s]*:/.test(clean) ||       // "W/A/S/D: Move"
                /^[a-z]+\s*:/.test(clean) ||                            // ✅ NEW: Lowercase key: "p: weapon"
                /^(alpha|ctrl|shift|space|enter|tab|esc)\s*\d*\s*:/i.test(clean) || // ✅ NEW: Special keys
                /^(left|right|middle)\s+(mouse|click)/i.test(clean);    // ✅ NEW: Mouse buttons

            if (hasControlPattern && clean.length < 200) {  // ✅ Added max length check
                controls.push(clean);
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
else if (captureMode === 'warnings') {
    const clean = line.replace(/^[-•*]\s*/, '').trim();
    
    // ✅ Check if this line looks like metadata (has specific patterns)
    const isMetadata = clean.toLowerCase().includes('developer') ||
                      clean.toLowerCase().includes('version') ||
                      clean.toLowerCase().includes('build') ||
                      clean.toLowerCase().includes('studio') ||
                      /^[A-Z][a-z]+ [A-Z][a-z]+/.test(clean) || // "Rubber Duck" pattern
                      clean.includes('–') || // Em dash often in metadata
                      clean.includes(' - '); // Regular dash in metadata
    
    if (isMetadata) {
        captureMode = null; // Exit warning mode
        continue;
    }
    
    // Skip garbage
    if (clean.length < 5 || 
        clean.includes('http') || 
        clean === '×' || 
        clean === '⚠️' ||
        clean.toLowerCase() === 'content warning' ||
        clean.toLowerCase() === 'warning') {
        continue;
    }
    
    // Accept everything else under warning header
    if (clean.length < 250) {
        contentWarnings.push(clean);
    }
}
      else {
          // DEFAULT: Add to description
          let finalLine = line.replace(/^[:\-\s]+|[:\-\s]+$/g, '');
          
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
          
          // ✅ FIXED: Removed max length limit
          if (finalLine.length > 10) {
              cleanDescriptionLines.push(finalLine);
          }
      }
  }

// ✅ ENHANCED: Deduplicate and clean arrays
features = [...new Set(features)];
requirements = [...new Set(requirements)];
controls = [...new Set(controls)];
contentWarnings = [...new Set(contentWarnings)]; // ✅ ADD THIS

// ✅ ENHANCED: Professional description cleaning with hidden text removal
const cleanDescriptionForDisplay = (lines) => {
    if (!lines || lines.length === 0) return "No description available.";
    
    const filtered = lines.filter(line => {
        const lower = line.toLowerCase();
        
        // Skip common hidden/promotional text
        if (lower.includes('click here') && lower.includes('download')) return false;
        if (lower.includes('get it on') && lower.includes('store')) return false;
        if (lower.includes('available on') && line.length < 40) return false;
        if (lower.startsWith('download') && line.length < 30) return false;
        if (lower.startsWith('play') && line.length < 20) return false;
        if (/^(free|paid|premium|trial|version)/i.test(lower) && line.length < 30) return false;
        
        // Skip navigation/UI text
        if (lower === 'read more' || lower === 'learn more' || lower === 'see more') return false;
        if (lower.includes('share this') || lower.includes('tweet')) return false;
        if (lower.includes('subscribe') && line.length < 30) return false;
        
        // Skip common hidden text patterns
        if (lower.includes('hidden text') || lower.includes('hidden content')) return false;
        if (lower.startsWith('seo:') || lower.startsWith('meta:')) return false;
        if (lower.includes('for search engines only')) return false;
        if (lower.includes('not visible')) return false;
        
        // ✅ NEW: Skip JavaScript code fragments
        if (lower.includes('localstorage.') || lower.includes('setitem') || lower.includes('getitem')) return false;
        if (lower.includes('function(') || lower.includes('=>')) return false;
        if (lower.includes('fadein') || lower.includes('fadeout')) return false;
        if (lower.includes('.click(') || lower.includes('$(')) return false;
        
        // ✅ NEW: Skip alert/warning elements
        if (lower.includes('×') || lower === '×') return false; // Close button
        if (lower.startsWith('warning!') && line.length < 100) return false;
        if (lower.startsWith('strong>') || lower.startsWith('</strong')) return false;
        
        // ✅ NEW: Skip category lists from schema
        if (lower.includes(',') && lower.match(/(sports|strategy|action|adventure|rpg|casual|games)/gi)?.length >= 2) return false;
        
        // Skip platform badges/buttons text
        if (lower.match(/^(windows|mac|linux|android|ios|web)$/)) return false;
        if (lower.includes('get on google play') && line.length < 30) return false;
        if (lower.includes('app store') && line.length < 30) return false;
        
        // Skip very short fragments (likely UI elements)
        if (line.length < 15 && !line.match(/[.!?]$/)) return false;
        
        // Skip lines that are just numbers or versions
        if (/^v?\d+(\.\d+)*$/.test(line.trim())) return false;
        
        // Skip lines that are just call-to-action buttons
        if (/^(download now|play now|get started|try it|install|buy now)$/i.test(lower)) return false;
        
        return true;
    });
    
    // ✅ SMART: Merge lines until we hit a sentence-ending
    const paragraphs = [];
    let currentPara = '';
    
    filtered.forEach(line => {
        const trimmed = line.trim();
        
        // Add to current paragraph
        currentPara += (currentPara ? ' ' : '') + trimmed;
        
        // If line ends with period, question mark, or exclamation - end paragraph
        if (/[.!?]$/.test(trimmed)) {
            paragraphs.push(currentPara);
            currentPara = '';
        }
    });
    
    // Add any remaining text
    if (currentPara) paragraphs.push(currentPara);
    
    return paragraphs.join('\n\n');
};

const fullDescription = cleanDescriptionForDisplay(cleanDescriptionLines);

  // 2. DOWNLOAD LINKS
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

      if (isDownloadButton(imgSrc, href)) {
          let platform = detectPlatformFromImage(imgSrc, altText);
          
          if (!platform) {
              const urlLower = href.toLowerCase();
              if (urlLower.includes('/html') || urlLower.includes('play-online') || (urlLower.includes('itch.io') && urlLower.includes('/html'))) {
                  platform = 'Web';
              }
              else if (urlLower.includes('.apk') || urlLower.includes('play.google.com')) platform = 'Android';
              else if (urlLower.includes('.exe') || urlLower.includes('win')) platform = 'Windows';
              else if (urlLower.includes('.dmg') || urlLower.includes('mac')) platform = 'Mac';
              else if (urlLower.includes('apps.apple.com')) platform = 'iOS';
          }
          if (!platform) platform = 'Download';
          rawLinks.push({ platform, url: href });
      }
  }

  const downloadLinks = refineDownloadLinks(rawLinks);

  // ✅ FIXED: Better fallback for primary download
  const primaryDownload = downloadLinks.length > 0 ? downloadLinks[0].url : null;

  // 3. ✅ FIXED: ROBUST MEDIA EXTRACTION
  let videos = [];
  let gameEmbeds = [];
  
  const iframeRegex = /<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let iframeMatch;
  
  while ((iframeMatch = iframeRegex.exec(contentRaw)) !== null) {
      const iframeSrc = iframeMatch[1].replace(/^http:/, 'https:');
      const lowerSrc = iframeSrc.toLowerCase();
      
      const isGameEmbed = lowerSrc.includes('itch.io/embed') ||
                         lowerSrc.includes('itch.zone') ||
                         lowerSrc.includes('html5game') ||
                         lowerSrc.includes('/html5') ||
                         lowerSrc.includes('widgets.itch.io') ||
                         lowerSrc.includes('/game/') ||
                         lowerSrc.includes('newgrounds.com/portal') ||
                         lowerSrc.includes('kongregate.com/games') ||
                         lowerSrc.includes('rubyapks.netlify.app/online');
      
      const isVideo = lowerSrc.includes('youtube.com') ||
                     lowerSrc.includes('youtu.be') ||
                     lowerSrc.includes('youtube-nocookie.com') ||
                     lowerSrc.includes('vimeo.com') ||
                     lowerSrc.includes('dailymotion.com') ||
                     lowerSrc.includes('twitch.tv');
      
      if (isGameEmbed) {
          gameEmbeds.push(iframeSrc);
      } else if (isVideo) {
          videos.push(iframeSrc);
      }
  }
  
// 4. ✅ FIXED: ROBUST IMAGE EXTRACTION
let allImages = [];
const imgRegex = /(?:src|data-src)=["']([^"']+?)["']/gi;
let match;

while ((match = imgRegex.exec(contentRaw)) !== null) {
    const img = match[1];
    
    // Check if it's an image URL
    const isImage = /\.(jpg|jpeg|png|webp|gif|avif|bmp|svg)(\?.*)?$/i.test(img) ||
                   img.includes('googleusercontent.com') ||
                   img.includes('bp.blogspot.com');
    
    if (!isImage) continue;
    
    const lowerImg = img.toLowerCase();
    
    // ✅ FIXED: Exclude any image with 'button' or 'download' in filename
    const hasButtonInName = lowerImg.includes('button') || lowerImg.includes('btn');
    const hasDownloadInName = lowerImg.includes('download');
    const isDownloadBtn = hasDownloadInName || hasButtonInName;
    
    if (!isDownloadBtn) {
        allImages.push(img);
    }
}
  
  const processImage = (url) => {
      if (!url) return null;
      url = url.replace(/^http:/, 'https:');
      if (url.includes('blogspot') || url.includes('googleusercontent')) {
          url = url.replace(/\/s\d+(-c)?\//g, '/w800/');
          url = url.replace(/=s\d+(-c)?$/g, '=w800');
      }
      return url;
  };
  
  let mainImage = processImage(post.media$thumbnail?.url || allImages[0]);
  if (!mainImage) mainImage = "https://placehold.co/600x900/0b0f19/E0115F.png?text=No+Cover";
  
  // ✅ FIXED: Normalize URLs for comparison
  const normalizeUrl = (url) => url ? url.split('?')[0] : '';
  const mainImageNormalized = normalizeUrl(mainImage);
  
  const screenshots = allImages
      .map(processImage)
      .filter(img => normalizeUrl(img) !== mainImageNormalized)
      .slice(0, 6);

  const tags = post.category ? post.category.map(c => c.term) : ['Indie'];

  // ROBUST APP DETECTION
  const appKeywords = ['app', 'apps', 'application', 'tool', 'tools', 'utility', 'utilities', 'software', 'pwa', 'saas'];
  const isApp = (tags || []).some(t => t && appKeywords.includes(t.toLowerCase()));
  const itemType = isApp ? 'App' : 'Game'; 

  return { 
    id, 
    slug: createSlug(title, id),
    title, 
    type: itemType,
    image: mainImage,
    video: videos[0] || null,
    videos: videos,
    gameEmbed: gameEmbeds[0] || null,
    gameEmbeds: gameEmbeds,
    screenshots,
    downloadUrl: primaryDownload,
    downloadLinks, 
    developer,
    buildPlatform,
    features,
    requirements, 
    controls, 
    socialLinks,
    contentWarnings, 
    tag: tags[0] || 'Game', 
    tags, 
    description: truncateDescription(fullDescription, 150),
    fullDescription: fullDescription 
  };
}

function getBackupGames(limit) {
    if (!BACKUP_DATA?.feed?.entry) return [];
    return BACKUP_DATA.feed.entry
        .slice(0, limit)
        .map(post => {
             try { return normalizePost(post); } catch (e) { 
                 console.error('Error normalizing backup post:', e); 
                 return null; 
             }
        })
        .filter(g => g !== null);
}

export async function fetchGames(limit = 12) {
  try {
    const res = await fetch(`/api/games?limit=${limit}`);
    
    if (!res.ok) {
        console.warn(`⚠️ API Error (${res.status}). Using Snapshot.`);
        const backup = getBackupGames(limit);
        return backup;
    }
    
    const data = await res.json();
    if (!data.feed || !data.feed.entry) {
        console.warn('⚠️ API returned no data. Using Snapshot.');
        const backup = getBackupGames(limit);
        return backup;
    }
    
    const games = data.feed.entry.map(post => normalizePost(post));
    return games;

  } catch (error) { 
    console.warn("⚠️ Network Unreachable. Using Snapshot.", error.message);
    const backup = getBackupGames(limit);
    return backup;
  }
}

// ✅ FIXED: API-first approach with better slug matching
export async function fetchGameById(id) {
    // Try API First
    try {
        const url = `${BASE_URL}/${BLOG_ID}/posts/${id}?key=${API_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
            const post = await res.json();
            return normalizePost(post);
        }
    } catch (error) {
        console.warn('⚠️ API failed, checking backup...');
    }

    // Fallback to Backup
    const backupGames = getBackupGames(100);
    return backupGames.find(g => 
        g.id === id || 
        g.slug === id || 
        g.slug.endsWith(`-${id}`)
    ) || null;
}