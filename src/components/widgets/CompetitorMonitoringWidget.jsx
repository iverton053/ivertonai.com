import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Eye,
  ExternalLink,
  Zap,
  Crown,
  ArrowRight,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useAutomationHubStore } from '../../stores/automationHubStore';
import SmartWidgetPreview from '../SmartWidgetPreview';

const CompetitorMonitoringWidget = ({ onNavigateToAutomations }) => {
  const { automationResults, getFreshData } = useAutomationHubStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get competitor intelligence data from automation
  const competitorData = getFreshData('competitor-intel') || getFreshData('tech-stack-analysis');
  
  // Sample data for basic plan (limited insights)
  const basicCompetitorData = {
    competitors: [
      { 
        domain: 'competitor1.com', 
        ranking: 1, 
        change: '+2', 
        threat_level: 'high',
        market_share: '23%',
        recent_changes: ['New product launch', 'Price reduction'],
        tech_stack: ['React', 'AWS', 'Stripe']
      },
      { 
        domain: 'competitor2.com', 
        ranking: 2, 
        change: '-1', 
        threat_level: 'medium',
        market_share: '18%',
        recent_changes: ['SEO improvements', 'Content marketing'],
        tech_stack: ['Vue.js', 'Google Cloud', 'PayPal']
      },
      { 
        domain: 'competitor3.com', 
        ranking: 3, 
        change: '0', 
        threat_level: 'low',
        market_share: '12%',
        recent_changes: ['Website redesign'],
        tech_stack: ['WordPress', 'Shopify']
      }
    ],
    alerts: [
      { type: 'price_change', competitor: 'competitor1.com', message: 'Reduced pricing by 15%' },
      { type: 'new_feature', competitor: 'competitor2.com', message: 'Launched AI chatbot' }
    ],
    summary: {
      total_tracked: 12,
      high_threat: 3,
      new_changes: 8,
      market_movements: 'Increased competition in AI features'
    }
  };

  const getThreatColor = (level) => {
    switch(level) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getChangeIcon = (change) => {
    if (change.startsWith('+')) return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (change.startsWith('-')) return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <div className="w-3 h-3 rounded-full bg-gray-400"></div>;
  };

  const handleUpgrade = () => {
    if (onNavigateToAutomations) {
      onNavigateToAutomations();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Competitor Monitoring</h3>
              <p className="text-gray-400 text-sm">Real-time competitive intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
              Basic Plan
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4 bg-black/20 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
            { id: 'premium', label: 'Premium', icon: Crown }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-400">{basicCompetitorData.summary.total_tracked}</div>
                  <div className="text-xs text-gray-400">Competitors</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-400">{basicCompetitorData.summary.high_threat}</div>
                  <div className="text-xs text-gray-400">High Threat</div>
                </div>
              </div>

              {/* Top Competitors */}
              <div className="space-y-2">
                <h4 className="text-white font-medium text-sm">Top Competitors</h4>
                {basicCompetitorData.competitors.slice(0, 3).map((competitor, index) => (
                  <div key={competitor.domain} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{competitor.domain}</div>
                        <div className="text-gray-400 text-xs">Market Share: {competitor.market_share}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getThreatColor(competitor.threat_level)}`}>
                        {competitor.threat_level}
                      </span>
                      {getChangeIcon(competitor.change)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upgrade Prompt */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Unlock Full Intelligence</h4>
                    <p className="text-gray-300 text-sm">Get real-time alerts, deep analytics & automation</p>
                  </div>
                  <button
                    onClick={handleUpgrade}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Upgrade</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              <div className="space-y-3">
                {basicCompetitorData.alerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{alert.competitor}</div>
                      <div className="text-gray-300 text-sm">{alert.message}</div>
                      <div className="text-gray-500 text-xs mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        2 hours ago
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Limited Alert Message */}
              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30 text-center">
                <div className="text-yellow-400 font-medium mb-2">Basic Plan: Limited to 3 alerts/week</div>
                <p className="text-gray-300 text-sm mb-3">Upgrade for unlimited real-time monitoring</p>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'premium' && (
            <motion.div
              key="premium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4"
            >
              {/* Premium Features Preview */}
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-lg">Premium Competitor Intelligence</h3>
                  <p className="text-gray-400">Advanced monitoring with automated actions</p>
                </div>

                {/* Premium Features List */}
                <div className="space-y-3">
                  {[
                    'Real-time price monitoring & alerts',
                    'Technology stack change detection',
                    'Content strategy analysis',
                    'Social media competitor tracking',
                    'Automated competitive reports',
                    'Custom alert rules & actions',
                    'Historical trend analysis',
                    'n8n webhook integrations'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={handleUpgrade}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Unlock Premium Intelligence
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 bg-black/20">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Last updated: 2 hours ago</span>
          <div className="flex items-center space-x-1">
            <RefreshCw className="w-3 h-3" />
            <span>Auto-refresh: 6h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorMonitoringWidget;