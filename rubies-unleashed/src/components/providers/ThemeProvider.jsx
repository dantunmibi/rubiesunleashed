"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ThemeProvider({ children }) {
  const { profile } = useAuth(); // Get direct profile object

  useEffect(() => {
    // ⚔️ DYNAMIC THEME INJECTION
    // Reads archetype from profile and sets data-theme attribute
    
    const theme = profile?.archetype;

    if (theme && theme !== 'guest') {
      document.documentElement.setAttribute('data-theme', theme);
      console.log('🎨 Theme set to:', theme);
    } else {
      document.documentElement.removeAttribute('data-theme'); // Fallback to Ruby
    }
    
  }, [profile]);

  return <>{children}</>;
}