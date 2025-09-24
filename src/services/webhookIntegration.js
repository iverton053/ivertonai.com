// n8n Webhook Integration Service
// Handles bi-directional communication between dashboard widgets and n8n workflows

import { useAutomationHubStore } from '../stores/automationHubStore';
import { WidgetDataManager } from '../utils/widgetDataManager';

export class WebhookIntegrationService {
  constructor() {
    this.baseURL = process.env.REACT_APP_N8N_WEBHOOK_BASE || 'https://your-n8n-instance.com/webhook';
    this.apiKey = process.env.REACT_APP_N8N_API_KEY || '';
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // INCOMING WEBHOOKS - n8n workflows send data to dashboard
  
  /**
   * Process incoming webhook data from n8n workflows
   * This updates the automation store and widget data
   */
  async processIncomingWebhook(webhookType, data, workflowId) {
    try {
      const { updateAutomationData } = useAutomationHubStore.getState();
      
      // Validate webhook data
      if (!this.validateWebhookData(webhookType, data)) {
        throw new Error(`Invalid webhook data for type: ${webhookType}`);
      }

      // Process based on webhook type
      switch (webhookType) {
        case 'seo-analysis':
          await this.processSEOAnalysisWebhook(data, workflowId);
          break;
          
        case 'competitor-intel':
          await this.processCompetitorIntelWebhook(data, workflowId);
          break;
          
        case 'performance-metrics':
          await this.processPerformanceWebhook(data, workflowId);
          break;
          
        case 'content-gap-analysis':
          await this.processContentGapWebhook(data, workflowId);
          break;
          
        case 'keyword-research':
          await this.processKeywordWebhook(data, workflowId);
          break;
          
        default:
          console.warn(`Unknown webhook type: ${webhookType}`);
      }

      // Update automation store
      updateAutomationData(workflowId, {
        data: data,
        lastUpdated: new Date().toISOString(),
        status: 'fresh',
        executionCount: (useAutomationHubStore.getState().automationResults[workflowId]?.executionCount || 0) + 1
      });

      return { success: true, message: 'Webhook processed successfully' };
      
    } catch (error) {
      console.error('Webhook processing error:', error);
      return { success: false, error: error.message };
    }
  }

  // OUTGOING WEBHOOKS - Dashboard triggers n8n workflows

  /**
   * Trigger n8n workflow from dashboard
   * Premium feature only
   */
  async triggerN8NWorkflow(workflowName, parameters = {}, userPlan = 'basic') {
    if (userPlan === 'basic') {
      throw new Error('Workflow triggering is a premium feature');
    }

    const workflowEndpoints = {
      'seo-analysis': '/seo-audit-trigger',
      'competitor-analysis': '/competitor-scan-trigger', 
      'content-gap-analysis': '/content-gap-trigger',
      'keyword-research': '/keyword-research-trigger',
      'performance-analysis': '/performance-check-trigger'
    };

    const endpoint = workflowEndpoints[workflowName];
    if (!endpoint) {
      throw new Error(`Unknown workflow: ${workflowName}`);
    }

    try {
      const response = await this.makeWebhookRequest('POST', endpoint, {
        ...parameters,
        timestamp: new Date().toISOString(),
        triggered_by: 'dashboard',
        user_plan: userPlan
      });

      // Update automation store to show workflow is running
      const { updateAutomationStatus } = useAutomationHubStore.getState();
      updateAutomationStatus(workflowName, 'loading');

      return response;
    } catch (error) {
      console.error(`Failed to trigger workflow ${workflowName}:`, error);
      throw error;
    }
  }

  // WEBHOOK DATA PROCESSORS

  async processSEOAnalysisWebhook(data, workflowId) {
    const seoData = {
      seoScore: data.overall_score || 0,
      mobileScore: data.mobile_score || 0,
      desktopScore: data.desktop_score || 0,
      avgLoadTime: data.avg_load_time || 0,
      keyword_rankings: data.keyword_rankings || [],
      technical_issues: data.technical_issues || [],
      performanceMetrics: data.performance_metrics || {},
      recommendations: data.recommendations || []
    };

    // Save to widget data manager for persistence
    WidgetDataManager.saveWidgetData('seo-widget', 'seo-analysis', seoData);
    
    console.log('SEO Analysis webhook processed:', seoData);
    return seoData;
  }

  async processCompetitorIntelWebhook(data, workflowId) {
    const competitorData = {
      competitors: data.competitors || [],
      alerts: data.alerts || [],
      summary: data.summary || {},
      market_analysis: data.market_analysis || {},
      pricing_insights: data.pricing_insights || []
    };

    WidgetDataManager.saveWidgetData('competitor-widget', 'competitor-intel', competitorData);
    
    console.log('Competitor Intelligence webhook processed:', competitorData);
    return competitorData;
  }

  async processPerformanceWebhook(data, workflowId) {
    const performanceData = {
      website: {
        overall_score: data.performance_score || 0,
        traffic_trend: data.traffic_trend || '0%',
        bounce_rate: data.bounce_rate || '0%',
        avg_session: data.avg_session_duration || '0:00',
        conversion_rate: data.conversion_rate || '0%',
        page_speed: data.page_speed_score || 0
      },
      metrics: {
        organic_traffic: data.organic_traffic || 0,
        page_views: data.page_views || 0,
        unique_visitors: data.unique_visitors || 0,
        goal_completions: data.goal_completions || 0,
        top_pages: data.top_pages || []
      },
      alerts: data.performance_alerts || []
    };

    WidgetDataManager.saveWidgetData('performance-widget', 'performance-analytics', performanceData);
    
    console.log('Performance Analytics webhook processed:', performanceData);
    return performanceData;
  }

  async processContentGapWebhook(data, workflowId) {
    const contentData = {
      content_gaps: {
        high_priority: data.high_priority_gaps || [],
        medium_priority: data.medium_priority_gaps || [],
        low_priority: data.low_priority_gaps || []
      },
      kpi_metrics: data.kpi_metrics || {},
      strategic_insights: data.strategic_insights || {},
      competitor_content: data.competitor_content || []
    };

    WidgetDataManager.saveWidgetData('content-gap-widget', 'content-gap-analysis', contentData);
    
    console.log('Content Gap Analysis webhook processed:', contentData);
    return contentData;
  }

  async processKeywordWebhook(data, workflowId) {
    const keywordData = {
      keyword_opportunities: data.opportunities || [],
      search_trends: data.search_trends || [],
      competitor_keywords: data.competitor_keywords || [],
      difficulty_analysis: data.difficulty_analysis || {},
      seasonal_trends: data.seasonal_trends || []
    };

    WidgetDataManager.saveWidgetData('keyword-widget', 'keyword-research', keywordData);
    
    console.log('Keyword Research webhook processed:', keywordData);
    return keywordData;
  }

  // UTILITY METHODS

  /**
   * Make HTTP request to n8n webhook endpoint
   */
  async makeWebhookRequest(method, endpoint, data = null, attempt = 1) {
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
      
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.warn(`Webhook request failed, retrying (${attempt}/${this.retryAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.makeWebhookRequest(method, endpoint, data, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Validate incoming webhook data structure
   */
  validateWebhookData(type, data) {
    if (!data || typeof data !== 'object') return false;

    const requiredFields = {
      'seo-analysis': ['overall_score'],
      'competitor-intel': ['competitors'],
      'performance-metrics': ['performance_score'],
      'content-gap-analysis': ['high_priority_gaps'],
      'keyword-research': ['opportunities']
    };

    const required = requiredFields[type];
    if (!required) return true; // Unknown type, let it pass

    return required.some(field => data.hasOwnProperty(field));
  }

  /**
   * Register webhook endpoints for Express server
   * Call this in your server setup
   */
  static registerWebhookRoutes(app) {
    const webhookService = new WebhookIntegrationService();

    // Basic plan endpoints - receive data only
    app.post('/api/webhooks/seo-update', async (req, res) => {
      const result = await webhookService.processIncomingWebhook('seo-analysis', req.body, 'seo-analysis');
      res.json(result);
    });

    app.post('/api/webhooks/competitor-update', async (req, res) => {
      const result = await webhookService.processIncomingWebhook('competitor-intel', req.body, 'competitor-intel');
      res.json(result);
    });

    app.post('/api/webhooks/analytics-update', async (req, res) => {
      const result = await webhookService.processIncomingWebhook('performance-metrics', req.body, 'performance-analytics');
      res.json(result);
    });

    app.post('/api/webhooks/content-gap-update', async (req, res) => {
      const result = await webhookService.processIncomingWebhook('content-gap-analysis', req.body, 'content-gap-analysis');
      res.json(result);
    });

    app.post('/api/webhooks/keyword-update', async (req, res) => {
      const result = await webhookService.processIncomingWebhook('keyword-research', req.body, 'keyword-research');
      res.json(result);
    });

    // Premium plan endpoints - trigger workflows
    app.post('/api/webhooks/trigger-workflow', async (req, res) => {
      try {
        const { workflowName, parameters, userPlan } = req.body;
        const result = await webhookService.triggerN8NWorkflow(workflowName, parameters, userPlan);
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    console.log('n8n webhook integration routes registered');
  }
}

// Webhook event handlers for real-time updates
export class WebhookEventHandler {
  constructor() {
    this.eventListeners = new Map();
  }

  /**
   * Subscribe to webhook events
   */
  subscribe(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType).push(callback);
  }

  /**
   * Emit webhook event to all subscribers
   */
  emit(eventType, data) {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in webhook event listener for ${eventType}:`, error);
      }
    });
  }

  /**
   * Unsubscribe from webhook events
   */
  unsubscribe(eventType, callback) {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
}

// Export singleton instances
export const webhookIntegration = new WebhookIntegrationService();
export const webhookEvents = new WebhookEventHandler();

export default WebhookIntegrationService;