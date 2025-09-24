import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import { format, subDays, subHours, startOfDay, endOfDay } from 'date-fns';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Zap,
  Brain,
  Target,
  DollarSign,
  Clock,
  Filter,
  Download,
  Calendar,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Settings,
  FileText,
  Mail,
  MessageCircle,
  Hash,
  Share2,
  Eye,
  Edit3,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Globe,
  Smartphone,
  Monitor,
  Palette,
  FolderOpen,
  StickyNote,
  Bot
} from 'lucide-react';
import { useHistoryStore } from '../stores/historyStore';
import { useAutomationStore } from '../stores/automationStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useAgencyStore } from '../stores/agencyStore';
import { useNotesStore } from '../stores/notesStore';
import Icon from './Icon';

interface ActivityEvent {
  id: string;
  timestamp: number;
  type: 'automation' | 'workflow' | 'client' | 'content' | 'marketing' | 'system' | 'user_action' | 'ai_generation' | 'note' | 'file';
  category: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  status: 'success' | 'warning' | 'error' | 'info';
  user?: string;
  client?: string;
  duration?: number;
  impact?: 'low' | 'medium' | 'high';
}

interface MetricData {
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

const EnhancedHistory: React.FC = () => {
  const {
    timeSeriesData,
    analyticsMetrics,
    isLoading,
    error,
    selectedDateRange,
    selectedMetrics,
    loadHistoryData,
    setQuickDateRange,
    setSelectedMetrics,
    exportData,
    generateSampleData,
    clearError
  } = useHistoryStore();

  const { workflows } = useAutomationStore();
  const { notifications } = useNotificationStore();
  const { clients } = useAgencyStore();
  const { notes, getRecentNotes, getAnalytics: getNotesAnalytics } = useNotesStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'metrics' | 'automation' | 'reports'>('overview');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'composed'>('line');
  const [showFilters, setShowFilters] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRealTime, setIsRealTime] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadHistoryData(selectedDateRange);
  }, [selectedDateRange, loadHistoryData]);

  // Real-time updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRealTime) {
      interval = setInterval(() => {
        loadHistoryData(selectedDateRange);
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [isRealTime, selectedDateRange, loadHistoryData]);

  // Generate comprehensive activity events from all features
  const activityEvents: ActivityEvent[] = useMemo(() => {
    const events: ActivityEvent[] = [];
    const now = Date.now();

    // Automation events
    workflows.forEach(workflow => {
      events.push({
        id: `workflow-${workflow.id}`,
        timestamp: now - Math.random() * 86400000, // Random within last 24h
        type: 'automation',
        category: 'workflow',
        title: `Workflow: ${workflow.name}`,
        description: `Status: ${workflow.status}`,
        status: workflow.status === 'active' ? 'success' :
               workflow.status === 'error' ? 'error' : 'info',
        metadata: { workflowId: workflow.id, type: workflow.trigger?.type },
        impact: 'medium'
      });
    });

    // Client events
    clients.forEach(client => {
      events.push({
        id: `client-${client.id}`,
        timestamp: now - Math.random() * 172800000, // Random within last 48h
        type: 'client',
        category: 'management',
        title: `Client Activity: ${client.name}`,
        description: `Status: ${client.status}`,
        status: client.status === 'active' ? 'success' : 'info',
        client: client.name,
        impact: 'high'
      });
    });

    // Notes events
    const recentNotes = getRecentNotes(10);
    recentNotes.forEach(note => {
      events.push({
        id: `note-${note.id}`,
        timestamp: new Date(note.updatedAt).getTime(),
        type: 'note',
        category: 'content',
        title: `Note: ${note.title || 'Untitled'}`,
        description: `${note.content.substring(0, 100)}...`,
        status: 'info',
        metadata: { noteId: note.id, type: note.type },
        impact: 'low'
      });
    });

    // AI Generation events (mock data for now)
    const aiGenerations = [
      { type: 'landing-page', title: 'Landing Page Generated', count: 12 },
      { type: 'ad-copy', title: 'Ad Copy Generated', count: 8 },
      { type: 'seo-content', title: 'SEO Content Generated', count: 5 },
      { type: 'email-template', title: 'Email Template Generated', count: 15 }
    ];

    aiGenerations.forEach((gen, index) => {
      events.push({
        id: `ai-${gen.type}-${index}`,
        timestamp: now - Math.random() * 604800000, // Random within last week
        type: 'ai_generation',
        category: 'ai',
        title: gen.title,
        description: `Generated ${gen.count} pieces of content`,
        status: 'success',
        metadata: { type: gen.type, count: gen.count },
        impact: 'high'
      });
    });

    // System events
    const systemEvents = [
      { title: 'Data Export Completed', desc: 'Weekly analytics report generated' },
      { title: 'Backup Created', desc: 'Automated system backup completed' },
      { title: 'Integration Sync', desc: 'API integrations synchronized' },
      { title: 'Performance Optimization', desc: 'Database optimization completed' }
    ];

    systemEvents.forEach((evt, index) => {
      events.push({
        id: `system-${index}`,
        timestamp: now - Math.random() * 432000000, // Random within last 5 days
        type: 'system',
        category: 'maintenance',
        title: evt.title,
        description: evt.desc,
        status: 'success',
        impact: 'medium'
      });
    });

    // Sort by timestamp (most recent first)
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, [workflows, clients, getRecentNotes]);

  // Enhanced metrics data
  const enhancedMetrics: MetricData[] = useMemo(() => {
    const notesAnalytics = getNotesAnalytics();

    return [
      {
        name: 'Total Workflows',
        value: workflows.length,
        change: 12.5,
        changeType: 'increase',
        unit: '',
        description: 'Active automation workflows',
        category: 'automation',
        icon: 'Zap',
        color: '#8B5CF6'
      },
      {
        name: 'Active Clients',
        value: clients.filter(c => c.status === 'active').length,
        change: 8.3,
        changeType: 'increase',
        unit: '',
        description: 'Currently active clients',
        category: 'business',
        icon: 'Users',
        color: '#06B6D4'
      },
      {
        name: 'AI Generations',
        value: 156,
        change: 23.7,
        changeType: 'increase',
        unit: '',
        description: 'AI-generated content pieces',
        category: 'ai',
        icon: 'Brain',
        color: '#10B981'
      },
      {
        name: 'Success Rate',
        value: 94.2,
        change: 2.1,
        changeType: 'increase',
        unit: '%',
        description: 'Overall automation success rate',
        category: 'performance',
        icon: 'TrendingUp',
        color: '#F59E0B'
      },
      {
        name: 'Notes Created',
        value: notesAnalytics.totalNotes,
        change: 15.4,
        changeType: 'increase',
        unit: '',
        description: 'Total sticky notes created',
        category: 'productivity',
        icon: 'StickyNote',
        color: '#EF4444'
      },
      {
        name: 'Tasks Completed',
        value: notesAnalytics.completedTasks,
        change: 18.9,
        changeType: 'increase',
        unit: '',
        description: 'Completed tasks from notes',
        category: 'productivity',
        icon: 'CheckCircle',
        color: '#8B5CF6'
      },
      {
        name: 'Revenue Impact',
        value: 48500,
        change: 31.2,
        changeType: 'increase',
        unit: '$',
        description: 'Estimated revenue from automations',
        category: 'financial',
        icon: 'DollarSign',
        color: '#10B981'
      },
      {
        name: 'Time Saved',
        value: 142,
        change: 7.6,
        changeType: 'increase',
        unit: 'hrs',
        description: 'Hours saved through automation',
        category: 'efficiency',
        icon: 'Clock',
        color: '#06B6D4'
      }
    ];
  }, [workflows, clients, getNotesAnalytics]);

  // Filter activities based on selected filters
  const filteredActivities = useMemo(() => {
    let filtered = activityEvents;

    // Apply category filter
    if (activityFilter !== 'all') {
      filtered = filtered.filter(event => event.type === activityFilter);
    }

    // Apply time filter
    const timeLimit = (() => {
      const now = Date.now();
      switch (timeFilter) {
        case '1h': return now - 3600000;
        case '24h': return now - 86400000;
        case '7d': return now - 604800000;
        case '30d': return now - 2592000000;
        default: return 0;
      }
    })();

    filtered = filtered.filter(event => event.timestamp > timeLimit);

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.category.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [activityEvents, activityFilter, timeFilter, searchTerm]);

  // Generate chart data for metrics over time
  const chartData = useMemo(() => {
    const days = 30;
    const data = [];

    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, 'MMM dd'),
        timestamp: date.getTime(),
        workflows: workflows.length + Math.floor(Math.random() * 5),
        clients: clients.length + Math.floor(Math.random() * 3),
        aiGenerations: Math.floor(Math.random() * 20) + 10,
        successRate: 90 + Math.random() * 10,
        revenue: 40000 + Math.random() * 20000,
        timeSaved: 120 + Math.random() * 50
      });
    }

    return data;
  }, [workflows.length, clients.length]);

  // Handle export
  const handleExport = async () => {
    try {
      await exportData({
        format: exportFormat,
        dateRange: selectedDateRange,
        metrics: selectedMetrics,
        includeCharts: exportFormat === 'pdf',
        filename: `enhanced_history_${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`,
        data: {
          metrics: enhancedMetrics,
          activities: filteredActivities,
          chartData
        }
      });
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Get activity type icon
  const getActivityIcon = (type: string, status: string) => {
    const icons = {
      automation: status === 'success' ? 'CheckCircle' : status === 'error' ? 'XCircle' : 'Zap',
      workflow: 'Bot',
      client: 'Users',
      content: 'FileText',
      marketing: 'Target',
      system: 'Settings',
      user_action: 'User',
      ai_generation: 'Brain',
      note: 'StickyNote',
      file: 'FolderOpen'
    };
    return icons[type as keyof typeof icons] || 'Activity';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
      info: 'text-blue-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  // Chart colors
  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Enhanced History & Analytics</h1>
          <p className="text-gray-400">
            Comprehensive tracking of all dashboard activities, automations, and performance metrics
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Real-time toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsRealTime(!isRealTime)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isRealTime
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRealTime ? 'animate-spin' : ''}`} />
            <span>Real-time</span>
          </motion.button>

          {/* Quick date range */}
          <div className="flex gap-2">
            {['1h', '24h', '7d', '30d'].map(range => (
              <motion.button
                key={range}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const now = Date.now();
                  const start = (() => {
                    switch (range) {
                      case '1h': return now - 3600000;
                      case '24h': return now - 86400000;
                      case '7d': return now - 604800000;
                      case '30d': return now - 2592000000;
                      default: return now - 86400000;
                    }
                  })();
                  setQuickDateRange(range as any);
                }}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  timeFilter === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {range}
              </motion.button>
            ))}
          </div>

          {/* Filters */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </motion.button>

          {/* Export */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-2xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Activity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Activity Type</label>
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Activities</option>
                  <option value="automation">Automation</option>
                  <option value="workflow">Workflows</option>
                  <option value="client">Client Management</option>
                  <option value="ai_generation">AI Generation</option>
                  <option value="note">Notes</option>
                  <option value="system">System</option>
                </select>
              </div>

              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>

              {/* Chart Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chart Type</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="composed">Composed Chart</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search activities..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-300 hover:text-red-100 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-effect rounded-2xl p-8 text-center"
        >
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading comprehensive data...</p>
        </motion.div>
      ) : (
        <>
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'activities', label: 'Activity Log', icon: Activity },
              { id: 'metrics', label: 'Performance Metrics', icon: TrendingUp },
              { id: 'automation', label: 'Automation Stats', icon: Bot },
              { id: 'reports', label: 'Reports', icon: FileText }
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {activeTab === 'overview' && (
                <>
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {enhancedMetrics.slice(0, 8).map((metric, index) => (
                      <motion.div
                        key={metric.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-effect rounded-2xl p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${metric.color}20` }}
                          >
                            <Icon
                              name={metric.icon as any}
                              className="w-5 h-5"
                              style={{ color: metric.color }}
                            />
                          </div>
                          <div className="flex items-center text-sm">
                            {metric.changeType === 'increase' ? (
                              <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
                            ) : metric.changeType === 'decrease' ? (
                              <ArrowDown className="w-4 h-4 text-red-400 mr-1" />
                            ) : (
                              <Minus className="w-4 h-4 text-gray-400 mr-1" />
                            )}
                            <span className={
                              metric.changeType === 'increase' ? 'text-green-400' :
                              metric.changeType === 'decrease' ? 'text-red-400' : 'text-gray-400'
                            }>
                              {Math.abs(metric.change).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-1">
                            {metric.name}
                          </h3>
                          <div className="text-2xl font-bold text-white mb-1">
                            {metric.unit === '$' ? '$' : ''}
                            {metric.value.toLocaleString()}
                            {metric.unit !== '$' ? ` ${metric.unit}` : ''}
                          </div>
                          <p className="text-xs text-gray-500">
                            {metric.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Main Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-semibold text-white mb-6">Performance Overview</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'composed' ? (
                          <ComposedChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis yAxisId="left" stroke="#9CA3AF" />
                            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="workflows" fill="#8B5CF6" />
                            <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#10B981" strokeWidth={2} />
                          </ComposedChart>
                        ) : chartType === 'area' ? (
                          <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="aiGenerations" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="workflows" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.3} />
                          </AreaChart>
                        ) : (
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="workflows" stroke="#8B5CF6" strokeWidth={2} />
                            <Line type="monotone" dataKey="aiGenerations" stroke="#10B981" strokeWidth={2} />
                            <Line type="monotone" dataKey="successRate" stroke="#F59E0B" strokeWidth={2} />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </>
              )}

              {activeTab === 'activities' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Recent Activities</h3>
                    <div className="text-sm text-gray-400">
                      {filteredActivities.length} activities found
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredActivities.slice(0, 20).map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start space-x-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${getStatusColor(event.status)} bg-opacity-20`}>
                          <Icon
                            name={getActivityIcon(event.type, event.status) as any}
                            className={`w-4 h-4 ${getStatusColor(event.status)}`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-medium truncate">
                              {event.title}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              {event.impact && (
                                <span className={`px-2 py-1 rounded-full ${
                                  event.impact === 'high' ? 'bg-red-600/20 text-red-400' :
                                  event.impact === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                                  'bg-gray-600/20 text-gray-400'
                                }`}>
                                  {event.impact}
                                </span>
                              )}
                              <span>{format(new Date(event.timestamp), 'MMM dd, HH:mm')}</span>
                            </div>
                          </div>

                          <p className="text-gray-400 text-sm">
                            {event.description}
                          </p>

                          {event.client && (
                            <p className="text-purple-400 text-xs mt-1">
                              Client: {event.client}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {filteredActivities.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No activities found matching your filters
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'metrics' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {enhancedMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-effect rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: `${metric.color}20` }}
                          >
                            <Icon
                              name={metric.icon as any}
                              className="w-6 h-6"
                              style={{ color: metric.color }}
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {metric.name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {metric.category}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {metric.unit === '$' ? '$' : ''}
                            {metric.value.toLocaleString()}
                            {metric.unit !== '$' ? ` ${metric.unit}` : ''}
                          </div>
                          <div className={`text-sm flex items-center ${
                            metric.changeType === 'increase' ? 'text-green-400' :
                            metric.changeType === 'decrease' ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {metric.changeType === 'increase' ? (
                              <ArrowUp className="w-4 h-4 mr-1" />
                            ) : metric.changeType === 'decrease' ? (
                              <ArrowDown className="w-4 h-4 mr-1" />
                            ) : (
                              <Minus className="w-4 h-4 mr-1" />
                            )}
                            {Math.abs(metric.change).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm">
                        {metric.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'automation' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Workflow Status Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-semibold text-white mb-6">Workflow Status</h3>
                    {workflows.length > 0 && (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Active', value: workflows.filter(w => w.status === 'active').length, fill: '#10B981' },
                                { name: 'Paused', value: workflows.filter(w => w.status === 'paused').length, fill: '#F59E0B' },
                                { name: 'Error', value: workflows.filter(w => w.status === 'error').length, fill: '#EF4444' },
                                { name: 'Draft', value: workflows.filter(w => w.status === 'draft').length, fill: '#6B7280' }
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            />
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </motion.div>

                  {/* Recent Workflows */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-semibold text-white mb-6">Recent Workflows</h3>
                    <div className="space-y-3">
                      {workflows.slice(0, 8).map((workflow, index) => (
                        <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              workflow.status === 'active' ? 'bg-green-400' :
                              workflow.status === 'paused' ? 'bg-yellow-400' :
                              workflow.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                            }`} />
                            <span className="text-white font-medium">{workflow.name}</span>
                          </div>
                          <span className="text-gray-400 text-sm capitalize">
                            {workflow.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {activeTab === 'reports' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <h3 className="text-xl font-semibold text-white mb-6">Generate Reports</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">Report Configuration</h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Report Type
                        </label>
                        <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                          <option>Performance Summary</option>
                          <option>Activity Log Report</option>
                          <option>Automation Analytics</option>
                          <option>Custom Report</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Date Range
                        </label>
                        <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                          <option>Last 7 days</option>
                          <option>Last 30 days</option>
                          <option>Last 90 days</option>
                          <option>Custom range</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Format
                        </label>
                        <select
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value as any)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        >
                          <option value="pdf">PDF Report</option>
                          <option value="csv">CSV Data</option>
                          <option value="json">JSON Data</option>
                        </select>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExport}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Generate Report</span>
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">Recent Reports</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'Weekly Performance Summary', date: '2 hours ago', size: '2.3 MB' },
                          { name: 'Automation Analytics', date: '1 day ago', size: '1.8 MB' },
                          { name: 'Activity Log Report', date: '3 days ago', size: '4.1 MB' },
                          { name: 'Custom Dashboard Report', date: '1 week ago', size: '3.2 MB' }
                        ].map((report, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-4 h-4 text-purple-400" />
                              <div>
                                <div className="text-white font-medium text-sm">{report.name}</div>
                                <div className="text-gray-400 text-xs">{report.date} • {report.size}</div>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-white">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default EnhancedHistory;