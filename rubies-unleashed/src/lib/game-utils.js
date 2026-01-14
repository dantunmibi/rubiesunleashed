import { Monitor, Smartphone, Globe, Laptop, Download, MessageCircle, Mail, Coffee, Music, ExternalLink } from "lucide-react";

// --- 1. SMART TAG PRIORITY SYSTEM ---
const GENRE_PRIORITY = [
  "App", "PWA", "Tool", "Utility", "Software",
  "Action", "RPG", "Strategy", "Simulation", "Adventure",
  "Puzzle", "Horror", "Sci-Fi", "Visual Novel", "Shooter",
  "Platformer", "Survival", "Cyberpunk", "Pixel Art"
];

export const getSmartTag = (tags) => {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return "Item";
  const bestTag = tags.find(t => GENRE_PRIORITY.includes(t));
  return bestTag || tags[0];
};

/**
 * 🛠️ UTILITY: Detect if item is an App/Tool vs a Game
 * Shared between UI (Icons) and SEO (Schema.org)
 */
export const isApp = (tags) => {
  if (!tags || !Array.isArray(tags)) return false;
  return tags.some(t => ['app', 'pwa', 'tool', 'utility', 'software'].includes(t.toLowerCase()));
};

// --- 2. VISUAL COLOR MAPPING ---
const TAG_STYLES = {
  "App": "text-sky-300 bg-sky-900/20 border-sky-500/30",
  "PWA": "text-sky-300 bg-sky-900/20 border-sky-500/30",
  "Tool": "text-slate-300 bg-slate-800 border-slate-500/30",
  "Utility": "text-slate-300 bg-slate-800 border-slate-500/30",
  "Horror": "text-red-400 bg-red-900/20 border-red-500/30",
  "Action": "text-orange-400 bg-orange-900/20 border-orange-500/30",
  "RPG": "text-purple-400 bg-purple-900/20 border-purple-500/30",
  "Sci-Fi": "text-cyan-400 bg-cyan-900/20 border-cyan-500/30",
  "Cyberpunk": "text-pink-400 bg-pink-900/20 border-pink-500/30",
  "Strategy": "text-blue-400 bg-blue-900/20 border-blue-500/30",
  "Simulation": "text-emerald-400 bg-emerald-900/20 border-emerald-500/30",
  "Adventure": "text-amber-300 bg-amber-900/20 border-amber-500/30",
  "Puzzle": "text-teal-300 bg-teal-900/20 border-teal-500/30",
  "Shooter": "text-orange-300 bg-orange-900/20 border-orange-500/30",
  "Platformer": "text-indigo-300 bg-indigo-900/20 border-indigo-500/30",
  "Survival": "text-stone-300 bg-stone-800 border-stone-500/40",
  "Pixel Art": "text-violet-300 bg-violet-900/20 border-violet-500/30",
  "Visual Novel": "text-fuchsia-300 bg-fuchsia-900/20 border-fuchsia-500/30",
  "Cozy": "text-lime-300 bg-lime-900/20 border-lime-500/30",
  "Featured": "text-white bg-ruby/20 border-ruby/50 shadow-[0_0_10px_rgba(224,17,95,0.3)]",
  "DEFAULT": "text-slate-300 bg-white/5 border-white/10 hover:bg-white/10"
};

export const getTagStyle = (tag) => {
  const key = Object.keys(TAG_STYLES).find(k => k.toLowerCase() === tag?.toLowerCase());
  return TAG_STYLES[key] || TAG_STYLES["DEFAULT"];
};

export const getLicenseType = (tags) => {
  if (!tags || !Array.isArray(tags)) return { text: "Free", color: "text-ruby-light" };
  const lowerTags = tags.map((t) => t.toLowerCase());
  if (lowerTags.includes("trial")) return { text: "Trial", color: "text-yellow-400" };
  if (lowerTags.includes("paid") || lowerTags.includes("premium")) return { text: "Commercial", color: "text-blue-400" };
  return { text: "Free", color: "text-ruby-light" };
};

