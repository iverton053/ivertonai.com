import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Zap, TrendingUp, TrendingDown, Target, DollarSign, Clock,
  AlertTriangle, CheckCircle, XCircle, Play, Pause, Settings,
  Plus, Edit, Trash2, Copy, RotateCcw, Activity, Brain, Lightbulb,
  BarChart3, PieChart, LineChart, Users, Eye, MousePointer,
  ShoppingCart, Calendar, ArrowRight, ArrowUp, ArrowDown,
  Filter, Search, RefreshCw, Download, Bell, Star, Flag,
  Layers, Gauge, Shield, Wifi, WifiOff, Power, PowerOff,
  ChevronRight, ChevronDown, Info, ExternalLink, Award,
  Smartphone, Monitor, MapPin, Globe, Heart, Share2, MessageSquare
} from 'lucide-react';

interface AutomatedOptimizationProps {
  campaignId?: string;
  onRuleCreated?: (rule: OptimizationRule) => void;
  onRuleUpdated?: (rule: OptimizationRule) => void;
}

interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  type: 'budget' | 'bid' | 'audience' | 'creative' | 'placement' | 'schedule' | 'performance';
  status: 'active' | 'paused' | 'draft';
  priority: 'high' | 'medium' | 'low';
  trigger: RuleTrigger;
  actions: RuleAction[];
  conditions: RuleCondition[];
  schedule: RuleSchedule;
  performance: RulePerformance;
  lastTriggered?: string;
  timesTriggered: number;
  created: string;
  updated: string;
}

interface RuleTrigger {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'between';
  value: number;
  timeframe: string;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

interface RuleAction {
  type: 'increase_budget' | 'decrease_budget' | 'pause_campaign' | 'increase_bid' | 'decrease_bid' |
        'rotate_creative' | 'exclude_placement' | 'expand_audience' | 'restrict_audience' | 'notify';
  value?: number;
  parameters?: any;
}

interface RuleCondition {
  field: string;
  operator: string;
  value: any;
}

interface RuleSchedule {
  enabled: boolean;
  days: string[];
  hours: { start: number; end: number };
  timezone: string;
}

interface RulePerformance {
  successRate: number;
  totalTriggers: number;
  avgImpact: number;
  lastImpact: number;
  totalSavings: number;
  totalGains: number;
}

interface OptimizationInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  metric: string;
  currentValue: number;
  potentialValue: number;
  estimatedImpact: string;
  actions: string[];
  priority: number;
  created: string;
}

const AutomatedOptimization: React.FC<AutomatedOptimizationProps> = ({
  campaignId,
  onRuleCreated,
  onRuleUpdated
}) => {
  const [activeTab, setActiveTab] = useState('rules');
  const [rules, setRules] = useState<OptimizationRule[]>([]);
  const [insights, setInsights] = useState<OptimizationInsight[]>([]);
  const [selectedRule, setSelectedRule] = useState<OptimizationRule | null>(null);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockRules: OptimizationRule[] = [
      {
        id: 'rule_1',
        name: 'Budget Boost for High Performers',
        description: 'Automatically increase budget for campaigns with ROAS above 4.0',
        type: 'budget',
        status: 'active',
        priority: 'high',
        trigger: {
          metric: 'roas',
          operator: 'greater_than',
          value: 4.0,
          timeframe: '24h',
          frequency: 'daily'
        },
        actions: [
          {
            type: 'increase_budget',
            value: 20,
            parameters: { max_increase: 500 }
          }
        ],
        conditions: [
          {
            field: 'status',
            operator: 'equals',
            value: 'active'
          }
        ],
        schedule: {
          enabled: true,
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          hours: { start: 9, end: 17 },
          timezone: 'UTC'
        },
        performance: {
          successRate: 87,
          totalTriggers: 23,
          avgImpact: 15.2,
          lastImpact: 18.5,
          totalSavings: 0,
          totalGains: 2840
        },
        lastTriggered: '2024-12-08T14:30:00Z',
        timesTriggered: 23,
        created: '2024-11-15T10:00:00Z',
        updated: '2024-12-01T16:22:00Z'
      },
      {
        id: 'rule_2',
        name: 'Pause Underperforming Campaigns',
        description: 'Pause campaigns with CPA above $15 and low conversion volume',
        type: 'performance',
        status: 'active',
        priority: 'high',
        trigger: {
          metric: 'cpa',
          operator: 'greater_than',
          value: 15,
          timeframe: '48h',
          frequency: 'daily'
        },
        actions: [
          {
            type: 'pause_campaign',
            parameters: { notification: true }
          }
        ],
        conditions: [
          {
            field: 'conversions',
            operator: 'less_than',
            value: 5
          }
        ],
        schedule: {
          enabled: true,
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          hours: { start: 0, end: 23 },
          timezone: 'UTC'
        },
        performance: {
          successRate: 92,
          totalTriggers: 8,
          avgImpact: -12.8,
          lastImpact: -15.2,
          totalSavings: 1250,
          totalGains: 0
        },
        lastTriggered: '2024-12-06T09:15:00Z',
        timesTriggered: 8,
        created: '2024-11-20T14:30:00Z',
        updated: '2024-11-28T11:45:00Z'
      },
      {
        id: 'rule_3',
        name: 'Creative Rotation Optimization',
        description: 'Rotate creatives when CTR drops below 2.5%',
        type: 'creative',
        status: 'active',
        priority: 'medium',
        trigger: {
          metric: 'ctr',
          operator: 'less_than',
          value: 2.5,
          timeframe: '72h',
          frequency: 'daily'
        },
        actions: [
          {
            type: 'rotate_creative',
            parameters: { exclude_current: true, test_duration: '7d' }
          }
        ],
        conditions: [
          {
            field: 'impressions',
            operator: 'greater_than',
            value: 10000
          }
        ],
        schedule: {
          enabled: true,
          days: ['monday', 'wednesday', 'friday'],
          hours: { start: 10, end: 16 },
          timezone: 'UTC'
        },
        performance: {
          successRate: 73,
          totalTriggers: 12,
          avgImpact: 8.7,
          lastImpact: 11.2,
          totalSavings: 0,
          totalGains: 890
        },
        lastTriggered: '2024-12-04T13:20:00Z',
        timesTriggered: 12,
        created: '2024-11-18T12:15:00Z',
        updated: '2024-12-02T10:30:00Z'
      },
      {
        id: 'rule_4',
        name: 'Bid Adjustment for Mobile',
        description: 'Increase mobile bids by 15% when mobile CTR exceeds desktop by 20%',
        type: 'bid',
        status: 'paused',
        priority: 'low',
        trigger: {
          metric: 'mobile_ctr_advantage',
          operator: 'greater_than',
          value: 20,
          timeframe: '24h',
          frequency: 'hourly'
        },
        actions: [
          {
            type: 'increase_bid',
            value: 15,
            parameters: { device_type: 'mobile', max_bid: 2.0 }
          }
        ],
        conditions: [
          {
            field: 'mobile_impressions',
            operator: 'greater_than',
            value: 5000
          }
        ],
        schedule: {
          enabled: false,
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          hours: { start: 9, end: 21 },
          timezone: 'UTC'
        },
        performance: {
          successRate: 65,
          totalTriggers: 5,
          avgImpact: 3.2,
          lastImpact: 2.8,
          totalSavings: 0,
          totalGains: 180
        },
        timesTriggered: 5,
        created: '2024-11-22T16:00:00Z',
        updated: '2024-12-01T09:15:00Z'
      }
    ];

    const mockInsights: OptimizationInsight[] = [
      {
        id: 'insight_1',
        type: 'opportunity',
        title: 'Increase Budget for Holiday Campaign',
        description: 'Your Holiday Sale campaign is significantly outperforming target ROAS and could benefit from increased budget allocation.',
        impact: 'high',
        category: 'Budget Optimization',
        metric: 'ROAS',
        currentValue: 5.2,
        potentialValue: 5.8,
        estimatedImpact: '+$2,400 monthly revenue',
        actions: [
          'Increase daily budget by 30%',
          'Monitor performance for 7 days',
          'Set up automated rule for future scaling'
        ],
        priority: 1,
        created: '2024-12-08T09:30:00Z'
      },
      {
        id: 'insight_2',
        type: 'warning',
        title: 'High CPA in Brand Awareness Campaign',
        description: 'Brand Awareness Q4 campaign has seen a 40% increase in CPA over the past 3 days, indicating potential audience fatigue.',
        impact: 'high',
        category: 'Performance Alert',
        metric: 'CPA',
        currentValue: 12.5,
        potentialValue: 8.9,
        estimatedImpact: '-$890 monthly waste',
        actions: [
          'Refresh creative assets',
          'Expand target audience',
          'Reduce frequency cap',
          'Consider campaign pause'
        ],
        priority: 2,
        created: '2024-12-07T14:45:00Z'
      },
      {
        id: 'insight_3',
        type: 'recommendation',
        title: 'Optimize Mobile Bid Strategy',
        description: 'Mobile traffic is converting 25% better than desktop but receiving lower bid priority. Adjusting mobile bids could improve overall performance.',
        impact: 'medium',
        category: 'Bid Optimization',
        metric: 'Mobile Conversion Rate',
        currentValue: 3.2,
        potentialValue: 4.1,
        estimatedImpact: '+$1,200 monthly conversions',
        actions: [
          'Increase mobile bid adjustments by 20%',
          'Test mobile-specific ad creatives',
          'Optimize landing pages for mobile'
        ],
        priority: 3,
        created: '2024-12-06T11:20:00Z'
      },
      {
        id: 'insight_4',
        type: 'opportunity',
        title: 'Expand High-Performing Audience Segment',
        description: 'The 25-34 age demographic is showing exceptional performance. Consider creating dedicated campaigns for this segment.',
        impact: 'medium',
        category: 'Audience Optimization',
        metric: 'Audience Performance',
        currentValue: 4.8,
        potentialValue: 6.2,
        estimatedImpact: '+$950 monthly revenue',
        actions: [
          'Create dedicated campaign for 25-34 demographic',
          'Increase budget allocation to this segment',
          'Develop age-specific creative content'
        ],
        priority: 4,
        created: '2024-12-05T16:10:00Z'
      }
    ];

    setRules(mockRules);
    setInsights(mockInsights);
    if (mockRules.length > 0) {
      setSelectedRule(mockRules[0]);
    }
  }, []);

  const runOptimization = async () => {
    setIsOptimizing(true);

    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update some rules as if they were triggered
    setRules(prev => prev.map(rule => {
      if (rule.status === 'active' && Math.random() > 0.7) {
        return {
          ...rule,
          lastTriggered: new Date().toISOString(),
          timesTriggered: rule.timesTriggered + 1,
          performance: {
            ...rule.performance,
            totalTriggers: rule.performance.totalTriggers + 1,
            lastImpact: Math.random() * 20 - 10 // -10 to +10
          }
        };
      }
      return rule;
    }));

    setIsOptimizing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-purple-400 bg-purple-900/30 border border-purple-500/30';
      case 'paused': return 'text-gray-400 bg-gray-900/30 border border-gray-500/30';
      case 'draft': return 'text-gray-400 bg-gray-800/50 border border-gray-600/30';
      default: return 'text-gray-400 bg-gray-800/50 border border-gray-600/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/30 border border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-900/30 border border-blue-500/30';
      default: return 'text-gray-400 bg-gray-800/50 border border-gray-600/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return DollarSign;
      case 'bid': return Target;
      case 'audience': return Users;
      case 'creative': return Edit;
      case 'placement': return MapPin;
      case 'schedule': return Clock;
      case 'performance': return TrendingUp;
      default: return Settings;
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return TrendingUp;
      case 'warning': return AlertTriangle;
      case 'recommendation': return Lightbulb;
      default: return Info;
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-green-400 bg-green-900/30 border border-green-500/30';
      case 'warning': return 'text-red-400 bg-red-900/30 border border-red-500/30';
      case 'recommendation': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'text-gray-400 bg-gray-800/50 border border-gray-600/30';
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const filteredRules = rules
    .filter(rule => rule.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(rule => filterStatus === 'all' || rule.status === filterStatus)
    .filter(rule => filterType === 'all' || rule.type === filterType);

  const tabs = [
    { id: 'rules', name: 'Automation Rules', icon: Bot },
    { id: 'insights', name: 'Smart Insights', icon: Lightbulb },
    { id: 'performance', name: 'Performance', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-500" />
            Automated Optimization
          </h2>
          <p className="text-gray-400 mt-1">
            AI-powered campaign optimization and automated performance management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runOptimization}
            disabled={isOptimizing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isOptimizing
                ? 'bg-purple-100 text-purple-600 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run Optimization
              </>
            )}
          </button>
          <button
            onClick={() => setShowCreateRule(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Rule
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Rules</p>
              <p className="text-2xl font-bold text-white">
                {rules.filter(r => r.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Savings</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(rules.reduce((acc, r) => acc + r.performance.totalSavings, 0))}
              </p>
            </div>
            <div className="p-3 bg-green-900/30 rounded-lg border border-green-500/30">
              <TrendingDown className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Gains</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(rules.reduce((acc, r) => acc + r.performance.totalGains, 0))}
              </p>
            </div>
            <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Success Rate</p>
              <p className="text-2xl font-bold text-purple-400">
                {Math.round(rules.reduce((acc, r) => acc + r.performance.successRate, 0) / rules.length)}%
              </p>
            </div>
            <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-purple-500/20">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search rules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                >
                  <option value="all">All Types</option>
                  <option value="budget">Budget</option>
                  <option value="bid">Bid</option>
                  <option value="audience">Audience</option>
                  <option value="creative">Creative</option>
                  <option value="performance">Performance</option>
                </select>
              </div>

              {/* Rules List */}
              <div className="space-y-4">
                {filteredRules.map((rule) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-lg p-6 hover:bg-gray-800/30 transition-all cursor-pointer"
                    onClick={() => setSelectedRule(rule)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-500/30">
                          {React.createElement(getTypeIcon(rule.type), {
                            className: "w-5 h-5 text-purple-400"
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">
                              {rule.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(rule.status)}`}>
                              {rule.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(rule.priority)}`}>
                              {rule.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">
                            {rule.description}
                          </p>

                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <Activity className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">
                                {rule.performance.successRate}% success rate
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">
                                Triggered {rule.timesTriggered} times
                              </span>
                            </div>
                            {rule.lastTriggered && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-400">
                                  Last: {new Date(rule.lastTriggered).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {rule.status === 'active' && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-400">
                              Active
                            </span>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {insights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getInsightTypeColor(insight.type)}`}>
                        {React.createElement(getInsightTypeIcon(insight.type), {
                          className: "w-5 h-5"
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">
                            {insight.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            insight.impact === 'high'
                              ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                              : insight.impact === 'medium'
                              ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                              : 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                          }`}>
                            {insight.impact} impact
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          {insight.description}
                        </p>

                        <div className="flex items-center gap-6 text-sm mb-4">
                          <div>
                            <span className="text-gray-400">Current: </span>
                            <span className="font-medium text-white">
                              {insight.currentValue}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-gray-400">Potential: </span>
                            <span className="font-medium text-green-400">
                              {insight.potentialValue}
                            </span>
                          </div>
                          <div className="ml-auto">
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                              {insight.estimatedImpact}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-white mb-2">
                            Recommended Actions:
                          </h4>
                          <ul className="space-y-1">
                            {insight.actions.map((action, index) => (
                              <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
                                <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{insight.category}</span>
                      <span>•</span>
                      <span>{new Date(insight.created).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors">
                        Create Rule
                      </button>
                      <button className="px-3 py-1 text-sm bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-600/30">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rule Performance Metrics */}
              <div className="glass-effect rounded-lg p-6">
                <h3 className="font-semibold text-white text-lg mb-6">
                  Rule Performance Overview
                </h3>
                <div className="space-y-4">
                  {rules.filter(r => r.status === 'active').map((rule) => (
                    <div key={rule.id} className="p-3 bg-gray-800/50 border border-gray-600/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white text-sm">
                          {rule.name}
                        </span>
                        <span className="text-sm text-gray-400">
                          {rule.performance.successRate}% success
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${rule.performance.successRate}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Triggers: {rule.performance.totalTriggers}</span>
                        <span>Impact: {rule.performance.avgImpact > 0 ? '+' : ''}{rule.performance.avgImpact.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimization Impact */}
              <div className="glass-effect rounded-lg p-6">
                <h3 className="font-semibold text-white text-lg mb-6">
                  Optimization Impact
                </h3>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      {formatCurrency(rules.reduce((acc, r) => acc + r.performance.totalGains + r.performance.totalSavings, 0))}
                    </div>
                    <div className="text-sm text-gray-400">
                      Total Value Generated
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-900/30 border border-green-500/30 rounded-lg">
                      <div className="text-xl font-bold text-green-400">
                        {formatCurrency(rules.reduce((acc, r) => acc + r.performance.totalGains, 0))}
                      </div>
                      <div className="text-xs text-green-400">
                        Revenue Gains
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                      <div className="text-xl font-bold text-blue-400">
                        {formatCurrency(rules.reduce((acc, r) => acc + r.performance.totalSavings, 0))}
                      </div>
                      <div className="text-xs text-blue-400">
                        Cost Savings
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Overall Efficiency</span>
                      <span className="font-medium text-white">
                        {Math.round(rules.reduce((acc, r) => acc + r.performance.successRate, 0) / rules.length)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(rules.reduce((acc, r) => acc + r.performance.successRate, 0) / rules.length)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="glass-effect rounded-lg p-6">
                <h3 className="font-semibold text-white text-lg mb-6">
                  Optimization Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-medium text-white">
                          Enable Automatic Optimization
                        </div>
                        <div className="text-sm text-gray-400">
                          Allow the system to automatically apply optimization rules
                        </div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-medium text-white">
                          Send Optimization Notifications
                        </div>
                        <div className="text-sm text-gray-400">
                          Receive alerts when rules are triggered or insights are generated
                        </div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-medium text-white">
                          Conservative Mode
                        </div>
                        <div className="text-sm text-gray-400">
                          Require manual approval for high-impact optimizations
                        </div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Budget Change Per Rule (%)
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white">
                      <option value="10">10%</option>
                      <option value="20">20%</option>
                      <option value="30">30%</option>
                      <option value="50">50%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Optimization Frequency
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white">
                      <option value="hourly">Every Hour</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AutomatedOptimization;