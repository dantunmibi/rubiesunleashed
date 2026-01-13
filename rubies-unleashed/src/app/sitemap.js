/**
 * 💎 RUBIES UNLEASHED - Dynamic Sitemap (Phase 4 Compliant)
 * ----------------------------------------------------------
 * Automatically generates URLs for all content using Unified Feed.
 * ✅ PHASE 4: Uses getSitemapData() for optimized performance
 * ✅ PHASE 3: Includes Public Profiles & Wishlists
 * ✅ SEO: Proper priority hierarchy and change frequencies
 */

import { getSitemapData } from '@/lib/game-service';
import { createServerClient } from '@/lib/supabase-server';

// Revalidate every 6 hours (more frequent for active content creation)
export const revalidate = 21600;

export default async function sitemap() {
  const baseUrl = 'https://rubiesunleashed.netlify.app';

  try {
    // 1. Get Optimized Sitemap Data (Unified Feed - Supabase + Blogger)
    // This function is specifically designed for sitemap generation (minimal data)
    const content = await getSitemapData();

    const contentUrls = content.map((item) => ({
      url: `${baseUrl}/view/${item.slug}`,
      lastModified: new Date(item.updated_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // 2. Core Static Routes (Hierarchical Priority)
    const staticRoutes = [
      { route: '', priority: 1.0, freq: 'daily' },      // Home (highest)
      { route: '/explore', priority: 0.9, freq: 'daily' }, // The Vault (discovery)
      { route: '/publish', priority: 0.7, freq: 'weekly' }, // Creator onboarding
      { route: '/about', priority: 0.6, freq: 'monthly' },  // Manifesto
      { route: '/status', priority: 0.5, freq: 'weekly' },  // Health monitoring
      { route: '/contact', priority: 0.4, freq: 'monthly' }, // Support
      { route: '/help', priority: 0.4, freq: 'monthly' },   // Documentation
      { route: '/terms', priority: 0.3, freq: 'yearly' },   // Legal (low change)
      { route: '/privacy', priority: 0.3, freq: 'yearly' }, // Legal (low change)
    ].map(({ route, priority, freq }) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: freq,
      priority: priority,
    }));

    // 3. Public Profiles & Social Layer (Phase 3 Feature)
    let profileUrls = [];
    try {
      const supabase = await createServerClient();
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('username, updated_at, is_public_wishlist')
        .eq('profile_visibility', 'public')
        .not('username', 'is', null) // Ensure username exists
        .limit(1000); // Performance safety limit

      if (error) {
        console.warn('Sitemap: Profile fetch error:', error.message);
      }

      if (profiles && profiles.length > 0) {
        profiles.forEach(profile => {
          const lastMod = new Date(profile.updated_at || new Date());
          
          // Profile Page
          profileUrls.push({
            url: `${baseUrl}/${profile.username}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.6
          });

          // Public Wishlist (if enabled)
          if (profile.is_public_wishlist !== false) {
            profileUrls.push({
              url: `${baseUrl}/${profile.username}/wishlist`,
              lastModified: lastMod,
              changeFrequency: 'weekly',
              priority: 0.5
            });
          }

          // Public Projects Portfolio
          profileUrls.push({
            url: `${baseUrl}/${profile.username}/projects`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.6
          });
        });

        console.log(`📊 Sitemap: Added ${profiles.length} profiles (${profileUrls.length} URLs)`);
      }
    } catch (profileError) {
      console.error('Sitemap: Failed to fetch profiles:', profileError);
      // Continue without profiles rather than failing entirely
    }

    // 4. Merge All Routes with Proper Sorting
    const allUrls = [...staticRoutes, ...contentUrls, ...profileUrls];
    
    // Sort by priority (highest first), then by URL for consistency
    allUrls.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.url.localeCompare(b.url);
    });

    console.log(`📊 Sitemap Generated: ${allUrls.length} total URLs`);
    console.log(`   - Static: ${staticRoutes.length}`);
    console.log(`   - Content: ${contentUrls.length}`);
    console.log(`   - Profiles: ${profileUrls.length}`);

    return allUrls;

  } catch (error) {
    console.error('❌ Sitemap Generation Failed:', error);
    
    // Fallback: Return minimal static routes to prevent complete failure
    return [
      {
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/explore`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      }
    ];
  }
}