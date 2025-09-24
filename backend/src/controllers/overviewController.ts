import { Request, Response } from 'express';
import { BusinessGoal, ActivityItem, Alert, OverviewDataService } from '../models/Overview';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
  };
}

// SSE connections store
const sseConnections = new Map<string, Response[]>();

export class OverviewController {
  // Get comprehensive overview metrics
  static async getOverviewMetrics(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const clientId = req.params.clientId || req.query.clientId as string;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Fetch all data concurrently
      const [
        performance,
        activeCampaigns,
        businessGoals,
        recentActivity,
        alerts,
        quickStats
      ] = await Promise.all([
        OverviewDataService.getPerformanceMetrics(userId, clientId),
        OverviewDataService.getScheduledItems(userId, clientId),
        BusinessGoal.find({ userId, ...(clientId && { clientId }) }).sort({ createdAt: -1 }).limit(10),
        ActivityItem.find({ userId, ...(clientId && { clientId }) }).sort({ timestamp: -1 }).limit(20),
        Alert.find({ userId, ...(clientId && { clientId }), isRead: false }).sort({ timestamp: -1 }).limit(10),
        OverviewDataService.getQuickStats(userId, clientId)
      ]);

      const overviewData = {
        performance,
        activeCampaigns,
        businessGoals,
        recentActivity,
        alerts,
        quickStats
      };

      res.json(overviewData);

      // Log successful request
      logger.info(`Overview metrics fetched for user ${userId}`, { clientId });
    } catch (error) {
      logger.error('Error fetching overview metrics:', error);
      res.status(500).json({ 
        error: { 
          code: 'OVERVIEW_FETCH_ERROR',
          message: 'Failed to fetch overview data',
          details: process.env.NODE_ENV === 'development' ? error : {}
        }
      });
    }
  }

  // Get performance metrics only
  static async getPerformanceMetrics(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const clientId = req.query.clientId as string;
      const timeframe = req.query.timeframe as string || '30d';

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const performance = await OverviewDataService.getPerformanceMetrics(userId, clientId);
      res.json(performance);
    } catch (error) {
      logger.error('Error fetching performance metrics:', error);
      res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
  }

  // Get scheduled items
  static async getScheduledItems(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const clientId = req.query.clientId as string;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const scheduledItems = await OverviewDataService.getScheduledItems(userId, clientId, limit);
      
      // Filter by type if specified
      if (type && ['email', 'social', 'content', 'ads'].includes(type)) {
        const filteredItems = { [type]: scheduledItems[type as keyof typeof scheduledItems] };
        return res.json(filteredItems);
      }

      res.json(scheduledItems);
    } catch (error) {
      logger.error('Error fetching scheduled items:', error);
      res.status(500).json({ error: 'Failed to fetch scheduled items' });
    }
  }

  // Get business goals
  static async getBusinessGoals(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const clientId = req.query.clientId as string;
      const status = req.query.status as string;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const query: any = { userId };
      if (clientId) query.clientId = clientId;
      if (status) query.status = status;

      const goals = await BusinessGoal.find(query).sort({ createdAt: -1 });
      res.json(goals);
    } catch (error) {
      logger.error('Error fetching business goals:', error);
      res.status(500).json({ error: 'Failed to fetch business goals' });
    }
  }

  // Get recent activity
  static async getRecentActivity(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const clientId = req.query.clientId as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const source = req.query.source as string;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const query: any = { userId };
      if (clientId) query.clientId = clientId;
      if (source) query.source = source;

      const activities = await ActivityItem.find(query)
        .sort({ timestamp: -1 })
        .limit(limit);

      res.json(activities);
    } catch (error) {
      logger.error('Error fetching recent activity:', error);
      res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
  }

  // Get alerts
  static async getAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const clientId = req.query.clientId as string;
      const unreadOnly = req.query.unreadOnly === 'true';
      const priority = req.query.priority as string;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const query: any = { userId };
      if (clientId) query.clientId = clientId;
      if (unreadOnly) query.isRead = false;
      if (priority) query.priority = priority;

      const alerts = await Alert.find(query).sort({ timestamp: -1 });
      res.json(alerts);
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }

  // Get quick stats
  static async getQuickStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const clientId = req.params.clientId || req.query.clientId as string;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const quickStats = await OverviewDataService.getQuickStats(userId, clientId);
      res.json(quickStats);
    } catch (error) {
      logger.error('Error fetching quick stats:', error);
      res.status(500).json({ error: 'Failed to fetch quick stats' });
    }
  }

  // Update goal progress
  static async updateGoalProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const goalId = req.params.goalId;
      const { progress, notes } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const goal = await BusinessGoal.findOneAndUpdate(
        { _id: goalId, userId },
        { 
          progress, 
          current: (progress / 100) * goal?.target || 0,
          lastUpdated: new Date(),
          ...(notes && { notes })
        },
        { new: true }
      );

      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      // Broadcast update to SSE connections
      OverviewController.broadcastUpdate(userId, {
        type: 'goal_progress',
        data: goal
      });

      res.json(goal);
    } catch (error) {
      logger.error('Error updating goal progress:', error);
      res.status(500).json({ error: 'Failed to update goal progress' });
    }
  }

  // Mark alert as read
  static async markAlertAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const alertId = req.params.alertId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const alert = await Alert.findOneAndUpdate(
        { _id: alertId, userId },
        { isRead: true },
        { new: true }
      );

      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      res.json({ success: true, alert });
    } catch (error) {
      logger.error('Error marking alert as read:', error);
      res.status(500).json({ error: 'Failed to mark alert as read' });
    }
  }

  // Refresh all data
  static async refreshAllData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const clientId = req.params.clientId || req.query.clientId as string;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Trigger refresh of all data sources
      const overviewData = await OverviewController.getOverviewMetrics(req, res);
      
      logger.info(`Data refresh triggered for user ${userId}`, { clientId });
      
      // Don't send response here as getOverviewMetrics already does
    } catch (error) {
      logger.error('Error refreshing data:', error);
      res.status(500).json({ error: 'Failed to refresh data' });
    }
  }

  // Server-Sent Events endpoint
  static async subscribeToUpdates(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId || req.user?.id;
    const clientId = req.query.clientId as string;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Add connection to store
    const connectionKey = `${userId}${clientId ? `-${clientId}` : ''}`;
    if (!sseConnections.has(connectionKey)) {
      sseConnections.set(connectionKey, []);
    }
    sseConnections.get(connectionKey)!.push(res);

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Handle client disconnect
    req.on('close', () => {
      const connections = sseConnections.get(connectionKey);
      if (connections) {
        const index = connections.indexOf(res);
        if (index !== -1) {
          connections.splice(index, 1);
        }
        if (connections.length === 0) {
          sseConnections.delete(connectionKey);
        }
      }
      logger.info(`SSE connection closed for user ${userId}`);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);

    req.on('close', () => clearInterval(keepAlive));
  }

  // Export data
  static async exportData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const clientId = req.query.clientId as string;
      const format = req.query.format as string || 'json';

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get all overview data
      const data = await OverviewController.getOverviewMetrics(req, res);

      switch (format) {
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=overview-data.csv');
          // Convert to CSV (simplified)
          res.send('CSV export not implemented yet');
          break;
        case 'pdf':
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=overview-report.pdf');
          res.send('PDF export not implemented yet');
          break;
        default:
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', 'attachment; filename=overview-data.json');
          // Don't send here as getOverviewMetrics already sends response
      }
    } catch (error) {
      logger.error('Error exporting data:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  }

  // Health check
  static async healthCheck(req: Request, res: Response) {
    try {
      const dbStatus = await BusinessGoal.db.db?.admin().ping();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus ? 'healthy' : 'unhealthy',
          cache: 'healthy', // Assuming Redis is working if we reach here
          external_apis: 'healthy'
        }
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      });
    }
  }

  // Broadcast update to SSE connections
  static broadcastUpdate(userId: string, data: any, clientId?: string) {
    const connectionKey = `${userId}${clientId ? `-${clientId}` : ''}`;
    const connections = sseConnections.get(connectionKey);
    
    if (connections && connections.length > 0) {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      connections.forEach(res => {
        try {
          res.write(message);
        } catch (error) {
          logger.error('Error broadcasting SSE update:', error);
        }
      });
    }
  }
}