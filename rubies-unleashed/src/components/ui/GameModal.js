/**
 * GameModal.js
 * 
 * Summary:
 * Modal overlay for quick preview.
 * UPGRADE: Uses modular theme-utils for consistent App/Game styling.
 * LOGIC: Preserves all store pattern detection and multi-download handling.
 * SECURITY: Added external link warning for downloads.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import AuthModal from "@/components/auth/AuthModal";
import ExternalLinkWarning from "@/components/ui/ExternalLinkWarning"; // ✅ Add import
import { 
  X, Heart, Download, ArrowRight, AlertTriangle, Eye, 
  User, GitBranch
} from "lucide-react";
import Link from "next/link";
import { getDownloadIcon, getDownloadLabel } from "@/lib/game-utils";
import { getGameTheme } from "@/lib/theme-utils";

export default function GameModal({ game, onClose }) {
  const { 
    isWishlisted, 
    toggleWishlist,
    showAuthModal,
    closeAuthModal,
    handleContinueAsGuest
  } = useWishlist(game?.id);
  
  const rawWarnings = game?.contentWarnings || game?.contentWarning;
  const hasWarnings = Array.isArray(rawWarnings) ? rawWarnings.length > 0 : !!rawWarnings;
  
  const [isBlurred, setIsBlurred] = useState(hasWarnings);
  const [warningUrl, setWarningUrl] = useState(null); // ✅ Add warning state

  // ✅ Add download handler with warning logic
  const handleDownloadClick = (e, url) => {
    e.preventDefault();
    
    if (!url || url === "#") return;
    
    // Only MAJOR OFFICIAL STORES are trusted
    const trustedDomains = [
      'steam.com', 'steampowered.com', 'microsoft.com', 'apple.com', 'apps.apple.com',
      'google.com', 'play.google.com', 'epicgames.com', 'gog.com'
    ];
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname.toLowerCase();
      
      // Check for direct file downloads (always warn)
      const fileExtensions = ['.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.apk', '.ipa', '.zip', '.rar', '.7z', '.tar.gz'];
      const hasFileExtension = fileExtensions.some(ext => pathname.endsWith(ext));
      
      if (hasFileExtension) {
        setWarningUrl(url);
        return;
      }
      
      // Check if it's a trusted official store
      const isTrusted = trustedDomains.some(trusted => 
        domain === trusted || domain.endsWith(`.${trusted}`)
      );
      
      if (isTrusted) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        setWarningUrl(url);
      }
    } catch (error) {
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

  useEffect(() => {
    if (!game) return;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, [game]);

  if (!game) return null;

  // --- 🎨 MODULAR THEME ENGINE ---
  const theme = getGameTheme(game.type);

  // ✅ UPDATED: Smart content detection
  const downloadLinks = Array.isArray(game.downloadLinks) ? game.downloadLinks : [];
  const hasDownloads = downloadLinks.length > 0 && downloadLinks[0].url;
  const hasVideo = game.videoUrl;
  const hasScreenshots = game.screenshots && game.screenshots.length > 0;
  const hasMultipleBuilds = downloadLinks.length > 1;

  // Legacy support
  const hasValidDownload = hasDownloads || (game.downloadUrl && game.downloadUrl !== "#");
  const primaryLink = downloadLinks.length > 0 ? downloadLinks[0] : { platform: 'Download', url: game.downloadUrl || '#' };

  const isLongTitle = game.title.length > 25;
  const desktopHeightClass = isLongTitle ? "md:h-[500px]" : "md:h-[460px]";

  return (
    <>
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-sans selection:text-white ${theme.isApp ? "selection:bg-cyan-500/30" : "selection:bg-ruby/30"}`}>
        
        {/* GLOBAL BACKDROP */}
        <div 
          className="absolute inset-0 bg-background/95 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
          onClick={onClose}
        />

        {/* MODAL FRAME */}
        <div className={`relative w-full max-w-5xl bg-surface border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300 ${desktopHeightClass} ${theme.shadow}`}>
          
          {/* THE SCANLINE (Dynamic Color) */}
          <div className={`absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent ${theme.lineGradient} to-transparent opacity-50 z-50 pointer-events-none`} />

          {/* Close Button */}
          <button 
            onClick={onClose}
            className={`absolute top-3 right-3 z-40 p-1.5 bg-background border border-white/10 ${theme.text} hover:bg-surface hover:text-white transition-all duration-300 group rounded-sm hover:border-white/30`}
          >
            <X size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
          
          {/* --- VAULT ADVISORY OVERLAY (Mature Content) --- */}
          {isBlurred && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/98 backdrop-blur-3xl p-10 text-center animate-in fade-in duration-500">
              <div className="relative mb-6">
                <div className={`absolute inset-0 blur-3xl rounded-full animate-pulse ${theme.bg.replace('bg-', 'bg-')}/30`} />
                <div className={`relative border p-6 rounded-xl bg-black ${theme.border} ${theme.glow}`}>
                  <AlertTriangle size={64} className={theme.text} />
                </div>
              </div>
              
              <h3 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight mb-2 italic">
                RESTRICTED <span className={theme.text}>ASSET</span>
              </h3>
              
              <p className={`font-bold uppercase text-xs tracking-[0.4em] mb-6 ${theme.text}`}>
                Sensitive Content Detected
              </p>

              <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed font-medium">
                This vault item contains material flagged for mature audiences or specific sensitivities. 
                Explicit details are hidden pending authorization.
              </p>
              
              <div className="flex gap-4 w-full max-w-md">
                <button 
                  onClick={() => setIsBlurred(false)}
                  className={`flex-1 ${theme.bg} text-white px-8 py-4 rounded-sm font-black uppercase tracking-widest hover:brightness-125 transition-all flex items-center justify-center gap-2 ${theme.glow} text-xs`}
                >
                  <Eye size={16} /> UNLOCK
                </button>
                <button 
                  onClick={onClose} 
                  className="flex-1 px-8 py-4 rounded-sm border border-white/10 hover:bg-white/5 text-slate-400 font-bold uppercase tracking-widest transition-all text-xs"
                >
                  EXIT
                </button>
              </div>
            </div>
          )}

          {/* --- LEFT: Cinematic Poster Section --- */}
          <div className={`hidden md:block w-[35%] h-full relative bg-black transition-all duration-700 overflow-hidden ${isBlurred ? 'blur-2xl' : ''}`}>
            <div className={`absolute inset-0 bg-linear-to-br ${theme.gradient} to-transparent mix-blend-overlay z-10`} />
            
            <img 
              src={game.image} 
              alt={game.title} 
              className="w-full h-full object-cover opacity-70 scale-105" 
            />
            
            {/* Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[20px_20px] z-20 pointer-events-none" />
          </div>

          {/* --- RIGHT: Detailed Info Section --- */}
          <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-700 ${isBlurred ? 'blur-xl opacity-20 scale-95 pointer-events-none' : ''}`}>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <header className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`flex items-center gap-1.5 px-2 py-0.5 ${theme.bgLight} ${theme.border} ${theme.text} text-[9px] font-black uppercase tracking-[0.15em] rounded-sm`}>
                     <theme.icon size={10} />
                     {theme.badge}
                  </span>
                </div>
                
                <h2 className="text-3xl sm:text-5xl font-black text-white leading-none uppercase tracking-tighter mb-3 italic">
                  {game.title}
                </h2>
                <div className={`w-full h-0.5 bg-linear-to-r ${theme.lineGradient.replace('via-', 'from-')} via-transparent to-transparent opacity-50`} />
              </header>

              <div className="space-y-6">
                <p className={`text-slate-300 text-sm leading-relaxed font-light border-l-2 pl-4 italic ${theme.border.replace('border-', 'border-')}`}>
                  {game.description ? game.description.substring(0, 350) + (game.description.length > 350 ? '...' : '') : 'No description provided.'}
                </p>
                
                {/* Technical Grid */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Developer */}
                  <div className={`p-3 bg-background border border-white/5 rounded-sm ${theme.borderHover} transition-colors`}>
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] mb-0.5">Developer</p>
                    <div className="flex items-center justify-between text-white font-bold text-[10px] uppercase tracking-wider">
                        <span className="truncate pr-2">{game.developer || "Unknown"}</span>
                        <User size={12} className={`${theme.text} shrink-0`} />
                    </div>
                  </div>

                  {/* Version */}
                  <div className={`p-3 bg-background border border-white/5 rounded-sm ${theme.borderHover} transition-colors`}>
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] mb-0.5">Build Ver</p>
                    <div className="flex items-center justify-between text-white font-bold text-[10px] uppercase tracking-wider">
                        <span>{game.version || "1.0"}</span>
                        <GitBranch size={12} className={theme.text} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- FOOTER ACTIONS --- */}
            <div className="p-6 bg-surface border-t border-white/5 z-20 mt-auto">
              
              {/* Main Action */}
              <Link 
                href={`/view/${game.slug}`} 
                className={`group w-full ${theme.bg} text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-sm flex items-center justify-center gap-3 transition-all hover:brightness-110 active:translate-y-0.5 mb-3 text-xs shadow-lg`}
              >
                VIEW DETAILS <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

{/* Secondary Actions Row */}
<div className="flex gap-3">
  
  {/* ✅ UPDATED: Smart Download Buttons */}
  {/* PRIORITY 1: Multiple Downloads */}
  {hasDownloads && hasMultipleBuilds ? (
    <div className="flex-4 flex gap-2 overflow-x-auto no-scrollbar">
      {downloadLinks.map((link, i) => (
        <button
          key={i}
          onClick={(e) => handleDownloadClick(e, link.url)}
          className={`flex-1 bg-background border border-white/10 ${theme.borderHover} hover:bg-white/5 text-white font-bold uppercase tracking-wider py-3 px-3 flex items-center justify-center gap-2 transition-all text-[9px] whitespace-nowrap rounded-sm cursor-pointer`}
        >
          {getDownloadIcon(link.platform)} {getDownloadLabel(link.platform)}
        </button>
      ))}
    </div>
  ) 
  
  /* PRIORITY 2: Single Download */
  : hasDownloads ? (
    <button
      onClick={(e) => handleDownloadClick(e, primaryLink.url)}
      className={`flex-4 bg-background border border-white/10 ${theme.borderHover} hover:bg-white/5 text-white font-black uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-all text-[10px] rounded-sm cursor-pointer`}
    >
      <theme.icon size={14} className={theme.text} />
      {(() => {
        const platform = (primaryLink.platform || '').toLowerCase().trim();
        const url = (primaryLink.url || '').toLowerCase();
        
        // Store patterns (PRESERVED LOGIC)
        const storePatterns = {
          'steam': /steam/i,
          'itch.io': /itch\.io/i,
          'gog': /gog\.com/i,
          'epic games': /epicgames/i,
          'google play': /play\.google\.com/i,
          'app store': /apps\.apple\.com/i,
          'microsoft store': /microsoft\.com\/store/i,
          'game jolt': /gamejolt\.com/i,
          'humble bundle': /humblebundle\.com/i
        };
        
        for (const [storeName, pattern] of Object.entries(storePatterns)) {
          if (platform.includes(storeName.toLowerCase()) || pattern.test(url)) {
            return getDownloadLabel(primaryLink.platform).toUpperCase();
          }
        }
        
        if (platform === 'web' || platform.includes('html5') || platform.includes('browser')) {
          return theme.isApp ? 'VISIT SITE' : 'PLAY NOW';
        }
        
        return theme.isApp ? 'GET APP' : 'GET GAME';
      })()}
    </button>
  )
  
  /* PRIORITY 3: Video Demo */
  : hasVideo ? (
    <a
      href={game.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-4 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-400 font-black uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-all text-[10px] rounded-sm"
    >
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
      </svg>
      WATCH DEMO
    </a>
  )
  
  /* PRIORITY 4: Screenshots */
  : hasScreenshots ? (
    <button
      onClick={onClose} // Close modal and let user see screenshots on main page
      className="flex-4 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-400 font-black uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-all text-[10px] rounded-sm"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      VIEW GALLERY
    </button>
  )
  
  /* PRIORITY 5: Fallback */
  : (
    <button 
      disabled 
      className="flex-4 bg-background border border-white/5 text-slate-600 font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 cursor-not-allowed text-[10px] rounded-sm"
    >
      <Eye size={14} /> 
      DETAILS ONLY
    </button>
  )}
  
  {/* Wishlist Button - Stays the same */}
  <button 
    onClick={() => toggleWishlist(game)} 
    className={`flex-1 border flex items-center justify-center transition-all duration-300 rounded-sm ${
      isWishlisted 
      ? `${theme.bg} ${theme.border} text-white shadow-lg` 
      : `bg-transparent border-white/10 text-slate-500 hover:text-white ${theme.borderHover}`
    }`}
  >
    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
  </button>
</div>
            </div>
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
      
      {/* Existing Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </>
  );
}