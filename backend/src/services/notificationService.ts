import nodemailer from 'nodemailer';
import twilio from 'twilio';
import webpush from 'web-push';
import { EventEmitter } from 'events';
import Notification, { INotification } from '../models/Notification';
import { websocketService } from './websocketService';

interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: {
    name: string;
    email: string;
  };
}

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface PushConfig {
  vapidKeys: {
    publicKey: string;
    privateKey: string;
  };
  subject: string;
}

interface UserNotificationSettings {
  userId: string;
  email: {
    enabled: boolean;
    address: string;
    types: string[];
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  sms: {
    enabled: boolean;
    phoneNumber: string;
    types: string[];
    urgentOnly: boolean;
  };
  push: {
    enabled: boolean;
    subscription?: any;
    types: string[];
  };
  inApp: {
    enabled: boolean;
    types: string[];
    sound: boolean;
  };
}

interface NotificationTemplate {
  id: string;
  type: string;
  name: string;
  subject: string;
  emailBody: string;
  smsBody: string;
  pushBody: string;
  variables: string[];
}

class NotificationService extends EventEmitter {
  private emailTransporter: nodemailer.Transporter | null = null;
  private twilioClient: any = null;
  private emailConfig: EmailConfig | null = null;
  private smsConfig: SMSConfig | null = null;
  private pushConfig: PushConfig | null = null;
  private templates: Map<string, NotificationTemplate> = new Map();
  private userSettings: Map<string, UserNotificationSettings> = new Map();
  private sendQueue: Map<string, any[]> = new Map();
  private retryQueue: Map<string, any> = new Map();
  private rateLimiter: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    super();
    this.initializeTemplates();
    this.startQueueProcessor();
    this.startRetryProcessor();
  }

  // Configuration Methods
  async configure(config: {
    email?: EmailConfig;
    sms?: SMSConfig;
    push?: PushConfig;
  }) {
    if (config.email) {
      await this.configureEmail(config.email);
    }
    if (config.sms) {
      await this.configureSMS(config.sms);
    }
    if (config.push) {
      await this.configurePush(config.push);
    }
  }

  private async configureEmail(config: EmailConfig) {
    this.emailConfig = config;
    this.emailTransporter = nodemailer.createTransporter({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.auth,
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });

    try {
      await this.emailTransporter.verify();
      console.log('Email service configured successfully');
    } catch (error) {
      console.error('Email configuration failed:', error);
      this.emailTransporter = null;
    }
  }

  private async configureSMS(config: SMSConfig) {
    this.smsConfig = config;
    this.twilioClient = twilio(config.accountSid, config.authToken);
    console.log('SMS service configured successfully');
  }

  private async configurePush(config: PushConfig) {
    this.pushConfig = config;
    webpush.setVapidDetails(
      config.subject,
      config.vapidKeys.publicKey,
      config.vapidKeys.privateKey
    );
    console.log('Push notification service configured successfully');
  }

  // User Settings Management
  async updateUserSettings(userId: string, settings: Partial<UserNotificationSettings>) {
    const existing = this.userSettings.get(userId) || this.getDefaultUserSettings(userId);
    const updated = { ...existing, ...settings };
    this.userSettings.set(userId, updated);

    // Save to database (implement based on your user model)
    // await User.updateOne({ _id: userId }, { notificationSettings: updated });

    this.emit('userSettingsUpdated', { userId, settings: updated });
  }

  async getUserSettings(userId: string): Promise<UserNotificationSettings> {
    let settings = this.userSettings.get(userId);
    if (!settings) {
      // Load from database if not in memory
      settings = this.getDefaultUserSettings(userId);
      this.userSettings.set(userId, settings);
    }
    return settings;
  }

  private getDefaultUserSettings(userId: string): UserNotificationSettings {
    return {
      userId,
      email: {
        enabled: true,
        address: '', // Should be loaded from user profile
        types: ['assignment', 'approval', 'deadline', 'mention'],
        frequency: 'immediate'
      },
      sms: {
        enabled: false,
        phoneNumber: '',
        types: ['deadline'],
        urgentOnly: true
      },
      push: {
        enabled: true,
        types: ['assignment', 'approval', 'comment', 'mention'],
        subscription: null
      },
      inApp: {
        enabled: true,
        types: ['assignment', 'approval', 'comment', 'deadline', 'mention', 'workflow', 'system'],
        sound: true
      }
    };
  }

