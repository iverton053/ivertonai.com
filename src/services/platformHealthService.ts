// ============================================
// PLATFORM HEALTH MONITORING SERVICE
// Core service for monitoring platform API health and managing integrations
// ============================================

import {
  PlatformType,
  HealthStatus,
  PlatformHealthCheck,
  HealthAlert,
  RetryAttempt,
  UptimeRecord,
  CampaignImpact,
  IntegrationHealth,
  MonitoringConfig,
  HealthDashboardData,
  HealthCheckResponse,
  BulkHealthCheckResponse,
  AlertSeverity,
  RetryStatus,
  IncidentReport,
  UptimeMetrics,
  NotificationChannel,
  NotificationRule
} from '../types/platformHealth';

class PlatformHealthService {
  private healthChecks: Map<PlatformType, PlatformHealthCheck> = new Map();
  private alerts: HealthAlert[] = [];
  private retryQueue: Map<PlatformType, RetryAttempt[]> = new Map();
  private uptimeRecords: Map<string, UptimeRecord> = new Map(); // key: platform_date
  private monitoringConfigs: Map<PlatformType, MonitoringConfig> = new Map();
  private notificationChannels: NotificationChannel[] = [];
  private notificationRules: NotificationRule[] = [];
  private monitoringIntervals: Map<PlatformType, NodeJS.Timeout> = new Map();
  private isMonitoring = false;

  constructor() {
    this.initializeDefaultConfigs();
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  private initializeDefaultConfigs(): void {
    const platforms: PlatformType[] = [
      'facebook', 'instagram', 'linkedin', 'youtube', 'twitter', 'threads',
      'google_ads', 'google_analytics', 'mailchimp', 'hubspot', 'zapier',
      'webhooks', 'stripe', 'shopify', 'wordpress', 'slack'
    ];

    platforms.forEach(platform => {
      this.monitoringConfigs.set(platform, {
        platform,
        enabled: true,
        checkInterval: 300, // 5 minutes
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryBackoffMultiplier: 2,
        alertThresholds: {
          responseTime: 5000, // 5 seconds
          errorRate: 10, // 10%
          consecutiveFailures: 3
        },
        endpoints: {
          primary: this.getDefaultEndpoint(platform),
          healthCheck: this.getHealthCheckEndpoint(platform)
        },
        authentication: {
          type: this.getAuthType(platform),
          refreshTokenOnFailure: true
        }
      });

      // Initialize empty health check
      this.healthChecks.set(platform, {
        id: `${platform}_${Date.now()}`,
        platform,
        status: 'unknown',
        lastChecked: new Date().toISOString(),
        responseTime: 0,
        errorCount: 0,
        successRate: 100,
        statusMessage: 'Not yet checked',
        endpoint: this.getDefaultEndpoint(platform),
        nextCheck: new Date(Date.now() + 300000).toISOString(),
        consecutiveFailures: 0,
        metadata: {}
      });

      this.retryQueue.set(platform, []);
    });
  }

  private getDefaultEndpoint(platform: PlatformType): string {
    const endpoints: Record<PlatformType, string> = {
      facebook: 'https://graph.facebook.com/v18.0/me',
      instagram: 'https://graph.instagram.com/me',
      linkedin: 'https://api.linkedin.com/v2/people/~',
      youtube: 'https://www.googleapis.com/youtube/v3/channels',
      twitter: 'https://api.twitter.com/2/users/me',
      threads: 'https://graph.threads.net/v1.0/me',
      google_ads: 'https://googleads.googleapis.com/v14/customers',
      google_analytics: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
      mailchimp: 'https://us1.api.mailchimp.com/3.0/ping',
      hubspot: 'https://api.hubapi.com/contacts/v1/lists/all',
      zapier: 'https://zapier.com/api/v1/me',
      webhooks: '/api/webhooks/health',
      stripe: 'https://api.stripe.com/v1/balance',
      shopify: 'https://shopify.dev/api/admin-rest',
      wordpress: '/wp-json/wp/v2/users/me',
      slack: 'https://slack.com/api/auth.test'
    };
    return endpoints[platform];
  }

  private getHealthCheckEndpoint(platform: PlatformType): string {
    const healthEndpoints: Record<PlatformType, string> = {
      facebook: 'https://graph.facebook.com/v18.0/me?fields=id',
      instagram: 'https://graph.instagram.com/me?fields=id',
      linkedin: 'https://api.linkedin.com/v2/people/~:(id)',
      youtube: 'https://www.googleapis.com/youtube/v3/channels?part=id&mine=true',
      twitter: 'https://api.twitter.com/2/users/me?user.fields=id',
      threads: 'https://graph.threads.net/v1.0/me?fields=id',
      google_ads: 'https://googleads.googleapis.com/v14/customers:listAccessibleCustomers',
      google_analytics: 'https://analytics.googleapis.com/analytics/v3/management/accounts',
      mailchimp: 'https://us1.api.mailchimp.com/3.0/ping',
      hubspot: 'https://api.hubapi.com/oauth/v1/access-tokens/{token}',
      zapier: 'https://zapier.com/api/v1/me',
      webhooks: '/api/health',
      stripe: 'https://api.stripe.com/v1/account',
      shopify: '/admin/api/2023-10/shop.json',
      wordpress: '/wp-json/wp/v2/users/me',
      slack: 'https://slack.com/api/auth.test'
    };
    return healthEndpoints[platform];
  }

  private getAuthType(platform: PlatformType): 'oauth' | 'api_key' | 'basic' | 'bearer' {
    const authTypes: Record<PlatformType, 'oauth' | 'api_key' | 'basic' | 'bearer'> = {
      facebook: 'oauth',
      instagram: 'oauth',
      linkedin: 'oauth',
      youtube: 'oauth',
      twitter: 'bearer',
      threads: 'oauth',
      google_ads: 'oauth',
      google_analytics: 'oauth',
      mailchimp: 'api_key',
      hubspot: 'oauth',
      zapier: 'api_key',
      webhooks: 'bearer',
      stripe: 'bearer',
      shopify: 'basic',
      wordpress: 'bearer',
      slack: 'bearer'
    };
    return authTypes[platform];
  }

  // ============================================
  // HEALTH CHECK OPERATIONS
  // ============================================

  async performHealthCheck(platform: PlatformType): Promise<HealthCheckResponse> {
    const config = this.monitoringConfigs.get(platform);
    if (!config || !config.enabled) {
      return {
        success: false,
        status: 'unknown',
        responseTime: 0,
        timestamp: new Date().toISOString(),
        error: {
          code: 'MONITORING_DISABLED',
          message: 'Monitoring is disabled for this platform'
        }
      };
    }

    const startTime = Date.now();
    
    try {
      // Simulate API call with realistic response times and occasional failures
      const response = await this.simulateAPICall(platform, config);
      const responseTime = Date.now() - startTime;

      const result: HealthCheckResponse = {
        success: response.success,
        status: this.determineHealthStatus(response, responseTime, config),
        responseTime,
        timestamp: new Date().toISOString(),
        data: response.data
      };

      if (!response.success) {
        result.error = response.error;
      }

      // Update health check record
      await this.updateHealthCheckRecord(platform, result);
      
      return result;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const result: HealthCheckResponse = {
        success: false,
        status: 'critical',
        responseTime,
        timestamp: new Date().toISOString(),
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network request failed',
          details: error
        }
      };

      await this.updateHealthCheckRecord(platform, result);
      return result;
    }
  }

