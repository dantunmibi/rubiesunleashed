/**
 * 💎 RUBIES UNLEASHED - Item Details Page (Hybrid Server Entry)
 * ------------------------------------------------------
 * - Supports both Legacy (Blogger) and Forge (Supabase) content.
 * - Server-Side Rendering for SEO & Performance.
 */

// ✅ ISR: Regenerate every hour, serve stale content while revalidating
export const revalidate = 3600; // 1 hour

import { getGame } from '@/lib/game-service'; // ✅ Hybrid Service
import { generateJsonLd, generateMetaTags } from '@/lib/seo-utils';
import ViewClient from '@/components/store/ViewClient';
import { notFound } from 'next/navigation';

// 1. Dynamic Metadata Generation (SEO)
export async function generateMetadata({ params }) {
  const { slug } = await params; // Next.js 15 async params
  
  // Fetch from Hybrid Service (Supabase -> Blogger)
  const game = await getGame(slug);
  
  if (!game) {
      return { title: 'Item Not Found - Rubies Unleashed' };
  }
  
  return generateMetaTags(game);
}

// 2. Server Page Component
export default async function ViewPage({ params }) {
  const { slug } = await params;
  console.log("👉 Viewing Slug:", slug); // DEBUG

  const game = await getGame(slug);
  console.log("👉 Game Found:", game ? game.title : "NULL"); // DEBUG

  if (!game) {
      notFound();
  }

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