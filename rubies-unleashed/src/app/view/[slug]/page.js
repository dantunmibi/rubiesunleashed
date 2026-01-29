/**
 * 💎 RUBIES UNLEASHED - Item Details Page (AI-Optimized)
 */

export const revalidate = 3600;

import { getGame } from '@/lib/game-service';
import { generateJsonLd, generateMetaTags, generateSpeakableSchema } from '@/lib/seo-utils';
import ViewClient from '@/components/store/ViewClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = await getGame(slug);
  
  if (!game) {
    return { title: 'Item Not Found - Rubies Unleashed' };
  }
  
  return generateMetaTags(game);
}

export default async function ViewPage({ params }) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) {
    notFound();
  }

  const jsonLd = generateJsonLd(game);
  const speakableSchema = generateSpeakableSchema(['h1', '.prose']);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://rubiesunleashed.netlify.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Explore",
        "item": "https://rubiesunleashed.netlify.app/explore"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": game.title,
        "item": `https://rubiesunleashed.netlify.app/view/${game.slug}`
      }
    ]
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      
      {/* ✅ Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ✅ Speakable Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
      
      <ViewClient slug={slug} initialGame={game} />
    </>
  );
}