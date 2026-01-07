/**
 * ================================================================
 * WISHLIST HOOK - Dual-Mode (Cloud + Local)
 * ================================================================
 * 
 * Logic:
 * - If User Logged In -> Syncs with Supabase DB.
 * - If Guest -> Syncs with LocalStorage.
 * - Handles Auth Gates & Notifications.
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { 
  addToWishlist as localAdd, 
  removeFromWishlist as localRemove, 
  isInWishlist as localCheck,
  getWishlist as localGet,
  createGuestUser
} from "@/lib/userManager";
import { addNotification } from "@/lib/notificationManager";
import { useToastContext } from "@/components/providers/ToastProvider";

export function useWishlist(gameId = null) {
  const { user } = useAuth(); // ✅ Access Supabase User
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingGame, setPendingGame] = useState(null);
  
  const { showToast } = useToastContext();

  // 1. Initial Check & Count Update
  useEffect(() => {
    checkStatus();
    updateCount();
  }, [gameId, user]);

  // 2. Listen for Realtime Changes (Supabase Subscription)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('wishlist-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'wishlists', 
        filter: `user_id=eq.${user.id}` 
      }, () => {
        checkStatus();
        updateCount();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, gameId]);

  // --- Logic Helpers ---

  const checkStatus = async () => {
    if (!gameId) return;

    if (user) {
      // Cloud Check
      const { data } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .single();
      setIsWishlisted(!!data);
    } else {
      // Local Check
      setIsWishlisted(localCheck(gameId));
    }
  };

  const updateCount = async () => {
    if (user) {
      const { count } = await supabase
        .from('wishlists')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setWishlistCount(count || 0);
    } else {
      setWishlistCount(localGet().length);
    }
  };

  // --- Actions ---

  const toggleWishlist = async (game) => {
    if (!game) return;

    // Check if user exists (Supabase OR Guest)
    // We check `user` (Supabase) directly.
    // If no Supabase user, check if Guest user exists in LocalStorage.
    const localGuest = typeof window !== 'undefined' ? localStorage.getItem("ruby_user_data") : null;
    
    if (!user && !localGuest) {
      setPendingGame(game);
      setShowAuthModal(true);
      return;
    }

    // Perform Toggle
    if (isWishlisted) {
      await removeItem(game);
    } else {
      await addItem(game);
    }
  };

  const addItem = async (game) => {
    if (user) {
      const { error } = await supabase.from('wishlists').insert({
        user_id: user.id,
        game_id: game.id
      });
      if (!error) {
        setIsWishlisted(true);
        showToast(`${game.title} saved to wishlist`, "success");
      }
    } else {
      localAdd(game);
      setIsWishlisted(true);
      showToast(`${game.title} saved locally`, "wishlist");
    }
    updateCount();
  };

  const removeItem = async (game) => {
    if (user) {
      const { error } = await supabase.from('wishlists').delete().eq('user_id', user.id).eq('game_id', game.id);
      if (!error) {
        setIsWishlisted(false);
        showToast("Removed from cloud wishlist", "info");
      }
    } else {
      localRemove(game.id);
      setIsWishlisted(false);
      showToast("Removed from local wishlist", "info");
    }
    updateCount();
  };

  const handleContinueAsGuest = () => {
    createGuestUser();
    window.dispatchEvent(new Event("userChanged"));
    if (pendingGame) {
      addItem(pendingGame); // Guest mode add
      setPendingGame(null);
    }
    setShowAuthModal(false);
  };

  return {
    isWishlisted,
    wishlistCount,
    toggleWishlist,
    showAuthModal,
    closeAuthModal: () => setShowAuthModal(false),
    handleContinueAsGuest
  };
}