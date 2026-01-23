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
  // ✅ Early cleanup when user logs out
  if (!user?.id) {
    console.log('⚠️ No user, skipping notifications');
    setUnreadCount(0);
    
    // ✅ Cleanup polling interval when user logs out
    if (channelRef.current) {
      console.log('🧹 User logged out - cleaning up polling');
      clearInterval(channelRef.current);
      channelRef.current = null;
    }
    
    return;
  }

  console.log('🚀 Setting up notification polling for user:', user.id);

  // Cleanup any existing interval first
  if (channelRef.current) {
    console.log('🧹 Cleaning up old polling interval');
    clearInterval(channelRef.current);
    channelRef.current = null;
  }

  // Fetch initial count immediately
  fetchUnreadCount();

  // ✅ NEW: Poll for updates every 15 seconds (Realtime alternative)
  console.log('⏰ Starting notification polling (15s interval)');
  const pollInterval = setInterval(() => {
    console.log('🔄 Polling for notification updates...');
    fetchUnreadCount();
    window.dispatchEvent(new Event('notificationsChanged'));
  }, 15000); // 15 seconds - good balance between responsiveness and API load

  // Store interval ID for cleanup
  channelRef.current = pollInterval;

  // Cleanup on unmount
  return () => {
    console.log('🔌 Unmounting - cleaning up polling interval');
    if (channelRef.current) {
      clearInterval(channelRef.current);
      channelRef.current = null;
    }
  };
}, [user?.id]);

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