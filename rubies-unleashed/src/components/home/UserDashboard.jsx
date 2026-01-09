"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import GameGrid from "@/components/explore/GameGrid";
import SpotlightHero from "@/components/explore/SpotlightHero";
import { ArrowRight, Sparkles, TrendingUp, Heart, Zap, Ghost, Shield, PenTool, Gamepad2, Box, RefreshCw } from "lucide-react";
import Link from "next/link";

// Helper: Shuffle Array (Fisher-Yates)
const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    const newArr = [...array];
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newArr[currentIndex], newArr[randomIndex]] = [newArr[randomIndex], newArr[currentIndex]];
    }
    return newArr;
};

export default function UserDashboard({ initialGames = [] }) {
  const { user, archetype, profile } = useAuth();
  const [wishlistPreview, setWishlistPreview] = useState([]);
  
  // Ensure we have an array, even if prop is missing
  const safeGames = Array.isArray(initialGames) ? initialGames : [];

  // 1. Optimized Wishlist Fetch
  useEffect(() => {
    async function loadWishlist() {
      if (!user) return;
      
      const { data } = await supabase
        .from('wishlists')
        .select('game_id')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })
        .limit(4);
      
      if (data && safeGames.length > 0) {
         const previews = data.map(item => {
             return safeGames.find(g => 
                g.id === item.game_id || 
                g.slug === item.game_id || 
                g.slug.endsWith(`-${item.game_id}`)
             );
         }).filter(Boolean);
         setWishlistPreview(previews);
      }
    }
    loadWishlist();
  }, [user, safeGames]); 

  // 2. Generate Sections based on Archetype Logic
  const dashboardContent = useMemo(() => {
    if (safeGames.length === 0) return null;

    const apps = safeGames.filter(g => g.type === 'App');
    const games = safeGames.filter(g => g.type !== 'App');
    
    // Simulations for "Views" and "Ratings" (Since we don't have DB stats yet)
    // We assume the input array is sorted by Date (Newest first).
    // "Trending" = Random slice of recent items
    // "Top Rated" = Items with 'Editor Choice' or just high index (simulated)
    const shuffledGames = shuffle(games);
    const shuffledApps = shuffle(apps);
    const shuffledAll = shuffle(safeGames);

    let heroItems = [];
    let sections = [];

    // --- HUNTER LOGIC (Games First) ---
    if (archetype === 'hunter') {
        heroItems = games.slice(0, 5);
        sections = [
            { title: "New Games", icon: Gamepad2, data: games.slice(0, 6) },
            { title: "New Apps", icon: Box, data: apps.slice(0, 6) },
            // "Trending" (High Views) -> Simulated by Shuffling the top 20
            { title: "Trending Games", icon: TrendingUp, data: shuffledGames.slice(0, 6) } 
        ];
    }

    // --- NETRUNNER LOGIC (Apps First) ---
    else if (archetype === 'netrunner') {
        heroItems = apps.slice(0, 5);
        sections = [
            { title: "Essential Tools", icon: Zap, data: apps.slice(0, 6) },
            { title: "Break Time", icon: Gamepad2, data: games.slice(0, 6) },
            // "Top Utilities" -> Simulated
            { title: "Top Utilities", icon: TrendingUp, data: shuffledApps.slice(0, 6) }
        ];
    }

    // --- CURATOR LOGIC (Quality First) ---
    else if (archetype === 'curator') {
        heroItems = safeGames.slice(0, 5);
        sections = [
            // "Hidden Gems" (Low Views/High Rate) -> Use Older items (end of array)
            { title: "Hidden Gems", icon: Sparkles, data: safeGames.slice(-6).reverse() },
            { title: "Newest Releases", icon: TrendingUp, data: safeGames.slice(0, 6) },
            // "Top Rated" -> Simulated
            { title: "Top Rated", icon: PenTool, data: shuffledAll.slice(0, 6) }
        ];
    }

    // --- PHANTOM LOGIC (The Underground) ---
    else if (archetype === 'phantom') {
        const heroSlice = shuffledAll.slice(0, 5); 
        heroItems = heroSlice.length > 0 ? heroSlice : safeGames.slice(0, 5);
        
        const nicheTags = ['Experimental', 'Glitch', 'Puzzle', 'Horror', 'Privacy'];
        const nicheItems = safeGames.filter(g => g.tags && g.tags.some(t => nicheTags.includes(t)));

        sections = [
            // "The Underground" -> Low visibility items
            { title: "The Underground", icon: Ghost, data: shuffledAll.slice(5, 11) },
            { title: "Fresh Entries", icon: TrendingUp, data: safeGames.slice(0, 6) },
            { title: "Experimental & Niche", icon: Shield, data: nicheItems.length > 0 ? nicheItems.slice(0, 6) : shuffledAll.slice(11, 17) }
        ];
    }

    // --- FALLBACK ---
    else {
        heroItems = safeGames.slice(0, 5);
        sections = [
            { title: "Recommended", icon: Sparkles, data: safeGames.slice(0, 6) },
            { title: "Trending", icon: TrendingUp, data: shuffledAll.slice(0, 6) }
        ];
    }

    // Insert Wishlist (Always 2nd)
    if (wishlistPreview.length > 0) {
        sections.splice(1, 0, { 
            title: "From Your Wishlist", 
            icon: Heart, 
            data: wishlistPreview, 
            link: `/${profile?.username}/wishlist`,
            linkText: "Manage"
        });
    }

    return { heroItems, sections };

  }, [safeGames, archetype, wishlistPreview, profile]);

  // ✅ PREVENT WHITE SCREEN: Loading or Empty State
  if (!dashboardContent) {
    return (
        <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
            <BackgroundEffects />
            <Navbar />
            <div className="pt-40 pb-25 text-center flex flex-col items-center justify-center">
                <RefreshCw className="animate-spin text-(--user-accent) mb-4" size={32} />
                <h2 className="text-xl font-bold text-white">Curating Feed...</h2>
                <p className="text-slate-500 text-sm mt-2">Connecting to The Vault.</p>
                {/* Fallback Reload if stuck */}
                <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold uppercase">
                    Force Reload
                </button>
            </div>
            <Footer />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
      <BackgroundEffects />
      <Navbar />

      {/* Dashboard Header */}
      <section className="pt-32 px-6 pb-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
            {/* ✅ Prefer Display Name, fallback to Username, fallback to Traveler */}
            Welcome back, <span className="text-(--user-accent)">{profile?.display_name || profile?.username || "Traveler"}</span>
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
            {archetype} Protocol Active
          </p>
        </div>
      </section>

      {/* Spotlight Hero */}
      <SpotlightHero games={dashboardContent.heroItems} />

      <main className="max-w-7xl mx-auto px-6 pb-20 space-y-16 mt-8">
        
        {dashboardContent.sections.map((section, idx) => (
            <section key={idx}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <section.icon size={20} className="text-(--user-accent)" /> {section.title}
                    </h2>
                    {section.link ? (
                        <Link href={section.link} className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1">
                            {section.linkText} <ArrowRight size={14} />
                        </Link>
                    ) : (
                        <Link href="/explore" className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
                
                {/* Safe Grid Rendering */}
                {section.data && section.data.length > 0 ? (
                    <GameGrid games={section.data} />
                ) : (
                    <p className="text-slate-500 text-sm italic">No items found in this category.</p>
                )}
            </section>
        ))}

      </main>
      
      <Footer />
    </div>
  );
}