  private async simulateAPICall(platform: PlatformType, config: MonitoringConfig): Promise<{
    success: boolean;
    data?: any;
    error?: { code: string; message: string; details?: any };
  }> {
    // Simulate realistic API behavior with different response times and failure rates
    const platformFailureRates: Record<PlatformType, number> = {
      facebook: 0.02, // 2% failure rate
      instagram: 0.02,
      linkedin: 0.03,
      youtube: 0.01,
      twitter: 0.05, // Higher failure rate for X/Twitter
      threads: 0.04,
      google_ads: 0.01,
      google_analytics: 0.01,
      mailchimp: 0.02,
      hubspot: 0.02,
      zapier: 0.03,
      webhooks: 0.05,
      stripe: 0.01,
      shopify: 0.02,
      wordpress: 0.04,
      slack: 0.02
    };

    const baseResponseTimes: Record<PlatformType, number> = {
      facebook: 800,
      instagram: 900,
      linkedin: 1200,
      youtube: 600,
      twitter: 1500,
      threads: 1100,
      google_ads: 700,
      google_analytics: 1000,
      mailchimp: 500,
      hubspot: 800,
      zapier: 1300,
      webhooks: 200,
      stripe: 400,
      shopify: 900,
      wordpress: 1200,
      slack: 600
    };

    // Simulate variable response time
    const baseTime = baseResponseTimes[platform];
    const variance = baseTime * 0.3; // 30% variance
    const responseTime = baseTime + (Math.random() - 0.5) * variance;
    
    await new Promise(resolve => setTimeout(resolve, Math.max(100, responseTime)));

    // Simulate failures based on platform failure rates
    const failureRate = platformFailureRates[platform];
    const shouldFail = Math.random() < failureRate;

    if (shouldFail) {
      const errorTypes = [
        { code: 'AUTH_ERROR', message: 'Authentication failed' },
        { code: 'RATE_LIMIT', message: 'Rate limit exceeded' },
        { code: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable' },
        { code: 'TIMEOUT', message: 'Request timeout' },
        { code: 'INVALID_TOKEN', message: 'Access token expired or invalid' }
      ];
      
      const error = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      return {
        success: false,
        error
      };
    }

    // Success response
    return {
      success: true,
      data: {
        id: `${platform}_user_${Date.now()}`,
        status: 'active',
        apiVersion: '2023-10',
        timestamp: new Date().toISOString()
      }
    };
  }

  private determineHealthStatus(
    response: any,
    responseTime: number,
    config: MonitoringConfig
  ): HealthStatus {
    if (!response.success) {
      return 'critical';
    }

    if (responseTime > config.alertThresholds.responseTime) {
      return 'warning';
    }

    return 'healthy';
  }

  private async updateHealthCheckRecord(platform: PlatformType, result: HealthCheckResponse): Promise<void> {
    const existing = this.healthChecks.get(platform);
    if (!existing) return;

    const config = this.monitoringConfigs.get(platform)!;
    
    // Calculate success rate
    const isSuccess = result.success;
    const newErrorCount = isSuccess ? 0 : existing.errorCount + 1;
    const consecutiveFailures = isSuccess ? 0 : existing.consecutiveFailures + 1;
    
    // Simple success rate calculation (you might want to implement a sliding window)
    const totalChecks = existing.metadata.totalChecks || 1;
    const successfulChecks = existing.metadata.successfulChecks || (isSuccess ? 1 : 0);
    const newTotalChecks = totalChecks + 1;
    const newSuccessfulChecks = successfulChecks + (isSuccess ? 1 : 0);
    const successRate = (newSuccessfulChecks / newTotalChecks) * 100;

    const updated: PlatformHealthCheck = {
      ...existing,
      status: result.status,
      lastChecked: result.timestamp,
      responseTime: result.responseTime,
      errorCount: newErrorCount,
      successRate,
      statusMessage: this.getStatusMessage(result),
      nextCheck: new Date(Date.now() + config.checkInterval * 1000).toISOString(),
      consecutiveFailures,
      metadata: {
        ...existing.metadata,
        totalChecks: newTotalChecks,
        successfulChecks: newSuccessfulChecks,
        lastError: result.error?.message,
        lastErrorCode: result.error?.code
      }
    };

    this.healthChecks.set(platform, updated);

    // Handle alerts and retries
    await this.handleHealthCheckResult(platform, updated, result);
    
    // Update uptime records
    await this.updateUptimeRecord(platform, isSuccess, result.responseTime);
  }

  private getStatusMessage(result: HealthCheckResponse): string {
    if (result.success) {
      return `Healthy - Response time: ${result.responseTime}ms`;
    } else if (result.error) {
      return `Error: ${result.error.message}`;
    } else {
      return 'Unknown error occurred';
    }
  }

  // ============================================
  // ALERT MANAGEMENT
  // ============================================

  private async handleHealthCheckResult(
    platform: PlatformType,
    healthCheck: PlatformHealthCheck,
    result: HealthCheckResponse
  ): Promise<void> {
    const config = this.monitoringConfigs.get(platform)!;

    // Check if we need to create an alert
    const shouldAlert = this.shouldCreateAlert(healthCheck, config);
    
    if (shouldAlert && !result.success) {
      await this.createAlert(platform, healthCheck, result);
    }

    // Check if we need to start retry process
    if (!result.success && config.retryAttempts > 0) {
      await this.initiateRetry(platform, result);
    }

    // Resolve existing alerts if platform is healthy
    if (result.success && healthCheck.status === 'healthy') {
      await this.resolveAlertsForPlatform(platform);
    }
  }

  private shouldCreateAlert(healthCheck: PlatformHealthCheck, config: MonitoringConfig): boolean {
    // Create alert if consecutive failures exceed threshold
    if (healthCheck.consecutiveFailures >= config.alertThresholds.consecutiveFailures) {
      return true;
    }

    // Create alert if response time exceeds threshold
    if (healthCheck.responseTime > config.alertThresholds.responseTime) {
      return true;
    }

    // Create alert if error rate exceeds threshold
    if (healthCheck.successRate < (100 - config.alertThresholds.errorRate)) {
      return true;
    }

    return false;
  }

  private async createAlert(
    platform: PlatformType,
    healthCheck: PlatformHealthCheck,
    result: HealthCheckResponse
  ): Promise<void> {
    // Check if there's already an active alert for this platform
    const existingAlert = this.alerts.find(
      alert => alert.platform === platform && !alert.resolved
    );

    if (existingAlert) {
      // Update existing alert
      existingAlert.retryAttempts += 1;
      existingAlert.message = this.getAlertMessage(healthCheck, result);
      return;
    }

    const severity = this.determineSeverity(healthCheck);
    const alert: HealthAlert = {
      id: `alert_${platform}_${Date.now()}`,
      platform,
      severity,
      title: `${this.getPlatformName(platform)} Integration Issue`,
      message: this.getAlertMessage(healthCheck, result),
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      affectedCampaigns: await this.getAffectedCampaigns(platform),
      affectedAccounts: await this.getAffectedAccounts(platform),
      retryAttempts: 0,
      metadata: {
        consecutiveFailures: healthCheck.consecutiveFailures,
        responseTime: healthCheck.responseTime,
        errorCode: result.error?.code,
        errorMessage: result.error?.message
      }
    };

    this.alerts.push(alert);
    
    // Send notifications
    await this.sendNotifications(alert);
  }

  private determineSeverity(healthCheck: PlatformHealthCheck): AlertSeverity {
    if (healthCheck.consecutiveFailures >= 10) return 'critical';
    if (healthCheck.consecutiveFailures >= 5) return 'high';
    if (healthCheck.successRate < 90) return 'medium';
    return 'low';
  }

  private getAlertMessage(healthCheck: PlatformHealthCheck, result: HealthCheckResponse): string {
    const platform = this.getPlatformName(healthCheck.platform);
    
    if (result.error) {
      return `${platform} API is experiencing issues: ${result.error.message}. ${healthCheck.consecutiveFailures} consecutive failures.`;
    }
    
    if (healthCheck.responseTime > 5000) {
      return `${platform} API response time is slow (${healthCheck.responseTime}ms). Performance may be degraded.`;
    }
    
    return `${platform} integration health check failed. Success rate: ${healthCheck.successRate.toFixed(1)}%`;
  }

  private async getAffectedCampaigns(platform: PlatformType): Promise<string[]> {
    // In a real implementation, this would query your campaigns database
    // For now, return mock data
    return [`campaign_${platform}_1`, `campaign_${platform}_2`];
  }

  private async getAffectedAccounts(platform: PlatformType): Promise<string[]> {
    // In a real implementation, this would query your accounts database
    return [`account_${platform}_1`, `account_${platform}_2`];
  }

  private async resolveAlertsForPlatform(platform: PlatformType): Promise<void> {
    const activeAlerts = this.alerts.filter(
      alert => alert.platform === platform && !alert.resolved
    );

    for (const alert of activeAlerts) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
    }
  }

