import React from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "../../stores/settingsStore";
import Icon from "../Icon";

const ApplicationSettings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { application } = settings;
  
  const handleInputChange = (field: keyof typeof application, value: any) => {
    updateSettings("application", { [field]: value });
  };

  const performanceModes = [
    { value: "balanced", label: "Balanced", description: "Good balance of features and performance" },
    { value: "performance", label: "Performance", description: "Maximum performance, minimal animations" },
    { value: "battery", label: "Battery Saver", description: "Optimized for battery life" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Performance Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Zap" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Performance Settings</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Performance Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {performanceModes.map((mode) => (
                <motion.div
                  key={mode.value}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleInputChange("performanceMode", mode.value)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    application.performanceMode === mode.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium text-white">{mode.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{mode.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Cache Size (MB)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={application.maxCacheSize}
                  onChange={(e) => handleInputChange("maxCacheSize", parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-white font-mono w-12 text-right">{application.maxCacheSize}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max File Size (MB)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={application.maxFileSize}
                  onChange={(e) => handleInputChange("maxFileSize", parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-white font-mono w-12 text-right">{application.maxFileSize}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
              <input
                type="checkbox"
                checked={application.enableDebugMode}
                onChange={(e) => handleInputChange("enableDebugMode", e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">Debug Mode</div>
                <div className="text-xs text-gray-500">Enable debugging features</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
              <input
                type="checkbox"
                checked={application.compressionEnabled}
                onChange={(e) => handleInputChange("compressionEnabled", e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">Data Compression</div>
                <div className="text-xs text-gray-500">Compress data to save bandwidth</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
              <input
                type="checkbox"
                checked={application.backgroundSync}
                onChange={(e) => handleInputChange("backgroundSync", e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">Background Sync</div>
                <div className="text-xs text-gray-500">Sync data in background</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
              <input
                type="checkbox"
                checked={application.offlineMode}
                onChange={(e) => handleInputChange("offlineMode", e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">Offline Mode</div>
                <div className="text-xs text-gray-500">Enable offline functionality</div>
              </div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Update Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Download" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Update Settings</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Icon name="RefreshCw" className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-white font-medium">Automatic Updates</div>
                <div className="text-gray-400 text-sm">Install updates automatically</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={application.autoUpdates}
              onChange={(e) => handleInputChange("autoUpdates", e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Icon name="Beaker" className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-white font-medium">Beta Features</div>
                <div className="text-gray-400 text-sm">Enable experimental features</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={application.betaFeatures}
              onChange={(e) => handleInputChange("betaFeatures", e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
          </label>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Database" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Data Management</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Data Retention Period (Days)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="7"
              max="365"
              step="7"
              value={application.dataRetentionDays}
              onChange={(e) => handleInputChange("dataRetentionDays", parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-white font-mono w-12 text-right">{application.dataRetentionDays}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Data older than {application.dataRetentionDays} days will be automatically deleted
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ApplicationSettings;