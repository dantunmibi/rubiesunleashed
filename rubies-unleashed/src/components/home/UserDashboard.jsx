"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSessionGuard } from "@/hooks/useSessionGuard"; // ✅ Add session guard
import SessionErrorOverlay from "@/components/ui/SessionErrorOverlay"; // ✅ Add overlay
import { supabase } from "@/lib/supabase";
import { getUnifiedFeed } from "@/lib/game-service-client"; // ✅ Add unified feed
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
  
  // ✅ ADD SESSION GUARD WITH TRIGGER
  const { showSessionError, checkSupabaseError, triggerError } = useSessionGuard();
  
  const [wishlistPreview, setWishlistPreview] = useState([]);
  const [games, setGames] = useState(initialGames); // ✅ Use state for games
  const [loading, setLoading] = useState(!initialGames.length); // ✅ Add loading state
  const [loadError, setLoadError] = useState(null);

  // ✅ SAFETY VALVE: 5-second timeout
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        console.warn("UserDashboard loading timed out (5s). Triggering session recovery.");
        setLoading(false);
        if (triggerError) triggerError();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [loading, triggerError]);

  // ✅ Load unified games data if not provided initially
  useEffect(() => {
    async function loadGames() {
      if (games.length > 0) return; // Already have data
      
      try {
        setLoading(true);
        setLoadError(null);
        
        console.log('🔍 Loading unified feed for user dashboard...');
        
        const data = await getUnifiedFeed({ 
          limit: 500, // Reasonable limit for dashboard
          includeArchived: false 
        });
        
        console.log(`📊 Dashboard loaded: ${data.length} items`);
        
        // Log content mix
        const bloggerCount = data.filter(g => g.source !== 'supabase').length;
        const supabaseCount = data.filter(g => g.source === 'supabase').length;
        console.log(`📊 Dashboard mix: ${bloggerCount} Blogger + ${supabaseCount} Community`);
        
        setGames(data);
      } catch (error) {
        console.error('❌ Failed to load dashboard games:', error);
        setLoadError(error.message);
        
        // Fallback to Blogger only
        try {
          const { fetchGames } = await import('@/lib/blogger');
          const fallbackData = await fetchGames(500);
          console.log('🔄 Dashboard fallback to Blogger-only');
          setGames(fallbackData);
        } catch (fallbackError) {
          console.error('❌ Dashboard fallback failed:', fallbackError);
          setGames([]);
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadGames();
  }, [games.length]);

  // 1. Optimized Wishlist Fetch
  useEffect(() => {
    async function loadWishlist() {
      if (!user || games.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('wishlists')
          .select('game_id')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false })
          .limit(4);
        
        // ✅ Check for Supabase errors using session guard
        if (checkSupabaseError(error)) return;
        
        if (data) {
           const previews = data.map(item => {
               return games.find(g => 
                  g.id === item.game_id || 
                  g.slug === item.game_id || 
                  g.slug.endsWith(`-${item.game_id}`)
               );
           }).filter(Boolean);
           setWishlistPreview(previews);
        }
      } catch (error) {
        console.error('❌ Wishlist load error:', error);
        // Don't show error if session overlay is already showing
        if (!showSessionError) {
          console.warn('Failed to load wishlist preview');
        }
      }
    }
    
    loadWishlist();
  }, [user, games, checkSupabaseError, showSessionError]); 

  // 2. Generate Sections based on Archetype Logic
  const dashboardContent = useMemo(() => {
    if (games.length === 0) return null;

    const apps = games.filter(g => g.type === 'App');
    const gameItems = games.filter(g => g.type !== 'App');
    
    const shuffledGames = shuffle(gameItems);
    const shuffledApps = shuffle(apps);
    const shuffledAll = shuffle(games);

    let heroItems = [];
    let sections = [];

    // --- HUNTER LOGIC (Games First) ---
    if (archetype === 'hunter') {
        heroItems = gameItems.slice(0, 5);
        sections = [
            { title: "New Games", icon: Gamepad2, data: gameItems.slice(0, 6) },
            { title: "New Apps", icon: Box, data: apps.slice(0, 6) },
            { title: "Trending Games", icon: TrendingUp, data: shuffledGames.slice(0, 6) } 
        ];
    }

    // --- NETRUNNER LOGIC (Apps First) ---
    else if (archetype === 'netrunner') {
        heroItems = apps.slice(0, 5);
        sections = [
            { title: "Essential Tools", icon: Zap, data: apps.slice(0, 6) },
            { title: "Break Time", icon: Gamepad2, data: gameItems.slice(0, 6) },
            { title: "Top Utilities", icon: TrendingUp, data: shuffledApps.slice(0, 6) }
        ];
    }

    // --- CURATOR LOGIC (Quality First) ---
    else if (archetype === 'curator') {
        heroItems = games.slice(0, 5);
        sections = [
            { title: "Hidden Gems", icon: Sparkles, data: games.slice(-6).reverse() },
            { title: "Newest Releases", icon: TrendingUp, data: games.slice(0, 6) },
            { title: "Top Rated", icon: PenTool, data: shuffledAll.slice(0, 6) }
        ];
    }

    // --- PHANTOM LOGIC (The Underground) ---
    else if (archetype === 'phantom') {
        const heroSlice = shuffledAll.slice(0, 5); 
        heroItems = heroSlice.length > 0 ? heroSlice : games.slice(0, 5);
        
        const nicheTags = ['Experimental', 'Glitch', 'Puzzle', 'Horror', 'Privacy'];
        const nicheItems = games.filter(g => g.tags && g.tags.some(t => nicheTags.includes(t)));

        sections = [
            { title: "The Underground", icon: Ghost, data: shuffledAll.slice(5, 11) },
            { title: "Fresh Entries", icon: TrendingUp, data: games.slice(0, 6) },
            { title: "Experimental & Niche", icon: Shield, data: nicheItems.length > 0 ? nicheItems.slice(0, 6) : shuffledAll.slice(11, 17) }
        ];
    }

    // --- FALLBACK ---
    else {
        heroItems = games.slice(0, 5);
        sections = [
            { title: "Recommended", icon: Sparkles, data: games.slice(0, 6) },
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

  }, [games, archetype, wishlistPreview, profile]);

  // ✅ LOADING STATE (with session guard protection)
  if (loading) {
    return (
        <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
            <BackgroundEffects />
            <Navbar />
            <div className="pt-40 pb-25 text-center flex flex-col items-center justify-center">
                <RefreshCw className="animate-spin text-(--user-accent) mb-4" size={32} />
                <h2 className="text-xl font-bold text-white">Curating Feed...</h2>
                <p className="text-slate-500 text-sm mt-2">Connecting to The Vault.</p>
            </div>
            <Footer />
            {/* ✅ ADD SESSION ERROR OVERLAY */}
            <SessionErrorOverlay show={showSessionError} />
        </div>
    );
  }

  // ✅ ERROR STATE (if loading failed and no games)
  if (loadError && games.length === 0) {
    return (
        <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
            <BackgroundEffects />
            <Navbar />
            <div className="pt-40 pb-25 text-center flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-white mb-2">Failed to Load Dashboard</h2>
                <p className="text-slate-500 text-sm mb-4">{loadError}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-(--user-accent) text-white rounded-lg hover:brightness-110 transition-all"
                >
                    Retry
                </button>
            </div>
            <Footer />
            <SessionErrorOverlay show={showSessionError} />
        </div>
    );
  }

  // ✅ EMPTY STATE (no content but no error)
  if (!dashboardContent) {
    return (
        <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
            <BackgroundEffects />
            <Navbar />
            <div className="pt-40 pb-25 text-center flex flex-col items-center justify-center">
                <RefreshCw className="animate-spin text-(--user-accent) mb-4" size={32} />
                <h2 className="text-xl font-bold text-white">Curating Feed...</h2>
                <p className="text-slate-500 text-sm mt-2">Connecting to The Vault.</p>
                <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold uppercase">
                    Force Reload
                </button>
            </div>
            <Footer />
            <SessionErrorOverlay show={showSessionError} />
        </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
        <BackgroundEffects />
        <Navbar />

        {/* Dashboard Header */}
        <section className="pt-32 px-6 pb-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
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
      
      {/* ✅ ADD SESSION ERROR OVERLAY */}
      <SessionErrorOverlay show={showSessionError} />
    </>
  );
}