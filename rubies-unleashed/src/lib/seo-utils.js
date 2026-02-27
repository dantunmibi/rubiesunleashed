/**
 * 💎 RUBIES UNLEASHED - SEO Utility (Final AI-Optimized Edition)
 * Generates JSON-LD Schema and Metadata for maximum AI visibility.
 * 
 * ENHANCEMENTS (v4.0):
 * - Product catalog (hasOfferCatalog)
 * - Audience targeting (audience)
 * - Knowledge areas (knowsAbout)
 * - Platform components (hasPart)
 * - Industry classification
 * - Topic categorization (about)
 * - Internal page mentions
 * - Search action with correct params
 */

import { isApp, getPlatformInfo } from '@/lib/game-utils';
import { BRAND } from './brand';

// ✅ Re-export for convenience
export { BRAND };

const DEFAULT_IMAGE = 'https://rubiesunleashed.app/rubieslogo.png';

/**
 * 1. ORGANIZATION SCHEMA (Enhanced with AI Entity Graph)
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    
    // Core Identity
    "name": BRAND.name,
    "legalName": BRAND.legalName,
    "alternateName": BRAND.alternateName,
    "url": BRAND.url,
    "logo": {
      "@type": "ImageObject",
      "url": BRAND.logo,
      "width": "800",
      "height": "600"
    },
    
    // Descriptions (Multiple Lengths for AI Context)
    "description": BRAND.longDescription,
    "abstract": "Rubies Unleashed is a curated marketplace and distribution platform for independent games, apps, and creative digital projects.",
    "slogan": BRAND.slogan,
    
    // Founding & History
    "foundingDate": BRAND.foundingDate,
    "founder": {
      "@type": "Person",
      "name": BRAND.founder.name,
      "alternateName": BRAND.founder.alternateName,
      "url": BRAND.url,
      "description": `Founded ${BRAND.name} in July 2020 with the vision of creating a barrier-free platform for indie developers`
    },
    
    // Contact & Social
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "officialrubiesunleashed@gmail.com",
      "url": "https://rubiesunleashed.app/contact"
    },
    "sameAs": BRAND.socialProfiles,
    
    // Mission & Vision
    "mission": BRAND.missionStatement,
    
    // ✅ NEW: Topic Categorization (AI-friendly)
    "about": [
      {
        "@type": "Thing",
        "name": "Indie Games",
        "description": "Independent video games created by solo developers and small teams"
      },
      {
        "@type": "Thing",
        "name": "Digital Applications",
        "description": "Software applications and productivity tools"
      },
      {
        "@type": "Thing",
        "name": "Creative Digital Projects",
        "description": "Innovative digital creations from independent creators"
      },
      {
        "@type": "Thing",
        "name": "Game Development",
        "description": "Resources and platform for indie game developers"
      },
      {
        "@type": "Thing",
        "name": "Creator Economy",
        "description": "Platform supporting independent digital creators"
      }
    ],
    
    // Industry Classification
    "industry": "Digital Distribution Platform",
    "category": "Digital Marketplace",
    
    // Geographic Reach
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    },
    
    // Target Audience
    "audience": {
      "@type": "Audience",
      "audienceType": [
        "Independent Game Developers",
        "App Creators",
        "Digital Tool Developers",
        "Players",
        "Digital Content Consumers"
      ],
      "description": "Serves both independent creators looking for visibility and distribution, and players seeking unique gaming experiences and applications"
    },
    
    // Knowledge Areas (Topical Authority)
    "knowsAbout": [
      "Indie Games",
      "App Distribution",
      "Game Development",
      "Digital Publishing",
      "Creator Economy",
      "Community Building",
      "Asset Management",
      "Content Curation"
    ],
    
    // ✅ NEW: Internal Page Structure (mentions)
    "mentions": [
      {
        "@type": "WebPage",
        "name": "The Vault",
        "url": "https://rubiesunleashed.app/explore",
        "description": "Discovery platform for browsing curated indie games and applications"
      },
      {
        "@type": "WebPage",
        "name": "The Forge",
        "url": "https://rubiesunleashed.app/publish",
        "description": "Creator platform for publishing and managing digital projects"
      },
      {
        "@type": "WebPage",
        "name": "Help Center",
        "url": "https://rubiesunleashed.app/help",
        "description": "Support resources for creators and users"
      },
      {
        "@type": "WebPage",
        "name": "Platform Status",
        "url": "https://rubiesunleashed.app/status",
        "description": "Real-time platform health monitoring"
      },
      {
        "@type": "WebPage",
        "name": "About",
        "url": "https://rubiesunleashed.app/about",
        "description": "Platform history and mission"
      },
      {
        "@type": "WebPage",
        "name": "Contact",
        "url": "https://rubiesunleashed.app/contact",
        "description": "Get in touch with the team"
      },
      {
        "@type": "WebPage",
        "name": "Privacy Policy",
        "url": "https://rubiesunleashed.app/privacy",
        "description": "Data privacy practices and policies"
      },
      {
        "@type": "WebPage",
        "name": "Terms of Service",
        "url": "https://rubiesunleashed.app/terms",
        "description": "Platform usage terms and conditions"
      }
    ],
    
    // Product Catalog
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Rubies Unleashed Platform & Services",
      "itemListElement": [
        {
          "@type": "Product",
          "name": "The Forge - Creator Publishing Platform",
          "url": "https://rubiesunleashed.app/publish",
          "image": "https://rubiesunleashed.app/rubieslogo.png",
          "description": "Direct publishing platform for indie developers to upload and manage their games and applications. Includes asset management, project dashboards, and community features.",
          "category": "Publishing Tools",
          "offers": {
            "@type": "Offer",
            "url": "https://rubiesunleashed.app/publish",
            "price": "0.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "priceValidUntil": "2026-12-31"
          }
        },
        {
          "@type": "Product",
          "name": "The Vault - Discovery Platform",
          "url": "https://rubiesunleashed.app/explore",
          "image": "https://rubiesunleashed.app/rubieslogo.png",
          "description": "Unified discovery system for players to find curated indie games and applications. Features personalized feeds, archetype-based recommendations, and community wishlists.",
          "category": "Game Discovery",
          "offers": {
            "@type": "Offer",
            "url": "https://rubiesunleashed.app/explore",
            "price": "0.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "priceValidUntil": "2026-12-31"
          }
        },
        {
          "@type": "Product",
          "name": "Creator Dashboards",
          "url": "https://rubiesunleashed.app/publish",
          "image": "https://rubiesunleashed.app/rubieslogo.png",
          "description": "Comprehensive project management tools for creators including analytics, version control, and community engagement features.",
          "category": "Creator Tools",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }
      ]
    },
    
    // Platform Components (Sub-applications)
    "hasPart": [
      {
        "@type": "WebApplication",
        "name": "The Forge",
        "url": "https://rubiesunleashed.app/publish",
        "description": "Complete creator platform for publishing and managing indie games and applications",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web Browser"
      },
      {
        "@type": "WebApplication",
        "name": "The Vault",
        "url": "https://rubiesunleashed.app/explore",
        "description": "Discovery and exploration platform for finding curated indie content",
        "applicationCategory": "EntertainmentApplication",
        "operatingSystem": "Web Browser"
      }
    ],
    
    // Additional Context for AI
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Platform Type",
        "value": "Hybrid marketplace combining curated content with community publishing"
      },
      {
        "@type": "PropertyValue",
        "name": "Content Focus",
        "value": "Independent games, applications, and digital tools"
      },
      {
        "@type": "PropertyValue",
        "name": "Monetization Model",
        "value": "Free platform with no revenue share or listing fees"
      },
      {
        "@type": "PropertyValue",
        "name": "Platform Evolution",
        "value": "Successor to RubyApks (2020-2025), now expanded with creator publishing tools"
      }
    ]
  };
}

/**
 * 2. WEBSITE SCHEMA (Enhanced with Search Action)
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": BRAND.name,
    "alternateName": BRAND.alternateName,
    "url": BRAND.url,
    "description": BRAND.longDescription,
    "publisher": {
      "@type": "Organization",
      "name": BRAND.name,
      "logo": {
        "@type": "ImageObject",
        "url": BRAND.logo
      }
    },
    
    // ✅ FIXED: Correct search parameter
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://rubiesunleashed.app/explore?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    
    // Site metadata
    "inLanguage": "en-US",
    "about": [
      {
        "@type": "Thing",
        "name": "Independent Game Distribution",
        "description": "Platform for discovering and publishing indie games and applications"
      },
      {
        "@type": "Thing",
        "name": "Digital Creator Platform",
        "description": "Tools and services for independent digital creators"
      }
    ]
  };
}

/**
 * 3. FAQPAGE SCHEMA (Help Page)
 */
