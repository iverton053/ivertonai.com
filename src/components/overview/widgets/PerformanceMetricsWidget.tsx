import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, Eye, MousePointer } from 'lucide-react';
import { OverviewMetrics } from '../../../types/overview';

interface PerformanceMetricsWidgetProps {
  performance: OverviewMetrics['performance'];
}

const PerformanceMetricsWidget: React.FC<PerformanceMetricsWidgetProps> = ({ performance }) => {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const metrics = [
    {
      title: 'Revenue',
      value: formatCurrency(performance.revenue.current, performance.revenue.currency),
      change: performance.revenue.change,
      target: formatCurrency(performance.revenue.target, performance.revenue.currency),
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      title: 'Qualified Leads',
      value: formatNumber(performance.leads.qualified),
      change: ((performance.leads.qualified / performance.leads.total) * 100 - 45), // Mock comparison
      subtitle: `${formatPercentage(performance.leads.conversionRate)} conversion rate`,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      title: 'Website Traffic',
      value: formatNumber(performance.traffic.visitors),
      change: 15.3, // Mock comparison
      subtitle: `${formatNumber(performance.traffic.pageViews)} page views`,
      icon: Eye,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      title: 'Engagement Rate',
      value: formatPercentage(performance.engagement.emailOpenRate),
      change: 4.2, // Mock comparison
      subtitle: `Avg. ${formatDuration(performance.engagement.averageTimeOnSite)} on site`,
      icon: MousePointer,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-effect rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
          <p className="text-gray-400 text-sm">Key business indicators across all channels</p>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          Real-time data
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div className="flex items-center text-sm">
                {metric.change > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-400">+{formatPercentage(metric.change)}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                    <span className="text-red-400">{formatPercentage(metric.change)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="mb-2">
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="text-gray-400 text-sm">{metric.title}</div>
            </div>

            {metric.subtitle && (
              <div className="text-xs text-gray-500">{metric.subtitle}</div>
            )}

            {metric.target && (
              <div className="mt-2 text-xs text-gray-500">
                Target: {metric.target}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress bar for revenue goal */}
      <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Monthly Revenue Progress</span>
          <span className="text-sm text-gray-400">
            {formatPercentage((performance.revenue.current / performance.revenue.target) * 100)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(performance.revenue.current / performance.revenue.target) * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full relative"
          >
            <div className="absolute -right-1 -top-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
          </motion.div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Current: {formatCurrency(performance.revenue.current)}</span>
          <span>Target: {formatCurrency(performance.revenue.target)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceMetricsWidget;