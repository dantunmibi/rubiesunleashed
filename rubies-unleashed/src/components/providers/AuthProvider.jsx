"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load cached profile on mount for instant UI
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('ruby_profile');
      if (cached) {
        try {
          setProfile(JSON.parse(cached));
        } catch (error) {
          console.error('Failed to parse cached profile:', error);
          localStorage.removeItem('ruby_profile');
        }
      }
    }
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return;
    
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return;
      }

      setProfile(data);
      localStorage.setItem('ruby_profile', JSON.stringify(data));
      
      // Handle archetype initialization redirect
      const publicRoutes = ['/login', '/signup', '/initialize'];
      if (!data.archetype && !publicRoutes.includes(pathname)) {
        router.push('/initialize');
      }
    } catch (error) {
      console.error('Profile fetch exception:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [pathname, router]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // ✅ Initialize auth session with timeout protection
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 15000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);
        
        // 1. VALID LOGOUT (No session or Auth Error)
        if (error || !session) {
          if (error) console.error('Session error:', error);
          clearAuthState();
          setLoading(false);
          setInitialized(true);
          return;
        }

        // 2. SUCCESS
        setUser(session.user);
        await fetchProfile(session.user.id);
        setLoading(false);
        setInitialized(true);

      } catch (error) {
        // 3. TIMEOUT (Network Hang)
        console.error('Init timeout:', error);
        // Do NOT clear auth. Do NOT set loading false.
        // Just show overlay.
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event("sessionExpired"));
        }
      }
    };

    initSession();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        // Handle explicit sign-out or session expiry
        if (event === 'SIGNED_OUT' || !session) {
            clearAuthState();
            setLoading(false);
            return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Fetch profile on sign in or user change
          const shouldFetchProfile = 
            event === 'SIGNED_IN' || 
            !profile || 
            profile?.id !== session.user.id;
          
          if (shouldFetchProfile) {
            await fetchProfile(session.user.id);
          }
        } else {
          clearAuthState();
        }

        if (initialized) {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [profile, initialized, fetchProfile]);

  const clearAuthState = () => {
    setUser(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ruby_profile');
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      clearAuthState();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ruby_user_data');
        localStorage.removeItem('ruby_wishlist');
        window.dispatchEvent(new Event('userChanged'));
        window.location.href = '/';
      }
    }
  };

  const value = {
    // State
    user,
    profile,
    loading: loading || !initialized, 
    profileLoading,
    initialized,
    
    // Computed values
    archetype: profile?.archetype || 'guest',
    role: profile?.role || 'user',
    isArchitect: profile?.role === 'architect' || profile?.role === 'admin',
    isAdmin: profile?.role === 'admin',
    isAuthenticated: !!user,
    hasProfile: !!profile,
    
    // Actions
    refreshProfile,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}