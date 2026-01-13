import React from "react";
import PlatformSelector from "./PlatformSelector";
import GenreFilter from "./GenreFilter";

export default function VaultFilters({
  filters,
  allTags,
  ribbonTags,
  onPlatformClick,
  onGenreClick,
}) {
  return (
    <>
      <PlatformSelector
        selectedPlatform={filters.selectedPlatform}
        onPlatformClick={onPlatformClick}
      />

      <GenreFilter
        selectedGenre={filters.selectedGenre}
        searchQuery={filters.searchQuery}
        isExpanded={filters.isExpanded}
        allTags={allTags}
        ribbonTags={ribbonTags}
        onGenreClick={onGenreClick}
      />
    </>
  );
}