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

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToastContext } from '@/components/providers/ToastProvider';

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef(null);

useEffect(() => {
  // ✅ NEW: Early cleanup when user logs out
  if (!user?.id) {
    console.log('⚠️ No user, skipping realtime');
    setUnreadCount(0);
    
    // ✅ Cleanup channel when user logs out
    if (channelRef.current) {
      console.log('🧹 User logged out - cleaning up channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    return; // ✅ Exit early
  }

  console.log('🚀 Setting up realtime for user:', user.id);

  // Cleanup any existing channel first
  if (channelRef.current) {
    console.log('🧹 Cleaning up old channel');
    supabase.removeChannel(channelRef.current);
    channelRef.current = null;
  }

  // Fetch initial count
  fetchUnreadCount();

  console.log('📡 Setting up realtime channel for user:', user.id);

  const channel = supabase.channel(`user-notifications-${user.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('🔔 NEW NOTIFICATION RECEIVED:', payload.new);
        
        fetchUnreadCount();
        window.dispatchEvent(new Event('notificationsChanged'));
        
        const notification = payload.new;
        showToast(notification.message, 'info', {
          icon: notification.icon || '🔔',
          duration: 5000
        });
        
        console.log('✅ Notification processed');
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
      () => {
        console.log('📝 Notification updated');
        fetchUnreadCount();
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
      () => {
        console.log('🗑️ Notification deleted');
        fetchUnreadCount();
        window.dispatchEvent(new Event('notificationsChanged'));
      }
    )
    .subscribe((status, err) => {
      console.log('📡 Channel status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ REALTIME CONNECTED');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ CHANNEL ERROR:', err);
      } else if (status === 'TIMED_OUT') {
        console.error('❌ TIMED OUT');
      }
    });

  channelRef.current = channel;

  // Cleanup on unmount
  return () => {
    console.log('🔌 Unmounting - cleaning up channel');
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };
}, [user?.id]); // Keep this dependency

  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const { count, error } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      
      console.log('📊 Unread count:', count || 0);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('❌ Error fetching count:', error);
    }
  };

  return { unreadCount };
}