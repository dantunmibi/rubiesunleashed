/**
 * 💎 RUBIES UNLEASHED - SEO Utility
 * Generates JSON-LD Schema and Metadata for the ecosystem.
 * 
 * Logic:
 * - Detects if item is Game or App using isApp() logic
 * - Generates strict Schema.org JSON-LD
 * - Handles fallbacks for missing data
 */

import { isApp, getPlatformInfo } from '@/lib/game-utils';

export function generateJsonLd(game) {
  if (!game) return null;

  // Use existing tag logic to determine type
  const isApplication = isApp(game.tags);
  const platformInfo = getPlatformInfo(game, game.tags);
  
  // Canonical URL for SEO authority
  const canonicalUrl = `https://rubiesunleashed.netlify.app/view/${game.id}`;
  
  // Base Schema (Shared properties)
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": isApplication ? "SoftwareApplication" : "VideoGame",
    "name": game.title,
    "description": game.description?.substring(0, 160) || "Download from Rubies Unleashed.",
    "image": game.image,
    "url": canonicalUrl,
    "datePublished": game.date, 
    "author": {
      "@type": "Person",
      "name": game.developer || "Unknown Developer"
    },
    // Distinguish between Game and App in Google's eyes
    "applicationCategory": isApplication ? "UtilitiesApplication" : "Game",
    "operatingSystem": platformInfo.name === "Platform TBA" ? "Windows" : platformInfo.name,
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  // Add Rating if it exists (Critical for rich snippets stars)
  if (game.rating) {
    baseSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": game.rating,
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "10" // Static fallback until user system tracks counts
    };
  }

  // Specific VideoGame properties
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
      description: 'The requested item could not be found in the vault.'
    };
  }

  const isApplication = isApp(game.tags);
  const typeLabel = isApplication ? 'Tool' : 'Game';
  
  // Clean description for Meta tags (strips HTML if necessary, simplified here)
  const cleanDesc = game.description?.replace(/<[^>]*>?/gm, '').substring(0, 155) || `Get ${game.title} on Rubies Unleashed.`;

  return {
    // ✅ CHANGED: Clean, Professional Title Format
    title: `${game.title} - Rubies Unleashed`,
    
    // ✅ SEO OPTIMIZED: Keywords go in the description, not the title
    description: `Download ${game.title} v${game.version || 'Latest'} by ${game.developer || 'Unknown'}. Free ${typeLabel} available now in the Vault.`,
    
    openGraph: {
      title: `${game.title} - Rubies Unleashed`,
      description: cleanDesc,
      url: `https://rubiesunleashed.netlify.app/view/${game.id}`,
      siteName: 'Rubies Unleashed',
      images: [
        {
          url: game.image,
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
      description: `Download ${game.title} now.`,
      images: [game.image],
    },
  };
}