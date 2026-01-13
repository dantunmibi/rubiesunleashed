/**
 * ================================================================
 * SEARCH DROPDOWN (v19.2 - Visual Consistency)
 * ================================================================
 * Purpose: Navbar search results matching Vault styling.
 * Dependencies: game-utils.js (for Smart Tags & Colors).
 */

'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Gamepad2, Box, Loader2 } from 'lucide-react';
import { getSmartTag, getTagStyle } from '@/lib/game-utils';

export default function SearchDropdown({ 
  isOpen, 
  results = [], 
  query, 
  isSearching, 
  onClose,
  maxResults = 5 
}) {
  const dropdownRef = useRef(null);

  // Click Outside & Escape Logic
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="mx-auto w-full rounded-2xl border border-white/10 bg-[#161b2c]/95 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden">
        {/* Top Glow Border */}
        <div className="h-px bg-linear-to-r from-transparent via-ruby to-transparent" />

        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          
          {/* 1. Loading State */}
          {isSearching && (
            <div className="flex items-center justify-center gap-2 py-6 text-ruby">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Searching Vault...</span>
            </div>
          )}

          {/* 2. No Results */}
          {!isSearching && results.length === 0 && query.trim().length >= 2 && (
             <div className="py-8 text-center px-4">
                <Search className="mx-auto mb-2 text-slate-600" size={24} />
                <p className="text-sm font-bold text-slate-300">No treasures found</p>
                <Link
                  href={`/explore?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="mt-3 inline-block text-[10px] font-black uppercase tracking-widest text-ruby hover:text-white transition-colors"
                >
                  Try Deep Search
                </Link>
             </div>
          )}

          {/* 3. Results List */}
          {!isSearching && results.length > 0 && (
            <>
              {results.slice(0, maxResults).map((game) => {
                // 💎 SMART VISUALS (From game-utils.js)
                const smartTag = getSmartTag(game.tags);
                const tagStyle = getTagStyle(smartTag);
                const isApp = ['App', 'Tool', 'Software', 'Utility'].includes(smartTag);
                const targetLink = `/view/${game.slug || game.id}`;

                return (
                  <Link
                    key={game.slug || game.id}
                    href={targetLink}
                    onClick={onClose}
                    className="group flex items-center gap-4 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-background">
                      {game.coverImage || game.image ? (
                        <img 
                          src={game.coverImage || game.image} 
                          alt={game.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isApp ? 'text-cyan-400' : 'text-ruby'}`}>
                           {isApp ? <Box size={20} /> : <Gamepad2 size={20} />}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-ruby transition-colors">
                        {game.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${tagStyle}`}>
                          {smartTag}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium truncate">
                           {game.developer || "Unknown Dev"}
                        </span>
                      </div>
                    </div>

                    <ArrowRight size={14} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}

              {/* View All */}
              {results.length > maxResults && (
                <Link
                  href={`/explore?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="block w-full py-3 text-center bg-white/5 hover:bg-ruby/10 text-xs font-bold uppercase tracking-widest text-ruby transition-colors"
                >
                  View all {results.length} results
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}