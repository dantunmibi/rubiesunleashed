import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client — server only, never exposed to browser
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const THRESHOLDS = {
  good: 700,
  degraded: 1500,
};

function getStatus(responseTime) {
  if (responseTime <= THRESHOLDS.good) return 'operational';
  if (responseTime <= THRESHOLDS.degraded) return 'degraded';
  return 'outage';
}

// ─── Individual Checks ────────────────────────────────────────────────────────

async function checkDatabase() {
  const start = Date.now();
  try {
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    const responseTime = Date.now() - start;
    if (error) throw error;
    return { status: getStatus(responseTime), responseTime, healthy: true };
  } catch (error) {
    return {
      status: 'outage',
      responseTime: Date.now() - start,
      healthy: false,
      error: error.message,
    };
  }
}

async function checkAuth() {
  const start = Date.now();
  try {
    // Ping the Supabase auth REST endpoint directly — lightweight, no session needed
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        cache: 'no-store',
      }
    );
    const responseTime = Date.now() - start;
    if (!res.ok) throw new Error(`Auth health: HTTP ${res.status}`);
    return { status: getStatus(responseTime), responseTime, healthy: true };
  } catch (error) {
    return {
      status: 'outage',
      responseTime: Date.now() - start,
      healthy: false,
      error: error.message,
    };
  }
}

async function checkProjectsAPI() {
  const start = Date.now();
  try {
    // Direct DB query — no self-referential HTTP call
    const { error } = await supabase
      .from('projects')
      .select('id')
      .eq('status', 'published')
      .limit(1);
    const responseTime = Date.now() - start;
    if (error) throw error;
    return { status: getStatus(responseTime), responseTime, healthy: true };
  } catch (error) {
    return {
      status: 'outage',
      responseTime: Date.now() - start,
      healthy: false,
      error: error.message,
    };
  }
}

async function checkWishlistAPI() {
  const start = Date.now();
  try {
    const { error } = await supabase
      .from('wishlists')
      .select('id')
      .limit(1);
    const responseTime = Date.now() - start;
    if (error) throw error;
    return { status: getStatus(responseTime), responseTime, healthy: true };
  } catch (error) {
    return {
      status: 'outage',
      responseTime: Date.now() - start,
      healthy: false,
      error: error.message,
    };
  }
}

async function checkContentAPI() {
  const start = Date.now();
  try {
    // Content delivery = Supabase community projects (live source)
    // Blogger is deprecated — snapshot backup handles legacy content
    // Checking a dead Blogger URL would always show "Outage" — misleading
    const { error, count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');

    const responseTime = Date.now() - start;
    if (error) throw error;

    return {
      status: getStatus(responseTime),
      responseTime,
      healthy: true,
      // Useful context — how many live projects are queryable
      meta: { publishedProjects: count ?? 0 },
    };
  } catch (error) {
    return {
      status: 'outage',
      responseTime: Date.now() - start,
      healthy: false,
      error: error.message,
    };
  }
}

async function checkCDN() {
  const start = Date.now();
  try {
    // Ping Netlify's own CDN health — external, not self-referential
    const res = await fetch('https://www.netlifystatus.com/api/v2/status.json', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const responseTime = Date.now() - start;
    if (!res.ok) throw new Error(`CDN: HTTP ${res.status}`);

    const data = await res.json();
    // Netlify status page: indicator is 'none' when all good
    const netlifyOk = data?.status?.indicator === 'none';

    return {
      status: netlifyOk ? getStatus(responseTime) : 'degraded',
      responseTime,
      healthy: netlifyOk,
    };
  } catch (error) {
    return {
      status: 'outage',
      responseTime: Date.now() - start,
      healthy: false,
      error: error.message,
    };
  }
}

async function checkForms() {
  const start = Date.now();
  try {
    // Netlify Forms lives on the same CDN — if CDN is up, forms are up
    // We check the Netlify API directly for form submission health
    const res = await fetch('https://www.netlifystatus.com/api/v2/status.json', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const responseTime = Date.now() - start;
    if (!res.ok) throw new Error(`Forms check: HTTP ${res.status}`);

    const data = await res.json();
    const netlifyOk = data?.status?.indicator === 'none';

    return {
      status: netlifyOk ? getStatus(responseTime) : 'degraded',
      responseTime,
      healthy: netlifyOk,
    };
  } catch (error) {
    return {
      status: 'outage',
      responseTime: Date.now() - start,
      healthy: false,
      error: error.message,
    };
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const startTime = Date.now();

  try {
    // All checks run in parallel — server-side, never browser-side
    const [
      database,
      auth,
      projects_api,
      wishlist_api,
      content_api,
      cdn,
      forms,
    ] = await Promise.all([
      checkDatabase(),
      checkAuth(),
      checkProjectsAPI(),
      checkWishlistAPI(),
      checkContentAPI(),
      checkCDN(),
      checkForms(),
    ]);

    const services = {
      database,
      auth,
      projects_api,
      wishlist_api,
      content_api,
      cdn,
      forms,
    };

    // Overall: worst critical-path service wins
    const statuses = Object.values(services).map(s => s.status);
    let overall = 'operational';
    if (statuses.includes('outage')) overall = 'outage';
    else if (statuses.includes('degraded')) overall = 'degraded';

    return NextResponse.json({
      overall,
      services,
      checkedAt: Date.now(),
      responseTime: Date.now() - startTime,
    });

  } catch (error) {
    console.error('❌ Status check failed:', error);
    return NextResponse.json(
      {
        overall: 'outage',
        error: error.message,
        checkedAt: Date.now(),
        services: {},
      },
      { status: 500 }
    );
  }
}