  // ============================================
  // RETRY SYSTEM
  // ============================================

  private async initiateRetry(platform: PlatformType, failedResult: HealthCheckResponse): Promise<void> {
    const config = this.monitoringConfigs.get(platform)!;
    const existingRetries = this.retryQueue.get(platform) || [];
    
    // Check if we're already at max retries
    const activeRetry = existingRetries.find(retry => retry.status === 'in_progress');
    if (activeRetry && activeRetry.attemptNumber >= config.retryAttempts) {
      return;
    }

    const attemptNumber = activeRetry ? activeRetry.attemptNumber + 1 : 1;
    const backoffDelay = config.retryBackoffMultiplier ** (attemptNumber - 1) * 30; // Base 30 seconds

    const retryAttempt: RetryAttempt = {
      id: `retry_${platform}_${Date.now()}`,
      platform,
      status: 'pending',
      attemptNumber,
      maxAttempts: config.retryAttempts,
      startedAt: new Date().toISOString(),
      backoffDelay,
      nextRetryAt: new Date(Date.now() + backoffDelay * 1000).toISOString()
    };

    existingRetries.push(retryAttempt);
    this.retryQueue.set(platform, existingRetries);

    // Schedule the retry
    setTimeout(() => {
      this.executeRetry(platform, retryAttempt.id);
    }, backoffDelay * 1000);
  }

  private async executeRetry(platform: PlatformType, retryId: string): Promise<void> {
    const retries = this.retryQueue.get(platform) || [];
    const retry = retries.find(r => r.id === retryId);
    
    if (!retry || retry.status !== 'pending') return;

    retry.status = 'in_progress';
    
    try {
      const result = await this.performHealthCheck(platform);
      
      if (result.success) {
        retry.status = 'success';
        retry.successMessage = 'Platform health check successful after retry';
      } else {
        retry.status = 'failed';
        retry.error = result.error?.message || 'Retry failed';
        
        // Schedule next retry if attempts remaining
        if (retry.attemptNumber < retry.maxAttempts) {
          await this.initiateRetry(platform, result);
        } else {
          retry.status = 'max_attempts_reached';
        }
      }
    } catch (error: any) {
      retry.status = 'failed';
      retry.error = error.message;
    }
    
    retry.completedAt = new Date().toISOString();
  }

  // ============================================
  // UPTIME TRACKING
  // ============================================

  private async updateUptimeRecord(
    platform: PlatformType,
    isSuccess: boolean,
    responseTime: number
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `${platform}_${today}`;
    
    let record = this.uptimeRecords.get(key);
    
    if (!record) {
      record = {
        id: key,
        platform,
        date: today,
        uptime: 0,
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        averageResponseTime: 0,
        incidents: 0,
        downtimeMinutes: 0
      };
    }

    record.totalChecks += 1;
    
    if (isSuccess) {
      record.successfulChecks += 1;
    } else {
      record.failedChecks += 1;
      
      // Estimate downtime (assuming 5-minute check intervals)
      record.downtimeMinutes += 5;
    }

    // Calculate uptime percentage
    record.uptime = (record.successfulChecks / record.totalChecks) * 100;
    
    // Update average response time
    record.averageResponseTime = (
      (record.averageResponseTime * (record.totalChecks - 1) + responseTime) / record.totalChecks
    );

    this.uptimeRecords.set(key, record);
  }

  // ============================================
  // NOTIFICATION SYSTEM
  // ============================================

  private async sendNotifications(alert: HealthAlert): Promise<void> {
    // Find applicable notification rules
    const applicableRules = this.notificationRules.filter(rule => 
      rule.enabled &&
      rule.platforms.includes(alert.platform) &&
      rule.conditions.status.includes(this.healthChecks.get(alert.platform)?.status || 'unknown')
    );

    for (const rule of applicableRules) {
      for (const channelId of rule.channels) {
        const channel = this.notificationChannels.find(c => c.id === channelId);
        if (channel && channel.enabled && channel.alertLevels.includes(alert.severity)) {
          await this.sendNotification(channel, alert);
        }
      }
    }
  }

  private async sendNotification(channel: NotificationChannel, alert: HealthAlert): Promise<void> {
    // In a real implementation, this would send actual notifications
    console.log(`[${channel.type.toUpperCase()}] ${alert.title}: ${alert.message}`);
    
    // Simulate notification sending
    const notificationData = {
      channel: channel.name,
      type: channel.type,
      alert: {
        platform: alert.platform,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        timestamp: alert.timestamp
      }
    };

    // You would integrate with actual notification services here:
    // - Email: SendGrid, AWS SES, etc.
    // - Slack: Slack Web API
    // - SMS: Twilio, AWS SNS
    // - Webhook: HTTP POST to configured endpoints
  }

