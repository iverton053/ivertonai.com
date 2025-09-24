import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AutomationResult {
  id: string;
  type: string;
  name: string;
  data: any;
  timestamp: Date;
  status: 'fresh' | 'stale' | 'loading' | 'error';
  refreshInterval: number; // in minutes
  icon: string;
  color: string;
  lastError?: string;
  
  // Enhanced widget integration fields
  widgetType?: string;
  category: string;
  description: string;
  features: string[];
  webhookEndpoint: string;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecution?: Date;
  isWidgetLinked: boolean;
  
  // Advanced analytics
  insights?: {
    trend: 'improving' | 'declining' | 'stable';
    score: number;
    recommendations: string[];
    alerts: string[];
  };
  
  // Scheduling and automation
  schedule?: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    nextRun?: Date;
  };
}

export interface UserProfile {
  defaultDomain: string;
  companyName: string;
  industry: string;
  competitors: string[];
  keywords: string[];
  socialAccounts: {
    platform: string;
    handle: string;
  }[];
  lastUpdated: Date;
  isSetupComplete: boolean;
}

export interface AutomationHubState {
  userProfile: UserProfile;
  automationResults: Record<string, AutomationResult>;
  isHubOpen: boolean;
  isSetupOpen: boolean;
  lastGlobalRefresh: Date | null;
  
  // Enhanced state
  activeAutomationView: 'grid' | 'list' | 'categories';
  selectedCategory: string | null;
  automationMetrics: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    timeSaved: number;
  };
  
  // Actions
  setUserProfile: (profile: Partial<UserProfile>) => void;
  completeSetup: () => void;
  updateAutomationResult: (result: AutomationResult) => void;
  refreshAutomation: (automationId: string) => void;
  refreshAllAutomations: () => void;
  markAsStale: (automationId: string) => void;
  toggleHub: (isOpen?: boolean) => void;
  toggleSetup: (isOpen?: boolean) => void;
  getStaleAutomations: () => AutomationResult[];
  getFreshData: (automationType: string) => AutomationResult | null;
  
  // Enhanced actions
  setActiveView: (view: 'grid' | 'list' | 'categories') => void;
  setSelectedCategory: (category: string | null) => void;
  linkWidgetData: (automationId: string, widgetData: any) => void;
  scheduleAutomation: (automationId: string, schedule: AutomationResult['schedule']) => void;
  getAutomationsByCategory: (category: string) => AutomationResult[];
  getAutomationInsights: () => any;
  updateMetrics: () => void;
}

const defaultUserProfile: UserProfile = {
  defaultDomain: '',
  companyName: '',
  industry: '',
  competitors: [],
  keywords: [],
  socialAccounts: [],
  lastUpdated: new Date(),
  isSetupComplete: false,
};