export function generateFAQPageSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": typeof faq.answer === 'string' ? faq.answer : faq.question
      }
    }))
  };
}

/**
 * 4. PERSON SCHEMA (About Page - Founder)
 */
export function generatePersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": BRAND.founder.name,
    "alternateName": BRAND.founder.alternateName,
    "description": `Founder of ${BRAND.name} (established July 2020), a digital marketplace for independent creators. Evolving from ${BRAND.alternateName}, ${BRAND.name} empowers indie developers with visibility, ownership, and long-term preservation for their projects.`,
    "jobTitle": "Founder & Creator",
    "worksFor": {
      "@type": "Organization",
      "name": BRAND.name,
      "url": BRAND.url
    },
    "url": BRAND.url,
    "sameAs": BRAND.socialProfiles,
    "knowsAbout": [
      "Indie Game Distribution",
      "Digital Publishing",
      "Creator Platforms",
      "Community Building"
    ]
  };
}

/**
 * 5. SPEAKABLE SCHEMA (Voice Search Optimization)
 */
export function generateSpeakableSchema(cssSelectors = ['h1', '.speakable-content']) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": cssSelectors
    }
  };
}

/**
 * 6. BREADCRUMB SCHEMA (Enhanced Navigation)
 */
export function generateBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url ? `https://rubiesunleashed.app${item.url}` : undefined
    }))
  };
}

