import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Play,
  Square,
  Activity,
  Target,
  Timer,
  Award
} from 'lucide-react';
import { WorkflowAnalytics as WorkflowAnalyticsType, WorkflowExecution } from '../../types/automation';

interface WorkflowAnalyticsProps {
  timeRange: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '24h' | '7d' | '30d' | '90d') => void;
}

// Mock analytics data
const MOCK_ANALYTICS: WorkflowAnalyticsType = {
  total_workflows: 24,
  active_workflows: 18,
  executions_today: 156,
  executions_this_week: 892,
  executions_this_month: 3247,
  success_rate: 94.2,
  time_saved_hours: 284.5,
  average_execution_time: 45.3,
  fastest_workflow: {
    name: 'Social Media Cross-Post',
    duration: 12.4
  },
  slowest_workflow: {
    name: 'Ad Budget Optimizer',
    duration: 124.7
  },
  most_used_workflows: [
    {
      id: 'workflow_1',
      name: 'Welcome Email Sequence',
      execution_count: 1247,
      success_rate: 96.8
    },
    {
      id: 'workflow_2',
      name: 'Social Media Cross-Post',
      execution_count: 892,
      success_rate: 98.1
    },
    {
      id: 'workflow_3',
      name: 'Lead Scoring Update',
      execution_count: 734,
      success_rate: 92.4
    },
    {
      id: 'workflow_4',
      name: 'Invoice Reminder',
      execution_count: 623,
      success_rate: 89.7
    },
    {
      id: 'workflow_5',
      name: 'Customer Winback',
      execution_count: 445,
      success_rate: 87.2
    }
  ],
  most_reliable_workflows: [
    {
      id: 'workflow_2',
      name: 'Social Media Cross-Post',
      success_rate: 98.1,
      execution_count: 892
    },
    {
      id: 'workflow_1',
      name: 'Welcome Email Sequence',
      success_rate: 96.8,
      execution_count: 1247
    },
    {
      id: 'workflow_6',
      name: 'Contact Data Sync',
      success_rate: 95.3,
      execution_count: 324
    },
    {
      id: 'workflow_3',
      name: 'Lead Scoring Update',
      success_rate: 92.4,
      execution_count: 734
    },
    {
      id: 'workflow_7',
      name: 'Daily Report Generator',
      success_rate: 91.8,
      execution_count: 267
    }
  ],
  recent_executions: [
    {
      workflow_id: 'workflow_1',
      workflow_name: 'Welcome Email Sequence',
      status: 'success',
      execution_time: '2025-01-09T14:23:00Z',
      duration: 34.2
    },
    {
      workflow_id: 'workflow_2',
      workflow_name: 'Social Media Cross-Post',
      status: 'success',
      execution_time: '2025-01-09T14:18:00Z',
      duration: 12.1
    },
    {
      workflow_id: 'workflow_4',
      workflow_name: 'Invoice Reminder',
      status: 'failed',
      execution_time: '2025-01-09T14:15:00Z',
      duration: 67.8
    },
    {
      workflow_id: 'workflow_3',
      workflow_name: 'Lead Scoring Update',
      status: 'success',
      execution_time: '2025-01-09T14:12:00Z',
      duration: 89.4
    },
    {
      workflow_id: 'workflow_5',
      workflow_name: 'Customer Winback',
      status: 'success',
      execution_time: '2025-01-09T14:08:00Z',
      duration: 156.2
    }
  ],
  common_errors: [
    {
      error_type: 'Email delivery timeout',
      count: 23,
      affected_workflows: ['Welcome Email Sequence', 'Customer Winback', 'Invoice Reminder']
    },
    {
      error_type: 'API rate limit exceeded',
      count: 18,
      affected_workflows: ['Lead Scoring Update', 'Social Media Cross-Post']
    },
    {
      error_type: 'Invalid contact data',
      count: 12,
      affected_workflows: ['Welcome Email Sequence', 'Contact Data Sync']
    },
    {
      error_type: 'Third-party service unavailable',
      count: 8,
      affected_workflows: ['Ad Budget Optimizer', 'Social Media Cross-Post']
    }
  ],
  execution_trends: [
    { date: '2025-01-03', executions: 234, successes: 221, failures: 13 },
    { date: '2025-01-04', executions: 267, successes: 252, failures: 15 },
    { date: '2025-01-05', executions: 198, successes: 186, failures: 12 },
    { date: '2025-01-06', executions: 289, successes: 274, failures: 15 },
    { date: '2025-01-07', executions: 245, successes: 230, failures: 15 },
    { date: '2025-01-08', executions: 312, successes: 295, failures: 17 },
    { date: '2025-01-09', executions: 156, successes: 147, failures: 9 }
  ],
  time_saved_by_category: [
    {
      category: 'Email Marketing',
      hours_saved: 98.2,
      workflows_count: 6
    },
    {
      category: 'CRM Management',
      hours_saved: 76.4,
      workflows_count: 5
    },
    {
      category: 'Social Media',
      hours_saved: 54.3,
      workflows_count: 4
    },
    {
      category: 'Ad Management',
      hours_saved: 32.1,
      workflows_count: 3
    },
    {
      category: 'Financial',
      hours_saved: 23.5,
      workflows_count: 6
    }
  ]
};

