"use client";

import Link from "next/link";
import { 
  ArrowLeft, Download, Gamepad2, Heart, Box, Share2, 
  ShieldCheck, Calendar, User, Gem, Info 
} from "lucide-react";
import { getDownloadIcon, getDownloadLabel } from "@/lib/game-utils";
import { useState, useEffect } from "react";

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
 */

export default function GameHero({ game, isWishlisted, onToggleWishlist }) {
  const [copied, setCopied] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(true);

  // Safety Checks
  if (!game) return null;

  const isApp = game.type === 'App' || game.tags?.some(t => ['App', 'Apps', 'Tool', 'Software'].includes(t));
  const hasMultipleBuilds = game.downloadLinks && game.downloadLinks.length > 1;
  const hasValidDownload = (game.downloadLinks && game.downloadLinks.length > 0) || (game.downloadUrl && game.downloadUrl !== "#");
  const playButtonLink = game.downloadLinks && game.downloadLinks.length > 0 ? game.downloadLinks[0].url : "#";

  // Scroll Listener for Floating Bar
  useEffect(() => {
    const handleScroll = () => {
      // Hide bar if scrolled down more than 100px
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
      
      // 1. Try Native Share (Mobile - usually requires HTTPS)
      if (navigator.share) {
        await navigator.share({ title: game.title, url: url });
        return;
      }
      
      // 2. Try Clipboard API (Requires HTTPS or Localhost)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        triggerCopyFeedback();
        return;
      }

      throw new Error("Clipboard API unavailable");

    } catch (err) {
      // 3. Fallback: Legacy "Hidden Textarea" hack (Works on HTTP)
      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed"; // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy"); // Deprecated but widely supported fallback
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
    // Try scrolling to specific ID first
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        // Fallback: Scroll down 1 viewport height
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

  // ✅ UNIFIED BUTTON LABEL LOGIC (Shared between desktop and mobile)
  const getButtonLabel = () => {
    const primaryLink = game.downloadLinks && game.downloadLinks.length > 0 
      ? game.downloadLinks[0] 
      : { platform: 'Download', url: game.downloadUrl || '#' };
    const platform = (primaryLink.platform || '').toLowerCase().trim();
    const url = (primaryLink.url || '').toLowerCase();
    
    // Store platforms
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
    
    // Direct downloads
    return isApp ? 'GET APP' : 'GET GAME';
  };

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
               {/* ✅ UPDATED: Informative Mobile Feedback */}
               {copied && (
                  <span className="absolute top-full right-0 mt-2 text-[10px] font-bold bg-ruby text-white px-3 py-1.5 rounded-lg whitespace-nowrap animate-in fade-in slide-in-from-top-1 shadow-xl z-50 border border-white/10">
                      Link copied to clipboard
                  </span>
               )}
             </button>
             <button 
               onClick={onToggleWishlist}
               className={`p-3 rounded-full border backdrop-blur-xl transition-all shadow-xl ${
                 isWishlisted ? 'bg-ruby border-ruby text-white' : 'bg-black/40 border-white/10 text-white'
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
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:border-ruby/50 hover:bg-black/60 transition-all hover:-translate-x-1 shadow-lg shadow-black/20"
            >
              <ArrowLeft size={18} className="text-slate-300 group-hover:text-ruby transition-colors" />
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
                {/* Tag Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ruby/10 border border-ruby/20 text-ruby text-[10px] font-black uppercase tracking-widest shadow-lg shadow-ruby/10">
                    <Gem size={12} /> {game.tag || (isApp ? "App" : "Game")}
                </div>
                
                <h1 className="text-4xl md:text-7xl font-black text-white leading-none uppercase tracking-tighter drop-shadow-2xl">
                    {game.title}
                </h1>

                {/* Metadata Row */}
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    {game.developer && (
                        <div className="flex items-center gap-2"><User size={14} className="text-ruby" /> {game.developer}</div>
                    )}
                    {game.updated && (
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-400" /> {game.updated}</div>
                    )}
                    <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Verified</div>
                </div>

                {/* DESKTOP ACTIONS (Hidden on Mobile) */}
                <div className="hidden md:flex flex-wrap items-center gap-4 pt-6">
                    {hasMultipleBuilds ? (
                      <div className="flex flex-wrap gap-3">
                        {game.downloadLinks.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="bg-ruby hover:bg-[#c00e50] text-white px-5 py-3 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-all hover:-translate-y-1 shadow-lg">
                            {getDownloadIcon(link.platform)} {getDownloadLabel(link.platform)}
                          </a>
                        ))}
                      </div>
                    ) : hasValidDownload ? (
                      <a href={playButtonLink} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto bg-ruby hover:bg-[#c00e50] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-[0_0_20px_rgba(224,17,95,0.3)]">
                        {isApp ? <Box size={20} className="text-white" /> : <Gamepad2 size={20} className="text-white" />}
                        {getButtonLabel()}
                      </a>
                    ) : (
                      <button disabled className="w-full md:w-auto bg-slate-700 text-slate-400 px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed">
                        Unavailable
                      </button>
                    )}

                    <button 
                        onClick={onToggleWishlist} 
                        className={`p-4 rounded-2xl border-2 font-bold transition-all ${isWishlisted ? "bg-white text-ruby border-white shadow-lg" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white"}`}
                    >
                        <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                    
                    <button 
                        onClick={handleShare}
                        className="p-4 rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all relative group"
                    >
                        <Share2 size={20} />
                         {/* ✅ UPDATED: Desktop Feedback */}
                         {copied && (
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-[10px] font-bold bg-ruby text-white px-3 py-1 rounded-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-1">
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
                
                {hasMultipleBuilds ? (
                     <button 
                        onClick={handleScrollToDownloads}
                        className="flex-1 bg-white text-black py-3.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                     >
                        <Download size={18} /> Downloads
                     </button>
                ) : hasValidDownload ? (
                    <a 
                        href={playButtonLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 bg-white text-black py-3.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                    >
                        {isApp ? <Box size={18} /> : <Gamepad2 size={18} />} 
                        {getButtonLabel()}
                    </a>
                ) : (
                    <button disabled className="flex-1 bg-slate-800 text-slate-500 py-3.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                        Unavailable
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
    </>
  );
}