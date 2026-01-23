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
    
    let cleanHtml = html
        .replace(/<[^>]*style=["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden)[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '')
        .replace(/<[^>]*class=["'][^"']*(?:hidden|hide|invisible|sr-only|screen-reader|alert|closebtn)[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '')
        .replace(/<([^>]*?)itemprop=["'][^"']*["']([^>]*?)>/gi, '<$1$2>')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
        .replace(/<img[^>]*\/?>/gi, "");
    
    return cleanHtml
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n')
        .split('\n')
        .map(l => cleanText(l))
        .filter(l => l.length > 0);
};

function cleanPlatformName(text) {
    if (!text || text.trim().length === 0) return null;
    
    const noParens = text.replace(/\([^)]*\)/g, '');
    const lower = noParens.toLowerCase().trim();
    
    // ✅ FIRST: Detect platforms (before rejecting)
    const detected = [];
    
    // Check for each platform
    if (lower.includes('win') || lower.includes('pc')) detected.push('Windows');
    
    if ((lower.includes('mac') || lower.includes('osx') || lower.includes('apple')) && 
        !lower.includes('ios') && !lower.includes('iphone')) {
        detected.push('Mac');
    }
    
    if (lower.includes('linux') || lower.includes('ubuntu') || lower.includes('debian')) {
        detected.push('Linux');
    }
    
    if (lower.includes('steamos') || lower.includes('steam deck')) {
        detected.push('SteamOS');
    }
    
    if (lower.includes('chromeos') || lower.includes('chrome os')) {
        detected.push('ChromeOS');
    }
    
    if (lower.includes('android') || lower.includes('apk')) {
        detected.push('Android');
    }
    
    if (lower.includes('ios') || lower.includes('iphone') || lower.includes('ipad')) {
        detected.push('iOS');
    }
    
    if (lower.includes('switch') || lower.includes('nintendo')) {
        detected.push('Nintendo Switch');
    }
    
    if (lower.includes('xbox')) {
        detected.push('Xbox');
    }
    
    if (lower.includes('playstation') || lower.includes('ps4') || lower.includes('ps5')) {
        detected.push('PlayStation');
    }
    
    // ✅ FIX: HTML5/Web detection MUST come before rejection checks
    if (lower.includes('web') || 
        lower.includes('browser') || 
        lower.includes('html5') ||      // ✅ This should catch it
        lower.includes('html') ||       // ✅ Fallback
        lower.includes('online') || 
        lower.includes('webgl')) {
        detected.push('Web');
    }
    
    // ✅ ONLY reject if NO platforms were detected
    if (detected.length === 0) {
        // Check if it's garbage text
        const invalidPatterns = [
            'story', 'storyline', 'game story', 'plot',
            'universal', 'all platforms', 'everywhere',
            'audience', 'rating', 'rated', 'age rating',
            'description', 'about', 'overview',
            'features', 'requirements', 'controls'
        ];
        
        if (invalidPatterns.some(pattern => lower.includes(pattern))) {
            return null;
        }
        
        // Reject age ratings
        if (lower.match(/^\d+\+?$/) || lower.match(/^(e|t|m|ao|rp|pegi)$/i)) {
            return null;
        }
        
    const result = detected.join(', ');
    return result || null;
    }
    
    // Return detected platforms
const result = detected.join(', ');
return result.length > 0 ? result : null;
}

// ✅ NEW: Normalize age rating to standard format
function normalizeAgeRating(text) {
    if (!text) return null;
    
    const clean = text.trim().toUpperCase();
    
    // ESRB ratings
    if (clean.match(/^E\b/) && !clean.match(/E10/)) return 'E (Everyone)';
    if (clean.match(/^E10\+/) || clean.match(/E10/)) return 'E10+ (Everyone 10+)';
    if (clean.match(/^T\b/)) return 'T (Teen)';
    if (clean.match(/^M\b/) && !clean.match(/MATURE/)) return 'M (Mature 17+)';
    if (clean.match(/^AO\b/)) return 'AO (Adults Only 18+)';
    if (clean.match(/^RP\b/)) return 'RP (Rating Pending)';
    
    // PEGI ratings
    if (clean.match(/PEGI\s*3/)) return 'PEGI 3';
    if (clean.match(/PEGI\s*7/)) return 'PEGI 7';
    if (clean.match(/PEGI\s*12/)) return 'PEGI 12';
    if (clean.match(/PEGI\s*16/)) return 'PEGI 16';
    if (clean.match(/PEGI\s*18/)) return 'PEGI 18';
    
    // Age numbers (13+, 18+, etc.)
    if (clean.match(/^(\d+)\+?$/)) {
        const age = clean.match(/^(\d+)\+?$/)[1];
        return `${age}+`;
    }
    
    // Common descriptors
    if (clean.includes('EVERYONE') && !clean.includes('10')) return 'Everyone';
    if (clean.includes('TEEN')) return 'Teen';
    if (clean.includes('MATURE')) return 'Mature 17+';
    if (clean.includes('ADULT')) return 'Adults Only';
    
    // Return cleaned original if no match
    return text.trim();
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

    const specificPlatforms = unique.filter(l => l.platform !== 'Download');
    const genericDownloads = unique.filter(l => l.platform === 'Download');
    
    const specificUrls = new Set(specificPlatforms.map(l => l.url));
    const uniqueGeneric = genericDownloads.filter(g => !specificUrls.has(g.url));
    
    unique = [...specificPlatforms, ...uniqueGeneric];

    const order = { 
        'Windows': 1, 
        'Mac': 2, 
        'Linux': 3,
        'SteamOS': 4,
        'ChromeOS': 5,
        'Android': 6, 
        'iOS': 7, 
        'Nintendo Switch': 8,
        'Xbox': 9,
        'PlayStation': 10,
        'Web': 11, 
        'Download': 99 
    };
    unique.sort((a, b) => (order[a.platform] || 50) - (order[b.platform] || 50));

    return unique;
}

function detectPlatformFromImage(imgUrl, altText = '', href = '') {
    const filename = imgUrl.toLowerCase();
    const alt = altText.toLowerCase();
    const parts = filename.split('/').pop().split('.')[0];
    const linkUrl = href.toLowerCase();
    
    // ✅ PRIORITY 1: Alt text detection (existing behavior - HIGHEST PRIORITY)
    if (alt.includes('windows') || alt.includes('win') || alt.includes('pc')) return 'Windows';
    if (alt.includes('mac') || alt.includes('osx') || alt.includes('apple')) return 'Mac';
    if (alt.includes('linux') || alt.includes('ubuntu') || alt.includes('debian')) return 'Linux';
    if (alt.includes('steamos') || alt.includes('steam deck')) return 'SteamOS';
    if (alt.includes('chromeos')) return 'ChromeOS';
    if (alt.includes('android') || alt.includes('apk')) return 'Android';
    if (alt.includes('ios') || alt.includes('iphone') || alt.includes('ipad') || alt.includes('app store')) return 'iOS';
    if (alt.includes('switch') || alt.includes('nintendo')) return 'Nintendo Switch';
    if (alt.includes('xbox')) return 'Xbox';
    if (alt.includes('playstation') || alt.includes('ps4') || alt.includes('ps5')) return 'PlayStation';
    if (alt.includes('web') || alt.includes('browser') || alt.includes('html5') || alt.includes('online') || alt.includes('play now') || alt.includes('webgl')) return 'Web';
    
    // ✅ PRIORITY 2: Store URL detection (NEW - FALLBACK WHEN NO ALT TEXT)
    if (linkUrl) {
        if (linkUrl.includes('steampowered.com') || linkUrl.includes('store.steam')) return 'Steam';
        if (linkUrl.includes('itch.io')) return 'Itch.io';
        if (linkUrl.includes('gog.com')) return 'GOG';
        if (linkUrl.includes('epicgames.com')) return 'Epic Games';
        if (linkUrl.includes('play.google.com')) return 'Google Play';
        if (linkUrl.includes('apps.apple.com')) return 'App Store';
        if (linkUrl.includes('microsoft.com/store')) return 'Microsoft Store';
        if (linkUrl.includes('humblebundle.com')) return 'Humble Bundle';
        if (linkUrl.includes('gamejolt.com')) return 'Game Jolt';
    }
    
    // PRIORITY 3: Filename patterns (existing - LAST RESORT)
    if (/\b(web|browser|online|html5|html|webgl)\b/.test(parts)) return 'Web';
    if (/\b(mac|osx|apple|dmg|darwin)\b/.test(parts)) return 'Mac';
    if (/\b(windows|win64|win32|win|pc)\b/.test(parts)) return 'Windows';
    if (/\b(linux|ubuntu|debian)\b/.test(parts)) return 'Linux';
    if (/\b(steamos|steamdeck)\b/.test(parts)) return 'SteamOS';
    if (/\b(chromeos|chrome)\b/.test(parts)) return 'ChromeOS';
    if (/\b(android|apk)\b/.test(parts)) return 'Android';
    if (/\bios\b/.test(parts)) return 'iOS';
    if (/\b(switch|nintendo)\b/.test(parts)) return 'Nintendo Switch';
    if (/\bxbox\b/.test(parts)) return 'Xbox';
    if (/\b(playstation|ps4|ps5)\b/.test(parts)) return 'PlayStation';
    
    return null;
}

function isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

function isDownloadButton(imgUrl, href = '') {
    const lowerImg = imgUrl.toLowerCase();
    const lowerHref = href.toLowerCase();

    // ✅ Add this block at the START of isDownloadButton()
    const blockedDomains = [
        'youtube.com', 'youtu.be', 'youtube-nocookie.com',
        'vimeo.com', 'dailymotion.com', 'twitch.tv',
        'twitter.com', 'facebook.com', 'instagram.com',
        'tiktok.com', 'reddit.com',
        'discord.gg', 'discord.com' , 'rubyapks.blogspot.com'
    ];

    if (blockedDomains.some(domain => lowerHref.includes(domain))) {
        return false;
    }

    // ✅ Exclude direct image links
    if (lowerHref.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/)) return false;
    if (lowerHref.includes('bp.blogspot.com') || lowerHref.includes('googleusercontent.com')) return false;

    // ✅ Known download platforms
    const isKnownDownloadPlatform = 
        lowerHref.includes('play.google.com') ||
        lowerHref.includes('apps.apple.com') ||
        lowerHref.includes('microsoft.com/store') ||
        lowerHref.includes('itch.io/') ||
        lowerHref.includes('/download') ||
        lowerHref.includes('mediafire.com') ||
        lowerHref.includes('mega.nz') ||
        lowerHref.includes('drive.google.com') ||
        lowerHref.includes('dropbox.com') ||
        lowerHref.includes('github.com/releases');
    
    // ✅ Detect web/HTML5 games by image alt text or filename
    const isWebGameButton = 
        lowerImg.includes('play') || 
        lowerImg.includes('browser') || 
        lowerImg.includes('web') || 
        lowerImg.includes('html5') ||
        lowerImg.includes('online');

    // ✅ Excluded domains (personal sites)
    const excludedDomains = [
        '.com/', 
    ];
    
    // Only exclude if it's a root domain (ends with /) AND not a known platform AND not a web game button
    const isRootDomain = excludedDomains.some(domain => {
        const pattern = new RegExp(domain.replace('.', '\\.') + '$');
        return pattern.test(lowerHref);
    });
    
    if (isRootDomain && !isKnownDownloadPlatform && !isWebGameButton) {
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
    
    return (hasDownloadKeyword || isKnownDownloadPlatform || isWebGameButton) && isNotScreenshot;
}

function truncateDescription(text, maxLength = 150) {
    if (!text || text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "...";
}

function isValidDeveloperName(text) {
    if (!text || text.length < 2 || text.length > 100) return false;
    if (text.includes('http') || text.includes('://') || text.includes('www.')) return false;
    if (text === text.toUpperCase() && text.length > 5) return false;
    if (text.toLowerCase().includes('version') || 
        text.toLowerCase().includes('build') ||
        text.toLowerCase().includes('platform')) return false;
    const alphaNumCount = (text.match(/[a-zA-Z0-9]/g) || []).length;
    if (alphaNumCount < text.length * 0.5) return false;
    return true;
}

function isValidPlatformText(text) {
    if (!text || text.trim().length === 0) return false;
    
    const lower = text.toLowerCase().trim();
    
    const forbiddenPhrases = [
        'features', 'feature', 'game features', 'key features',
        'requirements', 'system requirements',
        'controls', 'how to play', 'how it works',
        'story', 'storyline', 'game story', 'plot',
        'description', 'about', 'overview',
        'audience', 'rating', 'age rating',
        'universal', 'everyone', 'mature',
        'screenshots', 'media', 'trailer', 'gameplay'
    ];
    
    if (forbiddenPhrases.some(phrase => lower === phrase || lower === phrase + ':')) {
        return false;
    }
    
    if (lower.match(/^\d+\+?$/)) return false;
    if (lower.match(/^(e|t|m|ao|rp)$/)) return false;
    
    if (text.split(/\s+/).length > 8 && text.match(/[.!?:]$/)) return false;
    
    return true;
}

function cleanTags(tags) {
    if (!tags || !Array.isArray(tags)) return ['Indie'];
    
    const cleaned = tags
        .map(tag => {
            if (!tag || typeof tag !== 'string') return null;
            let clean = tag.trim().toLowerCase();
            if (clean.length < 2 || clean.length > 30) return null;
            const garbage = ['untitled', 'new post', 'draft', 'test', 'temp', 'placeholder'];
            if (garbage.includes(clean)) return null;
            return clean.charAt(0).toUpperCase() + clean.slice(1);
        })
        .filter(tag => tag !== null);
    
    const unique = [...new Set(cleaned)];
    return unique.length > 0 ? unique : ['Indie'];
}

const cleanDescriptionForDisplay = (lines) => {
    if (!lines || lines.length === 0) return "No description available.";
    
    const filtered = lines.filter(line => {
        const lower = line.toLowerCase();
        
        if (lower.includes('click here') && lower.includes('download')) return false;
        if (lower.includes('get it on') && lower.includes('store')) return false;
        if (lower.includes('available on') && line.length < 40) return false;
        if (lower.startsWith('download') && line.length < 30) return false;
        if (lower.startsWith('play') && line.length < 20) return false;
        if (/^(free|paid|premium|trial|version)/i.test(lower) && line.length < 30) return false;
        if (lower === 'read more' || lower === 'learn more' || lower === 'see more') return false;
        if (lower.includes('share this') || lower.includes('tweet')) return false;
        if (lower.includes('subscribe') && line.length < 30) return false;
        if (lower.includes('hidden text') || lower.includes('hidden content')) return false;
        if (lower.startsWith('seo:') || lower.startsWith('meta:')) return false;
        if (lower.includes('for search engines only')) return false;
        if (lower.includes('not visible')) return false;
        if (lower.includes('localstorage.') || lower.includes('setitem') || lower.includes('getitem')) return false;
        if (lower.includes('function(') || lower.includes('=>')) return false;
        if (lower.includes('fadein') || lower.includes('fadeout')) return false;
        if (lower.includes('.click(') || lower.includes('$(')) return false;
        if (lower.match(/^"@(type|context|id)"/)) return false;
        if (lower.match(/^"(name|description|image|url|author|datePublished|operatingSystem|softwareVersion|applicationCategory)":/)) return false;
        if (lower === '×' || line.trim() === '×') return false;
        if (lower.startsWith('warning!') && line.length < 100) return false;
        if (lower.startsWith('strong>') || lower.startsWith('</strong')) return false;
        if (line.trim().length === 1) return false;
        if (lower.includes(',') && lower.match(/(sports|strategy|action|adventure|rpg|casual|games)/gi)?.length >= 2) return false;
        if (lower.match(/^(windows|mac|linux|android|ios|web)$/)) return false;
        if (lower.includes('get on google play') && line.length < 30) return false;
        if (lower.includes('app store') && line.length < 30) return false;
        if (line.length < 15 && !line.match(/[.!?]$/)) return false;
        if (/^v?\d+(\.\d+)*$/.test(line.trim())) return false;
        if (/^(download now|play now|get started|try it|install|buy now)$/i.test(lower)) return false;
        
        return true;
    });
    
    const paragraphs = [];
    let currentPara = '';
    
    filtered.forEach(line => {
        const trimmed = line.trim();
        currentPara += (currentPara ? ' ' : '') + trimmed;
        
        if (/[.!?]$/.test(trimmed)) {
            paragraphs.push(currentPara);
            currentPara = '';
        }
    });
    
    if (currentPara) paragraphs.push(currentPara);
    
    return paragraphs.join('\n\n');
};

function safeNormalizePost(post) {
    try {
        return normalizePost(post);
    } catch (error) {
        
        const title = post?.title?.$t || post?.title || 'Untitled';
        const idRaw = post?.id?.$t || post?.id || 'unknown';
        const id = idRaw.includes('post-') ? idRaw.split('post-')[1] : idRaw;
        
        return {
            id,
            slug: createSlug(title, id),
            title,
            type: 'Game',
            image: "https://placehold.co/600x900/0b0f19/E0115F.png?text=Error+Loading",
            video: null,
            videos: [],
            gameEmbed: null,
            gameEmbeds: [],
            screenshots: [],
            downloadUrl: null,
            downloadLinks: [],
            developer: "Unknown",
            buildPlatform: null,
            features: [],
            requirements: [],
            controls: [],
            howItWorks: [],
            socialLinks: [],
            contentWarnings: [],
            ageRating: null, // ✅ NEW
            tag: 'Game',
            tags: ['Game'],
            description: "Error loading content.",
            fullDescription: "Error loading content.",
            metaDescription: "Error loading content.",
            publishedDate: post?.published?.$t || null,
            lastUpdated: post?.updated?.$t || null
        };
    }
}

function normalizePost(post) {
  const title = post.title.$t || post.title; 
  let contentRaw = post.content ? (post.content.$t || post.content) : '';
  const idRaw = post.id.$t || post.id;
  const id = idRaw.includes('post-') ? idRaw.split('post-')[1] : idRaw;

  contentRaw = contentRaw
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&");

  contentRaw = contentRaw.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

  let developer = "Indie Dev";
  let buildPlatform = null;
  let version = null;
  let features = [];
  let requirements = [];
  let controls = [];
  let howItWorks = [];
  let socialLinks = [];
  let contentWarnings = [];
  let ageRating = null;
  let license = 'Free';
  let cleanDescriptionLines = [];
  let size = null; // ✅ Initialize

const textLines = htmlToTextLines(contentRaw);

// ✅ ADD THIS DEBUG

let captureMode = null;

  const featureHeaders = [
      'features:',
      'features',
      'game features:',
      'game features',
      'key features:',
      'key features'
  ];

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

const controlHeaders = [
    'controls:',
    'controls',
    'how to play:',
    'how to play',
    'keyboard & mouse controls',
    'keyboard and mouse controls',
    'keyboard & mouse controls:',
    'keyboard and mouse controls:',
    'keyboard and mouse input',
    'keyboard and mouse input:',
    'keyboard & mouse input',        
    'keyboard & mouse input:',
    'gamepad controls',
    'gamepad controls:',
    'controller controls',
    'controller controls:',
    'controller layout',
    'controller layout:',
    'button mapping',
    'button mapping:',
    'xbox controls',
    'xbox controls:',
    'playstation controls',
    'playstation controls:',
    'switch controls',
    'switch controls:'
];

  const howItWorksHeaders = [
      'how it works:',
      'how it works',
      'how to use:',
      'how to use',
      'usage:',
      'usage',
      'getting started:',
      'getting started',
      'quick start:',
      'quick start'
  ];

const socialHeaders = [
    'support this project:',
    'support this project',
    'support this project on:',
    'follow us:',
    'follow us',
    'follow us on:',           // ✅ Generic
    'follow on:',              // ✅ Generic
    'contact:',
    'contact us:',
    'social links:',
    'links:'
];

  const warningHeaders = [
      'content warning:',
      'content warnings:',
      'content warning',
      'content warnings',
      'warning:',
      'warnings:',
      'warning',
      'warnings',
      'age rating:',
      'age rating',
      'rated:',
      'rated'
  ];

  const allSectionHeaders = [
      ...featureHeaders,
      ...requirementHeaders,
      ...controlHeaders,
      ...howItWorksHeaders,
      ...socialHeaders,
      ...warningHeaders
  ];

  for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      const lowerLine = line.toLowerCase();

    if (line.startsWith('<') || 
        line.match(/^(src|alt|data-|width|height|border|class|style|id)=/i) ||
        line.match(/^[a-z-]+="[^"]*"$/i)) {
        continue;
    }

      if (lowerLine.startsWith('price:') || lowerLine === '0.00' || lowerLine === '$0.00') continue;
      if (lowerLine === 'play online' || lowerLine === 'play online:') continue;
      if (lowerLine === 'also available on' || lowerLine.startsWith('also available on:')) continue;
      if (lowerLine.includes('page link')) continue;
      if (line.trim() === ':') continue;
      if (/^https?:\/\/[^\s]+$/.test(lowerLine)) continue;
      
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
      
      const commaCount = (line.match(/,/g) || []).length;
      if (commaCount >= 5 && line.length < 100) continue;
      if (line === line.toUpperCase() && line.length > 10 && line.includes(',')) continue;

      if (lowerLine.startsWith('developer') || lowerLine.startsWith('studio')) {
          const parts = line.split(/[:\-]/); 
          let rawDev = '';
          
          if (parts.length > 1 && parts[1].trim().length > 0) {
              rawDev = parts.slice(1).join('-').trim();
          } else if (i + 1 < textLines.length) {
              const nextLine = textLines[i + 1].trim();
              if (isValidDeveloperName(nextLine)) {
                  rawDev = nextLine;
                  i++;
              }
          }
          
          if (rawDev.length > 0) {
              rawDev = rawDev.replace(/<[^>]*>/g, '');
              rawDev = rawDev.replace(/https?:\/\/[^\s]+/g, '');
              rawDev = rawDev.replace(/\s+/g, ' ').trim();
              
              if (isValidDeveloperName(rawDev)) {
                  developer = rawDev;
              }
          }
              // ✅ NEW: Extract developer link from the original HTML
    const devLinkMatch = contentRaw.match(new RegExp(`<a[^>]+href=["']([^"']+)["'][^>]*>${rawDev.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</a>`, 'i'));
    if (devLinkMatch && isValidUrl(devLinkMatch[1])) {
        socialLinks.push({ label: 'Developer', url: devLinkMatch[1] });
    }
    
    continue;
      }
      
// Parse Version
if (lowerLine.startsWith('version')) {
    const parts = line.split(/[:\-]/);
    let rawVersion = '';
    
    if (parts.length > 1 && parts[1].trim().length > 0) {
        rawVersion = parts.slice(1).join(' ').trim();
    } else if (i + 1 < textLines.length) {
        const nextLine = textLines[i + 1].trim();
        const nextLineLower = nextLine.toLowerCase();
        
        // ✅ DON'T capture the next line if it's a section header OR platform-related
        if (!allSectionHeaders.includes(nextLineLower) && 
            !nextLineLower.startsWith('platform') &&
            !nextLineLower.startsWith('build')) {
            rawVersion = nextLine;
            i++;
        }
    }
    
    if (rawVersion.length > 0) {
        // Clean and validate version string
        rawVersion = rawVersion.replace(/<[^>]*>/g, '').trim();
        
        // ✅ Make sure it's not a platform name
        const isPlatform = /windows|mac|linux|android|ios|web|html5|browser|steamos|chromeos/i.test(rawVersion);
        
        if (!isPlatform) {
            // Extract version pattern (e.g., "1.0", "v2.3.1", "1.0.0")
            const versionMatch = rawVersion.match(/v?(\d+\.?\d*\.?\d*)/i);
            if (versionMatch) {
                version = versionMatch[1];
            } else if (rawVersion.length < 20) {
                // If no number pattern but short text, use as-is
                version = rawVersion;
            }
        }
    }
    continue;
}
      
if (lowerLine.startsWith('build') || lowerLine.startsWith('platform')) {
    const parts = line.split(/[:\-]/); 
    let rawBuild = '';
    
    
    if (parts.length > 1) {
        const afterSeparator = parts.slice(1).join(' ').trim();
        
        if (afterSeparator.length > 0 && !afterSeparator.match(/^\s*$/)) {
            rawBuild = afterSeparator;
        }
    }
    
    if (rawBuild.length === 0 && i + 1 < textLines.length) {
        const nextLine = textLines[i + 1].trim();
        const nextLineLower = nextLine.toLowerCase();
        
        if (!allSectionHeaders.includes(nextLineLower) && isValidPlatformText(nextLine)) {
            rawBuild = nextLine;
            i++;
        }
    }
    
    
    if (rawBuild.length > 0) {
        const cleaned = cleanPlatformName(rawBuild);
        if (cleaned) {
            buildPlatform = cleaned;
        }
    }
    continue;
} 
      // ✅ NEW: Parse age rating
      if (lowerLine.startsWith('audience') || lowerLine.startsWith('rating') || lowerLine.startsWith('rated')) {
          const parts = line.split(/[:\-]/);
          let rawRating = '';
          
          if (parts.length > 1 && parts[1].trim().length > 0) {
              rawRating = parts.slice(1).join(' ').trim();
          } else if (i + 1 < textLines.length) {
              const nextLine = textLines[i + 1].trim();
              const nextLineLower = nextLine.toLowerCase();
              
              if (!allSectionHeaders.includes(nextLineLower)) {
                  rawRating = nextLine;
                  i++;
              }
          }
          
          if (rawRating.length > 0) {
              ageRating = normalizeAgeRating(rawRating);
          }
          continue;
      }

    // Parse License from tags
    if (lowerLine.startsWith('license') || lowerLine.startsWith('price')) {
        const parts = line.split(/[:\-]/);
        let rawLicense = '';
        
        if (parts.length > 1 && parts[1].trim().length > 0) {
            rawLicense = parts.slice(1).join(' ').trim();
        } else if (i + 1 < textLines.length) {
            const nextLine = textLines[i + 1].trim();
            const nextLineLower = nextLine.toLowerCase();
            
            if (!allSectionHeaders.includes(nextLineLower)) {
                rawLicense = nextLine;
                i++;
            }
        }
        
        if (rawLicense.length > 0) {
            // Normalize to standard values
            const lower = rawLicense.toLowerCase();
            if (lower.includes('paid') || lower.includes('premium') || lower.includes('commercial')) {
                license = 'Paid';
            } else if (lower.includes('demo') || lower.includes('trial')) {
                license = 'Demo';
            } else if (lower.includes('open source') || lower.includes('opensource')) {
                license = 'Open Source';
            } else if (lower.includes('free')) {
                license = 'Free';
            }
        }
        continue;
    }

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

      if (requirementHeaders.includes(lowerLine)) { 
          captureMode = 'requirements'; 
          continue; 
      } 

      if (howItWorksHeaders.includes(lowerLine)) {
          captureMode = 'howItWorks';
          continue;
      }

if (controlHeaders.includes(lowerLine)) {
    // ✅ Peek ahead to see if this is controls or instructions
    const nextFewLines = textLines.slice(i + 1, i + 10).join(' ').toLowerCase();
    
    // Check if it contains actual control patterns
    const hasControlKeywords = 
        /mouse|keyboard|button|arrow|wasd|space|enter|esc|key|shift/i.test(nextFewLines) &&
        nextFewLines.includes(':');
    
    // Check if it's instructions instead
    const isInstructions = 
        nextFewLines.includes('download') ||
        nextFewLines.includes('emulator') ||
        nextFewLines.includes('you need to') ||
        nextFewLines.includes('open the');
    
    // If it has control keywords and not instructions → controls mode
    if (hasControlKeywords && !isInstructions) {
        captureMode = 'controls';
    } 
    // If it's instructions → howItWorks mode
    else if (isInstructions) {
        captureMode = 'howItWorks';
    } 
    // Otherwise → controls by default
    else {
        captureMode = 'controls';
    }
    
    continue; 
}

if (socialHeaders.includes(lowerLine) || lowerLine.startsWith('music -')) {
    captureMode = 'socials';
    if (lowerLine.startsWith('music -')) {
         const url = line.match(/https?:\/\/[^\s]+/);
         if(url && isValidUrl(url[0])) socialLinks.push({ label: 'Soundtrack', url: url[0] });
    }
    continue; 
}

      if (warningHeaders.includes(lowerLine)) {
          captureMode = 'warnings';
          continue;
      }

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
            // ✅ NEW: Detect size
            const sizeMatch = clean.match(/(?:Storage|Size|Disk Space|HDD|Space):\s*([\d\.]+\s*(?:GB|MB|KB))/i);
            if (sizeMatch) {
                size = sizeMatch[1];
            }
            
           if (clean.length > 2 && !clean.toLowerCase().includes('price')) {
               requirements.push(clean);
           }
      }
else if (captureMode === 'controls') {
    const clean = line.replace(/^[-•*]\s*/, '').trim();
    
    if (clean.length < 2) continue;
    
    // ✅ Stop at social/external sections
    const stopPhrases = [
        'support this project',
        'follow',
        'contact',
        'page link:',
        'soundtrack by',
        'download only',
        'important information',
        'please, check out',
        'you need to download',
        'emulator',
        'pocket plafformer'
    ];
    
    if (stopPhrases.some(phrase => clean.toLowerCase().includes(phrase))) {
        captureMode = null;
        continue;
    }
    
    // ✅ Stop at URLs
    if (clean.includes('http://') || clean.includes('https://')) {
        captureMode = null;
        continue;
    }
    
    // ✅ Split by bullet separator (·) for inline controls
    const parts = clean.split('·').map(p => p.trim()).filter(p => p.length > 0);
    
    for (const part of parts) {
        // Check if it's a valid control pattern
        const hasControlPattern = 
            part.includes(':') ||
            /^[A-Z][\w\/\s]+:/.test(part) ||
            /^[A-Z][\w\/\s]*\/[A-Z][\w\/\s]*:/.test(part) ||
            /^[a-z]+\s*:/.test(part) ||
            /arrow\s+button/i.test(part) ||
            /key\s+button/i.test(part) ||
            /mouse\s+button/i.test(part) ||
            /^mouse:/i.test(part) ||
            /^(left|right|middle|up|down)\s+(mouse|arrow|shift)/i.test(part) ||
            /^(x|z|e|r|q|v|c|f|w|a|s|d|space|enter|esc|escape|shift)[\s\/]/i.test(part) ||
            /wasd/i.test(part);
        
        // Skip browser requirements and similar instructional text
        const isInstruction = 
            part.toLowerCase().includes('required browsers') ||
            part.toLowerCase().includes('only in') ||
            part.toLowerCase().includes('two times:') ||
            part.toLowerCase().includes('for the');
        
        if (hasControlPattern && !isInstruction && part.length < 200 && part.length > 5) {
            controls.push(part);
        }
    }
}
else if (captureMode === 'howItWorks') {
    const clean = line.replace(/^[-•*]\s*|^\d+\.\s*/, '').trim();
    
    if (clean.length < 2 || clean.includes('http')) continue;
    
    if (allSectionHeaders.includes(lowerLine)) {
        captureMode = null;
        continue;
    }
    
    // ✅ Collect all text, we'll split into sentences later
    if (clean.length > 5 && clean.length < 500) {
        howItWorks.push(clean);
    }
}
else if (captureMode === 'socials') {
    
    // ✅ Skip descriptive/instructional text lines (generic check)
    const lowerClean = line.toLowerCase();
    if ((lowerClean.includes('are you') && lowerClean.includes('developer')) || 
        lowerClean.includes('want to help') ||
        (lowerClean.includes('contact') && lowerClean.includes('email:') && !lowerClean.includes('http'))) {
        continue;
    }
    
    const urlMatch = line.match(/https?:\/\/[^\s]+/);
    if (urlMatch && isValidUrl(urlMatch[0])) {
        let label = 'Website';
        const url = urlMatch[0];
        
        // ✅ Enhanced label detection
        if (url.includes('patreon')) label = 'Patreon';
        else if (url.includes('ko-fi')) label = 'Ko-Fi';
        else if (url.includes('indiegogo') || url.includes('igg.me')) label = 'Indiegogo';
        else if (url.includes('utip.io')) label = 'uTip';
        else if (url.includes('discord')) label = 'Discord';
        else if (url.includes('youtube')) label = 'YouTube';
        else if (url.includes('twitter')) label = 'Twitter';
        else if (url.includes('itch.io')) label = 'Itch.io';
        else if (url.includes('weebly.com') || line.toLowerCase().includes('official website')) label = 'Official Website';
        else if (line.toLowerCase().includes('email') || line.includes('@')) label = 'Email';
        
        if (!socialLinks.some(s => s.url === url)) {
            socialLinks.push({ label, url });
        }

        
    }
}
      else if (captureMode === 'warnings') {
          const clean = line.replace(/^[-•*]\s*/, '').trim();
          
          if (allSectionHeaders.includes(lowerLine)) {
              captureMode = null;
              continue;
          }
          
          if (clean.length < 5 || 
              clean.includes('http') || 
              clean === '×' || 
              clean === '⚠️' ||
              clean.toLowerCase() === 'content warning' ||
              clean.toLowerCase() === 'warning') {
              continue;
          }

              
    // ✅ NEW: Check if line contains age rating
    const agePattern = /(?:not recommended for|recommended for|players? (?:under|over|above|below)|ages?|rated)\s*(?:under|over|above|below)?\s*(\d+)/i;
    const ageMatch = clean.match(agePattern);
    
    if (ageMatch && !ageRating) {
        const age = parseInt(ageMatch[1]);
        if (age >= 3 && age <= 21) { // Reasonable age range
            if (clean.toLowerCase().includes('under') || clean.toLowerCase().includes('below')) {
                ageRating = `${age}+`;
            } else {
                ageRating = `${age}+`;
            }
        }
    }
          
          if (clean.length < 250) {
              contentWarnings.push(clean);
          }
      }
      else {
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
          
          if (finalLine.length > 10) {
              cleanDescriptionLines.push(finalLine);
          }
      }
  }

  features = [...new Set(features)];
  requirements = [...new Set(requirements)];
  controls = [...new Set(controls)];
  // ✅ Process howItWorks: Join all text, then split by sentences
if (howItWorks.length > 0) {
    const fullText = howItWorks.join(' ');
    howItWorks = fullText
        .split(/(?<=[.!?])\s+/) // Split by sentence endings
        .map(s => s.trim())
        .filter(s => s.length > 10 && /[.!?]$/.test(s)); // Only complete sentences with 10+ chars
}
  howItWorks = [...new Set(howItWorks)];
  contentWarnings = [...new Set(contentWarnings)];

  const fullDescription = cleanDescriptionForDisplay(cleanDescriptionLines);
  const metaDescription = truncateDescription(fullDescription.split('\n\n')[0] || fullDescription, 160);

// 2. DOWNLOAD LINKS
let rawLinks = [];

// ✅ Extract social/dev domains to exclude from downloads
const socialDomains = socialLinks.map(link => {
    try {
        const url = new URL(link.url);
        return url.hostname.replace('www.', '');
    } catch {
        return null;
    }
}).filter(Boolean);


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

    if (isDownloadButton(imgSrc, href) && isValidUrl(href)) {
        // ✅ Check if this matches a social/dev domain (ROOT ONLY)
        let shouldSkip = false;
        try {
            const linkUrl = new URL(href);
            const linkHostname = linkUrl.hostname.replace('www.', '');
            const linkPath = linkUrl.pathname;
            
            if (socialDomains.includes(linkHostname)) {
                if (linkPath === '/' || linkPath === '' || 
                    linkPath === '/index' || linkPath === '/home' ||
                    linkPath === '/index.html' || linkPath === '/home.html') {
                    shouldSkip = true;
                }
            }
        } catch (e) {
            // Invalid URL, continue processing
        }
        
        if (shouldSkip) continue;
        
        // ✅ NOW proceed with normal platform detection
        let platform = null;
        
        const urlLower = href.toLowerCase();
        
        if (urlLower.includes('play.google.com') || urlLower.includes('market.android.com')) {
            platform = 'Android';
        } 
        else if (urlLower.includes('apps.apple.com') || urlLower.includes('itunes.apple.com')) {
            platform = 'iOS';
        } 
        else if (urlLower.includes('microsoft.com/store') || urlLower.includes('windows.com/store')) {
            platform = 'Windows';
        } 
        else {
            // Check image-based detection
            platform = detectPlatformFromImage(imgSrc, altText, href);
            
if (!platform) {
    // Fallback to URL patterns
    if (urlLower.includes('/html') || 
        urlLower.includes('html5') || 
        urlLower.includes('play-online') || 
        urlLower.includes('webgl') ||
        (urlLower.includes('itch.io') && urlLower.includes('/html'))) {
        platform = 'Web';
    }
    else if (urlLower.includes('.apk')) platform = 'Android';
    else if (urlLower.includes('.exe') || urlLower.includes('.msi')) platform = 'Windows';
    else if (urlLower.includes('.dmg') || 
             urlLower.includes('.pkg') || 
             urlLower.includes('-mac.') || 
             urlLower.includes('_mac.') || 
             urlLower.includes('for-mac') || 
             urlLower.includes('for_mac') ||
             urlLower.includes('/mac/') ||
             urlLower.includes('-macos') ||
             urlLower.includes('-osx')) {
        platform = 'Mac';
    }
    else if (urlLower.includes('.deb') || 
             urlLower.includes('.appimage') ||
             urlLower.includes('-linux.') ||
             urlLower.includes('for-linux')) {
        platform = 'Linux';
    }
}
        }
        
        if (!platform) platform = 'Download';
        
        rawLinks.push({ platform, url: href });
    }
}

  const downloadLinks = refineDownloadLinks(rawLinks);
  const primaryDownload = downloadLinks.length > 0 ? downloadLinks[0].url : null;

  // 3. MEDIA EXTRACTION
  let videos = [];
  let gameEmbeds = [];
  
  // A. Try extracting from HTML (Iframes/YouTube)
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
      
      if (isGameEmbed && isValidUrl(iframeSrc)) {
          gameEmbeds.push(iframeSrc);
      } else if (isVideo && isValidUrl(iframeSrc)) {
          videos.push(iframeSrc);
      }
  }

  // ✅ B. NEW: Specific Extractor for the "video.g?token" link you found
  // This looks for the link anywhere in the text (href, src, or just plain text)
  const tokenVideoRegex = /https:\/\/www\.blogger\.com\/video\.g\?token=[A-Za-z0-9_\-]+/g;
  let tokenMatch;
  while ((tokenMatch = tokenVideoRegex.exec(contentRaw)) !== null) {
      const foundUrl = tokenMatch[0];
      if (!videos.includes(foundUrl)) {
          // Add to START of array so it takes priority
          videos.unshift(foundUrl);
      }
  }

  // C. Fallback: Legacy Object tags (contentid)
  const contentIdRegex = /\bcontent[Ii]d\s*=\s*["']?([a-zA-Z0-9]+)["']?/gi;
  let cidMatch;
  while ((cidMatch = contentIdRegex.exec(contentRaw)) !== null) {
      const id = cidMatch[1];
      if (id && id.length > 5) { 
          // We add this as a backup, but the Token URL above is preferred
          const videoUrl = `https://www.blogger.com/video-play.mp4?contentId=${id}`;
          if (!videos.includes(videoUrl)) {
              videos.push(videoUrl);
          }
      }
  }

  // D. Extract Native Blogger Videos from API Metadata
  if (post.media$group && post.media$group.media$content) {
      const mediaList = Array.isArray(post.media$group.media$content) 
          ? post.media$group.media$content 
          : [post.media$group.media$content];
          
      mediaList.forEach(item => {
          if (item.medium === 'video' && item.url) {
              const secureUrl = item.url.replace(/^http:/, 'https:');
              if (!videos.includes(secureUrl)) {
                  videos.push(secureUrl);
              }
          }
      });
  }
// 4. IMAGE EXTRACTION
let allImages = [];
const imgRegex = /(?:src|data-src)=["']([^"']+?)["']/gi;
let match;

while ((match = imgRegex.exec(contentRaw)) !== null) {
    const img = match[1];
    
    const isImage = /\.(jpg|jpeg|png|webp|gif|avif|bmp|svg)(\?.*)?$/i.test(img) ||
                   img.includes('googleusercontent.com') ||
                   img.includes('bp.blogspot.com');
    
    if (!isImage) continue;
    
    const lowerImg = img.toLowerCase();
    
    const hasButtonInName = lowerImg.includes('button') || lowerImg.includes('btn');
    const hasDownloadInName = lowerImg.includes('download');
    const isDownloadBtn = hasDownloadInName || hasButtonInName;
    
    const hasSizeParam = img.match(/[?&]w=(\d+)/i) || img.match(/\/s(\d+)(-c)?\//);
    if (hasSizeParam) {
        const width = parseInt(hasSizeParam[1]);
        if (width < 200) continue;
    }
    
    if (!isDownloadBtn) {
        allImages.push(img);
    }
}

const processImage = (url) => {
    if (!url) return null;
    url = url.replace(/^http:/, 'https:');
    
    // ✅ FORCE HIGH QUALITY (1600px width)
    // Blogger/Google URLs usually follow pattern: .../s320/name.png or ...=s320
    if (url.includes('blogspot') || url.includes('googleusercontent')) {
        // Replace folder-style sizing (/s320/) with /w1600/ (Width 1600px)
        // or /s0/ (Original Size - risky if original is 4000px+, stick to w1600 for performance)
        url = url.replace(/\/s\d+(-c)?\//g, '/w1600/');
        
        // Replace query-style sizing (=s320) with =w1600
        url = url.replace(/=s\d+(-c)?$/g, '=w1600');
        
        // Ensure we don't accidentally break existing high-res links
        if (!url.includes('/w1600/') && !url.includes('=w1600')) {
             // If no size param found, append it to force resizing
             // This is tricky with Blogger URLs, usually better to leave if regex didn't match
        }
    }
    return url;
};
// ✅ NEW: Smart cover image detection
let mainImage = null;

// Try to find cover by alt text (Game Cover, Cover, Icon, App Icon)
const coverImageMatch = contentRaw.match(/<img[^>]*alt=["'](Game Cover|Cover|Icon|App Icon|Game Icon|Logo)["'][^>]*(?:src|data-src)=["']([^"']+)["']/i);
if (coverImageMatch) {
    mainImage = processImage(coverImageMatch[2]);
} else {
    // Fallback: Use media thumbnail or first image
    mainImage = processImage(post.media$thumbnail?.url || allImages[0]);
}

if (!mainImage) mainImage = "https://placehold.co/600x900/0b0f19/E0115F.png?text=No+Cover";

const normalizeUrl = (url) => url ? url.split('?')[0].split('=')[0] : '';
const mainImageNormalized = normalizeUrl(mainImage);


// ✅ FIX: Exclude cover image AND tiny icons from screenshots
const screenshots = allImages
    .map(processImage)
    .filter(img => {
        if (!img) return false;
        
        const normalized = normalizeUrl(img);
        
        // Skip if matches cover
        if (normalized === mainImageNormalized) {
            return false;
        }
        
        // Skip tiny icons (common in Google Play posts)
        if (img.includes('=s128') || img.includes('=s64') || img.includes('=s96')) {
            return false;
        }
        
        // Skip images smaller than 400px wide
        const sizeMatch = img.match(/[?&]w=(\d+)/i) || img.match(/=w(\d+)/);
        if (sizeMatch) {
            const width = parseInt(sizeMatch[1]);
            if (width < 400) {
                return false;
            }
        }
        
        return true;
    })
    .slice(0, 6);


  const rawTags = post.category ? post.category.map(c => c.term) : [];
  const tags = cleanTags(rawTags);

  const appKeywords = ['app', 'apps', 'application', 'tool', 'tools', 'utility', 'utilities', 'software', 'pwa', 'saas'];
  const isApp = tags.some(t => t && appKeywords.includes(t.toLowerCase()));
  const itemType = isApp ? 'App' : 'Game'; 

  const publishedDate = post.published?.$t || post.published || null;
  const lastUpdated = post.updated?.$t || post.updated || null;

    // ✅ Sort social links - Developer and Official Website first
if (socialLinks.length > 0) {
    const priorityOrder = {
        'Developer': 1,
        'Official Website': 2,
        'Itch.io': 3,
        'Patreon': 4,
        'Ko-Fi': 5,
        'Indiegogo': 6,
        'Discord': 7,
        'YouTube': 8,
        'Twitter': 9,
        'uTip': 10,
        'Email': 11,
        'Soundtrack': 12,
        'Website': 99
    };
    
    socialLinks.sort((a, b) => {
        const orderA = priorityOrder[a.label] || 50;
        const orderB = priorityOrder[b.label] || 50;
        return orderA - orderB;
    });
}

// ✅ ADD: Fallback license detection from tags if not explicitly set
if (license === 'Free' && tags.length > 0) {
    const lowerTags = tags.map(t => t.toLowerCase());
    if (lowerTags.includes('paid') || lowerTags.includes('premium')) {
        license = 'Paid';
    } else if (lowerTags.includes('trial') || lowerTags.includes('demo')) {
        license = 'Demo';
    } else if (lowerTags.includes('open source')) {
        license = 'Open Source';
    }
}

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
    version,
    features,
    requirements, 
    controls,
    howItWorks,
    socialLinks,
    contentWarnings,
    ageRating, // ✅ NEW
    license,
    tag: tags[0] || 'Game', 
    size,
    tags, 
    description: truncateDescription(fullDescription, 150),
    fullDescription: fullDescription,
    metaDescription: metaDescription,
    publishedDate: publishedDate,
    lastUpdated: lastUpdated
  };
}



function getBackupGames(limit) {
    if (!BACKUP_DATA?.feed?.entry) return [];
    return BACKUP_DATA.feed.entry
        .slice(0, limit)
        .map(post => safeNormalizePost(post))
        .filter(g => g !== null);
}

export async function fetchGames(limit = 500) {
  try {
    const timestamp = Date.now();
    
    // ✅ FIX: Determine Base URL for Server-Side Fetches
    let baseUrl = '';
    if (typeof window === 'undefined') {
      // Server-side: Use Netlify env var or localhost
      // Note: Netlify sets URL to the deployment URL (e.g. https://rubies...app)
      baseUrl = process.env.URL || 'http://localhost:3000';
    }
    
    // Construct absolute URL
    const url = `${baseUrl}/api/games?limit=${limit}&_t=${timestamp}`;

    console.log(`🌐 Fetching from: ${url}`); // Debug Log

    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!res.ok) {
        console.warn(`⚠️ API Error (${res.status}). Using Snapshot.`);
        return getBackupGames(limit);
    }
    
    const data = await res.json();
    if (!data.feed || !data.feed.entry) {
        console.warn('⚠️ API returned no data. Using Snapshot.');
        return getBackupGames(limit);
    }
    
    // ✅ DEBUG: Log what we actually got
    
    const games = data.feed.entry.map(post => safeNormalizePost(post));
    return games;

  } catch (error) { 
    console.warn("⚠️ Network Unreachable. Using Snapshot.", error.message);
    return getBackupGames(limit);
  }
}

export async function fetchGameById(id) {
    
    // ✅ STEP 1: Define Match Logic
    const findMatch = (list) => {
        return list.find(g => 
            g.id === id ||                   
            g.slug === id ||                 
            g.slug.endsWith(`-${id}`)
        );
    };

    // ✅ STEP 2: TRY LIVE DATA FIRST (The Fix)
    // We call fetchGames() which hits your /api/games route.
    // Your API route is already configured to merge Live + Snapshot.
    try {
        const freshGames = await fetchGames(500); 
        const game = findMatch(freshGames);
        
        if (game) {
            return game; // ✅ Returns fresh data (new links/text)
        }
        
        console.warn(`⚠️ Game ${id} not found in live feed.`);
        
    } catch (error) {
        console.error('❌ Live fetch failed, attempting fallback:', error.message);
    }
    
    // ✅ STEP 3: FALLBACK TO SNAPSHOT (Only if live failed)
    const backupGames = getBackupGames(500);
    const backupGame = findMatch(backupGames);
    
    if (backupGame) {
        console.log(`⚠️ Serving ${id} from Snapshot (Stale).`);
        return backupGame;
    }
    
    return null;
}