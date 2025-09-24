// Client Portal Store - State management for client portal system

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  ClientPortal,
  ClientPortalUser,
  ClientPortalActivity,
  ClientPortalAnalytics,
  ClientPortalTemplate,
  AgencyWhiteLabelSettings,
  ClientPortalDashboardData,
  PortalWidgetType,
  ClientPortalListResponse
} from '../types/clientPortal';
import { ClientPortalService } from '../services/clientPortalService';

interface ClientPortalState {
  // Portal Management State
  portals: ClientPortal[];
  selectedPortal: ClientPortal | null;
  portalUsers: Record<string, ClientPortalUser[]>; // portalId -> users
  portalActivities: Record<string, ClientPortalActivity[]>;
  portalAnalytics: Record<string, ClientPortalAnalytics[]>;
  
  // Templates & Settings
  portalTemplates: ClientPortalTemplate[];
  whiteLabelSettings: AgencyWhiteLabelSettings | null;
  
  // Current Portal State (for client-side portal view)
  currentPortalDashboard: ClientPortalDashboardData | null;
  currentPortalUser: ClientPortalUser | null;
  
  // UI State
  isLoading: boolean;
  isCreatingPortal: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPortals: number;
  hasMore: boolean;

  // Actions - Portal Management
  loadPortals: (page?: number, limit?: number) => Promise<void>;
  createPortal: (clientId: string, config: Partial<ClientPortal>) => Promise<boolean>;
  updatePortal: (portalId: string, updates: Partial<ClientPortal>) => Promise<boolean>;
  deletePortal: (portalId: string) => Promise<boolean>;
  setSelectedPortal: (portal: ClientPortal | null) => void;
  
  // Actions - Portal Users
  loadPortalUsers: (portalId: string) => Promise<void>;
  invitePortalUser: (portalId: string, userData: {
    email: string;
    full_name: string;
    role: 'owner' | 'manager' | 'viewer';
    title?: string;
  }) => Promise<boolean>;
  
  // Actions - Templates & Settings
  loadPortalTemplates: () => Promise<void>;
  loadWhiteLabelSettings: () => Promise<void>;
  updateWhiteLabelSettings: (settings: Partial<AgencyWhiteLabelSettings>) => Promise<boolean>;
  
  // Actions - Client Portal View
  authenticateWithEmailLink: (token: string) => Promise<boolean>;
  authenticateWithPassword: (email: string, password: string, subdomain?: string) => Promise<boolean>;
  loadPortalDashboard: (portalId: string) => Promise<void>;
  signOutPortalUser: () => void;
  
  // Actions - Analytics
  loadPortalAnalytics: (portalId: string, startDate: string, endDate: string) => Promise<void>;
  
  // Utility Actions
  clearError: () => void;
  resetState: () => void;
  
  // Computed Properties
  getPortalBySubdomain: (subdomain: string) => ClientPortal | null;
  getPortalUsers: (portalId: string) => ClientPortalUser[];
  getActivePortals: () => ClientPortal[];
  canManagePortal: (portalId: string) => boolean;
}

