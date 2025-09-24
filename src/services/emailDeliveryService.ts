// ============================================
// EMAIL DELIVERY SERVICE - PRODUCTION READY
// Complete email sending with rate limiting, error handling, and analytics
// ============================================

import { supabase } from './supabase';
import {
  EmailCampaign,
  EmailSubscriber,
  EmailEvent,
  EmailServiceProvider
} from '../types/emailMarketing';

// Rate limiting configuration
interface RateLimitConfig {
  resend: { perSecond: 10, perHour: 100 };
  sendgrid: { perSecond: 100, perHour: 10000 };
}

// Delivery batch configuration
interface DeliveryConfig {
  batchSize: number;
  delayBetweenBatches: number;
  retryAttempts: number;
  retryDelay: number;
}

// Enhanced ESP Response
interface ESPResponse {
  success: boolean;
  messageId?: string;
  messageIds?: string[];
  error?: string;
  rateLimitHit?: boolean;
  shouldRetry?: boolean;
}

// Delivery status tracking
interface DeliveryStatus {
  campaignId: string;
  totalSubscribers: number;
  sent: number;
  failed: number;
  pending: number;
  errors: Array<{ subscriberId: string; error: string }>;
}

export class EmailDeliveryService {
  private readonly rateLimits: RateLimitConfig = {
    resend: { perSecond: 10, perHour: 100 },
    sendgrid: { perSecond: 100, perHour: 10000 }
  };

  private readonly config: DeliveryConfig = {
    batchSize: 50,
    delayBetweenBatches: 1000, // 1 second
    retryAttempts: 3,
    retryDelay: 5000 // 5 seconds
  };

  // Track rate limiting per ESP
  private rateLimitTracking: Map<string, { 
    lastSecond: number; 
    secondCount: number; 
    lastHour: number; 
    hourCount: number; 
  }> = new Map();

  // ============================================
  // MAIN DELIVERY ORCHESTRATOR
  // ============================================

