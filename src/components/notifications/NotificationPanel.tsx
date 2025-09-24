import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  Check, 
  Trash2, 
  Filter,
  Shield,
  Database,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { AppNotification, NotificationType, NotificationPriority } from '../../types/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    selectedFilter,
    setFilter,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getFilteredNotifications,
    unreadCount,
  } = useNotificationStore();

  // Filter notifications directly without memoization to ensure reactivity
  const filteredNotifications = (() => {
    switch (selectedFilter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'security':
        return notifications.filter(n => n.type === 'security');
      case 'backup':
        return notifications.filter(n => n.type === 'backup');
      case 'system':
        return notifications.filter(n => n.type === 'system' || n.type === 'info');
      case 'all':
      default:
        return notifications;
    }
  })();

  const getNotificationIcon = (notification: AppNotification) => {
    const iconMap = {
      security: Shield,
      backup: Database,
      system: Settings,
      success: CheckCircle,
      error: AlertTriangle,
      warning: AlertTriangle,
      info: Info,
    };

    const IconComponent = iconMap[notification.type] || Bell;
    return IconComponent;
  };

  const getNotificationColor = (notification: AppNotification) => {
    if (notification.priority === 'critical') return 'text-red-400';
    if (notification.priority === 'high') return 'text-orange-400';
    if (notification.priority === 'medium') return 'text-blue-400';
    
    const colorMap = {
      security: 'text-red-400',
      backup: 'text-green-400',
      system: 'text-blue-400',
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
    };

    return colorMap[notification.type] || 'text-gray-400';
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    const badgeMap = {
      critical: 'bg-red-600/90 text-white font-semibold',
      high: 'bg-orange-600/90 text-white font-medium',
      medium: 'bg-blue-600/90 text-white font-medium',
      low: 'bg-gray-600/90 text-white font-normal',
    };

    return badgeMap[priority];
  };

  const formatTimestamp = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleActionClick = (action: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    action();
  };

  const filterOptions = useMemo(() => {
    return [
      { key: 'all', label: 'All', count: notifications.length },
      { key: 'unread', label: 'Unread', count: unreadCount },
      { key: 'security', label: 'Security', count: notifications.filter(n => n.type === 'security').length },
      { key: 'backup', label: 'Backup', count: notifications.filter(n => n.type === 'backup').length },
      { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system' || n.type === 'info').length },
    ] as const;
  }, [notifications.length, unreadCount]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-4 top-20 w-96 max-h-[80vh] bg-gray-900/98 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-2xl z-50 flex flex-col"
          >
            {/* Header - Fixed at top */}
            <div className="flex-shrink-0 p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Notifications</h2>
                    {unreadCount > 0 && (
                      <p className="text-xs text-gray-400">{unreadCount} unread</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={markAllAsRead}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Mark all as read"
                    >
                      <Check className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearAll}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 bg-gray-700/50 rounded-lg p-1">
                {filterOptions.map((filter) => (
                  <motion.button
                    key={filter.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilter(filter.key)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      selectedFilter === filter.key
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Notifications List - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-2 custom-scrollbar">
              <AnimatePresence>
                {filteredNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-white font-medium mb-2">No notifications</h3>
                    <p className="text-gray-400 text-sm">
                      {selectedFilter === 'all' 
                        ? "You're all caught up!" 
                        : `No ${selectedFilter} notifications`}
                    </p>
                  </motion.div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification);
                    const iconColor = getNotificationColor(notification);
                    
                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          notification.read
                            ? 'bg-gray-800/40 border-gray-600/60 hover:bg-gray-700/60'
                            : 'bg-purple-600/20 border-purple-400/50 hover:bg-purple-600/30 shadow-lg shadow-purple-500/10'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full bg-gray-800/60 backdrop-blur-sm ${iconColor}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-semibold truncate ${
                                notification.read ? 'text-gray-200' : 'text-white'
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                {notification.priority !== 'low' && (
                                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(notification.priority)}`}>
                                    {notification.priority}
                                  </span>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => handleActionClick(() => removeNotification(notification.id), e)}
                                  className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                                  title="Remove"
                                >
                                  <X className="w-3 h-3" />
                                </motion.button>
                              </div>
                            </div>
                            
                            <p className={`text-sm mb-2 ${
                              notification.read ? 'text-gray-300' : 'text-gray-100'
                            }`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimestamp(notification.timestamp)}</span>
                                {notification.metadata?.count && notification.metadata.count > 1 && (
                                  <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded-full">
                                    {notification.metadata.count}
                                  </span>
                                )}
                              </div>
                              
                              {!notification.read && (
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              )}
                            </div>
                            
                            {/* Notification Actions */}
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex space-x-2 mt-3">
                                {notification.actions.map((action, index) => (
                                  <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => handleActionClick(action.action, e)}
                                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                      action.style === 'primary' 
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : action.style === 'danger'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                                    }`}
                                  >
                                    {action.label}
                                  </motion.button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Footer - Fixed at bottom */}
            {filteredNotifications.length > 0 && (
              <div className="flex-shrink-0 p-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{filteredNotifications.length} notification(s)</span>
                  <span>Swipe left to dismiss</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;