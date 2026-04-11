"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import UserDashboard from "./UserDashboard";
import { Skeleton } from "@/components/ui/Skeleton";

const SESSION_CACHE_KEY = "ruby_session_state";

// ----------------------------------------------------------------
// AUTH TRANSITION SKELETON
// Shown during auth resolution window ONLY for likely-authenticated users.
// Fixed overlay — covers LandingPage underneath during dashboard load.
// ----------------------------------------------------------------
function AuthTransitionSkeleton() {
  return (
    <div className="fixed inset-0 z-50 min-h-screen bg-background text-white font-sans overflow-auto">
      {/* Navbar */}
      <div className="h-16 w-full border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-40" />

      {/* Dashboard Header */}
      <div className="pt-32 px-6 pb-4 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-80 mb-3" />
        <Skeleton className="h-3 w-44 bg-white/3" />
      </div>

      {/* SpotlightHero block */}
      <div className="px-6 max-w-7xl mx-auto mt-2">
        <Skeleton className="w-full h-72 md:h-96 rounded-2xl bg-surface border border-white/5" />
      </div>

      {/* Section 1 */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-16 bg-white/3" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={`s1-${i}`}
              className="aspect-3/4 rounded-xl bg-surface border border-white/5"
            />
          ))}
        </div>
      </div>

      {/* Section 2 */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-16 bg-white/3" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={`s2-${i}`}
              className="aspect-3/4 rounded-xl bg-surface border border-white/5"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// HOME WRAPPER
//
// Strategy:
//   - LandingPage is always server-rendered in the DOM (page.js)
//   - HomeWrapper overlays it via fixed positioning for auth states
//   - Guests: returns null — LandingPage shows through naturally
//   - Likely-authenticated during loading: skeleton overlay
//   - Authenticated: dashboard overlay
//   - No hydration mismatch — LandingPage always stays in DOM
// ----------------------------------------------------------------
export default function HomeWrapper({ games }) {
  const { user, loading, initialized } = useAuth();

  // Read session cache synchronously to decide initial render.
  // Prevents LandingPage flash for returning authenticated users.
  const [likelyAuthenticated, setLikelyAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(SESSION_CACHE_KEY);
      if (!cached) return;
      const { hasSession, timestamp } = JSON.parse(cached);
      const cacheAge = Date.now() - timestamp;
      if (hasSession === true && cacheAge < 300000) {
        setLikelyAuthenticated(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync likelyAuthenticated after auth resolves
  useEffect(() => {
    if (initialized) {
      setLikelyAuthenticated(!!user);
    }
  }, [initialized, user]);

  useEffect(() => {
    const landingRoot = document.getElementById("landing-root");
    if (!landingRoot) return;

    if (user) {
      landingRoot.style.display = "none";
    } else {
      landingRoot.style.display = "";
    }
  }, [user]);

  // Auth resolving AND likely authenticated — show skeleton overlay
  if ((loading || !initialized) && likelyAuthenticated) {
    return <AuthTransitionSkeleton />;
  }

  // Authenticated — show dashboard normally, LandingPage is hidden
  if (user) {
    return <UserDashboard initialGames={games} />;
  }

  // Guest — return null, LandingPage shows naturally
  return null;
}
