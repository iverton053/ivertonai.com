import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Calendar,
  Settings,
  Download,
  Filter,
  Zap,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minimize2,
  Maximize2,
  RefreshCw
} from 'lucide-react';

interface ApiService {
  id: string;
  name: string;
  category: 'email' | 'crm' | 'social' | 'ads' | 'financial' | 'communication' | 'analytics';
  icon: React.ComponentType<any>;
  costStructure: 'per_request' | 'monthly_quota' | 'tiered_usage' | 'pay_as_you_go';
  pricing: {
    free_tier?: number;
    cost_per_request?: number;
    monthly_base?: number;
    tiers?: { limit: number; cost: number }[];
  };
  currentUsage: number;
  monthlyLimit: number;
  costThisMonth: number;
  projectedMonthlyCost: number;
  lastUpdated: string;
  status: 'healthy' | 'warning' | 'critical';
  optimization_suggestions: string[];
}

interface CostOptimizationAlert {
  id: string;
  service: string;
  type: 'cost_spike' | 'approaching_limit' | 'inefficient_usage' | 'optimization_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  impact: number;
  recommendation: string;
  createdAt: string;
}

interface ApiCostTrackerProps {
  timeRange: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '24h' | '7d' | '30d' | '90d') => void;
}

const API_SERVICES: ApiService[] = [
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'email',
    icon: ({ className }: { className: string }) => (
      <div className={`${className} bg-blue-900/200 rounded flex items-center justify-center text-white font-bold text-xs`}>
        SG
      </div>
    ),
    costStructure: 'tiered_usage',
    pricing: {
      free_tier: 100,
      tiers: [
        { limit: 40000, cost: 19.95 },
        { limit: 100000, cost: 89.95 },
        { limit: 300000, cost: 249.95 }
      ]
    },
    currentUsage: 15420,
    monthlyLimit: 40000,
    costThisMonth: 19.95,
    projectedMonthlyCost: 19.95,
    lastUpdated: '2025-01-09T14:30:00Z',
    status: 'healthy',
    optimization_suggestions: [
      'Consider upgrading to higher tier for better cost per email',
      'Optimize send times to improve engagement rates'
    ]
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    category: 'crm',
    icon: ({ className }: { className: string }) => (
      <div className={`${className} bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs`}>
        HS
      </div>
    ),
    costStructure: 'per_request',
    pricing: {
      cost_per_request: 0.002
    },
    currentUsage: 8540,
    monthlyLimit: 100000,
    costThisMonth: 17.08,
    projectedMonthlyCost: 25.62,
    lastUpdated: '2025-01-09T14:25:00Z',
    status: 'healthy',
    optimization_suggestions: [
      'Batch API calls to reduce request count',
      'Cache frequently accessed data locally'
    ]
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    category: 'ads',
    icon: ({ className }: { className: string }) => (
      <div className={`${className} bg-green-500 rounded flex items-center justify-center text-white font-bold text-xs`}>
        GA
      </div>
    ),
    costStructure: 'pay_as_you_go',
    pricing: {
      cost_per_request: 0.001
    },
    currentUsage: 45230,
    monthlyLimit: 1000000,
    costThisMonth: 45.23,
    projectedMonthlyCost: 67.85,
    lastUpdated: '2025-01-09T14:20:00Z',
    status: 'warning',
    optimization_suggestions: [
      'Usage is 35% higher than last month',
      'Consider implementing request caching',
      'Review automated campaign optimizations'
    ]
  },
  {
    id: 'facebook_ads',
    name: 'Meta Ads',
    category: 'ads',
    icon: ({ className }: { className: string }) => (
      <div className={`${className} bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs`}>
        FB
      </div>
    ),
    costStructure: 'monthly_quota',
    pricing: {
      monthly_base: 50,
      free_tier: 10000
    },
    currentUsage: 18750,
    monthlyLimit: 50000,
    costThisMonth: 50.00,
    projectedMonthlyCost: 50.00,
    lastUpdated: '2025-01-09T14:15:00Z',
    status: 'healthy',
    optimization_suggestions: [
      'Well within monthly limits',
      'Consider upgrading for advanced features'
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    icon: ({ className }: { className: string }) => (
      <div className={`${className} bg-purple-500 rounded flex items-center justify-center text-white font-bold text-xs`}>
        SL
      </div>
    ),
    costStructure: 'per_request',
    pricing: {
      free_tier: 1000,
      cost_per_request: 0.0001
    },
    currentUsage: 2340,
    monthlyLimit: 10000,
    costThisMonth: 0.13,
    projectedMonthlyCost: 0.20,
    lastUpdated: '2025-01-09T14:10:00Z',
    status: 'healthy',
    optimization_suggestions: [
      'Very efficient usage pattern',
      'Consider increasing notification frequency for better team communication'
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'financial',
    icon: ({ className }: { className: string }) => (
      <div className={`${className} bg-indigo-500 rounded flex items-center justify-center text-white font-bold text-xs`}>
        ST
      </div>
    ),
    costStructure: 'per_request',
    pricing: {
      cost_per_request: 0.005
    },
    currentUsage: 1250,
    monthlyLimit: 50000,
    costThisMonth: 6.25,
    projectedMonthlyCost: 9.38,
    lastUpdated: '2025-01-09T14:05:00Z',
    status: 'healthy',
    optimization_suggestions: [
      'Payment processing is efficient',
      'Monitor transaction volume growth'
    ]
  }
];

const COST_ALERTS: CostOptimizationAlert[] = [
  {
    id: 'alert_1',
    service: 'Google Ads',
    type: 'cost_spike',
    severity: 'medium',
    message: 'API costs increased by 35% this month',
    impact: 22.62,
    recommendation: 'Review automated campaign optimizations and implement request caching',
    createdAt: '2025-01-09T08:00:00Z'
  },
  {
    id: 'alert_2',
    service: 'SendGrid',
    type: 'optimization_opportunity',
    severity: 'low',
    message: 'Upgrade to next tier for better cost efficiency',
    impact: -5.50,
    recommendation: 'Current cost per email: $0.0005. Next tier: $0.0003 per email',
    createdAt: '2025-01-08T16:30:00Z'
  },
  {
    id: 'alert_3',
    service: 'HubSpot CRM',
    type: 'approaching_limit',
    severity: 'low',
    message: 'Monthly API usage is at 8.5% of limit',
    impact: 0,
    recommendation: 'No action needed, usage is within normal parameters',
    createdAt: '2025-01-07T12:15:00Z'
  }
];

const ApiCostTracker: React.FC<ApiCostTrackerProps> = ({ timeRange, onTimeRangeChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [alertFilter, setAlertFilter] = useState<string>('all');
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(API_SERVICES.map(service => service.category)));
    return ['all', ...cats];
  }, []);

  const filteredServices = useMemo(() => {
    return API_SERVICES.filter(service => 
      selectedCategory === 'all' || service.category === selectedCategory
    );
  }, [selectedCategory]);

  const filteredAlerts = useMemo(() => {
    return COST_ALERTS.filter(alert => 
      alertFilter === 'all' || alert.severity === alertFilter
    );
  }, [alertFilter]);

  const totalCostThisMonth = useMemo(() => {
    return filteredServices.reduce((sum, service) => sum + service.costThisMonth, 0);
  }, [filteredServices]);

  const projectedTotalCost = useMemo(() => {
    return filteredServices.reduce((sum, service) => sum + service.projectedMonthlyCost, 0);
  }, [filteredServices]);

  const costTrend = useMemo(() => {
    const change = ((projectedTotalCost - totalCostThisMonth) / totalCostThisMonth) * 100;
    return { change, isPositive: change > 0 };
  }, [totalCostThisMonth, projectedTotalCost]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
      default: return Clock;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 dark:bg-blue-900 text-blue-300 dark:text-blue-200';
      case 'medium': return 'bg-yellow-900/50 dark:bg-yellow-900 text-yellow-300 dark:text-yellow-200';
      case 'high': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 'critical': return 'bg-red-900/50 dark:bg-red-900 text-red-300 dark:text-red-200';
      default: return 'bg-gray-800/50 dark:bg-gray-700 text-gray-300 dark:text-gray-200';
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  const formatUsagePercent = (current: number, limit: number) => 
    Math.round((current / limit) * 100);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            API Cost Optimization
          </h2>
          <p className="text-gray-400">
            Track and optimize API costs across all automation platforms with real-time monitoring.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as any)}
            className="px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Cost Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-400 mb-1">Current Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalCostThisMonth)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-400 mb-1">Projected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(projectedTotalCost)}
              </p>
              <div className={`flex items-center text-sm ${costTrend.isPositive ? 'text-red-600' : 'text-green-600'} mt-1`}>
                {costTrend.isPositive ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                <span>{Math.abs(costTrend.change).toFixed(1)}% vs current</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-400 mb-1">Active Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredServices.length}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {filteredServices.filter(s => s.status === 'healthy').length} healthy
              </p>
            </div>
            <div className="p-3 bg-green-900/50 dark:bg-green-900 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-400 mb-1">Optimization Savings</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(8.75)}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
                Potential monthly
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-700 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
              Alert Severity
            </label>
            <select
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Services List */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            API Services ({filteredServices.length})
          </h3>
          
          <div className="space-y-3">
            <AnimatePresence>
              {filteredServices.map((service) => {
                const ServiceIcon = service.icon;
                const StatusIcon = getStatusIcon(service.status);
                const isExpanded = expandedService === service.id;
                const usagePercent = formatUsagePercent(service.currentUsage, service.monthlyLimit);
                
                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-700 dark:border-gray-700 overflow-hidden"
                  >
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setExpandedService(isExpanded ? null : service.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <ServiceIcon className="w-8 h-8" />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {service.name}
                            </h4>
                            <p className="text-sm text-gray-400 dark:text-gray-400">
                              {service.costStructure.replace(/_/g, ' ')} • {service.category}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(service.costThisMonth)}
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-400">
                              {usagePercent}% used
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={`w-5 h-5 ${getStatusColor(service.status)}`} />
                            {isExpanded ? (
                              <Minimize2 className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Maximize2 className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Usage Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              usagePercent > 80 ? 'bg-red-900/200' :
                              usagePercent > 60 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-400 mt-1">
                          <span>{service.currentUsage.toLocaleString()} requests</span>
                          <span>{service.monthlyLimit.toLocaleString()} limit</span>
                        </div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-700 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50"
                        >
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-300 dark:text-gray-300">Projected Monthly Cost</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(service.projectedMonthlyCost)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-300 dark:text-gray-300">Last Updated</p>
                              <p className="text-sm text-gray-400 dark:text-gray-400">
                                {new Date(service.lastUpdated).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          {service.optimization_suggestions.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
                                Optimization Suggestions
                              </p>
                              <ul className="space-y-1">
                                {service.optimization_suggestions.map((suggestion, index) => (
                                  <li key={index} className="text-sm text-gray-400 dark:text-gray-400 flex items-start">
                                    <span className="w-1 h-1 bg-blue-900/200 rounded-full mt-2 mr-2 flex-shrink-0" />
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Alerts & Optimization */}
        <div className="space-y-6">
          {/* Cost Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-700 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cost Alerts
              </h3>
              <span className="px-2 py-1 text-xs bg-red-900/50 dark:bg-red-900 text-red-300 dark:text-red-200 rounded-full">
                {filteredAlerts.length} active
              </span>
            </div>
            
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="p-3 border border-gray-700 dark:border-gray-600 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.service}
                      </span>
                    </div>
                    {alert.impact !== 0 && (
                      <span className={`text-sm font-medium ${alert.impact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {alert.impact > 0 ? '+' : ''}{formatCurrency(alert.impact)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 dark:text-gray-200 mb-2">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-400">
                    {alert.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-700 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <button className="w-full p-3 text-left border border-gray-700 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Set Budget Alerts
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-400">
                      Configure automatic alerts for cost thresholds
                    </p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left border border-gray-700 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Export Cost Report
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-400">
                      Download detailed cost analysis
                    </p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left border border-gray-700 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      View Trends
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-400">
                      Analyze cost patterns over time
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiCostTracker;