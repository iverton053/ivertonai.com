// Ad Campaign Management Store
import { create } from 'zustand';
import { adPlatformService, AdCampaign, AdPlatform, AdAccount, CampaignPerformance } from '../services/adPlatformService';
import { adCreationService, GeneratedAdCreative, AdCreativeRequest, CopyTestResults } from '../services/adCreationService';

export interface AdCampaignState {
  // Campaigns
  campaigns: AdCampaign[];
  activeCampaigns: AdCampaign[];
  campaignPerformance: Record<string, CampaignPerformance[]>;
  
  // Ad Accounts
  connectedAccounts: AdAccount[];
  
  // Creative Management
  adCreatives: GeneratedAdCreative[];
  activeTests: CopyTestResults[];
  
  // Campaign Creation
  campaignDraft: Partial<AdCampaign> | null;
  creativeDraft: AdCreativeRequest | null;
  
  // Analytics & Optimization
  performanceMetrics: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    averageCTR: number;
    averageCPC: number;
    averageROAS: number;
    bestPerformingPlatform: string;
    topPerformingCampaign: string;
  };
  
  // Budget Management
  budgetAllocations: Record<string, number>;
  spendingAlerts: Array<{
    campaignId: string;
    type: 'over_budget' | 'under_performing' | 'optimization_needed';
    message: string;
    timestamp: Date;
  }>;
  
  // Automation Settings
  automationSettings: {
    enableAutoBidding: boolean;
    enableBudgetOptimization: boolean;
    enableCreativeRotation: boolean;
    enableAudienceExpansion: boolean;
    performanceThresholds: {
      minCTR: number;
      maxCPC: number;
      minROAS: number;
    };
    optimizationFrequency: number; // hours
  };
  
  // Loading States
  loading: {
    campaigns: boolean;
    accounts: boolean;
    creatives: boolean;
    performance: boolean;
    optimization: boolean;
    testing: boolean;
  };
  
  // Error Handling
  errors: {
    campaigns: string | null;
    accounts: string | null;
    creatives: string | null;
    performance: string | null;
  };
  
  // Actions - Campaign Management
  createCampaign: (platforms: AdPlatform[], campaignData: Partial<AdCampaign>) => Promise<void>;
  updateCampaign: (campaignId: string, updates: Partial<AdCampaign>) => Promise<void>;
  pauseCampaign: (campaignId: string) => Promise<void>;
  resumeCampaign: (campaignId: string) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  
  // Actions - Performance & Analytics
  loadCampaignPerformance: (campaignId: string, dateRange?: { start: Date; end: Date }) => Promise<void>;
  refreshAllPerformance: () => Promise<void>;
  
  // Actions - Creative Management
  generateAdCreative: (request: AdCreativeRequest) => Promise<void>;
  createABTest: (campaignId: string, creatives: GeneratedAdCreative[]) => Promise<void>;
  optimizeCreatives: (campaignId: string) => Promise<void>;
  
  // Actions - Optimization
  optimizeAllCampaigns: () => Promise<void>;
  optimizeBudgetAllocation: () => Promise<void>;
  applySuggestedOptimizations: (campaignId: string) => Promise<void>;
  
  // Actions - Account Management
  connectAdAccount: (platform: AdPlatform, credentials: any) => Promise<void>;
  disconnectAdAccount: (accountId: string) => Promise<void>;
  refreshAccountData: () => Promise<void>;
  
  // Actions - Automation
  updateAutomationSettings: (settings: Partial<AdCampaignState['automationSettings']>) => void;
  toggleAutomation: (feature: string, enabled: boolean) => void;
  
  // Utility Actions
  clearErrors: () => void;
  setCampaignDraft: (draft: Partial<AdCampaign> | null) => void;
  setCreativeDraft: (draft: AdCreativeRequest | null) => void;
}

export const useAdCampaignStore = create<AdCampaignState>((set, get) => ({
  // Initial State
  campaigns: [],
  activeCampaigns: [],
  campaignPerformance: {},
  connectedAccounts: [],
  adCreatives: [],
  activeTests: [],
  campaignDraft: null,
  creativeDraft: null,
  
  performanceMetrics: {
    totalSpend: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    averageCTR: 0,
    averageCPC: 0,
    averageROAS: 0,
    bestPerformingPlatform: '',
    topPerformingCampaign: ''
  },
  
  budgetAllocations: {},
  spendingAlerts: [],
  
  automationSettings: {
    enableAutoBidding: true,
    enableBudgetOptimization: true,
    enableCreativeRotation: true,
    enableAudienceExpansion: false,
    performanceThresholds: {
      minCTR: 1.0,
      maxCPC: 5.0,
      minROAS: 200
    },
    optimizationFrequency: 24 // 24 hours
  },
  
  loading: {
    campaigns: false,
    accounts: false,
    creatives: false,
    performance: false,
    optimization: false,
    testing: false
  },
  
  errors: {
    campaigns: null,
    accounts: null,
    creatives: null,
    performance: null
  },
  
  // Campaign Management Actions
  createCampaign: async (platforms: AdPlatform[], campaignData: Partial<AdCampaign>) => {
    set(state => ({
      loading: { ...state.loading, campaigns: true },
      errors: { ...state.errors, campaigns: null }
    }));

    try {
      const accounts = get().connectedAccounts.filter(acc => platforms.includes(acc.platform));
      const newCampaigns = await adPlatformService.createMultiPlatformCampaign(platforms, accounts, campaignData);
      
      set(state => ({
        campaigns: [...state.campaigns, ...newCampaigns],
        activeCampaigns: [...state.activeCampaigns, ...newCampaigns.filter(c => c.status === 'active')],
        loading: { ...state.loading, campaigns: false }
      }));
      
      // Generate performance metrics
      get().calculatePerformanceMetrics();
      
    } catch (error) {
      console.error('Campaign creation failed:', error);
      set(state => ({
        loading: { ...state.loading, campaigns: false },
        errors: { ...state.errors, campaigns: 'Failed to create campaigns' }
      }));
    }
  },

  updateCampaign: async (campaignId: string, updates: Partial<AdCampaign>) => {
    try {
      set(state => ({
        campaigns: state.campaigns.map(campaign =>
          campaign.id === campaignId ? { ...campaign, ...updates, updatedAt: new Date() } : campaign
        ),
        activeCampaigns: state.activeCampaigns.map(campaign =>
          campaign.id === campaignId ? { ...campaign, ...updates, updatedAt: new Date() } : campaign
        )
      }));
    } catch (error) {
      console.error('Campaign update failed:', error);
    }
  },

  pauseCampaign: async (campaignId: string) => {
    await get().updateCampaign(campaignId, { status: 'paused' });
    
    set(state => ({
      activeCampaigns: state.activeCampaigns.filter(c => c.id !== campaignId)
    }));
  },

  resumeCampaign: async (campaignId: string) => {
    await get().updateCampaign(campaignId, { status: 'active' });
    
    const campaign = get().campaigns.find(c => c.id === campaignId);
    if (campaign) {
      set(state => ({
        activeCampaigns: [...state.activeCampaigns, { ...campaign, status: 'active' }]
      }));
    }
  },

  deleteCampaign: async (campaignId: string) => {
    set(state => ({
      campaigns: state.campaigns.filter(c => c.id !== campaignId),
      activeCampaigns: state.activeCampaigns.filter(c => c.id !== campaignId),
      campaignPerformance: Object.fromEntries(
        Object.entries(state.campaignPerformance).filter(([id]) => id !== campaignId)
      )
    }));
  },

  // Performance & Analytics Actions
  loadCampaignPerformance: async (campaignId: string, dateRange?: { start: Date; end: Date }) => {
    set(state => ({
      loading: { ...state.loading, performance: true }
    }));

    try {
      const campaign = get().campaigns.find(c => c.id === campaignId);
      if (!campaign) return;

      const range = dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
      };

      const performance = await adPlatformService.getCampaignPerformance(campaign.platform, campaignId, range);
      
      set(state => ({
        campaignPerformance: {
          ...state.campaignPerformance,
          [campaignId]: performance
        },
        loading: { ...state.loading, performance: false }
      }));
      
    } catch (error) {
      console.error('Performance loading failed:', error);
      set(state => ({
        loading: { ...state.loading, performance: false },
        errors: { ...state.errors, performance: 'Failed to load performance data' }
      }));
    }
  },

  refreshAllPerformance: async () => {
    const campaigns = get().campaigns;
    
    for (const campaign of campaigns) {
      await get().loadCampaignPerformance(campaign.id);
    }
    
    get().calculatePerformanceMetrics();
  },

  // Creative Management Actions
  generateAdCreative: async (request: AdCreativeRequest) => {
    set(state => ({
      loading: { ...state.loading, creatives: true },
      errors: { ...state.errors, creatives: null }
    }));

    try {
      const creative = await adCreationService.generateAdCreative(request);
      
      set(state => ({
        adCreatives: [...state.adCreatives, creative],
        loading: { ...state.loading, creatives: false }
      }));
      
    } catch (error) {
      console.error('Creative generation failed:', error);
      set(state => ({
        loading: { ...state.loading, creatives: false },
        errors: { ...state.errors, creatives: 'Failed to generate creative' }
      }));
    }
  },

  createABTest: async (campaignId: string, creatives: GeneratedAdCreative[]) => {
    set(state => ({
      loading: { ...state.loading, testing: true }
    }));

    try {
      const campaign = get().campaigns.find(c => c.id === campaignId);
      if (!campaign) return;

      const testId = await adPlatformService.createABTest(campaign, creatives.map(c => ({
        id: c.id,
        type: 'text',
        headline: c.headline,
        description: c.description,
        cta_text: c.cta_text,
        performance: { impressions: 0, clicks: 0, conversions: 0, ctr: 0 }
      })));

      // Add test tracking
      const testResult: CopyTestResults = {
        test_id: testId,
        variants: creatives.map(c => ({
          id: c.id,
          copy: c,
          predicted_performance: c.performance_prediction
        })),
        recommendations: ['Monitor performance for at least 14 days', 'Allocate budget evenly between variants'],
        best_performing: creatives[0]?.id || ''
      };

      set(state => ({
        activeTests: [...state.activeTests, testResult],
        loading: { ...state.loading, testing: false }
      }));
      
    } catch (error) {
      console.error('A/B test creation failed:', error);
      set(state => ({
        loading: { ...state.loading, testing: false }
      }));
    }
  },

  optimizeCreatives: async (campaignId: string) => {
    const campaign = get().campaigns.find(c => c.id === campaignId);
    const performance = get().campaignPerformance[campaignId];
    
    if (!campaign || !performance) return;

    try {
      const optimizedCreatives = [];
      
      for (const creative of campaign.creatives) {
        const avgPerformance = performance.reduce((acc, day) => ({
          ctr: acc.ctr + day.clicks / day.impressions,
          conversion_rate: acc.conversion_rate + day.conversions / day.clicks
        }), { ctr: 0, conversion_rate: 0 });

        avgPerformance.ctr /= performance.length;
        avgPerformance.conversion_rate /= performance.length;

        const adCreative = get().adCreatives.find(ac => ac.id === creative.id);
        if (adCreative) {
          const optimized = await adCreationService.optimizeCreativePerformance(adCreative, avgPerformance);
          optimizedCreatives.push(optimized);
        }
      }

      set(state => ({
        adCreatives: [...state.adCreatives, ...optimizedCreatives]
      }));
      
    } catch (error) {
      console.error('Creative optimization failed:', error);
    }
  },

  // Optimization Actions
  optimizeAllCampaigns: async () => {
    set(state => ({
      loading: { ...state.loading, optimization: true }
    }));

    try {
      const campaigns = get().campaigns;
      const optimizedCampaigns = [];

      for (const campaign of campaigns) {
        const optimized = await adPlatformService.optimizeCampaign(campaign);
        optimizedCampaigns.push(optimized);
      }

      set(state => ({
        campaigns: optimizedCampaigns,
        activeCampaigns: optimizedCampaigns.filter(c => c.status === 'active'),
        loading: { ...state.loading, optimization: false }
      }));
      
    } catch (error) {
      console.error('Campaign optimization failed:', error);
      set(state => ({
        loading: { ...state.loading, optimization: false }
      }));
    }
  },

  optimizeBudgetAllocation: async () => {
    try {
      const campaigns = get().campaigns;
      const newAllocations = await adPlatformService.optimizeBudgetAllocation(campaigns);
      
      set(state => ({
        budgetAllocations: newAllocations,
        campaigns: state.campaigns.map(campaign => ({
          ...campaign,
          budget: newAllocations[campaign.id] || campaign.budget
        }))
      }));
      
    } catch (error) {
      console.error('Budget optimization failed:', error);
    }
  },

  applySuggestedOptimizations: async (campaignId: string) => {
    const campaign = get().campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    try {
      // Apply automation settings
      const settings = get().automationSettings;
      const updates: Partial<AdCampaign> = {};

      if (settings.enableAutoBidding && campaign.cpc > settings.performanceThresholds.maxCPC) {
        updates.optimization = {
          ...campaign.optimization,
          auto_bidding: true,
          bid_strategy: 'target_cpa'
        };
      }

      if (settings.enableAudienceExpansion && campaign.ctr < settings.performanceThresholds.minCTR) {
        const expandedTargeting = await adPlatformService.expandAudience(campaign);
        updates.targeting = expandedTargeting;
      }

      if (Object.keys(updates).length > 0) {
        await get().updateCampaign(campaignId, updates);
      }
      
    } catch (error) {
      console.error('Optimization application failed:', error);
    }
  },

  // Account Management Actions
  connectAdAccount: async (platform: AdPlatform, credentials: any) => {
    set(state => ({
      loading: { ...state.loading, accounts: true },
      errors: { ...state.errors, accounts: null }
    }));

    try {
      // Simulate account connection
      const newAccount: AdAccount = {
        platform,
        account_id: credentials.account_id || 'demo_account_' + Date.now(),
        access_token: credentials.access_token || 'demo_token',
        account_name: credentials.account_name || `${platform} Account`,
        currency: 'USD',
        timezone: 'UTC',
        is_active: true
      };

      set(state => ({
        connectedAccounts: [...state.connectedAccounts, newAccount],
        loading: { ...state.loading, accounts: false }
      }));
      
    } catch (error) {
      console.error('Account connection failed:', error);
      set(state => ({
        loading: { ...state.loading, accounts: false },
        errors: { ...state.errors, accounts: 'Failed to connect account' }
      }));
    }
  },

  disconnectAdAccount: async (accountId: string) => {
    set(state => ({
      connectedAccounts: state.connectedAccounts.filter(acc => acc.account_id !== accountId)
    }));
  },

  refreshAccountData: async () => {
    // Refresh account data from platforms
    console.log('Refreshing account data...');
  },

  // Automation Actions
  updateAutomationSettings: (settings: Partial<AdCampaignState['automationSettings']>) => {
    set(state => ({
      automationSettings: { ...state.automationSettings, ...settings }
    }));
  },

  toggleAutomation: (feature: string, enabled: boolean) => {
    set(state => ({
      automationSettings: {
        ...state.automationSettings,
        [feature]: enabled
      }
    }));
  },

  // Utility Actions
  clearErrors: () => {
    set(state => ({
      errors: {
        campaigns: null,
        accounts: null,
        creatives: null,
        performance: null
      }
    }));
  },

  setCampaignDraft: (draft: Partial<AdCampaign> | null) => {
    set({ campaignDraft: draft });
  },

  setCreativeDraft: (draft: AdCreativeRequest | null) => {
    set({ creativeDraft: draft });
  },

  // Helper method to calculate performance metrics
  calculatePerformanceMetrics: () => {
    const campaigns = get().campaigns;
    const performance = get().campaignPerformance;
    
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let platformSpend: Record<string, number> = {};

    campaigns.forEach(campaign => {
      totalSpend += campaign.spend;
      totalImpressions += campaign.impressions;
      totalClicks += campaign.clicks;
      totalConversions += campaign.conversions;
      
      platformSpend[campaign.platform] = (platformSpend[campaign.platform] || 0) + campaign.spend;
    });

    const bestPlatform = Object.entries(platformSpend).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
    const topCampaign = campaigns.reduce((best, current) => 
      current.roas > (best?.roas || 0) ? current : best, campaigns[0]);

    set(state => ({
      performanceMetrics: {
        totalSpend,
        totalImpressions,
        totalClicks,
        totalConversions,
        averageCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        averageCPC: totalClicks > 0 ? totalSpend / totalClicks : 0,
        averageROAS: totalSpend > 0 ? (totalConversions * 100) / totalSpend : 0,
        bestPerformingPlatform: bestPlatform[0],
        topPerformingCampaign: topCampaign?.name || ''
      }
    }));
  }
}));