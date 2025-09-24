import { useMemo } from 'react';
import PermissionService from '../services/permissionService';
import { CRMResource, CRMAction, PermissionCheck, PermissionContext } from '../types/permissions';

// Hook for permission checking
export const usePermissions = (userId: string) => {
  const permissionService = PermissionService.getInstance();
  
  const context = useMemo(() => 
    permissionService.getPermissionContext(userId), 
    [userId, permissionService]
  );

  const hasPermission = (resource: CRMResource, action: CRMAction) => {
    return permissionService.hasPermission(userId, { resource, action });
  };

  const hasAnyPermission = (checks: PermissionCheck[]) => {
    return permissionService.hasAnyPermission(userId, checks);
  };

  const hasAllPermissions = (checks: PermissionCheck[]) => {
    return permissionService.hasAllPermissions(userId, checks);
  };

  // Common permission checks
  const can = {
    // Contacts
    createContacts: hasPermission('contacts', 'create'),
    readContacts: hasPermission('contacts', 'read'),
    updateContacts: hasPermission('contacts', 'update'),
    deleteContacts: hasPermission('contacts', 'delete'),
    exportContacts: hasPermission('contacts', 'export'),
    importContacts: hasPermission('contacts', 'import'),
    bulkEditContacts: hasPermission('contacts', 'bulk_edit'),
    
    // Deals
    createDeals: hasPermission('deals', 'create'),
    readDeals: hasPermission('deals', 'read'),
    updateDeals: hasPermission('deals', 'update'),
    deleteDeals: hasPermission('deals', 'delete'),
    exportDeals: hasPermission('deals', 'export'),
    importDeals: hasPermission('deals', 'import'),
    assignDeals: hasPermission('deals', 'assign'),
    
    // Reports
    viewReports: hasPermission('reports', 'read'),
    createReports: hasPermission('reports', 'create'),
    exportReports: hasPermission('reports', 'export'),
    
    // Admin functions
    manageUsers: hasPermission('users', 'update'),
    manageSettings: hasPermission('settings', 'update'),
    viewSensitiveData: hasAnyPermission([
      { resource: 'contacts', action: 'view_sensitive' },
      { resource: 'deals', action: 'view_sensitive' }
    ]),
    
    // Bulk operations
    bulkEdit: hasAnyPermission([
      { resource: 'contacts', action: 'bulk_edit' },
      { resource: 'deals', action: 'bulk_edit' }
    ]),
    
    // Data operations
    exportData: hasAnyPermission([
      { resource: 'contacts', action: 'export' },
      { resource: 'deals', action: 'export' },
      { resource: 'reports', action: 'export' }
    ]),
    
    importData: hasAnyPermission([
      { resource: 'contacts', action: 'import' },
      { resource: 'deals', action: 'import' }
    ])
  };

  const roles = context.roles;
  const permissions = context.permissions;
  
  const isRole = (roleId: string) => roles.some(role => role.id === roleId);
  
  const is = {
    superAdmin: isRole('super-admin'),
    admin: isRole('admin'),
    salesManager: isRole('sales-manager'),  
    salesRep: isRole('sales-rep'),
    marketing: isRole('marketing'),
    viewer: isRole('viewer')
  };

  return {
    context,
    hasPermission,
    hasAnyPermission, 
    hasAllPermissions,
    can,
    is,
    roles,
    permissions
  };
};

// Hook for role management (admin use)
export const useRoleManagement = () => {
  const permissionService = PermissionService.getInstance();
  
  const assignRole = (userId: string, roleId: string) => {
    return permissionService.assignRole(userId, roleId);
  };

  const removeRole = (userId: string, roleId: string) => {
    return permissionService.removeRole(userId, roleId);
  };

  const getAllRoles = () => {
    return permissionService.getAllRoles();
  };

  const getAllPermissions = () => {
    return permissionService.getAllPermissions();
  };

  return {
    assignRole,
    removeRole,
    getAllRoles,
    getAllPermissions
  };
};