// ✅ FINAL FIXED VERSION
export const getPlatformInfo = (game, tags) => {
  const safeTags = Array.isArray(tags) ? tags : [];
  
  // Check buildPlatform first (must exist and not be empty)
  if (game && game.buildPlatform && game.buildPlatform.trim().length > 0) {
    const build = game.buildPlatform.toLowerCase();
    
    // Multi-platform detection
    const isWin = build.includes("win") || build.includes("pc");
    const isMac = build.includes("mac") || build.includes("apple");
    const isLinux = build.includes("linux");
    const isAndroid = build.includes("android") || build.includes("apk");
    const isiOS = build.includes("ios");
    const isWeb = build.includes("web") || build.includes("browser");
    
    // Count how many platforms
    const platformCount = [isWin, isMac, isLinux, isAndroid, isiOS, isWeb].filter(Boolean).length;
    
    // If multiple platforms (3+), show "Multi-Platform"
    if (platformCount >= 3) {
      return { name: "Multi-Platform", icon: <Globe size={20} />, ver: "Various" };
    }
    
    // Specific platform returns
    if (isWin && isMac) return { name: "PC / Mac", icon: <Monitor size={20} />, ver: "Multi" };
    if (isWin && isLinux) return { name: "PC / Linux", icon: <Monitor size={20} />, ver: "Multi" };
    if (isMac && isLinux) return { name: "Mac / Linux", icon: <Monitor size={20} />, ver: "Multi" };
    if (isAndroid && isWeb) return { name: "Android / Web", icon: <Smartphone size={20} />, ver: "Multi" };
    if (isWin) return { name: "Windows", icon: <Monitor size={20} />, ver: "10/11" };
    if (isMac) return { name: "Mac", icon: <Laptop size={20} />, ver: "Latest" };
    if (isLinux) return { name: "Linux", icon: <Monitor size={20} />, ver: "Latest" };
    if (isAndroid) return { name: "Android", icon: <Smartphone size={20} />, ver: "8.0+" };
    if (isiOS) return { name: "iOS", icon: <Smartphone size={20} />, ver: "Latest" };
    if (isWeb) return { name: "Web Browser", icon: <Globe size={20} />, ver: "Any" };
    
    // If buildPlatform exists but doesn't match any keywords
    return { name: game.buildPlatform, icon: <Monitor size={20} />, ver: "Multi" };
  }
  
  // Fallback to tags when buildPlatform is null/empty
  const lowerTags = safeTags.map((t) => t.toLowerCase());
  
  if (lowerTags.includes("mac") || lowerTags.includes("osx")) {
    return { name: "Mac", icon: <Laptop size={20} />, ver: "Latest" };
  }
  if (lowerTags.includes("pc") || lowerTags.includes("windows")) {
    return { name: "Windows", icon: <Monitor size={20} />, ver: "10/11" };
  }
  if (lowerTags.includes("linux")) {
    return { name: "Linux", icon: <Monitor size={20} />, ver: "Latest" };
  }
  if (lowerTags.includes("android") || lowerTags.includes("apk")) {
    return { name: "Android", icon: <Smartphone size={20} />, ver: "8.0+" };
  }
  if (lowerTags.includes("ios")) {
    return { name: "iOS", icon: <Smartphone size={20} />, ver: "Latest" };
  }
  if (lowerTags.includes("web") || lowerTags.includes("html5") || lowerTags.includes("browser")) {
    return { name: "Web Browser", icon: <Globe size={20} />, ver: "Any" };
  }
  
  // Check if it's an app (apps are often cross-platform)
  if (isApp(safeTags)) {
    return { name: "Cross-Platform", icon: <Globe size={20} />, ver: "Any" };
  }
  
  // ✅ OPTION A: Conservative fallback for unknown platforms
  return { name: "Platform TBA", icon: <Monitor size={20} />, ver: "Check Description" };
};

