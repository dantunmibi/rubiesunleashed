"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { fetchGames } from "@/lib/blogger";
import GameModal from "@/components/ui/GameModal";
import SpotlightHero from "./SpotlightHero";
import SpecialCollections from "./SpecialCollections";
import VaultSection from "./VaultSection";
import ScrollToTopButton from "./ScrollToTopButton";
import { useGameFilters } from "@/hooks/useGameFilters";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";

export default function ExploreContent() {
  const searchParams = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  const {
    filters,
    updateSearch,
    updatePlatform,
    updateSubPlatform,
    updateGenre,
    updateCollection,
    clearAllFilters,
    filteredGames,
    visibleGames,
    loadMore,
    allTags,
    topTags,
    ribbonTags,
  } = useGameFilters(games, searchParams);

  const { showScrollTop, scrollToTop, scrollToVault } = useScrollBehavior();

  // Load games data
  useEffect(() => {
    async function load() {
      const data = await fetchGames(1000);
      setGames(data);
      setLoading(false);
    }
    load();
  }, []);

  // Auto-scroll to vault when filters change
  useEffect(() => {
    if (!loading) {
      const hasActiveFilters = 
        filters.searchQuery || 
        filters.selectedPlatform !== "All" || 
        filters.selectedCollection;

      if (hasActiveFilters) {
        setTimeout(() => {
          scrollToVault();
        }, 100);
      }
    }
  }, [
    filters.searchQuery,
    filters.selectedPlatform,
    filters.selectedCollection,
    loading,
    scrollToVault,
  ]);

  if (loading) {
    return (
      <main className="md:pt-4 pb-24 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="h-96 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-ruby mb-4" size={48} />
          <p className="text-slate-500 font-bold animate-pulse">
            Opening the Vault...
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="md:pt-4 pb-24 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-16 pt-20">
          <SpotlightHero games={games} />
          
      <SpecialCollections games={games} /> 

          <VaultSection
            filteredGames={filteredGames}
            visibleGames={visibleGames}
            filters={filters}
            allTags={allTags}
            topTags={topTags}
            ribbonTags={ribbonTags}
            onSearch={updateSearch}
            onPlatformClick={updatePlatform}
            onSubPlatformClick={updateSubPlatform}
            onGenreClick={updateGenre}
            onLoadMore={loadMore}
            onClearFilters={clearAllFilters}
            onGameClick={setSelectedGame}
          />
        </div>
      </main>

      <ScrollToTopButton show={showScrollTop} onClick={scrollToTop} />

      {selectedGame && (
        <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </>
  );
}