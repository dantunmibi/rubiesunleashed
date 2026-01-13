'use client';

import { useEffect } from 'react';
import { useAuth } from "@/components/providers/AuthProvider";

export default function InternalTrafficGuard() {
  const { isAdmin, initialized } = useAuth();

  useEffect(() => {
    // Block ALL tracking in development
    if (process.env.NODE_ENV !== 'production') {
      if (typeof window !== 'undefined') {
        window['ga-disable-G-DWTBY4B7M6'] = true;
      }
      return;
    }

    // Block tracking for admin users in production
    if (initialized && isAdmin) {
      if (typeof window !== 'undefined') {
        window['ga-disable-G-DWTBY4B7M6'] = true;
        console.log('🚫 Analytics disabled: Admin user detected');
        
        // ✅ OPTIONAL: Clear existing GA cookies/storage
        document.cookie.split(";").forEach((c) => {
          if (c.trim().startsWith('_ga')) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          }
        });
        
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('_ga')) {
            localStorage.removeItem(key);
          }
        });
        
        console.log('🧹 Cleared all GA tracking data');
      }
    }
  }, [isAdmin, initialized]); // ✅ Only watch these two

  return null;
}