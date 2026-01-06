// src/app/not-found.js

/**
 * GLOBAL 404 PAGE - "LOST IN THE VAULT"
 * 
 * Features:
 * - Navbar integration for navigation
 * - Subtle glitch aesthetic on "404" text
 * - Popular items using GameCard component
 * - Fetches games from blogger API with Featured tag priority
 * - Modular design reusing existing components
 * - All animations in globals.css
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import GameCard from "@/components/store/GameCard";
import { fetchGames } from "@/lib/blogger";
import { 
  SearchIcon, 
  HomeIcon, 
  CompassIcon,
  LockKeyhole
} from "lucide-react";

const FEATURED_TAG = "Featured";
const SUGGESTION_COUNT = 6;

export default function NotFound() {
  const [popularItems, setPopularItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch popular items using SpotlightHero logic
  useEffect(() => {
    async function loadPopularItems() {
      try {
        const data = await fetchGames(100);
        
        // Filter for "Featured" tag (Case Insensitive)
        const featured = data.filter(
          (g) =>
            g.tags &&
            g.tags.some((t) => t.toLowerCase() === FEATURED_TAG.toLowerCase())
        );

        // Fallback: If not enough featured items, fill with others
        const finalSelection =
          featured.length >= SUGGESTION_COUNT
            ? featured.slice(0, SUGGESTION_COUNT)
            : [...featured, ...data.filter((g) => !featured.includes(g))].slice(
                0,
                SUGGESTION_COUNT
              );

        setPopularItems(finalSelection);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load popular items:", error);
        setIsLoading(false);
      }
    }

    loadPopularItems();
  }, []);

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Main 404 Content */}
      <div className="min-h-screen bg-background relative overflow-hidden pt-24 pb-20">
        
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(224 17 95 / 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(224 17 95 / 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '4rem 4rem',
            }}
          />
        </div>

        {/* Glitch Overlay - Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ruby/5 rounded-full blur-3xl animate-pulse" />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-pulse" 
            style={{ animationDelay: '1s' }}
          />
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          
          {/* Top Section - Centered */}
          <div className="text-center py-16">
            {/* Glitching 404 - No Logo */}
            <div className="mb-8">
              <h1 
                className="font-black text-9xl tracking-tighter text-ruby/20 select-none animate-glitch"
                style={{
                  textShadow: `
                    2px 2px 0 rgba(224, 17, 95, 0.3),
                    -2px -2px 0 rgba(139, 92, 246, 0.3)
                  `,
                }}
              >
                404
              </h1>
            </div>

            {/* Message */}
            <div className="space-y-4 mb-12">
              <h2 className="font-black text-3xl md:text-4xl uppercase tracking-tight text-white">
                Lost in the Vault
              </h2>
              <p className="font-medium text-lg text-white/60 max-w-md mx-auto leading-relaxed">
                This page doesn't exist in our digital archives. The content you're looking for may have been moved, deleted, or never existed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {/* Primary: Go Home */}
              <Link 
                href="/"
                className="group relative w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-ruby/20 rounded-xl blur-xl group-hover:bg-ruby/30 transition-all duration-300" />
                <div className="relative bg-ruby hover:bg-ruby/90 text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-xl flex items-center justify-center gap-3 border border-ruby transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(224,17,95,0.5)] group-hover:-translate-y-0.5">
                  <HomeIcon className="w-5 h-5" strokeWidth={2.5} />
                  Return Home
                </div>
              </Link>

              {/* Secondary: Explore */}
              <Link 
                href="/explore"
                className="group relative w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-white/5 rounded-xl blur-xl group-hover:bg-white/10 transition-all duration-300" />
                <div className="relative bg-surface hover:bg-surface/80 text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-xl flex items-center justify-center gap-3 border border-white/10 hover:border-ruby/30 transition-all duration-300 group-hover:-translate-y-0.5">
                  <CompassIcon className="w-5 h-5" strokeWidth={2.5} />
                  Explore Vault
                </div>
              </Link>
            </div>
          </div>

          {/* Popular Items Section - Using GameCard */}
{popularItems.length > 0 && (
  <div className="mt-12">
    {/* Header with decorative lines */}
    <div className="mb-8 flex items-center justify-center gap-3">
      <div className="h-px w-16 bg-white/10 shrink-0" />
      <h3 className="font-bold uppercase tracking-widest text-xs text-white/40 whitespace-nowrap">
        Popular Right Now
      </h3>
      <div className="h-px w-16 bg-white/10 shrink-0" />
    </div>

    {/* Grid - No animation wrapper */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
      {popularItems.map((item) => (
        <GameCard 
          key={item.id || item.slug}
          game={item} 
          priority={false}
        />
      ))}
    </div>
  </div>
)}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-20 text-center">
              <div className="flex items-center justify-center gap-3 text-ruby/50">
                <LockKeyhole size={20} className="animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  Loading Suggestions...
                </span>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-16 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center shrink-0 mt-1">
                <SearchIcon className="w-5 h-5 text-violet-500" strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold uppercase tracking-widest text-xs text-violet-500">
                  Looking for Something?
                </h3>
                <p className="font-medium text-sm text-white/70 leading-relaxed">
                  Try using the search bar to find games, apps, or tools. You can also browse our curated collections on the Explore page.
                </p>
              </div>
            </div>
          </div>

          {/* Error Code Footer */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-white/40">
              Error Code: 404 • Page Not Found • Lost in Digital Space
            </p>
          </div>
        </div>
      </div>
    </>
  );
}