"use client";

import Link from "next/link";
import { Sparkles, Box, Gamepad2, Loader2 } from "lucide-react";
import { getSmartTag, getTagStyle } from "@/lib/game-utils";
import { getGameTheme } from "@/lib/theme-utils";

export default function SimilarGames({ games, currentGameType, loading }) {
  // Determine section theme based on the current page's context
  const sectionTheme = getGameTheme(currentGameType || 'Game');

  // ✅ Loading State
  if (loading) {
    return (
      <section className="border-t border-white/5 bg-[#0e121e]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h3 className="flex items-center gap-2 text-xl font-black text-white uppercase mb-8">
            <Sparkles size={20} className={`${sectionTheme.text} animate-pulse`} /> 
            Finding Similar Content...
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#161b2c] rounded-xl overflow-hidden border border-white/5 animate-pulse">
                <div className="aspect-3/4 bg-slate-700"></div>
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-700 rounded w-16"></div>
                  <div className="h-4 bg-slate-600 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ✅ Empty State (No Games Found)
  if (!games || !Array.isArray(games) || games.length === 0) {
    return (
      <section className="border-t border-white/5 bg-[#0e121e]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h3 className="flex items-center gap-2 text-xl font-black text-white uppercase mb-8">
            <Sparkles size={20} className="text-slate-500" /> 
            You Might Also Like
          </h3>
          <div className="text-center py-12">
            <Box size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No similar content found at the moment.</p>
            <p className="text-slate-600 text-sm mt-2">Check back soon for recommendations!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-white/5 bg-[#0e121e]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="flex items-center gap-2 text-xl font-black text-white uppercase mb-8">
          <Sparkles size={20} className={sectionTheme.text} /> You Might Also Like
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {games.map((simGame) => {
            if (!simGame) return null;

            // ✅ Individual Card Theme Logic
            const cardTheme = getGameTheme(simGame.type);
            const smartTag = getSmartTag(simGame.tags);
            const tagStyle = getTagStyle(smartTag);

            // ✅ Handle both Blogger and Supabase image fields
            const gameImage = simGame.image || simGame.cover_url || '/placeholder-game.png';

            return (
              <Link 
                key={simGame.id} 
                href={`/view/${simGame.slug}`} 
                className={`group relative block bg-[#161b2c] rounded-xl overflow-hidden border border-white/5 ${cardTheme.borderHover} transition-all hover:-translate-y-1 shadow-lg ${cardTheme.isApp ? "hover:shadow-cyan-900/20" : "hover:shadow-ruby/20"}`}
              >
                <div className="aspect-3/4 overflow-hidden">
                  <img 
                    src={gameImage}
                    alt={simGame.title || "Game"} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = '/placeholder-game.png';
                    }}
                  />
                  {/* Type Icon Overlay */}
                  <div className={`absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 ${cardTheme.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                     <cardTheme.icon size={12} />
                  </div>
                </div>
                
                <div className="absolute bottom-0 inset-x-0 p-4 bg-linear-to-t from-[#0b0f19] via-[#0b0f19]/80 to-transparent pt-12">
                   {/* Colored Smart Tag */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md ${tagStyle}`}>
                    {smartTag}
                  </span>
                  <h4 className="text-white font-bold leading-tight mt-2 truncate drop-shadow-md">
                    {simGame.title}
                  </h4>
                  
                  {/* ✅ Developer Name (if available) */}
                  {simGame.developer && simGame.developer !== 'Unknown Developer' && (
                    <p className="text-slate-400 text-xs mt-1 truncate">
                      by {simGame.developer}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}