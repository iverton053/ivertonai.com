import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TestTube, BarChart3, TrendingUp, TrendingDown, Target, Users,
  Mail, MousePointer, Eye, Clock, Calendar, Play, Pause, Square,
  CheckCircle, XCircle, AlertTriangle, Plus, Edit, Trash2, Copy,
  Settings, Filter, Download, RefreshCw, Award, Zap, Percent,
  ArrowUp, ArrowDown, Activity, PieChart, LineChart, Info,
  ChevronDown, ChevronUp, ExternalLink, Lightbulb, Flag, Search
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart
} from 'recharts';

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'stopped';
  type: 'subject_line' | 'sender_name' | 'content' | 'send_time' | 'preheader';
  campaign_id: string;
  campaign_name: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  duration_hours: number;
  traffic_split: number; // percentage for variant A
  confidence_level: number;
  statistical_significance?: number;
  winner?: 'A' | 'B' | null;
  variants: {
    A: TestVariant;
    B: TestVariant;
  };
  results?: TestResults;
  goals: TestGoal[];
}

interface TestVariant {
  name: string;
  description: string;
  configuration: {
    subject_line?: string;
    sender_name?: string;
    content?: string;
    send_time?: string;
    preheader?: string;
  };
  recipients: number;
  metrics?: {
    sent: number;
    delivered: number;
    opens: number;
    clicks: number;
    conversions: number;
    unsubscribes: number;
    open_rate: number;
    click_rate: number;
    conversion_rate: number;
  };
}

interface TestResults {
  winner: 'A' | 'B' | null;
  confidence: number;
  significance: number;
  lift_percentage: number;
  primary_metric_improvement: number;
  test_duration: number;
  total_participants: number;
  insights: string[];
  recommendations: string[];
}

interface TestGoal {
  id: string;
  name: string;
  metric: 'open_rate' | 'click_rate' | 'conversion_rate' | 'revenue';
  target_value?: number;
  weight: number;
  is_primary: boolean;
}

const ABTestingManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockTests: ABTest[] = [
      {
        id: 'test_1',
        name: 'Subject Line Optimization - Holiday Sale',
        status: 'running',
        type: 'subject_line',
        campaign_id: 'camp_1',
        campaign_name: 'Holiday Sale 2024',
        created_at: '2024-01-10T09:00:00Z',
        started_at: '2024-01-10T10:00:00Z',
        duration_hours: 48,
        traffic_split: 50,
        confidence_level: 95,
        statistical_significance: 78,
        variants: {
          A: {
            name: 'Control - Original',
            description: 'Current subject line',
            configuration: {
              subject_line: '🎄 Holiday Sale - Up to 50% Off Everything!'
            },
            recipients: 5000,
            metrics: {
              sent: 5000,
              delivered: 4850,
              opens: 1164,
              clicks: 186,
              conversions: 28,
              unsubscribes: 12,
              open_rate: 24.0,
              click_rate: 16.0,
              conversion_rate: 15.1
            }
          },
          B: {
            name: 'Variant B - Urgency',
            description: 'Subject line with urgency',
            configuration: {
              subject_line: '⏰ Last 48 Hours: Holiday Sale Ending Soon!'
            },
            recipients: 5000,
            metrics: {
              sent: 5000,
              delivered: 4820,
              opens: 1301,
              clicks: 234,
              conversions: 39,
              unsubscribes: 8,
              open_rate: 27.0,
              click_rate: 18.0,
              conversion_rate: 16.7
            }
          }
        },
        goals: [
          {
            id: 'goal_1',
            name: 'Open Rate',
            metric: 'open_rate',
            target_value: 25,
            weight: 0.6,
            is_primary: true
          },
          {
            id: 'goal_2',
            name: 'Click Rate',
            metric: 'click_rate',
            target_value: 15,
            weight: 0.4,
            is_primary: false
          }
        ]
      },
      {
        id: 'test_2',
        name: 'Send Time Optimization',
        status: 'completed',
        type: 'send_time',
        campaign_id: 'camp_2',
        campaign_name: 'Weekly Newsletter',
        created_at: '2024-01-05T14:00:00Z',
        started_at: '2024-01-05T15:00:00Z',
        ended_at: '2024-01-07T15:00:00Z',
        duration_hours: 48,
        traffic_split: 50,
        confidence_level: 95,
        statistical_significance: 92,
        winner: 'B',
        variants: {
          A: {
            name: 'Morning Send (9 AM)',
            description: 'Send emails at 9 AM',
            configuration: {
              send_time: '09:00'
            },
            recipients: 3000,
            metrics: {
              sent: 3000,
              delivered: 2940,
              opens: 647,
              clicks: 97,
              conversions: 14,
              unsubscribes: 6,
              open_rate: 22.0,
              click_rate: 15.0,
              conversion_rate: 14.4
            }
          },
          B: {
            name: 'Afternoon Send (2 PM)',
            description: 'Send emails at 2 PM',
            configuration: {
              send_time: '14:00'
            },
            recipients: 3000,
            metrics: {
              sent: 3000,
              delivered: 2925,
              opens: 789,
              clicks: 134,
              conversions: 23,
              unsubscribes: 4,
              open_rate: 27.0,
              click_rate: 17.0,
              conversion_rate: 17.2
            }
          }
        },
        results: {
          winner: 'B',
          confidence: 92,
          significance: 92,
          lift_percentage: 22.7,
          primary_metric_improvement: 5.0,
          test_duration: 48,
          total_participants: 6000,
          insights: [
            'Afternoon sends perform 22.7% better than morning sends',
            'Higher engagement during lunch and early afternoon hours',
            'Lower unsubscribe rate with afternoon timing'
          ],
          recommendations: [
            'Switch all newsletter campaigns to 2 PM send time',
            'Test weekend afternoon sends for promotional campaigns',
            'Consider time zone optimization for international audiences'
          ]
        },
        goals: [
          {
            id: 'goal_3',
            name: 'Open Rate',
            metric: 'open_rate',
            weight: 1.0,
            is_primary: true
          }
        ]
      }
    ];

    setTimeout(() => {
      setTests(mockTests);
      setIsLoading(false);
      if (mockTests.length > 0) {
        setSelectedTest(mockTests[0]);
      }
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'completed': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case 'paused': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'draft': return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
      case 'stopped': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subject_line': return Mail;
      case 'sender_name': return Users;
      case 'content': return Edit;
      case 'send_time': return Clock;
      case 'preheader': return Eye;
      default: return TestTube;
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  };

  const filteredTests = tests
    .filter(test => test.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(test => filterStatus === 'all' || test.status === filterStatus);

  const runningTests = tests.filter(t => t.status === 'running');
  const completedTests = tests.filter(t => t.status === 'completed');
  const avgImprovement = completedTests.reduce((acc, t) => acc + (t.results?.lift_percentage || 0), 0) / completedTests.length || 0;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'active', name: 'Active Tests', icon: Play },
    { id: 'results', name: 'Results', icon: Award },
    { id: 'insights', name: 'Insights', icon: Lightbulb }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <TestTube className="w-8 h-8 text-purple-500" />
            A/B Testing Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Design, run, and analyze email A/B tests to optimize campaign performance
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
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
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{runningTests.length}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedTests.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Improvement</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{avgImprovement.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round((completedTests.filter(t => t.winner).length / completedTests.length) * 100 || 0)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                          {React.createElement(getTypeIcon(test.type), {
                            className: "w-5 h-5 text-purple-600 dark:text-purple-400"
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {test.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(test.status)}`}>
                              {test.status}
                            </span>
                            {test.winner && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-medium">
                                Winner: {test.winner}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {test.campaign_name} • {test.type.replace('_', ' ')} • {formatDuration(test.duration_hours)}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Variant A:</span>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {test.variants.A.metrics?.open_rate.toFixed(1)}% open rate
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Variant B:</span>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {test.variants.B.metrics?.open_rate.toFixed(1)}% open rate
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {(test.variants.A.recipients + test.variants.B.recipients).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                              <div className={`font-medium ${test.statistical_significance && test.statistical_significance > 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {test.statistical_significance ? `${test.statistical_significance}%` : 'Calculating...'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {test.status === 'running' && (
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Running
                          </div>
                        )}
                        {test.results?.lift_percentage && (
                          <div className="text-sm">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              +{test.results.lift_percentage.toFixed(1)}% lift
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tests Tab */}
          {activeTab === 'active' && (
            <div className="space-y-6">
              {runningTests.map((test) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                        {test.name}
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Testing: {test.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Started: {test.started_at ? new Date(test.started_at).toLocaleDateString() : 'Not started'}</span>
                        <span>•</span>
                        <span>Duration: {formatDuration(test.duration_hours)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <Pause className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <Square className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Test Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Test Progress</span>
                      <span>
                        {test.statistical_significance ? `${test.statistical_significance}% confidence` : 'Calculating...'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((test.statistical_significance || 0), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Variant Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Variant A */}
                    <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Variant A (Control)
                        </h4>
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {test.traffic_split}% traffic
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Opens:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {test.variants.A.metrics?.opens.toLocaleString()} ({test.variants.A.metrics?.open_rate.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Clicks:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {test.variants.A.metrics?.clicks.toLocaleString()} ({test.variants.A.metrics?.click_rate.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Conversions:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {test.variants.A.metrics?.conversions.toLocaleString()} ({test.variants.A.metrics?.conversion_rate.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Variant B */}
                    <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Variant B (Test)
                        </h4>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {100 - test.traffic_split}% traffic
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Opens:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {test.variants.B.metrics?.opens.toLocaleString()} ({test.variants.B.metrics?.open_rate.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Clicks:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {test.variants.B.metrics?.clicks.toLocaleString()} ({test.variants.B.metrics?.click_rate.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Conversions:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {test.variants.B.metrics?.conversions.toLocaleString()} ({test.variants.B.metrics?.conversion_rate.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      {/* Winner indicator */}
                      {test.variants.B.metrics && test.variants.A.metrics &&
                       test.variants.B.metrics.open_rate > test.variants.A.metrics.open_rate && (
                        <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                          <TrendingUp className="w-4 h-4" />
                          Leading by {((test.variants.B.metrics.open_rate - test.variants.A.metrics.open_rate) / test.variants.A.metrics.open_rate * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && selectedTest?.results && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">
                {selectedTest.name} - Test Results
              </h3>

              {/* Winner Announcement */}
              {selectedTest.results.winner && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-400">
                        Test Winner: Variant {selectedTest.results.winner}
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Achieved {selectedTest.results.lift_percentage.toFixed(1)}% improvement with {selectedTest.results.confidence}% confidence
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    +{selectedTest.results.lift_percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Performance Lift</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedTest.results.confidence}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Confidence Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {selectedTest.results.total_participants.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Participants</div>
                </div>
              </div>

              {/* Insights and Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Key Insights
                  </h4>
                  <ul className="space-y-2">
                    {selectedTest.results.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mt-2"></span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-purple-500" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {selectedTest.results.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-1 h-1 bg-purple-500 rounded-full mt-2"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Type Performance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Test Type Performance
                </h3>
                <div className="space-y-3">
                  {['subject_line', 'send_time', 'content'].map((type, index) => {
                    const typeTests = completedTests.filter(t => t.type === type);
                    const avgLift = typeTests.reduce((acc, t) => acc + (t.results?.lift_percentage || 0), 0) / typeTests.length || 0;

                    return (
                      <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {type.replace('_', ' ')}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            +{avgLift.toFixed(1)}% avg lift
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {typeTests.length} tests
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Success Factors */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Success Factors
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">
                      High-Impact Elements
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Urgency in subject lines (+22-35% open rate)</li>
                      <li>• Afternoon send times (+15-25% engagement)</li>
                      <li>• Personalized sender names (+10-18% trust)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                      Testing Best Practices
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Test one element at a time</li>
                      <li>• Ensure statistical significance (95%+)</li>
                      <li>• Run tests for at least 48 hours</li>
                      <li>• Test with sufficient sample sizes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Create Test Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New A/B Test
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              A/B test creation wizard will be implemented here.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Create Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABTestingManager;