import React from "react";
import { ChevronDown } from "lucide-react";
import GameCard from "@/components/store/GameCard";

export default function GameGrid({
  visibleGames,
  totalGames,
  visibleCount,
  onLoadMore,
  onClearFilters,
  onGameClick,
}) {
  if (visibleGames.length === 0) {
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

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        {visibleGames.map((game, idx) => (
          <GameCard key={idx} game={game} onClick={onGameClick} />
        ))}
      </div>
      {visibleCount < totalGames && (
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