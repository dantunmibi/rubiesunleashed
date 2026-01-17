/**
 * ================================================================
 * NOTIFICATION PANEL - Hybrid Notification System
 * ================================================================
 * 
 * Features:
 * - Merges localStorage (project events) + Database (user-targeted)
 * - Cross-device sync for database notifications
 * - Grouped by date (Today, Yesterday, Earlier)
 * - Unread indicators
 * - Action buttons based on notification type
 * ================================================================
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, CheckCheck, Loader2 } from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  formatTimeAgo
} from "@/lib/notificationManager";
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import {
  fetchDatabaseNotifications,
  markDatabaseNotificationRead,
  markAllDatabaseNotificationsRead,
  deleteDatabaseNotification,
  clearAllDatabaseNotifications
} from "@/lib/databaseNotifications";
import { useToastContext } from "@/components/providers/ToastProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToastContext();
  const { user } = useAuth();
  const [confirmClear, setConfirmClear] = useState(false);

  // ✅ NEW: Enable realtime updates
  useRealtimeNotifications();

  // Helper to check recency
  const isRecent = (timestamp) => {
    return (Date.now() - timestamp) < 5000; // 5 seconds
  };

  useEffect(() => {
    if (confirmClear) {
      const timer = setTimeout(() => setConfirmClear(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmClear]);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  useEffect(() => {
    // Refresh UI every 3s to update "Time Ago"
    const interval = setInterval(() => {
      setNotifications(prev => [...prev]); // Force re-render
    }, 3000);
    return () => clearInterval(interval);
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
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    
    try {
      // Get localStorage notifications (project lifecycle events)
      const localNotifs = getNotifications();
      
      // Get database notifications (user-targeted)
      const dbNotifs = user ? await fetchDatabaseNotifications(user.id) : [];
      
      // Merge and sort by timestamp
      const merged = [...dbNotifs, ...localNotifs].sort((a, b) => b.timestamp - a.timestamp);
      
      setNotifications(merged);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification) => {
    if (notification.source === 'database') {
      await markDatabaseNotificationRead(notification.id);
    } else {
      markAsRead(notification.id);
    }
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    // Mark localStorage notifications as read
    markAllAsRead();
    
    // Mark database notifications as read
    if (user) {
      await markAllDatabaseNotificationsRead(user.id);
    }
    
    loadNotifications();
  };

  const handleDelete = async (notification) => {
    if (notification.source === 'database') {
      await deleteDatabaseNotification(notification.id);
    } else {
      deleteNotification(notification.id);
    }
    loadNotifications();
  };

  const handleClearAll = async () => {
    if (confirmClear) {
      // Clear localStorage notifications
      clearAllNotifications();
      
      // Clear database notifications
      if (user) {
        await clearAllDatabaseNotifications(user.id);
      }
      
      loadNotifications();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  const performUndoAction = async (action, gameId) => {
    if (user) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ action, game_id: gameId })
        });
      }
    }
  };

  const handleUndo = async (notification) => {
    const { gameId, game } = notification.actionData;
    
    if (notification.actionData?.type === "wishlist_add") {
      await performUndoAction('remove', gameId);
      showToast("Removed from wishlist", "info");
    } else if (notification.actionData?.type === "wishlist_remove") {
      if (!user && !game) {
        showToast("Cannot undo: Missing game data", "error");
        return;
      }
      await performUndoAction('add', gameId);
      showToast("Added back to wishlist", "wishlist");
    }
    
    await handleDelete(notification);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const handleView = (notification) => {
    // ✅ Use action_url if available (database notifications)
    if (notification.actionData?.actionUrl) {
      router.push(notification.actionData.actionUrl);
      onClose();
      return;
    }
    
    // Legacy routing for localStorage notifications
    if (notification.actionData?.projectId) {
      const { projectId, type, status } = notification.actionData;
      
      if (status === 'draft' || type === 'project_created' || type === 'project_updated') {
        router.push(`/${user?.username}/dashboard/project/${projectId}`);
      } else if (status === 'published' && notification.actionData?.projectSlug) {
        router.push(`/view/${notification.actionData.projectSlug}`);
      } else if (type === 'project_deleted' || type === 'project_archived') {
        router.push(`/${user?.username}/dashboard`);
      } else {
        router.push(`/${user?.username}/dashboard/project/${projectId}`);
      }
      onClose();
    } else if (notification.actionData?.gameSlug) {
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <Loader2 size={32} className="animate-spin text-ruby mb-3" />
            <p className="text-sm text-slate-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
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
                    px-4 py-3 border-b border-white/5 transition-all cursor-pointer
                    ${!notif.read ? 'bg-ruby/5 hover:bg-ruby/10' : 'hover:bg-white/5'}
                  `}
                  onClick={() => !notif.read && handleMarkAsRead(notif)}
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
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-500">
                          {formatTimeAgo(notif.timestamp)}
                        </p>
                        {/* Database notification indicator */}
                        {notif.source === 'database' && (
                          <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                            Synced
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {notif.actionData && (
                        <div className="flex gap-2 mt-2">
                          {/* Wishlist undo */}
                          {isRecent(notif.timestamp) && notif.actionData?.type?.includes("wishlist") && (
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
                          
                          {/* View button */}
                          {(notif.actionData.gameSlug || notif.actionData.projectSlug || notif.actionData.projectId || notif.actionData.actionUrl) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(notif);
                              }}
                              className="text-xs font-bold text-slate-400 hover:text-white hover:underline"
                            >
                              {notif.actionData.type === 'project_deleted' ? 'Dashboard' : 'View'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notif);
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
        <div className="px-4 py-3">
          <button
            onClick={handleClearAll}
            className={`
              group w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border transition-all duration-300
              ${confirmClear 
                ? "bg-red-500/10 border-red-500/50 text-red-400" 
                : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            <Trash2 size={14} className={confirmClear ? "animate-pulse" : "group-hover:text-red-400 transition-colors"} />
            <span className="text-xs font-black uppercase tracking-widest transition-colors">
              {confirmClear ? "Confirm Clear?" : "Clear All"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}