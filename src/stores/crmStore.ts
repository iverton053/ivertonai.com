import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Contact, Deal, Activity, CRMAnalytics, CRMInsights, CRMStats } from '../types/crm';
import { crmService } from '../services/crmService';

interface CRMStore {
  // State
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  analytics: CRMAnalytics | null;
  insights: CRMInsights | null;
  stats: CRMStats | null;
  selectedContact: Contact | null;
  selectedDeal: Deal | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  contactFilters: {
    status?: string;
    source?: string;
    search?: string;
  };
  dealFilters: {
    stage?: string;
    assigned_to?: string;
  };

  // Actions
  loadContacts: () => Promise<void>;
  loadDeals: () => Promise<void>;
  loadActivities: () => Promise<void>;
  loadAnalytics: () => Promise<void>;
  loadInsights: () => Promise<void>;
  loadStats: () => Promise<void>;
  
  createContact: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  
  createDeal: (deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
  updateDealStage: (id: string, stage: Deal['stage']) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  
  createActivity: (activity: Omit<Activity, 'id' | 'created_at'>) => Promise<void>;
  completeActivity: (id: string) => Promise<void>;
  
  setSelectedContact: (contact: Contact | null) => void;
  setSelectedDeal: (deal: Deal | null) => void;
  setContactFilters: (filters: Partial<CRMStore['contactFilters']>) => void;
  setDealFilters: (filters: Partial<CRMStore['dealFilters']>) => void;
  clearError: () => void;
  
  // Real-time updates
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
}

export const useCRMStore = create<CRMStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    contacts: [],
    deals: [],
    activities: [],
    analytics: null,
    insights: null,
    stats: null,
    selectedContact: null,
    selectedDeal: null,
    isLoading: false,
    error: null,
    contactFilters: {},
    dealFilters: {},

    // Load data actions
    loadContacts: async () => {
      set({ isLoading: true, error: null });
      try {
        const contacts = await crmService.getContacts(get().contactFilters);
        set({ contacts, isLoading: false });
      } catch (error) {
        set({ error: 'Failed to load contacts', isLoading: false });
        console.error('Error loading contacts:', error);
      }
    },

    loadDeals: async () => {
      set({ isLoading: true, error: null });
      try {
        const deals = await crmService.getDeals(get().dealFilters);
        set({ deals, isLoading: false });
      } catch (error) {
        set({ error: 'Failed to load deals', isLoading: false });
        console.error('Error loading deals:', error);
      }
    },

    loadActivities: async () => {
      set({ isLoading: true, error: null });
      try {
        const activities = await crmService.getActivities();
        set({ activities, isLoading: false });
      } catch (error) {
        set({ error: 'Failed to load activities', isLoading: false });
        console.error('Error loading activities:', error);
      }
    },

    loadAnalytics: async () => {
      try {
        const analytics = await crmService.getCRMAnalytics();
        set({ analytics });
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    },

    loadInsights: async () => {
      try {
        const insights = await crmService.getCRMInsights();
        set({ insights });
      } catch (error) {
        console.error('Error loading insights:', error);
      }
    },

    loadStats: async () => {
      try {
        const stats = await crmService.getCRMStats();
        set({ stats });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    },

    // Contact actions
    createContact: async (contactData) => {
      set({ isLoading: true, error: null });
      try {
        const contact = await crmService.createContact(contactData);
        set(state => ({
          contacts: [contact, ...state.contacts],
          isLoading: false
        }));
      } catch (error) {
        set({ error: 'Failed to create contact', isLoading: false });
        throw error;
      }
    },

    updateContact: async (id, updates) => {
      set({ isLoading: true, error: null });
      try {
        const updatedContact = await crmService.updateContact(id, updates);
        set(state => ({
          contacts: state.contacts.map(c => c.id === id ? updatedContact : c),
          selectedContact: state.selectedContact?.id === id ? updatedContact : state.selectedContact,
          isLoading: false
        }));
      } catch (error) {
        set({ error: 'Failed to update contact', isLoading: false });
        throw error;
      }
    },

    deleteContact: async (id) => {
      set({ isLoading: true, error: null });
      try {
        // In a real app, you'd call crmService.deleteContact(id)
        set(state => ({
          contacts: state.contacts.filter(c => c.id !== id),
          selectedContact: state.selectedContact?.id === id ? null : state.selectedContact,
          isLoading: false
        }));
      } catch (error) {
        set({ error: 'Failed to delete contact', isLoading: false });
        throw error;
      }
    },

    // Deal actions
    createDeal: async (dealData) => {
      set({ isLoading: true, error: null });
      try {
        const deal = await crmService.createDeal(dealData);
        set(state => ({
          deals: [deal, ...state.deals],
          isLoading: false
        }));
      } catch (error) {
        set({ error: 'Failed to create deal', isLoading: false });
        throw error;
      }
    },

    updateDeal: async (id, updates) => {
      set({ isLoading: true, error: null });
      try {
        // In a real app, you'd call crmService.updateDeal(id, updates)
        set(state => ({
          deals: state.deals.map(d => d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d),
          selectedDeal: state.selectedDeal?.id === id ? { ...state.selectedDeal, ...updates } : state.selectedDeal,
          isLoading: false
        }));
      } catch (error) {
        set({ error: 'Failed to update deal', isLoading: false });
        throw error;
      }
    },

    updateDealStage: async (id, stage) => {
      set({ isLoading: true, error: null });
      try {
        const updatedDeal = await crmService.updateDealStage(id, stage);
        set(state => ({
          deals: state.deals.map(d => d.id === id ? updatedDeal : d),
          selectedDeal: state.selectedDeal?.id === id ? updatedDeal : state.selectedDeal,
          isLoading: false
        }));
      } catch (error) {
        set({ error: 'Failed to update deal stage', isLoading: false });
        throw error;
      }
    },

    deleteDeal: async (id) => {
      set({ isLoading: true, error: null });
      try {
        // In a real app, you'd call crmService.deleteDeal(id)
        set(state => ({
          deals: state.deals.filter(d => d.id !== id),
          selectedDeal: state.selectedDeal?.id === id ? null : state.selectedDeal,
          isLoading: false
        }));
      } catch (error) {
        set({ error: 'Failed to delete deal', isLoading: false });
        throw error;
      }
    },

    // Activity actions
    createActivity: async (activityData) => {
      set({ isLoading: true, error: null });
      try {
        const activity = await crmService.createActivity(activityData);
        set(state => ({
          activities: [activity, ...state.activities],
          isLoading: false
        }));
      } catch (error) {
        set({ error: 'Failed to create activity', isLoading: false });
        throw error;
      }
    },

    completeActivity: async (id) => {
      set({ isLoading: true, error: null });
      try {
        // In a real app, you'd call crmService.completeActivity(id)
        set(state => ({
          activities: state.activities.map(a => 
            a.id === id ? { ...a, completed: true, updated_at: new Date().toISOString() } : a
          ),
          isLoading: false
        }));
      } catch (error) {
        set({ error: 'Failed to complete activity', isLoading: false });
        throw error;
      }
    },

    // Selection actions
    setSelectedContact: (contact) => set({ selectedContact: contact }),
    setSelectedDeal: (deal) => set({ selectedDeal: deal }),

    // Filter actions
    setContactFilters: (filters) => {
      set(state => ({ contactFilters: { ...state.contactFilters, ...filters } }));
      get().loadContacts();
    },

    setDealFilters: (filters) => {
      set(state => ({ dealFilters: { ...state.dealFilters, ...filters } }));
      get().loadDeals();
    },

    clearError: () => set({ error: null }),

    // Real-time updates
    startRealTimeUpdates: () => {
      // In a real app, you'd set up WebSocket connections or database subscriptions
      const interval = setInterval(() => {
        get().loadStats();
        get().loadInsights();
      }, 30000); // Update every 30 seconds

      // Store interval ID for cleanup
      (window as any).crmUpdateInterval = interval;
    },

    stopRealTimeUpdates: () => {
      if ((window as any).crmUpdateInterval) {
        clearInterval((window as any).crmUpdateInterval);
        delete (window as any).crmUpdateInterval;
      }
    }
  }))
);

// Auto-load initial data when store is first used
useCRMStore.subscribe(
  (state) => state.contacts.length === 0 && !state.isLoading,
  (shouldLoad) => {
    if (shouldLoad) {
      const store = useCRMStore.getState();
      store.loadContacts();
      store.loadDeals();
      store.loadActivities();
      store.loadAnalytics();
      store.loadInsights();
      store.loadStats();
      store.startRealTimeUpdates();
    }
  },
  { fireImmediately: true }
);