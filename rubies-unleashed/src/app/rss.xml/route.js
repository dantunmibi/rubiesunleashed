/**
 * 💎 RUBIES UNLEASHED - RSS Feed
 * Route: /rss.xml
 * Unified feed (Blogger + Supabase) — Latest 100 items
 * Revalidates every hour
 */

import { getUnifiedFeed } from '@/lib/game-service';

export const revalidate = 3600;

export async function GET() {
  try {
    const items = await getUnifiedFeed({ limit: 100 });

    const escapeXml = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const formatRfc822 = (dateString) => {
      if (!dateString) return new Date().toUTCString();
      try {
        return new Date(dateString).toUTCString();
      } catch {
        return new Date().toUTCString();
      }
    };

    const itemsXml = items.map((item) => {
      const title = escapeXml(item.title || 'Untitled');
      const description = escapeXml(item.description || '');
      const link = `https://rubiesunleashed.app/view/${item.slug}`;
      const pubDate = formatRfc822(item.publishedDate);
      const developer = escapeXml(item.developer || 'Unknown');
      const type = escapeXml(item.type || 'Game');
      const tags = Array.isArray(item.tags) ? item.tags.map(escapeXml).join(', ') : '';
      const image = item.image || item.cover_url || '';

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${developer}</author>
      <category>${type}</category>
      ${tags ? `<tags>${tags}</tags>` : ''}
      ${image ? `<enclosure url="${escapeXml(image)}" type="image/jpeg" length="0" />` : ''}
      <source url="https://rubiesunleashed.app/rss.xml">Rubies Unleashed</source>
    </item>`.trim();
    }).join('\n    ');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Rubies Unleashed</title>
    <link>https://rubiesunleashed.app</link>
    <description>Where New Ideas Rise — Latest games, apps and tools from indie creators</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>https://rubiesunleashed.app/rubieslogo.png</url>
      <title>Rubies Unleashed</title>
      <link>https://rubiesunleashed.app</link>
    </image>
    <atom:link href="https://rubiesunleashed.app/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

    return new Response(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('❌ RSS Feed Error:', error);

    // Return minimal valid RSS on error
    const errorRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Rubies Unleashed</title>
    <link>https://rubiesunleashed.app</link>
    <description>Where New Ideas Rise</description>
  </channel>
</rss>`;

    return new Response(errorRss, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}