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

      {/*
        ─── CRAWLER CONTENT LAYER ───────────────────────────────────────
        Visually hidden but fully readable by crawlers and AI bots.
        Semantic HTML with real game data — no JS required to see this.
        ExploreClient renders the interactive UI on top for real users.
        ─────────────────────────────────────────────────────────────────
      */}
      <div className="sr-only" aria-hidden="false">
        <h1>Explore The Vault — Indie Games, Apps & Digital Projects</h1>
        <p>
          Discover and download indie games, apps, and tools on Rubies Unleashed.
          Curated by archetypes, not algorithms. Where new ideas rise.
        </p>

        {initialGames.length > 0 && (
          <section>
            <h2>New Arrivals</h2>
            <ul>
              {initialGames.map((game) => (
                <li key={game.id}>
                  <article>
                    <h3>{game.title}</h3>
                    {game.description && (
                      <p>{game.description.replace(/<[^>]*>/g, '').slice(0, 200)}</p>
                    )}
                    {game.tags?.length > 0 && (
                      <p>Tags: {game.tags.join(', ')}</p>
                    )}
                    {game.slug && (
                      <a href={`/view/${game.slug}`}>
                        View {game.title}
                      </a>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="Platform navigation">
          <h2>Browse by Category</h2>
          <ul>
            <li><a href="/explore?type=game">Games</a></li>
            <li><a href="/explore?type=app">Apps & Tools</a></li>
            <li><a href="/explore">All Projects</a></li>
          </ul>
        </nav>
      </div>

      {/* Interactive UI — for real users */}
      <ExploreClient initialGames={initialGames} />
    </>
  );
}