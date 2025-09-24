-- CRM Management System Database Schema
-- Compatible with PostgreSQL/Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts Table
CREATE TABLE crm_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    job_title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'opportunity', 'customer', 'inactive')),
    source VARCHAR(20) DEFAULT 'other' CHECK (source IN ('website', 'referral', 'cold-call', 'social-media', 'advertisement', 'other')),
    lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
    tags TEXT[],
    address JSONB,
    social_profiles JSONB,
    custom_fields JSONB,
    assigned_to UUID,
    last_contacted TIMESTAMPTZ,
    next_follow_up TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipelines Table
CREATE TABLE crm_pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    stages JSONB NOT NULL, -- Array of stage objects
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals Table
CREATE TABLE crm_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
    pipeline_id UUID REFERENCES crm_pipelines(id) ON DELETE SET NULL,
    value DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    stage VARCHAR(50) DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost')),
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    actual_close_date DATE,
    deal_source VARCHAR(20) DEFAULT 'other' CHECK (deal_source IN ('inbound', 'outbound', 'referral', 'partner', 'other')),
    products_services TEXT[],
    notes TEXT,
    assigned_to UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal Stage History Table
CREATE TABLE crm_deal_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES crm_deals(id) ON DELETE CASCADE,
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    changed_by UUID NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Activities Table
CREATE TABLE crm_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'task', 'note', 'demo', 'proposal')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    outcome VARCHAR(10) CHECK (outcome IN ('positive', 'negative', 'neutral')),
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMPTZ,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes Table
CREATE TABLE crm_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES crm_deals(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES crm_activities(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_contacts_email ON crm_contacts(email);
CREATE INDEX idx_contacts_status ON crm_contacts(status);
CREATE INDEX idx_contacts_assigned_to ON crm_contacts(assigned_to);
CREATE INDEX idx_contacts_company ON crm_contacts(company);
CREATE INDEX idx_contacts_created_at ON crm_contacts(created_at);
CREATE INDEX idx_contacts_tags ON crm_contacts USING GIN(tags);

CREATE INDEX idx_deals_contact_id ON crm_deals(contact_id);
CREATE INDEX idx_deals_stage ON crm_deals(stage);
CREATE INDEX idx_deals_assigned_to ON crm_deals(assigned_to);
CREATE INDEX idx_deals_expected_close_date ON crm_deals(expected_close_date);
CREATE INDEX idx_deals_value ON crm_deals(value);

CREATE INDEX idx_activities_contact_id ON crm_activities(contact_id);
CREATE INDEX idx_activities_deal_id ON crm_activities(deal_id);
CREATE INDEX idx_activities_assigned_to ON crm_activities(assigned_to);
CREATE INDEX idx_activities_due_date ON crm_activities(due_date);
CREATE INDEX idx_activities_type ON crm_activities(type);
CREATE INDEX idx_activities_completed ON crm_activities(completed);

CREATE INDEX idx_notes_contact_id ON crm_notes(contact_id);
CREATE INDEX idx_notes_deal_id ON crm_notes(deal_id);
CREATE INDEX idx_notes_activity_id ON crm_notes(activity_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON crm_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_deals_updated_at BEFORE UPDATE ON crm_deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_activities_updated_at BEFORE UPDATE ON crm_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_notes_updated_at BEFORE UPDATE ON crm_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default pipeline
INSERT INTO crm_pipelines (name, stages, is_default) VALUES (
    'Default Sales Pipeline',
    '[
        {"id": "prospecting", "name": "Prospecting", "order": 1, "probability": 10, "color": "#6B7280"},
        {"id": "qualification", "name": "Qualification", "order": 2, "probability": 25, "color": "#F59E0B"},
        {"id": "proposal", "name": "Proposal", "order": 3, "probability": 50, "color": "#3B82F6"},
        {"id": "negotiation", "name": "Negotiation", "order": 4, "probability": 75, "color": "#8B5CF6"},
        {"id": "closed-won", "name": "Closed Won", "order": 5, "probability": 100, "color": "#10B981"},
        {"id": "closed-lost", "name": "Closed Lost", "order": 6, "probability": 0, "color": "#EF4444"}
    ]'::jsonb,
    true
);

-- Create analytics views for better performance
CREATE VIEW crm_contact_stats AS
SELECT 
    COUNT(*) as total_contacts,
    COUNT(*) FILTER (WHERE status = 'new') as new_contacts,
    COUNT(*) FILTER (WHERE status = 'qualified') as qualified_contacts,
    COUNT(*) FILTER (WHERE status = 'customer') as customers,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as contacts_this_month,
    AVG(lead_score) as avg_lead_score
FROM crm_contacts
WHERE status != 'inactive';

CREATE VIEW crm_deal_stats AS
SELECT 
    COUNT(*) as total_deals,
    COUNT(*) FILTER (WHERE stage = 'closed-won') as won_deals,
    COUNT(*) FILTER (WHERE stage = 'closed-lost') as lost_deals,
    SUM(value) as total_pipeline_value,
    SUM(value) FILTER (WHERE stage = 'closed-won') as total_revenue,
    AVG(value) as avg_deal_size,
    AVG(value) FILTER (WHERE stage = 'closed-won') as avg_won_deal_size,
    ROUND(
        (COUNT(*) FILTER (WHERE stage = 'closed-won')::decimal / 
         NULLIF(COUNT(*) FILTER (WHERE stage IN ('closed-won', 'closed-lost')), 0)) * 100, 2
    ) as win_rate
FROM crm_deals;

CREATE VIEW crm_activity_stats AS
SELECT 
    COUNT(*) as total_activities,
    COUNT(*) FILTER (WHERE completed = true) as completed_activities,
    COUNT(*) FILTER (WHERE due_date::date = CURRENT_DATE) as due_today,
    COUNT(*) FILTER (WHERE due_date::date < CURRENT_DATE AND completed = false) as overdue,
    COUNT(*) FILTER (WHERE type = 'call') as calls,
    COUNT(*) FILTER (WHERE type = 'email') as emails,
    COUNT(*) FILTER (WHERE type = 'meeting') as meetings,
    COUNT(*) FILTER (WHERE type = 'task') as tasks
FROM crm_activities;

-- Create RLS (Row Level Security) policies if using Supabase
-- ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;

-- Sample data for testing (optional)
-- INSERT INTO crm_contacts (first_name, last_name, email, company, job_title, status, source, lead_score) VALUES
-- ('John', 'Doe', 'john.doe@example.com', 'Acme Corp', 'CEO', 'qualified', 'website', 85),
-- ('Jane', 'Smith', 'jane.smith@example.com', 'TechStart Inc', 'CTO', 'opportunity', 'referral', 92),
-- ('Bob', 'Johnson', 'bob.johnson@example.com', 'StartupXYZ', 'Founder', 'new', 'cold-call', 65);