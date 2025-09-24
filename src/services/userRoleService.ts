export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'manage';
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

class UserRoleService {
  private currentUserRole: UserRole = 'admin'; // Default to admin for demo
  
  private roleHierarchy: Record<UserRole, number> = {
    'viewer': 1,
    'user': 2,
    'manager': 3,
    'admin': 4
  };

  private rolePermissions: RolePermissions[] = [
    {
      role: 'viewer',
      permissions: [
        { resource: 'dashboard', action: 'read' },
        { resource: 'widgets', action: 'read' },
        { resource: 'reports', action: 'read' }
      ]
    },
    {
      role: 'user',
      permissions: [
        { resource: 'dashboard', action: 'read' },
        { resource: 'dashboard', action: 'write' },
        { resource: 'widgets', action: 'read' },
        { resource: 'widgets', action: 'write' },
        { resource: 'reports', action: 'read' },
        { resource: 'profile', action: 'write' },
        { resource: 'notifications', action: 'write' }
      ]
    },
    {
      role: 'manager',
      permissions: [
        { resource: 'dashboard', action: 'read' },
        { resource: 'dashboard', action: 'write' },
        { resource: 'widgets', action: 'read' },
        { resource: 'widgets', action: 'write' },
        { resource: 'widgets', action: 'manage' },
        { resource: 'reports', action: 'read' },
        { resource: 'reports', action: 'write' },
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'write' },
        { resource: 'profile', action: 'write' },
        { resource: 'notifications', action: 'write' },
        { resource: 'application', action: 'write' }
      ]
    },
    {
      role: 'admin',
      permissions: [
        { resource: 'dashboard', action: 'read' },
        { resource: 'dashboard', action: 'write' },
        { resource: 'dashboard', action: 'manage' },
        { resource: 'widgets', action: 'read' },
        { resource: 'widgets', action: 'write' },
        { resource: 'widgets', action: 'manage' },
        { resource: 'reports', action: 'read' },
        { resource: 'reports', action: 'write' },
        { resource: 'reports', action: 'manage' },
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'write' },
        { resource: 'users', action: 'manage' },
        { resource: 'system', action: 'read' },
        { resource: 'system', action: 'write' },
        { resource: 'system', action: 'manage' },
        { resource: 'company', action: 'read' },
        { resource: 'company', action: 'write' },
        { resource: 'company', action: 'manage' },
        { resource: 'profile', action: 'write' },
        { resource: 'notifications', action: 'write' },
        { resource: 'application', action: 'write' },
        { resource: 'backup', action: 'read' },
        { resource: 'backup', action: 'write' },
        { resource: 'backup', action: 'manage' }
      ]
    }
  ];

  // Get current user role
  getCurrentUserRole(): UserRole {
    return this.currentUserRole;
  }

  // Set user role (for testing/demo purposes)
  setUserRole(role: UserRole): void {
    this.currentUserRole = role;
  }

  // Check if user has permission
  hasPermission(resource: string, action: 'read' | 'write' | 'delete' | 'manage'): boolean {
    const userPermissions = this.rolePermissions.find(rp => rp.role === this.currentUserRole);
    if (!userPermissions) return false;

    return userPermissions.permissions.some(p => 
      p.resource === resource && (p.action === action || p.action === 'manage')
    );
  }

  // Check if user has at least a certain role level
  hasRoleLevel(requiredRole: UserRole): boolean {
    const userLevel = this.roleHierarchy[this.currentUserRole] || 0;
    const requiredLevel = this.roleHierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
  }

  // Get all permissions for current user
  getUserPermissions(): Permission[] {
    const userPermissions = this.rolePermissions.find(rp => rp.role === this.currentUserRole);
    return userPermissions?.permissions || [];
  }

  // Check if user can access admin-only settings
  canAccessAdminSettings(): boolean {
    return this.hasPermission('system', 'manage') || this.hasPermission('company', 'manage');
  }

  // Check if user can modify company branding
  canModifyCompanyBranding(): boolean {
    return this.hasPermission('company', 'write');
  }

  // Check if user can access system settings
  canAccessSystemSettings(): boolean {
    return this.hasPermission('system', 'read');
  }

  // Check if user can access backup settings
  canAccessBackupSettings(): boolean {
    return this.hasPermission('backup', 'read');
  }

  // Get role display information
  getRoleInfo(role?: UserRole): { 
    name: string; 
    description: string; 
    color: string;
    level: number;
  } {
    const targetRole = role || this.currentUserRole;
    
    const roleInfo = {
      'viewer': {
        name: 'Viewer',
        description: 'Read-only access to dashboard and reports',
        color: 'gray',
        level: 1
      },
      'user': {
        name: 'User',
        description: 'Standard user with basic editing capabilities',
        color: 'blue',
        level: 2
      },
      'manager': {
        name: 'Manager',
        description: 'Team manager with user management capabilities',
        color: 'green',
        level: 3
      },
      'admin': {
        name: 'Administrator',
        description: 'Full access to all system features and settings',
        color: 'purple',
        level: 4
      }
    };

    return roleInfo[targetRole] || roleInfo['user'];
  }

  // Validate access to settings tab
  canAccessSettingsTab(tabId: string): boolean {
    switch (tabId) {
      case 'profile':
        return this.hasPermission('profile', 'write');
      case 'dashboard':
        return this.hasPermission('dashboard', 'write');
      case 'notifications':
        return this.hasPermission('notifications', 'write');
      case 'privacy':
        return true; // Everyone can access privacy settings
      case 'application':
        return this.hasPermission('application', 'write');
      case 'system':
        return this.canAccessSystemSettings();
      case 'backup':
        return this.canAccessBackupSettings();
      case 'presets':
      case 'history':
        return this.hasRoleLevel('user');
      default:
        return true;
    }
  }

  // Get warning message for restricted access
  getAccessWarningMessage(resource: string): string {
    const roleInfo = this.getRoleInfo();
    return `Access to ${resource} requires ${this.hasRoleLevel('admin') ? 'administrator' : 'elevated'} privileges. Your current role is ${roleInfo.name}.`;
  }
}

// Export singleton instance
export const userRoleService = new UserRoleService();
export default userRoleService;