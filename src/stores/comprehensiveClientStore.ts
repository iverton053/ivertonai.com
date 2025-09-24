// Comprehensive Client Store for Multi-Client Dashboard Management
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ComprehensiveClient, ClientTemplate, ClientOnboarding, OnboardingStep } from '../types/comprehensiveClient';

interface ComprehensiveClientState {
  // Client Data
  clients: ComprehensiveClient[];
  selectedClientId: string | null;
  selectedClient: ComprehensiveClient | null;
  archivedClients: ComprehensiveClient[];
  recentClients: string[]; // client IDs in order of recent access
  
  // Templates and Onboarding
  clientTemplates: ClientTemplate[];
  onboardingData: Record<string, ClientOnboarding>;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  showAddClientModal: boolean;
  showOnboardingWizard: boolean;
  showEditClientModal: boolean;
  editingClientId: string | null;
  unsavedChanges: boolean;
  
  // Search and Filter
  searchQuery: string;
  statusFilter: ComprehensiveClient['status'] | 'all';
  industryFilter: string;
  
  // Client Management Actions
  loadClients: () => Promise<void>;
  addClient: (clientData: Partial<ComprehensiveClient>) => Promise<boolean>;
  updateClient: (clientId: string, updates: Partial<ComprehensiveClient>) => Promise<boolean>;
  deleteClient: (clientId: string) => Promise<boolean>;
  archiveClient: (clientId: string) => Promise<boolean>;
  restoreClient: (clientId: string) => Promise<boolean>;
  duplicateClient: (clientId: string, newName?: string) => Promise<boolean>;
  
  // Edit Client Actions
  startEditingClient: (clientId: string) => void;
  finishEditingClient: () => void;
  cancelEditingClient: () => void;
  
  // Data Import/Export
  exportClientData: (clientId?: string) => string;
  exportAllClients: () => string;
  importClientData: (jsonData: string) => Promise<boolean>;
  
  // Search and Filter Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: ComprehensiveClient['status'] | 'all') => void;
  setIndustryFilter: (industry: string) => void;
  getFilteredClients: () => ComprehensiveClient[];
  
  // Recent Clients Management
  addToRecentClients: (clientId: string) => void;
  getRecentClients: () => ComprehensiveClient[];
  clearRecentClients: () => void;
  
  // Client Selection and Context Switching
  selectClient: (clientId: string | null) => void;
  switchToClient: (clientId: string) => Promise<void>;
  
  // Template Management
  loadClientTemplates: () => void;
  createClientFromTemplate: (templateId: string, clientName: string) => Promise<boolean>;
  saveAsTemplate: (clientId: string, templateName: string) => Promise<boolean>;
  
  // Onboarding Management
  startOnboarding: (clientId: string) => void;
  completeOnboardingStep: (clientId: string, stepId: string, data: any) => void;
  finishOnboarding: (clientId: string) => void;
  
  // Data Management
  updateClientData: (clientId: string, dataType: string, data: any) => void;
  bulkUpdateClients: (updates: Record<string, Partial<ComprehensiveClient>>) => Promise<boolean>;
  
