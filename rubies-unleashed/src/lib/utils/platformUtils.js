export function checkPlatformMatch(game, platformIds) {
  const ids = Array.isArray(platformIds) ? platformIds : [platformIds.toLowerCase()];

  // Check tags array
  const inTags =
    game.tags &&
    game.tags.some((tag) => ids.includes(tag.toLowerCase()));

  // Check buildPlatform string
  const platformsInBuild = game.buildPlatform
    ? game.buildPlatform.split(",").map((p) => p.trim().toLowerCase())
    : [];

  const inBuildPlatform = platformsInBuild.some((platform) =>
    ids.includes(platform)
  );

  return inTags || inBuildPlatform;
}

export function isWebPlatform(game) {
  return (
    (game.buildPlatform &&
      game.buildPlatform
        .split(",")
        .map((p) => p.trim().toLowerCase())
        .some((p) => p === "web" || p === "html5")) ||
    (game.tags &&
      game.tags.some((t) => ["web", "html5"].includes(t.toLowerCase())))
  );
}

export function checkWebSubPlatform(game, subPlatformId) {
  const isWeb = isWebPlatform(game);

  if (!isWeb) return false;

  switch (subPlatformId) {
    case "PWA":
      return (
        game.tags && game.tags.some((t) => t.toLowerCase() === "pwa")
      );

    case "Extension": {
      const hasExtensionTag =
        game.tags &&
        game.tags.some((t) => {
          const lower = t.toLowerCase();
          return (
            lower.includes("extension") ||
            lower.includes("chrome extension") ||
            lower.includes("firefox extension") ||
            lower.includes("add-on") ||
            lower.includes("addon") ||
            lower.includes("g-suite")
          );
        });
      return hasExtensionTag;
    }

    case "CloudApp": {
      const hasPWATag =
        game.tags && game.tags.some((t) => t.toLowerCase() === "pwa");

      const hasExtensionTag =
        game.tags &&
        game.tags.some((t) => {
          const lower = t.toLowerCase();
          return (
            lower.includes("extension") ||
            lower.includes("add-on") ||
            lower.includes("addon")
          );
        });

      return !hasPWATag && !hasExtensionTag;
    }

    default:
      return false;
  }
}