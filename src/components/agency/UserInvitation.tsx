import React, { useState } from 'react';
import { useAgencyStore } from '../../stores/agencyStore';
import { UserRole, Permission } from '../../services/permissions';
import { X, Mail, UserPlus, AlertCircle, Check, Building } from 'lucide-react';

interface UserInvitationProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const UserInvitation: React.FC<UserInvitationProps> = ({ onClose, onSuccess }) => {
  const {
    clients,
    inviteUser,
    hasPermission,
    isOwner,
    isAdmin,
    isTeamLead,
    error,
    clearError,
    isLoading
  } = useAgencyStore();

  const [formData, setFormData] = useState({
    email: '',
    role: UserRole.ANALYST,
    department: '',
    assigned_clients: [] as string[]
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Available roles based on current user's permissions
  const getAvailableRoles = () => {
    if (isOwner) {
      return [
        { value: UserRole.AGENCY_ADMIN, label: 'Agency Admin', description: 'Full management access except billing' },
        { value: UserRole.TEAM_LEAD, label: 'Team Lead', description: 'Manage team and assigned clients' },
        { value: UserRole.ANALYST, label: 'Analyst', description: 'Work with assigned clients' },
        { value: UserRole.CLIENT_VIEW, label: 'Client View', description: 'Limited view access only' }
      ];
    } else if (isAdmin) {
      return [
        { value: UserRole.TEAM_LEAD, label: 'Team Lead', description: 'Manage team and assigned clients' },
        { value: UserRole.ANALYST, label: 'Analyst', description: 'Work with assigned clients' },
        { value: UserRole.CLIENT_VIEW, label: 'Client View', description: 'Limited view access only' }
      ];
    } else if (isTeamLead) {
      return [
        { value: UserRole.ANALYST, label: 'Analyst', description: 'Work with assigned clients' },
        { value: UserRole.CLIENT_VIEW, label: 'Client View', description: 'Limited view access only' }
      ];
    }
    return [];
  };

  const availableRoles = getAvailableRoles();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.role) {
      errors.role = 'Role is required';
    }

    // Require client assignment for non-admin roles
    if (formData.role !== UserRole.AGENCY_ADMIN && formData.assigned_clients.length === 0) {
      errors.assigned_clients = 'Please assign at least one client for this role';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    clearError();
    
    try {
      const success = await inviteUser({
        email: formData.email.trim(),
        role: formData.role,
        department: formData.department.trim() || undefined,
        assigned_clients: formData.assigned_clients
      });

      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Invitation error:', err);
    }
  };

  const handleClientToggle = (clientId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_clients: prev.assigned_clients.includes(clientId)
        ? prev.assigned_clients.filter(id => id !== clientId)
        : [...prev.assigned_clients, clientId]
    }));
  };

  const selectAllClients = () => {
    setFormData(prev => ({
      ...prev,
      assigned_clients: clients.map(client => client.id)
    }));
  };

  const clearAllClients = () => {
    setFormData(prev => ({
      ...prev,
      assigned_clients: []
    }));
  };

  if (!hasPermission(Permission.INVITE_USERS)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle size={20} />
            <h3 className="font-semibold">Access Denied</h3>
          </div>
          <p className="text-gray-400 mb-4">
            You don't have permission to invite users to this agency.
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

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Invitation Sent!</h3>
          <p className="text-gray-400 mb-4">
            An invitation has been sent to <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-400">
            They will receive an email with instructions to join your agency.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Invite Team Member</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800/50 rounded-lg"
            >
              <X size={20} />
            </button>
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - User Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-300 mb-4 flex items-center gap-2">
                  <Mail size={20} />
                  User Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="user@example.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Department (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Marketing, SEO, Content"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.role ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {availableRoles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.role && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                    )}
                    
                    {/* Role Description */}
                    {formData.role && (
                      <div className="mt-2 p-3 bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-300">
                          <strong>{availableRoles.find(r => r.value === formData.role)?.label}:</strong>{' '}
                          {availableRoles.find(r => r.value === formData.role)?.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Client Assignment */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-300 flex items-center gap-2">
                    <Building size={20} />
                    Client Access
                  </h3>
                  {formData.role !== UserRole.AGENCY_ADMIN && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllClients}
                        className="text-sm text-blue-600 hover:text-blue-300"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllClients}
                        className="text-sm text-gray-400 hover:text-gray-300"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {formData.role === UserRole.AGENCY_ADMIN ? (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-300">
                      <Check size={16} />
                      <span className="font-medium">Full Client Access</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Agency Admins have access to all clients automatically.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 text-sm text-gray-400">
                      Select which clients this user will have access to:
                    </div>
                    
                    {formErrors.assigned_clients && (
                      <p className="mb-3 text-sm text-red-600">{formErrors.assigned_clients}</p>
                    )}

                    <div className="max-h-64 overflow-y-auto border border-gray-700 rounded-lg">
                      {clients.length > 0 ? (
                        <div className="divide-y">
                          {clients.map(client => (
                            <label key={client.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.assigned_clients.includes(client.id)}
                                onChange={() => handleClientToggle(client.id)}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-300 truncate">{client.name}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                                    client.status === 'active' ? 'bg-green-900/50 text-green-300' :
                                    client.status === 'paused' ? 'bg-yellow-900/50 text-yellow-300' :
                                    client.status === 'prospect' ? 'bg-blue-100 text-blue-300' :
                                    'bg-red-900/50 text-red-300'
                                  }`}>
                                    {client.status}
                                  </span>
                                </div>
                                {client.website && (
                                  <p className="text-sm text-gray-400 truncate">{client.website}</p>
                                )}
                                {client.industry && (
                                  <p className="text-xs text-gray-400">{client.industry}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-400">
                          <Building size={32} className="mx-auto mb-2 opacity-50" />
                          <p>No clients available</p>
                          <p className="text-sm">Create clients first to assign them to users.</p>
                        </div>
                      )}
                    </div>

                    {formData.assigned_clients.length > 0 && (
                      <div className="mt-3 text-sm text-gray-400">
                        {formData.assigned_clients.length} of {clients.length} clients selected
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};