// Role-based permission system for agency hierarchy

export enum UserRole {
  AGENCY_OWNER = 'agency_owner',
  AGENCY_ADMIN = 'agency_admin', 
  TEAM_LEAD = 'team_lead',
  ANALYST = 'analyst',
  CLIENT_VIEW = 'client_view'
}

export enum Permission {
  // Agency Management
  MANAGE_BILLING = 'manage_billing',
  MANAGE_SUBSCRIPTION = 'manage_subscription',
  
  // User Management
  INVITE_USERS = 'invite_users',
  REMOVE_USERS = 'remove_users',
  MANAGE_USER_ROLES = 'manage_user_roles',
  VIEW_ALL_USERS = 'view_all_users',
  
  // Client Management
  CREATE_CLIENTS = 'create_clients',
  DELETE_CLIENTS = 'delete_clients',
  ASSIGN_CLIENTS = 'assign_clients',
  VIEW_ALL_CLIENTS = 'view_all_clients',
  VIEW_ASSIGNED_CLIENTS = 'view_assigned_clients',
  
  // Dashboard & Analytics
  VIEW_ALL_ANALYTICS = 'view_all_analytics',
  VIEW_ASSIGNED_ANALYTICS = 'view_assigned_analytics',
  MANAGE_DASHBOARD_SETTINGS = 'manage_dashboard_settings',
  
  // Reports
  GENERATE_REPORTS = 'generate_reports',
  EXPORT_REPORTS = 'export_reports',
  SCHEDULE_REPORTS = 'schedule_reports',
  
  // Advanced Features
  MANAGE_INTEGRATIONS = 'manage_integrations',
  VIEW_ACTIVITY_LOGS = 'view_activity_logs',
  MANAGE_BRANDING = 'manage_branding',
}

// Permission matrix for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.AGENCY_OWNER]: [
    // Full access to everything
    Permission.MANAGE_BILLING,
    Permission.MANAGE_SUBSCRIPTION,
    Permission.INVITE_USERS,
    Permission.REMOVE_USERS,
    Permission.MANAGE_USER_ROLES,
    Permission.VIEW_ALL_USERS,
    Permission.CREATE_CLIENTS,
    Permission.DELETE_CLIENTS,
    Permission.ASSIGN_CLIENTS,
    Permission.VIEW_ALL_CLIENTS,
    Permission.VIEW_ALL_ANALYTICS,
    Permission.MANAGE_DASHBOARD_SETTINGS,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.SCHEDULE_REPORTS,
    Permission.MANAGE_INTEGRATIONS,
    Permission.VIEW_ACTIVITY_LOGS,
    Permission.MANAGE_BRANDING,
  ],
  
  [UserRole.AGENCY_ADMIN]: [
    // Everything except billing
    Permission.INVITE_USERS,
    Permission.REMOVE_USERS,
    Permission.MANAGE_USER_ROLES,
    Permission.VIEW_ALL_USERS,
    Permission.CREATE_CLIENTS,
    Permission.DELETE_CLIENTS,
    Permission.ASSIGN_CLIENTS,
    Permission.VIEW_ALL_CLIENTS,
    Permission.VIEW_ALL_ANALYTICS,
    Permission.MANAGE_DASHBOARD_SETTINGS,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.SCHEDULE_REPORTS,
    Permission.MANAGE_INTEGRATIONS,
    Permission.VIEW_ACTIVITY_LOGS,
  ],
  
  [UserRole.TEAM_LEAD]: [
    // Manage team and assigned clients
    Permission.VIEW_ALL_USERS, // Can see team structure
    Permission.ASSIGN_CLIENTS, // Can assign clients to their team
    Permission.VIEW_ASSIGNED_CLIENTS, // See only assigned clients
    Permission.VIEW_ASSIGNED_ANALYTICS,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.SCHEDULE_REPORTS,
  ],
  
  [UserRole.ANALYST]: [
    // Work with assigned clients only
    Permission.VIEW_ASSIGNED_CLIENTS,
    Permission.VIEW_ASSIGNED_ANALYTICS,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_REPORTS,
  ],
  
  [UserRole.CLIENT_VIEW]: [
    // Very limited access
    Permission.VIEW_ASSIGNED_CLIENTS,
    Permission.VIEW_ASSIGNED_ANALYTICS,
    Permission.GENERATE_REPORTS, // Limited reports
  ]
};