export const getDownloadIcon = (platform) => {
  const lower = platform ? platform.toLowerCase() : "";
  if (lower.includes("android")) return <Smartphone size={18} />;
  if (lower.includes("mac") || lower.includes("apple") || lower.includes("osx")) return <Laptop size={18} />;
  if (lower.includes("windows") || lower.includes("pc")) return <Monitor size={18} />;
  if (lower.includes("web") || lower.includes("browser")) return <Globe size={18} />;
  return <Download size={18} />;
};

export const getSocialIcon = (label) => {
  const lower = label.toLowerCase();
  if (lower.includes("discord")) return <MessageCircle size={16} />;
  if (lower.includes("mail") || lower.includes("contact")) return <Mail size={16} />;
  if (lower.includes("ko-fi") || lower.includes("patreon")) return <Coffee size={16} />;
  if (lower.includes("soundtrack") || lower.includes("music")) return <Music size={16} />;
  if (lower.includes("website") || lower.includes("itch")) return <Globe size={16} />;
  return <ExternalLink size={16} />;
};

export const getDownloadLabel = (platform, tags = [], url = '') => {
  if (!platform) return 'Download';
  
  const lower = platform.toLowerCase();
  const urlLower = url.toLowerCase();
  
  // ✅ URL-BASED DETECTION (Highest Priority)
  // Extension stores - UPDATED to handle both Chrome Web Store URLs
  if (urlLower.includes('chrome.google.com/webstore') || 
      urlLower.includes('chromewebstore.google.com')) {
    return 'Get Extension';
  }
  if (urlLower.includes('addons.mozilla.org')) return 'Get Extension';
  if (urlLower.includes('microsoftedge.microsoft.com/addons')) return 'Get Extension';
  
  // Game/App stores
  if (urlLower.includes('itch.io')) return 'View on Itch.io';
  if (urlLower.includes('steampowered.com') || urlLower.includes('store.steampowered')) return 'View on Steam';
  if (urlLower.includes('gog.com')) return 'View on GOG';
  if (urlLower.includes('epicgames.com')) return 'View on Epic Games';
  if (urlLower.includes('gamejolt.com')) return 'View on Game Jolt';
  if (urlLower.includes('humblebundle.com')) return 'View on Humble Bundle';
  if (urlLower.includes('play.google.com')) return 'Get on Google Play';
  if (urlLower.includes('apps.apple.com')) return 'Download on App Store';
  if (urlLower.includes('microsoft.com/store')) return 'Get in Microsoft Store';
  
  // ✅ PLATFORM-BASED DETECTION (If URL doesn't match above)
  // Extension stores (explicit platform names)
  if (lower === 'chrome web store' || lower === 'chrome webstore') return 'Get Extension';
  if (lower === 'firefox addons' || lower === 'firefox add-ons') return 'Get Extension';
  if (lower === 'edge addons' || lower === 'edge add-ons') return 'Get Extension';
  
  // Game stores
  if (lower === 'steam') return 'View on Steam';
  if (lower === 'itch.io') return 'View on Itch.io';
  if (lower === 'gog') return 'View on GOG';
  if (lower === 'epic games') return 'View on Epic Games';
  if (lower === 'game jolt') return 'View on Game Jolt';
  if (lower === 'humble bundle') return 'View on Humble Bundle';
  
  // App stores
  if (lower === 'google play') return 'Get on Google Play';
  if (lower === 'app store') return 'Download on App Store';
  if (lower === 'microsoft store') return 'Get in Microsoft Store';
  
  // Direct downloads
  if (lower === 'windows') return 'Get for Windows';
  if (lower === 'mac') return 'Get for Mac';
  if (lower === 'linux') return 'Get for Linux';
  if (lower === 'android') return 'Get for Android';
  if (lower === 'ios') return 'Get for iOS';
  if (lower === 'steamos') return 'Get for SteamOS';
  if (lower === 'chromeos') return 'Get for ChromeOS';
  
  // Consoles
  if (lower === 'nintendo switch' || lower === 'switch') return 'Get for Switch';
  if (lower === 'xbox') return 'Get for Xbox';
  if (lower === 'playstation') return 'Get for PlayStation';
  
  // ✅ WEB PLATFORM (Generic "Web" label - context-aware)
  if (lower === 'web' || lower === 'html5' || lower === 'browser' || lower === 'website') {
    const tagString = Array.isArray(tags) ? tags.join(' ').toLowerCase() : '';
    
    // Check if tags mention it's an extension (for landing pages)
    const isExtensionProject = tagString.includes('extension') || 
                               tagString.includes('chrome extension') ||
                               tagString.includes('browser extension');
    
    // ✅ Extension landing page (not the store itself)
    if (isExtensionProject) return 'Visit Site';
    
    // Check if it's a general app/tool
    const appKeywords = ['app', 'apps', 'tool', 'utility', 'software', 'pwa', 'webapp'];
    const isWebApp = appKeywords.some(keyword => tagString.includes(keyword));
    
    if (isWebApp) return 'Visit Site';
    
    // Default to game
    return 'Play Online';
  }
  
  // Generic fallback
  if (lower === 'download') return 'Download';
  
  // Unknown platform
  return `Get for ${platform}`;
};

// --- PHASE 4: SUPABASE ADAPTERS ---

/**
 * Determine if project is Game or App based on tags
 */
function determineType(tags = []) {
  const appTags = ['Utility', 'Tool', 'Productivity', 'Development', 'Software', 'App'];
  const hasAppTag = tags.some(tag => appTags.includes(tag));
  return hasAppTag ? 'App' : 'Game';
}

/**
 * Generate unique slug from title
 * @param {string} title - Project title
 * @returns {string} URL-safe slug
 */
export function generateSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Add short random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

/**
 * Process Supabase project row into standard Game Object
 * @param {Object} row - Database row from projects table
 * @returns {Object} Normalized game object
 */
export function processSupabaseProject(row) {
  if (!row) return null;
  
  try {
    // Parse JSONB fields (Handle potential stringified JSON or native object)
    const downloadLinks = typeof row.download_links === 'string' 
      ? JSON.parse(row.download_links) 
      : (row.download_links || []);
    
    const socialLinks = typeof row.social_links === 'string'
      ? JSON.parse(row.social_links)
      : (row.social_links || []);

// ✅ FIXED: Process content warnings properly (handles empty strings)
let contentWarnings = [];

if (row.content_warning && typeof row.content_warning === 'string' && row.content_warning.trim().length > 0) {
  // Only process if there's actual content (not just whitespace or empty string)
  contentWarnings = row.content_warning
    .split(/[,\n\r•\-]/) // Split by common delimiters
    .map(warning => warning.trim())
    .filter(warning => warning.length > 0); // Remove empty strings after split
}

// If still empty after processing, set to null instead of empty array
const finalWarnings = contentWarnings.length > 0 ? contentWarnings : null;
      
    // Determine primary download URL (Priority: Cache -> First Link)
    const primaryDownload = row.download_url || (downloadLinks.length > 0 ? downloadLinks[0].url : null);
    
    // Normalize Tags
    const tags = Array.isArray(row.tags) ? row.tags : [];
    
    return {
      // Identity
      id: row.id,
      slug: row.slug,
      source: 'supabase',
      
      // Content
      title: row.title,
      description: row.description || '',
      fullDescription: row.full_description || row.description || '',
      image: row.cover_url || '/placeholder-game.png',
      images: row.screenshots || [], // Legacy compatibility
      screenshots: row.screenshots || [], // ✅ For GameMedia component
      videoUrl: row.video_url,
      video: row.video_url, // ✅ Legacy compatibility
      html5_embed_url: row.html5_embed_url,
      
      // Distribution
      downloadLinks: downloadLinks.length > 0 
        ? downloadLinks 
        : (primaryDownload ? [{ platform: row.platform || 'Unknown', url: primaryDownload }] : []),
      downloadUrl: primaryDownload,
      platforms: row.platform ? [row.platform] : [], // Legacy compat
      buildPlatform: row.platform || 'Multi-Platform', // For getPlatformInfo
      version: row.version || '1.0',
      
      // Metadata
      tags: tags,
      type: determineType(tags),
      features: row.features || [],
      requirements: row.requirements || [],
      controls: row.controls || [],
      developer: row.developer || 'Unknown',
      developerUrl: row.uploader_username 
        ? `/${row.uploader_username}/projects` 
        : `/user/${row.user_id}`,
      socialLinks: socialLinks,
      
      // ✅ ADD: Content warnings mapped correctly
      contentWarnings: finalWarnings, // Now an array like Blogger posts
      
      // ✅ ADD: Safety & Ratings (for completeness)
      ageRating: row.age_rating || 'All Ages',
      size: row.size || null,
      
      // State
      status: row.status || 'published', // View doesn't return status, implied published
      original_blogger_id: row.original_blogger_id,
      
      // Timestamps
      publishedDate: row.created_at,
      lastUpdated: row.updated_at,
      
      // Ownership
      userId: row.user_id
    };
    
  } catch (error) {
    console.error('processSupabaseProject error:', error, row);
    return null;
  }
}

// ============================================
// PROJECT STATUS SYSTEM
// ============================================

/**
 * Available project statuses for The Forge
 * Used in project editor dropdown
 */
export const PROJECT_STATUSES = [
  { 
    value: 'stable', 
    label: 'Stable Release', 
    tag: null,
    description: 'Production-ready, fully tested'
  },
  { 
    value: 'beta', 
    label: 'Beta', 
    tag: 'Beta',
    description: 'Feature-complete but testing'
  },
  { 
    value: 'early_access', 
    label: 'Early Access', 
    tag: 'Early Access',
    description: 'Playable, actively developing'
  },
  { 
    value: 'alpha', 
    label: 'Alpha', 
    tag: 'Alpha',
    description: 'Very early, experimental'
  },
];

/**
 * Detect current project status from tags array
 * @param {string[]} tags - Project tags
 * @returns {string} Status value ('stable', 'beta', etc.)
 */
export function detectProjectStatus(tags) {
  if (!tags || !Array.isArray(tags)) return 'stable';
  
  const tagString = tags.join(' ').toLowerCase();
  
  if (tagString.includes('alpha')) return 'alpha';
  if (tagString.includes('early access')) return 'early_access';
  if (tagString.includes('beta')) return 'beta';
  if (tagString.includes('demo')) return 'demo';
  
  return 'stable';
}

/**
 * Get beta badge info from tags (for display)
 * @param {string[]} tags - Project tags
 * @returns {object|null} Badge info or null
 */
export function getBetaBadge(tags) {
  if (!tags || !Array.isArray(tags)) return null;
  
  const tagString = tags.join(' ').toLowerCase();
  
  if (tagString.includes('alpha')) {
    return { label: 'Alpha', color: 'amber', icon: 'zap' };
  }
  if (tagString.includes('early access')) {
    return { label: 'Early Access', color: 'amber', icon: 'zap' };
  }
  if (tagString.includes('beta')) {
    return { label: 'Beta', color: 'amber', icon: 'zap' };
  }
  
  return null;
}

/**
 * Inject status tag into tags array (remove old status tags first)
 * @param {string[]} currentTags - Existing tags
 * @param {string} newStatus - New status value ('beta', 'stable', etc.)
 * @returns {string[]} Updated tags array
 */
export function injectStatusTag(currentTags, newStatus) {
  const STATUS_TAGS = ['Beta', 'Early Access', 'Alpha', 'Demo'];
  
  // Remove all existing status tags
  let cleanedTags = (currentTags || []).filter(tag => 
    !STATUS_TAGS.includes(tag)
  );
  
  // Find new status tag to add
  const statusConfig = PROJECT_STATUSES.find(s => s.value === newStatus);
  
  // Add new status tag (if not stable)
  if (statusConfig && statusConfig.tag) {
    cleanedTags.push(statusConfig.tag);
  }
  
  return cleanedTags;
}