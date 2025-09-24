import React, { useState, useEffect } from 'react';
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
  Filter,
  Search,
  Calendar,
  Users,
  DollarSign,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import {
  PlatformType,
  HealthStatus,
  HealthDashboardData,
  IntegrationHealth
} from '../../types/platformHealth';
import PlatformHealthDashboard from './PlatformHealthDashboard';
import PlatformDetailView from './PlatformDetailView';
import platformHealthService from '../../services/platformHealthService';

const PlatformHealthPage: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);
  const [isMonitoringActive, setIsMonitoringActive] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Initialize monitoring on component mount
  useEffect(() => {
    const initializeMonitoring = async () => {
      try {
        // Start monitoring service
        platformHealthService.startMonitoring();
        setIsMonitoringActive(true);
      } catch (error) {
        console.error('Failed to initialize monitoring:', error);
      }
    };

    initializeMonitoring();

    // Cleanup on unmount
    return () => {
      // Note: We don't stop monitoring here as it might be used by other parts of the app
    };
  }, []);

  const handlePlatformSelect = (platform: PlatformType) => {
    setSelectedPlatform(platform);
  };

  const handleBackToOverview = () => {
    setSelectedPlatform(null);
  };

  const handleRefresh = () => {
    // Refresh is handled by the child components
  };

  const toggleMonitoring = () => {
    if (isMonitoringActive) {
      platformHealthService.stopMonitoring();
      setIsMonitoringActive(false);
    } else {
      platformHealthService.startMonitoring();
      setIsMonitoringActive(true);
    }
  };

  const handleAlertAcknowledge = async (alertId: string) => {
    try {
      await platformHealthService.acknowledgeAlert(alertId, 'current_user');
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleManualRefresh = async (platform?: PlatformType) => {
    try {
      await platformHealthService.manualRefresh(platform);
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              {selectedPlatform ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBackToOverview}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    ←
                  </button>
                  <div>
                    <h1 className="text-4xl font-bold text-white">Platform Details</h1>
                    <p className="text-gray-400 mt-2">
                      Detailed monitoring and management for your integration
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-4xl font-bold text-white">Platform Health Monitor</h1>
                  <p className="text-gray-400 mt-2">
                    Real-time monitoring of all platform integrations and API health
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isMonitoringActive ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-gray-400">
                  Monitoring {isMonitoringActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <button
                onClick={toggleMonitoring}
                className={`p-2 rounded-lg transition-colors ${
                  isMonitoringActive 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={isMonitoringActive ? 'Stop Monitoring' : 'Start Monitoring'}
              >
                {isMonitoringActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                title="Quick Actions"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => handleManualRefresh()}
                    className="flex items-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh All</span>
                  </button>

                  <button
                    onClick={() => {
                      // Export health report functionality
                      console.log('Exporting health report...');
                    }}
                    className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Export Report</span>
                  </button>

                  <button
                    onClick={() => {
                      // Configure alerts functionality
                      console.log('Configuring alerts...');
                    }}
                    className="flex items-center space-x-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Configure Alerts</span>
                  </button>

                  <button
                    onClick={() => {
                      // View system logs functionality
                      console.log('Opening system logs...');
                    }}
                    className="flex items-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    <span>System Logs</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Feature Highlights - Only show on overview */}
        {!selectedPlatform && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Platform Integration Health Monitor
                </h3>
                <p className="text-gray-300 mb-4">
                  Real-time monitoring of all your platform integrations with automatic retries, 
                  intelligent alerts, and campaign impact analysis.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Real-time API monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Automatic retry system</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Intelligent alert system</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Campaign impact analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Historical uptime tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-red-400" />
                    <span className="text-gray-300">Instant failure notifications</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Benefits Section - Only show on overview */}
        {!selectedPlatform && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h4 className="font-semibold text-white">Prevent Campaign Failures</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Catch API issues before clients notice with proactive monitoring and alerts.
              </p>
            </div>

            <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <DollarSign className="w-6 h-6 text-green-400" />
                <h4 className="font-semibold text-white">Revenue Protection</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Prevent lost ad spend from broken campaigns with automatic recovery systems.
              </p>
            </div>

            <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Zap className="w-6 h-6 text-blue-400" />
                <h4 className="font-semibold text-white">Team Efficiency</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Fix issues faster with immediate alerts and detailed impact analysis.
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {selectedPlatform ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PlatformDetailView
                  platform={selectedPlatform}
                  onBack={handleBackToOverview}
                  onRefresh={handleRefresh}
                />
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <PlatformHealthDashboard
                  refreshInterval={300} // 5 minutes
                  showNotifications={true}
                  showMetrics={true}
                  compactView={false}
                  onPlatformSelect={handlePlatformSelect}
                  onAlertAcknowledge={handleAlertAcknowledge}
                  onManualRefresh={handleManualRefresh}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Information */}
        {!selectedPlatform && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-6 bg-gray-800/20 border border-gray-700/30 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-white mb-2">System Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                  <div>
                    <span className="font-medium">Check Interval:</span> 5 minutes
                  </div>
                  <div>
                    <span className="font-medium">Retry Attempts:</span> 3 per platform
                  </div>
                  <div>
                    <span className="font-medium">Alert Threshold:</span> 3 consecutive failures
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Platform Health Monitor</div>
                <div className="text-xs text-gray-500">
                  Built with ❤️ for reliable integrations
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlatformHealthPage;