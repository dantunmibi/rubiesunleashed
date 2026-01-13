"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToastContext } from "@/components/providers/ToastProvider";
import { addNotification } from "@/lib/notificationManager";

// Keep the cache system (it's working well)
const requestCache = new Map();
const CACHE_TTL = 30000;

const cachedQuery = async (key, queryFn) => {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('💾 Cache hit for:', key);
    return cached.data;
  }
  
  console.log('🌐 Cache miss for:', key);
  const data = await queryFn();
  requestCache.set(key, { data, timestamp: Date.now() });
  
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
    
    try {
      if (user) {
        const { data, error } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', user.id)
          .eq('game_id', String(gameId))
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Wishlist status check error:', error);
        }
        
        const newStatus = !!data;
        setIsWishlisted(newStatus);
        
        // Update cache with fresh data
        requestCache.set(`wishlist-${user.id}-${gameId}`, {
          data: data,
          timestamp: Date.now()
        });
        
      } else {
        // ✅ SIMPLIFIED: Guests always show false
        setIsWishlisted(false);
      }
    } catch (error) {
      console.error('checkStatus error:', error);
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
      // ✅ SIMPLIFIED: Guests always show 0
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    const handleSync = () => {
      checkStatus();
      updateCount();
    };
    window.addEventListener("wishlistUpdated", handleSync);
    return () => window.removeEventListener("wishlistUpdated", handleSync);
  }, [gameId, user]);

  // Initial Sync
  useEffect(() => {
    checkStatus();
    updateCount();
  }, [gameId, user?.id]);

  // Realtime subscriptions (only for authenticated users)
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

    // ✅ SIMPLIFIED: Require authentication
    if (!user) {
      showToast("Sign up to save items to your wishlist", "info");
      // Optionally trigger auth modal here
      return;
    }

    const previousState = isWishlisted;
    
    // Optimistic update
    setIsWishlisted(!previousState);

    try {
      if (previousState) {
        // REMOVING from wishlist
        await callApi('remove', game);
        
        // Clear cache entries
        requestCache.delete(`wishlist-${user.id}-${game.id}`);
        requestCache.delete(`wishlist-count-${user.id}`);
        requestCache.delete(`wishlist-full-${user.id}`);
        
        showToast("Removed from wishlist", "info");
        addNotification({
          message: `${game.title} has been removed from your collection.`,
          icon: "❤️",
          timestamp: Date.now(),
          read: false,
          actionData: {
            type: "wishlist_remove",
            gameId: String(game.id),
            gameSlug: game.slug
          }
        });
      } else {
        // ADDING to wishlist
        await callApi('add', game);
        
        // Clear cache entries
        requestCache.delete(`wishlist-${user.id}-${game.id}`);
        requestCache.delete(`wishlist-count-${user.id}`);
        requestCache.delete(`wishlist-full-${user.id}`);
        
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
      }
      
      // Force immediate state update
      setTimeout(async () => {
        await checkStatus();
        await updateCount();
      }, 100);
      
      // Notify other components
      window.dispatchEvent(new Event("wishlistUpdated"));

    } catch (err) {
      console.error("Wishlist Toggle Failed:", err);
      
      // Revert optimistic update on error
      setIsWishlisted(previousState);
      
      // Clear potentially stale cache
      if (user) {
        requestCache.delete(`wishlist-${user.id}-${game.id}`);
        requestCache.delete(`wishlist-count-${user.id}`);
        requestCache.delete(`wishlist-full-${user.id}`);
      }
      
      showToast("Failed to update wishlist", "error");
      handleAuthError(err);
    }
  };

  return {
    isWishlisted,
    wishlistCount,
    toggleWishlist
  };
}