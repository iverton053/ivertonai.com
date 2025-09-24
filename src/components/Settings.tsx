import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../stores/settingsStore';
import Icon from './Icon';

// Settings category components
import ProfileSettings from './settings/ProfileSettings';
import DashboardSettings from './settings/DashboardSettings';
import NotificationSettings from './settings/NotificationSettings';
import PrivacySettings from './settings/PrivacySettings';
import ApplicationSettings from './settings/ApplicationSettings';
import SystemSettings from './settings/SystemSettings';
import SettingsHistory from './settings/SettingsHistory';
import SettingsPresets from './settings/SettingsPresets';
import BackupManager from './enterprise/BackupManager';

interface SettingsTab {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
  description: string;
  permission?: 'admin' | 'manager' | 'user';
}

const settingsTabs: SettingsTab[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: 'User',
    component: ProfileSettings,
    description: 'Manage your personal information and preferences',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'Layout',
    component: DashboardSettings,
    description: 'Customize your dashboard appearance and behavior',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'Bell',
    component: NotificationSettings,
    description: 'Configure notification preferences and delivery',
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: 'Shield',
    component: PrivacySettings,
    description: 'Manage privacy settings and security options',
  },
  {
    id: 'application',
    label: 'Application',
    icon: 'Settings',
    component: ApplicationSettings,
    description: 'Configure application behavior and performance',
  },
  {
    id: 'system',
    label: 'System',
    icon: 'Server',
    component: SystemSettings,
    description: 'System-wide settings and administration',
    permission: 'admin',
  },
  {
    id: 'presets',
    label: 'Presets',
    icon: 'Save',
    component: SettingsPresets,
    description: 'Manage settings presets and templates',
  },
  {
    id: 'history',
    label: 'History',
    icon: 'History',
    component: SettingsHistory,
    description: 'View settings changes and version history',
  },
  {
    id: 'backup',
    label: 'Backup & Restore',
    icon: 'Database',
    component: BackupManager,
    description: 'Enterprise backup and restore functionality',
    permission: 'admin',
  },
];

const Settings: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    hasUnsavedChanges,
    lastSaved,
    saveSettings,
    exportSettings,
    importSettings,
    undoLastChange,
    history,
    isLoading,
    error,
  } = useSettingsStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Filter tabs based on user permissions
  const availableTabs = settingsTabs.filter(tab => {
    if (!tab.permission) return true;
    // For now, hardcoded as admin, but this would come from auth store in production
    return tab.permission === 'admin';
  });

  const activeTabData = availableTabs.find(tab => tab.id === activeTab) || availableTabs[0];
  const ActiveComponent = activeTabData.component;

  const handleSave = async () => {
    const success = await saveSettings();
    if (success) {
      console.log('Settings saved successfully');
    }
  };

  const handleExport = () => {
    const settingsData = exportSettings();
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iverton-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = await importSettings(text);
      if (success) {
        console.log('Settings imported successfully');
      }
    } catch (error) {
      console.error('Failed to import settings:', error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-full bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 glass-effect border-r border-white/20 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowImportModal(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Import/Export Settings"
              >
                <Icon name="Download" className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
            <Icon name="Search" className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {availableTabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon name={tab.icon} className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs opacity-75 mt-1 line-clamp-2">
                    {tab.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-700/50 text-xs text-gray-500">
          <div className="flex items-center justify-between mb-2">
            <span>Last saved:</span>
            <span>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Never'}</span>
          </div>
          {history.length > 0 && (
            <div className="flex items-center justify-between">
              <span>Changes:</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={undoLastChange}
                className="text-purple-400 hover:text-purple-300"
              >
                Undo last ({history.length})
              </motion.button>
            </div>
          )}
          {error && (
            <div className="text-red-400 mt-2 p-2 bg-red-900/20 rounded border border-red-800">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content Header */}
        <div className="p-6 border-b border-gray-700/50 bg-gray-900/50">
          <div className="flex items-center space-x-3 mb-2">
            <Icon name={activeTabData.icon} className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">{activeTabData.label}</h2>
          </div>
          <p className="text-gray-400 text-sm">{activeTabData.description}</p>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveComponent />
          </motion.div>
        </div>
      </div>

      {/* Import/Export Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Import/Export Settings</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <Icon name="X" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Export Settings
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Icon name="Download" className="w-4 h-4" />
                  <span>Download Settings</span>
                </motion.button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Import Settings
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleImport}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Icon name="Upload" className="w-4 h-4" />
                  <span>Upload Settings File</span>
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Import settings from a previously exported JSON file
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;