const WorkflowAnalytics: React.FC<WorkflowAnalyticsProps> = ({
  timeRange,
  onTimeRangeChange
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'executions' | 'success_rate' | 'duration'>('executions');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const analytics = MOCK_ANALYTICS;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return CheckCircle;
      case 'failed':
        return XCircle;
      default:
        return Clock;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else if (seconds < 3600) {
      return `${(seconds / 60).toFixed(1)}m`;
    } else {
      return `${(seconds / 3600).toFixed(1)}h`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const chartData = useMemo(() => {
    return analytics.execution_trends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...trend
    }));
  }, [analytics.execution_trends]);

  const maxExecutions = Math.max(...analytics.execution_trends.map(t => t.executions));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Workflow Analytics
          </h2>
          <p className="text-gray-400">
            Monitor performance and track automation success across your workflows.
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
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Executions</p>
              <p className="text-2xl font-bold text-white">
                {timeRange === '24h' ? analytics.executions_today :
                 timeRange === '7d' ? analytics.executions_this_week :
                 analytics.executions_this_month}
              </p>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12.5% vs prev period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-900 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm text-gray-400 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {analytics.success_rate}%
              </p>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+2.1% vs prev period</span>
              </div>
            </div>
            <div className="p-3 bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
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
              <p className="text-sm text-gray-400 mb-1">Avg. Execution Time</p>
              <p className="text-2xl font-bold text-white">
                {formatDuration(analytics.average_execution_time)}
              </p>
              <div className="flex items-center text-sm text-red-600 mt-1">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span>-8.3% vs prev period</span>
              </div>
            </div>
            <div className="p-3 bg-orange-900 rounded-lg">
              <Timer className="w-6 h-6 text-orange-600" />
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
              <p className="text-sm text-gray-400 mb-1">Time Saved</p>
              <p className="text-2xl font-bold text-white">
                {analytics.time_saved_hours.toFixed(1)}h
              </p>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+15.7% vs prev period</span>
              </div>
            </div>
            <div className="p-3 bg-purple-900 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Trends Chart */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Execution Trends
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMetric('executions')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedMetric === 'executions'
                    ? 'bg-blue-900 text-blue-300'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                Executions
              </button>
              <button
                onClick={() => setSelectedMetric('success_rate')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedMetric === 'success_rate'
                    ? 'bg-blue-900 text-blue-300'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                Success Rate
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {chartData.map((data, index) => (
              <div key={data.date} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-400">
                  {data.date}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {selectedMetric === 'executions' ? data.executions : 
                       `${((data.successes / data.executions) * 100).toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-900/200 h-2 rounded-full transition-all"
                      style={{
                        width: selectedMetric === 'executions' 
                          ? `${(data.executions / maxExecutions) * 100}%`
                          : `${(data.successes / data.executions) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Saved by Category */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Time Saved by Category
          </h3>
          
          <div className="space-y-4">
            {analytics.time_saved_by_category.map((category, index) => {
              const maxHours = Math.max(...analytics.time_saved_by_category.map(c => c.hours_saved));
              const percentage = (category.hours_saved / maxHours) * 100;
              
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {category.category}
                    </span>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>{category.hours_saved.toFixed(1)}h</span>
                      <span>•</span>
                      <span>{category.workflows_count} workflows</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Workflows */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Most Used Workflows
            </h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            {analytics.most_used_workflows.map((workflow, index) => (
              <div key={workflow.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {workflow.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {workflow.success_rate}% success rate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">
                    {workflow.execution_count.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    executions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Reliable Workflows */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Most Reliable Workflows
            </h3>
            <Award className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="space-y-4">
            {analytics.most_reliable_workflows.map((workflow, index) => (
              <div key={workflow.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {workflow.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {workflow.execution_count.toLocaleString()} executions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">
                    {workflow.success_rate}%
                  </p>
                  <p className="text-sm text-gray-400">
                    success rate
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity and Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Executions */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Recent Executions
            </h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {analytics.recent_executions.map((execution, index) => {
              const StatusIcon = getStatusIcon(execution.status);
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(execution.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {execution.workflow_name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDate(execution.execution_time)} • {formatDuration(execution.duration)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    execution.status === 'success' 
                      ? 'bg-green-900 text-green-200'
                      : 'bg-red-900 text-red-200'
                  }`}>
                    {execution.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Common Errors */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Common Errors
            </h3>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          
          <div className="space-y-4">
            {analytics.common_errors.map((error, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">
                    {error.error_type}
                  </p>
                  <span className="px-2 py-1 text-xs bg-red-900 text-red-200 rounded-full">
                    {error.count} occurrences
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Affects: {error.affected_workflows.slice(0, 2).join(', ')}
                  {error.affected_workflows.length > 2 && ` +${error.affected_workflows.length - 2} more`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export and Actions */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Export Analytics
            </h3>
            <p className="text-gray-400">
              Download detailed reports and analytics data for further analysis.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-md transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowAnalytics;