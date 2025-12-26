"use client";

import React, { useState, useEffect } from "react";
import { X, Heart, Download, Maximize2, ArrowRight, AlertTriangle, Eye } from "lucide-react";
import Link from "next/link";
import { getDownloadIcon } from "@/lib/game-utils"; // Need this helper

export default function GameModal({ game, onClose }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ✅ NEW: Content Warning State (Default to TRUE if warnings exist)
  const hasWarnings = game.contentWarnings && game.contentWarnings.length > 0;
  const [isBlurred, setIsBlurred] = useState(hasWarnings);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("ruby_wishlist") || "[]");
    setIsWishlisted(saved.some((g) => g.id === game.id));
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, [game]);

  const toggleWishlist = () => {
    const saved = JSON.parse(localStorage.getItem("ruby_wishlist") || "[]");
    if (isWishlisted) {
      const filtered = saved.filter((g) => g.id !== game.id);
      localStorage.setItem("ruby_wishlist", JSON.stringify(filtered));
      setIsWishlisted(false);
    } else {
      saved.push(game);
      localStorage.setItem("ruby_wishlist", JSON.stringify(saved));
      setIsWishlisted(true);
    }
  };

  // --- LOGIC FROM DETAILS PAGE ---
  const downloadLinks = Array.isArray(game.downloadLinks) ? game.downloadLinks : [];
  const hasMultipleBuilds = downloadLinks.length > 1;
  const hasValidDownload = downloadLinks.length > 0 || (game.downloadUrl && game.downloadUrl !== "#");
  
  // Single Button Fallback
  const primaryLink = downloadLinks.length > 0 
      ? downloadLinks[0] 
      : { platform: 'Download', url: game.downloadUrl || '#' };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0b0f19]/90 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-[#161b2c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] animate-in zoom-in-95 fade-in duration-300">
        {/* ✅ FIXED: Use z-60 (Standard Utility) instead of z-[60] */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-60 p-2 rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white hover:bg-ruby hover:border-ruby transition-all duration-300 hover:rotate-90 backdrop-blur-md"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        {/* ✅ CONTENT WARNING OVERLAY (Absolute Position) */}
        {isBlurred && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl p-6 text-center">
                <div className="bg-red-500/20 p-4 rounded-full mb-4 animate-pulse">
                    <AlertTriangle size={48} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Content Warning</h3>
                <p className="text-slate-300 mb-6 max-w-md">
                    This content contains elements that may not be suitable for all audiences: <br/>
                    <span className="text-red-400 font-bold">{game.contentWarnings.join(", ")}</span>
                </p>
                <button 
                    onClick={() => setIsBlurred(false)}
                    className="bg-white text-black px-8 py-3 rounded-xl font-bold uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <Eye size={18} /> View Content
                </button>
                <button 
                    onClick={onClose} 
                    className="mt-4 px-6 py-2 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                    Close
                </button>
            </div>
        )}

        {/* Poster (Blurred if warning active) */}
        <div className={`hidden md:block w-[40%] relative bg-slate-900 transition-all duration-500 ${isBlurred ? 'blur-sm grayscale' : ''}`}>
            <img 
                src={game.image} 
                alt={game.title} 
                className="w-full h-full object-cover opacity-90" 
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#161b2c]/20 to-[#161b2c]" />
        </div>

        {/* Content (Blurred if warning active) */}
        <div className={`flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col transition-all duration-500 ${isBlurred ? 'blur-md opacity-50 pointer-events-none' : ''}`}>

            <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-ruby bg-ruby/10 px-2.5 py-1 rounded border border-ruby/20 mb-3 inline-block">
                    {game.tag || (game.tags?.some(t => ['App', 'PWA', 'Tool'].includes(t)) ? "App" : "Game")}
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white leading-none uppercase mb-2 tracking-tight">
                    {game.title}
                </h2>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-8 grow font-medium">
                {game.description?.substring(0, 300)}...
            </p>

            {/* BUTTONS */}
            <div className="flex flex-col gap-3 mt-auto border-t border-white/5 pt-6">
                
                <Link 
                    href={`/view/${game.slug}`} 
                    className="w-full bg-white text-black hover:bg-ruby hover:text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-ruby/20"
                >
                    <Maximize2 size={18} /> Full Details <ArrowRight size={16} />
                </Link>

                <div className="flex gap-3">
                    
                    {/* DYNAMIC DOWNLOAD LOGIC */}
                    {hasMultipleBuilds ? (
                        // Multi-Platform: Scrollable Row
                        <div className="flex-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {downloadLinks.map((link, i) => (
                                <a 
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 min-w-25 bg-[#0b0f19] border border-white/10 hover:border-ruby text-white font-bold uppercase py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-[10px] tracking-wide whitespace-nowrap"
                                >
                                    {getDownloadIcon(link.platform)} {link.platform}
                                </a>
                            ))}
                        </div>
                    ) : hasValidDownload ? (
                        // Single Platform: Big Button
                        <a 
                            href={primaryLink.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 bg-[#0b0f19] border border-white/10 hover:border-ruby text-white font-bold uppercase py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs tracking-wider"
                        >
                            {getDownloadIcon(primaryLink.platform)} 
                            {primaryLink.platform === 'Download' ? 'Get Now' : `Get for ${primaryLink.platform}`}
                        </a>
                    ) : (
                        // Unavailable
                        <button disabled className="flex-1 bg-slate-800 text-slate-500 font-bold uppercase py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed text-xs">
                            <Download size={16} /> Unavailable
                        </button>
                    )}
                    
                    <button 
                        onClick={toggleWishlist} 
                        className={`px-5 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                            isWishlisted 
                            ? 'bg-ruby border-ruby text-white shadow-[0_0_15px_rgba(224,17,95,0.4)]' 
                            : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}