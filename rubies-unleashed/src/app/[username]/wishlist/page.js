/**
 * DYNAMIC WISHLIST PAGE (Optimized)
 * ---------------------------------
 * - Fast Initial Paint: Resolves User immediately.
 * - Lazy Data Load: Shows Skeleton while fetching games.
 * - Bulk Fetch: Optimized network usage.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, Sparkles, Trash2, UserX } from "lucide-react"; // Loader2 removed (using Skeleton)
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import WishlistGrid from "@/components/wishlist/WishlistGrid";
import WishlistStats from "@/components/wishlist/WishlistStats";
import WishlistControls from "@/components/wishlist/WishlistControls";
import EmptyWishlist from "@/components/wishlist/EmptyWishlist";
import AuthModal from "@/components/auth/AuthModal";
import GameSkeleton from "@/components/store/GameSkeleton"; // Or grid skeleton

// Logic Imports
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { fetchGames, fetchGameById } from "@/lib/blogger";
import { 
  getWishlist as localGet, 
  clearWishlist as localClear,
  removeFromWishlist as localRemove,
  createGuestUser,
  getCurrentUser
} from "@/lib/userManager";

export default function WishlistPage() {
  const { user, profile } = useAuth(); 
  const params = useParams(); 
  const router = useRouter();
  
  const targetUsername = decodeURIComponent(params.username); 
  
  const [wishlistGames, setWishlistGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  
  // Two Loading States
  const [resolvingUser, setResolvingUser] = useState(true);
  const [loadingGames, setLoadingGames] = useState(false);
  
  const [viewingProfile, setViewingProfile] = useState(null); 
  const [userNotFound, setUserNotFound] = useState(false); 
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded-desc");
  const [filterType, setFilterType] = useState("all");

  const [showClearModal, setShowClearModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 1. Resolve Target User (Fast)
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

        // B. Guest Check
        if (!user) {
             const localUser = getCurrentUser(); 
             if (localUser?.username?.toLowerCase() === targetUsername.toLowerCase()) {
                 setViewingProfile(null); // Guest has no profile obj, but exists
                 setResolvingUser(false);
                 return;
             }
        }

        // C. Public Lookup
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

        // D. Not Found
        console.warn(`User ${targetUsername} not found.`);
        setUserNotFound(true);
        setResolvingUser(false);

      } catch (err) {
        console.error("User Resolution Error:", err);
        setResolvingUser(false);
      }
    }

    resolveUser();
  }, [targetUsername, user?.id, profile]);

  // 2. Fetch Wishlist Data (Slow) - Dependent on resolved user
  useEffect(() => {
    if (resolvingUser || userNotFound) return;

    let isMounted = true;
    
    // ✅ Safety Valve
    const safety = setTimeout(() => {
        if (isMounted) setLoadingGames(false);
    }, 5000);

    async function loadGames() {
      // ✅ Only skeleton if genuinely empty
      if (wishlistGames.length === 0) setLoadingGames(true);
      let gameIds = [];
      
      try {
        // Determine Source
        if (viewingProfile) {
             // Cloud Fetch
             const { data } = await supabase
            .from('wishlists')
            .select('game_id, added_at')
            .eq('user_id', viewingProfile.id)
            .order('added_at', { ascending: false });
            gameIds = data?.map(row => ({ id: row.game_id, addedAt: new Date(row.added_at) })) || [];
        } else if (!user) {
             // Guest Local Fetch
             const localItems = localGet();
             gameIds = localItems.map(item => ({ id: item.id || item, addedAt: item.addedAt || new Date() }));
        }

        // Hydrate
        if (gameIds.length > 0) {
            const allGames = await fetchGames(2000);
            let validGames = [];
            
            if (allGames && allGames.length > 0) {
                 validGames = gameIds.map(item => {
                    const game = allGames.find(g => 
                        g.id === item.id || g.slug === item.id || g.slug.endsWith(`-${item.id}`)
                    );
                    return game ? { ...game, addedAt: item.addedAt } : null;
                }).filter(Boolean);
            } else {
                const detailsPromises = gameIds.map(async (item) => {
                    const game = await fetchGameById(item.id);
                    return game ? { ...game, addedAt: item.addedAt } : null;
                });
                validGames = (await Promise.all(detailsPromises)).filter(Boolean);
            }
        if (isMounted) {
            setWishlistGames(validGames);
            setFilteredGames(validGames);
        }
        } else {
            setWishlistGames([]);
            setFilteredGames([]);
        }


      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoadingGames(false);
        clearTimeout(safety);
      }
    }

    loadGames();
    return () => { isMounted = false; clearTimeout(safety); };
  }, [resolvingUser, userNotFound, viewingProfile, user]);

  // ... (Sort/Filter/Handlers same as before) ...
  // [Copy useEffect for Filter & Sort]
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

  // [Copy Handlers: handleRemove, handleClearAll, handleShare]
  const isOwner = user && viewingProfile && user.id === viewingProfile.id;
  const isGuestView = !user; 
  const localUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("ruby_user_data") || '{}') : null;
  const isGuestOwner = !user && localUser?.username?.toLowerCase() === targetUsername.toLowerCase();
  const canEdit = isOwner || isGuestOwner;

  const handleRemove = async (gameId) => {
    if (!canEdit) return;
    if (user) await supabase.from('wishlists').delete().eq('user_id', user.id).eq('game_id', gameId);
    else localRemove(gameId);
    setWishlistGames(prev => prev.filter(g => g.id !== gameId));
  };

  const handleClearAll = async () => {
    if (!canEdit) return;
    if (user) await supabase.from('wishlists').delete().eq('user_id', user.id);
    else localClear();
    setWishlistGames([]);
    setShowClearModal(false);
  };

  const handleShare = async () => {
    if (isGuestOwner) {
      setShowAuthModal(true);
      return false;
    }
    const shareUrl = window.location.href;
    const shareData = {
      title: `${targetUsername}'s Wishlist - Rubies Unleashed`,
      text: `Check out this wishlist on Rubies Unleashed!`,
      url: shareUrl,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); return true; } catch (err) { if (err.name !== 'AbortError') console.error("Share failed", err); }
    }
    try { await navigator.clipboard.writeText(shareUrl); return true; } catch (err) { return false; }
  };

  const stats = {
    total: wishlistGames.length,
    games: wishlistGames.filter(g => g.type !== 'App').length,
    apps: wishlistGames.filter(g => g.type === 'App').length
  };

  // Render Logic
  if (resolvingUser) {
     // Show Skeleton Page (Header + Grid)
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
    // ... (Keep existing User Not Found UI) ...
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

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
      <BackgroundEffects />
      <Navbar />

      <section className="relative pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-surface/50 backdrop-blur-xl border-2 border-(--user-accent)/30 rounded-full text-5xl mb-4 shadow-lg text-white overflow-hidden">
              {viewingProfile?.avatar_url ? <img src={viewingProfile.avatar_url} className="w-full h-full object-cover" /> : "💎"}
            </div>
            <h2 className="text-2xl font-bold text-(--user-accent) mb-1">@{viewingProfile?.username || targetUsername || "Guest"}</h2>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-2">
              {isOwner || isGuestOwner ? "My" : `${targetUsername}'s`} <span className="text-(--user-accent)">Wishlist</span>
            </h1>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        
        {isGuestOwner && wishlistGames.length > 0 && (
           <div className="mb-8 p-6 bg-surface/50 border border-(--user-accent)/20 rounded-2xl flex items-center justify-between gap-6 backdrop-blur-md">
              <div>
                 <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Sparkles size={18} className="text-(--user-accent)" /> Save Forever</h3>
                 <p className="text-slate-400 text-sm">Sign up to sync your list across devices.</p>
              </div>
              <button onClick={() => setShowAuthModal(true)} className="bg-(--user-accent) text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all">Sign Up</button>
           </div>
        )}

        {/* LOADING GRID vs CONTENT */}
        {loadingGames ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-3/4 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
        ) : wishlistGames.length === 0 ? (
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
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onContinueAsGuest={createGuestUser} message="Sign up to share your wishlist!" />
      
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