'use client';

import { useEffect } from 'react';
import { useAuth } from "@/components/providers/AuthProvider";

export default function InternalTrafficGuard() {
  const { isAdmin } = useAuth(); // If you are logged in as Admin, filter you out!

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      if (process.env.NODE_ENV !== 'production' || isAdmin) {
         window.gtag('set', { traffic_type: 'internal' });
      }
    }
  }, [isAdmin]);

  return null;
}