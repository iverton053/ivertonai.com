// Advanced Notification Management Service
import { 
  AdvancedNotification, 
  NotificationBatch, 
  NotificationQueue, 
  NotificationFilter, 
  NotificationSearchResult,
  NotificationAnalytics,
  NotificationPreferences,
  NotificationRule,
  NotificationTemplate,
  NotificationChannel,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationEvent,
  NotificationEventType,
  NotificationMiddleware,
  NotificationProvider,
  NotificationServiceConfig,
  NotificationMetrics
} from '../types/advancedNotifications';

class AdvancedNotificationService {
  private static instance: AdvancedNotificationService;
  
  // Core storage
  private notifications: Map<string, AdvancedNotification> = new Map();
  private batches: Map<string, NotificationBatch> = new Map();
  private queues: Map<string, NotificationQueue> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private rules: Map<string, NotificationRule> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private analytics: NotificationAnalytics[] = [];
  
  // Processing components
  private middleware: NotificationMiddleware[] = [];
  private providers: Map<NotificationChannel, NotificationProvider> = new Map();
  private eventListeners: Map<NotificationEventType, Function[]> = new Map();
  
  // State management
  private config: NotificationServiceConfig;
  private processing: boolean = false;
  private batchTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.config = this.getDefaultConfig();
    this.initializeQueues();
    this.initializeProviders();
    this.initializeMiddleware();
    this.startBackgroundProcessing();
    this.loadTemplates();
    this.loadRules();
  }

  static getInstance(): AdvancedNotificationService {
    if (!AdvancedNotificationService.instance) {
      AdvancedNotificationService.instance = new AdvancedNotificationService();
    }
    return AdvancedNotificationService.instance;
  }

  // Core Notification Management
  async createNotification(notification: Partial<AdvancedNotification>): Promise<AdvancedNotification> {
    const id = this.generateId();
    const now = Date.now();
    
    const fullNotification: AdvancedNotification = {
      id,
      type: notification.type || 'info',
      priority: notification.priority || 'medium',
      status: 'pending',
      title: notification.title || '',
      message: notification.message || '',
      source: notification.source || 'system',
      userId: notification.userId,
      createdAt: now,
      updatedAt: now,
      channels: notification.channels || [this.config.defaultChannel],
      deliveryStatus: {},
      dismissible: notification.dismissible ?? true,
      persistent: notification.persistent ?? false,
      autoHide: notification.autoHide ?? true,
      autoHideDuration: notification.autoHideDuration ?? 5000,
      ...notification
    };

    // Apply middleware
    const processedNotification = await this.processMiddleware(fullNotification);
    if (!processedNotification) return fullNotification;

    // Apply rules
    await this.applyRules(processedNotification);

    // Smart batching check
    if (this.config.batchingEnabled) {
      const shouldBatch = await this.shouldBatchNotification(processedNotification);
      if (shouldBatch) {
        await this.addToBatch(processedNotification);
        return processedNotification;
      }
    }

    // Store notification
    this.notifications.set(processedNotification.id, processedNotification);

    // Queue for delivery
    await this.queueNotification(processedNotification);

    // Emit event
    this.emitEvent('notification:created', { notification: processedNotification });

    // Track analytics
    if (this.config.analyticsEnabled) {
      this.trackAnalytics(processedNotification.id, processedNotification.userId || 'anonymous', 'delivered', 'system');
    }

    return processedNotification;
  }

  async updateNotification(id: string, updates: Partial<AdvancedNotification>): Promise<AdvancedNotification | null> {
    const notification = this.notifications.get(id);
    if (!notification) return null;

    const updatedNotification = {
      ...notification,
      ...updates,
      updatedAt: Date.now()
    };

    this.notifications.set(id, updatedNotification);
    this.emitEvent('notification:updated', { notification: updatedNotification });

    return updatedNotification;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const deleted = this.notifications.delete(id);
    if (deleted) {
      this.emitEvent('notification:deleted', { notification: { id } as AdvancedNotification });
    }
    return deleted;
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification || notification.userId !== userId) return false;

    notification.status = 'read';
    notification.readAt = Date.now();
    notification.updatedAt = Date.now();

    this.emitEvent('notification:read', { notification });
    this.trackAnalytics(id, userId, 'viewed', 'panel');

    return true;
  }

  async acknowledge(id: string, userId: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification || notification.userId !== userId) return false;

    notification.status = 'acknowledged';
    notification.acknowledgedAt = Date.now();
    notification.updatedAt = Date.now();

    this.emitEvent('notification:acknowledged', { notification });
    this.trackAnalytics(id, userId, 'acknowledged', 'panel');

    return true;
  }

  async dismiss(id: string, userId: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification || notification.userId !== userId) return false;

    notification.status = 'dismissed';
    notification.updatedAt = Date.now();

    this.emitEvent('notification:dismissed', { notification });
    this.trackAnalytics(id, userId, 'dismissed', 'panel');

    return true;
  }

  // Smart Batching System
  private async shouldBatchNotification(notification: AdvancedNotification): Promise<boolean> {
    const userPrefs = this.getUserPreferences(notification.userId);
    if (!userPrefs?.smartBatching.enabled) return false;

    // Check for similar notifications in the last batch interval
    const batchInterval = userPrefs.smartBatching.batchInterval * 60 * 1000; // Convert to milliseconds
    const cutoffTime = Date.now() - batchInterval;

    const similarNotifications = Array.from(this.notifications.values()).filter(n => 
      n.userId === notification.userId &&
      n.type === notification.type &&
      n.source === notification.source &&
      n.createdAt > cutoffTime &&
      n.status === 'pending'
    );

    return similarNotifications.length > 0;
  }

  private async addToBatch(notification: AdvancedNotification): Promise<void> {
    const batchKey = this.getBatchKey(notification);
    let batch = Array.from(this.batches.values()).find(b => 
      b.groupingStrategy === 'smart' && 
      b.type === notification.type &&
      b.notifications.some(n => n.userId === notification.userId)
    );

    if (!batch) {
      batch = {
        id: this.generateId(),
        notifications: [],
        createdAt: Date.now(),
        title: `${notification.type} Notifications`,
        summary: '',
        type: notification.type,
        priority: notification.priority,
        channels: notification.channels,
        groupingStrategy: 'smart'
      };
      this.batches.set(batch.id, batch);
    }

    batch.notifications.push(notification);
    batch.summary = this.generateBatchSummary(batch);
    notification.batchId = batch.id;

    // Store notification
    this.notifications.set(notification.id, notification);

    // Process batch if it reaches max size
    const userPrefs = this.getUserPreferences(notification.userId);
    if (batch.notifications.length >= (userPrefs?.smartBatching.maxBatchSize || 5)) {
      await this.processBatch(batch.id);
    }
  }

  private async processBatch(batchId: string): Promise<void> {
    const batch = this.batches.get(batchId);
    if (!batch) return;

    // Create a combined notification for the batch
    const batchNotification: AdvancedNotification = {
      id: this.generateId(),
      type: batch.type,
      priority: batch.priority,
      status: 'pending',
      title: batch.title,
      message: batch.summary,
      source: 'batch-processor',
      createdAt: batch.createdAt,
      updatedAt: Date.now(),
      channels: batch.channels,
      deliveryStatus: {},
      batchId: batch.id,
      childIds: batch.notifications.map(n => n.id),
      data: {
        batchedNotifications: batch.notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          createdAt: n.createdAt
        }))
      }
    };

    await this.queueNotification(batchNotification);
    this.emitEvent('batch:processed', { batch });
  }

  // Queue Management
  private async queueNotification(notification: AdvancedNotification): Promise<void> {
    const queueName = this.getQueueForNotification(notification);
    const queue = this.queues.get(queueName);
    
    if (queue) {
      queue.notifications.push(notification);
      await this.processQueue(queueName);
    }
  }

  private async processQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue || queue.processing) return;

    queue.processing = true;

    while (queue.notifications.length > 0) {
      const notification = queue.notifications.shift()!;
      
      try {
        await this.deliverNotification(notification);
        queue.metrics.processed++;
      } catch (error) {
        queue.metrics.failed++;
        console.error(`Failed to deliver notification ${notification.id}:`, error);
        
        // Retry logic
        if (queue.retryPolicy.enabled) {
          await this.retryNotification(notification, queue);
        }
      }

      // Rate limiting
      if (queue.rateLimiting.enabled) {
        const delay = 1000 / queue.rateLimiting.requestsPerSecond;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    queue.processing = false;
    this.emitEvent('queue:empty', { queue });
  }

  // Notification Delivery
  private async deliverNotification(notification: AdvancedNotification): Promise<void> {
    const startTime = Date.now();

    for (const channel of notification.channels) {
      try {
        const provider = this.providers.get(channel);
        if (!provider) {
          console.warn(`No provider found for channel: ${channel}`);
          continue;
        }

        const success = await provider.send(notification, channel);
        
        notification.deliveryStatus[channel] = {
          status: success ? 'delivered' : 'failed',
          attempts: (notification.deliveryStatus[channel]?.attempts || 0) + 1,
          lastAttempt: Date.now()
        };

        if (success) {
          notification.deliveredAt = Date.now();
          if (notification.status === 'pending') {
            notification.status = 'delivered';
          }
        }
      } catch (error) {
        notification.deliveryStatus[channel] = {
          status: 'failed',
          attempts: (notification.deliveryStatus[channel]?.attempts || 0) + 1,
          lastAttempt: Date.now(),
          error: error.message
        };
      }
    }

    const processingTime = Date.now() - startTime;
    this.updateProcessingMetrics(processingTime);

    this.emitEvent('notification:delivered', { notification });
  }

  // Search and Filtering
  async searchNotifications(filter: NotificationFilter, page: number = 1, pageSize: number = 20): Promise<NotificationSearchResult> {
    let filtered = Array.from(this.notifications.values());

    // Apply filters
    if (filter.types?.length) {
      filtered = filtered.filter(n => filter.types!.includes(n.type));
    }
    if (filter.priorities?.length) {
      filtered = filtered.filter(n => filter.priorities!.includes(n.priority));
    }
    if (filter.statuses?.length) {
      filtered = filtered.filter(n => filter.statuses!.includes(n.status));
    }
    if (filter.userId) {
      filtered = filtered.filter(n => n.userId === filter.userId);
    }
    if (filter.unreadOnly) {
      filtered = filtered.filter(n => n.status !== 'read');
    }
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower)
      );
    }
    if (filter.dateRange) {
      filtered = filtered.filter(n => 
        n.createdAt >= filter.dateRange!.start &&
        n.createdAt <= filter.dateRange!.end
      );
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Pagination
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const notifications = filtered.slice(start, start + pageSize);

    // Generate facets
    const facets = this.generateFacets(filtered);

    return {
      notifications,
      total,
      page,
      pageSize,
      facets
    };
  }

  // Analytics and Metrics
  private trackAnalytics(notificationId: string, userId: string, event: NotificationAnalytics['event'], channel: NotificationChannel): void {
    if (!this.config.analyticsEnabled) return;

    const analytics: NotificationAnalytics = {
      id: this.generateId(),
      notificationId,
      userId,
      event,
      channel,
      timestamp: Date.now()
    };

    this.analytics.push(analytics);
    
    // Update notification analytics
    const notification = this.notifications.get(notificationId);
    if (notification && notification.analytics) {
      switch (event) {
        case 'viewed':
          notification.analytics.impressions++;
          break;
        case 'clicked':
          notification.analytics.clicks++;
          break;
        case 'dismissed':
          notification.analytics.dismissals++;
          break;
      }
      
      // Calculate engagement score
      if (notification.analytics.impressions > 0) {
        notification.analytics.engagementScore = 
          (notification.analytics.clicks + notification.analytics.impressions * 0.5) / 
          notification.analytics.impressions;
      }
    }
  }

  getMetrics(userId?: string): NotificationMetrics {
    let notifications = Array.from(this.notifications.values());
    if (userId) {
      notifications = notifications.filter(n => n.userId === userId);
    }

    const total = notifications.length;
    const unread = notifications.filter(n => n.status !== 'read').length;

    // Group by type, priority, status, channel
    const byType = {} as { [key in NotificationType]: number };
    const byPriority = {} as { [key in NotificationPriority]: number };
    const byStatus = {} as { [key in NotificationStatus]: number };
    const byChannel = {} as { [key in NotificationChannel]: number };

    notifications.forEach(n => {
      byType[n.type] = (byType[n.type] || 0) + 1;
      byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
      byStatus[n.status] = (byStatus[n.status] || 0) + 1;
      
      n.channels.forEach(channel => {
        byChannel[channel] = (byChannel[channel] || 0) + 1;
      });
    });

    // Calculate engagement metrics
    const totalAnalytics = this.analytics.filter(a => 
      !userId || notifications.some(n => n.id === a.notificationId)
    );
    
    const impressions = totalAnalytics.filter(a => a.event === 'viewed').length;
    const clicks = totalAnalytics.filter(a => a.event === 'clicked').length;
    const dismissals = totalAnalytics.filter(a => a.event === 'dismissed').length;
    
    const engagementRate = impressions > 0 ? clicks / impressions : 0;
    const dismissalRate = impressions > 0 ? dismissals / impressions : 0;

    // Calculate average response time
    const respondedNotifications = notifications.filter(n => n.readAt && n.deliveredAt);
    const avgResponseTime = respondedNotifications.length > 0 
      ? respondedNotifications.reduce((sum, n) => sum + (n.readAt! - n.deliveredAt!), 0) / respondedNotifications.length
      : 0;

    return {
      total,
      unread,
      byType,
      byPriority,
      byStatus,
      byChannel,
      avgResponseTime,
      engagementRate,
      dismissalRate
    };
  }

  // Preferences Management
  getUserPreferences(userId?: string): NotificationPreferences | null {
    if (!userId) return null;
    return this.preferences.get(userId) || null;
  }

  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = this.preferences.get(userId) || this.getDefaultPreferences(userId);
    const updated = { ...current, ...preferences, userId };
    this.preferences.set(userId, updated);
    return updated;
  }

  // Template Management
  async createTemplate(template: NotificationTemplate): Promise<NotificationTemplate> {
    this.templates.set(template.id, template);
    return template;
  }

  async renderTemplate(templateId: string, data: Record<string, any>): Promise<{ subject: string; body: string; htmlBody?: string } | null> {
    const template = this.templates.get(templateId);
    if (!template) return null;

    // Simple template rendering (replace {{variable}} with data values)
    const renderText = (text: string) => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
    };

    return {
      subject: renderText(template.subject),
      body: renderText(template.body),
      htmlBody: template.htmlBody ? renderText(template.htmlBody) : undefined
    };
  }

  // Event System
  on(event: NotificationEventType, callback: (payload: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: NotificationEventType, callback: (payload: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(type: NotificationEventType, payload: any): void {
    const event: NotificationEvent = {
      type,
      payload,
      timestamp: Date.now(),
      source: 'notification-service'
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error);
        }
      });
    }
  }

  // Utility Methods
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getBatchKey(notification: AdvancedNotification): string {
    return `${notification.userId}_${notification.type}_${notification.source}`;
  }

  private generateBatchSummary(batch: NotificationBatch): string {
    const count = batch.notifications.length;
    const type = batch.type;
    return `You have ${count} new ${type} notifications`;
  }

  private getQueueForNotification(notification: AdvancedNotification): string {
    switch (notification.priority) {
      case 'critical':
      case 'urgent':
        return 'high-priority';
      case 'high':
        return 'medium-priority';
      default:
        return 'low-priority';
    }
  }

  private generateFacets(notifications: AdvancedNotification[]) {
    const facets = {
      types: {} as { [key in NotificationType]: number },
      priorities: {} as { [key in NotificationPriority]: number },
      sources: {} as { [key: string]: number },
      statuses: {} as { [key in NotificationStatus]: number }
    };

    notifications.forEach(n => {
      facets.types[n.type] = (facets.types[n.type] || 0) + 1;
      facets.priorities[n.priority] = (facets.priorities[n.priority] || 0) + 1;
      facets.sources[n.source] = (facets.sources[n.source] || 0) + 1;
      facets.statuses[n.status] = (facets.statuses[n.status] || 0) + 1;
    });

    return facets;
  }

  private getDefaultConfig(): NotificationServiceConfig {
    return {
      queues: [],
      defaultChannel: 'panel',
      defaultPriority: 'medium',
      batchingEnabled: true,
      analyticsEnabled: true,
      retentionDays: 30,
      maxNotificationsPerUser: 1000,
      rateLimiting: {
        enabled: true,
        globalLimit: 1000,
        userLimit: 100,
        sourceLimit: 50
      }
    };
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    const channels = ['toast', 'panel', 'badge'] as NotificationChannel[];
    const types = ['system', 'security', 'info', 'warning', 'error'] as NotificationType[];

    return {
      userId,
      channels: channels.reduce((acc, channel) => {
        acc[channel] = {
          enabled: true,
          priority: 'medium',
          frequency: 'immediate'
        };
        return acc;
      }, {} as any),
      categories: types.reduce((acc, type) => {
        acc[type] = {
          enabled: true,
          priority: 'medium',
          channels: ['panel']
        };
        return acc;
      }, {} as any),
      smartBatching: {
        enabled: true,
        maxBatchSize: 5,
        batchInterval: 15,
        intelligentGrouping: true
      },
      doNotDisturb: {
        enabled: false,
        allowUrgent: true
      }
    };
  }

  private async processMiddleware(notification: AdvancedNotification): Promise<AdvancedNotification | null> {
    let processed = notification;
    
    for (const middleware of this.middleware.sort((a, b) => b.priority - a.priority)) {
      if (!middleware.enabled) continue;
      
      try {
        const result = await middleware.process(processed);
        if (!result) return null; // Middleware blocked the notification
        processed = result;
      } catch (error) {
        console.error(`Middleware ${middleware.name} failed:`, error);
      }
    }
    
    return processed;
  }

  private async applyRules(notification: AdvancedNotification): Promise<void> {
    // Implementation for rule processing would go here
    // This is a simplified version
  }

  private async retryNotification(notification: AdvancedNotification, queue: NotificationQueue): Promise<void> {
    // Implementation for retry logic would go here
  }

  private updateProcessingMetrics(processingTime: number): void {
    // Update processing metrics
  }

  private initializeQueues(): void {
    const queues = [
      {
        id: 'high-priority',
        name: 'High Priority Queue',
        priority: 1,
        concurrency: 10,
        rateLimiting: { enabled: true, requestsPerSecond: 100, requestsPerMinute: 1000 },
        retryPolicy: { enabled: true, maxAttempts: 3, backoffStrategy: 'exponential' as const, baseDelay: 1000 },
        notifications: [],
        processing: false,
        metrics: { processed: 0, failed: 0, avgProcessingTime: 0 }
      },
      {
        id: 'medium-priority',
        name: 'Medium Priority Queue',
        priority: 2,
        concurrency: 5,
        rateLimiting: { enabled: true, requestsPerSecond: 50, requestsPerMinute: 500 },
        retryPolicy: { enabled: true, maxAttempts: 2, backoffStrategy: 'linear' as const, baseDelay: 2000 },
        notifications: [],
        processing: false,
        metrics: { processed: 0, failed: 0, avgProcessingTime: 0 }
      },
      {
        id: 'low-priority',
        name: 'Low Priority Queue',
        priority: 3,
        concurrency: 2,
        rateLimiting: { enabled: true, requestsPerSecond: 20, requestsPerMinute: 200 },
        retryPolicy: { enabled: true, maxAttempts: 1, backoffStrategy: 'fixed' as const, baseDelay: 5000 },
        notifications: [],
        processing: false,
        metrics: { processed: 0, failed: 0, avgProcessingTime: 0 }
      }
    ];

    queues.forEach(queue => this.queues.set(queue.id, queue));
  }

  private initializeProviders(): void {
    // Toast provider
    this.providers.set('toast', {
      name: 'Toast Provider',
      channels: ['toast'],
      enabled: true,
      config: {},
      send: async (notification: AdvancedNotification) => {
        // This would integrate with your toast notification system
        console.log('Sending toast notification:', notification.title);
        return true;
      }
    });

    // Panel provider
    this.providers.set('panel', {
      name: 'Panel Provider', 
      channels: ['panel'],
      enabled: true,
      config: {},
      send: async (notification: AdvancedNotification) => {
        // This would update the notification panel
        console.log('Sending panel notification:', notification.title);
        return true;
      }
    });

    // Desktop provider
    this.providers.set('desktop', {
      name: 'Desktop Provider',
      channels: ['desktop'],
      enabled: true,
      config: {},
      send: async (notification: AdvancedNotification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
          return true;
        }
        return false;
      }
    });
  }

  private initializeMiddleware(): void {
    // Rate limiting middleware
    this.middleware.push({
      name: 'RateLimiter',
      priority: 100,
      enabled: true,
      process: async (notification: AdvancedNotification) => {
        // Implement rate limiting logic
        return notification;
      }
    });

    // Deduplication middleware
    this.middleware.push({
      name: 'Deduplicator',
      priority: 90,
      enabled: true,
      process: async (notification: AdvancedNotification) => {
        // Check for duplicate notifications
        const existing = Array.from(this.notifications.values()).find(n => 
          n.userId === notification.userId &&
          n.type === notification.type &&
          n.title === notification.title &&
          n.status === 'pending' &&
          Date.now() - n.createdAt < 60000 // Within last minute
        );
        
        return existing ? null : notification;
      }
    });
  }

  private loadTemplates(): void {
    // Load default templates
    const templates: NotificationTemplate[] = [
      {
        id: 'system-alert',
        name: 'System Alert',
        type: 'system',
        subject: 'System Alert: {{title}}',
        body: '{{message}}',
        variables: ['title', 'message'],
        channels: ['toast', 'panel'],
        defaultPriority: 'high'
      },
      {
        id: 'security-warning',
        name: 'Security Warning',
        type: 'security',
        subject: 'Security Alert: {{title}}',
        body: 'Security issue detected: {{message}}',
        variables: ['title', 'message'],
        channels: ['toast', 'panel', 'desktop'],
        defaultPriority: 'critical'
      }
    ];

    templates.forEach(template => this.templates.set(template.id, template));
  }

  private loadRules(): void {
    // Load default notification rules
  }

  private startBackgroundProcessing(): void {
    // Start batch processing timer
    this.batchTimer = setInterval(() => {
      this.processPendingBatches();
    }, 60000); // Every minute

    // Start cleanup timer
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredNotifications();
    }, 3600000); // Every hour
  }

  private async processPendingBatches(): Promise<void> {
    const now = Date.now();
    const batchTimeout = 15 * 60 * 1000; // 15 minutes

    for (const batch of this.batches.values()) {
      if (now - batch.createdAt > batchTimeout) {
        await this.processBatch(batch.id);
        this.batches.delete(batch.id);
      }
    }
  }

  private cleanupExpiredNotifications(): void {
    const now = Date.now();
    const retentionTime = this.config.retentionDays * 24 * 60 * 60 * 1000;

    for (const [id, notification] of this.notifications.entries()) {
      if (now - notification.createdAt > retentionTime) {
        this.notifications.delete(id);
      }
    }

    // Cleanup analytics
    this.analytics = this.analytics.filter(a => now - a.timestamp < retentionTime);
  }

  // Public API methods for dashboard integration
  getUnreadCount(userId: string): number {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && n.status !== 'read').length;
  }

  getRecentNotifications(userId: string, limit: number = 10): AdvancedNotification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  async bulkMarkAsRead(ids: string[], userId: string): Promise<number> {
    let marked = 0;
    for (const id of ids) {
      if (await this.markAsRead(id, userId)) {
        marked++;
      }
    }
    return marked;
  }

  async clearAll(userId: string): Promise<number> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);
    
    for (const notification of userNotifications) {
      await this.dismiss(notification.id, userId);
    }
    
    return userNotifications.length;
  }

  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.notifications.clear();
    this.batches.clear();
    this.queues.clear();
    this.eventListeners.clear();
  }
}

export default AdvancedNotificationService.getInstance();