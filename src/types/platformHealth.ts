// ============================================
// PLATFORM INTEGRATION HEALTH MONITOR TYPES
// Types for monitoring platform API health and integration status
// ============================================

export type PlatformType = 
  | 'facebook'
  | 'instagram' 
  | 'linkedin'
  | 'youtube'
  | 'twitter'
  | 'threads'
  | 'google_ads'
  | 'google_analytics'
  | 'mailchimp'
  | 'hubspot'
  | 'zapier'
  | 'webhooks'
  | 'stripe'
  | 'shopify'
  | 'wordpress'
  | 'slack';

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type RetryStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'max_attempts_reached';

// ============================================
// CORE INTERFACES
// ============================================

export interface PlatformHealthCheck {
  id: string;
  platform: PlatformType;
  status: HealthStatus;
  lastChecked: string;
  responseTime: number; // milliseconds
  errorCount: number;
  successRate: number; // percentage
  statusMessage: string;
  endpoint: string;
  nextCheck: string;
  consecutiveFailures: number;
  metadata: Record<string, any>;
}

export interface HealthAlert {
  id: string;
  platform: PlatformType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  affectedCampaigns: string[];
  affectedAccounts: string[];
  retryAttempts: number;
  metadata: Record<string, any>;
}

export interface RetryAttempt {
  id: string;
  platform: PlatformType;
  status: RetryStatus;
  attemptNumber: number;
  maxAttempts: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  successMessage?: string;
  nextRetryAt?: string;
  backoffDelay: number; // seconds
}

export interface UptimeRecord {
  id: string;
  platform: PlatformType;
  date: string; // YYYY-MM-DD format
  uptime: number; // percentage
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  incidents: number;
  downtimeMinutes: number;
}

export interface CampaignImpact {
  campaignId: string;
  campaignName: string;
  platform: PlatformType;
  status: 'paused' | 'degraded' | 'failed' | 'unaffected';
  affectedSince: string;
  estimatedRevenueLoss: number;
  affectedMetrics: string[];
  clientId: string;
  clientName: string;
}

export interface IntegrationHealth {
  platform: PlatformType;
  name: string;
  icon: string;
  color: string;
  currentStatus: HealthStatus;
  healthCheck: PlatformHealthCheck;
  activeAlerts: HealthAlert[];
  retryQueue: RetryAttempt[];
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  lastIncident?: string;
  connectedAccounts: number;
  activeCampaigns: number;
  impactedCampaigns: CampaignImpact[];
}

// ============================================
// MONITORING CONFIGURATION
// ============================================

export interface MonitoringConfig {
  platform: PlatformType;
  enabled: boolean;
  checkInterval: number; // seconds
  timeout: number; // seconds
  retryAttempts: number;
  retryBackoffMultiplier: number;
  alertThresholds: {
    responseTime: number; // milliseconds
    errorRate: number; // percentage
    consecutiveFailures: number;
  };
  endpoints: {
    primary: string;
    secondary?: string;
    healthCheck?: string;
  };
  authentication: {
    type: 'oauth' | 'api_key' | 'basic' | 'bearer';
    refreshTokenOnFailure: boolean;
  };
}

export interface HealthDashboardData {
  overallStatus: HealthStatus;
  totalPlatforms: number;
  healthyPlatforms: number;
  warningPlatforms: number;
  criticalPlatforms: number;
  activeAlerts: number;
  totalUptime: number; // percentage across all platforms
  integrations: IntegrationHealth[];
  recentIncidents: HealthAlert[];
  systemMetrics: {
    avgResponseTime: number;
    totalAPIRequests: number;
    totalErrors: number;
    errorRate: number;
  };
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface HealthCheckResponse {
  success: boolean;
  status: HealthStatus;
  responseTime: number;
  timestamp: string;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface BulkHealthCheckResponse {
  timestamp: string;
  results: Record<PlatformType, HealthCheckResponse>;
  summary: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    unknown: number;
  };
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  name: string;
  enabled: boolean;
  config: {
    email?: string;
    slackWebhook?: string;
    webhookUrl?: string;
    phoneNumber?: string;
  };
  alertLevels: AlertSeverity[];
}

export interface NotificationRule {
  id: string;
  name: string;
  platforms: PlatformType[];
  conditions: {
    status: HealthStatus[];
    consecutiveFailures?: number;
    responseTime?: number;
    errorRate?: number;
  };
  channels: string[]; // notification channel IDs
  throttle: number; // minutes between notifications
  enabled: boolean;
}

// ============================================
// HISTORICAL DATA TYPES
// ============================================

export interface IncidentReport {
  id: string;
  platform: PlatformType;
  title: string;
  description: string;
  severity: AlertSeverity;
  startTime: string;
  endTime?: string;
  duration?: number; // minutes
  rootCause?: string;
  resolution?: string;
  affectedServices: string[];
  impactedClients: number;
  estimatedLoss: number;
  preventionSteps: string[];
  status: 'open' | 'investigating' | 'resolved' | 'post_mortem';
}

export interface UptimeMetrics {
  platform: PlatformType;
  period: '24h' | '7d' | '30d' | '90d';
  uptime: number; // percentage
  downtime: number; // minutes
  incidents: number;
  mttr: number; // mean time to recovery in minutes
  mtbf: number; // mean time between failures in hours
  sla: number; // service level agreement percentage
  slaBreaches: number;
}

// ============================================
// DASHBOARD COMPONENT PROPS
// ============================================

export interface HealthDashboardProps {
  refreshInterval?: number; // seconds
  showNotifications?: boolean;
  showMetrics?: boolean;
  compactView?: boolean;
  selectedPlatforms?: PlatformType[];
  onPlatformSelect?: (platform: PlatformType) => void;
  onAlertAcknowledge?: (alertId: string) => void;
  onManualRefresh?: (platform?: PlatformType) => void;
}

export interface PlatformCardProps {
  integration: IntegrationHealth;
  onStatusClick?: (platform: PlatformType) => void;
  onRetry?: (platform: PlatformType) => void;
  onViewDetails?: (platform: PlatformType) => void;
  showMetrics?: boolean;
  compactView?: boolean;
}

// ============================================
// UTILITY TYPES
// ============================================

export type HealthStatusColor = {
  [K in HealthStatus]: {
    bg: string;
    text: string;
    border: string;
    icon: string;
  };
};

export type PlatformConfig = {
  [K in PlatformType]: {
    name: string;
    icon: string;
    color: string;
    category: string;
    defaultEndpoints: string[];
    rateLimit?: {
      requests: number;
      window: number; // seconds
    };
  };
};

export interface FilterOptions {
  status?: HealthStatus[];
  platforms?: PlatformType[];
  alertLevels?: AlertSeverity[];
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface SortOptions {
  field: 'status' | 'uptime' | 'responseTime' | 'lastChecked' | 'platform';
  direction: 'asc' | 'desc';
}