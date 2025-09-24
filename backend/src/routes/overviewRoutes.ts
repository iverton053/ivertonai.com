import express from 'express';
import { OverviewController } from '../controllers/overviewController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const goalProgressSchema = Joi.object({
  progress: Joi.number().min(0).max(100).required(),
  notes: Joi.string().optional()
});

const queryParamsSchema = Joi.object({
  clientId: Joi.string().optional(),
  timeframe: Joi.string().valid('7d', '30d', '90d', '1y').optional(),
  limit: Joi.number().min(1).max(100).optional(),
  type: Joi.string().valid('email', 'social', 'content', 'ads').optional(),
  status: Joi.string().valid('active', 'completed', 'paused').optional(),
  unreadOnly: Joi.boolean().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  source: Joi.string().optional(),
  format: Joi.string().valid('json', 'csv', 'pdf').optional()
});

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route GET /api/overview/metrics/:clientId?
 * @desc Get comprehensive overview metrics
 * @access Private
 */
router.get('/metrics/:clientId?', 
  validateRequest({ query: queryParamsSchema }), 
  OverviewController.getOverviewMetrics
);

/**
 * @route GET /api/overview/performance
 * @desc Get performance metrics only
 * @access Private
 */
router.get('/performance', 
  validateRequest({ query: queryParamsSchema }), 
  OverviewController.getPerformanceMetrics
);

/**
 * @route GET /api/overview/scheduled-items
 * @desc Get scheduled campaigns and content
 * @access Private
 */
router.get('/scheduled-items', 
  validateRequest({ query: queryParamsSchema }), 
  OverviewController.getScheduledItems
);

/**
 * @route GET /api/overview/business-goals
 * @desc Get business goals with progress tracking
 * @access Private
 */
router.get('/business-goals', 
  validateRequest({ query: queryParamsSchema }), 
  OverviewController.getBusinessGoals
);

/**
 * @route GET /api/overview/recent-activity
 * @desc Get recent activity across all features
 * @access Private
 */
router.get('/recent-activity', 
  validateRequest({ query: queryParamsSchema }), 
  OverviewController.getRecentActivity
);

/**
 * @route GET /api/overview/alerts
 * @desc Get active alerts and notifications
 * @access Private
 */
router.get('/alerts', 
  validateRequest({ query: queryParamsSchema }), 
  OverviewController.getAlerts
);

/**
 * @route GET /api/overview/quick-stats/:clientId?
 * @desc Get quick stats summary
 * @access Private
 */
router.get('/quick-stats/:clientId?', 
  validateRequest({ query: queryParamsSchema }), 
  OverviewController.getQuickStats
);

/**
 * @route PATCH /api/overview/business-goals/:goalId/progress
 * @desc Update business goal progress
 * @access Private
 */
router.patch('/business-goals/:goalId/progress', 
  validateRequest({ body: goalProgressSchema }), 
  OverviewController.updateGoalProgress
);

/**
 * @route PATCH /api/overview/alerts/:alertId/read
 * @desc Mark alert as read
 * @access Private
 */
router.patch('/alerts/:alertId/read', OverviewController.markAlertAsRead);

/**
 * @route POST /api/overview/refresh/:clientId?
 * @desc Refresh all overview data
 * @access Private
 */
router.post('/refresh/:clientId?', OverviewController.refreshAllData);

/**
 * @route GET /api/overview/subscribe
 * @desc Server-Sent Events for real-time updates
 * @access Private
 */
router.get('/subscribe', OverviewController.subscribeToUpdates);

/**
 * @route GET /api/overview/export
 * @desc Export overview data in various formats
 * @access Private
 */
router.get('/export', 
  validateRequest({ query: queryParamsSchema }), 
  OverviewController.exportData
);

/**
 * @route GET /api/overview/health
 * @desc Health check for overview service
 * @access Public
 */
router.get('/health', OverviewController.healthCheck);

export default router;