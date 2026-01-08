"use client";

import { useAuth } from '@/components/providers/AuthProvider';
import LandingPage from './LandingPage';
import UserDashboard from './UserDashboard';
import { Loader2 } from 'lucide-react';

export default function HomeWrapper() {
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
    return <UserDashboard />;
  }

  return <LandingPage />;
}