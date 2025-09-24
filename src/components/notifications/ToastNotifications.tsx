import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, Shield, Database, Settings } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { AppNotification } from '../../types/notifications';

const ToastNotifications: React.FC = () => {
  const { notifications, markAsRead, removeNotification } = useNotificationStore();
  const [toastNotifications, setToastNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    // Show only HIGH priority and CRITICAL unread notifications as toasts, limit to 2 most recent
    const highPriorityNotifications = notifications
      .filter(n => !n.read && (n.priority === 'high' || n.priority === 'critical'))
      .slice(0, 2)
      .reverse(); // Show newest first

    setToastNotifications(highPriorityNotifications);

    // Auto-hide toasts after 6 seconds (except critical ones)
    const timers = highPriorityNotifications.map(notification => {
      if (notification.priority !== 'critical' && notification.autoHide !== false) {
        return setTimeout(() => {
          markAsRead(notification.id);
        }, 6000);
      }
      return null;
    });

    return () => {
      timers.forEach(timer => timer && clearTimeout(timer));
    };
  }, [notifications, markAsRead]);

  const getIcon = (notification: AppNotification) => {
    const iconMap = {
      success: CheckCircle,
      error: AlertTriangle,
      warning: AlertTriangle,
      info: Info,
      security: Shield,
      backup: Database,
      system: Settings,
    };

    const IconComponent = iconMap[notification.type] || Info;
    return IconComponent;
  };

  const getColors = (notification: AppNotification) => {
    if (notification.priority === 'critical') {
      return {
        bg: 'bg-red-900/95',
        border: 'border-red-500/50',
        icon: 'text-red-400'
      };
    }

    if (notification.priority === 'high') {
      return {
        bg: 'bg-orange-900/95',
        border: 'border-orange-500/50',
        icon: 'text-orange-400'
      };
    }

    const colorMap = {
      success: {
        bg: 'bg-green-900/95',
        border: 'border-green-500/50',
        icon: 'text-green-400'
      },
      error: {
        bg: 'bg-red-900/95',
        border: 'border-red-500/50',
        icon: 'text-red-400'
      },
      warning: {
        bg: 'bg-yellow-900/95',
        border: 'border-yellow-500/50',
        icon: 'text-yellow-400'
      },
      info: {
        bg: 'bg-blue-900/95',
        border: 'border-blue-500/50',
        icon: 'text-blue-400'
      },
      security: {
        bg: 'bg-purple-900/95',
        border: 'border-purple-500/50',
        icon: 'text-purple-400'
      },
      backup: {
        bg: 'bg-green-900/95',
        border: 'border-green-500/50',
        icon: 'text-green-400'
      },
      system: {
        bg: 'bg-gray-900/95',
        border: 'border-gray-500/50',
        icon: 'text-gray-400'
      },
    };

    return colorMap[notification.type] || colorMap.info;
  };

  const handleDismiss = (notification: AppNotification, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsRead(notification.id);
  };

  const handleToastClick = (notification: AppNotification) => {
    markAsRead(notification.id);
    
    // If there are actions, execute the primary one
    if (notification.actions && notification.actions.length > 0) {
      const primaryAction = notification.actions.find(action => action.style === 'primary') || notification.actions[0];
      primaryAction.action();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[60] pointer-events-none">
      <AnimatePresence>
        {toastNotifications.map((notification, index) => {
          const IconComponent = getIcon(notification);
          const colors = getColors(notification);

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ zIndex: 60 - index }}
              className="pointer-events-auto mb-4"
            >
              <div
                onClick={() => handleToastClick(notification)}
                className={`
                  max-w-sm p-4 rounded-xl border backdrop-blur-lg shadow-xl cursor-pointer
                  hover:scale-105 transition-transform duration-200
                  ${colors.bg} ${colors.border}
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full bg-black/20 ${colors.icon} flex-shrink-0`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-white text-sm truncate">
                        {notification.title}
                      </h4>
                      <button
                        onClick={(e) => handleDismiss(notification, e)}
                        className="ml-2 p-1 text-gray-400 hover:text-white rounded transition-colors flex-shrink-0"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="flex space-x-2 mt-3">
                        {notification.actions.slice(0, 2).map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.action();
                              markAsRead(notification.id);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              action.style === 'primary'
                                ? 'bg-gray-800 text-white hover:bg-gray-700'
                                : action.style === 'danger'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {notification.priority === 'critical' && (
                      <div className="mt-2 text-xs text-red-300 font-medium">
                        Critical: Requires immediate attention
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress bar for auto-dismiss */}
                {notification.priority !== 'critical' && notification.autoHide !== false && (
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotifications;