"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

// ----------------------
// Shared in-memory cache
// ----------------------
const requestCache = new Map();
const CACHE_TTL = 30000;

// ----------------------
// Preload wishlist/cache utility (authenticated users only)
// ----------------------
const preloadUserData = async (userId) => {
  try {
    console.log("🔄 Preloading cache for user:", userId);

    const { data: wishlistData } = await supabase
      .from("wishlists")
      .select("game_id, added_at")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (!wishlistData) return;

    // Update in-memory cache
    requestCache.set(`wishlist-full-${userId}`, { data: wishlistData, timestamp: Date.now() });
    requestCache.set(`wishlist-count-${userId}`, { data: wishlistData.length, timestamp: Date.now() });
    wishlistData.slice(0, 10).forEach((item) => {
      requestCache.set(`wishlist-${userId}-${item.game_id}`, { data: { id: "cached" }, timestamp: Date.now() });
    });

    // Persist minimal wishlist in localStorage for cross-tab sync
    localStorage.setItem(`ruby_wishlist_${userId}`, JSON.stringify({
      full: wishlistData,
      timestamp: Date.now()
    }));

    console.log("✅ Preloaded wishlist cache:", wishlistData.length, "items");
  } catch (err) {
    console.error("❌ Cache preload failed:", err);
  }
};

