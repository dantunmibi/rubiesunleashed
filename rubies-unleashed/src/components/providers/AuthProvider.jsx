"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       
  
  // 1. Start clean (Matches Server)
  const [profile, setProfile] = useState(null); 

  // 2. Load Cache Immediately on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('ruby_profile');
      if (cached) setProfile(JSON.parse(cached));
    }
  }, []);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setProfile(data);
        // ✅ 2. Update Cache
        localStorage.setItem('ruby_profile', JSON.stringify(data));
        
        const publicRoutes = ['/login', '/signup', '/initialize'];
        if (!data.archetype && !publicRoutes.includes(pathname)) {
           router.push('/initialize');
        }
      }
    } catch (error) {
      console.error('Profile fetch exception:', error);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        // We might already have profile from cache, but fetch fresh anyway
        await fetchProfile(session.user.id);
      } else {
        // If no session, clear profile (e.g. expired token)
        setProfile(null);
        localStorage.removeItem('ruby_profile');
      }
      setLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // ✅ OPTIMIZED: Only fetch if needed
        // 1. If explicit Sign In event
        // 2. OR if we have no profile
        // 3. OR if the profile ID doesn't match the new session ID (user switched)
        const needsFetch = event === 'SIGNED_IN' || !profile || profile.id !== session.user.id;
        
        if (needsFetch) {
           await fetchProfile(session.user.id);
        }
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('ruby_profile');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  const value = {
    user,
    profile,
    loading,
    archetype: profile?.archetype || 'guest', 
    role: profile?.role || 'guest',
    isArchitect: profile?.role === 'architect' || profile?.role === 'admin',
    isAdmin: profile?.role === 'admin',
    isAuthenticated: !!user,
    
    signOut: async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn("Supabase Logout Warning:", error.message);
      } finally {
        setUser(null);
        setProfile(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem("ruby_user_data");
          localStorage.removeItem("ruby_wishlist");
          localStorage.removeItem("ruby_profile"); // ✅ Clear Cache
          window.dispatchEvent(new Event("userChanged"));
          window.location.href = '/'; 
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}