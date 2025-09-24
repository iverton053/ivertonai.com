-- ============================================
-- EMAIL DELIVERY ENHANCEMENT MIGRATION
-- Adds tables for production-ready email delivery
-- ============================================

-- Add email service providers configuration
CREATE TABLE IF NOT EXISTS email_service_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  api_key TEXT NOT NULL,
  api_endpoint TEXT,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  rate_limit_per_second INTEGER DEFAULT 10,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add delivery reports table
CREATE TABLE IF NOT EXISTS delivery_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  total_subscribers INTEGER NOT NULL DEFAULT 0,
  successful_deliveries INTEGER NOT NULL DEFAULT 0,
  failed_deliveries INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  error_summary JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add delivery logs table for batch tracking
CREATE TABLE IF NOT EXISTS delivery_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  batch_number INTEGER NOT NULL,
  esp_used VARCHAR(50),
  subscribers_in_batch INTEGER NOT NULL,
  successful_sends INTEGER DEFAULT 0,
  failed_sends INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  error_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enhance email_events table with more fields
ALTER TABLE email_events 
ADD COLUMN IF NOT EXISTS esp_used VARCHAR(50),
ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS bounce_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS bounce_reason TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_service_providers_active ON email_service_providers(is_active, is_primary);
CREATE INDEX IF NOT EXISTS idx_delivery_reports_campaign ON delivery_reports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_campaign ON delivery_logs(campaign_id, batch_number);
CREATE INDEX IF NOT EXISTS idx_email_events_esp ON email_events(esp_used, event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_campaign_type ON email_events(campaign_id, event_type, event_timestamp);

-- Add campaign status enum values
ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'sending';
ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'partially_sent';
ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'failed';

-- Add new campaign fields for delivery tracking
ALTER TABLE email_campaigns 
ADD COLUMN IF NOT EXISTS subscribers_sent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscribers_failed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS send_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS send_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS delivery_esp VARCHAR(50);

-- Create RLS policies
ALTER TABLE email_service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;

-- ESP providers - admin only
CREATE POLICY "ESP providers admin access" ON email_service_providers
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Delivery reports - agency isolation
CREATE POLICY "Delivery reports agency isolation" ON delivery_reports
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM email_campaigns 
      WHERE agency_id = (auth.jwt() ->> 'agency_id')::uuid
    )
  );

-- Delivery logs - agency isolation  
CREATE POLICY "Delivery logs agency isolation" ON delivery_logs
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM email_campaigns 
      WHERE agency_id = (auth.jwt() ->> 'agency_id')::uuid
    )
  );

-- Insert default ESP configurations
INSERT INTO email_service_providers (name, api_key, is_active, is_primary, rate_limit_per_second, rate_limit_per_hour)
VALUES 
  ('resend', 'your-resend-api-key', true, true, 10, 100),
  ('sendgrid', 'your-sendgrid-api-key', true, false, 100, 10000)
ON CONFLICT (name) DO NOTHING;

-- Create function to update campaign delivery stats
CREATE OR REPLACE FUNCTION update_campaign_delivery_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update campaign stats when events are inserted
  UPDATE email_campaigns 
  SET 
    subscribers_sent = (
      SELECT COUNT(*) FROM email_events 
      WHERE campaign_id = NEW.campaign_id AND event_type = 'sent'
    ),
    subscribers_failed = (
      SELECT COUNT(*) FROM email_events 
      WHERE campaign_id = NEW.campaign_id AND event_type = 'failed'
    ),
    updated_at = timezone('utc'::text, now())
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update campaign stats
DROP TRIGGER IF EXISTS trigger_update_campaign_delivery_stats ON email_events;
CREATE TRIGGER trigger_update_campaign_delivery_stats
  AFTER INSERT ON email_events
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_delivery_stats();

-- Create function to get delivery status
CREATE OR REPLACE FUNCTION get_campaign_delivery_status(campaign_uuid UUID)
RETURNS TABLE(
  campaign_id UUID,
  total_subscribers INTEGER,
  sent_count INTEGER,
  failed_count INTEGER,
  pending_count INTEGER,
  success_rate DECIMAL,
  last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as campaign_id,
    COALESCE(c.subscribers_sent + c.subscribers_failed, 0) as total_subscribers,
    COALESCE(c.subscribers_sent, 0) as sent_count,
    COALESCE(c.subscribers_failed, 0) as failed_count,
    GREATEST(0, COALESCE(c.subscribers_sent + c.subscribers_failed, 0) - COALESCE(c.subscribers_sent, 0) - COALESCE(c.subscribers_failed, 0)) as pending_count,
    CASE 
      WHEN COALESCE(c.subscribers_sent + c.subscribers_failed, 0) > 0 
      THEN ROUND((COALESCE(c.subscribers_sent, 0)::DECIMAL / (c.subscribers_sent + c.subscribers_failed)) * 100, 2)
      ELSE 0.00
    END as success_rate,
    COALESCE(c.send_completed_at, c.send_started_at, c.updated_at) as last_activity
  FROM email_campaigns c
  WHERE c.id = campaign_uuid;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger for new tables
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_email_service_providers
  BEFORE UPDATE ON email_service_providers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();