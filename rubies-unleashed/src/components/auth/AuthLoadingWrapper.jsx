"use client";

import { useAuth } from '@/components/providers/AuthProvider'; 
import { Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Themed Skeleton (Dark Mode) - Keeping Loader2 as requested
function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 fixed inset-0 z-50">
      <Loader2 className="w-12 h-12 text-ruby animate-spin" />
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
        Authenticating...
      </p>
    </div>
  );
}

// Wrapper for protected routes
export function AuthLoadingWrapper({ 
  children, 
  requireAuth = false,
  requireProfile = false,
  fallback = <AuthSkeleton />
}) {
  const { loading, user, profile, initialized } = useAuth();
  const router = useRouter();

  // Redirect logic inside Effect to avoid SSR mismatch
  useEffect(() => {
    // Only attempt redirect if initialization is COMPLETE
    if (initialized && !loading) {
        if (requireAuth && !user) {
            router.push('/login');
        }
    }
  }, [loading, initialized, requireAuth, user, router]);

  // Show loading during initialization
  // We check initialized to ensure we don't flash content before checking session
  if (loading || !initialized) {
    return fallback;
  }

  // Redirecting... (Wait for the effect to push)
  if (requireAuth && !user) {
    return fallback; 
  }

  // Profile Loading (Strict Mode)
  if (requireProfile && user && !profile) {
    return fallback;
  }

  return children;
}

// Hook for conditional rendering based on auth state
export function useAuthUI() {
  const auth = useAuth();
  
  return {
    ...auth,
    // Helper to show content only when fully loaded AND initialized
    showContent: !auth.loading && auth.initialized,
    // Helper to show profile-dependent content
    showProfileContent: !auth.loading && auth.initialized && !!auth.profile,
  };
}