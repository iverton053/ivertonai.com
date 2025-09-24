import React, { useState, useEffect } from 'react';
import { useAgencyStore } from '../../stores/agencyStore';
import { AgencyUser } from '../../types/agency';
import { Permission } from '../../services/permissions';
import { AlertCircle, Users, Building, Check, X, Search } from 'lucide-react';

interface ClientAssignmentProps {
  onClose: () => void;
}

export const ClientAssignment: React.FC<ClientAssignmentProps> = ({ onClose }) => {
  const {
    clients,
    agencyUsers,
    assignClientsToUser,
    hasPermission,
    canManageUser,
    error,
    clearError,
    isLoading
  } = useAgencyStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AgencyUser | null>(null);
  const [userClientAssignments, setUserClientAssignments] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Initialize user-client assignments from current data
    const assignments: Record<string, string[]> = {};
    agencyUsers.forEach(user => {
      assignments[user.id] = [...(user.assigned_clients || [])];
    });
    setUserClientAssignments(assignments);
  }, [agencyUsers]);

  const filteredUsers = agencyUsers.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleClientAssignment = (userId: string, clientId: string) => {
    setUserClientAssignments(prev => ({
      ...prev,
      [userId]: prev[userId]?.includes(clientId)
        ? prev[userId].filter(id => id !== clientId)
        : [...(prev[userId] || []), clientId]
    }));
  };

  const handleSaveUserAssignments = async (userId: string) => {
    const assignments = userClientAssignments[userId] || [];
    const success = await assignClientsToUser(userId, assignments);
    
    if (success) {
      // Success feedback could be added here
    }
  };


  if (!hasPermission(Permission.ASSIGN_CLIENTS)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle size={20} />
            <h3 className="font-semibold">Access Denied</h3>
          </div>
          <p className="text-gray-400 mb-4">
            You don't have permission to assign clients to users.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Client Assignments</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800/50 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users or clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border-b">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-600 hover:text-red-300"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Users List */}
            <div className="border-r overflow-y-auto max-h-[60vh]">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-medium flex items-center gap-2">
                  <Users size={18} />
                  Team Members ({filteredUsers.length})
                </h3>
              </div>
              
              <div className="divide-y">
                {filteredUsers.map(user => {
                  const canManage = canManageUser(user);
                  const assignedClients = userClientAssignments[user.id] || [];
                  
                  return (
                    <div
                      key={user.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedUser?.id === user.id ? 'bg-blue-900/20 border-r-2 border-blue-500' : ''
                      }`}
                      onClick={() => canManage ? setSelectedUser(user) : null}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {user.full_name || user.username}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.role === 'agency_owner' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'agency_admin' ? 'bg-blue-100 text-blue-300' :
                              user.role === 'team_lead' ? 'bg-green-900/50 text-green-300' :
                              user.role === 'analyst' ? 'bg-yellow-900/50 text-yellow-300' :
                              'bg-gray-800/50 text-gray-300'
                            }`}>
                              {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{user.email}</p>
                          {user.department && (
                            <p className="text-xs text-gray-400">{user.department}</p>
                          )}
                          <div className="mt-2">
                            <span className="text-xs text-gray-400">
                              {assignedClients.length} client{assignedClients.length !== 1 ? 's' : ''} assigned
                            </span>
                          </div>
                        </div>
                        
                        {!canManage && (
                          <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                            View Only
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {filteredUsers.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    <Users size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No team members found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Client Assignment Panel */}
            <div className="overflow-y-auto max-h-[60vh]">
              {selectedUser ? (
                <>
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          Assign Clients to {selectedUser.full_name || selectedUser.username}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {userClientAssignments[selectedUser.id]?.length || 0} of {clients.length} clients assigned
                        </p>
                      </div>
                      <button
                        onClick={() => handleSaveUserAssignments(selectedUser.id)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Check size={16} />
                        Save
                      </button>
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    {filteredClients.map(client => {
                      const isAssigned = userClientAssignments[selectedUser.id]?.includes(client.id) || false;
                      
                      return (
                        <div key={client.id} className="p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() => handleToggleClientAssignment(selectedUser.id, client.id)}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{client.name}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  client.status === 'active' ? 'bg-green-900/50 text-green-300' :
                                  client.status === 'paused' ? 'bg-yellow-900/50 text-yellow-300' :
                                  client.status === 'prospect' ? 'bg-blue-100 text-blue-300' :
                                  'bg-red-900/50 text-red-300'
                                }`}>
                                  {client.status}
                                </span>
                              </div>
                              {client.website && (
                                <p className="text-sm text-gray-400">{client.website}</p>
                              )}
                              {client.industry && (
                                <p className="text-xs text-gray-400">{client.industry}</p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-1">
                                {client.services.slice(0, 3).map(service => (
                                  <span
                                    key={service}
                                    className="px-2 py-1 text-xs bg-gray-800/50 text-gray-400 rounded"
                                  >
                                    {service}
                                  </span>
                                ))}
                                {client.services.length > 3 && (
                                  <span className="px-2 py-1 text-xs bg-gray-800/50 text-gray-400 rounded">
                                    +{client.services.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      );
                    })}
                    
                    {filteredClients.length === 0 && (
                      <div className="p-8 text-center text-gray-400">
                        <Building size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No clients found</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <Users size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Select a team member to manage their client assignments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};