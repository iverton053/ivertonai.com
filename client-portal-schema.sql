-- CLIENT PORTAL SYSTEM DATABASE SCHEMA FOR SUPABASE
-- Run this SQL in your Supabase SQL Editor to set up the client portal tables
-- This extends the existing agency management schema

-- Create client portal specific types
CREATE TYPE portal_auth_method AS ENUM (
  'email_link',
  'password',
  'sso'
);

CREATE TYPE portal_user_role AS ENUM (
  'owner',
  'manager',
  'viewer'
);

CREATE TYPE portal_user_status AS ENUM (
  'active',
  'invited',
  'suspended',
  'inactive'
);

CREATE TYPE notification_frequency AS ENUM (
  'realtime',
  'hourly',
  'daily',
  'weekly'
);

CREATE TYPE widget_position AS (
  x INTEGER,
  y INTEGER,
  width INTEGER,
  height INTEGER
);

-- 1. CLIENT PORTALS TABLE
CREATE TABLE IF NOT EXISTS client_portals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  custom_domain VARCHAR(255),
  ssl_certificate_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,

  -- Branding settings
  branding JSONB DEFAULT '{
    "company_name": "",
    "logo_url": null,
    "favicon_url": null,
    "social_links": {}
  }',

  -- Theme configuration
  theme JSONB DEFAULT '{
    "primary_color": "#6366f1",
    "secondary_color": "#8b5cf6",
    "accent_color": "#06b6d4",
    "background_type": "gradient",
    "background_value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "font_family": "inter",
    "layout_style": "modern",
    "sidebar_style": "dark"
  }',

  -- Access control settings
  access_settings JSONB DEFAULT '{
    "auth_method": "email_link",
    "require_2fa": false,
    "session_timeout": 480,
    "max_concurrent_sessions": 3,
    "allow_downloads": true,
    "watermark_downloads": false,
    "ip_whitelist": [],
    "allowed_domains": []
  }',

  -- Dashboard configuration
  dashboard_config JSONB DEFAULT '{
    "enabled_widgets": ["overview_stats", "seo_rankings", "website_traffic"],
    "widget_settings": {},
    "default_layout": {
      "grid_size": {"columns": 12, "rows": 20},
      "widget_positions": {},
      "sidebar_collapsed": false
    },
    "allow_customization": true,
    "data_refresh_interval": 15,
    "historical_data_range": 365,
    "available_exports": ["pdf", "csv"]
  }',

  -- Communication settings
  communication_settings JSONB DEFAULT '{
    "email_notifications": true,
    "notification_frequency": "daily",
    "enable_chat": true,
    "show_announcements": true,
    "show_changelog": true,
    "support_widget_enabled": true,
    "support_widget_position": "bottom_right"
  }',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES agency_users(id)
);

-- 2. CLIENT PORTAL USERS TABLE
CREATE TABLE IF NOT EXISTS client_portal_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_portal_id UUID REFERENCES client_portals(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role portal_user_role NOT NULL DEFAULT 'viewer',
  title VARCHAR(100),
  avatar_url TEXT,
  status portal_user_status DEFAULT 'active',

  -- Authentication
  password_hash VARCHAR(255),
  login_token VARCHAR(500),
  token_expires_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,

  -- Two-Factor Authentication
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_method VARCHAR(20), -- 'totp', 'sms', 'email'
  two_factor_secret VARCHAR(255), -- TOTP secret (base32)
  two_factor_backup_codes VARCHAR(20)[], -- Array of backup codes
  two_factor_enabled_at TIMESTAMPTZ,
  two_factor_disabled_at TIMESTAMPTZ,
  two_factor_last_used TIMESTAMPTZ,

  -- User preferences
  preferences JSONB DEFAULT '{
    "email_notifications": true,
    "notification_types": ["performance_alerts", "reports"],
    "theme_preference": "system",
    "timezone": "America/New_York",
    "date_format": "US",
    "default_date_range": 30,
    "preferred_metrics": ["traffic", "rankings", "conversions"],
    "favorite_widgets": []
  }',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES agency_users(id),

  UNIQUE(client_portal_id, email)
);

-- 3. CLIENT PORTAL ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS client_portal_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_portal_id UUID REFERENCES client_portals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES client_portal_users(id) ON DELETE SET NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PORTAL TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS portal_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,

  -- Template configuration
  template_config JSONB NOT NULL DEFAULT '{
    "branding": {},
    "theme": {},
    "dashboard_config": {},
    "enabled_widgets": [],
    "widget_settings": {},
    "layout": {}
  }',

  -- Usage statistics
  usage_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES agency_users(id)
);

-- 5. WHITE LABEL SETTINGS TABLE
CREATE TABLE IF NOT EXISTS white_label_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#6366f1',
  secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
  custom_domain VARCHAR(255),
  show_branding BOOLEAN DEFAULT false,
  custom_css TEXT,
  custom_javascript TEXT,

  -- Email templates
  email_templates JSONB DEFAULT '{
    "invitation": {"subject": "", "body": ""},
    "password_reset": {"subject": "", "body": ""},
    "welcome": {"subject": "", "body": ""}
  }',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(agency_id)
);

-- 6. PORTAL CUSTOM CODE TABLE
CREATE TABLE IF NOT EXISTS portal_custom_code (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_portal_id UUID REFERENCES client_portals(id) ON DELETE CASCADE NOT NULL,

  -- Code details
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('css', 'javascript')) NOT NULL,
  code TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  position VARCHAR(20) CHECK (position IN ('head', 'body-start', 'body-end')) DEFAULT 'head',

  -- Security and validation
  is_validated BOOLEAN DEFAULT false,
  validation_warnings JSONB DEFAULT '[]',
  last_validation_at TIMESTAMPTZ,

  -- Metadata
  description TEXT,
  tags VARCHAR(100)[],
  version INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(client_portal_id, name)
);

-- 7. PORTAL WEBHOOKS TABLE
CREATE TABLE IF NOT EXISTS portal_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_portal_id UUID REFERENCES client_portals(id) ON DELETE CASCADE NOT NULL,

  -- Webhook configuration
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  events VARCHAR(100)[] NOT NULL DEFAULT '{}',
  secret VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT true,

  -- HTTP headers (JSON format)
  headers JSONB DEFAULT '{}',

  -- Webhook statistics
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,

  -- Metadata
  description TEXT,
  timeout_seconds INTEGER DEFAULT 10,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(client_portal_id, name)
);

-- 8. PORTAL ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS portal_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_portal_id UUID REFERENCES client_portals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES client_portal_users(id) ON DELETE SET NULL,

  -- Page/widget tracking
  page_path VARCHAR(500),
  widget_type VARCHAR(100),

  -- Session information
  session_id VARCHAR(255),
  visitor_id VARCHAR(255),

  -- Analytics data
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'widget_view', 'download', 'export', etc.
  duration INTEGER, -- time spent in seconds
  metadata JSONB DEFAULT '{}',

  -- Browser/device info
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PORTAL NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS portal_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_portal_id UUID REFERENCES client_portals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES client_portal_users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- 'info', 'success', 'warning', 'error', 'update'
  priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'

  -- Status tracking
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Optional action
  action_url TEXT,
  action_label VARCHAR(100),

  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX(client_portal_id, user_id, is_read, created_at)
);

-- CREATE INDEXES for performance
CREATE INDEX idx_client_portals_agency_id ON client_portals(agency_id);
CREATE INDEX idx_client_portals_client_id ON client_portals(client_id);
CREATE INDEX idx_client_portals_subdomain ON client_portals(subdomain);
CREATE INDEX idx_client_portals_is_active ON client_portals(is_active);

CREATE INDEX idx_client_portal_users_portal_id ON client_portal_users(client_portal_id);
CREATE INDEX idx_client_portal_users_email ON client_portal_users(email);
CREATE INDEX idx_client_portal_users_status ON client_portal_users(status);
CREATE INDEX idx_client_portal_users_token ON client_portal_users(login_token);

CREATE INDEX idx_portal_activities_portal_id ON client_portal_activities(client_portal_id);
CREATE INDEX idx_portal_activities_user_id ON client_portal_activities(user_id);
CREATE INDEX idx_portal_activities_type ON client_portal_activities(activity_type);
CREATE INDEX idx_portal_activities_created_at ON client_portal_activities(created_at);

CREATE INDEX idx_portal_analytics_portal_id ON portal_analytics(client_portal_id);
CREATE INDEX idx_portal_analytics_event_type ON portal_analytics(event_type);
CREATE INDEX idx_portal_analytics_created_at ON portal_analytics(created_at);

-- UPDATE TRIGGERS for timestamps
CREATE TRIGGER update_client_portals_updated_at
  BEFORE UPDATE ON client_portals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_portal_users_updated_at
  BEFORE UPDATE ON client_portal_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_templates_updated_at
  BEFORE UPDATE ON portal_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_white_label_settings_updated_at
  BEFORE UPDATE ON white_label_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE client_portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for CLIENT PORTALS
CREATE POLICY "Agency users can view their portals" ON client_portals
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM agency_users WHERE id = auth.uid())
  );

