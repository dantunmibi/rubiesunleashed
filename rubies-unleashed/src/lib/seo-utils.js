/**
 * 💎 RUBIES UNLEASHED - SEO Utility (Social Preview Enhanced)
 * Generates JSON-LD Schema and Metadata for the ecosystem.
 * 
 * UPGRADES:
 * - Smart "Hook + CTA" Description Logic
 * - Strict Image Validation
 * - Absolute URL Resolution (metadataBase)
 */

import { isApp, getPlatformInfo } from '@/lib/game-utils';

// ✅ Fallback Image (Must be a real absolute URL)
const DEFAULT_IMAGE = 'https://rubiesunleashed.netlify.app/rubieslogo.png'; 

export function generateJsonLd(game) {
  if (!game) return null;

  const isApplication = isApp(game.tags);
  const platformInfo = getPlatformInfo(game, game.tags);
  const canonicalUrl = `https://rubiesunleashed.netlify.app/view/${game.slug}`; 
  
  // ✅ Determine operating system smartly
  const operatingSystem = game.buildPlatform && 
                          game.buildPlatform !== 'Multi-Platform' && 
                          game.buildPlatform !== 'Platform TBA'
    ? game.buildPlatform
    : game.downloadLinks?.map(link => link.platform).join(', ') || "Windows, macOS, Linux";
  
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": isApplication ? "SoftwareApplication" : "VideoGame",
    "name": game.title,
    "description": game.metaDescription || game.description?.substring(0, 160) || "Download from Rubies Unleashed.",
    "image": game.image || DEFAULT_IMAGE,
    "url": canonicalUrl,
    
    // ✅ FIXED: Use Supabase publishedDate (created_at)
    "datePublished": game.publishedDate || game.date,
    "dateModified": game.lastUpdated || game.publishedDate || game.date,
    
    // ✅ ENHANCED: Author with profile URL
    "author": {
      "@type": "Person",
      "name": game.developer,
      "url": game.developerUrl ? `https://rubiesunleashed.netlify.app${game.developerUrl}` : undefined,
      // ✅ ADD: Make author more prominent
      "description": `Independent creator on Rubies Unleashed`
    },
    
    // ✅ NEW: Publisher info
    "publisher": {
      "@type": "Organization",
      "name": "Rubies Unleashed",
      "url": "https://rubiesunleashed.netlify.app",
      "description": "Digital distribution platform for independent creators"
    },
    
    "applicationCategory": isApplication ? "UtilitiesApplication" : "Game",
    "operatingSystem": operatingSystem,
    
    // ✅ NEW: Download URL
    "downloadUrl": game.downloadUrl || game.downloadLinks?.[0]?.url,
    
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  // ✅ NEW: Social links as sameAs
  if (game.socialLinks?.length > 0) {
    baseSchema.sameAs = game.socialLinks.map(link => link.url);
  }

  // Rating (if exists)
  if (game.rating) {
    baseSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": game.rating,
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "10"
    };
  }

  // ✅ ENHANCED: App-specific fields
  if (isApplication) {
    baseSchema.softwareVersion = game.version || '1.0';
    baseSchema.applicationSubCategory = game.tags?.find(t => 
      ['Productivity', 'Development', 'Utility', 'Design', 'Tool'].includes(t)
    ) || 'Utility';
    
    // File size (if available)
    if (game.size) {
      baseSchema.fileSize = game.size;
    }
  } else {
    // Game-specific fields
    baseSchema.genre = game.tags?.find(t => 
      ['Action', 'RPG', 'Strategy', 'Puzzle', 'Horror', 'Adventure'].includes(t)
    ) || "Action";
    baseSchema.playMode = "SinglePlayer";
  }

  return baseSchema;
}

export function generateMetaTags(game) {
  if (!game) {
    return {
      title: 'Item Not Found - Rubies Unleashed',
      description: 'The requested item could not be found in the vault.',
      robots: 'noindex'
    };
  }

  const isApplication = isApp(game.tags);
  const typeLabel = isApplication ? 'Tool' : 'Game';
  
  // ✅ SMART DESCRIPTION GENERATOR
  // 1. Get raw text (game.metaDescription is already truncated by blogger.js)
  const rawDesc = (game.metaDescription || game.description || '').replace(/<[^>]*>?/gm, '');
  
  // 2. Truncate to ~110 chars for the "Hook"
  const hook = rawDesc.length > 110 
    ? rawDesc.substring(0, 110).trim() + '...' 
    : rawDesc;

  // 3. Build Context (Version + Dev)
  const context = `v${game.version || 'Latest'} by ${game.developer || 'Unknown'}`;

  // 4. Assemble: "Hook (Context) - Download on Rubies Unleashed"
  const developerAttribution = game.source === 'supabase' && game.developer
    ? ` Created by ${game.developer}.`
    : '';

  const richDescription = `${hook} (${context})${developerAttribution} Download on Rubies Unleashed.`;

  // ✅ Ensure Image is Absolute
  const imageUrl = game.image?.startsWith('http') ? game.image : DEFAULT_IMAGE;

  return {
    // ✅ Base Metadata (Resolves relative links)
    metadataBase: new URL('https://rubiesunleashed.netlify.app'),

    // ✅ TITLE KEPT EXACTLY AS REQUESTED
    title: `${game.title} - Rubies Unleashed`,
    description: richDescription,
    keywords: game.tags?.slice(0, 10).join(', '),
    
    openGraph: {
      title: `${game.title} - Rubies Unleashed`,
      description: richDescription,
      url: `/view/${game.slug}`,
      siteName: 'Rubies Unleashed',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${game.title} Cover`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${game.title} - Rubies Unleashed`,
      description: richDescription,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/view/${game.slug}`,
    }
  };
}