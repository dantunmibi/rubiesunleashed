"use client";

/* 
  💎 RUBIES UNLEASHED - Client View Component
  -------------------------------------------
  - Handles interactivity (Wishlist, Modals)
  - Accepts server-fetched data (initialGame) for instant hydration
  - Preserves all original UI logic and smart recommendations
*/

import React, { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { fetchGameById, fetchGames } from "@/lib/blogger";
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

// Helper: Fisher-Yates Shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ViewClient({ slug, initialGame }) {
  // Use initialGame if provided (Server Side Hydration), otherwise null
  const [game, setGame] = useState(initialGame || null);
  const [similarGames, setSimilarGames] = useState([]);
  
  // Only loading if we didn't get initial data
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
        let currentGame = game;

        // If no initial data, fetch it now (Client Side Fallback)
        if (!currentGame && slug) {
          const parts = slug.split("-");
          const gameId = parts[parts.length - 1].replace(/\.[^/.]+$/, "");
          
          if (gameId) {
            const data = await fetchGameById(gameId);
            if (isMounted && data) {
              setGame(data);
              currentGame = data;
            }
          }
        }

        // --- 🧠 SMART RECOMMENDATION LOGIC (Preserved) ---
        if (currentGame) {
            const allGames = await fetchGames(1000); // Fetch candidate pool

            // 1. Priority A: Developer Matches (Exact match, ignore "Unknown")
            const devMatches = allGames.filter((g) => 
                g.id !== currentGame.id &&
                g.developer && 
                currentGame.developer && 
                g.developer !== "Unknown" &&
                g.developer.trim().toLowerCase() === currentGame.developer.trim().toLowerCase()
            );

            // 2. Priority B: Tag Matches (Exclude if already found in Dev Matches)
            const currentTags = Array.isArray(currentGame.tags) ? currentGame.tags : [];
            const tagMatches = allGames.filter((g) => {
                if (g.id === currentGame.id) return false;
                if (devMatches.some(dm => dm.id === g.id)) return false; // Prevent duplicates
                if (!Array.isArray(g.tags)) return false;
                return g.tags.some(t => currentTags.includes(t));
            });
            
            // 3. Merge: Shuffled Devs first, then Shuffled Tags
            const finalSelection = [
                ...shuffleArray(devMatches),
                ...shuffleArray(tagMatches)
            ].slice(0, 4);

            if (isMounted) setSimilarGames(finalSelection);
        }

      } catch (err) {
        console.error("Game Load Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();

    return () => {
      isMounted = false;
    };
  }, [slug, game]); // Dependency on game ensures recommendations run after hydration

  if (loading)
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <Loader2 className="animate-spin text-ruby" size={48} />
      </div>
    );

  // 💎 NEUTRAL NOT FOUND STATE
  if (!game)
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
      {/* ✅ Content Warning Modal - Shows BEFORE any content */}
      {game.contentWarnings && game.contentWarnings.length > 0 && (
        <ContentWarningModal warnings={game.contentWarnings} gameId={game.id} />
      )}

      <div className="hidden md:block">
        <Navbar />
      </div>
      
      {/* 
         GameHero handles the visual distinction (Ruby vs Cyan) internally 
         based on game.type or tags passed to it.
      */}
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

      <SimilarGames games={similarGames} />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        onContinueAsGuest={handleContinueAsGuest}
      />
      <Footer />
    </div>
  );
}