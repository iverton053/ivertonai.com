import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Target, Zap, Clock, Bell, CheckCircle } from 'lucide-react';
import { EnhancedBadge, StatusIndicator } from '../ui/EnhancedVisualHierarchy';

// Lightweight, instant-loading overview component with cached data
const FastOverviewDashboard: React.FC = () => {
  // Pre-calculated mock data to avoid any async operations
  const quickStats = [
    {
      title: 'Revenue',
      value: '$94,750',
      change: '+8.2%',
      icon: DollarSign,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: '12,847',
      change: '+12.5%',
      icon: Users,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Conversion Rate',
      value: '3.4%',
      change: '-2.1%',
      icon: Target,
      color: 'purple',
      trend: 'down'
    },
    {
      title: 'Automations',
      value: '47',
      change: '+15.8%',
      icon: Zap,
      color: 'yellow',
      trend: 'up'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      title: 'Email Campaign Completed',
      description: 'Marketing campaign sent to 2,450 subscribers',
      time: '5 minutes ago',
      status: 'success',
      icon: CheckCircle
    },
    {
      id: 2,
      title: 'CRM Sync in Progress',
      description: 'Synchronizing 1,200 contact records',
      time: '12 minutes ago',
      status: 'pending',
      icon: Clock
    },
    {
      id: 3,
      title: 'New Lead Generated',
      description: 'High-value lead from social media campaign',
      time: '25 minutes ago',
      status: 'success',
      icon: TrendingUp
    }
  ];

  const alerts = [
    {
      id: 1,
      title: 'Server Performance',
      message: 'Response time 15% slower than usual',
      severity: 'warning',
      time: '10 min ago'
    },
    {
      id: 2,
      title: 'Storage Space',
      message: 'Database storage 85% full',
      severity: 'alert',
      time: '1 hour ago'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex items-center space-x-4">
          <StatusIndicator status="active" label="All Systems" />
          <EnhancedBadge variant="success" animate>
            Live Data
          </EnhancedBadge>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="glass-effect rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-500/20 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <EnhancedBadge 
                variant={stat.trend === 'up' ? 'success' : 'error'} 
                size="sm"
              >
                {stat.change}
              </EnhancedBadge>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass-effect rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors">
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  activity.status === 'success' ? 'bg-green-500/20 text-green-400' : 
                  activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium mb-1">{activity.title}</h4>
                  <p className="text-gray-400 text-sm mb-1">{activity.description}</p>
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alerts & Notifications */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass-effect rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">System Alerts</h2>
            <div className="relative">
              <Bell className="w-5 h-5 text-purple-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{alerts.length}</span>
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 rounded-lg border border-gray-600/50 hover:border-orange-500/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-white font-medium">{alert.title}</h4>
                      <EnhancedBadge 
                        variant={alert.severity === 'alert' ? 'error' : 'warning'} 
                        size="sm"
                      >
                        {alert.severity}
                      </EnhancedBadge>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{alert.message}</p>
                    <p className="text-gray-500 text-xs">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="glass-effect rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Performance Overview</h2>
          <div className="flex items-center space-x-2">
            <EnhancedBadge variant="info" size="sm">Last 30 Days</EnhancedBadge>
            <StatusIndicator status="active" showIcon={false} />
          </div>
        </div>
        
        <div className="h-64 bg-gray-700/30 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Performance Chart</h3>
            <p className="text-gray-400 text-sm">Interactive chart loading...</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(FastOverviewDashboard);