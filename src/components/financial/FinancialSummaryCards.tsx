import React from 'react';
import { motion } from 'framer-motion';
import { useFinancialStore } from '../../stores/financialStore';
import Icon from '../Icon';

const FinancialSummaryCards: React.FC = () => {
  const { financialSummary, loading } = useFinancialStore();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const cards = [
    {
      title: 'Revenue This Month',
      value: financialSummary?.revenue.this_month || 0,
      change: financialSummary?.revenue.growth_rate || 0,
      icon: 'TrendingUp',
      color: 'green',
      isCurrency: true,
    },
    {
      title: 'Expenses This Month',
      value: financialSummary?.expenses.this_month || 0,
      change: financialSummary?.expenses.change_rate || 0,
      icon: 'TrendingDown',
      color: 'red',
      isCurrency: true,
    },
    {
      title: 'Profit This Month',
      value: financialSummary?.profit.this_month || 0,
      change: (financialSummary?.profit.margin || 0),
      icon: 'DollarSign',
      color: 'purple',
      isCurrency: true,
      changeLabel: 'margin',
    },
    {
      title: 'Outstanding Amount',
      value: financialSummary?.outstanding.amount || 0,
      change: financialSummary?.outstanding.invoices_count || 0,
      icon: 'AlertCircle',
      color: 'orange',
      isCurrency: true,
      changeLabel: 'invoices',
      noPercentage: true,
    },
    {
      title: 'Active Clients',
      value: financialSummary?.clients.active_count || 0,
      change: financialSummary?.clients.new_this_month || 0,
      icon: 'Users',
      color: 'blue',
      isCurrency: false,
      changeLabel: 'new this month',
      noPercentage: true,
    },
    {
      title: 'Overdue Invoices',
      value: financialSummary?.outstanding.overdue_count || 0,
      change: 0,
      icon: 'Clock',
      color: 'red',
      isCurrency: false,
      hideChange: true,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-500/20 border-green-500/30 text-green-400',
      red: 'bg-red-900/200/20 border-red-500/30 text-red-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      blue: 'bg-blue-900/200/20 border-blue-500/30 text-blue-400',
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  if (loading.analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="glass-effect p-6 rounded-xl border border-white/20 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gray-600 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-6 bg-gray-600 rounded w-1/2"></div>
              <div className="h-3 bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-effect p-6 rounded-xl border border-white/20 hover:border-white/30 transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${getColorClasses(card.color)}`}>
              <Icon name={card.icon} className="w-5 h-5" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400">{card.title}</p>
            <p className="text-2xl font-bold text-white">
              {card.isCurrency ? formatCurrency(card.value) : card.value.toLocaleString()}
            </p>
            {!card.hideChange && (
              <div className={`flex items-center text-xs ${getChangeColor(card.change)}`}>
                <Icon 
                  name={card.change >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                  className="w-3 h-3 mr-1" 
                />
                <span>
                  {card.noPercentage ? card.change : formatPercentage(card.change)}
                  {card.changeLabel && ` ${card.changeLabel}`}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FinancialSummaryCards;