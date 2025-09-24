// Client Portal Types - Complete system for white-label client dashboards

export interface ClientPortal {
  id: string;
  agency_id: string;
  client_id: string;
  
  // Portal Configuration
  subdomain?: string; // e.g., 'client-name' for client-name.youragency.com
  custom_domain?: string; // e.g., 'reports.clientdomain.com'
  is_active: boolean;
  
  // Branding & Customization
  branding: PortalBranding;
  theme: PortalTheme;
  
  // Access & Security
  access_settings: PortalAccessSettings;
  
  // Dashboard Configuration
  dashboard_config: PortalDashboardConfig;
  
  // Communication
  communication_settings: PortalCommunicationSettings;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  last_accessed?: string;
}

export interface PortalBranding {
  // Logo & Visual Identity
  logo_url?: string;
  logo_dark_url?: string; // For dark mode
  favicon_url?: string;
  
  // Company Info
  company_name: string;
  company_tagline?: string;
  company_description?: string;
  
  // Contact Info
  support_email?: string;
  support_phone?: string;
  support_hours?: string;
  
  // Social Links
  website_url?: string;
  social_links: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  
  // Footer
  footer_text?: string;
  copyright_text?: string;
}

export interface PortalTheme {
  // Color Scheme
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  
  // Background
  background_type: 'solid' | 'gradient' | 'image';
  background_value: string; // Color, gradient, or image URL
  
  // Typography
  font_family: 'inter' | 'roboto' | 'poppins' | 'custom';
  custom_font_url?: string;
  
  // Layout
  layout_style: 'modern' | 'classic' | 'minimal' | 'corporate';
  sidebar_style: 'dark' | 'light' | 'colored';
  
  // Custom CSS
  custom_css?: string;
}

export interface PortalAccessSettings {
  // Authentication
  auth_method: 'email_link' | 'password' | 'sso';
  require_2fa: boolean;
  
  // Session Management
  session_timeout: number; // in minutes
  max_concurrent_sessions: number;
  
  // IP Restrictions
  allowed_ips?: string[];
  blocked_ips?: string[];
  
  // Time Restrictions
  access_hours?: {
    start: string; // HH:MM
    end: string;   // HH:MM
    timezone: string;
    days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  };
  
  // Download Restrictions
  allow_downloads: boolean;
  download_limit_mb?: number;
  watermark_downloads: boolean;
}

export interface PortalDashboardConfig {
  // Available Widgets
  enabled_widgets: PortalWidgetType[];
  widget_settings: Record<string, PortalWidgetConfig>;
  
  // Layout
  default_layout: PortalLayoutConfig;
  allow_customization: boolean;
  
  // Data Settings
  data_refresh_interval: number; // in minutes
  historical_data_range: number; // in days
  
  // Export Settings
  available_exports: ('pdf' | 'csv' | 'excel' | 'json')[];
  auto_report_schedule?: PortalReportSchedule;
}

export interface PortalCommunicationSettings {
  // Notifications
  email_notifications: boolean;
  notification_frequency: 'real_time' | 'daily' | 'weekly' | 'monthly';
  
  // Messaging
  enable_chat: boolean;
  chat_greeting?: string;
  
  // Updates
  show_announcements: boolean;
  show_changelog: boolean;
  
  // Support
  support_widget_enabled: boolean;
  support_widget_position: 'bottom_right' | 'bottom_left';
}

// Widget Types Available in Client Portals
export type PortalWidgetType = 
  | 'overview_stats'
  | 'seo_rankings'
  | 'seo_audit'
  | 'website_traffic'
  | 'keyword_performance'
  | 'backlink_growth'
  | 'social_media_metrics'
  | 'content_performance'
  | 'competitor_analysis'
  | 'goals_progress'
  | 'recent_activities'
  | 'upcoming_tasks'
  | 'custom_kpis';

export interface PortalWidgetConfig {
  title: string;
  description?: string;
  is_visible: boolean;
  position: { x: number; y: number; width: number; height: number };
  refresh_rate: number; // in minutes
  chart_type?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  data_filters?: Record<string, any>;
  custom_settings?: Record<string, any>;
}

export interface PortalLayoutConfig {
  grid_size: { columns: number; rows: number };
  widget_positions: Record<string, { x: number; y: number; width: number; height: number }>;
  sidebar_collapsed: boolean;
}

export interface PortalReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  time: string; // HH:MM
  timezone: string;
  recipients: string[];
  format: 'pdf' | 'email_html';
  include_widgets: PortalWidgetType[];
}

// Client Portal Users - People who access the client portal
export interface ClientPortalUser {
  id: string;
  client_portal_id: string;
  client_id: string;
  
  // User Info
  email: string;
  full_name: string;
  role: ClientPortalRole;
  title?: string;
  
  // Authentication
  password_hash?: string; // Only if using password auth
  last_login?: string;
  login_token?: string; // For email link auth
  token_expires_at?: string;
  
