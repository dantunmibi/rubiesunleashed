"use client";

import React, { useEffect, useState, use } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { fetchGameById, fetchGames } from "@/lib/blogger";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import AuthModal from "@/components/auth/AuthModal";

import GameHero from "@/components/store/GameHero";
import GameMedia from "@/components/store/GameMedia";
import GameContent from "@/components/store/GameContent";
import GameSidebar from "@/components/store/GameSidebar";
import DownloadCallout from "@/components/store/DownloadCallout";
import SimilarGames from "@/components/store/SimilarGames";
import ContentWarningModal from "@/components/store/ContentWarningModal"; // ✅ NEW

// Helper: Fisher-Yates Shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function GameDetails({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [game, setGame] = useState(null);
  const [similarGames, setSimilarGames] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.log('🔍 FULL SLUG:', slug);
        let gameId = null;
        if (slug) {
          const parts = slug.split("-");
          gameId = parts[parts.length - 1].replace(/\.[^/.]+$/, "");
        }

        if (gameId) {
          const data = await fetchGameById(gameId);
          if (isMounted && data) {
            setGame(data);

            // --- 🧠 SMART RECOMMENDATION LOGIC ---
            const allGames = await fetchGames(1000); // Fetch candidate pool

            // 1. Priority A: Developer Matches (Exact match, ignore "Unknown")
            const devMatches = allGames.filter((g) => 
                g.id !== data.id &&
                g.developer && 
                data.developer && 
                g.developer !== "Unknown" &&
                g.developer.trim().toLowerCase() === data.developer.trim().toLowerCase()
            );

            // 2. Priority B: Tag Matches (Exclude if already found in Dev Matches)
            const currentTags = Array.isArray(data.tags) ? data.tags : [];
            const tagMatches = allGames.filter((g) => {
                if (g.id === data.id) return false;
                if (devMatches.some(dm => dm.id === g.id)) return false; // Prevent duplicates
                if (!Array.isArray(g.tags)) return false;
                return g.tags.some(t => currentTags.includes(t));
            });
              // 3. Merge: Shuffled Devs first, then Shuffled Tags
            const finalSelection = [
                ...shuffleArray(devMatches),
                ...shuffleArray(tagMatches)
            ].slice(0, 4);

            setSimilarGames(finalSelection);
          }
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
  }, [slug]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <Loader2 className="animate-spin text-ruby" size={48} />
      </div>
    );

  if (!game)
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Game not found</h2>
        <Link href="/explore" className="text-ruby hover:underline">
          Return to Vault
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

        {game && typeof game === "object" && <GameSidebar game={game} />}
      </main>

      {/* Only render sidebar if game is valid object */}

      <SimilarGames games={similarGames} />
    {/* ✅ ADD THIS: Auth Modal */}
    <AuthModal
      isOpen={showAuthModal}
      onClose={closeAuthModal}
      onContinueAsGuest={handleContinueAsGuest}
    />
      <Footer />
    </div>
  );
}