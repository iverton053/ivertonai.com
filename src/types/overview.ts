// Backend-ready interfaces for the new Overview dashboard

export interface OverviewMetrics {
  // Performance Overview
  performance: {
    revenue: {
      current: number;
      previous: number;
      change: number;
      target: number;
      currency: string;
    };
    leads: {
      total: number;
      qualified: number;
      converted: number;
      conversionRate: number;
    };
    traffic: {
      visitors: number;
      pageViews: number;
      sessions: number;
      averageSessionDuration: number;
      bounceRate: number;
    };
    engagement: {
      emailOpenRate: number;
      socialEngagement: number;
      contentShares: number;
      averageTimeOnSite: number;
    };
  };
  
  // Active Campaigns & Schedules
  activeCampaigns: {
    email: ScheduledItem[];
    social: ScheduledItem[];
    ads: ActiveAdCampaign[];
    content: ContentSchedule[];
  };
  
  // Business Goals Progress
  businessGoals: BusinessGoal[];
  
  // Recent Activity Across All Features
  recentActivity: ActivityItem[];
  
  // Alerts & Notifications
  alerts: AlertItem[];
  
  // Quick Stats for Different Features
  quickStats: {
    emailMarketing: EmailStats;
    socialMedia: SocialStats;
    automation: AutomationStats;
    crm: CRMStats;
  };
}

export interface ScheduledItem {
  id: string;
  title: string;
  type: 'email' | 'social-post' | 'ad-campaign' | 'content' | 'automation';
  scheduledTime: string;
  platform?: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  audience?: {
    size: number;
    segment: string;
  };
  metadata?: Record<string, any>;
}

export interface ActiveAdCampaign {
  id: string;
  name: string;
  platform: 'google' | 'facebook' | 'linkedin' | 'twitter';
  status: 'active' | 'paused' | 'ended';
  budget: {
    total: number;
    spent: number;
    remaining: number;
    currency: string;
  };
  performance: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    costPerConversion: number;
  };
  endDate: string;
}

export interface ContentSchedule {
  id: string;
  title: string;
  type: 'blog-post' | 'video' | 'infographic' | 'whitepaper';
  publishDate: string;
  author: string;
  status: 'draft' | 'review' | 'scheduled' | 'published';
  platforms: string[];
  seo: {
    targetKeywords: string[];
    estimatedTraffic: number;
  };
}

export interface BusinessGoal {
  id: string;
  title: string;
  category: 'revenue' | 'leads' | 'traffic' | 'engagement' | 'retention';
  target: number;
  current: number;
  progress: number; // 0-100
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'on-track' | 'at-risk' | 'off-track' | 'completed';
  relatedMetrics: string[];
  lastUpdated: string;
}

export interface ActivityItem {
  id: string;
  type: 'campaign-launched' | 'goal-achieved' | 'lead-converted' | 'automation-completed' | 'content-published' | 'alert-triggered';
  title: string;
  description: string;
  timestamp: string;
  source: 'email-marketing' | 'social-media' | 'crm' | 'automation' | 'content' | 'analytics';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    clientId?: string;
    campaignId?: string;
    goalId?: string;
    userId?: string;
    [key: string]: any;
  };
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  isRead: boolean;
  action?: {
    label: string;
    url: string;
    type: 'internal' | 'external';
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: string;
}

export interface EmailStats {
  totalCampaigns: number;
  activeCampaigns: number;
  scheduledCampaigns: number;
  averageOpenRate: number;
  averageClickRate: number;
  totalSubscribers: number;
  unsubscribeRate: number;
  recentPerformance: {
    sent: number;
    opened: number;
    clicked: number;
    timeframe: string;
  };
}

export interface SocialStats {
  totalPosts: number;
  scheduledPosts: number;
  totalFollowers: number;
  totalEngagement: number;
  platformBreakdown: {
    platform: string;
    followers: number;
    engagement: number;
    posts: number;
  }[];
  recentPerformance: {
    reach: number;
    engagement: number;
    shares: number;
    timeframe: string;
  };
}

export interface AutomationStats {
  totalAutomations: number;
  activeAutomations: number;
  completedToday: number;
  averageSuccessRate: number;
  timeSavedHours: number;
  errorRate: number;
  recentRuns: {
    successful: number;
    failed: number;
    timeframe: string;
  };
}

export interface CRMStats {
  totalContacts: number;
  newContactsToday: number;
  qualifiedLeads: number;
  dealsInPipeline: number;
  dealsValue: number;
  conversionRate: number;
  averageDealSize: number;
  recentActivity: {
    newLeads: number;
    closedDeals: number;
    timeframe: string;
  };
}

// API Response interfaces for backend integration
export interface OverviewAPIResponse {
  success: boolean;
  data: OverviewMetrics;
  timestamp: string;
  clientId: string;
  cacheExpiresAt: string;
}

export interface UpdateGoalRequest {
  goalId: string;
  updates: Partial<BusinessGoal>;
}

export interface ActivityFilters {
  sources?: string[];
  types?: string[];
  severity?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  limit?: number;
  offset?: number;
}

// Widget configuration for customizable overview
export interface OverviewWidget {
  id: string;
  type: 'performance-metrics' | 'scheduled-items' | 'business-goals' | 'recent-activity' | 'alerts' | 'quick-stats';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full-width';
  position: number;
  isVisible: boolean;
  config?: Record<string, any>;
  refreshInterval?: number; // seconds
}

export interface OverviewLayoutConfig {
  clientId: string;
  widgets: OverviewWidget[];
  lastModified: string;
  version: number;
}