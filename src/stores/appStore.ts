import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AppState, StorageKeys } from '../types';
import { storage } from '../services/storage';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  autoClose?: boolean;
  duration?: number;
}

interface AppStore extends AppState {
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveSection: (section: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setAddWidgetModalOpen: (open: boolean) => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  getUnreadCount: () => number;
  
  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
  updateLastSaved: () => void;
  
  // Utility
  reset: () => void;
}

const initialState: AppState = {
  isLoading: false,
  error: null,
  activeSection: 'overview',
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  addWidgetModalOpen: false,
  notifications: [],
  lastSaved: undefined,
};

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Loading and Error
    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    setError: (error: string | null) => {
      set({ error });
      
      // Auto-add error notification
      if (error) {
        get().addNotification({
          type: 'error',
          title: 'Error',
          message: error,
          autoClose: false,
        });
      }
    },

    // Navigation
    setActiveSection: (activeSection: string) => {
      set({ activeSection });
      get().saveToStorage();
    },

    // Sidebar
    toggleSidebar: () => {
      const { sidebarCollapsed } = get();
      set({ sidebarCollapsed: !sidebarCollapsed });
      get().saveToStorage();
    },

    setSidebarCollapsed: (sidebarCollapsed: boolean) => {
      set({ sidebarCollapsed });
      get().saveToStorage();
    },

    // Modals
    setCommandPaletteOpen: (commandPaletteOpen: boolean) => {
      set({ commandPaletteOpen });
    },

    setAddWidgetModalOpen: (addWidgetModalOpen: boolean) => {
      set({ addWidgetModalOpen });
    },

    // Notifications
    addNotification: (notification) => {
      const newNotification: Notification = {
        id: `notification_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        read: false,
        autoClose: true,
        duration: 5000,
        ...notification,
      };

      const { notifications } = get();
      const updatedNotifications = [newNotification, ...notifications];
      
      // Keep only the latest 50 notifications
      const trimmedNotifications = updatedNotifications.slice(0, 50);
      
      set({ notifications: trimmedNotifications });
      get().saveToStorage();

      // Auto-remove if specified
      if (newNotification.autoClose && newNotification.duration) {
        setTimeout(() => {
          get().removeNotification(newNotification.id);
        }, newNotification.duration);
      }
    },

    removeNotification: (id: string) => {
      const { notifications } = get();
      const filtered = notifications.filter(n => n.id !== id);
      set({ notifications: filtered });
      get().saveToStorage();
    },

    markNotificationRead: (id: string) => {
      const { notifications } = get();
      const updated = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      set({ notifications: updated });
      get().saveToStorage();
    },

    markAllNotificationsRead: () => {
      const { notifications } = get();
      const updated = notifications.map(n => ({ ...n, read: true }));
      set({ notifications: updated });
      get().saveToStorage();
    },

    clearNotifications: () => {
      set({ notifications: [] });
      get().saveToStorage();
    },

    getUnreadCount: () => {
      const { notifications } = get();
      return notifications.filter(n => !n.read).length;
    },

    // Persistence
    loadFromStorage: () => {
      try {
        const savedState = storage.get<Partial<AppState>>(StorageKeys.APP_STATE);
        
        if (savedState) {
          const validatedState = {
            ...initialState,
            ...savedState,
            // Don't persist modal states and loading states
            commandPaletteOpen: false,
            addWidgetModalOpen: false,
            isLoading: false,
            error: null,
          };

          set(validatedState);
        }
      } catch (error) {
        console.error('Failed to load app state:', error);
        get().setError('Failed to load application state');
      }
    },

    saveToStorage: () => {
      const state = get();
      const {
        // Exclude functions and non-persistable state
        setLoading,
        setError,
        setActiveSection,
        toggleSidebar,
        setSidebarCollapsed,
        setCommandPaletteOpen,
        setAddWidgetModalOpen,
        addNotification,
        removeNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        getUnreadCount,
        loadFromStorage,
        saveToStorage,
        updateLastSaved,
        reset,
        // Don't persist modal states
        commandPaletteOpen,
        addWidgetModalOpen,
        isLoading,
        error,
        ...persistableState
      } = state;

      const success = storage.set(StorageKeys.APP_STATE, {
        ...persistableState,
        lastSaved: Date.now(),
      });

      if (!success) {
        console.error('Failed to save app state');
      }
    },

    updateLastSaved: () => {
      set({ lastSaved: Date.now() });
    },

    reset: () => {
      set(initialState);
      storage.remove(StorageKeys.APP_STATE);
    },
  }))
);

// Auto-save on relevant state changes
useAppStore.subscribe(
  (state) => ({
    activeSection: state.activeSection,
    sidebarCollapsed: state.sidebarCollapsed,
    notifications: state.notifications,
  }),
  () => {
    useAppStore.getState().saveToStorage();
  },
  { fireImmediately: false }
);

// Load state on store creation
useAppStore.getState().loadFromStorage();