/**
 * 💎 RUBIES UNLEASHED - Item Details Page (Server Entry)
 * ------------------------------------------------------
 * - Server-Side Rendering for SEO & Performance
 * - Generates JSON-LD Schema (Rich Snippets)
 * - Passes initial data to Client View for instant load
 */

import { fetchGameById } from '@/lib/blogger';
import { generateJsonLd, generateMetaTags } from '@/lib/seo-utils';
import ViewClient from '@/components/store/ViewClient';

// 1. Dynamic Metadata Generation (SEO)
export async function generateMetadata({ params }) {
  
  const { slug } = await params; // Next.js 15 async params
  
  // Extract ID
  const parts = slug.split("-");
  const gameId = parts[parts.length - 1].replace(/\.[^/.]+$/, "");
  
  const game = await fetchGameById(gameId);
  return generateMetaTags(game);
}

// 2. Server Page Component
export default async function ViewPage({ params }) {
  const { slug } = await params;
  
  // Extract ID
  const parts = slug.split("-");
  const gameId = parts[parts.length - 1].replace(/\.[^/.]+$/, "");
  
  // Fetch Data (Server Side)
  const game = await fetchGameById(gameId);

  // Generate Schema (JSON-LD)
  const jsonLd = generateJsonLd(game);

  return (
    <>
      {/* Inject Structured Data for Search Engines */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      
      {/* Render Client UI with Initial Data (Fast Load) */}
      <ViewClient slug={slug} initialGame={game} />
    </>
  );
}