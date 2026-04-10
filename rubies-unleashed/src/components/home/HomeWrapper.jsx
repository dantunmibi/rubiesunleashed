'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import UserDashboard from './UserDashboard';
import { Skeleton } from '@/components/ui/Skeleton';

// ----------------------------------------------------------------
// AUTH TRANSITION SKELETON
// Shown during auth resolution window.
// Mirrors UserDashboard structure to prevent content flash.
// ----------------------------------------------------------------
function AuthTransitionSkeleton() {
  return (
    <div className="min-h-screen bg-background text-white font-sans">

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
            <Skeleton key={`s1-${i}`} className="aspect-3/4 rounded-xl bg-surface border border-white/5" />
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
            <Skeleton key={`s2-${i}`} className="aspect-3/4 rounded-xl bg-surface border border-white/5" />
          ))}
        </div>
      </div>

    </div>
  );
}

// ----------------------------------------------------------------
// HOME WRAPPER
//
// SEO Strategy:
//   - `serverLanding` is pre-rendered HTML from the server (page.js)
//   - Crawlers receive full LandingPage content immediately
//   - Auth resolves client-side after hydration
//   - Authenticated users see skeleton → dashboard swap
//   - Guests see the server-rendered landing with no JS dependency
// ----------------------------------------------------------------
export default function HomeWrapper({ games, serverLanding }) {
  const { user, loading, initialized } = useAuth();

  // Auth still resolving —
  // Show skeleton to hide the swap from authenticated users.
  // Guests with JS disabled already have serverLanding visible.
  if (loading || !initialized) {
    return <AuthTransitionSkeleton />;
  }

  // Authenticated — swap to personalized dashboard
  if (user) {
    return <UserDashboard initialGames={games} />;
  }

  // Guest — render the server-provided landing page
  // (same HTML the crawler already indexed)
  return serverLanding;
}