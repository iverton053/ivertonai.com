import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Bell,
  BellRing,
  Search,
  Filter,
  MoreHorizontal,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Zap,
  Clock,
  Eye,
  EyeOff,
  Settings,
  Archive,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Star,
  MessageSquare,
  Users,
  Shield,
  TrendingUp,
  FileText,
  Image,
  Calendar,
  Tag
} from 'lucide-react';
import {
  AdvancedNotification,
  NotificationFilter,
  NotificationSearchResult,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  NotificationMetrics,
  NotificationPreferences
} from '../../types/advancedNotifications';
import advancedNotificationService from '../../services/advancedNotificationService';

interface AdvancedNotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  position?: 'right' | 'center';
  maxHeight?: string;
  showMetrics?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  compactMode?: boolean;
  theme?: 'dark' | 'light';
}

const AdvancedNotificationCenter: React.FC<AdvancedNotificationCenterProps> = ({
  userId,
  isOpen,
  onClose,
  position = 'right',
  maxHeight = '600px',
  showMetrics = true,
  showSearch = true,
  showFilters = true,
  compactMode = false,
  theme = 'dark'
}) => {
  const [notifications, setNotifications] = useState<AdvancedNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<AdvancedNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>({});
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'type' | 'priority' | 'date'>('none');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageSize = compactMode ? 15 : 10;

  // Load notifications and metrics
  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
      loadMetrics();
    }
  }, [isOpen, userId, selectedFilter, page]);

  // Filter and search notifications
  useEffect(() => {
    let filtered = [...notifications];

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower) ||
        notification.source.toLowerCase().includes(searchLower) ||
        notification.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply additional filters
    if (selectedFilter.types?.length) {
      filtered = filtered.filter(n => selectedFilter.types!.includes(n.type));
    }
    if (selectedFilter.priorities?.length) {
      filtered = filtered.filter(n => selectedFilter.priorities!.includes(n.priority));
    }
    if (selectedFilter.statuses?.length) {
      filtered = filtered.filter(n => selectedFilter.statuses!.includes(n.status));
    }
    if (selectedFilter.unreadOnly) {
      filtered = filtered.filter(n => n.status !== 'read');
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, selectedFilter]);

  // Group notifications
  const groupedNotifications = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Notifications': filteredNotifications };
    }

    const groups: { [key: string]: AdvancedNotification[] } = {};

    filteredNotifications.forEach(notification => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'type':
          groupKey = notification.type.charAt(0).toUpperCase() + notification.type.slice(1);
          break;
        case 'priority':
          groupKey = notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1);
          break;
        case 'date':
          const date = new Date(notification.createdAt);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (date.toDateString() === today.toDateString()) {
            groupKey = 'Today';
          } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = 'Yesterday';
          } else {
            groupKey = date.toLocaleDateString();
          }
          break;
        default:
          groupKey = 'All Notifications';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  }, [filteredNotifications, groupBy]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const filter: NotificationFilter = {
        userId,
        ...selectedFilter
      };
      
      const result: NotificationSearchResult = await advancedNotificationService.searchNotifications(filter, page, pageSize);
      
      if (page === 1) {
        setNotifications(result.notifications);
      } else {
        setNotifications(prev => [...prev, ...result.notifications]);
      }
      
      setHasMore(result.notifications.length === pageSize);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const metricsData = advancedNotificationService.getMetrics(userId);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleNotificationClick = async (notification: AdvancedNotification) => {
    if (notification.status !== 'read') {
      await advancedNotificationService.markAsRead(notification.id, userId);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, status: 'read' as NotificationStatus } : n));
      loadMetrics();
    }

    if (notification.clickAction) {
      switch (notification.clickAction.type) {
        case 'route':
          // Handle routing
          break;
        case 'url':
          window.open(notification.clickAction.target, '_blank');
          break;
        case 'modal':
          // Handle modal opening
          break;
        case 'action':
          // Handle custom action
          break;
      }
    }
  };

  const handleBulkAction = async (action: 'read' | 'acknowledge' | 'dismiss' | 'delete') => {
    const selectedIds = Array.from(selectedNotifications);
    if (selectedIds.length === 0) return;

    try {
      switch (action) {
        case 'read':
          await advancedNotificationService.bulkMarkAsRead(selectedIds, userId);
          break;
        case 'acknowledge':
          for (const id of selectedIds) {
            await advancedNotificationService.acknowledge(id, userId);
          }
          break;
        case 'dismiss':
          for (const id of selectedIds) {
            await advancedNotificationService.dismiss(id, userId);
          }
          break;
        case 'delete':
          for (const id of selectedIds) {
            await advancedNotificationService.deleteNotification(id);
          }
          break;
      }
      
      setSelectedNotifications(new Set());
      await loadNotifications();
      await loadMetrics();
    } catch (error) {
      console.error(`Failed to ${action} notifications:`, error);
    }
  };

  const toggleNotificationSelection = (id: string) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedNotifications(newSelection);
  };

  const toggleNotificationExpansion = (id: string) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNotifications(newExpanded);
  };

  const getNotificationIcon = (type: NotificationType, priority: NotificationPriority) => {
    const iconProps = {
      className: `w-5 h-5 ${priority === 'critical' || priority === 'urgent' ? 'text-red-400' : 
        priority === 'high' ? 'text-orange-400' : 
        priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`
    };

    switch (type) {
      case 'security': return <Shield {...iconProps} />;
      case 'system': return <Settings {...iconProps} />;
      case 'platform': return <Zap {...iconProps} />;
      case 'social': return <Users {...iconProps} />;
      case 'content': return <FileText {...iconProps} />;
      case 'file': return <Image {...iconProps} />;
      case 'approval': return <CheckCircle2 {...iconProps} />;
      case 'marketing': return <TrendingUp {...iconProps} />;
      case 'success': return <CheckCircle2 {...iconProps} />;
      case 'error': return <AlertCircle {...iconProps} />;
      case 'warning': return <AlertTriangle {...iconProps} />;
      case 'critical': return <AlertCircle {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-500/5';
      case 'urgent': return 'border-l-red-400 bg-red-400/5';
      case 'high': return 'border-l-orange-400 bg-orange-400/5';
      case 'medium': return 'border-l-yellow-400 bg-yellow-400/5';
      case 'low': return 'border-l-blue-400 bg-blue-400/5';
      default: return 'border-l-gray-400 bg-gray-400/5';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const containerVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      x: position === 'right' ? '100%' : 0,
      y: position === 'center' ? '-50%' : 0
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      x: 0,
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      x: position === 'right' ? '100%' : 0,
      y: position === 'center' ? '-50%' : 0,
      transition: { 
        duration: 0.2 
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-end p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Notification Center */}
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`relative w-full max-w-md bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl ${
          theme === 'light' ? 'bg-white/95 border-gray-700/50 text-white' : 'text-white'
        }`}
        style={{ maxHeight }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-purple-400" />
              {metrics && metrics.unread > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                >
                  {metrics.unread > 99 ? '99+' : metrics.unread}
                </motion.div>
              )}
            </div>
            <div>
              <h3 className="font-semibold">Notifications</h3>
              {metrics && (
                <p className="text-sm text-gray-400">
                  {metrics.unread} unread of {metrics.total}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {selectedNotifications.size > 0 && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleBulkAction('read')}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
                  title="Mark as read"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBulkAction('dismiss')}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
                  title="Dismiss"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Dashboard */}
        {showMetrics && metrics && (
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-gray-700/50">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">{metrics.unread}</div>
                <div className="text-xs text-gray-400">Unread</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{metrics.total}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">
                  {Math.round(metrics.engagementRate * 100)}%
                </div>
                <div className="text-xs text-gray-400">Engagement</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="p-4 border-b border-gray-700/50 space-y-3">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                />
              </div>
            )}

            {showFilters && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="none">No Grouping</option>
                    <option value="type">By Type</option>
                    <option value="priority">By Priority</option>
                    <option value="date">By Date</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white hover:bg-gray-700/50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            )}

            {/* Advanced Filters Panel */}
            <AnimatePresence>
              {showFiltersPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-gray-800/30 rounded-lg space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                      <div className="flex flex-wrap gap-2">
                        {(['pending', 'delivered', 'read', 'acknowledged'] as NotificationStatus[]).map(status => (
                          <label key={status} className="flex items-center space-x-1 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedFilter.statuses?.includes(status) || false}
                              onChange={(e) => {
                                const statuses = selectedFilter.statuses || [];
                                if (e.target.checked) {
                                  setSelectedFilter({
                                    ...selectedFilter,
                                    statuses: [...statuses, status]
                                  });
                                } else {
                                  setSelectedFilter({
                                    ...selectedFilter,
                                    statuses: statuses.filter(s => s !== status)
                                  });
                                }
                              }}
                              className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                            />
                            <span className="capitalize text-gray-300">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                      <div className="flex flex-wrap gap-2">
                        {(['critical', 'urgent', 'high', 'medium', 'low'] as NotificationPriority[]).map(priority => (
                          <label key={priority} className="flex items-center space-x-1 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedFilter.priorities?.includes(priority) || false}
                              onChange={(e) => {
                                const priorities = selectedFilter.priorities || [];
                                if (e.target.checked) {
                                  setSelectedFilter({
                                    ...selectedFilter,
                                    priorities: [...priorities, priority]
                                  });
                                } else {
                                  setSelectedFilter({
                                    ...selectedFilter,
                                    priorities: priorities.filter(p => p !== priority)
                                  });
                                }
                              }}
                              className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                            />
                            <span className="capitalize text-gray-300">{priority}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedFilter.unreadOnly || false}
                          onChange={(e) => setSelectedFilter({
                            ...selectedFilter,
                            unreadOnly: e.target.checked
                          })}
                          className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-gray-300">Unread only</span>
                      </label>

                      <button
                        onClick={() => {
                          setSelectedFilter({});
                          setSearchTerm('');
                        }}
                        className="text-sm text-purple-400 hover:text-purple-300"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
              />
            </div>
          ) : Object.keys(groupedNotifications).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="w-12 h-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-400 mb-2">No notifications</h4>
              <p className="text-sm text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {Object.entries(groupedNotifications).map(([groupName, groupNotifications]) => (
                <div key={groupName}>
                  {groupBy !== 'none' && (
                    <div className="px-4 py-2 bg-gray-800/30 border-y border-gray-700/30">
                      <h4 className="text-sm font-medium text-gray-300">{groupName}</h4>
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {groupNotifications.map((notification, index) => {
                      const isExpanded = expandedNotifications.has(notification.id);
                      const isSelected = selectedNotifications.has(notification.id);
                      const hasActions = notification.actions && notification.actions.length > 0;
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`relative border-l-4 ${getPriorityColor(notification.priority)} ${
                            notification.status === 'read' ? 'opacity-75' : ''
                          } ${
                            isSelected ? 'bg-purple-500/10' : 'hover:bg-gray-800/30'
                          } transition-colors cursor-pointer`}
                        >
                          <div className="p-4" onClick={() => handleNotificationClick(notification)}>
                            <div className="flex items-start space-x-3">
                              {/* Selection checkbox */}
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleNotificationSelection(notification.id);
                                }}
                                className="mt-1 rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                              />

                              {/* Icon */}
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type, notification.priority)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-medium text-sm ${
                                      notification.status === 'read' ? 'text-gray-400' : 'text-white'
                                    } truncate`}>
                                      {notification.title}
                                    </h4>
                                    
                                    <p className={`mt-1 text-sm ${
                                      notification.status === 'read' ? 'text-gray-400' : 'text-gray-300'
                                    } ${compactMode ? 'line-clamp-1' : 'line-clamp-2'}`}>
                                      {notification.message}
                                    </p>

                                    {/* Metadata */}
                                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                                      <span>{formatTimeAgo(notification.createdAt)}</span>
                                      <span>•</span>
                                      <span className="capitalize">{notification.source}</span>
                                      {notification.tags && notification.tags.length > 0 && (
                                        <>
                                          <span>•</span>
                                          <div className="flex items-center space-x-1">
                                            <Tag className="w-3 h-3" />
                                            <span>{notification.tags[0]}</span>
                                            {notification.tags.length > 1 && (
                                              <span>+{notification.tags.length - 1}</span>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions menu */}
                                  <div className="flex items-center space-x-1 ml-3">
                                    {hasActions && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleNotificationExpansion(notification.id);
                                        }}
                                        className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                                      >
                                        {isExpanded ? 
                                          <ChevronDown className="w-4 h-4" /> : 
                                          <ChevronRight className="w-4 h-4" />
                                        }
                                      </button>
                                    )}

                                    <button className="p-1 text-gray-400 hover:text-white rounded transition-colors">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Expanded Actions */}
                                <AnimatePresence>
                                  {isExpanded && hasActions && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="mt-3 pt-3 border-t border-gray-700/50"
                                    >
                                      <div className="flex flex-wrap gap-2">
                                        {notification.actions!.map((action) => (
                                          <button
                                            key={action.id}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Handle action
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                              action.variant === 'primary' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                                              action.variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                                              action.variant === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                                              'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                          >
                                            {action.icon && <span className="mr-1">{action.icon}</span>}
                                            {action.label}
                                          </button>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Status indicator */}
                              {notification.status !== 'read' && (
                                <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ))}

              {/* Load more */}
              {hasMore && !loading && (
                <div className="p-4">
                  <button
                    onClick={() => {
                      setPage(prev => prev + 1);
                      loadNotifications();
                    }}
                    className="w-full py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Load more notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">
              {selectedNotifications.size} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => advancedNotificationService.clearAll(userId).then(() => {
                loadNotifications();
                loadMetrics();
              })}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
            
            <button
              onClick={() => {
                // Open notification settings
              }}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedNotificationCenter;