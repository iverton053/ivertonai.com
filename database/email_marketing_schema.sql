-- ============================================
-- ULTIMATE EMAIL MARKETING SYSTEM DATABASE SCHEMA
-- Enterprise-grade schema with full analytics
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================
-- CORE EMAIL MARKETING TABLES
-- ============================================

-- Email Service Providers configuration
CREATE TABLE email_service_providers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL, -- 'resend', 'sendgrid', 'aws_ses'
    api_key text NOT NULL,
    api_endpoint text,
    daily_limit integer DEFAULT 50000,
    monthly_limit integer DEFAULT 1500000,
    is_active boolean DEFAULT true,
    is_primary boolean DEFAULT false,
    settings jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Email campaigns with advanced features
CREATE TABLE email_campaigns (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Campaign details
    name text NOT NULL,
    subject text NOT NULL,
    preview_text text,
    from_name text NOT NULL,
    from_email text NOT NULL,
    reply_to text,
    
    -- Content
    html_content text,
    text_content text,
    json_content jsonb, -- Drag & drop builder data
    template_id uuid,
    
    -- Campaign settings
    campaign_type text DEFAULT 'newsletter', -- newsletter, promotional, transactional, drip, a_b_test
    status text DEFAULT 'draft', -- draft, scheduled, sending, sent, paused, cancelled
    priority integer DEFAULT 5, -- 1-10, higher = more priority
    
    -- Scheduling
    send_time timestamptz,
    timezone text DEFAULT 'UTC',
    send_immediately boolean DEFAULT false,
    
    -- A/B Testing
    ab_test_enabled boolean DEFAULT false,
    ab_test_config jsonb,
    ab_winner_criteria text, -- open_rate, click_rate, conversion_rate
    ab_test_duration_hours integer DEFAULT 24,
    
    -- Advanced settings
    track_opens boolean DEFAULT true,
    track_clicks boolean DEFAULT true,
    track_unsubscribes boolean DEFAULT true,
    custom_tracking_domain text,
    unsubscribe_groups text[],
    
    -- Performance predictions (AI)
    predicted_open_rate decimal(5,2),
    predicted_click_rate decimal(5,2),
    predicted_conversion_rate decimal(5,2),
    prediction_confidence decimal(3,2),
    
    -- Metadata
    tags text[],
    notes text,
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Email templates with versioning
CREATE TABLE email_templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
    
    name text NOT NULL,
    description text,
    category text, -- newsletter, promotional, welcome, abandoned_cart, etc.
    
    -- Template content
    html_content text NOT NULL,
    text_content text,
    json_content jsonb, -- Builder data
    thumbnail_url text,
    
    -- Template metadata
    is_public boolean DEFAULT false,
    is_premium boolean DEFAULT false,
    industry_tags text[],
    
    -- Usage stats
    usage_count integer DEFAULT 0,
    last_used_at timestamptz,
    
    -- Versioning
    version integer DEFAULT 1,
    parent_template_id uuid,
    
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Advanced subscriber management
CREATE TABLE email_subscribers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Basic info
    email text NOT NULL,
    first_name text,
    last_name text,
    phone text,
    company text,
    job_title text,
    
    -- Advanced fields
    custom_fields jsonb DEFAULT '{}',
    tags text[],
    source text, -- website, import, api, manual
    acquisition_campaign text,
    
    -- Preferences
    preferred_language text DEFAULT 'en',
    timezone text,
    preferred_send_time time,
    frequency_preference text, -- daily, weekly, monthly
    
    -- Status and engagement
    status text DEFAULT 'active', -- active, unsubscribed, bounced, complained
    engagement_score integer DEFAULT 50, -- 0-100
    last_engagement_at timestamptz,
    
    -- Behavioral data
    total_opens integer DEFAULT 0,
    total_clicks integer DEFAULT 0,
    avg_open_rate decimal(5,2) DEFAULT 0,
    avg_click_rate decimal(5,2) DEFAULT 0,
    last_open_at timestamptz,
    last_click_at timestamptz,
    
    -- Lifecycle
    subscribed_at timestamptz DEFAULT now(),
    unsubscribed_at timestamptz,
    unsubscribe_reason text,
    
    -- Integration data
    crm_contact_id text,
    external_ids jsonb DEFAULT '{}',
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(agency_id, client_id, email)
);

