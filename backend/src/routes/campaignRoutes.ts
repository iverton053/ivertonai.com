import express from 'express';
import Joi from 'joi';
import { CampaignService } from '../services/campaignService';
import { AuthRequest, requireSubscription, checkUsageLimits } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorMiddleware';
import { logger } from '../utils/logger';

const router = express.Router();
const campaignService = CampaignService.getInstance();

// Validation schemas
const createCampaignSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  platform: Joi.string().required().valid('google_ads', 'facebook_ads', 'instagram_ads', 'linkedin_ads', 'twitter_ads', 'pinterest_ads'),
  objective: Joi.string().required().valid('conversions', 'traffic', 'awareness', 'engagement', 'leads', 'sales'),
  accountId: Joi.string().required(),
  budget: Joi.object({
    daily: Joi.number().required().min(1),
    lifetime: Joi.number().min(1),
    currency: Joi.string().required().length(3).default('USD')
  }).required(),
  targeting: Joi.object({
    locations: Joi.array().items(Joi.string()).required().min(1),
    demographics: Joi.object({
      age_min: Joi.number().min(18).max(65),
      age_max: Joi.number().min(18).max(65),
      genders: Joi.array().items(Joi.string())
    }),
    interests: Joi.array().items(Joi.string()),
    behaviors: Joi.array().items(Joi.string()),
    keywords: Joi.array().items(Joi.string()),
    custom_audiences: Joi.array().items(Joi.string()),
    lookalike_audiences: Joi.array().items(Joi.string())
  }).required(),
  schedule: Joi.object({
    start_date: Joi.date().required().min('now'),
    end_date: Joi.date().min(Joi.ref('start_date')),
    time_zone: Joi.string().required().default('UTC'),
    ad_scheduling: Joi.object({
      days_of_week: Joi.array().items(Joi.number().min(0).max(6)),
      hours_of_day: Joi.array().items(Joi.number().min(0).max(23))
    })
  }).required(),
  bidding: Joi.object({
    strategy: Joi.string().required().valid('manual_cpc', 'target_cpa', 'target_roas', 'maximize_conversions', 'maximize_clicks'),
    amount: Joi.number().min(0.01),
    target_cpa: Joi.number().min(0.01),
    target_roas: Joi.number().min(0.01)
  })
});

const updateCampaignSchema = Joi.object({
  name: Joi.string().min(1).max(255),
  status: Joi.string().valid('active', 'paused', 'ended'),
  budget: Joi.object({
    daily: Joi.number().min(1),
    lifetime: Joi.number().min(1),
    currency: Joi.string().length(3)
  }),
  targeting: Joi.object({
    locations: Joi.array().items(Joi.string()).min(1),
    demographics: Joi.object({
      age_min: Joi.number().min(18).max(65),
      age_max: Joi.number().min(18).max(65),
      genders: Joi.array().items(Joi.string())
    }),
    interests: Joi.array().items(Joi.string()),
    behaviors: Joi.array().items(Joi.string()),
    keywords: Joi.array().items(Joi.string()),
    custom_audiences: Joi.array().items(Joi.string()),
    lookalike_audiences: Joi.array().items(Joi.string())
  }),
  schedule: Joi.object({
    start_date: Joi.date().min('now'),
    end_date: Joi.date().min(Joi.ref('start_date')),
    time_zone: Joi.string(),
    ad_scheduling: Joi.object({
      days_of_week: Joi.array().items(Joi.number().min(0).max(6)),
      hours_of_day: Joi.array().items(Joi.number().min(0).max(23))
    })
  }),
  bidding: Joi.object({
    strategy: Joi.string().valid('manual_cpc', 'target_cpa', 'target_roas', 'maximize_conversions', 'maximize_clicks'),
    amount: Joi.number().min(0.01),
    target_cpa: Joi.number().min(0.01),
    target_roas: Joi.number().min(0.01)
  }),
  automation: Joi.object({
    enabled: Joi.boolean(),
    rules: Joi.array().items(Joi.object({
      condition: Joi.string().required(),
      threshold: Joi.number().required(),
      action: Joi.string().required(),
      enabled: Joi.boolean().default(true)
    })),
    optimization_frequency: Joi.number().min(1).max(168)
  })
});

// GET /api/campaigns - Get all campaigns for user
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { platform, status, objective } = req.query;
  
  const filters: any = {};
  if (platform) filters.platform = platform;
  if (status) filters.status = status;
  if (objective) filters.objective = objective;

  const campaigns = await campaignService.getCampaigns(req.userId!, filters);
  
  res.json({
    success: true,
    data: campaigns,
    count: campaigns.length
  });
}));

// GET /api/campaigns/summary - Get performance summary
router.get('/summary', asyncHandler(async (req: AuthRequest, res) => {
  const summary = await campaignService.getCampaignPerformanceSummary(req.userId!);
  
  res.json({
    success: true,
    data: summary
  });
}));

// GET /api/campaigns/:id - Get single campaign
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  const campaign = await campaignService.getCampaignById(req.userId!, id);
  
  if (!campaign) {
    return res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }
  
  res.json({
    success: true,
    data: campaign
  });
}));

// POST /api/campaigns - Create new campaign
router.post('/', 
  requireSubscription(['basic', 'pro', 'enterprise']),
  checkUsageLimits('campaigns'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { error, value } = createCampaignSchema.validate(req.body, { abortEarly: false });
    
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

    const campaign = await campaignService.createCampaign(req.userId!, value.accountId, value);
    
    // Update user's campaign usage count
    if (req.user) {
      req.user.subscription.usage.campaigns_used += 1;
      await req.user.save();
    }
    
    logger.info(`Campaign created by user ${req.userId}: ${campaign._id}`);
    
    res.status(201).json({
      success: true,
      data: campaign
    });
  })
);

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = updateCampaignSchema.validate(req.body, { abortEarly: false });
  
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

  const campaign = await campaignService.updateCampaign(req.userId!, id, value);
  
  if (!campaign) {
    return res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }
  
  logger.info(`Campaign updated by user ${req.userId}: ${id}`);
  
  res.json({
    success: true,
    data: campaign
  });
}));

// PATCH /api/campaigns/:id/status - Update campaign status
router.patch('/:id/status', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['active', 'paused', 'ended'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Valid status required (active, paused, ended)'
    });
  }

  const campaign = await campaignService.updateCampaignStatus(req.userId!, id, status);
  
  if (!campaign) {
    return res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }
  
  logger.info(`Campaign status updated by user ${req.userId}: ${id} -> ${status}`);
  
  res.json({
    success: true,
    data: campaign
  });
}));

// DELETE /api/campaigns/:id - Delete campaign (soft delete)
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  const success = await campaignService.deleteCampaign(req.userId!, id);
  
  if (!success) {
    return res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }
  
  logger.info(`Campaign deleted by user ${req.userId}: ${id}`);
  
  res.json({
    success: true,
    message: 'Campaign deleted successfully'
  });
}));

// POST /api/campaigns/:id/refresh-metrics - Refresh campaign metrics
router.post('/:id/refresh-metrics', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  await campaignService.refreshCampaignMetrics(req.userId!, id);
  
  logger.info(`Campaign metrics refreshed by user ${req.userId}: ${id}`);
  
  res.json({
    success: true,
    message: 'Metrics refresh initiated'
  });
}));

// POST /api/campaigns/refresh-all-metrics - Refresh all campaign metrics
router.post('/refresh-all-metrics', asyncHandler(async (req: AuthRequest, res) => {
  await campaignService.refreshCampaignMetrics(req.userId!);
  
  logger.info(`All campaign metrics refreshed by user ${req.userId}`);
  
  res.json({
    success: true,
    message: 'Metrics refresh initiated for all campaigns'
  });
}));

// POST /api/campaigns/:id/optimize - Optimize campaign
router.post('/:id/optimize', 
  requireSubscription(['pro', 'enterprise']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    
    const result = await campaignService.optimizeCampaign(req.userId!, id);
    
    logger.info(`Campaign optimized by user ${req.userId}: ${id}`);
    
    res.json({
      success: true,
      data: result
    });
  })
);

// POST /api/campaigns/:id/duplicate - Duplicate campaign
router.post('/:id/duplicate', 
  requireSubscription(['basic', 'pro', 'enterprise']),
  checkUsageLimits('campaigns'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { name } = req.body;
    
    const originalCampaign = await campaignService.getCampaignById(req.userId!, id);
    
    if (!originalCampaign) {
      return res.status(404).json({
        success: false,
        error: 'Original campaign not found'
      });
    }
    
    // Create duplicate with new name and paused status
    const duplicateData = {
      name: name || `${originalCampaign.name} (Copy)`,
      platform: originalCampaign.platform,
      objective: originalCampaign.objective,
      budget: originalCampaign.budget,
      targeting: originalCampaign.targeting,
      schedule: {
        ...originalCampaign.schedule,
        start_date: new Date() // Start from today
      },
      bidding: originalCampaign.bidding
    };
    
    const duplicateCampaign = await campaignService.createCampaign(
      req.userId!,
      originalCampaign.platform,
      duplicateData
    );
    
    // Update user's campaign usage count
    if (req.user) {
      req.user.subscription.usage.campaigns_used += 1;
      await req.user.save();
    }
    
    logger.info(`Campaign duplicated by user ${req.userId}: ${id} -> ${duplicateCampaign._id}`);
    
    res.status(201).json({
      success: true,
      data: duplicateCampaign
    });
  })
);

export default router;