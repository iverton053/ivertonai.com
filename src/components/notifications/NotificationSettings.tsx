import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Mail,
  MessageCircle,
  Webhook,
  Clock,
  Filter,
  Zap,
  Shield,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  RotateCcw,
  Save,
  X
} from 'lucide-react';
import {
  NotificationPreferences,
  NotificationChannel,
  NotificationType,
  NotificationPriority
} from '../../types/advancedNotifications';
import advancedNotificationService from '../../services/advancedNotificationService';

interface NotificationSettingsProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (preferences: NotificationPreferences) => void;
}

interface ChannelConfig {
  id: NotificationChannel;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresPermission?: boolean;
  availableFrequencies: ('immediate' | 'batched' | 'daily' | 'weekly')[];
}

interface TypeConfig {
  id: NotificationType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultPriority: NotificationPriority;
  recommendedChannels: NotificationChannel[];
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  userId,
  isOpen,
  onClose,
  onSave
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [activeTab, setActiveTab] = useState<'channels' | 'categories' | 'schedule' | 'advanced'>('channels');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({});

  const channelConfigs: ChannelConfig[] = [
    {
      id: 'toast',
      name: 'Toast Notifications',
      description: 'Real-time popup notifications in the corner',
      icon: Bell,
      availableFrequencies: ['immediate']
    },
    {
      id: 'panel',
      name: 'Notification Panel',
      description: 'Notifications in the main notification center',
      icon: Bell,
      availableFrequencies: ['immediate', 'batched']
    },
    {
      id: 'desktop',
      name: 'Desktop Notifications',
      description: 'System notifications outside the browser',
      icon: Monitor,
      requiresPermission: true,
      availableFrequencies: ['immediate']
    },
    {
      id: 'email',
      name: 'Email Notifications',
      description: 'Email alerts for important updates',
      icon: Mail,
      availableFrequencies: ['immediate', 'batched', 'daily', 'weekly']
    },
    {
      id: 'sms',
      name: 'SMS Notifications',
      description: 'Text messages for critical alerts',
      icon: Smartphone,
      availableFrequencies: ['immediate']
    },
    {
      id: 'webhook',
      name: 'Webhook Notifications',
      description: 'HTTP callbacks to external services',
      icon: Webhook,
      availableFrequencies: ['immediate']
    }
  ];

  const typeConfigs: TypeConfig[] = [
    {
      id: 'system',
      name: 'System Updates',
      description: 'Application updates, maintenance, and system messages',
      icon: Settings,
      defaultPriority: 'medium',
      recommendedChannels: ['panel', 'email']
    },
    {
      id: 'security',
      name: 'Security Alerts',
      description: 'Login attempts, security warnings, and threats',
      icon: Shield,
      defaultPriority: 'high',
      recommendedChannels: ['toast', 'panel', 'desktop', 'email']
    },
    {
      id: 'platform',
      name: 'Platform Health',
      description: 'API status, integration failures, and platform issues',
      icon: Zap,
      defaultPriority: 'high',
      recommendedChannels: ['toast', 'panel']
    },
    {
      id: 'social',
      name: 'Social Media',
      description: 'Post status, engagement metrics, and social updates',
      icon: Users,
      defaultPriority: 'medium',
      recommendedChannels: ['panel']
    },
    {
      id: 'content',
      name: 'Content Management',
      description: 'Content approvals, publishing, and workflow updates',
      icon: FileText,
      defaultPriority: 'medium',
      recommendedChannels: ['panel', 'email']
    },
    {
      id: 'marketing',
      name: 'Marketing Campaigns',
      description: 'Campaign performance, analytics, and marketing insights',
      icon: TrendingUp,
      defaultPriority: 'low',
      recommendedChannels: ['panel', 'email']
    },
    {
      id: 'success',
      name: 'Success Messages',
      description: 'Completion confirmations and positive feedback',
      icon: CheckCircle2,
      defaultPriority: 'low',
      recommendedChannels: ['toast', 'panel']
    },
    {
      id: 'error',
      name: 'Error Alerts',
      description: 'System errors, failures, and critical issues',
      icon: AlertCircle,
      defaultPriority: 'high',
      recommendedChannels: ['toast', 'panel', 'desktop']
    },
    {
      id: 'warning',
      name: 'Warning Messages',
      description: 'Cautionary alerts and potential issues',
      icon: AlertTriangle,
      defaultPriority: 'medium',
      recommendedChannels: ['panel']
    },
    {
      id: 'info',
      name: 'Information',
      description: 'General information and updates',
      icon: Info,
      defaultPriority: 'low',
      recommendedChannels: ['panel']
    }
  ];

  // Load preferences and check permissions
  useEffect(() => {
    if (isOpen && userId) {
      loadPreferences();
      checkPermissions();
    }
  }, [isOpen, userId]);

  const loadPreferences = async () => {
    try {
      const prefs = advancedNotificationService.getUserPreferences(userId);
      setPreferences(prefs || getDefaultPreferences());
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setPreferences(getDefaultPreferences());
    }
  };

  const checkPermissions = async () => {
    const perms: { [key: string]: boolean } = {};
    
    // Check desktop notification permission
    if ('Notification' in window) {
      perms.desktop = Notification.permission === 'granted';
    }

    setPermissions(perms);
  };

  const requestPermission = async (channel: NotificationChannel) => {
    if (channel === 'desktop' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissions(prev => ({ ...prev, desktop: permission === 'granted' }));
    }
  };

  const getDefaultPreferences = (): NotificationPreferences => {
    return {
      userId,
      channels: channelConfigs.reduce((acc, channel) => {
        acc[channel.id] = {
          enabled: ['toast', 'panel'].includes(channel.id),
          priority: 'medium',
          frequency: 'immediate'
        };
        return acc;
      }, {} as any),
      categories: typeConfigs.reduce((acc, type) => {
        acc[type.id] = {
          enabled: true,
          priority: type.defaultPriority,
          channels: type.recommendedChannels
        };
        return acc;
      }, {} as any),
      smartBatching: {
        enabled: true,
        maxBatchSize: 5,
        batchInterval: 15,
        intelligentGrouping: true
      },
      doNotDisturb: {
        enabled: false,
        allowUrgent: true
      }
    };
  };

  const updateChannelPreference = (channel: NotificationChannel, key: string, value: any) => {
    if (!preferences) return;

    const updated = {
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: {
          ...preferences.channels[channel],
          [key]: value
        }
      }
    };

