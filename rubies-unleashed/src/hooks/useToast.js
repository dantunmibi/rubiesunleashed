/**
 * ================================================================
 * TOAST HOOK - Toast State Management
 * ================================================================
 * 
 * Purpose:
 * - Centralized toast management
 * - Easy toast creation from any component
 * 
 * Usage:
 * const { showToast } = useToast();
 * showToast("Added to wishlist!", "wishlist");
 * 
 * Features:
 * - Auto-generates unique IDs
 * - Auto-removes after duration
 * - Supports custom icons
 * ================================================================
 */

"use client";

import { useState, useCallback } from "react";

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", options = {}) => {
    const id = toastId++;
    const newToast = {
      id,
      message,
      type,
      icon: options.icon,
      duration: options.duration || 3000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
}