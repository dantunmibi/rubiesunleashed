import { getUnifiedFeed } from '@/lib/game-service';
import HomeWrapper from '@/components/home/HomeWrapper';
import LandingPage from '@/components/home/LandingPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Rubies Unleashed | Where New Ideas Rise',
  description:
    'Discover indie games, apps, and digital creations before they go mainstream. A launchpad for emerging creators - curated by archetypes, not algorithms.',
  keywords: [
    'indie games',
    'indie apps',
    'digital creators',
    'creator platform',
    'indie developer',
    'game discovery',
    'The Forge',
    'The Vault',
    'Rubies Unleashed',
  ],
  openGraph: {
    title: 'Rubies Unleashed | Where New Ideas Rise',
    description:
      'A creator-first platform where independent developers publish, showcase, and share their digital projects. Discover what mainstream misses.',
    url: 'https://rubiesunleashed.app',
    siteName: 'Rubies Unleashed',
    type: 'website',
    images: [
      {
        url: 'https://rubiesunleashed.app/rubieslogo.png',
        width: 1200,
        height: 630,
        alt: 'Rubies Unleashed | Where New Ideas Rise',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rubies Unleashed | Where New Ideas Rise',
    description:
      'Discover indie games, apps, and tools before they go mainstream. Built by creators, for everyone.',
    site: '@rubiesunleashed',
    creator: '@rubiesunleashed',
    images: ['https://rubiesunleashed.app/rubieslogo.png'],
  },
  alternates: {
    canonical: 'https://rubiesunleashed.app',
  },
};

export default async function HomePage() {
  const games = await getUnifiedFeed({
    limit: 500,
    includeArchived: false,
  });

  return (
    <>
      {/*
        LandingPage rendered server-side - fully visible to crawlers.
        Contains all SEO-critical content: Hero, GameVault, About, etc.
        HomeWrapper hydrates client-side and swaps to Dashboard if authed.
        The swap is hidden behind AuthTransitionSkeleton - no flash.
      */}
      <HomeWrapper games={games} serverLanding={<LandingPage games={games} />} />
    </>
  );
}