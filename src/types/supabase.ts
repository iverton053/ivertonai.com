// Supabase integration types for Brand Asset Management

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  bucketName: string;
}

export interface FileUploadOptions {
  path: string;
  file: File | Blob;
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface FileDownloadOptions {
  path: string;
  transform?: {
    width?: number;
    height?: number;
    resize?: 'contain' | 'cover' | 'fill';
    quality?: number;
  };
}

export interface SupabaseStorageResponse<T = any> {
  data: T | null;
  error: Error | null;
}

export interface FileObject {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, any>;
  buckets?: Bucket;
}

export interface Bucket {
  id: string;
  name: string;
  owner?: string;
  created_at?: string;
  updated_at?: string;
  public?: boolean;
  avif_autodetection?: boolean;
  file_size_limit?: number;
  allowed_mime_types?: string[];
}

// Asset storage paths for organizing files
export interface AssetStoragePaths {
  logos: string;
  icons: string;
  images: string;
  documents: string;
  templates: string;
  thumbnails: string;
  versions: string;
}

// File upload progress tracking
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

// Asset metadata stored alongside files
export interface AssetMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  uploadedBy: string;
  clientId: string;
  assetType: string;
  version: number;
  parentAssetId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}