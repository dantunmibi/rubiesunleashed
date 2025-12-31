import React, { useState, useEffect, useRef } from "react";
import { Filter, Grid, X, Box, Layers } from "lucide-react";
import { getTagStyle } from "@/lib/game-utils";

export default function GenreFilter({
  selectedGenre,
  searchQuery,
  allTags,
  ribbonTags,
  onGenreClick,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const ribbonRef = useRef(null);

  // Auto-scroll selected tag into view
  useEffect(() => {
    if (selectedGenre && !isExpanded && ribbonRef.current) {
      // Determine which button to scroll to
      const targetId = selectedGenre === "All" ? "tag-btn-All" : `tag-btn-${selectedGenre}`;
      
      setTimeout(() => {
        const activeBtn = document.getElementById(targetId);
        if (activeBtn) {
          // Calculate center position relative to container
          const container = ribbonRef.current;
          const scrollLeft = 
            activeBtn.offsetLeft - 
            container.offsetLeft - 
            container.clientWidth / 2 + 
            activeBtn.clientWidth / 2;

          container.scrollTo({
            left: scrollLeft,
            behavior: "smooth",
          });
        }
      }, 200);
    }
  }, [selectedGenre, isExpanded]);

  return (
    <div className="relative w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <Filter size={12} />{" "}
          {selectedGenre === "All" ? "Popular Genres" : selectedGenre}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[10px] font-bold text-ruby hover:text-white transition-colors uppercase tracking-wider"
        >
          {isExpanded ? (
            <>
              <X size={12} /> Close
            </>
          ) : (
            <>
              <Grid size={12} /> View All
            </>
          )}
        </button>
      </div>

      {isExpanded ? (
        // EXPANDED GRID VIEW
        <div className="relative border border-white/10 rounded-xl bg-black/40 p-2 animate-in fade-in zoom-in duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {allTags.map((tag) => {
              const isSelected = selectedGenre === tag || searchQuery.toLowerCase() === tag.toLowerCase();
              let styleClass = getTagStyle(tag);
              const isApp = tag === 'App';

              // Apply styling
              if (isSelected) {
                 styleClass = isApp 
                    ? "bg-cyan-500 text-black border-cyan-400" 
                    : "bg-white text-black border-white";
              } else {
                 styleClass = isApp
                    ? "bg-cyan-950/30 text-cyan-400 border-cyan-500/30 hover:border-cyan-400" 
                    : "bg-surface text-slate-400 border-white/5 hover:border-white/20 hover:text-white";
              }

              return (
                <button
                  key={tag}
                  onClick={() => onGenreClick(tag)}
                  className={`px-3 py-2 rounded-md text-[10px] font-bold border transition-all truncate text-left ${styleClass}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // HORIZONTAL RIBBON VIEW
        <div 
          ref={ribbonRef} 
          className="flex overflow-x-auto gap-2 py-2 px-1 no-scrollbar"
        >
          {/* 1. MANUAL "ALL" BUTTON (Always First) */}
          <button
            id="tag-btn-All"
            onClick={() => onGenreClick("All")}
            className={`
                shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border
                ${selectedGenre === "All" 
                    ? "bg-white text-black border-white shadow-lg scale-105" 
                    : "bg-surface text-slate-400 border-white/5 hover:text-white"
                }
            `}
          >
            <Layers size={10} /> All
          </button>

          {/* 2. DYNAMIC TAGS LOOP */}
          {ribbonTags.map((tag) => {
            // Skip "All" if it somehow got into the ribbonTags list to avoid duplicates
            if (tag === "All") return null;

            const isSelected = selectedGenre === tag || searchQuery.toLowerCase() === tag.toLowerCase();
            const isApp = tag === 'App';
            
            let styleClass = getTagStyle(tag);
            
            if (isApp) {
                styleClass = isSelected
                  ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  : "bg-cyan-950/30 text-cyan-400 border-cyan-500/30 hover:border-cyan-400";
            } else {
                if (isSelected) styleClass = "bg-white text-black border-white shadow-lg";
                else styleClass = "bg-surface text-slate-400 border-white/5 hover:text-white";
            }

            return (
              <button
                key={tag}
                id={`tag-btn-${tag}`}
                onClick={() => onGenreClick(tag)}
                className={`
                    shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border 
                    ${isSelected ? "scale-105" : ""}
                    ${styleClass}
                `}
              >
                {isApp && <Box size={10} strokeWidth={3} />} 
                {tag}
              </button>
            );
          })}
        </div>
      )}
      {!isExpanded && (
        <div className="absolute right-0 top-7 bottom-0 w-12 bg-linear-to-l from-[#0b0f19] to-transparent pointer-events-none md:hidden" />
      )}
    </div>
  );
}