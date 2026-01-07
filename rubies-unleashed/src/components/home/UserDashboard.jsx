"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import GameGrid from "@/components/explore/GameGrid";
import SpotlightHero from "@/components/explore/SpotlightHero";
import { ArrowRight, Sparkles, TrendingUp, Heart, Zap, Ghost, Shield, PenTool, Gamepad2, Box } from "lucide-react";
import Link from "next/link";
import { fetchGameById } from "@/lib/blogger";

// Helper: Shuffle Array
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export default function UserDashboard({ initialGames }) {
  const { user, archetype, profile } = useAuth();
  const [wishlistPreview, setWishlistPreview] = useState([]);

  // 2. Optimized Wishlist Fetch
  useEffect(() => {
    async function loadWishlist() {
      if (!user) return;
      
      const { data } = await supabase
        .from('wishlists')
        .select('game_id')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })
        .limit(4);
        
      if (data && initialGames.length > 0) {
         // ✅ Fast Lookup: Find in existing list instead of fetching
         const previews = data.map(item => {
             return initialGames.find(g => 
                g.id === item.game_id || 
                g.slug === item.game_id || 
                g.slug.endsWith(`-${item.game_id}`)
             );
         }).filter(Boolean);
         
         setWishlistPreview(previews);
      }
    }
    loadWishlist();
  }, [user, initialGames]); // Add initialGames dependency

  // 2. Generate Sections based on Archetype Logic
  const dashboardContent = useMemo(() => {
    if (!initialGames || initialGames.length === 0) return null;

    // ✅ STRICT TYPE FILTERING (Matches blogger.js logic)
    const apps = initialGames.filter(g => g.type === 'App');
    const games = initialGames.filter(g => g.type !== 'App');
    const shuffledAll = shuffle(initialGames);

    let heroItems = [];
    let sections = [];

    // --- HUNTER LOGIC (Games First) ---
    if (archetype === 'hunter') {
        heroItems = games.slice(0, 5); // Hero = Top 5 Games
        
        sections = [
            { title: "New Games", icon: Gamepad2, data: games.slice(0, 6) },
            { title: "New Apps", icon: Box, data: apps.slice(0, 6) },
            { title: "Trending Games", icon: TrendingUp, data: games.slice(6, 12) }
        ];
    }

    // --- NETRUNNER LOGIC (Apps First) ---
    else if (archetype === 'netrunner') {
        heroItems = apps.slice(0, 5); // Hero = Top 5 Apps
        
        sections = [
            { title: "Essential Tools", icon: Zap, data: apps.slice(0, 6) },
            { title: "Break Time", icon: Gamepad2, data: games.slice(0, 6) },
            { title: "Top Utilities", icon: TrendingUp, data: apps.slice(6, 12) }
        ];
    }

    // --- CURATOR LOGIC (Quality First) ---
    else if (archetype === 'curator') {
        heroItems = initialGames.slice(0, 5); 
        
        sections = [
            { title: "Hidden Gems", icon: Sparkles, data: initialGames.slice(12, 18) }, // Older posts
            { title: "Newest Releases", icon: TrendingUp, data: initialGames.slice(0, 6) },
            { title: "Top Rated", icon: PenTool, data: initialGames.slice(6, 12) }
        ];
    }

    // --- PHANTOM LOGIC (The Underground) ---
    else if (archetype === 'phantom') {
        heroItems = [shuffledAll[0]]; // Single Random Hero
        
        const nicheTags = ['Experimental', 'Glitch', 'Puzzle', 'Horror'];
        const nicheItems = initialGames.filter(g => g.tags.some(t => nicheTags.includes(t)));

        sections = [
            { title: "The Underground", icon: Ghost, data: shuffledAll.slice(1, 7) }, 
            { title: "Fresh Entries", icon: TrendingUp, data: initialGames.slice(0, 6) }, 
            { title: "Experimental & Niche", icon: Shield, data: nicheItems.length > 0 ? nicheItems.slice(0, 6) : shuffledAll.slice(7, 13) }
        ];
    }

    // --- FALLBACK ---
    else {
        heroItems = initialGames.slice(0, 5);
        sections = [
            { title: "Recommended", icon: Sparkles, data: initialGames.slice(0, 6) },
            { title: "Trending", icon: TrendingUp, data: initialGames.slice(6, 12) }
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

  }, [initialGames, archetype, wishlistPreview, profile]);

  if (!dashboardContent) return null;

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
      <BackgroundEffects />
      <Navbar />

      {/* Dashboard Header */}
      <section className="pt-32 px-6 pb-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Welcome back, <span className="text-(--user-accent)">{profile?.username}</span>
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