/**
 * 7. COLLECTIONPAGE SCHEMA (For Explore Page)
 * NEW: Specific schema for /explore route
 */
export function generateCollectionPageSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "The Vault - Explore Indie Games & Apps",
    "description": "Discover curated indie games, applications, and digital projects. Browse by platform, genre, and archetype.",
    "url": "https://rubiesunleashed.app/explore",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Featured Indie Projects",
      "description": "Curated collection of independent games and applications",
      "numberOfItems": items.length || 0,
      "itemListElement": items.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": isApp(item.tags) ? "SoftwareApplication" : "VideoGame",
          "name": item.title,
          "url": `https://rubiesunleashed.app/view/${item.slug}`,
          "image": item.image || DEFAULT_IMAGE
        }
      }))
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": BRAND.name,
      "url": BRAND.url
    }
  };
}

/**
 * 8. GAME/APP SCHEMA (Enhanced with Article properties)
 */
export function generateJsonLd(game) {
  if (!game) return null;

  const isApplication = isApp(game.tags);
  const canonicalUrl = `https://rubiesunleashed.app/view/${game.slug}`;
  
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
    "headline": game.title,
    
    "datePublished": game.publishedDate || game.date,
    "dateModified": game.lastUpdated || game.publishedDate || game.date,
    
    "author": {
      "@type": "Person",
      "name": game.developer,
      "url": game.developerUrl ? `https://rubiesunleashed.app${game.developerUrl}` : undefined,
      "description": `Independent creator on ${BRAND.name}`
    },
    
    "publisher": {
      "@type": "Organization",
      "name": BRAND.name,
      "url": BRAND.url,
      "logo": {
        "@type": "ImageObject",
        "url": BRAND.logo
      }
    },
    
    "applicationCategory": isApplication ? "UtilitiesApplication" : "Game",
    "operatingSystem": operatingSystem,
    "downloadUrl": game.downloadUrl || game.downloadLinks?.[0]?.url,
    
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  if (game.socialLinks?.length > 0) {
    baseSchema.sameAs = game.socialLinks.map(link => link.url);
  }

  if (game.rating) {
    baseSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": game.rating,
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "10"
    };
  }

  if (isApplication) {
    baseSchema.softwareVersion = game.version || '1.0';
    baseSchema.applicationSubCategory = game.tags?.find(t => 
      ['Productivity', 'Development', 'Utility', 'Design', 'Tool'].includes(t)
    ) || 'Utility';
    if (game.size) baseSchema.fileSize = game.size;
  } else {
    baseSchema.genre = game.tags?.find(t => 
      ['Action', 'RPG', 'Strategy', 'Puzzle', 'Horror', 'Adventure'].includes(t)
    ) || "Action";
    baseSchema.playMode = "SinglePlayer";
  }

  return baseSchema;
}

/**
 * 9. METADATA GENERATOR (Enhanced)
 */
export function generateMetaTags(game) {
  if (!game) {
    return {
      title: 'Item Not Found - Rubies Unleashed',
      description: 'The requested item could not be found in the vault.',
      robots: 'noindex'
    };
  }

  const isApplication = isApp(game.tags);
  const rawDesc = (game.metaDescription || game.description || '').replace(/<[^>]*>?/gm, '');
  
  const hook = rawDesc.length > 110 
    ? rawDesc.substring(0, 110).trim() + '...' 
    : rawDesc;

  const context = `v${game.version || 'Latest'} by ${game.developer || 'Unknown'}`;
  const developerAttribution = game.source === 'supabase' && game.developer
    ? ` Created by ${game.developer}.`
    : '';

  const richDescription = `${hook} (${context})${developerAttribution} Download on ${BRAND.name}.`;
  const imageUrl = game.image?.startsWith('http') ? game.image : DEFAULT_IMAGE;

  return {
    metadataBase: new URL(BRAND.url),
    title: `${game.title} - ${BRAND.name}`,
    description: richDescription,
    keywords: game.tags?.slice(0, 10).join(', '),
    
    openGraph: {
      title: `${game.title} - ${BRAND.name}`,
      description: richDescription,
      url: `/view/${game.slug}`,
      siteName: BRAND.name,
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
      title: `${game.title} - ${BRAND.name}`,
      description: richDescription,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/view/${game.slug}`,
    }
  };
}