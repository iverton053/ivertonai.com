// Advanced Notification System - Main Exports

// Core Components
export { default as AdvancedNotificationCenter } from './AdvancedNotificationCenter';
export { default as EnhancedNotificationBell } from './EnhancedNotificationBell';
export { default as SmartToastSystem } from './SmartToastSystem';
export { default as NotificationSettings } from './NotificationSettings';

// Service and Types
export { default as advancedNotificationService } from '../../services/advancedNotificationService';
export * from '../../types/advancedNotifications';

// Hooks for React Integration
import { useState, useEffect, useCallback } from 'react';
import advancedNotificationService from '../../services/advancedNotificationService';
import {
  AdvancedNotification,
  NotificationMetrics,
  NotificationPreferences,
  NotificationFilter,
  NotificationSearchResult
} from '../../types/advancedNotifications';

/**
 * Hook for managing notification state in React components
 */
export const useAdvancedNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<AdvancedNotification[]>([]);
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async (filter?: NotificationFilter) => {
    setLoading(true);
    try {
      const result = await advancedNotificationService.searchNotifications(
        { userId, ...filter },
        1,
        50
      );
      setNotifications(result.notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadMetrics = useCallback(() => {
    const metricsData = advancedNotificationService.getMetrics(userId);
    setMetrics(metricsData);
  }, [userId]);

  const createNotification = useCallback(async (notification: Partial<AdvancedNotification>) => {
    try {
      const created = await advancedNotificationService.createNotification({
        ...notification,
        userId
      });
      await loadNotifications();
      loadMetrics();
      return created;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }, [userId, loadNotifications, loadMetrics]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await advancedNotificationService.markAsRead(notificationId, userId);
      await loadNotifications();
      loadMetrics();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [userId, loadNotifications, loadMetrics]);

  const acknowledge = useCallback(async (notificationId: string) => {
    try {
      await advancedNotificationService.acknowledge(notificationId, userId);
      await loadNotifications();
      loadMetrics();
    } catch (error) {
      console.error('Failed to acknowledge notification:', error);
    }
  }, [userId, loadNotifications, loadMetrics]);

  const dismiss = useCallback(async (notificationId: string) => {
    try {
      await advancedNotificationService.dismiss(notificationId, userId);
      await loadNotifications();
      loadMetrics();
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  }, [userId, loadNotifications, loadMetrics]);

  const clearAll = useCallback(async () => {
    try {
      await advancedNotificationService.clearAll(userId);
      await loadNotifications();
      loadMetrics();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  }, [userId, loadNotifications, loadMetrics]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadMetrics();

      // Set up real-time updates
      const handleNotificationEvent = () => {
        loadNotifications();
        loadMetrics();
      };

      advancedNotificationService.on('notification:created', handleNotificationEvent);
      advancedNotificationService.on('notification:read', handleNotificationEvent);
      advancedNotificationService.on('notification:acknowledged', handleNotificationEvent);
      advancedNotificationService.on('notification:dismissed', handleNotificationEvent);

      return () => {
        advancedNotificationService.off('notification:created', handleNotificationEvent);
        advancedNotificationService.off('notification:read', handleNotificationEvent);
        advancedNotificationService.off('notification:acknowledged', handleNotificationEvent);
        advancedNotificationService.off('notification:dismissed', handleNotificationEvent);
      };
    }
  }, [userId, loadNotifications, loadMetrics]);

  return {
    notifications,
    metrics,
    loading,
    actions: {
      loadNotifications,
      loadMetrics,
      createNotification,
      markAsRead,
      acknowledge,
      dismiss,
      clearAll
    }
  };
};

/**
 * Hook for managing notification preferences
 */
export const useNotificationPreferences = (userId: string) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const prefs = advancedNotificationService.getUserPreferences(userId);
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    setLoading(true);
    try {
      const updated = await advancedNotificationService.updateUserPreferences(userId, updates);
      setPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadPreferences();
    }
  }, [userId, loadPreferences]);

  return {
    preferences,
    loading,
    actions: {
      loadPreferences,
      updatePreferences
    }
  };
};

/**
 * Hook for real-time notification count
 */
export const useNotificationCount = (userId: string) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (userId) {
      const updateCount = () => {
        const unreadCount = advancedNotificationService.getUnreadCount(userId);
        setCount(unreadCount);
      };

      updateCount();

      const handleNotificationEvent = () => {
        updateCount();
      };

      advancedNotificationService.on('notification:created', handleNotificationEvent);
      advancedNotificationService.on('notification:read', handleNotificationEvent);
      advancedNotificationService.on('notification:dismissed', handleNotificationEvent);

      return () => {
        advancedNotificationService.off('notification:created', handleNotificationEvent);
        advancedNotificationService.off('notification:read', handleNotificationEvent);
        advancedNotificationService.off('notification:dismissed', handleNotificationEvent);
      };
    }
  }, [userId]);

  return count;
};

/**
 * Utility functions for common notification operations
 */
