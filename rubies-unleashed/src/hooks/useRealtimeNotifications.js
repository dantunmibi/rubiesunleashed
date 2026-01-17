/**
 * ================================================================
 * REALTIME NOTIFICATIONS HOOK
 * ================================================================
 * 
 * Purpose:
 * - Subscribe to real-time notification updates via Supabase
 * - Auto-update UI when new notifications arrive
 * - Show toast for new admin comments
 * 
 * Usage:
 * const { unreadCount } = useRealtimeNotifications();
 * ================================================================
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToastContext } from '@/components/providers/ToastProvider';

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Initial unread count fetch
    fetchUnreadCount();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 New notification received:', payload.new);
          
          // Update unread count
          fetchUnreadCount();
          
          // Trigger UI refresh
          window.dispatchEvent(new Event('notificationsChanged'));
          
          // Show toast for new notification
          const notification = payload.new;
          showToast(notification.message, 'info', {
            icon: notification.icon || '🔔',
            duration: 5000
          });
          
          // Play notification sound (optional)
          playNotificationSound();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📝 Notification updated:', payload.new);
          
          // Update unread count
          fetchUnreadCount();
          
          // Trigger UI refresh
          window.dispatchEvent(new Event('notificationsChanged'));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🗑️ Notification deleted:', payload.old);
          
          // Update unread count
          fetchUnreadCount();
          
          // Trigger UI refresh
          window.dispatchEvent(new Event('notificationsChanged'));
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Unsubscribing from notifications');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const playNotificationSound = () => {
    // Optional: Play a subtle notification sound
    // Uncomment if you want audio notifications
    /*
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(err => console.log('Audio play failed:', err));
    */
  };

  return { unreadCount };
}