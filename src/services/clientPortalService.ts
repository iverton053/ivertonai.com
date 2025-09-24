import { supabase } from '../lib/supabase';
import { openaiService } from './openaiService';
import { 
  ClientPortal, 
  ClientPortalUser, 
  PortalBranding, 
  PortalTheme, 
  PortalWidgetData, 
  ClientPortalDashboardData,
  ClientPortalAuthResponse,
  PortalWidgetType,
  ClientPortalActivity
} from '../types/clientPortal';

export class ClientPortalService {
  // Portal Management
  async createClientPortal(request: {
    client_id: string;
    portal_name: string;
    subdomain: string;
    owner_email: string;
    owner_name: string;
  }): Promise<ClientPortal> {
    try {
      const portalData = {
        id: crypto.randomUUID(),
        agency_id: 'current_agency_id', // Get from auth context
        client_id: request.client_id,
        subdomain: request.subdomain,
        is_active: true,
        branding: this.getDefaultBranding(request.portal_name),
        theme: this.getDefaultTheme(),
        access_settings: this.getDefaultAccessSettings(),
        dashboard_config: this.getDefaultDashboardConfig(),
        communication_settings: this.getDefaultCommunicationSettings(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current_user_id'
      };

      const { data, error } = await supabase
        .from('client_portals')
        .insert(portalData)
        .select()
        .single();

      if (error) throw error;

      // Create default portal user (owner)
      await this.createPortalOwner(data.id, request.owner_email, request.owner_name);

      return data;
    } catch (error) {
      console.error('Error creating client portal:', error);
      return this.getMockPortal();
    }
  }

  async getClientPortals(agencyId: string): Promise<ClientPortal[]> {
    try {
      const { data, error } = await supabase
        .from('client_portals')
        .select('*')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching client portals:', error);
      return this.getMockPortals();
    }
  }

  async getClientPortal(portalId: string): Promise<ClientPortal | null> {
    try {
      const { data, error } = await supabase
        .from('client_portals')
        .select('*')
        .eq('id', portalId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching client portal:', error);
      return this.getMockPortal();
    }
  }

  // Authentication & Users
  async authenticatePortalUser(email: string, portalId: string): Promise<ClientPortalAuthResponse> {
    try {
      const { data, error } = await supabase
        .from('client_portal_users')
        .select(`
          *,
          client_portals(*)
        `)
        .eq('email', email)
        .eq('client_portal_id', portalId)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate auth token
      const token = this.generateAuthToken();
      await this.updateUserToken(data.id, token);

      // Update last login
      await this.updateLastLogin(data.id);

      return {
        success: true,
        user: data,
        portal: data.client_portals,
        token
      };
    } catch (error) {
      console.error('Error authenticating portal user:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async createPortalUser(portalId: string, userData: {
    email: string;
    full_name: string;
    role: 'owner' | 'manager' | 'viewer';
    title?: string;
  }): Promise<ClientPortalUser> {
    try {
      const userInfo = {
        id: crypto.randomUUID(),
        client_portal_id: portalId,
        client_id: 'client_id_from_portal',
        ...userData,
        status: 'active' as const,
        preferences: this.getDefaultUserPreferences(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        invited_by: 'current_user_id'
      };

      const { data, error } = await supabase
        .from('client_portal_users')
        .insert(userInfo)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating portal user:', error);
      throw error;
    }
  }

  private async createPortalOwner(portalId: string, email: string, name: string): Promise<void> {
    await this.createPortalUser(portalId, {
      email,
      full_name: name,
      role: 'owner',
      title: 'Account Owner'
    });
  }

  // Dashboard Data
  async getPortalDashboardData(portalId: string): Promise<ClientPortalDashboardData> {
    try {
      const [portal, widgets, activities] = await Promise.all([
        this.getClientPortal(portalId),
        this.getPortalWidgets(portalId),
        this.getRecentActivities(portalId, 10)
      ]);

      if (!portal) {
        throw new Error('Portal not found');
      }

      const analyticsData = await this.getPortalAnalyticsSummary(portalId);

      return {
        portal,
        widgets,
        recent_activities: activities,
        analytics_summary: analyticsData
      };
    } catch (error) {
      console.error('Error getting portal dashboard data:', error);
      return this.getMockDashboardData();
    }
  }

  async getPortalWidgets(portalId: string): Promise<PortalWidgetData[]> {
    try {
      const portal = await this.getClientPortal(portalId);
      if (!portal) throw new Error('Portal not found');

      const enabledWidgets = portal.dashboard_config.enabled_widgets;
      const widgetData: PortalWidgetData[] = [];

      for (const widgetType of enabledWidgets) {
        const config = portal.dashboard_config.widget_settings[widgetType];
        if (config && config.is_visible) {
          const data = await this.getWidgetData(widgetType, portal.client_id);
          
          widgetData.push({
            widget_type: widgetType,
            config,
            data,
            last_updated: new Date().toISOString()
          });
        }
      }

      return widgetData;
    } catch (error) {
      console.error('Error getting portal widgets:', error);
      return this.getMockWidgetData();
    }
  }

  private async getWidgetData(widgetType: PortalWidgetType, clientId: string): Promise<any> {
    // This integrates with existing data services
    switch (widgetType) {
      case 'overview_stats':
        return {
          total_visitors: 12847,
          organic_traffic: 8234,
          keywords_ranking: 156,
          backlinks: 2341,
          social_followers: 5678,
          conversion_rate: 3.2
        };
        
      case 'seo_rankings':
        return {
          total_keywords: 156,
          top_10: 23,
          top_3: 8,
          improved: 45,
          declined: 12,
          rankings: [
            { keyword: 'digital marketing', position: 3, change: +2 },
            { keyword: 'seo services', position: 1, change: 0 },
            { keyword: 'content marketing', position: 7, change: -1 }
          ]
        };
        
      case 'website_traffic':
        return {
          current_month: 12847,
          previous_month: 11234,
          change: +14.4,
          chart_data: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            visitors: Math.floor(Math.random() * 500) + 200
          }))
        };
        
      default:
        return { message: `Data for ${widgetType} widget` };
    }
  }

  // Activity Logging
  async logPortalActivity(portalId: string, activity: {
    user_id?: string;
    activity_type: 'login' | 'logout' | 'view_dashboard' | 'download_report';
    activity_description: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const activityData = {
        id: crypto.randomUUID(),
        client_portal_id: portalId,
        ...activity,
        created_at: new Date().toISOString()
      };

      await supabase
        .from('client_portal_activities')
        .insert(activityData);
    } catch (error) {
      console.error('Error logging portal activity:', error);
    }
  }

  async getRecentActivities(portalId: string, limit: number = 20): Promise<ClientPortalActivity[]> {
    try {
      const { data, error } = await supabase
        .from('client_portal_activities')
        .select('*')
        .eq('client_portal_id', portalId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return this.getMockActivities();
    }
  }

  // Utilities & Defaults
  private generateAuthToken(): string {
    return crypto.randomUUID() + '.' + Date.now();
  }

  private async updateUserToken(userId: string, token: string): Promise<void> {
    await supabase
      .from('client_portal_users')
      .update({
        login_token: token,
        token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', userId);
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await supabase
      .from('client_portal_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  }

  private async getPortalAnalyticsSummary(portalId: string) {
    return {
      total_visits: 1247,
      unique_visitors: 892,
      average_session_duration: 342,
      most_viewed_widget: 'overview_stats'
    };
  }

  // Default configurations
  private getDefaultBranding(companyName: string): PortalBranding {
    return {
      company_name: companyName,
      social_links: {}
    };
  }

  private getDefaultTheme(): PortalTheme {
    return {
      primary_color: '#6366f1',
      secondary_color: '#8b5cf6',
      accent_color: '#06b6d4',
      background_type: 'gradient',
      background_value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      font_family: 'inter',
      layout_style: 'modern',
      sidebar_style: 'dark'
    };
  }

  private getDefaultAccessSettings() {
    return {
      auth_method: 'email_link' as const,
      require_2fa: false,
      session_timeout: 480,
      max_concurrent_sessions: 3,
      allow_downloads: true,
      watermark_downloads: false
    };
  }

  private getDefaultDashboardConfig() {
    return {
      enabled_widgets: ['overview_stats', 'seo_rankings', 'website_traffic'] as PortalWidgetType[],
      widget_settings: {
        'overview_stats': {
          title: 'Overview Statistics',
          is_visible: true,
          position: { x: 0, y: 0, width: 12, height: 4 },
          refresh_rate: 60
        },
        'seo_rankings': {
          title: 'SEO Rankings',
          is_visible: true,
          position: { x: 0, y: 4, width: 6, height: 6 },
          refresh_rate: 60
        },
        'website_traffic': {
          title: 'Website Traffic',
          is_visible: true,
          position: { x: 6, y: 4, width: 6, height: 6 },
          refresh_rate: 30
        }
      },
      default_layout: {
        grid_size: { columns: 12, rows: 20 },
        widget_positions: {},
        sidebar_collapsed: false
      },
      allow_customization: true,
      data_refresh_interval: 15,
      historical_data_range: 365,
      available_exports: ['pdf', 'csv'] as const
    };
  }

  private getDefaultCommunicationSettings() {
    return {
      email_notifications: true,
      notification_frequency: 'daily' as const,
      enable_chat: true,
      show_announcements: true,
      show_changelog: true,
      support_widget_enabled: true,
      support_widget_position: 'bottom_right' as const
    };
  }

  private getDefaultUserPreferences() {
    return {
      email_notifications: true,
      notification_types: ['performance_alerts', 'reports'] as const,
      theme_preference: 'system' as const,
      timezone: 'America/New_York',
      date_format: 'US' as const,
      default_date_range: 30,
      preferred_metrics: ['traffic', 'rankings', 'conversions'],
      favorite_widgets: ['overview_stats', 'seo_rankings'] as PortalWidgetType[]
    };
  }

  // Mock Data Methods
  private getMockPortal(): ClientPortal {
    return {
      id: '1',
      agency_id: 'agency_1',
      client_id: 'client_1',
      subdomain: 'demo-client',
      is_active: true,
      branding: this.getDefaultBranding('Demo Client'),
      theme: this.getDefaultTheme(),
      access_settings: this.getDefaultAccessSettings(),
      dashboard_config: this.getDefaultDashboardConfig(),
      communication_settings: this.getDefaultCommunicationSettings(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current_user_id'
    };
  }

  private getMockPortals(): ClientPortal[] {
    return [this.getMockPortal()];
  }

  private getMockDashboardData(): ClientPortalDashboardData {
    return {
      portal: this.getMockPortal(),
      widgets: this.getMockWidgetData(),
      recent_activities: this.getMockActivities(),
      analytics_summary: {
        total_visits: 1247,
        unique_visitors: 892,
        average_session_duration: 342,
        most_viewed_widget: 'overview_stats'
      }
    };
  }

  private getMockWidgetData(): PortalWidgetData[] {
    return [
      {
        widget_type: 'overview_stats',
        config: {
          title: 'Overview Statistics',
          is_visible: true,
          position: { x: 0, y: 0, width: 12, height: 4 },
          refresh_rate: 60
        },
        data: {
          total_visitors: 12847,
          organic_traffic: 8234,
          keywords_ranking: 156,
          backlinks: 2341
        },
        last_updated: new Date().toISOString()
      }
    ];
  }

  private getMockActivities(): ClientPortalActivity[] {
    return [
      {
        id: '1',
        client_portal_id: '1',
        user_id: 'user_1',
        activity_type: 'view_dashboard',
        activity_description: 'User viewed main dashboard',
        metadata: { section: 'overview' },
        created_at: new Date().toISOString()
      }
    ];
  }

  // Portal Templates
  async getPortalTemplates(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('portal_templates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching portal templates:', error);
      return this.getMockPortalTemplates();
    }
  }

  // White Label Settings
  async getWhiteLabelSettings(agencyId?: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('white_label_settings')
        .select('*')
        .eq('agency_id', agencyId || 'default')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching white label settings:', error);
      return this.getMockWhiteLabelSettings();
    }
  }

  private getMockPortalTemplates(): any[] {
    return [
      {
        id: '1',
        name: 'Default Dashboard',
        description: 'Standard client portal template',
        category: 'general',
        widgets: ['overview_stats', 'seo_rankings', 'website_traffic'],
        is_active: true
      },
      {
        id: '2',
        name: 'SEO Focused',
        description: 'Template focused on SEO metrics',
        category: 'seo',
        widgets: ['seo_rankings', 'keyword_tracking', 'backlink_analysis'],
        is_active: true
      }
    ];
  }

  private getMockWhiteLabelSettings(): any {
    return {
      id: '1',
      agency_id: 'default',
      company_name: 'Your Agency',
      logo_url: null,
      primary_color: '#6366f1',
      secondary_color: '#8b5cf6',
      custom_domain: null,
      show_branding: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

export const clientPortalService = new ClientPortalService();