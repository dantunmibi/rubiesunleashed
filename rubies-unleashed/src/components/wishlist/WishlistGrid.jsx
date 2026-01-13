"use client";

import React, { useState } from "react";
import { Heart, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { getSmartTag, getTagStyle, getPlatformInfo } from "@/lib/game-utils";

/**
 * WISHLIST GRID COMPONENT (ENHANCED)
 * 
 * Displays saved games with always-visible metadata:
 * - Platform badge (top-left)
 * - Remove button (top-right, always visible)
 * - "Added X ago" timestamp (bottom)
 * - Smart tag
 * 
 * Features:
 * - Confirmation modal before deletion
 * - Smooth animations
 * - Responsive grid layout
 */

// ✅ MOVED: formatTimeAgo function directly into component (no external dependency)
function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  const months = Math.floor(diff / 2592000000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return `${months}mo ago`;
}

export default function WishlistGrid({ games, onRemove }) {
  const [confirmingRemove, setConfirmingRemove] = useState(null);

  const handleRemoveClick = (game, e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmingRemove(game);
  };

  const confirmRemove = () => {
    if (confirmingRemove) {
      onRemove(confirmingRemove.id);
      setConfirmingRemove(null);
    }
  };

  const cancelRemove = () => {
    setConfirmingRemove(null);
  };

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        {games.map((game, index) => {
          const smartTag = getSmartTag(game.tags);
          const tagStyle = getTagStyle(smartTag);
          const platformInfo = getPlatformInfo(game, game.tags);
          const timeAgo = game.addedAt ? formatTimeAgo(game.addedAt) : "Recently";

          return (
            <Link 
              key={game.id}
              href={`/view/${game.slug}`}
              className="group relative aspect-[3/4.5] w-full cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-(--user-accent)/10 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Image Layer */}
              <div className="absolute inset-0 w-full h-full overflow-hidden rounded-xl bg-slate-900">
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  loading="lazy"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-[#0b0f19] via-[#0b0f19]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              </div>

              {/* Platform Badge (Top Left - Always Visible) */}
              <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-slate-300 text-[10px] font-bold uppercase tracking-wide shadow-lg">
                <span className="text-white">{platformInfo.icon}</span>
              </div>

              {/* Remove Button (Top Right - Always Visible) */}
              <button
                onClick={(e) => handleRemoveClick(game, e)}
                className="absolute top-2 right-2 z-30 p-2 bg-black/80 backdrop-blur-md border border-(--user-accent)/30 rounded-full text-(--user-accent) hover:bg-(--user-accent) hover:text-white transition-all duration-300 shadow-lg hover:scale-110 active:scale-95"
                aria-label="Remove from wishlist"
              >
                <Heart size={16} fill="currentColor" />
              </button>

              {/* Text Content Layer */}
              <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end z-10">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded w-fit mb-2 border backdrop-blur-md ${tagStyle}`}>
                  {game.type === 'App' ? "SOFTWARE" : "GAME"}
                </span>
                <h4 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md group-hover:text-(--user-accent)-light transition-colors mb-2">
                  {game.title}
                </h4>
                
                {/* Added Timestamp (Always Visible) */}
                <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                  <Clock size={10} />
                  <span>Added {timeAgo}</span>
                </div>
              </div>
              
              {/* Hover Border Glow */}
              <div className="absolute inset-0 rounded-xl border border-white/5 group-hover:border-(--user-accent)/50 transition-colors pointer-events-none" />
            </Link>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmingRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans selection:bg-(--user-accent) selection:text-white">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={cancelRemove}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-surface border border-(--user-accent)/20 rounded-xl shadow-[0_0_60px_rgba(224,17,95,0.2)] p-8 animate-in zoom-in-95 duration-300">
            {/* (--user-accent) Scanline */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-(--user-accent) to-transparent opacity-50" />

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-(--user-accent)/30 blur-2xl rounded-full animate-pulse" />
                <div className="relative border border-(--user-accent) p-4 rounded-xl bg-black shadow-[0_0_30px_rgba(224,17,95,0.4)]">
                  <AlertTriangle size={48} className="text-(--user-accent)" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-black text-white uppercase tracking-tight text-center mb-2">
              Remove <span className="text-(--user-accent)">Gem</span>?
            </h3>

            {/* Message */}
            <p className="text-slate-400 text-sm text-center mb-2 leading-relaxed">
              Remove <span className="text-white font-bold">{confirmingRemove.title}</span> from your wishlist?
            </p>

            <p className="text-slate-500 text-xs text-center mb-8">
              You can always add it back later.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={confirmRemove}
                className="flex-1 bg-(--user-accent) text-white px-6 py-3 rounded-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(224,17,95,0.3)] text-xs"
              >
                Remove
              </button>
              <button
                onClick={cancelRemove}
                className="flex-1 px-6 py-3 rounded-sm border border-white/10 hover:bg-white/5 text-slate-400 font-bold uppercase tracking-widest transition-all text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}