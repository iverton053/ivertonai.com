import { Permission, Role, CRMResource, CRMAction, PermissionCheck, PermissionContext, SYSTEM_ROLES } from '../types/permissions';

class PermissionService {
  private static instance: PermissionService;
  private permissions: Map<string, Permission> = new Map();
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, string[]> = new Map(); // userId -> roleIds[]

  private constructor() {
    this.initializeSystemPermissions();
    this.initializeSystemRoles();
  }

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  private initializeSystemPermissions() {
    const resources: CRMResource[] = ['contacts', 'deals', 'activities', 'reports', 'settings', 'users', 'pipelines', 'campaigns'];
    const actions: CRMAction[] = ['create', 'read', 'update', 'delete', 'export', 'import', 'assign', 'reassign', 'view_sensitive', 'bulk_edit'];

    resources.forEach(resource => {
      actions.forEach(action => {
        const permission: Permission = {
          id: `${resource}:${action}`,
          name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
          resource,
          action,
          description: `Permission to ${action} ${resource}`
        };
        this.permissions.set(permission.id, permission);
      });
    });
  }

  private initializeSystemRoles() {
    // Super Admin - All permissions
    const superAdminPermissions = Array.from(this.permissions.values());
    
    // Admin - All except some sensitive operations
    const adminPermissions = superAdminPermissions.filter(p => 
      !(p.resource === 'users' && p.action === 'delete') &&
      !(p.resource === 'settings' && p.action === 'delete')
    );

    // Sales Manager - Sales focused permissions
    const salesManagerPermissions = superAdminPermissions.filter(p => 
      ['contacts', 'deals', 'activities', 'reports', 'pipelines'].includes(p.resource) ||
      (p.resource === 'campaigns' && ['read', 'update'].includes(p.action))
    );

    // Sales Rep - Own data only
    const salesRepPermissions = superAdminPermissions.filter(p => 
      ['contacts', 'deals', 'activities'].includes(p.resource) && 
      !['delete', 'bulk_edit', 'import', 'view_sensitive'].includes(p.action)
    );

    // Marketing - Campaign focused
    const marketingPermissions = superAdminPermissions.filter(p => 
      ['campaigns', 'contacts'].includes(p.resource) && p.action !== 'delete' ||
      (p.resource === 'reports' && p.action === 'read')
    );

    // Viewer - Read only
    const viewerPermissions = superAdminPermissions.filter(p => p.action === 'read');

    // Create roles
    const roles: Role[] = [
      { ...SYSTEM_ROLES.SUPER_ADMIN, permissions: superAdminPermissions },
      { ...SYSTEM_ROLES.ADMIN, permissions: adminPermissions },
      { ...SYSTEM_ROLES.SALES_MANAGER, permissions: salesManagerPermissions },
      { ...SYSTEM_ROLES.SALES_REP, permissions: salesRepPermissions },
      { ...SYSTEM_ROLES.MARKETING, permissions: marketingPermissions },
      { ...SYSTEM_ROLES.VIEWER, permissions: viewerPermissions }
    ];

    roles.forEach(role => this.roles.set(role.id, role));
  }

  // Permission checking
  public hasPermission(userId: string, check: PermissionCheck): boolean {
    const userRoleIds = this.userRoles.get(userId) || [];
    const userPermissions = this.getUserPermissions(userId);

    return userPermissions.some(permission => 
      permission.resource === check.resource && permission.action === check.action
    );
  }

  public hasAnyPermission(userId: string, checks: PermissionCheck[]): boolean {
    return checks.some(check => this.hasPermission(userId, check));
  }

  public hasAllPermissions(userId: string, checks: PermissionCheck[]): boolean {
    return checks.every(check => this.hasPermission(userId, check));
  }

  // User role management
  public assignRole(userId: string, roleId: string): boolean {
    if (!this.roles.has(roleId)) return false;
    
    const userRoles = this.userRoles.get(userId) || [];
    if (!userRoles.includes(roleId)) {
      userRoles.push(roleId);
      this.userRoles.set(userId, userRoles);
    }
    return true;
  }

  public removeRole(userId: string, roleId: string): boolean {
    const userRoles = this.userRoles.get(userId) || [];
    const index = userRoles.indexOf(roleId);
    
    if (index > -1) {
      userRoles.splice(index, 1);
      this.userRoles.set(userId, userRoles);
      return true;
    }
    return false;
  }

  public getUserRoles(userId: string): Role[] {
    const roleIds = this.userRoles.get(userId) || [];
    return roleIds.map(roleId => this.roles.get(roleId)).filter(Boolean) as Role[];
  }

  public getUserPermissions(userId: string): Permission[] {
    const userRoles = this.getUserRoles(userId);
    const permissions = new Map<string, Permission>();
    
    userRoles.forEach(role => {
      role.permissions.forEach(permission => {
        permissions.set(permission.id, permission);
      });
    });

    return Array.from(permissions.values());
  }

  // Get all available roles and permissions
  public getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  public getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  public getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  public getPermission(permissionId: string): Permission | undefined {
    return this.permissions.get(permissionId);
  }

  // Helper methods for common permission patterns
  public canManageUsers(userId: string): boolean {
    return this.hasPermission(userId, { resource: 'users', action: 'update' });
  }

  public canViewReports(userId: string): boolean {
    return this.hasPermission(userId, { resource: 'reports', action: 'read' });
  }

  public canExportData(userId: string): boolean {
    return this.hasAnyPermission(userId, [
      { resource: 'contacts', action: 'export' },
      { resource: 'deals', action: 'export' }
    ]);
  }

  public canBulkEdit(userId: string): boolean {
    return this.hasAnyPermission(userId, [
      { resource: 'contacts', action: 'bulk_edit' },
      { resource: 'deals', action: 'bulk_edit' }
    ]);
  }

  // Permission context for components
  public getPermissionContext(userId: string): PermissionContext {
    return {
      userId,
      roles: this.getUserRoles(userId),
      permissions: this.getUserPermissions(userId)
    };
  }

  // Validation helpers
  public validateResourceAccess(userId: string, resource: CRMResource, action: CRMAction): void {
    if (!this.hasPermission(userId, { resource, action })) {
      throw new Error(`Access denied: User does not have permission to ${action} ${resource}`);
    }
  }

  // Demo/Development helpers
  public assignDemoRoles() {
    // Assign demo roles for development
    this.assignRole('demo-super-admin', 'super-admin');
    this.assignRole('demo-admin', 'admin');  
    this.assignRole('demo-sales-manager', 'sales-manager');
    this.assignRole('demo-sales-rep', 'sales-rep');
    this.assignRole('demo-marketing', 'marketing');
    this.assignRole('demo-viewer', 'viewer');
  }
}

export default PermissionService;