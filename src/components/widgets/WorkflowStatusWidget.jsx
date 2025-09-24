import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Play, 
  Pause, 
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Settings,
  ArrowRight,
  Crown,
  RefreshCw,
  BarChart3,
  Calendar,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  Power
} from 'lucide-react';
import { useAutomationHubStore } from '../../stores/automationHubStore';
import SmartWidgetPreview from '../SmartWidgetPreview';

const WorkflowStatusWidget = ({ onNavigateToAutomations }) => {
  const { automationResults, getFreshData } = useAutomationHubStore();
  const [activeTab, setActiveTab] = useState('active');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get workflow data from automation hub
  const workflowData = getFreshData('automation-workflows') || getFreshData('seo-analysis');
  
  // Sample data for basic plan (limited workflows)
  const basicWorkflowData = {
    active_workflows: [
      {
        id: 'seo-monitor',
        name: 'SEO Performance Monitor',
        status: 'running',
        last_run: '2 hours ago',
        next_run: 'in 4 hours',
        success_rate: 96,
        executions: 142,
        type: 'monitoring'
      },
      {
        id: 'content-audit',
        name: 'Weekly Content Audit',
        status: 'scheduled',
        last_run: '3 days ago',
        next_run: 'in 4 days',
        success_rate: 89,
        executions: 23,
        type: 'analysis'
      },
      {
        id: 'keyword-tracker',
        name: 'Keyword Rank Tracker',
        status: 'paused',
        last_run: '1 week ago',
        next_run: 'manual',
        success_rate: 92,
        executions: 87,
        type: 'tracking'
      }
    ],
    summary: {
      total_workflows: 8,
      active_count: 2,
      paused_count: 1,
      total_executions: 1247,
      avg_success_rate: 91,
      last_24h_executions: 15
    },
    recent_activities: [
      { 
        workflow: 'SEO Performance Monitor', 
        action: 'completed successfully', 
        time: '2 hours ago',
        status: 'success' 
      },
      { 
        workflow: 'Competitor Analysis', 
        action: 'failed - rate limit exceeded', 
        time: '6 hours ago',
        status: 'error' 
      },
      { 
        workflow: 'Content Gap Analysis', 
        action: 'started execution', 
        time: '8 hours ago',
        status: 'running' 
      }
    ]
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'running': return 'text-green-400 bg-green-500/20';
      case 'scheduled': return 'text-blue-400 bg-blue-500/20';
      case 'paused': return 'text-yellow-400 bg-yellow-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'running': return <Play className="w-3 h-3" />;
      case 'scheduled': return <Clock className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      case 'error': return <AlertCircle className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'monitoring': return <BarChart3 className="w-4 h-4" />;
      case 'analysis': return <Target className="w-4 h-4" />;
      case 'tracking': return <TrendingUp className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getActivityStatusColor = (status) => {
    switch(status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'running': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getActivityIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'running': return <Activity className="w-4 h-4 text-blue-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleUpgrade = () => {
    if (onNavigateToAutomations) {
      onNavigateToAutomations();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-indigo-900/20 to-cyan-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Workflow Status</h3>
              <p className="text-gray-400 text-sm">Automation monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
              Basic Plan
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4 bg-black/20 rounded-lg p-1">
          {[
            { id: 'active', label: 'Active', icon: Play },
            { id: 'activity', label: 'Activity', icon: Clock },
            { id: 'premium', label: 'Premium', icon: Crown }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-indigo-400">{basicWorkflowData.summary.active_count}</div>
                  <div className="text-xs text-gray-400">Active</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-400">{basicWorkflowData.summary.avg_success_rate}%</div>
                  <div className="text-xs text-gray-400">Success Rate</div>
                </div>
              </div>

              {/* Active Workflows */}
              <div className="space-y-3">
                <h4 className="text-white font-medium text-sm">Workflows</h4>
                {basicWorkflowData.active_workflows.map((workflow) => (
                  <div key={workflow.id} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(workflow.type)}
                        <span className="text-white font-medium text-sm">{workflow.name}</span>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(workflow.status)}`}>
                        {getStatusIcon(workflow.status)}
                        <span className="capitalize">{workflow.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                      <div>
                        <span>Last run: </span>
                        <span className="text-gray-300">{workflow.last_run}</span>
                      </div>
                      <div>
                        <span>Next run: </span>
                        <span className="text-gray-300">{workflow.next_run}</span>
                      </div>
                      <div>
                        <span>Success: </span>
                        <span className="text-green-400">{workflow.success_rate}%</span>
                      </div>
                      <div>
                        <span>Runs: </span>
                        <span className="text-blue-400">{workflow.executions}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Limited Features Message */}
              <div className="bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 rounded-lg p-4 border border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Basic Plan Limit</h4>
                    <p className="text-gray-300 text-sm">Showing 3 of {basicWorkflowData.summary.total_workflows} workflows</p>
                  </div>
                  <button
                    onClick={handleUpgrade}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg hover:from-indigo-700 hover:to-cyan-700 transition-all"
                  >
                    <Power className="w-4 h-4" />
                    <span>Upgrade</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              {/* Execution Stats */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium text-sm mb-3">Last 24 Hours</h4>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">
                    {basicWorkflowData.summary.last_24h_executions}
                  </div>
                  <div className="text-gray-400 text-sm">Executions</div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="space-y-3">
                <h4 className="text-white font-medium text-sm">Recent Activity</h4>
                {basicWorkflowData.recent_activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                    {getActivityIcon(activity.status)}
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{activity.workflow}</div>
                      <div className={`text-sm ${getActivityStatusColor(activity.status)}`}>
                        {activity.action}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Limited History Message */}
              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30 text-center">
                <div className="text-yellow-400 font-medium mb-2">Basic Plan: 24h history only</div>
                <p className="text-gray-300 text-sm mb-3">Upgrade for full execution logs & analytics</p>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  View Full History
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'premium' && (
            <motion.div
              key="premium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4"
            >
              {/* Premium Features Preview */}
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-lg">Premium Workflow Management</h3>
                  <p className="text-gray-400">Advanced monitoring with full control</p>
                </div>

                {/* Premium Features List */}
                <div className="space-y-3">
                  {[
                    'Unlimited workflow monitoring',
                    'Real-time execution logs & debugging',
                    'Custom alert configurations',
                    'Performance analytics & optimization',
                    'Workflow dependency management',
                    'Advanced scheduling options',
                    'Error handling & retry logic',
                    'Team collaboration & permissions'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <Zap className="w-5 h-5 text-indigo-400" />
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={handleUpgrade}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-700 transition-all"
                >
                  Unlock Premium Workflow Management
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 bg-black/20">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>System status: All operational</span>
          <div className="flex items-center space-x-1">
            <RefreshCw className="w-3 h-3" />
            <span>Auto-refresh: 30s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStatusWidget;