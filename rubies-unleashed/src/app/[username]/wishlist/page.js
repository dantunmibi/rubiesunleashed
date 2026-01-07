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
import { fetchGames } from "@/lib/blogger"; // ✅ Use fetchGames instead of fetchGameById
import { 
  getWishlist as localGet, 
  clearWishlist as localClear,
  removeFromWishlist as localRemove,
  createGuestUser 
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
        else if (targetUsername && targetUsername !== 'guest') {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', targetUsername)
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
             const localItems = localGet();
             gameIds = localItems.map(item => ({ 
                id: item.id || item, 
                addedAt: item.addedAt || new Date() 
             }));
        } else {
            console.warn(`User ${targetUsername} not found.`);
            setUserNotFound(true);
            setLoading(false);
            return;
        }

        // --- C. OPTIMIZED HYDRATION ---
        // 1. Fetch ALL games once (Fast because it hits Snapshot + 1 API call)
        const allGames = await fetchGames(2000);
        
        // 2. Map IDs to Game Objects in Memory
        const validGames = gameIds.map(item => {
            // Find game in the big list
            const game = allGames.find(g => 
                g.id === item.id || 
                g.slug === item.id || 
                g.slug.endsWith(`-${item.id}`)
            );
            return game ? { ...game, addedAt: item.addedAt } : null;
        }).filter(g => g !== null);
        
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

  // 3. Define Context Variables FIRST
  const isOwner = user && viewingProfile && user.id === viewingProfile.id;
  const isGuestView = !user; 

  // 4. Handlers (Now have access to variables)
  const handleRemove = async (gameId) => {
    if (!isOwner && !isGuestView) return;
    if (user) await supabase.from('wishlists').delete().eq('user_id', user.id).eq('game_id', gameId);
    else localRemove(gameId);
    setWishlistGames(prev => prev.filter(g => g.id !== gameId));
  };

  const handleClearAll = async () => {
    if (!isOwner && !isGuestView) return;
    if (user) await supabase.from('wishlists').delete().eq('user_id', user.id);
    else localClear();
    setWishlistGames([]);
    setShowClearModal(false);
  };

  const handleShare = async () => {
    if (isGuestView) {
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

  if (userNotFound) {
    return (
      <div className="min-h-screen bg-background text-slate-200 font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-surface border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl">
                <UserX size={64} className="text-slate-600 mx-auto mb-6" />
                <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                    User Not Found
                </h1>
                <p className="text-slate-400 mb-8">
                    The Architect could not locate a profile for <span className="text-(--user-accent) font-bold">@{targetUsername}</span>.
                </p>
                <button 
                    onClick={() => router.push('/explore')} 
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest transition-all"
                >
                    Return to Vault
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-surface/50 backdrop-blur-xl border-2 border-(--user-accent)/30 rounded-full text-5xl mb-4 shadow-lg text-white">
                  {viewingProfile?.avatar_url ? (
        <img 
            src={viewingProfile.avatar_url} 
            alt="Avatar" 
            className="w-full h-full object-cover" 
        />
    ) : (
        "💎"
    )}
            </div>
            <h2 className="text-2xl font-bold text-(--user-accent) mb-1">@{viewingProfile?.username || targetUsername || "Guest"}</h2>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-2">
              {isOwner || isGuestView ? "My" : `${targetUsername}'s`} <span className="text-(--user-accent)">Wishlist</span>
            </h1>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        
        {isGuestView && wishlistGames.length > 0 && (
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
              onClearAll={isOwner || isGuestView ? () => setShowClearModal(true) : null}
              itemCount={wishlistGames.length}
              isOwner={isOwner || isGuestView}
            />
            <WishlistGrid games={filteredGames} onRemove={isOwner || isGuestView ? handleRemove : null} />
          </>
        )}
      </main>

      <Footer />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onContinueAsGuest={createGuestUser} 
        message="Sign up to share your wishlist!"
      />
      
      {/* Clear Modal */}
      {showClearModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={() => setShowClearModal(false)}
            />
            
            {/* Modal Content - Pop In Animation */}
            <div className="relative bg-[#161b2c] border border-red-500/30 p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in-95 fade-in duration-300">
               
               {/* Glowing Icon */}
               <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <Trash2 size={32} className="text-red-500" />
               </div>

               <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Clear All?</h3>
               <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                 This will permanently remove <span className="text-white font-bold">{wishlistGames.length} items</span> from your wishlist. This action cannot be undone.
               </p>
               
               <div className="flex gap-3">
                  <button 
                    onClick={handleClearAll} 
                    className="flex-1 bg-red-600 hover:bg-red-400 py-3.5 rounded-xl font-bold text-white cursor-pointer uppercase tracking-wider text-xs shadow-lg shadow-red-900/20 active:scale-95 transition-all"
                  >
                    Yes, Clear
                  </button>
                  <button 
                    onClick={() => setShowClearModal(false)} 
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3.5 rounded-xl cursor-pointer font-bold text-slate-300 uppercase tracking-wider text-xs active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}