  async deliverCampaign(campaignId: string): Promise<DeliveryStatus> {
    console.log(`🚀 Starting campaign delivery: ${campaignId}`);
    
    // Initialize delivery status tracking
    const deliveryStatus: DeliveryStatus = {
      campaignId,
      totalSubscribers: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      errors: []
    };

    try {
      // 1. Get campaign and validate
      const campaign = await this.getCampaignData(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // 2. Get active subscribers
      const subscribers = await this.getActiveSubscribers(campaign);
      deliveryStatus.totalSubscribers = subscribers.length;
      deliveryStatus.pending = subscribers.length;

      if (subscribers.length === 0) {
        throw new Error('No active subscribers found for campaign');
      }

      // 3. Update campaign status to sending
      await this.updateCampaignStatus(campaignId, 'sending');

      // 4. Get available ESP providers
      const espProviders = await this.getActiveESPProviders();
      if (espProviders.length === 0) {
        throw new Error('No active email service providers configured');
      }

      console.log(`📧 Delivering to ${subscribers.length} subscribers using ${espProviders.length} ESP(s)`);

      // 5. Process in batches with rate limiting
      const batches = this.createBatches(subscribers, this.config.batchSize);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} subscribers)`);

        try {
          const batchResult = await this.processBatch(campaign, batch, espProviders);
          
          // Update delivery status
          deliveryStatus.sent += batchResult.sent;
          deliveryStatus.failed += batchResult.failed;
          deliveryStatus.pending -= batch.length;
          deliveryStatus.errors.push(...batchResult.errors);

          // Log batch completion
          await this.logBatchCompletion(campaignId, i + 1, batchResult);

        } catch (error) {
          console.error(`❌ Batch ${i + 1} failed:`, error);
          
          // Mark all in batch as failed
          deliveryStatus.failed += batch.length;
          deliveryStatus.pending -= batch.length;
          
          batch.forEach(subscriber => {
            deliveryStatus.errors.push({
              subscriberId: subscriber.id,
              error: error instanceof Error ? error.message : 'Unknown batch error'
            });
          });
        }

        // Delay between batches to respect rate limits
        if (i < batches.length - 1) {
          await this.delay(this.config.delayBetweenBatches);
        }
      }

      // 6. Update final campaign status
      const finalStatus = deliveryStatus.failed === 0 ? 'sent' : 
                         deliveryStatus.sent === 0 ? 'failed' : 'partially_sent';
      
      await this.updateCampaignStatus(campaignId, finalStatus, {
        send_time: new Date().toISOString(),
        subscribers_sent: deliveryStatus.sent,
        subscribers_failed: deliveryStatus.failed
      });

      // 7. Generate delivery report
      await this.generateDeliveryReport(deliveryStatus);

      console.log(`✅ Campaign delivery completed: ${deliveryStatus.sent}/${deliveryStatus.totalSubscribers} sent`);
      
      return deliveryStatus;

    } catch (error) {
      console.error(`💥 Campaign delivery failed:`, error);
      
      // Update campaign status to failed
      await this.updateCampaignStatus(campaignId, 'failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  // ============================================
  // BATCH PROCESSING WITH ESP FAILOVER
  // ============================================

  private async processBatch(
    campaign: EmailCampaign, 
    batch: EmailSubscriber[], 
    espProviders: EmailServiceProvider[]
  ): Promise<{ sent: number; failed: number; errors: Array<{ subscriberId: string; error: string }> }> {
    
    const result = { sent: 0, failed: 0, errors: [] as Array<{ subscriberId: string; error: string }> };

    // Try each ESP provider in order (primary first)
    for (const esp of espProviders) {
      try {
        // Check rate limits before attempting
        if (!this.canSendWithESP(esp.name, batch.length)) {
          console.log(`⏰ Rate limit reached for ${esp.name}, trying next ESP`);
          continue;
        }

        console.log(`📤 Attempting delivery via ${esp.name}`);
        
        const espResponse = await this.sendWithESP(campaign, batch, esp);
        
        if (espResponse.success) {
          // Success! Log events and update counters
          result.sent += batch.length;
          await this.logSuccessfulDeliveries(campaign.id, batch, espResponse.messageIds || []);
          
          // Update rate limiting tracking
          this.updateRateLimitTracking(esp.name, batch.length);
          
          console.log(`✅ Batch delivered successfully via ${esp.name}`);
          return result;
          
        } else if (espResponse.rateLimitHit) {
          console.log(`⏰ Rate limit hit for ${esp.name}, trying next ESP`);
          continue;
          
        } else {
          console.log(`❌ ESP ${esp.name} failed: ${espResponse.error}`);
          continue;
        }

      } catch (error) {
        console.error(`💥 ESP ${esp.name} threw error:`, error);
        continue;
      }
    }

    // All ESPs failed - mark batch as failed
    console.error(`💥 All ESPs failed for batch`);
    result.failed += batch.length;
    
    batch.forEach(subscriber => {
      result.errors.push({
        subscriberId: subscriber.id,
        error: 'All email service providers failed'
      });
    });

    await this.logFailedDeliveries(campaign.id, batch, 'All ESPs failed');
    
    return result;
  }

  // ============================================
  // ESP-SPECIFIC SENDING METHODS
  // ============================================

  private async sendWithESP(
    campaign: EmailCampaign,
    subscribers: EmailSubscriber[],
    esp: EmailServiceProvider
  ): Promise<ESPResponse> {
    
    switch (esp.name.toLowerCase()) {
      case 'resend':
        return await this.sendWithResend(campaign, subscribers, esp);
      case 'sendgrid':
        return await this.sendWithSendGrid(campaign, subscribers, esp);
      default:
        return { success: false, error: `Unknown ESP: ${esp.name}` };
    }
  }

  private async sendWithResend(
    campaign: EmailCampaign,
    subscribers: EmailSubscriber[],
    esp: EmailServiceProvider
  ): Promise<ESPResponse> {
    
    try {
      const response = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${esp.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${campaign.fromName} <${campaign.fromEmail}>`,
          to: subscribers.map(s => ({
            email: s.email,
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email
          })),
          subject: campaign.subject,
          html: campaign.htmlContent,
          text: campaign.textContent,
          reply_to: campaign.replyTo,
          tags: [
            { name: 'campaign_id', value: campaign.id },
            { name: 'campaign_type', value: campaign.campaignType }
          ]
        }),
      });

      if (response.status === 429) {
        return { success: false, rateLimitHit: true, error: 'Rate limit exceeded' };
      }

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: `Resend API error: ${errorData.message || response.statusText}` 
        };
      }

      const data = await response.json();
      return { 
        success: true, 
        messageIds: Array.isArray(data) ? data.map(d => d.id) : [data.id]
      };

    } catch (error) {
      return { 
        success: false, 
        error: `Resend error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  private async sendWithSendGrid(
    campaign: EmailCampaign,
    subscribers: EmailSubscriber[],
    esp: EmailServiceProvider
  ): Promise<ESPResponse> {
    
    try {
      const personalizations = subscribers.map(subscriber => ({
        to: [{ 
          email: subscriber.email, 
          name: `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim() || subscriber.email
        }],
        substitutions: {
          '{{first_name}}': subscriber.firstName || '',
          '{{last_name}}': subscriber.lastName || '',
          '{{email}}': subscriber.email,
          '{{unsubscribe_url}}': `${process.env.VITE_APP_URL}/unsubscribe/${subscriber.id}?campaign=${campaign.id}`
        }
      }));

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${esp.apiKey}`,
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
            { type: 'text/html', value: campaign.htmlContent },
            campaign.textContent ? { type: 'text/plain', value: campaign.textContent } : null
          ].filter(Boolean),
          categories: [campaign.campaignType],
          custom_args: {
            campaign_id: campaign.id
          }
        }),
      });

      if (response.status === 429) {
        return { success: false, rateLimitHit: true, error: 'Rate limit exceeded' };
      }

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: `SendGrid API error: ${JSON.stringify(errorData)}` 
        };
      }

      return { 
        success: true, 
        messageId: response.headers.get('x-message-id') || 'sendgrid_batch'
      };

    } catch (error) {
      return { 
        success: false, 
        error: `SendGrid error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // ============================================
  // RATE LIMITING MANAGEMENT
  // ============================================

  private canSendWithESP(espName: string, emailCount: number): boolean {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);
    const currentHour = Math.floor(now / 3600000);
    
    const limits = this.rateLimits[espName as keyof RateLimitConfig];
    if (!limits) return true;

    const tracking = this.rateLimitTracking.get(espName) || {
      lastSecond: currentSecond,
      secondCount: 0,
      lastHour: currentHour,
      hourCount: 0
    };

    // Reset counters if time period has passed
    if (tracking.lastSecond !== currentSecond) {
      tracking.secondCount = 0;
      tracking.lastSecond = currentSecond;
    }

    if (tracking.lastHour !== currentHour) {
      tracking.hourCount = 0;
      tracking.lastHour = currentHour;
    }

    // Check if we can send without exceeding limits
    const canSendPerSecond = (tracking.secondCount + emailCount) <= limits.perSecond;
    const canSendPerHour = (tracking.hourCount + emailCount) <= limits.perHour;

    this.rateLimitTracking.set(espName, tracking);
    
    return canSendPerSecond && canSendPerHour;
  }

  private updateRateLimitTracking(espName: string, emailCount: number): void {
    const tracking = this.rateLimitTracking.get(espName);
    if (tracking) {
      tracking.secondCount += emailCount;
      tracking.hourCount += emailCount;
    }
  }

  // ============================================
  // DATA ACCESS METHODS
  // ============================================

  private async getCampaignData(campaignId: string): Promise<EmailCampaign | null> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error || !data) {
      console.error('Failed to get campaign:', error);
      return null;
    }

    return data;
  }

  private async getActiveSubscribers(campaign: EmailCampaign): Promise<EmailSubscriber[]> {
    if (!campaign.listIds || campaign.listIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('email_list_subscribers')
      .select(`
        email_subscribers(*)
      `)
      .in('list_id', campaign.listIds)
      .eq('status', 'active');

    if (error) {
      console.error('Failed to get subscribers:', error);
      return [];
    }

    return (data?.map(item => item.email_subscribers).filter(Boolean) || []) as unknown as EmailSubscriber[];
  }

  private async getActiveESPProviders(): Promise<EmailServiceProvider[]> {
    const { data, error } = await supabase
      .from('email_service_providers')
      .select('*')
      .eq('is_active', true)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Failed to get ESP providers:', error);
      return [];
    }

    return data || [];
  }

  // ============================================
  // LOGGING AND ANALYTICS
  // ============================================

  private async logSuccessfulDeliveries(
    campaignId: string, 
    subscribers: EmailSubscriber[], 
    messageIds: string[]
  ): Promise<void> {
    const events = subscribers.map((subscriber, index) => ({
      campaign_id: campaignId,
      subscriber_id: subscriber.id,
      event_type: 'sent',
      message_id: messageIds[index] || messageIds[0] || `batch_${Date.now()}`,
      event_timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('email_events')
      .insert(events);

    if (error) {
      console.error('Failed to log successful deliveries:', error);
    }
  }

  private async logFailedDeliveries(
    campaignId: string, 
    subscribers: EmailSubscriber[], 
    errorMessage: string
  ): Promise<void> {
    const events = subscribers.map(subscriber => ({
      campaign_id: campaignId,
      subscriber_id: subscriber.id,
      event_type: 'failed',
      error_message: errorMessage,
      event_timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('email_events')
      .insert(events);

    if (error) {
      console.error('Failed to log failed deliveries:', error);
    }
  }

  private async updateCampaignStatus(
    campaignId: string, 
    status: string, 
    additionalFields: Record<string, any> = {}
  ): Promise<void> {
    const { error } = await supabase
      .from('email_campaigns')
      .update({ 
        status, 
        updated_at: new Date().toISOString(),
        ...additionalFields 
      })
      .eq('id', campaignId);

    if (error) {
      console.error('Failed to update campaign status:', error);
    }
  }

  private async logBatchCompletion(
    campaignId: string, 
    batchNumber: number, 
    result: { sent: number; failed: number; errors: any[] }
  ): Promise<void> {
    console.log(`📊 Batch ${batchNumber} completed: ${result.sent} sent, ${result.failed} failed`);
    
    // Could store batch completion logs in database for monitoring
    // await supabase.from('delivery_logs').insert({...})
  }

  private async generateDeliveryReport(deliveryStatus: DeliveryStatus): Promise<void> {
    const report = {
      campaign_id: deliveryStatus.campaignId,
      total_subscribers: deliveryStatus.totalSubscribers,
      successful_deliveries: deliveryStatus.sent,
      failed_deliveries: deliveryStatus.failed,
      success_rate: (deliveryStatus.sent / deliveryStatus.totalSubscribers) * 100,
      error_summary: deliveryStatus.errors.reduce((acc, error) => {
        acc[error.error] = (acc[error.error] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      generated_at: new Date().toISOString()
    };

    console.log('📋 Delivery Report:', report);
    
    // Store delivery report
    const { error } = await supabase
      .from('delivery_reports')
      .insert(report);

    if (error) {
      console.error('Failed to store delivery report:', error);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const emailDeliveryService = new EmailDeliveryService();
export default emailDeliveryService;