import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * 🔒 Server-Side Supabase Client (Factory)
 * MUST be used in Server Components (page.js, layout.js) and API Routes.
 * Creates a fresh instance per request with access to cookies.
 */
export const createServerClient = async () => {
  const cookieStore = await cookies();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false, // Server doesn't persist state
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          cookie: cookieStore.toString(), // Pass auth cookies to Supabase
        },
      },
    }
  );
};

/**
 * 🛡️ Admin/Service Client
 * Bypasses RLS. Use ONLY in specific API routes (e.g. Webhooks, Cron).
 */
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
};