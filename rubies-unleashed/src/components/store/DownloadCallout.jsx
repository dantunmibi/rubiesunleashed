'use client';

import { useState } from 'react'; // ✅ Add useState
import { Gamepad2, Box } from "lucide-react";
import { getDownloadIcon, getDownloadLabel } from "@/lib/game-utils";
import { getGameTheme } from "@/lib/theme-utils";
import ExternalLinkWarning from "@/components/ui/ExternalLinkWarning"; // ✅ Add import

export default function DownloadCallout({ game }) {
  // ✅ Add state for warning modal
  const [warningUrl, setWarningUrl] = useState(null);
  
  // --- 🎨 THEME ENGINE ---
  const theme = getGameTheme(game.type);

  // Existing logic preserved
const isApp = game.type === 'App' || game.tags?.some(t => ['App', 'Apps', 'Tool'].includes(t));
console.log('🔍 Debug:', { 
  gameType: game.type, 
  tags: game.tags, 
  isApp: isApp,
  title: game.title 
});
  
// ✅ UPDATED: Smart content detection
const hasDownloads = game.downloadLinks && game.downloadLinks.length > 0 && game.downloadLinks[0].url;
const hasVideo = game.videoUrl;
const hasScreenshots = game.screenshots && game.screenshots.length > 0;
const hasMultipleBuilds = game.downloadLinks && game.downloadLinks.length > 1;

// Legacy support
const hasValidDownload = hasDownloads || (game.downloadUrl && game.downloadUrl !== "#");
const playButtonLink = game.downloadLinks && game.downloadLinks.length > 0 ? game.downloadLinks[0].url : "#";

  // ✅ Add download handler with warning logic
// ✅ UPDATED: More restrictive trusted domain logic
const handleDownloadClick = (e, url) => {
  e.preventDefault();
  
  if (!url || url === "#") return;
  
  // Only MAJOR OFFICIAL STORES are trusted (no user-generated content platforms)
  const trustedDomains = [
    'steam.com',
    'steampowered.com',
    'microsoft.com',           // Microsoft Store
    'apple.com',              // App Store
    'apps.apple.com',         // App Store
    'google.com',             // Google Play
    'play.google.com',        // Google Play
    'epicgames.com',          // Epic Games Store
    'gog.com',                // GOG (curated)
  ];
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    
    // Check for direct file downloads (always warn)
    const fileExtensions = ['.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.apk', '.ipa', '.zip', '.rar', '.7z', '.tar.gz'];
    const hasFileExtension = fileExtensions.some(ext => pathname.endsWith(ext));
    
    if (hasFileExtension) {
      // Direct file download - always show warning
      setWarningUrl(url);
      return;
    }
    
    // Check if it's a trusted official store
    const isTrusted = trustedDomains.some(trusted => 
      domain === trusted || domain.endsWith(`.${trusted}`)
    );
    
    if (isTrusted) {
      // Official store - open directly
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Everything else (including itch.io, GitHub releases, etc.) - show warning
      setWarningUrl(url);
    }
  } catch (error) {
    // Invalid URL - show warning
    setWarningUrl(url);
  }
};
  // ✅ Add confirm/cancel handlers
  const confirmDownload = () => {
    if (warningUrl) {
      window.open(warningUrl, '_blank', 'noopener,noreferrer');
      setWarningUrl(null);
    }
  };

  const cancelDownload = () => {
    setWarningUrl(null);
  };

return (
  <>
    <section id="download-section" className={`bg-[#161b2c] border border-white/5 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 scroll-mt-32 ${theme.isApp ? "hover:border-cyan-500/20" : "hover:border-ruby/20"} transition-colors`}>
      <div>
        <h4 className="text-xl font-bold text-white mb-1">Ready to dive in?</h4>
        <p className="text-slate-400 text-sm">
          {hasDownloads ? "Safe, secure, and direct download via external providers." :
           hasVideo ? "Watch the demo to see it in action." :
           hasScreenshots ? "Browse screenshots and project details." :
           "View project information and details."}
        </p>
      </div>

      {/* ✅ PRIORITY 1: Download Links */}
      {hasDownloads && hasMultipleBuilds ? (
        <div className="flex flex-wrap gap-3">
          {game.downloadLinks.map((link, i) => (
            <button
              key={i} 
              onClick={(e) => handleDownloadClick(e, link.url)}
              className={`${theme.bg} hover:brightness-110 text-white px-5 py-3 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-all hover:-translate-y-1 shadow-lg cursor-pointer`}
            >
              {getDownloadIcon(link.platform)} {getDownloadLabel(link.platform, game.tags, link.url)}
            </button>
          ))}
        </div>
      ) : hasDownloads ? (
        <button
          onClick={(e) => handleDownloadClick(e, playButtonLink)}
          className={`w-full md:w-auto ${theme.bg} hover:brightness-110 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-105 ${theme.glow} cursor-pointer`}
        >
<theme.icon size={20} className="text-white" />
{getDownloadLabel(
  game.downloadLinks[0].platform, 
  game.tags, 
  game.downloadLinks[0].url
).toUpperCase()}
        </button>
      )
      
      /* ✅ PRIORITY 2: Video Demo */
      : hasVideo ? (
        <a
          href={game.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-lg shadow-blue-900/20"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
          </svg>
          WATCH DEMO
        </a>
      )
      
/* ✅ PRIORITY 3: Screenshots Gallery */
: hasScreenshots ? (
  <button
    onClick={() => {
      const screenshotsSection = document.querySelector('#screenshots-section');
      if (screenshotsSection) {
        screenshotsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }}
    className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-lg shadow-purple-900/20"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    VIEW GALLERY
  </button>
)
      
      /* ✅ PRIORITY 4: Fallback */
      : (
        <button 
          disabled 
          className="w-full md:w-auto bg-slate-700 text-slate-400 px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed"
        >
          <Box size={20} />
          PROJECT DETAILS
        </button>
      )}
    </section>

    {/* External Link Warning Modal */}
    {warningUrl && (
      <ExternalLinkWarning
        url={warningUrl}
        onConfirm={confirmDownload}
        onCancel={cancelDownload}
      />
    )}
  </>
);
}