import React from "react";
import VaultHeader from "./VaultHeader";
import VaultFilters from "./VaultFilters";
import GameGrid from "./GameGrid";

export default function VaultSection({
  filteredGames,
  visibleGames,
  filters,
  allTags,
  topTags,
  ribbonTags,
  onSearch,
  onPlatformClick,
  onSubPlatformClick,
  onGenreClick,
  onLoadMore,
  onClearFilters,
  onGameClick,
}) {
  return (
    <section id="vault" className="flex flex-col gap-0 relative min-h-125">
      <div className="sticky md:relative top-0 z-30 bg-[#0b0f19]/95 backdrop-blur-xl border-white/5 pb-4 pt-4 -mx-4 px-4 md:mx-0 md:px-0 transition-all">
        <VaultHeader
          gameCount={filteredGames.length}
          searchQuery={filters.searchQuery}
          onSearch={onSearch}
        />

        <VaultFilters
          filters={filters}
          allTags={allTags}
          ribbonTags={ribbonTags}
          onPlatformClick={onPlatformClick}
          onSubPlatformClick={onSubPlatformClick}
          onGenreClick={onGenreClick}
        />
      </div>

      <div className="pt-6">
        <GameGrid
          visibleGames={visibleGames}
          totalGames={filteredGames.length}
          visibleCount={filters.visibleCount}
          onLoadMore={onLoadMore}
          onClearFilters={onClearFilters}
          onGameClick={onGameClick}
        />
      </div>
    </section>
  );
}