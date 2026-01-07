/**
 * 💎 RUBIES UNLEASHED - Feed Algorithm
 * ------------------------------------
 * Sorts and filters the game list based on User Archetype.
 */

import { isApp } from "./game-utils";

export function getCuratedFeed(games, archetype) {
  if (!games || games.length === 0) return [];
  if (!archetype || archetype === 'guest') return games; // Chronological default

  // Clone array to avoid mutating source
  let feed = [...games];

  switch (archetype) {
    case 'hunter': // Games First
      return feed.sort((a, b) => {
        const isAppA = isApp(a.tags);
        const isAppB = isApp(b.tags);
        if (isAppA === isAppB) return 0; // Maintain date sort
        return isAppA ? 1 : -1; // Games (false) before Apps (true)
      });

    case 'netrunner': // Apps First
      return feed.sort((a, b) => {
        const isAppA = isApp(a.tags);
        const isAppB = isApp(b.tags);
        if (isAppA === isAppB) return 0;
        return isAppA ? -1 : 1; // Apps (true) before Games (false)
      });

    case 'curator': // Quality First (Mock Rating for now)
      // Since we don't have real ratings yet, maybe prioritize "Featured" tag?
      // Or just keep chronological for now until Phase 4.
      return feed; 

    case 'phantom': // The Underground (Shuffle)
      // Simple shuffle with seed (using date to keep stable per session?)
      // For now, simple random sort
      return feed.sort(() => Math.random() - 0.5);

    case 'architect': // Analytics/Dev focus
      // Maybe show "Needs Review" items first? Or just standard.
      return feed;

    default:
      return feed;
  }
}