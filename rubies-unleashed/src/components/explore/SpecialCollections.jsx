"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Flame, Sparkles, Star, ChevronRight, ArrowRight, Trophy } from "lucide-react";

/* =========================================================================
   🔧 CONFIGURATION (EDIT THIS TO CHANGE SECTIONS/TAGS)
   ========================================================================= */
const SECTIONS_CONFIG = [
  {
    id: "trending",
    title: "Trending Now",
    subtitle: "Most popular downloads",
    icon: Flame,
    layout: "horizontal", // Swipeable row
    limit: 8,
    // LOGIC: Filter games that have specific tags
    filter: (game) => game.tags?.some(t => ["Trending", "Popular", "Hot"].includes(t)) || true // Fallback to all if no tags match
  },
  {
    id: "fresh",
    title: "Fresh Drops",
    subtitle: "Latest additions to the vault",
    icon: Sparkles,
    layout: "vertical", // Stacked list (Vertical)
    limit: 4,
    // LOGIC: Sort by date (newest first)
    filter: (game) => true, 
    sort: (a, b) => new Date(b.publishedDate) - new Date(a.publishedDate)
  },
  {
    id: "editors",
    title: "Editor's Choice",
    subtitle: "Staff picks & hidden gems",
    icon: Trophy,
    layout: "horizontal", // Swipeable row
    limit: 8,
    // LOGIC: specific tag
    filter: (game) => game.tags?.includes("Editor's Choice") || game.tags?.includes("Featured")
  },
    {
    id: "essentials",
    title: "Digital Essentials",
    subtitle: "Streamline your workflow with ease.",
    icon: Flame,
    layout: "vertical", // Stacked list (Vertical)
    limit: 4,
    // LOGIC: Filter games that have specific tags
    filter: (game) => game.tags?.includes("Productivity") || game.tags?.includes("Utility") || game.tags?.includes("Apps")
  }
];

/* =========================================================================
   🎨 SUB-COMPONENTS
   ========================================================================= */

const SectionHeader = ({ title, icon: Icon, subtitle }) => (
  <div className="flex items-end justify-between px-4 md:px-0 mb-4">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-ruby-500" />}
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">
          {title}
        </h2>
      </div>
      <p className="text-[10px] md:text-xs font-bold text-slate-500 tracking-[0.2em] uppercase pl-1">
        {subtitle}
      </p>
    </div>
  </div>
);

// Large Portrait Card (Horizontal Scroll)
const ShowcaseCard = ({ game }) => (
  <Link
    href={`/view/${game.slug}`}
    className="group relative shrink-0 w-44 md:w-50 aspect-3/4 rounded-4xl overflow-hidden bg-[#0F1219] border border-white/5 shadow-lg snap-center transition-all duration-300 hover:scale-[1.02] hover:border-ruby-500/30 hover:shadow-ruby-900/20"
  >
    <div className="absolute inset-0">
      <img
        src={game.image || "https://placehold.co/600x800/1e293b/E0115F?text=No+Image"}
        alt={game.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-50"
        loading="lazy"
      />
    </div>
    <div className="absolute inset-0 bg-linear-to-t from-[#07090D] via-[#07090D]/40 to-transparent" />
    <div className="absolute inset-0 p-6 flex flex-col justify-end">
      {game.tags?.[0] && (
        <div className="mb-3 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <span className="px-2 py-1 rounded-md bg-ruby-600 text-white text-[9px] font-black uppercase tracking-widest">
            {game.tags[0]}
          </span>
        </div>
      )}
      <h3 className="text-md font-black text-white leading-none mb-2 uppercase italic drop-shadow-lg line-clamp-2 group-hover:text-ruby-400 transition-colors">
        {game.title}
      </h3>
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/10">
        <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest truncate max-w-35">
          {game.developer || "Unknown"}
        </span>
        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
      </div>
    </div>
  </Link>
);

// Compact List Card (Vertical Stack) - REDESIGNED
const CompactCard = ({ game }) => (
  <Link
    href={`/view/${game.slug}`}
    className="group relative flex items-center gap-4 p-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/4 hover:border-ruby-500/30 transition-all duration-300 w-full overflow-hidden"
  >
    {/* Animated Glow Bar on Hover */}
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-ruby-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

    {/* Square Icon */}
    <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:border-white/20 transition-colors">
      <img
        src={game.image || "https://placehold.co/100x100/1e293b/E0115F?text=Icon"}
        alt={game.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>

    {/* Info Block */}
    <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
      <h4 className="text-white font-black text-xs md:text-sm uppercase italic tracking-wide truncate group-hover:text-ruby-400 transition-colors">
        {game.title}
      </h4>
      
      <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        <span className="truncate max-w-25">{game.developer || "Unknown"}</span>
        <span className="w-1 h-1 rounded-full bg-slate-700" />
        <span className="text-slate-400">{game.tags?.[0] || "App"}</span>
      </div>
    </div>

    {/* Tech Arrow */}
    <div className="pr-2 text-slate-600 group-hover:text-ruby-500 group-hover:translate-x-1 transition-all duration-300">
      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
    </div>
  </Link>
);

/* =========================================================================
   🚀 MAIN COMPONENT
   ========================================================================= */

export default function SpecialCollections({ games = [] }) {
  if (!games || games.length === 0) return null;

  // Process sections based on Config
  const processedSections = useMemo(() => {
    return SECTIONS_CONFIG.map(config => {
      let filtered = games.filter(config.filter);
      
      // Optional Sort
      if (config.sort) {
        filtered.sort(config.sort);
      }
      
      // Slice limit
      filtered = filtered.slice(0, config.limit);

      // Fallback: If filter found nothing, just fill with random items (optional)
      if (filtered.length === 0 && config.id !== 'fresh') {
         filtered = games.slice(0, config.limit);
      }

      return { ...config, items: filtered };
    });
  }, [games]);

  return (
    <div className="flex flex-col gap-12 py-10 bg-[#0b0f19] border-b border-white/5 overflow-hidden">
      
      {processedSections.map((section) => {
        if (section.items.length === 0) return null;

        return (
          <section key={section.id} className="relative">
            <div className="max-w-7xl mx-auto">
              <SectionHeader 
                title={section.title} 
                icon={section.icon} 
                subtitle={section.subtitle} 
              />
              
              {/* LAYOUT SWITCHER */}
              
              {/* 1. HORIZONTAL SCROLL LAYOUT */}
              {section.layout === 'horizontal' && (
                <div className="flex gap-4 overflow-x-auto px-6 md:px-8 pb-8 pt-4 -my-4 snap-x mandatory scrollbar-hide">
                  {section.items.map((game) => (
                    <ShowcaseCard key={game.slug} game={game} />
                  ))}
                  <div className="w-2 shrink-0" />
                </div>
              )}

              {/* 2. VERTICAL STACK LAYOUT */}
              {section.layout === 'vertical' && (
                 <div className="px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.items.map((game) => (
                      <CompactCard key={game.slug} game={game} />
                    ))}
                 </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}