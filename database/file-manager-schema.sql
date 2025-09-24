-- File Manager Database Schema for Supabase

-- Enable RLS (Row Level Security)
-- Enable Storage extension
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA "storage";

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('file-manager', 'file-manager', true);

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
    last_accessed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File folders table
CREATE TABLE IF NOT EXISTS file_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES file_folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    color VARCHAR(20),
    description TEXT,
    is_shared BOOLEAN DEFAULT false,
    permissions JSONB NOT NULL DEFAULT '{
        "canView": true,
        "canEdit": true,
        "canDelete": true,
        "canShare": true
    }',
    file_count INTEGER DEFAULT 0,
    subfolder_count INTEGER DEFAULT 0
);

-- File comments table
CREATE TABLE IF NOT EXISTS file_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_id UUID REFERENCES file_comments(id) ON DELETE CASCADE,
    is_resolved BOOLEAN DEFAULT false
);

-- File activity log table
CREATE TABLE IF NOT EXISTS file_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB DEFAULT '{}',
    ip_address INET
);

-- File sharing table
CREATE TABLE IF NOT EXISTS file_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_email VARCHAR(255) NOT NULL,
    shared_with_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer',
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    can_reshare BOOLEAN DEFAULT false,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE
);

-- User file preferences table
CREATE TABLE IF NOT EXISTS user_file_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    default_view VARCHAR(20) DEFAULT 'grid',
    items_per_page INTEGER DEFAULT 20,
    auto_generate_thumbnails BOOLEAN DEFAULT true,
    favorite_files UUID[] DEFAULT '{}',
    settings JSONB DEFAULT '{}'
);

-- Storage quota table
CREATE TABLE IF NOT EXISTS storage_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    used_bytes BIGINT DEFAULT 0,
    limit_bytes BIGINT DEFAULT 10737418240, -- 10GB default
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_files_is_shared ON files(is_shared);
CREATE INDEX IF NOT EXISTS idx_file_activity_file_id ON file_activity(file_id);
CREATE INDEX IF NOT EXISTS idx_file_activity_user_id ON file_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_file_id ON file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with_email ON file_shares(shared_with_email);

-- Row Level Security (RLS) Policies

-- Files table policies
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files" ON files
    FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Users can view shared files" ON files
    FOR SELECT USING (
        is_shared = true AND (
            uploaded_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM file_shares 
                WHERE file_id = files.id 
                AND (shared_with_user = auth.uid() OR shared_with_email = (
                    SELECT email FROM auth.users WHERE id = auth.uid()
                ))
            )
        )
    );

CREATE POLICY "Users can insert their own files" ON files
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own files" ON files
    FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own files" ON files
    FOR DELETE USING (uploaded_by = auth.uid());

-- File folders policies
ALTER TABLE file_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own folders" ON file_folders
    FOR ALL USING (created_by = auth.uid());

-- File comments policies
ALTER TABLE file_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on accessible files" ON file_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM files 
            WHERE id = file_comments.file_id 
            AND (uploaded_by = auth.uid() OR is_shared = true)
        )
    );

CREATE POLICY "Users can insert comments on accessible files" ON file_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM files 
            WHERE id = file_comments.file_id 
            AND (uploaded_by = auth.uid() OR is_shared = true)
        )
    );

-- File activity policies
ALTER TABLE file_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity on their files" ON file_activity
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM files 
            WHERE id = file_activity.file_id 
            AND uploaded_by = auth.uid()
        )
    );

-- File shares policies
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares for their files" ON file_shares
    FOR SELECT USING (
        shared_by = auth.uid() OR 
        shared_with_user = auth.uid() OR
        shared_with_email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create shares for their files" ON file_shares
    FOR INSERT WITH CHECK (
        shared_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM files 
            WHERE id = file_shares.file_id 
            AND uploaded_by = auth.uid()
        )
    );

-- Storage policies for file uploads
CREATE POLICY "Users can upload files to their folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'file-manager' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view files they have access to" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'file-manager' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'file-manager' AND
        auth.role() = 'authenticated'
    );

-- Functions for automatic updates

-- Function to update file count in folders
CREATE OR REPLACE FUNCTION update_folder_file_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE file_folders 
        SET file_count = file_count + 1 
        WHERE id = NEW.parent_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE file_folders 
        SET file_count = file_count - 1 
        WHERE id = OLD.parent_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for folder file count
CREATE TRIGGER trigger_update_folder_file_count
    AFTER INSERT OR DELETE ON files
    FOR EACH ROW EXECUTE FUNCTION update_folder_file_count();

-- Function to log file activity
CREATE OR REPLACE FUNCTION log_file_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO file_activity (file_id, user_id, action, details)
        VALUES (NEW.id, NEW.uploaded_by, 'uploaded', 
                json_build_object('file_name', NEW.name, 'file_size', NEW.size));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO file_activity (file_id, user_id, action, details)
        VALUES (OLD.id, auth.uid(), 'deleted', 
                json_build_object('file_name', OLD.name));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for file activity logging
CREATE TRIGGER trigger_log_file_activity
    AFTER INSERT OR DELETE ON files
    FOR EACH ROW EXECUTE FUNCTION log_file_activity();

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
        SET used_bytes = used_bytes - OLD.size,
            last_calculated = NOW()
        WHERE user_id = OLD.uploaded_by;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for storage quota updates
CREATE TRIGGER trigger_update_storage_quota
    AFTER INSERT OR DELETE ON files
    FOR EACH ROW EXECUTE FUNCTION update_storage_quota();