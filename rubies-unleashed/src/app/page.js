import { getUnifiedFeed } from '@/lib/game-service'; // ✅ Server version
import HomeWrapper from "@/components/home/HomeWrapper";

// Ensure fresh data on server render
export const revalidate = 3600; 

export default async function HomePage() {
  // ✅ Load unified feed on server
  const games = await getUnifiedFeed({ 
    limit: 500,
    includeArchived: false 
  });

  return <HomeWrapper games={games} />;
}