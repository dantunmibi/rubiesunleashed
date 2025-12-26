"use client";

import React, { useEffect, useState, use } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { fetchGameById, fetchGames } from "@/lib/blogger";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import GameHero from "@/components/store/GameHero";
import GameMedia from "@/components/store/GameMedia";
import GameContent from "@/components/store/GameContent";
import GameSidebar from "@/components/store/GameSidebar";
import DownloadCallout from "@/components/store/DownloadCallout";
import SimilarGames from "@/components/store/SimilarGames";

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
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        let gameId = null;
        if (slug) {
          const parts = slug.split("-");
          gameId = parts[parts.length - 1].replace(/\.[^/.]+$/, "");
        }

        if (gameId) {
          const data = await fetchGameById(gameId);
          if (isMounted && data) {
            setGame(data);

            // Wishlist
            const saved = JSON.parse(
              localStorage.getItem("ruby_wishlist") || "[]"
            );
            setIsWishlisted(saved.some((g) => g.id === data.id));

            // Similar Games
            const allGames = await fetchGames(50);

            // Safe Filter
            const currentTags = Array.isArray(data.tags) ? data.tags : [];
            let related = allGames.filter((g) => {
              // Ensure g and g.tags exist
              if (!g || !Array.isArray(g.tags)) return false;
              if (g.id === data.id) return false;
              return g.tags.some((t) => currentTags.includes(t));
            });

            if (related.length < 4) {
              const others = allGames.filter(
                (g) => g && g.id !== data.id && !related.includes(g)
              );
              related = [...related, ...others];
            }

            const shuffled = shuffleArray(related);
            setSimilarGames(shuffled.slice(0, 4));
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

  const toggleWishlist = () => {
    if (!game) return;
    const saved = JSON.parse(localStorage.getItem("ruby_wishlist") || "[]");
    if (isWishlisted) {
      const filtered = saved.filter((g) => g.id !== game.id);
      localStorage.setItem("ruby_wishlist", JSON.stringify(filtered));
      setIsWishlisted(false);
    } else {
      saved.push(game);
      localStorage.setItem("ruby_wishlist", JSON.stringify(saved));
      setIsWishlisted(true);
    }
  };

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
      <Navbar />
      <GameHero
        game={game}
        isWishlisted={isWishlisted}
        toggleWishlist={toggleWishlist}
      />

      <main className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <GameMedia game={game} />
          <GameContent game={game} />
          <DownloadCallout game={game} />
        </div>

        {/* Only render sidebar if game is valid object */}
        {game && typeof game === "object" && <GameSidebar game={game} />}
      </main>

      <SimilarGames games={similarGames} />
      <Footer />
    </div>
  );
}
