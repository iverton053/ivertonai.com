import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  BarChart3,
  Calendar,
  Activity,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { financialService } from '../../services/financialService';
import { FinancialDashboardData, FinancialSummary, ClientRevenueBreakdown } from '../../types/financial';
import { format, parseISO } from 'date-fns';
import InvoiceManagement from './InvoiceManagement';
import ProjectManagement from './ProjectManagement';
import TimeTracking from './TimeTracking';

const FinancialDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<FinancialDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await financialService.getFinancialDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number, showSign = true) => {
    const sign = value >= 0 ? '+' : '';
    return `${showSign ? sign : ''}${value.toFixed(1)}%`;
  };

  const getPercentageColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getPercentageIcon = (value: number) => {
    return value >= 0 ? 
      <ArrowUpRight className="w-4 h-4 text-green-400" /> : 
      <ArrowDownRight className="w-4 h-4 text-red-400" />;
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Financial Dashboard</h1>
            <p className="text-gray-400 mt-1">Track your agency's financial performance</p>
          </div>
        </div>

        {/* Loading State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-effect rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { summary } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your agency's financial performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-4 lg:p-6 min-h-[140px]"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 lg:p-3 bg-emerald-500/20 rounded-xl flex-shrink-0">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" />
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {getPercentageIcon(summary.revenue.growth_rate)}
              <span className={`text-xs lg:text-sm font-medium ${getPercentageColor(summary.revenue.growth_rate)}`}>
                {formatPercentage(summary.revenue.growth_rate)}
              </span>
            </div>
          </div>
          <div className="overflow-hidden">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400 mb-1">Revenue</h3>
            <p className="text-lg lg:text-2xl font-bold text-white mb-1 truncate" title={formatCurrency(summary.revenue.this_month)}>
              {formatCurrency(summary.revenue.this_month)}
            </p>
            <p className="text-xs text-gray-400 truncate" title={`Last month: ${formatCurrency(summary.revenue.last_month)}`}>
              Last month: {formatCurrency(summary.revenue.last_month)}
            </p>
          </div>
        </motion.div>

        {/* Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-xl p-4 lg:p-6 min-h-[140px]"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 lg:p-3 bg-red-900/200/20 rounded-xl flex-shrink-0">
              <TrendingDown className="w-5 h-5 lg:w-6 lg:h-6 text-red-400" />
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {getPercentageIcon(summary.expenses.change_rate)}
              <span className={`text-xs lg:text-sm font-medium ${getPercentageColor(summary.expenses.change_rate)}`}>
                {formatPercentage(summary.expenses.change_rate)}
              </span>
            </div>
          </div>
          <div className="overflow-hidden">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400 mb-1">Expenses</h3>
            <p className="text-lg lg:text-2xl font-bold text-white mb-1 truncate" title={formatCurrency(summary.expenses.this_month)}>
              {formatCurrency(summary.expenses.this_month)}
            </p>
            <p className="text-xs text-gray-400 truncate" title={`Last month: ${formatCurrency(summary.expenses.last_month)}`}>
              Last month: {formatCurrency(summary.expenses.last_month)}
            </p>
          </div>
        </motion.div>

        {/* Profit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-4 lg:p-6 min-h-[140px]"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 lg:p-3 bg-blue-900/200/20 rounded-xl flex-shrink-0">
              <Target className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <span className="text-xs lg:text-sm font-medium text-purple-400 truncate">
                {formatPercentage(summary.profit.margin, false)} margin
              </span>
            </div>
          </div>
          <div className="overflow-hidden">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400 mb-1">Profit</h3>
            <p className="text-lg lg:text-2xl font-bold text-white mb-1 truncate" title={formatCurrency(summary.profit.this_month)}>
              {formatCurrency(summary.profit.this_month)}
            </p>
            <p className="text-xs text-gray-400 truncate" title={`Last month: ${formatCurrency(summary.profit.last_month)}`}>
              Last month: {formatCurrency(summary.profit.last_month)}
            </p>
          </div>
        </motion.div>

        {/* Outstanding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-xl p-4 lg:p-6 min-h-[140px]"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 lg:p-3 bg-yellow-500/20 rounded-xl flex-shrink-0">
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-400" />
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0 min-w-0">
              {summary.outstanding.overdue_count > 0 && (
                <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 text-red-400 flex-shrink-0" />
              )}
              <span className="text-xs lg:text-sm font-medium text-gray-400 truncate">
                {summary.outstanding.overdue_count} overdue
              </span>
            </div>
          </div>
          <div className="overflow-hidden">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400 mb-1">Outstanding</h3>
            <p className="text-lg lg:text-2xl font-bold text-white mb-1 truncate" title={formatCurrency(summary.outstanding.amount)}>
              {formatCurrency(summary.outstanding.amount)}
            </p>
            <p className="text-xs text-gray-400 truncate" title={`${summary.outstanding.invoices_count} invoices`}>
              {summary.outstanding.invoices_count} invoices
            </p>
          </div>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Active Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-xl p-4 lg:p-6 min-h-[120px]"
        >
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="p-2 lg:p-3 bg-purple-500/20 rounded-xl flex-shrink-0">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs lg:text-sm font-medium text-gray-400 truncate">Active Clients</h3>
              <p className="text-lg lg:text-xl font-bold text-white">
                {summary.clients.active_count}
              </p>
              <p className="text-xs text-gray-400 truncate">
                +{summary.clients.new_this_month} new this month
              </p>
            </div>
          </div>
        </motion.div>

        {/* Active Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-effect rounded-xl p-4 lg:p-6 min-h-[120px]"
        >
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="p-2 lg:p-3 bg-indigo-500/20 rounded-xl flex-shrink-0">
              <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs lg:text-sm font-medium text-gray-400 truncate">Active Projects</h3>
              <p className="text-lg lg:text-xl font-bold text-white">
                {dashboardData.active_projects.length}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {dashboardData.active_projects.filter(p => p.status === 'active').length} in progress
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-effect rounded-xl p-4 lg:p-6 min-h-[120px]"
        >
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="p-2 lg:p-3 bg-green-500/20 rounded-xl flex-shrink-0">
              <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs lg:text-sm font-medium text-gray-400 truncate">Time Logged</h3>
              <p className="text-lg lg:text-xl font-bold text-white">
                {dashboardData.recent_time_entries.reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)}h
              </p>
              <p className="text-xs text-gray-400 truncate">
                {dashboardData.recent_time_entries.length} entries today
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-effect rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Revenue Trend</h2>
            <p className="text-gray-400 text-sm">Monthly revenue, expenses, and profit</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-300">Revenue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-900/200 rounded-full"></div>
              <span className="text-gray-300">Expenses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-900/200 rounded-full"></div>
              <span className="text-gray-300">Profit</span>
            </div>
          </div>
        </div>

        <div className="h-64 flex items-end space-x-2">
          {dashboardData.revenue_chart_data.map((data, index) => {
            const maxValue = Math.max(...dashboardData.revenue_chart_data.map(d => Math.max(d.revenue, d.expenses, d.profit)));
            const revenueHeight = (data.revenue / maxValue) * 200;
            const expenseHeight = (data.expenses / maxValue) * 200;
            const profitHeight = (data.profit / maxValue) * 200;

            return (
              <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                <div className="flex items-end space-x-1 w-full h-48">
                  <div
                    className="bg-emerald-500 rounded-t-sm opacity-80 transition-all duration-500 hover:opacity-100"
                    style={{ height: `${revenueHeight}px`, width: '30%' }}
                    title={`Revenue: ${formatCurrency(data.revenue)}`}
                  />
                  <div
                    className="bg-red-900/200 rounded-t-sm opacity-80 transition-all duration-500 hover:opacity-100"
                    style={{ height: `${expenseHeight}px`, width: '30%' }}
                    title={`Expenses: ${formatCurrency(data.expenses)}`}
                  />
                  <div
                    className="bg-blue-900/200 rounded-t-sm opacity-80 transition-all duration-500 hover:opacity-100"
                    style={{ height: `${profitHeight}px`, width: '30%' }}
                    title={`Profit: ${formatCurrency(data.profit)}`}
                  />
                </div>
                <span className="text-xs text-gray-400 font-medium">{data.month}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Invoices and Top Clients Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <InvoiceManagement isOverview={true} />
        </motion.div>

        {/* Top Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass-effect rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Top Clients</h2>
              <p className="text-gray-400 text-sm">Revenue breakdown by client</p>
            </div>
          </div>

          <div className="space-y-4">
            {dashboardData.client_revenue_breakdown.slice(0, 5).map((client, index) => (
              <div key={client.client_id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-3 flex-1 pr-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs">
                      {client.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white text-sm">{client.client_name}</h3>
                    <p className="text-xs text-gray-400">
                      {client.services.length} services • {formatCurrency(client.monthly_revenue)}/month
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {formatCurrency(client.total_revenue)}
                  </div>
                  {client.outstanding_amount > 0 && (
                    <div className="text-xs text-yellow-400">
                      {formatCurrency(client.outstanding_amount)} outstanding
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Project Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <ProjectManagement isOverview={true} />
      </motion.div>

      {/* Time Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <TimeTracking isOverview={true} />
      </motion.div>
    </div>
  );
};

export default FinancialDashboard;