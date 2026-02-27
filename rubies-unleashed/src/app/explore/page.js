// Server component - no "use client"
import { generateBreadcrumbSchema, generateSpeakableSchema } from '@/lib/seo-utils';
import ExploreClient from './ExploreClient';

export const metadata = {
  title: "Explore - The Vault",
  description: "Discover curated indie games, apps, and digital projects. Browse by platform, genre, and archetype on Rubies Unleashed.",
  alternates: {
    canonical: '/explore',
  }
};

export default function ExplorePage() {
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />
      
      <ExploreClient />
    </>
  );
}