// Enhanced automation types integrating widgets and workflows
const AUTOMATION_CONFIGS = {
  'seo-analysis': {
    name: 'SEO Ranking Tracker',
    icon: 'TrendingUp',
    color: 'from-green-500 to-green-700',
    refreshInterval: 60,
    widgetType: 'SEORankingWidget',
    category: 'SEO',
    description: 'Track keyword rankings, SERP features, and competitor positions',
    features: ['Keyword tracking', 'SERP analysis', 'Competitor monitoring', 'Position trends'],
    webhookEndpoint: '/webhook/seo-ranking'
  },
  'keyword-research': {
    name: 'Keyword Research Analysis',
    icon: 'Search',
    color: 'from-blue-500 to-blue-700',
    refreshInterval: 180,
    widgetType: 'KeywordResearchWidget',
    category: 'SEO',
    description: 'AI-powered keyword opportunities and search intent analysis',
    features: ['Keyword discovery', 'Intent analysis', 'Difficulty scoring', 'Opportunity mapping'],
    webhookEndpoint: '/webhook/keyword-research'
  },
  'content-gap-analysis': {
    name: 'Content Gap Analysis',
    icon: 'FileText',
    color: 'from-purple-500 to-purple-700',
    refreshInterval: 240,
    widgetType: 'ContentGapAnalysisWidget',
    category: 'Content',
    description: 'Identify content opportunities vs competitors',
    features: ['Gap identification', 'Topic suggestions', 'Competitor analysis', 'Content scoring'],
    webhookEndpoint: '/webhook/content-gap'
  },
  'backlink-analysis': {
    name: 'Backlink Analysis',
    icon: 'Link',
    color: 'from-teal-500 to-teal-700',
    refreshInterval: 360,
    widgetType: 'BacklinkAnalysisWidget',
    category: 'SEO',
    description: 'Monitor backlink profiles and link-building opportunities',
    features: ['Link monitoring', 'Quality assessment', 'Competitor links', 'Outreach targets'],
    webhookEndpoint: '/webhook/backlink-analysis'
  },
  'tech-stack-analysis': {
    name: 'Tech Stack Intelligence',
    icon: 'Cpu',
    color: 'from-indigo-500 to-indigo-700',
    refreshInterval: 720,
    widgetType: 'TechStackAnalyzerWidget',
    category: 'Intelligence',
    description: 'Analyze competitor technology stacks and trends',
    features: ['Technology detection', 'Stack comparison', 'Trend analysis', 'Migration tracking'],
    webhookEndpoint: '/webhook/tech-stack'
  },
  'social-media-trends': {
    name: 'Social Media Trends',
    icon: 'Hash',
    color: 'from-pink-500 to-pink-700',
    refreshInterval: 30,
    widgetType: 'TrendingHashtagsWidget',
    category: 'Social Media',
    description: 'Track trending hashtags and social media performance',
    features: ['Hashtag tracking', 'Trend analysis', 'Engagement metrics', 'Viral content detection'],
    webhookEndpoint: '/webhook/social-trends'
  },
  'market-intelligence': {
    name: 'Market Intelligence',
    icon: 'BarChart3',
    color: 'from-orange-500 to-orange-700',
    refreshInterval: 480,
    widgetType: 'MarketTrendWidget',
    category: 'Intelligence',
    description: 'Market trends and competitive intelligence analysis',
    features: ['Market analysis', 'Trend forecasting', 'Competitive landscape', 'Opportunity scoring'],
    webhookEndpoint: '/webhook/market-intel'
  },
  'automation-workflows': {
    name: 'Workflow Automation',
    icon: 'Zap',
    color: 'from-yellow-500 to-yellow-700',
    refreshInterval: 60,
    widgetType: 'AutomationWidget',
    category: 'Automation',
    description: 'Manage and monitor n8n workflow automations',
    features: ['Workflow management', 'Execution monitoring', 'Performance tracking', 'Error handling'],
    webhookEndpoint: '/webhook/workflows'
  }
};

