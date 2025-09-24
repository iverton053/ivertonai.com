import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Loader,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAutomationHubStore, AutomationResult } from '../stores/automationHubStore';
import Icon from './Icon';

interface AutomationCardProps {
  automation: AutomationResult;
}

const AutomationCard: React.FC<AutomationCardProps> = ({ automation }) => {
  const { refreshAutomation } = useAutomationHubStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAutomation(automation.id);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    switch (automation.status) {
      case 'fresh':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'stale':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'loading':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    const now = new Date();
    const dataAge = Math.floor((now.getTime() - new Date(automation.timestamp).getTime()) / (1000 * 60));
    
    switch (automation.status) {
      case 'fresh':
        return `Fresh (${dataAge}m ago)`;
      case 'stale':
        return `Needs refresh (${dataAge}m ago)`;
      case 'loading':
        return 'Refreshing...';
      case 'error':
        return 'Error occurred';
      default:
        return 'Unknown status';
    }
  };

  const renderSummaryData = () => {
    if (!automation.data || automation.status === 'loading') {
      return (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      );
    }

    switch (automation.type) {
      case 'seo-analysis':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{automation.data.seoScore}/100</div>
              <div className="text-xs text-gray-400">SEO Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{automation.data.rankingKeywords}</div>
              <div className="text-xs text-gray-400">Keywords Ranking</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{(automation.data.backlinks / 1000).toFixed(1)}K</div>
              <div className="text-xs text-gray-400">Backlinks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{automation.data.issues}</div>
              <div className="text-xs text-gray-400">Issues Found</div>
            </div>
          </div>
        );
      
      case 'competitor-intel':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Market Position</span>
              <span className="text-white font-medium">#{automation.data.marketPosition}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Gap Opportunities</span>
              <span className="text-green-400 font-medium">{automation.data.gapOpportunities} found</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tech Stack Changes</span>
              <span className="text-blue-400 font-medium">{automation.data.techStackChanges} detected</span>
            </div>
          </div>
        );
      
      case 'social-media':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Engagement</span>
              <div className="flex items-center space-x-1">
                <span className="text-white font-medium">{automation.data.totalEngagement}%</span>
                {automation.data.totalGrowth > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Growth Rate</span>
              <span className={`font-medium ${automation.data.totalGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {automation.data.totalGrowth >= 0 ? '+' : ''}{automation.data.totalGrowth}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Platforms</span>
              <span className="text-white font-medium">{automation.data.platforms?.length || 0} connected</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center text-gray-400 py-4">
            <div className="text-lg font-medium">{automation.data.metrics || 'N/A'}</div>
            <div className="text-sm">Metrics Available</div>
          </div>
        );
    }
  };

  const renderDetailedData = () => {
    if (!automation.data || automation.status === 'loading') return null;

    switch (automation.type) {
      case 'seo-analysis':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Organic Traffic</div>
                <div className="text-xl font-bold text-green-400">{automation.data.organicTraffic?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Keywords</div>
                <div className="text-xl font-bold text-blue-400">{automation.data.totalKeywords}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Improvements</div>
                <div className="text-xl font-bold text-purple-400">{automation.data.improvements} suggested</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Domain</div>
                <div className="text-sm text-white truncate">{automation.data.domain}</div>
              </div>
            </div>
          </div>
        );
      
      case 'social-media':
        return (
          <div className="space-y-4">
            {automation.data.platforms?.map((platform: any, index: number) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                      {platform.platform[0].toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{platform.platform}</span>
                  </div>
                  <span className="text-gray-400 text-sm">@{platform.handle}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400">Followers</div>
                    <div className="text-white font-medium">{platform.followers?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Engagement</div>
                    <div className="text-green-400 font-medium">{platform.engagement}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Growth</div>
                    <div className={`font-medium ${platform.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {platform.growth >= 0 ? '+' : ''}{platform.growth}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="text-gray-400 text-sm">
            Detailed data available for this automation type.
          </div>
        );
    }
  };

  return (
    <motion.div
      layout
      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
    >
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${automation.color} bg-opacity-10 border-b border-gray-700`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-gradient-to-br ${automation.color} rounded-lg`}>
              <Icon name={automation.icon} className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{automation.name}</h3>
              <div className="flex items-center space-x-1 text-sm">
                {getStatusIcon()}
                <span className="text-gray-400">{getStatusText()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              title={isExpanded ? "Show less" : "Show more"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {automation.status === 'error' ? (
          <div className="text-center py-6">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-red-400 font-medium mb-1">Error Loading Data</div>
            <div className="text-sm text-gray-500">{automation.lastError || 'Unknown error occurred'}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Data */}
            {renderSummaryData()}
            
            {/* Detailed Data */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-700 pt-4"
                >
                  {renderDetailedData()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AutomationCard;