import { fetchGames } from "@/lib/blogger";
import HomeWrapper from "@/components/home/HomeWrapper";

// Ensure fresh data on server render
export const revalidate = 3600; 

export default async function Home() {
  const games = await fetchGames(1000);
  return <HomeWrapper games={games} />;
}