export const NotificationUtils = {
  /**
   * Create a system notification
   */
  createSystemNotification: async (userId: string, title: string, message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    return advancedNotificationService.createNotification({
      userId,
      type: 'system',
      priority,
      title,
      message,
      channels: ['toast', 'panel'],
      source: 'system'
    });
  },

  /**
   * Create a security alert
   */
  createSecurityAlert: async (userId: string, title: string, message: string, actions?: any[]) => {
    return advancedNotificationService.createNotification({
      userId,
      type: 'security',
      priority: 'critical',
      title,
      message,
      channels: ['toast', 'panel', 'desktop'],
      source: 'security',
      actions,
      persistent: true
    });
  },

  /**
   * Create a success notification
   */
  createSuccessNotification: async (userId: string, title: string, message: string) => {
    return advancedNotificationService.createNotification({
      userId,
      type: 'success',
      priority: 'low',
      title,
      message,
      channels: ['toast'],
      source: 'system',
      autoHide: true,
      autoHideDuration: 3000
    });
  },

  /**
   * Create an error notification
   */
  createErrorNotification: async (userId: string, title: string, message: string, actions?: any[]) => {
    return advancedNotificationService.createNotification({
      userId,
      type: 'error',
      priority: 'high',
      title,
      message,
      channels: ['toast', 'panel'],
      source: 'system',
      actions,
      persistent: true
    });
  },

  /**
   * Create a platform health alert
   */
  createPlatformAlert: async (userId: string, platform: string, status: 'down' | 'degraded' | 'recovering', message: string) => {
    const priority = status === 'down' ? 'critical' : status === 'degraded' ? 'high' : 'medium';
    const title = `${platform} ${status === 'down' ? 'Outage' : status === 'degraded' ? 'Issues' : 'Recovery'}`;

    return advancedNotificationService.createNotification({
      userId,
      type: 'platform',
      priority,
      title,
      message,
      channels: ['toast', 'panel'],
      source: 'platform-monitor',
      tags: [platform, status],
      data: { platform, status }
    });
  },

  /**
   * Create a batch notification
   */
  createBatchNotification: async (userId: string, notifications: AdvancedNotification[]) => {
    const types = [...new Set(notifications.map(n => n.type))];
    const title = types.length === 1 ? `${notifications.length} ${types[0]} notifications` : `${notifications.length} notifications`;
    const message = `You have ${notifications.length} new notifications`;

    return advancedNotificationService.createNotification({
      userId,
      type: 'info',
      priority: 'medium',
      title,
      message,
      channels: ['panel'],
      source: 'batch-processor',
      childIds: notifications.map(n => n.id),
      data: { batchedNotifications: notifications }
    });
  }
};

/**
 * Integration helpers for existing dashboard components
 */
export const NotificationIntegration = {
  /**
   * Initialize notification system for a user
   */
  initialize: async (userId: string) => {
    // Load user preferences
    const preferences = advancedNotificationService.getUserPreferences(userId);
    
    // Request desktop notification permission if enabled
    if (preferences?.channels.desktop?.enabled && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Start any necessary background processes
    console.log(`Notification system initialized for user: ${userId}`);
  },

  /**
   * Integrate with existing TopHeader component
   */
  enhanceTopHeader: (userId: string) => {
    return {
      NotificationBell: EnhancedNotificationBell,
      props: {
        userId,
        showBadge: true,
        showQuickPreview: true,
        soundEnabled: true,
        size: 'md' as const,
        theme: 'dark' as const
      }
    };
  },

  /**
   * Integrate with existing dashboard
   */
  enhanceDashboard: (userId: string) => {
    return {
      ToastSystem: SmartToastSystem,
      toastProps: {
        userId,
        position: 'top-right' as const,
        maxVisible: 5,
        defaultDuration: 5000,
        enableGrouping: true,
        enableSmartBatching: true,
        theme: 'dark' as const
      }
    };
  },

  /**
   * Create notification provider for React context
   */
  createProvider: () => {
    const NotificationContext = React.createContext<{
      service: typeof advancedNotificationService;
      createNotification: (notification: Partial<AdvancedNotification>) => Promise<AdvancedNotification>;
      utils: typeof NotificationUtils;
    } | null>(null);

    const NotificationProvider: React.FC<{ children: React.ReactNode; userId: string }> = ({ children, userId }) => {
      const createNotification = useCallback(async (notification: Partial<AdvancedNotification>) => {
        return advancedNotificationService.createNotification({
          ...notification,
          userId
        });
      }, [userId]);

      return (
        <NotificationContext.Provider value={{
          service: advancedNotificationService,
          createNotification,
          utils: NotificationUtils
        }}>
          {children}
        </NotificationContext.Provider>
      );
    };

    const useNotificationContext = () => {
      const context = React.useContext(NotificationContext);
      if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
      }
      return context;
    };

    return { NotificationProvider, useNotificationContext };
  }
};

// Default export for convenience
export default {
  service: advancedNotificationService,
  components: {
    AdvancedNotificationCenter,
    EnhancedNotificationBell,
    SmartToastSystem,
    NotificationSettings
  },
  hooks: {
    useAdvancedNotifications,
    useNotificationPreferences,
    useNotificationCount
  },
  utils: NotificationUtils,
  integration: NotificationIntegration
};