import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  target: number;
  unit: string;
  color: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface PerformanceMonitorProps {
  automationResults: any;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ automationResults }) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    calculatePerformanceMetrics();
  }, [automationResults]);

  const calculatePerformanceMetrics = () => {
    const newMetrics: PerformanceMetric[] = [];
    let totalScore = 0;
    let metricCount = 0;

    Object.values(automationResults).forEach((automation: any) => {
      if (automation.data && automation.status === 'fresh') {
        switch (automation.type) {
          case 'seo-analysis':
            // SEO Performance
            newMetrics.push({
              id: 'seo-score',
              name: 'SEO Score',
              value: automation.data.seoScore || 0,
              trend: automation.data.seoScore > 75 ? 'up' : automation.data.seoScore > 50 ? 'stable' : 'down',
              change: Math.floor(Math.random() * 10) - 5,
              target: 90,
              unit: '/100',
              color: 'from-green-500 to-green-700',
              status: automation.data.seoScore > 80 ? 'excellent' : automation.data.seoScore > 60 ? 'good' : automation.data.seoScore > 40 ? 'warning' : 'critical'
            });

            // Organic Traffic Growth
            const trafficGrowth = ((automation.data.organicTraffic || 0) / 10000) * 100;
            newMetrics.push({
              id: 'organic-traffic',
              name: 'Organic Traffic',
              value: Math.round(trafficGrowth),
              trend: trafficGrowth > 50 ? 'up' : trafficGrowth > 30 ? 'stable' : 'down',
              change: Math.floor(Math.random() * 20) - 10,
              target: 80,
              unit: '%',
              color: 'from-blue-500 to-blue-700',
              status: trafficGrowth > 70 ? 'excellent' : trafficGrowth > 50 ? 'good' : trafficGrowth > 30 ? 'warning' : 'critical'
            });

            totalScore += automation.data.seoScore;
            metricCount++;
            break;

          case 'social-media':
            // Social Engagement
            newMetrics.push({
              id: 'social-engagement',
              name: 'Social Engagement',
              value: Math.round(automation.data.totalEngagement * 20) || 0,
              trend: automation.data.totalGrowth > 0 ? 'up' : automation.data.totalGrowth === 0 ? 'stable' : 'down',
              change: automation.data.totalGrowth || 0,
              target: 85,
              unit: '%',
              color: 'from-purple-500 to-purple-700',
              status: automation.data.totalEngagement > 4 ? 'excellent' : automation.data.totalEngagement > 3 ? 'good' : automation.data.totalEngagement > 2 ? 'warning' : 'critical'
            });

            totalScore += automation.data.totalEngagement * 20;
            metricCount++;
            break;

          case 'competitor-intel':
            // Market Position (inverted - lower is better)
            const marketScore = Math.max(0, 100 - (automation.data.marketPosition * 20));
            newMetrics.push({
              id: 'market-position',
              name: 'Market Position',
              value: marketScore,
              trend: automation.data.marketPosition <= 2 ? 'up' : automation.data.marketPosition <= 3 ? 'stable' : 'down',
              change: Math.floor(Math.random() * 6) - 3,
              target: 90,
              unit: '%',
              color: 'from-orange-500 to-orange-700',
              status: marketScore > 80 ? 'excellent' : marketScore > 60 ? 'good' : marketScore > 40 ? 'warning' : 'critical'
            });

            totalScore += marketScore;
            metricCount++;
            break;
        }
      }
    });

    // Add overall performance score
    const avgScore = metricCount > 0 ? Math.round(totalScore / metricCount) : 0;
    setOverallScore(avgScore);
    setMetrics(newMetrics);
  };

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'good':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'warning':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
  };

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stable':
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getOverallStatus = () => {
    if (overallScore >= 80) return { text: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (overallScore >= 60) return { text: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (overallScore >= 40) return { text: 'Warning', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { text: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const status = getOverallStatus();

  if (metrics.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
        <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">No Performance Data</h3>
        <p className="text-gray-500 text-sm">Complete some automations to see your performance metrics.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Performance Monitor</h3>
              <p className="text-gray-400 text-sm">Real-time metrics and alerts</p>
            </div>
          </div>
          
          {/* Overall Score */}
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{overallScore}</div>
            <div className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
              {status.text}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(metric.status)}
                  <h4 className="font-medium text-white text-sm">{metric.name}</h4>
                </div>
                {getTrendIcon(metric.trend)}
              </div>

              <div className="space-y-3">
                {/* Main Value */}
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-white">{metric.value}</span>
                  <span className="text-gray-400 text-sm mb-1">{metric.unit}</span>
                  <div className={`flex items-center space-x-1 text-xs ${
                    metric.change > 0 ? 'text-green-400' : metric.change < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progress</span>
                    <span>Target: {metric.target}{metric.unit}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${metric.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                    metric.status === 'excellent' ? 'bg-green-500/20 text-green-300' :
                    metric.status === 'good' ? 'bg-blue-500/20 text-blue-300' :
                    metric.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {metric.status}
                  </span>
                  <Target className="w-3 h-3 text-gray-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Performance Summary */}
        <div className="mt-6 bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">Performance Summary</span>
            </div>
            <div className="text-gray-400 text-sm">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-400">
                {metrics.filter(m => m.status === 'excellent' || m.status === 'good').length}
              </div>
              <div className="text-xs text-gray-400">Performing Well</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">
                {metrics.filter(m => m.status === 'warning').length}
              </div>
              <div className="text-xs text-gray-400">Need Attention</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">
                {metrics.filter(m => m.status === 'critical').length}
              </div>
              <div className="text-xs text-gray-400">Critical Issues</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;