export type BrandAssetType = 
  | 'logo' 
  | 'icon' 
  | 'color-palette' 
  | 'font' 
  | 'template' 
  | 'image' 
  | 'video'
  | 'document'
  | 'guideline';

export type BrandAssetVariant = 
  | 'primary' 
  | 'secondary' 
  | 'dark' 
  | 'light' 
  | 'monochrome' 
  | 'full-color'
  | 'horizontal'
  | 'vertical'
  | 'stacked'
  | 'icon-only'
  | 'text-only';

export type BrandAssetFormat = 
  | 'png' 
  | 'jpg' 
  | 'svg' 
  | 'pdf' 
  | 'eps' 
  | 'ai'
  | 'psd'
  | 'sketch'
  | 'figma'
  | 'mp4'
  | 'mov'
  | 'gif';

export type AssetUsageContext = 
  | 'social-media'
  | 'website'
  | 'email'
  | 'print'
  | 'advertising'
  | 'presentation'
  | 'merchandise'
  | 'packaging';

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
  colors: Array<{
    name: string;
    hex: string;
    rgb: string;
    cmyk?: string;
    pantone?: string;
    usage: string;
  }>;
}

export interface FontDefinition {
  id: string;
  name: string;
  family: string;
  weights: string[];
  styles: string[];
  webFont?: string;
  googleFontUrl?: string;
  usage: {
    headers?: boolean;
    body?: boolean;
    captions?: boolean;
    ui?: boolean;
  };
}

export interface BrandGuidelines {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  logoSpacing: {
    minimum: string;
    recommended: string;
    clearSpace: string;
  };
  colorPalettes: ColorPalette[];
  fonts: FontDefinition[];
  doNotUse: string[];
  usage: {
    contexts: AssetUsageContext[];
    restrictions: string[];
    approvedUses: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetUsageHistory {
  id: string;
  assetId: string;
  usedBy: string;
  usedIn: string; // Campaign ID, project name, etc.
  context: AssetUsageContext;
  usedAt: Date;
  downloadCount: number;
}

export interface BrandAsset {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  type: BrandAssetType;
  variant?: BrandAssetVariant;
  format: BrandAssetFormat;
  fileSize: number;
  dimensions?: {
    width: number;
    height: number;
  };
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  
  // Brand-specific metadata
  isApproved: boolean;
  isPrimary: boolean; // Primary version of this asset type
  versionNumber: number;
  parentAssetId?: string; // For versions/variants
  
  // Usage tracking
  usageHistory: AssetUsageHistory[];
  totalDownloads: number;
  lastUsed?: Date;
  
  // Compliance
  guidelinesCompliant: boolean;
  complianceNotes?: string[];
  
  // File management
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // For time-sensitive assets
  
  // Permissions
  isPublic: boolean;
  allowedUsers: string[];
  allowedContexts: AssetUsageContext[];
}

export interface BrandAssetCollection {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  assetIds: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandAssetFilters {
  clientId?: string;
  type?: BrandAssetType[];
  variant?: BrandAssetVariant[];
  format?: BrandAssetFormat[];
  isApproved?: boolean;
  isPrimary?: boolean;
  tags?: string[];
  searchQuery?: string;
  usageContext?: AssetUsageContext[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    minSize: number;
    maxSize: number;
  };
}

export interface BrandAssetAnalytics {
  totalAssets: number;
  assetsByType: Record<BrandAssetType, number>;
  assetsByClient: Record<string, number>;
  mostUsedAssets: Array<{
    asset: BrandAsset;
    usageCount: number;
  }>;
  recentUploads: BrandAsset[];
  storageUsed: number;
  complianceRate: number;
  averageUsagePerAsset: number;
  topPerformingFormats: Array<{
    format: BrandAssetFormat;
    count: number;
    averageDownloads: number;
  }>;
}

export interface BrandAssetSettings {
  autoApproval: boolean;
  requireGuidelines: boolean;
  enforceNaming: boolean;
  namingTemplate: string;
  allowedFormats: BrandAssetFormat[];
  maxFileSize: number;
  enableVersioning: boolean;
  enableUsageTracking: boolean;
  enableExpirationReminders: boolean;
  defaultTags: string[];
  compressionSettings: {
    enabled: boolean;
    quality: number;
    maxWidth: number;
    maxHeight: number;
  };
}

export interface BrandAssetState {
  assets: BrandAsset[];
  guidelines: BrandGuidelines[];
  collections: BrandAssetCollection[];
  filters: BrandAssetFilters;
  selectedAssets: string[];
  activeClient?: string;
  activeCollection?: string;
  view: 'grid' | 'list' | 'guidelines';
  sortBy: 'name' | 'date' | 'usage' | 'type' | 'size';
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error?: string;
  settings: BrandAssetSettings;
  analytics: BrandAssetAnalytics;

  // Supabase integration state
  supabase: {
    initialized: boolean;
    url?: string;
    bucketName?: string;
    error?: string;
  };
}

// Pre-defined brand asset templates
export const DEFAULT_ASSET_TYPES: Array<{
  type: BrandAssetType;
  variants: BrandAssetVariant[];
  recommendedFormats: BrandAssetFormat[];
  description: string;
}> = [
  {
    type: 'logo',
    variants: ['primary', 'secondary', 'dark', 'light', 'monochrome', 'horizontal', 'vertical', 'stacked', 'icon-only'],
    recommendedFormats: ['svg', 'png', 'eps', 'pdf'],
    description: 'Company logos and brand marks'
  },
  {
    type: 'icon',
    variants: ['primary', 'secondary', 'monochrome', 'full-color'],
    recommendedFormats: ['svg', 'png', 'ico'],
    description: 'Icons and symbolic representations'
  },
  {
    type: 'color-palette',
    variants: ['primary', 'secondary'],
    recommendedFormats: ['png', 'pdf'],
    description: 'Brand color swatches and palettes'
  },
  {
    type: 'template',
    variants: ['primary'],
    recommendedFormats: ['psd', 'ai', 'sketch', 'figma', 'pdf'],
    description: 'Design templates for various marketing materials'
  },
  {
    type: 'image',
    variants: ['primary'],
    recommendedFormats: ['jpg', 'png', 'webp'],
    description: 'Photography and graphic assets'
  }
];

// Brand compliance validation rules
export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: 'file-format' | 'dimensions' | 'file-size' | 'naming' | 'metadata';
  rule: any;
  severity: 'error' | 'warning' | 'info';
}

export const DEFAULT_COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 'logo-format',
    name: 'Logo Format Requirements',
    description: 'Logos should be provided in vector formats (SVG, EPS) and high-res PNG',
    type: 'file-format',
    rule: { type: 'logo', requiredFormats: ['svg', 'eps', 'png'] },
    severity: 'warning'
  },
  {
    id: 'logo-dimensions',
    name: 'Logo Minimum Dimensions',
    description: 'Logo should be at least 300px wide for print quality',
    type: 'dimensions',
    rule: { type: 'logo', minWidth: 300, minHeight: 100 },
    severity: 'warning'
  },
  {
    id: 'file-naming',
    name: 'File Naming Convention',
    description: 'Files should follow naming convention: client_assettype_variant_version',
    type: 'naming',
    rule: { pattern: /^[a-zA-Z0-9]+_[a-zA-Z0-9]+_[a-zA-Z0-9]+_v\d+\.[a-zA-Z0-9]+$/ },
    severity: 'info'
  }
];