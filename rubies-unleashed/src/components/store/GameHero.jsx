"use client";

import Link from "next/link";
import { 
  ArrowLeft, Download, Gamepad2, Heart, Box, Share2, 
  ShieldCheck, Calendar, User, Gem, Info, Zap
} from "lucide-react";
import { getDownloadIcon, getDownloadLabel } from "@/lib/game-utils";
import { getGameTheme } from "@/lib/theme-utils";
import { useState, useEffect } from "react";
import ExternalLinkWarning from "@/components/ui/ExternalLinkWarning";
import { getBetaBadge } from "@/lib/game-utils";

/**
 * GameHero Component
 * 
 * Cinematic hero section for game/app detail pages
 * Features:
 * - Adaptive blurred background based on cover art
 * - Platform-aware download buttons (detects stores, web games, direct downloads)
 * - Mobile floating action bar with intelligent scrolling behavior
 * - Desktop/Mobile layout adaptation
 * - Wishlist & Share functionality with fallback mechanisms
 * - External link warning for downloads
 */

export default function GameHero({ game, isWishlisted, onToggleWishlist }) {
  const [copied, setCopied] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(true);
  const [warningUrl, setWarningUrl] = useState(null); // ✅ Add warning state

  // Safety Checks
  if (!game) return null;

  // --- 🎨 THEME ENGINE (New) ---
  const theme = getGameTheme(game.type);

  const isApp = game.type === 'App' || game.tags?.some(t => ['App', 'Apps', 'Tool', 'Software'].includes(t));
  // ✅ UPDATED: Smart content detection (same as DownloadCallout)
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

  // Scroll Listener for Floating Bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowFloatingBar(false);
      } else {
        setShowFloatingBar(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ ROBUST SHARE FUNCTION (Works on HTTP/Local Network)
  const handleShare = async () => {
    try {
      const url = window.location.href;
      
      if (navigator.share) {
        await navigator.share({ title: game.title, url: url });
        return;
      }
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        triggerCopyFeedback();
        return;
      }

      throw new Error("Clipboard API unavailable");

    } catch (err) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        triggerCopyFeedback();
      } catch (fallbackErr) {
        console.error("Share failed completely:", fallbackErr);
        alert("Could not copy link. Manually copy the URL from browser.");
      }
    }
  };

  const triggerCopyFeedback = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScrollToContent = () => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' });
    }
  };

  const handleScrollToDownloads = () => {
    const downloadSection = document.getElementById('download-section');
    if (downloadSection) {
        downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

// ✅ UNIFIED BUTTON LABEL LOGIC - Delegates to game-utils.js
const getButtonLabel = () => {
  const primaryLink = game.downloadLinks?.[0] || { 
    platform: 'Download', 
    url: game.downloadUrl || '#' 
  };
  
  return getDownloadLabel(
    primaryLink.platform, 
    game.tags, 
    primaryLink.url
  ).toUpperCase();
};

const betaBadge = getBetaBadge(game.tags);

  return (
    <>
      <div className="relative w-full overflow-hidden bg-[#0b0f19]">
        
        {/* 1. Cinematic Background Layer */}
        <div className="absolute inset-0 h-full">
          <div 
            className="absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-50 md:opacity-40" 
            style={{ backgroundImage: `url(${game.image})` }} 
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0b0f19]/60 via-[#0b0f19]/90 to-[#0b0f19]" />
        </div>

        {/* 2. Top Navigation (Mobile Only) */}
        <div className="relative z-30 pt-10 px-4 flex items-center justify-between md:hidden">
          <Link 
            href="/explore"
            className="p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 transition-all shadow-xl"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex gap-3">
             <button 
               onClick={handleShare}
               className="relative p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 transition-all shadow-xl"
             >
               <Share2 size={20} />
               {copied && (
                  <span className={`absolute top-full right-0 mt-2 text-[10px] font-bold ${theme.bg} text-white px-3 py-1.5 rounded-lg whitespace-nowrap animate-in fade-in slide-in-from-top-1 shadow-xl z-50 border border-white/10`}>
                      Link copied to clipboard
                  </span>
               )}
             </button>
             <button 
               onClick={onToggleWishlist}
               className={`p-3 rounded-full border backdrop-blur-xl transition-all shadow-xl ${
                 isWishlisted ? `${theme.bg} ${theme.border} text-white` : 'bg-black/40 border-white/10 text-white'
               }`}
             >
               <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
             </button>
          </div>
        </div>

        {/* 3. Desktop Back Button (Hidden on Mobile) */}
        <div className="hidden md:block absolute top-24 left-8 z-30">
            <Link 
              href="/explore" 
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 ${theme.borderHover} hover:bg-black/60 transition-all hover:-translate-x-1 shadow-lg shadow-black/20`}
            >
              <ArrowLeft size={18} className={`text-slate-300 ${theme.text.replace('text-', 'group-hover:text-')} transition-colors`} />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-widest">
                  Back to Vault
              </span>
            </Link>
        </div>

        {/* 4. Hero Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 pt-8 md:pt-40 md:pb-7 flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left h-full md:min-h-[75vh]">
            
            {/* Floating Poster Card */}
            <div className="w-48 h-64 md:w-64 md:h-84 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 transform -rotate-2 md:rotate-0 hover:rotate-0 transition-transform duration-500 bg-[#161b2c] shrink-0 relative z-10 group">
                <img src={game.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={game.title} />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="flex-1 space-y-4 md:mb-4">
{/* Tag Pills */}
<div className="flex flex-wrap justify-center md:justify-start gap-2">
  {/* Main Type Badge */}
  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.bgLight} ${theme.border} ${theme.text} text-[10px] font-black uppercase tracking-widest shadow-lg shadow-ruby/10`}>
    <Gem size={12} /> {game.tag || (isApp ? "App" : "Game")}
  </div>

  {/* ✅ NEW: Beta Badge */}
  {betaBadge && (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest shadow-lg">
      <Zap size={12} /> {betaBadge.label}
    </div>
  )}
  
  {/* ✅ NEW: Project Type Badges */}
  {(() => {
    const hasDownloads = game.downloadLinks && game.downloadLinks.length > 0 && game.downloadLinks[0].url;
    const hasVideo = game.videoUrl;
    const hasScreenshots = game.screenshots && game.screenshots.length > 0;
    
    // Show badge only for non-downloadable projects
    if (!hasDownloads && hasVideo) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest shadow-lg">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
          </svg>
          DEMO
        </div>
      );
    }
    
    if (!hasDownloads && !hasVideo && hasScreenshots) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-widest shadow-lg">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          SHOWCASE
        </div>
      );
    }
    
    return null;
  })()}
</div>
                
                <h1 className="text-4xl md:text-7xl font-black text-white leading-none uppercase tracking-tighter drop-shadow-2xl">
                    {game.title}
                </h1>

{/* Metadata Row */}
<div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
    {game.developer && (
        <div className="flex items-center gap-2">
          <User size={14} className={theme.text} /> 
          {/* ✅ UPDATED: Developer name links to projects */}
          {game.developerUrl ? (
            <Link 
              href={game.developerUrl}
              className="hover:text-white transition-colors underline decoration-ruby/30 underline-offset-2"
            >
              {game.developer}
            </Link>
          ) : (
            <span>{game.developer}</span>
          )}
        </div>
    )}
    {game.updated && (
        <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-400" /> {game.updated}</div>
    )}
    
    {/* ✅ UPDATED: Only show verified for Supabase projects */}
    {game.source === 'supabase' && (
      <div className="flex items-center gap-2">
        <ShieldCheck size={14} className="text-emerald-500" /> Verified
      </div>
    )}
</div>

{/* DESKTOP ACTIONS (Hidden on Mobile) */}
<div className="hidden md:flex flex-wrap items-center gap-4 pt-6">
  {/* ✅ PRIORITY 1: Multiple Downloads */}
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
  ) 
  
  /* ✅ PRIORITY 2: Single Download */
  : hasDownloads ? (
    <button
      onClick={(e) => handleDownloadClick(e, playButtonLink)}
      className={`w-full md:w-auto ${theme.bg} hover:brightness-110 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-105 ${theme.glow} cursor-pointer`}
    >
      {isApp ? <Box size={20} className="text-white" /> : <Gamepad2 size={20} className="text-white" />}
      {getButtonLabel()}
    </button>
  )
  
  /* ✅ PRIORITY 3: Video Demo */
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
  
  /* ✅ PRIORITY 4: Screenshots */
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
  
  /* ✅ PRIORITY 5: Unavailable (Fallback) */
  : (
    <button 
      disabled 
      className="w-full md:w-auto bg-slate-700 text-slate-400 px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed"
    >
      <Box size={20} />
      PROJECT DETAILS
    </button>
  )}
  
  {/* Wishlist and Share buttons remain the same */}
  <button 
    onClick={onToggleWishlist} 
    className={`p-4 rounded-2xl border-2 font-bold transition-all ${isWishlisted ? `bg-white ${theme.text} border-white shadow-lg` : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white"}`}
  >
    <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
  </button>
  
  <button 
    onClick={handleShare}
    className="p-4 rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all relative group"
  >
    <Share2 size={20} />
    {copied && (
      <span className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-[10px] font-bold ${theme.bg} text-white px-3 py-1 rounded-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-1`}>
        Link copied
      </span>
    )}
  </button>
</div>
            </div>
        </div>

{/* 5. MOBILE FLOATING ACTION BAR (Fixed Bottom) */}
<div className={`fixed bottom-10 left-0 right-0 z-30 p-4 md:hidden transition-transform duration-500 ${showFloatingBar ? 'translate-y-0' : 'translate-y-[150%]'}`}>
  <div className="bg-[#161b2c]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-2xl flex items-center gap-3">
    
    {/* ✅ UPDATED: Smart mobile CTA */}
    {hasDownloads && hasMultipleBuilds ? (
      <button 
        onClick={handleScrollToDownloads}
        className="flex-1 bg-white text-black py-3.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
      >
        <Download size={18} /> Downloads
      </button>
    ) : hasDownloads ? (
      <button
        onClick={(e) => handleDownloadClick(e, playButtonLink)}
        className="flex-1 bg-white text-black py-3.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg cursor-pointer"
      >
        {isApp ? <Box size={18} /> : <Gamepad2 size={18} />} 
        {getButtonLabel()}
      </button>
    ) : hasVideo ? (
      <a
        href={game.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
        </svg>
        WATCH DEMO
      </a>
    ) : hasScreenshots ? (
      <button
onClick={() => {
  const screenshotsSection = document.querySelector('#screenshots-section');
  if (screenshotsSection) {
    screenshotsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}}
        className="flex-1 bg-purple-600 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
      >
<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
        GALLERY
      </button>
    ) : (
      <button 
        disabled 
        className="flex-1 bg-slate-800 text-slate-500 py-3.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed"
      >
        <Box size={18} />
        DETAILS
      </button>
    )}

    <button 
      onClick={handleScrollToContent}
      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white active:bg-white/10 transition-colors"
    >
      <Info size={20} />
    </button>
  </div>
</div>

      </div>

      {/* ✅ Add External Link Warning Modal */}
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