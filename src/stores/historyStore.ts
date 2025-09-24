import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  TimeSeriesData, 
  HistoryEntry, 
  AnalyticsMetric, 
  UsageAnalytics, 
  ReportConfig,
  GeneratedReport,
  Alert,
  KPIDefinition,
  DataExportOptions,
  HistoryStorageKeys
} from '../types';
import { dataTrackingService } from '../services/dataTracking';
import { dataExportService } from '../services/dataExport';
import { subDays, subWeeks, subMonths } from 'date-fns';

interface HistoryState {
  // Data state
  timeSeriesData: Record<string, TimeSeriesData>;
  analyticsMetrics: AnalyticsMetric[];
  usageAnalytics: UsageAnalytics[];
  historyEntries: HistoryEntry[];
  
  // Reports
  reportConfigs: ReportConfig[];
  generatedReports: GeneratedReport[];
  
  // Alerts and KPIs
  alerts: Alert[];
  kpiDefinitions: KPIDefinition[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  selectedDateRange: { start: number; end: number };
  selectedMetrics: string[];
  
  // Actions
  loadHistoryData: (timeRange: { start: number; end: number }) => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  
  // Time series actions
  getTimeSeriesData: (metric: string, timeRange?: { start: number; end: number }) => TimeSeriesData | null;
  updateTimeSeriesData: (metric: string, data: TimeSeriesData) => void;
  
  // Analytics actions
  getAnalyticsMetrics: (timeRange?: { start: number; end: number }) => AnalyticsMetric[];
  addAnalyticsMetric: (metric: AnalyticsMetric) => void;
  
  // Usage analytics
  getCurrentSessionAnalytics: () => UsageAnalytics;
  addUsageAnalytics: (analytics: UsageAnalytics) => void;
  
  // Export actions
  exportData: (options: DataExportOptions) => Promise<void>;
  
  // Report actions
  createReportConfig: (config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReportConfig: (id: string, updates: Partial<ReportConfig>) => void;
  deleteReportConfig: (id: string) => void;
  generateReport: (configId: string) => Promise<GeneratedReport>;
  
  // Alert actions
  createAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  deleteAlert: (id: string) => void;
  checkAlerts: () => void;
  
  // KPI actions
  createKPI: (kpi: Omit<KPIDefinition, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateKPI: (id: string, updates: Partial<KPIDefinition>) => void;
  deleteKPI: (id: string) => void;
  calculateKPIs: () => Record<string, number>;
  
  // Utility actions
  setDateRange: (start: number, end: number) => void;
  setQuickDateRange: (range: '7d' | '30d' | '90d' | '1y') => void;
  setSelectedMetrics: (metrics: string[]) => void;
  clearError: () => void;
  generateSampleData: () => void;
  cleanupOldData: (retentionDays?: number) => void;

  // New comprehensive tracking methods
  trackAutomationEvent: (event: { workflowId: string; action: string; status: string; metadata?: any }) => void;
  trackClientActivity: (event: { clientId: string; action: string; metadata?: any }) => void;
  trackAIGeneration: (event: { type: string; count: number; metadata?: any }) => void;
  trackUserAction: (event: { action: string; section: string; metadata?: any }) => void;
  trackNoteActivity: (event: { noteId: string; action: string; metadata?: any }) => void;
  getComprehensiveMetrics: () => Record<string, any>;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      // Initial state
      timeSeriesData: {},
      analyticsMetrics: [],
      usageAnalytics: [],
      historyEntries: [],
      reportConfigs: [],
      generatedReports: [],
      alerts: [],
      kpiDefinitions: [],
      isLoading: false,
      error: null,
      selectedDateRange: {
        start: subDays(new Date(), 30).getTime(),
        end: new Date().getTime()
      },
      selectedMetrics: ['widget_interactions', 'active_sessions'],

      // Load history data
      loadHistoryData: async (timeRange) => {
        set({ isLoading: true, error: null });
        
        try {
          // Load time series data for selected metrics
          const timeSeriesData: Record<string, TimeSeriesData> = {};
          const selectedMetrics = get().selectedMetrics;
          
          for (const metric of selectedMetrics) {
            const data = dataTrackingService.getTimeSeriesData(metric, timeRange, 'day');
            timeSeriesData[metric] = data;
          }
          
          // Load analytics metrics
          const analyticsMetrics = dataTrackingService.getAnalyticsMetrics(timeRange);
          
          // Load usage analytics (current session)
          const currentSession = dataTrackingService.getCurrentSessionAnalytics();
          
          set({
            timeSeriesData,
            analyticsMetrics,
            usageAnalytics: [currentSession],
            selectedDateRange: timeRange,
            isLoading: false
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load history data',
            isLoading: false 
          });
        }
      },

      // Refresh analytics
      refreshAnalytics: async () => {
        const { selectedDateRange } = get();
        await get().loadHistoryData(selectedDateRange);
      },

      // Time series actions
      getTimeSeriesData: (metric, timeRange) => {
        const data = get().timeSeriesData[metric];
        if (!data || !timeRange) return data || null;
        
        // Filter data by time range if provided
        const filteredData = {
          ...data,
          data: data.data.filter(
            point => point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
          )
        };
        
        return filteredData;
      },

      updateTimeSeriesData: (metric, data) => {
        set(state => ({
          timeSeriesData: {
            ...state.timeSeriesData,
            [metric]: data
          }
        }));
      },

      // Analytics actions
      getAnalyticsMetrics: (timeRange) => {
        const metrics = get().analyticsMetrics;
        if (!timeRange) return metrics;
        
        return metrics.filter(
          metric => metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
        );
      },

      addAnalyticsMetric: (metric) => {
        set(state => ({
          analyticsMetrics: [...state.analyticsMetrics, metric]
        }));
      },

      // Usage analytics
      getCurrentSessionAnalytics: () => {
        return dataTrackingService.getCurrentSessionAnalytics();
      },

      addUsageAnalytics: (analytics) => {
        set(state => ({
          usageAnalytics: [...state.usageAnalytics, analytics]
        }));
      },

      // Export actions
      exportData: async (options) => {
        set({ isLoading: true, error: null });
        
        try {
          await dataExportService.exportData(options);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Export failed',
            isLoading: false 
          });
        }
      },

      // Report actions
      createReportConfig: (config) => {
        const newConfig: ReportConfig = {
          ...config,
          id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        set(state => ({
          reportConfigs: [...state.reportConfigs, newConfig]
        }));
      },

      updateReportConfig: (id, updates) => {
        set(state => ({
          reportConfigs: state.reportConfigs.map(config =>
            config.id === id 
              ? { ...config, ...updates, updatedAt: Date.now() }
              : config
          )
        }));
      },

      deleteReportConfig: (id) => {
        set(state => ({
          reportConfigs: state.reportConfigs.filter(config => config.id !== id)
        }));
      },

      generateReport: async (configId) => {
        set({ isLoading: true, error: null });
        
        try {
          const config = get().reportConfigs.find(c => c.id === configId);
          if (!config) {
            throw new Error('Report configuration not found');
          }
          
          // Gather data based on config filters
          const data = await get().loadHistoryData(
            config.filters.dateRange || get().selectedDateRange
          );
          
          const report = await dataExportService.generateReport(configId, data, config.format);
          
          set(state => ({
            generatedReports: [...state.generatedReports, report],
            isLoading: false
          }));
          
          // Update last generated timestamp
          get().updateReportConfig(configId, { lastGenerated: Date.now() });
          
          return report;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Report generation failed',
            isLoading: false 
          });
          throw error;
        }
      },

