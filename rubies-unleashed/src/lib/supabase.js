/**
 * 💎 RUBIES UNLEASHED - Supabase Client
 * -------------------------------------
 * Singleton client for Auth & Database interactions.
 * Robust configuration with Fail-Fast validation.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 1. Validation Logic
if (!supabaseUrl || !supabasePublishableKey) {
  const errorMsg = '🚨 CRITICAL: Supabase environment variables are missing.';
  
  // Fail fast in Development to prevent debugging headaches
  if (process.env.NODE_ENV === 'development') {
    throw new Error(errorMsg);
  }
  
  // Log in Production (prevent total crash, though auth will fail)
  if (typeof window !== 'undefined') {
    console.error(errorMsg);
  }
}

// 2. Initialize with Explicit Config
// Passing empty strings prevents initialization crash if vars are missing in prod
export const supabase = createClient(
  supabaseUrl || '', 
  supabasePublishableKey || '',
  {
    auth: {
      persistSession: true, // Keep user logged in
      autoRefreshToken: true, // Handle token rotation
      detectSessionInUrl: true, // Crucial for OAuth redirects
    },
  }
);