import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TestTube, BarChart3, TrendingUp, TrendingDown, Zap, Clock,
  Target, Users, DollarSign, Eye, MousePointer, ShoppingCart,
  Heart, Share2, MessageSquare, Award, AlertTriangle, CheckCircle,
  XCircle, Play, Pause, Square, RotateCcw, Settings, Filter,
  Plus, Search, Calendar, Percent, ArrowRight, ArrowDown, ArrowUp,
  Info, ExternalLink, Download, Upload, Copy, Edit, Trash2,
  PieChart, LineChart, Activity, Lightbulb, Flag, Star
} from 'lucide-react';

interface ABTestingManagerProps {
  campaignId?: string;
  onTestComplete?: (testData: ABTestData) => void;
}

interface ABTestData {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'stopped';
  type: 'ad_creative' | 'audience' | 'placement' | 'bid_strategy' | 'landing_page' | 'ad_copy';
  objective: string;
  startDate: string;
  endDate?: string;
  duration: number;
  budget: number;
  confidenceLevel: number;
  significance: number;
  variations: TestVariation[];
  metrics: TestMetrics;
  results?: TestResults;
  recommendations?: string[];
}

interface TestVariation {
  id: string;
  name: string;
  description: string;
  traffic: number;
  isControl: boolean;
  status: 'active' | 'inactive';
  configuration: any;
}

interface TestMetrics {
  primaryMetric: string;
  secondaryMetrics: string[];
  conversionGoals: ConversionGoal[];
}

interface ConversionGoal {
  id: string;
  name: string;
  type: 'click' | 'conversion' | 'purchase' | 'signup' | 'view' | 'engagement';
  value?: number;
  weight: number;
}

interface TestResults {
  duration: number;
  impressions: { [key: string]: number };
  clicks: { [key: string]: number };
  conversions: { [key: string]: number };
  cost: { [key: string]: number };
  ctr: { [key: string]: number };
  cpc: { [key: string]: number };
  cpa: { [key: string]: number };
  roas: { [key: string]: number };
  winner?: string;
  winnerLift: number;
  statisticalSignificance: boolean;
}

const ABTestingManager: React.FC<ABTestingManagerProps> = ({
  campaignId,
  onTestComplete
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tests, setTests] = useState<ABTestData[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTestData | null>(null);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_date');

  // Mock data for demonstration
  useEffect(() => {
    const mockTests: ABTestData[] = [
      {
        id: 'test_1',
        name: 'Holiday Campaign Creative Test',
        status: 'running',
        type: 'ad_creative',
        objective: 'conversions',
        startDate: '2024-12-01',
        duration: 14,
        budget: 5000,
        confidenceLevel: 95,
        significance: 78,
        variations: [
          {
            id: 'var_1',
            name: 'Control - Original Creative',
            description: 'Current best-performing creative',
            traffic: 50,
            isControl: true,
            status: 'active',
            configuration: {}
          },
          {
            id: 'var_2',
            name: 'Variant A - Festive Theme',
            description: 'Holiday-themed imagery with red/gold colors',
            traffic: 50,
            isControl: false,
            status: 'active',
            configuration: {}
          }
        ],
        metrics: {
          primaryMetric: 'conversions',
          secondaryMetrics: ['ctr', 'cpc', 'roas'],
          conversionGoals: [
            {
              id: 'goal_1',
              name: 'Purchase',
              type: 'purchase',
              value: 50,
              weight: 1
            }
          ]
        },
        results: {
          duration: 7,
          impressions: { 'var_1': 125000, 'var_2': 127500 },
          clicks: { 'var_1': 3200, 'var_2': 3850 },
          conversions: { 'var_1': 96, 'var_2': 124 },
          cost: { 'var_1': 1800, 'var_2': 1900 },
          ctr: { 'var_1': 2.56, 'var_2': 3.02 },
          cpc: { 'var_1': 0.56, 'var_2': 0.49 },
          cpa: { 'var_1': 18.75, 'var_2': 15.32 },
          roas: { 'var_1': 2.67, 'var_2': 3.26 },
          winner: 'var_2',
          winnerLift: 29.2,
          statisticalSignificance: true
        },
        recommendations: [
          'Variant A shows 29.2% improvement in conversions',
          'Consider implementing festive themes in all holiday campaigns',
          'Test different color schemes for future seasonal campaigns'
        ]
      },
      {
        id: 'test_2',
        name: 'Audience Segmentation Test',
        status: 'completed',
        type: 'audience',
        objective: 'reach',
        startDate: '2024-11-15',
        endDate: '2024-11-29',
        duration: 14,
        budget: 3000,
        confidenceLevel: 95,
        significance: 92,
        variations: [
          {
            id: 'var_3',
            name: 'Broad Audience',
            description: 'Wide demographic targeting',
            traffic: 33.3,
            isControl: true,
            status: 'active',
            configuration: {}
          },
          {
            id: 'var_4',
            name: 'Interest-Based',
            description: 'Targeted based on specific interests',
            traffic: 33.3,
            isControl: false,
            status: 'active',
            configuration: {}
          },
          {
            id: 'var_5',
            name: 'Lookalike Audience',
            description: 'Similar to existing customers',
            traffic: 33.4,
            isControl: false,
            status: 'active',
            configuration: {}
          }
        ],
        metrics: {
          primaryMetric: 'reach',
          secondaryMetrics: ['frequency', 'cpm', 'engagement'],
          conversionGoals: []
        },
        results: {
          duration: 14,
          impressions: { 'var_3': 95000, 'var_4': 78000, 'var_5': 102000 },
          clicks: { 'var_3': 1900, 'var_4': 2100, 'var_5': 2850 },
          conversions: { 'var_3': 38, 'var_4': 63, 'var_5': 89 },
          cost: { 'var_3': 980, 'var_4': 1050, 'var_5': 970 },
          ctr: { 'var_3': 2.0, 'var_4': 2.69, 'var_5': 2.79 },
          cpc: { 'var_3': 0.52, 'var_4': 0.50, 'var_5': 0.34 },
          cpa: { 'var_3': 25.79, 'var_4': 16.67, 'var_5': 10.90 },
          roas: { 'var_3': 1.94, 'var_4': 3.00, 'var_5': 4.59 },
          winner: 'var_5',
          winnerLift: 134.2,
          statisticalSignificance: true
        }
      }
    ];

    setTests(mockTests);
    if (mockTests.length > 0) {
      setSelectedTest(mockTests[0]);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-purple-400 bg-purple-900/30 border border-purple-500/30';
      case 'completed': return 'text-green-400 bg-green-900/30 border border-green-500/30';
      case 'paused': return 'text-gray-400 bg-gray-900/30 border border-gray-500/30';
      case 'draft': return 'text-gray-400 bg-gray-800/50 border border-gray-600/30';
      case 'stopped': return 'text-red-400 bg-red-900/30 border border-red-500/30';
      default: return 'text-gray-400 bg-gray-800/50 border border-gray-600/30';
    }
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'ad_creative': return TestTube;
      case 'audience': return Users;
      case 'placement': return Target;
      case 'bid_strategy': return DollarSign;
      case 'landing_page': return ExternalLink;
      case 'ad_copy': return Edit;
      default: return TestTube;
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'conversions': return ShoppingCart;
      case 'clicks': return MousePointer;
      case 'impressions': return Eye;
      case 'ctr': return Target;
      case 'cpc': return DollarSign;
      case 'cpa': return TrendingDown;
      case 'roas': return TrendingUp;
      case 'reach': return Users;
      case 'engagement': return Heart;
      default: return BarChart3;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  const filteredTests = tests
    .filter(test => test.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(test => filterStatus === 'all' || test.status === filterStatus);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'active', name: 'Active Tests', icon: Play },
    { id: 'results', name: 'Results', icon: Award },
    { id: 'insights', name: 'Insights', icon: Lightbulb }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <TestTube className="w-8 h-8 text-blue-500" />
            A/B Testing Manager
          </h2>
          <p className="text-gray-400 mt-1">
            Design, run, and analyze split tests to optimize campaign performance
          </p>
        </div>
        <button
          onClick={() => setShowCreateTest(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Test
        </button>
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
              <p className="text-sm text-gray-400">Active Tests</p>
              <p className="text-2xl font-bold text-white">
                {tests.filter(t => t.status === 'running').length}
              </p>
            </div>
            <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <Play className="w-6 h-6 text-green-400" />
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
              <p className="text-sm text-gray-400">Completed Tests</p>
              <p className="text-2xl font-bold text-white">
                {tests.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-400" />
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
              <p className="text-sm text-gray-400">Avg. Improvement</p>
              <p className="text-2xl font-bold text-green-400">
                +{((tests.filter(t => t.results?.winnerLift).reduce((acc, t) => acc + (t.results?.winnerLift || 0), 0)) / tests.filter(t => t.results?.winnerLift).length || 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <TrendingUp className="w-6 h-6 text-green-400" />
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
              <p className="text-sm text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(tests.reduce((acc, t) => acc + t.budget, 0))}
              </p>
            </div>
            <div className="p-3 bg-purple-900/30 border border-purple-500/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-400" />
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests..."
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
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Tests List */}
              <div className="space-y-4">
                {filteredTests.map((test) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-lg p-6 hover:bg-gray-800/30 transition-all cursor-pointer"
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-500/30">
                          {React.createElement(getTestTypeIcon(test.type), {
                            className: "w-5 h-5 text-purple-400"
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">
                              {test.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(test.status)}`}>
                              {test.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">
                            {test.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} •
                            {test.variations.length} variations •
                            {test.duration} days •
                            {formatCurrency(test.budget)} budget
                          </p>

                          {test.results && (
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-400">
                                  {formatNumber(Object.values(test.results.impressions).reduce((a, b) => a + b, 0))} impressions
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MousePointer className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-400">
                                  {formatNumber(Object.values(test.results.clicks).reduce((a, b) => a + b, 0))} clicks
                                </span>
                              </div>
                              {test.results.winner && (
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                  <span className="text-green-400 font-medium">
                                    +{test.results.winnerLift.toFixed(1)}% lift
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {test.status === 'running' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-400">
                            {test.significance}% significance
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tests Tab */}
          {activeTab === 'active' && (
            <div className="space-y-6">
              {tests.filter(t => t.status === 'running').map((test) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {test.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-400">
                          Day {test.results?.duration || 0} of {test.duration}
                        </span>
                        <span className="text-sm text-gray-400">
                          {test.significance}% significance
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.results?.statisticalSignificance
                            ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                            : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {test.results?.statisticalSignificance ? 'Significant' : 'Not Significant'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-300">
                        <Pause className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-300">
                        <Square className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-300">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Test Progress</span>
                      <span>{((test.results?.duration || 0) / test.duration * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(test.results?.duration || 0) / test.duration * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Variations Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {test.variations.map((variation) => (
                      <div
                        key={variation.id}
                        className={`p-4 rounded-lg border ${
                          variation.isControl
                            ? 'border-purple-500/30 bg-purple-900/20'
                            : 'border-gray-600/30 bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white">
                            {variation.name}
                            {variation.isControl && (
                              <span className="ml-2 px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded-full border border-purple-500/30">
                                Control
                              </span>
                            )}
                          </h4>
                          <span className="text-sm text-gray-400">
                            {variation.traffic}% traffic
                          </span>
                        </div>

                        {test.results && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Impressions</span>
                              <span className="font-medium text-white">
                                {formatNumber(test.results.impressions[variation.id] || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Clicks</span>
                              <span className="font-medium text-white">
                                {formatNumber(test.results.clicks[variation.id] || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">CTR</span>
                              <span className="font-medium text-white">
                                {formatPercentage(test.results.ctr[variation.id] || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Conversions</span>
                              <span className={`font-medium ${
                                test.results.winner === variation.id
                                  ? 'text-green-400'
                                  : 'text-white'
                              }`}>
                                {test.results.conversions[variation.id] || 0}
                                {test.results.winner === variation.id && (
                                  <span className="ml-2 text-xs">👑 Winner</span>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  {test.recommendations && test.recommendations.length > 0 && (
                    <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-400 mb-2">
                            Recommendations
                          </h4>
                          <ul className="space-y-1 text-sm text-yellow-400">
                            {test.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-yellow-500 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && selectedTest?.results && (
            <div className="space-y-6">
              <div className="glass-effect rounded-lg p-6">
                <h3 className="font-semibold text-white text-lg mb-6">
                  {selectedTest.name} - Test Results
                </h3>

                {/* Winner Announcement */}
                {selectedTest.results.winner && (
                  <div className="mb-6 p-4 bg-green-900/30 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-green-400" />
                      <div>
                        <h4 className="font-medium text-green-400">
                          Test Winner Identified!
                        </h4>
                        <p className="text-sm text-green-400 mt-1">
                          {selectedTest.variations.find(v => v.id === selectedTest.results?.winner)?.name}
                          {' '}shows {selectedTest.results.winnerLift.toFixed(1)}% improvement with{' '}
                          {selectedTest.results.statisticalSignificance ? 'statistical significance' : 'insufficient significance'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metrics Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-4">Performance Metrics</h4>
                    <div className="space-y-4">
                      {['impressions', 'clicks', 'conversions', 'cost'].map((metric) => (
                        <div key={metric} className="p-3 bg-gray-800/50 border border-gray-600/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white capitalize">
                              {metric}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {selectedTest.variations.map((variation) => (
                              <div key={variation.id} className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">
                                  {variation.name}
                                </span>
                                <span className={`text-sm font-medium ${
                                  selectedTest.results?.winner === variation.id
                                    ? 'text-green-400'
                                    : 'text-white'
                                }`}>
                                  {metric === 'cost'
                                    ? formatCurrency((selectedTest.results as any)[metric][variation.id] || 0)
                                    : formatNumber((selectedTest.results as any)[metric][variation.id] || 0)
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-4">Efficiency Metrics</h4>
                    <div className="space-y-4">
                      {['ctr', 'cpc', 'cpa', 'roas'].map((metric) => (
                        <div key={metric} className="p-3 bg-gray-800/50 border border-gray-600/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white uppercase">
                              {metric}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {selectedTest.variations.map((variation) => (
                              <div key={variation.id} className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">
                                  {variation.name}
                                </span>
                                <span className={`text-sm font-medium ${
                                  selectedTest.results?.winner === variation.id
                                    ? 'text-green-400'
                                    : 'text-white'
                                }`}>
                                  {metric === 'ctr'
                                    ? formatPercentage((selectedTest.results as any)[metric][variation.id] || 0)
                                    : metric === 'cpc' || metric === 'cpa'
                                    ? formatCurrency((selectedTest.results as any)[metric][variation.id] || 0)
                                    : `${((selectedTest.results as any)[metric][variation.id] || 0).toFixed(2)}x`
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Performance Summary */}
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-500" />
                    Test Performance Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                      <span className="text-sm text-green-400">Successful Tests</span>
                      <span className="font-medium text-green-400">
                        {tests.filter(t => t.results?.statisticalSignificance).length} / {tests.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                      <span className="text-sm text-blue-400">Average Test Duration</span>
                      <span className="font-medium text-blue-400">
                        {(tests.reduce((acc, t) => acc + t.duration, 0) / tests.length).toFixed(0)} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                      <span className="text-sm text-purple-400">Total Budget Tested</span>
                      <span className="font-medium text-purple-400">
                        {formatCurrency(tests.reduce((acc, t) => acc + t.budget, 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Learnings */}
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Key Learnings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-400">
                          Festive themes increase conversions
                        </p>
                        <p className="text-xs text-yellow-400 mt-1">
                          Holiday-themed creatives showed 29% lift
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                      <Star className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-400">
                          Lookalike audiences outperform broad targeting
                        </p>
                        <p className="text-xs text-green-400 mt-1">
                          134% improvement in ROAS
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                      <Star className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-400">
                          Mobile placement drives higher CTR
                        </p>
                        <p className="text-xs text-blue-400 mt-1">
                          Average 18% higher click-through rate
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass-effect rounded-lg p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Optimization Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-900/30 border border-orange-500/30 rounded-lg">
                    <h4 className="font-medium text-orange-400 mb-2">
                      Creative Testing
                    </h4>
                    <ul className="text-sm text-orange-400 space-y-1">
                      <li>• Test seasonal variations quarterly</li>
                      <li>• A/B test color schemes and imagery</li>
                      <li>• Try video vs static creative formats</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-900/30 border border-green-500/30 rounded-lg">
                    <h4 className="font-medium text-green-400 mb-2">
                      Audience Optimization
                    </h4>
                    <ul className="text-sm text-green-400 space-y-1">
                      <li>• Expand lookalike audience testing</li>
                      <li>• Test interest vs behavior targeting</li>
                      <li>• Experiment with audience exclusions</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                    <h4 className="font-medium text-blue-400 mb-2">
                      Bid Strategy
                    </h4>
                    <ul className="text-sm text-blue-400 space-y-1">
                      <li>• Test target CPA vs maximize conversions</li>
                      <li>• Compare manual vs automated bidding</li>
                      <li>• Test different optimization windows</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                    <h4 className="font-medium text-purple-400 mb-2">
                      Landing Page
                    </h4>
                    <ul className="text-sm text-purple-400 space-y-1">
                      <li>• Test different page layouts</li>
                      <li>• A/B test call-to-action buttons</li>
                      <li>• Optimize for mobile experience</li>
                    </ul>
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

export default ABTestingManager;