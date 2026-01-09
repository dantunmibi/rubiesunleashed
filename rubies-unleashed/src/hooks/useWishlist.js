"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase"; // Kept for reading/realtime
import { 
  addToWishlist as localAdd, 
  removeFromWishlist as localRemove, 
  isInWishlist as localCheck,
  getWishlist as localGet,
  createGuestUser
} from "@/lib/userManager";
import { useToastContext } from "@/components/providers/ToastProvider";
import { addNotification } from "@/lib/notificationManager";

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
      // Trigger the global overlay
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
  

  // 3. Listen for External Updates (Undo)
  useEffect(() => {
    const handleSync = () => {
        checkStatus(); // Re-fetch from DB to see the Undo change
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

  // Realtime Sync (Reads are fine on client usually)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('wishlist-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlists', filter: `user_id=eq.${user.id}` }, 
      () => { checkStatus(); updateCount(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, gameId]);

  const checkStatus = async () => {
    if (!gameId) return;
    if (user) {
      const { data } = await supabase.from('wishlists').select('id').eq('user_id', user.id).eq('game_id', String(gameId)).single();
      setIsWishlisted(!!data);
    } else {
      setIsWishlisted(localCheck(gameId));
    }
  };

  const updateCount = async () => {
    if (user) {
      const { count } = await supabase.from('wishlists').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      setWishlistCount(count || 0);
    } else {
      setWishlistCount(localGet().length);
    }
  };

  // ✅ THE API PROXY CALL
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

    // ✅ Optimistic UI
    const previousState = isWishlisted;
    setIsWishlisted(!previousState);

    try {
        if (previousState) {
            // Remove
            if (user) {
                await callApi('remove', game);
                showToast("Removed from wishlist", "info");
                // ✅ AND HERE (Local)
                addNotification({
                    message: `${game.title} has been removed from your collection.`,
                    icon: "❤️",
                    timestamp: Date.now(),
                    read: false,
                    actionData: {
                        type: "wishlist_add",
                        gameId: String(game.id),
                        gameSlug: game.slug // ✅ Required for View button
                    }
                });
            } else {
                localRemove(game.id);
                showToast("Removed locally", "info");
            }
        } else {
            // Add
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
                        gameSlug: game.slug // ✅ Required for View button
                    }
                });
            } else {
                localAdd(game);
                showToast("Saved locally", "wishlist");
                // ✅ AND HERE (Local)
      addNotification({
                    message: `${game.title} saved to wishlist`,
                    icon: "❤️",
                    timestamp: Date.now(),
                    read: false,
                    actionData: {
                        type: "wishlist_add",
                        gameId: String(game.id),
                        gameSlug: game.slug // ✅ Required for View button
                    }
                });
            }
        }
        
        updateCount();
        window.dispatchEvent(new Event("wishlistUpdated"));

    } catch (err) {
        console.error("Wishlist Toggle Failed:", err);
        setIsWishlisted(previousState); // Revert
        // 👇 THIS LINE IS STILL HERE?
        showToast("Action failed. Try refreshing.", "error"); 
        
        // Change it to:
        handleAuthError(err);
    }
  };

  const handleContinueAsGuest = () => {
    createGuestUser();
    window.dispatchEvent(new Event("userChanged"));
    if (pendingGame) {
      toggleWishlist(pendingGame); // Retry
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