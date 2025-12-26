"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { fetchGames } from "@/lib/blogger";
import {
  Search,
  Loader2,
  Play,
  ChevronDown,
  Filter,
  Grid,
  X,
  Monitor,
  Smartphone,
  Globe,
  Laptop,
} from "lucide-react";
import Link from "next/link";
import GameModal from "@/components/ui/GameModal";
import { getSmartTag, getTagStyle } from "@/lib/game-utils";
import GameCard from "@/components/store/GameCard";

const FEATURED_TAG = "Featured";

// Platform Definitions
const PLATFORMS = [
  { id: "Windows", icon: Monitor, label: "PC" },
  { id: "Android", icon: Smartphone, label: "Mobile" },
  { id: "Mac", icon: Laptop, label: "Mac" },
  { id: "Web", icon: Globe, label: "Web" },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "All";

  // --- STATE ---
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  // Spotlight State
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const spotlightCount = 4;

  // Vault State
  const [selectedGenre, setSelectedGenre] = useState(initialQuery);
  const [selectedPlatform, setSelectedPlatform] = useState("All"); // ✅ NEW: Platform Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [isExpanded, setIsExpanded] = useState(false); // ✅ NEW: Grid Mode Toggle

  // --- 1. LOAD DATA ---
  useEffect(() => {
    async function load() {
      const data = await fetchGames(100);
      setGames(data);
      setLoading(false);
    }
    load();
  }, []);

  // --- 2. DEEP LINKING ---
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setSelectedGenre(query);
  }, [searchParams]);

  // --- 3. AUTO-SCROLL UI ---
  useEffect(() => {
    if (!loading && (selectedGenre !== "All" || selectedPlatform !== "All")) {
      setTimeout(() => {
        document
          .getElementById("vault")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

      setTimeout(() => {
        const activeBtn = document.getElementById(`tag-btn-${selectedGenre}`);
        activeBtn?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }, 200);
    }
  }, [selectedGenre, selectedPlatform, loading]);

  // --- 4. SPOTLIGHT ROTATION ---
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % spotlightCount);
    }, 5000);
    return () => clearInterval(interval);
  }, [spotlightCount]);

  // --- 5. MEMOIZED DATA ---

  const spotlightItems = useMemo(() => {
    const featured = games.filter(
      (g) =>
        g.tags &&
        g.tags.some((t) => t.toLowerCase() === FEATURED_TAG.toLowerCase())
    );
    return featured.length > 0
      ? featured.slice(0, spotlightCount)
      : games.slice(0, spotlightCount);
  }, [games, spotlightCount]);

  const activeSpotlight = spotlightItems[spotlightIndex];

  // ✅ DYNAMIC TAGS: Popularity for Ribbon, A-Z for Grid
  const { topTags, allTagsAz } = useMemo(() => {
    if (games.length === 0) return { topTags: [], allTagsAz: [] };

    const counts = {};
    games.forEach((g) => {
      if (g.tags) {
        g.tags.forEach((t) => {
          // Filter out utility/platform tags from the Genre list
          if (
            t === "Featured" ||
            t === "Game" ||
            t === "indie" ||
            ["Windows", "Mac", "Android", "Web", "Linux", "PC"].includes(t)
          )
            return;
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });

    const entries = Object.entries(counts);

    // Top 10 for Ribbon
    const top = entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((e) => e[0]);

    // All A-Z for Grid
    const allAz = entries
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((e) => e[0]);

    return { topTags: ["All", ...top], allTagsAz: ["All", ...allAz] };
  }, [games]);

  // ✅ MULTI-FILTER LOGIC (Platform + Genre + Search)
  const vaultGames = useMemo(() => {
    let filtered = games;

    // 1. Platform Filter
    if (selectedPlatform !== "All") {
      filtered = filtered.filter(
        (g) =>
          g.tags.some(
            (tag) => tag.toLowerCase() === selectedPlatform.toLowerCase()
          ) ||
          (g.buildPlatform && g.buildPlatform.includes(selectedPlatform))
      );
    }

    // 2. Genre Filter
    if (selectedGenre !== "All") {
      filtered = filtered.filter((g) =>
        g.tags.some(
          (tag) =>
            tag.toLowerCase().trim() === selectedGenre.toLowerCase().trim()
        )
      );
    }

    // 3. Search Filter (Title OR Tag)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((g) =>
        g.title.toLowerCase().includes(query) ||
        (g.tags && g.tags.some(t => t.toLowerCase().includes(query)))
      );
    }
    return filtered;
  }, [games, selectedGenre, selectedPlatform, searchQuery]);

  const visibleGames = vaultGames.slice(0, visibleCount);

  // --- RENDER ---
  return (
    <>
      <main className="md:pt-4 pb-24 px-4 lg:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-ruby mb-4" size={48} />
            <p className="text-slate-500 font-bold animate-pulse">
              Opening the Vault...
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-16 pt-20">
            {/* SPOTLIGHT HERO (Unchanged) */}
            {spotlightItems.length > 0 && activeSpotlight && (
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-125">
                <div className="lg:col-span-2 relative rounded-3xl overflow-hidden group shadow-2xl border border-white/5">
                  <img
                    src={activeSpotlight.image}
                    key={activeSpotlight.image}
                    className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in duration-700"
                    alt="Featured"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#0b0f19] via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-2xl">
                    <div className="flex items-center gap-2 mb-4 animate-in slide-in-from-bottom-4 duration-700 delay-100">
                      <span className="bg-ruby text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-ruby/40">
                        Spotlight
                      </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-none animate-in slide-in-from-bottom-4 duration-700 delay-200">
                      {activeSpotlight.title}
                    </h2>
                    <p className="text-slate-300 mb-8 line-clamp-2 md:line-clamp-3 text-sm md:text-base max-w-lg animate-in slide-in-from-bottom-4 duration-700 delay-300">
                      {activeSpotlight.description}
                    </p>
                    <Link
                      href={`/view/${activeSpotlight.slug}`}
                      className="bg-white text-black hover:bg-ruby hover:text-white px-8 py-3 rounded-xl font-black uppercase tracking-wide transition-all inline-flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-700 delay-500 hover:scale-105"
                    >
                      <Play size={18} fill="currentColor" /> Play Now
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:flex flex-col gap-4 h-full">
                  {spotlightItems.map((game, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSpotlightIndex(idx)}
                      className={`relative flex-1 rounded-2xl overflow-hidden cursor-pointer transition-all border border-white/5 group ${
                        spotlightIndex === idx
                          ? "ring-2 ring-ruby scale-[1.02] opacity-100 z-10"
                          : "opacity-60 hover:opacity-100 hover:scale-[1.01]"
                      }`}
                    >
                      <img
                        src={game.image}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
                      <div className="absolute bottom-0 left-0 p-4 w-full">
                        <h4
                          className={`font-bold text-white leading-tight ${
                            spotlightIndex === idx ? "text-lg" : "text-sm"
                          }`}
                        >
                          {game.title}
                        </h4>
                        {spotlightIndex === idx && (
                          <div className="h-1 w-full bg-white/20 mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-ruby animate-progress" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

                {/* THE VAULT */}
                <section id="vault" className="flex flex-col gap-0 relative min-h-125">
                    
                    {/* ✅ STICKY HEADER WRAPPER */}
                    <div className="sticky md:relative top-0 z-30 bg-[#0b0f19]/95 backdrop-blur-xl border-b border-white/5 pb-4 pt-4 -mx-4 px-4 md:mx-0 md:px-0 transition-all shadow-xl shadow-black/20">
                        
                        {/* Header & Search */}
                        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">The Vault</h3>
                                <p className="text-slate-400 text-xs md:text-sm">Browse {vaultGames.length} curated titles.</p>
                            </div>
                            
                            <div className="relative group w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-ruby transition-colors" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search titles, tags, or genres..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-ruby transition-all"
                                />
                            </div>
                        </div>

                        {/* Platform Selector */}
                        <div className="flex gap-2 pb-3 overflow-x-auto no-scrollbar">
                             <button onClick={() => setSelectedPlatform("All")} className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${selectedPlatform === "All" ? "bg-white text-black" : "bg-surface text-slate-400 border-white/10 hover:text-white"}`}>All</button>
                             {PLATFORMS.map(p => (
                                 <button key={p.id} onClick={() => setSelectedPlatform(p.id)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${selectedPlatform === p.id ? "bg-ruby text-white border-ruby" : "bg-surface text-slate-400 border-white/10 hover:text-white"}`}>
                                     <p.icon size={12}/> {p.label}
                                 </button>
                             ))}
                        </div>

                        {/* Genre Filter (Ribbon vs Grid) */}
                        <div className="relative w-full">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <Filter size={12} /> {selectedGenre === "All" ? "Popular Genres" : selectedGenre}
                                </div>
                                <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-[10px] font-bold text-ruby hover:text-white transition-colors uppercase tracking-wider">
                                    {isExpanded ? <><X size={12}/> Close</> : <><Grid size={12}/> View All</>}
                                </button>
                            </div>

                            {isExpanded ? (
                                <div className="relative border border-white/10 rounded-xl bg-black/40 p-2 animate-in fade-in zoom-in duration-300">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {allTagsAz.map(tag => {
                                            const isSelected = selectedGenre === tag;
                                            let styleClass = getTagStyle(tag);
                                            if (isSelected && styleClass.includes("text-slate-300")) styleClass = "bg-white text-black border-white";
                                            else if (!isSelected) styleClass = "bg-surface text-slate-400 border-white/5 hover:border-white/20 hover:text-white";
                                            return <button key={tag} onClick={() => { setSelectedGenre(tag); setVisibleCount(12); setIsExpanded(false); }} className={`px-3 py-2 rounded-md text-[10px] font-bold border transition-all truncate text-left ${styleClass}`}>{tag}</button>;
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
                                    {topTags.map(tag => {
                                        const isSelected = selectedGenre === tag;
                                        let styleClass = getTagStyle(tag);
                                        if (isSelected && styleClass.includes("text-slate-300")) styleClass = "bg-white text-black border-white shadow-lg";
                                        else if (!isSelected) styleClass = "bg-surface text-slate-400 border-white/5 hover:text-white";
                                        return <button key={tag} id={`tag-btn-${tag}`} onClick={() => { setSelectedGenre(tag); setVisibleCount(12); }} className={`shrink-0 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border ${isSelected ? `${styleClass} scale-105` : styleClass}`}>{tag}</button>;
                                    })}
                                </div>
                            )}
                            {!isExpanded && <div className="absolute right-0 top-7 bottom-0 w-12 bg-linear-to-l from-[#0b0f19] to-transparent pointer-events-none md:hidden" />}
                        </div>
                    </div>

                    {/* GAME GRID (Starts below sticky header) */}
                    <div className="pt-6">
                        {visibleGames.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                                    {visibleGames.map((game, idx) => (
                                        <GameCard key={idx} game={game} onClick={setSelectedGame} />
                                    ))}
                                </div>
                                {visibleCount < vaultGames.length && (
                                    <div className="flex justify-center mt-8">
                                        <button onClick={() => setVisibleCount(prev => prev + 12)} className="flex items-center gap-2 px-8 py-3 bg-surface hover:bg-white hover:text-black border border-white/10 rounded-xl font-bold transition-all uppercase text-xs tracking-widest group">
                                            Load More Gems <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-20 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-lg">No treasures found.</p>
                                <button onClick={() => {setSelectedGenre('All'); setSelectedPlatform('All'); setSearchQuery('');}} className="text-ruby font-bold mt-2 hover:underline">Clear Filters</button>
                            </div>
                        )}
                    </div>
                </section>
          </div>
        )}
      </main>

      {selectedGame && (
        <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </>
  );
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-ruby/30 selection:text-white">
      <BackgroundEffects />
      <Navbar />
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center text-ruby">
            <Loader2 className="animate-spin" />
          </div>
        }
      >
        <ExploreContent />
      </Suspense>
      <Footer />
    </div>
  );
}
