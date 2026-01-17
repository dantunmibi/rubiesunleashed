/**
 * ================================================================
 * DATABASE NOTIFICATIONS - Server-Side Notification Helpers
 * ================================================================
 * 
 * Purpose:
 * - Fetch notifications from Supabase database
 * - Mark notifications as read/acknowledged
 * - Delete notifications
 * - Cross-device sync support
 * 
 * Usage:
 * const notifications = await fetchDatabaseNotifications(userId);
 * await markDatabaseNotificationRead(notificationId);
 * ================================================================
 */

import { supabase } from './supabase';

/**
 * Fetch all notifications for a user
 */
export async function fetchDatabaseNotifications(userId) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to recent 50 notifications

    if (error) throw error;

    // Transform to match localStorage format for compatibility
    return (data || []).map(notif => ({
      id: notif.id,
      type: notif.type,
      message: notif.message,
      icon: notif.icon,
      timestamp: new Date(notif.created_at).getTime(),
      read: notif.read,
      actionData: {
        ...notif.metadata,
        actionUrl: notif.action_url,
        actorId: notif.actor_id
      },
      source: 'database' // ✅ Tag for UI differentiation
    }));
  } catch (error) {
    console.error('Error fetching database notifications:', error);
    return [];
  }
}

/**
 * Get unread count from database
 */
export async function getDatabaseUnreadCount(userId) {
  if (!userId) return 0;

  try {
    const { count, error } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markDatabaseNotificationRead(notificationId) {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ 
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllDatabaseNotificationsRead(userId) {
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ 
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * Delete notification
 */
export async function deleteDatabaseNotification(notificationId) {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

/**
 * Clear all notifications for a user
 */
export async function clearAllDatabaseNotifications(userId) {
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    return false;
  }
}

/**
 * Acknowledge notification (mark as acknowledged)
 */
export async function acknowledgeDatabaseNotification(notificationId) {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ 
        acknowledged: true,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error acknowledging notification:', error);
    return false;
  }
}