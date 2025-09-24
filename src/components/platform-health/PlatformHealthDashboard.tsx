import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  TrendingUp,
  Zap,
  AlertCircle,
  Shield,
  BarChart3,
  Bell,
  BellOff,
  Filter,
  Search,
  Calendar,
  Users,
  DollarSign,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  HealthStatus,
  HealthDashboardData,
  IntegrationHealth,
  HealthAlert,
  PlatformType,
  HealthDashboardProps
} from '../../types/platformHealth';
import platformHealthService from '../../services/platformHealthService';

const PlatformHealthDashboard: React.FC<HealthDashboardProps> = ({
  refreshInterval = 300,
  showNotifications = true,
  showMetrics = true,
  compactView = false,
  selectedPlatforms,
  onPlatformSelect,
  onAlertAcknowledge,
  onManualRefresh
}) => {
  const [dashboardData, setDashboardData] = useState<HealthDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedAlert, setSelectedAlert] = useState<HealthAlert | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<HealthStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'status' | 'uptime' | 'responseTime' | 'platform'>('status');
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      const data = await platformHealthService.getDashboardData();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize monitoring and data loading
  useEffect(() => {
    loadDashboardData();
    
    // Start monitoring
    platformHealthService.startMonitoring();
    setIsMonitoring(true);

    // Set up refresh interval
    const interval = setInterval(loadDashboardData, refreshInterval * 1000);

    return () => {
      clearInterval(interval);
      // Note: We don't stop monitoring here as it might be used by other components
    };
  }, [loadDashboardData, refreshInterval]);

  // Handle manual refresh
  const handleManualRefresh = async (platform?: PlatformType) => {
    setLoading(true);
    try {
      await platformHealthService.manualRefresh(platform);
      if (onManualRefresh) {
        onManualRefresh(platform);
      }
      await loadDashboardData();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  // Handle alert acknowledgment
  const handleAlertAcknowledge = async (alertId: string) => {
    try {
      await platformHealthService.acknowledgeAlert(alertId, 'current_user');
      if (onAlertAcknowledge) {
        onAlertAcknowledge(alertId);
      }
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  // Filter and sort integrations
  const filteredIntegrations = React.useMemo(() => {
    if (!dashboardData) return [];

    let filtered = dashboardData.integrations.filter(integration => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!integration.name.toLowerCase().includes(searchLower) &&
            !integration.platform.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && integration.currentStatus !== statusFilter) {
        return false;
      }

      // Selected platforms filter
      if (selectedPlatforms && selectedPlatforms.length > 0) {
        if (!selectedPlatforms.includes(integration.platform)) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'status':
          const statusOrder = { critical: 0, warning: 1, healthy: 2, unknown: 3 };
          return statusOrder[a.currentStatus] - statusOrder[b.currentStatus];
        case 'uptime':
          return b.uptime24h - a.uptime24h;
        case 'responseTime':
          return b.healthCheck.responseTime - a.healthCheck.responseTime;
        case 'platform':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [dashboardData, searchTerm, statusFilter, selectedPlatforms, sortBy]);

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatResponseTime = (time: number) => {
    return `${time.toFixed(0)}ms`;
  };

  const formatLastUpdated = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading platform health data...</span>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>Failed to load platform health data</p>
          <button
            onClick={() => handleManualRefresh()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Health Monitor</h1>
          <p className="text-gray-400 mt-1">
            Real-time monitoring of platform integrations and API health
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-400">
            Last updated: {formatLastUpdated(lastUpdated)}
          </div>
          
          <button
            onClick={() => handleManualRefresh()}
            className={`p-2 rounded-lg transition-colors ${
              loading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Overall Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border-2 ${getStatusColor(dashboardData.overallStatus)}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Overall Status</p>
              <p className="text-2xl font-bold capitalize">{dashboardData.overallStatus}</p>
            </div>
            {getStatusIcon(dashboardData.overallStatus)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Uptime</p>
              <p className="text-2xl font-bold text-white">{formatUptime(dashboardData.totalUptime)}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Alerts</p>
              <p className="text-2xl font-bold text-white">{dashboardData.activeAlerts}</p>
            </div>
            <Bell className={`w-6 h-6 ${dashboardData.activeAlerts > 0 ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Response</p>
              <p className="text-2xl font-bold text-white">
                {formatResponseTime(dashboardData.systemMetrics.avgResponseTime)}
              </p>
            </div>
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search platforms..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as HealthStatus | 'all')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="healthy">Healthy</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="status">Status</option>
                  <option value="uptime">Uptime</option>
                  <option value="responseTime">Response Time</option>
                  <option value="platform">Platform</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setSortBy('status');
                  }}
                  className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration, index) => (
          <PlatformCard
            key={integration.platform}
            integration={integration}
            index={index}
            compactView={compactView}
            onStatusClick={onPlatformSelect}
            onRefresh={() => handleManualRefresh(integration.platform)}
            onAcknowledgeAlert={handleAlertAcknowledge}
          />
        ))}
      </div>

      {/* Recent Incidents */}
      {dashboardData.recentIncidents.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Incidents</h3>
            <span className="text-sm text-gray-400">
              {dashboardData.recentIncidents.length} active
            </span>
          </div>
          
          <div className="space-y-3">
            {dashboardData.recentIncidents.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'critical' ? 'border-red-500 bg-red-500/10' :
                  alert.severity === 'high' ? 'border-orange-500 bg-orange-500/10' :
                  alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                  'border-blue-500 bg-blue-500/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {dashboardData.integrations.find(i => i.platform === alert.platform)?.name}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      {alert.affectedCampaigns.length > 0 && (
                        <span>{alert.affectedCampaigns.length} campaigns affected</span>
                      )}
                    </div>
                  </div>
                  
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAlertAcknowledge(alert.id)}
                      className="ml-4 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* System Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total API Requests</span>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {dashboardData.systemMetrics.totalAPIRequests.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Error Rate</span>
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {dashboardData.systemMetrics.errorRate.toFixed(2)}%
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Platforms Monitored</span>
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {dashboardData.totalPlatforms}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Platform Card Component
interface PlatformCardProps {
  integration: IntegrationHealth;
  index: number;
  compactView?: boolean;
  onStatusClick?: (platform: PlatformType) => void;
  onRefresh?: () => void;
  onAcknowledgeAlert?: (alertId: string) => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  integration,
  index,
  compactView = false,
  onStatusClick,
  onRefresh,
  onAcknowledgeAlert
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy': return 'border-green-500/50 bg-green-500/10';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'critical': return 'border-red-500/50 bg-red-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 border-2 rounded-xl ${getStatusColor(integration.currentStatus)} hover:border-opacity-70 transition-all`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{integration.icon}</div>
          <div>
            <h3 className="font-semibold text-white">{integration.name}</h3>
            <div className="flex items-center space-x-2">
              {getStatusIcon(integration.currentStatus)}
              <span className="text-sm text-gray-300 capitalize">
                {integration.currentStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <p className="text-xs text-gray-400">24h Uptime</p>
          <p className="text-sm font-semibold text-white">
            {integration.uptime24h.toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Response</p>
          <p className="text-sm font-semibold text-white">
            {integration.healthCheck.responseTime.toFixed(0)}ms
          </p>
        </div>
      </div>

      {/* Alerts */}
      {integration.activeAlerts.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">
              {integration.activeAlerts.length} Active Alert{integration.activeAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {integration.activeAlerts.slice(0, 2).map((alert) => (
            <div key={alert.id} className="text-xs text-gray-300 mb-1">
              {alert.message.substring(0, 60)}...
            </div>
          ))}
        </div>
      )}

      {/* Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 border-t border-gray-700"
          >
            <div className="space-y-3">
              {/* Extended Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">7d Uptime:</span>
                  <span className="ml-2 text-white">{integration.uptime7d.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-400">30d Uptime:</span>
                  <span className="ml-2 text-white">{integration.uptime30d.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Accounts:</span>
                  <span className="ml-2 text-white">{integration.connectedAccounts}</span>
                </div>
                <div>
                  <span className="text-gray-400">Campaigns:</span>
                  <span className="ml-2 text-white">{integration.activeCampaigns}</span>
                </div>
              </div>

              {/* Last Check */}
              <div className="text-xs text-gray-400">
                Last checked: {new Date(integration.healthCheck.lastChecked).toLocaleString()}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onStatusClick?.(integration.platform)}
                  className="flex-1 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  View Details
                </button>
                
                {integration.activeAlerts.length > 0 && (
                  <button
                    onClick={() => onAcknowledgeAlert?.(integration.activeAlerts[0].id)}
                    className="flex-1 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
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
  );
};

export default PlatformHealthDashboard;