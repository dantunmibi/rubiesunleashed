/**
 * GameModal.js
 * 
 * Summary:
 * Modal overlay component for quick game/app preview with download actions.
 * Features: Content warning overlay, responsive layout, wishlist integration,
 * dynamic download buttons with platform detection, smart app vs game classification.
 * 
 * Key Logic:
 * - Uses getSmartTag(game.tags) for accurate App/Game detection
 * - Multi-platform downloads show "View on Steam", "Get for Windows", etc.
 * - Single downloads show "GET APP" (apps) or "PLAY NOW" (games)
 * - Badge shows "SOFTWARE" for apps, "GAME" for games (matching VaultSection)
 */

"use client";

import React, { useState, useEffect } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import AuthModal from "@/components/auth/AuthModal";
import { 
  X, Heart, Download, ArrowRight, AlertTriangle, Eye, 
  Gamepad2, Box, User, GitBranch
} from "lucide-react";
import Link from "next/link";
import { getDownloadIcon, getSmartTag, getDownloadLabel } from "@/lib/game-utils";

export default function GameModal({ game, onClose }) {
const { 
  isWishlisted, 
  toggleWishlist,
  showAuthModal,
  closeAuthModal,
  handleContinueAsGuest
} = useWishlist(game?.id);
  
  // Logic: Handle warnings (Check if exists, but don't show specific text in overlay)
  const rawWarnings = game?.contentWarnings || game?.contentWarning;
  const hasWarnings = Array.isArray(rawWarnings) ? rawWarnings.length > 0 : !!rawWarnings;
  
  const [isBlurred, setIsBlurred] = useState(hasWarnings);

  // Sync state with local storage & Lock Body Scroll
  useEffect(() => {
    if (!game) return;
    
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, [game]);

  if (!game) return null;

  // --- LOGIC PREP ---
  const isApp = game.type === 'App';
  
  // Download Logic
  const downloadLinks = Array.isArray(game.downloadLinks) ? game.downloadLinks : [];
  const hasMultipleBuilds = downloadLinks.length > 1;
  const hasValidDownload = downloadLinks.length > 0 || (game.downloadUrl && game.downloadUrl !== "#");
  const primaryLink = downloadLinks.length > 0 ? downloadLinks[0] : { platform: 'Download', url: game.downloadUrl || '#' };

  // --- SLICK HEIGHT LOGIC ---
  // If title is long (> 25 chars), give it more height (500px/125).
  // If title is short, keep it tight (460px/115).
  const isLongTitle = game.title.length > 25;
  const desktopHeightClass = isLongTitle ? "md:h-[500px]" : "md:h-[460px]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-sans selection:bg-ruby selection:text-white">
      
      {/* GLOBAL BACKDROP */}
      <div 
        className="absolute inset-0 bg-background/95 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* MODAL FRAME - Dynamic "Slick" Height applied here */}
      <div className={`relative w-full max-w-5xl bg-surface border border-ruby/20 rounded-xl shadow-[0_0_60px_rgba(224,17,95,0.1)] overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300 ${desktopHeightClass}`}>
        
        {/* THE RUBY SCANLINE */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-ruby to-transparent opacity-50 z-50 pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-40 p-1.5 bg-background border border-ruby/30 text-ruby hover:bg-ruby hover:text-white transition-all duration-300 group rounded-sm"
        >
          <X size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
        
        {/* --- VAULT ADVISORY OVERLAY --- */}
        {isBlurred && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/98 backdrop-blur-3xl p-10 text-center animate-in fade-in duration-500">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-ruby/30 blur-3xl rounded-full animate-pulse" />
              <div className="relative border border-ruby p-6 rounded-xl bg-black shadow-[0_0_40px_rgba(224,17,95,0.4)]">
                <AlertTriangle size={64} className="text-ruby" />
              </div>
            </div>
            
            <h3 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight mb-2 italic">
              RESTRICTED <span className="text-ruby">ASSET</span>
            </h3>
            
            <p className="text-ruby font-bold uppercase text-xs tracking-[0.4em] mb-6">
              Sensitive Content Detected
            </p>

            <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed font-medium">
              This vault item contains material flagged for mature audiences or specific sensitivities. 
              Explicit details are hidden pending authorization.
            </p>
            
            <div className="flex gap-4 w-full max-w-md">
              <button 
                onClick={() => setIsBlurred(false)}
                className="flex-1 bg-ruby text-white px-8 py-4 rounded-sm font-black uppercase tracking-widest hover:brightness-125 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(224,17,95,0.4)] text-xs"
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
          <div className="absolute inset-0 bg-linear-to-br from-ruby/20 to-transparent mix-blend-overlay z-10" />
          
          <img 
            src={game.image} 
            alt={game.title} 
            className="w-full h-full object-cover opacity-70 scale-105" 
          />
          
          {/* Scanline / Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(224,17,95,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(224,17,95,0.05)_1px,transparent_1px)] bg-size-[20px_20px] z-20 pointer-events-none" />
        </div>

        {/* --- RIGHT: Detailed Info Section --- */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-700 ${isBlurred ? 'blur-xl opacity-20 scale-95 pointer-events-none' : ''}`}>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
            <header className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className={`flex items-center gap-1.5 px-2 py-0.5 bg-ruby/10 border border-ruby/30 text-ruby text-[9px] font-black uppercase tracking-[0.15em] rounded-sm`}>
                   {isApp ? <Box size={10} /> : <Gamepad2 size={10} />}
                   {game.type === 'App' ? "SOFTWARE" : "GAME"}
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-none uppercase tracking-tighter mb-3 italic">
                {game.title}
              </h2>
              <div className="w-full h-0.5 bg-linear-to-r from-ruby via-ruby/20 to-transparent" />
            </header>

            <div className="space-y-6">
              <p className="text-slate-300 text-sm leading-relaxed font-light border-l-2 border-ruby/30 pl-4 italic">
                {game.description ? game.description.substring(0, 350) + (game.description.length > 350 ? '...' : '') : 'No description provided.'}
              </p>
              
              {/* Technical Grid (Compact - 2 Cols) */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Developer */}
                <div className="p-3 bg-background border border-white/5 rounded-sm hover:border-ruby/30 transition-colors">
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] mb-0.5">Developer</p>
                  <div className="flex items-center justify-between text-white font-bold text-[10px] uppercase tracking-wider">
                      <span className="truncate pr-2">{game.developer || "Unknown"}</span>
                      <User size={12} className="text-ruby shrink-0" />
                  </div>
                </div>

                {/* Version */}
                <div className="p-3 bg-background border border-white/5 rounded-sm hover:border-ruby/30 transition-colors">
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] mb-0.5">Build Ver</p>
                  <div className="flex items-center justify-between text-white font-bold text-[10px] uppercase tracking-wider">
                      <span>{game.version || "1.0"}</span>
                      <GitBranch size={12} className="text-ruby" />
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
              className="group w-full bg-ruby text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-sm flex items-center justify-center gap-3 transition-all hover:brightness-110 shadow-[0_5px_20px_rgba(224,17,95,0.2)] active:translate-y-0.5 mb-3 text-xs"
            >
              VIEW DETAILS <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary Actions Row */}
            <div className="flex gap-3">
              
              {/* Dynamic Download Buttons */}
              {hasMultipleBuilds ? (
                <div className="flex-4 flex gap-2 overflow-x-auto no-scrollbar">
                    {downloadLinks.map((link, i) => (
                        <a 
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-background border border-ruby/20 hover:border-ruby hover:bg-ruby/10 text-white font-bold uppercase tracking-wider py-3 px-3 flex items-center justify-center gap-2 transition-all text-[9px] whitespace-nowrap rounded-sm"
                        >
                            {getDownloadIcon(link.platform)} {getDownloadLabel(link.platform)}
                        </a>
                    ))}
                </div>
) : hasValidDownload ? (
  <a 
    href={primaryLink.url}
    target="_blank"
    rel="noopener noreferrer" 
    className="flex-4 bg-background border border-ruby/20 hover:border-ruby hover:bg-ruby/10 text-white font-black uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-all text-[10px] rounded-sm"
  >
    {isApp ? <Box size={14} className="text-ruby" /> : <Gamepad2 size={14} className="text-ruby" />}
    {(() => {
      const platform = (primaryLink.platform || '').toLowerCase().trim();
      const url = (primaryLink.url || '').toLowerCase();
      
      // Store platforms - Check both platform name AND URL
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
      
      // Check if it's a store link
      for (const [storeName, pattern] of Object.entries(storePatterns)) {
        if (platform.includes(storeName.toLowerCase()) || pattern.test(url)) {
          return getDownloadLabel(primaryLink.platform).toUpperCase();
        }
      }
      
      // Web-based detection
      if (platform === 'web' || platform.includes('html5') || platform.includes('browser')) {
        return isApp ? 'VISIT SITE' : 'PLAY NOW';
      }
      
      // Direct downloads (Windows, Mac, Linux, Android, iOS, etc.)
      return isApp ? 'GET APP' : 'GET GAME';
    })()}
  </a>
              ) : (
                <button disabled className="flex-4 bg-background border border-white/5 text-slate-600 font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 cursor-not-allowed text-[10px] rounded-sm">
                    <Download size={14} /> ARCHIVED
                </button>
              )}
              
              {/* Wishlist Button */}
              <button 
                onClick={() => toggleWishlist(game)} 
                className={`flex-1 border flex items-center justify-center transition-all duration-300 rounded-sm ${
                  isWishlisted 
                  ? 'bg-ruby border-ruby text-white shadow-[0_0_10px_rgba(224,17,95,0.4)]' 
                  : 'bg-transparent border-white/10 text-slate-500 hover:text-ruby hover:border-ruby'
                }`}
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    <AuthModal
      isOpen={showAuthModal}
      onClose={closeAuthModal}
      onContinueAsGuest={handleContinueAsGuest}
    />
    </div>
  );
}