import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Settings, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { usePermissions, useRoleManagement } from '../../hooks/usePermissions';
import { Role, Permission, SYSTEM_ROLES } from '../../types/permissions';
import { PermissionGuard, AdminGuard } from './PermissionGuard';

interface RoleManagementProps {
  userId: string;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ userId }) => {
  const { can, roles: userRoles } = usePermissions(userId);
  const { getAllRoles, getAllPermissions } = useRoleManagement();
  
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'users'>('roles');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showEditRole, setShowEditRole] = useState(false);

  const allRoles = getAllRoles();
  const allPermissions = getAllPermissions();

  // Mock user data - in production this would come from your user store
  const mockUsers = [
    { id: 'user-1', name: 'John Doe', email: 'john@company.com', roles: ['sales-rep'] },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@company.com', roles: ['sales-manager'] },
    { id: 'user-3', name: 'Mike Johnson', email: 'mike@company.com', roles: ['admin'] },
  ];

  const RoleCard: React.FC<{ role: Role }> = ({ role }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6 hover:bg-gray-800/50 transition-all group cursor-pointer"
      onClick={() => setSelectedRole(role)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: role.color }}
          >
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{role.name}</h4>
            <p className="text-sm text-gray-400">{role.description}</p>
          </div>
        </div>
        
        {role.isSystem && (
          <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
            System Role
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Permissions</span>
          <span className="text-white font-medium">{role.permissions.length}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Users Assigned</span>
          <span className="text-white font-medium">
            {mockUsers.filter(u => u.roles.includes(role.id)).length}
          </span>
        </div>
      </div>

      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-2">
          <button className="flex-1 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg text-sm hover:bg-purple-600/30 transition-colors">
            View Details
          </button>
          {!role.isSystem && (
            <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const PermissionList: React.FC<{ permissions: Permission[] }> = ({ permissions }) => (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {permissions.map(permission => (
        <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
          <div>
            <p className="text-sm font-medium text-white">{permission.name}</p>
            <p className="text-xs text-gray-400">{permission.description}</p>
          </div>
          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
            {permission.resource}:{permission.action}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <AdminGuard 
      userId={userId} 
      fallback={
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Administrator Access Required</h3>
          <p className="text-gray-400">Only administrators can manage roles and permissions.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Shield className="w-7 h-7 text-purple-400" />
              <span>Role & Permission Management</span>
            </h2>
            <p className="text-gray-400 mt-1">Manage user roles and access permissions</p>
          </div>
          
          <button
            onClick={() => setShowCreateRole(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Role</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="glass-effect rounded-xl p-2">
          <nav className="flex space-x-2">
            {[
              { id: 'roles', label: 'Roles', icon: Shield },
              { id: 'permissions', label: 'Permissions', icon: Settings },
              { id: 'users', label: 'User Assignments', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {allRoles.map(role => (
              <RoleCard key={role.id} role={role} />
            ))}
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">System Permissions</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(
                allPermissions.reduce((acc, permission) => {
                  if (!acc[permission.resource]) acc[permission.resource] = [];
                  acc[permission.resource].push(permission);
                  return acc;
                }, {} as Record<string, Permission[]>)
              ).map(([resource, permissions]) => (
                <div key={resource} className="space-y-4">
                  <h4 className="font-semibold text-white capitalize">{resource} Permissions</h4>
                  <PermissionList permissions={permissions} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {mockUsers.map(user => (
              <div key={user.id} className="glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{user.name}</h4>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {user.roles.map(roleId => {
                      const role = allRoles.find(r => r.id === roleId);
                      return role ? (
                        <span 
                          key={roleId}
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: role.color }}
                        >
                          {role.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Role Details Modal */}
        {selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedRole.color }}
                  >
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedRole.name}</h3>
                    <p className="text-gray-400">{selectedRole.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-white mb-4">Permissions ({selectedRole.permissions.length})</h4>
                  <PermissionList permissions={selectedRole.permissions} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
};

export default RoleManagement;