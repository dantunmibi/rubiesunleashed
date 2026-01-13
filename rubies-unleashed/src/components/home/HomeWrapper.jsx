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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-ruby/50 animate-spin" />
      </div>
    );
  }

  // Once initialized, make the binary choice
  if (user) {
    // ✅ PASS THE UNIFIED GAMES DATA HERE
    return <UserDashboard initialGames={games} />;
  }

  // ✅ Pass games to Landing Page too
  return <LandingPage games={games} />;
}