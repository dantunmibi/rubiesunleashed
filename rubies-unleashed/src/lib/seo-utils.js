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
  
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": isApplication ? "SoftwareApplication" : "VideoGame",
    "name": game.title,
    "description": game.metaDescription || game.description?.substring(0, 160) || "Download from Rubies Unleashed.",
    "image": game.image || DEFAULT_IMAGE,
    "url": canonicalUrl,
    "datePublished": game.date, 
    "author": {
      "@type": "Person",
      "name": game.developer || "Unknown Developer"
    },
    "applicationCategory": isApplication ? "UtilitiesApplication" : "Game",
    "operatingSystem": platformInfo.name === "Platform TBA" ? "Windows" : platformInfo.name,
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  if (game.rating) {
    baseSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": game.rating,
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "10" 
    };
  }

  if (!isApplication) {
    baseSchema.genre = game.genre || "Action";
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
  const richDescription = `${hook} (${context}) - Download on Rubies Unleashed.`;

  // ✅ Ensure Image is Absolute
  const imageUrl = game.image?.startsWith('http') ? game.image : DEFAULT_IMAGE;

  return {
    // ✅ Base Metadata (Resolves relative links)
    metadataBase: new URL('https://rubiesunleashed.netlify.app'),

    // ✅ TITLE KEPT EXACTLY AS REQUESTED
    title: `${game.title} - Rubies Unleashed`,
    description: richDescription,
    
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