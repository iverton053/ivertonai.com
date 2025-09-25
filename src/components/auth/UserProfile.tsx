import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Building, Shield, Settings, LogOut,
  Edit2, Save, X, Check, AlertTriangle, Bell,
  Palette, Globe, Clock, Users, CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { User as UserType, Organization, UserRole } from '../../types/auth';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, organization, updateProfile, updateOrganization, logout, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'preferences'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [orgForm, setOrgForm] = useState({
    name: organization?.name || '',
    website: organization?.website || '',
    industry: organization?.industry || ''
  });

  const [preferencesForm, setPreferencesForm] = useState({
    theme: user?.preferences.theme || 'system',
    defaultView: user?.preferences.defaultView || 'grid',
    assetsPerPage: user?.preferences.assetsPerPage || 20,
    emailNotifications: {
      assetUpdates: user?.preferences.emailNotifications.assetUpdates ?? true,
      sharing: user?.preferences.emailNotifications.sharing ?? true,
      approvals: user?.preferences.emailNotifications.approvals ?? true,
      systemUpdates: user?.preferences.emailNotifications.systemUpdates ?? false
    }
  });

  if (!isOpen || !user || !organization) return null;

  const handleProfileSave = async () => {
    try {
      setError(null);
      const success = await updateProfile(profileForm);
      if (success) {
        setIsEditingProfile(false);
        setSuccess('Profile updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const handleOrgSave = async () => {
    try {
      setError(null);
      const success = await updateOrganization(orgForm);
      if (success) {
        setIsEditingOrg(false);
        setSuccess('Organization updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update organization');
      }
    } catch (error) {
      setError('Failed to update organization');
    }
  };

  const handlePreferencesSave = async () => {
    try {
      setError(null);
      const success = await updateProfile({
        preferences: {
          ...user.preferences,
          ...preferencesForm
        }
      });
      if (success) {
        setSuccess('Preferences updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update preferences');
      }
    } catch (error) {
      setError('Failed to update preferences');
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      super_admin: 'bg-red-900/20 text-red-300 border-red-500/30',
      org_admin: 'bg-purple-900/20 text-purple-300 border-purple-500/30',
      brand_manager: 'bg-blue-900/20 text-blue-300 border-blue-500/30',
      designer: 'bg-green-900/20 text-green-300 border-green-500/30',
      viewer: 'bg-gray-900/20 text-gray-300 border-gray-500/30',
      external: 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30'
    };
    return colors[role];
  };

  const formatRole = (role: UserRole) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-5rem)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <User className="w-5 h-5" />
                Profile
              </button>

              {hasPermission('organization:read') && (
                <button
                  onClick={() => setActiveTab('organization')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'organization' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  Organization
                </button>
              )}

              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'preferences' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Settings className="w-5 h-5" />
                Preferences
              </button>

              <hr className="border-white/10 my-4" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Success/Error Messages */}
            {(success || error) && (
              <div className="p-4">
                {success && (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-green-300">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">{success}</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-red-300">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs rounded border ${getRoleBadgeColor(user.role)}`}>
                            {formatRole(user.role)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Member since {user.createdAt.toLocaleDateString()}
                        </div>
                        {user.lastLoginAt && (
                          <div className="text-sm text-gray-400">
                            Last login: {user.lastLoginAt.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                            {user.name}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        {isEditingProfile ? (
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                      {isEditingProfile ? (
                        <>
                          <button
                            onClick={() => {
                              setIsEditingProfile(false);
                              setProfileForm({ name: user.name, email: user.email });
                            }}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleProfileSave}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-lg transition-colors text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Permissions</h3>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {user.permissions.map((permission) => (
                        <div key={permission} className="px-2 py-1 bg-green-900/20 text-green-300 border border-green-500/30 rounded text-sm">
                          {permission.replace(':', ': ').replace('_', ' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === 'organization' && hasPermission('organization:read') && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Organization Settings</h3>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
                    {/* Plan Info */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">{organization.plan.name} Plan</h4>
                        <p className="text-sm text-gray-400">
                          {organization.plan.maxUsers} users • {organization.plan.maxAssets} assets •
                          {Math.round(organization.plan.maxStorage / (1024 * 1024 * 1024))}GB storage
                        </p>
                      </div>
                      {hasPermission('organization:billing') && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white text-sm">
                          <CreditCard className="w-4 h-4" />
                          Manage Billing
                        </button>
                      )}
                    </div>

                    {/* Organization Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
                        {isEditingOrg && hasPermission('organization:update') ? (
                          <input
                            type="text"
                            value={orgForm.name}
                            onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                            {organization.name}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                        {isEditingOrg && hasPermission('organization:update') ? (
                          <input
                            type="url"
                            value={orgForm.website}
                            onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                            placeholder="https://"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                            {organization.website || 'Not set'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                        {isEditingOrg && hasPermission('organization:update') ? (
                          <input
                            type="text"
                            value={orgForm.industry}
                            onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                            {organization.industry || 'Not specified'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Company Size</label>
                        <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                          {organization.size ? organization.size.charAt(0).toUpperCase() + organization.size.slice(1) : 'Not specified'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {hasPermission('organization:update') && (
                      <div className="flex justify-end gap-2">
                        {isEditingOrg ? (
                          <>
                            <button
                              onClick={() => {
                                setIsEditingOrg(false);
                                setOrgForm({
                                  name: organization.name,
                                  website: organization.website || '',
                                  industry: organization.industry || ''
                                });
                              }}
                              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleOrgSave}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
                            >
                              <Save className="w-4 h-4" />
                              Save Changes
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsEditingOrg(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-lg transition-colors text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Organization
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">User Preferences</h3>

                  <div className="space-y-6">
                    {/* Appearance */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Appearance
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                          <select
                            value={preferencesForm.theme}
                            onChange={(e) => setPreferencesForm({ ...preferencesForm, theme: e.target.value as any })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Default View</label>
                          <select
                            value={preferencesForm.defaultView}
                            onChange={(e) => setPreferencesForm({ ...preferencesForm, defaultView: e.target.value as any })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                          >
                            <option value="grid">Grid</option>
                            <option value="list">List</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Assets per page</label>
                          <select
                            value={preferencesForm.assetsPerPage}
                            onChange={(e) => setPreferencesForm({ ...preferencesForm, assetsPerPage: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                          >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Email Notifications
                      </h4>

                      <div className="space-y-3">
                        {Object.entries(preferencesForm.emailNotifications).map(([key, value]) => (
                          <label key={key} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setPreferencesForm({
                                ...preferencesForm,
                                emailNotifications: {
                                  ...preferencesForm.emailNotifications,
                                  [key]: e.target.checked
                                }
                              })}
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-gray-300">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handlePreferencesSave}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
                      >
                        <Save className="w-4 h-4" />
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;