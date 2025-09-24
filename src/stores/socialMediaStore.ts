import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  SocialMediaPost, 
  SocialMediaAccount, 
  SocialMediaAnalytics, 
  SocialMediaCampaign,
  SocialPlatform,
  CreatePostForm,
  UpdatePostForm,
  ConnectAccountForm
} from '../types/socialMedia';

interface SocialMediaStore {
  // State
  posts: SocialMediaPost[];
  accounts: SocialMediaAccount[];
  analytics: Record<SocialPlatform, SocialMediaAnalytics>;
  campaigns: SocialMediaCampaign[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPosts: (posts: SocialMediaPost[]) => void;
  addPost: (post: CreatePostForm) => void;
  updatePost: (postId: string, updates: UpdatePostForm) => void;
  deletePost: (postId: string) => void;
  duplicatePost: (post: SocialMediaPost) => void;
  publishPost: (postId: string) => void;
  pausePost: (postId: string) => void;
  
  setAccounts: (accounts: SocialMediaAccount[]) => void;
  addAccount: (account: ConnectAccountForm) => void;
  removeAccount: (accountId: string) => void;
  refreshAccount: (accountId: string) => void;
  
  setAnalytics: (analytics: Record<SocialPlatform, SocialMediaAnalytics>) => void;
  
  setCampaigns: (campaigns: SocialMediaCampaign[]) => void;
  addCampaign: (campaign: Omit<SocialMediaCampaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock data generator
const generateMockPosts = (): SocialMediaPost[] => [
  {
    id: '1',
    agencyId: 'agency-1',
    clientId: 'client-1',
    accountId: 'account-fb-1',
    platform: 'facebook',
    content: 'Excited to share our latest AI-powered automation tools! 🚀 Streamline your workflow and boost productivity with our cutting-edge solutions. #AI #Automation #Productivity',
    mediaUrls: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500'],
    mediaType: 'image',
    postType: 'feed_post',
    status: 'published',
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    timezone: 'America/New_York',
    metrics: {
      platform: 'facebook',
      postId: '1',
      likes: 245,
      comments: 38,
      shares: 67,
      impressions: 5420,
      reach: 3210,
      clicks: 156,
      reactions: { like: 189, love: 34, wow: 12, haha: 8, sad: 1, angry: 1 },
      lastUpdated: new Date().toISOString()
    },
    tags: ['AI', 'Automation', 'Productivity'],
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    agencyId: 'agency-1',
    clientId: 'client-1',
    accountId: 'account-ig-1',
    platform: 'instagram',
    content: 'Behind the scenes at our innovation lab 💡 Working on the next generation of business automation tools. What would you like to see automated next? #Innovation #TechLife #BehindTheScenes',
    mediaUrls: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=500'],
    mediaType: 'image',
    postType: 'feed_post',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    timezone: 'America/New_York',
    tags: ['Innovation', 'TechLife', 'BehindTheScenes'],
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    agencyId: 'agency-1',
    clientId: 'client-1',
    accountId: 'account-li-1',
    platform: 'linkedin',
    content: 'The Future of Business Automation: 5 Trends to Watch in 2024\n\n1. AI-Powered Decision Making\n2. Hyper-Personalized Customer Experiences\n3. Seamless Integration Ecosystems\n4. Predictive Analytics Evolution\n5. Human-AI Collaboration Models\n\nWhat trends are you most excited about? Let me know in the comments! #BusinessAutomation #AI #DigitalTransformation',
    mediaUrls: [],
    mediaType: 'image',
    postType: 'article',
    status: 'draft',
    timezone: 'America/New_York',
    tags: ['BusinessAutomation', 'AI', 'DigitalTransformation'],
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    agencyId: 'agency-1',
    clientId: 'client-1',
    accountId: 'account-fb-1',
    platform: 'facebook',
    content: '🎯 Weekly Productivity Tip: Use automation for repetitive tasks and focus your energy on strategic thinking and creative problem-solving. Our clients save an average of 15 hours per week! #ProductivityTips #TimeManagement #WorkSmart',
    mediaUrls: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500'],
    mediaType: 'image',
    postType: 'feed_post',
    status: 'published',
    scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    timezone: 'America/New_York',
    metrics: {
      platform: 'facebook',
      postId: '4',
      likes: 189,
      comments: 24,
      shares: 45,
      impressions: 4230,
      reach: 2890,
      clicks: 98,
      reactions: { like: 156, love: 28, wow: 3, haha: 2, sad: 0, angry: 0 },
      lastUpdated: new Date().toISOString()
    },
    tags: ['ProductivityTips', 'TimeManagement', 'WorkSmart'],
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const generateMockAccounts = (): SocialMediaAccount[] => [
  {
    id: 'account-fb-1',
    agencyId: 'agency-1',
    clientId: 'client-1',
    platform: 'facebook',
    accountId: 'fb_page_123456789',
    accountName: 'TechCorp Solutions',
    username: 'techcorp.solutions',
    profilePicture: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
    accessToken: 'mock_access_token_fb',
    permissions: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
    isActive: true,
    isConnected: true,
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 'account-ig-1',
    agencyId: 'agency-1',
    clientId: 'client-1',
    platform: 'instagram',
    accountId: 'ig_business_123456789',
    accountName: 'TechCorp Solutions',
    username: 'techcorp.solutions',
    profilePicture: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
    accessToken: 'mock_access_token_ig',
    permissions: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'],
    isActive: true,
    isConnected: true,
    lastSync: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'account-li-1',
    agencyId: 'agency-1',
    clientId: 'client-1',
    platform: 'linkedin',
    accountId: 'li_company_123456789',
    accountName: 'TechCorp Solutions',
    username: 'techcorp-solutions',
    profilePicture: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
    accessToken: 'mock_access_token_li',
    permissions: ['w_member_social', 'r_organization_social', 'w_organization_social'],
    isActive: true,
    isConnected: true,
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

const generateMockAnalytics = (): Record<SocialPlatform, SocialMediaAnalytics> => ({
  facebook: {
    accountId: 'account-fb-1',
    platform: 'facebook',
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    },
    overview: {
      totalPosts: 25,
      totalEngagement: 3420,
      totalReach: 45600,
      totalImpressions: 78900,
      engagementRate: 7.5,
      averageEngagementPerPost: 136.8
    },
    growth: {
      followerGrowth: 450,
      followerGrowthRate: 12.3,
      engagementGrowth: 18.7,
      reachGrowth: 25.4
    },
    topPosts: [],
    topHashtags: [
      { hashtag: '#AI', usage: 15, engagement: 2340 },
      { hashtag: '#Automation', usage: 12, engagement: 1890 },
      { hashtag: '#Productivity', usage: 10, engagement: 1560 }
    ],
    performanceData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      posts: Math.floor(Math.random() * 3),
      engagement: Math.floor(Math.random() * 200) + 50,
      reach: Math.floor(Math.random() * 1000) + 200,
      impressions: Math.floor(Math.random() * 2000) + 500
    }))
  },
  instagram: {
    accountId: 'account-ig-1',
    platform: 'instagram',
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    },
    overview: {
      totalPosts: 32,
      totalEngagement: 5680,
      totalReach: 38400,
      totalImpressions: 65200,
      engagementRate: 14.8,
      averageEngagementPerPost: 177.5
    },
    growth: {
      followerGrowth: 680,
      followerGrowthRate: 15.7,
      engagementGrowth: 22.4,
      reachGrowth: 19.8
    },
    topPosts: [],
    topHashtags: [
      { hashtag: '#TechLife', usage: 18, engagement: 3200 },
      { hashtag: '#Innovation', usage: 14, engagement: 2890 },
      { hashtag: '#BehindTheScenes', usage: 11, engagement: 2340 }
    ],
    performanceData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      posts: Math.floor(Math.random() * 2) + 1,
      engagement: Math.floor(Math.random() * 300) + 100,
      reach: Math.floor(Math.random() * 800) + 300,
      impressions: Math.floor(Math.random() * 1500) + 600
    }))
  },
  linkedin: {
    accountId: 'account-li-1',
    platform: 'linkedin',
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    },
    overview: {
      totalPosts: 18,
      totalEngagement: 2840,
      totalReach: 28900,
      totalImpressions: 42300,
      engagementRate: 9.8,
      averageEngagementPerPost: 157.8
    },
    growth: {
      followerGrowth: 290,
      followerGrowthRate: 8.9,
      engagementGrowth: 16.2,
      reachGrowth: 21.7
    },
    topPosts: [],
    topHashtags: [
      { hashtag: '#BusinessAutomation', usage: 8, engagement: 1560 },
      { hashtag: '#DigitalTransformation', usage: 6, engagement: 1290 },
      { hashtag: '#Leadership', usage: 5, engagement: 890 }
    ],
    performanceData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      posts: Math.floor(Math.random() * 2),
      engagement: Math.floor(Math.random() * 150) + 50,
      reach: Math.floor(Math.random() * 600) + 200,
      impressions: Math.floor(Math.random() * 1000) + 400
    }))
  },
  youtube: {
    accountId: 'account-yt-1',
    platform: 'youtube',
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    },
    overview: {
      totalPosts: 4,
      totalEngagement: 890,
      totalReach: 15600,
      totalImpressions: 23400,
      engagementRate: 5.7,
      averageEngagementPerPost: 222.5
    },
    growth: {
      followerGrowth: 120,
      followerGrowthRate: 4.2,
      engagementGrowth: 28.9,
      reachGrowth: 35.6
    },
    topPosts: [],
    topHashtags: [],
    performanceData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      posts: Math.floor(Math.random() * 1),
      engagement: Math.floor(Math.random() * 100) + 20,
      reach: Math.floor(Math.random() * 400) + 100,
      impressions: Math.floor(Math.random() * 800) + 200
    }))
  }
});

export const useSocialMediaStore = create<SocialMediaStore>()(
  persist(
    (set, get) => ({
      // Initial state
      posts: generateMockPosts(),
      accounts: generateMockAccounts(),
      analytics: generateMockAnalytics(),
      campaigns: [],
      isLoading: false,
      error: null,

      // Post actions
      setPosts: (posts) => set({ posts }),
      
      addPost: (postForm) => {
        const newPost: SocialMediaPost = {
          id: Date.now().toString(),
          agencyId: 'agency-1',
          clientId: 'client-1',
          accountId: get().accounts.find(acc => postForm.platforms.includes(acc.platform))?.id || 'account-1',
          platform: postForm.platforms[0],
          content: postForm.content,
          mediaUrls: [], // Would be populated after file upload
          mediaType: postForm.mediaFiles.length > 0 ? 'image' : 'image',
          postType: postForm.postType,
          status: postForm.scheduledAt ? 'scheduled' : 'draft',
          scheduledAt: postForm.scheduledAt,
          timezone: postForm.timezone,
          tags: postForm.tags,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => ({ posts: [newPost, ...state.posts] }));
      },

      updatePost: (postId, updates) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? { ...post, ...updates, updatedAt: new Date().toISOString() }
              : post
          )
        }));
      },

      deletePost: (postId) => {
        set(state => ({
          posts: state.posts.filter(post => post.id !== postId)
        }));
      },

      duplicatePost: (originalPost) => {
        const duplicatedPost: SocialMediaPost = {
          ...originalPost,
          id: Date.now().toString(),
          content: originalPost.content + ' (Copy)',
          status: 'draft',
          scheduledAt: undefined,
          publishedAt: undefined,
          metrics: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => ({ posts: [duplicatedPost, ...state.posts] }));
      },

      publishPost: (postId) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? { 
                  ...post, 
                  status: 'published', 
                  publishedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString() 
                }
              : post
          )
        }));
      },

      pausePost: (postId) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? { ...post, status: 'draft', updatedAt: new Date().toISOString() }
              : post
          )
        }));
      },

      // Account actions
      setAccounts: (accounts) => set({ accounts }),
      
      addAccount: (accountForm) => {
        const newAccount: SocialMediaAccount = {
          id: Date.now().toString(),
          agencyId: 'agency-1',
          clientId: 'client-1',
          platform: accountForm.platform,
          accountId: accountForm.accountId || `${accountForm.platform}_${Date.now()}`,
          accountName: `New ${accountForm.platform} Account`,
          username: `new_${accountForm.platform}_account`,
          accessToken: accountForm.accessToken || 'mock_token',
          permissions: accountForm.permissions,
          isActive: true,
          isConnected: true,
          lastSync: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => ({ accounts: [...state.accounts, newAccount] }));
      },

      removeAccount: (accountId) => {
        set(state => ({
          accounts: state.accounts.filter(account => account.id !== accountId)
        }));
      },

      refreshAccount: (accountId) => {
        set(state => ({
          accounts: state.accounts.map(account =>
            account.id === accountId
              ? { ...account, lastSync: new Date().toISOString(), isConnected: true }
              : account
          )
        }));
      },

      // Analytics actions
      setAnalytics: (analytics) => set({ analytics }),

      // Campaign actions
      setCampaigns: (campaigns) => set({ campaigns }),
      
      addCampaign: (campaignData) => {
        const newCampaign: SocialMediaCampaign = {
          ...campaignData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => ({ campaigns: [...state.campaigns, newCampaign] }));
      },

      // UI actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error })
    }),
    {
      name: 'social-media-store',
      partialize: (state) => ({
        posts: state.posts,
        accounts: state.accounts,
        campaigns: state.campaigns
      })
    }
  )
);