// ----------------------
// AuthProvider
// ----------------------
export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const authTokenRef = useRef(null);
  const tokenExpiryRef = useRef(null);
  const preloadOnceRef = useRef(false);

  // ----------------------
  // TOKEN MANAGEMENT
  // ----------------------
  const getValidToken = useCallback(async () => {
    const token = authTokenRef.current;
    const expiry = tokenExpiryRef.current;

    if (token && expiry && Date.now() < expiry - 300000) return token;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.access_token) {
        authTokenRef.current = session.access_token;
        tokenExpiryRef.current = Date.now() + 3600000; // 1h cache
        return session.access_token;
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
      authTokenRef.current = null;
      tokenExpiryRef.current = null;
    }
    return null;
  }, []);

  useEffect(() => {
    const updateToken = async () => {
      if (user) await getValidToken();
      else {
        authTokenRef.current = null;
        tokenExpiryRef.current = null;
      }
    };
    updateToken();
  }, [user, getValidToken]);

  // ----------------------
  // PROFILE FETCHING
  // ----------------------
  const fetchProfile = useCallback(
    async (userId) => {
      if (!userId) return;

      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
          return;
        }

        setProfile(data);
        localStorage.setItem("ruby_profile", JSON.stringify(data));

        // Preload wishlist/cache once per session
        if (!preloadOnceRef.current) {
          preloadOnceRef.current = true;
          await preloadUserData(userId);
        }

        // Archetype redirect
        const publicRoutes = ["/login", "/signup", "/initialize"];
        if (!data.archetype && !publicRoutes.includes(pathname)) {
          router.push("/initialize");
        }
      } catch (err) {
        console.error("Profile fetch exception:", err);
      } finally {
        setProfileLoading(false);
      }
    },
    [pathname, router]
  );

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  // ----------------------
  // CLEAR AUTH STATE
  // ----------------------
  const clearAuthState = useCallback(() => {
    setUser(null);
    setProfile(null);

    if (user?.id) {
      for (const key of requestCache.keys()) {
        if (key.includes(user.id)) requestCache.delete(key);
      }
      console.log("🧹 Cleared user cache on logout");
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("ruby_profile");
      // ✅ CLEAN UP: Remove any remaining guest data
      localStorage.removeItem("ruby_user_data");
      localStorage.removeItem("ruby_wishlist");
    }
  }, [user?.id]);

  // ----------------------
  // SIGN OUT
  // ----------------------
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      clearAuthState();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("userChanged"));
        router.push("/"); // SPA navigation
      }
    }
  }, [clearAuthState, router]);

  // ----------------------
  // INITIAL SESSION
  // ----------------------
  useEffect(() => {
    let active = true;

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!active) return;

        if (error || !session?.user) {
          if (error) console.error("Session error:", error);
          clearAuthState();
          setLoading(false);
          setInitialized(true);
          return;
        }

        setUser(session.user);
        await fetchProfile(session.user.id);
        setLoading(false);
        setInitialized(true);
      } catch (err) {
        if (!active) return;
        console.error("Init session error:", err);
        clearAuthState();
        setLoading(false);
        setInitialized(true);
      }
    };

    initSession();
    return () => {
      active = false;
    };
  }, [clearAuthState, fetchProfile]);

  // ----------------------
  // AUTH STATE CHANGE (single subscription)
  // ----------------------
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);

      if (event === "TOKEN_REFRESHED") return;

      if (event === "SIGNED_OUT" || !session) {
        clearAuthState();
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);

        const shouldFetchProfile = !profile || profile?.id !== session.user.id;
        if (shouldFetchProfile) await fetchProfile(session.user.id);
      } else {
        clearAuthState();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, profile, clearAuthState]);

  // ----------------------
  // TAB SYNC (authenticated users only)
  // ----------------------
  useEffect(() => {
    if (typeof window === "undefined" || !user?.id) return;

    const handleStorageChange = (e) => {
      // Profile sync
      if (e.key === "ruby_profile") {
        if (e.newValue) {
          try {
            setProfile(JSON.parse(e.newValue));
          } catch (err) {
            console.error("Failed to sync profile across tabs:", err);
          }
        } else setProfile(null);
      }

      // Wishlist sync (authenticated users only)
      if (e.key === `ruby_wishlist_${user.id}`) {
        if (e.newValue) {
          try {
            const cachedWishlist = JSON.parse(e.newValue);
            requestCache.set(`wishlist-full-${user.id}`, {
              data: cachedWishlist.full,
              timestamp: cachedWishlist.timestamp
            });
            requestCache.set(`wishlist-count-${user.id}`, {
              data: cachedWishlist.full.length,
              timestamp: cachedWishlist.timestamp
            });
            cachedWishlist.full.slice(0, 10).forEach((item) => {
              requestCache.set(`wishlist-${user.id}-${item.game_id}`, {
                data: { id: "cached" },
                timestamp: cachedWishlist.timestamp
              });
            });
            console.log("🔄 Wishlist cache synced from another tab");
          } catch (err) {
            console.error("Failed to sync wishlist cache across tabs:", err);
          }
        } else {
          for (const key of requestCache.keys()) {
            if (key.includes(user.id)) requestCache.delete(key);
          }
          console.log("🧹 Wishlist cache cleared from another tab");
        }
      }
    };

    const handleUserChanged = () => {
      // ✅ SIMPLIFIED: Only clear auth state if no user
      if (!user) clearAuthState();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userChanged", handleUserChanged);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userChanged", handleUserChanged);
    };
  }, [user, clearAuthState]);

  // ----------------------
  // LOAD CACHED PROFILE ON MOUNT
  // ----------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cached = localStorage.getItem("ruby_profile");
    if (cached) {
      try {
        setProfile(JSON.parse(cached));
      } catch {
        localStorage.removeItem("ruby_profile");
      }
    }
  }, []);

  // ----------------------
  // UTILITY TO UPDATE WISHLIST (authenticated users only)
  // ----------------------
  const updateWishlistCache = (newWishlist) => {
    if (!user?.id) return;

    requestCache.set(`wishlist-full-${user.id}`, { data: newWishlist, timestamp: Date.now() });
    requestCache.set(`wishlist-count-${user.id}`, { data: newWishlist.length, timestamp: Date.now() });
    newWishlist.slice(0, 10).forEach((item) => {
      requestCache.set(`wishlist-${user.id}-${item.game_id}`, { data: { id: "cached" }, timestamp: Date.now() });
    });

    localStorage.setItem(`ruby_wishlist_${user.id}`, JSON.stringify({
      full: newWishlist,
      timestamp: Date.now()
    }));

    window.dispatchEvent(new Event("userChanged"));
  };

  // ----------------------
  // CONTEXT VALUE
  // ----------------------
  const value = {
    user,
    profile,
    loading: loading || !initialized,
    profileLoading,
    initialized,
    archetype: profile?.archetype || "guest",
    role: profile?.role || "user",
    isArchitect: profile?.role === "architect" || profile?.role === "admin",
    isAdmin: profile?.role === "admin",
    isAuthenticated: !!user,
    hasProfile: !!profile,
    getDeveloperName: useCallback(() => profile?.developer_name || profile?.display_name || profile?.username || "Unknown Developer", [profile]),
    needsDeveloperName: useCallback(() => profile && !profile?.developer_name, [profile]),
    developerName: profile?.developer_name || profile?.display_name || profile?.username || null,
    needsDevNameSetup: profile && !profile?.developer_name,
    refreshProfile,
    signOut,
    preloadUserData: () => user?.id ? preloadUserData(user.id) : null,
    updateWishlistCache,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}