  // Preferences
  preferences: ClientPortalUserPreferences;
  
  // Status
  status: 'active' | 'inactive' | 'pending';
  
  // Metadata
  created_at: string;
  updated_at: string;
  invited_by: string;
}

export type ClientPortalRole = 'owner' | 'manager' | 'viewer';

export interface ClientPortalUserPreferences {
  // Dashboard
  dashboard_layout?: PortalLayoutConfig;
  default_date_range: number; // in days
  
  // Notifications
  email_notifications: boolean;
  notification_types: ('performance_alerts' | 'reports' | 'updates' | 'announcements')[];
  
  // Display
  theme_preference: 'light' | 'dark' | 'system';
  timezone: string;
  date_format: 'US' | 'EU' | 'ISO';
  
  // Data
  preferred_metrics: string[];
  favorite_widgets: PortalWidgetType[];
}

// Portal Activity Logs
export interface ClientPortalActivity {
  id: string;
  client_portal_id: string;
  user_id?: string; // null for system activities
  
  // Activity Details
  activity_type: PortalActivityType;
  activity_description: string;
  metadata: Record<string, any>;
  
  // Context
  ip_address?: string;
  user_agent?: string;
  
  // Timestamp
  created_at: string;
}

export type PortalActivityType = 
  | 'login'
  | 'logout'
  | 'view_dashboard'
  | 'view_widget'
  | 'download_report'
  | 'change_settings'
  | 'send_message'
  | 'data_refresh'
  | 'error'
  | 'security_alert';

// Shared Reports & Assets
export interface ClientPortalAsset {
  id: string;
  client_portal_id: string;
  
  // Asset Details
  name: string;
  type: 'report' | 'document' | 'image' | 'video' | 'custom';
  file_url: string;
  file_size: number; // in bytes
  mime_type: string;
  
  // Metadata
  description?: string;
  tags: string[];
  category?: string;
  
  // Access Control
  is_public: boolean;
  password_protected: boolean;
  password_hash?: string;
  expires_at?: string;
  download_count: number;
  max_downloads?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  uploaded_by: string;
}

// Client Portal Analytics
export interface ClientPortalAnalytics {
  id: string;
  client_portal_id: string;
  date: string; // YYYY-MM-DD
  
  // Usage Metrics
  unique_visitors: number;
  total_sessions: number;
  total_page_views: number;
  average_session_duration: number; // in seconds
  bounce_rate: number; // percentage
  
  // Popular Content
  most_viewed_widgets: { widget_type: PortalWidgetType; views: number }[];
  most_downloaded_assets: { asset_id: string; downloads: number }[];
  
  // User Behavior
  peak_usage_hours: number[]; // array of hours (0-23)
  device_breakdown: { desktop: number; mobile: number; tablet: number };
  
  // Performance
  average_load_time: number; // in milliseconds
  error_count: number;
}

// Portal Templates - Predefined configurations
export interface ClientPortalTemplate {
  id: string;
  name: string;
  description: string;
  category: 'seo' | 'social_media' | 'ppc' | 'general' | 'custom';
  
  // Template Configuration
  theme: PortalTheme;
  dashboard_config: PortalDashboardConfig;
  branding_template: Partial<PortalBranding>;
  
  // Metadata
  is_public: boolean;
  created_by: string;
  usage_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

// White Label Settings for Agency
export interface AgencyWhiteLabelSettings {
  id: string;
  agency_id: string;
  
  // Domain Settings
  base_domain: string; // e.g., 'reports.youragency.com'
  custom_domains: string[]; // Additional domains
  ssl_enabled: boolean;
  
  // Default Branding
  default_branding: PortalBranding;
  default_theme: PortalTheme;
  
  // Portal Settings
  allow_custom_domains: boolean;
  require_ssl: boolean;
  enable_subdomains: boolean;
  
  // Features
  available_widgets: PortalWidgetType[];
  max_users_per_portal: number;
  storage_limit_mb: number;
  
  // Customization
  custom_css_allowed: boolean;
  custom_js_allowed: boolean;
  white_label_completely: boolean; // Hide all "Powered by" references
  
  // Security
  enforce_2fa: boolean;
  session_timeout: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ClientPortalListResponse {
  portals: ClientPortal[];
  total: number;
  page: number;
  limit: number;
}

export interface ClientPortalAuthResponse {
  success: boolean;
  user?: ClientPortalUser;
  portal?: ClientPortal;
  token?: string;
  error?: string;
}

export interface ClientPortalDashboardData {
  portal: ClientPortal;
  widgets: PortalWidgetData[];
  recent_activities: ClientPortalActivity[];
  analytics_summary: {
    total_visits: number;
    unique_visitors: number;
    average_session_duration: number;
    most_viewed_widget: string;
  };
}

export interface PortalWidgetData {
  widget_type: PortalWidgetType;
  config: PortalWidgetConfig;
  data: any; // Widget-specific data structure
  last_updated: string;
  error?: string;
}