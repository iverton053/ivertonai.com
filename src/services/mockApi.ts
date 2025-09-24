import { ApiResponse, ApiError, UserData, WidgetConfig, AutomationWidgetData, StatsWidgetData } from '../types';
import { storage } from './storage';

/**
 * Mock API service for development and testing
 * Simulates real API calls with realistic delays and error scenarios
 */
export class MockApiService {
  private static instance: MockApiService;
  private baseDelay = 300; // Base delay for API calls
  private errorRate = 0.05; // 5% error rate for testing

  private constructor() {}

  static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  private async delay(ms: number = this.baseDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private shouldSimulateError(): boolean {
    return Math.random() < this.errorRate;
  }

  private createError(message: string, code?: string): ApiError {
    return {
      success: false,
      error: message,
      code,
      timestamp: Date.now(),
    };
  }

  private createResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      data,
      success: true,
      message,
      timestamp: Date.now(),
    };
  }

  // User API
  async getCurrentUser(): Promise<ApiResponse<UserData> | ApiError> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return this.createError('Failed to fetch user data', 'USER_FETCH_ERROR');
    }

    // Get user from storage or create default
    const userData = storage.get<UserData>('user_data') || this.createDefaultUser();
    
    return this.createResponse(userData, 'User data retrieved successfully');
  }

  async updateUser(updates: Partial<UserData>): Promise<ApiResponse<UserData> | ApiError> {
    await this.delay(500);

    if (this.shouldSimulateError()) {
      return this.createError('Failed to update user data', 'USER_UPDATE_ERROR');
    }

    const currentUser = storage.get<UserData>('user_data') || this.createDefaultUser();
    const updatedUser = {
      ...currentUser,
      ...updates,
      updatedAt: Date.now(),
    };

    storage.set('user_data', updatedUser);
    return this.createResponse(updatedUser, 'User updated successfully');
  }

  // Analytics API
  async getAnalytics(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<ApiResponse<any> | ApiError> {
    await this.delay(800);

    if (this.shouldSimulateError()) {
      return this.createError('Failed to fetch analytics', 'ANALYTICS_ERROR');
    }

    const analytics = this.generateAnalytics(timeRange);
    return this.createResponse(analytics, 'Analytics data retrieved');
  }

  // Widget Data API
  async getWidgetData(widgetId: string, type: string): Promise<ApiResponse<any> | ApiError> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return this.createError(`Failed to fetch data for widget ${widgetId}`, 'WIDGET_DATA_ERROR');
    }

    let data: any;

    switch (type) {
      case 'stats':
        data = this.generateStatsData();
        break;
      case 'automation':
        data = this.generateAutomationData();
        break;
      case 'chart':
        data = this.generateChartData();
        break;
      default:
        data = { message: 'Widget data loaded', timestamp: Date.now() };
    }

    return this.createResponse(data, `Widget data for ${widgetId} retrieved`);
  }

  // Automation API
  async getAutomations(): Promise<ApiResponse<AutomationWidgetData[]> | ApiError> {
    await this.delay(600);

    if (this.shouldSimulateError()) {
      return this.createError('Failed to fetch automations', 'AUTOMATIONS_ERROR');
    }

    const automations = [
      {
        name: 'SEO Audit',
        status: 'running' as const,
        progress: Math.floor(Math.random() * 100),
        lastRun: this.getRandomTimeAgo(),
        nextRun: 'In 2 hours',
        duration: 1800000, // 30 minutes
      },
      {
        name: 'Social Media Analytics',
        status: 'completed' as const,
        progress: 100,
        lastRun: this.getRandomTimeAgo(),
        duration: 900000, // 15 minutes
      },
      {
        name: 'Content Generator',
        status: 'paused' as const,
        progress: Math.floor(Math.random() * 50),
        lastRun: this.getRandomTimeAgo(),
      },
      {
        name: 'Email Campaign',
        status: 'scheduled' as const,
        progress: 0,
        lastRun: 'Never',
        nextRun: 'Tomorrow at 9:00 AM',
      },
    ];

    return this.createResponse(automations, 'Automations retrieved');
  }

  async toggleAutomation(automationId: string): Promise<ApiResponse<AutomationWidgetData> | ApiError> {
    await this.delay(400);

    if (this.shouldSimulateError()) {
      return this.createError('Failed to toggle automation', 'AUTOMATION_TOGGLE_ERROR');
    }

    // Simulate automation state change
    const automation = {
      name: 'Updated Automation',
      status: Math.random() > 0.5 ? 'running' as const : 'paused' as const,
      progress: Math.floor(Math.random() * 100),
      lastRun: 'Just now',
    };

    return this.createResponse(automation, 'Automation toggled successfully');
  }

  // Real-time updates simulation
  subscribeToRealTimeUpdates(callback: (data: any) => void): () => void {
    const interval = setInterval(() => {
      const updateType = Math.random();
      let update: any;

      if (updateType < 0.3) {
        // Stats update
        update = {
          type: 'stats_update',
          data: this.generateStatsData(),
          timestamp: Date.now(),
        };
      } else if (updateType < 0.6) {
        // Automation progress update
        update = {
          type: 'automation_progress',
          data: {
            id: `automation_${Math.floor(Math.random() * 4) + 1}`,
            progress: Math.floor(Math.random() * 100),
          },
          timestamp: Date.now(),
        };
      } else {
        // Notification
        update = {
          type: 'notification',
          data: {
            title: 'System Update',
            message: this.getRandomNotificationMessage(),
            type: Math.random() > 0.8 ? 'error' : 'info',
          },
          timestamp: Date.now(),
        };
      }

      callback(update);
    }, 5000 + Math.random() * 10000); // 5-15 seconds

    return () => clearInterval(interval);
  }

  // Helper methods
  private createDefaultUser(): UserData {
    return {
      id: `user_${Date.now()}`,
      username: 'Demo User',
      client_name: 'John Smith',
      company: 'TechCorp Solutions',
      email: 'demo@example.com',
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        notifications: true,
        autoSave: true,
      },
      metrics: {
        active_automations: 12,
        success_rate: 94.7,
        completed_today: 47,
        time_saved: 12.4,
      },
      available_categories: [
        'SEO Audit',
        'Content Generation',
        'Social Media Analytics',
        'Email Campaigns',
        'Performance Monitoring'
      ],
      widgets: [
        'Performance Analytics',
        'Traffic Monitor',
        'Workflow Status',
        'Success Metrics'
      ],
      createdAt: Date.now() - 86400000, // 1 day ago
      updatedAt: Date.now(),
    };
  }

  private generateStatsData(): StatsWidgetData {
    const metrics = [
      { title: 'Active Users', unit: '', icon: 'Users' },
      { title: 'Revenue', unit: '$', icon: 'DollarSign' },
      { title: 'Conversion Rate', unit: '%', icon: 'TrendingUp' },
      { title: 'Tasks Completed', unit: '', icon: 'Activity' },
      { title: 'Response Time', unit: 'ms', icon: 'Clock' },
    ];

    const metric = metrics[Math.floor(Math.random() * metrics.length)];
    const baseValue = Math.floor(Math.random() * 10000) + 100;
    const change = (Math.random() - 0.5) * 50; // -25% to +25%

    return {
      title: metric.title,
      value: metric.unit === '$' ? `${metric.unit}${baseValue.toLocaleString()}` : 
             metric.unit === '%' ? `${(baseValue / 100).toFixed(1)}${metric.unit}` :
             baseValue.toLocaleString(),
      change: parseFloat(change.toFixed(1)),
      icon: metric.icon,
      unit: metric.unit,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  }

  private generateAutomationData(): AutomationWidgetData {
    const automations = [
      'Data Processing',
      'Report Generation',
      'Email Notifications',
      'Content Sync',
      'Analytics Update'
    ];

    const statuses: AutomationWidgetData['status'][] = ['running', 'completed', 'paused', 'scheduled'];
    
    return {
      name: automations[Math.floor(Math.random() * automations.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      progress: Math.floor(Math.random() * 100),
      lastRun: this.getRandomTimeAgo(),
      nextRun: 'In ' + Math.floor(Math.random() * 24) + ' hours',
      duration: Math.floor(Math.random() * 3600000), // 0-1 hour
    };
  }

  private generateChartData() {
    const dataPoints = Math.floor(Math.random() * 10) + 5; // 5-15 points
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      data.push({
        label: `Point ${i + 1}`,
        value: Math.floor(Math.random() * 1000),
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      });
    }

    return {
      type: ['line', 'bar', 'pie', 'area'][Math.floor(Math.random() * 4)] as any,
      data,
      timeRange: ['24h', '7d', '30d'][Math.floor(Math.random() * 3)],
    };
  }

  private generateAnalytics(timeRange: string) {
    const dataPoints = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      data.push({
        timestamp: Date.now() - (dataPoints - i) * (timeRange === '24h' ? 3600000 : 86400000),
        users: Math.floor(Math.random() * 1000) + 100,
        sessions: Math.floor(Math.random() * 1500) + 200,
        pageViews: Math.floor(Math.random() * 5000) + 500,
        bounceRate: Math.random() * 0.4 + 0.2, // 20-60%
      });
    }

    return {
      timeRange,
      data,
      summary: {
        totalUsers: data.reduce((sum, d) => sum + d.users, 0),
        totalSessions: data.reduce((sum, d) => sum + d.sessions, 0),
        totalPageViews: data.reduce((sum, d) => sum + d.pageViews, 0),
        avgBounceRate: data.reduce((sum, d) => sum + d.bounceRate, 0) / data.length,
      },
    };
  }

  private getRandomTimeAgo(): string {
    const times = [
      '2 minutes ago',
      '15 minutes ago',
      '1 hour ago',
      '3 hours ago',
      '1 day ago',
      '2 days ago',
    ];
    return times[Math.floor(Math.random() * times.length)];
  }

  private getRandomNotificationMessage(): string {
    const messages = [
      'Automation completed successfully',
      'New data available for analysis',
      'System maintenance scheduled',
      'Performance metrics updated',
      'Export ready for download',
      'Integration sync completed',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

export const mockApi = MockApiService.getInstance();