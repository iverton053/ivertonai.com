import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import Icon from '../Icon';

const NotificationSettings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { notifications } = settings;
  
  const [testNotification, setTestNotification] = useState<string>('');

  const handleInputChange = (field: keyof typeof notifications, value: any) => {
    updateSettings('notifications', { [field]: value });
  };

  const handleNotificationTypeChange = (type: keyof typeof notifications.notificationTypes, value: boolean) => {
    const updatedTypes = {
      ...notifications.notificationTypes,
      [type]: value,
    };
    updateSettings('notifications', { notificationTypes: updatedTypes });
  };

  const handleQuietHoursChange = (field: keyof typeof notifications.quietHours, value: any) => {
    const updatedQuietHours = {
      ...notifications.quietHours,
      [field]: value,
    };
    updateSettings('notifications', { quietHours: updatedQuietHours });
  };

  const sendTestNotification = async (type: string) => {
    setTestNotification(type);
    
    if (notifications.desktopNotifications && 'Notification' in window) {
      // Request permission if not granted
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      if (Notification.permission === 'granted') {
        new Notification(`Test ${type} Notification`, {
          body: `This is a test ${type.toLowerCase()} notification from Iverton AI Dashboard`,
          icon: '/logo.png',
          tag: 'test-notification',
        });
      }
    }
    
    setTimeout(() => setTestNotification(''), 2000);
  };

  const checkNotificationPermission = () => {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    return Notification.permission;
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'not-supported';
  };

  const frequencyOptions = [
    { value: 'realtime', label: 'Real-time', description: 'Instant notifications' },
    { value: 'hourly', label: 'Hourly', description: 'Digest every hour' },
    { value: 'daily', label: 'Daily', description: 'Daily summary' },
    { value: 'weekly', label: 'Weekly', description: 'Weekly digest' },
  ];

  const notificationTypeOptions = [
    { key: 'alerts', label: 'System Alerts', description: 'Critical system notifications', icon: 'AlertTriangle' },
    { key: 'updates', label: 'Updates', description: 'Software and feature updates', icon: 'Download' },
    { key: 'reminders', label: 'Reminders', description: 'Task and event reminders', icon: 'Clock' },
    { key: 'system', label: 'System Messages', description: 'System status messages', icon: 'Server' },
    { key: 'marketing', label: 'Marketing', description: 'Product news and promotions', icon: 'Mail' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Notification Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Bell" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Notification Channels</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Icon name="Mail" className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-medium">Email Notifications</div>
                <div className="text-gray-400 text-sm">Receive notifications via email</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailNotifications}
              onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Icon name="Smartphone" className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-white font-medium">Push Notifications</div>
                <div className="text-gray-400 text-sm">Mobile and web push notifications</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.pushNotifications}
              onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Icon name="Monitor" className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-medium">Desktop Notifications</div>
                <div className="text-gray-400 text-sm">
                  Browser desktop notifications
                  {checkNotificationPermission() === 'denied' && (
                    <span className="text-red-400 ml-1">(Permission denied)</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {checkNotificationPermission() === 'default' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={requestNotificationPermission}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors"
                >
                  Enable
                </motion.button>
              )}
              <input
                type="checkbox"
                checked={notifications.desktopNotifications && checkNotificationPermission() === 'granted'}
                onChange={(e) => handleInputChange('desktopNotifications', e.target.checked)}
                disabled={checkNotificationPermission() !== 'granted'}
                className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
              />
            </div>
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Icon name="Volume2" className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-white font-medium">Sound Notifications</div>
                <div className="text-gray-400 text-sm">Play sound with notifications</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.soundEnabled}
              onChange={(e) => handleInputChange('soundEnabled', e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
          </label>
        </div>
      </motion.div>

      {/* Notification Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Settings" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Notification Types</h3>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Choose which types of notifications you want to receive
        </p>

        <div className="space-y-3">
          {notificationTypeOptions.map((option) => (
            <label
              key={option.key}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-700/50 rounded-lg">
                  <Icon name={option.icon} className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-gray-400 text-sm">{option.description}</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.notificationTypes[option.key as keyof typeof notifications.notificationTypes]}
                onChange={(e) => handleNotificationTypeChange(
                  option.key as keyof typeof notifications.notificationTypes,
                  e.target.checked
                )}
                className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
            </label>
          ))}
        </div>
      </motion.div>

      {/* Notification Frequency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Clock" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Notification Frequency</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {frequencyOptions.map((option) => (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleInputChange('frequency', option.value)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                notifications.frequency === option.value
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

      {/* Quiet Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Moon" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Quiet Hours</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.quietHours.enabled}
              onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <div>
              <div className="text-sm font-medium text-gray-300">Enable Quiet Hours</div>
              <div className="text-xs text-gray-500">Disable notifications during specified hours</div>
            </div>
          </label>

          {notifications.quietHours.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={notifications.quietHours.start}
                  onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={notifications.quietHours.end}
                  onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>
            </motion.div>
          )}

          {notifications.quietHours.enabled && (
            <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="Info" className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div className="text-sm text-blue-200">
                  Quiet hours are from {notifications.quietHours.start} to {notifications.quietHours.end}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Test Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="TestTube" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Test Notifications</h3>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Test your notification settings to ensure they're working correctly
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => sendTestNotification('Info')}
            disabled={testNotification === 'Info'}
            className="p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg text-blue-200 hover:bg-blue-600/30 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon name="Info" className="w-4 h-4" />
              <span className="font-medium">
                {testNotification === 'Info' ? 'Sent!' : 'Test Info'}
              </span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => sendTestNotification('Warning')}
            disabled={testNotification === 'Warning'}
            className="p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg text-yellow-200 hover:bg-yellow-600/30 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon name="AlertTriangle" className="w-4 h-4" />
              <span className="font-medium">
                {testNotification === 'Warning' ? 'Sent!' : 'Test Warning'}
              </span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => sendTestNotification('Success')}
            disabled={testNotification === 'Success'}
            className="p-4 bg-green-600/20 border border-green-600/30 rounded-lg text-green-200 hover:bg-green-600/30 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon name="CheckCircle" className="w-4 h-4" />
              <span className="font-medium">
                {testNotification === 'Success' ? 'Sent!' : 'Test Success'}
              </span>
            </div>
          </motion.button>
        </div>

        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-200">
              <p className="font-medium mb-1">Note:</p>
              <p>Desktop notifications require browser permission. Click "Enable" above if needed.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationSettings;