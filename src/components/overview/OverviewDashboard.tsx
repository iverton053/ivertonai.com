import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Settings, TrendingUp, Calendar, Target, Activity } from 'lucide-react';
import { OverviewMetrics, OverviewWidget } from '../../types/overview';
import PerformanceMetricsWidget from './widgets/PerformanceMetricsWidget';
import ScheduledItemsWidget from './widgets/ScheduledItemsWidget';
import BusinessGoalsWidget from './widgets/BusinessGoalsWidget';
import RecentActivityWidget from './widgets/RecentActivityWidget';
import AlertsWidget from './widgets/AlertsWidget';
import QuickStatsWidget from './widgets/QuickStatsWidget';
import { useTimer } from '../../hooks/useCleanup';
import Tooltip from '../common/Tooltip';
import { overviewService } from '../../services/overviewService';
import { useOverviewStore } from '../../stores';

interface OverviewDashboardProps {
  clientData?: any;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ clientData }) => {
  // Use centralized overview store
  const overviewStore = useOverviewStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { setTimeout: safeSetTimeout } = useTimer();

  // Transform store data to component format
  const overviewData = {
    performance: {
      revenue: {
        current: overviewStore.business.revenue,
        previous: Math.round(overviewStore.business.revenue * 0.92), // Calculate previous based on growth
        change: overviewStore.business.revenueGrowth,
        target: 60000,
        currency: 'USD'
      },
      leads: {
        total: overviewStore.analytics.totalLeads,
        qualified: overviewStore.analytics.qualifiedLeads,
        converted: Math.round(overviewStore.analytics.qualifiedLeads * 0.15),
        conversionRate: overviewStore.analytics.conversionRate
      },
      traffic: {
        visitors: overviewStore.analytics.websiteVisitors,
        pageViews: overviewStore.analytics.pageViews,
        sessions: Math.round(overviewStore.analytics.websiteVisitors * 1.18),
        averageSessionDuration: overviewStore.analytics.averageSessionDuration,
        bounceRate: overviewStore.analytics.bounceRate
      },
      engagement: {
        emailOpenRate: overviewStore.marketing.emailOpenRate,
        socialEngagement: overviewStore.marketing.socialEngagement,
        contentShares: 89,
        averageTimeOnSite: Math.round(overviewStore.analytics.averageSessionDuration * 0.8)
      }
    },
    activeCampaigns: {
      email: [
        {
          id: 'email-1',
          title: 'Q4 Product Launch Campaign',
          type: 'email',
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          audience: { size: 2340, segment: 'High-value customers' }
        },
        {
          id: 'email-2',
          title: 'Weekly Newsletter',
          type: 'email',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          audience: { size: 8756, segment: 'All subscribers' }
        }
      ],
      social: [
        {
          id: 'social-1',
          title: 'Behind the scenes video',
          type: 'social-post',
          scheduledTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          platform: 'LinkedIn'
        },
        {
          id: 'social-2',
          title: 'Customer success story',
          type: 'social-post',
          scheduledTime: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          platform: 'Twitter'
        }
      ],
      ads: [
        {
          id: 'ad-1',
          name: 'Lead Generation Campaign',
          platform: 'google',
          status: 'active',
          budget: {
            total: 5000,
            spent: overviewStore.marketing.adSpend,
            remaining: 5000 - overviewStore.marketing.adSpend,
            currency: 'USD'
          },
          performance: {
            impressions: overviewStore.marketing.adImpressions,
            clicks: 1234,
            ctr: 2.7,
            conversions: 87,
            costPerConversion: 37.24
          },
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      content: [
        {
          id: 'content-1',
          title: 'AI in Marketing: Complete Guide 2024',
          type: 'blog-post',
          publishDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          author: 'Content Team',
          status: 'review',
          platforms: ['Blog', 'LinkedIn', 'Twitter'],
          seo: {
            targetKeywords: ['AI marketing', 'marketing automation'],
            estimatedTraffic: 2500
          }
        }
      ]
    },
    businessGoals: [
      {
        id: 'goal-1',
        title: 'Increase Monthly Revenue',
        category: 'revenue',
        target: 60000,
        current: overviewStore.business.revenue,
        progress: Math.round((overviewStore.business.revenue / 60000) * 100),
        deadline: '2024-12-31',
        priority: 'high',
        status: 'on-track',
        relatedMetrics: ['revenue', 'conversion-rate'],
        lastUpdated: overviewStore.lastUpdated.toISOString()
      },
      {
        id: 'goal-2',
        title: 'Generate 500 New Leads',
        category: 'leads',
        target: 500,
        current: overviewStore.analytics.totalLeads,
        progress: Math.round((overviewStore.analytics.totalLeads / 500) * 100),
        deadline: '2024-12-15',
        priority: 'medium',
        status: 'on-track',
        relatedMetrics: ['leads', 'traffic'],
        lastUpdated: overviewStore.lastUpdated.toISOString()
      },
      {
        id: 'goal-3',
        title: 'Improve Email Open Rate',
        category: 'engagement',
        target: 28.0,
        current: overviewStore.marketing.emailOpenRate,
        progress: Math.round((overviewStore.marketing.emailOpenRate / 28.0) * 100),
        deadline: '2024-11-30',
        priority: 'medium',
        status: overviewStore.marketing.emailOpenRate >= 25 ? 'on-track' : 'at-risk',
        relatedMetrics: ['email-open-rate'],
        lastUpdated: overviewStore.lastUpdated.toISOString()
      }
    ],
    recentActivity: [
      {
        id: 'activity-1',
        type: 'campaign-launched',
        title: 'Email Campaign Launched',
        description: '"Black Friday Sale" campaign sent to 5,432 subscribers',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'email-marketing',
        metadata: { campaignId: 'email-bf-2024', subscribers: 5432 }
      },
      {
        id: 'activity-2',
        type: 'goal-achieved',
        title: 'Monthly Target Reached',
        description: 'Website traffic goal exceeded by 12%',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: 'analytics',
        metadata: { goalId: 'traffic-monthly', achievement: 112 }
      },
      {
        id: 'activity-3',
        type: 'lead-converted',
        title: 'New Customer Acquired',
        description: `Enterprise lead converted to $${overviewStore.business.monthlyRecurringRevenue} annual contract`,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: 'crm',
        metadata: { leadId: 'lead-456', value: overviewStore.business.monthlyRecurringRevenue }
      }
    ],
    alerts: [
      {
        id: 'alert-1',
        type: 'warning',
        title: 'Ad Budget Running Low',
        message: `Google Ads campaign has only $${5000 - overviewStore.marketing.adSpend} remaining (${Math.round(((5000 - overviewStore.marketing.adSpend) / 5000) * 100)}% of budget)`,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        source: 'ad-campaigns',
        isRead: false,
        priority: 'medium',
        action: {
          label: 'Increase Budget',
          url: '/campaigns/google-ads',
          type: 'internal'
        }
      },
      {
        id: 'alert-2',
        type: 'info',
        title: 'Automation Completed',
        description: 'Weekly report generation completed successfully',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: 'automation',
        isRead: true,
        priority: 'low',
        message: 'Weekly analytics report has been generated and sent to stakeholders'
      }
    ],
    quickStats: {
      emailMarketing: {
        totalCampaigns: overviewStore.marketing.emailCampaigns,
        activeCampaigns: Math.round(overviewStore.marketing.emailCampaigns * 0.6),
        scheduledCampaigns: Math.round(overviewStore.marketing.emailCampaigns * 0.4),
        averageOpenRate: overviewStore.marketing.emailOpenRate,
        averageClickRate: 3.2,
        totalSubscribers: 8756,
        unsubscribeRate: 1.2,
        recentPerformance: {
          sent: 15670,
          opened: Math.round(15670 * (overviewStore.marketing.emailOpenRate / 100)),
          clicked: 501,
          timeframe: 'Last 7 days'
        }
      },
      socialMedia: {
        totalPosts: overviewStore.marketing.socialPosts,
        scheduledPosts: Math.round(overviewStore.marketing.socialPosts * 0.3),
        totalFollowers: 24680,
        totalEngagement: overviewStore.marketing.socialEngagement,
        platformBreakdown: [
          { platform: 'LinkedIn', followers: 8900, engagement: Math.round(overviewStore.marketing.socialEngagement * 0.46), posts: Math.round(overviewStore.marketing.socialPosts * 0.29) },
          { platform: 'Twitter', followers: 12340, engagement: Math.round(overviewStore.marketing.socialEngagement * 0.72), posts: Math.round(overviewStore.marketing.socialPosts * 0.50) },
          { platform: 'Instagram', followers: 3440, engagement: Math.round(overviewStore.marketing.socialEngagement * 0.19), posts: Math.round(overviewStore.marketing.socialPosts * 0.21) }
        ],
        recentPerformance: {
          reach: 45670,
          engagement: overviewStore.marketing.socialEngagement,
          shares: 89,
          timeframe: 'Last 7 days'
        }
      },
      automation: {
        totalAutomations: overviewStore.operations.activeAutomations + overviewStore.operations.completedAutomations,
        activeAutomations: overviewStore.operations.activeAutomations,
        completedToday: Math.round(overviewStore.operations.completedAutomations * 0.32),
        averageSuccessRate: 94.7,
        timeSavedHours: 23.5,
        errorRate: (overviewStore.operations.failedAutomations / (overviewStore.operations.completedAutomations + overviewStore.operations.failedAutomations)) * 100,
        recentRuns: {
          successful: overviewStore.operations.completedAutomations,
          failed: overviewStore.operations.failedAutomations,
          timeframe: 'Last 7 days'
        }
      },
      crm: {
        totalContacts: overviewStore.business.totalClients + Math.round(overviewStore.analytics.totalLeads * 1.2),
        newContactsToday: Math.round(overviewStore.business.newClientsThisMonth * 0.27),
        qualifiedLeads: overviewStore.analytics.qualifiedLeads,
        dealsInPipeline: Math.round(overviewStore.analytics.qualifiedLeads * 0.15),
        dealsValue: Math.round(overviewStore.business.monthlyRecurringRevenue * 6.14),
        conversionRate: overviewStore.analytics.conversionRate,
        averageDealSize: Math.round(overviewStore.business.revenue / overviewStore.business.activeClients),
        recentActivity: {
          newLeads: Math.round(overviewStore.analytics.totalLeads * 0.10),
          closedDeals: Math.round(overviewStore.business.newClientsThisMonth * 0.58),
          timeframe: 'Last 7 days'
        }
      }
    }
  };

  // Refresh overview data
  const refreshOverviewData = async (showLoader = false) => {
    if (showLoader) setRefreshing(true);
    
    try {
      overviewStore.refreshAll();
      setLastUpdated(new Date());
      setError(null);
    } catch (error) {
      console.error('Failed to refresh overview data:', error);
      setError('Failed to refresh data');
    } finally {
      if (showLoader) setRefreshing(false);
    }
  };

  // Initialize data loading and setup auto-refresh
  useEffect(() => {
    // Initial load simulation
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date());
    }, 1000);
    
    const interval = safeSetTimeout(() => {
      refreshOverviewData();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [clientData]);

  // Update lastUpdated when store data changes
  useEffect(() => {
    setLastUpdated(overviewStore.lastUpdated);
  }, [overviewStore.lastUpdated]);

  const handleRefresh = () => {
    refreshOverviewData(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-48"></div>
          </div>
          <div className="h-10 bg-gray-700 rounded w-24"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-effect rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded"></div>
                <div className="h-4 bg-gray-800 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Failed to load overview</h3>
        <p className="text-gray-400 mb-4">
          {error || 'Unable to fetch overview data'}
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-base btn-primary btn-md"
        >
          {refreshing ? 'Retrying...' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-gray-400">
            Your business at a glance • Last updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Tooltip content="Customize dashboard layout">
            <button className="btn-base btn-ghost btn-sm">
              <Settings className="w-4 h-4" />
            </button>
          </Tooltip>
          
          <Tooltip content="Refresh data">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-base btn-secondary btn-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Alerts (if any) */}
      {overviewData.alerts.some(alert => !alert.isRead) && (
        <AlertsWidget alerts={overviewData.alerts} />
      )}

      {/* Main Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics - Full width */}
        <div className="lg:col-span-3">
          <PerformanceMetricsWidget performance={overviewData.performance} />
        </div>

        {/* Scheduled Items */}
        <div>
          <ScheduledItemsWidget campaigns={overviewData.activeCampaigns} />
        </div>

        {/* Business Goals */}
        <div>
          <BusinessGoalsWidget goals={overviewData.businessGoals} />
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivityWidget activities={overviewData.recentActivity} />
        </div>

        {/* Quick Stats - Full width */}
        <div className="lg:col-span-3">
          <QuickStatsWidget stats={overviewData.quickStats} />
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;