/**
 * ================================================================
 * WISHLIST CONTROLS COMPONENT
 * ================================================================
 * 
 * Purpose:
 * - Sticky control bar for the wishlist page
 * - Provides Search, Sort, Filter, Share, and Clear actions
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, SortAsc, Share2, Trash2, Check, Filter } from "lucide-react";

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
  isOwner // Add isOwner prop if you want to hide Clear All for visitors
}) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const sortButtonRef = useRef(null);

  const sortOptions = [
    { value: "dateAdded-desc", label: "Newest" },
    { value: "dateAdded-asc", label: "Oldest" },
    { value: "alphabetical-asc", label: "A-Z" },
    { value: "type", label: "Type" },
  ];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "games", label: "Games" },
    { value: "apps", label: "Apps" },
  ];

  const handleShare = async () => {
    // Guard against missing prop
    if (typeof onShare === 'function') {
        const success = await onShare();
        if (success) {
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2000);
        }
    } else {
        console.warn("WishlistControls: onShare prop is missing");
    }
  };

  // Close sort menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortButtonRef.current && !sortButtonRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };
    if (showSortMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortMenu]);

  return (
    // z-35 to sit below Navbar (z-40)
    <div className="w-full sticky top-16 z-35 bg-[#0b0f19]/95 backdrop-blur-xl border-b border-white/5 py-3 px-2 mb-6 transition-all duration-300 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-3">
        
        {/* ROW 1: Search Bar */}
        <div className="relative w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search collection..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-(--user-accent)/50 focus:ring-1 focus:ring-(--user-accent)/30 transition-all"
          />
        </div>

        {/* ROW 2: Command Bar */}
        <div className="relative flex items-center gap-2 overflow-x-visible pb-1 select-none">
          
          {/* Sort Button Wrapper - REF used here */}
          <div className="relative shrink-0" ref={sortButtonRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                showSortMenu 
                ? "bg-white/10 text-white border-white/20" 
                : "bg-transparent text-slate-400 border-white/10 hover:border-white/30"
              }`}
            >
              <SortAsc size={14} />
              <span>{sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort"}</span>
            </button>

            {/* Sort Dropdown - Absolute Positioned */}
            {showSortMenu && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-slate-900 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-xs font-bold transition-colors flex items-center justify-between ${
                      sortBy === option.value
                        ? "bg-(--user-accent)/10 text-(--user-accent)"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {option.label}
                    {sortBy === option.value && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-white/10 shrink-0 mx-1" />

          {/* Filter Chips - Horizontal Scroll Container */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange(option.value)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                  filterType === option.value
                    ? "bg-(--user-accent) text-white border-(--user-accent) shadow-[0_0_15px_rgba(224,17,95,0.3)]"
                    : "bg-transparent text-slate-400 border-white/10 hover:border-white/30"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10 shrink-0 mx-1 ml-auto" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-slate-400 hover:text-(--user-accent) hover:bg-white/5 border border-white/10 transition-all relative active:scale-90 shadow-sm hover:shadow-(--user-accent)/20"
              title="Share Wishlist"
            >
              <Share2 size={16} className={shareSuccess ? "animate-bounce text-(--user-accent)" : ""} />
            </button>

            {/* Clear All Button */}
            {itemCount > 0 && onClearAll && (
              <button
                onClick={onClearAll}
                className="p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-500 border border-red-500/30 hover:border-red-500 transition-all active:scale-90 shadow-sm hover:shadow-red-500/30"
                title="Clear All Items"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}