"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getSmartTag, getTagStyle } from "@/lib/game-utils";

export default function SimilarGames({ games }) {
  // Safety: If games array is missing or empty, hide section
  if (!games || !Array.isArray(games) || games.length === 0) return null;

  return (
    <section className="border-t border-white/5 bg-[#0e121e]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="flex items-center gap-2 text-xl font-black text-white uppercase mb-8">
          <Sparkles size={20} className="text-ruby" /> You Might Also Like
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {games.map((simGame) => {
            // Safety: Skip invalid game objects in the array
            if (!simGame) return null;

            const smartTag = getSmartTag(simGame.tags);
            const tagStyle = getTagStyle(smartTag);

            return (
              <Link key={simGame.id} href={`/view/${simGame.slug}`} className="group relative block bg-[#161b2c] rounded-xl overflow-hidden border border-white/5 hover:border-ruby/50 transition-all hover:-translate-y-1 shadow-lg hover:shadow-ruby/20">
                <div className="aspect-3/4 overflow-hidden">
                  <img 
                    src={simGame.image} 
                    alt={simGame.title || "Game"} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    referrerPolicy="no-referrer" 
                  />
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