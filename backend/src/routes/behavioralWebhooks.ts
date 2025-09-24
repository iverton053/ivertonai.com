import express from 'express';
import Joi from 'joi';
import { BehavioralScoringService } from '../services/behavioralScoringService';
import { asyncHandler } from '../middleware/errorMiddleware';
import { logger } from '../utils/logger';
import { createClient } from 'redis';

const router = express.Router();
const behavioralService = BehavioralScoringService.getInstance();

// Redis client for real-time updates
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error in behavioral webhooks:', err);
});

// Initialize Redis connection
(async () => {
  try {
    await redisClient.connect();
    logger.info('Behavioral webhooks Redis client connected');
  } catch (error) {
    logger.error('Failed to connect Redis for behavioral webhooks:', error);
  }
})();

// Validation schemas
const behavioralActivitySchema = Joi.object({
  contactId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  email: Joi.string().email(),
  cookieId: Joi.string(),
  sessionId: Joi.string(),
  type: Joi.string().valid(
    'page_view',
    'download',
    'email_open',
    'email_click',
    'form_submit',
    'video_watch',
    'doc_view',
    'chat_start',
    'search',
    'pricing_view',
    'demo_request'
  ).required(),
  action: Joi.string().required().max(200),
  timestamp: Joi.date().default(Date.now),
  metadata: Joi.object({
    page: Joi.string(),
    url: Joi.string().uri(),
    duration: Joi.number().min(0),
    source: Joi.string(),
    campaign: Joi.string(),
    medium: Joi.string(),
    device: Joi.string(),
    browser: Joi.string(),
    location: Joi.object({
      country: Joi.string(),
      city: Joi.string(),
      region: Joi.string()
    }),
    referrer: Joi.string(),
    userAgent: Joi.string(),
    ipAddress: Joi.string().ip(),
    // Email specific
    emailId: Joi.string(),
    linkUrl: Joi.string().uri(),
    // Form specific
    formId: Joi.string(),
    formFields: Joi.array().items(Joi.string()),
    // Video specific
    videoId: Joi.string(),
    watchDuration: Joi.number().min(0),
    totalDuration: Joi.number().min(0),
    // Download specific
    fileName: Joi.string(),
    fileType: Joi.string(),
    fileSize: Joi.number().min(0)
  }).default({})
}).or('contactId', 'email', 'cookieId'); // At least one identifier required

// Batch activity schema for bulk processing
const batchActivitySchema = Joi.object({
  activities: Joi.array().items(behavioralActivitySchema).min(1).max(100).required(),
  source: Joi.string().default('webhook'),
  apiKey: Joi.string()
});

// Website activity webhook
router.post('/activity', asyncHandler(async (req, res) => {
  const { error, value } = behavioralActivitySchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  try {
    // Process the behavioral activity
    const result = await behavioralService.processActivity(value);
    
    if (result.success) {
      // Publish real-time update
      await publishRealTimeUpdate({
        type: 'activity_processed',
        contactId: result.contactId,
        activity: value,
        scoreChange: result.scoreChange,
        newScore: result.newScore,
        triggeredActions: result.triggeredActions
      });

      logger.info(`Behavioral activity processed: ${value.type} for contact ${result.contactId}`, {
        scoreChange: result.scoreChange,
        triggeredActions: result.triggeredActions?.length || 0
      });
    }

    res.json({
      success: true,
      data: {
        processed: result.success,
        contactId: result.contactId,
        scoreChange: result.scoreChange,
        newScore: result.newScore,
        triggeredActions: result.triggeredActions || []
      }
    });

  } catch (processingError) {
    logger.error('Error processing behavioral activity:', processingError);
    res.status(500).json({
      success: false,
      error: 'Failed to process activity'
    });
  }
}));

