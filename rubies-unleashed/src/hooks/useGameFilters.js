import { useMemo, useReducer, useEffect } from "react";
import { useRouter } from "next/navigation";
import { filterGames } from "@/lib/utils/gameFilters";
import { extractTags } from "@/lib/utils/tagExtractor";

const initialState = {
  searchQuery: "",
  selectedPlatform: "All",
  selectedSubPlatform: null,
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
        selectedSubPlatform: null,
        selectedCollection: null,
        visibleCount: 12,
      };
    case "SET_SUB_PLATFORM":
      return {
        ...state,
        selectedSubPlatform: action.payload,
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
        selectedSubPlatform: null,
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

  // Extract tags from games
  const { allTags, topTags } = useMemo(() => extractTags(games), [games]);

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

  const updateSubPlatform = (subPlatform) => {
    dispatch({ type: "SET_SUB_PLATFORM", payload: subPlatform });
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
    updateSubPlatform,
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
