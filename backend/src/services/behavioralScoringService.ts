import mongoose from 'mongoose';
import Contact, { IContact } from '../models/Contact';
import { logger } from '../utils/logger';
import { createClient } from 'redis';

interface BehavioralActivity {
  id?: string;
  contactId?: string;
  email?: string;
  cookieId?: string;
  sessionId?: string;
  type: 'page_view' | 'download' | 'email_open' | 'email_click' | 'form_submit' | 'video_watch' | 'doc_view' | 'chat_start' | 'search' | 'pricing_view' | 'demo_request';
  action: string;
  timestamp: Date;
  metadata: {
    page?: string;
    url?: string;
    duration?: number;
    source?: string;
    campaign?: string;
    medium?: string;
    device?: string;
    browser?: string;
    location?: {
      country?: string;
      city?: string;
      region?: string;
    };
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    emailId?: string;
    linkUrl?: string;
    formId?: string;
    formFields?: string[];
    videoId?: string;
    watchDuration?: number;
    totalDuration?: number;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
  };
  scoreImpact?: number;
}

interface ProcessingResult {
  success: boolean;
  contactId?: string;
  scoreChange?: number;
  newScore?: number;
  triggeredActions?: Array<{
    id: string;
    name: string;
    action: string;
    triggered: boolean;
  }>;
  error?: string;
  activity?: BehavioralActivity;
}

interface ScoringWeights {
  page_view: {
    base: number;
    pricing_page_multiplier: number;
    demo_page_multiplier: number;
    product_page_multiplier: number;
    duration_bonus: number; // per minute
  };
  download: {
    base: number;
    whitepaper_multiplier: number;
    case_study_multiplier: number;
    trial_multiplier: number;
  };
  email_open: {
    base: number;
    campaign_multiplier: number;
  };
  email_click: {
    base: number;
    cta_multiplier: number;
  };
  form_submit: {
    base: number;
    demo_request_multiplier: number;
    contact_form_multiplier: number;
  };
  video_watch: {
    base: number;
    completion_bonus: number; // per 10% completion
  };
  demo_request: {
    base: number;
  };
  pricing_view: {
    base: number;
    repeat_visit_multiplier: number;
  };
}

export class BehavioralScoringService {
  private static instance: BehavioralScoringService;
  private redisClient: any;
  private scoringWeights: ScoringWeights;

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.redisClient.on('error', (err: any) => {
      logger.error('Redis connection error in BehavioralScoringService:', err);
    });

