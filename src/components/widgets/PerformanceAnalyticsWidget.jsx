import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Zap,
  Eye,
  Clock,
  Target,
  ArrowRight,
  Crown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  MousePointerClick
} from 'lucide-react';
import { useAutomationHubStore } from '../../stores/automationHubStore';
import SmartWidgetPreview from '../SmartWidgetPreview';

const PerformanceAnalyticsWidget = ({ onNavigateToAutomations }) => {
  const { automationResults, getFreshData } = useAutomationHubStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get performance data from automation
  const performanceData = getFreshData('seo-analysis') || getFreshData('market-intelligence');
  
  // Sample data for basic plan (limited insights)
  const basicPerformanceData = {
    website: {
      overall_score: 78,
      traffic_trend: '+12%',
      bounce_rate: '34%',
      avg_session: '2:45',
      conversion_rate: '3.2%',
      page_speed: 89
    },
    metrics: {
      organic_traffic: 15420,
      page_views: 48750,
      unique_visitors: 12340,
      goal_completions: 89,
      top_pages: [
        { page: '/landing-page', views: 8950, bounce: '28%' },
        { page: '/product-demo', views: 6420, bounce: '22%' },
        { page: '/pricing', views: 4180, bounce: '45%' }
      ]
    },
    alerts: [
      { type: 'performance', message: 'Page speed decreased by 15%', severity: 'medium' },
      { type: 'traffic', message: 'Organic traffic up 12% this week', severity: 'positive' }
    ],
    recommendations: [
      'Optimize images on product pages',
      'Improve mobile page speed',
      'A/B test call-to-action buttons'
    ]
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const getTrendIcon = (trend) => {
    if (trend.startsWith('+')) return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (trend.startsWith('-')) return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Activity className="w-3 h-3 text-blue-400" />;
  };

  const handleUpgrade = () => {
    if (onNavigateToAutomations) {
      onNavigateToAutomations();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-green-900/20 to-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Performance Analytics</h3>
              <p className="text-gray-400 text-sm">Real-time website insights</p>
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
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'traffic', label: 'Traffic', icon: TrendingUp },
            { id: 'premium', label: 'Premium', icon: Crown }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white shadow-lg'
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
              {/* Performance Score */}
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className={`text-3xl font-bold ${getScoreColor(basicPerformanceData.website.overall_score)} mb-2`}>
                  {basicPerformanceData.website.overall_score}
                </div>
                <div className="text-gray-400 text-sm">Overall Performance Score</div>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  {getTrendIcon(basicPerformanceData.website.traffic_trend)}
                  <span className="text-xs text-gray-300">{basicPerformanceData.website.traffic_trend} this week</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-400">{basicPerformanceData.website.bounce_rate}</div>
                  <div className="text-xs text-gray-400">Bounce Rate</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">{basicPerformanceData.website.avg_session}</div>
                  <div className="text-xs text-gray-400">Avg Session</div>
                </div>
              </div>

              {/* Quick Insights */}
              <div className="space-y-2">
                <h4 className="text-white font-medium text-sm">Quick Insights</h4>
                <div className="space-y-2">
                  {basicPerformanceData.alerts.slice(0, 2).map((alert, index) => (
                    <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                      alert.severity === 'positive' ? 'bg-green-500/10 border border-green-500/20' :
                      alert.severity === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                      'bg-red-500/10 border border-red-500/20'
                    }`}>
                      <div className="mt-0.5">
                        {alert.severity === 'positive' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div className="text-white text-sm">{alert.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade Prompt */}
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Unlock Full Analytics</h4>
                    <p className="text-gray-300 text-sm">Get detailed reports, custom dashboards & alerts</p>
                  </div>
                  <button
                    onClick={handleUpgrade}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Upgrade</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'traffic' && (
            <motion.div
              key="traffic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              {/* Traffic Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-400">
                    {basicPerformanceData.metrics.organic_traffic.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Organic Traffic</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-400">
                    {basicPerformanceData.metrics.unique_visitors.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Unique Visitors</div>
                </div>
              </div>

              {/* Top Pages */}
              <div className="space-y-2">
                <h4 className="text-white font-medium text-sm">Top Pages</h4>
                {basicPerformanceData.metrics.top_pages.slice(0, 3).map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{page.page}</div>
                        <div className="text-gray-400 text-xs">{page.views.toLocaleString()} views</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">{page.bounce}</div>
                      <div className="text-gray-500 text-xs">bounce</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Limited Data Message */}
              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30 text-center">
                <div className="text-yellow-400 font-medium mb-2">Basic Plan: Last 7 days data only</div>
                <p className="text-gray-300 text-sm mb-3">Upgrade for historical analysis & custom date ranges</p>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  View Full Analytics
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
                  <h3 className="text-white font-bold text-lg">Premium Analytics</h3>
                  <p className="text-gray-400">Advanced insights with automated reporting</p>
                </div>

                {/* Premium Features List */}
                <div className="space-y-3">
                  {[
                    'Real-time traffic monitoring & alerts',
                    'Custom dashboard builder',
                    'Advanced conversion tracking',
                    'Cohort analysis & user segments',
                    'Automated performance reports',
                    'Goal tracking & attribution',
                    'Heat maps & user behavior',
                    'API integrations & exports'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Zap className="w-5 h-5 text-green-400" />
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={handleUpgrade}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all"
                >
                  Unlock Premium Analytics
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 bg-black/20">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Last updated: 15 minutes ago</span>
          <div className="flex items-center space-x-1">
            <RefreshCw className="w-3 h-3" />
            <span>Auto-refresh: 1h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalyticsWidget;