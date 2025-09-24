import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellRing,
  Zap,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Info,
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  AdvancedNotification,
  NotificationMetrics,
  NotificationPriority,
  NotificationType
} from '../../types/advancedNotifications';
import advancedNotificationService from '../../services/advancedNotificationService';
import AdvancedNotificationCenter from './AdvancedNotificationCenter';

interface EnhancedNotificationBellProps {
  userId: string;
  showBadge?: boolean;
  showQuickPreview?: boolean;
  soundEnabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
  className?: string;
}

const EnhancedNotificationBell: React.FC<EnhancedNotificationBellProps> = ({
  userId,
  showBadge = true,
  showQuickPreview = true,
  soundEnabled = true,
  size = 'md',
  theme = 'dark',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<AdvancedNotification[]>([]);
  const [isRinging, setIsRinging] = useState(false);
  const [showQuickTooltip, setShowQuickTooltip] = useState(false);
  const [hasNewCritical, setHasNewCritical] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const bellRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastNotificationCount = useRef<number>(0);

  // Size configurations
  const sizeConfig = {
    sm: {
      bell: 'w-5 h-5',
      badge: 'w-4 h-4 text-xs',
      container: 'p-2'
    },
    md: {
      bell: 'w-6 h-6',
      badge: 'w-5 h-5 text-xs',
      container: 'p-2.5'
    },
    lg: {
      bell: 'w-7 h-7',
      badge: 'w-6 h-6 text-sm',
      container: 'p-3'
    }
  };

  // Load metrics and recent notifications
  useEffect(() => {
    if (userId) {
      loadMetrics();
      loadRecentNotifications();

      // Set up real-time updates
      const interval = setInterval(() => {
        loadMetrics();
        loadRecentNotifications();
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [userId]);

  // Listen for new notifications
  useEffect(() => {
    const handleNewNotification = (event: any) => {
      const notification = event.payload.notification as AdvancedNotification;
      if (notification.userId === userId) {
        loadMetrics();
        loadRecentNotifications();
        
        // Trigger bell animation and sound
        if (notification.priority === 'critical' || notification.priority === 'urgent') {
          setHasNewCritical(true);
          setIsRinging(true);
          setTimeout(() => setIsRinging(false), 1000);
        }
        
        setPulseAnimation(true);
        setTimeout(() => setPulseAnimation(false), 2000);

        // Play notification sound
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
      }
    };

    advancedNotificationService.on('notification:created', handleNewNotification);
    advancedNotificationService.on('notification:delivered', handleNewNotification);

    return () => {
      advancedNotificationService.off('notification:created', handleNewNotification);
      advancedNotificationService.off('notification:delivered', handleNewNotification);
    };
  }, [userId, soundEnabled]);

  // Reset critical notification indicator when notifications are read
  useEffect(() => {
    const handleRead = () => {
      setHasNewCritical(false);
    };

    advancedNotificationService.on('notification:read', handleRead);
    return () => advancedNotificationService.off('notification:read', handleRead);
  }, []);

  // Check for new notifications
  useEffect(() => {
    if (metrics && lastNotificationCount.current > 0) {
      const hasNew = metrics.total > lastNotificationCount.current;
      if (hasNew) {
        setPulseAnimation(true);
        setTimeout(() => setPulseAnimation(false), 2000);
      }
    }
    if (metrics) {
      lastNotificationCount.current = metrics.total;
    }
  }, [metrics]);

  const loadMetrics = async () => {
    try {
      const metricsData = advancedNotificationService.getMetrics(userId);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load notification metrics:', error);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const recent = advancedNotificationService.getRecentNotifications(userId, 3);
      setRecentNotifications(recent);
      
      // Check for critical notifications
      const hasCritical = recent.some(n => 
        (n.priority === 'critical' || n.priority === 'urgent') && n.status !== 'read'
      );
      setHasNewCritical(hasCritical);
    } catch (error) {
      console.error('Failed to load recent notifications:', error);
    }
  };

  const getNotificationIcon = (type: NotificationType, priority: NotificationPriority) => {
    const iconClass = `w-3 h-3 ${
      priority === 'critical' || priority === 'urgent' ? 'text-red-400' : 
      priority === 'high' ? 'text-orange-400' : 'text-blue-400'
    }`;

    switch (type) {
      case 'security': return <Shield className={iconClass} />;
      case 'system': return <Zap className={iconClass} />;
      case 'error': return <AlertCircle className={iconClass} />;
      case 'warning': return <AlertTriangle className={iconClass} />;
      case 'success': return <CheckCircle2 className={iconClass} />;
      default: return <Info className={iconClass} />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getBellColor = () => {
    if (hasNewCritical) return 'text-red-400';
    if (metrics && metrics.unread > 0) return 'text-purple-400';
    return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  };

  const config = sizeConfig[size];
  const unreadCount = metrics?.unread || 0;

  return (
    <>
      <div className="relative">
        {/* Bell Button */}
        <motion.button
          ref={bellRef}
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => showQuickPreview && setShowQuickTooltip(true)}
          onMouseLeave={() => setShowQuickTooltip(false)}
          className={`
            relative ${config.container} rounded-lg transition-all duration-200
            ${theme === 'dark' 
              ? 'hover:bg-gray-700/50 text-white' 
              : 'hover:bg-gray-800/50 text-gray-300'
            }
            ${hasNewCritical ? 'animate-pulse' : ''}
            ${className}
          `}
          animate={pulseAnimation ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {/* Bell Icon with Animation */}
          <motion.div
            animate={isRinging ? { rotate: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            {isRinging || hasNewCritical ? (
              <BellRing className={`${config.bell} ${getBellColor()}`} />
            ) : (
              <Bell className={`${config.bell} ${getBellColor()}`} />
            )}
          </motion.div>

          {/* Badge */}
          {showBadge && unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`
                absolute -top-1 -right-1 ${config.badge} 
                bg-red-500 text-white rounded-full 
                flex items-center justify-center font-medium
                ${hasNewCritical ? 'animate-pulse' : ''}
              `}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}

          {/* Critical Alert Indicator */}
          {hasNewCritical && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full animate-ping"
            />
          )}
        </motion.button>

        {/* Quick Preview Tooltip */}
        <AnimatePresence>
          {showQuickTooltip && showQuickPreview && recentNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`
                absolute top-full mt-2 right-0 w-80 z-40
                ${theme === 'dark' 
                  ? 'bg-gray-800/95 border-gray-700/50' 
                  : 'bg-white/95 border-gray-700/50'
                } 
                backdrop-blur-xl border rounded-xl shadow-2xl
              `}
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Recent Notifications
                  </h4>
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                    <span>{unreadCount} unread</span>
                  </div>
                </div>
              </div>

              {/* Notifications Preview */}
              <div className="max-h-64 overflow-y-auto">
                {recentNotifications.slice(0, 3).map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      p-3 border-b border-gray-700/30 last:border-b-0 
                      hover:bg-gray-700/30 cursor-pointer transition-colors
                      ${notification.status === 'read' ? 'opacity-60' : ''}
                    `}
                    onClick={() => {
                      setShowQuickTooltip(false);
                      setIsOpen(true);
                    }}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`
                          text-sm font-medium line-clamp-1
                          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                          ${notification.status === 'read' ? 'text-gray-400' : ''}
                        `}>
                          {notification.title}
                        </p>
                        <p className={`
                          text-xs line-clamp-2 mt-1
                          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
                          ${notification.status === 'read' ? 'text-gray-500' : ''}
                        `}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                          <span className="capitalize">{notification.type}</span>
                        </div>
                      </div>
                      {notification.status !== 'read' && (
                        <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-1" />
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* View All Button */}
                <div className="p-3">
                  <button
                    onClick={() => {
                      setShowQuickTooltip(false);
                      setIsOpen(true);
                    }}
                    className={`
                      w-full py-2 text-sm font-medium rounded-lg transition-colors
                      ${theme === 'dark' 
                        ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10' 
                        : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                      }
                    `}
                  >
                    View all notifications ({metrics?.total || 0})
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notification Sound */}
      {soundEnabled && (
        <audio
          ref={audioRef}
          preload="auto"
          className="hidden"
        >
          <source src="/notification-sound.mp3" type="audio/mpeg" />
          <source src="/notification-sound.wav" type="audio/wav" />
        </audio>
      )}

      {/* Advanced Notification Center */}
      <AnimatePresence>
        {isOpen && (
          <AdvancedNotificationCenter
            userId={userId}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            position="right"
            theme={theme}
            showMetrics={true}
            showSearch={true}
            showFilters={true}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedNotificationBell;