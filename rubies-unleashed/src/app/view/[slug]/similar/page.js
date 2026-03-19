/**
 * 💎 RUBIES UNLEASHED - Similar Items Page (Server)
 * Route: /view/[slug]/similar
 */

export const revalidate = 3600;

import { getGame } from '@/lib/game-service';
import { notFound } from 'next/navigation';
import SimilarPageClient from './SimilarPageClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) {
    return { title: 'Item Not Found - Rubies Unleashed' };
  }

  return {
    title: `Similar to ${game.title} — Rubies Unleashed`,
    description: `Discover more ${game.type === 'App' ? 'apps and tools' : 'games'} similar to ${game.title}. Hand-scored recommendations from the Rubies Unleashed vault.`,
    openGraph: {
      title: `Similar to ${game.title} — Rubies Unleashed`,
      description: `More like ${game.title}. Curated by the Rubies Unleashed discovery engine.`,
      images: game.image || game.cover_url ? [{ url: game.image || game.cover_url }] : [],
    },
  };
}

export default async function SimilarPage({ params }) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) {
    notFound();
  }

  return <SimilarPageClient slug={slug} sourceGame={game} />;
}