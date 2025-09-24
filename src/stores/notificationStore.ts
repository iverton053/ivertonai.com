import { create } from 'zustand';
import { AppNotification, NotificationPreferences } from '../types/notifications';
import { notificationService } from '../services/notificationService';

interface NotificationStore {
  // State
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  preferences: NotificationPreferences;
  
  // Panel state
  isPanelOpen: boolean;
  selectedFilter: 'all' | 'unread' | 'security' | 'backup' | 'system';
  
  // Actions
  loadNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  clearByType: (type: AppNotification['type']) => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  
  // Panel actions
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setFilter: (filter: NotificationStore['selectedFilter']) => void;
  
  // Computed getters
  getFilteredNotifications: () => AppNotification[];
  getUnreadNotifications: () => AppNotification[];
  getNotificationsByType: (type: AppNotification['type']) => AppNotification[];
}

export const useNotificationStore = create<NotificationStore>((set, get) => {
  // Subscribe to notification service updates
  let unsubscribe: (() => void) | null = null;

  const store: NotificationStore = {
    // Initial state
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    preferences: notificationService.getPreferences(),
    isPanelOpen: false,
    selectedFilter: 'all',

    // Actions
    loadNotifications: () => {
      set({ isLoading: true });
      
      // Unsubscribe from previous subscription if it exists
      if (unsubscribe) {
        unsubscribe();
      }
      
      // Subscribe to notification service updates
      unsubscribe = notificationService.subscribe((notifications) => {
        set({
          notifications,
          unreadCount: notifications.filter(n => !n.read).length,
          isLoading: false,
        });
      });
    },

    markAsRead: (id: string) => {
      notificationService.markAsRead(id);
    },

    markAllAsRead: () => {
      notificationService.markAllAsRead();
    },

    removeNotification: (id: string) => {
      notificationService.remove(id);
    },

    clearAll: () => {
      notificationService.clear();
    },

    clearByType: (type: AppNotification['type']) => {
      notificationService.clearByType(type);
    },

    updatePreferences: (newPreferences: Partial<NotificationPreferences>) => {
      notificationService.updatePreferences(newPreferences);
      set({ preferences: notificationService.getPreferences() });
    },

    // Panel actions
    togglePanel: () => {
      set((state) => ({ isPanelOpen: !state.isPanelOpen }));
    },

    openPanel: () => {
      set({ isPanelOpen: true });
    },

    closePanel: () => {
      set({ isPanelOpen: false });
    },

    setFilter: (filter: NotificationStore['selectedFilter']) => {
      set({ selectedFilter: filter });
    },

    // Computed getters
    getFilteredNotifications: () => {
      const { notifications, selectedFilter } = get();
      
      switch (selectedFilter) {
        case 'unread':
          return notifications.filter(n => !n.read);
        case 'security':
          return notifications.filter(n => n.type === 'security');
        case 'backup':
          return notifications.filter(n => n.type === 'backup');
        case 'system':
          return notifications.filter(n => n.type === 'system' || n.type === 'info');
        case 'all':
        default:
          return notifications;
      }
    },

    getUnreadNotifications: () => {
      const { notifications } = get();
      return notifications.filter(n => !n.read);
    },

    getNotificationsByType: (type: AppNotification['type']) => {
      const { notifications } = get();
      return notifications.filter(n => n.type === type);
    },
  };

  return store;
});

// Initialize the store when the module loads
const initializeStore = () => {
  const store = useNotificationStore.getState();
  store.loadNotifications();
};

// Auto-initialize
setTimeout(initializeStore, 0);

// Cleanup function (called when the app unmounts)
export const cleanupNotificationStore = () => {
  // This would be called in app cleanup if needed
  const store = useNotificationStore.getState();
  if (store.notifications.length > 0) {
    // Could save any pending state here
  }
};