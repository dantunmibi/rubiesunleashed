/**
 * 💎 RUBIES UNLEASHED - Robots Protocol
 * -------------------------------------
 * Controls how search engines crawl the Vault.
 * Protects API routes while exposing content.
 * ✅ AI crawlers explicitly allowed for llms.txt discovery
 */

export default function robots() {
  return {
    rules: [
      // Default — all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/private/', '/admin/'],
      },
      // ✅ AI crawlers — explicitly welcomed
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'GoogleOther',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: 'https://rubiesunleashed.app/sitemap.xml',
    rss: 'https://rubiesunleashed.app/rss.xml',
  };
}