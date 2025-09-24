// ============================================
// EMAIL MARKETING SERVICE - ULTIMATE BACKEND
// Integrates with Resend, SendGrid, n8n, and Supabase
// ============================================

import { supabase } from './supabase';
import {
  EmailCampaign,
  EmailSubscriber,
  EmailList,
  EmailTemplate,
  EmailWorkflow,
  EmailEvent,
  EmailAnalytics,
  EmailMarketingApiResponse,
  CampaignListResponse,
  SubscriberListResponse,
  CreateCampaignForm,
  CreateListForm,
  ImportSubscribersForm,
  EmailServiceProvider,
  N8nWebhook
} from '../types/emailMarketing';
import { emailDeliveryService } from './emailDeliveryService';

// ============================================
// EMAIL SERVICE PROVIDERS INTEGRATION
// ============================================

interface ESPConfig {
  resend?: {
    apiKey: string;
    baseUrl: string;
  };
  sendgrid?: {
    apiKey: string;
    baseUrl: string;
  };
}

class EmailServiceProviders {
  private config: ESPConfig;

  constructor(config: ESPConfig) {
    this.config = config;
  }

  // Resend integration
  async sendWithResend(campaign: EmailCampaign, subscribers: EmailSubscriber[]): Promise<any> {
    if (!this.config.resend) throw new Error('Resend not configured');

    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.resend.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${campaign.fromName} <${campaign.fromEmail}>`,
        to: subscribers.map(s => s.email),
        subject: campaign.subject,
        html: campaign.htmlContent,
        text: campaign.textContent,
        reply_to: campaign.replyTo,
        tags: [
          { name: 'campaign_id', value: campaign.id },
          { name: 'campaign_type', value: campaign.campaignType },
          ...campaign.tags.map(tag => ({ name: 'tag', value: tag }))
        ],
        headers: {
          'X-Campaign-ID': campaign.id,
          'X-Agency-ID': campaign.agencyId,
          'X-Client-ID': campaign.clientId
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }

    return response.json();
  }

  // SendGrid integration
  async sendWithSendGrid(campaign: EmailCampaign, subscribers: EmailSubscriber[]): Promise<any> {
    if (!this.config.sendgrid) throw new Error('SendGrid not configured');

    const personalizations = subscribers.map(subscriber => ({
      to: [{ email: subscriber.email, name: `${subscriber.firstName} ${subscriber.lastName}`.trim() }],
      substitutions: {
        '{{first_name}}': subscriber.firstName || '',
        '{{last_name}}': subscriber.lastName || '',
        '{{email}}': subscriber.email,
        '{{company}}': subscriber.company || '',
        '{{subscriber_id}}': subscriber.id,
        ...subscriber.customFields
      }
    }));

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.sendgrid.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations,
        from: {
          email: campaign.fromEmail,
          name: campaign.fromName
        },
        reply_to: campaign.replyTo ? { email: campaign.replyTo } : undefined,
        subject: campaign.subject,
        content: [
          {
            type: 'text/html',
            value: campaign.htmlContent
          },
          campaign.textContent ? {
            type: 'text/plain',
            value: campaign.textContent
          } : null
        ].filter(Boolean),
        categories: [campaign.campaignType, ...campaign.tags],
        custom_args: {
          campaign_id: campaign.id,
          agency_id: campaign.agencyId,
          client_id: campaign.clientId
        },
        tracking_settings: {
          click_tracking: { enable: campaign.trackClicks },
          open_tracking: { enable: campaign.trackOpens },
          subscription_tracking: { enable: campaign.trackUnsubscribes }
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`SendGrid API error: ${JSON.stringify(error)}`);
    }

    return { success: true, messageId: response.headers.get('x-message-id') };
  }

  // Smart ESP selection (load balancing, failover)
  async sendCampaign(campaign: EmailCampaign, subscribers: EmailSubscriber[]): Promise<any> {
    const espProviders = await supabase
      .from('email_service_providers')
      .select('*')
      .eq('is_active', true)
      .order('is_primary', { ascending: false });

    if (!espProviders.data?.length) {
      throw new Error('No active email service providers configured');
    }

    // Try primary ESP first, then failover
    for (const esp of espProviders.data) {
      try {
        if (esp.name === 'resend') {
          return await this.sendWithResend(campaign, subscribers);
        } else if (esp.name === 'sendgrid') {
          return await this.sendWithSendGrid(campaign, subscribers);
        }
      } catch (error) {
        console.error(`ESP ${esp.name} failed:`, error);
        // Continue to next ESP
      }
    }

    throw new Error('All email service providers failed');
  }
}

// ============================================
// N8N INTEGRATION SERVICE
// ============================================

class N8nIntegration {
  private webhooks: Map<string, string> = new Map();

  constructor() {
    this.loadWebhooks();
  }

  private async loadWebhooks() {
    const { data: webhooks } = await supabase
      .from('n8n_webhooks')
      .select('*')
      .eq('is_active', true);

    if (webhooks) {
      webhooks.forEach(webhook => {
        this.webhooks.set(webhook.webhook_name, webhook.webhook_url);
      });
    }
  }

  // Send event to n8n workflow
  async triggerWebhook(eventType: string, data: any): Promise<void> {
    const webhookUrl = this.webhooks.get(eventType);
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          timestamp: new Date().toISOString(),
          data
        }),
      });

      // Log webhook event
      await supabase.from('n8n_webhook_events').insert({
        webhook_id: eventType,
        event_type: eventType,
        payload: data,
        response_status: 200
      });
    } catch (error) {
      console.error(`n8n webhook failed for ${eventType}:`, error);
    }
  }

  // Create n8n workflow integration
  async setupWorkflowWebhook(workflowId: string, webhookUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('n8n_webhooks').upsert({
        webhook_name: `workflow_${workflowId}`,
        webhook_url: webhookUrl,
        trigger_events: ['workflow_trigger'],
        is_active: true
      });

      if (error) throw error;
      
      this.webhooks.set(`workflow_${workflowId}`, webhookUrl);
      return true;
    } catch (error) {
      console.error('Failed to setup n8n webhook:', error);
      return false;
    }
  }
}

// ============================================
// MAIN EMAIL MARKETING SERVICE
// ============================================

export class EmailMarketingService {
  private espService: EmailServiceProviders;
  private n8nService: N8nIntegration;

  constructor() {
    this.espService = new EmailServiceProviders({
      resend: {
        apiKey: import.meta.env.VITE_RESEND_API_KEY || '',
        baseUrl: 'https://api.resend.com'
      },
      sendgrid: {
        apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
        baseUrl: 'https://api.sendgrid.com/v3'
      }
    });
    this.n8nService = new N8nIntegration();
  }

  // ============================================
  // CAMPAIGN MANAGEMENT
  // ============================================

  async getCampaigns(
    agencyId: string,
    clientId?: string,
    page = 1,
    limit = 20,
    status?: string
  ): Promise<EmailMarketingApiResponse<CampaignListResponse>> {
    try {
      let query = supabase
        .from('email_campaigns')
        .select(`
          *,
          email_campaign_analytics(*),
          email_templates(name, category)
        `)
        .eq('agency_id', agencyId);

      if (clientId) query = query.eq('client_id', clientId);
      if (status) query = query.eq('status', status);

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          campaigns: data || [],
          total: count || 0,
          page,
          limit
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch campaigns'
      };
    }
  }

  async createCampaign(campaignData: CreateCampaignForm, agencyId: string): Promise<EmailMarketingApiResponse<EmailCampaign>> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          ...campaignData,
          agency_id: agencyId,
          created_by: agencyId // TODO: Replace with actual user ID
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger n8n workflow
      await this.n8nService.triggerWebhook('campaign_created', {
        campaign_id: data.id,
        agency_id: agencyId,
        campaign_data: campaignData
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create campaign'
      };
    }
  }

  async updateCampaign(campaignId: string, updates: Partial<EmailCampaign>): Promise<EmailMarketingApiResponse<EmailCampaign>> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updates)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;

      // Trigger n8n workflow
      await this.n8nService.triggerWebhook('campaign_updated', {
        campaign_id: campaignId,
        updates
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update campaign'
      };
    }
  }

  async sendCampaign(campaignId: string): Promise<EmailMarketingApiResponse<{ deliveryStatus: any }>> {
    try {
      console.log(`🚀 Starting enhanced campaign delivery for: ${campaignId}`);

      // Use the enhanced delivery service
      const deliveryStatus = await emailDeliveryService.deliverCampaign(campaignId);

      // Trigger n8n workflow with detailed results
      await this.n8nService.triggerWebhook('campaign_delivered', {
        campaign_id: campaignId,
        total_subscribers: deliveryStatus.totalSubscribers,
        successful_sends: deliveryStatus.sent,
        failed_sends: deliveryStatus.failed,
        success_rate: (deliveryStatus.sent / deliveryStatus.totalSubscribers) * 100,
        errors: deliveryStatus.errors
      });

      return {
        success: true,
        data: { deliveryStatus }
      };

    } catch (error) {
      console.error(`💥 Campaign delivery failed for ${campaignId}:`, error);

      // Trigger n8n workflow for failure
      await this.n8nService.triggerWebhook('campaign_delivery_failed', {
        campaign_id: campaignId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deliver campaign'
      };
    }
  }

  // Add new method to get delivery status
  async getCampaignDeliveryStatus(campaignId: string): Promise<EmailMarketingApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .rpc('get_campaign_delivery_status', { campaign_uuid: campaignId });

      if (error) throw error;

      return {
        success: true,
        data: data?.[0] || null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get delivery status'
      };
    }
  }

  // Add method to get ESP configuration
  async getESPConfiguration(): Promise<EmailMarketingApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('email_service_providers')
        .select('id, name, is_active, is_primary, rate_limit_per_second, rate_limit_per_hour')
        .order('is_primary', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get ESP configuration'
      };
    }
  }

  // ============================================
  // SUBSCRIBER MANAGEMENT
  // ============================================

  async getSubscribers(
    agencyId: string,
    clientId?: string,
    listId?: string,
    page = 1,
    limit = 50
  ): Promise<EmailMarketingApiResponse<SubscriberListResponse>> {
    try {
      let query = supabase
        .from('email_subscribers')
        .select(`
          *,
          email_list_subscribers(
            email_lists(name, id)
          )
        `)
        .eq('agency_id', agencyId);

      if (clientId) query = query.eq('client_id', clientId);
      if (listId) {
        query = supabase
          .from('email_list_subscribers')
          .select(`
            email_subscribers(*)
          `)
          .eq('list_id', listId)
          .eq('status', 'active');
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          subscribers: data || [],
          total: count || 0,
          page,
          limit
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subscribers'
      };
    }
  }

  async createSubscriber(subscriberData: Partial<EmailSubscriber>): Promise<EmailMarketingApiResponse<EmailSubscriber>> {
    try {
      // Check if subscriber already exists
      const { data: existingSubscriber } = await supabase
        .from('email_subscribers')
        .select('id')
        .eq('email', subscriberData.email!)
        .eq('agency_id', subscriberData.agencyId!)
        .single();

      if (existingSubscriber) {
        return {
          success: false,
          error: 'Subscriber with this email already exists'
        };
      }

      const { data, error } = await supabase
        .from('email_subscribers')
        .insert({
          ...subscriberData,
          engagement_score: 50, // Default engagement score
          subscribed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger n8n workflow
      await this.n8nService.triggerWebhook('subscriber_added', {
        subscriber_id: data.id,
        email: data.email,
        agency_id: data.agency_id,
        client_id: data.client_id,
        source: data.source
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subscriber'
      };
    }
  }

  async importSubscribers(importData: ImportSubscribersForm, agencyId: string): Promise<EmailMarketingApiResponse<{ imported: number; skipped: number }>> {
    try {
      // Parse CSV data
      const lines = importData.csvData.split('\n');
      const headers = lines[0].split(',');
      const subscribers = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
          const subscriber: Partial<EmailSubscriber> = {
            agency_id: agencyId,
            tags: importData.tags,
            source: 'import'
          };

          headers.forEach((header, index) => {
            const mappedField = importData.fieldMapping[header];
            if (mappedField && values[index]) {
              (subscriber as any)[mappedField] = values[index].trim();
            }
          });

          if (subscriber.email) {
            subscribers.push(subscriber);
          }
        }
      }

      let imported = 0;
      let skipped = 0;

      // Import subscribers in batches
      const batchSize = 100;
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('email_subscribers')
          .upsert(batch, { onConflict: 'email,agency_id' })
          .select('id');

        if (error) {
          console.error('Batch import error:', error);
          skipped += batch.length;
        } else {
          imported += data?.length || 0;
          
          // Add to list
          if (importData.listId) {
            const listRelations = data?.map(subscriber => ({
              list_id: importData.listId,
              subscriber_id: subscriber.id,
              source: 'import'
            })) || [];

            await supabase
              .from('email_list_subscribers')
              .upsert(listRelations, { onConflict: 'list_id,subscriber_id' });
          }
        }
      }

      // Trigger n8n workflow
      await this.n8nService.triggerWebhook('subscribers_imported', {
        agency_id: agencyId,
        list_id: importData.listId,
        imported_count: imported,
        skipped_count: skipped
      });

      return {
        success: true,
        data: { imported, skipped }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import subscribers'
      };
    }
  }

  // ============================================
  // LIST MANAGEMENT
  // ============================================

  async getLists(agencyId: string, clientId?: string): Promise<EmailMarketingApiResponse<EmailList[]>> {
    try {
      let query = supabase
        .from('email_lists')
        .select(`
          *,
          email_list_subscribers(count)
        `)
        .eq('agency_id', agencyId);

      if (clientId) query = query.eq('client_id', clientId);

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch lists'
      };
    }
  }

  async createList(listData: CreateListForm, agencyId: string): Promise<EmailMarketingApiResponse<EmailList>> {
    try {
      const { data, error } = await supabase
        .from('email_lists')
        .insert({
          ...listData,
          agency_id: agencyId,
          created_by: agencyId // TODO: Replace with actual user ID
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger n8n workflow
      await this.n8nService.triggerWebhook('list_created', {
        list_id: data.id,
        agency_id: agencyId,
        list_data: listData
      });

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create list'
      };
    }
  }

  // ============================================
  // ANALYTICS & REPORTING
  // ============================================

  async getCampaignAnalytics(campaignId: string): Promise<EmailMarketingApiResponse<EmailAnalytics>> {
    try {
      // Get basic analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (analyticsError && analyticsError.code !== 'PGRST116') throw analyticsError;

      // If no pre-calculated analytics, calculate on the fly
      if (!analytics) {
        const calculatedAnalytics = await this.calculateCampaignAnalytics(campaignId);
        return { success: true, data: calculatedAnalytics };
      }

      return { success: true, data: analytics };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics'
      };
    }
  }

  private async calculateCampaignAnalytics(campaignId: string): Promise<EmailAnalytics> {
    // Get all events for this campaign
    const { data: events } = await supabase
      .from('email_events')
      .select('*')
      .eq('campaign_id', campaignId);

    const analytics: EmailAnalytics = {
      campaignId,
      emailsSent: 0,
      emailsDelivered: 0,
      emailsOpened: 0,
      emailsClicked: 0,
      emailsBounced: 0,
      emailsComplained: 0,
      emailsUnsubscribed: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      complaintRate: 0,
      unsubscribeRate: 0,
      clickToOpenRate: 0,
      uniqueOpens: 0,
      uniqueClicks: 0,
      forwardCount: 0,
      printCount: 0,
      totalAttributedRevenue: 0,
      totalConversions: 0,
      revenuePerRecipient: 0,
      roiPercentage: 0,
      desktopOpens: 0,
      mobileOpens: 0,
      tabletOpens: 0,
      topCountries: [],
      topRegions: [],
      lastCalculatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (!events) return analytics;

    // Calculate metrics
    const uniqueOpenedSubscribers = new Set();
    const uniqueClickedSubscribers = new Set();
    const countryMap = new Map();
    const regionMap = new Map();

    events.forEach(event => {
      switch (event.event_type) {
        case 'sent':
          analytics.emailsSent++;
          break;
        case 'delivered':
          analytics.emailsDelivered++;
          break;
        case 'opened':
          analytics.emailsOpened++;
          uniqueOpenedSubscribers.add(event.subscriber_id);
          
          // Device tracking
          if (event.device_type === 'desktop') analytics.desktopOpens++;
          else if (event.device_type === 'mobile') analytics.mobileOpens++;
          else if (event.device_type === 'tablet') analytics.tabletOpens++;
          
          // Geographic tracking
          if (event.country) {
            countryMap.set(event.country, (countryMap.get(event.country) || 0) + 1);
          }
          if (event.region) {
            regionMap.set(event.region, (regionMap.get(event.region) || 0) + 1);
          }
          break;
        case 'clicked':
          analytics.emailsClicked++;
          uniqueClickedSubscribers.add(event.subscriber_id);
          if (event.attributed_revenue) {
            analytics.totalAttributedRevenue += event.attributed_revenue;
          }
          if (event.attributed_conversion) {
            analytics.totalConversions++;
          }
          break;
        case 'bounced':
          analytics.emailsBounced++;
          break;
        case 'complained':
          analytics.emailsComplained++;
          break;
        case 'unsubscribed':
          analytics.emailsUnsubscribed++;
          break;
      }
    });

    analytics.uniqueOpens = uniqueOpenedSubscribers.size;
    analytics.uniqueClicks = uniqueClickedSubscribers.size;

    // Calculate rates
    if (analytics.emailsSent > 0) {
      analytics.deliveryRate = (analytics.emailsDelivered / analytics.emailsSent) * 100;
      analytics.openRate = (analytics.uniqueOpens / analytics.emailsSent) * 100;
      analytics.clickRate = (analytics.uniqueClicks / analytics.emailsSent) * 100;
      analytics.bounceRate = (analytics.emailsBounced / analytics.emailsSent) * 100;
      analytics.complaintRate = (analytics.emailsComplained / analytics.emailsSent) * 100;
      analytics.unsubscribeRate = (analytics.emailsUnsubscribed / analytics.emailsSent) * 100;
      analytics.revenuePerRecipient = analytics.totalAttributedRevenue / analytics.emailsSent;
    }

    if (analytics.uniqueOpens > 0) {
      analytics.clickToOpenRate = (analytics.uniqueClicks / analytics.uniqueOpens) * 100;
    }

    // Top countries and regions
    analytics.topCountries = Array.from(countryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({
        country,
        count,
        percentage: (count / analytics.emailsOpened) * 100
      }));

    analytics.topRegions = Array.from(regionMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([region, count]) => ({
        region,
        count,
        percentage: (count / analytics.emailsOpened) * 100
      }));

    // Save calculated analytics
    await supabase
      .from('email_campaign_analytics')
      .upsert({ campaign_id: campaignId, ...analytics });

    return analytics;
  }

  // ============================================
  // EVENT TRACKING (Webhooks from ESPs)
  // ============================================

  async handleWebhookEvent(eventData: any): Promise<void> {
    try {
      // Parse event based on ESP
      const event = this.parseESPEvent(eventData);
      
      if (event) {
        // Store event
        await supabase.from('email_events').insert(event);

        // Update subscriber engagement score
        if (event.eventType === 'opened' || event.eventType === 'clicked') {
          await this.updateSubscriberEngagement(event.subscriberId, event.eventType);
        }

        // Trigger n8n workflows
        await this.n8nService.triggerWebhook('email_event', {
          event_type: event.eventType,
          campaign_id: event.campaignId,
          subscriber_id: event.subscriberId,
          event_data: event
        });

        // Refresh campaign analytics (async)
        if (event.campaignId) {
          this.calculateCampaignAnalytics(event.campaignId);
        }
      }
    } catch (error) {
      console.error('Failed to handle webhook event:', error);
    }
  }

  private parseESPEvent(eventData: any): EmailEvent | null {
    // Parse Resend webhook
    if (eventData.type) {
      return {
        id: '',
        subscriberId: eventData.email,
        messageId: eventData.message_id || '',
        eventType: this.mapESPEventType(eventData.type),
        eventTimestamp: eventData.created_at || new Date().toISOString(),
        userAgent: eventData.user_agent,
        ipAddress: eventData.ip,
        clickedUrl: eventData.click?.link,
        espData: eventData,
        createdAt: new Date().toISOString()
      } as EmailEvent;
    }

    // Parse SendGrid webhook
    if (eventData.event) {
      return {
        id: '',
        subscriberId: eventData.email,
        messageId: eventData.sg_message_id || '',
        eventType: this.mapESPEventType(eventData.event),
        eventTimestamp: new Date(eventData.timestamp * 1000).toISOString(),
        userAgent: eventData.useragent,
        ipAddress: eventData.ip,
        clickedUrl: eventData.url,
        campaignId: eventData.campaign_id,
        espData: eventData,
        createdAt: new Date().toISOString()
      } as EmailEvent;
    }

    return null;
  }

  private mapESPEventType(espEventType: string): string {
    const eventMap: Record<string, string> = {
      // Resend events
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.delivery_delayed': 'deferred',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      
      // SendGrid events
      'processed': 'sent',
      'delivered': 'delivered',
      'open': 'opened',
      'click': 'clicked',
      'bounce': 'bounced',
      'dropped': 'bounced',
      'spamreport': 'complained',
      'unsubscribe': 'unsubscribed',
      'group_unsubscribe': 'unsubscribed'
    };

    return eventMap[espEventType] || espEventType;
  }

  private async updateSubscriberEngagement(subscriberId: string, eventType: string): Promise<void> {
    try {
      // Get current subscriber data
      const { data: subscriber } = await supabase
        .from('email_subscribers')
        .select('total_opens, total_clicks, engagement_score')
        .eq('id', subscriberId)
        .single();

      if (subscriber) {
        const updates: any = {
          last_engagement_at: new Date().toISOString()
        };

        if (eventType === 'opened') {
          updates.total_opens = (subscriber.total_opens || 0) + 1;
          updates.last_open_at = new Date().toISOString();
        } else if (eventType === 'clicked') {
          updates.total_clicks = (subscriber.total_clicks || 0) + 1;
          updates.last_click_at = new Date().toISOString();
        }

        // Calculate new engagement score using the database function
        const { data: newScore } = await supabase
          .rpc('calculate_engagement_score', { subscriber_uuid: subscriberId });

        if (newScore) {
          updates.engagement_score = newScore;
        }

        await supabase
          .from('email_subscribers')
          .update(updates)
          .eq('id', subscriberId);
      }
    } catch (error) {
      console.error('Failed to update subscriber engagement:', error);
    }
  }
}

// Export singleton instance
export const emailMarketingService = new EmailMarketingService();
export default emailMarketingService;