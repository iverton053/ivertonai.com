import { z } from 'zod';

// Base types
export type ID = string;
export type Timestamp = number;

// Position and Size
export const PositionSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
});

export const SizeSchema = z.object({
  width: z.number().min(100),
  height: z.number().min(100),
});

export type Position = z.infer<typeof PositionSchema>;
export type Size = z.infer<typeof SizeSchema>;

// Widget Types
export const WidgetTypeSchema = z.enum([
  'stats',
  'automation',
  'chart',
  'list',
  'text',
  'image',
  'custom'
]);

export type WidgetType = z.infer<typeof WidgetTypeSchema>;

// Widget Data
export const StatsWidgetDataSchema = z.object({
  title: z.string(),
  value: z.union([z.string(), z.number()]),
  change: z.number(),
  icon: z.string(),
  unit: z.string().optional(),
  trend: z.enum(['up', 'down', 'neutral']).optional(),
});

export const AutomationWidgetDataSchema = z.object({
  name: z.string(),
  status: z.enum(['running', 'completed', 'paused', 'scheduled', 'failed']),
  progress: z.number().min(0).max(100),
  lastRun: z.string(),
  nextRun: z.string().optional(),
  duration: z.number().optional(),
});

export const ChartWidgetDataSchema = z.object({
  type: z.enum(['line', 'bar', 'pie', 'area']),
  data: z.array(z.object({
    label: z.string(),
    value: z.number(),
    color: z.string().optional(),
  })),
  timeRange: z.string().optional(),
});

export type StatsWidgetData = z.infer<typeof StatsWidgetDataSchema>;
export type AutomationWidgetData = z.infer<typeof AutomationWidgetDataSchema>;
export type ChartWidgetData = z.infer<typeof ChartWidgetDataSchema>;

// Widget Configuration
export const WidgetConfigSchema = z.object({
  id: z.string(),
  type: WidgetTypeSchema,
  title: z.string(),
  position: PositionSchema,
  size: SizeSchema,
  isPinned: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  settings: z.record(z.string(), z.any()).optional(),
  data: z.union([
    StatsWidgetDataSchema,
    AutomationWidgetDataSchema,
    ChartWidgetDataSchema,
    z.record(z.string(), z.any())
  ]),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;

// Dashboard Layout
export const DashboardLayoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  widgets: z.array(WidgetConfigSchema),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('dark'),
    columns: z.number().min(1).max(12).default(12),
    snapToGrid: z.boolean().default(true),
    gridSize: z.number().min(10).max(50).default(20),
    autoSave: z.boolean().default(true),
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type DashboardLayout = z.infer<typeof DashboardLayoutSchema>;

// User Data
export const UserDataSchema = z.object({
  id: z.string(),
  username: z.string(),
  client_name: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('dark'),
    language: z.string().default('en'),
    timezone: z.string().default('UTC'),
    notifications: z.boolean().default(true),
    autoSave: z.boolean().default(true),
  }).default({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    notifications: true,
    autoSave: true,
  }),
  metrics: z.object({
    active_automations: z.number().default(0),
    success_rate: z.number().min(0).max(100).default(0),
    completed_today: z.number().default(0),
    time_saved: z.number().default(0),
  }).default({
    active_automations: 0,
    success_rate: 0,
    completed_today: 0,
    time_saved: 0,
  }),
  available_categories: z.array(z.string()).default([]),
  widgets: z.array(z.string()).default([]),
  lastLogin: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type UserData = z.infer<typeof UserDataSchema>;

// App State
export const AppStateSchema = z.object({
  isLoading: z.boolean().default(false),
  error: z.string().nullable().default(null),
  activeSection: z.string().default('overview'),
  sidebarCollapsed: z.boolean().default(false),
  commandPaletteOpen: z.boolean().default(false),
  addWidgetModalOpen: z.boolean().default(false),
  notifications: z.array(z.object({
    id: z.string(),
    type: z.enum(['info', 'success', 'warning', 'error']),
    title: z.string(),
    message: z.string(),
    timestamp: z.number(),
    read: z.boolean().default(false),
  })).default([]),
  lastSaved: z.number().optional(),
});

export type AppState = z.infer<typeof AppStateSchema>;

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: number;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  timestamp: number;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastFetch?: number;
}

// Form Validation
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// Storage Keys
export enum StorageKeys {
  USER_DATA = 'iverton_user_data',
  DASHBOARD_LAYOUT = 'iverton_dashboard_layout',
  APP_STATE = 'iverton_app_state',
  WIDGET_CONFIGS = 'iverton_widget_configs',
  USER_PREFERENCES = 'iverton_user_preferences',
  CACHE_PREFIX = 'iverton_cache_',
}

// Events
export interface WidgetEvent {
  type: 'create' | 'update' | 'delete' | 'move' | 'resize';
  widgetId: string;
  data?: Partial<WidgetConfig>;
  timestamp: number;
}

export interface DashboardEvent {
  type: 'layout_change' | 'widget_add' | 'widget_remove' | 'settings_update';
  data?: any;
  timestamp: number;
}

// Migration
export interface Migration {
  version: string;
  description: string;
  up: (data: any) => any;
  down: (data: any) => any;
}

// Cache
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  cleanupInterval: number;
}

// Data History and Analytics Types
export interface DataPoint {
  id: string;
  timestamp: number;
  value: number | string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  metric: string;
  data: DataPoint[];
  timeRange: {
    start: number;
    end: number;
  };
  aggregation?: 'hour' | 'day' | 'week' | 'month';
}

export interface HistoryEntry {
  id: string;
  type: 'widget_data' | 'user_action' | 'system_event';
  entityId: string; // widget ID, user ID, etc.
  data: any;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  description: string;
  value: number;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
  timestamp: number;
}

export interface UsageAnalytics {
  userId: string;
  sessionId: string;
  pageViews: number;
  timeSpent: number; // in milliseconds
  actionsPerformed: number;
  widgetsInteracted: string[];
  mostUsedFeatures: Array<{
    feature: string;
    count: number;
  }>;
  timestamp: number;
}

export interface ReportConfig {
  id: string;
  name: string;
  description?: string;
  type: 'scheduled' | 'on_demand';
  format: 'pdf' | 'csv' | 'json' | 'html';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    timezone: string;
  };
  filters: {
    dateRange?: {
      start: number;
      end: number;
    };
    metrics?: string[];
    widgets?: string[];
  };
  recipients?: string[]; // email addresses
  createdAt: number;
  updatedAt: number;
  lastGenerated?: number;
}

export interface GeneratedReport {
  id: string;
  configId: string;
  name: string;
  format: string;
  filePath: string;
  size: number; // in bytes
  generatedAt: number;
  downloadCount: number;
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  name: string;
  description?: string;
  metric: string;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'change_percent';
    value: number;
  };
  isActive: boolean;
  lastTriggered?: number;
  notificationMethods: Array<'browser' | 'email'>;
  createdAt: number;
  updatedAt: number;
}

export interface KPIDefinition {
  id: string;
  name: string;
  description: string;
  formula: string; // mathematical expression
  targetValue?: number;
  unit?: string;
  category: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CorrelationAnalysis {
  id: string;
  metricA: string;
  metricB: string;
  correlation: number; // -1 to 1
  confidence: number; // 0 to 1
  dataPoints: number;
  timeRange: {
    start: number;
    end: number;
  };
  calculatedAt: number;
}

export interface PredictiveInsight {
  id: string;
  metric: string;
  prediction: {
    value: number;
    confidence: number;
    timeframe: number; // milliseconds into future
  };
  trend: 'upward' | 'downward' | 'stable';
  factors: Array<{
    factor: string;
    impact: number; // -1 to 1
  }>;
  generatedAt: number;
}

export interface DataExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange: {
    start: number;
    end: number;
  };
  metrics?: string[];
  includeCharts?: boolean;
  filename?: string;
}

// Storage Keys for new features
export enum HistoryStorageKeys {
  HISTORY_DATA = 'iverton_history_data',
  ANALYTICS_CACHE = 'iverton_analytics_cache',
  REPORTS = 'iverton_reports',
  ALERTS = 'iverton_alerts',
  KPI_DEFINITIONS = 'iverton_kpi_definitions',
  USAGE_ANALYTICS = 'iverton_usage_analytics',
  CORRELATION_DATA = 'iverton_correlation_data',
  PREDICTIVE_INSIGHTS = 'iverton_predictive_insights',
}

// Re-export client portal types
export * from './clientPortal';
export * from './agency';
export * from './financial';