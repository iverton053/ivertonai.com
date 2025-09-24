// Comprehensive Client Data Model for Multi-Client Dashboard
import { AppNotification } from './notifications';

// Social Media Platforms
export interface SocialMediaAccounts {
  facebook?: {
    url: string;
    access_token?: string;
    page_id?: string;
    enabled: boolean;
  };
  instagram?: {
    url: string;
    access_token?: string;
    account_id?: string;
    enabled: boolean;
  };
  twitter?: {
    url: string;
    access_token?: string;
    account_id?: string;
    enabled: boolean;
  };
  linkedin?: {
    url: string;
    access_token?: string;
    page_id?: string;
    enabled: boolean;
  };
  youtube?: {
    url: string;
    channel_id?: string;
    enabled: boolean;
  };
  tiktok?: {
    url: string;
    account_id?: string;
    enabled: boolean;
  };
}

// CRM Data Structures
export interface CRMLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
  value?: number;
  probability?: number;
  next_action?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CRMDeal {
  id: string;
  title: string;
  client_contact: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expected_close_date: string;
  actual_close_date?: string;
  source: string;
  notes: string;
  activities: CRMActivity[];
  created_at: string;
  updated_at: string;
}

export interface CRMContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  company?: string;
  tags: string[];
  last_contact: string;
  notes: string;
  social_profiles: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CRMActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  title: string;
  description: string;
  date: string;
  completed: boolean;
  assigned_to?: string;
  created_at: string;
}

// Widget Configuration
export interface WidgetConfiguration {
  id: string;
  type: string;
  enabled: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  settings: Record<string, any>;
  data_sources: string[];
  refresh_interval: number; // in milliseconds
}

// Analytics and Metrics
export interface TrafficData {
  date: string;
  sessions: number;
  users: number;
  pageviews: number;
  bounce_rate: number;
  avg_session_duration: number;
  source: 'organic' | 'direct' | 'social' | 'referral' | 'paid';
}

export interface ConversionData {
  date: string;
  conversions: number;
  conversion_rate: number;
  conversion_value: number;
  goal_type: string;
}

export interface PerformanceMetrics {
  revenue: {
    current_month: number;
    previous_month: number;
    growth_rate: number;
    target: number;
  };
  leads: {
    current_month: number;
    previous_month: number;
    growth_rate: number;
    conversion_rate: number;
  };
  social_engagement: {
    followers_growth: number;
    engagement_rate: number;
    reach: number;
    impressions: number;
  };
  website: {
    traffic_growth: number;
    bounce_rate: number;
    avg_session_duration: number;
    page_load_speed: number;
  };
}

// Campaign and Automation
export interface EmailCampaign {
  id: string;
  name: string;
  type: 'one-time' | 'drip' | 'automated';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  subject: string;
  template_id?: string;
  recipient_list: string[];
  scheduled_date?: string;
  sent_date?: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ScheduledPost {
  id: string;
  platform: keyof SocialMediaAccounts;
  content: string;
  media_urls: string[];
  scheduled_date: string;
  published_date?: string;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  metrics?: {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
    reach: number;
  };
  created_at: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: string;
  conditions: Record<string, any>;
  actions: {
    type: string;
    settings: Record<string, any>;
  }[];
  enabled: boolean;
  runs: number;
  last_run?: string;
  created_at: string;
  updated_at: string;
}

// Branding and Customization
export interface ClientBranding {
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color?: string;
  font_family?: string;
  theme: 'light' | 'dark' | 'auto';
  custom_css?: string;
  favicon_url?: string;
}

// Comprehensive Client Interface
export interface ComprehensiveClient {
  // Basic Information (extends existing Client)
  id: string;
  agency_id?: string;
  name: string;
  company: string;
  website: string;
  industry: string;
  company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  
  // Contact Information
  contact: {
    primary_name: string;
    primary_email: string;
    primary_phone: string;
    secondary_name?: string;
    secondary_email?: string;
    secondary_phone?: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
    timezone: string;
  };
  
  // Business Details
  business: {
    monthly_retainer?: number;
    currency: string;
    contract_start?: string;
    contract_end?: string;
    services: string[];
    goals: string[];
    target_keywords: string[];
    target_audience: string;
    competitors: string[];
  };
  
  // Social Media Integration
  social_media: SocialMediaAccounts;
  
  // CRM Data
  crm: {
    leads: CRMLead[];
    deals: CRMDeal[];
    contacts: CRMContact[];
    pipeline_stages: string[];
  };
  
  // Widget and Dashboard Configuration
  dashboard: {
    enabled_widgets: string[];
    widget_configurations: WidgetConfiguration[];
    layout: 'grid' | 'list' | 'cards';
    custom_dashboard?: boolean;
  };
  
  // Analytics and Performance Data
  analytics: {
    traffic_data: TrafficData[];
    conversion_data: ConversionData[];
    performance_metrics: PerformanceMetrics;
    google_analytics_id?: string;
    google_ads_id?: string;
    facebook_pixel_id?: string;
  };
  
  // Marketing Automation
  automation: {
    email_campaigns: EmailCampaign[];
    social_posts: ScheduledPost[];
    workflows: AutomationWorkflow[];
    integrations: {
      mailchimp?: { api_key: string; list_id: string };
      hubspot?: { api_key: string; portal_id: string };
      salesforce?: { instance_url: string; access_token: string };
      zapier?: { webhook_url: string };
    };
  };
  
  // Notifications and Communication
  notifications: {
    client_notifications: AppNotification[];
    notification_preferences: {
      email_reports: boolean;
      sms_alerts: boolean;
      slack_integration?: string;
      frequency: 'daily' | 'weekly' | 'monthly';
    };
  };
  
  // Branding and Customization
  branding: ClientBranding;
  
  // Reporting and Documents
  reporting: {
    frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
    template_id?: string;
    custom_metrics: string[];
    auto_send: boolean;
    recipients: string[];
    last_report_sent?: string;
  };
  
  // Status and Metadata
  status: 'active' | 'paused' | 'prospect' | 'churned' | 'onboarding' | 'archived';
  onboarding_completed: boolean;
  onboarding_step: number;
  
  // System Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_accessed?: string;
  access_count: number;
  archived_at?: string;
}

// Client Template for quick setup
export interface ClientTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  default_services: string[];
  default_widgets: string[];
  default_goals: string[];
  branding_template: Partial<ClientBranding>;
  automation_templates: string[];
}

// Client onboarding steps
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  data_fields: string[];
  validation_rules: Record<string, any>;
}

export interface ClientOnboarding {
  client_id: string;
  steps: OnboardingStep[];
  current_step: number;
  started_at: string;
  completed_at?: string;
  completion_percentage: number;
}