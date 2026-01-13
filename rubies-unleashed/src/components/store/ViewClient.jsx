"use client";

/* 
  💎 RUBIES UNLEASHED - Client View Component
  -------------------------------------------
  - Handles interactivity (Wishlist, Modals)
  - Accepts server-fetched data (initialGame) for instant hydration
  - Uses new smart similar games engine
*/

import React, { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { fetchGameById } from "@/lib/blogger"; // ✅ Remove fetchGames import
import { getSimilarGames } from '@/lib/game-service-client';
import { Loader2, PackageOpen } from "lucide-react"; 
import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import AuthModal from "@/components/auth/AuthModal";

import GameHero from "@/components/store/GameHero";
import GameMedia from "@/components/store/GameMedia";
import GameContent from "@/components/store/GameContent";
import GameSidebar from "@/components/store/GameSidebar";
import DownloadCallout from "@/components/store/DownloadCallout";
import SimilarGames from "@/components/store/SimilarGames";
import ContentWarningModal from "@/components/store/ContentWarningModal";

export default function ViewClient({ slug, initialGame }) {
  // ✅ Initialize with server data immediately
  const [game, setGame] = useState(initialGame || null);
  const [similarGames, setSimilarGames] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false); // ✅ Add separate loading state
  
  // ✅ Only loading if we truly have nothing
  const [loading, setLoading] = useState(!initialGame);

  const { 
    isWishlisted, 
    toggleWishlist, 
    showAuthModal, 
    closeAuthModal, 
    handleContinueAsGuest 
  } = useWishlist(game?.id);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        let currentGame = game; // Use state if available (from initialGame)

        // 1. Fetch Game Data ONLY if missing (Client-side navigation fallback)
        if (!currentGame && slug) {
          const parts = slug.split("-");
          const gameId = parts[parts.length - 1].replace(/\.[^/.]+$/, "");
          
          if (gameId) {
            const data = await fetchGameById(gameId);
            if (isMounted) {
              if (data) {
                setGame(data);
                currentGame = data;
              }
              setLoading(false); // Done loading regardless of result
            }
          }
        }

        // ✅ NEW: Smart Similar Games Logic
        if (currentGame && isMounted && similarGames.length === 0) {
          setLoadingSimilar(true);
          
          try {
            const smartSimilarGames = await getSimilarGames({
              currentGameId: currentGame.id,
              currentGameType: currentGame.type,
              currentGameTags: currentGame.tags,
              currentGameDeveloper: currentGame.developer,
              limit: 4 // Get more for better variety
            });

            if (isMounted) {
              setSimilarGames(smartSimilarGames);
              console.log(`🎯 Found ${smartSimilarGames.length} similar games for "${currentGame.title}"`);
            }
          } catch (error) {
            console.error('❌ Similar games fetch failed:', error);
            // Fallback: empty array (component will handle gracefully)
            if (isMounted) setSimilarGames([]);
          } finally {
            if (isMounted) setLoadingSimilar(false);
          }
        }

      } catch (err) {
        console.error("Game Load Error:", err);
        if (isMounted) setLoading(false);
      }
    }
    
    // Only run load logic if we don't have recommendations yet OR we don't have the game
    if (!game || similarGames.length === 0) {
        load();
    }

    return () => {
      isMounted = false;
    };
  }, [slug, initialGame]); // Removed 'game' dependency to prevent loops

  // ✅ 4. The Spinner - STRICT CONDITION
  // Only show if loading AND we have no game data
  if (loading && !game) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <Loader2 className="animate-spin text-ruby" size={48} />
      </div>
    );
  }

  // 💎 NEUTRAL NOT FOUND STATE
  if (!game && !loading)
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center gap-4">
        <PackageOpen size={64} className="text-slate-600 mb-2" />
        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-400">Item Not Found</h2>
        <p className="text-slate-500 max-w-md text-center">
          The item you are looking for might have been moved, removed, or the link is incorrect.
        </p>
        <Link 
          href="/explore" 
          className="mt-4 px-6 py-3 rounded-xl bg-ruby text-white font-bold uppercase tracking-widest text-xs hover:bg-ruby-600 transition-colors shadow-lg shadow-ruby/20"
        >
          Return to Explore
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-ruby/30">
      {/* ✅ Content Warning Modal */}
      {game.contentWarnings && game.contentWarnings.length > 0 && (
        <ContentWarningModal 
          warnings={game.contentWarnings} 
          gameId={game.id} 
          gameType={game.type}
        />
      )}

      <div className="hidden md:block">
        <Navbar />
      </div>
      
      <GameHero
        game={game}
        isWishlisted={isWishlisted}
        onToggleWishlist={() => toggleWishlist(game)}
      />

      <main className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <GameMedia game={game} />
          <GameContent game={game} />
          <DownloadCallout game={game} />
        </div>

        {/* Sidebar Logic */}
        {game && typeof game === "object" && <GameSidebar game={game} />}
      </main>

      {/* ✅ Updated SimilarGames with loading state */}
      <SimilarGames 
        games={similarGames} 
        currentGameType={game.type}
        loading={loadingSimilar} // ✅ Pass loading state
      />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        onContinueAsGuest={handleContinueAsGuest}
      />
      <Footer />
    </div>
  );
}