"use client";

import React, { useEffect, useState } from "react";
import { Star, Gem, Play, LockKeyhole, Unlock } from "lucide-react";
import { fetchGames } from "@/lib/blogger";
import Link from "next/link"; 

const FEATURED_TAG = "Featured"; 

export default function GiantRuby() {
  const [featured, setFeatured] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // ✅ NEW: Toggle State

  useEffect(() => {
    async function load() {
      const data = await fetchGames(20);
      let topPicks = data.filter(g => 
        g.tags && g.tags.some(t => t.toLowerCase() === FEATURED_TAG.toLowerCase())
      );
      if (topPicks.length < 2) topPicks = data.slice(0, 2);
      setFeatured(topPicks.slice(0, 2));
    }
    load();
  }, []);

  // Helper to merge "Open State" vs "Hover State" logic
  // If open (clicked), apply the transformation. If not, rely on group-hover.
  const getTransform = (openClass, hoverClass) => {
    return isOpen ? openClass : hoverClass;
  };

  return (
    <div 
        onClick={() => setIsOpen(!isOpen)} // ✅ Click to Toggle
        className="relative flex justify-center items-center order-1 lg:order-2 group/ruby perspective-[1000px] cursor-pointer h-125 select-none"
    >
      
      {/* 1. MYSTERIOUS GLOW (Pulsing) */}
      <div 
        className={`absolute inset-0 bg-linear-to-tr from-ruby/40 via-ruby-dark/20 to-transparent blur-[90px] rounded-full transition-all duration-700 animate-pulse ${
            getTransform("scale-125 bg-ruby/50", "group-hover/ruby:scale-125 group-hover/ruby:bg-ruby/50")
        }`}
      />

      {/* 2. REVEALED CONTENT (The Treasure) */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 z-20 delay-100 ${
            getTransform("opacity-100 scale-100 pointer-events-auto", "opacity-0 scale-90 pointer-events-none group-hover/ruby:opacity-100 group-hover/ruby:scale-100 group-hover/ruby:pointer-events-auto")
        }`}
      >
        <div className="mb-6 flex items-center gap-2 text-white animate-in fade-in slide-in-from-bottom-2 duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
          <Unlock size={14} className="text-ruby-light" />
          <span className="text-xs font-black tracking-[0.3em] uppercase text-ruby-light">Vault Unlocked</span>
          <Unlock size={14} className="text-ruby-light" />
        </div>

        <div className="flex gap-6 -rotate-2">
          {featured.length > 0 ? featured.map((game, i) => (
            <Link 
              key={i} 
              href={`/view/${game.slug}`} 
              onClick={(e) => e.stopPropagation()} // Stop click from closing the ruby
              className={`w-40 h-60 bg-[#161b2c]/90 backdrop-blur-xl border border-ruby/40 rounded-2xl p-3 shadow-[0_0_30px_rgba(224,17,95,0.2)] flex flex-col transform hover:scale-110 hover:-translate-y-2 hover:border-ruby hover:shadow-ruby/40 transition-all duration-300 ${i === 1 ? 'mt-8' : ''}`}
            >
              <div className="h-32 w-full bg-slate-900 rounded-xl mb-3 relative overflow-hidden shadow-inner group">
                 {game.image && <img src={game.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={game.title} />}
                 <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                 <span className="absolute bottom-2 left-2 text-[9px] font-black text-white uppercase bg-ruby px-1.5 py-0.5 rounded shadow-lg shadow-ruby/50">
                    {game.tag || "Gem"}
                 </span>
              </div>
              
              <h4 className="font-black text-sm text-white mb-1 leading-tight line-clamp-2 drop-shadow-md">{game.title}</h4>
              
              <div className="mt-auto flex items-center justify-between w-full pt-2 border-t border-white/5">
                 <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">Claim</span>
                 <div className="w-6 h-6 rounded-full bg-ruby flex items-center justify-center text-white shadow-lg shadow-ruby/30">
                    <Play size={10} fill="currentColor" />
                 </div>
              </div>
            </Link>
          )) : (
             <div className="text-ruby font-black animate-pulse text-xl">Decrypting...</div>
          )}
        </div>
      </div>

      {/* 3. THE RUBY SHELL (The Lock) */}
      <div 
        className={`relative w-80 h-112 transition-all duration-700 ease-out animate-float ${
            getTransform("scale-110", "group-hover/ruby:scale-110")
        }`}
      >
        
        {/* Left Shard */}
        <div 
          className={`absolute inset-0 z-10 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              getTransform("-translate-x-48 -rotate-12 opacity-0", "group-hover/ruby:-translate-x-48 group-hover/ruby:-rotate-12 group-hover/ruby:opacity-0")
          }`}
          style={{ clipPath: 'polygon(50% 0%, 50% 100%, 0% 75%, 0% 25%)' }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-ruby-light via-ruby to-ruby-dark shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
          <div className="absolute inset-0 bg-white/20" style={{ clipPath: 'polygon(0% 25%, 50% 0%, 25% 50%)' }}></div>
        </div>

        {/* Right Shard */}
        <div 
          className={`absolute inset-0 z-10 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              getTransform("translate-x-48 rotate-12 opacity-0", "group-hover/ruby:translate-x-48 group-hover/ruby:rotate-12 group-hover/ruby:opacity-0")
          }`}
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%)' }}
        >
          <div className="absolute inset-0 bg-linear-to-bl from-ruby-light via-ruby to-ruby-dark shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
          <div className="absolute inset-0 bg-black/30" style={{ clipPath: 'polygon(50% 100%, 100% 75%, 75% 50%)' }}></div>
        </div>

        {/* 4. THE INVITATION (Core Pulse) */}
        <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-40 bg-white shadow-[0_0_30px_#fff] blur-md rounded-full transition-opacity duration-200 animate-pulse z-20 ${
                getTransform("opacity-0", "group-hover/ruby:opacity-0")
            }`}
        />
        
        {/* Floating Hint Text */}
        <div 
            className={`absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-500 ${
                getTransform("opacity-0 translate-y-4", "group-hover/ruby:opacity-0 group-hover/ruby:translate-y-4")
            }`}
        >
            <div className="text-white/50 animate-bounce">
                <LockKeyhole size={20} />
            </div>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40 whitespace-nowrap">
                {isOpen ? "" : "Tap to Unlock"}
            </span>
        </div>
        
      </div>
    </div>
  );
}