// ============================================
// EMAIL MARKETING STORE - ZUSTAND STATE MANAGEMENT
// Enterprise-grade state management for email marketing
// ============================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  EmailCampaign,
  EmailSubscriber,
  EmailList,
  EmailTemplate,
  EmailWorkflow,
  EmailAnalytics,
  EmailMarketingState,
  CreateCampaignForm,
  CreateListForm,
  ImportSubscribersForm,
  EmailBuilderData,
  WorkflowStep,
  N8nWebhook
} from '../types/emailMarketing';
import { emailMarketingService } from '../services/emailMarketingService';

// ============================================
// EMAIL MARKETING STORE INTERFACE
// ============================================

interface EmailMarketingStoreState extends EmailMarketingState {
  // Campaign Actions
  loadCampaigns: (agencyId: string, clientId?: string, page?: number) => Promise<void>;
  createCampaign: (campaignData: CreateCampaignForm, agencyId: string) => Promise<boolean>;
  updateCampaign: (campaignId: string, updates: Partial<EmailCampaign>) => Promise<boolean>;
  deleteCampaign: (campaignId: string) => Promise<boolean>;
  sendCampaign: (campaignId: string) => Promise<boolean>;
  getCampaignDeliveryStatus: (campaignId: string) => Promise<any>;
  getESPConfiguration: () => Promise<any[]>;
  duplicateCampaign: (campaignId: string) => Promise<boolean>;
  setSelectedCampaign: (campaign: EmailCampaign | null) => void;

  // Subscriber Actions
  loadSubscribers: (agencyId: string, clientId?: string, listId?: string, page?: number) => Promise<void>;
  createSubscriber: (subscriberData: Partial<EmailSubscriber>) => Promise<boolean>;
  updateSubscriber: (subscriberId: string, updates: Partial<EmailSubscriber>) => Promise<boolean>;
  deleteSubscriber: (subscriberId: string) => Promise<boolean>;
  importSubscribers: (importData: ImportSubscribersForm, agencyId: string) => Promise<{ imported: number; skipped: number } | null>;
  updateSubscriberTags: (subscriberIds: string[], tags: string[]) => Promise<boolean>;
  bulkUnsubscribe: (subscriberIds: string[]) => Promise<boolean>;

  // List Actions
  loadLists: (agencyId: string, clientId?: string) => Promise<void>;
  createList: (listData: CreateListForm, agencyId: string) => Promise<boolean>;
  updateList: (listId: string, updates: Partial<EmailList>) => Promise<boolean>;
  deleteList: (listId: string) => Promise<boolean>;
  addSubscribersToList: (listId: string, subscriberIds: string[]) => Promise<boolean>;
  removeSubscribersFromList: (listId: string, subscriberIds: string[]) => Promise<boolean>;
  setSelectedList: (list: EmailList | null) => void;

  // Template Actions
  loadTemplates: (agencyId: string) => Promise<void>;
  createTemplate: (templateData: Partial<EmailTemplate>) => Promise<boolean>;
  updateTemplate: (templateId: string, updates: Partial<EmailTemplate>) => Promise<boolean>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
  duplicateTemplate: (templateId: string) => Promise<boolean>;
  setSelectedTemplate: (template: EmailTemplate | null) => void;

  // Workflow Actions
  loadWorkflows: (agencyId: string, clientId?: string) => Promise<void>;
  createWorkflow: (workflowData: Partial<EmailWorkflow>) => Promise<boolean>;
  updateWorkflow: (workflowId: string, updates: Partial<EmailWorkflow>) => Promise<boolean>;
  deleteWorkflow: (workflowId: string) => Promise<boolean>;
  activateWorkflow: (workflowId: string) => Promise<boolean>;
  pauseWorkflow: (workflowId: string) => Promise<boolean>;
  setSelectedWorkflow: (workflow: EmailWorkflow | null) => void;

  // Analytics Actions
  loadCampaignAnalytics: (campaignId: string) => Promise<void>;
  loadOverallAnalytics: (agencyId: string, dateRange?: string) => Promise<void>;
  exportAnalytics: (campaignId: string, format: 'csv' | 'pdf') => Promise<void>;

  // Email Builder Actions
  openEmailBuilder: (campaignId?: string, templateId?: string) => void;
  closeEmailBuilder: () => void;
  updateBuilderData: (builderData: EmailBuilderData) => void;
  saveEmailTemplate: (name: string, category: string) => Promise<boolean>;
  previewEmail: (builderData: EmailBuilderData, subscriberData?: Record<string, any>) => Promise<string>;

  // A/B Testing Actions
  createABTest: (campaignId: string, testConfig: any) => Promise<boolean>;
  getABTestResults: (campaignId: string) => Promise<any>;
  selectABWinner: (campaignId: string, variant: 'A' | 'B') => Promise<boolean>;

  // n8n Integration Actions
  setupN8nWebhook: (webhookData: Partial<N8nWebhook>) => Promise<boolean>;
  triggerN8nWorkflow: (workflowId: string, data: Record<string, any>) => Promise<boolean>;
  loadN8nWebhooks: (agencyId: string) => Promise<void>;

  // Utility Actions
  clearError: () => void;
  resetState: () => void;
  setPreviewMode: (mode: 'desktop' | 'mobile' | 'tablet') => void;
  updatePreviewData: (data: Record<string, any>) => void;

  // Search and Filter
  searchCampaigns: (query: string) => EmailCampaign[];
  searchSubscribers: (query: string) => EmailSubscriber[];
  filterCampaignsByStatus: (status: string) => EmailCampaign[];
  filterSubscribersByEngagement: (minScore: number) => EmailSubscriber[];

  // Computed Properties
  getTotalSubscribers: () => number;
  getActiveSubscribers: () => number;
  getAverageOpenRate: () => number;
  getAverageClickRate: () => number;
  getTotalRevenue: () => number;
  getTopPerformingCampaigns: (limit?: number) => EmailCampaign[];
  getEngagementTrends: () => Array<{ date: string; opens: number; clicks: number }>;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useEmailMarketingStore = create<EmailMarketingStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    campaigns: [],
    selectedCampaign: null,
    campaignAnalytics: {},
    subscribers: [],
    lists: [],
    selectedList: null,
    templates: [],
    selectedTemplate: null,
    workflows: [],
    selectedWorkflow: null,
    overallAnalytics: null,
    revenueAttribution: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalCount: 0,
    builderData: null,
    isBuilderOpen: false,
    previewMode: 'desktop',
    previewData: {},

    // ============================================
    // CAMPAIGN ACTIONS
    // ============================================

    loadCampaigns: async (agencyId: string, clientId?: string, page = 1) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await emailMarketingService.getCampaigns(agencyId, clientId, page);
        
        if (response.success && response.data) {
          const { campaigns, selectedCampaign } = get();
          
          set({
            campaigns: page === 1 ? response.data.campaigns : [...campaigns, ...response.data.campaigns],
            totalCount: response.data.total,
            currentPage: page,
            isLoading: false
          });
        } else {
          set({ error: response.error, isLoading: false });
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load campaigns',
          isLoading: false
        });
      }
    },

    createCampaign: async (campaignData: CreateCampaignForm, agencyId: string) => {
      set({ error: null });
      
      try {
        const response = await emailMarketingService.createCampaign(campaignData, agencyId);
        
        if (response.success && response.data) {
          set(state => ({
            campaigns: [response.data!, ...state.campaigns],
            selectedCampaign: response.data!,
            totalCount: state.totalCount + 1
          }));
          return true;
        } else {
          set({ error: response.error });
          return false;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to create campaign' });
        return false;
      }
    },

    updateCampaign: async (campaignId: string, updates: Partial<EmailCampaign>) => {
      set({ error: null });
      
      try {
        const response = await emailMarketingService.updateCampaign(campaignId, updates);
        
        if (response.success && response.data) {
          set(state => ({
            campaigns: state.campaigns.map(c => 
              c.id === campaignId ? { ...c, ...response.data! } : c
            ),
            selectedCampaign: state.selectedCampaign?.id === campaignId 
              ? { ...state.selectedCampaign, ...response.data! }
              : state.selectedCampaign
          }));
          return true;
        } else {
          set({ error: response.error });
          return false;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to update campaign' });
        return false;
      }
    },

    sendCampaign: async (campaignId: string) => {
      set({ error: null });
      
      try {
        console.log('🚀 Starting campaign delivery from store...');
        const response = await emailMarketingService.sendCampaign(campaignId);
        
        if (response.success) {
          // Update campaign status to sending initially
          set(state => ({
            campaigns: state.campaigns.map(c => 
              c.id === campaignId ? { ...c, status: 'sending' as const } : c
            )
          }));

          console.log('✅ Campaign delivery initiated successfully');
          return true;
        } else {
          set({ error: response.error });
          return false;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to send campaign' });
        return false;
      }
    },

    getCampaignDeliveryStatus: async (campaignId: string) => {
      try {
        const response = await emailMarketingService.getCampaignDeliveryStatus(campaignId);
        return response.success ? response.data : null;
      } catch (error) {
        console.error('Failed to get delivery status:', error);
        return null;
      }
    },

    getESPConfiguration: async () => {
      try {
        const response = await emailMarketingService.getESPConfiguration();
        return response.success ? response.data : [];
      } catch (error) {
        console.error('Failed to get ESP configuration:', error);
        return [];
      }
    },

    duplicateCampaign: async (campaignId: string) => {
      const { campaigns, createCampaign } = get();
      const campaign = campaigns.find(c => c.id === campaignId);
      
      if (campaign) {
        const duplicateData: CreateCampaignForm = {
          name: `${campaign.name} (Copy)`,
          subject: campaign.subject,
          previewText: campaign.previewText,
          fromName: campaign.fromName,
          fromEmail: campaign.fromEmail,
          replyTo: campaign.replyTo,
          templateId: campaign.templateId,
          listIds: [], // Don't copy list associations
          campaignType: campaign.campaignType,
          sendImmediately: false,
          timezone: campaign.timezone,
          tags: campaign.tags,
          notes: campaign.notes
        };
        
        return await createCampaign(duplicateData, campaign.agencyId);
      }
      
      return false;
    },

    deleteCampaign: async (campaignId: string) => {
      // Implementation would call API to delete campaign
      set(state => ({
        campaigns: state.campaigns.filter(c => c.id !== campaignId),
        selectedCampaign: state.selectedCampaign?.id === campaignId ? null : state.selectedCampaign
      }));
      return true;
    },

    setSelectedCampaign: (campaign: EmailCampaign | null) => {
      set({ selectedCampaign: campaign });
    },

    // ============================================
    // SUBSCRIBER ACTIONS
    // ============================================

    loadSubscribers: async (agencyId: string, clientId?: string, listId?: string, page = 1) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await emailMarketingService.getSubscribers(agencyId, clientId, listId, page);
        
        if (response.success && response.data) {
          const { subscribers } = get();
          
          set({
            subscribers: page === 1 ? response.data.subscribers : [...subscribers, ...response.data.subscribers],
            totalCount: response.data.total,
            currentPage: page,
            isLoading: false
          });
        } else {
          set({ error: response.error, isLoading: false });
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load subscribers',
          isLoading: false
        });
      }
    },

    createSubscriber: async (subscriberData: Partial<EmailSubscriber>) => {
      set({ error: null });
      
      try {
        const response = await emailMarketingService.createSubscriber(subscriberData);
        
        if (response.success && response.data) {
          set(state => ({
            subscribers: [response.data!, ...state.subscribers],
            totalCount: state.totalCount + 1
          }));
          return true;
        } else {
          set({ error: response.error });
          return false;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to create subscriber' });
        return false;
      }
    },

    updateSubscriber: async (subscriberId: string, updates: Partial<EmailSubscriber>) => {
      // Implementation for updating subscriber
      set(state => ({
        subscribers: state.subscribers.map(s => 
          s.id === subscriberId ? { ...s, ...updates } : s
        )
      }));
      return true;
    },

    deleteSubscriber: async (subscriberId: string) => {
      set(state => ({
        subscribers: state.subscribers.filter(s => s.id !== subscriberId)
      }));
      return true;
    },

    importSubscribers: async (importData: ImportSubscribersForm, agencyId: string) => {
      set({ error: null, isLoading: true });
      
      try {
        const response = await emailMarketingService.importSubscribers(importData, agencyId);
        
        if (response.success && response.data) {
          // Refresh subscribers list
          await get().loadSubscribers(agencyId);
          set({ isLoading: false });
          return response.data;
        } else {
          set({ error: response.error, isLoading: false });
          return null;
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to import subscribers',
          isLoading: false
        });
        return null;
      }
    },

    updateSubscriberTags: async (subscriberIds: string[], tags: string[]) => {
      // Bulk update subscriber tags
      set(state => ({
        subscribers: state.subscribers.map(s => 
          subscriberIds.includes(s.id) ? { ...s, tags } : s
        )
      }));
      return true;
    },

    bulkUnsubscribe: async (subscriberIds: string[]) => {
      set(state => ({
        subscribers: state.subscribers.map(s => 
          subscriberIds.includes(s.id) ? { ...s, status: 'unsubscribed' as const } : s
        )
      }));
      return true;
    },

    // ============================================
    // LIST ACTIONS
    // ============================================

    loadLists: async (agencyId: string, clientId?: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await emailMarketingService.getLists(agencyId, clientId);
        
        if (response.success && response.data) {
          set({ lists: response.data, isLoading: false });
        } else {
          set({ error: response.error, isLoading: false });
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load lists',
          isLoading: false
        });
      }
    },

    createList: async (listData: CreateListForm, agencyId: string) => {
      set({ error: null });
      
      try {
        const response = await emailMarketingService.createList(listData, agencyId);
        
        if (response.success && response.data) {
          set(state => ({
            lists: [response.data!, ...state.lists],
            selectedList: response.data!
          }));
          return true;
        } else {
          set({ error: response.error });
          return false;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to create list' });
        return false;
      }
    },

    updateList: async (listId: string, updates: Partial<EmailList>) => {
      set(state => ({
        lists: state.lists.map(l => 
          l.id === listId ? { ...l, ...updates } : l
        ),
        selectedList: state.selectedList?.id === listId 
          ? { ...state.selectedList, ...updates }
          : state.selectedList
      }));
      return true;
    },

    deleteList: async (listId: string) => {
      set(state => ({
        lists: state.lists.filter(l => l.id !== listId),
        selectedList: state.selectedList?.id === listId ? null : state.selectedList
      }));
      return true;
    },

    addSubscribersToList: async (listId: string, subscriberIds: string[]) => {
      // Implementation for adding subscribers to list
      return true;
    },

    removeSubscribersFromList: async (listId: string, subscriberIds: string[]) => {
      // Implementation for removing subscribers from list
      return true;
    },

    setSelectedList: (list: EmailList | null) => {
      set({ selectedList: list });
    },

    // ============================================
    // TEMPLATE ACTIONS
    // ============================================

    loadTemplates: async (agencyId: string) => {
      set({ isLoading: true, error: null });
      
      try {
        // Implementation for loading templates
        set({ isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load templates',
          isLoading: false
        });
      }
    },

    createTemplate: async (templateData: Partial<EmailTemplate>) => {
      set(state => ({
        templates: [templateData as EmailTemplate, ...state.templates]
      }));
      return true;
    },

    updateTemplate: async (templateId: string, updates: Partial<EmailTemplate>) => {
      set(state => ({
        templates: state.templates.map(t => 
          t.id === templateId ? { ...t, ...updates } : t
        )
      }));
      return true;
    },

    deleteTemplate: async (templateId: string) => {
      set(state => ({
        templates: state.templates.filter(t => t.id !== templateId),
        selectedTemplate: state.selectedTemplate?.id === templateId ? null : state.selectedTemplate
      }));
      return true;
    },

    duplicateTemplate: async (templateId: string) => {
      const { templates } = get();
      const template = templates.find(t => t.id === templateId);
      
      if (template) {
        const duplicate: EmailTemplate = {
          ...template,
          id: `template_${Date.now()}`,
          name: `${template.name} (Copy)`,
          createdAt: new Date().toISOString()
        };
        
        set(state => ({
          templates: [duplicate, ...state.templates]
        }));
        return true;
      }
      
      return false;
    },

    setSelectedTemplate: (template: EmailTemplate | null) => {
      set({ selectedTemplate: template });
    },

    // ============================================
    // WORKFLOW ACTIONS
    // ============================================

    loadWorkflows: async (agencyId: string, clientId?: string) => {
      set({ isLoading: true, error: null });
      
      try {
        // Implementation for loading workflows
        set({ isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load workflows',
          isLoading: false
        });
      }
    },

    createWorkflow: async (workflowData: Partial<EmailWorkflow>) => {
      set(state => ({
        workflows: [workflowData as EmailWorkflow, ...state.workflows]
      }));
      return true;
    },

    updateWorkflow: async (workflowId: string, updates: Partial<EmailWorkflow>) => {
      set(state => ({
        workflows: state.workflows.map(w => 
          w.id === workflowId ? { ...w, ...updates } : w
        )
      }));
      return true;
    },

    deleteWorkflow: async (workflowId: string) => {
      set(state => ({
        workflows: state.workflows.filter(w => w.id !== workflowId),
        selectedWorkflow: state.selectedWorkflow?.id === workflowId ? null : state.selectedWorkflow
      }));
      return true;
    },

    activateWorkflow: async (workflowId: string) => {
      await get().updateWorkflow(workflowId, { status: 'active' });
      return true;
    },

    pauseWorkflow: async (workflowId: string) => {
      await get().updateWorkflow(workflowId, { status: 'paused' });
      return true;
    },

    setSelectedWorkflow: (workflow: EmailWorkflow | null) => {
      set({ selectedWorkflow: workflow });
    },

    // ============================================
    // ANALYTICS ACTIONS
    // ============================================

    loadCampaignAnalytics: async (campaignId: string) => {
      try {
        const response = await emailMarketingService.getCampaignAnalytics(campaignId);
        
        if (response.success && response.data) {
          set(state => ({
            campaignAnalytics: {
              ...state.campaignAnalytics,
              [campaignId]: response.data!
            }
          }));
        }
      } catch (error) {
        console.error('Failed to load campaign analytics:', error);
      }
    },

    loadOverallAnalytics: async (agencyId: string, dateRange?: string) => {
      // Implementation for loading overall analytics
    },

    exportAnalytics: async (campaignId: string, format: 'csv' | 'pdf') => {
      // Implementation for exporting analytics
    },

    // ============================================
    // EMAIL BUILDER ACTIONS
    // ============================================

    openEmailBuilder: (campaignId?: string, templateId?: string) => {
      set({ 
        isBuilderOpen: true,
        builderData: {
          version: '1.0',
          blocks: [],
          globalStyles: {
            backgroundColor: '#f8f9fa',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: '#333333',
            linkColor: '#007bff',
            containerWidth: '600px',
            containerPadding: '20px'
          }
        }
      });
    },

    closeEmailBuilder: () => {
      set({ isBuilderOpen: false, builderData: null });
    },

    updateBuilderData: (builderData: EmailBuilderData) => {
      set({ builderData });
    },

    saveEmailTemplate: async (name: string, category: string) => {
      const { builderData } = get();
      
      if (builderData) {
        const template: Partial<EmailTemplate> = {
          id: `template_${Date.now()}`,
          name,
          category: category as any,
          jsonContent: builderData,
          createdAt: new Date().toISOString()
        };
        
        return await get().createTemplate(template);
      }
      
      return false;
    },

    previewEmail: async (builderData: EmailBuilderData, subscriberData?: Record<string, any>) => {
      // Implementation for email preview generation
      return '<html><body>Email Preview</body></html>';
    },

    // ============================================
    // A/B TESTING ACTIONS
    // ============================================

    createABTest: async (campaignId: string, testConfig: any) => {
      // Implementation for creating A/B test
      return true;
    },

    getABTestResults: async (campaignId: string) => {
      // Implementation for getting A/B test results
      return {};
    },

    selectABWinner: async (campaignId: string, variant: 'A' | 'B') => {
      // Implementation for selecting A/B test winner
      return true;
    },

    // ============================================
    // N8N INTEGRATION ACTIONS
    // ============================================

    setupN8nWebhook: async (webhookData: Partial<N8nWebhook>) => {
      // Implementation for setting up n8n webhook
      return true;
    },

    triggerN8nWorkflow: async (workflowId: string, data: Record<string, any>) => {
      // Implementation for triggering n8n workflow
      return true;
    },

    loadN8nWebhooks: async (agencyId: string) => {
      // Implementation for loading n8n webhooks
    },

    // ============================================
    // UTILITY ACTIONS
    // ============================================

    clearError: () => {
      set({ error: null });
    },

    resetState: () => {
      set({
        campaigns: [],
        selectedCampaign: null,
        campaignAnalytics: {},
        subscribers: [],
        lists: [],
        selectedList: null,
        templates: [],
        selectedTemplate: null,
        workflows: [],
        selectedWorkflow: null,
        overallAnalytics: null,
        revenueAttribution: [],
        isLoading: false,
        error: null,
        currentPage: 1,
        totalCount: 0,
        builderData: null,
        isBuilderOpen: false,
        previewMode: 'desktop',
        previewData: {}
      });
    },

    setPreviewMode: (mode: 'desktop' | 'mobile' | 'tablet') => {
      set({ previewMode: mode });
    },

    updatePreviewData: (data: Record<string, any>) => {
      set({ previewData: data });
    },

    // ============================================
    // SEARCH AND FILTER FUNCTIONS
    // ============================================

    searchCampaigns: (query: string) => {
      const { campaigns } = get();
      return campaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(query.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(query.toLowerCase()) ||
        campaign.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    },

    searchSubscribers: (query: string) => {
      const { subscribers } = get();
      return subscribers.filter(subscriber =>
        subscriber.email.toLowerCase().includes(query.toLowerCase()) ||
        subscriber.firstName?.toLowerCase().includes(query.toLowerCase()) ||
        subscriber.lastName?.toLowerCase().includes(query.toLowerCase()) ||
        subscriber.company?.toLowerCase().includes(query.toLowerCase())
      );
    },

    filterCampaignsByStatus: (status: string) => {
      const { campaigns } = get();
      return campaigns.filter(campaign => campaign.status === status);
    },

    filterSubscribersByEngagement: (minScore: number) => {
      const { subscribers } = get();
      return subscribers.filter(subscriber => subscriber.engagementScore >= minScore);
    },

    // ============================================
    // COMPUTED PROPERTIES
    // ============================================

    getTotalSubscribers: () => {
      const { subscribers } = get();
      return subscribers.length;
    },

    getActiveSubscribers: () => {
      const { subscribers } = get();
      return subscribers.filter(s => s.status === 'active').length;
    },

    getAverageOpenRate: () => {
      const { campaignAnalytics } = get();
      const analytics = Object.values(campaignAnalytics);
      if (analytics.length === 0) return 0;
      
      const totalOpenRate = analytics.reduce((sum, a) => sum + a.openRate, 0);
      return totalOpenRate / analytics.length;
    },

    getAverageClickRate: () => {
      const { campaignAnalytics } = get();
      const analytics = Object.values(campaignAnalytics);
      if (analytics.length === 0) return 0;
      
      const totalClickRate = analytics.reduce((sum, a) => sum + a.clickRate, 0);
      return totalClickRate / analytics.length;
    },

    getTotalRevenue: () => {
      const { campaignAnalytics } = get();
      const analytics = Object.values(campaignAnalytics);
      return analytics.reduce((sum, a) => sum + a.totalAttributedRevenue, 0);
    },

    getTopPerformingCampaigns: (limit = 10) => {
      const { campaigns, campaignAnalytics } = get();
      return campaigns
        .filter(c => campaignAnalytics[c.id])
        .sort((a, b) => {
          const aAnalytics = campaignAnalytics[a.id];
          const bAnalytics = campaignAnalytics[b.id];
          return bAnalytics.clickRate - aAnalytics.clickRate;
        })
        .slice(0, limit);
    },

    getEngagementTrends: () => {
      // Implementation for engagement trends calculation
      return [];
    }
  }))
);

// Auto-load initial data when store is created
if (typeof window !== 'undefined') {
  const store = useEmailMarketingStore.getState();
  
  // Subscribe to changes for automatic updates
  useEmailMarketingStore.subscribe(
    (state) => state.selectedCampaign,
    (selectedCampaign) => {
      if (selectedCampaign) {
        store.loadCampaignAnalytics(selectedCampaign.id);
      }
    }
  );
}

export default useEmailMarketingStore;