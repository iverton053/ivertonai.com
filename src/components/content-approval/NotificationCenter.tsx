import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Clock, AlertCircle, Users, FileText, MessageSquare, Calendar, Settings, Filter, Search, MoreVertical, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Notification {
  id: string;
  type: 'assignment' | 'approval' | 'comment' | 'deadline' | 'mention' | 'workflow' | 'system';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  urgent: boolean;
  data: {
    content_id?: string;
    user_id?: string;
    workflow_id?: string;
    comment_id?: string;
  };
  actions?: Array<{
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    action: () => void;
  }>;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onClearAll: () => void;
  onNotificationClick: (notification: Notification) => void;
  unreadCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  settings: {
    assignments: boolean;
    approvals: boolean;
    comments: boolean;
    deadlines: boolean;
    mentions: boolean;
    workflows: boolean;
    system: boolean;
  };
  onUpdateSettings: (settings: any) => void;
}

const notificationIcons = {
  assignment: Users,
  approval: CheckCheck,
  comment: MessageSquare,
  deadline: Calendar,
  mention: AlertCircle,
  workflow: FileText,
  system: Settings
};

const notificationColors = {
  assignment: 'bg-blue-100 text-blue-600',
  approval: 'bg-green-100 text-green-600',
  comment: 'bg-purple-100 text-purple-600',
  deadline: 'bg-orange-100 text-orange-600',
  mention: 'bg-red-100 text-red-600',
  workflow: 'bg-indigo-100 text-indigo-600',
  system: 'bg-gray-100 text-gray-600'
};

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onNotificationClick,
  unreadCount,
  soundEnabled,
  onToggleSound,
  settings,
  onUpdateSettings
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playSound, setPlaySound] = useState(false);

  useEffect(() => {
    if (soundEnabled && playSound && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Handle autoplay restrictions
      });
      setPlaySound(false);
    }
  }, [playSound, soundEnabled]);

  useEffect(() => {
    // Play sound for new notifications
    const latestNotification = notifications[0];
    if (latestNotification && !latestNotification.read && soundEnabled) {
      setPlaySound(true);
    }
  }, [notifications, soundEnabled]);

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.read) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    if (searchQuery) {
      return notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: Record<string, Notification[]> = {};

    notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
    });

    return groups;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderNotification = (notification: Notification) => {
    const Icon = notificationIcons[notification.type];

    return (
      <motion.div
        key={notification.id}
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -300 }}
        className={`
          relative p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors
          ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
          ${notification.urgent ? 'ring-2 ring-red-200' : ''}
        `}
        onClick={() => {
          onNotificationClick(notification);
          if (!notification.read) {
            onMarkAsRead(notification.id);
          }
        }}
      >
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${notificationColors[notification.type]} flex-shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeAgo(notification.created_at)}</span>
                  {notification.urgent && (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-600 font-medium">Urgent</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-1 ml-2">
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(notification.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {notification.actions && notification.actions.length > 0 && (
              <div className="flex items-center space-x-2 mt-3">
                {notification.actions.map(action => (
                  <button
                    key={action.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                    className={`
                      px-3 py-1 text-xs rounded font-medium transition-colors
                      ${action.type === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                      ${action.type === 'secondary' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
                      ${action.type === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAllNotifications = () => {
    const groupedNotifications = groupNotificationsByDate(filteredNotifications);

    return (
      <div className="space-y-4">
        {Object.entries(groupedNotifications).map(([date, notifications]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-gray-500 px-4 py-2 bg-gray-50">
              {date}
            </h3>
            <AnimatePresence>
              {notifications.map(notification => renderNotification(notification))}
            </AnimatePresence>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No notifications found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Sound</h4>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={onToggleSound}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Play sound for new notifications</span>
          </label>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Types</h4>
          <div className="space-y-3">
            {Object.entries(settings).map(([key, enabled]) => {
              const Icon = notificationIcons[key as keyof typeof notificationIcons];
              return (
                <label key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => onUpdateSettings({ ...settings, [key]: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 capitalize">
                    {key.replace('_', ' ')} notifications
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onClearAll}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All Notifications
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Audio element for notification sounds */}
      <audio
        ref={audioRef}
        preload="auto"
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LFeSMFl+Xj8diJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LFMSQ+"
      />

      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-500 bg-opacity-75"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-screen max-w-md"
            >
              <div className="h-full flex flex-col bg-white shadow-xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Notifications
                      </h2>
                      {unreadCount > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
                    {[
                      { id: 'all', label: 'All', count: notifications.length },
                      { id: 'unread', label: 'Unread', count: unreadCount },
                      { id: 'settings', label: 'Settings' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                          flex-1 px-3 py-1 text-sm rounded transition-colors
                          ${activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                          }
                        `}
                      >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="ml-1 text-xs opacity-75">
                            ({tab.count})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab !== 'settings' && (
                  <>
                    {/* Search and Filter */}
                    <div className="px-6 py-4 border-b border-gray-200 space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search notifications..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Types</option>
                          <option value="assignment">Assignments</option>
                          <option value="approval">Approvals</option>
                          <option value="comment">Comments</option>
                          <option value="deadline">Deadlines</option>
                          <option value="mention">Mentions</option>
                          <option value="workflow">Workflows</option>
                          <option value="system">System</option>
                        </select>

                        {unreadCount > 0 && (
                          <button
                            onClick={onMarkAllAsRead}
                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <CheckCheck className="w-4 h-4" />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                      {renderAllNotifications()}
                    </div>
                  </>
                )}

                {activeTab === 'settings' && (
                  <div className="flex-1 overflow-y-auto">
                    {renderSettings()}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}