// Batch activities webhook
router.post('/activities/batch', asyncHandler(async (req, res) => {
  const { error, value } = batchActivitySchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  try {
    const results = await behavioralService.processBatchActivities(value.activities);
    
    // Publish batch real-time updates
    for (const result of results) {
      if (result.success) {
        await publishRealTimeUpdate({
          type: 'activity_processed',
          contactId: result.contactId,
          activity: result.activity,
          scoreChange: result.scoreChange,
          newScore: result.newScore,
          triggeredActions: result.triggeredActions
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    logger.info(`Batch activities processed: ${successCount}/${results.length} successful`);

    res.json({
      success: true,
      data: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
        results: results.map(r => ({
          success: r.success,
          contactId: r.contactId,
          scoreChange: r.scoreChange,
          error: r.error
        }))
      }
    });

  } catch (processingError) {
    logger.error('Error processing batch activities:', processingError);
    res.status(500).json({
      success: false,
      error: 'Failed to process batch activities'
    });
  }
}));

// Email activity webhook (for email platforms like Mailchimp, SendGrid)
router.post('/email-activity', asyncHandler(async (req, res) => {
  // Transform email platform data to our format
  const emailActivity = transformEmailActivity(req.body, req.get('User-Agent') || '');
  
  const { error, value } = behavioralActivitySchema.validate(emailActivity);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email activity data',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  try {
    const result = await behavioralService.processActivity(value);
    
    if (result.success) {
      await publishRealTimeUpdate({
        type: 'email_activity_processed',
        contactId: result.contactId,
        activity: value,
        scoreChange: result.scoreChange,
        newScore: result.newScore
      });

      logger.info(`Email activity processed: ${value.type} for ${value.email}`, {
        scoreChange: result.scoreChange
      });
    }

    res.json({
      success: true,
      data: {
        processed: result.success,
        contactId: result.contactId,
        scoreChange: result.scoreChange
      }
    });

  } catch (processingError) {
    logger.error('Error processing email activity:', processingError);
    res.status(500).json({
      success: false,
      error: 'Failed to process email activity'
    });
  }
}));

// Social media activity webhook
router.post('/social-activity', asyncHandler(async (req, res) => {
  const socialActivity = transformSocialActivity(req.body);
  
  const { error, value } = behavioralActivitySchema.validate(socialActivity);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid social activity data'
    });
  }

  try {
    const result = await behavioralService.processActivity(value);
    
    if (result.success) {
      await publishRealTimeUpdate({
        type: 'social_activity_processed',
        contactId: result.contactId,
        activity: value,
        scoreChange: result.scoreChange,
        newScore: result.newScore
      });
    }

    res.json({
      success: true,
      data: {
        processed: result.success,
        contactId: result.contactId,
        scoreChange: result.scoreChange
      }
    });

  } catch (processingError) {
    logger.error('Error processing social activity:', processingError);
    res.status(500).json({
      success: false,
      error: 'Failed to process social activity'
    });
  }
}));

// Get real-time activity stream
router.get('/activity-stream/:contactId', asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  
  if (!contactId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid contact ID format'
    });
  }

  try {
    const activities = await behavioralService.getRecentActivities(contactId, 50);
    
    res.json({
      success: true,
      data: {
        contactId,
        activities: activities.map(activity => ({
          id: activity.id,
          type: activity.type,
          action: activity.action,
          timestamp: activity.timestamp,
          scoreImpact: activity.scoreImpact,
          metadata: activity.metadata
        }))
      }
    });

  } catch (error) {
    logger.error('Error fetching activity stream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity stream'
    });
  }
}));

// Health check for webhook endpoints
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Behavioral Webhooks',
    timestamp: new Date().toISOString(),
    redis: redisClient.isOpen ? 'connected' : 'disconnected'
  });
});

// Helper functions
function transformEmailActivity(emailData: any, userAgent: string): any {
  // Transform different email platform formats
  if (userAgent.includes('Mailchimp')) {
    return transformMailchimpActivity(emailData);
  } else if (userAgent.includes('SendGrid')) {
    return transformSendGridActivity(emailData);
  } else {
    return transformGenericEmailActivity(emailData);
  }
}

function transformMailchimpActivity(data: any): any {
  return {
    email: data.data?.email,
    type: data.type === 'open' ? 'email_open' : 'email_click',
    action: data.type === 'open' ? 'Opened email' : `Clicked: ${data.data?.url}`,
    timestamp: data.fired_at,
    metadata: {
      emailId: data.data?.campaign_id,
      linkUrl: data.data?.url,
      campaign: data.data?.campaign_title,
      source: 'mailchimp'
    }
  };
}

function transformSendGridActivity(data: any): any {
  return {
    email: data.email,
    type: data.event === 'open' ? 'email_open' : 'email_click',
    action: data.event === 'open' ? 'Opened email' : `Clicked: ${data.url}`,
    timestamp: new Date(data.timestamp * 1000),
    metadata: {
      emailId: data.sg_message_id,
      linkUrl: data.url,
      campaign: data.category,
      source: 'sendgrid'
    }
  };
}

function transformGenericEmailActivity(data: any): any {
  return {
    email: data.email,
    type: data.event_type || 'email_open',
    action: data.action || 'Email interaction',
    timestamp: data.timestamp || new Date(),
    metadata: {
      source: 'generic',
      ...data.metadata
    }
  };
}

function transformSocialActivity(data: any): any {
  return {
    email: data.user_email,
    type: 'page_view',
    action: `Social interaction: ${data.action}`,
    timestamp: data.timestamp || new Date(),
    metadata: {
      platform: data.platform,
      post_id: data.post_id,
      interaction_type: data.interaction_type,
      source: 'social'
    }
  };
}

async function publishRealTimeUpdate(update: any): Promise<void> {
  try {
    if (redisClient.isOpen) {
      await redisClient.publish('behavioral_updates', JSON.stringify(update));
    }
  } catch (error) {
    logger.error('Failed to publish real-time update:', error);
  }
}

export default router;