export const useClientPortalStore = create<ClientPortalState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    portals: [],
    selectedPortal: null,
    portalUsers: {},
    portalActivities: {},
    portalAnalytics: {},
    portalTemplates: [],
    whiteLabelSettings: null,
    currentPortalDashboard: null,
    currentPortalUser: null,
    isLoading: false,
    isCreatingPortal: false,
    error: null,
    currentPage: 1,
    totalPortals: 0,
    hasMore: false,

    // Portal Management Actions
    loadPortals: async (page = 1, limit = 20) => {
      set({ isLoading: true, error: null });
      
      try {
        const response: ClientPortalListResponse = await ClientPortalService.getPortals(page, limit);
        
        const { portals, portalTemplates } = get();
        
        set({
          portals: page === 1 ? response.portals : [...portals, ...response.portals],
          currentPage: page,
          totalPortals: response.total,
          hasMore: response.portals.length === limit,
          isLoading: false,
          error: null
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load portals',
          isLoading: false
        });
      }
    },

    createPortal: async (clientId, config) => {
      set({ isCreatingPortal: true, error: null });
      
      try {
        const result = await ClientPortalService.createPortal(clientId, config);
        
        if (!result.success) {
          set({ error: result.error || 'Failed to create portal', isCreatingPortal: false });
          return false;
        }

        // Add new portal to the list
        if (result.portal) {
          set(state => ({
            portals: [result.portal!, ...state.portals],
            totalPortals: state.totalPortals + 1,
            selectedPortal: result.portal!,
            isCreatingPortal: false,
            error: null
          }));
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create portal';
        set({ error: errorMessage, isCreatingPortal: false });
        return false;
      }
    },

    updatePortal: async (portalId, updates) => {
      set({ error: null });
      
      try {
        const result = await ClientPortalService.updatePortal(portalId, updates);
        
        if (!result.success) {
          set({ error: result.error || 'Failed to update portal' });
          return false;
        }

        // Update portal in the list
        if (result.portal) {
          set(state => ({
            portals: state.portals.map(p => 
              p.id === portalId ? { ...p, ...result.portal! } : p
            ),
            selectedPortal: state.selectedPortal?.id === portalId 
              ? { ...state.selectedPortal, ...result.portal! } 
              : state.selectedPortal,
            error: null
          }));
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update portal';
        set({ error: errorMessage });
        return false;
      }
    },

    deletePortal: async (portalId) => {
      set({ error: null });
      
      try {
        const result = await ClientPortalService.deletePortal(portalId);
        
        if (!result.success) {
          set({ error: result.error || 'Failed to delete portal' });
          return false;
        }

        // Remove portal from the list
        set(state => ({
          portals: state.portals.filter(p => p.id !== portalId),
          totalPortals: state.totalPortals - 1,
          selectedPortal: state.selectedPortal?.id === portalId ? null : state.selectedPortal,
          portalUsers: Object.fromEntries(
            Object.entries(state.portalUsers).filter(([id]) => id !== portalId)
          ),
          error: null
        }));

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete portal';
        set({ error: errorMessage });
        return false;
      }
    },

    setSelectedPortal: (portal) => {
      set({ selectedPortal: portal });
      
      // Load portal users if not already loaded
      if (portal && !get().portalUsers[portal.id]) {
        get().loadPortalUsers(portal.id);
      }
    },

    // Portal Users Actions
    loadPortalUsers: async (portalId) => {
      try {
        const result = await ClientPortalService.getPortalUsers(portalId);
        
        if (result.success && result.users) {
          set(state => ({
            portalUsers: {
              ...state.portalUsers,
              [portalId]: result.users!
            }
          }));
        }
      } catch (error) {
        console.warn('Failed to load portal users:', error);
      }
    },

    invitePortalUser: async (portalId, userData) => {
      set({ error: null });
      
      try {
        const result = await ClientPortalService.invitePortalUser(portalId, userData);
        
        if (!result.success) {
          set({ error: result.error || 'Failed to invite user' });
          return false;
        }

        // Add new user to the list
        if (result.user) {
          set(state => ({
            portalUsers: {
              ...state.portalUsers,
              [portalId]: [...(state.portalUsers[portalId] || []), result.user!]
            },
            error: null
          }));
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to invite user';
        set({ error: errorMessage });
        return false;
      }
    },

    // Templates & Settings Actions
    loadPortalTemplates: async () => {
      try {
        const result = await ClientPortalService.getPortalTemplates();
        
        if (result.success && result.templates) {
          set({ portalTemplates: result.templates });
        }
      } catch (error) {
        console.warn('Failed to load portal templates:', error);
      }
    },

    loadWhiteLabelSettings: async () => {
      try {
        const result = await ClientPortalService.getWhiteLabelSettings();
        
        if (result.success && result.settings) {
          set({ whiteLabelSettings: result.settings });
        }
      } catch (error) {
        console.warn('Failed to load white label settings:', error);
      }
    },

    updateWhiteLabelSettings: async (settings) => {
      set({ error: null });
      
      try {
        const result = await ClientPortalService.updateWhiteLabelSettings(settings);
        
        if (!result.success) {
          set({ error: result.error || 'Failed to update settings' });
          return false;
        }

        if (result.settings) {
          set({ whiteLabelSettings: result.settings, error: null });
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
        set({ error: errorMessage });
        return false;
      }
    },

    // Client Portal View Actions
    authenticateWithEmailLink: async (token) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await ClientPortalService.authenticateWithEmailLink(token);
        
        if (!result.success) {
          set({ error: result.error || 'Authentication failed', isLoading: false });
          return false;
        }

        set({
          currentPortalUser: result.user || null,
          isLoading: false,
          error: null
        });

        // Load dashboard data if we have a portal
        if (result.portal?.id) {
          get().loadPortalDashboard(result.portal.id);
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    authenticateWithPassword: async (email, password, subdomain) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await ClientPortalService.authenticateWithPassword(email, password, subdomain);
        
        if (!result.success) {
          set({ error: result.error || 'Authentication failed', isLoading: false });
          return false;
        }

        set({
          currentPortalUser: result.user || null,
          isLoading: false,
          error: null
        });

        // Load dashboard data if we have a portal
        if (result.portal?.id) {
          get().loadPortalDashboard(result.portal.id);
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    loadPortalDashboard: async (portalId) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await ClientPortalService.getPortalDashboard(portalId);
        
        if (result.success && result.data) {
          set({
            currentPortalDashboard: result.data,
            isLoading: false,
            error: null
          });
        } else {
          set({ 
            error: result.error || 'Failed to load dashboard',
            isLoading: false 
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard';
        set({ error: errorMessage, isLoading: false });
      }
    },

    signOutPortalUser: () => {
      // Clear client portal authentication
      localStorage.removeItem('client_portal_token');
      localStorage.removeItem('client_portal_user');
      
      set({
        currentPortalUser: null,
        currentPortalDashboard: null,
        error: null
      });
    },

    // Analytics Actions
    loadPortalAnalytics: async (portalId, startDate, endDate) => {
      try {
        const result = await ClientPortalService.getPortalAnalytics(portalId, startDate, endDate);
        
        if (result.success && result.analytics) {
          set(state => ({
            portalAnalytics: {
              ...state.portalAnalytics,
              [portalId]: result.analytics!
            }
          }));
        }
      } catch (error) {
        console.warn('Failed to load portal analytics:', error);
      }
    },

    // Utility Actions
    clearError: () => {
      set({ error: null });
    },

    resetState: () => {
      set({
        portals: [],
        selectedPortal: null,
        portalUsers: {},
        portalActivities: {},
        portalAnalytics: {},
        currentPortalDashboard: null,
        currentPortalUser: null,
        isLoading: false,
        isCreatingPortal: false,
        error: null,
        currentPage: 1,
        totalPortals: 0,
        hasMore: false
      });
    },

    // Computed Properties
    getPortalBySubdomain: (subdomain) => {
      const { portals } = get();
      return portals.find(p => p.subdomain === subdomain) || null;
    },

    getPortalUsers: (portalId) => {
      const { portalUsers } = get();
      return portalUsers[portalId] || [];
    },

    getActivePortals: () => {
      const { portals } = get();
      return portals.filter(p => p.is_active);
    },

    canManagePortal: (portalId) => {
      // This would check user permissions in a real implementation
      // For now, assume all agency users can manage portals
      return true;
    }
  }))
);

// Utility functions for client portal subdomain routing
export const getPortalSubdomainFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Check if this is a subdomain (e.g., client.youragency.com)
  if (parts.length > 2) {
    return parts[0];
  }
  
  return null;
};

export const getPortalFromCurrentUrl = () => {
  const subdomain = getPortalSubdomainFromUrl();
  if (!subdomain) return null;
  
  const store = useClientPortalStore.getState();
  return store.getPortalBySubdomain(subdomain);
};

// Auto-load initial data when store is created
if (typeof window !== 'undefined') {
  const store = useClientPortalStore.getState();
  
  // Load portal templates on app start
  store.loadPortalTemplates();
  
  // Load white label settings
  store.loadWhiteLabelSettings();
  
  // Check if we're on a client portal subdomain
  const subdomain = getPortalSubdomainFromUrl();
  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    // This is a client portal, try to authenticate from stored token
    const token = localStorage.getItem('client_portal_token');
    if (token) {
      // Try to restore client portal session
      store.authenticateWithEmailLink(token);
    }
  } else {
    // This is the main agency dashboard, load portals
    const agencyToken = localStorage.getItem('iverton_agency_token');
    if (agencyToken) {
      store.loadPortals();
    }
  }
}