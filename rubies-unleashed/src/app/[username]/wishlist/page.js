// src/app/[username]/wishlist/page.js
/**
 * DYNAMIC WISHLIST PAGE
 * 
 * Route: /[username]/wishlist
 * 
 * Features:
 * - Dynamic username routing
 * - Search, sort, filter controls
 * - Stats cards
 * - ✅ UPDATED: Share blocked for guest users (requires sign up)
 * - Clear all with confirmation
 * - ✅ NEW: "Sign Up to Share" CTA for guest users
 * - Fully responsive
 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertTriangle, Share2, Trash2, Heart, Sparkles } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import WishlistGrid from "@/components/wishlist/WishlistGrid";
import WishlistStats from "@/components/wishlist/WishlistStats";
import WishlistControls from "@/components/wishlist/WishlistControls";
import EmptyWishlist from "@/components/wishlist/EmptyWishlist";
import AuthModal from "@/components/auth/AuthModal";
import {
  getCurrentUser,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistStats,
  updatePreferences,
  getPreferences,
  createGuestUser,
} from "@/lib/userManager";

export default function WishlistPage() {
  const params = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, games: 0, apps: 0 });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded-desc");
  const [filterType, setFilterType] = useState("all");

  // Modal states
  const [showClearModal, setShowClearModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ✅ NEW: Guest detection
  const [isGuest, setIsGuest] = useState(false);
  const [showSignUpBanner, setShowSignUpBanner] = useState(false);

  // Load user and wishlist
  useEffect(() => {
    try {
      const user = getCurrentUser();
      const items = getWishlist();
      const prefs = getPreferences();

      setCurrentUser(user);
      setWishlist(items);
      setSortBy(prefs.sortBy || "dateAdded-desc");
      setStats(getWishlistStats());

      // ✅ NEW: Check if guest with items
      const isGuestUser = user?.isGuest === true;
      setIsGuest(isGuestUser);
      setShowSignUpBanner(isGuestUser && items.length > 0);

      // Check if username matches current user
      if (user && params.username !== user.username) {
        // In future, this could load other users' public wishlists
        // For now, redirect to own wishlist
        router.push(`/${user.username}/wishlist`);
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [params.username, router]);

  // ✅ NEW: Listen for user changes (after guest creation or login)
  useEffect(() => {
    const handleUserChanged = () => {
      const user = getCurrentUser();
      const items = getWishlist();
      
      setCurrentUser(user);
      setWishlist(items);
      setStats(getWishlistStats());
      
      const isGuestUser = user?.isGuest === true;
      setIsGuest(isGuestUser);
      setShowSignUpBanner(isGuestUser && items.length > 0);
    };

    window.addEventListener("userChanged", handleUserChanged);
    
    return () => {
      window.removeEventListener("userChanged", handleUserChanged);
    };
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...wishlist];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((game) =>
        game.title.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType === "games") {
      filtered = filtered.filter((game) => game.type !== "App");
    } else if (filterType === "apps") {
      filtered = filtered.filter((game) => game.type === "App");
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dateAdded-desc":
          return (b.addedAt || 0) - (a.addedAt || 0);
        case "dateAdded-asc":
          return (a.addedAt || 0) - (b.addedAt || 0);
        case "alphabetical-asc":
          return a.title.localeCompare(b.title);
        case "alphabetical-desc":
          return b.title.localeCompare(a.title);
        case "type":
          return (a.type || "").localeCompare(b.type || "");
        default:
          return 0;
      }
    });

    setFilteredGames(filtered);
  }, [wishlist, searchQuery, sortBy, filterType]);

  // Handle remove
  const handleRemove = (gameId) => {
    removeFromWishlist(gameId);
    const updated = wishlist.filter((g) => g.id !== gameId);
    setWishlist(updated);
    setStats(getWishlistStats());
    
    // ✅ NEW: Hide banner if no items left
    if (updated.length === 0 && isGuest) {
      setShowSignUpBanner(false);
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    clearWishlist();
    setWishlist([]);
    setStats({ total: 0, games: 0, apps: 0 });
    setShowClearModal(false);
    
    // ✅ NEW: Hide banner after clearing
    if (isGuest) {
      setShowSignUpBanner(false);
    }
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    updatePreferences({ sortBy: value });
  };

  // ✅ UPDATED: Handle share - Block for guests
  const handleShare = async () => {
    // Block sharing for guest users
    if (isGuest) {
      setShowAuthModal(true);
      return false;
    }

    // Allow sharing for authenticated users
    const shareUrl = `${window.location.origin}/${currentUser?.username}/wishlist`;
    const shareData = {
      title: `${currentUser?.username}'s Wishlist - Rubies Unleashed`,
      text: `Check out my game wishlist on Rubies Unleashed!`,
      url: shareUrl,
    };

    // Try native share API
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (error) {
        // User cancelled or share failed
        if (error.name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (error) {
      console.error("Copy failed:", error);
      return false;
    }
  };

  // ✅ NEW: Handle "Continue as Guest" from auth modal
  const handleContinueAsGuest = () => {
    createGuestUser();
    window.dispatchEvent(new Event("userChanged"));
    setShowAuthModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <Loader2 className="animate-spin text-ruby" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans selection:bg-ruby/30 selection:text-white">
      <BackgroundEffects />
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* User Info */}
          <div className="text-center mb-6">
            {/* Avatar */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-ruby/20 to-ruby/5 backdrop-blur-xl border-2 border-ruby/30 rounded-full text-5xl mb-4 shadow-[0_0_40px_rgba(224,17,95,0.2)]">
              {currentUser?.avatar || "💎"}
            </div>

            {/* Username */}
            <h2 className="text-2xl font-bold text-ruby mb-1">
              @{currentUser?.username || "Guest"}
            </h2>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-slate-500 uppercase tracking-tighter mb-2">
              My <span className="text-ruby">Wishlist</span>
            </h1>
          </div>

          {/* Decorative Line */}
          <div className="w-32 h-1 bg-linear-to-r from-transparent via-ruby to-transparent mx-auto opacity-50" />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        
        {/* ✅ NEW: Sign Up to Share Banner (Guest Users with Items) */}
        {showSignUpBanner && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="relative overflow-hidden bg-linear-to-r from-ruby/10 via-violet-600/10 to-ruby/10 border border-ruby/20 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(224,17,95,0.1)]">
              {/* Ruby Glow Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-ruby to-transparent opacity-50" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                {/* Left: Icon + Text */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Animated Heart Icon */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-ruby/30 blur-xl rounded-full animate-pulse" />
                    <div className="relative p-3 rounded-xl bg-ruby/20 border border-ruby/30">
                      <Heart size={28} className="text-ruby" fill="currentColor" />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                      Save Your Wishlist <span className="text-ruby">Forever</span>
                      <Sparkles size={20} className="text-ruby animate-pulse" />
                    </h3>
                    <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
                      You're browsing as a guest. Sign up to save your{" "}
                      <span className="font-bold text-white">{stats.total} {stats.total === 1 ? "item" : "items"}</span>{" "}
                      permanently, sync across devices, and unlock sharing features.
                    </p>
                  </div>
                </div>

                {/* Right: Action Button */}
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="shrink-0 w-full md:w-auto bg-ruby hover:bg-[#c00e50] text-white px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all hover:scale-105 shadow-[0_0_30px_rgba(224,17,95,0.3)] hover:shadow-[0_0_40px_rgba(224,17,95,0.5)] flex items-center justify-center gap-2 group"
                >
                  <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                  Sign Up Free
                </button>
              </div>
            </div>
          </div>
        )}

        {wishlist.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            {/* Stats Cards */}
            <WishlistStats stats={stats} />

            {/* Controls Bar */}
            <WishlistControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              filterType={filterType}
              onFilterChange={setFilterType}
              onShare={handleShare}
              onClearAll={() => setShowClearModal(true)}
              itemCount={wishlist.length}
            />

            {/* Results Count */}
            {searchQuery && (
              <p className="text-slate-400 text-sm mb-4">
                Found {filteredGames.length} result{filteredGames.length !== 1 ? "s" : ""} for "{searchQuery}"
              </p>
            )}

            {/* Grid */}
            {filteredGames.length > 0 ? (
              <WishlistGrid games={filteredGames} onRemove={handleRemove} />
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-400 text-lg">No items match your filters</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* ✅ UPDATED: Auth Modal (Sign Up to Share or Save Wishlist) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onContinueAsGuest={handleContinueAsGuest}
        message={`Sign up to save your ${stats.total} wishlist ${stats.total === 1 ? "item" : "items"} forever and unlock sharing features!`}
      />

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans selection:bg-ruby selection:text-white">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setShowClearModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-surface border border-red-500/30 rounded-xl shadow-[0_0_60px_rgba(239,68,68,0.2)] p-8 animate-in zoom-in-95 duration-300">
            {/* Red Scanline */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-red-500 to-transparent opacity-50" />

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full animate-pulse" />
                <div className="relative border border-red-500 p-4 rounded-xl bg-black shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                  <Trash2 size={48} className="text-red-500" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-black text-white uppercase tracking-tight text-center mb-2">
              Clear <span className="text-red-500">Everything</span>?
            </h3>

            {/* Message */}
            <p className="text-slate-400 text-sm text-center mb-2 leading-relaxed">
              This will permanently remove <span className="text-white font-bold">all {stats.total} items</span> from your wishlist.
            </p>

            <p className="text-slate-500 text-xs text-center mb-8">
              This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClearAll}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] text-xs"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-6 py-3 rounded-sm border border-white/10 hover:bg-white/5 text-slate-400 font-bold uppercase tracking-widest transition-all text-xs"
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