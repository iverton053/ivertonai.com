export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  category: FileCategory;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  updatedAt: Date;
  uploadedBy: string;
  url?: string;
  thumbnailUrl?: string;
  tags: string[];
  description?: string;
  version: number;
  parentId?: string;
  metadata: FileMetadata;
  permissions: FilePermissions;
  sharedWith: SharedAccess[];
  isShared: boolean;
  downloadCount: number;
  lastAccessed?: Date;
}

export interface FileMetadata {
  originalName: string;
  checksum: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  pages?: number;
  textContent?: string;
  exifData?: Record<string, any>;
}

export interface FilePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canDownload: boolean;
  canComment: boolean;
}

export interface SharedAccess {
  userId: string;
  userEmail: string;
  userName: string;
  role: 'viewer' | 'editor' | 'admin';
  sharedAt: Date;
  expiresAt?: Date;
  canReshare: boolean;
}

export type FileType = 
  | 'document' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'archive' 
  | 'spreadsheet' 
  | 'presentation'
  | 'pdf'
  | 'other';

export type FileCategory = 
  | 'contracts' 
  | 'creative-assets' 
  | 'invoices' 
  | 'reports' 
  | 'presentations'
  | 'templates'
  | 'media'
  | 'documents'
  | 'uncategorized';

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  estimatedTime?: number;
}

export interface FileFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  createdBy: string;
  color?: string;
  description?: string;
  isShared: boolean;
  permissions: FilePermissions;
  fileCount: number;
  subfolderCount: number;
}

export interface FileComment {
  id: string;
  fileId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  replies: FileComment[];
  isResolved: boolean;
}

export interface FileActivity {
  id: string;
  fileId: string;
  userId: string;
  userName: string;
  action: FileAction;
  timestamp: Date;
  details?: Record<string, any>;
  ipAddress?: string;
}

export type FileAction = 
  | 'uploaded'
  | 'downloaded'
  | 'viewed'
  | 'edited'
  | 'deleted'
  | 'shared'
  | 'unshared'
  | 'moved'
  | 'renamed'
  | 'commented'
  | 'restored';

export interface FileSearchFilters {
  query?: string;
  category?: FileCategory[];
  type?: FileType[];
  uploadedBy?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  sharedWithMe?: boolean;
  myUploads?: boolean;
  size?: {
    min?: number;
    max?: number;
  };
}

export interface FileManagerSettings {
  defaultView: 'grid' | 'list' | 'gallery';
  itemsPerPage: number;
  autoGenerateThumbnails: boolean;
  allowedFileTypes: string[];
  maxFileSize: number;
  compressionEnabled: boolean;
  versioningEnabled: boolean;
  retentionPeriod?: number;
  watermarkEnabled: boolean;
  virusScanEnabled: boolean;
}

export interface StorageQuota {
  used: number;
  limit: number;
  percentage: number;
  breakdown: {
    category: FileCategory;
    size: number;
    count: number;
  }[];
}

export interface FileManagerState {
  files: FileItem[];
  folders: FileFolder[];
  uploads: FileUploadProgress[];
  selectedFiles: string[];
  currentFolder?: string;
  searchFilters: FileSearchFilters;
  view: 'grid' | 'list' | 'gallery';
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error?: string;
  settings: FileManagerSettings;
  quota: StorageQuota;
  recentFiles: FileItem[];
  sharedFiles: FileItem[];
  favoriteFiles: string[];
}