    setPreferences(updated);
    setHasChanges(true);
  };

  const updateCategoryPreference = (type: NotificationType, key: string, value: any) => {
    if (!preferences) return;

    const updated = {
      ...preferences,
      categories: {
        ...preferences.categories,
        [type]: {
          ...preferences.categories[type],
          [key]: value
        }
      }
    };

    setPreferences(updated);
    setHasChanges(true);
  };

  const updateGeneralPreference = (section: 'smartBatching' | 'doNotDisturb', key: string, value: any) => {
    if (!preferences) return;

    const updated = {
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: value
      }
    };

    setPreferences(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      await advancedNotificationService.updateUserPreferences(userId, preferences);
      setHasChanges(false);
      onSave?.(preferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences(getDefaultPreferences());
    setHasChanges(true);
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/10';
      case 'urgent': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const tabs = [
    { id: 'channels', name: 'Channels', icon: Bell },
    { id: 'categories', name: 'Categories', icon: Filter },
    { id: 'schedule', name: 'Schedule', icon: Clock },
    { id: 'advanced', name: 'Advanced', icon: Settings }
  ];

  if (!isOpen || !preferences) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Settings Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Notification Settings</h2>
              <p className="text-sm text-gray-400">Customize how and when you receive notifications</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800/30 border-r border-gray-700/50 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors
                      ${activeTab === tab.id 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'channels' && (
                  <motion.div
                    key="channels"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Notification Channels</h3>
                      <p className="text-sm text-gray-400 mb-6">
                        Choose how you want to receive notifications
                      </p>
                    </div>

                    {channelConfigs.map((channel) => {
                      const Icon = channel.icon;
                      const channelPrefs = preferences.channels[channel.id];
                      const needsPermission = channel.requiresPermission && !permissions[channel.id];

                      return (
                        <div
                          key={channel.id}
                          className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-gray-700/50 rounded-lg">
                                <Icon className="w-5 h-5 text-gray-300" />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{channel.name}</h4>
                                <p className="text-sm text-gray-400 mt-1">{channel.description}</p>
                                {needsPermission && (
                                  <button
                                    onClick={() => requestPermission(channel.id)}
                                    className="mt-2 px-3 py-1 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors"
                                  >
                                    Grant Permission
                                  </button>
                                )}
                              </div>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={channelPrefs?.enabled || false}
                                onChange={(e) => updateChannelPreference(channel.id, 'enabled', e.target.checked)}
                                className="sr-only peer"
                                disabled={needsPermission}
                              />
                              <div className={`
                                relative w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                                peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                                ${channelPrefs?.enabled ? 'bg-purple-600' : ''}
                                ${needsPermission ? 'opacity-50 cursor-not-allowed' : ''}
                              `} />
                            </label>
                          </div>

                          {channelPrefs?.enabled && (
                            <div className="space-y-4 pl-11">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Priority Level
                                </label>
                                <select
                                  value={channelPrefs.priority || 'medium'}
                                  onChange={(e) => updateChannelPreference(channel.id, 'priority', e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="critical">Critical</option>
                                  <option value="urgent">Urgent</option>
                                  <option value="high">High</option>
                                  <option value="medium">Medium</option>
                                  <option value="low">Low</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Frequency
                                </label>
                                <select
                                  value={channelPrefs.frequency || 'immediate'}
                                  onChange={(e) => updateChannelPreference(channel.id, 'frequency', e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  {channel.availableFrequencies.map(freq => (
                                    <option key={freq} value={freq} className="capitalize">
                                      {freq}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {channelPrefs.quietHours && (
                                <div>
                                  <label className="flex items-center space-x-2 mb-2">
                                    <input
                                      type="checkbox"
                                      checked={channelPrefs.quietHours.enabled || false}
                                      onChange={(e) => updateChannelPreference(channel.id, 'quietHours', {
                                        ...channelPrefs.quietHours,
                                        enabled: e.target.checked
                                      })}
                                      className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                                    />
                                    <span className="text-sm font-medium text-gray-300">Quiet Hours</span>
                                  </label>

                                  {channelPrefs.quietHours.enabled && (
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs text-gray-400 mb-1">Start</label>
                                        <input
                                          type="time"
                                          value={channelPrefs.quietHours.start || '22:00'}
                                          onChange={(e) => updateChannelPreference(channel.id, 'quietHours', {
                                            ...channelPrefs.quietHours,
                                            start: e.target.value
                                          })}
                                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-400 mb-1">End</label>
                                        <input
                                          type="time"
                                          value={channelPrefs.quietHours.end || '08:00'}
                                          onChange={(e) => updateChannelPreference(channel.id, 'quietHours', {
                                            ...channelPrefs.quietHours,
                                            end: e.target.value
                                          })}
                                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {activeTab === 'categories' && (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Notification Categories</h3>
                      <p className="text-sm text-gray-400 mb-6">
                        Configure notifications for different types of events
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {typeConfigs.map((type) => {
                        const Icon = type.icon;
                        const categoryPrefs = preferences.categories[type.id];

                        return (
                          <div
                            key={type.id}
                            className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${getPriorityColor(type.defaultPriority)}`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-white">{type.name}</h4>
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {type.description}
                                  </p>
                                </div>
                              </div>

                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={categoryPrefs?.enabled || false}
                                  onChange={(e) => updateCategoryPreference(type.id, 'enabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className={`
                                  relative w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer 
                                  peer-checked:after:translate-x-full peer-checked:after:border-white 
                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                  after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
                                  ${categoryPrefs?.enabled ? 'bg-purple-600' : ''}
                                `} />
                              </label>
                            </div>

                            {categoryPrefs?.enabled && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Priority
                                  </label>
                                  <select
                                    value={categoryPrefs.priority || type.defaultPriority}
                                    onChange={(e) => updateCategoryPreference(type.id, 'priority', e.target.value)}
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  >
                                    <option value="critical">Critical</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-2">
                                    Channels
                                  </label>
                                  <div className="flex flex-wrap gap-1">
                                    {channelConfigs.slice(0, 4).map((channel) => {
                                      const isSelected = categoryPrefs.channels?.includes(channel.id) || false;
                                      return (
                                        <button
                                          key={channel.id}
                                          onClick={() => {
                                            const channels = categoryPrefs.channels || [];
                                            const updated = isSelected
                                              ? channels.filter(c => c !== channel.id)
                                              : [...channels, channel.id];
                                            updateCategoryPreference(type.id, 'channels', updated);
                                          }}
                                          className={`
                                            px-2 py-1 rounded text-xs font-medium transition-colors
                                            ${isSelected 
                                              ? 'bg-purple-600 text-white' 
                                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }
                                          `}
                                        >
                                          {channel.name.split(' ')[0]}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'schedule' && (
                  <motion.div
                    key="schedule"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Do Not Disturb</h3>
                      <p className="text-sm text-gray-400 mb-6">
                        Set quiet hours and manage when notifications are delivered
                      </p>
                    </div>

                    <div className="p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Moon className="w-6 h-6 text-purple-400" />
                          <div>
                            <h4 className="font-medium text-white">Do Not Disturb</h4>
                            <p className="text-sm text-gray-400">Pause all notifications except urgent ones</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.doNotDisturb.enabled}
                            onChange={(e) => updateGeneralPreference('doNotDisturb', 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`
                            relative w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                            peer-checked:after:translate-x-full peer-checked:after:border-white 
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                            after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                            ${preferences.doNotDisturb.enabled ? 'bg-purple-600' : ''}
                          `} />
                        </label>
                      </div>

                      {preferences.doNotDisturb.enabled && (
                        <div className="space-y-4 pl-9">
                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={preferences.doNotDisturb.allowUrgent}
                                onChange={(e) => updateGeneralPreference('doNotDisturb', 'allowUrgent', e.target.checked)}
                                className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-300">Allow urgent notifications</span>
                            </label>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                              <input
                                type="time"
                                value={preferences.doNotDisturb.start || '22:00'}
                                onChange={(e) => updateGeneralPreference('doNotDisturb', 'start', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                              <input
                                type="time"
                                value={preferences.doNotDisturb.end || '08:00'}
                                onChange={(e) => updateGeneralPreference('doNotDisturb', 'end', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'advanced' && (
                  <motion.div
                    key="advanced"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Advanced Settings</h3>
                      <p className="text-sm text-gray-400 mb-6">
                        Configure smart features and notification behavior
                      </p>
                    </div>

                    <div className="p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Zap className="w-6 h-6 text-blue-400" />
                          <div>
                            <h4 className="font-medium text-white">Smart Batching</h4>
                            <p className="text-sm text-gray-400">Group similar notifications to reduce noise</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.smartBatching.enabled}
                            onChange={(e) => updateGeneralPreference('smartBatching', 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`
                            relative w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                            peer-checked:after:translate-x-full peer-checked:after:border-white 
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                            after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                            ${preferences.smartBatching.enabled ? 'bg-purple-600' : ''}
                          `} />
                        </label>
                      </div>

                      {preferences.smartBatching.enabled && (
                        <div className="space-y-4 pl-9">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Max Batch Size: {preferences.smartBatching.maxBatchSize}
                            </label>
                            <input
                              type="range"
                              min="3"
                              max="10"
                              value={preferences.smartBatching.maxBatchSize}
                              onChange={(e) => updateGeneralPreference('smartBatching', 'maxBatchSize', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Batch Interval: {preferences.smartBatching.batchInterval} minutes
                            </label>
                            <input
                              type="range"
                              min="5"
                              max="60"
                              step="5"
                              value={preferences.smartBatching.batchInterval}
                              onChange={(e) => updateGeneralPreference('smartBatching', 'batchInterval', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>

                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={preferences.smartBatching.intelligentGrouping}
                                onChange={(e) => updateGeneralPreference('smartBatching', 'intelligentGrouping', e.target.checked)}
                                className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-300">Intelligent grouping based on content</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700/50">
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-sm text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationSettings;