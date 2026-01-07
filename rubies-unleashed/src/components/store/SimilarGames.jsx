"use client";

import Link from "next/link";
import { Sparkles, Box, Gamepad2 } from "lucide-react";
import { getSmartTag, getTagStyle } from "@/lib/game-utils";
import { getGameTheme } from "@/lib/theme-utils"; // ✅ Modular Theme

export default function SimilarGames({ games, currentGameType }) { // Added currentGameType prop
  if (!games || !Array.isArray(games) || games.length === 0) return null;

  // Determine section theme based on the current page's context (optional, defaults to Ruby)
  const sectionTheme = getGameTheme(currentGameType || 'Game');

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

            return (
              <Link 
                key={simGame.id} 
                href={`/view/${simGame.slug}`} 
                className={`group relative block bg-[#161b2c] rounded-xl overflow-hidden border border-white/5 ${cardTheme.borderHover} transition-all hover:-translate-y-1 shadow-lg ${cardTheme.isApp ? "hover:shadow-cyan-900/20" : "hover:shadow-ruby/20"}`}
              >
                <div className="aspect-3/4 overflow-hidden">
                  <img 
                    src={simGame.image} 
                    alt={simGame.title || "Game"} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    referrerPolicy="no-referrer" 
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
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}