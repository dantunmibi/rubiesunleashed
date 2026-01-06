/**
 * 💎 RUBIES UNLEASHED - Dynamic Sitemap
 * -------------------------------------
 * Automatically generates URLs for all 57+ games/tools.
 * Updates automatically when the snapshot/feed changes.
 */

import { fetchGames } from "@/lib/blogger";

// Revalidate once per hour (sufficient for static content)
export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = 'https://rubiesunleashed.netlify.app';

  // 1. Fetch entire Vault inventory (Snapshot + Live)
  // We request a high limit (2000) to ensure complete coverage
  let games = [];
  try {
    games = await fetchGames(2000);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    // Fallback to empty array prevents build failure, 
    // though ideally the snapshot ensures this never happens.
  }

  // 2. Generate Dynamic Game URLs
  const gameUrls = games.map((game) => ({
    url: `${baseUrl}/view/${game.id}`,
    lastModified: game.date ? new Date(game.date) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8, // High priority for content
  }));

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

  // 4. Merge and Deploy
  return [...staticRoutes, ...gameUrls];
}