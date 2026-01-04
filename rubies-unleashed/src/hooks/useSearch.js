/**
 * ================================================================
 * USE SEARCH HOOK (v19.3 - Anti-Flicker)
 * ================================================================
 * Fix: Immediately sets isSearching=true when query changes.
 * Prevents "No Results" from flashing during the debounce delay.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export function useSearch(games = []) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // 300ms delay to prevent lag
  const debouncedQuery = useDebounce(query, 300);

  // ⚡ 1. IMMEDIATE FEEDBACK
  // As soon as the user types, flag as searching.
  // This covers the 300ms gap before the debounce effect fires.
  useEffect(() => {
    if (query.trim().length >= 2) {
      setIsSearching(true);
    } else {
      setIsSearching(false); // Reset if query is cleared/too short
      if (query.trim().length === 0) setResults([]);
    }
  }, [query]);

  // 2. PERFORM SEARCH (Runs only after debounce)
  const performSearch = useCallback((searchQuery) => {
    // Validation
    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Note: isSearching is already true from the effect above,
    // but we ensure it here just in case.
    
    if (!Array.isArray(games)) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();

    // Filter
    const filtered = games.filter(game => {
      const title = (game.title || '').toLowerCase();
      const developer = (game.developer || '').toLowerCase();
      const tags = Array.isArray(game.tags) ? game.tags.join(' ').toLowerCase() : '';

      return (
        title.includes(normalizedQuery) ||
        developer.includes(normalizedQuery) ||
        tags.includes(normalizedQuery)
      );
    });

    // Sort
    const sorted = filtered.sort((a, b) => {
      const aTitle = (a.title || '').toLowerCase();
      const bTitle = (b.title || '').toLowerCase();
      
      if (aTitle === normalizedQuery && bTitle !== normalizedQuery) return -1;
      if (bTitle === normalizedQuery && aTitle !== normalizedQuery) return 1;
      if (aTitle.startsWith(normalizedQuery) && !bTitle.startsWith(normalizedQuery)) return -1;
      if (!aTitle.startsWith(normalizedQuery) && bTitle.startsWith(normalizedQuery)) return 1;
      return aTitle.localeCompare(bTitle);
    });

    setResults(sorted);
    setIsSearching(false); // ✅ Search complete, turn off loading
  }, [games]);

  // 3. TRIGGER SEARCH
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
  };

  return { query, setQuery, results, isSearching, clearSearch };
}