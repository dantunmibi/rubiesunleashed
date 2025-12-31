export function matchesCollection(game, collectionId) {
  const matchers = {
    "new-notable": matchNewNotable,
    "editors-choice": matchEditorsChoice,
    "indie-corner": matchIndieCorner,
    "trending-now": matchFamilyFriendly,
    "level-up": matchLevelUp,
    "offline-gems": matchOfflineGems,
  };

  const matcher = matchers[collectionId];
  return matcher ? matcher(game) : true;
}

function matchNewNotable(game) {
  if (!game.publishedDate) return false;

  const now = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(now.getFullYear() - 2);

  const publishDate = new Date(game.publishedDate);
  return publishDate >= twoYearsAgo;
}

function matchEditorsChoice(game) {
  return (
    game.tags && game.tags.some((t) => t.toLowerCase() === "featured")
  );
}

function matchIndieCorner(game) {
  return (
    game.tags && game.tags.some((t) => ["games"].includes(t.toLowerCase()))
  );
}

function matchFamilyFriendly(game) {
  const hasFamilyTag =
    game.tags &&
    game.tags.some((t) =>
      [
        "family",
        "family friendly",
        "family-friendly",
        "kids",
        "children",
        "all ages",
      ].includes(t.toLowerCase())
    );

  const hasFamilyRating =
    game.ageRating &&
    (game.ageRating.toLowerCase().includes("everyone") ||
      game.ageRating.toLowerCase().includes("e (") ||
      game.ageRating.toLowerCase().includes("pegi 3") ||
      game.ageRating.toLowerCase().includes("pegi 7") ||
      game.ageRating === "3+" ||
      game.ageRating === "7+");

  return hasFamilyTag || hasFamilyRating;
}

function matchLevelUp(game) {
  return (
    game.tags &&
    game.tags.some((t) =>
      ["productivity", "fitness", "health"].includes(t.toLowerCase())
    )
  );
}

function matchOfflineGems(game) {
  const isWebBased =
    (game.buildPlatform &&
      game.buildPlatform
        .split(",")
        .map((p) => p.trim().toLowerCase())
        .some((p) => p === "web" || p === "html5")) ||
    (game.tags &&
      game.tags.some((t) => ["web", "html5"].includes(t.toLowerCase())));

  const hasOnlineTags =
    game.tags &&
    game.tags.some((t) => {
      const lower = t.toLowerCase();
      return (
        lower === "online" ||
        lower === "multiplayer online" ||
        lower === "online only" ||
        lower === "browser" ||
        lower === "cloud"
      );
    });

  return !isWebBased && !hasOnlineTags;
}