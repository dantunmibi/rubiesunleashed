import { useMemo, useReducer, useEffect } from "react";
import { useRouter } from "next/navigation";
import { filterGames } from "@/lib/utils/gameFilters";

// ✅ ADD: Standardized tags from ProjectEditor
const GAME_TAGS = [
  "Action", "Adventure", "RPG", "Strategy", "Simulation", "Puzzle", 
  "Shooter", "Platformer", "Visual Novel", "Fighting", "Racing", "Sports", 
  "Horror", "Sci-Fi", "Fantasy", "Cyberpunk"
];

const APP_TAGS = [
  "Utility", "Productivity", "Development", "Design", "System", "Tool", 
  "Social", "Education", "Multimedia", "Security", "Open Source"
];

const UNIVERSAL_TAGS = [
  "Pixel Art", "Retro", "Cozy", "Minimalist", "Family Friendly", 
  "PWA", "2D", "3D", "VR", "Mobile"
];

const initialState = {
  searchQuery: "",
  selectedPlatform: "All",
  selectedGenre: "All",
  selectedCollection: null,
  visibleCount: 12,
  isExpanded: false,
};

function filtersReducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload, visibleCount: 12 };
    case "SET_PLATFORM":
      return {
        ...state,
        selectedPlatform: action.payload,
        selectedCollection: null,
        visibleCount: 12,
      };
    case "SET_GENRE":
      return {
        ...state,
        selectedGenre: action.payload,
        visibleCount: 12,
        isExpanded: false,
      };
    case "SET_COLLECTION":
      return {
        ...state,
        selectedCollection: action.payload,
        selectedPlatform: "All",
        visibleCount: 12,
      };
    case "TOGGLE_EXPANDED":
      return { ...state, isExpanded: !state.isExpanded };
    case "LOAD_MORE":
      return { ...state, visibleCount: state.visibleCount + 12 };
    case "RESET":
      return initialState;
    case "INIT_FROM_PARAMS":
      return {
        ...state,
        searchQuery: action.payload.query || "",
        selectedPlatform: action.payload.platform || "All",
      };
    default:
      return state;
  }
}

export function useGameFilters(games, searchParams) {
  const router = useRouter();
  const [filters, dispatch] = useReducer(filtersReducer, initialState);

  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const platform = searchParams.get("platform") || "All";
    dispatch({
      type: "INIT_FROM_PARAMS",
      payload: { query, platform },
    });
  }, [searchParams]);

  // ✅ REPLACE: Use standardized tags instead of extracting from data
  const { allTags, topTags } = useMemo(() => {
    // Combine all standardized tags
    const allStandardTags = [...GAME_TAGS, ...APP_TAGS, ...UNIVERSAL_TAGS];
    
    // Find which tags are actually used in the current games
    const usedTags = new Set();
    games.forEach(game => {
      if (game.tags) {
        game.tags.forEach(tag => {
          if (allStandardTags.includes(tag)) {
            usedTags.add(tag);
          }
        });
      }
    });
    
    // Filter standardized tags to only show ones that are used
    const availableTags = allStandardTags.filter(tag => usedTags.has(tag));
    
    // Calculate top tags based on usage frequency
    const tagCounts = {};
    games.forEach(game => {
      if (game.tags) {
        game.tags.forEach(tag => {
          if (availableTags.includes(tag)) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });
    
    // Sort by usage count and take top 8
    const sortedTags = availableTags.sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0));
    const topUsedTags = sortedTags.slice(0, 8);
    
    return {
      allTags: availableTags,
      topTags: topUsedTags
    };
  }, [games]);

  // Calculate ribbon tags
  const ribbonTags = useMemo(() => {
    let activeTag = filters.selectedGenre;
    const searchMatch = allTags.find(
      (t) => t.toLowerCase() === filters.searchQuery.toLowerCase()
    );
    if (searchMatch) activeTag = searchMatch;

    let displayList = [...topTags];
    if (activeTag !== "All" && !displayList.includes(activeTag)) {
      displayList.splice(1, 0, activeTag);
    }

    return displayList;
  }, [topTags, allTags, filters.selectedGenre, filters.searchQuery]);

  // Filter games
  const filteredGames = useMemo(() => {
    return filterGames(games, filters, allTags);
  }, [games, filters, allTags]);

  // Visible games with pagination
  const visibleGames = useMemo(() => {
    return filteredGames.slice(0, filters.visibleCount);
  }, [filteredGames, filters.visibleCount]);

  // Update URL when search changes
  const updateSearch = (term) => {
    dispatch({ type: "SET_SEARCH", payload: term });
    const params = new URLSearchParams(searchParams);
    if (term) params.set("q", term);
    else params.delete("q");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const updatePlatform = (platform) => {
    dispatch({ type: "SET_PLATFORM", payload: platform });
  };

  const updateGenre = (genre) => {
    dispatch({ type: "SET_GENRE", payload: genre });
    if (genre === "All") updateSearch("");
    else updateSearch(genre);
  };

  const updateCollection = (collectionId) => {
    const newCollection =
      filters.selectedCollection === collectionId ? null : collectionId;
    dispatch({ type: "SET_COLLECTION", payload: newCollection });
  };

  const toggleExpanded = () => {
    dispatch({ type: "TOGGLE_EXPANDED" });
  };

  const loadMore = () => {
    dispatch({ type: "LOAD_MORE" });
  };

  const clearAllFilters = () => {
    dispatch({ type: "RESET" });
    updateSearch("");
  };

  return {
    filters,
    updateSearch,
    updatePlatform,
    updateGenre,
    updateCollection,
    toggleExpanded,
    clearAllFilters,
    filteredGames,
    visibleGames,
    loadMore,
    allTags,
    topTags,
    ribbonTags,
  };
}