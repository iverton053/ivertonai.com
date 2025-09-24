import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { UserData, StorageKeys } from '../types';
import { storage } from '../services/storage';

interface UserStore {
  // State
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: UserData) => void;
  updateUser: (updates: Partial<UserData>) => void;
  updateMetrics: (metrics: Partial<UserData['metrics']>) => void;
  updatePreferences: (preferences: Partial<UserData['preferences']>) => void;
  clearUser: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  
  // Computed
  getDisplayName: () => string;
  hasMetrics: () => boolean;
}

export const useUserStore = create<UserStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    isLoading: false,
    error: null,

    // Actions
    setUser: (user: UserData) => {
      set({ user, error: null });
      get().saveToStorage();
    },

    updateUser: (updates: Partial<UserData>) => {
      const currentUser = get().user;
      if (!currentUser) return;

      const updatedUser: UserData = {
        ...currentUser,
        ...updates,
        updatedAt: Date.now(),
      };

      set({ user: updatedUser, error: null });
      get().saveToStorage();
    },

    updateMetrics: (metrics: Partial<UserData['metrics']>) => {
      const currentUser = get().user;
      if (!currentUser) return;

      const updatedUser: UserData = {
        ...currentUser,
        metrics: { ...currentUser.metrics, ...metrics },
        updatedAt: Date.now(),
      };

      set({ user: updatedUser });
      get().saveToStorage();
    },

    updatePreferences: (preferences: Partial<UserData['preferences']>) => {
      const currentUser = get().user;
      if (!currentUser) return;

      const updatedUser: UserData = {
        ...currentUser,
        preferences: { ...currentUser.preferences, ...preferences },
        updatedAt: Date.now(),
      };

      set({ user: updatedUser });
      get().saveToStorage();
    },

    clearUser: () => {
      set({ user: null, error: null });
      storage.remove(StorageKeys.USER_DATA);
    },

    loadFromStorage: () => {
      set({ isLoading: true, error: null });
      
      try {
        const savedUser = storage.get<UserData>(StorageKeys.USER_DATA);
        
        if (savedUser) {
          // Validate the loaded data structure
          const now = Date.now();
          const validatedUser: UserData = {
            id: savedUser.id || `user_${now}`,
            username: savedUser.username || 'User',
            client_name: savedUser.client_name,
            company: savedUser.company,
            email: savedUser.email,
            avatar: savedUser.avatar,
            preferences: {
              theme: 'dark',
              language: 'en',
              timezone: 'UTC',
              notifications: true,
              autoSave: true,
              ...savedUser.preferences,
            },
            metrics: {
              active_automations: 0,
              success_rate: 0,
              completed_today: 0,
              time_saved: 0,
              ...savedUser.metrics,
            },
            available_categories: savedUser.available_categories || [],
            widgets: savedUser.widgets || [],
            lastLogin: savedUser.lastLogin,
            createdAt: savedUser.createdAt || now,
            updatedAt: savedUser.updatedAt || now,
          };

          set({ user: validatedUser, isLoading: false });
        } else {
          // Create default user
          const defaultUser: UserData = {
            id: `user_${Date.now()}`,
            username: 'Premium User',
            client_name: 'John Smith',
            company: 'TechCorp Solutions',
            preferences: {
              theme: 'dark',
              language: 'en',
              timezone: 'UTC',
              notifications: true,
              autoSave: true,
            },
            metrics: {
              active_automations: 12,
              success_rate: 94.7,
              completed_today: 47,
              time_saved: 12.4,
            },
            available_categories: [
              'SEO Audit',
              'Content Generation',
              'Social Media Analytics',
              'Email Campaigns',
              'Performance Monitoring'
            ],
            widgets: [
              'Performance Analytics',
              'Traffic Monitor',
              'Workflow Status',
              'Success Metrics',
              'Task Completion'
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          set({ user: defaultUser, isLoading: false });
          get().saveToStorage();
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        set({ 
          error: 'Failed to load user data', 
          isLoading: false 
        });
      }
    },

    saveToStorage: () => {
      const { user } = get();
      if (user) {
        const success = storage.set(StorageKeys.USER_DATA, user);
        if (!success) {
          set({ error: 'Failed to save user data' });
        }
      }
    },

    // Computed values
    getDisplayName: () => {
      const { user } = get();
      if (!user) return 'User';
      return user.client_name || user.username || 'User';
    },

    hasMetrics: () => {
      const { user } = get();
      return !!(user?.metrics && Object.keys(user.metrics).length > 0);
    },
  }))
);

// Auto-save on user changes
useUserStore.subscribe(
  (state) => state.user,
  (user) => {
    if (user) {
      storage.set(StorageKeys.USER_DATA, user);
    }
  },
  { fireImmediately: false }
);

// Load user data on store creation
useUserStore.getState().loadFromStorage();