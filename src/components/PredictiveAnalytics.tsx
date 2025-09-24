import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Zap,
  MessageSquare,
  BarChart3,
  DollarSign,
  Users,
  Search,
  Lightbulb,
  RefreshCw,
  Settings,
  ChevronRight,
  Bot,
  Send
} from 'lucide-react';
import { usePredictiveAnalyticsStore, startAutoRefresh, stopAutoRefresh } from '../stores/predictiveAnalyticsStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const PredictiveAnalytics: React.FC = () => {
  const {
    churnPredictions,
    revenueForecast,
    seoOpportunities,
    performanceTrends,
    insights,
    chatHistory,
    loading,
    errors,
    settings,
    predictChurn,
    forecastRevenue,
    analyzeSEOOpportunities,
    generateInsights,
    processNaturalLanguageQuery,
    refreshAllPredictions,
    clearErrors,
    updateSettings
  } = usePredictiveAnalyticsStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [chatInput, setChatInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Initialize auto-refresh
  useEffect(() => {
    if (settings.autoRefresh) {
      startAutoRefresh();
    }
    
    return () => stopAutoRefresh();
  }, [settings.autoRefresh, settings.refreshInterval]);

  // Load initial predictions on mount with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshAllPredictions();
    }, 500); // 500ms delay to prevent immediate execution

    return () => clearTimeout(timer);
  }, []);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    await processNaturalLanguageQuery(chatInput);
    setChatInput('');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'churn', label: 'Churn Risk', icon: AlertTriangle },
    { id: 'revenue', label: 'Revenue Forecast', icon: DollarSign },
    { id: 'seo', label: 'SEO Opportunities', icon: Target },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'insights', label: 'Insights', icon: Lightbulb }
  ];

  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <span>Predictive Analytics</span>
          </h1>
          <p className="text-gray-400 mt-1">AI-powered insights and forecasting</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshAllPredictions}
            disabled={Object.values(loading).some(Boolean)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${Object.values(loading).some(Boolean) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Churn Risk Summary */}
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            {loading.churn && <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />}
          </div>
          <h3 className="text-lg font-semibold text-white">Churn Risk</h3>
          <p className="text-3xl font-bold text-red-400">
            {Object.keys(churnPredictions).length > 0
              ? `${Math.round(Object.values(churnPredictions)[0].value * 100)}%`
              : '---'
            }
          </p>
          <p className="text-sm text-gray-400 mt-1">Average client risk</p>
        </div>

        {/* Revenue Forecast */}
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            {loading.revenue && <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />}
          </div>
          <h3 className="text-lg font-semibold text-white">Revenue Growth</h3>
          <p className="text-3xl font-bold text-green-400">
            {revenueForecast?.trend_analysis?.direction === 'increasing' && '+'}
            {revenueForecast ? `${Math.round(revenueForecast.trend_analysis.strength * 100)}%` : '---'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Predicted trend</p>
        </div>

        {/* SEO Opportunities */}
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-400" />
            {loading.seo && <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
          </div>
          <h3 className="text-lg font-semibold text-white">SEO Score</h3>
          <p className="text-3xl font-bold text-blue-400">
            {seoOpportunities.length > 0 
              ? Math.round(seoOpportunities[0].value * 100)
              : '---'
            }
          </p>
          <p className="text-sm text-gray-400 mt-1">Top opportunity</p>
        </div>

        {/* AI Insights */}
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Lightbulb className="w-8 h-8 text-yellow-400" />
            {loading.insights && <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />}
          </div>
          <h3 className="text-lg font-semibold text-white">Insights</h3>
          <p className="text-3xl font-bold text-yellow-400">
            {insights.recommendations.length}
          </p>
          <p className="text-sm text-gray-400 mt-1">Active recommendations</p>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Predictive Analytics Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Auto Refresh
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateSettings({ autoRefresh: !settings.autoRefresh })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoRefresh ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-400">
                    {settings.autoRefresh ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Refresh Interval (minutes)
                </label>
                <input
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) => updateSettings({ refreshInterval: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="5"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confidence Threshold
                </label>
                <input
                  type="range"
                  value={settings.confidenceThreshold}
                  onChange={(e) => updateSettings({ confidenceThreshold: parseFloat(e.target.value) })}
                  className="w-full"
                  min="0.1"
                  max="1"
                  step="0.1"
                />
                <span className="text-sm text-gray-400">{Math.round(settings.confidenceThreshold * 100)}%</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Insights
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateSettings({ enableAIInsights: !settings.enableAIInsights })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableAIInsights ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableAIInsights ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-400">
                    {settings.enableAIInsights ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {Object.values(errors).some(error => error) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-4 border-l-4 border-red-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-red-400 font-semibold">Errors detected</h4>
              {Object.entries(errors).map(([key, error]) => 
                error && (
                  <p key={key} className="text-red-300 text-sm mt-1">{key}: {error}</p>
                )
              )}
            </div>
            <button
              onClick={clearErrors}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="glass-effect rounded-xl p-2">
        <nav className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
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
          className="space-y-6"
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* AI Insights Summary */}
              {insights.general && (
                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Bot className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">AI Overview</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{insights.general}</p>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <span>Key Recommendations</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {insights.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-4 bg-gray-800/30 rounded-lg"
                      >
                        <ChevronRight className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Combined Overview Chart */}
              {revenueForecast && (
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Revenue Forecast Overview</h3>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueForecast.predictions.map((pred, i) => ({
                      month: revenueForecast.dates[i] || `Month ${i + 1}`,
                      value: pred,
                      lower: revenueForecast.confidence_intervals[i]?.lower || pred * 0.8,
                      upper: revenueForecast.confidence_intervals[i]?.upper || pred * 1.2
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="upper" 
                        stackId="1"
                        stroke="none"
                        fill="url(#colorGradient1)"
                        fillOpacity={0.1}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stackId="2"
                        stroke="#8b5cf6"
                        fill="url(#colorGradient2)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {/* Churn Risk Tab */}
          {activeTab === 'churn' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Churn Predictions */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Client Churn Risk</h3>
                
                <div className="space-y-4">
                  {Object.entries(churnPredictions).map(([clientId, prediction]) => (
                    <div key={clientId} className="p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{clientId}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          prediction.value > 0.7 
                            ? 'bg-red-900/30 text-red-400'
                            : prediction.value > 0.4
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-green-900/30 text-green-400'
                        }`}>
                          {Math.round(prediction.value * 100)}% Risk
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full ${
                            prediction.value > 0.7 ? 'bg-red-500'
                            : prediction.value > 0.4 ? 'bg-yellow-500'
                            : 'bg-green-500'
                          }`}
                          style={{ width: `${prediction.value * 100}%` }}
                        />
                      </div>
                      
                      <p className="text-sm text-gray-400">{prediction.explanation}</p>
                      
                      {/* Top Risk Factors */}
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Top Risk Factors:</p>
                        <div className="flex flex-wrap gap-1">
                          {prediction.factors.slice(0, 3).map((factor, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                              {factor.factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {Object.keys(churnPredictions).length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No churn predictions available</p>
                      <button
                        onClick={() => refreshAllPredictions()}
                        className="mt-2 text-purple-400 hover:text-purple-300"
                      >
                        Generate Predictions
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Churn Insights */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">AI Insights</h3>
                
                {insights.churn ? (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">{insights.churn}</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>AI insights will appear here after analysis</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Revenue Forecast Tab */}
          {activeTab === 'revenue' && revenueForecast && (
            <div className="space-y-6">
              {/* Revenue Chart */}
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Revenue Forecast</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-400">Predicted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-300 rounded-full opacity-50"></div>
                      <span className="text-sm text-gray-400">Confidence Range</span>
                    </div>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueForecast.predictions.map((pred, i) => ({
                    month: revenueForecast.dates[i] || `Month ${i + 1}`,
                    prediction: pred,
                    lower: revenueForecast.confidence_intervals[i]?.lower || pred * 0.8,
                    upper: revenueForecast.confidence_intervals[i]?.upper || pred * 1.2
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="upper" 
                      stackId="1"
                      stroke="none"
                      fill="#8b5cf6"
                      fillOpacity={0.1}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lower" 
                      stackId="1"
                      stroke="none"
                      fill="#ffffff"
                      fillOpacity={0}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="prediction" 
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-effect rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Trend Analysis</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Direction</span>
                      <div className="flex items-center space-x-2">
                        {revenueForecast.trend_analysis.direction === 'increasing' ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : revenueForecast.trend_analysis.direction === 'decreasing' ? (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        ) : (
                          <div className="w-5 h-5 bg-gray-400 rounded" />
                        )}
                        <span className="text-white capitalize">{revenueForecast.trend_analysis.direction}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Trend Strength</span>
                      <span className="text-white">{Math.round(revenueForecast.trend_analysis.strength * 100)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Seasonality</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        revenueForecast.trend_analysis.seasonal_patterns
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {revenueForecast.trend_analysis.seasonal_patterns ? 'Detected' : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">AI Revenue Insights</h4>
                  
                  {insights.revenue ? (
                    <p className="text-gray-300 leading-relaxed">{insights.revenue}</p>
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      <p>Generating revenue insights...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SEO Opportunities Tab */}
          {activeTab === 'seo' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Top SEO Opportunities</h3>
                
                <div className="space-y-4">
                  {seoOpportunities.slice(0, 5).map((opportunity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-800/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">Opportunity #{index + 1}</span>
                        <span className="text-2xl font-bold text-blue-400">
                          {Math.round(opportunity.value * 100)}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${opportunity.value * 100}%` }}
                        />
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">{opportunity.explanation}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Confidence: {Math.round(opportunity.confidence * 100)}%</span>
                        <div className="flex items-center space-x-1">
                          {opportunity.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : opportunity.trend === 'down' ? (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          ) : (
                            <div className="w-4 h-4 bg-gray-400 rounded" />
                          )}
                          <span className="text-xs text-gray-400 capitalize">{opportunity.trend}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {seoOpportunities.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No SEO opportunities found</p>
                      <button
                        onClick={() => refreshAllPredictions()}
                        className="mt-2 text-purple-400 hover:text-purple-300"
                      >
                        Analyze SEO Data
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">SEO Insights</h3>
                
                {insights.seo ? (
                  <p className="text-gray-300 leading-relaxed">{insights.seo}</p>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>SEO insights will appear here after analysis</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bot className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">AI Analytics Assistant</h3>
              </div>
              
              {/* Chat History */}
              <div className="h-96 overflow-y-auto space-y-4 mb-6 p-4 bg-gray-800/30 rounded-lg">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Ask me anything about your analytics data!</p>
                    <p className="text-sm mt-2">Try: "What's my churn risk?" or "Show revenue trends"</p>
                  </div>
                ) : (
                  chatHistory.map((chat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="bg-purple-600 text-white p-3 rounded-lg max-w-xs">
                          {chat.query}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-gray-700 text-gray-200 p-3 rounded-lg max-w-xs">
                          {chat.response}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {loading.chat && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-200 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your analytics..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={loading.chat || !chatInput.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* General Insights */}
              {insights.general && (
                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">AI Business Intelligence</h3>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{insights.general}</p>
                  </div>
                </div>
              )}

              {/* All Recommendations */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Strategic Recommendations</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <p className="text-gray-300">{rec}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {insights.recommendations.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recommendations available yet</p>
                    <button
                      onClick={generateInsights}
                      className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Generate Insights
                    </button>
                  </div>
                )}
              </div>

              {/* Specific Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Churn Insights */}
                {insights.churn && (
                  <div className="glass-effect rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h4 className="font-semibold text-white">Churn Analysis</h4>
                    </div>
                    <p className="text-gray-300 text-sm">{insights.churn}</p>
                  </div>
                )}

                {/* Revenue Insights */}
                {insights.revenue && (
                  <div className="glass-effect rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <h4 className="font-semibold text-white">Revenue Forecast</h4>
                    </div>
                    <p className="text-gray-300 text-sm">{insights.revenue}</p>
                  </div>
                )}

                {/* SEO Insights */}
                {insights.seo && (
                  <div className="glass-effect rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Target className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-white">SEO Opportunities</h4>
                    </div>
                    <p className="text-gray-300 text-sm">{insights.seo}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PredictiveAnalytics;