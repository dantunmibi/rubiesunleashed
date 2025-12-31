const EXCLUDED_TAGS = [
  "Featured",
  "Game",
  "indie",
  "Windows",
  "Mac",
  "Android",
  "Web",
  "Linux",
  "PC",
  "iOS",
  "HarmonyOS",
  "Extensions",
  "CloudApps",
];

export function extractTags(games) {
  if (games.length === 0) return { allTags: [], topTags: [] };

  const counts = {};

  games.forEach((game) => {
    if (game.tags) {
      game.tags.forEach((tag) => {
        if (!EXCLUDED_TAGS.includes(tag)) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      });
    }
  });

  const entries = Object.entries(counts);

  // Top 10 most common tags
  const topTags = entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map((e) => e[0]);

  // All tags alphabetically
  const allTagsAz = entries
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map((e) => e[0]);

  return {
    allTags: ["All", ...allTagsAz],
    topTags: ["All", ...topTags],
  };
}