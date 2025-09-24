import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useFinancialStore } from '../../stores/financialStore';
import Icon from '../Icon';

interface RevenueAnalyticsProps {
  isFullPage?: boolean;
}

const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({ isFullPage = false }) => {
  const {
    revenueMetrics,
    clientRevenueBreakdown,
    loading,
    fetchRevenueMetrics,
    fetchClientRevenueBreakdown,
  } = useFinancialStore();

  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(selectedPeriod));

    fetchRevenueMetrics({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });
    fetchClientRevenueBreakdown();
  }, [selectedPeriod, fetchRevenueMetrics, fetchClientRevenueBreakdown]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading.analytics && !revenueMetrics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-700/50 rounded-xl"></div>
            <div className="h-80 bg-gray-700/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {isFullPage ? 'Revenue Analytics' : 'Revenue Overview'}
          </h2>
          <p className="text-gray-400 text-sm">
            Track your financial performance and growth metrics
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      {revenueMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Revenue',
              value: revenueMetrics.total_revenue,
              icon: 'TrendingUp',
              color: 'green',
              change: `+${revenueMetrics.growth_rate}%`,
            },
            {
              label: 'Monthly Recurring Revenue',
              value: revenueMetrics.monthly_recurring_revenue,
              icon: 'Zap',
              color: 'purple',
              change: '+12.3%',
            },
            {
              label: 'Average Revenue Per Client',
              value: revenueMetrics.average_revenue_per_client,
              icon: 'Users',
              color: 'blue',
              change: '+8.7%',
            },
            {
              label: 'Outstanding Amount',
              value: revenueMetrics.overdue_amount,
              icon: 'AlertCircle',
              color: 'orange',
              change: '-5.2%',
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                metric.color === 'green' ? 'bg-green-500/20 border-green-500/30' :
                metric.color === 'purple' ? 'bg-purple-500/20 border-purple-500/30' :
                metric.color === 'blue' ? 'bg-blue-900/200/20 border-blue-500/30' :
                'bg-orange-500/20 border-orange-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon name={metric.icon} className="w-5 h-5 text-current" />
                <span className="text-xs text-green-400">{metric.change}</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">{metric.label}</p>
              <p className="text-xl font-bold text-white">{formatCurrency(metric.value)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 rounded-xl border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Revenue Trend</h3>
            <Icon name="TrendingUp" className="w-5 h-5 text-green-400" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
            <div className="text-center">
              <Icon name="BarChart3" className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">Chart will appear here with real data</p>
            </div>
          </div>
        </motion.div>

        {/* Service Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect p-6 rounded-xl border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Revenue by Service</h3>
            <Icon name="Presentation" className="w-5 h-5 text-purple-400" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
            <div className="text-center">
              <Icon name="BarChart2" className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">Service breakdown will appear here</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;