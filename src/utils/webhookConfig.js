// Webhook configuration for n8n integration
export const WEBHOOK_CONFIG = {
  // Base URL for n8n webhooks - update this with your n8n instance URL
  BASE_URL: import.meta.env?.REACT_APP_N8N_BASE_URL || 'https://your-n8n-instance.com',
  
  // Webhook endpoints for different widgets
  ENDPOINTS: {
    SEO_RANKING: '/webhook/seo-ranking',
    SEO_AUDIT: '/webhook/seo-audit',
    CONTENT_GAP_ANALYSIS: '/webhook/content-gap-analyzer',
    KEYWORD_RESEARCH: '/webhook/keyword-analysis',
    TECH_STACK_DETECTOR: '/webhook/tech-stack-detector',
    SEO_META_TAG: '/webhook/seo-meta-generator',
    AI_SCRIPT_GENERATOR: '/webhook/generate-script',
    BLOG_POST_GENERATOR: '/webhook/generate-blog-post',
    LANDING_PAGE_COPY_GENERATOR: '/webhook/generate-landing-page-copy',
  },
  
  // Default timeout for webhook requests
  TIMEOUT: 30000, // 30 seconds
  
  // Enable/disable real webhook calls (set to false for development with mock data)
  ENABLED: import.meta.env?.REACT_APP_WEBHOOKS_ENABLED === 'true' || false
};

// Webhook API service
export class WebhookService {
  static async callWebhook(endpoint, data, options = {}) {
    if (!WEBHOOK_CONFIG.ENABLED) {
      console.log('Webhooks disabled, returning mock data');
      return null; // Return null to use mock data
    }

    const url = `${WEBHOOK_CONFIG.BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_CONFIG.TIMEOUT);

    try {
      console.log(`Calling webhook: ${url}`, data);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Webhook response:', result);
      return result;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Webhook request timed out');
      }
      
      console.error('Webhook error:', error);
      throw error;
    }
  }

  // SEO Ranking Tracker webhook
  static async fetchSEORankingData(websiteUrl, keywords) {
    const data = {
      website_url: websiteUrl,
      keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
      timestamp: new Date().toISOString()
    };

    return await this.callWebhook(WEBHOOK_CONFIG.ENDPOINTS.SEO_RANKING, data);
  }

  // SEO Audit webhook
  static async fetchSEOAuditData(websiteUrl) {
    const data = {
      website_url: websiteUrl,
      timestamp: new Date().toISOString()
    };

    return await this.callWebhook(WEBHOOK_CONFIG.ENDPOINTS.SEO_AUDIT, data);
  }

  // Tech Stack Analyzer webhook
  static async fetchTechStackData(competitorDomain, industry = 'General') {
    const data = {
      competitorDomain: competitorDomain.replace(/^https?:\/\//, '').replace(/\/$/, ''), // Clean domain
      industry: industry,
      timestamp: new Date().toISOString()
    };

    return await this.callWebhook(WEBHOOK_CONFIG.ENDPOINTS.TECH_STACK_DETECTOR, data);
  }

  // SEO Meta Tag Generator webhook
  static async fetchSEOMetaTagData({ url, site_name = '', tone_style = 'professional' }) {
    const data = {
      url: url,
      site_name: site_name,
      tone_style: tone_style,
      timestamp: new Date().toISOString()
    };

    return await this.callWebhook(WEBHOOK_CONFIG.ENDPOINTS.SEO_META_TAG, data);
  }

  // AI Script Generator webhook
  static async generateScript(formData) {
    const data = {
      ...formData,
      timestamp: new Date().toISOString()
    };

    return await this.callWebhook(WEBHOOK_CONFIG.ENDPOINTS.AI_SCRIPT_GENERATOR, data);
  }

  // Blog Post Generator webhook
  static async generateBlogPost(formData) {
    const data = {
      ...formData,
      timestamp: new Date().toISOString()
    };

    return await this.callWebhook(WEBHOOK_CONFIG.ENDPOINTS.BLOG_POST_GENERATOR, data);
  }

  // Landing Page Copy Generator webhook
  static async generateLandingPageCopy(formData) {
    const data = {
      ...formData,
      timestamp: new Date().toISOString()
    };

    return await this.callWebhook(WEBHOOK_CONFIG.ENDPOINTS.LANDING_PAGE_COPY_GENERATOR, data);
  }
}

// Environment variables helper
export const getWebhookStatus = () => ({
  enabled: WEBHOOK_CONFIG.ENABLED,
  baseUrl: WEBHOOK_CONFIG.BASE_URL,
  endpoints: WEBHOOK_CONFIG.ENDPOINTS
});