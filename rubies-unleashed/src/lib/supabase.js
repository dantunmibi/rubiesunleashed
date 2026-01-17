/**
 * 💎 RUBIES UNLEASHED - Supabase Client (Cookie-Based)
 * -------------------------------------
 * Singleton client for Auth & Database interactions.
 * Now uses @supabase/ssr for proper cookie handling.
 */

'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 1. Validation Logic
if (!supabaseUrl || !supabasePublishableKey) {
  const errorMsg = '🚨 CRITICAL: Supabase environment variables are missing.';
  
  // Fail fast in Development
  if (process.env.NODE_ENV === 'development') {
    throw new Error(errorMsg);
  }
  
  // Log in Production
  if (typeof window !== 'undefined') {
    console.error(errorMsg);
  }
}

// 2. Initialize with Cookie Support
export const supabase = createBrowserClient(
  supabaseUrl || '', 
  supabasePublishableKey || ''
);