      // Alert actions
      createAlert: (alert) => {
        const newAlert: Alert = {
          ...alert,
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        set(state => ({
          alerts: [...state.alerts, newAlert]
        }));
      },

      updateAlert: (id, updates) => {
        set(state => ({
          alerts: state.alerts.map(alert =>
            alert.id === id 
              ? { ...alert, ...updates, updatedAt: Date.now() }
              : alert
          )
        }));
      },

      deleteAlert: (id) => {
        set(state => ({
          alerts: state.alerts.filter(alert => alert.id !== id)
        }));
      },

      checkAlerts: () => {
        const { alerts, analyticsMetrics } = get();
        const activeAlerts = alerts.filter(alert => alert.isActive);
        
        activeAlerts.forEach(alert => {
          const metric = analyticsMetrics.find(m => m.id === alert.metric);
          if (!metric) return;
          
          const shouldTrigger = this.evaluateAlertCondition(metric, alert.condition);
          
          if (shouldTrigger) {
            // Trigger alert (would send notifications in real implementation)
            console.log(`Alert triggered: ${alert.name}`);
            get().updateAlert(alert.id, { lastTriggered: Date.now() });
          }
        });
      },

      // KPI actions
      createKPI: (kpi) => {
        const newKPI: KPIDefinition = {
          ...kpi,
          id: `kpi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        set(state => ({
          kpiDefinitions: [...state.kpiDefinitions, newKPI]
        }));
      },

      updateKPI: (id, updates) => {
        set(state => ({
          kpiDefinitions: state.kpiDefinitions.map(kpi =>
            kpi.id === id 
              ? { ...kpi, ...updates, updatedAt: Date.now() }
              : kpi
          )
        }));
      },

      deleteKPI: (id) => {
        set(state => ({
          kpiDefinitions: state.kpiDefinitions.filter(kpi => kpi.id !== id)
        }));
      },

      calculateKPIs: () => {
        const { kpiDefinitions, analyticsMetrics } = get();
        const kpiValues: Record<string, number> = {};
        
        kpiDefinitions.filter(kpi => kpi.isActive).forEach(kpi => {
          try {
            // Simple formula evaluation (in production, use a proper expression parser)
            const value = this.evaluateKPIFormula(kpi.formula, analyticsMetrics);
            kpiValues[kpi.id] = value;
          } catch (error) {
            console.warn(`Failed to calculate KPI ${kpi.name}:`, error);
            kpiValues[kpi.id] = 0;
          }
        });
        
        return kpiValues;
      },

      // Utility actions
      setDateRange: (start, end) => {
        set({ selectedDateRange: { start, end } });
      },

      setQuickDateRange: (range) => {
        const end = new Date().getTime();
        let start: number;
        
        switch (range) {
          case '7d':
            start = subDays(new Date(), 7).getTime();
            break;
          case '30d':
            start = subDays(new Date(), 30).getTime();
            break;
          case '90d':
            start = subDays(new Date(), 90).getTime();
            break;
          case '1y':
            start = subDays(new Date(), 365).getTime();
            break;
          default:
            start = subDays(new Date(), 30).getTime();
        }
        
        set({ selectedDateRange: { start, end } });
      },

      setSelectedMetrics: (metrics) => {
        set({ selectedMetrics: metrics });
      },

      clearError: () => {
        set({ error: null });
      },

      generateSampleData: () => {
        dataTrackingService.generateSampleData(30);
        get().refreshAnalytics();
      },

      cleanupOldData: (retentionDays = 90) => {
        dataTrackingService.cleanupOldData(retentionDays);
        get().refreshAnalytics();
      },

      // New comprehensive tracking methods
      trackAutomationEvent: (event) => {
        const historyEntry: HistoryEntry = {
          id: `automation-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          type: 'automation',
          action: event.action,
          data: {
            workflowId: event.workflowId,
            status: event.status,
            ...event.metadata
          },
          userId: 'current-user',
          sessionId: dataTrackingService.getSessionId()
        };

        set(state => ({
          historyEntries: [historyEntry, ...state.historyEntries]
        }));

        // Track as user action
        dataTrackingService.trackUserAction(event.action, 'automation', event.metadata);
      },

      trackClientActivity: (event) => {
        const historyEntry: HistoryEntry = {
          id: `client-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          type: 'client_activity',
          action: event.action,
          data: {
            clientId: event.clientId,
            ...event.metadata
          },
          userId: 'current-user',
          sessionId: dataTrackingService.getSessionId()
        };

        set(state => ({
          historyEntries: [historyEntry, ...state.historyEntries]
        }));

        dataTrackingService.trackUserAction(event.action, 'client', event.metadata);
      },

      trackAIGeneration: (event) => {
        const historyEntry: HistoryEntry = {
          id: `ai-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          type: 'ai_generation',
          action: 'generate_content',
          data: {
            contentType: event.type,
            count: event.count,
            ...event.metadata
          },
          userId: 'current-user',
          sessionId: dataTrackingService.getSessionId()
        };

        set(state => ({
          historyEntries: [historyEntry, ...state.historyEntries]
        }));

        dataTrackingService.trackUserAction('ai_generation', 'ai', {
          type: event.type,
          count: event.count,
          ...event.metadata
        });
      },

      trackUserAction: (event) => {
        const historyEntry: HistoryEntry = {
          id: `user-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          type: 'user_action',
          action: event.action,
          data: {
            section: event.section,
            ...event.metadata
          },
          userId: 'current-user',
          sessionId: dataTrackingService.getSessionId()
        };

        set(state => ({
          historyEntries: [historyEntry, ...state.historyEntries]
        }));

        dataTrackingService.trackUserAction(event.action, event.section, event.metadata);
      },

      trackNoteActivity: (event) => {
        const historyEntry: HistoryEntry = {
          id: `note-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          type: 'note_activity',
          action: event.action,
          data: {
            noteId: event.noteId,
            ...event.metadata
          },
          userId: 'current-user',
          sessionId: dataTrackingService.getSessionId()
        };

        set(state => ({
          historyEntries: [historyEntry, ...state.historyEntries]
        }));

        dataTrackingService.trackUserAction(event.action, 'notes', event.metadata);
      },

      getComprehensiveMetrics: () => {
        const state = get();
        const now = Date.now();
        const dayAgo = now - 86400000;
        const weekAgo = now - 604800000;

        const recentEntries = state.historyEntries.filter(entry => entry.timestamp > weekAgo);
        const todayEntries = state.historyEntries.filter(entry => entry.timestamp > dayAgo);

        return {
          totalActivities: recentEntries.length,
          todayActivities: todayEntries.length,
          automationEvents: recentEntries.filter(e => e.type === 'automation').length,
          aiGenerations: recentEntries.filter(e => e.type === 'ai_generation').length,
          clientActivities: recentEntries.filter(e => e.type === 'client_activity').length,
          noteActivities: recentEntries.filter(e => e.type === 'note_activity').length,
          userActions: recentEntries.filter(e => e.type === 'user_action').length,
          activityTrend: todayEntries.length > 0 ? 'increasing' : 'stable',
          mostActiveSection: (() => {
            const sections: Record<string, number> = {};
            recentEntries.forEach(entry => {
              const section = entry.data.section || entry.type;
              sections[section] = (sections[section] || 0) + 1;
            });
            return Object.keys(sections).reduce((a, b) =>
              sections[a] > sections[b] ? a : b, 'dashboard'
            );
          })()
        };
      }
    }),
    {
      name: HistoryStorageKeys.ANALYTICS_CACHE,
      partialize: (state) => ({
        reportConfigs: state.reportConfigs,
        alerts: state.alerts,
        kpiDefinitions: state.kpiDefinitions,
        selectedDateRange: state.selectedDateRange,
        selectedMetrics: state.selectedMetrics
      }),
    }
  )
);

// Helper functions (would be moved to utils in production)
function evaluateAlertCondition(metric: AnalyticsMetric, condition: Alert['condition']): boolean {
  switch (condition.operator) {
    case 'gt':
      return metric.value > condition.value;
    case 'lt':
      return metric.value < condition.value;
    case 'eq':
      return metric.value === condition.value;
    case 'gte':
      return metric.value >= condition.value;
    case 'lte':
      return metric.value <= condition.value;
    case 'change_percent':
      return Math.abs(metric.change || 0) > condition.value;
    default:
      return false;
  }
}

function evaluateKPIFormula(formula: string, metrics: AnalyticsMetric[]): number {
  // Safe mathematical expression evaluator
  // Replace metric names with values
  let expression = formula;
  metrics.forEach(metric => {
    const regex = new RegExp(metric.id, 'g');
    expression = expression.replace(regex, metric.value.toString());
  });
  
  // Basic safety check - only allow numbers and basic operators
  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    throw new Error('Invalid formula');
  }
  
  // Safe mathematical expression evaluation using Function constructor
  try {
    return new Function(`"use strict"; return (${expression})`)();
  } catch (error) {
    throw new Error('Formula evaluation failed');
  }
}