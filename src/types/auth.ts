// User authentication and authorization types

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  permissions: Permission[];
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export type UserRole =
  | 'super_admin'     // Full system access
  | 'org_admin'       // Organization admin
  | 'brand_manager'   // Can manage brand assets and guidelines
  | 'designer'        // Can upload and edit assets
  | 'viewer'          // Read-only access
  | 'external';       // External collaborator with limited access

export type Permission =
  // Asset management
  | 'assets:create'
  | 'assets:read'
  | 'assets:update'
  | 'assets:delete'
  | 'assets:approve'
  | 'assets:download'
  | 'assets:share'
  | 'assets:export'

  // Guidelines management
  | 'guidelines:create'
  | 'guidelines:read'
  | 'guidelines:update'
  | 'guidelines:delete'

  // User management
  | 'users:create'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'users:invite'

  // Organization management
  | 'organization:read'
  | 'organization:update'
  | 'organization:billing'

  // Analytics
  | 'analytics:read'

  // Settings
  | 'settings:read'
  | 'settings:update';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: {
    assetUpdates: boolean;
    sharing: boolean;
    approvals: boolean;
    systemUpdates: boolean;
  };
  defaultView: 'grid' | 'list';
  assetsPerPage: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  plan: SubscriptionPlan;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  maxUsers: number;
  maxAssets: number;
  maxStorage: number; // in bytes
  features: string[];
  price?: {
    monthly: number;
    yearly: number;
  };
}

export interface OrganizationSettings {
  brandColors: string[];
  allowedFileTypes: string[];
  maxFileSize: number;
  requireApproval: boolean;
  enableVersionControl: boolean;
  enableUsageTracking: boolean;
  defaultAssetTags: string[];
  customFields: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';
  required: boolean;
  options?: string[]; // for select/multiselect
}

export interface AuthState {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  role?: UserRole;
}

export interface InviteData {
  email: string;
  role: UserRole;
  permissions?: Permission[];
  message?: string;
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'assets:create', 'assets:read', 'assets:update', 'assets:delete', 'assets:approve',
    'assets:download', 'assets:share', 'assets:export',
    'guidelines:create', 'guidelines:read', 'guidelines:update', 'guidelines:delete',
    'users:create', 'users:read', 'users:update', 'users:delete', 'users:invite',
    'organization:read', 'organization:update', 'organization:billing',
    'analytics:read', 'settings:read', 'settings:update'
  ],

  org_admin: [
    'assets:create', 'assets:read', 'assets:update', 'assets:delete', 'assets:approve',
    'assets:download', 'assets:share', 'assets:export',
    'guidelines:create', 'guidelines:read', 'guidelines:update', 'guidelines:delete',
    'users:create', 'users:read', 'users:update', 'users:delete', 'users:invite',
    'organization:read', 'organization:update',
    'analytics:read', 'settings:read', 'settings:update'
  ],

  brand_manager: [
    'assets:create', 'assets:read', 'assets:update', 'assets:delete', 'assets:approve',
    'assets:download', 'assets:share', 'assets:export',
    'guidelines:create', 'guidelines:read', 'guidelines:update', 'guidelines:delete',
    'users:read', 'analytics:read'
  ],

  designer: [
    'assets:create', 'assets:read', 'assets:update', 'assets:download', 'assets:share',
    'guidelines:read', 'users:read'
  ],

  viewer: [
    'assets:read', 'assets:download', 'guidelines:read', 'users:read'
  ],

  external: [
    'assets:read', 'assets:download'
  ]
};

// Default user preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  emailNotifications: {
    assetUpdates: true,
    sharing: true,
    approvals: true,
    systemUpdates: false
  },
  defaultView: 'grid',
  assetsPerPage: 20
};

// Authentication events
export type AuthEvent =
  | 'login'
  | 'logout'
  | 'signup'
  | 'password_reset'
  | 'email_verified'
  | 'profile_updated'
  | 'permissions_changed';

export interface AuthEventData {
  event: AuthEvent;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}