    this.initializeRedis();
    this.initializeScoringWeights();
  }

  public static getInstance(): BehavioralScoringService {
    if (!BehavioralScoringService.instance) {
      BehavioralScoringService.instance = new BehavioralScoringService();
    }
    return BehavioralScoringService.instance;
  }

  private async initializeRedis(): Promise<void> {
    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect();
        logger.info('BehavioralScoringService Redis connected');
      }
    } catch (error) {
      logger.error('Failed to connect Redis in BehavioralScoringService:', error);
    }
  }

  private initializeScoringWeights(): void {
    this.scoringWeights = {
      page_view: {
        base: 1,
        pricing_page_multiplier: 3,
        demo_page_multiplier: 4,
        product_page_multiplier: 2,
        duration_bonus: 0.5
      },
      download: {
        base: 5,
        whitepaper_multiplier: 1.5,
        case_study_multiplier: 2,
        trial_multiplier: 3
      },
      email_open: {
        base: 2,
        campaign_multiplier: 1.2
      },
      email_click: {
        base: 3,
        cta_multiplier: 2
      },
      form_submit: {
        base: 8,
        demo_request_multiplier: 2,
        contact_form_multiplier: 1.5
      },
      video_watch: {
        base: 4,
        completion_bonus: 0.5
      },
      demo_request: {
        base: 15
      },
      pricing_view: {
        base: 6,
        repeat_visit_multiplier: 1.3
      }
    };
  }

  async processActivity(activity: BehavioralActivity): Promise<ProcessingResult> {
    try {
      // Find contact by ID, email, or cookie
      const contact = await this.findContact(activity);
      
      if (!contact) {
        return {
          success: false,
          error: 'Contact not found or could not be identified'
        };
      }

      // Calculate score impact
      const scoreImpact = await this.calculateScoreImpact(activity, contact);
      
      // Update contact's behavioral score
      const newScore = Math.min(100, contact.leadScore + scoreImpact);
      
      // Add activity to contact's activity log
      contact.activities.push({
        type: this.mapActivityTypeToContactActivity(activity.type),
        content: activity.action,
        createdBy: new mongoose.Types.ObjectId('000000000000000000000000'), // System user
        createdAt: new Date(activity.timestamp),
        metadata: {
          behavioralActivity: true,
          scoreImpact,
          originalType: activity.type,
          ...activity.metadata
        }
      } as any);

      // Update lead score
      contact.leadScore = newScore;
      contact.lastActivityDate = new Date(activity.timestamp);

      await contact.save();

      // Check and trigger actions based on new score
      const triggeredActions = await this.checkTriggers(contact, scoreImpact);

      // Cache activity for real-time display
      await this.cacheRecentActivity(contact._id.toString(), {
        ...activity,
        id: new mongoose.Types.ObjectId().toString(),
        contactId: contact._id.toString(),
        scoreImpact
      });

      logger.info(`Behavioral score updated for contact ${contact._id}:`, {
        oldScore: contact.leadScore - scoreImpact,
        newScore,
        scoreImpact,
        activityType: activity.type
      });

      return {
        success: true,
        contactId: contact._id.toString(),
        scoreChange: scoreImpact,
        newScore,
        triggeredActions
      };

    } catch (error) {
      logger.error('Error processing behavioral activity:', error);
      return {
        success: false,
        error: 'Failed to process activity'
      };
    }
  }

  async processBatchActivities(activities: BehavioralActivity[]): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    for (const activity of activities) {
      const result = await this.processActivity(activity);
      results.push({
        ...result,
        activity
      });
    }

    return results;
  }

  private async findContact(activity: BehavioralActivity): Promise<IContact | null> {
    let contact: IContact | null = null;

    // Try to find by contact ID first
    if (activity.contactId) {
      contact = await Contact.findById(activity.contactId);
      if (contact) return contact;
    }

    // Try to find by email
    if (activity.email) {
      contact = await Contact.findOne({ 
        email: activity.email.toLowerCase(),
        isActive: true 
      });
      if (contact) return contact;
    }

    // Try to find by cookie ID (stored in custom fields)
    if (activity.cookieId) {
      contact = await Contact.findOne({
        'customFields.trackingCookieId': activity.cookieId,
        isActive: true
      });
      if (contact) return contact;
    }

    // If no contact found but we have email, create a new lead
    if (activity.email && this.shouldCreateNewLead(activity)) {
      contact = await this.createNewLeadFromActivity(activity);
    }

    return contact;
  }

  private shouldCreateNewLead(activity: BehavioralActivity): boolean {
    // Create new leads for high-intent activities
    const highIntentActivities = [
      'demo_request',
      'form_submit',
      'download',
      'pricing_view'
    ];

    return highIntentActivities.includes(activity.type);
  }

  private async createNewLeadFromActivity(activity: BehavioralActivity): Promise<IContact> {
    const emailParts = activity.email!.split('@');
    const firstName = emailParts[0].split('.')[0] || 'Unknown';
    const lastName = emailParts[0].split('.')[1] || 'Lead';
    const company = emailParts[1].split('.')[0] || 'Unknown Company';

    const newContact = new Contact({
      userId: new mongoose.Types.ObjectId('000000000000000000000000'), // System user
      firstName: this.capitalizeFirst(firstName),
      lastName: this.capitalizeFirst(lastName),
      email: activity.email!.toLowerCase(),
      company: this.capitalizeFirst(company),
      contactOwner: new mongoose.Types.ObjectId('000000000000000000000000'),
      lifecycleStage: 'lead',
      leadStatus: 'new',
      leadScore: 0,
      originalSource: 'behavioral_tracking',
      sourceDetails: {
        utm_source: activity.metadata.source,
        utm_campaign: activity.metadata.campaign,
        utm_medium: activity.metadata.medium
      },
      customFields: new Map([
        ['trackingCookieId', activity.cookieId],
        ['firstSeenActivity', activity.type],
        ['firstSeenPage', activity.metadata.page || activity.metadata.url]
      ]),
      activities: [{
        type: 'note',
        content: 'Lead created from behavioral tracking',
        createdBy: new mongoose.Types.ObjectId('000000000000000000000000'),
        createdAt: new Date(),
        metadata: { source: 'behavioral_tracking' }
      } as any]
    });

    await newContact.save();

    logger.info(`New lead created from behavioral activity: ${activity.email}`, {
      contactId: newContact._id,
      activityType: activity.type
    });

    return newContact;
  }

  private async calculateScoreImpact(activity: BehavioralActivity, contact: IContact): Promise<number> {
    const weights = this.scoringWeights[activity.type];
    if (!weights) {
      logger.warn(`No scoring weights found for activity type: ${activity.type}`);
      return 1;
    }

    let score = weights.base;

    // Apply specific multipliers based on activity type
    switch (activity.type) {
      case 'page_view':
        if (activity.metadata.page?.includes('pricing')) {
          score *= weights.pricing_page_multiplier;
        } else if (activity.metadata.page?.includes('demo')) {
          score *= weights.demo_page_multiplier;
        } else if (activity.metadata.page?.includes('product')) {
          score *= weights.product_page_multiplier;
        }
        
        if (activity.metadata.duration) {
          const minutesOnPage = activity.metadata.duration / 60;
          score += minutesOnPage * weights.duration_bonus;
        }
        break;

      case 'download':
        const fileName = activity.metadata.fileName?.toLowerCase() || '';
        if (fileName.includes('whitepaper')) {
          score *= weights.whitepaper_multiplier;
        } else if (fileName.includes('case') || fileName.includes('study')) {
          score *= weights.case_study_multiplier;
        } else if (fileName.includes('trial')) {
          score *= weights.trial_multiplier;
        }
        break;

      case 'email_click':
        if (activity.metadata.linkUrl?.includes('cta') || 
            activity.metadata.linkUrl?.includes('signup') ||
            activity.metadata.linkUrl?.includes('demo')) {
          score *= weights.cta_multiplier;
        }
        break;

      case 'form_submit':
        const formId = activity.metadata.formId?.toLowerCase() || '';
        if (formId.includes('demo')) {
          score *= weights.demo_request_multiplier;
        } else if (formId.includes('contact')) {
          score *= weights.contact_form_multiplier;
        }
        break;

      case 'video_watch':
        if (activity.metadata.watchDuration && activity.metadata.totalDuration) {
          const completionPercent = (activity.metadata.watchDuration / activity.metadata.totalDuration) * 100;
          const completionBonus = Math.floor(completionPercent / 10) * weights.completion_bonus;
          score += completionBonus;
        }
        break;

      case 'pricing_view':
        // Check if this is a repeat visit
        const recentPricingViews = await this.getRecentActivitiesCount(
          contact._id.toString(),
          'pricing_view',
          24 * 60 * 60 * 1000 // 24 hours
        );
        if (recentPricingViews > 0) {
          score *= weights.repeat_visit_multiplier;
        }
        break;
    }

    // Apply recency boost (more recent activities get higher scores)
    const activityAge = Date.now() - new Date(activity.timestamp).getTime();
    const hoursSinceActivity = activityAge / (1000 * 60 * 60);
    
    if (hoursSinceActivity < 1) {
      score *= 1.5; // 50% boost for activities within 1 hour
    } else if (hoursSinceActivity < 24) {
      score *= 1.2; // 20% boost for activities within 24 hours
    }

    // Apply frequency penalty (prevent score inflation from repeated actions)
    const recentSameTypeCount = await this.getRecentActivitiesCount(
      contact._id.toString(),
      activity.type,
      60 * 60 * 1000 // 1 hour
    );

    if (recentSameTypeCount > 2) {
      score *= 0.5; // Reduce score for repeated actions
    }

    return Math.round(Math.max(1, score)); // Ensure minimum score of 1
  }

  private async checkTriggers(contact: IContact, scoreImpact: number): Promise<Array<{
    id: string;
    name: string;
    action: string;
    triggered: boolean;
  }>> {
    const triggeredActions = [];

    // Define behavioral triggers
    const triggers = [
      {
        id: 'high_engagement',
        name: 'High Engagement Score',
        threshold: 80,
        action: 'Notify sales rep for immediate follow-up'
      },
      {
        id: 'pricing_interest',
        name: 'Pricing Page Interest',
        threshold: 60,
        action: 'Send pricing information email',
        condition: () => this.hasRecentActivity(contact._id.toString(), 'pricing_view', 2)
      },
      {
        id: 'demo_ready',
        name: 'Demo Request Ready',
        threshold: 70,
        action: 'Send demo scheduling link',
        condition: () => this.hasRecentHighIntentActivity(contact._id.toString())
      },
      {
        id: 'hot_lead',
        name: 'Hot Lead Alert',
        threshold: 90,
        action: 'Priority sales alert and personalized outreach'
      },
      {
        id: 'content_engagement',
        name: 'Content Engagement',
        threshold: 50,
        action: 'Send related content recommendations',
        condition: () => this.hasRecentActivity(contact._id.toString(), 'download', 3)
      }
    ];

    for (const trigger of triggers) {
      let shouldTrigger = contact.leadScore >= trigger.threshold;
      
      if (trigger.condition) {
        shouldTrigger = shouldTrigger && await trigger.condition();
      }

      if (shouldTrigger) {
        triggeredActions.push({
          id: trigger.id,
          name: trigger.name,
          action: trigger.action,
          triggered: true
        });

        // Log trigger for potential automation
        logger.info(`Behavioral trigger activated: ${trigger.name}`, {
          contactId: contact._id,
          contactEmail: contact.email,
          currentScore: contact.leadScore,
          action: trigger.action
        });

        // You could integrate with N8N here by sending a webhook
        // await this.sendTriggerToN8N(contact, trigger);
      }
    }

    return triggeredActions;
  }

  private async getRecentActivitiesCount(
    contactId: string,
    activityType: string,
    timeWindowMs: number
  ): Promise<number> {
    try {
      const cacheKey = `recent_activities:${contactId}:${activityType}`;
      const cached = await this.redisClient.get(cacheKey);
      
      if (cached) {
        const activities = JSON.parse(cached);
        const cutoff = Date.now() - timeWindowMs;
        return activities.filter((a: any) => new Date(a.timestamp).getTime() > cutoff).length;
      }

      return 0;
    } catch (error) {
      logger.error('Error getting recent activities count:', error);
      return 0;
    }
  }

  private async hasRecentActivity(
    contactId: string,
    activityType: string,
    minCount: number
  ): Promise<boolean> {
    const count = await this.getRecentActivitiesCount(
      contactId,
      activityType,
      24 * 60 * 60 * 1000 // 24 hours
    );
    return count >= minCount;
  }

  private async hasRecentHighIntentActivity(contactId: string): Promise<boolean> {
    const highIntentTypes = ['demo_request', 'pricing_view', 'form_submit'];
    
    for (const type of highIntentTypes) {
      if (await this.hasRecentActivity(contactId, type, 1)) {
        return true;
      }
    }
    
    return false;
  }

  private async cacheRecentActivity(contactId: string, activity: BehavioralActivity): Promise<void> {
    try {
      const cacheKey = `recent_activities:${contactId}`;
      const cached = await this.redisClient.get(cacheKey);
      
      let activities = cached ? JSON.parse(cached) : [];
      activities.unshift(activity);
      
      // Keep only last 100 activities
      activities = activities.slice(0, 100);
      
      await this.redisClient.setEx(cacheKey, 60 * 60 * 24, JSON.stringify(activities)); // 24 hour cache
      
      // Also cache by activity type for quick filtering
      const typeCacheKey = `recent_activities:${contactId}:${activity.type}`;
      const typeActivities = activities.filter((a: BehavioralActivity) => a.type === activity.type);
      await this.redisClient.setEx(typeCacheKey, 60 * 60 * 24, JSON.stringify(typeActivities));
      
    } catch (error) {
      logger.error('Error caching recent activity:', error);
    }
  }

  async getRecentActivities(contactId: string, limit: number = 50): Promise<BehavioralActivity[]> {
    try {
      const cacheKey = `recent_activities:${contactId}`;
      const cached = await this.redisClient.get(cacheKey);
      
      if (cached) {
        const activities = JSON.parse(cached);
        return activities.slice(0, limit);
      }

      return [];
    } catch (error) {
      logger.error('Error getting recent activities:', error);
      return [];
    }
  }

  private mapActivityTypeToContactActivity(behavioralType: string): string {
    const mapping = {
      page_view: 'note',
      download: 'note',
      email_open: 'email',
      email_click: 'email',
      form_submit: 'note',
      video_watch: 'note',
      doc_view: 'note',
      chat_start: 'note',
      search: 'note',
      pricing_view: 'note',
      demo_request: 'meeting'
    };

    return mapping[behavioralType as keyof typeof mapping] || 'note';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}

export default BehavioralScoringService;