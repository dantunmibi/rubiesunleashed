"use client";

import { useAuth } from '@/components/providers/AuthProvider';
import LandingPage from './LandingPage';
import UserDashboard from './UserDashboard';
import { Skeleton } from '@/components/ui/Skeleton';

// ----------------------------------------------------------------
// AUTH TRANSITION SKELETON
// Mirrors UserDashboard structure using the same Skeleton component
// and conventions as GameSkeleton. Shown during the brief auth
// resolution window — never shows LandingPage to prevent content flash.
//
// Structure mirrors UserDashboard:
//   - Navbar (h-16, sticky, z-40)
//   - Dashboard header (pt-32 — display name + archetype label)
//   - SpotlightHero block
//   - Two section rows (header + 6-card GameGrid each)
// ----------------------------------------------------------------
function AuthTransitionSkeleton() {
  return (
    <div className="min-h-screen bg-background text-white font-sans">

      {/* Navbar */}
      <div className="h-16 w-full border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-40" />

      {/* Dashboard Header (mirrors pt-32 + h1 + archetype label) */}
      <div className="pt-32 px-6 pb-4 max-w-7xl mx-auto">
        {/* "Welcome back, Username" */}
        <Skeleton className="h-10 w-80 mb-3" />
        {/* "Archetype Protocol Active" */}
        <Skeleton className="h-3 w-44 bg-white/3" />
      </div>

      {/* SpotlightHero block */}
      <div className="px-6 max-w-7xl mx-auto mt-2">
        <Skeleton className="w-full h-72 md:h-96 rounded-2xl bg-surface border border-white/5" />
      </div>

      {/* Section 1 */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        {/* Section header row */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-16 bg-white/3" />
        </div>
        {/* 6-card grid */}
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
        {/* Section header row */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-16 bg-white/3" />
        </div>
        {/* 6-card grid */}
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
// Binary switch between Landing (guest) and Dashboard (user).
// AuthTransitionSkeleton bridges the auth resolution window.
// ----------------------------------------------------------------
export default function HomeWrapper({ games }) {
  const { user, loading, initialized } = useAuth();

  // Auth still resolving — cinematic skeleton
  // Structural mirror of UserDashboard prevents content flash
  if (loading || !initialized) {
    return <AuthTransitionSkeleton />;
  }

  // Authenticated — personalized dashboard
  if (user) {
    return <UserDashboard initialGames={games} />;
  }

  // Guest — landing page
  return <LandingPage games={games} />;
}