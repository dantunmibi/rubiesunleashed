import React from "react";
import { ChevronDown } from "lucide-react";
import GameCard from "@/components/store/GameCard";

export default function GameGrid({
  games, // ✅ New standard prop
  visibleGames, // Legacy prop
  totalGames,
  visibleCount,
  onLoadMore,
  onClearFilters,
  onGameClick,
  onRemove // For Wishlist
}) {
  // ✅ Unified Data Source
  // If 'games' is passed, use it. If 'visibleGames' is passed, use it.
  const data = games || visibleGames || [];

  if (!Array.isArray(data) || data.length === 0) {
    // Only show "No treasures" if specific prop is set (Explore Page mode)
    if (onClearFilters) {
        return (
        <div className="py-20 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
            <p className="text-lg">No treasures found.</p>
            <button
            onClick={onClearFilters}
            className="text-ruby font-bold mt-2 hover:underline"
            >
            Clear Filters
            </button>
        </div>
        );
    }
    return null; // For dashboard sections, just hide if empty
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        {data.map((game, idx) => (
          // Pass onRemove for Wishlist grid
          <GameCard key={game.id || idx} game={game} onClick={onGameClick} onRemove={onRemove} />
        ))}
      </div>
      
      {/* Only show Load More if logic props are provided */}
      {onLoadMore && visibleCount < totalGames && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            className="flex items-center gap-2 px-8 py-3 bg-surface hover:bg-white hover:text-black border border-white/10 rounded-xl font-bold transition-all uppercase text-xs tracking-widest group"
          >
            Load More Gems{" "}
            <ChevronDown
              size={16}
              className="group-hover:translate-y-1 transition-transform"
            />
          </button>
        </div>
      )}
    </>
  );
}