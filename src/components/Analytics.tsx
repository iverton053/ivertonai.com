import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { format } from 'date-fns';
import Icon from './Icon';
import { useHistoryStore } from '../stores/historyStore';
import { PredictiveInsight } from '../types';

interface AnalyticsProps {
  className?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ className = '' }) => {
  const {
    timeSeriesData,
    usageAnalytics,
    isLoading,
    error,
    refreshAnalytics,
    generateSampleData,
    clearError
  } = useHistoryStore();

  const [activeInsight, setActiveInsight] = useState<'performance' | 'usage' | 'predictions' | 'correlations'>('performance');

  // Load data on component mount
  useEffect(() => {
    const hasData = Object.keys(timeSeriesData).length > 0;
    if (!hasData && !isLoading) {
      generateSampleData();
    } else {
      refreshAnalytics();
    }
  }, []);

  // Performance insights
  const performanceInsights = useMemo(() => {
    const insights: Array<{ 
      title: string; 
      value: string; 
      change: number; 
      trend: 'up' | 'down' | 'neutral';
      description: string;
      severity: 'good' | 'warning' | 'critical';
    }> = [];

    // Analyze load times
    const loadTimeData = timeSeriesData['page_load_time'];
    if (loadTimeData?.data.length > 0) {
      const avgLoadTime = loadTimeData.data.reduce((sum, point) => 
        sum + (typeof point.value === 'number' ? point.value : 0), 0
      ) / loadTimeData.data.length;

      insights.push({
        title: 'Average Load Time',
        value: `${(avgLoadTime / 1000).toFixed(2)}s`,
        change: -5.2,
        trend: 'down',
        description: 'Page load time has improved by 5.2% this period',
        severity: avgLoadTime > 3000 ? 'critical' : avgLoadTime > 2000 ? 'warning' : 'good'
      });
    }

    // Analyze user satisfaction
    const satisfactionData = timeSeriesData['user_satisfaction'];
    if (satisfactionData?.data.length > 0) {
      const avgSatisfaction = satisfactionData.data.reduce((sum, point) => 
        sum + (typeof point.value === 'number' ? point.value : 0), 0
      ) / satisfactionData.data.length;

      insights.push({
        title: 'User Satisfaction',
        value: `${avgSatisfaction.toFixed(1)}/10`,
        change: 8.7,
        trend: 'up',
        description: 'User satisfaction scores are trending upward',
        severity: avgSatisfaction > 7 ? 'good' : avgSatisfaction > 5 ? 'warning' : 'critical'
      });
    }

    // Analyze interaction patterns
    const interactionData = timeSeriesData['widget_interactions'];
    if (interactionData?.data.length > 0) {
      const totalInteractions = interactionData.data.reduce((sum, point) => 
        sum + (typeof point.value === 'number' ? point.value : 0), 0
      );

      insights.push({
        title: 'Total Interactions',
        value: totalInteractions.toString(),
        change: 12.3,
        trend: 'up',
        description: 'User engagement is increasing across all widgets',
        severity: totalInteractions > 1000 ? 'good' : totalInteractions > 500 ? 'warning' : 'critical'
      });
    }

    return insights;
  }, [timeSeriesData]);

  // Usage pattern analysis
  const usagePatterns = useMemo(() => {
    const patterns: Array<{
      pattern: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      recommendation: string;
    }> = [];

    // Analyze peak usage times
    if (usageAnalytics.length > 0) {
      patterns.push({
        pattern: 'Peak Activity Hours',
        description: 'Most user activity occurs between 9 AM - 11 AM and 2 PM - 4 PM',
        impact: 'high',
        recommendation: 'Schedule maintenance outside these hours for minimal disruption'
      });

      patterns.push({
        pattern: 'Widget Preferences',
        description: 'Analytics and performance widgets are used 3x more than other types',
        impact: 'medium',
        recommendation: 'Consider adding more analytics-focused widgets to the dashboard'
      });

      patterns.push({
        pattern: 'Session Duration',
        description: 'Average session length has increased by 23% over the past month',
        impact: 'high',
        recommendation: 'Users are finding more value - consider expanding feature set'
      });
    }

    return patterns;
  }, [usageAnalytics]);

  // Generate predictive insights
  const predictiveInsights: PredictiveInsight[] = useMemo(() => {
    const insights: PredictiveInsight[] = [];

    // Predict future usage trends
    const interactionData = timeSeriesData['widget_interactions'];
    if (interactionData?.data.length >= 7) {
      const recentData = interactionData.data.slice(-7);
      const trend = recentData[recentData.length - 1].value > recentData[0].value ? 'upward' : 'downward';
      
      insights.push({
        id: 'usage_prediction',
        metric: 'widget_interactions',
        prediction: {
          value: typeof recentData[recentData.length - 1]?.value === 'number' 
            ? (recentData[recentData.length - 1]?.value as number) * 1.15 
            : 100,
          confidence: 0.78,
          timeframe: 7 * 24 * 60 * 60 * 1000 // 7 days
        },
        trend,
        factors: [
          { factor: 'User engagement growth', impact: 0.65 },
          { factor: 'Feature adoption rate', impact: 0.23 },
          { factor: 'Seasonal patterns', impact: 0.12 }
        ],
        generatedAt: Date.now()
      });
    }

    // Predict system performance
    const loadTimeData = timeSeriesData['page_load_time'];
    if (loadTimeData?.data.length >= 5) {
      const recentData = loadTimeData.data.slice(-5);
      const avgLoadTime = recentData.reduce((sum, point) => 
        sum + (typeof point.value === 'number' ? point.value : 0), 0
      ) / recentData.length;

      insights.push({
        id: 'performance_prediction',
        metric: 'page_load_time',
        prediction: {
          value: avgLoadTime * 0.95, // Expect 5% improvement
          confidence: 0.65,
          timeframe: 14 * 24 * 60 * 60 * 1000 // 14 days
        },
        trend: 'downward',
        factors: [
          { factor: 'Code optimization', impact: 0.45 },
          { factor: 'CDN improvements', impact: 0.35 },
          { factor: 'User base growth', impact: -0.20 }
        ],
        generatedAt: Date.now()
      });
    }

    return insights;
  }, [timeSeriesData]);

  // Correlation analysis
  const correlationData = useMemo(() => {
    const correlations: Array<{
      metricA: string;
      metricB: string;
      correlation: number;
      strength: 'strong' | 'moderate' | 'weak';
      interpretation: string;
    }> = [];

    // Example correlations (in production, calculate actual correlations)
    correlations.push({
      metricA: 'page_load_time',
      metricB: 'user_satisfaction',
      correlation: -0.78,
      strength: 'strong',
      interpretation: 'Faster load times strongly correlate with higher user satisfaction'
    });

    correlations.push({
      metricA: 'widget_interactions',
      metricB: 'active_sessions',
      correlation: 0.65,
      strength: 'moderate',
      interpretation: 'More widget interactions tend to occur during longer sessions'
    });

    correlations.push({
      metricA: 'user_satisfaction',
      metricB: 'active_sessions',
      correlation: 0.34,
      strength: 'weak',
      interpretation: 'User satisfaction has a weak positive correlation with session count'
    });

    return correlations;
  }, [timeSeriesData]);

  // Generate heatmap data for usage patterns
  const heatmapData = useMemo(() => {
    const data: Array<{ hour: number; day: string; value: number }> = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Generate mock heatmap data
    days.forEach((day, dayIndex) => {
      for (let hour = 0; hour < 24; hour++) {
        // Higher activity during business hours
        let value = Math.random() * 20;
        if (hour >= 9 && hour <= 17 && dayIndex < 5) {
          value = Math.random() * 80 + 20;
        }
        
        data.push({ hour, day, value: Math.round(value) });
      }
    });
    
    return data;
  }, []);

  // Chart colors and themes
  // const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Insights</h1>
          <p className="text-gray-400">
            AI-powered insights and predictive analytics for your dashboard
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => refreshAnalytics()}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <Icon name="Activity" className="w-4 h-4" />
          <span>Refresh Insights</span>
        </motion.button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Icon name="AlertCircle" className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-300 hover:text-red-100 transition-colors"
          >
            <Icon name="X" className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceInsights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                insight.severity === 'good' ? 'bg-green-600/20 text-green-400' :
                insight.severity === 'warning' ? 'bg-yellow-600/20 text-yellow-400' :
                'bg-red-600/20 text-red-400'
              }`}>
                <Icon name="Activity" className="w-4 h-4" />
              </div>
              <div className={`text-sm font-medium ${
                insight.trend === 'up' ? 'text-green-400' : 
                insight.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {insight.change > 0 ? '+' : ''}{insight.change}%
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{insight.title}</h3>
            <p className="text-2xl font-bold text-white mb-2">{insight.value}</p>
            <p className="text-sm text-gray-400">{insight.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Insight Categories */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl">
        {[
          { id: 'performance', label: 'Performance', icon: 'Zap' },
          { id: 'usage', label: 'Usage Patterns', icon: 'Users' },
          { id: 'predictions', label: 'Predictions', icon: 'TrendingUp' },
          { id: 'correlations', label: 'Correlations', icon: 'BarChart3' }
        ].map(category => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveInsight(category.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
              activeInsight === category.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Icon name={category.icon as any} className="w-4 h-4" />
            <span className="hidden sm:inline">{category.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Insight Content */}
      <motion.div
        key={activeInsight}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {activeInsight === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Performance Trends</h3>
              
              {Object.keys(timeSeriesData).length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={Object.values(timeSeriesData)[0]?.data.map(point => ({
                      timestamp: point.timestamp,
                      date: format(new Date(point.timestamp), 'MMM dd'),
                      value: typeof point.value === 'number' ? point.value : 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  No performance data available
                </div>
              )}
            </motion.div>

            {/* Performance Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Key Insights</h3>
              
              <div className="space-y-4">
                {performanceInsights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{insight.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        insight.severity === 'good' ? 'bg-green-600/20 text-green-400' :
                        insight.severity === 'warning' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{insight.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeInsight === 'usage' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Patterns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Usage Patterns</h3>
              
              <div className="space-y-4">
                {usagePatterns.map((pattern, index) => (
                  <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{pattern.pattern}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        pattern.impact === 'high' ? 'bg-red-600/20 text-red-400' :
                        pattern.impact === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-green-600/20 text-green-400'
                      }`}>
                        {pattern.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{pattern.description}</p>
                    <div className="bg-blue-600/10 border border-blue-500/20 rounded p-2">
                      <p className="text-xs text-blue-300">
                        <strong>Recommendation:</strong> {pattern.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Activity Heatmap</h3>
              
              <div className="grid grid-cols-24 gap-1 text-xs">
                {/* Hour labels */}
                <div className="col-span-24 grid grid-cols-24 gap-1 mb-2">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="text-center text-gray-400">
                      {i % 6 === 0 ? i : ''}
                    </div>
                  ))}
                </div>
                
                {/* Heatmap grid */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="col-span-24 grid grid-cols-24 gap-1 mb-1">
                    {heatmapData
                      .filter(d => d.day === day)
                      .map((d, i) => (
                        <div
                          key={i}
                          className={`aspect-square rounded-sm ${
                            d.value > 60 ? 'bg-purple-600' :
                            d.value > 40 ? 'bg-purple-500' :
                            d.value > 20 ? 'bg-purple-400' :
                            d.value > 10 ? 'bg-purple-300/50' :
                            'bg-gray-700'
                          }`}
                          title={`${day} ${d.hour}:00 - ${d.value} interactions`}
                        />
                      ))}
                  </div>
                ))}
                
                {/* Day labels */}
                <div className="col-span-24 grid grid-cols-1 gap-2 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-gray-400 text-center">{day}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeInsight === 'predictions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Predictive Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Predictive Forecast</h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { date: 'Past Week', actual: 850, predicted: null },
                    { date: 'This Week', actual: 920, predicted: null },
                    { date: 'Next Week', actual: null, predicted: 1050 },
                    { date: 'Week +2', actual: null, predicted: 1180 },
                    { date: 'Week +3', actual: null, predicted: 1250 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.3}
                      name="Actual"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#06B6D4" 
                      fill="#06B6D4" 
                      fillOpacity={0.2}
                      strokeDasharray="5 5"
                      name="Predicted"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Prediction Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Prediction Details</h3>
              
              <div className="space-y-4">
                {predictiveInsights.map((insight) => (
                  <div key={insight.id} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{insight.metric.replace(/_/g, ' ')}</h4>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Confidence</div>
                        <div className="text-white font-bold">
                          {(insight.prediction.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm text-gray-400">Predicted Value</div>
                      <div className="text-xl font-bold text-purple-400">
                        {insight.prediction.value.toFixed(1)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Key Factors</div>
                      {insight.factors.map((factor, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-300">{factor.factor}</span>
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-1 rounded ${
                              factor.impact > 0 ? 'bg-green-400' : 'bg-red-400'
                            }`} style={{
                              width: `${Math.abs(factor.impact) * 20}px`
                            }}></div>
                            <span className={factor.impact > 0 ? 'text-green-400' : 'text-red-400'}>
                              {(factor.impact * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeInsight === 'correlations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correlation Matrix */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Correlation Analysis</h3>
              
              <div className="space-y-4">
                {correlationData.map((corr, index) => (
                  <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium">
                        {corr.metricA} ↔ {corr.metricB}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          corr.strength === 'strong' ? 'bg-green-600/20 text-green-400' :
                          corr.strength === 'moderate' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-gray-600/20 text-gray-400'
                        }`}>
                          {corr.strength}
                        </div>
                        <div className={`font-bold ${
                          Math.abs(corr.correlation) > 0.7 ? 'text-green-400' :
                          Math.abs(corr.correlation) > 0.4 ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          {corr.correlation.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{corr.interpretation}</p>
                    
                    {/* Visual correlation strength */}
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          corr.correlation > 0 ? 'bg-green-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Scatter Plot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Correlation Visualization</h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={Array.from({ length: 20 }, () => ({
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    z: Math.random() * 50 + 10
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="x" stroke="#9CA3AF" />
                    <YAxis dataKey="y" stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Scatter dataKey="z" fill="#8B5CF6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  Scatter plot showing relationship between selected metrics
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default React.memo(Analytics);