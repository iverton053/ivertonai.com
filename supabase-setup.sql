-- PRODUCTION TEAM MANAGEMENT DATABASE SCHEMA FOR SUPABASE
-- Run this SQL in your Supabase SQL Editor to set up the tables

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create custom types
CREATE TYPE user_role AS ENUM (
  'agency_owner',
  'agency_admin', 
  'team_lead',
  'analyst',
  'client_view'
);

CREATE TYPE user_status AS ENUM (
  'active',
  'invited',
  'suspended',
  'inactive'
);

CREATE TYPE invitation_status AS ENUM (
  'pending',
  'accepted',
  'expired',
  'cancelled'
);

-- 1. AGENCIES TABLE
CREATE TABLE IF NOT EXISTS agencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  logo_url TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'professional',
  max_users INTEGER DEFAULT 25,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AGENCY USERS TABLE (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS agency_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'analyst',
  status user_status DEFAULT 'invited',
  department VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'UTC',
  last_login TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agency_id, username),
  UNIQUE(agency_id, email)
);

-- 3. CLIENTS TABLE  
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  domain VARCHAR(255),
  industry VARCHAR(100),
  logo_url TEXT,
  contact_email VARCHAR(255),
  contact_name VARCHAR(255),
  contact_phone VARCHAR(20),
  billing_address JSONB,
  settings JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agency_id, slug)
);

-- 4. USER INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  department VARCHAR(100),
  invited_by UUID REFERENCES agency_users(id),
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  status invitation_status DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agency_id, email)
);

-- 5. CLIENT ASSIGNMENTS TABLE (many-to-many relationship)
CREATE TABLE IF NOT EXISTS client_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES agency_users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'analyst', -- role for this specific client
  permissions JSONB DEFAULT '[]',
  assigned_by UUID REFERENCES agency_users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, client_id)
);

-- 6. ACTIVITY LOGS TABLE (audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES agency_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER SESSIONS TABLE (optional - for enhanced session management)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES agency_users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE INDEXES for better performance
CREATE INDEX idx_agency_users_agency_id ON agency_users(agency_id);
CREATE INDEX idx_agency_users_role ON agency_users(role);
CREATE INDEX idx_agency_users_status ON agency_users(status);
CREATE INDEX idx_clients_agency_id ON clients(agency_id);
CREATE INDEX idx_user_invitations_agency_id ON user_invitations(agency_id);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);
CREATE INDEX idx_client_assignments_user_id ON client_assignments(user_id);
CREATE INDEX idx_client_assignments_client_id ON client_assignments(client_id);
CREATE INDEX idx_activity_logs_agency_id ON activity_logs(agency_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- UPDATE TRIGGERS for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agency_users_updated_at BEFORE UPDATE ON agency_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AGENCIES
CREATE POLICY "Users can view their own agency" ON agencies
  FOR SELECT USING (
    id IN (SELECT agency_id FROM agency_users WHERE id = auth.uid())
  );

CREATE POLICY "Agency owners can update their agency" ON agencies
  FOR UPDATE USING (
    id IN (
      SELECT agency_id FROM agency_users 
      WHERE id = auth.uid() AND role IN ('agency_owner', 'agency_admin')
    )
  );

-- RLS Policies for AGENCY USERS
CREATE POLICY "Users can view users in their agency" ON agency_users
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM agency_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage users in their agency" ON agency_users
  FOR ALL USING (
    agency_id IN (
      SELECT agency_id FROM agency_users 
      WHERE id = auth.uid() AND role IN ('agency_owner', 'agency_admin')
    )
  );

-- RLS Policies for CLIENTS
CREATE POLICY "Users can view assigned clients" ON clients
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM agency_users WHERE id = auth.uid())
    AND (
      -- Agency owners and admins see all clients
      (SELECT role FROM agency_users WHERE id = auth.uid()) IN ('agency_owner', 'agency_admin')
      OR
      -- Others see only assigned clients
      id IN (SELECT client_id FROM client_assignments WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for CLIENT ASSIGNMENTS
CREATE POLICY "Users can view their assignments" ON client_assignments
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    client_id IN (
      SELECT client_id FROM client_assignments 
      WHERE user_id = auth.uid()
    )
    OR
    (SELECT role FROM agency_users WHERE id = auth.uid()) IN ('agency_owner', 'agency_admin')
  );

-- RLS Policies for ACTIVITY LOGS
CREATE POLICY "Users can view activity in their agency" ON activity_logs
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM agency_users WHERE id = auth.uid())
  );

CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- FUNCTIONS for business logic

-- Function to get user's effective permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_record RECORD;
  permissions JSONB := '[]'::JSONB;
BEGIN
  SELECT role, agency_id INTO user_record 
  FROM agency_users WHERE id = user_id;
  
  -- Define permissions based on role
  CASE user_record.role
    WHEN 'agency_owner' THEN
      permissions := '["manage_agency", "manage_users", "manage_clients", "view_all_data", "manage_billing"]'::JSONB;
    WHEN 'agency_admin' THEN
      permissions := '["manage_users", "manage_clients", "view_all_data"]'::JSONB;
    WHEN 'team_lead' THEN
      permissions := '["view_team", "assign_clients", "view_assigned_data"]'::JSONB;
    WHEN 'analyst' THEN
      permissions := '["view_assigned_data"]'::JSONB;
    WHEN 'client_view' THEN
      permissions := '["view_limited_data"]'::JSONB;
    ELSE
      permissions := '[]'::JSONB;
  END CASE;
  
  RETURN permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity(
  p_agency_id UUID,
  p_user_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO activity_logs (
    agency_id, user_id, action, resource_type, resource_id,
    old_values, new_values, metadata, ip_address, user_agent
  ) VALUES (
    p_agency_id, p_user_id, p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_metadata, 
    inet_client_addr(), current_setting('request.headers', true)::JSON->>'user-agent'
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data for testing (run this after setting up your first agency)
/*
INSERT INTO agencies (name, slug, domain, subscription_plan, max_users) 
VALUES ('Acme Marketing Agency', 'acme-marketing', 'acme-marketing.com', 'professional', 25);

-- Note: Users will be created through Supabase Auth, then linked in agency_users table
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;