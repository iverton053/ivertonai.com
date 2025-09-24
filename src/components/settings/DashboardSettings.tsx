import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import Icon from '../Icon';

const DashboardSettings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { dashboard } = settings;
  
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light' | 'auto'>(dashboard.theme);

  const themeOptions = [
    { value: 'dark', label: 'Dark', icon: 'Moon', description: 'Dark theme for better focus' },
    { value: 'light', label: 'Light', icon: 'Sun', description: 'Light theme for bright environments' },
    { value: 'auto', label: 'Auto', icon: 'Monitor', description: 'Follows system preference' },
  ];

  const accentColors = [
    { value: '#8B5CF6', label: 'Purple', color: 'bg-purple-500' },
    { value: '#3B82F6', label: 'Blue', color: 'bg-blue-500' },
    { value: '#10B981', label: 'Green', color: 'bg-green-500' },
    { value: '#F59E0B', label: 'Yellow', color: 'bg-yellow-500' },
    { value: '#EF4444', label: 'Red', color: 'bg-red-500' },
    { value: '#8B5A2B', label: 'Brown', color: 'bg-amber-800' },
    { value: '#6B7280', label: 'Gray', color: 'bg-gray-500' },
    { value: '#EC4899', label: 'Pink', color: 'bg-pink-500' },
  ];

  const layoutOptions = [
    { value: 'grid', label: 'Grid', icon: 'Grid3X3', description: 'Organized grid layout' },
    { value: 'masonry', label: 'Masonry', icon: 'Layout', description: 'Dynamic masonry layout' },
    { value: 'list', label: 'List', icon: 'List', description: 'Compact list layout' },
  ];

  const performanceModes = [
    { value: 'balanced', label: 'Balanced', description: 'Good balance of features and performance' },
    { value: 'performance', label: 'Performance', description: 'Maximum performance, minimal animations' },
    { value: 'battery', label: 'Battery Saver', description: 'Optimized for battery life' },
  ];

  const availableWidgets = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3', description: 'System overview and metrics' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp', description: 'Data analytics and insights' },
    { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', description: 'Task management widget' },
    { id: 'calendar', label: 'Calendar', icon: 'Calendar', description: 'Calendar and events' },
    { id: 'notes', label: 'Notes', icon: 'FileText', description: 'Quick notes and reminders' },
    { id: 'weather', label: 'Weather', icon: 'Cloud', description: 'Weather information' },
    { id: 'clock', label: 'Clock', icon: 'Clock', description: 'World clock widget' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', description: 'Recent notifications' },
  ];

  const handleInputChange = (field: keyof typeof dashboard, value: any) => {
    updateSettings('dashboard', { [field]: value });
  };

  const handleDefaultWidgetToggle = (widgetId: string) => {
    const currentWidgets = dashboard.defaultWidgets;
    const updatedWidgets = currentWidgets.includes(widgetId)
      ? currentWidgets.filter(id => id !== widgetId)
      : [...currentWidgets, widgetId];
    handleInputChange('defaultWidgets', updatedWidgets);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Theme & Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Palette" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Theme & Appearance</h3>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((theme) => (
                <motion.div
                  key={theme.value}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setPreviewTheme(theme.value as any);
                    handleInputChange('theme', theme.value);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    dashboard.theme === theme.value
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Icon name={theme.icon} className={`w-6 h-6 ${
                      dashboard.theme === theme.value ? 'text-purple-400' : 'text-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium text-white">{theme.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{theme.description}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-3">
              {accentColors.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleInputChange('accentColor', color.value)}
                  className={`w-10 h-10 rounded-full ${color.color} relative ${
                    dashboard.accentColor === color.value 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' 
                      : ''
                  }`}
                  title={color.label}
                >
                  {dashboard.accentColor === color.value && (
                    <Icon name="Check" className="w-4 h-4 text-white absolute inset-0 m-auto" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Layout Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {layoutOptions.map((layout) => (
                <motion.div
                  key={layout.value}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleInputChange('layout', layout.value)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    dashboard.layout === layout.value
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Icon name={layout.icon} className={`w-6 h-6 ${
                      dashboard.layout === layout.value ? 'text-purple-400' : 'text-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium text-white">{layout.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{layout.description}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Layout Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Layout" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Layout Configuration</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Grid Size
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="12"
                value={dashboard.gridSize}
                onChange={(e) => handleInputChange('gridSize', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-mono w-8 text-center">{dashboard.gridSize}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Number of columns in grid layout</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Widgets Per Row
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="8"
                value={dashboard.maxWidgetsPerRow}
                onChange={(e) => handleInputChange('maxWidgetsPerRow', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-mono w-8 text-center">{dashboard.maxWidgetsPerRow}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum widgets displayed per row</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Widget Refresh Interval
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="5000"
                max="300000"
                step="5000"
                value={dashboard.widgetRefreshInterval}
                onChange={(e) => handleInputChange('widgetRefreshInterval', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-mono text-sm w-16 text-center">
                {dashboard.widgetRefreshInterval / 1000}s
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">How often widgets refresh their data</p>
          </div>

          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dashboard.compactMode}
                onChange={(e) => handleInputChange('compactMode', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">Compact Mode</div>
                <div className="text-xs text-gray-500">Reduce spacing and padding</div>
              </div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Default Widgets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Grid3X3" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Default Widgets</h3>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Select which widgets should be displayed by default when loading the dashboard
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableWidgets.map((widget) => (
            <motion.div
              key={widget.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                dashboard.defaultWidgets.includes(widget.id)
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => handleDefaultWidgetToggle(widget.id)}
            >
              <div className="flex items-start space-x-3">
                <Icon name={widget.icon} className={`w-5 h-5 mt-0.5 ${
                  dashboard.defaultWidgets.includes(widget.id) 
                    ? 'text-purple-400' 
                    : 'text-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white">{widget.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{widget.description}</div>
                </div>
                {dashboard.defaultWidgets.includes(widget.id) && (
                  <Icon name="Check" className="w-4 h-4 text-purple-400" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* User Experience */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Zap" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">User Experience</h3>
        </div>

        <div className="space-y-6">
          {/* Performance Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Performance Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {performanceModes.map((mode) => (
                <motion.div
                  key={mode.value}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleInputChange('performanceMode', mode.value)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    dashboard.performanceMode === mode.value
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
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

          {/* Toggle Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
              <input
                type="checkbox"
                checked={dashboard.animationsEnabled}
                onChange={(e) => handleInputChange('animationsEnabled', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">Enable Animations</div>
                <div className="text-xs text-gray-500">Smooth transitions and effects</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
              <input
                type="checkbox"
                checked={dashboard.showTooltips}
                onChange={(e) => handleInputChange('showTooltips', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">Show Tooltips</div>
                <div className="text-xs text-gray-500">Display helpful tooltips</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
              <input
                type="checkbox"
                checked={dashboard.autoSave}
                onChange={(e) => handleInputChange('autoSave', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">Auto Save</div>
                <div className="text-xs text-gray-500">Automatically save changes</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
              <input
                type="checkbox"
                checked={dashboard.sidebarCollapsed}
                onChange={(e) => handleInputChange('sidebarCollapsed', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">Collapse Sidebar</div>
                <div className="text-xs text-gray-500">Start with sidebar collapsed</div>
              </div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Settings Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="CheckCircle" className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Settings Applied</h3>
        </div>

        <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="text-center text-green-300">
            <Icon name="CheckCircle" className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Dashboard settings are now functional!</p>
            <p className="text-xs mt-1 text-green-400">
              Your changes are automatically saved and applied to the dashboard
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="text-sm text-blue-300">
            <Icon name="Info" className="w-4 h-4 inline mr-2" />
            <strong>Active Settings:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Theme: {dashboard.theme}</li>
              <li>• Layout: {dashboard.layout}</li>
              <li>• Grid Size: {dashboard.gridSize} columns</li>
              <li>• Performance Mode: {dashboard.performanceMode}</li>
              <li>• Animations: {dashboard.animationsEnabled ? 'Enabled' : 'Disabled'}</li>
              <li>• Default Widgets: {dashboard.defaultWidgets.length} selected</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardSettings;