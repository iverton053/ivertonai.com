import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import userRoleService from '../../services/userRoleService';
import Icon from '../Icon';

const SystemSettings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { system } = settings;
  const [activeSection, setActiveSection] = useState<'health' | 'users' | 'backup' | 'branding'>('health');
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  const handleInputChange = (field: keyof typeof system, value: any) => {
    // Check permissions for company branding fields
    const brandingFields = ['companyName', 'companyLogo', 'companyDomain', 'brandPrimaryColor', 'brandSecondaryColor', 'loginPageMessage', 'customFooter', 'whiteLabel', 'customFavicon', 'companyAddress', 'companyPhone', 'supportEmail'];
    
    if (brandingFields.includes(field) && !userRoleService.canModifyCompanyBranding()) {
      alert('Only administrators can modify company branding settings.');
      return;
    }
    
    updateSettings('system', { [field]: value });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Logo file size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setLogoPreview(logoUrl);
        handleInputChange('companyLogo', logoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const canAccessSystemSettings = userRoleService.canAccessSystemSettings();
  const canModifyBranding = userRoleService.canModifyCompanyBranding();

  const systemStats = {
    uptime: '7 days, 14 hours',
    cpuUsage: Math.floor(Math.random() * 30) + 10,
    memoryUsage: Math.floor(Math.random() * 40) + 30,
    diskUsage: Math.floor(Math.random() * 50) + 25,
    activeUsers: Math.floor(Math.random() * 100) + 50,
  };

  if (!canAccessSystemSettings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Icon name="Lock" className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Access Restricted</h3>
          <p className="text-gray-400">{userRoleService.getAccessWarningMessage('System Settings')}</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'health', label: 'System Health', icon: 'Activity' },
    { id: 'users', label: 'User Management', icon: 'Users' },
    { id: 'backup', label: 'Backup & Security', icon: 'HardDrive' },
    { id: 'branding', label: 'Company Branding', icon: 'Palette' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-800/50 rounded-lg">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
              activeSection === section.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Icon name={section.icon} className="w-4 h-4" />
            <span>{section.label}</span>
            {section.id === 'branding' && !canModifyBranding && (
              <Icon name="Lock" className="w-3 h-3" />
            )}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {/* System Health */}
        {activeSection === 'health' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Icon name="Activity" className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">System Health</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">{systemStats.cpuUsage}%</div>
                  <div className="text-xs text-gray-400">CPU Usage</div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{systemStats.memoryUsage}%</div>
                  <div className="text-xs text-gray-400">Memory</div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">{systemStats.diskUsage}%</div>
                  <div className="text-xs text-gray-400">Disk Usage</div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{systemStats.activeUsers}</div>
                  <div className="text-xs text-gray-400">Active Users</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                <input
                  type="checkbox"
                  checked={system.systemHealthAlerts}
                  onChange={(e) => handleInputChange('systemHealthAlerts', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <div>
                  <div className="text-sm font-medium text-gray-300">Health Alerts</div>
                  <div className="text-xs text-gray-500">Get notified of system issues</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                <input
                  type="checkbox"
                  checked={system.rateLimiting}
                  onChange={(e) => handleInputChange('rateLimiting', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <div>
                  <div className="text-sm font-medium text-gray-300">Rate Limiting</div>
                  <div className="text-xs text-gray-500">Enable API rate limiting</div>
                </div>
              </label>
            </div>
          </motion.div>
        )}

        {/* User Management */}
        {activeSection === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Icon name="Users" className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">User Management</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Users Per Organization
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={system.maxUsersPerOrg}
                    onChange={(e) => handleInputChange('maxUsersPerOrg', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white font-mono w-12 text-right">{system.maxUsersPerOrg}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={system.allowNewUsers}
                    onChange={(e) => handleInputChange('allowNewUsers', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-300">Allow New Users</div>
                    <div className="text-xs text-gray-500">Enable user registration</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={system.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-300">Maintenance Mode</div>
                    <div className="text-xs text-gray-500">Enable maintenance mode</div>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Backup & Security */}
        {activeSection === 'backup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Icon name="HardDrive" className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Backup & Security</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Backup Frequency
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['hourly', 'daily', 'weekly'].map((freq) => (
                    <motion.div
                      key={freq}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleInputChange('backupFrequency', freq)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                        system.backupFrequency === freq
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium text-white capitalize">{freq}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Security Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'basic', label: 'Basic' },
                    { value: 'standard', label: 'Standard' },
                    { value: 'high', label: 'High' }
                  ].map((level) => (
                    <motion.div
                      key={level.value}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleInputChange('securityLevel', level.value)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                        system.securityLevel === level.value
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium text-white">{level.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Log Level
                </label>
                <select
                  value={system.logLevel}
                  onChange={(e) => handleInputChange('logLevel', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                >
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Company Branding - Admin Only */}
        {activeSection === 'branding' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {!canModifyBranding && (
              <div className="glass-effect rounded-2xl p-6 border border-red-500/20 bg-red-900/10">
                <div className="flex items-center space-x-3 mb-4">
                  <Icon name="Lock" className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-red-400">Access Restricted</h3>
                </div>
                <p className="text-gray-400">{userRoleService.getAccessWarningMessage('Company Branding')}</p>
              </div>
            )}

            {/* Company Information */}
            <div className="glass-effect rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <Icon name="Building" className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Company Information</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={system.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    disabled={!canModifyBranding}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Domain</label>
                  <input
                    type="text"
                    value={system.companyDomain}
                    onChange={(e) => handleInputChange('companyDomain', e.target.value)}
                    disabled={!canModifyBranding}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Support Email</label>
                  <input
                    type="email"
                    value={system.supportEmail}
                    onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                    disabled={!canModifyBranding}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="support@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={system.companyPhone}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    disabled={!canModifyBranding}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <textarea
                    value={system.companyAddress}
                    onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                    disabled={!canModifyBranding}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Company address"
                  />
                </div>
              </div>
            </div>

            {/* Visual Branding */}
            <div className="glass-effect rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <Icon name="Palette" className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Visual Branding</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Logo</label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={!canModifyBranding}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {(system.companyLogo || logoPreview) && (
                      <div className="w-32 h-32 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
                        <img
                          src={logoPreview || system.companyLogo}
                          alt="Company Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Primary Brand Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={system.brandPrimaryColor}
                        onChange={(e) => handleInputChange('brandPrimaryColor', e.target.value)}
                        disabled={!canModifyBranding}
                        className="w-12 h-12 rounded-lg border border-gray-700 bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <input
                        type="text"
                        value={system.brandPrimaryColor}
                        onChange={(e) => handleInputChange('brandPrimaryColor', e.target.value)}
                        disabled={!canModifyBranding}
                        className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Brand Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={system.brandSecondaryColor}
                        onChange={(e) => handleInputChange('brandSecondaryColor', e.target.value)}
                        disabled={!canModifyBranding}
                        className="w-12 h-12 rounded-lg border border-gray-700 bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <input
                        type="text"
                        value={system.brandSecondaryColor}
                        onChange={(e) => handleInputChange('brandSecondaryColor', e.target.value)}
                        disabled={!canModifyBranding}
                        className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Login Page Message</label>
                  <input
                    type="text"
                    value={system.loginPageMessage}
                    onChange={(e) => handleInputChange('loginPageMessage', e.target.value)}
                    disabled={!canModifyBranding}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Welcome message for login page"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Custom Footer</label>
                  <textarea
                    value={system.customFooter}
                    onChange={(e) => handleInputChange('customFooter', e.target.value)}
                    disabled={!canModifyBranding}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Custom footer content (HTML allowed)"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={system.whiteLabel}
                      onChange={(e) => handleInputChange('whiteLabel', e.target.checked)}
                      disabled={!canModifyBranding}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-300">White Label Mode</div>
                      <div className="text-xs text-gray-500">Hide Iverton branding and use only company branding</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;