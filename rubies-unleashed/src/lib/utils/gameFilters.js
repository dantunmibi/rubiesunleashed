import { PLATFORMS } from "@/lib/config/platforms";
import { matchesCollection } from "./collectionMatchers";
import { normalizeText } from "./textUtils";
import { checkPlatformMatch } from "./platformUtils";

export function filterGames(games, filters, allTags) {
  let filtered = games;

  // 1. Collection Filter
  if (filters.selectedCollection) {
    filtered = filtered.filter((g) =>
      matchesCollection(g, filters.selectedCollection)
    );
  }

  // 2. Platform Filter (✅ SIMPLIFIED - no sub-platforms)
  if (filters.selectedPlatform !== "All") {
    const platformId = filters.selectedPlatform.toLowerCase();
    
    filtered = filtered.filter((g) => {
      // Check if game matches the selected platform
      return checkPlatformMatch(g, platformId);
    });
  }

  // 3. Genre/Search Logic (unchanged)
  const exactTagMatch =
    allTags.find(
      (t) => t.toLowerCase() === filters.searchQuery.toLowerCase()
    ) || (filters.selectedGenre !== "All" ? filters.selectedGenre : null);

  if (
    exactTagMatch &&
    filters.searchQuery.toLowerCase() === exactTagMatch.toLowerCase()
  ) {
    filtered = filtered.filter(
      (g) =>
        g.tags &&
        g.tags.some(
          (tag) =>
            tag.toLowerCase().trim() === exactTagMatch.toLowerCase().trim()
        )
    );
  } else if (filters.searchQuery) {
    // Fuzzy search
    const query = normalizeText(filters.searchQuery);
    filtered = filtered.filter((g) => {
      const title = normalizeText(g.title);
      const dev = normalizeText(g.developer || "");
      const tags = (g.tags || []).map((t) => normalizeText(t));

      return (
        title.includes(query) ||
        dev.includes(query) ||
        tags.some((t) => t.includes(query))
      );
    });
  }

  return filtered;
}