"use client";

import { useAuth } from '@/components/providers/AuthProvider';
import LandingPage from './LandingPage';
import UserDashboard from './UserDashboard';
import { Loader2 } from 'lucide-react';

// ✅ Accept 'games' prop from Server Component (should be unified feed)
export default function HomeWrapper({ games }) {
  const { user, loading, initialized } = useAuth();

  // Prevent flicker: Wait until we know for sure if user is logged in
  if (loading || !initialized) {
    // Show landing page immediately while auth resolves in background
    return <LandingPage games={games} authLoading={true} />;
  }

  // Once initialized, make the binary choice
  if (user) {
    // ✅ PASS THE UNIFIED GAMES DATA HERE
    return <UserDashboard initialGames={games} />;
  }

  // ✅ Pass games to Landing Page too
  return <LandingPage games={games} />;
}