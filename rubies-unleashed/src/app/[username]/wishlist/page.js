/**
 * DYNAMIC WISHLIST PAGE (Cloud Integrated)
 * ----------------------------------------
 * Fetches wishlist from Supabase (if logged in) or LocalStorage (if guest).
 * Hydrates game details via blogger API/Snapshot.
 * Allows viewing other users' public wishlists.
 * Handles "User Not Found" gracefully.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Heart, Sparkles, Trash2, UserX } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import WishlistGrid from "@/components/wishlist/WishlistGrid";
import WishlistStats from "@/components/wishlist/WishlistStats";
import WishlistControls from "@/components/wishlist/WishlistControls";
import EmptyWishlist from "@/components/wishlist/EmptyWishlist";
import AuthModal from "@/components/auth/AuthModal";

// Logic Imports
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { fetchGames, fetchGameById } from "@/lib/blogger"; // ✅ Use fetchGames for bulk
import { 
  getWishlist as localGet, 
  clearWishlist as localClear,
  removeFromWishlist as localRemove,
  createGuestUser,
  getCurrentUser // ✅ Ensure imported
} from "@/lib/userManager";

export default function WishlistPage() {
  const { user, profile } = useAuth(); 
  const params = useParams(); 
  const router = useRouter();
  
  const targetUsername = decodeURIComponent(params.username); 
  
  const [wishlistGames, setWishlistGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredGames, setFilteredGames] = useState([]);
  const [viewingProfile, setViewingProfile] = useState(null); 
  const [userNotFound, setUserNotFound] = useState(false); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded-desc");
  const [filterType, setFilterType] = useState("all");

  const [showClearModal, setShowClearModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 1. Fetch Data Logic
  useEffect(() => {
    async function loadData() {
      // Only show spinner if we don't have data yet to prevent flashing
      if (wishlistGames.length === 0) setLoading(true);
      setUserNotFound(false); 
      
      let gameIds = [];
      let targetUserId = null;
      let targetProfileData = null;

      try {
        // --- A. DETERMINE TARGET USER ---
        if (user && (user.user_metadata?.username === targetUsername || profile?.username === targetUsername)) {
            targetUserId = user.id;
            targetProfileData = profile;
        } 
        else if (targetUsername && targetUsername.toLowerCase() !== 'guest') {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .ilike('username', targetUsername)
                .single();
            
            if (data) {
                targetUserId = data.id;
                targetProfileData = data;
            }
        }

        setViewingProfile(targetProfileData);

        // --- B. FETCH OR FALLBACK ---
        if (targetUserId) {
             const { data } = await supabase
            .from('wishlists')
            .select('game_id, added_at')
            .eq('user_id', targetUserId)
            .order('added_at', { ascending: false });
            
            gameIds = data?.map(row => ({ id: row.game_id, addedAt: new Date(row.added_at) })) || [];
        } 
        else if (!user) {
             // ✅ GUEST CHECK FIX
             const localUser = getCurrentUser(); 
             
             // Compare Case Insensitively to ensure Guest matches URL
             const isMyGuestAccount = localUser?.username?.toLowerCase() === targetUsername.toLowerCase();

             if (isMyGuestAccount) {
                 const localItems = localGet();
                 gameIds = localItems.map(item => ({ 
                    id: item.id || item, 
                    addedAt: item.addedAt || new Date() 
                 }));
             } else {
                 // Trying to view a guest URL that isn't mine -> 404
                 console.warn(`Guest ${targetUsername} not found locally.`);
                 setUserNotFound(true);
                 setLoading(false);
                 return;
             }
        } else {
            // Logged in user trying to view non-existent profile
            console.warn(`User ${targetUsername} not found.`);
            setUserNotFound(true);
            setLoading(false);
            return;
        }

        // --- C. OPTIMIZED HYDRATION ---
        // Fetch ALL games once (Fast because it hits Snapshot + 1 API call)
        // Fallback to fetchGameById if fetchGames returns empty (rare)
        const allGames = await fetchGames(2000);
        
        let validGames = [];
        
        if (allGames && allGames.length > 0) {
             validGames = gameIds.map(item => {
                const game = allGames.find(g => 
                    g.id === item.id || 
                    g.slug === item.id || 
                    g.slug.endsWith(`-${item.id}`)
                );
                return game ? { ...game, addedAt: item.addedAt } : null;
            }).filter(Boolean);
        } else {
            // Fallback: Individual fetch if bulk failed
            const detailsPromises = gameIds.map(async (item) => {
                const game = await fetchGameById(item.id);
                return game ? { ...game, addedAt: item.addedAt } : null;
            });
            validGames = (await Promise.all(detailsPromises)).filter(Boolean);
        }
        
        setWishlistGames(validGames);
        setFilteredGames(validGames); 

      } catch (err) {
        console.error("Wishlist Load Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [targetUsername, user?.id, profile]);

  // 2. Filter & Sort Logic
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

  // 3. Permissions Logic
  const localUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("ruby_user_data") || '{}') : null;
  const isOwner = user && viewingProfile && user.id === viewingProfile.id;
  const isGuestOwner = !user && localUser?.username?.toLowerCase() === targetUsername.toLowerCase();
  
  const canEdit = isOwner || isGuestOwner;

  // 4. Handlers
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-(--user-accent)" size={48} />
      </div>
    );
  }

  // User Not Found Screen
  if (userNotFound) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans flex flex-col relative overflow-hidden selection:bg-red-500/30">
        <BackgroundEffects />
        <Navbar />
        
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10 pt-24">
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="bg-[#161b2c]/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl max-w-md w-full shadow-[0_0_60px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
                
                {/* Icon */}
                <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <UserX size={40} className="text-red-500" />
                </div>

                <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-3">
                    Signal Lost
                </h1>
                
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                    The profile <span className="text-white font-bold font-mono bg-white/5 px-2 py-0.5 rounded">@{targetUsername}</span> could not be located in the Vault database.
                </p>
                
                <button 
                    onClick={() => router.push('/explore')} 
                    className="w-full bg-white text-black hover:bg-slate-200 px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                    Return to Exploration
                </button>
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

        {wishlistGames.length === 0 ? (
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
      
      {/* Full AuthModal Component */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onContinueAsGuest={() => {
            createGuestUser();
            window.dispatchEvent(new Event("userChanged"));
            setShowAuthModal(false);
        }} 
        message="Sign up to share your wishlist!"
      />
      
      {/* Clear Modal */}
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