import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb,
  Zap,
  ArrowRight,
  Crown,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Star,
  Sparkles,
  Wand2,
  BookOpen,
  Search,
  BarChart3
} from 'lucide-react';
import { useAutomationHubStore } from '../../stores/automationHubStore';
import SmartWidgetPreview from '../SmartWidgetPreview';

const AIRecommendationsWidget = ({ onNavigateToAutomations }) => {
  const { automationResults, getFreshData } = useAutomationHubStore();
  const [activeTab, setActiveTab] = useState('insights');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get AI insights data from automations
  const aiData = getFreshData('content-gap-analysis') || getFreshData('keyword-research');
  
  // Sample data for basic plan (limited recommendations)
  const basicAIData = {
    insights: [
      {
        type: 'seo',
        priority: 'high',
        title: 'Optimize page loading speed',
        description: 'Your homepage loads in 4.2s, aim for under 3s to improve SEO ranking',
        impact: 'High',
        effort: 'Medium',
        category: 'Technical SEO',
        confidence: 92
      },
      {
        type: 'content',
        priority: 'medium',
        title: 'Create comparison content',
        description: 'Target "X vs Y" keywords in your niche for 15% more organic traffic',
        impact: 'Medium',
        effort: 'High',
        category: 'Content Strategy',
        confidence: 78
      },
      {
        type: 'conversion',
        priority: 'high',
        title: 'A/B test CTA buttons',
        description: 'Orange buttons showed 23% higher conversion in similar industries',
        impact: 'High',
        effort: 'Low',
        category: 'Conversion',
        confidence: 85
      }
    ],
    summary: {
      total_recommendations: 12,
      high_priority: 4,
      potential_traffic_increase: '23%',
      estimated_revenue_impact: '$2,400/month'
    },
    trends: [
      { trend: 'Voice search optimization', growth: '+45%', relevance: 'high' },
      { trend: 'Video content demand', growth: '+67%', relevance: 'medium' },
      { trend: 'Mobile-first indexing', growth: '+12%', relevance: 'critical' }
    ]
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'technical seo': return <Search className="w-4 h-4" />;
      case 'content strategy': return <BookOpen className="w-4 h-4" />;
      case 'conversion': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact) => {
    switch(impact.toLowerCase()) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleUpgrade = () => {
    if (onNavigateToAutomations) {
      onNavigateToAutomations();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">AI Recommendations</h3>
              <p className="text-gray-400 text-sm">Smart insights for growth</p>
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
            { id: 'insights', label: 'Insights', icon: Lightbulb },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'premium', label: 'Premium', icon: Crown }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
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
          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">{basicAIData.summary.high_priority}</div>
                  <div className="text-xs text-gray-400">High Priority</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-400">{basicAIData.summary.potential_traffic_increase}</div>
                  <div className="text-xs text-gray-400">Traffic Potential</div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="space-y-3">
                <h4 className="text-white font-medium text-sm flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                  Smart Recommendations
                </h4>
                {basicAIData.insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(insight.category)}
                        <span className="text-white font-medium text-sm">{insight.title}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(insight.priority)}`}>
                        {insight.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-xs">
                          <span className="text-gray-500">Impact: </span>
                          <span className={getImpactColor(insight.impact)}>{insight.impact}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Effort: </span>
                          <span className="text-gray-300">{insight.effort}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-400">{insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upgrade Prompt */}
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Unlock AI-Powered Growth</h4>
                    <p className="text-gray-300 text-sm">Get personalized strategies & automated optimization</p>
                  </div>
                  <button
                    onClick={handleUpgrade}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Upgrade</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              {/* Market Trends */}
              <div className="space-y-3">
                <h4 className="text-white font-medium text-sm">Market Trends</h4>
                {basicAIData.trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        trend.relevance === 'critical' ? 'bg-red-400' :
                        trend.relevance === 'high' ? 'bg-yellow-400' :
                        'bg-green-400'
                      }`}></div>
                      <div>
                        <div className="text-white font-medium text-sm">{trend.trend}</div>
                        <div className="text-gray-400 text-xs capitalize">{trend.relevance} relevance</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium text-sm">{trend.growth}</div>
                      <div className="text-gray-500 text-xs">growth</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Impact Preview */}
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {basicAIData.summary.estimated_revenue_impact}
                  </div>
                  <div className="text-green-300 text-sm mb-2">Potential Revenue Impact</div>
                  <p className="text-gray-400 text-xs">Based on implementing high-priority recommendations</p>
                </div>
              </div>

              {/* Limited Analysis Message */}
              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30 text-center">
                <div className="text-yellow-400 font-medium mb-2">Basic Plan: Limited to 3 recommendations</div>
                <p className="text-gray-300 text-sm mb-3">Upgrade for unlimited AI insights & custom strategies</p>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Get Full Analysis
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
                  <h3 className="text-white font-bold text-lg">Premium AI Intelligence</h3>
                  <p className="text-gray-400">Advanced AI recommendations with automation</p>
                </div>

                {/* Premium Features List */}
                <div className="space-y-3">
                  {[
                    'Unlimited AI-generated recommendations',
                    'Custom growth strategies for your industry',
                    'Automated A/B testing suggestions',
                    'Competitor intelligence integration',
                    'Revenue impact forecasting',
                    'Priority scoring & implementation guides',
                    'Real-time market trend analysis',
                    'Automated workflow triggers'
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
                  Unlock Premium AI Recommendations
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 bg-black/20">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Last analysis: 1 hour ago</span>
          <div className="flex items-center space-x-1">
            <RefreshCw className="w-3 h-3" />
            <span>Auto-refresh: 4h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationsWidget;