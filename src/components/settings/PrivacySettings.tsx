import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import Icon from '../Icon';

const PrivacySettings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { privacy } = settings;
  
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
  const [twoFactorSetup, setTwoFactorSetup] = useState(false);

  const handleInputChange = (field: keyof typeof privacy, value: any) => {
    updateSettings('privacy', { [field]: value });
  };

  const handleDangerousAction = (action: string) => {
    setShowConfirmDialog(action);
  };

  const confirmAction = (action: string) => {
    switch (action) {
      case 'clearData':
        // Clear all stored data
        localStorage.clear();
        sessionStorage.clear();
        console.log('All data cleared');
        break;
      case 'downloadData':
        // Download user data
        const userData = {
          settings: settings,
          exportDate: new Date().toISOString(),
          dataType: 'user-data-export'
        };
        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;
      case 'deleteAccount':
        // This would normally call an API to delete the account
        console.log('Account deletion requested');
        break;
    }
    setShowConfirmDialog(null);
  };

  const visibilityOptions = [
    { value: 'public', label: 'Public', description: 'Visible to everyone' },
    { value: 'team', label: 'Team Only', description: 'Visible to team members' },
    { value: 'private', label: 'Private', description: 'Only visible to you' },
  ];

  const securityLevels = [
    { value: 'basic', label: 'Basic', description: 'Standard security measures' },
    { value: 'standard', label: 'Standard', description: 'Enhanced security with additional checks' },
    { value: 'high', label: 'High', description: 'Maximum security with strict validation' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Data Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Shield" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Data Privacy</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Icon name="Share2" className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-medium">Data Sharing</div>
                <div className="text-gray-400 text-sm">Allow sharing of anonymized usage data</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.dataSharing}
              onChange={(e) => handleInputChange('dataSharing', e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Icon name="BarChart3" className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-white font-medium">Analytics Tracking</div>
                <div className="text-gray-400 text-sm">Help improve the product with usage analytics</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.analyticsTracking}
              onChange={(e) => handleInputChange('analyticsTracking', e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Icon name="Bug" className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-white font-medium">Error Reporting</div>
                <div className="text-gray-400 text-sm">Automatically send error reports to help fix issues</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.errorReporting}
              onChange={(e) => handleInputChange('errorReporting', e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Icon name="Activity" className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-white font-medium">Activity Logging</div>
                <div className="text-gray-400 text-sm">Keep logs of your dashboard activity</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.activityLogging}
              onChange={(e) => handleInputChange('activityLogging', e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Icon name="Cookie" className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-medium">Cookie Consent</div>
                <div className="text-gray-400 text-sm">Accept cookies for enhanced functionality</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.cookieConsent}
              onChange={(e) => handleInputChange('cookieConsent', e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
          </label>
        </div>
      </motion.div>

      {/* Profile Visibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Eye" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Profile Visibility</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {visibilityOptions.map((option) => (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleInputChange('profileVisibility', option.value)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                privacy.profileVisibility === option.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="font-medium text-white mb-1">{option.label}</div>
                <div className="text-xs text-gray-400">{option.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Lock" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Security Settings</h3>
        </div>

        <div className="space-y-6">
          {/* Session Timeout */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session Timeout
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="300"
                max="86400"
                step="300"
                value={privacy.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-mono text-sm w-20 text-right">
                {Math.floor(privacy.sessionTimeout / 60)}m
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Automatically log out after {Math.floor(privacy.sessionTimeout / 60)} minutes of inactivity
            </p>
          </div>

          {/* Data Retention */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Retention Period
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="7"
                max="365"
                step="7"
                value={privacy.dataRetention}
                onChange={(e) => handleInputChange('dataRetention', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-mono text-sm w-16 text-right">
                {privacy.dataRetention}d
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Delete old data after {privacy.dataRetention} days
            </p>
          </div>

          {/* Two-Factor Authentication */}
          <div className="p-4 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Icon name="Smartphone" className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Two-Factor Authentication</div>
                  <div className="text-gray-400 text-sm">
                    {privacy.twoFactorAuth ? 'Enabled - Your account is protected' : 'Add an extra layer of security'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!privacy.twoFactorAuth && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTwoFactorSetup(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Setup 2FA
                  </motion.button>
                )}
                <input
                  type="checkbox"
                  checked={privacy.twoFactorAuth}
                  onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                  className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
              </div>
            </div>
            
            {privacy.twoFactorAuth && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-200">
                    <Icon name="CheckCircle" className="w-4 h-4" />
                    <span>SMS Verification</span>
                  </div>
                </div>
                <div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-200">
                    <Icon name="CheckCircle" className="w-4 h-4" />
                    <span>Authenticator App</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Login Alerts */}
          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Icon name="AlertCircle" className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-white font-medium">Login Alerts</div>
                <div className="text-gray-400 text-sm">Get notified of new login attempts</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.loginAlerts}
              onChange={(e) => handleInputChange('loginAlerts', e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
          </label>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Database" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Data Management</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDangerousAction('downloadData')}
            className="p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg text-blue-200 hover:bg-blue-600/30 transition-colors"
          >
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Download" className="w-6 h-6" />
              <span className="font-medium">Export Data</span>
              <span className="text-xs text-blue-300">Download all your data</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDangerousAction('clearData')}
            className="p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg text-yellow-200 hover:bg-yellow-600/30 transition-colors"
          >
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Trash2" className="w-6 h-6" />
              <span className="font-medium">Clear Data</span>
              <span className="text-xs text-yellow-300">Remove all stored data</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDangerousAction('deleteAccount')}
            className="p-4 bg-red-600/20 border border-red-600/30 rounded-lg text-red-200 hover:bg-red-600/30 transition-colors"
          >
            <div className="flex flex-col items-center space-y-2">
              <Icon name="UserX" className="w-6 h-6" />
              <span className="font-medium">Delete Account</span>
              <span className="text-xs text-red-300">Permanently delete</span>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Legal & Compliance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="FileText" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Legal & Compliance</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="p-4 border border-gray-700/50 rounded-lg text-left hover:border-gray-600/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Shield" className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">Privacy Policy</div>
                <div className="text-gray-400 text-sm">Read our privacy policy</div>
              </div>
              <Icon name="ExternalLink" className="w-4 h-4 text-gray-500" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="p-4 border border-gray-700/50 rounded-lg text-left hover:border-gray-600/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Icon name="FileText" className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">Terms of Service</div>
                <div className="text-gray-400 text-sm">View terms and conditions</div>
              </div>
              <Icon name="ExternalLink" className="w-4 h-4 text-gray-500" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="p-4 border border-gray-700/50 rounded-lg text-left hover:border-gray-600/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Globe" className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">GDPR Compliance</div>
                <div className="text-gray-400 text-sm">Your rights under GDPR</div>
              </div>
              <Icon name="ExternalLink" className="w-4 h-4 text-gray-500" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="p-4 border border-gray-700/50 rounded-lg text-left hover:border-gray-600/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Icon name="HelpCircle" className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-white font-medium">Data Request</div>
                <div className="text-gray-400 text-sm">Request your data report</div>
              </div>
              <Icon name="ExternalLink" className="w-4 h-4 text-gray-500" />
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="AlertTriangle" className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Confirm Action</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              {showConfirmDialog === 'clearData' && 'This will remove all your stored data. This action cannot be undone.'}
              {showConfirmDialog === 'downloadData' && 'This will download all your personal data in JSON format.'}
              {showConfirmDialog === 'deleteAccount' && 'This will permanently delete your account and all associated data. This action cannot be undone.'}
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => confirmAction(showConfirmDialog)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showConfirmDialog === 'deleteAccount' || showConfirmDialog === 'clearData'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {twoFactorSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Setup Two-Factor Authentication</h3>
              <button
                onClick={() => setTwoFactorSetup(false)}
                className="text-gray-400 hover:text-white"
              >
                <Icon name="X" className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                <div className="w-32 h-32 bg-white mx-auto mb-4 rounded-lg flex items-center justify-center">
                  <span className="text-gray-800 text-xs">QR Code Placeholder</span>
                </div>
                <p className="text-sm text-gray-300">
                  Scan this QR code with your authenticator app
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter verification code
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setTwoFactorSetup(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  handleInputChange('twoFactorAuth', true);
                  setTwoFactorSetup(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Enable 2FA
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PrivacySettings;