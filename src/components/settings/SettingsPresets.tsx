import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import Icon from '../Icon';

const SettingsPresets: React.FC = () => {
  const { presets, savePreset, loadPreset, deletePreset } = useSettingsStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [presetForm, setPresetForm] = useState({
    name: '',
    description: '',
    userType: 'user' as 'admin' | 'manager' | 'user'
  });

  const defaultPresets = [
    {
      id: 'default-admin',
      name: 'Administrator',
      description: 'Full system access with all features enabled',
      userType: 'admin' as const,
      isDefault: true,
    },
    {
      id: 'default-manager',
      name: 'Manager',
      description: 'Management features with team oversight capabilities',
      userType: 'manager' as const,
      isDefault: true,
    },
    {
      id: 'default-user',
      name: 'Standard User',
      description: 'Basic user access with essential features',
      userType: 'user' as const,
      isDefault: true,
    },
  ];

  const handleCreatePreset = () => {
    if (presetForm.name.trim()) {
      savePreset(presetForm.name, presetForm.description, presetForm.userType);
      setPresetForm({ name: '', description: '', userType: 'user' });
      setShowCreateModal(false);
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'manager': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'user': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Settings Presets</h2>
          <p className="text-gray-400 text-sm">
            Save and load different configurations for various user types and scenarios
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Icon name="Plus" className="w-4 h-4" />
          <span>Create Preset</span>
        </motion.button>
      </div>

      {/* Default Presets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Star" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Default Presets</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {defaultPresets.map((preset) => (
            <motion.div
              key={preset.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon name="Bookmark" className="w-4 h-4 text-purple-400" />
                  <span className={`px-2 py-1 text-xs rounded border ${getUserTypeColor(preset.userType)}`}>
                    {preset.userType}
                  </span>
                </div>
                <Icon name="Star" className="w-4 h-4 text-yellow-400" />
              </div>
              
              <h4 className="text-white font-medium mb-2">{preset.name}</h4>
              <p className="text-gray-400 text-sm mb-4">{preset.description}</p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Apply Preset
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Custom Presets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Settings" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Custom Presets</h3>
        </div>

        {presets.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Package" className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">No Custom Presets</h4>
            <p className="text-gray-400 mb-4">
              Create your first custom preset to save your current settings configuration
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create First Preset
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <motion.div
                key={preset.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded border ${getUserTypeColor(preset.userType)}`}>
                    {preset.userType}
                  </span>
                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => loadPreset(preset.id)}
                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                      title="Load Preset"
                    >
                      <Icon name="Download" className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deletePreset(preset.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Preset"
                    >
                      <Icon name="Trash2" className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <h4 className="text-white font-medium mb-2">{preset.name}</h4>
                {preset.description && (
                  <p className="text-gray-400 text-sm mb-3">{preset.description}</p>
                )}
                
                <div className="text-xs text-gray-500 mb-4">
                  <div>Created: {new Date(preset.createdAt).toLocaleDateString()}</div>
                  <div>Updated: {new Date(preset.updatedAt).toLocaleDateString()}</div>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => loadPreset(preset.id)}
                    className="flex-1 px-3 py-2 bg-green-600/20 text-green-200 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                  >
                    Apply
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deletePreset(preset.id)}
                    className="px-3 py-2 bg-red-600/20 text-red-200 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Preset Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Template" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Quick Templates</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border border-blue-600/30 rounded-lg text-center hover:border-blue-500/50 transition-colors"
          >
            <div className="p-2 bg-blue-500/20 rounded-lg w-fit mx-auto mb-2">
              <Icon name="Zap" className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-white font-medium mb-1">Performance</div>
            <div className="text-blue-300 text-xs">Optimized for speed</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border border-green-600/30 rounded-lg text-center hover:border-green-500/50 transition-colors"
          >
            <div className="p-2 bg-green-500/20 rounded-lg w-fit mx-auto mb-2">
              <Icon name="Battery" className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-white font-medium mb-1">Battery Saver</div>
            <div className="text-green-300 text-xs">Extended battery life</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border border-purple-600/30 rounded-lg text-center hover:border-purple-500/50 transition-colors"
          >
            <div className="p-2 bg-purple-500/20 rounded-lg w-fit mx-auto mb-2">
              <Icon name="Shield" className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-white font-medium mb-1">Privacy First</div>
            <div className="text-purple-300 text-xs">Maximum privacy</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border border-yellow-600/30 rounded-lg text-center hover:border-yellow-500/50 transition-colors"
          >
            <div className="p-2 bg-yellow-500/20 rounded-lg w-fit mx-auto mb-2">
              <Icon name="Sun" className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-white font-medium mb-1">Accessibility</div>
            <div className="text-yellow-300 text-xs">Enhanced accessibility</div>
          </motion.button>
        </div>
      </motion.div>

      {/* Create Preset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Create Settings Preset</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <Icon name="X" className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preset Name
                </label>
                <input
                  type="text"
                  value={presetForm.name}
                  onChange={(e) => setPresetForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Preset"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={presetForm.description}
                  onChange={(e) => setPresetForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this preset..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User Type
                </label>
                <select
                  value={presetForm.userType}
                  onChange={(e) => setPresetForm(prev => ({ ...prev, userType: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreatePreset}
                disabled={!presetForm.name.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Preset
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SettingsPresets;