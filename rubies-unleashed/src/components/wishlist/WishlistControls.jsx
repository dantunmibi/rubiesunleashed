"use client";

import React, { useState } from "react";
import { Search, SortAsc, Share2, Trash2, Check, X } from "lucide-react";

/**
 * WISHLIST CONTROLS COMPONENT
 * 
 * Sticky control bar with search, sort, filter, and actions.
 * Features:
 * - Live search input
 * - Sort dropdown (Date, A-Z, Type)
 * - Filter chips (All, Games, Apps)
 * - Share button (native + fallback)
 * - Clear All button
 */

export default function WishlistControls({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterType,
  onFilterChange,
  onShare,
  onClearAll,
  itemCount,
}) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const sortOptions = [
    { value: "dateAdded-desc", label: "Newest First" },
    { value: "dateAdded-asc", label: "Oldest First" },
    { value: "alphabetical-asc", label: "A → Z" },
    { value: "alphabetical-desc", label: "Z → A" },
    { value: "type", label: "By Type" },
  ];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "games", label: "Games" },
    { value: "apps", label: "Apps" },
  ];

  const handleShare = async () => {
    const success = await onShare();
    if (success) {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-white/5 py-4 mb-8">
      <div className="flex flex-col gap-4">
        {/* Top Row: Search + Actions */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ruby/50 focus:ring-1 focus:ring-ruby/30 transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-slate-300 hover:border-ruby/30 hover:text-white transition-all whitespace-nowrap"
            >
              <SortAsc size={16} />
              <span className="hidden md:inline">
                {sortOptions.find((opt) => opt.value === sortBy)?.label}
              </span>
              <span className="md:hidden">Sort</span>
            </button>

            {/* Sort Menu */}
            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                        sortBy === option.value
                          ? "bg-ruby/20 text-ruby"
                          : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      {option.label}
                      {sortBy === option.value && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="relative flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-slate-300 hover:border-ruby/30 hover:text-ruby transition-all whitespace-nowrap overflow-hidden"
          >
            <Share2 size={16} className={shareSuccess ? "animate-bounce" : ""} />
            <span className="hidden md:inline">
              {shareSuccess ? "Copied!" : "Share"}
            </span>
            {shareSuccess && (
              <div className="absolute inset-0 bg-ruby/20 animate-pulse" />
            )}
          </button>

          {/* Clear All Button */}
          {itemCount > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all whitespace-nowrap"
            >
              <Trash2 size={16} />
              <span className="hidden md:inline">Clear All</span>
            </button>
          )}
        </div>

        {/* Bottom Row: Filter Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                filterType === option.value
                  ? "bg-ruby text-white shadow-[0_0_20px_rgba(224,17,95,0.3)]"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}