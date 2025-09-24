import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertCircle,
  Shield,
  BarChart3,
  Bell,
  Calendar,
  Users,
  DollarSign,
  Eye,
  ExternalLink,
  Info,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  ChevronRight,
  Timer,
  Target
} from 'lucide-react';
import {
  PlatformType,
  IntegrationHealth,
  HealthStatus,
  RetryAttempt,
  HealthAlert,
  CampaignImpact,
  UptimeMetrics
} from '../../types/platformHealth';
import platformHealthService from '../../services/platformHealthService';

interface PlatformDetailViewProps {
  platform: PlatformType;
  onBack: () => void;
  onRefresh?: () => void;
}

const PlatformDetailView: React.FC<PlatformDetailViewProps> = ({
  platform,
  onBack,
  onRefresh
}) => {
  const [integration, setIntegration] = useState<IntegrationHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'retries' | 'campaigns' | 'history'>('overview');
  const [uptimeMetrics, setUptimeMetrics] = useState<UptimeMetrics[]>([]);

  // Load platform data
  useEffect(() => {
    const loadPlatformData = async () => {
      try {
        const dashboardData = await platformHealthService.getDashboardData();
        const platformIntegration = dashboardData.integrations.find(i => i.platform === platform);
        setIntegration(platformIntegration || null);
        
        // Load uptime metrics for different periods
        const metrics: UptimeMetrics[] = [
          {
            platform,
            period: '24h',
            uptime: platformIntegration?.uptime24h || 0,
            downtime: ((100 - (platformIntegration?.uptime24h || 0)) / 100) * 24 * 60, // minutes
            incidents: platformIntegration?.activeAlerts.length || 0,
            mttr: 15, // Mock mean time to recovery
            mtbf: 168, // Mock mean time between failures in hours
            sla: 99.9,
            slaBreaches: 0
          },
          {
            platform,
            period: '7d',
            uptime: platformIntegration?.uptime7d || 0,
            downtime: ((100 - (platformIntegration?.uptime7d || 0)) / 100) * 7 * 24 * 60,
            incidents: Math.floor(Math.random() * 3),
            mttr: 12,
            mtbf: 72,
            sla: 99.9,
            slaBreaches: 0
          },
          {
            platform,
            period: '30d',
            uptime: platformIntegration?.uptime30d || 0,
            downtime: ((100 - (platformIntegration?.uptime30d || 0)) / 100) * 30 * 24 * 60,
            incidents: Math.floor(Math.random() * 5) + 1,
            mttr: 18,
            mtbf: 120,
            sla: 99.9,
            slaBreaches: Math.floor(Math.random() * 2)
          }
        ];
        
        setUptimeMetrics(metrics);
      } catch (error) {
        console.error('Failed to load platform data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlatformData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadPlatformData, 30000);
    return () => clearInterval(interval);
  }, [platform]);

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      await platformHealthService.manualRefresh(platform);
      if (onRefresh) onRefresh();
      
      // Reload data
      const dashboardData = await platformHealthService.getDashboardData();
      const platformIntegration = dashboardData.integrations.find(i => i.platform === platform);
      setIntegration(platformIntegration || null);
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryAction = async (retryId: string, action: 'start' | 'cancel') => {
    try {
      // In a real implementation, this would call the service to manage retries
      console.log(`${action} retry ${retryId} for platform ${platform}`);
      await handleManualRefresh();
    } catch (error) {
      console.error(`Failed to ${action} retry:`, error);
    }
  };

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
      case 'healthy': return <CheckCircle className="w-6 h-6" />;
      case 'warning': return <AlertTriangle className="w-6 h-6" />;
      case 'critical': return <AlertCircle className="w-6 h-6" />;
      default: return <Clock className="w-6 h-6" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(0)}m`;
    const hours = minutes / 60;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    const days = hours / 24;
    return `${days.toFixed(1)}d`;
  };

  if (loading && !integration) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading platform details...</span>
        </div>
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>Platform not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{integration.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-white">{integration.name}</h1>
              <p className="text-gray-400">Platform Health Monitor</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleManualRefresh}
          className={`p-3 rounded-lg transition-colors ${
            loading 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status Overview */}
      <div className={`p-6 rounded-xl border-2 ${getStatusColor(integration.currentStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getStatusIcon(integration.currentStatus)}
            <div>
              <h2 className="text-2xl font-bold capitalize">{integration.currentStatus}</h2>
              <p className="opacity-80">{integration.healthCheck.statusMessage}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm opacity-80">Last Check</p>
            <p className="font-semibold">
              {new Date(integration.healthCheck.lastChecked).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">24h Uptime</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{integration.uptime24h.toFixed(2)}%</p>
          <p className="text-xs text-gray-400 mt-1">
            Target: 99.9%
          </p>
        </div>

        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Response Time</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {integration.healthCheck.responseTime.toFixed(0)}ms
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Avg: {integration.healthCheck.responseTime.toFixed(0)}ms
          </p>
        </div>

        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Success Rate</span>
            <Target className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {integration.healthCheck.successRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {integration.healthCheck.errorCount} errors
          </p>
        </div>

        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Active Campaigns</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{integration.activeCampaigns}</p>
          <p className="text-xs text-gray-400 mt-1">
            {integration.connectedAccounts} accounts
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: Activity },
            { key: 'alerts', label: 'Alerts', icon: Bell, count: integration.activeAlerts.length },
            { key: 'retries', label: 'Retries', icon: RotateCcw, count: integration.retryQueue.length },
            { key: 'campaigns', label: 'Impact', icon: Target, count: integration.impactedCampaigns.length },
            { key: 'history', label: 'History', icon: Calendar }
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {count !== undefined && count > 0 && (
                <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab integration={integration} uptimeMetrics={uptimeMetrics} />
          )}
          
          {activeTab === 'alerts' && (
            <AlertsTab alerts={integration.activeAlerts} platform={integration.platform} />
          )}
          
          {activeTab === 'retries' && (
            <RetriesTab 
              retries={integration.retryQueue} 
              platform={integration.platform}
              onRetryAction={handleRetryAction}
            />
          )}
          
          {activeTab === 'campaigns' && (
            <CampaignsTab campaigns={integration.impactedCampaigns} />
          )}
          
          {activeTab === 'history' && (
            <HistoryTab platform={integration.platform} uptimeMetrics={uptimeMetrics} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ integration: IntegrationHealth; uptimeMetrics: UptimeMetrics[] }> = ({
  integration,
  uptimeMetrics
}) => (
  <div className="space-y-6">
    {/* Uptime Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {uptimeMetrics.map((metric) => (
        <div key={metric.period} className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">{metric.period.toUpperCase()} Metrics</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              metric.uptime >= 99.9 ? 'bg-green-500/20 text-green-400' :
              metric.uptime >= 99 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {metric.uptime.toFixed(2)}%
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Downtime:</span>
              <span className="text-white">{formatDuration(metric.downtime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Incidents:</span>
              <span className="text-white">{metric.incidents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">MTTR:</span>
              <span className="text-white">{metric.mttr}min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">MTBF:</span>
              <span className="text-white">{metric.mtbf}h</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Configuration Details */}
    <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-300 mb-3">Connection Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Endpoint:</span>
              <span className="text-white font-mono text-xs">
                {integration.healthCheck.endpoint}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Connected Accounts:</span>
              <span className="text-white">{integration.connectedAccounts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Sync:</span>
              <span className="text-white">
                {new Date(integration.healthCheck.lastChecked).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-300 mb-3">Health Metrics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Check Frequency:</span>
              <span className="text-white">5 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Consecutive Failures:</span>
              <span className="text-white">{integration.healthCheck.consecutiveFailures}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Next Check:</span>
              <span className="text-white">
                {new Date(integration.healthCheck.nextCheck).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Alerts Tab Component
const AlertsTab: React.FC<{ alerts: HealthAlert[]; platform: PlatformType }> = ({
  alerts,
  platform
}) => (
  <div className="space-y-4">
    {alerts.length === 0 ? (
      <div className="text-center py-12 text-gray-400">
        <CheckCircle className="w-16 h-16 mx-auto mb-4" />
        <p className="text-lg">No active alerts</p>
        <p className="text-sm">All systems are operating normally</p>
      </div>
    ) : (
      alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-6 rounded-xl border-l-4 ${
            alert.severity === 'critical' ? 'border-red-500 bg-red-500/10' :
            alert.severity === 'high' ? 'border-orange-500 bg-orange-500/10' :
            alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
            'border-blue-500 bg-blue-500/10'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-white">{alert.title}</span>
              </div>
              
              <p className="text-gray-300 mb-4">{alert.message}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Timestamp:</span>
                  <p className="text-white">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Affected Campaigns:</span>
                  <p className="text-white">{alert.affectedCampaigns.length}</p>
                </div>
                <div>
                  <span className="text-gray-400">Retry Attempts:</span>
                  <p className="text-white">{alert.retryAttempts}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {!alert.acknowledged && (
                <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Acknowledge
                </button>
              )}
              
              <button className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

// Retries Tab Component
const RetriesTab: React.FC<{ 
  retries: RetryAttempt[]; 
  platform: PlatformType;
  onRetryAction: (retryId: string, action: 'start' | 'cancel') => void;
}> = ({ retries, platform, onRetryAction }) => (
  <div className="space-y-4">
    {retries.length === 0 ? (
      <div className="text-center py-12 text-gray-400">
        <RotateCcw className="w-16 h-16 mx-auto mb-4" />
        <p className="text-lg">No retry attempts</p>
        <p className="text-sm">No failed requests require retry</p>
      </div>
    ) : (
      retries.map((retry) => (
        <div
          key={retry.id}
          className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  retry.status === 'success' ? 'bg-green-500/20 text-green-400' :
                  retry.status === 'failed' || retry.status === 'max_attempts_reached' ? 'bg-red-500/20 text-red-400' :
                  retry.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {retry.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-white font-medium">
                  Attempt {retry.attemptNumber} of {retry.maxAttempts}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Started:</span>
                  <p className="text-white">{new Date(retry.startedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Backoff Delay:</span>
                  <p className="text-white">{retry.backoffDelay}s</p>
                </div>
                <div>
                  <span className="text-gray-400">Next Retry:</span>
                  <p className="text-white">
                    {retry.nextRetryAt ? new Date(retry.nextRetryAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {retry.error && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{retry.error}</p>
                </div>
              )}
              
              {retry.successMessage && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm">{retry.successMessage}</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {retry.status === 'pending' && (
                <button
                  onClick={() => onRetryAction(retry.id, 'start')}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Start</span>
                </button>
              )}
              
              {(retry.status === 'pending' || retry.status === 'in_progress') && (
                <button
                  onClick={() => onRetryAction(retry.id, 'cancel')}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                >
                  <XCircle className="w-3 h-3" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

// Campaigns Tab Component
const CampaignsTab: React.FC<{ campaigns: CampaignImpact[] }> = ({ campaigns }) => (
  <div className="space-y-4">
    {campaigns.length === 0 ? (
      <div className="text-center py-12 text-gray-400">
        <Target className="w-16 h-16 mx-auto mb-4" />
        <p className="text-lg">No impacted campaigns</p>
        <p className="text-sm">All campaigns are running normally</p>
      </div>
    ) : (
      campaigns.map((campaign) => (
        <div
          key={campaign.campaignId}
          className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  campaign.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                  campaign.status === 'degraded' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {campaign.status.toUpperCase()}
                </span>
                <span className="text-white font-semibold">{campaign.campaignName}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-400">Client:</span>
                  <p className="text-white">{campaign.clientName}</p>
                </div>
                <div>
                  <span className="text-gray-400">Affected Since:</span>
                  <p className="text-white">{new Date(campaign.affectedSince).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Revenue Loss:</span>
                  <p className="text-red-400">${campaign.estimatedRevenueLoss.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Affected Metrics:</span>
                  <p className="text-white">{campaign.affectedMetrics.join(', ')}</p>
                </div>
              </div>
            </div>
            
            <button className="ml-4 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1">
              <ExternalLink className="w-3 h-3" />
              <span>View Campaign</span>
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);

// History Tab Component
const HistoryTab: React.FC<{ platform: PlatformType; uptimeMetrics: UptimeMetrics[] }> = ({
  platform,
  uptimeMetrics
}) => (
  <div className="space-y-6">
    {/* SLA Compliance */}
    <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">SLA Compliance</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {uptimeMetrics.map((metric) => (
          <div key={metric.period} className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {metric.uptime.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-400 mb-2">{metric.period.toUpperCase()}</div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              metric.uptime >= metric.sla ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {metric.uptime >= metric.sla ? 'Within SLA' : 'SLA Breach'}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Historical Performance */}
    <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Historical Performance</h3>
      
      <div className="space-y-4">
        {uptimeMetrics.map((metric) => (
          <div key={metric.period} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <div className="font-medium text-white">{metric.period.toUpperCase()} Period</div>
              <div className="text-sm text-gray-400">
                {metric.incidents} incidents • {formatDuration(metric.downtime)} downtime
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-semibold text-white">{metric.uptime.toFixed(2)}%</div>
              <div className="text-xs text-gray-400">MTTR: {metric.mttr}min</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes.toFixed(0)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
};

export default PlatformDetailView;