CREATE POLICY "Agency admins can manage their portals" ON client_portals
  FOR ALL USING (
    agency_id IN (
      SELECT agency_id FROM agency_users
      WHERE id = auth.uid() AND role IN ('agency_owner', 'agency_admin')
    )
  );

-- RLS Policies for CLIENT PORTAL USERS
CREATE POLICY "Portal users can view themselves" ON client_portal_users
  FOR SELECT USING (
    id = auth.uid()
    OR
    client_portal_id IN (
      SELECT id FROM client_portals
      WHERE agency_id IN (SELECT agency_id FROM agency_users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Agency admins can manage portal users" ON client_portal_users
  FOR ALL USING (
    client_portal_id IN (
      SELECT id FROM client_portals
      WHERE agency_id IN (
        SELECT agency_id FROM agency_users
        WHERE id = auth.uid() AND role IN ('agency_owner', 'agency_admin')
      )
    )
  );

-- RLS Policies for PORTAL ACTIVITIES
CREATE POLICY "Users can view activities in their portals" ON client_portal_activities
  FOR SELECT USING (
    client_portal_id IN (
      SELECT client_portal_id FROM client_portal_users WHERE id = auth.uid()
    )
    OR
    client_portal_id IN (
      SELECT id FROM client_portals
      WHERE agency_id IN (SELECT agency_id FROM agency_users WHERE id = auth.uid())
    )
  );

CREATE POLICY "System can insert activities" ON client_portal_activities
  FOR INSERT WITH CHECK (true);

-- RLS Policies for PORTAL ANALYTICS
CREATE POLICY "Agency users can view portal analytics" ON portal_analytics
  FOR SELECT USING (
    client_portal_id IN (
      SELECT id FROM client_portals
      WHERE agency_id IN (SELECT agency_id FROM agency_users WHERE id = auth.uid())
    )
  );

CREATE POLICY "System can insert analytics" ON portal_analytics
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON client_portals TO authenticated;
GRANT ALL ON client_portal_users TO authenticated;
GRANT ALL ON client_portal_activities TO authenticated;
GRANT ALL ON portal_templates TO authenticated;
GRANT ALL ON white_label_settings TO authenticated;
GRANT ALL ON portal_analytics TO authenticated;
GRANT ALL ON portal_notifications TO authenticated;

-- Insert default portal templates
INSERT INTO portal_templates (name, description, category, template_config, is_active) VALUES
('Default Dashboard', 'Standard client portal template with essential widgets', 'general', '{
  "branding": {
    "company_name": "Your Company"
  },
  "theme": {
    "primary_color": "#6366f1",
    "secondary_color": "#8b5cf6",
    "accent_color": "#06b6d4",
    "background_type": "gradient",
    "background_value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "font_family": "inter",
    "layout_style": "modern",
    "sidebar_style": "dark"
  },
  "enabled_widgets": ["overview_stats", "seo_rankings", "website_traffic"],
  "widget_settings": {
    "overview_stats": {
      "title": "Overview Statistics",
      "is_visible": true,
      "position": {"x": 0, "y": 0, "width": 12, "height": 4},
      "refresh_rate": 60
    },
    "seo_rankings": {
      "title": "SEO Rankings",
      "is_visible": true,
      "position": {"x": 0, "y": 4, "width": 6, "height": 6},
      "refresh_rate": 60
    },
    "website_traffic": {
      "title": "Website Traffic",
      "is_visible": true,
      "position": {"x": 6, "y": 4, "width": 6, "height": 6},
      "refresh_rate": 30
    }
  }
}', true),

('SEO Focused', 'Template optimized for SEO reporting and keyword tracking', 'seo', '{
  "branding": {
    "company_name": "Your SEO Agency"
  },
  "theme": {
    "primary_color": "#059669",
    "secondary_color": "#0d9488",
    "accent_color": "#0891b2",
    "background_type": "gradient",
    "background_value": "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    "font_family": "inter",
    "layout_style": "modern",
    "sidebar_style": "dark"
  },
  "enabled_widgets": ["seo_rankings", "keyword_tracking", "backlink_analysis", "technical_seo"],
  "widget_settings": {
    "seo_rankings": {
      "title": "Keyword Rankings",
      "is_visible": true,
      "position": {"x": 0, "y": 0, "width": 6, "height": 8},
      "refresh_rate": 60
    },
    "keyword_tracking": {
      "title": "Keyword Performance",
      "is_visible": true,
      "position": {"x": 6, "y": 0, "width": 6, "height": 8},
      "refresh_rate": 60
    },
    "backlink_analysis": {
      "title": "Backlink Profile",
      "is_visible": true,
      "position": {"x": 0, "y": 8, "width": 12, "height": 6},
      "refresh_rate": 120
    }
  }
}', true),

('PPC Dashboard', 'Template focused on paid advertising performance', 'ppc', '{
  "branding": {
    "company_name": "Your PPC Agency"
  },
  "theme": {
    "primary_color": "#dc2626",
    "secondary_color": "#ea580c",
    "accent_color": "#d97706",
    "background_type": "gradient",
    "background_value": "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
    "font_family": "inter",
    "layout_style": "modern",
    "sidebar_style": "dark"
  },
  "enabled_widgets": ["ppc_performance", "ad_spend", "conversion_tracking", "campaign_overview"],
  "widget_settings": {
    "ppc_performance": {
      "title": "PPC Performance",
      "is_visible": true,
      "position": {"x": 0, "y": 0, "width": 8, "height": 6},
      "refresh_rate": 30
    },
    "ad_spend": {
      "title": "Ad Spend Analysis",
      "is_visible": true,
      "position": {"x": 8, "y": 0, "width": 4, "height": 6},
      "refresh_rate": 30
    },
    "conversion_tracking": {
      "title": "Conversions",
      "is_visible": true,
      "position": {"x": 0, "y": 6, "width": 6, "height": 6},
      "refresh_rate": 15
    },
    "campaign_overview": {
      "title": "Campaign Overview",
      "is_visible": true,
      "position": {"x": 6, "y": 6, "width": 6, "height": 6},
      "refresh_rate": 30
    }
  }
}', true);

-- Functions for client portal management

-- Function to create portal with default settings
CREATE OR REPLACE FUNCTION create_client_portal(
  p_agency_id UUID,
  p_client_id UUID,
  p_subdomain VARCHAR,
  p_owner_email VARCHAR,
  p_owner_name VARCHAR,
  p_template_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  portal_id UUID;
  user_id UUID;
  template_config JSONB := '{}';
BEGIN
  -- Get template configuration if provided
  IF p_template_id IS NOT NULL THEN
    SELECT template_config INTO template_config
    FROM portal_templates
    WHERE id = p_template_id AND is_active = true;

    -- Update template usage count
    UPDATE portal_templates SET usage_count = usage_count + 1
    WHERE id = p_template_id;
  END IF;

  -- Create the portal
  INSERT INTO client_portals (
    agency_id, client_id, subdomain,
    branding, theme, dashboard_config
  ) VALUES (
    p_agency_id, p_client_id, p_subdomain,
    COALESCE(template_config->'branding', '{}'::jsonb),
    COALESCE(template_config->'theme', '{}'::jsonb),
    COALESCE(template_config->('dashboard_config'), '{}'::jsonb)
  ) RETURNING id INTO portal_id;

  -- Create the portal owner
  INSERT INTO client_portal_users (
    client_portal_id, client_id, email, full_name, role
  ) VALUES (
    portal_id, p_client_id, p_owner_email, p_owner_name, 'owner'
  ) RETURNING id INTO user_id;

  -- Log the activity
  INSERT INTO client_portal_activities (
    client_portal_id, user_id, activity_type, activity_description
  ) VALUES (
    portal_id, user_id, 'portal_created', 'Portal created with owner account'
  );

  RETURN portal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate portal user by token
CREATE OR REPLACE FUNCTION authenticate_portal_user(
  p_email VARCHAR,
  p_portal_id UUID,
  p_token VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  portal_data JSONB,
  is_valid BOOLEAN
) AS $$
DECLARE
  user_record RECORD;
  portal_record RECORD;
BEGIN
  -- Find the user
  SELECT * INTO user_record
  FROM client_portal_users
  WHERE email = p_email
    AND client_portal_id = p_portal_id
    AND status = 'active';

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::JSONB, FALSE;
    RETURN;
  END IF;

  -- Validate token if provided
  IF p_token IS NOT NULL THEN
    IF user_record.login_token != p_token OR user_record.token_expires_at < NOW() THEN
      RETURN QUERY SELECT NULL::UUID, NULL::JSONB, FALSE;
      RETURN;
    END IF;
  END IF;

  -- Get portal data
  SELECT * INTO portal_record
  FROM client_portals
  WHERE id = p_portal_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::JSONB, FALSE;
    RETURN;
  END IF;

  -- Update last login
  UPDATE client_portal_users
  SET last_login = NOW()
  WHERE id = user_record.id;

  -- Log login activity
  INSERT INTO client_portal_activities (
    client_portal_id, user_id, activity_type, activity_description
  ) VALUES (
    p_portal_id, user_record.id, 'login', 'User logged in'
  );

  RETURN QUERY SELECT
    user_record.id,
    row_to_json(portal_record)::jsonb,
    TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;