-- Email lists and segments
CREATE TABLE email_lists (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    
    name text NOT NULL,
    description text,
    list_type text DEFAULT 'static', -- static, dynamic, smart
    
    -- Smart list rules (for dynamic lists)
    segment_rules jsonb, -- Complex filtering rules
    refresh_frequency text, -- real_time, hourly, daily, weekly
    
    -- List settings
    double_opt_in boolean DEFAULT true,
    welcome_email_template_id uuid,
    
    -- Stats (cached for performance)
    subscriber_count integer DEFAULT 0,
    active_subscriber_count integer DEFAULT 0,
    growth_rate decimal(5,2) DEFAULT 0,
    last_refreshed_at timestamptz,
    
    -- Metadata
    tags text[],
    is_archived boolean DEFAULT false,
    
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Junction table for subscriber-list relationships
CREATE TABLE email_list_subscribers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id uuid REFERENCES email_lists(id) ON DELETE CASCADE,
    subscriber_id uuid REFERENCES email_subscribers(id) ON DELETE CASCADE,
    
    status text DEFAULT 'active', -- active, unsubscribed
    subscribed_at timestamptz DEFAULT now(),
    unsubscribed_at timestamptz,
    source text, -- import, signup, api, manual
    
    UNIQUE(list_id, subscriber_id)
);

-- ============================================
-- AUTOMATION & WORKFLOWS
-- ============================================

-- Email automation workflows
CREATE TABLE email_workflows (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    
    name text NOT NULL,
    description text,
    workflow_type text, -- welcome, abandoned_cart, re_engagement, nurture
    
    -- Trigger configuration
    trigger_type text NOT NULL, -- list_subscription, custom_event, date_based, behavior
    trigger_config jsonb NOT NULL,
    
    -- Workflow steps
    steps jsonb NOT NULL, -- Array of workflow steps
    
    -- Settings
    status text DEFAULT 'active', -- active, paused, draft
    max_entries_per_contact integer DEFAULT 1,
    allow_re_entry boolean DEFAULT false,
    
    -- Performance tracking
    total_entries integer DEFAULT 0,
    total_completions integer DEFAULT 0,
    completion_rate decimal(5,2) DEFAULT 0,
    
    -- n8n integration
    n8n_workflow_id text,
    n8n_webhook_url text,
    
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Workflow entries (people going through workflows)
CREATE TABLE email_workflow_entries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id uuid REFERENCES email_workflows(id) ON DELETE CASCADE,
    subscriber_id uuid REFERENCES email_subscribers(id) ON DELETE CASCADE,
    
    current_step integer DEFAULT 0,
    status text DEFAULT 'active', -- active, completed, exited, paused
    
    -- Entry data
    entry_data jsonb DEFAULT '{}',
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    last_action_at timestamptz DEFAULT now(),
    
    -- Performance tracking
    emails_sent integer DEFAULT 0,
    emails_opened integer DEFAULT 0,
    emails_clicked integer DEFAULT 0,
    
    UNIQUE(workflow_id, subscriber_id)
);

-- ============================================
-- ENTERPRISE ANALYTICS & TRACKING
-- ============================================

-- Email events for detailed analytics
CREATE TABLE email_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core identifiers
    campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
    subscriber_id uuid REFERENCES email_subscribers(id) ON DELETE CASCADE,
    message_id text, -- ESP message ID
    
    -- Event details
    event_type text NOT NULL, -- sent, delivered, opened, clicked, bounced, complained, unsubscribed
    event_timestamp timestamptz DEFAULT now(),
    
    -- Event data
    user_agent text,
    ip_address inet,
    country text,
    region text,
    city text,
    device_type text, -- desktop, mobile, tablet
    email_client text, -- gmail, outlook, apple_mail, etc.
    
    -- Click-specific data
    clicked_url text,
    link_index integer,
    
    -- Bounce/complaint data
    bounce_reason text,
    bounce_type text, -- hard, soft
    complaint_feedback_type text,
    
    -- Revenue attribution
    attributed_revenue decimal(10,2) DEFAULT 0,
    attributed_conversion boolean DEFAULT false,
    conversion_type text, -- purchase, signup, download, etc.
    conversion_value decimal(10,2),
    
    -- A/B test data
    ab_test_variant text,
    
    -- Raw ESP data
    esp_data jsonb,
    
    created_at timestamptz DEFAULT now()
);

-- Click heatmap data
CREATE TABLE email_click_heatmaps (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
    
    -- Click coordinates
    click_x integer,
    click_y integer,
    element_selector text,
    element_text text,
    
    -- Aggregated data
    click_count integer DEFAULT 1,
    unique_clicks integer DEFAULT 1,
    
    created_at timestamptz DEFAULT now()
);

