/**
 * ================================================================
 * USE DEBOUNCE HOOK
 * ================================================================
 * Purpose: Delays updating a value until a specified time has passed.
 * Used to prevent excessive search filtering on every keystroke.
 */

"use client";

import { useState, useEffect } from "react";

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}