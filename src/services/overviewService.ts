import { OverviewMetrics } from '../types/overview';

// Backend-ready API service for Overview dashboard
class OverviewService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';
  private authToken = '';

  constructor() {
    this.authToken = this.getAuthToken();
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || 
           sessionStorage.getItem('authToken') || 
           'demo-token-for-testing'; // Fallback demo token
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return response.text() as T;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Fetch comprehensive overview data
  async getOverviewMetrics(clientId?: string): Promise<OverviewMetrics> {
    const endpoint = clientId 
      ? `/overview/metrics/${clientId}`
      : '/overview/metrics';
    
    return this.makeRequest<OverviewMetrics>(endpoint);
  }

  // Fetch performance metrics only
  async getPerformanceMetrics(clientId?: string, timeframe = '30d') {
    const params = new URLSearchParams({ timeframe });
    if (clientId) params.append('clientId', clientId);
    
    return this.makeRequest(`/overview/performance?${params}`);
  }

  // Fetch scheduled items
  async getScheduledItems(clientId?: string, limit = 10) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (clientId) params.append('clientId', clientId);
    
    return this.makeRequest(`/overview/scheduled-items?${params}`);
  }

  // Fetch business goals
  async getBusinessGoals(clientId?: string, status?: string) {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (status) params.append('status', status);
    
    return this.makeRequest(`/overview/business-goals?${params}`);
  }

  // Fetch recent activity
  async getRecentActivity(clientId?: string, limit = 20) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (clientId) params.append('clientId', clientId);
    
    return this.makeRequest(`/overview/recent-activity?${params}`);
  }

  // Fetch active alerts
  async getAlerts(clientId?: string, unreadOnly = true) {
    const params = new URLSearchParams({ unreadOnly: unreadOnly.toString() });
    if (clientId) params.append('clientId', clientId);
    
    return this.makeRequest(`/overview/alerts?${params}`);
  }

  // Fetch quick stats summary
  async getQuickStats(clientId?: string) {
    const endpoint = clientId 
      ? `/overview/quick-stats/${clientId}`
      : '/overview/quick-stats';
    
    return this.makeRequest(endpoint);
  }

  // Update business goal progress
  async updateGoalProgress(goalId: string, progress: number) {
    return this.makeRequest(`/overview/business-goals/${goalId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
  }

  // Mark alert as read
  async markAlertAsRead(alertId: string) {
    return this.makeRequest(`/overview/alerts/${alertId}/read`, {
      method: 'PATCH',
    });
  }

  // Get real-time updates via WebSocket or Server-Sent Events
  subscribeToUpdates(clientId?: string, callback: (data: Partial<OverviewMetrics>) => void): () => void {
    const eventSource = new EventSource(
      `${this.baseUrl}/overview/subscribe${clientId ? `?clientId=${clientId}` : ''}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  // Bulk refresh all data
  async refreshAllData(clientId?: string): Promise<OverviewMetrics> {
    const endpoint = clientId 
      ? `/overview/refresh/${clientId}`
      : '/overview/refresh';
    
    return this.makeRequest<OverviewMetrics>(endpoint, {
      method: 'POST',
    });
  }

  // Export overview data
  async exportData(format: 'json' | 'csv' | 'pdf' = 'json', clientId?: string) {
    const params = new URLSearchParams({ format });
    if (clientId) params.append('clientId', clientId);
    
    return this.makeRequest(`/overview/export?${params}`);
  }

  // Health check for the overview service
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest('/overview/health');
  }
}

// Singleton instance
export const overviewService = new OverviewService();

// Named exports for specific functions
export const {
  getOverviewMetrics,
  getPerformanceMetrics,
  getScheduledItems,
  getBusinessGoals,
  getRecentActivity,
  getAlerts,
  getQuickStats,
  updateGoalProgress,
  markAlertAsRead,
  subscribeToUpdates,
  refreshAllData,
  exportData,
  healthCheck,
} = overviewService;

export default overviewService;