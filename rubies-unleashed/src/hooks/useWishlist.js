/**
 * ================================================================
 * WISHLIST HOOK - Centralized Wishlist State Management
 * ================================================================
 * 
 * Purpose:
 * - Provides reusable wishlist functionality across components
 * - Syncs with userManager.js (temp user system)
 * - Triggers auth gate for unauthenticated users
 * - Returns wishlist state and actions
 * - Dispatches events for real-time UI sync
 * 
 * Usage:
 * const { isWishlisted, toggleWishlist, wishlistCount, showAuthModal } = useWishlist(gameId);
 * 
 * Features:
 * - Auto-checks if game is in wishlist
 * - Provides toggle function that accepts game object
 * - Tracks total wishlist count
 * - Shows auth modal if user not authenticated
 * - Automatically refreshes on changes
 * - Dispatches "wishlistChanged" event for global sync
 * 
 * Auth Flow:
 * 1. User clicks wishlist
 * 2. Hook checks if user exists
 * 3. If no user → Show auth modal
 * 4. User chooses: Sign Up / Log In / Continue as Guest
 * 5. After auth → Complete wishlist action
 * 
 * Events Dispatched:
 * - "wishlistChanged" - Fired when any wishlist action occurs
 * ================================================================
 */

"use client";

import { useState, useEffect } from "react";
import { 
  addToWishlist, 
  removeFromWishlist, 
  isInWishlist,
  getWishlist,
  getCurrentUser,
  createGuestUser
} from "@/lib/userManager";
import { addNotification } from "@/lib/notificationManager";
import { useToastContext } from "@/components/providers/ToastProvider";

export function useWishlist(gameId = null) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingGame, setPendingGame] = useState(null);

  const { showToast } = useToastContext();

  // Check if specific game is wishlisted
  useEffect(() => {
    if (gameId) {
      checkWishlistStatus();
    }
    updateCount();
  }, [gameId]);

  // ✅ NEW: Listen for external wishlist changes
  useEffect(() => {
    const handleWishlistChange = () => {
      if (gameId) {
        checkWishlistStatus();
      }
      updateCount();
    };

    window.addEventListener("wishlistChanged", handleWishlistChange);
    
    return () => {
      window.removeEventListener("wishlistChanged", handleWishlistChange);
    };
  }, [gameId]);

  const checkWishlistStatus = () => {
    setIsWishlisted(isInWishlist(gameId));
  };

  const updateCount = () => {
    const wishlist = getWishlist();
    setWishlistCount(wishlist.length);
  };

  const toggleWishlist = (game) => {
    if (!game) return;

    // Check if user exists
    const user = getCurrentUser();
    
    if (!user) {
      // No user yet → Show auth modal
      setPendingGame(game);
      setShowAuthModal(true);
      return;
    }

    // User exists → Proceed with wishlist toggle
    executeWishlistToggle(game);
  };

  const executeWishlistToggle = (game) => {
    if (isInWishlist(game.id)) {
      removeFromWishlist(game.id);
      setIsWishlisted(false);
      
      showToast("Removed from wishlist", "info");
      
      addNotification({
        type: "wishlist",
        message: `Removed "${game.title}" from wishlist`,
        icon: "❌",
        actionData: {
          type: "wishlist_remove",
          game: game,
          gameSlug: game.slug
        }
      });
    } else {
      addToWishlist(game);
      setIsWishlisted(true);
      
      showToast(`${game.title} added to wishlist!`, "wishlist");
      
      addNotification({
        type: "wishlist",
        message: `Added "${game.title}" to wishlist`,
        icon: "❤️",
        actionData: {
          type: "wishlist_add",
          gameId: game.id,
          gameSlug: game.slug
        }
      });
    }
    
    updateCount();
    
    // ✅ NEW: Dispatch event for global sync
    window.dispatchEvent(new CustomEvent("wishlistChanged", { 
      detail: { gameId: game.id, action: isInWishlist(game.id) ? 'removed' : 'added' }
    }));
  };

  const handleContinueAsGuest = () => {
    // Create guest user
    createGuestUser();
    
    // ✅ Notify navbar to update
    window.dispatchEvent(new Event("userChanged"));
    
    // Execute pending wishlist action
    if (pendingGame) {
      executeWishlistToggle(pendingGame);
      setPendingGame(null);
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setPendingGame(null);
  };

  return {
    isWishlisted,
    wishlistCount,
    toggleWishlist,
    showAuthModal,
    closeAuthModal,
    handleContinueAsGuest,
    refresh: updateCount
  };
}