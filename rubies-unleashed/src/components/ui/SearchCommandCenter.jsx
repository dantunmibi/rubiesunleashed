/**
 * ================================================================
 * SEARCH COMMAND CENTER (Mobile Spotlight - v2.4)
 * ================================================================
 * 
 * Purpose:
 * - Full-screen immersive search for mobile.
 * - Discovery Dashboard with optimized layout (Horizontal Scroll).
 * 
 * Features:
 * - Live "Searching..." Spinner.
 * - Recent Searches (Persisted).
 * - Trending Tags.
 * - New Arrivals (Horizontal Carousel to save vertical space).
 * - STRICT TAILWIND V4 COMPLIANCE (Fixed aspect ratios).
 * ================================================================
 */

"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { 
  X, Search, ChevronRight, Loader2, Sparkles, 
  TrendingUp, ArrowLeft, Gamepad2, Box, History, Trash2
} from "lucide-react";
import Link from "next/link";
import { useSearch } from "@/hooks/useSearch";
import { getSmartTag, getTagStyle } from "@/lib/game-utils"; 

export default function SearchCommandCenter({ isOpen, onClose, allGames }) {
  const { query, setQuery, results, isSearching } = useSearch(allGames);
  const inputRef = useRef(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // --- 1. INITIALIZATION & FOCUS ---
  useEffect(() => {
    if (isOpen) {
        if(inputRef.current) setTimeout(() => inputRef.current.focus(), 100);
        
        try {
            const saved = localStorage.getItem("ruby_search_history");
            if (saved) setRecentSearches(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load search history", e);
        }

        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "unset";
        setQuery(""); 
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // --- 2. HISTORY LOGIC ---
  const addToHistory = (term) => {
      if (!term) return;
      // Keep max 5 items
      const newHistory = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
      setRecentSearches(newHistory);
      localStorage.setItem("ruby_search_history", JSON.stringify(newHistory));
  };

  const removeFromHistory = (term, e) => {
      e.stopPropagation();
      const newHistory = recentSearches.filter(t => t !== term);
      setRecentSearches(newHistory);
      localStorage.setItem("ruby_search_history", JSON.stringify(newHistory));
  };

  const clearAllHistory = () => {
      setRecentSearches([]);
      localStorage.removeItem("ruby_search_history");
  };

  // --- 3. DYNAMIC DATA ---
  const trendingTags = useMemo(() => {
    if (!allGames || allGames.length === 0) return ["Action", "RPG", "Horror", "Android", "Tools"];
    const counts = {};
    allGames.forEach(game => {
      if (Array.isArray(game.tags)) {
        game.tags.forEach(tag => {
          if (['Game', 'App', 'Download', 'Free'].includes(tag)) return;
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 8).map(([tag]) => tag);
  }, [allGames]);

  // Show up to 6 new games (Horizontal Scroll handles the overflow)
  const featuredGames = allGames ? allGames.slice(0, 6) : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex flex-col bg-[#0b0f19]/95 backdrop-blur-2xl animate-in fade-in duration-200">
      
      {/* HEADER */}
      <div className="w-full max-w-2xl mx-auto px-4 pt-6 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-black text-ruby uppercase tracking-[0.2em] flex items-center gap-2">
            <Search size={12} /> Vault Command
          </span>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-white bg-white/5 rounded-full transition-colors active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative group">
          {query.length > 0 ? (
             <button 
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full transition-colors"
             >
                <ArrowLeft size={20} />
             </button>
          ) : (
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
          )}
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, apps, tools..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-ruby/50 focus:ring-1 focus:ring-ruby/50 focus:bg-black/60 shadow-xl transition-all"
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isSearching ? (
                <Loader2 className="text-ruby w-5 h-5 animate-spin" />
            ) : query.length > 0 && (
                <button onClick={() => setQuery("")} className="text-slate-600 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto pt-2 pb-24 px-4">
          
          {query.length > 0 ? (
            /* --- STATE A: ACTIVE SEARCH RESULTS --- */
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2 mb-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {isSearching ? "Searching Vault..." : `${results.length} Matches Found`}
                 </p>
              </div>
              
              {results.length === 0 && !isSearching && (
                <div className="text-center py-20 opacity-50 flex flex-col items-center animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Search size={32} className="text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-medium">No results found for "{query}"</p>
                </div>
              )}

              <div className="space-y-2">
                {results.map((game) => {
                    const smartTag = getSmartTag(game.tags);
                    const tagStyle = getTagStyle(smartTag);
                    const isApp = ['App', 'Tool', 'Software', 'Utility'].includes(smartTag);

                    return (
                        <Link 
                            key={game.slug || game.id}
                            href={`/view/${game.slug}`}
                            onClick={() => {
                                addToHistory(game.title);
                                onClose();
                            }}
                            className="flex items-center gap-4 p-3 rounded-xl bg-[#161b2c] border border-white/5 hover:border-ruby/40 transition-all group active:scale-[0.98]"
                        >
                            <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-black/50 shadow-lg relative border border-white/5">
                                {game.image ? (
                                    <img 
                                        src={game.image} 
                                        alt={game.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        {isApp ? <Box size={20} /> : <Gamepad2 size={20} />}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                                    {game.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${tagStyle}`}>
                                        {smartTag}
                                    </span>
                                    {game.developer && game.developer !== "Unknown" && (
                                        <span className="text-[10px] text-slate-500 truncate max-w-25">
                                            {game.developer}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="text-slate-700 group-hover:text-ruby group-hover:translate-x-1 transition-all" size={18} />
                        </Link>
                    );
                })}
              </div>
            </div>
          ) : (
            
            /* --- STATE B: DISCOVERY DASHBOARD --- */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75 space-y-10">
               
               {/* 1. RECENT SEARCHES */}
               {recentSearches.length > 0 && (
                   <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <p className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <History size={14} className="text-ruby" /> Recent
                            </p>
                            <button 
                                onClick={clearAllHistory}
                                className="text-[10px] font-bold text-slate-600 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                <Trash2 size={10} /> Clear
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {/* Limit visually to 3 items */}
                            {recentSearches.slice(0, 3).map((term, idx) => (
                                <div key={idx} className="flex items-center gap-2 group">
                                    <button
                                        onClick={() => setQuery(term)}
                                        className="flex-1 text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-sm font-medium text-slate-300 hover:text-white transition-all active:scale-[0.98] flex items-center gap-3"
                                    >
                                        <History size={14} className="text-slate-500" />
                                        {term}
                                    </button>
                                    <button 
                                        onClick={(e) => removeFromHistory(term, e)}
                                        className="p-3 text-slate-600 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                   </div>
               )}

               {/* 2. TRENDING TAGS */}
               <div>
                 <p className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">
                    <TrendingUp size={14} className="text-cyan-400" /> Trending
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {trendingTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => {
                                setQuery(tag);
                                addToHistory(tag);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-ruby hover:text-white border border-white/5 hover:border-ruby text-xs font-bold text-slate-400 transition-all active:scale-95"
                        >
                            {tag}
                        </button>
                    ))}
                 </div>
               </div>

               {/* 3. NEW ARRIVALS (Horizontal Carousel) */}
               {featuredGames.length > 0 && (
                   <div>
                        <p className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">
                            <Sparkles size={14} className="text-amber-400" /> New Arrivals
                        </p>
                        
                        {/* ✅ HORIZONTAL SCROLL CONTAINER */}
                        <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory no-scrollbar">
                            {featuredGames.map((game) => {
                                const smartTag = getSmartTag(game.tags);
                                
                                return (
                                    <Link 
                                        key={game.slug || game.id}
                                        href={`/view/${game.slug}`}
                                        onClick={onClose}
                                        // ✅ FIXED: Canonical aspect-3/4
                                        className="relative group shrink-0 w-36 aspect-3/4 rounded-2xl overflow-hidden bg-[#161b2c] border border-white/10 shadow-lg active:scale-95 transition-transform snap-start"
                                    >
                                        <img 
                                            src={game.image} 
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500" 
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-[#0b0f19] via-[#0b0f19]/40 to-transparent p-3 flex flex-col justify-end">
                                            <span className="text-[9px] font-bold text-ruby uppercase mb-1 tracking-wider">
                                                {smartTag}
                                            </span>
                                            <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">
                                                {game.title}
                                            </h4>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                   </div>
               )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}