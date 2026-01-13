export function checkPlatformMatch(game, platformId) {
  const id = platformId.toLowerCase();

  // Check download_links array (Supabase projects)
  if (game.download_links && Array.isArray(game.download_links)) {
    const hasMatch = game.download_links.some(link => 
      link.platform && link.platform.toLowerCase() === id
    );
    if (hasMatch) return true;
  }

  // Check tags array
  const inTags = game.tags && game.tags.some((tag) => 
    tag.toLowerCase() === id
  );

  // Check buildPlatform string
  const platformsInBuild = game.buildPlatform
    ? game.buildPlatform.split(",").map((p) => p.trim().toLowerCase())
    : [];

  const inBuildPlatform = platformsInBuild.some((platform) =>
    platform === id
  );

  // Check platform field (legacy)
  const inPlatform = game.platform && game.platform.toLowerCase() === id;

  return inTags || inBuildPlatform || inPlatform;
}

// ✅ REMOVE: isWebPlatform and checkWebSubPlatform functions (no longer needed)