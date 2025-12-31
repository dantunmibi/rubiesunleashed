/**
 * ================================================================
 * AUTH HOOK - Authentication State Management
 * ================================================================
 * 
 * Purpose:
 * - Manages user authentication state
 * - Detects real users vs guest users
 * - Provides login/signup/guest actions
 * 
 * Features:
 * - Differentiates between real auth and temp users
 * - Backend-ready structure
 * - Auto-detects user type on mount
 * 
 * Migration Path:
 * - Replace getTempUser() with API call to /api/auth/me
 * - Replace tempUser.id check with realUser.authProvider check
 * ================================================================
 */

"use client";

import { useState, useEffect } from "react";
import { getTempUser, getCurrentUser } from "@/lib/userManager";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isRealUser, setIsRealUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // 🔮 FUTURE: Replace with API call
      // const res = await fetch('/api/auth/me');
      // if (res.ok) {
      //   const realUser = await res.json();
      //   setUser(realUser);
      //   setIsRealUser(true);
      //   setIsGuest(false);
      //   return;
      // }

      // For now: Check temp user
      const tempUser = getCurrentUser();
      
      if (tempUser) {
        // Detect if this is a guest (temp user) or real user
        // Real users will have authProvider field in future
        const isGuestUser = tempUser.id?.startsWith('temp_');
        
        setUser(tempUser);
        setIsGuest(isGuestUser);
        setIsRealUser(!isGuestUser);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    // This will trigger getTempUser() which auto-creates guest
    const guestUser = getTempUser();
    setUser(guestUser.currentUser);
    setIsGuest(true);
    setIsRealUser(false);
  };

  const logout = () => {
    // 🔮 FUTURE: Call API logout endpoint
    // await fetch('/api/auth/logout', { method: 'POST' });
    
    // For now: Clear user state (keep temp user in localStorage)
    setUser(null);
    setIsGuest(false);
    setIsRealUser(false);
  };

  return {
    user,
    isGuest,
    isRealUser,
    isAuthenticated: !!user,
    loading,
    continueAsGuest,
    logout,
    refresh: checkAuthStatus
  };
}