-- Revenue attribution tracking
CREATE TABLE email_revenue_attribution (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core data
    subscriber_id uuid REFERENCES email_subscribers(id) ON DELETE CASCADE,
    campaign_id uuid REFERENCES email_campaigns(id),
    workflow_id uuid REFERENCES email_workflows(id),
    
    -- Attribution model
    attribution_model text DEFAULT 'last_click', -- first_click, last_click, linear, time_decay
    attribution_window_hours integer DEFAULT 168, -- 7 days
    
    -- Revenue data
    order_id text,
    revenue_amount decimal(10,2) NOT NULL,
    currency text DEFAULT 'USD',
    commission_rate decimal(5,2),
    
    -- Attribution details
    touchpoint_sequence jsonb, -- Array of all email touchpoints
    attribution_percentage decimal(5,2) DEFAULT 100,
    
    -- Timestamps
    first_touch_at timestamptz,
    last_touch_at timestamptz,
    conversion_at timestamptz DEFAULT now(),
    
    created_at timestamptz DEFAULT now()
);

-- Campaign performance summaries (materialized for speed)
CREATE TABLE email_campaign_analytics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
    
    -- Basic metrics
    emails_sent integer DEFAULT 0,
    emails_delivered integer DEFAULT 0,
    emails_opened integer DEFAULT 0,
    emails_clicked integer DEFAULT 0,
    emails_bounced integer DEFAULT 0,
    emails_complained integer DEFAULT 0,
    emails_unsubscribed integer DEFAULT 0,
    
    -- Calculated rates
    delivery_rate decimal(5,2) DEFAULT 0,
    open_rate decimal(5,2) DEFAULT 0,
    click_rate decimal(5,2) DEFAULT 0,
    bounce_rate decimal(5,2) DEFAULT 0,
    complaint_rate decimal(5,2) DEFAULT 0,
    unsubscribe_rate decimal(5,2) DEFAULT 0,
    click_to_open_rate decimal(5,2) DEFAULT 0,
    
    -- Advanced metrics
    unique_opens integer DEFAULT 0,
    unique_clicks integer DEFAULT 0,
    forward_count integer DEFAULT 0,
    print_count integer DEFAULT 0,
    
    -- Revenue attribution
    total_attributed_revenue decimal(10,2) DEFAULT 0,
    total_conversions integer DEFAULT 0,
    revenue_per_recipient decimal(10,2) DEFAULT 0,
    roi_percentage decimal(8,2) DEFAULT 0,
    
    -- Device/client breakdown
    desktop_opens integer DEFAULT 0,
    mobile_opens integer DEFAULT 0,
    tablet_opens integer DEFAULT 0,
    
    -- Geographic data
    top_countries jsonb DEFAULT '[]',
    top_regions jsonb DEFAULT '[]',
    
    -- Time-based metrics
    best_send_time time,
    avg_time_to_open interval,
    avg_time_to_click interval,
    
    -- Last updated
    last_calculated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- ============================================
-- n8n INTEGRATION TABLES
-- ============================================

-- n8n webhook configurations
CREATE TABLE n8n_webhooks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
    
    webhook_name text NOT NULL,
    webhook_url text NOT NULL,
    webhook_secret text,
    
    -- Trigger configuration
    trigger_events text[], -- Array of events that trigger this webhook
    event_filters jsonb, -- Additional filtering rules
    
    -- Status
    is_active boolean DEFAULT true,
    last_triggered_at timestamptz,
    trigger_count integer DEFAULT 0,
    
    -- Rate limiting
    rate_limit_per_minute integer DEFAULT 60,
    rate_limit_per_hour integer DEFAULT 1000,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Webhook event log
CREATE TABLE n8n_webhook_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id uuid REFERENCES n8n_webhooks(id) ON DELETE CASCADE,
    
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    response_status integer,
    response_body text,
    processing_time_ms integer,
    
    created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Campaign indexes
CREATE INDEX idx_email_campaigns_agency_client ON email_campaigns(agency_id, client_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_send_time ON email_campaigns(send_time);
CREATE INDEX idx_email_campaigns_created_at ON email_campaigns(created_at);

-- Subscriber indexes
CREATE INDEX idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX idx_email_subscribers_agency_client ON email_subscribers(agency_id, client_id);
CREATE INDEX idx_email_subscribers_status ON email_subscribers(status);
CREATE INDEX idx_email_subscribers_engagement ON email_subscribers(engagement_score);
CREATE INDEX idx_email_subscribers_tags ON email_subscribers USING gin(tags);

-- Events indexes (most important for analytics)
CREATE INDEX idx_email_events_campaign ON email_events(campaign_id);
CREATE INDEX idx_email_events_subscriber ON email_events(subscriber_id);
CREATE INDEX idx_email_events_type_timestamp ON email_events(event_type, event_timestamp);
CREATE INDEX idx_email_events_timestamp ON email_events(event_timestamp);

-- List indexes
CREATE INDEX idx_email_lists_agency_client ON email_lists(agency_id, client_id);
CREATE INDEX idx_email_list_subscribers_list ON email_list_subscribers(list_id);
CREATE INDEX idx_email_list_subscribers_subscriber ON email_list_subscribers(subscriber_id);

-- Workflow indexes
CREATE INDEX idx_email_workflows_agency_client ON email_workflows(agency_id, client_id);
CREATE INDEX idx_email_workflow_entries_workflow ON email_workflow_entries(workflow_id);
CREATE INDEX idx_email_workflow_entries_subscriber ON email_workflow_entries(subscriber_id);

-- Analytics indexes
CREATE INDEX idx_email_campaign_analytics_campaign ON email_campaign_analytics(campaign_id);
CREATE INDEX idx_email_revenue_attribution_subscriber ON email_revenue_attribution(subscriber_id);
CREATE INDEX idx_email_revenue_attribution_campaign ON email_revenue_attribution(campaign_id);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATES
-- ============================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_subscribers_updated_at BEFORE UPDATE ON email_subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_lists_updated_at BEFORE UPDATE ON email_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_workflows_updated_at BEFORE UPDATE ON email_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(subscriber_uuid uuid)
RETURNS integer AS $$
DECLARE
    score integer := 50; -- Base score
    recent_opens integer;
    recent_clicks integer;
    days_since_last_engagement integer;
BEGIN
    -- Count recent opens (last 30 days)
    SELECT COUNT(*) INTO recent_opens
    FROM email_events
    WHERE subscriber_id = subscriber_uuid
      AND event_type = 'opened'
      AND event_timestamp >= now() - interval '30 days';
    
    -- Count recent clicks (last 30 days)
    SELECT COUNT(*) INTO recent_clicks
    FROM email_events
    WHERE subscriber_id = subscriber_uuid
      AND event_type = 'clicked'
      AND event_timestamp >= now() - interval '30 days';
    
    -- Days since last engagement
    SELECT EXTRACT(days FROM now() - MAX(event_timestamp))::integer INTO days_since_last_engagement
    FROM email_events
    WHERE subscriber_id = subscriber_uuid
      AND event_type IN ('opened', 'clicked');
    
    -- Calculate score
    score := score + (recent_opens * 2) + (recent_clicks * 5);
    
    -- Decay based on inactivity
    IF days_since_last_engagement > 30 THEN
        score := score - (days_since_last_engagement - 30);
    END IF;
    
    -- Ensure score is between 0 and 100
    score := GREATEST(0, LEAST(100, score));
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Policies (users can only access their agency's data)
CREATE POLICY "Users can only access their agency's campaigns" ON email_campaigns
    FOR ALL USING (agency_id = auth.jwt() ->> 'agency_id'::text);

CREATE POLICY "Users can only access their agency's subscribers" ON email_subscribers
    FOR ALL USING (agency_id = auth.jwt() ->> 'agency_id'::text);

-- Add more RLS policies as needed...

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert default email service provider
INSERT INTO email_service_providers (name, api_key, daily_limit, monthly_limit, is_primary)
VALUES ('resend', 'your-resend-api-key-here', 50000, 1500000, true);

-- Create indexes for full-text search
CREATE INDEX idx_email_campaigns_search ON email_campaigns USING gin(to_tsvector('english', name || ' ' || coalesce(subject, '')));
CREATE INDEX idx_email_subscribers_search ON email_subscribers USING gin(to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || email));

-- ============================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ============================================

-- Campaign performance summary
CREATE MATERIALIZED VIEW mv_campaign_performance AS
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.agency_id,
    c.client_id,
    COUNT(CASE WHEN e.event_type = 'sent' THEN 1 END) as emails_sent,
    COUNT(CASE WHEN e.event_type = 'delivered' THEN 1 END) as emails_delivered,
    COUNT(CASE WHEN e.event_type = 'opened' THEN 1 END) as emails_opened,
    COUNT(CASE WHEN e.event_type = 'clicked' THEN 1 END) as emails_clicked,
    COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.subscriber_id END) as unique_opens,
    COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.subscriber_id END) as unique_clicks,
    SUM(CASE WHEN e.event_type = 'clicked' THEN COALESCE(e.attributed_revenue, 0) ELSE 0 END) as total_revenue
FROM email_campaigns c
LEFT JOIN email_events e ON c.id = e.campaign_id
GROUP BY c.id, c.name, c.agency_id, c.client_id;

CREATE UNIQUE INDEX ON mv_campaign_performance (campaign_id);

-- Refresh materialized view function (call this periodically)
CREATE OR REPLACE FUNCTION refresh_email_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_campaign_performance;
END;
$$ LANGUAGE plpgsql;

COMMENT ON SCHEMA public IS 'Ultimate Email Marketing System - Enterprise Schema';