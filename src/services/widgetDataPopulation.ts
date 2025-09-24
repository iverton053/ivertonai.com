import { OnboardingFormData } from '../types/onboarding';
import { WidgetDataManager } from '../utils/widgetDataManager';

/**
 * Service to populate widget data based on client onboarding information
 * This bridges the gap between client data and widget default values
 */
export class WidgetDataPopulationService {

  /**
   * Populate all widgets with client-specific data from onboarding
   */
  static async populateAllWidgets(clientId: string, onboardingData: Partial<OnboardingFormData>) {
    try {
      console.log('Populating widgets with client data:', clientId);

      // Create widget data for each category
      await this.populateAnalyticsWidgets(clientId, onboardingData);
      await this.populateSEOWidgets(clientId, onboardingData);
      await this.populateSocialMediaWidgets(clientId, onboardingData);
      await this.populateAdvertisingWidgets(clientId, onboardingData);
      await this.populateAutomationWidgets(clientId, onboardingData);
      await this.populateReportingWidgets(clientId, onboardingData);

      console.log('Widget data population completed for client:', clientId);
      return true;
    } catch (error) {
      console.error('Error populating widget data:', error);
      return false;
    }
  }

  /**
   * Populate analytics and performance widgets
   */
  private static async populateAnalyticsWidgets(clientId: string, data: Partial<OnboardingFormData>) {
    // Performance Metrics Widget
    const performanceData = {
      clientId: clientId,
      website: data.basicInfo?.website,
      googleAnalyticsId: data.seoData?.googleAnalyticsId,
      goals: data.businessGoals?.primaryGoals || [],
      targetAudience: data.businessGoals?.targetAudience,
      monthlyBudget: data.businessGoals?.monthlyBudget,
      industry: data.basicInfo?.industry,
      // Default metrics that will be updated with real data
      metrics: {
        monthly_visitors: 0,
        conversion_rate: 0,
        avg_session_duration: 0,
        bounce_rate: 0,
        revenue: 0
      }
    };

    WidgetDataManager.saveWidgetData(
      `performance-${clientId}`,
      'PerformanceMetricsWidget',
      performanceData
    );
  }

  /**
   * Populate SEO-related widgets
   */
  private static async populateSEOWidgets(clientId: string, data: Partial<OnboardingFormData>) {
    // SEO Ranking Widget
    const seoRankingData = {
      clientId: clientId,
      website: data.basicInfo?.website,
      targetKeywords: data.seoData?.targetKeywords || [],
      competitors: data.seoData?.competitors || [],
      googleAnalyticsId: data.seoData?.googleAnalyticsId,
      googleSearchConsoleId: data.seoData?.googleSearchConsoleId,
      // Default rankings that will be updated
      rankings: data.seoData?.targetKeywords?.map(keyword => ({
        keyword: keyword,
        position: 0,
        previousPosition: 0,
        trend: 'stable',
        searchVolume: 0,
        difficulty: 'medium'
      })) || []
    };

    WidgetDataManager.saveWidgetData(
      `seo-ranking-${clientId}`,
      'SEORankingWidget',
      seoRankingData
    );

    // Keyword Research Widget
    const keywordData = {
      clientId: clientId,
      industry: data.basicInfo?.industry,
      targetKeywords: data.seoData?.targetKeywords || [],
      competitors: data.seoData?.competitors || [],
      businessGoals: data.businessGoals?.primaryGoals || []
    };

    WidgetDataManager.saveWidgetData(
      `keyword-research-${clientId}`,
      'KeywordResearchWidget',
      keywordData
    );
  }

  /**
   * Populate social media widgets
   */
  private static async populateSocialMediaWidgets(clientId: string, data: Partial<OnboardingFormData>) {
    const socialMediaData = {
      clientId: clientId,
      accounts: {
        facebook: data.socialMedia?.facebook,
        instagram: data.socialMedia?.instagram,
        linkedin: data.socialMedia?.linkedin,
        twitter: data.socialMedia?.twitter,
        youtube: data.socialMedia?.youtube,
        tiktok: data.socialMedia?.tiktok
      },
      postingSchedule: data.socialMedia?.postingSchedule,
      contentTypes: data.socialMedia?.contentTypes || [],
      brandVoice: data.branding?.brandVoice,
      targetAudience: data.businessGoals?.targetAudience,
      industry: data.basicInfo?.industry
    };

    WidgetDataManager.saveWidgetData(
      `social-media-${clientId}`,
      'SocialMediaWidget',
      socialMediaData
    );

    // Trending Hashtags Widget
    const hashtagData = {
      clientId: clientId,
      industry: data.basicInfo?.industry,
      targetKeywords: data.seoData?.targetKeywords || [],
      socialAccounts: data.socialMedia,
      contentTypes: data.socialMedia?.contentTypes || []
    };

    WidgetDataManager.saveWidgetData(
      `trending-hashtags-${clientId}`,
      'TrendingHashtagsWidget',
      hashtagData
    );
  }

  /**
   * Populate advertising widgets
   */
  private static async populateAdvertisingWidgets(clientId: string, data: Partial<OnboardingFormData>) {
    const adData = {
      clientId: clientId,
      platforms: {
        googleAds: data.advertising?.googleAds,
        facebookAds: data.advertising?.facebookAds,
        linkedinAds: data.advertising?.linkedinAds,
        microsoftAds: data.advertising?.microsoftAds
      },
      monthlyBudget: data.businessGoals?.monthlyBudget,
      targetAudience: data.businessGoals?.targetAudience,
      goals: data.businessGoals?.primaryGoals || [],
      industry: data.basicInfo?.industry,
      website: data.basicInfo?.website
    };

    WidgetDataManager.saveWidgetData(
      `advertising-${clientId}`,
      'AdvertisingWidget',
      adData
    );
  }

  /**
   * Populate automation widgets
   */
  private static async populateAutomationWidgets(clientId: string, data: Partial<OnboardingFormData>) {
    const automationData = {
      clientId: clientId,
      crmIntegration: data.marketing?.crmIntegration,
      emailMarketing: data.marketing?.emailMarketing,
      leadMagnets: data.marketing?.leadMagnets || [],
      webhooks: data.technical?.webhooks || [],
      integrations: data.technical?.integrations || [],
      workflows: [], // Will be populated as workflows are created
      businessGoals: data.businessGoals?.primaryGoals || []
    };

    WidgetDataManager.saveWidgetData(
      `automation-${clientId}`,
      'AutomationWidget',
      automationData
    );

    // Workflow Status Widget
    const workflowData = {
      clientId: clientId,
      workflows: [], // Will be populated with actual n8n workflows
      crmIntegration: data.marketing?.crmIntegration,
      emailMarketing: data.marketing?.emailMarketing,
      socialAccounts: data.socialMedia
    };

    WidgetDataManager.saveWidgetData(
      `workflow-status-${clientId}`,
      'WorkflowStatusWidget',
      workflowData
    );
  }

  /**
   * Populate reporting widgets
   */
  private static async populateReportingWidgets(clientId: string, data: Partial<OnboardingFormData>) {
    const reportingData = {
      clientId: clientId,
      frequency: data.reporting?.frequency || 'monthly',
      recipients: data.reporting?.recipients || [],
      communicationPrefs: data.reporting?.communicationPrefs,
      customMetrics: data.reporting?.customMetrics || [],
      dashboardPrefs: data.reporting?.dashboardPrefs,
      timezone: data.basicInfo?.businessLocation?.timezone || 'UTC'
    };

    WidgetDataManager.saveWidgetData(
      `reporting-${clientId}`,
      'ReportingWidget',
      reportingData
    );
  }

  /**
   * Update widget data when client information changes
   */
  static async updateWidgetData(clientId: string, updatedData: Partial<OnboardingFormData>) {
    // Re-populate all widgets with updated data
    return await this.populateAllWidgets(clientId, updatedData);
  }

  /**
   * Clear all widget data for a client (useful for cleanup)
   */
  static clearClientWidgetData(clientId: string) {
    const widgetTypes = [
      'performance', 'seo-ranking', 'keyword-research', 'social-media',
      'trending-hashtags', 'advertising', 'automation', 'workflow-status', 'reporting'
    ];

    widgetTypes.forEach(type => {
      const widgetId = `${type}-${clientId}`;
      WidgetDataManager.clearWidgetData(widgetId);
    });
  }

  /**
   * Generate mock data for immediate widget display
   */
  static generateMockDataForWidgets(clientId: string, data: Partial<OnboardingFormData>) {
    return {
      performanceMetrics: {
        monthly_visitors: Math.floor(Math.random() * 50000) + 10000,
        conversion_rate: (Math.random() * 5 + 1).toFixed(2),
        avg_session_duration: Math.floor(Math.random() * 300) + 120,
        bounce_rate: (Math.random() * 40 + 20).toFixed(2),
        revenue: data.businessGoals?.monthlyBudget ? data.businessGoals.monthlyBudget * (Math.random() * 3 + 1) : 0
      },
      seoRankings: data.seoData?.targetKeywords?.map((keyword, index) => ({
        keyword: keyword,
        position: Math.floor(Math.random() * 50) + 1,
        previousPosition: Math.floor(Math.random() * 50) + 1,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
        searchVolume: Math.floor(Math.random() * 10000) + 1000,
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
      })) || [],
      socialMediaStats: {
        followers: Math.floor(Math.random() * 10000) + 1000,
        engagement_rate: (Math.random() * 5 + 1).toFixed(2),
        reach: Math.floor(Math.random() * 50000) + 5000,
        posts_this_month: Math.floor(Math.random() * 30) + 10
      }
    };
  }
}