// User interface for permission checking
export interface AgencyUser {
  id: string;
  agency_id: string;
  username: string;
  email: string;
  full_name?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'invited' | 'suspended';
  assigned_clients: string[];
  permissions?: Permission[]; // Custom permission overrides
  department?: string;
  last_login?: string;
  created_at: string;
}

export class PermissionService {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: AgencyUser, permission: Permission): boolean {
    // Check custom permissions first (overrides)
    if (user.permissions && user.permissions.includes(permission)) {
      return true;
    }
    
    // Check if permission is denied in custom permissions
    if (user.permissions && user.permissions.includes(Permission[`NO_${permission}` as keyof typeof Permission])) {
      return false;
    }
    
    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }
  
  /**
   * Check if user can access a specific client
   */
  static canAccessClient(user: AgencyUser, clientId: string): boolean {
    // Owners and admins can access all clients
    if (this.hasPermission(user, Permission.VIEW_ALL_CLIENTS)) {
      return true;
    }
    
    // Other users can only access assigned clients
    if (this.hasPermission(user, Permission.VIEW_ASSIGNED_CLIENTS)) {
      return user.assigned_clients.includes(clientId);
    }
    
    return false;
  }
  
  /**
   * Get list of accessible client IDs for user
   */
  static getAccessibleClients(user: AgencyUser, allClientIds: string[]): string[] {
    if (this.hasPermission(user, Permission.VIEW_ALL_CLIENTS)) {
      return allClientIds;
    }
    
    return user.assigned_clients.filter(id => allClientIds.includes(id));
  }
  
  /**
   * Check if user can manage another user
   */
  static canManageUser(currentUser: AgencyUser, targetUser: AgencyUser): boolean {
    // Can't manage users from different agencies
    if (currentUser.agency_id !== targetUser.agency_id) {
      return false;
    }
    
    // Owners can manage everyone
    if (currentUser.role === UserRole.AGENCY_OWNER) {
      return true;
    }
    
    // Admins can manage everyone except owners
    if (currentUser.role === UserRole.AGENCY_ADMIN && targetUser.role !== UserRole.AGENCY_OWNER) {
      return true;
    }
    
    // Team leads can manage their direct reports
    if (currentUser.role === UserRole.TEAM_LEAD && 
        (targetUser.role === UserRole.ANALYST || targetUser.role === UserRole.CLIENT_VIEW)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get role hierarchy level (higher number = more permissions)
   */
  static getRoleLevel(role: UserRole): number {
    const levels = {
      [UserRole.CLIENT_VIEW]: 1,
      [UserRole.ANALYST]: 2,
      [UserRole.TEAM_LEAD]: 3,
      [UserRole.AGENCY_ADMIN]: 4,
      [UserRole.AGENCY_OWNER]: 5
    };
    return levels[role] || 0;
  }
  
  /**
   * Check if user can assign role to another user
   */
  static canAssignRole(currentUser: AgencyUser, targetRole: UserRole): boolean {
    const currentLevel = this.getRoleLevel(currentUser.role);
    const targetLevel = this.getRoleLevel(targetRole);
    
    // Can only assign roles at or below your level
    return currentLevel > targetLevel;
  }
  
  /**
   * Get all permissions for a user (role-based + custom)
   */
  static getUserPermissions(user: AgencyUser): Permission[] {
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const customPermissions = user.permissions || [];
    
    // Merge and deduplicate
    return Array.from(new Set([...rolePermissions, ...customPermissions]));
  }
  
  /**
   * Check multiple permissions at once
   */
  static hasAnyPermission(user: AgencyUser, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }
  
  /**
   * Check if user has all specified permissions
   */
  static hasAllPermissions(user: AgencyUser, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }
}

// React hook for permission checking
import { useCustomAuthStore } from '../stores/customAuthStore';

export function usePermissions() {
  const { user } = useCustomAuthStore();
  
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return PermissionService.hasPermission(user as AgencyUser, permission);
  };
  
  const canAccessClient = (clientId: string): boolean => {
    if (!user) return false;
    return PermissionService.canAccessClient(user as AgencyUser, clientId);
  };
  
  const canManageUser = (targetUser: AgencyUser): boolean => {
    if (!user) return false;
    return PermissionService.canManageUser(user as AgencyUser, targetUser);
  };
  
  return {
    hasPermission,
    canAccessClient,
    canManageUser,
    user: user as AgencyUser | null,
    isOwner: user?.role === UserRole.AGENCY_OWNER,
    isAdmin: user?.role === UserRole.AGENCY_ADMIN,
    isTeamLead: user?.role === UserRole.TEAM_LEAD,
  };
}