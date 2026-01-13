"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getUnifiedFeed } from "@/lib/game-service-client";
import GameModal from "@/components/ui/GameModal";
import SpotlightHero from "./SpotlightHero";
import SpecialCollections from "./SpecialCollections";
import VaultSection from "./VaultSection";
import ScrollToTopButton from "./ScrollToTopButton";
import { useGameFilters } from "@/hooks/useGameFilters";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";

export default function ExploreContent({ triggerError }) { // ✅ Accept triggerError prop
  const searchParams = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loadError, setLoadError] = useState(null);

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

  // ✅ SAFETY VALVE: 5-second timeout (same as Dashboard)
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        console.warn("Explore content loading timed out (5s). Triggering session recovery.");
        setLoading(false);
        if (triggerError) triggerError();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [loading, triggerError]);

  // ✅ Load unified games data (Blogger + Supabase)
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setLoadError(null);
        
        // ✅ Use client-safe unified feed
        const data = await getUnifiedFeed({ 
          limit: 1000,
          includeArchived: false // Only show published projects
        });
        
        console.log(`📊 Loaded ${data.length} items from unified feed`);
        
        // Log the mix of content sources
        const bloggerCount = data.filter(g => g.source !== 'supabase').length;
        const supabaseCount = data.filter(g => g.source === 'supabase').length;
        console.log(`📊 Content mix: ${bloggerCount} Blogger + ${supabaseCount} Community`);
        
        setGames(data);
      } catch (error) {
        console.error('❌ Failed to load games:', error);
        setLoadError(error.message);
        
        // Fallback: Try to load just Blogger games if unified feed fails
        try {
          const { fetchGames } = await import('@/lib/blogger');
          const fallbackData = await fetchGames(1000);
          console.log('🔄 Fallback to Blogger-only feed');
          setGames(fallbackData);
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          setGames([]); // Empty state
        }
      } finally {
        setLoading(false);
      }
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

  if (loadError && games.length === 0) {
    return (
      <main className="md:pt-4 pb-24 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="h-96 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-slate-400 font-bold mb-2">Failed to load content</p>
          <p className="text-slate-600 text-sm mb-4">{loadError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-ruby text-white rounded-lg hover:bg-ruby/80 transition-colors"
          >
            Retry
          </button>
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