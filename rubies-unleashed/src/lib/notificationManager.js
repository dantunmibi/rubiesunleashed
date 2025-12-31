/**
 * ================================================================
 * NOTIFICATION MANAGER - Persistent Notification System
 * ================================================================
 * 
 * Purpose:
 * - Store and manage user notifications
 * - Auto-cleanup old notifications (7 days)
 * - Integration with toast system
 * 
 * Features:
 * - localStorage persistence
 * - Auto-expiry after 7 days
 * - Unread count tracking
 * - Notification types (wishlist, system, activity)
 * 
 * Usage:
 * addNotification({ type: 'wishlist', message: 'Added game', gameId: '123' })
 * ================================================================
 */

const STORAGE_KEY = "ruby_notifications";
const MAX_NOTIFICATIONS = 50;
const EXPIRY_DAYS = 7;

/**
 * Notification Structure:
 * {
 *   id: string,
 *   type: 'wishlist' | 'system' | 'activity',
 *   message: string,
 *   icon: string (emoji or component name),
 *   timestamp: number,
 *   read: boolean,
 *   actionData: object (optional - for undo/view actions)
 * }
 */

/**
 * Get all notifications
 */
export function getNotifications() {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);
      
      // Auto-cleanup expired notifications
      const now = Date.now();
      const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const valid = notifications.filter(n => (now - n.timestamp) < expiryTime);
      
      // Save cleaned list if any were removed
      if (valid.length !== notifications.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
      }
      
      return valid;
    }
  } catch (error) {
    console.error("Error reading notifications:", error);
  }

  return [];
}

/**
 * Add new notification
 */
export function addNotification({ type, message, icon, actionData = null }) {
  const notifications = getNotifications();
  
  const newNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    message,
    icon: icon || getDefaultIcon(type),
    timestamp: Date.now(),
    read: false,
    actionData
  };

  // Add to beginning
  notifications.unshift(newNotification);

  // Keep only MAX_NOTIFICATIONS
  const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);

// In the addNotification function, after saving:
try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  
  // Dispatch event for UI updates
  window.dispatchEvent(new Event("notificationsChanged"));
  
  return true;
} catch (error) {
  console.error("Error saving notification:", error);
  return false;
}
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId) {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.read = true;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      window.dispatchEvent(new Event("notificationsChanged"));
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }
  
  return false;
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead() {
  const notifications = getNotifications();
  
  notifications.forEach(n => n.read = true);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event("notificationsChanged"));
    return true;
  } catch (error) {
    console.error("Error marking all as read:", error);
    return false;
  }
}

/**
 * Delete notification
 */
export function deleteNotification(notificationId) {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("notificationsChanged"));
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}

/**
 * Clear all notifications
 */
export function clearAllNotifications() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("notificationsChanged"));
    return true;
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return false;
  }
}

/**
 * Get unread count
 */
export function getUnreadCount() {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
}

/**
 * Get default icon based on type
 */
function getDefaultIcon(type) {
  const icons = {
    wishlist: "❤️",
    system: "🔔",
    activity: "⚡",
    upload: "📤",
    download: "📥",
    success: "✅",
    error: "❌",
    info: "ℹ️"
  };
  
  return icons[type] || "🔔";
}

/**
 * Format time ago for display
 */
export function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}