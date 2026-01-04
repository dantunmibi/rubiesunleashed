/**
 * ================================================================
 * NOTIFICATION PANEL - Notification Center Dropdown
 * ================================================================
 * 
 * Purpose:
 * - Display notification history
 * - Mark as read/unread
 * - Delete/clear notifications
 * - Action buttons (Undo, View)
 * 
 * Features:
 * - Grouped by date (Today, Yesterday, Earlier)
 * - Unread indicators
 * - Action buttons based on notification type
 * - Empty state
 * - Auto-updates on new notifications
 * ================================================================
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, CheckCheck } from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  formatTimeAgo
} from "@/lib/notificationManager";
import { removeFromWishlist, addToWishlist } from "@/lib/userManager";
import { useToastContext } from "@/components/providers/ToastProvider";

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const { showToast } = useToastContext();

  useEffect(() => {
    loadNotifications();
  }, []);

  // Listen for notification changes
  useEffect(() => {
    const handleNotificationChange = () => {
      loadNotifications();
    };

    window.addEventListener("notificationsChanged", handleNotificationChange);
    
    return () => {
      window.removeEventListener("notificationsChanged", handleNotificationChange);
    };
  }, []);

  const loadNotifications = () => {
    setNotifications(getNotifications());
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    loadNotifications();
  };

  const handleDelete = (notificationId) => {
    deleteNotification(notificationId);
    loadNotifications();
  };

  const handleClearAll = () => {
    if (confirm("Clear all notifications?")) {
      clearAllNotifications();
      loadNotifications();
    }
  };

const handleUndo = (notification) => {
  if (notification.actionData?.type === "wishlist_add") {
    // Undo add to wishlist
    removeFromWishlist(notification.actionData.gameId);
    showToast("Removed from wishlist", "info");
    deleteNotification(notification.id);
    loadNotifications();
    
    // ✅ NEW: Dispatch event to update UI
    window.dispatchEvent(new CustomEvent("wishlistChanged", { 
      detail: { gameId: notification.actionData.gameId, action: 'removed' }
    }));
  } else if (notification.actionData?.type === "wishlist_remove") {
    // Undo remove from wishlist
    addToWishlist(notification.actionData.game);
    showToast("Added back to wishlist", "wishlist");
    deleteNotification(notification.id);
    loadNotifications();
    
    // ✅ NEW: Dispatch event to update UI
    window.dispatchEvent(new CustomEvent("wishlistChanged", { 
      detail: { gameId: notification.actionData.game.id, action: 'added' }
    }));
  }
};

  const handleView = (notification) => {
    if (notification.actionData?.gameSlug) {
      router.push(`/view/${notification.actionData.gameSlug}`);
      onClose();
    }
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notif) => {
    const now = Date.now();
    const diff = now - notif.timestamp;
    const days = Math.floor(diff / 86400000);
    
    let group;
    if (days === 0) group = "Today";
    else if (days === 1) group = "Yesterday";
    else group = "Earlier";
    
    if (!groups[group]) groups[group] = [];
    groups[group].push(notif);
    
    return groups;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-5rem)] bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-110 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Notifications
          </h3>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="text-xs font-bold text-ruby bg-ruby/10 px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="p-1.5 text-slate-400 hover:text-ruby hover:bg-white/5 rounded-lg transition-all"
              title="Mark all as read"
            >
              <CheckCheck size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 max-w-full overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-sm font-bold text-slate-400">No notifications yet</p>
            <p className="text-xs text-slate-600 mt-1">
              We'll notify you when something happens
            </p>
          </div>
        ) : (
          /* Notification Groups */
          Object.entries(groupedNotifications).map(([group, notifs]) => (
            <div key={group}>
              {/* Group Header */}
              <div className="px-4 py-2 bg-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  {group}
                </p>
              </div>

              {/* Group Items */}
              {notifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`
                    px-4 py-3 border-b border-white/5 transition-all
                    ${!notif.read ? 'bg-ruby/5 hover:bg-ruby/10' : 'hover:bg-white/5'}
                  `}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="text-2xl shrink-0 mt-0.5">
                      {notif.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium leading-snug">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatTimeAgo(notif.timestamp)}
                      </p>

                      {/* Action Buttons */}
                      {notif.actionData && (
                        <div className="flex gap-2 mt-2">
                          {notif.actionData.type?.includes("wishlist") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUndo(notif);
                              }}
                              className="text-xs font-bold text-ruby hover:underline"
                            >
                              Undo
                            </button>
                          )}
                          {notif.actionData.gameSlug && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(notif);
                              }}
                              className="text-xs font-bold text-slate-400 hover:text-white hover:underline"
                            >
                              View
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notif.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Unread Indicator */}
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-ruby shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-white/10 bg-white/5">
          <button
            onClick={handleClearAll}
            className="w-full text-xs font-bold text-slate-400 hover:text-red-400 uppercase tracking-wider transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}