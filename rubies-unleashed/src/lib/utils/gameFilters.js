import { PLATFORMS } from "@/lib/config/platforms";
import { matchesCollection } from "./collectionMatchers";
import { normalizeText } from "./textUtils";
import { checkPlatformMatch, checkWebSubPlatform } from "./platformUtils";

export function filterGames(games, filters, allTags) {
  let filtered = games;

  // 1. Collection Filter
  if (filters.selectedCollection) {
    filtered = filtered.filter((g) =>
      matchesCollection(g, filters.selectedCollection)
    );
  }

  // 2. Platform Filter
  if (filters.selectedSubPlatform) {
    filtered = filtered.filter((g) => {
      // Special handling for Web sub-platforms
      if (
        ["PWA", "Extension", "CloudApp"].includes(filters.selectedSubPlatform)
      ) {
        return checkWebSubPlatform(g, filters.selectedSubPlatform);
      }

      // Normal platform matching
      return checkPlatformMatch(g, filters.selectedSubPlatform);
    });
  } else if (filters.selectedPlatform !== "All") {
    const platformConfig = PLATFORMS[filters.selectedPlatform];
    if (platformConfig) {
      if (filters.selectedPlatform === "Web") {
        // Show all web games
        filtered = filtered.filter((g) => {
          const isWebPlatform =
            (g.buildPlatform &&
              g.buildPlatform
                .split(",")
                .map((p) => p.trim().toLowerCase())
                .some((p) => p === "web" || p === "html5")) ||
            (g.tags &&
              g.tags.some((t) => ["web", "html5"].includes(t.toLowerCase())));
          return isWebPlatform;
        });
      } else {
        // PC and Mobile platforms
        const subPlatformIds = platformConfig.subPlatforms.map((sp) =>
          sp.id.toLowerCase()
        );

        filtered = filtered.filter((g) =>
          checkPlatformMatch(g, subPlatformIds)
        );
      }
    }
  }

  // 3. Genre/Search Logic
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
