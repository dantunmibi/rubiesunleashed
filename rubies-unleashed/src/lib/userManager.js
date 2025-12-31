/**
 * ================================================================
 * USER MANAGER - TEMP USER SYSTEM
 * ================================================================
 * 
 * Handles temporary user creation and wishlist management.
 * Structure is backend-ready for easy migration to real auth.
 * 
 * Features:
 * - Auto-generates unique usernames
 * - Persistent localStorage with fallback
 * - Shareable wishlist URLs
 * - Easy migration path to real auth
 * 
 * Auth Flow Changes:
 * - NO auto-creation of users
 * - Only creates user when explicitly requested via createGuestUser()
 * - getCurrentUser() returns null if no user exists
 * ================================================================
 */

const STORAGE_KEY = "ruby_user_data";
const ADJECTIVES = ["Ruby", "Pixel", "Cyber", "Neon", "Retro", "Epic", "Mystic", "Cosmic", "Shadow", "Thunder"];
const NOUNS = ["Gamer", "Hunter", "Explorer", "Seeker", "Collector", "Raider", "Warrior", "Wizard", "Knight", "Phoenix"];
const EMOJIS = ["🎮", "💎", "🎯", "⚡", "🔥", "🌟", "🎲", "🏆", "👾", "🕹️"];

/**
 * Generate random username
 */
function generateUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 999) + 1;
  return `${adj}_${noun}_${num}`;
}

/**
 * Generate random avatar emoji
 */
function generateAvatar() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

/**
 * ✅ NEW: Get existing user data (does NOT create if missing)
 */
function getUserData() {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Validate structure
      if (data.currentUser && data.currentUser.username) {
        return data;
      }
    }
  } catch (error) {
    console.error("Error reading user data:", error);
  }

  return null;
}

/**
 * ✅ RENAMED: Get or create temp user (explicit creation)
 * This replaces the old getTempUser() for backward compatibility
 */
export function getTempUser() {
  const existing = getUserData();
  if (existing) return existing;

  // Only create if explicitly called
  return createGuestUser();
}

/**
 * ✅ NEW: Explicitly create a guest user
 */
export function createGuestUser() {
  const newUser = {
    currentUser: {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: generateUsername(),
      avatar: generateAvatar(),
      createdAt: Date.now(),
      isGuest: true, // ✅ NEW: Flag for guest users
    },
    wishlist: [],
    preferences: {
      sortBy: "dateAdded-desc",
      viewMode: "grid",
    },
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    console.log("✅ Guest user created:", newUser.currentUser.username);
  } catch (error) {
    console.error("Error saving user data:", error);
  }

  return newUser;
}

/**
 * ✅ UPDATED: Get current user info (returns null if no user)
 */
export function getCurrentUser() {
  const data = getUserData(); // ✅ Changed from getTempUser()
  return data?.currentUser || null;
}

/**
 * ✅ UPDATED: Get user's wishlist (returns empty array if no user)
 */
export function getWishlist() {
  const data = getUserData(); // ✅ Changed from getTempUser()
  return data?.wishlist || [];
}

/**
 * ✅ UPDATED: Add game to wishlist (requires user to exist)
 */
export function addToWishlist(game) {
  if (!game || !game.id) return false;

  const data = getUserData(); // ✅ Changed from getTempUser()
  if (!data) {
    console.warn("⚠️ Cannot add to wishlist: No user exists");
    return false;
  }
  
  // Check if already exists
  const exists = data.wishlist.some((item) => item.id === game.id);
  if (exists) return false;

  // Add with metadata
  const wishlistItem = {
    ...game,
    addedAt: Date.now(),
  };

  data.wishlist.unshift(wishlistItem); // Add to beginning

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return false;
  }
}

/**
 * Remove game from wishlist
 */
export function removeFromWishlist(gameId) {
  const data = getUserData(); // ✅ Changed from getTempUser()
  if (!data) return false;

  data.wishlist = data.wishlist.filter((item) => item.id !== gameId);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return false;
  }
}

/**
 * Check if game is in wishlist
 */
export function isInWishlist(gameId) {
  const wishlist = getWishlist();
  return wishlist.some((item) => item.id === gameId);
}

/**
 * Clear entire wishlist
 */
export function clearWishlist() {
  const data = getUserData(); // ✅ Changed from getTempUser()
  if (!data) return false;

  data.wishlist = [];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return false;
  }
}

/**
 * Update user preferences
 */
export function updatePreferences(preferences) {
  const data = getUserData(); // ✅ Changed from getTempUser()
  if (!data) return false;

  data.preferences = { ...data.preferences, ...preferences };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error updating preferences:", error);
    return false;
  }
}

/**
 * Get user preferences
 */
export function getPreferences() {
  const data = getUserData(); // ✅ Changed from getTempUser()
  return data?.preferences || { sortBy: "dateAdded-desc", viewMode: "grid" };
}

/**
 * Get wishlist stats
 */
export function getWishlistStats() {
  const wishlist = getWishlist();
  
  const stats = {
    total: wishlist.length,
    games: wishlist.filter((item) => item.type !== "App").length,
    apps: wishlist.filter((item) => item.type === "App").length,
    recentlyAdded: wishlist.slice(0, 5), // Last 5 added
  };

  return stats;
}

/**
 * Format time ago (e.g., "3 days ago")
 */
export function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  const months = Math.floor(diff / 2592000000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return `${months}mo ago`;
}

/**
 * Export wishlist as JSON (for future features)
 */
export function exportWishlist() {
  const data = getUserData(); // ✅ Changed from getTempUser()
  return JSON.stringify(data, null, 2);
}