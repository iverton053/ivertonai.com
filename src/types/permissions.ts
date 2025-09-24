export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  color: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string;
}

export type CRMResource = 
  | 'contacts' 
  | 'deals' 
  | 'activities' 
  | 'reports' 
  | 'settings' 
  | 'users'
  | 'pipelines'
  | 'campaigns';

export type CRMAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'export' 
  | 'import'
  | 'assign'
  | 'reassign'
  | 'view_sensitive'
  | 'bulk_edit';

export interface PermissionCheck {
  resource: CRMResource;
  action: CRMAction;
  resourceId?: string;
}

// Pre-defined system roles
export const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    id: 'super-admin',
    name: 'Super Admin',
    description: 'Full access to all CRM features and settings',
    color: '#dc2626',
    isSystem: true
  },
  ADMIN: {
    id: 'admin', 
    name: 'Admin',
    description: 'Manage users, settings, and access most features',
    color: '#ea580c',
    isSystem: true
  },
  SALES_MANAGER: {
    id: 'sales-manager',
    name: 'Sales Manager', 
    description: 'Manage sales team, deals, and reports',
    color: '#0ea5e9',
    isSystem: true
  },
  SALES_REP: {
    id: 'sales-rep',
    name: 'Sales Representative',
    description: 'Manage own contacts and deals',
    color: '#10b981',
    isSystem: true
  },
  MARKETING: {
    id: 'marketing',
    name: 'Marketing',
    description: 'Manage campaigns and lead generation',
    color: '#8b5cf6',
    isSystem: true
  },
  VIEWER: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to CRM data',
    color: '#6b7280',
    isSystem: true
  }
} as const;

export interface PermissionContext {
  userId: string;
  roles: Role[];
  permissions: Permission[];
}