/**
 * 💎 RUBIES UNLEASHED - Robots Protocol
 * -------------------------------------
 * Controls how search engines crawl the Vault.
 * Protects API routes while exposing content.
 */

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/private/', '/admin/'], // Security exclusions
    },
    sitemap: 'https://rubiesunleashed.netlify.app/sitemap.xml',
  }
}