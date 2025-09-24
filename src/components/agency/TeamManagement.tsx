import React, { useState, useEffect } from 'react';
import { useAgencyStore } from '../../stores/agencyStore';
import { UserRole } from '../../services/permissions';
import { UserInvitation } from './UserInvitation';
import { ClientAssignment } from './ClientAssignment';

const TeamManagement: React.FC = () => {
  const {
    agencyUsers,
    agency,
    updateUserRole,
    loadAgencyUsers,
    error,
    clearError
  } = useAgencyStore();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    loadAgencyUsers();
    
    // Add some demo data for testing if no agency users exist
    if (agencyUsers.length === 0) {
      // This would normally be handled by the store initialization
      console.log('Demo mode: No agency users found, you can test the invite functionality');
    }
  }, []);

  // Check if current user can manage team - Allow access for demo/testing purposes
  // TODO: Enable proper permission checking once agency auth is implemented
  // if (!hasPermission(Permission.VIEW_ALL_USERS)) {
  //   return (
  //     <div className="p-6">
  //       <div className="bg-red-900/200/10 border border-red-500/20 rounded-lg p-4">
  //         <h3 className="text-lg font-semibold text-red-400 mb-2">Access Denied</h3>
  //         <p className="text-red-300">You don't have permission to view team management.</p>
  //       </div>
  //     </div>
  //   );
  // }

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      // Refresh users list to show updated role
      loadAgencyUsers();
    }
  };

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case UserRole.AGENCY_OWNER: return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case UserRole.AGENCY_ADMIN: return 'text-blue-400 bg-blue-900/200/10 border-blue-500/20';
      case UserRole.TEAM_LEAD: return 'text-green-400 bg-green-500/10 border-green-500/20';
      case UserRole.ANALYST: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case UserRole.CLIENT_VIEW: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case UserRole.AGENCY_OWNER: return 'Owner';
      case UserRole.AGENCY_ADMIN: return 'Admin';
      case UserRole.TEAM_LEAD: return 'Team Lead';
      case UserRole.ANALYST: return 'Analyst';
      case UserRole.CLIENT_VIEW: return 'View Only';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Management</h2>
          <p className="text-gray-400">Manage your agency team and permissions</p>
        </div>
        
        {/* Temporarily allow invite button for demo */}
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2"
        >
          <i className="fas fa-plus"></i>
          <span>Invite User</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/200/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-red-400">{error}</p>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Agency Info */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Agency Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400">Agency Name</p>
            <p className="text-white font-medium">{agency?.name || 'Your Marketing Agency'}</p>
          </div>
          <div>
            <p className="text-gray-400">Plan</p>
            <p className="text-white font-medium capitalize">{agency?.subscription_plan || 'Professional'}</p>
          </div>
          <div>
            <p className="text-gray-400">Team Size</p>
            <p className="text-white font-medium">{agencyUsers.length} / {agency?.max_users || 25} users</p>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Team Members ({agencyUsers.length})</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3 text-gray-400">User</th>
                <th className="text-left p-3 text-gray-400">Role</th>
                <th className="text-left p-3 text-gray-400">Department</th>
                <th className="text-left p-3 text-gray-400">Clients</th>
                <th className="text-left p-3 text-gray-400">Status</th>
                <th className="text-left p-3 text-gray-400">Last Login</th>
                <th className="text-right p-3 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agencyUsers.length > 0 ? (
                agencyUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800 hover:bg-white/5">
                    <td className="p-3">
                      <div>
                        <p className="text-white font-medium">{user.full_name || user.username}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getRoleColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-300">{user.department || '-'}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-300">
                        {user.role === UserRole.AGENCY_OWNER || user.role === UserRole.AGENCY_ADMIN 
                          ? 'All Clients' 
                          : `${user.assigned_clients.length} assigned`}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'active' 
                          ? 'text-green-400 bg-green-500/10 border border-green-500/20' 
                          : user.status === 'invited'
                          ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20'
                          : 'text-red-400 bg-red-900/200/10 border border-red-500/20'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-400 text-sm">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {/* Temporarily allow management for demo */}
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowAssignModal(true)}
                          className="text-gray-400 hover:text-white p-1"
                          title="Assign Clients"
                        >
                          <i className="fas fa-users"></i>
                        </button>
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                          className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600"
                        >
                          <option value={UserRole.ANALYST}>Analyst</option>
                          <option value={UserRole.TEAM_LEAD}>Team Lead</option>
                          <option value={UserRole.AGENCY_ADMIN}>Admin</option>
                          <option value={UserRole.AGENCY_OWNER}>Owner</option>
                          <option value={UserRole.CLIENT_VIEW}>View Only</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="text-gray-400">
                      <i className="fas fa-users text-4xl mb-4 opacity-50"></i>
                      <h4 className="text-lg font-medium mb-2">No Team Members Yet</h4>
                      <p className="text-sm">Start by inviting your first team member to get started with agency management.</p>
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="mt-4 bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg font-medium transition text-white"
                      >
                        Invite Your First Team Member
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <UserInvitation
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            loadAgencyUsers();
          }}
        />
      )}

      {/* Assign Clients Modal */}
      {showAssignModal && (
        <ClientAssignment
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
};


export default TeamManagement;