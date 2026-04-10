/**
 * 💎 RUBIES UNLEASHED - Dynamic Sitemap
 * Route: /sitemap.xml
 * Raw XML response — no Next.js conversion layer.
 * Eliminates binary/encoding issues with crawlers.
 * Revalidates every 6 hours.
 */

import { getSitemapData } from '@/lib/game-service';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 21600; // 6 hours

const baseUrl = 'https://rubiesunleashed.app';

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(dateString) {
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function urlEntry({ url, lastmod, changefreq, priority }) {
  return `
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`.trim();
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // ── 1. Static Routes ─────────────────────────────────────────
    const staticRoutes = [
      { url: `${baseUrl}`,          changefreq: 'daily',   priority: '1.0' },
      { url: `${baseUrl}/explore`,  changefreq: 'daily',   priority: '0.9' },
      { url: `${baseUrl}/publish`,  changefreq: 'weekly',  priority: '0.8' },
      { url: `${baseUrl}/about`,    changefreq: 'monthly', priority: '0.6' },
      { url: `${baseUrl}/status`,   changefreq: 'weekly',  priority: '0.5' },
      { url: `${baseUrl}/contact`,  changefreq: 'monthly', priority: '0.4' },
      { url: `${baseUrl}/help`,     changefreq: 'monthly', priority: '0.4' },
      { url: `${baseUrl}/terms`,    changefreq: 'yearly',  priority: '0.3' },
      { url: `${baseUrl}/privacy`,  changefreq: 'yearly',  priority: '0.3' },
      { url: `${baseUrl}/rss.xml`,  changefreq: 'hourly',  priority: '0.3' },
    ].map(r => urlEntry({ ...r, lastmod: today }));

    // ── 2. Content URLs (Supabase + Blogger) ─────────────────────
    let contentEntries = [];
    try {
      const content = await getSitemapData();
      contentEntries = content.map(item =>
        urlEntry({
          url: `${baseUrl}/view/${item.slug}`,
          lastmod: formatDate(item.updated_at || item.publishedDate),
          changefreq: 'weekly',
          priority: '0.8',
        })
      );
    } catch (err) {
      console.error('Sitemap: Content fetch failed:', err.message);
    }

    // ── 3. Public Profiles ────────────────────────────────────────
    let profileEntries = [];
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('username, updated_at, is_public_wishlist, role')
        .eq('profile_visibility', 'public')
        .not('username', 'is', null)
        .limit(1000);

      if (error) {
        console.warn('Sitemap: Profile fetch error:', error.message);
      }

      if (profiles?.length > 0) {
        profiles.forEach(profile => {
          const lastmod = formatDate(profile.updated_at);

          // Profile page
          profileEntries.push(urlEntry({
            url: `${baseUrl}/${profile.username}`,
            lastmod,
            changefreq: 'weekly',
            priority: '0.7',
          }));

          // Public wishlist
          if (profile.is_public_wishlist !== false) {
            profileEntries.push(urlEntry({
              url: `${baseUrl}/${profile.username}/wishlist`,
              lastmod,
              changefreq: 'weekly',
              priority: '0.5',
            }));
          }

          // Creator portfolio
          if (profile.role === 'architect') {
            profileEntries.push(urlEntry({
              url: `${baseUrl}/${profile.username}/projects`,
              lastmod,
              changefreq: 'weekly',
              priority: '0.7',
            }));
          }
        });

        console.log(`📊 Sitemap: ${profiles.length} profiles → ${profileEntries.length} URLs`);
      }
    } catch (err) {
      console.error('Sitemap: Profile fetch failed:', err.message);
    }

    // ── 4. Build XML ──────────────────────────────────────────────
    const allEntries = [...staticRoutes, ...contentEntries, ...profileEntries];

    console.log(`📊 Sitemap: ${allEntries.length} total URLs`);
    console.log(`   Static: ${staticRoutes.length}`);
    console.log(`   Content: ${contentEntries.length}`);
    console.log(`   Profiles: ${profileEntries.length}`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${allEntries.join('\n  ')}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=21600, stale-while-revalidate=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);

    // Minimal fallback — always returns valid XML
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new Response(fallback, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}