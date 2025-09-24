import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Settings, 
  RefreshCw, 
  Edit3, 
  X, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { useAutomationHubStore, initializeDefaultAutomations } from '../stores/automationHubStore';
import AutomationCard from './AutomationCard';
import QuickSetup from './QuickSetup';
import AIInsightsPanel from './AIInsightsPanel';
import PerformanceMonitor from './PerformanceMonitor';

interface AutomationHubProps {
  isOpen: boolean;
  onClose: () => void;
}

const AutomationHub: React.FC<AutomationHubProps> = ({ isOpen, onClose }) => {
  const {
    userProfile,
    automationResults,
    isSetupOpen,
    lastGlobalRefresh,
    toggleSetup,
    refreshAllAutomations,
    getStaleAutomations,
  } = useAutomationHubStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStats, setRefreshStats] = useState({ fresh: 0, stale: 0, total: 0 });

  // Initialize default automations on first load
  useEffect(() => {
    initializeDefaultAutomations();
  }, []);

  // Calculate refresh stats
  useEffect(() => {
    const results = Object.values(automationResults);
    const fresh = results.filter(r => r.status === 'fresh').length;
    const stale = results.filter(r => r.status === 'stale' || isDataStale(r)).length;
    
    setRefreshStats({
      fresh,
      stale,
      total: results.length
    });
  }, [automationResults]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllAutomations();
    } finally {
      setIsRefreshing(false);
    }
  };

  const isDataStale = (automation: any): boolean => {
    const now = new Date();
    const dataAge = (now.getTime() - new Date(automation.timestamp).getTime()) / (1000 * 60);
    return dataAge > automation.refreshInterval;
  };

  const getStatusSummary = () => {
    if (refreshStats.total === 0) return 'No automations configured';
    if (refreshStats.fresh === refreshStats.total) return 'All data is fresh';
    if (refreshStats.stale > 0) return `${refreshStats.stale} need refresh`;
    return `${refreshStats.fresh}/${refreshStats.total} up to date`;
  };

  const getStatusColor = () => {
    if (refreshStats.total === 0) return 'text-gray-400';
    if (refreshStats.fresh === refreshStats.total) return 'text-green-400';
    if (refreshStats.stale > 0) return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">AI Automation Hub</h2>
                    <p className={`text-sm ${getStatusColor()}`}>
                      {getStatusSummary()}
                      {lastGlobalRefresh && (
                        <span className="ml-2 text-gray-500">
                          • Last refresh: {new Date(lastGlobalRefresh).toLocaleTimeString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Setup Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSetup(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    title={userProfile.isSetupComplete ? 'Edit Settings' : 'Complete Setup'}
                  >
                    {userProfile.isSetupComplete ? (
                      <Edit3 className="w-4 h-4" />
                    ) : (
                      <Settings className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {userProfile.isSetupComplete ? 'Edit' : 'Setup'}
                    </span>
                  </motion.button>

                  {/* Refresh All Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefreshAll}
                    disabled={isRefreshing}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isRefreshing 
                        ? 'bg-purple-600/50 text-purple-300 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isRefreshing ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {isRefreshing ? 'Refreshing...' : 'Refresh All'}
                    </span>
                  </motion.button>

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {!userProfile.isSetupComplete ? (
                  // First-time setup prompt
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20 max-w-md mx-auto">
                      <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Welcome to AI Automation Hub!</h3>
                      <p className="text-gray-400 mb-6">
                        Complete the quick setup to get personalized AI automation results for your business.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleSetup(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium"
                      >
                        Start Setup
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {/* Performance Monitor */}
                    <PerformanceMonitor automationResults={automationResults} />
                    
                    {/* AI Insights Panel */}
                    <AIInsightsPanel automationResults={automationResults} />
                    
                    {/* Automation cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.values(automationResults).map((automation, index) => (
                        <motion.div
                          key={automation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <AutomationCard automation={automation} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {userProfile.isSetupComplete && Object.keys(automationResults).length === 0 && (
                  <div className="text-center py-12">
                    <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No Automations Found</h3>
                    <p className="text-gray-500">Your AI automations will appear here once configured.</p>
                  </div>
                )}
              </div>

              {/* Footer Stats */}
              {userProfile.isSetupComplete && refreshStats.total > 0 && (
                <div className="border-t border-gray-700 px-6 py-3 bg-gray-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">{refreshStats.fresh} Fresh</span>
                      </div>
                      {refreshStats.stale > 0 && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400">{refreshStats.stale} Stale</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400">{refreshStats.total} Total</span>
                      </div>
                    </div>
                    
                    {userProfile.defaultDomain && (
                      <div className="text-gray-500">
                        Monitoring: <span className="text-white">{userProfile.defaultDomain}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Setup Modal */}
      <QuickSetup isOpen={isSetupOpen} onClose={() => toggleSetup(false)} />
    </>
  );
};

export default AutomationHub;