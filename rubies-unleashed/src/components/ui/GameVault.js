"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { fetchGames } from "@/lib/blogger";
import Link from "next/link";
import GameCard from "@/components/store/GameCard"; // ✅ IMPORT

export default function GameVault() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Fetch 8 for a nice grid
      const data = await fetchGames(8);
      setGames(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ruby/10 border border-ruby/20 text-ruby font-black tracking-widest uppercase text-[10px] mb-3">
            <Sparkles size={12} /> New Arrivals
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            TREASURE VAULT
          </h2>
        </div>
        <Link
          href="/explore"
          className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
        >
          View Full Collection{" "}
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform text-ruby"
          />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="animate-spin text-ruby" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {games.map((game, idx) => (
            // ✅ USING THE REUSABLE CARD
            // We use Link mode here (no onClick passed)
            <GameCard key={idx} game={game} />
          ))}
        </div>
      )}

      {/* Mobile View All Button */}
      <div className="mt-12 flex justify-center md:hidden">
        <Link
          href="/explore"
          className="w-full text-center px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-white/10 transition-all"
        >
          Explore All Games
        </Link>
      </div>
    </section>
  );
}
