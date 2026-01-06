/**
 * 💎 RUBIES UNLEASHED - Dynamic Sitemap
 * -------------------------------------
 * Automatically generates URLs for all games/tools.
 * DIRECT READ MODE: Reads backup-data.json directly to avoid API build errors.
 */

// ✅ Import directly to bypass API fetch during build
import BACKUP_DATA from '@/lib/backup-data.json'; 

// Helper: Must match src/lib/blogger.js logic exactly
function createSlug(title, id) {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${cleanTitle}-${id}`;
}

// Revalidate once per hour
export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = 'https://rubiesunleashed.netlify.app';

  // 1. Get Posts Directly from Snapshot
  // This avoids the "Dynamic server usage" error because it's just reading a file import
  const rawPosts = BACKUP_DATA?.feed?.entry || [];
  
  // 2. Generate Dynamic Game URLs
  const gameUrls = rawPosts.map((post) => {
    // Extract ID
    const idRaw = post.id?.$t || post.id;
    const id = idRaw.includes('post-') ? idRaw.split('post-')[1] : idRaw;
    
    // Extract Title for Slug
    const title = post.title?.$t || post.title || 'Untitled';
    
    // Generate Slug (Matches blogger.js logic)
    const slug = createSlug(title, id);
    
    // Extract Date
    const date = post.updated?.$t || post.published?.$t || new Date().toISOString();

    return {
      url: `${baseUrl}/view/${slug}`,
      lastModified: new Date(date),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  // 3. Define Core Static Routes
  const staticRoutes = [
    '',          // Home
    '/explore',  // The Vault
    '/about',    // Manifesto
    '/publish',  // Architect Protocol
    '/status',   // Health
    '/contact',  // Comms
    '/help',     // Support
    '/terms',    // Legal
    '/privacy',  // Legal
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1.0 : 0.5,
  }));

  // 4. Merge
  return [...staticRoutes, ...gameUrls];
}