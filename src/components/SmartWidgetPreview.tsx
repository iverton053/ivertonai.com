import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Zap,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  BarChart3,
  Brain,
  Cpu,
  Hash,
  FileText,
  Link,
  Search
} from 'lucide-react';
import { useAutomationHubStore } from '../stores/automationHubStore';

interface SmartWidgetPreviewProps {
  widgetType: string;
  automationType: string;
  data?: any;
  onNavigateToHub: () => void;
  compact?: boolean;
}

const SmartWidgetPreview: React.FC<SmartWidgetPreviewProps> = ({ 
  widgetType, 
  automationType, 
  data, 
  onNavigateToHub,
  compact = false 
}) => {
  const { automationResults, linkWidgetData } = useAutomationHubStore();
  const [isHovered, setIsHovered] = useState(false);
  
  // Find matching automation
  const automation = Object.values(automationResults).find(
    a => a.type === automationType || a.widgetType === widgetType
  );

  // Link widget data to automation when available
  useEffect(() => {
    if (automation && data) {
      linkWidgetData(automation.id, data);
    }
  }, [automation?.id, data, linkWidgetData]);

  const getAutomationIcon = (type: string) => {
    switch (type) {
      case 'seo-analysis': return <TrendingUp className="w-5 h-5" />;
      case 'keyword-research': return <Search className="w-5 h-5" />;
      case 'content-gap-analysis': return <FileText className="w-5 h-5" />;
      case 'backlink-analysis': return <Link className="w-5 h-5" />;
      case 'tech-stack-analysis': return <Cpu className="w-5 h-5" />;
      case 'social-media-trends': return <Hash className="w-5 h-5" />;
      case 'market-intelligence': return <BarChart3 className="w-5 h-5" />;
      case 'automation-workflows': return <Zap className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getQuickInsight = () => {
    if (!automation || !automation.data) return null;

    const { data: automationData, insights } = automation;
    
    // Generate contextual insights based on automation type
    switch (automation.type) {
      case 'seo-analysis':
        return {
          metric: automationData.seoScore || 85,
          label: 'SEO Score',
          trend: automationData.seoScore > 80 ? 'improving' : 'needs attention',
          color: automationData.seoScore > 80 ? 'text-green-400' : 'text-yellow-400'
        };
      
      case 'keyword-research':
        return {
          metric: automationData.opportunities || 23,
          label: 'Opportunities',
          trend: 'stable',
          color: 'text-blue-400'
        };
      
      case 'social-media-trends':
        return {
          metric: `${automationData.totalEngagement || 3.2}%`,
          label: 'Engagement',
          trend: automationData.totalGrowth > 0 ? 'improving' : 'declining',
          color: automationData.totalGrowth > 0 ? 'text-green-400' : 'text-red-400'
        };
      
      default:
        return {
          metric: insights?.score || 78,
          label: 'Performance',
          trend: insights?.trend || 'stable',
          color: 'text-purple-400'
        };
    }
  };

  const quickInsight = getQuickInsight();

  if (compact) {
    return (
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
        whileHover={{ scale: 1.02 }}
        onClick={onNavigateToHub}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-gradient-to-br ${automation?.color || 'from-gray-500 to-gray-600'} rounded-lg`}>
              {getAutomationIcon(automationType)}
            </div>
            <div>
              <h4 className="text-white font-medium text-sm">{automation?.name || 'AI Automation'}</h4>
              <p className="text-gray-400 text-xs">
                {automation?.status === 'fresh' ? 'Active' : 'Needs refresh'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-gradient-to-br ${automation?.color || 'from-purple-500 to-purple-700'} rounded-lg`}>
              {getAutomationIcon(automationType)}
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {automation?.name || 'AI Automation'}
              </h3>
              <p className="text-gray-400 text-sm">
                {automation?.category || 'Intelligence'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-lg text-xs border ${
              automation?.status === 'fresh' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              automation?.status === 'stale' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              automation?.status === 'loading' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              'bg-gray-500/20 text-gray-400 border-gray-500/30'
            }`}>
              {automation?.status === 'fresh' ? 'Live' : 
               automation?.status === 'loading' ? 'Updating' : 'Stale'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {quickInsight && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${quickInsight.color}`}>
                {quickInsight.metric}
              </div>
              <div className="text-xs text-gray-400">{quickInsight.label}</div>
            </div>
          )}
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {automation?.executionCount || 0}
            </div>
            <div className="text-xs text-gray-400">Executions</div>
          </div>
        </div>

        {/* Trend Indicator */}
        {automation?.insights && (
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center space-x-1">
              {automation.insights.trend === 'improving' ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : automation.insights.trend === 'declining' ? (
                <TrendingDown className="w-4 h-4 text-red-400" />
              ) : (
                <Activity className="w-4 h-4 text-blue-400" />
              )}
              <span className="text-sm text-gray-400 capitalize">
                {automation.insights.trend}
              </span>
            </div>
            <div className="text-sm text-gray-500">•</div>
            <div className="text-sm text-white font-medium">
              {automation.successRate}% success
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onNavigateToHub}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Manage</span>
          </button>
          
          <button
            onClick={onNavigateToHub}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Details</span>
          </button>
        </div>
      </div>

      {/* Enhanced Hover Overlay */}
      <AnimatePresence>
        {isHovered && automation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4"
          >
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                {automation.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              
              {automation.insights?.recommendations.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-3 h-3 text-purple-400" />
                    <p className="text-xs text-purple-300">
                      {automation.insights.recommendations[0]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SmartWidgetPreview;