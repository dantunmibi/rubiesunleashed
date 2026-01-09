'use client';

import { useEffect } from 'react';
import { useAuth } from "@/components/providers/AuthProvider";

export default function InternalTrafficGuard() {
  const { isAdmin, initialized } = useAuth();

  useEffect(() => {
    // Block ALL tracking in development
    if (process.env.NODE_ENV !== 'production') {
      if (typeof window !== 'undefined') {
        // Disable GA entirely in dev
        window['ga-disable-G-DWTBY4B7M6'] = true;
      }
      return;
    }

    // Block tracking for admin users in production
    if (initialized && isAdmin) {
      if (typeof window !== 'undefined') {
        window['ga-disable-G-DWTBY4B7M6'] = true;
        console.log('🚫 Analytics disabled: Admin user detected');
      }
    }
  }, [isAdmin, initialized]);

  return null;
}