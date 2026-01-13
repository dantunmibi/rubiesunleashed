import { getUnifiedFeed } from '@/lib/game-service';
import HomeWrapper from "@/components/home/HomeWrapper";

// ✅ FIX: Remove revalidate to make this dynamic
// This prevents Next.js from trying to fetch at build time
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // ✅ This now runs at request time, not build time
  // No network calls during `npm run build`
  const games = await getUnifiedFeed({ 
    limit: 500,
    includeArchived: false 
  });

  return <HomeWrapper games={games} />;
}