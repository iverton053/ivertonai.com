import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  ExternalLink,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Zap,
  RefreshCw,
  Target,
  Users,
  Calendar,
  Activity
} from 'lucide-react';
import {
  HealthAlert,
  AlertSeverity,
  PlatformType,
  NotificationChannel,
  NotificationRule
} from '../../types/platformHealth';
import platformHealthService from '../../services/platformHealthService';

interface AlertNotificationSystemProps {
  onAlertClick?: (alert: HealthAlert) => void;
  onAlertAcknowledge?: (alertId: string) => void;
  showInline?: boolean;
  maxVisibleAlerts?: number;
}

const AlertNotificationSystem: React.FC<AlertNotificationSystemProps> = ({
  onAlertClick,
  onAlertAcknowledge,
  showInline = false,
  maxVisibleAlerts = 5
}) => {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [showNotifications, setShowNotifications] = useState(!showInline);
  const [filter, setFilter] = useState<{
    severity: AlertSeverity | 'all';
    platform: PlatformType | 'all';
    status: 'all' | 'unacknowledged' | 'acknowledged';
  }>({
    severity: 'all',
    platform: 'all',
    status: 'unacknowledged'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load alerts
  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const dashboardData = await platformHealthService.getDashboardData();
      
      // Combine all alerts from integrations
      const allAlerts: HealthAlert[] = [];
      dashboardData.integrations.forEach(integration => {
        allAlerts.push(...integration.activeAlerts);
      });
      
      // Add recent incidents
      allAlerts.push(...dashboardData.recentIncidents);
      
      // Sort by timestamp (newest first) and remove duplicates
      const uniqueAlerts = allAlerts.filter((alert, index, self) => 
        index === self.findIndex(a => a.id === alert.id)
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setAlerts(uniqueAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh alerts
  useEffect(() => {
    loadAlerts();
    
    const interval = setInterval(loadAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadAlerts]);

  // Filter alerts
  const filteredAlerts = React.useMemo(() => {
    return alerts.filter(alert => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!alert.title.toLowerCase().includes(searchLower) &&
            !alert.message.toLowerCase().includes(searchLower) &&
            !alert.platform.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Severity filter
      if (filter.severity !== 'all' && alert.severity !== filter.severity) {
        return false;
      }

      // Platform filter
      if (filter.platform !== 'all' && alert.platform !== filter.platform) {
        return false;
      }

      // Status filter
      if (filter.status === 'acknowledged' && !alert.acknowledged) {
        return false;
      }
      if (filter.status === 'unacknowledged' && alert.acknowledged) {
        return false;
      }

      return true;
    });
  }, [alerts, filter, searchTerm]);

  // Handle alert acknowledgment
  const handleAcknowledge = async (alertId: string) => {
    try {
      await platformHealthService.acknowledgeAlert(alertId, 'current_user');
      if (onAlertAcknowledge) {
        onAlertAcknowledge(alertId);
      }
      await loadAlerts(); // Refresh alerts
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPlatformIcon = (platform: PlatformType): string => {
    const icons: Record<PlatformType, string> = {
      facebook: '📘',
      instagram: '📸',
      linkedin: '💼',
      youtube: '🎥',
      twitter: '𝕏',
      threads: '@',
      google_ads: '📊',
      google_analytics: '📈',
      mailchimp: '📧',
      hubspot: '🎯',
      zapier: '⚡',
      webhooks: '🔗',
      stripe: '💳',
      shopify: '🛍️',
      wordpress: '📝',
      slack: '💬'
    };
    return icons[platform];
  };

  const getPlatformName = (platform: PlatformType): string => {
    const names: Record<PlatformType, string> = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      twitter: 'X (Twitter)',
      threads: 'Threads',
      google_ads: 'Google Ads',
      google_analytics: 'Google Analytics',
      mailchimp: 'Mailchimp',
      hubspot: 'HubSpot',
      zapier: 'Zapier',
      webhooks: 'Webhooks',
      stripe: 'Stripe',
      shopify: 'Shopify',
      wordpress: 'WordPress',
      slack: 'Slack'
    };
    return names[platform];
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Notification Bell Component
  const NotificationBell = () => {
    const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;
    const hasHighPriorityAlerts = alerts.some(alert => 
      !alert.acknowledged && (alert.severity === 'critical' || alert.severity === 'high')
    );

    return (
      <motion.button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative p-3 rounded-full transition-all duration-200 ${
          hasHighPriorityAlerts 
            ? 'bg-red-500/20 text-red-400 animate-pulse' 
            : unacknowledgedCount > 0
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-6 h-6" />
        
        {unacknowledgedCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              hasHighPriorityAlerts ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
            }`}
          >
            {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
          </motion.div>
        )}
      </motion.button>
    );
  };

  if (showInline) {
    return (
      <div className="space-y-4">
        {/* Inline Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
              <p className="text-sm text-gray-400">
                {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          
          <button
            onClick={loadAlerts}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Inline Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search alerts..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={filter.severity}
            onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value as any }))}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as any }))}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="unacknowledged">Unacknowledged</option>
            <option value="acknowledged">Acknowledged</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilter({ severity: 'all', platform: 'all', status: 'unacknowledged' });
            }}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Inline Alerts List */}
        <AlertsList 
          alerts={filteredAlerts.slice(0, maxVisibleAlerts)}
          expandedAlert={expandedAlert}
          setExpandedAlert={setExpandedAlert}
          onAlertClick={onAlertClick}
          onAcknowledge={handleAcknowledge}
          getSeverityColor={getSeverityColor}
          getSeverityIcon={getSeverityIcon}
          getPlatformIcon={getPlatformIcon}
          getPlatformName={getPlatformName}
          formatTimeAgo={formatTimeAgo}
        />
      </div>
    );
  }

  return (
    <>
      {/* Notification Bell */}
      <NotificationBell />

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 400, scale: 0.9 }}
              className="fixed top-0 right-0 z-50 w-96 h-full bg-gray-900 border-l border-gray-700 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-6 h-6 text-yellow-400" />
                    <div>
                      <h3 className="font-semibold text-white">Alerts</h3>
                      <p className="text-sm text-gray-400">
                        {filteredAlerts.length} active
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Filters */}
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search alerts..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <select
                      value={filter.severity}
                      onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value as any }))}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <select
                      value={filter.status}
                      onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as any }))}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All</option>
                      <option value="unacknowledged">New</option>
                      <option value="acknowledged">Acked</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Alerts List */}
              <div className="flex-1 overflow-y-auto">
                <AlertsList 
                  alerts={filteredAlerts}
                  expandedAlert={expandedAlert}
                  setExpandedAlert={setExpandedAlert}
                  onAlertClick={onAlertClick}
                  onAcknowledge={handleAcknowledge}
                  getSeverityColor={getSeverityColor}
                  getSeverityIcon={getSeverityIcon}
                  getPlatformIcon={getPlatformIcon}
                  getPlatformName={getPlatformName}
                  formatTimeAgo={formatTimeAgo}
                  compact={true}
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={loadAlerts}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Alerts</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Alerts List Component
interface AlertsListProps {
  alerts: HealthAlert[];
  expandedAlert: string | null;
  setExpandedAlert: (id: string | null) => void;
  onAlertClick?: (alert: HealthAlert) => void;
  onAcknowledge: (alertId: string) => void;
  getSeverityColor: (severity: AlertSeverity) => string;
  getSeverityIcon: (severity: AlertSeverity) => React.ReactNode;
  getPlatformIcon: (platform: PlatformType) => string;
  getPlatformName: (platform: PlatformType) => string;
  formatTimeAgo: (timestamp: string) => string;
  compact?: boolean;
}

const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  expandedAlert,
  setExpandedAlert,
  onAlertClick,
  onAcknowledge,
  getSeverityColor,
  getSeverityIcon,
  getPlatformIcon,
  getPlatformName,
  formatTimeAgo,
  compact = false
}) => {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <CheckCircle className="w-16 h-16 mb-4" />
        <p className="text-lg font-medium">All Clear!</p>
        <p className="text-sm">No active alerts at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {alerts.map((alert) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg border transition-all cursor-pointer ${
            alert.acknowledged 
              ? 'bg-gray-800/30 border-gray-700/50 opacity-75'
              : getSeverityColor(alert.severity)
          } hover:border-opacity-70`}
          onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="text-lg">{getPlatformIcon(alert.platform)}</div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {getSeverityIcon(alert.severity)}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    getSeverityColor(alert.severity)
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-gray-400">
                    {getPlatformName(alert.platform)}
                  </span>
                </div>
                
                <h4 className="font-medium text-white text-sm truncate">
                  {alert.title}
                </h4>
                
                <p className="text-xs text-gray-300 line-clamp-2 mt-1">
                  {alert.message}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {formatTimeAgo(alert.timestamp)}
                  </span>
                  
                  {alert.affectedCampaigns.length > 0 && (
                    <span className="text-xs text-orange-400">
                      {alert.affectedCampaigns.length} campaigns affected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 ml-2">
              {!alert.acknowledged && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcknowledge(alert.id);
                  }}
                  className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                  title="Acknowledge"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedAlert(expandedAlert === alert.id ? null : alert.id);
                }}
                className="p-1 text-gray-400 hover:text-white rounded transition-colors"
              >
                {expandedAlert === alert.id ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {expandedAlert === alert.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-gray-700/50"
              >
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-400">Platform:</span>
                      <span className="ml-2 text-white">{getPlatformName(alert.platform)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Severity:</span>
                      <span className="ml-2 text-white capitalize">{alert.severity}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Campaigns:</span>
                      <span className="ml-2 text-white">{alert.affectedCampaigns.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Accounts:</span>
                      <span className="ml-2 text-white">{alert.affectedAccounts.length}</span>
                    </div>
                  </div>
                  
                  {alert.retryAttempts > 0 && (
                    <div>
                      <span className="text-gray-400">Retry attempts:</span>
                      <span className="ml-2 text-white">{alert.retryAttempts}</span>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 mt-3">
                    {onAlertClick && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAlertClick(alert);
                        }}
                        className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                      >
                        View Details
                      </button>
                    )}
                    
                    {!alert.acknowledged && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcknowledge(alert.id);
                        }}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default AlertNotificationSystem;