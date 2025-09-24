-- File Manager Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('file-manager', 'file-manager', true)
ON CONFLICT (id) DO NOTHING;

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'uncategorized',
    size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES files(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    permissions JSONB NOT NULL DEFAULT '{
        "canView": true,
        "canEdit": true,
        "canDelete": true,
        "canShare": true,
        "canDownload": true,
        "canComment": true
    }',
    shared_with JSONB DEFAULT '[]',
    is_shared BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE
);

-- Storage quotas table
CREATE TABLE IF NOT EXISTS storage_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    used_bytes BIGINT DEFAULT 0,
    limit_bytes BIGINT DEFAULT 10737418240, -- 10GB default
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_quotas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for files
CREATE POLICY "Users can view their own files" ON files
    FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Users can insert their own files" ON files
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own files" ON files
    FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own files" ON files
    FOR DELETE USING (uploaded_by = auth.uid());

-- RLS Policies for storage quotas
CREATE POLICY "Users can view their own quota" ON storage_quotas
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own quota" ON storage_quotas
    FOR ALL USING (user_id = auth.uid());

-- Storage bucket policies
CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'file-manager' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'file-manager' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'file-manager' AND
        auth.role() = 'authenticated'
    );

-- Function to update storage quota
CREATE OR REPLACE FUNCTION update_storage_quota()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO storage_quotas (user_id, used_bytes)
        VALUES (NEW.uploaded_by, NEW.size)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            used_bytes = storage_quotas.used_bytes + NEW.size,
            last_calculated = NOW();
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE storage_quotas 
        SET used_bytes = GREATEST(0, used_bytes - OLD.size),
            last_calculated = NOW()
        WHERE user_id = OLD.uploaded_by;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for storage quota updates
DROP TRIGGER IF EXISTS trigger_update_storage_quota ON files;
CREATE TRIGGER trigger_update_storage_quota
    AFTER INSERT OR DELETE ON files
    FOR EACH ROW EXECUTE FUNCTION update_storage_quota();