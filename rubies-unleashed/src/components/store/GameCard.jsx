"use client";

import React from "react";
import Link from "next/link";
import { getSmartTag, getTagStyle } from "@/lib/game-utils";

export default function GameCard({ game, onClick, priority = false }) {
  if (!game) return null;

  const smartTag = getSmartTag(game.tags);
  const tagStyle = getTagStyle(smartTag);

  // Common Inner Content
  const CardContent = () => (
    <>
      {/* Image Layer */}
      <div className="absolute inset-0 w-full h-full overflow-hidden rounded-xl bg-slate-900">
        <img 
          src={game.image} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          loading={priority ? "eager" : "lazy"}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0b0f19] via-[#0b0f19]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      </div>

      {/* Text Content Layer */}
      <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end z-10">
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded w-fit mb-2 border backdrop-blur-md ${tagStyle}`}>
          {game.type === 'App' ? "SOFTWARE" : "GAME"}
        </span>
        <h4 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md group-hover:text-ruby-light transition-colors">
          {game.title}
        </h4>
      </div>
      
      {/* Hover Border Glow */}
      <div className="absolute inset-0 rounded-xl border border-white/5 group-hover:border-ruby/50 transition-colors pointer-events-none" />
    </>
  );

  // Class Wrapper
  const wrapperClass = "group relative aspect-[3/4.5] w-full cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-ruby/10";

  // If onClick is provided, render as div (for Modal)
  if (onClick) {
    return (
      <div onClick={() => onClick(game)} className={wrapperClass}>
        <CardContent />
      </div>
    );
  }

  // Otherwise, render as Link (for Navigation)
  return (
    <Link href={`/view/${game.slug}`} className={wrapperClass}>
      <CardContent />
    </Link>
  );
}