import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  Brain,
  Target,
  Mail,
  Users,
  Share2,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  Workflow,
  Bot,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  MoreHorizontal,
  DollarSign,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useAutomationStore } from '../../stores/automationStore';
import { useAutomationHubStore } from '../../stores/automationHubStore';
import { AutomationWorkflow, WorkflowStatus, TriggerType, ActionType } from '../../types/automation';
import WorkflowBuilder from './WorkflowBuilder';
import WorkflowTemplates from './WorkflowTemplates';
import WorkflowAnalytics from './WorkflowAnalytics';
import N8nNodeLibrary from './N8nNodeLibrary';
import AutomationChains from './AutomationChains';
import ApiCostTracker from './ApiCostTracker';
import LandingPageGenerator from './LandingPageGenerator';
import AIInsightsPanel from '../AIInsightsPanel';
import PerformanceMonitor from '../PerformanceMonitor';
import { initializeDefaultAutomations } from '../../stores/automationHubStore';

const AutomationDashboard: React.FC = () => {
  const {
    workflows,
    analytics,
    templates,
    isLoading,
    error,
    createWorkflow,
    deleteWorkflow,
    updateWorkflow,
    fetchAnalytics,
    setError,
    clearError
  } = useAutomationStore();

  // AI Automation Hub integration
  const {
    automationResults,
    userProfile,
    refreshAllAutomations,
    refreshAutomation,
    activeAutomationView,
    selectedCategory,
    automationMetrics,
    setActiveView,
    setSelectedCategory,
    getAutomationsByCategory,
    getAutomationInsights,
    updateMetrics
  } = useAutomationHubStore();

  // Derived state
  const activeWorkflows = workflows.filter(w => w.status === 'active');

  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'ai-automations' | 'templates' | 'analytics' | 'nodes' | 'chains' | 'costs' | 'landing-page-generator'>('overview');
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all');

  useEffect(() => {
    try {
      fetchAnalytics('7d');
      // Initialize AI automations if needed
      if (Object.keys(automationResults).length === 0) {
        console.log('Initializing AI automations from dashboard...');
        initializeDefaultAutomations();
      }
    } catch (error) {
      console.error('Error in AutomationDashboard useEffect:', error);
    }
  }, [fetchAnalytics, automationResults, initializeDefaultAutomations]);

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'error': return 'bg-red-900/200/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTriggerIcon = (trigger: TriggerType) => {
    switch (trigger) {
      case 'email_opened': return <Mail className="w-4 h-4" />;
      case 'contact_created': return <Users className="w-4 h-4" />;
      case 'deal_stage_changed': return <Target className="w-4 h-4" />;
      case 'social_mention': return <Share2 className="w-4 h-4" />;
      case 'form_submitted': return <CheckCircle className="w-4 h-4" />;
      case 'schedule': return <Clock className="w-4 h-4" />;
      case 'webhook': return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportWorkflow = (workflow: AutomationWorkflow) => {
    // Export workflow to n8n format
    const n8nWorkflow = {
      name: workflow.name,
      nodes: [],
      connections: {},
      active: workflow.status === 'active'
    };
    const blob = new Blob([JSON.stringify(n8nWorkflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, '_')}_n8n.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportN8n = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const n8nData = JSON.parse(e.target?.result as string);
        // Handle n8n import logic here
        console.log('Importing n8n workflow:', n8nData);
        setError('n8n import functionality will be implemented in next phase');
      } catch (error) {
        console.error('Failed to import n8n workflow:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                <div className="p-3 bg-purple-600/20 rounded-xl">
                  <Bot className="w-8 h-8 text-purple-400" />
                </div>
                <span>AI Automation Hub</span>
              </h1>
              <p className="text-gray-400">Build intelligent workflows that connect all your marketing tools</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Import n8n</span>
                <input 
                  type="file" 
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && handleImportN8n(e.target.files[0])}
                  className="hidden" 
                />
              </label>
              
              <button
                onClick={() => setShowBuilder(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workflow</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-900/200/10 border border-red-500/20 rounded-xl p-4"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Stats Cards with AI Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Workflows</p>
                <p className="text-2xl font-bold text-white">{activeWorkflows.length}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Play className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">AI Automations</p>
                <p className="text-2xl font-bold text-white">{Object.keys(automationResults).length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Executions Today</p>
                <p className="text-2xl font-bold text-white">{analytics?.executions_today || 0}</p>
              </div>
              <div className="p-3 bg-blue-900/200/20 rounded-xl">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-white">{analytics?.success_rate || 95}%</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Time Saved</p>
                <p className="text-2xl font-bold text-white">{analytics?.time_saved_hours || 156}h</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/5 backdrop-blur-xl rounded-xl p-2 border border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'workflows', label: 'Workflows', icon: Workflow },
            { id: 'ai-automations', label: 'AI Automations', icon: Brain },
            { id: 'templates', label: 'Templates', icon: Sparkles },
            { id: 'landing-page-generator', label: 'Landing Page Generator', icon: FileText },
            { id: 'nodes', label: 'Node Library', icon: Zap },
            { id: 'chains', label: 'Automation Chains', icon: Bot },
            { id: 'costs', label: 'Cost Tracking', icon: DollarSign },
            { id: 'analytics', label: 'Analytics', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* AI Performance Monitor */}
                <PerformanceMonitor automationResults={automationResults} />
                
                {/* AI Insights Panel */}
                <AIInsightsPanel automationResults={automationResults} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Quick Start Templates */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span>Quick Start Templates</span>
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      {templates.slice(0, 4).map((template) => (
                        <div 
                          key={template.id} 
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/30 transition-colors cursor-pointer"
                          onClick={() => createWorkflow(template)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${template.category === 'email' ? 'bg-blue-900/200/20' : template.category === 'crm' ? 'bg-green-500/20' : 'bg-purple-500/20'}`}>
                              {getTriggerIcon(template.trigger)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{template.name}</p>
                              <p className="text-gray-400 text-sm">{template.description}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <span>Recent Executions</span>
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      {analytics?.recent_executions?.slice(0, 5).map((execution, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${execution.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                            <div>
                              <p className="text-white text-sm">{execution.workflow_name}</p>
                              <p className="text-gray-400 text-xs">{execution.execution_time}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${execution.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-900/200/20 text-red-400'}`}>
                            {execution.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai-automations' && (
              <div className="space-y-6">
                {/* AI Automations Header */}
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">AI Automation Hub</h2>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => refreshAllAutomations()}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Refresh All</span>
                        </button>
                        <button
                          onClick={() => updateMetrics()}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Update Metrics</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Metrics Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{Object.keys(automationResults).length}</div>
                      <div className="text-xs text-gray-400">Total Automations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{Object.values(automationResults).filter(a => a.status === 'fresh').length}</div>
                      <div className="text-xs text-gray-400">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{automationMetrics.totalExecutions}</div>
                      <div className="text-xs text-gray-400">Total Executions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-400">
                        {automationMetrics.totalExecutions > 0 
                          ? Math.round((automationMetrics.successfulExecutions / automationMetrics.totalExecutions) * 100)
                          : 95}%
                      </div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-teal-400">{automationMetrics.timeSaved}h</div>
                      <div className="text-xs text-gray-400">Time Saved</div>
                    </div>
                  </div>
                  
                  {/* View Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
                        {['grid', 'list', 'categories'].map((view) => (
                          <button
                            key={view}
                            onClick={() => setActiveView(view as any)}
                            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                              activeAutomationView === view
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {view.charAt(0).toUpperCase() + view.slice(1)}
                          </button>
                        ))}
                      </div>
                      
                      {/* Category Filter */}
                      <select
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                        className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400"
                      >
                        <option value="">All Categories</option>
                        {[...new Set(Object.values(automationResults).map(a => a.category))].map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* AI Automations Content */}
                {activeAutomationView === 'categories' ? (
                  // Category View
                  <div className="space-y-8">
                    {[...new Set(Object.values(automationResults).map(a => a.category))].map(category => {
                      const categoryAutomations = selectedCategory 
                        ? getAutomationsByCategory(selectedCategory)
                        : getAutomationsByCategory(category);
                      
                      if (selectedCategory && selectedCategory !== category) return null;
                      
                      return (
                        <div key={category} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                              <span>{category} Automations</span>
                              <span className="text-sm text-gray-400">({categoryAutomations.length})</span>
                            </h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryAutomations.map((automation) => (
                              <motion.div
                                key={automation.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
                              >
                                <div className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                      <div className={`p-3 bg-gradient-to-br ${automation.color} rounded-xl`}>
                                        <div className="w-5 h-5 text-white">
                                          {automation.type === 'seo-analysis' && <TrendingUp className="w-5 h-5" />}
                                          {automation.type === 'keyword-research' && <Search className="w-5 h-5" />}
                                          {automation.type === 'social-media-trends' && <Users className="w-5 h-5" />}
                                          {automation.type === 'content-gap-analysis' && <FileText className="w-5 h-5" />}
                                          {automation.type === 'backlink-analysis' && <Link className="w-5 h-5" />}
                                          {automation.type === 'tech-stack-analysis' && <Activity className="w-5 h-5" />}
                                          {automation.type === 'market-intelligence' && <BarChart3 className="w-5 h-5" />}
                                          {automation.type === 'automation-workflows' && <Zap className="w-5 h-5" />}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="text-white font-semibold">{automation.name}</h4>
                                        <p className="text-gray-400 text-sm">{automation.description}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Enhanced Status and Metrics */}
                                  <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-white/5 rounded-lg p-3 text-center">
                                      <div className="text-lg font-bold text-blue-400">{automation.executionCount}</div>
                                      <div className="text-xs text-gray-400">Executions</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3 text-center">
                                      <div className="text-lg font-bold text-green-400">{automation.successRate}%</div>
                                      <div className="text-xs text-gray-400">Success Rate</div>
                                    </div>
                                  </div>

                                  {/* Insights */}
                                  {automation.insights && (
                                    <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          <Brain className="w-4 h-4 text-purple-400" />
                                          <span className="text-sm font-medium text-purple-300">AI Insight</span>
                                        </div>
                                        <div className="text-sm text-purple-400 font-bold">
                                          Score: {automation.insights.score}/100
                                        </div>
                                      </div>
                                      <p className="text-xs text-purple-200">
                                        {automation.insights.recommendations[0]}
                                      </p>
                                    </div>
                                  )}

                                  {/* Actions */}
                                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      automation.status === 'fresh' ? 'bg-green-500/20 text-green-400' :
                                      automation.status === 'stale' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-red-900/200/20 text-red-400'
                                    }`}>
                                      {automation.status === 'fresh' ? 'Live Data' : 
                                       automation.status === 'stale' ? 'Needs Refresh' : 'Error'}
                                    </span>
                                    
                                    <button
                                      onClick={() => refreshAutomation(automation.id)}
                                      disabled={automation.status === 'loading'}
                                      className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                                    >
                                      <RefreshCw className={`w-3 h-3 ${automation.status === 'loading' ? 'animate-spin' : ''}`} />
                                      <span>Refresh</span>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Grid/List View
                  <div className={activeAutomationView === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
                    {(selectedCategory 
                      ? getAutomationsByCategory(selectedCategory)
                      : Object.values(automationResults)
                    ).map((automation, index) => (
                    <motion.div
                      key={automation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 bg-gradient-to-br ${automation.color} rounded-xl`}>
                              <div className="w-6 h-6 text-white">
                                {automation.type === 'seo-analysis' && <TrendingUp className="w-6 h-6" />}
                                {automation.type === 'competitor-intel' && <Target className="w-6 h-6" />}
                                {automation.type === 'social-media' && <Users className="w-6 h-6" />}
                                {automation.type === 'content-analysis' && <Activity className="w-6 h-6" />}
                                {automation.type === 'backlink-monitor' && <Activity className="w-6 h-6" />}
                                {automation.type === 'keyword-tracker' && <Activity className="w-6 h-6" />}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{automation.name}</h3>
                              <p className="text-gray-400 text-sm">
                                {automation.status === 'fresh' ? 'Up to date' : 
                                 automation.status === 'stale' ? 'Needs refresh' :
                                 automation.status === 'loading' ? 'Refreshing...' : 'Error'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs border ${
                              automation.status === 'fresh' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              automation.status === 'stale' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              automation.status === 'loading' ? 'bg-blue-900/200/20 text-blue-400 border-blue-500/30' :
                              'bg-red-900/200/20 text-red-400 border-red-500/30'
                            }`}>
                              {automation.status === 'fresh' && <CheckCircle className="w-3 h-3" />}
                              {automation.status === 'stale' && <Clock className="w-3 h-3" />}
                              {automation.status === 'loading' && <RefreshCw className="w-3 h-3 animate-spin" />}
                              {automation.status === 'error' && <AlertTriangle className="w-3 h-3" />}
                              <span className="capitalize">{automation.status}</span>
                            </span>
                          </div>
                        </div>

                        {/* Enhanced Metrics for Grid/List View */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-blue-400">{automation.executionCount}</div>
                            <div className="text-xs text-gray-400">Executions</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-green-400">{automation.successRate}%</div>
                            <div className="text-xs text-gray-400">Success Rate</div>
                          </div>
                        </div>

                        {/* Loading state */}
                        {automation.status === 'loading' && (
                          <div className="space-y-3 mb-4">
                            <div className="h-16 bg-gray-700/50 rounded-lg animate-pulse" />
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <span className="text-xs text-gray-400">
                            Updates every {automation.refreshInterval}min
                          </span>
                          <button
                            onClick={() => refreshAutomation(automation.id)}
                            disabled={automation.status === 'loading'}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                          >
                            <RefreshCw className={`w-3 h-3 ${automation.status === 'loading' ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                )}

                {/* Empty State */}
                {Object.keys(automationResults).length === 0 && (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No AI Automations Found</h3>
                    <p className="text-gray-400 mb-6">Initialize your AI automations to get intelligent insights about your business.</p>
                    <button
                      onClick={async () => {
                        try {
                          console.log('Button clicked: Initialize AI Automations');
                          await initializeDefaultAutomations();
                          console.log('AI Automations initialized successfully from button');
                        } catch (error) {
                          console.error('Error initializing AI automations from button:', error);
                          alert('Failed to initialize AI automations. Please check the console for details.');
                        }
                      }}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200"
                      aria-label="Initialize AI automations to start monitoring your business metrics"
                    >
                      Initialize AI Automations
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'workflows' && (
              <div className="space-y-6">
                {/* Workflows Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search workflows..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as WorkflowStatus | 'all')}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="draft">Draft</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>

                {/* Workflows Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWorkflows.map((workflow) => (
                    <motion.div
                      key={workflow.id}
                      layout
                      className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            {getTriggerIcon(workflow.trigger)}
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{workflow.name}</h3>
                            <p className="text-gray-400 text-sm">{workflow.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs border ${getStatusColor(workflow.status)}`}>
                            {getStatusIcon(workflow.status)}
                            <span className="capitalize">{workflow.status}</span>
                          </span>
                          
                          <div className="relative group">
                            <button className="p-1 text-gray-400 hover:text-white transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            
                            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="p-2">
                                <button
                                  onClick={() => setSelectedWorkflow(workflow)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => updateWorkflow(workflow.id, { 
                                    status: workflow.status === 'active' ? 'paused' : 'active' 
                                  })}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg"
                                >
                                  {workflow.status === 'active' ? 'Pause' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleExportWorkflow(workflow)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg"
                                >
                                  Export to n8n
                                </button>
                                <button
                                  onClick={() => deleteWorkflow(workflow.id)}
                                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="text-sm">
                          <span className="text-gray-400">Executions: </span>
                          <span className="text-white">{workflow.execution_count || 0}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">Success Rate: </span>
                          <span className={`${workflow.success_rate > 95 ? 'text-green-400' : workflow.success_rate > 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {workflow.success_rate || 0}%
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">Last Run: </span>
                          <span className="text-white">{workflow.last_execution || 'Never'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => updateWorkflow(workflow.id, { 
                            status: workflow.status === 'active' ? 'paused' : 'active' 
                          })}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                            workflow.status === 'active' 
                              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          {workflow.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          <span>{workflow.status === 'active' ? 'Pause' : 'Start'}</span>
                        </button>
                        
                        <span className="text-xs text-gray-400">
                          {workflow.steps.length} steps
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <WorkflowTemplates 
                onUseTemplate={(template) => {
                  console.log('Using template:', template);
                  // Create workflow from template
                }}
                onPreviewTemplate={(template) => {
                  console.log('Preview template:', template);
                  // Show template preview
                }}
              />
            )}

            {activeTab === 'nodes' && (
              <N8nNodeLibrary 
                onNodeSelect={(node) => {
                  console.log('Selected node:', node);
                  // Could open builder with pre-selected node
                  setActiveTab('workflows');
                  setShowBuilder(true);
                }}
              />
            )}

            {activeTab === 'chains' && (
              <AutomationChains 
                onChainSelect={(chain) => {
                  console.log('Selected chain:', chain);
                  // Execute the automation chain
                }}
                onChainEdit={(chain) => {
                  console.log('Edit chain:', chain);
                  // Open builder with chain
                  setActiveTab('workflows');
                  setShowBuilder(true);
                }}
                onChainDuplicate={(chain) => {
                  console.log('Duplicate chain:', chain);
                  // Create duplicate chain
                }}
                onChainDelete={(chainId) => {
                  console.log('Delete chain:', chainId);
                  // Delete chain with confirmation
                }}
              />
            )}

            {activeTab === 'costs' && (
              <ApiCostTracker 
                timeRange="30d"
                onTimeRangeChange={(range) => {
                  console.log('Time range changed:', range);
                }}
              />
            )}

            {activeTab === 'analytics' && (
              <WorkflowAnalytics
                timeRange="30d"
                onTimeRangeChange={(range) => {
                  console.log('Analytics time range changed:', range);
                }}
              />
            )}

            {activeTab === 'landing-page-generator' && (
              <div className="min-h-screen -m-6">
                <LandingPageGenerator />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Workflow Builder Modal */}
        {showBuilder && (
          <WorkflowBuilder
            isOpen={showBuilder}
            workflow={selectedWorkflow}
            onClose={() => {
              setShowBuilder(false);
              setSelectedWorkflow(null);
            }}
            onSave={(workflow) => {
              createWorkflow(workflow);
              setShowBuilder(false);
              setSelectedWorkflow(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AutomationDashboard;