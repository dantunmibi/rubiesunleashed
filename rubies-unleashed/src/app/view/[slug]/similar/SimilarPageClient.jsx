"use client";

/**
 * 💎 RUBIES UNLEASHED - Similar Items Page (Client)
 * Route: /view/[slug]/similar
 * Shows 8 scored similar items for a given project
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, PackageOpen } from "lucide-react";
import { getSimilarGames } from "@/lib/game-service-client";
import { getGameTheme } from "@/lib/theme-utils";
import { getSmartTag, getTagStyle } from "@/lib/game-utils";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default function SimilarPageClient({ slug, sourceGame }) {
  const [similarGames, setSimilarGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme driven by source item type
  const pageTheme = getGameTheme(sourceGame?.type || 'Game');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const results = await getSimilarGames({
          currentGameId: sourceGame.id,
          currentGameType: sourceGame.type,
          currentGameTags: sourceGame.tags || [],
          currentGameDeveloper: sourceGame.developer,
          limit: 8,
        });

        if (isMounted) setSimilarGames(results);
      } catch (err) {
        console.error('❌ SimilarPageClient fetch error:', err);
        if (isMounted) setSimilarGames([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => { isMounted = false; };
  }, [sourceGame]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* ✅ Back Link */}
        <Link
          href={`/view/${slug}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mt-16 mb-8 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to {sourceGame.title}
        </Link>

        {/* ✅ Page Header */}
        <div className="mb-10">
          <h1 className="flex items-center gap-3 text-3xl font-black text-white uppercase tracking-tight">
            <Sparkles size={28} className={pageTheme.text} />
            More Like This
          </h1>
          <p className="text-slate-400 mt-2">
            Items similar to{" "}
            <span className={`font-semibold ${pageTheme.text}`}>
              {sourceGame.title}
            </span>
          </p>
        </div>

        {/* ✅ Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-[#161b2c] rounded-xl overflow-hidden border border-white/5 animate-pulse"
              >
                <div className="aspect-3/4 bg-slate-700" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-700 rounded w-16" />
                  <div className="h-4 bg-slate-600 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Results Grid */}
        {!loading && similarGames.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarGames.map((item) => {
              if (!item) return null;

              const cardTheme = getGameTheme(item.type);
              const smartTag = getSmartTag(item.tags);
              const tagStyle = getTagStyle(smartTag);
              const itemImage = item.image || item.cover_url || '/placeholder-game.png';

              return (
                <Link
                  key={item.id}
                  href={`/view/${item.slug}`}
                  className={`group relative block bg-[#161b2c] rounded-xl overflow-hidden border border-white/5 ${cardTheme.borderHover} transition-all hover:-translate-y-1 shadow-lg ${cardTheme.isApp ? "hover:shadow-cyan-900/20" : "hover:shadow-ruby/20"}`}
                >
                  <div className="aspect-3/4 overflow-hidden">
                    <img
                      src={itemImage}
                      alt={item.title || "Item"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.target.src = '/placeholder-game.png'; }}
                    />
                    {/* Type Icon Overlay */}
                    <div className={`absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 ${cardTheme.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <cardTheme.icon size={12} />
                    </div>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-4 bg-linear-to-t from-[#0b0f19] via-[#0b0f19]/80 to-transparent pt-12">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md ${tagStyle}`}>
                      {smartTag}
                    </span>
                    <h4 className="text-white font-bold leading-tight mt-2 truncate drop-shadow-md">
                      {item.title}
                    </h4>
                    {item.developer && item.developer !== 'Unknown Developer' && (
                      <p className="text-slate-400 text-xs mt-1 truncate">
                        by {item.developer}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ✅ Empty / Thin State — show CTA regardless */}
        {!loading && similarGames.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <PackageOpen size={56} className="text-slate-600 mb-4" />
            <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-2">
              Nothing Similar Found
            </h2>
            <p className="text-slate-500 max-w-sm mb-8">
              We couldn't find items similar to{" "}
              <span className="text-white font-semibold">{sourceGame.title}</span>{" "}
              right now. The vault has more to offer though.
            </p>
            <Link
              href="/explore"
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs
                transition-all duration-200 text-white
                ${pageTheme.isApp
                  ? 'bg-[--color-netrunner] hover:bg-[--color-netrunner]/80 shadow-lg shadow-cyan-900/30'
                  : 'bg-[--color-ruby] hover:bg-[--color-ruby]/80 shadow-lg shadow-ruby/30'
                }
              `}
            >
              Browse The Vault
            </Link>
          </div>
        )}

        {/* ✅ Browse The Vault CTA — always shown below results too */}
        {!loading && similarGames.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Link
              href="/explore"
              className={`
                group flex items-center gap-2 px-6 py-3 rounded-xl border font-bold uppercase tracking-widest text-xs
                transition-all duration-200
                ${pageTheme.isApp
                  ? 'border-[--color-netrunner] text-[--color-netrunner] hover:bg-[--color-netrunner]/10'
                  : 'border-[--color-ruby] text-[--color-ruby] hover:bg-[--color-ruby]/10'
                }
              `}
            >
              Browse The Vault
            </Link>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}