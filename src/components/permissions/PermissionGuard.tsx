import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { CRMResource, CRMAction } from '../../types/permissions';

interface PermissionGuardProps {
  userId: string;
  resource: CRMResource;
  action: CRMAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

interface MultiPermissionGuardProps {
  userId: string;
  permissions: Array<{ resource: CRMResource; action: CRMAction }>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission.
}

interface RoleGuardProps {
  userId: string;
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

// Single permission guard
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  userId,
  resource,
  action,
  children,
  fallback = null
}) => {
  const { hasPermission } = usePermissions(userId);

  if (!hasPermission(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Multiple permissions guard
export const MultiPermissionGuard: React.FC<MultiPermissionGuardProps> = ({
  userId,
  permissions,
  children,
  fallback = null,
  requireAll = false
}) => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions(userId);

  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Role-based guard
export const RoleGuard: React.FC<RoleGuardProps> = ({
  userId,
  roles,
  children,
  fallback = null,
  requireAll = false
}) => {
  const { is, roles: userRoles } = usePermissions(userId);

  const hasRole = requireAll
    ? roles.every(role => userRoles.some(userRole => userRole.id === role))
    : roles.some(role => userRoles.some(userRole => userRole.id === role));

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Admin only guard
export const AdminGuard: React.FC<{
  userId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ userId, children, fallback = null }) => {
  const { is } = usePermissions(userId);

  if (!is.admin && !is.superAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Sales team guard (Manager or Rep)
export const SalesGuard: React.FC<{
  userId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ userId, children, fallback = null }) => {
  const { is } = usePermissions(userId);

  if (!is.salesManager && !is.salesRep) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Unauthorized access component
export const UnauthorizedAccess: React.FC<{
  message?: string;
  showContactAdmin?: boolean;
}> = ({ 
  message = "You don't have permission to access this feature.",
  showContactAdmin = true
}) => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-4V9m0 0V7m0 2h2m-2 0H10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Access Restricted</h3>
        <p className="text-gray-400 mb-4">{message}</p>
        {showContactAdmin && (
          <p className="text-sm text-gray-500">
            Contact your administrator to request access to this feature.
          </p>
        )}
      </div>
    </div>
  );
};

// Higher-order component for permission checking
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  resource: CRMResource,
  action: CRMAction,
  fallback?: React.ComponentType
) {
  return (props: P & { userId: string }) => {
    const { hasPermission } = usePermissions(props.userId);
    
    if (!hasPermission(resource, action)) {
      return fallback ? <fallback /> : <UnauthorizedAccess />;
    }
    
    return <Component {...props} />;
  };
}

// Higher-order component for role checking
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string[],
  fallback?: React.ComponentType
) {
  return (props: P & { userId: string }) => {
    const { roles } = usePermissions(props.userId);
    
    const hasAllowedRole = roles.some(role => 
      allowedRoles.includes(role.id)
    );
    
    if (!hasAllowedRole) {
      return fallback ? <fallback /> : <UnauthorizedAccess />;
    }
    
    return <Component {...props} />;
  };
}