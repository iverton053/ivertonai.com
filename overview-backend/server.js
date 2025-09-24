const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // In a real app, verify JWT token here
  // For demo purposes, we'll just accept any token
  req.user = { id: 'demo-user-id' };
  next();
};

// Store for SSE connections
const sseConnections = new Map();

// Mock data for overview dashboard
const getMockOverviewData = () => ({
  performance: {
    revenue: {
      current: 52840,
      previous: 48920,
      change: 8.0,
      target: 60000,
      currency: 'USD'
    },
    leads: {
      total: 342,
      qualified: 156,
      converted: 23,
      conversionRate: 14.7
    },
    traffic: {
      visitors: 12845,
      pageViews: 38567,
      sessions: 15234,
      averageSessionDuration: 245,
      bounceRate: 32.4
    },
    engagement: {
      emailOpenRate: 24.8,
      socialEngagement: 1234,
      contentShares: 89,
      averageTimeOnSite: 198
    }
  },
  activeCampaigns: {
    email: [
      {
        id: 'email-1',
        title: 'Q4 Product Launch Campaign',
        type: 'email',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        audience: { size: 2340, segment: 'High-value customers' }
      },
      {
        id: 'email-2',
        title: 'Weekly Newsletter',
        type: 'email',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        audience: { size: 8756, segment: 'All subscribers' }
      }
    ],
    social: [
      {
        id: 'social-1',
        title: 'Behind the scenes video',
        type: 'social-post',
        scheduledTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        platform: 'LinkedIn'
      }
    ],
    content: [
      {
        id: 'content-1',
        title: 'SEO Best Practices Blog Post',
        type: 'content',
        scheduledTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'review'
      }
    ],
    ads: []
  },
  businessGoals: [
    {
      id: 'goal-1',
      title: 'Increase Monthly Revenue',
      category: 'revenue',
      target: 75000,
      current: 62400,
      progress: 83.2,
      status: 'on-track',
      priority: 'high',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'goal-2',
      title: 'Boost Lead Conversion Rate',
      category: 'leads',
      target: 20,
      current: 14.7,
      progress: 73.5,
      status: 'on-track',
      priority: 'medium',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString()
    }
  ],
  recentActivity: [
    {
      id: 'activity-1',
      type: 'campaign-launched',
      title: 'New Email Campaign Started',
      description: 'Holiday promotion campaign launched to 5,000 subscribers',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: 'email-marketing',
      metadata: { campaignId: 'camp-123', audience: 5000 }
    },
    {
      id: 'activity-2',
      type: 'goal-achieved',
      title: 'Monthly Target Reached',
      description: 'Website traffic goal exceeded by 12%',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      source: 'analytics',
      metadata: { goalId: 'traffic-monthly', achievement: 112 }
    }
  ],
  alerts: [
    {
      id: 'alert-1',
      type: 'warning',
      title: 'Ad Budget Running Low',
      message: 'Google Ads campaign has only $1,760 remaining (35% of budget)',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      source: 'ad-campaigns',
      isRead: false,
      priority: 'medium',
      action: {
        label: 'Increase Budget',
        url: '/campaigns/google-ads',
        type: 'internal'
      }
    }
  ],
  quickStats: {
    emailMarketing: {
      totalCampaigns: 23,
      activeCampaigns: 3,
      scheduledCampaigns: 5,
      averageOpenRate: 24.8,
      totalSubscribers: 12450,
      recentPerformance: {
        sent: 8750,
        opened: 2170,
        clicked: 347,
        timeframe: 'Last 7 days'
      }
    },
    socialMedia: {
      totalFollowers: 15680,
      scheduledPosts: 12,
      totalEngagement: 2340,
      recentPerformance: {
        posts: 15,
        reach: 8450,
        engagement: 567,
        timeframe: 'Last 7 days'
      },
      platformBreakdown: [
        { platform: 'LinkedIn', followers: 5680, engagement: 890 },
        { platform: 'Twitter', followers: 8200, engagement: 1200 },
        { platform: 'Facebook', followers: 1800, engagement: 250 }
      ]
    },
    automation: {
      activeAutomations: 12,
      averageSuccessRate: 94.7,
      completedToday: 47,
      timeSavedHours: 12.4,
      recentRuns: {
        successful: 156,
        failed: 8,
        timeframe: 'Last 7 days'
      }
    },
    crm: {
      totalContacts: 2850,
      conversionRate: 14.7,
      dealsValue: 125000,
      newContactsToday: 23,
      dealsInPipeline: 67,
      recentActivity: {
        newContacts: 89,
        closedDeals: 7,
        timeframe: 'Last 7 days'
      }
    }
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Overview Dashboard API'
  });
});

// Overview API routes
app.get('/api/overview/metrics/:clientId?', authenticateToken, (req, res) => {
  try {
    const overviewData = getMockOverviewData();
    res.json(overviewData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch overview data' });
  }
});

app.get('/api/overview/performance', authenticateToken, (req, res) => {
  try {
    const overviewData = getMockOverviewData();
    res.json(overviewData.performance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

app.get('/api/overview/scheduled-items', authenticateToken, (req, res) => {
  try {
    const overviewData = getMockOverviewData();
    res.json(overviewData.activeCampaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scheduled items' });
  }
});

app.get('/api/overview/business-goals', authenticateToken, (req, res) => {
  try {
    const overviewData = getMockOverviewData();
    res.json(overviewData.businessGoals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch business goals' });
  }
});

app.get('/api/overview/recent-activity', authenticateToken, (req, res) => {
  try {
    const overviewData = getMockOverviewData();
    res.json(overviewData.recentActivity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

app.get('/api/overview/alerts', authenticateToken, (req, res) => {
  try {
    const overviewData = getMockOverviewData();
    res.json(overviewData.alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.get('/api/overview/quick-stats/:clientId?', authenticateToken, (req, res) => {
  try {
    const overviewData = getMockOverviewData();
    res.json(overviewData.quickStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quick stats' });
  }
});

// Update goal progress
app.patch('/api/overview/business-goals/:goalId/progress', authenticateToken, (req, res) => {
  try {
    const { progress } = req.body;
    const overviewData = getMockOverviewData();
    const goal = overviewData.businessGoals.find(g => g.id === req.params.goalId);
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    goal.progress = progress;
    goal.current = (progress / 100) * goal.target;
    goal.lastUpdated = new Date().toISOString();
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal progress' });
  }
});

// Mark alert as read
app.patch('/api/overview/alerts/:alertId/read', authenticateToken, (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark alert as read' });
  }
});

// Refresh data
app.post('/api/overview/refresh/:clientId?', authenticateToken, (req, res) => {
  try {
    const overviewData = getMockOverviewData();
    res.json(overviewData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh data' });
  }
});

// Server-Sent Events for real-time updates
app.get('/api/overview/subscribe', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const clientId = req.query.clientId;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Store connection
  const connectionKey = `${userId}${clientId ? `-${clientId}` : ''}`;
  if (!sseConnections.has(connectionKey)) {
    sseConnections.set(connectionKey, []);
  }
  sseConnections.get(connectionKey).push(res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\\n\\n`);

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
  });

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\\n\\n`);
  }, 30000);

  req.on('close', () => clearInterval(keepAlive));
});

// Export data
app.get('/api/overview/export', authenticateToken, (req, res) => {
  try {
    const format = req.query.format || 'json';
    const overviewData = getMockOverviewData();

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=overview-data.json');
      res.json(overviewData);
    } else {
      res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Health check for overview service
app.get('/api/overview/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'healthy',
      cache: 'healthy',
      external_apis: 'healthy'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\\n🚀 Overview Dashboard API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/overview`);
  console.log(`\\n📋 Available Endpoints:`);
  console.log(`   GET  /api/overview/metrics`);
  console.log(`   GET  /api/overview/performance`);
  console.log(`   GET  /api/overview/scheduled-items`);
  console.log(`   GET  /api/overview/business-goals`);
  console.log(`   GET  /api/overview/recent-activity`);
  console.log(`   GET  /api/overview/alerts`);
  console.log(`   GET  /api/overview/quick-stats`);
  console.log(`   GET  /api/overview/subscribe (SSE)`);
  console.log(`\\n🔐 Note: All API endpoints require Authorization header`);
  console.log(`   Example: Authorization: Bearer your-token-here`);
});

module.exports = app;