// Server component - no "use client"
import { generateBreadcrumbSchema, generateSpeakableSchema } from '@/lib/seo-utils';
import ExploreClient from './ExploreClient';
import { getUnifiedFeed } from '@/lib/game-service';  // ✅ Server-side import (not game-service-client)

export const metadata = {
  title: "Explore - The Vault",
  description: "Discover curated indie games, apps, and digital projects. Browse by platform, genre, and archetype on Rubies Unleashed.",
  alternates: {
    canonical: '/explore',
  },

  openGraph: {
    title: "Explore - The Vault | Rubies Unleashed",
    description: "Discover curated indie games, apps, and digital projects.",
    url: "https://rubiesunleashed.app/explore",
    images: [{ url: "/rubieslogo.png", width: 800, height: 600 }],
  },
};

export default async function ExplorePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Explore', url: '/explore' }
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "The Vault - Explore Indie Games & Apps",
    "description": "Discover curated indie games, applications, and digital projects.",
    "url": "https://rubiesunleashed.app/explore"
  };

  const speakableSchema = generateSpeakableSchema(['h1', 'h2']);

  // ✅ Fetch initial games server-side for crawlers
  let initialGames = [];
  try {
    initialGames = await getUnifiedFeed({ limit: 48, includeArchived: false });
  } catch (err) {
    console.error('❌ Server-side explore prefetch failed:', err);
    // Fails silently — ExploreContent will fetch client-side as fallback
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />
      
      <ExploreClient initialGames={initialGames} />
    </>
  );
}