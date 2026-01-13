/**
 * DYNAMIC WISHLIST PAGE (Phase 4 - Authentication Required)
 * ---------------------------------------------------------
 * - Fast Initial Paint: Resolves User immediately.
 * - Lazy Data Load: Shows Skeleton while fetching games.
 * - Authentication Required: No guest wishlists.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, Trash2, UserX } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import WishlistGrid from "@/components/wishlist/WishlistGrid";
import WishlistStats from "@/components/wishlist/WishlistStats";
import WishlistControls from "@/components/wishlist/WishlistControls";
import EmptyWishlist from "@/components/wishlist/EmptyWishlist";

// Logic Imports
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { getUnifiedFeed, getGame } from "@/lib/game-service-client";

// ✅ Cache system (same as other components)
const requestCache = new Map();
const CACHE_TTL = 30000;

const cachedQuery = async (key, queryFn) => {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('💾 Wishlist page cache hit for:', key);
    return cached.data;
  }
  
  console.log('🌐 Wishlist page cache miss for:', key);
  const data = await queryFn();
  requestCache.set(key, { data, timestamp: Date.now() });
  
  if (requestCache.size > 200) {
    const oldestKey = requestCache.keys().next().value;
    requestCache.delete(oldestKey);
  }
  
  return data;
};

export default function WishlistPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, profile } = useAuth(); 
  const params = useParams(); 
  const router = useRouter();
  
  const targetUsername = decodeURIComponent(params.username); 
  
  const [wishlistGames, setWishlistGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  // Two Loading States
  const [resolvingUser, setResolvingUser] = useState(true);
  const [loadingGames, setLoadingGames] = useState(true);
  
  const [viewingProfile, setViewingProfile] = useState(null); 
  const [userNotFound, setUserNotFound] = useState(false); 
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded-desc");
  const [filterType, setFilterType] = useState("all");

  const [showClearModal, setShowClearModal] = useState(false);

  // ✅ SIMPLIFIED: Only resolve authenticated users
  useEffect(() => {
    async function resolveUser() {
      setResolvingUser(true);
      setUserNotFound(false);
      setViewingProfile(null);

      try {
        // A. Own Profile
        if (user && (user.user_metadata?.username === targetUsername || profile?.username === targetUsername)) {
            setViewingProfile(profile);
            setResolvingUser(false);
            return;
        }

        // B. Public Lookup (only for authenticated users)
        if (targetUsername && targetUsername.toLowerCase() !== 'guest') {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .ilike('username', targetUsername)
                .single();
            
            if (data) {
                setViewingProfile(data);
                setResolvingUser(false);
                return;
            }
        }

        // C. Not Found
        console.warn(`User ${targetUsername} not found.`);
        setUserNotFound(true);
        setResolvingUser(false);

      } catch (err) {
        console.error("User Resolution Error:", err);
        setUserNotFound(true);
        setResolvingUser(false);
      }
    }

    resolveUser();
  }, [targetUsername, user?.id, profile]);

  // ✅ SIMPLIFIED: Only load authenticated user wishlists
  useEffect(() => {
    if (resolvingUser || userNotFound || !viewingProfile) return;

    let isMounted = true;
    
    const safety = setTimeout(() => {
      if (isMounted) {
        setLoadingGames(false);
        setHasAttemptedLoad(true);
      }
    }, 5000);

    async function loadGames() {
      console.log('🔄 Starting loadGames for user:', viewingProfile.username);
      
      if (wishlistGames.length === 0) setLoadingGames(true);
      setHasAttemptedLoad(false);
      
      try {
        // Fetch user's wishlist from database
        console.log('☁️ Fetching wishlist for user:', viewingProfile.username);
        const data = await cachedQuery(`wishlist-full-${viewingProfile.id}`, async () => {
          const { data } = await supabase
            .from('wishlists')
            .select('game_id, added_at')
            .eq('user_id', viewingProfile.id)
            .order('added_at', { ascending: false });
          return data;
        });
        
        const gameIds = data?.map(row => ({ 
          id: row.game_id, 
          addedAt: new Date(row.added_at) 
        })) || [];
        
        console.log('📊 Found game IDs:', gameIds.length);

        // Hydrate games using unified feed
        if (gameIds.length > 0) {
          console.log('🎮 Hydrating games with unified feed...');
          const allGames = await getUnifiedFeed({ limit: 2000 });
          let validGames = [];
          
          if (allGames && allGames.length > 0) {
            validGames = gameIds.map(item => {
              const game = allGames.find(g => 
                g.id === item.id || 
                g.slug === item.id || 
                g.slug.endsWith(`-${item.id}`) ||
                (g.original_blogger_id && g.original_blogger_id === item.id)
              );
              return game ? { ...game, addedAt: item.addedAt } : null;
            }).filter(Boolean);
            
            console.log(`✅ Found ${validGames.length} games from unified feed`);
          } else {
            console.log('⚠️ Unified feed empty, trying individual lookups...');
            const detailsPromises = gameIds.map(async (item) => {
              try {
                const game = await getGame(item.id);
                return game ? { ...game, addedAt: item.addedAt } : null;
              } catch (error) {
                console.warn(`Failed to fetch game ${item.id}:`, error);
                return null;
              }
            });
            validGames = (await Promise.all(detailsPromises)).filter(Boolean);
          }
          
          console.log('✅ Final games:', validGames.length);
          
          if (isMounted) {
            setWishlistGames(validGames);
            setFilteredGames(validGames);
          }
        } else {
          console.log('📭 No games to hydrate');
          if (isMounted) {
            setWishlistGames([]);
            setFilteredGames([]);
          }
        }

      } catch (err) {
        console.error('❌ loadGames error:', err);
      } finally {
        if (isMounted) {
          setLoadingGames(false);
          setHasAttemptedLoad(true);
          console.log('🏁 loadGames complete');
        }
        clearTimeout(safety);
      }
    }

    loadGames();
    return () => { isMounted = false; clearTimeout(safety); };
  }, [resolvingUser, userNotFound, viewingProfile, refreshKey]);

  // ✅ EVENT LISTENER for wishlist updates
  useEffect(() => {
    const handleUpdate = () => {
        console.log("♻️ Syncing Wishlist...");
        setRefreshKey(k => k + 1);
    };
    window.addEventListener("wishlistUpdated", handleUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleUpdate);
  }, []);

  // Filter and sort games
  useEffect(() => {
    let result = [...wishlistGames];
    if (searchQuery) result = result.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterType === 'games') result = result.filter(g => g.type !== 'App');
    if (filterType === 'apps') result = result.filter(g => g.type === 'App');

    result.sort((a, b) => {
        if (sortBy === 'dateAdded-desc') return new Date(b.addedAt) - new Date(a.addedAt);
        if (sortBy === 'dateAdded-asc') return new Date(a.addedAt) - new Date(b.addedAt);
        return a.title.localeCompare(b.title);
    });
    setFilteredGames(result);
  }, [wishlistGames, searchQuery, filterType, sortBy]);

  // ✅ SIMPLIFIED: Only authenticated users can edit
  const isOwner = user && viewingProfile && user.id === viewingProfile.id;
  const canEdit = isOwner;

  const handleRemove = async (gameId) => {
    if (!canEdit) return;
    
    try {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('game_id', gameId);
      
      // Clear cache after removal
      requestCache.delete(`wishlist-full-${user.id}`);
      requestCache.delete(`wishlist-${user.id}-${gameId}`);
      requestCache.delete(`wishlist-count-${user.id}`);
      
      setWishlistGames(prev => prev.filter(g => g.id !== gameId));
      
      // Trigger sync for other components
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const handleClearAll = async () => {
    if (!canEdit) return;
    
    try {
      await supabase.from('wishlists').delete().eq('user_id', user.id);
      
      // Clear all user's wishlist cache
      for (const [key] of requestCache.entries()) {
        if (key.includes(`wishlist-${user.id}`) || key.includes(`wishlist-full-${user.id}`)) {
          requestCache.delete(key);
        }
      }
      
      setWishlistGames([]);
      setShowClearModal(false);
      
      // Trigger sync for other components
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${targetUsername}'s Wishlist - Rubies Unleashed`,
      text: `Check out this wishlist on Rubies Unleashed!`,
      url: shareUrl,
    };
    
    if (navigator.share) {
      try { 
        await navigator.share(shareData); 
        return true; 
      } catch (err) { 
        if (err.name !== 'AbortError') console.error("Share failed", err); 
      }
    }
    
    try { 
      await navigator.clipboard.writeText(shareUrl); 
      return true; 
    } catch (err) { 
      return false; 
    }
  };

  const stats = {
    total: wishlistGames.length,
    games: wishlistGames.filter(g => g.type !== 'App').length,
    apps: wishlistGames.filter(g => g.type === 'App').length
  };

  const isActuallyLoading = loadingGames || !hasAttemptedLoad;
  const shouldShowEmpty = hasAttemptedLoad && !loadingGames && wishlistGames.length === 0;

  console.log('🎯 Render decision:', {
    loadingGames,
    hasAttemptedLoad,
    wishlistGamesLength: wishlistGames.length,
    isActuallyLoading,
    shouldShowEmpty
  });

  // Render Logic
  if (resolvingUser) {
     return (
       <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
         <BackgroundEffects />
         <Navbar />
         <div className="pt-32 pb-12 px-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full animate-pulse mb-4" />
            <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-2" />
            <div className="h-12 w-64 bg-white/5 rounded animate-pulse" />
         </div>
         <main className="max-w-7xl mx-auto px-6 pb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-3/4 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
         </main>
         <Footer />
       </div>
     );
  }

  // User Not Found
  if (userNotFound) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans flex flex-col relative overflow-hidden selection:bg-red-500/30">
        <BackgroundEffects />
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10 pt-24">
            <div className="bg-[#161b2c]/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl max-w-md w-full shadow-[0_0_60px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
                <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <UserX size={40} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-3">Signal Lost</h1>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">The profile <span className="text-white font-bold font-mono bg-white/5 px-2 py-0.5 rounded">@{targetUsername}</span> could not be located in the Vault database.</p>
                <button onClick={() => router.push('/explore')} className="w-full bg-white text-black hover:bg-slate-200 px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Return to Exploration</button>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ✅ SIMPLIFIED: No guest access - require authentication
  if (!user || !viewingProfile) {
    return (
      <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
        <BackgroundEffects />
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10 pt-24">
          <div className="bg-[#161b2c]/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl max-w-md w-full shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-(--user-accent)/10 flex items-center justify-center border border-(--user-accent)/20">
              <Heart size={40} className="text-(--user-accent)" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-3">Sign In Required</h1>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              Create an account to save and manage your wishlist.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => router.push('/signup')} 
                className="w-full bg-(--user-accent) text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                Create Account
              </button>
              <button 
                onClick={() => router.push('/login')} 
                className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest transition-all hover:bg-white/10"
              >
                Sign In
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
      <BackgroundEffects />
      <Navbar />

      <section className="relative pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-surface/50 backdrop-blur-xl border-2 border-(--user-accent)/30 rounded-full text-5xl mb-4 shadow-lg text-white overflow-hidden">
              {viewingProfile?.avatar_url ? <img src={viewingProfile.avatar_url} className="w-full h-full object-cover" /> : "💎"}
            </div>
            <h2 className="text-2xl font-bold text-(--user-accent) mb-1">@{viewingProfile?.username || targetUsername}</h2>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-2">
              {isOwner ? "My" : `${targetUsername}'s`} <span className="text-(--user-accent)">Wishlist</span>
            </h1>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        {/* Loading State */}
        {isActuallyLoading ? (
            <>
              <div className="mb-4 text-center text-slate-400 text-sm">
                Loading wishlist...
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="aspect-3/4 bg-white/5 rounded-xl animate-pulse" />
                  ))}
              </div>
            </>
        ) : shouldShowEmpty ? (
          <EmptyWishlist />
        ) : (
          <>
            <WishlistStats stats={stats} />
            <WishlistControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterType={filterType}
              onFilterChange={setFilterType}
              onShare={handleShare}
              onClearAll={canEdit ? () => setShowClearModal(true) : null}
              itemCount={wishlistGames.length}
              isOwner={canEdit}
            />
            <WishlistGrid games={filteredGames} onRemove={canEdit ? handleRemove : null} />
          </>
        )}
      </main>

      <Footer />
      
      {/* Clear All Modal */}
      {showClearModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-surface border border-red-500/30 p-8 rounded-xl max-w-sm w-full text-center">
               <Trash2 size={48} className="text-red-500 mx-auto mb-4" />
               <h3 className="text-2xl font-bold text-white mb-2">Clear All?</h3>
               <p className="text-slate-400 mb-6">This cannot be undone.</p>
               <div className="flex gap-3">
                  <button onClick={handleClearAll} className="flex-1 bg-red-500 py-3 rounded-lg font-bold text-white">Clear</button>
                  <button onClick={() => setShowClearModal(false)} className="flex-1 bg-white/10 py-3 rounded-lg font-bold text-white">Cancel</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}