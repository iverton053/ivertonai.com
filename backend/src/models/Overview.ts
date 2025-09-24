import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces matching the frontend
export interface IPerformanceMetrics {
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
}

export interface IScheduledItem {
  id: string;
  title: string;
  type: 'email' | 'social-post' | 'content' | 'ad-campaign';
  scheduledTime: Date;
  status: 'scheduled' | 'publishing' | 'published' | 'failed' | 'review' | 'draft';
  platform?: string;
  audience?: {
    size: number;
    segment: string;
  };
}

export interface IBusinessGoal extends Document {
  userId: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  title: string;
  category: 'revenue' | 'leads' | 'engagement' | 'growth';
  target: number;
  current: number;
  progress: number;
  status: 'on-track' | 'at-risk' | 'off-track' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: Date;
  lastUpdated: Date;
  createdAt: Date;
}

export interface IActivityItem extends Document {
  userId: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  type: 'campaign-launched' | 'goal-achieved' | 'lead-converted' | 'automation-completed' | 'content-published' | 'alert-triggered';
  title: string;
  description: string;
  timestamp: Date;
  source: 'email-marketing' | 'social-media' | 'crm' | 'automation' | 'content' | 'analytics';
  metadata: Record<string, any>;
}

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    label: string;
    url: string;
    type: 'internal' | 'external';
  };
}

// MongoDB Schemas
const BusinessGoalSchema = new Schema<IBusinessGoal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['revenue', 'leads', 'engagement', 'growth'], 
    required: true 
  },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['on-track', 'at-risk', 'off-track', 'completed'], 
    default: 'on-track' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  deadline: { type: Date, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

const ActivityItemSchema = new Schema<IActivityItem>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  type: { 
    type: String, 
    enum: ['campaign-launched', 'goal-achieved', 'lead-converted', 'automation-completed', 'content-published', 'alert-triggered'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  source: { 
    type: String, 
    enum: ['email-marketing', 'social-media', 'crm', 'automation', 'content', 'analytics'],
    required: true 
  },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const AlertSchema = new Schema<IAlert>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  type: { 
    type: String, 
    enum: ['info', 'warning', 'error', 'success'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  action: {
    label: String,
    url: String,
    type: { type: String, enum: ['internal', 'external'] }
  }
}, { timestamps: true });

// Models
export const BusinessGoal = mongoose.model<IBusinessGoal>('BusinessGoal', BusinessGoalSchema);
export const ActivityItem = mongoose.model<IActivityItem>('ActivityItem', ActivityItemSchema);
export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);

// Data aggregation service
export class OverviewDataService {
  static async getPerformanceMetrics(userId: string, clientId?: string): Promise<IPerformanceMetrics> {
    // In a real implementation, this would aggregate data from various sources
    // For now, return calculated/mock data
    return {
      revenue: {
        current: 52840,
        previous: 48920,
        change: 8.0,
        target: 60000,
        currency: 'USD'
      },
      leads: {
        total: 342,
        qualified: 156,
        converted: 23,
        conversionRate: 14.7
      },
      traffic: {
        visitors: 12845,
        pageViews: 38567,
        sessions: 15234,
        averageSessionDuration: 245,
        bounceRate: 32.4
      },
      engagement: {
        emailOpenRate: 24.8,
        socialEngagement: 1234,
        contentShares: 89,
        averageTimeOnSite: 198
      }
    };
  }

  static async getScheduledItems(userId: string, clientId?: string, limit: number = 10): Promise<{ email: IScheduledItem[], social: IScheduledItem[], content: IScheduledItem[], ads: IScheduledItem[] }> {
    // Mock scheduled items - in real implementation, query actual scheduling systems
    return {
      email: [
        {
          id: 'email-1',
          title: 'Q4 Product Launch Campaign',
          type: 'email',
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
          status: 'scheduled',
          audience: { size: 2340, segment: 'High-value customers' }
        },
        {
          id: 'email-2',
          title: 'Weekly Newsletter',
          type: 'email',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'scheduled',
          audience: { size: 8756, segment: 'All subscribers' }
        }
      ],
      social: [
        {
          id: 'social-1',
          title: 'Behind the scenes video',
          type: 'social-post',
          scheduledTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
          status: 'scheduled',
          platform: 'LinkedIn'
        }
      ],
      content: [
        {
          id: 'content-1',
          title: 'SEO Best Practices Blog Post',
          type: 'content',
          scheduledTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
          status: 'review'
        }
      ],
      ads: []
    };
  }

  static async getQuickStats(userId: string, clientId?: string) {
    return {
      emailMarketing: {
        totalCampaigns: 23,
        activeCampaigns: 3,
        scheduledCampaigns: 5,
        averageOpenRate: 24.8,
        totalSubscribers: 12450,
        recentPerformance: {
          sent: 8750,
          opened: 2170,
          clicked: 347,
          timeframe: 'Last 7 days'
        }
      },
      socialMedia: {
        totalFollowers: 15680,
        scheduledPosts: 12,
        totalEngagement: 2340,
        recentPerformance: {
          posts: 15,
          reach: 8450,
          engagement: 567,
          timeframe: 'Last 7 days'
        },
        platformBreakdown: [
          { platform: 'LinkedIn', followers: 5680, engagement: 890 },
          { platform: 'Twitter', followers: 8200, engagement: 1200 },
          { platform: 'Facebook', followers: 1800, engagement: 250 }
        ]
      },
      automation: {
        activeAutomations: 12,
        averageSuccessRate: 94.7,
        completedToday: 47,
        timeSavedHours: 12.4,
        recentRuns: {
          successful: 156,
          failed: 8,
          timeframe: 'Last 7 days'
        }
      },
      crm: {
        totalContacts: 2850,
        conversionRate: 14.7,
        dealsValue: 125000,
        newContactsToday: 23,
        dealsInPipeline: 67,
        recentActivity: {
          newContacts: 89,
          closedDeals: 7,
          timeframe: 'Last 7 days'
        }
      }
    };
  }
}