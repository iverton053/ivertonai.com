import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Shield,
  Zap,
  Bell,
  ExternalLink,
  Eye,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react';
import {
  AdvancedNotification,
  NotificationType,
  NotificationPriority,
  NotificationAction
} from '../../types/advancedNotifications';
import advancedNotificationService from '../../services/advancedNotificationService';

interface ToastNotificationProps {
  notification: AdvancedNotification;
  onClose: (id: string) => void;
  onAction: (notificationId: string, actionId: string) => void;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  index: number;
}

interface SmartToastSystemProps {
  userId: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
  defaultDuration?: number;
  enableGrouping?: boolean;
  enableSmartBatching?: boolean;
  theme?: 'dark' | 'light';
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
  onAction,
  position,
  index
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isExpanded, setIsExpanded] = useState(false);

  const duration = notification.autoHideDuration || 5000;
  const shouldAutoHide = notification.autoHide && !notification.persistent && !isHovered;

  // Auto-hide timer with progress
  useEffect(() => {
    if (!shouldAutoHide) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          onClose(notification.id);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [shouldAutoHide, duration, notification.id, onClose]);

  // Reset progress on hover
  useEffect(() => {
    if (isHovered) {
      setProgress(100);
    }
  }, [isHovered]);

  const getIcon = () => {
    const iconProps = { className: 'w-5 h-5' };
    
    switch (notification.type) {
      case 'success': return <CheckCircle2 {...iconProps} className="w-5 h-5 text-green-400" />;
      case 'error': case 'critical': return <AlertCircle {...iconProps} className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle {...iconProps} className="w-5 h-5 text-yellow-400" />;
      case 'security': return <Shield {...iconProps} className="w-5 h-5 text-red-400" />;
      case 'system': return <Zap {...iconProps} className="w-5 h-5 text-blue-400" />;
      case 'social': return <Users {...iconProps} className="w-5 h-5 text-purple-400" />;
      case 'content': return <FileText {...iconProps} className="w-5 h-5 text-blue-400" />;
      case 'marketing': return <TrendingUp {...iconProps} className="w-5 h-5 text-green-400" />;
      default: return <Info {...iconProps} className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    const opacity = notification.priority === 'critical' || notification.priority === 'urgent' ? '95' : '90';
    
    switch (notification.type) {
      case 'success': return `bg-green-900/${opacity} border-green-500/50`;
      case 'error': case 'critical': return `bg-red-900/${opacity} border-red-500/50`;
      case 'warning': return `bg-yellow-900/${opacity} border-yellow-500/50`;
      case 'security': return `bg-red-900/${opacity} border-red-500/50`;
      case 'system': return `bg-blue-900/${opacity} border-blue-500/50`;
      default: return `bg-gray-900/${opacity} border-gray-500/50`;
    }
  };

  const getPriorityIndicator = () => {
    switch (notification.priority) {
      case 'critical': return 'border-l-4 border-l-red-500';
      case 'urgent': return 'border-l-4 border-l-red-400';
      case 'high': return 'border-l-4 border-l-orange-400';
      case 'medium': return 'border-l-4 border-l-yellow-400';
      case 'low': return 'border-l-4 border-l-blue-400';
      default: return 'border-l-4 border-l-gray-400';
    }
  };

  const getSlideDirection = () => {
    const directions = {
      'top-right': { x: '100%', y: 0 },
      'top-left': { x: '-100%', y: 0 },
      'bottom-right': { x: '100%', y: 0 },
      'bottom-left': { x: '-100%', y: 0 }
    };
    return directions[position];
  };

  const toastVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      ...getSlideDirection()
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: index * 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      ...getSlideDirection(),
      transition: {
        duration: 0.2
      }
    }
  };

  const handleActionClick = async (action: NotificationAction) => {
    if (action.requiresConfirmation) {
      const confirmed = window.confirm(action.confirmationMessage || `Are you sure you want to ${action.label.toLowerCase()}?`);
      if (!confirmed) return;
    }

    onAction(notification.id, action.id);

    // Auto-close after action unless it's a persistent notification
    if (!notification.persistent) {
      setTimeout(() => onClose(notification.id), 1000);
    }
  };

  return (
    <motion.div
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`
        relative w-80 max-w-sm backdrop-blur-xl border rounded-xl shadow-2xl 
        ${getBackgroundColor()} ${getPriorityIndicator()}
        ${notification.priority === 'critical' || notification.priority === 'urgent' ? 'animate-pulse' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ zIndex: 9999 - index }}
    >
      {/* Progress Bar */}
      {shouldAutoHide && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700/50 rounded-t-xl overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm leading-5">
                  {notification.title}
                </h4>
                
                <p className={`mt-1 text-sm text-gray-300 leading-5 ${
                  isExpanded ? '' : 'line-clamp-2'
                }`}>
                  {notification.message}
                </p>

                {/* Metadata */}
                <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>now</span>
                  </span>
                  <span>•</span>
                  <span className="capitalize">{notification.source}</span>
                  {notification.priority !== 'medium' && (
                    <>
                      <span>•</span>
                      <span className={`capitalize font-medium ${
                        notification.priority === 'critical' || notification.priority === 'urgent' ? 'text-red-400' :
                        notification.priority === 'high' ? 'text-orange-400' : 'text-blue-400'
                      }`}>
                        {notification.priority}
                      </span>
                    </>
                  )}
                </div>

                {/* Long message expansion */}
                {notification.message.length > 100 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-purple-400 hover:text-purple-300 mt-1 transition-colors"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => onClose(notification.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-700/50">
                {notification.actions.slice(0, 3).map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                      hover:scale-105 active:scale-95 flex items-center space-x-1
                      ${action.variant === 'primary' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                        action.variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                        action.variant === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                        'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    {action.icon && <span>{action.icon}</span>}
                    <span>{action.label}</span>
                  </button>
                ))}
                
                {notification.actions.length > 3 && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                  >
                    +{notification.actions.length - 3} more
                  </button>
                )}
              </div>
            )}

            {/* Click Action Indicator */}
            {notification.clickAction && (
              <div className="mt-2 pt-2 border-t border-gray-700/50">
                <button className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  {notification.clickAction.type === 'url' ? (
                    <ExternalLink className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  <span>
                    {notification.clickAction.type === 'url' ? 'Open link' :
                     notification.clickAction.type === 'route' ? 'Go to page' :
                     notification.clickAction.type === 'modal' ? 'View details' :
                     'Take action'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Indicator */}
      {notification.batchId && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
            <Bell className="w-3 h-3" />
            <span>Batch</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const SmartToastSystem: React.FC<SmartToastSystemProps> = ({
  userId,
  position = 'top-right',
  maxVisible = 5,
  defaultDuration = 5000,
  enableGrouping = true,
  enableSmartBatching = true,
  theme = 'dark'
}) => {
  const [toasts, setToasts] = useState<AdvancedNotification[]>([]);
  const [queuedToasts, setQueuedToasts] = useState<AdvancedNotification[]>([]);

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  // Listen for new notifications
  useEffect(() => {
    const handleNewNotification = (event: any) => {
      const notification = event.payload.notification as AdvancedNotification;
      
      if (notification.userId === userId && notification.channels.includes('toast')) {
        addToast(notification);
      }
    };

    advancedNotificationService.on('notification:created', handleNewNotification);
    advancedNotificationService.on('notification:delivered', handleNewNotification);

    return () => {
      advancedNotificationService.off('notification:created', handleNewNotification);
      advancedNotificationService.off('notification:delivered', handleNewNotification);
    };
  }, [userId]);

  const addToast = useCallback((notification: AdvancedNotification) => {
    // Apply smart batching logic
    if (enableSmartBatching) {
      const recentSimilar = toasts.find(toast => 
        toast.type === notification.type &&
        toast.source === notification.source &&
        Date.now() - toast.createdAt < 60000 // Within last minute
      );

      if (recentSimilar && !recentSimilar.batchId) {
        // Create batch or add to existing batch
        // This is a simplified version - full implementation would be more sophisticated
      }
    }

    setToasts(current => {
      const updated = [...current];
      
      if (updated.length >= maxVisible) {
        // Move oldest to queue
        const oldest = updated.shift();
        if (oldest) {
          setQueuedToasts(queue => [...queue, oldest]);
        }
      }
      
      return [...updated, notification];
    });
  }, [toasts, maxVisible, enableSmartBatching]);

  const removeToast = useCallback((id: string) => {
    setToasts(current => {
      const filtered = current.filter(toast => toast.id !== id);
      
      // Add queued toast if available
      setQueuedToasts(queue => {
        if (queue.length > 0) {
          const [next, ...remaining] = queue;
          setToasts(toasts => [...filtered, next]);
          return remaining;
        }
        return queue;
      });
      
      return filtered;
    });

    // Mark as dismissed in the service
    advancedNotificationService.dismiss(id, userId);
  }, [userId]);

  const handleAction = useCallback(async (notificationId: string, actionId: string) => {
    const notification = toasts.find(t => t.id === notificationId);
    if (!notification) return;

    const action = notification.actions?.find(a => a.id === actionId);
    if (!action) return;

    try {
      // Execute the action based on its type
      switch (action.action) {
        case 'acknowledge':
          await advancedNotificationService.acknowledge(notificationId, userId);
          break;
        case 'dismiss':
          await advancedNotificationService.dismiss(notificationId, userId);
          break;
        case 'read':
          await advancedNotificationService.markAsRead(notificationId, userId);
          break;
        default:
          // Handle custom actions
          console.log('Executing custom action:', action.action, action.payload);
      }

      // Track analytics
      advancedNotificationService.on('notification:acknowledged', () => {});
    } catch (error) {
      console.error('Failed to execute action:', error);
    }
  }, [toasts, userId]);

  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}>
      <div className="space-y-3 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast, index) => (
            <ToastNotification
              key={toast.id}
              notification={toast}
              onClose={removeToast}
              onAction={handleAction}
              position={position}
              index={index}
            />
          ))}
        </AnimatePresence>

        {/* Queue Indicator */}
        {queuedToasts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300">
              +{queuedToasts.length} more notifications
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SmartToastSystem;