  // UI Actions
  setShowAddClientModal: (show: boolean) => void;
  setShowEditClientModal: (show: boolean) => void;
  setShowOnboardingWizard: (show: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  clearError: () => void;
  
  // Utility Functions
  getClientById: (id: string) => ComprehensiveClient | undefined;
  getActiveClients: () => ComprehensiveClient[];
  getClientsByStatus: (status: ComprehensiveClient['status']) => ComprehensiveClient[];
  getClientsByIndustry: (industry: string) => ComprehensiveClient[];
}

const STORAGE_KEY = 'comprehensive_clients_v1';
const ARCHIVED_STORAGE_KEY = 'archived_clients_v1';
const RECENT_CLIENTS_KEY = 'recent_clients_v1';
const TEMPLATES_STORAGE_KEY = 'client_templates_v1';
const ONBOARDING_STORAGE_KEY = 'client_onboarding_v1';

// Default client templates
const defaultTemplates: ClientTemplate[] = [
  {
    id: 'ecommerce-template',
    name: 'E-commerce Business',
    description: 'Perfect for online retailers and e-commerce stores',
    industry: 'E-commerce',
    default_services: ['SEO', 'PPC', 'Email Marketing', 'Social Media', 'Content Marketing'],
    default_widgets: ['revenue', 'traffic', 'conversions', 'social', 'email_campaigns'],
    default_goals: ['Increase online sales', 'Improve website traffic', 'Boost social engagement'],
    branding_template: {
      primary_color: '#007bff',
      secondary_color: '#6c757d',
      theme: 'light'
    },
    automation_templates: ['welcome_series', 'abandoned_cart', 'product_recommendations']
  },
  {
    id: 'saas-template',
    name: 'SaaS Company',
    description: 'Ideal for software as a service businesses',
    industry: 'Technology',
    default_services: ['Content Marketing', 'Lead Generation', 'Email Marketing', 'SEO'],
    default_widgets: ['mrr', 'churn_rate', 'leads', 'trial_conversions', 'feature_usage'],
    default_goals: ['Increase MRR', 'Reduce churn rate', 'Generate qualified leads'],
    branding_template: {
      primary_color: '#28a745',
      secondary_color: '#17a2b8',
      theme: 'dark'
    },
    automation_templates: ['trial_nurture', 'onboarding_sequence', 'feature_adoption']
  },
  {
    id: 'local-business-template',
    name: 'Local Business',
    description: 'Great for restaurants, salons, and local service providers',
    industry: 'Local Services',
    default_services: ['Local SEO', 'Google My Business', 'Social Media', 'Review Management'],
    default_widgets: ['local_rankings', 'reviews', 'social', 'phone_calls', 'directions'],
    default_goals: ['Improve local search rankings', 'Increase foot traffic', 'Boost online reviews'],
    branding_template: {
      primary_color: '#dc3545',
      secondary_color: '#fd7e14',
      theme: 'light'
    },
    automation_templates: ['review_requests', 'local_promotions', 'event_marketing']
  }
];

// Default onboarding steps
const createDefaultOnboarding = (clientId: string): ClientOnboarding => ({
  client_id: clientId,
  current_step: 0,
  started_at: new Date().toISOString(),
  completion_percentage: 0,
  steps: [
    {
      id: 'basic_info',
      title: 'Basic Information',
      description: 'Company details and contact information',
      required: true,
      completed: false,
      data_fields: ['name', 'company', 'website', 'industry', 'contact'],
      validation_rules: {
        name: { required: true, minLength: 2 },
        company: { required: true, minLength: 2 },
        website: { required: false, pattern: '^https?://' },
        'contact.primary_email': { required: true, email: true }
      }
    },
    {
      id: 'social_media',
      title: 'Social Media Setup',
      description: 'Connect your social media accounts',
      required: false,
      completed: false,
      data_fields: ['social_media'],
      validation_rules: {}
    },
    {
      id: 'business_details',
      title: 'Business Details',
      description: 'Services, goals, and target audience',
      required: true,
      completed: false,
      data_fields: ['business.services', 'business.goals', 'business.target_audience'],
      validation_rules: {
        'business.services': { required: true, minItems: 1 },
        'business.goals': { required: true, minItems: 1 }
      }
    },
    {
      id: 'dashboard_setup',
      title: 'Dashboard Configuration',
      description: 'Choose widgets and layout preferences',
      required: false,
      completed: false,
      data_fields: ['dashboard.enabled_widgets', 'dashboard.layout'],
      validation_rules: {}
    },
    {
      id: 'branding',
      title: 'Branding & Theme',
      description: 'Customize colors and branding',
      required: false,
      completed: false,
      data_fields: ['branding'],
      validation_rules: {}
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect external tools and platforms',
      required: false,
      completed: false,
      data_fields: ['automation.integrations', 'analytics'],
      validation_rules: {}
    }
  ]
});

export const useComprehensiveClientStore = create<ComprehensiveClientState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    clients: [],
    selectedClientId: null,
    selectedClient: null,
    archivedClients: [],
    recentClients: [],
    clientTemplates: defaultTemplates,
    onboardingData: {},
    isLoading: false,
    error: null,
    showAddClientModal: false,
    showOnboardingWizard: false,
    showEditClientModal: false,
    editingClientId: null,
    unsavedChanges: false,
    searchQuery: '',
    statusFilter: 'all',
    industryFilter: '',

    // Client Management Actions
    loadClients: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const clients: ComprehensiveClient[] = stored ? JSON.parse(stored) : [];
        
        const archivedStored = localStorage.getItem(ARCHIVED_STORAGE_KEY);
        const archivedClients: ComprehensiveClient[] = archivedStored ? JSON.parse(archivedStored) : [];
        
        const recentStored = localStorage.getItem(RECENT_CLIENTS_KEY);
        const recentClients: string[] = recentStored ? JSON.parse(recentStored) : [];
        
        set({ 
          clients,
          archivedClients,
          recentClients,
          isLoading: false 
        });

        // If no client is selected and we have clients, select the first active one
        const { selectedClientId } = get();
        if (!selectedClientId && clients.length > 0) {
          const firstActive = clients.find(c => c.status === 'active') || clients[0];
          get().selectClient(firstActive.id);
        }
      } catch (error) {
        console.error('Failed to load clients:', error);
        set({ 
          error: 'Failed to load clients',
          isLoading: false 
        });
      }
    },

    addClient: async (clientData) => {
      set({ error: null });
      
      try {
        const newClient: ComprehensiveClient = {
          id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          agency_id: 'current-agency',
          name: clientData.name || 'New Client',
          company: clientData.company || clientData.name || 'New Company',
          website: clientData.website || '',
          industry: clientData.industry || 'Other',
          company_size: clientData.company_size || 'small',
          contact: {
            primary_name: clientData.contact?.primary_name || '',
            primary_email: clientData.contact?.primary_email || '',
            primary_phone: clientData.contact?.primary_phone || '',
            address: {
              street: '',
              city: '',
              state: '',
              country: '',
              postal_code: ''
            },
            timezone: 'UTC'
          },
          business: {
            currency: 'USD',
            services: clientData.business?.services || [],
            goals: clientData.business?.goals || [],
            target_keywords: [],
            target_audience: '',
            competitors: []
          },
          social_media: {},
          crm: {
            leads: [],
            deals: [],
            contacts: [],
            pipeline_stages: ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
          },
          dashboard: {
            enabled_widgets: ['overview', 'traffic', 'social', 'leads'],
            widget_configurations: [],
            layout: 'grid',
            custom_dashboard: false
          },
          analytics: {
            traffic_data: [],
            conversion_data: [],
            performance_metrics: {
              revenue: { current_month: 0, previous_month: 0, growth_rate: 0, target: 0 },
              leads: { current_month: 0, previous_month: 0, growth_rate: 0, conversion_rate: 0 },
              social_engagement: { followers_growth: 0, engagement_rate: 0, reach: 0, impressions: 0 },
              website: { traffic_growth: 0, bounce_rate: 0, avg_session_duration: 0, page_load_speed: 0 }
            }
          },
          automation: {
            email_campaigns: [],
            social_posts: [],
            workflows: [],
            integrations: {}
          },
          notifications: {
            client_notifications: [],
            notification_preferences: {
              email_reports: true,
              sms_alerts: false,
              frequency: 'weekly'
            }
          },
          branding: {
            primary_color: '#007bff',
            secondary_color: '#6c757d',
            theme: 'light'
          },
          reporting: {
            frequency: 'monthly',
            custom_metrics: [],
            auto_send: false,
            recipients: []
          },
          status: 'onboarding',
          onboarding_completed: false,
          onboarding_step: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          access_count: 0,
          ...clientData
        };

        const { clients } = get();
        const updatedClients = [...clients, newClient];
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
        
        set({ clients: updatedClients });

        // Start onboarding for new client
        get().startOnboarding(newClient.id);
        
        return true;
      } catch (error) {
        console.error('Failed to add client:', error);
        set({ error: 'Failed to add client' });
        return false;
      }
    },

    updateClient: async (clientId, updates) => {
      set({ error: null });
      
      try {
        const { clients } = get();
        const updatedClients = clients.map(client =>
          client.id === clientId
            ? { 
                ...client, 
                ...updates, 
                updated_at: new Date().toISOString() 
              }
            : client
        );
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
        
        set({ clients: updatedClients });
        
        // Update selected client if it's the one being updated
        const { selectedClientId } = get();
        if (selectedClientId === clientId) {
          const updatedClient = updatedClients.find(c => c.id === clientId);
          set({ selectedClient: updatedClient || null });
        }
        
        return true;
      } catch (error) {
        console.error('Failed to update client:', error);
        set({ error: 'Failed to update client' });
        return false;
      }
    },

    deleteClient: async (clientId) => {
      set({ error: null });
      
      try {
        const { clients, selectedClientId } = get();
        const updatedClients = clients.filter(client => client.id !== clientId);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
        
        set({ clients: updatedClients });
        
        // If deleted client was selected, select another one
        if (selectedClientId === clientId) {
          const firstClient = updatedClients.find(c => c.status === 'active') || updatedClients[0];
          get().selectClient(firstClient?.id || null);
        }
        
        // Remove onboarding data
        const onboardingKey = `onboarding_${clientId}`;
        localStorage.removeItem(onboardingKey);
        
        return true;
      } catch (error) {
        console.error('Failed to delete client:', error);
        set({ error: 'Failed to delete client' });
        return false;
      }
    },

    archiveClient: async (clientId) => {
      set({ error: null });
      
      try {
        const { clients, archivedClients, selectedClientId } = get();
        const clientToArchive = clients.find(client => client.id === clientId);
        
        if (!clientToArchive) {
          set({ error: 'Client not found' });
          return false;
        }
        
        const updatedClients = clients.filter(client => client.id !== clientId);
        const updatedArchivedClients = [...archivedClients, { 
          ...clientToArchive, 
          status: 'archived' as const,
          archived_at: new Date().toISOString() 
        }];
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
        localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(updatedArchivedClients));
        
        set({ 
          clients: updatedClients, 
          archivedClients: updatedArchivedClients 
        });
        
        // If archived client was selected, select another one
        if (selectedClientId === clientId) {
          const firstClient = updatedClients.find(c => c.status === 'active') || updatedClients[0];
          get().selectClient(firstClient?.id || null);
        }
        
        return true;
      } catch (error) {
        console.error('Failed to archive client:', error);
        set({ error: 'Failed to archive client' });
        return false;
      }
    },

    restoreClient: async (clientId) => {
      set({ error: null });
      
      try {
        const { clients, archivedClients } = get();
        const clientToRestore = archivedClients.find(client => client.id === clientId);
        
        if (!clientToRestore) {
          set({ error: 'Archived client not found' });
          return false;
        }
        
        const { archived_at, ...restoredClient } = clientToRestore;
        const updatedArchivedClients = archivedClients.filter(client => client.id !== clientId);
        const updatedClients = [...clients, { 
          ...restoredClient, 
          status: 'active' as const,
          updated_at: new Date().toISOString() 
        }];
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
        localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(updatedArchivedClients));
        
        set({ 
          clients: updatedClients, 
          archivedClients: updatedArchivedClients 
        });
        
        return true;
      } catch (error) {
        console.error('Failed to restore client:', error);
        set({ error: 'Failed to restore client' });
        return false;
      }
    },

    duplicateClient: async (clientId, newName) => {
      const originalClient = get().getClientById(clientId);
      if (!originalClient) return false;
      
      const duplicatedClient = {
        ...originalClient,
        name: newName || `${originalClient.name} (Copy)`,
        company: newName || `${originalClient.company} (Copy)`,
        id: undefined, // Will be generated in addClient
        created_at: undefined,
        updated_at: undefined,
        status: 'onboarding' as const,
        onboarding_completed: false,
        onboarding_step: 0,
        access_count: 0
      };
      
      return await get().addClient(duplicatedClient);
    },

    // Edit Client Actions
    startEditingClient: (clientId) => {
      set({ 
        editingClientId: clientId, 
        showEditClientModal: true,
        unsavedChanges: false 
      });
    },

    finishEditingClient: () => {
      set({ 
        editingClientId: null, 
        showEditClientModal: false,
        unsavedChanges: false 
      });
    },

    cancelEditingClient: () => {
      const { unsavedChanges } = get();
      if (unsavedChanges) {
        const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
        if (!confirmCancel) return;
      }
      
      set({ 
        editingClientId: null, 
        showEditClientModal: false,
        unsavedChanges: false 
      });
    },

    // Data Import/Export
    exportClientData: (clientId) => {
      try {
        if (clientId) {
          const client = get().getClientById(clientId);
          if (!client) return '';
          return JSON.stringify({ clients: [client] }, null, 2);
        } else {
          const { selectedClient } = get();
          if (!selectedClient) return '';
          return JSON.stringify({ clients: [selectedClient] }, null, 2);
        }
      } catch (error) {
        console.error('Failed to export client data:', error);
        return '';
      }
    },

    exportAllClients: () => {
      try {
        const { clients, archivedClients, clientTemplates } = get();
        return JSON.stringify({
          clients,
          archivedClients,
          clientTemplates: clientTemplates.filter(t => t.id.startsWith('custom_')),
          exportedAt: new Date().toISOString(),
          version: '1.0'
        }, null, 2);
      } catch (error) {
        console.error('Failed to export all clients:', error);
        return '';
      }
    },

    importClientData: async (jsonData) => {
      try {
        const data = JSON.parse(jsonData);
        
        if (!data.clients || !Array.isArray(data.clients)) {
          set({ error: 'Invalid import data format' });
          return false;
        }

        const { clients } = get();
        const existingIds = new Set(clients.map(c => c.id));
        
        // Import clients, updating IDs if they conflict
        for (const clientData of data.clients) {
          let newClientData = { ...clientData };
          
          if (existingIds.has(clientData.id)) {
            newClientData.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            newClientData.name = `${clientData.name} (Imported)`;
          }
          
          await get().addClient(newClientData);
        }
        
        // Import archived clients if present
        if (data.archivedClients && Array.isArray(data.archivedClients)) {
          const { archivedClients } = get();
          const updatedArchived = [...archivedClients, ...data.archivedClients];
          localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(updatedArchived));
          set({ archivedClients: updatedArchived });
        }
        
        return true;
      } catch (error) {
        console.error('Failed to import client data:', error);
        set({ error: 'Failed to import client data. Please check the file format.' });
        return false;
      }
    },

    // Search and Filter Actions
    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    setStatusFilter: (status) => {
      set({ statusFilter: status });
    },

    setIndustryFilter: (industry) => {
      set({ industryFilter: industry });
    },

    getFilteredClients: () => {
      const { clients, searchQuery, statusFilter, industryFilter } = get();
      
      return clients.filter(client => {
        const matchesSearch = !searchQuery || 
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.website.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
        const matchesIndustry = !industryFilter || client.industry === industryFilter;
        
        return matchesSearch && matchesStatus && matchesIndustry;
      });
    },

    // Recent Clients Management
    addToRecentClients: (clientId) => {
      const { recentClients } = get();
      const updatedRecent = [clientId, ...recentClients.filter(id => id !== clientId)].slice(0, 5);
      
      localStorage.setItem(RECENT_CLIENTS_KEY, JSON.stringify(updatedRecent));
      set({ recentClients: updatedRecent });
    },

    getRecentClients: () => {
      const { recentClients, clients } = get();
      return recentClients
        .map(id => clients.find(c => c.id === id))
        .filter(Boolean) as ComprehensiveClient[];
    },

    clearRecentClients: () => {
      localStorage.removeItem(RECENT_CLIENTS_KEY);
      set({ recentClients: [] });
    },

    // Client Selection and Context Switching
    selectClient: (clientId) => {
      const { clients } = get();
      const client = clientId ? clients.find(c => c.id === clientId) : null;
      
      if (client) {
        // Update access count and last accessed
        get().updateClient(clientId, {
          access_count: client.access_count + 1,
          last_accessed: new Date().toISOString()
        });
        
        // Add to recent clients
        get().addToRecentClients(clientId);
      }
      
      set({ 
        selectedClientId: clientId,
        selectedClient: client
      });
      
      // Save selected client to localStorage
      if (clientId) {
        localStorage.setItem('selected_client_id', clientId);
      } else {
        localStorage.removeItem('selected_client_id');
      }
    },

    switchToClient: async (clientId) => {
      set({ isLoading: true, error: null });
      
      try {
        // Validate client exists
        const client = get().getClientById(clientId);
        if (!client) {
          throw new Error('Client not found');
        }
        
        // Simulate switching delay for smooth transition and data loading
        await new Promise(resolve => setTimeout(resolve, 600));
        
        get().selectClient(clientId);
        set({ isLoading: false });
        
        // Trigger any necessary data refreshes here
        // This is where you would refresh widgets, notifications, etc.
        
      } catch (error) {
        console.error('Failed to switch client:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to switch client',
          isLoading: false 
        });
      }
    },

    // Template Management
    loadClientTemplates: () => {
      try {
        const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        const customTemplates = stored ? JSON.parse(stored) : [];
        
        set({ 
          clientTemplates: [...defaultTemplates, ...customTemplates]
        });
      } catch (error) {
        console.warn('Failed to load client templates:', error);
      }
    },

    createClientFromTemplate: async (templateId, clientName) => {
      const template = get().clientTemplates.find(t => t.id === templateId);
      if (!template) return false;
      
      const clientData: Partial<ComprehensiveClient> = {
        name: clientName,
        company: clientName,
        industry: template.industry,
        business: {
          currency: 'USD',
          services: template.default_services,
          goals: template.default_goals,
          target_keywords: [],
          target_audience: '',
          competitors: []
        },
        dashboard: {
          enabled_widgets: template.default_widgets,
          widget_configurations: [],
          layout: 'grid',
          custom_dashboard: false
        },
        branding: {
          ...template.branding_template,
          primary_color: template.branding_template.primary_color || '#007bff',
          secondary_color: template.branding_template.secondary_color || '#6c757d',
          theme: template.branding_template.theme || 'light'
        }
      };
      
      return await get().addClient(clientData);
    },

    saveAsTemplate: async (clientId, templateName) => {
      const client = get().getClientById(clientId);
      if (!client) return false;
      
      try {
        const template: ClientTemplate = {
          id: `custom_${Date.now()}`,
          name: templateName,
          description: `Custom template based on ${client.name}`,
          industry: client.industry,
          default_services: client.business.services,
          default_widgets: client.dashboard.enabled_widgets,
          default_goals: client.business.goals,
          branding_template: client.branding,
          automation_templates: []
        };
        
        const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        const existingTemplates = stored ? JSON.parse(stored) : [];
        const updatedTemplates = [...existingTemplates, template];
        
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedTemplates));
        
        get().loadClientTemplates();
        return true;
      } catch (error) {
        console.error('Failed to save template:', error);
        return false;
      }
    },

    // Onboarding Management
    startOnboarding: (clientId) => {
      const onboarding = createDefaultOnboarding(clientId);
      
      set((state) => ({
        onboardingData: {
          ...state.onboardingData,
          [clientId]: onboarding
        },
        showOnboardingWizard: true
      }));
      
      localStorage.setItem(`${ONBOARDING_STORAGE_KEY}_${clientId}`, JSON.stringify(onboarding));
    },

    completeOnboardingStep: (clientId, stepId, data) => {
      const { onboardingData } = get();
      const clientOnboarding = onboardingData[clientId];
      
      if (!clientOnboarding) return;
      
      const updatedSteps = clientOnboarding.steps.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      );
      
      const completedSteps = updatedSteps.filter(s => s.completed).length;
      const totalSteps = updatedSteps.length;
      const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
      
      const updatedOnboarding = {
        ...clientOnboarding,
        steps: updatedSteps,
        completion_percentage: completionPercentage,
        current_step: Math.min(clientOnboarding.current_step + 1, totalSteps - 1)
      };
      
      set((state) => ({
        onboardingData: {
          ...state.onboardingData,
          [clientId]: updatedOnboarding
        }
      }));
      
      // Update client data
      get().updateClientData(clientId, stepId, data);
      
      localStorage.setItem(`${ONBOARDING_STORAGE_KEY}_${clientId}`, JSON.stringify(updatedOnboarding));
    },

    finishOnboarding: (clientId) => {
      get().updateClient(clientId, {
        onboarding_completed: true,
        status: 'active'
      });
      
      const { onboardingData } = get();
      const updatedOnboarding = {
        ...onboardingData[clientId],
        completed_at: new Date().toISOString(),
        completion_percentage: 100
      };
      
      set((state) => ({
        onboardingData: {
          ...state.onboardingData,
          [clientId]: updatedOnboarding
        },
        showOnboardingWizard: false
      }));
      
      localStorage.setItem(`${ONBOARDING_STORAGE_KEY}_${clientId}`, JSON.stringify(updatedOnboarding));
    },

    // Data Management
    updateClientData: (clientId, dataType, data) => {
      const updates: Partial<ComprehensiveClient> = {};
      
      switch (dataType) {
        case 'basic_info':
          Object.assign(updates, {
            name: data.name,
            company: data.company,
            website: data.website,
            industry: data.industry,
            contact: data.contact
          });
          break;
        case 'social_media':
          updates.social_media = data.social_media;
          break;
        case 'business_details':
          updates.business = { ...updates.business, ...data.business };
          break;
        case 'dashboard_setup':
          updates.dashboard = { ...updates.dashboard, ...data.dashboard };
          break;
        case 'branding':
          updates.branding = data.branding;
          break;
        case 'integrations':
          if (data.automation) {
            updates.automation = { ...updates.automation, ...data.automation };
          }
          if (data.analytics) {
            updates.analytics = { ...updates.analytics, ...data.analytics };
          }
          break;
      }
      
      get().updateClient(clientId, updates);
    },

    bulkUpdateClients: async (updates) => {
      try {
        const promises = Object.entries(updates).map(([clientId, clientUpdates]) =>
          get().updateClient(clientId, clientUpdates)
        );
        
        const results = await Promise.all(promises);
        return results.every(Boolean);
      } catch (error) {
        console.error('Bulk update failed:', error);
        return false;
      }
    },

    // UI Actions
    setShowAddClientModal: (show) => {
      set({ showAddClientModal: show });
    },

    setShowEditClientModal: (show) => {
      set({ showEditClientModal: show });
      if (!show) {
        set({ editingClientId: null, unsavedChanges: false });
      }
    },

    setShowOnboardingWizard: (show) => {
      set({ showOnboardingWizard: show });
    },

    setUnsavedChanges: (hasChanges) => {
      set({ unsavedChanges: hasChanges });
    },

    clearError: () => {
      set({ error: null });
    },

    // Utility Functions
    getClientById: (id) => {
      return get().clients.find(client => client.id === id);
    },

    getActiveClients: () => {
      return get().clients.filter(client => client.status === 'active');
    },

    getClientsByStatus: (status) => {
      return get().clients.filter(client => client.status === status);
    },

    getClientsByIndustry: (industry) => {
      return get().clients.filter(client => client.industry === industry);
    }
  }))
);

// Initialize store
if (typeof window !== 'undefined') {
  const store = useComprehensiveClientStore.getState();
  
  // Load data on startup
  store.loadClients();
  store.loadClientTemplates();
  
  // Restore selected client from localStorage
  const savedClientId = localStorage.getItem('selected_client_id');
  if (savedClientId) {
    setTimeout(() => {
      const client = store.getClientById(savedClientId);
      if (client) {
        store.selectClient(savedClientId);
      }
    }, 100);
  }
}

export default useComprehensiveClientStore;