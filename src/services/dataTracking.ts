import { 
  DataPoint, 
  TimeSeriesData, 
  HistoryEntry, 
  UsageAnalytics, 
  AnalyticsMetric,
  HistoryStorageKeys 
} from '../types';
import { format, subDays, subHours, startOfDay, endOfDay, eachDayOfInterval, eachHourOfInterval } from 'date-fns';

export class DataTrackingService {
  private readonly MAX_HISTORY_ENTRIES = 10000;
  private readonly MAX_TIME_SERIES_POINTS = 1000;
  private sessionStartTime = Date.now();
  private currentSessionId = `session_${this.sessionStartTime}`;
  private actionCounter = 0;
  private interactedWidgets = new Set<string>();
  private featureUsage = new Map<string, number>();

  /**
   * Record a data point for historical tracking
   */
  trackDataPoint(metric: string, value: number | string, metadata?: Record<string, any>): void {
    const dataPoint: DataPoint = {
      id: `dp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      value,
      metadata
    };

    this.appendToTimeSeries(metric, dataPoint);
  }

  /**
   * Record a user action for analytics
   */
  trackUserAction(action: string, entityId?: string, metadata?: Record<string, any>): void {
    const historyEntry: HistoryEntry = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user_action',
      entityId: entityId || 'system',
      data: { action, metadata },
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      metadata: {
        sessionId: this.currentSessionId,
        ...metadata
      }
    };

    this.recordHistoryEntry(historyEntry);
    this.updateSessionAnalytics(action, entityId);
  }

  /**
   * Track widget interaction
   */
  trackWidgetInteraction(widgetId: string, action: string, data?: any): void {
    this.interactedWidgets.add(widgetId);
    this.trackUserAction(`widget_${action}`, widgetId, { widgetData: data });
    
    // Also track as data point for widget usage analytics
    this.trackDataPoint(`widget_${widgetId}_interactions`, 1, {
      action,
      data
    });
  }

  /**
   * Record widget data change
   */
  trackWidgetDataChange(widgetId: string, newData: any, oldData?: any): void {
    const historyEntry: HistoryEntry = {
      id: `widget_data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'widget_data',
      entityId: widgetId,
      data: {
        newData,
        oldData,
        change: this.calculateDataChange(oldData, newData)
      },
      timestamp: Date.now(),
      userId: this.getCurrentUserId()
    };

    this.recordHistoryEntry(historyEntry);
  }

  /**
   * Get time series data for a specific metric
   */
  getTimeSeriesData(
    metric: string, 
    timeRange: { start: number; end: number },
    aggregation: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): TimeSeriesData {
    const timeSeries = this.getStoredTimeSeries(metric);
    if (!timeSeries) {
      return {
        metric,
        data: [],
        timeRange,
        aggregation
      };
    }

    // Filter data by time range
    const filteredData = timeSeries.filter(
      point => point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
    );

    // Aggregate data based on the specified interval
    const aggregatedData = this.aggregateData(filteredData, aggregation);

    return {
      metric,
      data: aggregatedData,
      timeRange,
      aggregation
    };
  }

  /**
   * Get usage analytics for the current session
   */
  getCurrentSessionAnalytics(): UsageAnalytics {
    const timeSpent = Date.now() - this.sessionStartTime;
    const pageViews = this.getSessionPageViews();

    return {
      userId: this.getCurrentUserId(),
      sessionId: this.currentSessionId,
      pageViews,
      timeSpent,
      actionsPerformed: this.actionCounter,
      widgetsInteracted: Array.from(this.interactedWidgets),
      mostUsedFeatures: Array.from(this.featureUsage.entries())
        .map(([feature, count]) => ({ feature, count }))
        .sort((a, b) => b.count - a.count),
      timestamp: Date.now()
    };
  }

  /**
   * Get historical analytics for a time range
   */
  getAnalyticsMetrics(timeRange: { start: number; end: number }): AnalyticsMetric[] {
    const metrics: AnalyticsMetric[] = [];
    const now = Date.now();

    // Widget usage metrics
    const widgetInteractions = this.getMetricSum('widget_interactions', timeRange);
    const previousWidgetInteractions = this.getMetricSum('widget_interactions', {
      start: timeRange.start - (timeRange.end - timeRange.start),
      end: timeRange.start
    });

    metrics.push({
      id: 'widget_interactions',
      name: 'Widget Interactions',
      description: 'Total number of widget interactions',
      value: widgetInteractions,
      previousValue: previousWidgetInteractions,
      change: this.calculatePercentageChange(previousWidgetInteractions, widgetInteractions),
      changeType: widgetInteractions > previousWidgetInteractions ? 'increase' : 
                  widgetInteractions < previousWidgetInteractions ? 'decrease' : 'neutral',
      unit: 'interactions',
      timestamp: now
    });

    // Session metrics
    const sessionCount = this.getUniqueSessionCount(timeRange);
    const previousSessionCount = this.getUniqueSessionCount({
      start: timeRange.start - (timeRange.end - timeRange.start),
      end: timeRange.start
    });

    metrics.push({
      id: 'active_sessions',
      name: 'Active Sessions',
      description: 'Number of unique user sessions',
      value: sessionCount,
      previousValue: previousSessionCount,
      change: this.calculatePercentageChange(previousSessionCount, sessionCount),
      changeType: sessionCount > previousSessionCount ? 'increase' : 
                  sessionCount < previousSessionCount ? 'decrease' : 'neutral',
      unit: 'sessions',
      timestamp: now
    });

    // Average session duration
    const avgSessionDuration = this.getAverageSessionDuration(timeRange);
    const previousAvgSessionDuration = this.getAverageSessionDuration({
      start: timeRange.start - (timeRange.end - timeRange.start),
      end: timeRange.start
    });

    metrics.push({
      id: 'avg_session_duration',
      name: 'Average Session Duration',
      description: 'Average time spent per session',
      value: avgSessionDuration,
      previousValue: previousAvgSessionDuration,
      change: this.calculatePercentageChange(previousAvgSessionDuration, avgSessionDuration),
      changeType: avgSessionDuration > previousAvgSessionDuration ? 'increase' : 
                  avgSessionDuration < previousAvgSessionDuration ? 'decrease' : 'neutral',
      unit: 'minutes',
      timestamp: now
    });

    return metrics;
  }

  /**
   * Generate sample historical data for demonstration
   */
  generateSampleData(daysBack: number = 30): void {
    const now = Date.now();
    const startDate = subDays(new Date(now), daysBack);
    
    // Generate daily data points
    const days = eachDayOfInterval({
      start: startDate,
      end: new Date(now)
    });

    days.forEach((day, index) => {
      const dayTimestamp = day.getTime();
      
      // Generate widget interaction data
      const interactions = Math.floor(Math.random() * 50) + 10;
      this.trackDataPoint('widget_interactions', interactions);
      
      // Generate session data
      const sessions = Math.floor(Math.random() * 10) + 2;
      this.trackDataPoint('active_sessions', sessions);
      
      // Generate performance metrics
      const loadTime = Math.random() * 2000 + 500; // 500ms to 2500ms
      this.trackDataPoint('page_load_time', loadTime);
      
      // Generate user satisfaction score
      const satisfaction = Math.random() * 5 + 3; // 3 to 8 out of 10
      this.trackDataPoint('user_satisfaction', satisfaction);
      
      // Generate hourly data for recent days
      if (index >= daysBack - 7) {
        const hours = eachHourOfInterval({
          start: startOfDay(day),
          end: endOfDay(day)
        });
        
        hours.forEach(hour => {
          const hourTimestamp = hour.getTime();
          const hourlyInteractions = Math.floor(Math.random() * 5) + 1;
          this.trackDataPoint('hourly_interactions', hourlyInteractions);
        });
      }
    });
  }

  /**
   * Clean up old data to prevent storage bloat
   */
  cleanupOldData(retentionDays: number = 90): void {
    const cutoffDate = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    
    // Clean history entries
    const history = this.getStoredHistory();
    const filteredHistory = history.filter(entry => entry.timestamp > cutoffDate);
    this.saveHistory(filteredHistory);
    
    // Clean time series data
    const timeSeriesKeys = this.getTimeSeriesKeys();
    timeSeriesKeys.forEach(key => {
      const timeSeries = this.getStoredTimeSeries(key);
      if (timeSeries) {
        const filteredSeries = timeSeries.filter(point => point.timestamp > cutoffDate);
        this.saveTimeSeries(key, filteredSeries);
      }
    });
  }

  // Private helper methods

  private appendToTimeSeries(metric: string, dataPoint: DataPoint): void {
    let timeSeries = this.getStoredTimeSeries(metric) || [];
    timeSeries.push(dataPoint);
    
    // Keep only the most recent points to prevent storage bloat
    if (timeSeries.length > this.MAX_TIME_SERIES_POINTS) {
      timeSeries = timeSeries.slice(-this.MAX_TIME_SERIES_POINTS);
    }
    
    this.saveTimeSeries(metric, timeSeries);
  }

  private recordHistoryEntry(entry: HistoryEntry): void {
    let history = this.getStoredHistory();
    history.push(entry);
    
    // Keep only the most recent entries
    if (history.length > this.MAX_HISTORY_ENTRIES) {
      history = history.slice(-this.MAX_HISTORY_ENTRIES);
    }
    
    this.saveHistory(history);
  }

  private updateSessionAnalytics(action: string, entityId?: string): void {
    this.actionCounter++;
    
    // Track feature usage
    const currentCount = this.featureUsage.get(action) || 0;
    this.featureUsage.set(action, currentCount + 1);
    
    // Save current session analytics
    const analytics = this.getCurrentSessionAnalytics();
    this.saveSessionAnalytics(analytics);
  }

  private calculateDataChange(oldData: any, newData: any): any {
    if (typeof oldData === 'number' && typeof newData === 'number') {
      return {
        absolute: newData - oldData,
        percentage: oldData !== 0 ? ((newData - oldData) / oldData) * 100 : 0
      };
    }
    return { changed: JSON.stringify(oldData) !== JSON.stringify(newData) };
  }

  private aggregateData(data: DataPoint[], aggregation: string): DataPoint[] {
    if (data.length === 0) return [];
    
    const aggregatedData = new Map<string, { values: number[], timestamp: number, count: number }>();
    
    data.forEach(point => {
      let key: string;
      const date = new Date(point.timestamp);
      
      switch (aggregation) {
        case 'hour':
          key = format(date, 'yyyy-MM-dd-HH');
          break;
        case 'day':
          key = format(date, 'yyyy-MM-dd');
          break;
        case 'week':
          key = format(date, 'yyyy-ww');
          break;
        case 'month':
          key = format(date, 'yyyy-MM');
          break;
        default:
          key = format(date, 'yyyy-MM-dd');
      }
      
      const existing = aggregatedData.get(key) || { values: [], timestamp: point.timestamp, count: 0 };
      
      if (typeof point.value === 'number') {
        existing.values.push(point.value);
      }
      existing.count++;
      
      aggregatedData.set(key, existing);
    });
    
    return Array.from(aggregatedData.entries()).map(([key, data]) => ({
      id: `agg_${key}`,
      timestamp: data.timestamp,
      value: data.values.length > 0 ? data.values.reduce((a, b) => a + b, 0) / data.values.length : data.count,
      metadata: { aggregation, originalCount: data.count }
    }));
  }

  private getMetricSum(metric: string, timeRange: { start: number; end: number }): number {
    const timeSeries = this.getTimeSeriesData(metric, timeRange);
    return timeSeries.data.reduce((sum, point) => {
      return sum + (typeof point.value === 'number' ? point.value : 0);
    }, 0);
  }

  private getUniqueSessionCount(timeRange: { start: number; end: number }): number {
    const history = this.getStoredHistory();
    const sessions = new Set<string>();
    
    history
      .filter(entry => entry.timestamp >= timeRange.start && entry.timestamp <= timeRange.end)
      .forEach(entry => {
        if (entry.metadata?.sessionId) {
          sessions.add(entry.metadata.sessionId);
        }
      });
      
    return sessions.size;
  }

  private getAverageSessionDuration(timeRange: { start: number; end: number }): number {
    const analyticsData = this.getStoredUsageAnalytics();
    const relevantSessions = analyticsData.filter(
      analytics => analytics.timestamp >= timeRange.start && analytics.timestamp <= timeRange.end
    );
    
    if (relevantSessions.length === 0) return 0;
    
    const totalDuration = relevantSessions.reduce((sum, session) => sum + session.timeSpent, 0);
    return Math.round(totalDuration / relevantSessions.length / 60000); // Convert to minutes
  }

  private calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  private getSessionPageViews(): number {
    // This would typically track page view events
    return Math.floor(Math.random() * 10) + 1;
  }

  private getCurrentUserId(): string {
    // This would get the current user ID from auth store
    return 'user_demo';
  }

  // Storage methods
  private getStoredTimeSeries(metric: string): DataPoint[] | null {
    try {
      const stored = localStorage.getItem(`${HistoryStorageKeys.HISTORY_DATA}_${metric}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveTimeSeries(metric: string, data: DataPoint[]): void {
    try {
      localStorage.setItem(`${HistoryStorageKeys.HISTORY_DATA}_${metric}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save time series data:', error);
    }
  }

  private getStoredHistory(): HistoryEntry[] {
    try {
      const stored = localStorage.getItem(HistoryStorageKeys.HISTORY_DATA);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveHistory(history: HistoryEntry[]): void {
    try {
      localStorage.setItem(HistoryStorageKeys.HISTORY_DATA, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save history data:', error);
    }
  }

  private getStoredUsageAnalytics(): UsageAnalytics[] {
    try {
      const stored = localStorage.getItem(HistoryStorageKeys.USAGE_ANALYTICS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveSessionAnalytics(analytics: UsageAnalytics): void {
    try {
      let allAnalytics = this.getStoredUsageAnalytics();
      
      // Update or add current session analytics
      const existingIndex = allAnalytics.findIndex(a => a.sessionId === analytics.sessionId);
      if (existingIndex >= 0) {
        allAnalytics[existingIndex] = analytics;
      } else {
        allAnalytics.push(analytics);
      }
      
      localStorage.setItem(HistoryStorageKeys.USAGE_ANALYTICS, JSON.stringify(allAnalytics));
    } catch (error) {
      console.warn('Failed to save session analytics:', error);
    }
  }

  private getTimeSeriesKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(HistoryStorageKeys.HISTORY_DATA + '_')) {
        keys.push(key.replace(HistoryStorageKeys.HISTORY_DATA + '_', ''));
      }
    }
    return keys;
  }
}

// Singleton instance
export const dataTrackingService = new DataTrackingService();