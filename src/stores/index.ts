// Export all stores
export { useUserStore } from './userStore';
export { useAppStore } from './appStore';
export { useWidgetStore } from './widgetStore';
export { useAuthStore, initializeAuth, cleanupAuth } from './authStore';
export { useHistoryStore } from './historyStore';
export { useSettingsStore } from './settingsStore';
export { useAutomationHubStore, initializeDefaultAutomations } from './automationHubStore';
export { useAgencyStore } from './agencyStore';
export { useClientPortalStore } from './clientPortalStore';
export { useFinancialStore, initializeFinancialStore } from './financialStore';
export { useOverviewStore } from './overviewStore';

// Export store types
export type { 
  UserData, 
  AppState, 
  WidgetConfig, 
  DashboardLayout,
  TimeSeriesData,
  AnalyticsMetric,
  ReportConfig,
  GeneratedReport,
  Alert,
  KPIDefinition
} from '../types';