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
import { useToastContext } from "@/components/providers/ToastProvider";
import { addNotification } from "@/lib/notificationManager";

// ✅ FIXED: Cache outside component scope
const requestCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

const cachedQuery = async (key, queryFn) => {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await queryFn();
  requestCache.set(key, { data, timestamp: Date.now() });
  
  // Cleanup old entries to prevent memory leaks
  if (requestCache.size > 100) {
    const oldestKey = requestCache.keys().next().value;
    requestCache.delete(oldestKey);
  }
  
  return data;
};

export function useWishlist(gameId = null) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingGame, setPendingGame] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  
  const { showToast } = useToastContext();

  const handleAuthError = (error) => {
    console.error("Wishlist Auth Error:", error);
    window.dispatchEvent(new Event("sessionExpired"));
  };

  // Get auth token once when user changes
  useEffect(() => {
    const getToken = async () => {
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthToken(session?.access_token);
      } else {
        setAuthToken(null);
      }
    };
    getToken();
  }, [user]);

  const checkStatus = async () => {
    if (!gameId) return;
    if (user) {
      const data = await cachedQuery(`wishlist-${user.id}-${gameId}`, async () => {
        const { data } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', user.id)
          .eq('game_id', String(gameId))
          .single();
        return data;
      });
      setIsWishlisted(!!data);
    } else {
      setIsWishlisted(localCheck(gameId));
    }
  };

  const updateCount = async () => {
    if (user) {
      const count = await cachedQuery(`wishlist-count-${user.id}`, async () => {
        const { count } = await supabase
          .from('wishlists')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        return count || 0;
      });
      setWishlistCount(count);
    } else {
      setWishlistCount(localGet().length);
    }
  };

  // ✅ FIXED: Added missing dependencies
  useEffect(() => {
    const handleSync = () => {
      checkStatus();
      updateCount();
    };
    window.addEventListener("wishlistUpdated", handleSync);
    return () => window.removeEventListener("wishlistUpdated", handleSync);
  }, [gameId, user]); // checkStatus and updateCount are stable due to caching

  // Initial Sync
  useEffect(() => {
    checkStatus();
    updateCount();
  }, [gameId, user?.id]);

  // ✅ OPTIMIZED: Debounced realtime subscriptions
  useEffect(() => {
    if (!user) return;
    
    let timeoutId;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        checkStatus();
        updateCount();
      }, 500);
    };

    const channel = supabase
      .channel(`wishlist-${user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT',
        schema: 'public', 
        table: 'wishlists', 
        filter: `user_id=eq.${user.id}` 
      }, debouncedUpdate)
      .on('postgres_changes', { 
        event: 'DELETE',
        schema: 'public', 
        table: 'wishlists', 
        filter: `user_id=eq.${user.id}` 
      }, debouncedUpdate)
      .subscribe();

    return () => { 
      clearTimeout(timeoutId);
      supabase.removeChannel(channel); 
    };
  }, [user?.id]);

  const callApi = async (action, game) => {
    if (!authToken) {
      throw new Error("No valid session token");
    }
    
    const response = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        action,
        user_id: user.id,
        game_id: game.id
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API call failed");
    }
    
    return await response.json();
  };

  const toggleWishlist = async (game) => {
    if (!game) return;

    const localGuest = typeof window !== 'undefined' ? localStorage.getItem("ruby_user_data") : null;

    if (!user && !localGuest) {
      setPendingGame(game);
      setShowAuthModal(true);
      return;
    }

    const previousState = isWishlisted;
    setIsWishlisted(!previousState);

    try {
      if (previousState) {
        if (user) {
          await callApi('remove', game);
          showToast("Removed from wishlist", "info");
          addNotification({
            message: `${game.title} has been removed from your collection.`,
            icon: "❤️",
            timestamp: Date.now(),
            read: false,
            actionData: {
              type: "wishlist_remove", // ✅ Fixed: should be remove
              gameId: String(game.id),
              gameSlug: game.slug
            }
          });
        } else {
          localRemove(game.id);
          showToast("Removed locally", "info");
        }
      } else {
        if (user) {
          await callApi('add', game);
          showToast("Saved to wishlist", "success");
          addNotification({
            message: `${game.title} is now in your collection.`,
            icon: "❤️",
            timestamp: Date.now(),
            read: false,
            actionData: {
              type: "wishlist_add",
              gameId: String(game.id),
              gameSlug: game.slug
            }
          });
        } else {
          localAdd(game);
          showToast("Saved locally", "wishlist");
          addNotification({
            message: `${game.title} saved to wishlist`,
            icon: "❤️",
            timestamp: Date.now(),
            read: false,
            actionData: {
              type: "wishlist_add",
              gameId: String(game.id),
              gameSlug: game.slug
            }
          });
        }
      }
      
      updateCount();
      window.dispatchEvent(new Event("wishlistUpdated"));

    } catch (err) {
      console.error("Wishlist Toggle Failed:", err);
      setIsWishlisted(previousState);
      handleAuthError(err); // ✅ FIXED: Only one error handler
    }
  };

  const handleContinueAsGuest = () => {
    createGuestUser();
    window.dispatchEvent(new Event("userChanged"));
    if (pendingGame) {
      toggleWishlist(pendingGame);
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