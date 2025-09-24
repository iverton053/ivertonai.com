import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { storage } from '../services/storage';
import { ValidationUtils } from '../utils/validation';

// Settings interfaces
export interface ProfileSettings {
  displayName: string;
  email: string;
  company: string;
  avatar: string;
  timezone: string;
  locale: string;
  bio: string;
  jobTitle: string;
}

export interface DashboardPreferences {
  theme: 'dark' | 'light' | 'auto';
  accentColor: string;
  layout: 'grid' | 'masonry' | 'list';
  animationsEnabled: boolean;
  compactMode: boolean;
  sidebarCollapsed: boolean;
  defaultWidgets: string[];
  widgetRefreshInterval: number;
  autoSave: boolean;
  showTooltips: boolean;
  gridSize: number;
  maxWidgetsPerRow: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  desktopNotifications: boolean;
  soundEnabled: boolean;
  notificationTypes: {
    alerts: boolean;
    updates: boolean;
    reminders: boolean;
    system: boolean;
    marketing: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

export interface PrivacySettings {
  dataSharing: boolean;
  analyticsTracking: boolean;
  errorReporting: boolean;
  profileVisibility: 'public' | 'private' | 'team';
  activityLogging: boolean;
  sessionTimeout: number;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  dataRetention: number; // in days
  cookieConsent: boolean;
}

export interface ApplicationSettings {
  dataRetentionDays: number;
  maxCacheSize: number;
  enableDebugMode: boolean;
  performanceMode: 'balanced' | 'performance' | 'battery';
  autoUpdates: boolean;
  betaFeatures: boolean;
  backgroundSync: boolean;
  offlineMode: boolean;
  compressionEnabled: boolean;
  maxFileSize: number;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  allowNewUsers: boolean;
  maxUsersPerOrg: number;
  systemHealthAlerts: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly';
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  rateLimiting: boolean;
  apiVersion: string;
  securityLevel: 'basic' | 'standard' | 'high';
  // Company Branding (Admin-only)
  companyName: string;
  companyLogo: string;
  companyDomain: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  loginPageMessage: string;
  customFooter: string;
  whiteLabel: boolean;
  customFavicon: string;
  companyAddress: string;
  companyPhone: string;
  supportEmail: string;
}

export interface SettingsPreset {
  id: string;
  name: string;
  description: string;
  userType: 'admin' | 'manager' | 'user';
  settings: Partial<AllSettings>;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsHistory {
  id: string;
  timestamp: string;
  changes: Array<{
    section: string;
    key: string;
    oldValue: any;
    newValue: any;
  }>;
  user: string;
  reason?: string;
}

export interface AllSettings {
  profile: ProfileSettings;
  dashboard: DashboardPreferences;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  application: ApplicationSettings;
  system: SystemSettings;
}

interface SettingsState {
  settings: AllSettings;
  presets: SettingsPreset[];
  history: SettingsHistory[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  activeTab: string;
  hasUnsavedChanges: boolean;
  lastSaved: string | null;
  
  // Actions
  updateSettings: <T extends keyof AllSettings>(section: T, updates: Partial<AllSettings[T]>) => void;
  resetSettings: (section?: keyof AllSettings) => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<boolean>;
  savePreset: (name: string, description: string, userType: 'admin' | 'manager' | 'user') => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: string) => void;
  validateSettings: () => { isValid: boolean; errors: Record<string, string[]> };
  saveSettings: () => Promise<boolean>;
  loadSettings: () => Promise<void>;
  getFilteredSettings: () => AllSettings;
  undoLastChange: () => void;
}

// Default settings
const defaultSettings: AllSettings = {
  profile: {
    displayName: 'User',
    email: '',
    company: '',
    avatar: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: navigator.language || 'en-US',
    bio: '',
    jobTitle: '',
  },
  dashboard: {
    theme: 'dark',
    accentColor: '#8B5CF6',
    layout: 'grid',
    animationsEnabled: true,
    compactMode: false,
    sidebarCollapsed: false,
    defaultWidgets: ['overview', 'analytics', 'tasks'],
    widgetRefreshInterval: 30000, // 30 seconds
    autoSave: true,
    showTooltips: true,
    gridSize: 4,
    maxWidgetsPerRow: 4,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: true,
    soundEnabled: true,
    notificationTypes: {
      alerts: true,
      updates: true,
      reminders: true,
      system: true,
      marketing: false,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    frequency: 'realtime',
  },
  privacy: {
    dataSharing: false,
    analyticsTracking: true,
    errorReporting: true,
    profileVisibility: 'private',
    activityLogging: true,
    sessionTimeout: 3600, // 1 hour
    twoFactorAuth: false,
    loginAlerts: true,
    dataRetention: 90,
    cookieConsent: true,
  },
  application: {
    dataRetentionDays: 90,
    maxCacheSize: 100, // MB
    enableDebugMode: false,
    performanceMode: 'balanced',
    autoUpdates: true,
    betaFeatures: false,
    backgroundSync: true,
    offlineMode: false,
    compressionEnabled: true,
    maxFileSize: 10, // MB
  },
  system: {
    maintenanceMode: false,
    allowNewUsers: true,
    maxUsersPerOrg: 100,
    systemHealthAlerts: true,
    backupFrequency: 'daily',
    logLevel: 'info',
    rateLimiting: true,
    apiVersion: '1.0',
    securityLevel: 'standard',
    // Company Branding defaults
    companyName: 'Iverton Dashboard',
    companyLogo: '',
    companyDomain: 'iverton.com',
    brandPrimaryColor: '#8B5CF6',
    brandSecondaryColor: '#06B6D4',
    loginPageMessage: 'Welcome to your dashboard',
    customFooter: '',
    whiteLabel: false,
    customFavicon: '',
    companyAddress: '',
    companyPhone: '',
    supportEmail: 'support@iverton.com',
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    subscribeWithSelector((set, get) => ({
    settings: { ...defaultSettings },
    presets: [],
    history: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    activeTab: 'profile',
    hasUnsavedChanges: false,
    lastSaved: null,

    updateSettings: (section, updates) => {
      const currentSettings = get().settings;
      const oldValues = { ...currentSettings[section] };
      const newValues = { ...oldValues, ...updates };
      
      // Create history entry
      const changes = Object.keys(updates).map(key => ({
        section,
        key,
        oldValue: oldValues[key as keyof typeof oldValues],
        newValue: newValues[key as keyof typeof newValues],
      }));

      const historyEntry: SettingsHistory = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        changes,
        user: currentSettings.profile.displayName || 'User',
      };

      set({
        settings: {
          ...currentSettings,
          [section]: newValues,
        },
        history: [historyEntry, ...get().history.slice(0, 49)], // Keep last 50 changes
        hasUnsavedChanges: true,
      });

      // Auto-save if enabled
      if (currentSettings.dashboard.autoSave) {
        setTimeout(() => get().saveSettings(), 1000);
      }
    },

    resetSettings: (section) => {
      const currentSettings = get().settings;
      
      if (section) {
        set({
          settings: {
            ...currentSettings,
            [section]: { ...defaultSettings[section] },
          },
          hasUnsavedChanges: true,
        });
      } else {
        set({
          settings: { ...defaultSettings },
          hasUnsavedChanges: true,
        });
      }
    },

    exportSettings: () => {
      const exportData = {
        settings: get().settings,
        presets: get().presets,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };
      return JSON.stringify(exportData, null, 2);
    },

    importSettings: async (settingsJson) => {
      try {
        const importData = JSON.parse(settingsJson);
        
        // Validate import data structure
        if (!importData.settings || !importData.version) {
          throw new Error('Invalid settings file format');
        }

        // Merge with current settings to avoid breaking the app
        const currentSettings = get().settings;
        const mergedSettings: AllSettings = {
          profile: { ...currentSettings.profile, ...importData.settings.profile },
          dashboard: { ...currentSettings.dashboard, ...importData.settings.dashboard },
          notifications: { ...currentSettings.notifications, ...importData.settings.notifications },
          privacy: { ...currentSettings.privacy, ...importData.settings.privacy },
          application: { ...currentSettings.application, ...importData.settings.application },
          system: { ...currentSettings.system, ...importData.settings.system },
        };

        set({
          settings: mergedSettings,
          presets: importData.presets || [],
          hasUnsavedChanges: true,
          error: null,
        });

        await get().saveSettings();
        return true;
      } catch (error) {
        console.error('Import settings error:', error);
        set({ error: 'Failed to import settings. Please check the file format.' });
        return false;
      }
    },

    savePreset: (name, description, userType) => {
      const preset: SettingsPreset = {
        id: crypto.randomUUID(),
        name,
        description,
        userType,
        settings: { ...get().settings },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set({
        presets: [...get().presets, preset],
      });

      // Save presets to storage
      storage.set('settings_presets', get().presets);
    },

    loadPreset: (presetId) => {
      const preset = get().presets.find(p => p.id === presetId);
      if (preset) {
        set({
          settings: { ...get().settings, ...preset.settings },
          hasUnsavedChanges: true,
        });
      }
    },

    deletePreset: (presetId) => {
      const updatedPresets = get().presets.filter(p => p.id !== presetId);
      set({ presets: updatedPresets });
      storage.set('settings_presets', updatedPresets);
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
    },

    validateSettings: () => {
      const settings = get().settings;
      const errors: Record<string, string[]> = {};

      // Profile validation
      if (!settings.profile.displayName.trim()) {
        errors.profile = errors.profile || [];
        errors.profile.push('Display name is required');
      }

      // Dashboard validation
      if (settings.dashboard.widgetRefreshInterval < 5000) {
        errors.dashboard = errors.dashboard || [];
        errors.dashboard.push('Widget refresh interval must be at least 5 seconds');
      }

      if (settings.dashboard.gridSize < 1 || settings.dashboard.gridSize > 12) {
        errors.dashboard = errors.dashboard || [];
        errors.dashboard.push('Grid size must be between 1 and 12');
      }

      // Privacy validation
      if (settings.privacy.sessionTimeout < 300) {
        errors.privacy = errors.privacy || [];
        errors.privacy.push('Session timeout must be at least 5 minutes');
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },

    saveSettings: async () => {
      const { isValid, errors } = get().validateSettings();
      
      if (!isValid) {
        set({ error: 'Settings validation failed: ' + Object.values(errors).flat().join(', ') });
        return false;
      }

      try {
        set({ isLoading: true, error: null });
        
        const settings = get().settings;
        storage.set('user_settings', settings);
        storage.set('settings_history', get().history);
        
        set({
          isLoading: false,
          hasUnsavedChanges: false,
          lastSaved: new Date().toISOString(),
        });

        return true;
      } catch (error) {
        console.error('Save settings error:', error);
        set({
          isLoading: false,
          error: 'Failed to save settings',
        });
        return false;
      }
    },

    loadSettings: async () => {
      try {
        set({ isLoading: true, error: null });
        
        const savedSettings = storage.get('user_settings');
        const savedHistory = storage.get('settings_history') || [];
        const savedPresets = storage.get('settings_presets') || [];
        
        if (savedSettings) {
          // Merge with defaults to ensure all properties exist
          const mergedSettings: AllSettings = {
            profile: { ...defaultSettings.profile, ...savedSettings.profile },
            dashboard: { ...defaultSettings.dashboard, ...savedSettings.dashboard },
            notifications: { ...defaultSettings.notifications, ...savedSettings.notifications },
            privacy: { ...defaultSettings.privacy, ...savedSettings.privacy },
            application: { ...defaultSettings.application, ...savedSettings.application },
            system: { ...defaultSettings.system, ...savedSettings.system },
          };

          set({
            settings: mergedSettings,
            history: savedHistory,
            presets: savedPresets,
            isLoading: false,
            lastSaved: storage.get('settings_last_saved'),
          });
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('Load settings error:', error);
        set({
          isLoading: false,
          error: 'Failed to load settings',
        });
      }
    },

    getFilteredSettings: () => {
      const { settings, searchQuery } = get();
      
      if (!searchQuery.trim()) {
        return settings;
      }

      const query = searchQuery.toLowerCase();
      const filteredSettings: AllSettings = { ...settings };

      // Simple search implementation - in a real app you might want more sophisticated filtering
      Object.keys(filteredSettings).forEach(sectionKey => {
        const section = filteredSettings[sectionKey as keyof AllSettings];
        const filteredSection: any = {};
        
        Object.keys(section).forEach(key => {
          if (key.toLowerCase().includes(query) || 
              String(section[key as keyof typeof section]).toLowerCase().includes(query)) {
            filteredSection[key] = section[key as keyof typeof section];
          }
        });
        
        (filteredSettings as any)[sectionKey] = filteredSection;
      });

      return filteredSettings;
    },

    undoLastChange: () => {
      const history = get().history;
      if (history.length === 0) return;

      const lastChange = history[0];
      const currentSettings = { ...get().settings };

      // Revert the changes
      lastChange.changes.forEach(change => {
        const section = currentSettings[change.section as keyof AllSettings];
        if (section) {
          (section as any)[change.key] = change.oldValue;
        }
      });

      set({
        settings: currentSettings,
        history: history.slice(1),
        hasUnsavedChanges: true,
      });
    },
  })),
  {
    name: 'iverton-settings-storage',
    version: 1,
  }
));

// Initialize settings on app start
if (typeof window !== 'undefined') {
  useSettingsStore.getState().loadSettings();
}