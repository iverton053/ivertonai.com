# Overview Dashboard API Specification

## Overview
This document outlines the backend API endpoints required for the Overview Dashboard functionality. The frontend is already implemented and ready to consume these endpoints.

## Base URL
```
/api/overview
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

## Error Responses
All endpoints return errors in this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## Endpoints

### 1. Get Overview Metrics
**GET** `/api/overview/metrics/{clientId?}`

Returns comprehensive overview data for dashboard.

**Query Parameters:**
- `clientId` (optional): Specific client to filter data

**Response:**
```typescript
interface OverviewMetrics {
  performance: {
    revenue: {
      current: number;
      previous: number;
      change: number;
      target: number;
      currency: string;
    };
    leads: {
      total: number;
      qualified: number;
      converted: number;
      conversionRate: number;
    };
    traffic: {
      visitors: number;
      pageViews: number;
      sessions: number;
      averageSessionDuration: number;
      bounceRate: number;
    };
    engagement: {
      emailOpenRate: number;
      socialEngagement: number;
      contentShares: number;
      averageTimeOnSite: number;
    };
  };
  activeCampaigns: {
    email: ScheduledItem[];
    social: ScheduledItem[];
    ads: ActiveAdCampaign[];
    content: ContentSchedule[];
  };
  businessGoals: BusinessGoal[];
  recentActivity: ActivityItem[];
  alerts: AlertItem[];
  quickStats: {
    emailMarketing: EmailStats;
    socialMedia: SocialStats;
    automation: AutomationStats;
    crm: CRMStats;
  };
}
```

### 2. Get Performance Metrics
**GET** `/api/overview/performance`

**Query Parameters:**
- `timeframe`: `7d`, `30d`, `90d`, `1y` (default: `30d`)
- `clientId` (optional): Filter by client

**Response:**
```json
{
  "revenue": { "current": 52840, "previous": 48920, "change": 8.0 },
  "leads": { "total": 342, "qualified": 156 },
  "traffic": { "visitors": 12845, "sessions": 15234 },
  "engagement": { "emailOpenRate": 24.8, "socialEngagement": 1234 }
}
```

### 3. Get Scheduled Items
**GET** `/api/overview/scheduled-items`

**Query Parameters:**
- `limit`: Number of items to return (default: 10)
- `clientId` (optional): Filter by client
- `type`: `email`, `social`, `content`, `ads` (optional)

**Response:**
```json
{
  "email": [
    {
      "id": "email-1",
      "title": "Q4 Product Launch Campaign",
      "type": "email",
      "scheduledTime": "2024-01-15T14:30:00Z",
      "status": "scheduled",
      "audience": { "size": 2340, "segment": "High-value customers" }
    }
  ],
  "social": [],
  "content": [],
  "ads": []
}
```

### 4. Get Business Goals
**GET** `/api/overview/business-goals`

**Query Parameters:**
- `status`: `active`, `completed`, `paused` (optional)
- `clientId` (optional): Filter by client

**Response:**
```json
[
  {
    "id": "goal-1",
    "title": "Increase Monthly Revenue",
    "category": "revenue",
    "target": 75000,
    "current": 62400,
    "progress": 83.2,
    "status": "on-track",
    "priority": "high",
    "deadline": "2024-03-31T23:59:59Z",
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
]
```

### 5. Get Recent Activity
**GET** `/api/overview/recent-activity`

**Query Parameters:**
- `limit`: Number of activities (default: 20)
- `clientId` (optional): Filter by client
- `source`: `email-marketing`, `social-media`, `crm`, etc. (optional)

**Response:**
```json
[
  {
    "id": "activity-1",
    "type": "campaign-launched",
    "title": "New Email Campaign Started",
    "description": "Holiday promotion campaign launched to 5,000 subscribers",
    "timestamp": "2024-01-15T09:30:00Z",
    "source": "email-marketing",
    "metadata": { "campaignId": "camp-123", "audience": 5000 }
  }
]
```

### 6. Get Alerts
**GET** `/api/overview/alerts`

**Query Parameters:**
- `unreadOnly`: `true`/`false` (default: `true`)
- `priority`: `low`, `medium`, `high`, `critical` (optional)
- `clientId` (optional): Filter by client

**Response:**
```json
[
  {
    "id": "alert-1",
    "type": "warning",
    "title": "Ad Budget Running Low",
    "message": "Google Ads campaign has only $1,760 remaining (35% of budget)",
    "timestamp": "2024-01-15T11:30:00Z",
    "source": "ad-campaigns",
    "isRead": false,
    "priority": "medium",
    "action": {
      "label": "Increase Budget",
      "url": "/campaigns/google-ads",
      "type": "internal"
    }
  }
]
```

### 7. Get Quick Stats
**GET** `/api/overview/quick-stats/{clientId?}`

**Response:**
```json
{
  "emailMarketing": {
    "totalCampaigns": 23,
    "activeCampaigns": 3,
    "averageOpenRate": 24.8,
    "totalSubscribers": 12450,
    "recentPerformance": {
      "sent": 8750,
      "opened": 2170,
      "clicked": 347,
      "timeframe": "Last 7 days"
    }
  },
  "socialMedia": {
    "totalFollowers": 15680,
    "scheduledPosts": 12,
    "totalEngagement": 2340,
    "platformBreakdown": [
      { "platform": "LinkedIn", "followers": 5680, "engagement": 890 },
      { "platform": "Twitter", "followers": 8200, "engagement": 1200 },
      { "platform": "Facebook", "followers": 1800, "engagement": 250 }
    ]
  }
}
```

### 8. Update Goal Progress
**PATCH** `/api/overview/business-goals/{goalId}/progress`

**Request Body:**
```json
{
  "progress": 87.5,
  "notes": "Q1 targets exceeded"
}
```

### 9. Mark Alert as Read
**PATCH** `/api/overview/alerts/{alertId}/read`

### 10. Refresh All Data
**POST** `/api/overview/refresh/{clientId?}`

Triggers a full data refresh across all systems.

### 11. Real-time Updates (Server-Sent Events)
**GET** `/api/overview/subscribe`

**Query Parameters:**
- `clientId` (optional): Filter updates by client

Returns Server-Sent Events stream with real-time updates:
```
data: {"type": "performance_update", "data": {...}}

data: {"type": "new_alert", "data": {...}}

data: {"type": "goal_progress", "data": {...}}
```

### 12. Export Data
**GET** `/api/overview/export`

**Query Parameters:**
- `format`: `json`, `csv`, `pdf` (default: `json`)
- `clientId` (optional): Filter by client
- `dateRange`: `7d`, `30d`, `90d`, `custom`

### 13. Health Check
**GET** `/api/overview/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "external_apis": "degraded"
  }
}
```

## Data Models

### ScheduledItem
```typescript
interface ScheduledItem {
  id: string;
  title: string;
  type: 'email' | 'social-post' | 'content';
  scheduledTime: string; // ISO 8601
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  platform?: string;
  audience?: {
    size: number;
    segment: string;
  };
}
```

### BusinessGoal
```typescript
interface BusinessGoal {
  id: string;
  title: string;
  category: 'revenue' | 'leads' | 'engagement' | 'growth';
  target: number;
  current: number;
  progress: number;
  status: 'on-track' | 'at-risk' | 'off-track' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: string; // ISO 8601
  lastUpdated: string; // ISO 8601
}
```

### ActivityItem
```typescript
interface ActivityItem {
  id: string;
  type: 'campaign-launched' | 'goal-achieved' | 'lead-converted' | 'automation-completed' | 'content-published' | 'alert-triggered';
  title: string;
  description: string;
  timestamp: string; // ISO 8601
  source: 'email-marketing' | 'social-media' | 'crm' | 'automation' | 'content' | 'analytics';
  metadata: Record<string, any>;
}
```

### AlertItem
```typescript
interface AlertItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string; // ISO 8601
  source: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    label: string;
    url: string;
    type: 'internal' | 'external';
  };
}
```

## Implementation Notes

1. **Caching**: Implement Redis caching for performance metrics (5-minute TTL)
2. **Rate Limiting**: 100 requests per minute per user
3. **Real-time**: Use Server-Sent Events for live updates
4. **Security**: Validate all client IDs against user permissions
5. **Performance**: Implement pagination for large datasets
6. **Monitoring**: Log all API calls for analytics

## Frontend Integration Status
✅ **READY**: The frontend Overview Dashboard is fully implemented and ready to consume these APIs. It includes:
- Error handling and loading states
- Real-time updates via SSE
- Automatic fallback to mock data
- Proper TypeScript interfaces
- Responsive design
- Auto-refresh functionality