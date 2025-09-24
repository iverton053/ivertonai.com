// ============================================
// SOCIAL MEDIA MANAGEMENT TYPES
// Core types for social media platform integration
// ============================================

// Supported Platforms (including Threads)
export type SocialPlatform = 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'threads' | 'twitter';

export type PostStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'published' 
  | 'failed'
  | 'pending_approval';

export type MediaType = 'image' | 'video' | 'carousel' | 'story' | 'reel' | 'thread';

export type PostType = 
  | 'feed_post'
  | 'story'
  | 'reel'
  | 'carousel'
  | 'video'
  | 'article' // LinkedIn articles
  | 'thread' // Threads posts
  | 'thread_reply'; // Threads replies

// ============================================
// CORE INTERFACES
// ============================================

export interface SocialMediaAccount {
  id: string;
  agencyId: string;
  clientId: string;
  platform: SocialPlatform;
  accountId: string; // Platform-specific account ID
  accountName: string;
  username: string;
  profilePicture?: string;
  accessToken: string;
  refreshToken?: string;
  permissions: string[];
  isActive: boolean;
  isConnected: boolean;
  lastSync: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaPost {
  id: string;
  agencyId: string;
  clientId: string;
  accountId: string;
  platform: SocialPlatform;
  
  // Content
  content: string;
  mediaUrls: string[];
  mediaType: MediaType;
  postType: PostType;
  
  // Scheduling
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  timezone: string;
  
  // Platform-specific data
  platformPostId?: string;
  platformData?: Record<string, any>;
  
  // Analytics
  metrics?: SocialMediaMetrics;
  
  // Management
  tags: string[];
  campaignId?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaMetrics {
  platform: SocialPlatform;
  postId: string;
  
  // Engagement metrics
  likes: number;
  comments: number;
  shares: number;
  saves?: number; // Instagram
  reactions?: Record<string, number>; // Facebook reaction types
  
  // Reach metrics
  impressions: number;
  reach: number;
  clicks: number;
  profileVisits?: number;
  
  // Video metrics (if applicable)
  videoViews?: number;
  videoWatchTime?: number;
  completionRate?: number;
  
  // Platform-specific metrics
  platformSpecificMetrics?: Record<string, number>;
  
  lastUpdated: string;
}

export interface ContentCalendarEvent {
  id: string;
  postId: string;
  title: string;
  platform: SocialPlatform;
  scheduledAt: string;
  status: PostStatus;
  mediaType: MediaType;
  accountName: string;
  content: string;
  mediaUrls: string[];
}

export interface SocialMediaCampaign {
  id: string;
  agencyId: string;
  clientId: string;
  name: string;
  description?: string;
  
  // Campaign settings
  platforms: SocialPlatform[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  
  // Content planning
  postIds: string[];
  totalPosts: number;
  publishedPosts: number;
  
  // Performance
  totalEngagement: number;
  totalReach: number;
  totalImpressions: number;
  
  // Management
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ANALYTICS & REPORTING
// ============================================

export interface SocialMediaAnalytics {
  accountId: string;
  platform: SocialPlatform;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  
  // Overview metrics
  overview: {
    totalPosts: number;
    totalEngagement: number;
    totalReach: number;
    totalImpressions: number;
    engagementRate: number;
    averageEngagementPerPost: number;
  };
  
  // Growth metrics
  growth: {
    followerGrowth: number;
    followerGrowthRate: number;
    engagementGrowth: number;
    reachGrowth: number;
  };
  
  // Top performing content
  topPosts: SocialMediaPost[];
  topHashtags: Array<{ hashtag: string; usage: number; engagement: number }>;
  
  // Audience insights
  audienceInsights?: {
    demographics: Record<string, number>;
    locations: Record<string, number>;
    interests: Record<string, number>;
    activeHours: Record<string, number>;
  };
  
  // Performance over time
  performanceData: Array<{
    date: string;
    posts: number;
    engagement: number;
    reach: number;
    impressions: number;
  }>;
}

export interface CompetitorAnalysis {
  id: string;
  clientId: string;
  competitorName: string;
  platform: SocialPlatform;
  competitorHandle: string;
  
  // Metrics comparison
  metrics: {
    followers: number;
    following: number;
    posts: number;
    engagementRate: number;
    averageLikes: number;
    averageComments: number;
    postingFrequency: number;
  };
  
  // Content analysis
  contentAnalysis: {
    topPostTypes: Record<MediaType, number>;
    topHashtags: string[];
    postingTimes: Record<string, number>;
    contentThemes: Record<string, number>;
  };
  
  lastUpdated: string;
}

// ============================================
// FORM & API TYPES
// ============================================

export interface CreatePostForm {
  content: string;
  mediaFiles: File[];
  platforms: SocialPlatform[];
  scheduledAt?: string;
  timezone: string;
  postType: PostType;
  tags: string[];
  campaignId?: string;
  requiresApproval: boolean;
}

export interface UpdatePostForm {
  content?: string;
  scheduledAt?: string;
  tags?: string[];
  status?: PostStatus;
}

export interface ConnectAccountForm {
  platform: SocialPlatform;
  authCode?: string;
  accessToken?: string;
  accountId?: string;
  permissions: string[];
}

export interface SocialMediaApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

// ============================================
// PLATFORM-SPECIFIC TYPES
// ============================================

// Facebook specific
export interface FacebookPageData {
  id: string;
  name: string;
  category: string;
  likes: number;
  followers: number;
  picture: string;
  accessToken: string;
}

export interface FacebookPostData {
  message?: string;
  link?: string;
  picture?: string;
  name?: string;
  caption?: string;
  description?: string;
  published: boolean;
  scheduled_publish_time?: number;
}

// Instagram specific
export interface InstagramAccountData {
  id: string;
  username: string;
  name: string;
  biography: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
}

export interface InstagramMediaData {
  image_url?: string;
  video_url?: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  children?: string[]; // For carousel posts
}

// LinkedIn specific
export interface LinkedInPageData {
  id: string;
  name: string;
  description: string;
  logo: string;
  followersCount: number;
  industry: string;
}

export interface LinkedInPostData {
  author: string;
  lifecycleState: 'PUBLISHED' | 'DRAFT';
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: 'NONE' | 'IMAGE' | 'VIDEO' | 'ARTICLE';
      media?: Array<{
        status: 'READY';
        description: {
          text: string;
        };
        media: string; // URN of uploaded media
        title?: {
          text: string;
        };
      }>;
    };
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' | 'CONNECTIONS';
  };
}

// YouTube specific (for basic analytics)
export interface YouTubeChannelData {
  id: string;
  title: string;
  description: string;
  thumbnails: Record<string, { url: string; width: number; height: number }>;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface SocialMediaDashboardData {
  accounts: SocialMediaAccount[];
  recentPosts: SocialMediaPost[];
  upcomingPosts: SocialMediaPost[];
  analytics: Record<SocialPlatform, SocialMediaAnalytics>;
  campaigns: SocialMediaCampaign[];
}

export interface PostSchedulingOptions {
  immediatePost: boolean;
  scheduledTime?: string;
  timezone: string;
  crossPost: boolean;
  platforms: SocialPlatform[];
  requireApproval: boolean;
}

export interface ContentTemplate {
  id: string;
  name: string;
  category: string;
  platforms: SocialPlatform[];
  template: {
    content: string;
    mediaType: MediaType;
    hashtags: string[];
    variables: Record<string, string>;
  };
  usage: number;
  createdAt: string;
}