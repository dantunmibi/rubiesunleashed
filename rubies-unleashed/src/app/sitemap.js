/**
 * 💎 RUBIES UNLEASHED - Dynamic Sitemap (Phase 4 Compliant)
 * ----------------------------------------------------------
 * Automatically generates URLs for all content using Unified Feed.
 * ✅ PHASE 4: Uses getSitemapData() for optimized performance
 * ✅ PHASE 3: Includes Public Profiles & Wishlists
 * ✅ SEO: Proper priority hierarchy and change frequencies
 * ✅ FIX: No cookies usage - direct Supabase connection
 */

import { getSitemapData } from '@/lib/game-service';
import { createClient } from '@supabase/supabase-js';

// ✅ FIX: Make this route dynamic to avoid build-time issues
export const dynamic = 'force-dynamic';
export const revalidate = 21600; // Revalidate every 6 hours

export default async function sitemap() {
  const baseUrl = 'https://rubiesunleashed.netlify.app';

  try {
    // 1. Get Optimized Sitemap Data (Unified Feed - Supabase + Blogger)
    const content = await getSitemapData();

    const contentUrls = content.map((item) => ({
      url: `${baseUrl}/view/${item.slug}`,
      lastModified: new Date(item.updated_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // 2. Core Static Routes (Hierarchical Priority)
    const staticRoutes = [
      { route: '', priority: 1.0, freq: 'daily' },
      { route: '/explore', priority: 0.9, freq: 'daily' },
      { route: '/publish', priority: 0.7, freq: 'weekly' },
      { route: '/about', priority: 0.6, freq: 'monthly' },
      { route: '/status', priority: 0.5, freq: 'weekly' },
      { route: '/contact', priority: 0.4, freq: 'monthly' },
      { route: '/help', priority: 0.4, freq: 'monthly' },
      { route: '/terms', priority: 0.3, freq: 'yearly' },
      { route: '/privacy', priority: 0.3, freq: 'yearly' },
    ].map(({ route, priority, freq }) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: freq,
      priority: priority,
    }));

    // 3. Public Profiles & Social Layer (Phase 3 Feature)
    // ✅ FIX: Use direct Supabase client instead of createServerClient (which uses cookies)
    let profileUrls = [];
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('username, updated_at, is_public_wishlist')
        .eq('profile_visibility', 'public')
        .not('username', 'is', null)
        .limit(1000);

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