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
  if (lowerTags.includes("demo")) return { text: "Demo / Trial", color: "text-yellow-400" };
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
  const isApp = lowerTags.some(t => ['app', 'pwa', 'tool', 'utility', 'software'].includes(t.toLowerCase()));
  
  if (isApp) {
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

/**
 * Get display label for download platform
 * Provides consistent "View on", "Get on", "Get for" labeling
 * Used ONLY for multi-platform downloads
 * @param {string} platform - Platform name from blogger.js
 * @returns {string} - User-friendly label
 */
export const getDownloadLabel = (platform) => {
  if (!platform) return 'Download';
  
  const lower = platform.toLowerCase();
  
  // PC Game Stores - "View on"
  if (lower === 'steam') return 'View on Steam';
  if (lower === 'itch.io') return 'View on Itch.io';
  if (lower === 'gog') return 'View on GOG';
  if (lower === 'epic games') return 'View on Epic Games';
  if (lower === 'game jolt') return 'View on Game Jolt';
  if (lower === 'humble bundle') return 'View on Humble Bundle';
  if (lower === 'game jolt') return 'View on Game Jolt';
  
  // Mobile/Desktop App Stores - "Get on/in"
  if (lower === 'google play') return 'Get on Google Play';
  if (lower === 'app store') return 'Download on App Store';
  if (lower === 'microsoft store') return 'Get in Microsoft Store';
  
  // Direct Downloads - "Get for"
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
  
  // Web
  if (lower === 'web') return 'Play Online';
  
  // Generic fallback
  if (lower === 'download') return 'Download';
  
  // Unknown platform - show as-is with "Get for" prefix
  return `Get for ${platform}`;
};