export const useAutomationHubStore = create<AutomationHubState>()(
  persist(
    (set, get) => ({
      userProfile: defaultUserProfile,
      automationResults: {},
      isHubOpen: false,
      isSetupOpen: false,
      lastGlobalRefresh: null,
      
      // Enhanced state initialization
      activeAutomationView: 'grid',
      selectedCategory: null,
      automationMetrics: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0,
        timeSaved: 0,
      },

      setUserProfile: (profile) => {
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            ...profile,
            lastUpdated: new Date(),
          },
        }));
      },

      completeSetup: () => {
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            isSetupComplete: true,
            lastUpdated: new Date(),
          },
          isSetupOpen: false,
        }));
      },

      updateAutomationResult: (result) => {
        set((state) => ({
          automationResults: {
            ...state.automationResults,
            [result.id]: {
              ...result,
              timestamp: new Date(result.timestamp),
            },
          },
        }));
      },

      refreshAutomation: async (automationId) => {
        const state = get();
        const automation = state.automationResults[automationId];
        
        if (!automation) return;

        // Set loading status
        set((state) => ({
          automationResults: {
            ...state.automationResults,
            [automationId]: {
              ...automation,
              status: 'loading',
            },
          },
        }));

        try {
          // Simulate API call - replace with actual N8N webhook call
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Generate mock data based on automation type
          const mockData = generateMockData(automation.type, state.userProfile);
          
          set((state) => ({
            automationResults: {
              ...state.automationResults,
              [automationId]: {
                ...automation,
                data: mockData,
                timestamp: new Date(),
                status: 'fresh',
                lastError: undefined,
              },
            },
          }));
        } catch (error) {
          set((state) => ({
            automationResults: {
              ...state.automationResults,
              [automationId]: {
                ...automation,
                status: 'error',
                lastError: error instanceof Error ? error.message : 'Unknown error',
              },
            },
          }));
        }
      },

      refreshAllAutomations: async () => {
        const state = get();
        const automations = Object.values(state.automationResults);
        
        set({ lastGlobalRefresh: new Date() });
        
        // Refresh all automations in parallel
        await Promise.all(
          automations.map(automation => state.refreshAutomation(automation.id))
        );
      },

      markAsStale: (automationId) => {
        set((state) => {
          const automation = state.automationResults[automationId];
          if (!automation) return state;

          return {
            automationResults: {
              ...state.automationResults,
              [automationId]: {
                ...automation,
                status: 'stale',
              },
            },
          };
        });
      },

      toggleHub: (isOpen) => {
        set((state) => ({
          isHubOpen: isOpen !== undefined ? isOpen : !state.isHubOpen,
        }));
      },

      toggleSetup: (isOpen) => {
        set((state) => ({
          isSetupOpen: isOpen !== undefined ? isOpen : !state.isSetupOpen,
        }));
      },

      getStaleAutomations: () => {
        const state = get();
        return Object.values(state.automationResults).filter(
          automation => automation.status === 'stale' || isDataStale(automation)
        );
      },

      getFreshData: (automationType) => {
        const state = get();
        return Object.values(state.automationResults).find(
          automation => automation.type === automationType && automation.status === 'fresh'
        ) || null;
      },

      // Enhanced action implementations
      setActiveView: (view) => {
        set({ activeAutomationView: view });
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
      },

      linkWidgetData: (automationId, widgetData) => {
        set((state) => {
          const automation = state.automationResults[automationId];
          if (!automation) return state;

          return {
            automationResults: {
              ...state.automationResults,
              [automationId]: {
                ...automation,
                data: { ...automation.data, ...widgetData },
                isWidgetLinked: true,
                timestamp: new Date(),
                status: 'fresh' as const,
              },
            },
          };
        });
      },

      scheduleAutomation: (automationId, schedule) => {
        set((state) => {
          const automation = state.automationResults[automationId];
          if (!automation) return state;

          return {
            automationResults: {
              ...state.automationResults,
              [automationId]: {
                ...automation,
                schedule,
              },
            },
          };
        });
      },

      getAutomationsByCategory: (category) => {
        const state = get();
        return Object.values(state.automationResults).filter(
          automation => automation.category === category
        );
      },

      getAutomationInsights: () => {
        const state = get();
        const automations = Object.values(state.automationResults);
        
        return {
          totalAutomations: automations.length,
          activeAutomations: automations.filter(a => a.status === 'fresh').length,
          categories: [...new Set(automations.map(a => a.category))],
          topPerformers: automations
            .filter(a => a.successRate > 90)
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, 5),
          needsAttention: automations
            .filter(a => a.status === 'error' || a.successRate < 70)
            .length,
        };
      },

      updateMetrics: () => {
        try {
          const state = get();
          const automations = Object.values(state.automationResults);
          
          if (automations.length === 0) {
            console.log('No automations to calculate metrics for');
            return;
          }
          
          const totalExecutions = automations.reduce((sum, a) => sum + (a.executionCount || 0), 0);
          const successfulExecutions = automations.reduce((sum, a) => {
            const execCount = a.executionCount || 0;
            const successRate = a.successRate || 0;
            return sum + Math.floor(execCount * (successRate / 100));
          }, 0);
          const averageExecutionTime = automations.length > 0 
            ? automations.reduce((sum, a) => sum + (a.averageExecutionTime || 0), 0) / automations.length 
            : 0;
          
          set({
            automationMetrics: {
              totalExecutions,
              successfulExecutions,
              failedExecutions: totalExecutions - successfulExecutions,
              averageExecutionTime,
              timeSaved: Math.floor(totalExecutions * 15 / 60), // Assume 15 minutes saved per execution
            }
          });
          
          console.log('Metrics updated:', { totalExecutions, successfulExecutions, averageExecutionTime });
        } catch (error) {
          console.error('Error updating metrics:', error);
        }
      },
    }),
    {
      name: 'automation-hub-storage',
      partialize: (state) => ({
        userProfile: state.userProfile,
        automationResults: state.automationResults,
        lastGlobalRefresh: state.lastGlobalRefresh,
      }),
    }
  )
);

// Helper function to check if data is stale
function isDataStale(automation: AutomationResult): boolean {
  const now = new Date();
  const dataAge = (now.getTime() - new Date(automation.timestamp).getTime()) / (1000 * 60); // in minutes
  return dataAge > automation.refreshInterval;
}

// Mock data generator for different automation types
function generateMockData(automationType: string, userProfile: UserProfile) {
  const domain = userProfile.defaultDomain;
  
  switch (automationType) {
    case 'seo-analysis':
      return {
        domain,
        seoScore: Math.floor(Math.random() * 40) + 60,
        totalKeywords: Math.floor(Math.random() * 100) + 50,
        rankingKeywords: Math.floor(Math.random() * 50) + 25,
        backlinks: Math.floor(Math.random() * 5000) + 1000,
        organicTraffic: Math.floor(Math.random() * 10000) + 5000,
        issues: Math.floor(Math.random() * 10) + 1,
        improvements: Math.floor(Math.random() * 20) + 5,
      };
    
    case 'competitor-intel':
      return {
        competitors: userProfile.competitors,
        marketPosition: Math.floor(Math.random() * 5) + 1,
        gapOpportunities: Math.floor(Math.random() * 15) + 5,
        techStackChanges: Math.floor(Math.random() * 3) + 1,
        contentGaps: Math.floor(Math.random() * 10) + 3,
        newCampaigns: Math.floor(Math.random() * 5) + 1,
      };
    
    case 'social-media-trends':
    case 'social-media':
      return {
        platforms: userProfile.socialAccounts.length > 0 ? userProfile.socialAccounts.map(acc => ({
          platform: acc.platform,
          handle: acc.handle,
          followers: Math.floor(Math.random() * 10000) + 1000,
          engagement: (Math.random() * 5 + 1).toFixed(1),
          growth: Math.floor(Math.random() * 20) - 10,
          bestPostTime: `${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        })) : [
          { platform: 'LinkedIn', handle: '@company', followers: 2500, engagement: '3.2', growth: 8, bestPostTime: '9:00 AM' },
          { platform: 'Twitter', handle: '@company', followers: 1200, engagement: '2.8', growth: -2, bestPostTime: '2:00 PM' }
        ],
        totalEngagement: (Math.random() * 5 + 1).toFixed(1),
        totalGrowth: Math.floor(Math.random() * 30) - 15,
        trendingHashtags: ['#automation', '#productivity', '#ai', '#workflow'],
        viralContent: Math.floor(Math.random() * 5) + 1,
      };

    case 'keyword-research':
      return {
        totalKeywords: Math.floor(Math.random() * 200) + 100,
        highVolumeKeywords: Math.floor(Math.random() * 50) + 25,
        lowCompetition: Math.floor(Math.random() * 30) + 15,
        intentAnalysis: {
          commercial: Math.floor(Math.random() * 40) + 20,
          informational: Math.floor(Math.random() * 50) + 30,
          navigational: Math.floor(Math.random() * 20) + 10,
        },
        opportunities: Math.floor(Math.random() * 25) + 10,
      };

    case 'content-gap-analysis':
      return {
        totalGaps: Math.floor(Math.random() * 50) + 20,
        highPriorityGaps: Math.floor(Math.random() * 15) + 5,
        topicClusters: Math.floor(Math.random() * 10) + 5,
        competitorAdvantage: Math.floor(Math.random() * 30) + 10,
        contentScore: Math.floor(Math.random() * 40) + 60,
      };

    case 'backlink-analysis':
      return {
        totalBacklinks: Math.floor(Math.random() * 2000) + 500,
        qualityScore: Math.floor(Math.random() * 40) + 60,
        newLinks: Math.floor(Math.random() * 20) + 5,
        lostLinks: Math.floor(Math.random() * 10) + 2,
        domains: Math.floor(Math.random() * 100) + 50,
      };

    case 'tech-stack-analysis':
      return {
        technologies: Math.floor(Math.random() * 25) + 15,
        newTech: Math.floor(Math.random() * 5) + 1,
        migrations: Math.floor(Math.random() * 3),
        securityScore: Math.floor(Math.random() * 30) + 70,
        performanceScore: Math.floor(Math.random() * 40) + 60,
      };

    case 'market-intelligence':
      return {
        marketSize: Math.floor(Math.random() * 500) + 100,
        growthRate: (Math.random() * 20 + 5).toFixed(1),
        marketShare: Math.floor(Math.random() * 15) + 5,
        competitors: Math.floor(Math.random() * 20) + 10,
        trends: Math.floor(Math.random() * 10) + 5,
      };

    case 'automation-workflows':
      return {
        activeWorkflows: Math.floor(Math.random() * 15) + 5,
        executionsToday: Math.floor(Math.random() * 100) + 20,
        successRate: Math.floor(Math.random() * 20) + 80,
        avgExecutionTime: Math.floor(Math.random() * 30) + 10,
        timeSaved: Math.floor(Math.random() * 40) + 20,
      };
    
    default:
      return {
        domain,
        timestamp: new Date(),
        status: 'completed',
        metrics: Math.floor(Math.random() * 100),
      };
  }
}

// Initialize default automations with enhanced data
export const initializeDefaultAutomations = () => {
  try {
    const store = useAutomationHubStore.getState();
    
    console.log('Initializing default automations...', Object.keys(AUTOMATION_CONFIGS));
    
    Object.entries(AUTOMATION_CONFIGS).forEach(([type, config]) => {
      const automationId = `${type}-default`;
      
      try {
        if (!store.automationResults[automationId]) {
          console.log(`Creating automation: ${automationId}`, config);
          
          store.updateAutomationResult({
            id: automationId,
            type,
            name: config.name,
            data: null,
            timestamp: new Date(),
            status: 'stale',
            refreshInterval: config.refreshInterval,
            icon: config.icon,
            color: config.color,
        
        // Enhanced fields
        widgetType: config.widgetType,
        category: config.category,
        description: config.description,
        features: config.features,
        webhookEndpoint: config.webhookEndpoint,
        executionCount: Math.floor(Math.random() * 50) + 10,
        successRate: Math.floor(Math.random() * 20) + 80,
        averageExecutionTime: Math.floor(Math.random() * 30) + 15,
        lastExecution: new Date(Date.now() - Math.random() * 86400000),
        isWidgetLinked: false,
        
        insights: {
          trend: Math.random() > 0.5 ? 'improving' : Math.random() > 0.3 ? 'stable' : 'declining',
          score: Math.floor(Math.random() * 40) + 60,
          recommendations: [
            'Optimize refresh frequency for better performance',
            'Consider scheduling automation during peak hours',
            'Review data quality and accuracy'
          ],
          alerts: Math.random() > 0.7 ? ['High execution time detected'] : []
        },
        
        schedule: {
          enabled: Math.random() > 0.5,
          frequency: ['hourly', 'daily', 'weekly'][Math.floor(Math.random() * 3)] as 'hourly' | 'daily' | 'weekly',
          nextRun: new Date(Date.now() + Math.random() * 86400000)
        }
      });
        } else {
          console.log(`Automation already exists: ${automationId}`);
        }
      } catch (error) {
        console.error(`Error creating automation ${automationId}:`, error);
      }
    });
    
    // Update metrics after initialization
    console.log('Updating metrics...');
    store.updateMetrics();
    console.log('Default automations initialized successfully');
    
  } catch (error) {
    console.error('Error initializing default automations:', error);
    throw new Error(`Failed to initialize automations: ${error.message}`);
  }
};