  // ============================================
  // MONITORING CONTROL
  // ============================================

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Start monitoring for each enabled platform
    for (const [platform, config] of this.monitoringConfigs.entries()) {
      if (config.enabled) {
        this.startPlatformMonitoring(platform);
      }
    }
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    
    // Clear all monitoring intervals
    for (const [platform, interval] of this.monitoringIntervals.entries()) {
      clearInterval(interval);
    }
    this.monitoringIntervals.clear();
  }

  private startPlatformMonitoring(platform: PlatformType): void {
    const config = this.monitoringConfigs.get(platform);
    if (!config) return;

    // Clear existing interval if any
    const existingInterval = this.monitoringIntervals.get(platform);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Start new monitoring interval
    const interval = setInterval(async () => {
      await this.performHealthCheck(platform);
    }, config.checkInterval * 1000);

    this.monitoringIntervals.set(platform, interval);

    // Perform initial check
    this.performHealthCheck(platform);
  }

  // ============================================
  // PUBLIC API METHODS
  // ============================================

  async getDashboardData(): Promise<HealthDashboardData> {
    const integrations: IntegrationHealth[] = [];
    let healthyCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    let totalResponseTime = 0;
    let totalUptime = 0;

    for (const [platform, healthCheck] of this.healthChecks.entries()) {
      const platformAlerts = this.alerts.filter(a => a.platform === platform && !a.resolved);
      const platformRetries = this.retryQueue.get(platform) || [];
      
      // Calculate uptime metrics
      const uptime24h = await this.getUptimeForPeriod(platform, '24h');
      const uptime7d = await this.getUptimeForPeriod(platform, '7d');
      const uptime30d = await this.getUptimeForPeriod(platform, '30d');

      const integration: IntegrationHealth = {
        platform,
        name: this.getPlatformName(platform),
        icon: this.getPlatformIcon(platform),
        color: this.getPlatformColor(platform),
        currentStatus: healthCheck.status,
        healthCheck,
        activeAlerts: platformAlerts,
        retryQueue: platformRetries,
        uptime24h,
        uptime7d,
        uptime30d,
        lastIncident: platformAlerts.length > 0 ? platformAlerts[0].timestamp : undefined,
        connectedAccounts: await this.getConnectedAccountsCount(platform),
        activeCampaigns: await this.getActiveCampaignsCount(platform),
        impactedCampaigns: await this.getImpactedCampaigns(platform)
      };

      integrations.push(integration);

      // Count statuses
      switch (healthCheck.status) {
        case 'healthy': healthyCount++; break;
        case 'warning': warningCount++; break;
        case 'critical': criticalCount++; break;
      }

      totalResponseTime += healthCheck.responseTime;
      totalUptime += uptime24h;
    }

    const totalPlatforms = integrations.length;
    const avgResponseTime = totalPlatforms > 0 ? totalResponseTime / totalPlatforms : 0;
    const avgUptime = totalPlatforms > 0 ? totalUptime / totalPlatforms : 0;

    // Determine overall status
    let overallStatus: HealthStatus = 'healthy';
    if (criticalCount > 0) overallStatus = 'critical';
    else if (warningCount > 0) overallStatus = 'warning';

    return {
      overallStatus,
      totalPlatforms,
      healthyPlatforms: healthyCount,
      warningPlatforms: warningCount,
      criticalPlatforms: criticalCount,
      activeAlerts: this.alerts.filter(a => !a.resolved).length,
      totalUptime: avgUptime,
      integrations,
      recentIncidents: this.alerts
        .filter(a => !a.resolved)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5),
      systemMetrics: {
        avgResponseTime,
        totalAPIRequests: Array.from(this.healthChecks.values())
          .reduce((sum, hc) => sum + (hc.metadata.totalChecks || 0), 0),
        totalErrors: Array.from(this.healthChecks.values())
          .reduce((sum, hc) => sum + hc.errorCount, 0),
        errorRate: this.calculateOverallErrorRate()
      }
    };
  }

  private async getUptimeForPeriod(platform: PlatformType, period: '24h' | '7d' | '30d'): Promise<number> {
    // Calculate days to look back
    const days = period === '24h' ? 1 : period === '7d' ? 7 : 30;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    let totalUptime = 0;
    let validDays = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const recordKey = `${platform}_${dateKey}`;
      const record = this.uptimeRecords.get(recordKey);
      
      if (record && record.totalChecks > 0) {
        totalUptime += record.uptime;
        validDays++;
      }
    }

    return validDays > 0 ? totalUptime / validDays : 100; // Default to 100% if no data
  }

  private calculateOverallErrorRate(): number {
    const allChecks = Array.from(this.healthChecks.values());
    const totalRequests = allChecks.reduce((sum, hc) => sum + (hc.metadata.totalChecks || 0), 0);
    const totalErrors = allChecks.reduce((sum, hc) => sum + hc.errorCount, 0);
    
    return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date().toISOString();
    }
  }

  async manualRefresh(platform?: PlatformType): Promise<void> {
    if (platform) {
      await this.performHealthCheck(platform);
    } else {
      // Refresh all platforms
      const platforms = Array.from(this.healthChecks.keys());
      await Promise.all(platforms.map(p => this.performHealthCheck(p)));
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private getPlatformName(platform: PlatformType): string {
    const names: Record<PlatformType, string> = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      twitter: 'X (Twitter)',
      threads: 'Threads',
      google_ads: 'Google Ads',
      google_analytics: 'Google Analytics',
      mailchimp: 'Mailchimp',
      hubspot: 'HubSpot',
      zapier: 'Zapier',
      webhooks: 'Webhooks',
      stripe: 'Stripe',
      shopify: 'Shopify',
      wordpress: 'WordPress',
      slack: 'Slack'
    };
    return names[platform];
  }

  private getPlatformIcon(platform: PlatformType): string {
    const icons: Record<PlatformType, string> = {
      facebook: '📘',
      instagram: '📸',
      linkedin: '💼',
      youtube: '🎥',
      twitter: '𝕏',
      threads: '@',
      google_ads: '📊',
      google_analytics: '📈',
      mailchimp: '📧',
      hubspot: '🎯',
      zapier: '⚡',
      webhooks: '🔗',
      stripe: '💳',
      shopify: '🛍️',
      wordpress: '📝',
      slack: '💬'
    };
    return icons[platform];
  }

  private getPlatformColor(platform: PlatformType): string {
    const colors: Record<PlatformType, string> = {
      facebook: '#1877F2',
      instagram: '#E4405F',
      linkedin: '#0A66C2',
      youtube: '#FF0000',
      twitter: '#000000',
      threads: '#000000',
      google_ads: '#4285F4',
      google_analytics: '#FF6F00',
      mailchimp: '#FFE01B',
      hubspot: '#FF7A59',
      zapier: '#FF4A00',
      webhooks: '#6B7280',
      stripe: '#635BFF',
      shopify: '#96BF47',
      wordpress: '#21759B',
      slack: '#4A154B'
    };
    return colors[platform];
  }

  private async getConnectedAccountsCount(platform: PlatformType): Promise<number> {
    // Mock data - in real implementation, query your database
    return Math.floor(Math.random() * 10) + 1;
  }

  private async getActiveCampaignsCount(platform: PlatformType): Promise<number> {
    // Mock data - in real implementation, query your database
    return Math.floor(Math.random() * 20) + 5;
  }

  private async getImpactedCampaigns(platform: PlatformType): Promise<CampaignImpact[]> {
    const healthCheck = this.healthChecks.get(platform);
    if (!healthCheck || healthCheck.status === 'healthy') {
      return [];
    }

    // Mock data - in real implementation, query your database
    return [
      {
        campaignId: `campaign_${platform}_1`,
        campaignName: `${this.getPlatformName(platform)} Campaign 1`,
        platform,
        status: 'degraded',
        affectedSince: healthCheck.lastChecked,
        estimatedRevenueLoss: Math.floor(Math.random() * 1000),
        affectedMetrics: ['impressions', 'clicks', 'conversions'],
        clientId: 'client_1',
        clientName: 'Example Client'
      }
    ];
  }
}

// Export singleton instance
export const platformHealthService = new PlatformHealthService();
export default platformHealthService;