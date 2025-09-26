import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  client_portal_id: string;
  user_id?: string;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error' | 'update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  expires_at?: string;
  created_at: string;
}

interface UseRealTimeNotificationsOptions {
  portalId: string;
  userId?: string;
  maxNotifications?: number;
}

export const useRealTimeNotifications = ({
  portalId,
  userId,
  maxNotifications = 50
}: UseRealTimeNotificationsOptions) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial notifications
  useEffect(() => {
    loadNotifications();
  }, [portalId, userId]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`portal-notifications-${portalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portal_notifications',
          filter: `client_portal_id=eq.${portalId}${userId ? ` and user_id=eq.${userId}` : ''}`
        },
        (payload) => {
          handleRealTimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time notifications subscription active');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [portalId, userId]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('portal_notifications')
        .select('*')
        .eq('client_portal_id', portalId)
        .order('created_at', { ascending: false })
        .limit(maxNotifications);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const validNotifications = (data || []).filter(notification => {
        // Filter out expired notifications
        if (notification.expires_at && new Date(notification.expires_at) < new Date()) {
          return false;
        }
        return true;
      });

      setNotifications(validNotifications);
      setUnreadCount(validNotifications.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealTimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        // Add new notification
        if (newRecord && (!newRecord.expires_at || new Date(newRecord.expires_at) > new Date())) {
          setNotifications(prev => {
            const updated = [newRecord, ...prev].slice(0, maxNotifications);
            return updated;
          });

          if (!newRecord.is_read) {
            setUnreadCount(prev => prev + 1);
          }

          // Show browser notification for high/urgent priority
          if (['high', 'urgent'].includes(newRecord.priority) && 'Notification' in window) {
            showBrowserNotification(newRecord);
          }
        }
        break;

      case 'UPDATE':
        // Update existing notification
        if (newRecord) {
          setNotifications(prev =>
            prev.map(notification =>
              notification.id === newRecord.id ? newRecord : notification
            )
          );

          // Update unread count if read status changed
          if (oldRecord && oldRecord.is_read !== newRecord.is_read) {
            setUnreadCount(prev => newRecord.is_read ? prev - 1 : prev + 1);
          }
        }
        break;

      case 'DELETE':
        // Remove deleted notification
        if (oldRecord) {
          setNotifications(prev =>
            prev.filter(notification => notification.id !== oldRecord.id)
          );

          if (!oldRecord.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
        break;
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.action_url) {
          window.location.href = notification.action_url;
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-urgent notifications
      if (notification.priority !== 'urgent') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('portal_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      let query = supabase
        .from('portal_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('client_portal_id', portalId)
        .eq('is_read', false);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: notification.read_at || new Date().toISOString()
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('portal_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Local state will be updated via real-time subscription
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  };

  const requestBrowserNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  const createNotification = async (notificationData: {
    title: string;
    message: string;
    notification_type?: 'info' | 'success' | 'warning' | 'error' | 'update';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    action_url?: string;
    action_label?: string;
    metadata?: Record<string, any>;
    expires_at?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('portal_notifications')
        .insert({
          client_portal_id: portalId,
          user_id: userId,
          ...notificationData,
          notification_type: notificationData.notification_type || 'info',
          priority: notificationData.priority || 'medium'
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    createNotification,
    requestBrowserNotificationPermission,
    refresh: loadNotifications
  };
};