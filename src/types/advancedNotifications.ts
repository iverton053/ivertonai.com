// Advanced Notification System - Comprehensive Types and Interfaces

export type NotificationChannel = 'toast' | 'panel' | 'inline' | 'badge' | 'banner' | 'modal' | 'desktop' | 'email' | 'sms' | 'webhook';

export type NotificationType = 
  | 'system' | 'security' | 'backup' | 'platform' | 'social' | 'content' | 'file' | 'brand' | 'approval'
  | 'success' | 'error' | 'warning' | 'info' | 'critical' | 'marketing' | 'finance' | 'user' | 'workflow';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';

export type NotificationStatus = 'pending' | 'delivered' | 'read' | 'acknowledged' | 'dismissed' | 'expired' | 'failed';

export type NotificationTrigger = 'manual' | 'automated' | 'scheduled' | 'conditional' | 'threshold' | 'event' | 'webhook';

export interface NotificationAction {
  id: string;
  type: 'button' | 'link' | 'dropdown' | 'toggle' | 'input';
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  action: string;
  payload?: Record<string, any>;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface NotificationRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions: NotificationCondition[];
  channels: NotificationChannel[];
  priority: NotificationPriority;
  throttling?: {
    enabled: boolean;
    maxPerHour: number;
    maxPerDay: number;
    cooldownMinutes: number;
  };
  scheduling?: {
    immediate: boolean;
    delay?: number;
    schedule?: string; // cron expression
    timezone?: string;
  };
  template?: string;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject: string;
  body: string;
  htmlBody?: string;
  variables: string[];
  channels: NotificationChannel[];
  defaultPriority: NotificationPriority;
  actions?: NotificationAction[];
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    icon?: string;
    animation?: string;
  };
}

export interface NotificationRecipient {
  id: string;
  type: 'user' | 'role' | 'department' | 'team' | 'external';
  identifier: string;
  preferences?: NotificationPreferences;
  contactInfo?: {
    email?: string;
    phone?: string;
    slack?: string;
    webhook?: string;
  };
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    [key in NotificationChannel]: {
      enabled: boolean;
      priority?: NotificationPriority;
      quietHours?: {
        enabled: boolean;
        start: string;
        end: string;
        timezone?: string;
      };
      frequency?: 'immediate' | 'batched' | 'daily' | 'weekly';
    };
  };
  categories: {
    [key in NotificationType]: {
      enabled: boolean;
      priority?: NotificationPriority;
      channels?: NotificationChannel[];
    };
  };
  smartBatching: {
    enabled: boolean;
    maxBatchSize: number;
    batchInterval: number;
    intelligentGrouping: boolean;
  };
  doNotDisturb: {
    enabled: boolean;
    start?: string;
    end?: string;
    days?: number[];
    allowUrgent?: boolean;
  };
}

export interface AdvancedNotification {
  // Core Properties
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  
  // Content
  title: string;
  message: string;
  htmlMessage?: string;
  summary?: string;
  
  // Metadata
  source: string;
  sourceId?: string;
  userId?: string;
  tenantId?: string;
  category?: string;
  tags?: string[];
  
  // Timing
  createdAt: number;
  updatedAt: number;
  scheduledAt?: number;
  deliveredAt?: number;
  readAt?: number;
  acknowledgedAt?: number;
  expiresAt?: number;
  
  // Delivery
  channels: NotificationChannel[];
  deliveryStatus: {
    [key in NotificationChannel]?: {
      status: NotificationStatus;
      attempts: number;
      lastAttempt?: number;
      error?: string;
    };
  };
  
  // Behavior
  persistent?: boolean;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDuration?: number;
  requiresAcknowledgment?: boolean;
  
  // Interaction
  actions?: NotificationAction[];
  clickAction?: {
    type: 'route' | 'url' | 'action' | 'modal';
    target: string;
    payload?: Record<string, any>;
  };
  
  // Grouping & Batching
  groupKey?: string;
  parentId?: string;
  childIds?: string[];
  batchId?: string;
  
  // Smart Features
  context?: {
    currentRoute?: string;
    userActivity?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    location?: string;
    referrer?: string;
  };
  
  // Rich Content
  media?: {
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    thumbnail?: string;
    description?: string;
  }[];
  
  // Analytics
  analytics?: {
    impressions: number;
    clicks: number;
    dismissals: number;
    engagementScore?: number;
    effectivenessScore?: number;
  };
  
  // Custom Data
  data?: Record<string, any>;
  templateData?: Record<string, any>;
}

export interface NotificationBatch {
  id: string;
  notifications: AdvancedNotification[];
  createdAt: number;
  title: string;
  summary: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  groupingStrategy: 'time' | 'type' | 'source' | 'priority' | 'smart';
}

export interface NotificationQueue {
  id: string;
  name: string;
  priority: number;
  concurrency: number;
  rateLimiting: {
    enabled: boolean;
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
  retryPolicy: {
    enabled: boolean;
    maxAttempts: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    baseDelay: number;
  };
  notifications: AdvancedNotification[];
  processing: boolean;
  metrics: {
    processed: number;
    failed: number;
    avgProcessingTime: number;
  };
}

export interface NotificationAnalytics {
  id: string;
  notificationId: string;
  userId: string;
  event: 'delivered' | 'viewed' | 'clicked' | 'dismissed' | 'acknowledged' | 'expired';
  channel: NotificationChannel;
  timestamp: number;
  metadata?: {
    viewDuration?: number;
    clickTarget?: string;
    dismissMethod?: 'button' | 'swipe' | 'timeout' | 'auto';
    location?: string;
    deviceType?: string;
  };
}

export interface NotificationFilter {
  types?: NotificationType[];
  priorities?: NotificationPriority[];
  statuses?: NotificationStatus[];
  channels?: NotificationChannel[];
  sources?: string[];
  tags?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
  search?: string;
  unreadOnly?: boolean;
  userId?: string;
  category?: string;
}

export interface NotificationSearchResult {
  notifications: AdvancedNotification[];
  total: number;
  page: number;
  pageSize: number;
  facets?: {
    types: { [key in NotificationType]: number };
    priorities: { [key in NotificationPriority]: number };
    sources: { [key: string]: number };
    statuses: { [key in NotificationStatus]: number };
  };
}

// Service Interfaces
export interface NotificationServiceConfig {
  queues: NotificationQueue[];
  defaultChannel: NotificationChannel;
  defaultPriority: NotificationPriority;
  batchingEnabled: boolean;
  analyticsEnabled: boolean;
  retentionDays: number;
  maxNotificationsPerUser: number;
  rateLimiting: {
    enabled: boolean;
    globalLimit: number;
    userLimit: number;
    sourceLimit: number;
  };
}

export interface NotificationMiddleware {
  name: string;
  priority: number;
  enabled: boolean;
  process: (notification: AdvancedNotification, context?: any) => Promise<AdvancedNotification | null>;
}

export interface NotificationProvider {
  name: string;
  channels: NotificationChannel[];
  enabled: boolean;
  config: Record<string, any>;
  send: (notification: AdvancedNotification, channel: NotificationChannel) => Promise<boolean>;
  validate?: (notification: AdvancedNotification) => boolean;
}

// Event System
export type NotificationEventType = 
  | 'notification:created' 
  | 'notification:delivered' 
  | 'notification:read' 
  | 'notification:acknowledged'
  | 'notification:dismissed'
  | 'notification:expired'
  | 'notification:failed'
  | 'batch:created'
  | 'batch:processed'
  | 'queue:empty'
  | 'queue:full';

export interface NotificationEvent {
  type: NotificationEventType;
  payload: {
    notification?: AdvancedNotification;
    batch?: NotificationBatch;
    queue?: NotificationQueue;
    error?: Error;
    metadata?: Record<string, any>;
  };
  timestamp: number;
  source: string;
}

// Dashboard Integration
export interface NotificationWidgetConfig {
  channels: NotificationChannel[];
  maxVisible: number;
  groupSimilar: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  showMetrics: boolean;
  allowActions: boolean;
  theme: 'dark' | 'light' | 'auto';
}

export interface NotificationMetrics {
  total: number;
  unread: number;
  byType: { [key in NotificationType]: number };
  byPriority: { [key in NotificationPriority]: number };
  byStatus: { [key in NotificationStatus]: number };
  byChannel: { [key in NotificationChannel]: number };
  avgResponseTime: number;
  engagementRate: number;
  dismissalRate: number;
}