  // Template Management
  private initializeTemplates() {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'content_assigned',
        type: 'assignment',
        name: 'Content Assigned',
        subject: 'New content assigned: {{title}}',
        emailBody: `
          <h2>New Content Assignment</h2>
          <p>Hi {{assignee_name}},</p>
          <p>You have been assigned a new content item:</p>
          <ul>
            <li><strong>Title:</strong> {{title}}</li>
            <li><strong>Type:</strong> {{content_type}}</li>
            <li><strong>Platform:</strong> {{platform}}</li>
            <li><strong>Priority:</strong> {{priority}}</li>
            <li><strong>Deadline:</strong> {{deadline}}</li>
          </ul>
          <p><a href="{{content_url}}">View Content</a></p>
        `,
        smsBody: 'New content assigned: {{title}}. Deadline: {{deadline}}. View: {{short_url}}',
        pushBody: 'New content assigned: {{title}}',
        variables: ['assignee_name', 'title', 'content_type', 'platform', 'priority', 'deadline', 'content_url', 'short_url']
      },
      {
        id: 'approval_request',
        type: 'approval',
        name: 'Approval Request',
        subject: 'Approval needed: {{title}}',
        emailBody: `
          <h2>Content Approval Required</h2>
          <p>Hi {{approver_name}},</p>
          <p>The following content is ready for your approval:</p>
          <ul>
            <li><strong>Title:</strong> {{title}}</li>
            <li><strong>Created by:</strong> {{creator_name}}</li>
            <li><strong>Deadline:</strong> {{deadline}}</li>
          </ul>
          <p><a href="{{approval_url}}">Review and Approve</a></p>
        `,
        smsBody: 'Approval needed for: {{title}}. Review: {{short_url}}',
        pushBody: 'Approval needed: {{title}}',
        variables: ['approver_name', 'title', 'creator_name', 'deadline', 'approval_url', 'short_url']
      },
      {
        id: 'deadline_reminder',
        type: 'deadline',
        name: 'Deadline Reminder',
        subject: 'Deadline approaching: {{title}}',
        emailBody: `
          <h2>Deadline Reminder</h2>
          <p>Hi {{user_name}},</p>
          <p>This is a reminder that the following content has a deadline approaching:</p>
          <ul>
            <li><strong>Title:</strong> {{title}}</li>
            <li><strong>Deadline:</strong> {{deadline}}</li>
            <li><strong>Time remaining:</strong> {{time_remaining}}</li>
          </ul>
          <p><a href="{{content_url}}">View Content</a></p>
        `,
        smsBody: 'DEADLINE ALERT: {{title}} due {{deadline}}. {{short_url}}',
        pushBody: 'Deadline approaching: {{title}} due {{deadline}}',
        variables: ['user_name', 'title', 'deadline', 'time_remaining', 'content_url', 'short_url']
      },
      {
        id: 'content_approved',
        type: 'approval',
        name: 'Content Approved',
        subject: 'Content approved: {{title}}',
        emailBody: `
          <h2>Content Approved</h2>
          <p>Hi {{creator_name}},</p>
          <p>Great news! Your content has been approved:</p>
          <ul>
            <li><strong>Title:</strong> {{title}}</li>
            <li><strong>Approved by:</strong> {{approver_name}}</li>
            <li><strong>Comments:</strong> {{comments}}</li>
          </ul>
          <p><a href="{{content_url}}">View Content</a></p>
        `,
        smsBody: 'Content approved: {{title}}',
        pushBody: 'Your content "{{title}}" has been approved!',
        variables: ['creator_name', 'title', 'approver_name', 'comments', 'content_url']
      },
      {
        id: 'content_rejected',
        type: 'approval',
        name: 'Content Rejected',
        subject: 'Content needs revision: {{title}}',
        emailBody: `
          <h2>Content Revision Required</h2>
          <p>Hi {{creator_name}},</p>
          <p>Your content needs revision before it can be approved:</p>
          <ul>
            <li><strong>Title:</strong> {{title}}</li>
            <li><strong>Reviewer:</strong> {{reviewer_name}}</li>
            <li><strong>Feedback:</strong> {{feedback}}</li>
          </ul>
          <p><a href="{{content_url}}">View and Edit Content</a></p>
        `,
        smsBody: 'Content needs revision: {{title}}. Feedback: {{feedback}}',
        pushBody: 'Revision needed: {{title}}',
        variables: ['creator_name', 'title', 'reviewer_name', 'feedback', 'content_url']
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  addTemplate(template: NotificationTemplate) {
    this.templates.set(template.id, template);
  }

  getTemplate(id: string): NotificationTemplate | undefined {
    return this.templates.get(id);
  }

  // Core Notification Methods
  async sendNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    templateId?: string;
    templateVariables?: Record<string, any>;
    urgent?: boolean;
    channels?: ('email' | 'sms' | 'push' | 'in_app')[];
    scheduledAt?: Date;
  }): Promise<INotification> {
    // Create notification record
    const notificationDoc = new Notification({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      recipient_id: notification.userId,
      urgent: notification.urgent || false,
      data: notification.data || {},
      scheduled_at: notification.scheduledAt
    });

    await notificationDoc.save();

    // Get user settings
    const userSettings = await this.getUserSettings(notification.userId);

    // Determine which channels to use
    const channels = notification.channels || ['in_app', 'email', 'push'];

    // Send via each channel
    const sendPromises: Promise<any>[] = [];

    if (channels.includes('in_app')) {
      sendPromises.push(this.sendInAppNotification(notificationDoc));
    }

    if (channels.includes('email') && userSettings.email.enabled) {
      sendPromises.push(this.sendEmailNotification(notificationDoc, userSettings, notification.templateId, notification.templateVariables));
    }

    if (channels.includes('sms') && userSettings.sms.enabled && (userSettings.sms.urgentOnly ? notification.urgent : true)) {
      sendPromises.push(this.sendSMSNotification(notificationDoc, userSettings, notification.templateId, notification.templateVariables));
    }

    if (channels.includes('push') && userSettings.push.enabled) {
      sendPromises.push(this.sendPushNotification(notificationDoc, userSettings, notification.templateId, notification.templateVariables));
    }

    // Wait for all notifications to be sent
    await Promise.allSettled(sendPromises);

    return notificationDoc;
  }

  // Channel-specific sending methods
  private async sendInAppNotification(notification: INotification): Promise<void> {
    try {
      // Send via WebSocket for real-time delivery
      websocketService.sendToUser(notification.recipient_id, 'notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        urgent: notification.urgent,
        created_at: notification.created_at
      });

      await notification.updateDeliveryStatus('in_app', 'delivered');

      this.emit('notificationSent', {
        notificationId: notification.id,
        channel: 'in_app',
        status: 'success'
      });
    } catch (error) {
      await notification.updateDeliveryStatus('in_app', 'failed');
      this.handleNotificationError(notification, 'in_app', error);
    }
  }

  private async sendEmailNotification(
    notification: INotification,
    userSettings: UserNotificationSettings,
    templateId?: string,
    variables?: Record<string, any>
  ): Promise<void> {
    if (!this.emailTransporter || !this.emailConfig) {
      throw new Error('Email service not configured');
    }

    try {
      let subject = notification.title;
      let htmlBody = notification.message;
      let textBody = notification.message;

      // Use template if provided
      if (templateId) {
        const template = this.getTemplate(templateId);
        if (template) {
          subject = this.replaceVariables(template.subject, variables);
          htmlBody = this.replaceVariables(template.emailBody, variables);
          textBody = this.stripHtml(htmlBody);
        }
      }

      const mailOptions = {
        from: `${this.emailConfig.from.name} <${this.emailConfig.from.email}>`,
        to: userSettings.email.address,
        subject,
        html: htmlBody,
        text: textBody,
        headers: {
          'X-Priority': notification.urgent ? '1' : '3',
          'X-MSMail-Priority': notification.urgent ? 'High' : 'Normal'
        }
      };

      await this.emailTransporter.sendMail(mailOptions);
      await notification.updateDeliveryStatus('email', 'sent');

      this.emit('notificationSent', {
        notificationId: notification.id,
        channel: 'email',
        status: 'success'
      });
    } catch (error) {
      await notification.updateDeliveryStatus('email', 'failed');
      this.handleNotificationError(notification, 'email', error);
      throw error;
    }
  }

  private async sendSMSNotification(
    notification: INotification,
    userSettings: UserNotificationSettings,
    templateId?: string,
    variables?: Record<string, any>
  ): Promise<void> {
    if (!this.twilioClient || !this.smsConfig) {
      throw new Error('SMS service not configured');
    }

    try {
      let body = notification.message;

      // Use template if provided
      if (templateId) {
        const template = this.getTemplate(templateId);
        if (template) {
          body = this.replaceVariables(template.smsBody, variables);
        }
      }

      // Truncate message if too long (SMS limit is 160 characters)
      if (body.length > 160) {
        body = body.substring(0, 157) + '...';
      }

      const message = await this.twilioClient.messages.create({
        body,
        from: this.smsConfig.fromNumber,
        to: userSettings.sms.phoneNumber
      });

      await notification.updateDeliveryStatus('sms', 'sent');

      this.emit('notificationSent', {
        notificationId: notification.id,
        channel: 'sms',
        status: 'success',
        messageId: message.sid
      });
    } catch (error) {
      await notification.updateDeliveryStatus('sms', 'failed');
      this.handleNotificationError(notification, 'sms', error);
      throw error;
    }
  }

  private async sendPushNotification(
    notification: INotification,
    userSettings: UserNotificationSettings,
    templateId?: string,
    variables?: Record<string, any>
  ): Promise<void> {
    if (!this.pushConfig || !userSettings.push.subscription) {
      throw new Error('Push notification service not configured or user not subscribed');
    }

    try {
      let body = notification.message;

      // Use template if provided
      if (templateId) {
        const template = this.getTemplate(templateId);
        if (template) {
          body = this.replaceVariables(template.pushBody, variables);
        }
      }

      const payload = JSON.stringify({
        title: notification.title,
        body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.type,
        data: {
          notificationId: notification.id,
          type: notification.type,
          url: notification.data.url || '/dashboard'
        },
        actions: this.getPushActions(notification.type)
      });

      await webpush.sendNotification(userSettings.push.subscription, payload);
      await notification.updateDeliveryStatus('push', 'sent');

      this.emit('notificationSent', {
        notificationId: notification.id,
        channel: 'push',
        status: 'success'
      });
    } catch (error) {
      await notification.updateDeliveryStatus('push', 'failed');
      this.handleNotificationError(notification, 'push', error);
      throw error;
    }
  }

  // Batch notification methods
  async sendBulkNotifications(notifications: Array<{
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    templateId?: string;
    templateVariables?: Record<string, any>;
  }>): Promise<INotification[]> {
    const results: INotification[] = [];
    const batchSize = 50; // Process in batches to avoid overwhelming the system

    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const batchPromises = batch.map(notification =>
        this.sendNotification(notification).catch(error => {
          console.error('Failed to send notification:', error);
          return null;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null) as INotification[]);
    }

    return results;
  }

  async sendToTeam(teamId: string, notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
    templateId?: string;
    templateVariables?: Record<string, any>;
  }): Promise<INotification[]> {
    // Get team members (implement based on your team model)
    // const team = await Team.findById(teamId).populate('members.user_id');
    // const memberIds = team.members.map(member => member.user_id);

    // For now, return empty array - implement when team model is integrated
    return [];
  }

  // Utility methods
  private replaceVariables(template: string, variables?: Record<string, any>): string {
    if (!variables) return template;

    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    });

    return result;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  private getPushActions(type: string): any[] {
    switch (type) {
      case 'assignment':
        return [
          { action: 'view', title: 'View', icon: '/icons/view.png' },
          { action: 'later', title: 'Later', icon: '/icons/later.png' }
        ];
      case 'approval':
        return [
          { action: 'approve', title: 'Approve', icon: '/icons/approve.png' },
          { action: 'review', title: 'Review', icon: '/icons/review.png' }
        ];
      default:
        return [
          { action: 'view', title: 'View', icon: '/icons/view.png' }
        ];
    }
  }

  private handleNotificationError(notification: INotification, channel: string, error: any) {
    console.error(`Failed to send ${channel} notification:`, error);

    // Add to retry queue for transient errors
    if (this.shouldRetry(error)) {
      this.addToRetryQueue(notification.id, channel, error);
    }

    this.emit('notificationError', {
      notificationId: notification.id,
      channel,
      error: error.message
    });
  }

  private shouldRetry(error: any): boolean {
    // Retry for network errors, rate limits, and server errors
    const retryableErrors = ['ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT', 'Rate limit', '5'];
    return retryableErrors.some(retryableError =>
      error.message?.includes(retryableError) || error.code?.toString().startsWith('5')
    );
  }

  private addToRetryQueue(notificationId: string, channel: string, error: any) {
    const retryKey = `${notificationId}_${channel}`;
    const retryCount = this.retryQueue.get(retryKey)?.retryCount || 0;

    if (retryCount < 3) { // Max 3 retries
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      setTimeout(() => {
        this.retryNotification(notificationId, channel, retryCount + 1);
      }, delay);

      this.retryQueue.set(retryKey, {
        notificationId,
        channel,
        retryCount: retryCount + 1,
        lastError: error,
        nextRetry: Date.now() + delay
      });
    }
  }

  private async retryNotification(notificationId: string, channel: string, retryCount: number) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) return;

      const userSettings = await this.getUserSettings(notification.recipient_id);

      switch (channel) {
        case 'email':
          await this.sendEmailNotification(notification, userSettings);
          break;
        case 'sms':
          await this.sendSMSNotification(notification, userSettings);
          break;
        case 'push':
          await this.sendPushNotification(notification, userSettings);
          break;
      }

      // Remove from retry queue on success
      this.retryQueue.delete(`${notificationId}_${channel}`);
    } catch (error) {
      if (retryCount < 3) {
        this.addToRetryQueue(notificationId, channel, error);
      } else {
        // Max retries reached, remove from queue
        this.retryQueue.delete(`${notificationId}_${channel}`);
      }
    }
  }

  // Queue processors
  private startQueueProcessor() {
    setInterval(() => {
      // Process any queued notifications
      this.processNotificationQueue();
    }, 5000); // Process every 5 seconds
  }

  private startRetryProcessor() {
    setInterval(() => {
      // Clean up old retry entries
      const now = Date.now();
      for (const [key, retry] of this.retryQueue.entries()) {
        if (now - retry.nextRetry > 3600000) { // 1 hour
          this.retryQueue.delete(key);
        }
      }
    }, 300000); // Clean every 5 minutes
  }

  private async processNotificationQueue() {
    // Implementation for processing queued notifications
    // This could include scheduled notifications, batched notifications, etc.
  }

  // Cleanup and maintenance
  async cleanup() {
    if (this.emailTransporter) {
      this.emailTransporter.close();
    }
    this.removeAllListeners();
  }

  // Statistics and monitoring
  async getNotificationStats(userId?: string, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const matchStage: any = { created_at: { $gte: startDate } };
    if (userId) {
      matchStage.recipient_id = userId;
    }

    return await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          totalSent: { $sum: 1 },
          totalRead: { $sum: { $cond: ['$read', 1, 0] } },
          urgentCount: { $sum: { $cond: ['$urgent', 1, 0] } },
          emailSent: {
            $sum: {
              $cond: [{ $eq: ['$delivery_status.email', 'sent'] }, 1, 0]
            }
          },
          smsSent: {
            $sum: {
              $cond: [{ $eq: ['$delivery_status.sms', 'sent'] }, 1, 0]
            }
          },
          pushSent: {
            $sum: {
              $cond: [{ $eq: ['$delivery_status.push', 'sent'] }, 1, 0]
            }
          }
        }
      }
    ]);
  }
}

export const notificationService = new NotificationService();
export default notificationService;