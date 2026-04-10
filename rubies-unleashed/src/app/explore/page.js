import { generateBreadcrumbSchema, generateSpeakableSchema } from '@/lib/seo-utils';
import ExploreClient from './ExploreClient';
import { getUnifiedFeed } from '@/lib/game-service';

export const revalidate = 300;

export const metadata = {
  title: 'Explore - The Vault | Rubies Unleashed',
  description: 'Discover curated indie games, apps, and digital projects. Browse by platform, genre, and archetype on Rubies Unleashed.',
  alternates: {
    canonical: 'https://rubiesunleashed.app/explore',
  },
  openGraph: {
    title: 'Explore - The Vault | Rubies Unleashed',
    description: 'Discover curated indie games, apps, and digital projects. Enter The Vault.',
    url: 'https://rubiesunleashed.app/explore',
    siteName: 'Rubies Unleashed',
    images: [{ url: '/rubieslogo.png', width: 800, height: 600, alt: 'Rubies Unleashed' }],
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
    "name": "The Vault — Explore Indie Games & Apps",
    "description": "Discover curated indie games, applications, and digital projects on Rubies Unleashed.",
    "url": "https://rubiesunleashed.app/explore"
  };

  const speakableSchema = generateSpeakableSchema(['h1', 'h2']);

  let initialGames = [];
  try {
    initialGames = await getUnifiedFeed({ limit: 48, includeArchived: false });
  } catch (err) {
    console.error('❌ Server-side explore prefetch failed:', err);
  }

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* Interactive UI — for real users */}
      <ExploreClient initialGames={initialGames} />
    </>
  );
}