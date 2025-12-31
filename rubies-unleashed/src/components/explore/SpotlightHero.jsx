"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Play, Gamepad2, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";

const FEATURED_TAG = "Featured";
const SPOTLIGHT_COUNT = 5;

export default function SpotlightHero({ games }) {
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 1. Data Logic
  const spotlightItems = useMemo(() => {
    if (!games || games.length === 0) return [];

    const featured = games.filter(
      (g) =>
        g.tags &&
        g.tags.some((t) => t.toLowerCase() === FEATURED_TAG.toLowerCase())
    );

    const finalSelection =
      featured.length >= SPOTLIGHT_COUNT
        ? featured.slice(0, SPOTLIGHT_COUNT)
        : [...featured, ...games.filter((g) => !featured.includes(g))].slice(
            0,
            SPOTLIGHT_COUNT
          );

    return finalSelection;
  }, [games]);

  // 2. Auto-Rotation Logic
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % spotlightItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [spotlightItems.length, isPaused]);

  if (spotlightItems.length === 0) return null;

  const activeSpotlight = spotlightItems[spotlightIndex];

  return (
    <section 
      className="relative w-full group py-6 md:py-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* --- Ambient Glow Background --- */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-4xl opacity-30 md:opacity-20 transition-all duration-1000">
        <img
          key={`bg-${activeSpotlight.slug}`}
          src={activeSpotlight.image}
          alt="Ambient"
          className="w-full h-full object-cover blur-3xl scale-125 animate-in fade-in duration-1000"
        />
        <div className="absolute inset-0 bg-[#0b0f19]/60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* --- MAIN HERO (Left Side) --- */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 h-112 md:h-128 group-hover:border-white/20 transition-all bg-[#0F1219]">
          
          {/* Main Image */}
          <img
            key={activeSpotlight.id || activeSpotlight.slug}
            src={activeSpotlight.image}
            className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in-105 duration-1000"
            alt={activeSpotlight.title}
          />
          
          {/* Gradient Overlay (Fixed v4 Syntax) */}
          <div className="absolute inset-0 bg-linear-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent opacity-95" />

          {/* Content Container */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 z-20">
            
            {/* Top Badges */}
            <div className="flex items-center gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-700 delay-100">
              <span className="bg-ruby text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-ruby-900/40 border border-white/10 flex items-center gap-2">
                <Sparkles size={10} className="fill-current" /> Spotlight
              </span>
              {activeSpotlight.developer && (
                <span className="bg-white/10 backdrop-blur-md text-slate-100 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">
                  {activeSpotlight.developer}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-none tracking-tighter drop-shadow-2xl animate-in slide-in-from-bottom-3 duration-700 delay-200 uppercase italic">
              {activeSpotlight.title}
            </h2>

            {/* Description */}
            <p className="text-slate-300 mb-8 line-clamp-2 text-sm md:text-base max-w-xl leading-relaxed drop-shadow-md animate-in slide-in-from-bottom-4 duration-700 delay-300 font-medium">
              {activeSpotlight.description}
            </p>

            {/* Action Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-bottom-5 duration-700 delay-500">
              
              {/* Play Button */}
              <Link
                href={`/view/${activeSpotlight.slug}`}
                className="bg-white text-black hover:bg-ruby-500 hover:text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-[0.15em] transition-all flex items-center gap-3 hover:scale-105 active:scale-95 shadow-xl shadow-black/20 w-fit"
              >
                <Play size={16} fill="currentColor" /> Play Now
              </Link>

              {/* === SLIDE INDICATORS === */}
              <div className="flex items-center gap-2 md:gap-3 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/5 w-fit">
                {spotlightItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSpotlightIndex(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`
                      relative h-1.5 rounded-full transition-all duration-500 overflow-hidden
                      ${spotlightIndex === idx ? "w-10 md:w-14 bg-ruby-500 shadow-[0_0_10px_rgba(224,17,95,0.5)]" : "w-2 md:w-3 bg-white/20 hover:bg-white/40"}
                    `}
                  >
                     {/* Progress Fill Animation for Active Slide */}
                     {spotlightIndex === idx && !isPaused && (
                        <div className="absolute inset-0 bg-white/30 animate-[progress_6s_linear]" />
                     )}
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* --- SIDEBAR LIST (Right Side - Desktop Only) --- */}
        {/* Fixed: Removed h-full, used specific height h-128 to match Hero */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-3 h-128">
          {/* Header */}
          <div className="flex items-center justify-between px-2 mb-1 pb-2 border-b border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Spotlight
            </span>
          </div>

          {/* List Items */}
          <div className="flex flex-col p-1 gap-3 h-full overflow-y-auto pr-1">
            {spotlightItems.map((game, idx) => {
              const isActive = spotlightIndex === idx;
              return (
                <div
                  key={`${game.id}-thumb-${idx}`}
                  onClick={() => setSpotlightIndex(idx)}
                  className={`
                    relative flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 group/item border
                    ${
                      isActive
                        ? "bg-[#161B26] border-ruby-500/50 shadow-lg shadow-ruby-900/10 scale-[1.02] z-10"
                        : "bg-[#0F131F] border-white/5 hover:bg-[#161B26] hover:border-white/10 opacity-60 hover:opacity-100"
                    }
                  `}
                >
                  {/* Thumbnail */}
                  <div className="relative size-14 shrink-0 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={game.image}
                      className="size-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                      alt=""
                    />
                    {isActive && <div className="absolute inset-0 bg-ruby-500/10 mix-blend-overlay" />}
                  </div>

                  {/* Text Info */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-bold truncate text-sm mb-1 transition-colors uppercase italic ${
                        isActive ? "text-white" : "text-slate-400 group-hover/item:text-slate-200"
                      }`}
                    >
                      {game.title}
                    </h4>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block">
                       {game.tags?.[0] || "Game"}
                    </span>
                  </div>

                  {/* Active Indicator */}
                  <div className="pr-1">
                    {isActive ? (
                      <div className="size-8 rounded-full bg-ruby-600 flex items-center justify-center shadow-lg shadow-ruby-600/30 animate-in zoom-in duration-300">
                        <Gamepad2 size={14} className="text-white fill-white/20" />
                      </div>
                    ) : (
                      <ChevronDown
                        className="-rotate-90 text-slate-700 group-hover/item:text-slate-500 transition-colors"
                        size={16}
                      />
                    )}
                  </div>

                  {/* Active Border Glow */}
                  {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-ruby-500 rounded-r-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}