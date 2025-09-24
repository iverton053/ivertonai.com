import { create } from 'zustand';
import { mlService, PredictionResult, TimeSeriesPrediction } from '../services/mlService';
import { openaiService } from '../services/openaiService';

export interface PredictiveAnalyticsState {
  // Predictions
  churnPredictions: Record<string, PredictionResult>;
  revenueForecast: TimeSeriesPrediction | null;
  seoOpportunities: PredictionResult[];
  performanceTrends: any;
  competitorAnalysis: any;

  // AI Insights
  insights: {
    general: string;
    churn: string;
    revenue: string;
    seo: string;
    recommendations: string[];
  };

  // Natural Language Interface
  chatHistory: Array<{
    query: string;
    response: string;
    timestamp: Date;
  }>;

  // Loading states
  loading: {
    churn: boolean;
    revenue: boolean;
    seo: boolean;
    trends: boolean;
    insights: boolean;
    chat: boolean;
  };

  // Error handling
  errors: {
    churn: string | null;
    revenue: string | null;
    seo: string | null;
    trends: string | null;
    insights: string | null;
  };

  // Settings
  settings: {
    autoRefresh: boolean;
    refreshInterval: number; // minutes
    confidenceThreshold: number;
    predictionHorizon: number; // months
    enableAIInsights: boolean;
  };

  // Actions
  predictChurn: (clientId: string, metrics: any) => Promise<void>;
  forecastRevenue: (historicalData: number[], months?: number) => Promise<void>;
  analyzeSEOOpportunities: (seoData: any) => Promise<void>;
  analyzePerformanceTrends: (performanceData: any[]) => Promise<void>;
  analyzeCompetitors: (competitorData: any) => Promise<void>;
  
  // AI Insights Actions
  generateInsights: () => Promise<void>;
  processNaturalLanguageQuery: (query: string) => Promise<void>;
  
  // Utility Actions
  refreshAllPredictions: () => Promise<void>;
  clearErrors: () => void;
  updateSettings: (newSettings: Partial<PredictiveAnalyticsState['settings']>) => void;
}

export const usePredictiveAnalyticsStore = create<PredictiveAnalyticsState>((set, get) => ({
  // Initial State
  churnPredictions: {},
  revenueForecast: null,
  seoOpportunities: [],
  performanceTrends: null,
  competitorAnalysis: null,

  insights: {
    general: '',
    churn: '',
    revenue: '',
    seo: '',
    recommendations: []
  },

  chatHistory: [],

  loading: {
    churn: false,
    revenue: false,
    seo: false,
    trends: false,
    insights: false,
    chat: false
  },

  errors: {
    churn: null,
    revenue: null,
    seo: null,
    trends: null,
    insights: null
  },

  settings: {
    autoRefresh: false, // Disable auto-refresh by default to prevent performance issues
    refreshInterval: 60, // 60 minutes - increased interval
    confidenceThreshold: 0.7,
    predictionHorizon: 6, // 6 months
    enableAIInsights: true
  },

  // Actions
  predictChurn: async (clientId: string, metrics: any) => {
    set(state => ({
      loading: { ...state.loading, churn: true },
      errors: { ...state.errors, churn: null }
    }));

    try {
      const prediction = await mlService.predictClientChurn(metrics);
      
      set(state => ({
        churnPredictions: {
          ...state.churnPredictions,
          [clientId]: prediction
        },
        loading: { ...state.loading, churn: false }
      }));

      // Generate AI insights if enabled
      if (get().settings.enableAIInsights) {
        try {
          const churnInsight = await openaiService.explainPrediction(prediction, metrics);
          set(state => ({
            insights: { ...state.insights, churn: churnInsight }
          }));
        } catch (error) {
          console.warn('Failed to generate churn insights:', error);
        }
      }
    } catch (error) {
      console.error('Churn prediction error:', error);
      set(state => ({
        loading: { ...state.loading, churn: false },
        errors: { ...state.errors, churn: 'Failed to predict churn risk' }
      }));
    }
  },

  forecastRevenue: async (historicalData: number[], months = 6) => {
    set(state => ({
      loading: { ...state.loading, revenue: true },
      errors: { ...state.errors, revenue: null }
    }));

    try {
      const forecast = await mlService.predictRevenue(historicalData, months);
      
      set(state => ({
        revenueForecast: forecast,
        loading: { ...state.loading, revenue: false }
      }));

      // Generate AI insights
      if (get().settings.enableAIInsights) {
        try {
          const revenueInsight = await openaiService.generateInsights(forecast, 'revenue forecast');
          set(state => ({
            insights: { ...state.insights, revenue: revenueInsight }
          }));
        } catch (error) {
          console.warn('Failed to generate revenue insights:', error);
        }
      }
    } catch (error) {
      console.error('Revenue forecast error:', error);
      set(state => ({
        loading: { ...state.loading, revenue: false },
        errors: { ...state.errors, revenue: 'Failed to forecast revenue' }
      }));
    }
  },

  analyzeSEOOpportunities: async (seoData: any) => {
    set(state => ({
      loading: { ...state.loading, seo: true },
      errors: { ...state.errors, seo: null }
    }));

    try {
      const opportunities = await mlService.predictSEOOpportunities(seoData);
      
      set(state => ({
        seoOpportunities: opportunities,
        loading: { ...state.loading, seo: false }
      }));

      // Generate AI insights
      if (get().settings.enableAIInsights) {
        try {
          const seoInsight = await openaiService.generateInsights(opportunities, 'SEO opportunities');
          set(state => ({
            insights: { ...state.insights, seo: seoInsight }
          }));
        } catch (error) {
          console.warn('Failed to generate SEO insights:', error);
        }
      }
    } catch (error) {
      console.error('SEO analysis error:', error);
      set(state => ({
        loading: { ...state.loading, seo: false },
        errors: { ...state.errors, seo: 'Failed to analyze SEO opportunities' }
      }));
    }
  },

  analyzePerformanceTrends: async (performanceData: any[]) => {
    set(state => ({
      loading: { ...state.loading, trends: true },
      errors: { ...state.errors, trends: null }
    }));

    try {
      const trends = await mlService.analyzePerformanceTrends(performanceData);
      
      set(state => ({
        performanceTrends: trends,
        loading: { ...state.loading, trends: false }
      }));
    } catch (error) {
      console.error('Performance trends error:', error);
      set(state => ({
        loading: { ...state.loading, trends: false },
        errors: { ...state.errors, trends: 'Failed to analyze performance trends' }
      }));
    }
  },

  analyzeCompetitors: async (competitorData: any) => {
    try {
      const analysis = await mlService.analyzeCompetitorTrends(competitorData);
      set(state => ({ competitorAnalysis: analysis }));
    } catch (error) {
      console.error('Competitor analysis error:', error);
    }
  },

  generateInsights: async () => {
    const state = get();
    if (!state.settings.enableAIInsights) return;

    set(state => ({
      loading: { ...state.loading, insights: true }
    }));

    try {
      const allData = {
        churn: state.churnPredictions,
        revenue: state.revenueForecast,
        seo: state.seoOpportunities,
        trends: state.performanceTrends,
        competitors: state.competitorAnalysis
      };

      const [generalInsight, recommendations] = await Promise.all([
        openaiService.generateInsights(allData, 'comprehensive business analysis'),
        openaiService.generateRecommendations(allData)
      ]);

      set(state => ({
        insights: {
          ...state.insights,
          general: generalInsight,
          recommendations
        },
        loading: { ...state.loading, insights: false }
      }));
    } catch (error) {
      console.error('Insights generation error:', error);
      set(state => ({
        loading: { ...state.loading, insights: false }
      }));
    }
  },

  processNaturalLanguageQuery: async (query: string) => {
    set(state => ({
      loading: { ...state.loading, chat: true }
    }));

    try {
      const state = get();
      const contextData = {
        churn: state.churnPredictions,
        revenue: state.revenueForecast,
        seo: state.seoOpportunities,
        trends: state.performanceTrends
      };

      const response = await openaiService.processNaturalLanguageQuery(query, contextData);
      
      set(state => ({
        chatHistory: [
          ...state.chatHistory,
          {
            query,
            response,
            timestamp: new Date()
          }
        ],
        loading: { ...state.loading, chat: false }
      }));
    } catch (error) {
      console.error('Natural language query error:', error);
      set(state => ({
        chatHistory: [
          ...state.chatHistory,
          {
            query,
            response: 'Sorry, I couldn\'t process your query right now.',
            timestamp: new Date()
          }
        ],
        loading: { ...state.loading, chat: false }
      }));
    }
  },

  refreshAllPredictions: async () => {
    const actions = get();
    const state = get();
    
    // Prevent multiple simultaneous refreshes
    if (Object.values(state.loading).some(Boolean)) {
      console.log('Refresh already in progress, skipping...');
      return;
    }
    
    try {
      // Sample client metrics for demonstration
      const sampleClientMetrics = {
        login_frequency: 0.8,
        feature_usage: 0.7,
        support_tickets: 2,
        last_activity_days: 5,
        payment_delays: 0,
        engagement_score: 0.75,
        satisfaction_score: 0.8,
        contract_duration: 12
      };

      const sampleRevenueData = Array.from({ length: 12 }, () => 
        Math.random() * 50000 + 30000
      );

      const sampleSEOData = {
        keywords: [
          {
            keyword: 'digital marketing',
            search_volume: 8100,
            competition: 0.8,
            current_rank: 15,
            cpc: 2.50
          }
        ],
        domain_authority: 65,
        page_authority: 58
      };

      // Run predictions sequentially to avoid overwhelming the system
      console.log('Starting churn prediction...');
      await actions.predictChurn('sample-client', sampleClientMetrics);
      
      console.log('Starting revenue forecast...');
      await actions.forecastRevenue(sampleRevenueData);
      
      console.log('Starting SEO analysis...');
      await actions.analyzeSEOOpportunities(sampleSEOData);

      // Generate comprehensive insights with timeout
      console.log('Generating insights...');
      const insightsPromise = actions.generateInsights();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Insights generation timeout')), 10000)
      );
      
      try {
        await Promise.race([insightsPromise, timeoutPromise]);
      } catch (error) {
        console.warn('Insights generation failed or timed out:', error);
      }
      
      console.log('Predictions refresh completed');
    } catch (error) {
      console.error('Failed to refresh predictions:', error);
      // Clear loading states on error
      set(state => ({
        loading: {
          churn: false,
          revenue: false,
          seo: false,
          trends: false,
          insights: false,
          chat: false
        }
      }));
    }
  },

  clearErrors: () => {
    set(state => ({
      errors: {
        churn: null,
        revenue: null,
        seo: null,
        trends: null,
        insights: null
      }
    }));
  },

  updateSettings: (newSettings: Partial<PredictiveAnalyticsState['settings']>) => {
    set(state => ({
      settings: { ...state.settings, ...newSettings }
    }));
  }
}));

// Auto-refresh functionality
let refreshInterval: NodeJS.Timeout | null = null;

export const startAutoRefresh = () => {
  const store = usePredictiveAnalyticsStore.getState();
  
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  if (store.settings.autoRefresh) {
    refreshInterval = setInterval(() => {
      store.refreshAllPredictions();
    }, store.settings.refreshInterval * 60 * 1000);
  }
};

export const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};