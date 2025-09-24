import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types for the overview metrics
export interface OverviewMetrics {
  // Communication metrics
  communication: {
    unreadMessages: number;
    totalConversations: number;
    upcomingMeetings: number;
    completedMeetings: number;
    activeCheckIns: number;
    checkInResponseRate: number;
  };
  
  // Marketing metrics
  marketing: {
    activeCampaigns: number;
    emailCampaigns: number;
    socialPosts: number;
    adCampaigns: number;
    emailOpenRate: number;
    socialEngagement: number;
    adSpend: number;
    adImpressions: number;
  };
  
  // Business metrics
  business: {
    totalClients: number;
    activeClients: number;
    newClientsThisMonth: number;
    clientRetentionRate: number;
    revenue: number;
    revenueGrowth: number;
    monthlyRecurringRevenue: number;
  };
  
  // Analytics metrics
  analytics: {
    websiteVisitors: number;
    pageViews: number;
    conversionRate: number;
    averageSessionDuration: number;
    bounceRate: number;
    totalLeads: number;
    qualifiedLeads: number;
  };
  
  // Operations metrics
  operations: {
    activeAutomations: number;
    completedAutomations: number;
    failedAutomations: number;
    totalIntegrations: number;
    activeIntegrations: number;
    systemUptime: number;
  };
  
  // Team metrics
  team: {
    totalMembers: number;
    activeMembers: number;
    tasksCompleted: number;
    averageProductivity: number;
  };
  
  // Last updated timestamp
  lastUpdated: Date;
}

export interface OverviewStore extends OverviewMetrics {
  // Actions to update metrics
  updateCommunication: (metrics: Partial<OverviewMetrics['communication']>) => void;
  updateMarketing: (metrics: Partial<OverviewMetrics['marketing']>) => void;
  updateBusiness: (metrics: Partial<OverviewMetrics['business']>) => void;
  updateAnalytics: (metrics: Partial<OverviewMetrics['analytics']>) => void;
  updateOperations: (metrics: Partial<OverviewMetrics['operations']>) => void;
  updateTeam: (metrics: Partial<OverviewMetrics['team']>) => void;
  
  // Initialize with mock data
  initializeMockData: () => void;
  
  // Refresh all data
  refreshAll: () => void;
  
  // Get computed metrics
  getTotalActivities: () => number;
  getOverallHealth: () => 'excellent' | 'good' | 'needs-attention' | 'critical';
  getGrowthTrend: () => 'up' | 'down' | 'stable';
}

export const useOverviewStore = create<OverviewStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      communication: {
        unreadMessages: 0,
        totalConversations: 0,
        upcomingMeetings: 0,
        completedMeetings: 0,
        activeCheckIns: 0,
        checkInResponseRate: 0,
      },
      marketing: {
        activeCampaigns: 0,
        emailCampaigns: 0,
        socialPosts: 0,
        adCampaigns: 0,
        emailOpenRate: 0,
        socialEngagement: 0,
        adSpend: 0,
        adImpressions: 0,
      },
      business: {
        totalClients: 0,
        activeClients: 0,
        newClientsThisMonth: 0,
        clientRetentionRate: 0,
        revenue: 0,
        revenueGrowth: 0,
        monthlyRecurringRevenue: 0,
      },
      analytics: {
        websiteVisitors: 0,
        pageViews: 0,
        conversionRate: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        totalLeads: 0,
        qualifiedLeads: 0,
      },
      operations: {
        activeAutomations: 0,
        completedAutomations: 0,
        failedAutomations: 0,
        totalIntegrations: 0,
        activeIntegrations: 0,
        systemUptime: 99.9,
      },
      team: {
        totalMembers: 0,
        activeMembers: 0,
        tasksCompleted: 0,
        averageProductivity: 0,
      },
      lastUpdated: new Date(),

      // Actions
      updateCommunication: (metrics) =>
        set((state) => ({
          communication: { ...state.communication, ...metrics },
          lastUpdated: new Date(),
        })),

      updateMarketing: (metrics) =>
        set((state) => ({
          marketing: { ...state.marketing, ...metrics },
          lastUpdated: new Date(),
        })),

      updateBusiness: (metrics) =>
        set((state) => ({
          business: { ...state.business, ...metrics },
          lastUpdated: new Date(),
        })),

      updateAnalytics: (metrics) =>
        set((state) => ({
          analytics: { ...state.analytics, ...metrics },
          lastUpdated: new Date(),
        })),

      updateOperations: (metrics) =>
        set((state) => ({
          operations: { ...state.operations, ...metrics },
          lastUpdated: new Date(),
        })),

      updateTeam: (metrics) =>
        set((state) => ({
          team: { ...state.team, ...metrics },
          lastUpdated: new Date(),
        })),

      // Initialize with mock data
      initializeMockData: () =>
        set({
          communication: {
            unreadMessages: 7,
            totalConversations: 24,
            upcomingMeetings: 3,
            completedMeetings: 8,
            activeCheckIns: 5,
            checkInResponseRate: 84.2,
          },
          marketing: {
            activeCampaigns: 12,
            emailCampaigns: 5,
            socialPosts: 4,
            adCampaigns: 3,
            emailOpenRate: 28.5,
            socialEngagement: 1847,
            adSpend: 3240,
            adImpressions: 45678,
          },
          business: {
            totalClients: 156,
            activeClients: 134,
            newClientsThisMonth: 12,
            clientRetentionRate: 94.2,
            revenue: 52840,
            revenueGrowth: 8.3,
            monthlyRecurringRevenue: 38200,
          },
          analytics: {
            websiteVisitors: 12845,
            pageViews: 38567,
            conversionRate: 14.7,
            averageSessionDuration: 245,
            bounceRate: 32.4,
            totalLeads: 342,
            qualifiedLeads: 156,
          },
          operations: {
            activeAutomations: 23,
            completedAutomations: 145,
            failedAutomations: 3,
            totalIntegrations: 8,
            activeIntegrations: 7,
            systemUptime: 99.9,
          },
          team: {
            totalMembers: 12,
            activeMembers: 9,
            tasksCompleted: 87,
            averageProductivity: 92.5,
          },
          lastUpdated: new Date(),
        }),

      refreshAll: () => {
        // In a real implementation, this would fetch data from all sections
        // For now, just update the timestamp
        set({ lastUpdated: new Date() });
      },

      // Computed getters
      getTotalActivities: () => {
        const state = get();
        return (
          state.communication.unreadMessages +
          state.communication.upcomingMeetings +
          state.marketing.activeCampaigns +
          state.operations.activeAutomations
        );
      },

      getOverallHealth: () => {
        const state = get();
        const healthScore = 
          (state.business.clientRetentionRate +
           state.analytics.conversionRate * 5 +
           state.operations.systemUptime +
           state.team.averageProductivity) / 4;

        if (healthScore >= 90) return 'excellent';
        if (healthScore >= 75) return 'good';
        if (healthScore >= 60) return 'needs-attention';
        return 'critical';
      },

      getGrowthTrend: () => {
        const state = get();
        if (state.business.revenueGrowth > 5) return 'up';
        if (state.business.revenueGrowth < -2) return 'down';
        return 'stable';
      },
    }),
    {
      name: 'overview-store',
    }
  )
);

// Initialize mock data on store creation
useOverviewStore.getState().initializeMockData();