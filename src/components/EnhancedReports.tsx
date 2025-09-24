import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, subWeeks, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import {
  FileText,
  Plus,
  Download,
  Clock,
  Calendar,
  Filter,
  Search,
  Settings,
  Share,
  Mail,
  Eye,
  Edit3,
  Trash2,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Brain,
  Target,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Cloud,
  Palette,
  MessageCircle,
  Hash,
  StickyNote,
  FolderOpen,
  CreditCard,
  PieChart,
  LineChart,
  AreaChart
} from 'lucide-react';

import { useHistoryStore } from '../stores/historyStore';
import { useAutomationStore } from '../stores/automationStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useAgencyStore } from '../stores/agencyStore';
import { useNotesStore } from '../stores/notesStore';
import { ReportConfig, GeneratedReport } from '../types';
import Icon from './Icon';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'performance' | 'automation' | 'business' | 'marketing' | 'ai' | 'comprehensive';
  sections: string[];
  metrics: string[];
  format: 'pdf' | 'csv' | 'json' | 'html';
  estimatedTime: string;
  dataPoints: number;
}

interface ReportMetrics {
  automationMetrics: {
    totalWorkflows: number;
    activeWorkflows: number;
    successRate: number;
    avgExecutionTime: number;
    errorCount: number;
  };
  aiMetrics: {
    totalGenerations: number;
    landingPageGenerations: number;
    adCopyGenerations: number;
    seoContentGenerations: number;
    successfulGenerations: number;
  };
  businessMetrics: {
    totalClients: number;
    activeClients: number;
    revenueImpact: number;
    timeSaved: number;
    clientSatisfaction: number;
  };
  performanceMetrics: {
    pageLoadTime: number;
    uptime: number;
    apiResponseTime: number;
    errorRate: number;
    userSessions: number;
  };
  contentMetrics: {
    totalNotes: number;
    completedTasks: number;
    filesManaged: number;
    brandAssets: number;
    contentApprovals: number;
  };
  marketingMetrics: {
    emailCampaigns: number;
    socialPosts: number;
    adCampaigns: number;
    leadGeneration: number;
    conversionRate: number;
  };
}

const EnhancedReports: React.FC = () => {
  const {
    reportConfigs,
    generatedReports,
    isLoading,
    error,
    createReportConfig,
    updateReportConfig,
    deleteReportConfig,
    generateReport,
    clearError,
    getComprehensiveMetrics
  } = useHistoryStore();

  const { workflows } = useAutomationStore();
  const { notifications } = useNotificationStore();
  const { clients } = useAgencyStore();
  const { notes, getAnalytics: getNotesAnalytics } = useNotesStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'templates' | 'generated' | 'scheduled' | 'analytics'>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportConfig | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customDateRange, setCustomDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Generate comprehensive metrics from all stores
  const reportMetrics: ReportMetrics = useMemo(() => {
    const notesAnalytics = getNotesAnalytics();
    const comprehensiveMetrics = getComprehensiveMetrics();

    return {
      automationMetrics: {
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.status === 'active').length,
        successRate: 94.2, // Mock data - would come from actual tracking
        avgExecutionTime: 2.3, // seconds
        errorCount: workflows.filter(w => w.status === 'error').length
      },
      aiMetrics: {
        totalGenerations: comprehensiveMetrics.aiGenerations || 156,
        landingPageGenerations: 42,
        adCopyGenerations: 38,
        seoContentGenerations: 31,
        successfulGenerations: 148
      },
      businessMetrics: {
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === 'active').length,
        revenueImpact: 48500,
        timeSaved: 142,
        clientSatisfaction: 4.8
      },
      performanceMetrics: {
        pageLoadTime: 1.2,
        uptime: 99.9,
        apiResponseTime: 0.8,
        errorRate: 0.1,
        userSessions: comprehensiveMetrics.totalActivities || 234
      },
      contentMetrics: {
        totalNotes: notesAnalytics.totalNotes,
        completedTasks: notesAnalytics.completedTasks,
        filesManaged: 89,
        brandAssets: 156,
        contentApprovals: 23
      },
      marketingMetrics: {
        emailCampaigns: 12,
        socialPosts: 89,
        adCampaigns: 7,
        leadGeneration: 234,
        conversionRate: 12.4
      }
    };
  }, [workflows, clients, getNotesAnalytics, getComprehensiveMetrics]);

  // Report templates with comprehensive coverage
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'executive-dashboard',
      name: 'Executive Dashboard',
      description: 'High-level KPIs and business metrics for leadership',
      icon: 'TrendingUp',
      color: 'purple',
      category: 'comprehensive',
      sections: ['Business Overview', 'Revenue Impact', 'Client Status', 'Performance Summary'],
      metrics: ['revenue', 'client_growth', 'automation_roi', 'time_savings'],
      format: 'pdf',
      estimatedTime: '2-3 minutes',
      dataPoints: 25
    },
    {
      id: 'automation-performance',
      name: 'Automation Performance',
      description: 'Detailed analysis of all automation workflows and AI tools',
      icon: 'Zap',
      color: 'blue',
      category: 'automation',
      sections: ['Workflow Status', 'Success Rates', 'Performance Metrics', 'Error Analysis'],
      metrics: ['workflow_executions', 'success_rate', 'execution_time', 'error_count'],
      format: 'pdf',
      estimatedTime: '1-2 minutes',
      dataPoints: 18
    },
    {
      id: 'ai-generation-report',
      name: 'AI Generation Analytics',
      description: 'Comprehensive tracking of AI-generated content and performance',
      icon: 'Brain',
      color: 'green',
      category: 'ai',
      sections: ['Generation Volume', 'Content Types', 'Success Rates', 'Usage Trends'],
      metrics: ['ai_generations', 'content_types', 'success_rate', 'user_adoption'],
      format: 'pdf',
      estimatedTime: '1-2 minutes',
      dataPoints: 15
    },
    {
      id: 'client-business-report',
      name: 'Client & Business Report',
      description: 'Client management, satisfaction, and business growth metrics',
      icon: 'Users',
      color: 'orange',
      category: 'business',
      sections: ['Client Portfolio', 'Satisfaction Scores', 'Revenue Analysis', 'Growth Trends'],
      metrics: ['client_count', 'satisfaction', 'revenue', 'growth_rate'],
      format: 'pdf',
      estimatedTime: '2-3 minutes',
      dataPoints: 22
    },
    {
      id: 'marketing-performance',
      name: 'Marketing Performance',
      description: 'Email campaigns, social media, and advertising effectiveness',
      icon: 'Target',
      color: 'pink',
      category: 'marketing',
      sections: ['Campaign Performance', 'Social Media Analytics', 'Lead Generation', 'ROI Analysis'],
      metrics: ['email_performance', 'social_engagement', 'lead_conversion', 'ad_spend_roi'],
      format: 'pdf',
      estimatedTime: '2-3 minutes',
      dataPoints: 28
    },
    {
      id: 'system-health',
      name: 'System Health & Performance',
      description: 'Technical performance, uptime, and system reliability metrics',
      icon: 'Activity',
      color: 'cyan',
      category: 'performance',
      sections: ['System Uptime', 'Performance Metrics', 'Error Rates', 'Security Status'],
      metrics: ['uptime', 'response_time', 'error_rate', 'security_incidents'],
      format: 'pdf',
      estimatedTime: '1-2 minutes',
      dataPoints: 12
    },
    {
      id: 'comprehensive-monthly',
      name: 'Monthly Comprehensive Report',
      description: 'Complete monthly overview covering all aspects of the platform',
      icon: 'BarChart3',
      color: 'indigo',
      category: 'comprehensive',
      sections: ['Executive Summary', 'Automation Performance', 'AI Analytics', 'Business Metrics', 'Marketing Results', 'System Performance'],
      metrics: ['all_metrics'],
      format: 'pdf',
      estimatedTime: '5-7 minutes',
      dataPoints: 85
    },
    {
      id: 'data-export',
      name: 'Raw Data Export',
      description: 'Export all data in structured format for external analysis',
      icon: 'Database',
      color: 'gray',
      category: 'comprehensive',
      sections: ['All Data Tables'],
      metrics: ['raw_data'],
      format: 'csv',
      estimatedTime: '30 seconds',
      dataPoints: 500
    }
  ];

  // Filter templates
  const filteredTemplates = reportTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Form state for creating reports
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'on_demand' as 'scheduled' | 'on_demand',
    format: 'pdf' as 'pdf' | 'csv' | 'json' | 'html',
    template: null as ReportTemplate | null,
    schedule: {
      frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
      time: '09:00',
      timezone: 'UTC'
    },
    filters: {
      dateRange: {
        start: subDays(new Date(), 30).getTime(),
        end: new Date().getTime()
      },
      sections: [] as string[],
      metrics: [] as string[],
      includeTrends: true,
      includeCharts: true,
      includeRawData: false
    },
    recipients: [''] as string[]
  });

  // Handle template selection
  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      format: template.format,
      template: template,
      filters: {
        ...formData.filters,
        sections: template.sections,
        metrics: template.metrics
      }
    });
    setShowCreateModal(true);
  };

  // Generate report with progress tracking
  const handleGenerateReport = async (configId: string) => {
    setIsGenerating(configId);
    try {
      await generateReport(configId);

      // Simulate progress for user feedback
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsGenerating(null);
    }
  };

  // Quick generate from template
  const handleQuickGenerate = async (template: ReportTemplate) => {
    const quickConfig = {
      name: `${template.name} - ${format(new Date(), 'MMM dd, yyyy')}`,
      description: template.description,
      type: 'on_demand' as const,
      format: template.format,
      filters: {
        dateRange: {
          start: subDays(new Date(), 30).getTime(),
          end: new Date().getTime()
        },
        sections: template.sections,
        metrics: template.metrics,
        includeTrends: true,
        includeCharts: true,
        includeRawData: false
      }
    };

    createReportConfig(quickConfig);

    // Find the newly created config and generate it
    setTimeout(async () => {
      const newConfigs = reportConfigs;
      const latestConfig = newConfigs[newConfigs.length - 1];
      if (latestConfig) {
        await handleGenerateReport(latestConfig.id);
      }
    }, 500);
  };

  // Get date range for reports
  const getDateRangeText = () => {
    switch (dateRange) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case 'custom': return `${format(customDateRange.start, 'MMM dd')} - ${format(customDateRange.end, 'MMM dd')}`;
      default: return 'Last 30 days';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Enhanced Reports Center</h1>
          <p className="text-gray-400">
            Comprehensive reporting for all dashboard activities, automations, and business metrics
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>

          {/* Quick Actions */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Report</span>
          </motion.button>
        </div>
      </motion.div>

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

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-800/50 p-1 rounded-xl">
        {[
          { id: 'dashboard', label: 'Overview', icon: BarChart3 },
          { id: 'templates', label: 'Report Templates', icon: FileText },
          { id: 'generated', label: 'Generated Reports', icon: Download },
          { id: 'scheduled', label: 'Scheduled Reports', icon: Clock },
          { id: 'analytics', label: 'Report Analytics', icon: TrendingUp }
        ].map(tab => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
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
          {activeTab === 'dashboard' && (
            <>
              {/* Metrics Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-600/20 rounded-xl">
                      <FileText className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">{reportConfigs.length}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Total Reports</h3>
                  <p className="text-xs text-gray-500">Configured report templates</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-600/20 rounded-xl">
                      <Download className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">{generatedReports.length}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Generated</h3>
                  <p className="text-xs text-gray-500">Reports ready for download</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-600/20 rounded-xl">
                      <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">
                      {reportConfigs.filter(r => r.type === 'scheduled').length}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Scheduled</h3>
                  <p className="text-xs text-gray-500">Automated report generation</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-600/20 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-orange-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">
                      {Object.values(reportMetrics).reduce((sum, category) =>
                        sum + Object.keys(category).length, 0
                      )}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Data Points</h3>
                  <p className="text-xs text-gray-500">Available metrics for reporting</p>
                </motion.div>
              </div>

              {/* Key Metrics Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Platform Metrics Summary</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Automation Metrics */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-purple-400 uppercase tracking-wide">Automation</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Active Workflows</span>
                        <span className="text-white font-medium">{reportMetrics.automationMetrics.activeWorkflows}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Success Rate</span>
                        <span className="text-green-400 font-medium">{reportMetrics.automationMetrics.successRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Avg Execution</span>
                        <span className="text-white font-medium">{reportMetrics.automationMetrics.avgExecutionTime}s</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Metrics */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-green-400 uppercase tracking-wide">AI Generation</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Generated</span>
                        <span className="text-white font-medium">{reportMetrics.aiMetrics.totalGenerations}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Landing Pages</span>
                        <span className="text-blue-400 font-medium">{reportMetrics.aiMetrics.landingPageGenerations}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Success Rate</span>
                        <span className="text-green-400 font-medium">
                          {((reportMetrics.aiMetrics.successfulGenerations / reportMetrics.aiMetrics.totalGenerations) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Business Metrics */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-blue-400 uppercase tracking-wide">Business</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Active Clients</span>
                        <span className="text-white font-medium">{reportMetrics.businessMetrics.activeClients}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Revenue Impact</span>
                        <span className="text-green-400 font-medium">${reportMetrics.businessMetrics.revenueImpact.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Time Saved</span>
                        <span className="text-orange-400 font-medium">{reportMetrics.businessMetrics.timeSaved}h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Quick Report Generation</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportTemplates.slice(0, 6).map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-purple-500/30 transition-all cursor-pointer group"
                      onClick={() => handleQuickGenerate(template)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg bg-${template.color}-600/20`}>
                          <Icon
                            name={template.icon as any}
                            className={`w-5 h-5 text-${template.color}-400`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm truncate">{template.name}</h4>
                          <p className="text-xs text-gray-400">{template.estimatedTime}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{template.description}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{template.dataPoints} data points</span>
                        <div className="flex items-center space-x-1 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs">Generate</span>
                          <Download className="w-3 h-3" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {activeTab === 'templates' && (
            <>
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search report templates..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="comprehensive">Comprehensive</option>
                    <option value="automation">Automation</option>
                    <option value="ai">AI Analytics</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="performance">Performance</option>
                  </select>
                </div>
              </div>

              {/* Report Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-effect rounded-2xl p-6 hover:border-purple-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${template.color}-600/20`}>
                        <Icon
                          name={template.icon as any}
                          className={`w-8 h-8 text-${template.color}-400`}
                        />
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full bg-${template.color}-600/20 text-${template.color}-400`}>
                        {template.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{template.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Sections:</span>
                        <span className="text-white">{template.sections.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Data Points:</span>
                        <span className="text-white">{template.dataPoints}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Est. Time:</span>
                        <span className="text-white">{template.estimatedTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickGenerate(template)}
                        className="flex-1 flex items-center justify-center space-x-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Generate</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTemplateSelect(template)}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No templates found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'generated' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Generated Reports</h3>
                <div className="text-sm text-gray-400">
                  {generatedReports.length} report{generatedReports.length !== 1 ? 's' : ''}
                </div>
              </div>

              {generatedReports.length > 0 ? (
                <div className="space-y-4">
                  {generatedReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-600/20 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{report.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>{formatFileSize(report.size)}</span>
                              <span>Generated: {format(new Date(report.generatedAt), 'MMM dd, yyyy HH:mm')}</span>
                              <span>Downloads: {report.downloadCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                            {report.format.toUpperCase()}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No reports generated yet</h3>
                  <p className="text-gray-500 mb-4">Generate your first report from the templates</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('templates')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Browse Templates
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'scheduled' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Scheduled Reports</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule Report</span>
                </motion.button>
              </div>

              {reportConfigs.filter(r => r.type === 'scheduled').length > 0 ? (
                <div className="space-y-4">
                  {reportConfigs.filter(r => r.type === 'scheduled').map((config, index) => (
                    <motion.div
                      key={config.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-green-600/20 rounded-lg">
                            <Clock className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{config.name}</h4>
                            <p className="text-sm text-gray-400">{config.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white">
                            Every {config.schedule?.frequency} at {config.schedule?.time}
                          </div>
                          <div className="text-xs text-gray-400">{config.schedule?.timezone}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          {config.recipients && config.recipients.length > 0 && (
                            <span>📧 {config.recipients.length} recipient{config.recipients.length !== 1 ? 's' : ''}</span>
                          )}
                          {config.lastGenerated && (
                            <span>Last: {format(new Date(config.lastGenerated), 'MMM dd, HH:mm')}</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleGenerateReport(config.id)}
                            disabled={isGenerating === config.id}
                            className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-sm transition-colors"
                          >
                            {isGenerating === config.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              'Run Now'
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditingReport(config)}
                            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm transition-colors"
                          >
                            Edit
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No scheduled reports</h3>
                  <p className="text-gray-500 mb-4">Set up automated reports to be generated regularly</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Schedule First Report
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Report Usage Analytics */}
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Report Usage Analytics</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {generatedReports.reduce((sum, report) => sum + report.downloadCount, 0)}
                    </div>
                    <div className="text-sm text-gray-400">Total Downloads</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {Math.round(generatedReports.reduce((sum, report) => sum + report.size, 0) / 1024 / 1024)}MB
                    </div>
                    <div className="text-sm text-gray-400">Data Generated</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {reportConfigs.filter(r => r.type === 'scheduled').length}
                    </div>
                    <div className="text-sm text-gray-400">Active Schedules</div>
                  </div>
                </div>
              </div>

              {/* Most Popular Templates */}
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Popular Report Templates</h3>

                <div className="space-y-4">
                  {reportTemplates.slice(0, 5).map((template, index) => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${template.color}-600/20`}>
                          <Icon
                            name={template.icon as any}
                            className={`w-4 h-4 text-${template.color}-400`}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{template.name}</h4>
                          <p className="text-sm text-gray-400">{template.category}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{Math.floor(Math.random() * 50) + 10} uses</div>
                        <div className="text-xs text-gray-400">This month</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedTemplate ? `Configure ${selectedTemplate.name}` : 'Create Custom Report'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedTemplate(null);
                  setFormData({
                    name: '',
                    description: '',
                    type: 'on_demand',
                    format: 'pdf',
                    template: null,
                    schedule: {
                      frequency: 'weekly',
                      time: '09:00',
                      timezone: 'UTC'
                    },
                    filters: {
                      dateRange: {
                        start: subDays(new Date(), 30).getTime(),
                        end: new Date().getTime()
                      },
                      sections: [],
                      metrics: [],
                      includeTrends: true,
                      includeCharts: true,
                      includeRawData: false
                    },
                    recipients: ['']
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Report Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter report name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="pdf">PDF Report</option>
                    <option value="csv">CSV Data</option>
                    <option value="json">JSON Data</option>
                    <option value="html">HTML Report</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe what this report includes..."
                />
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Report Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setFormData({ ...formData, type: 'on_demand' })}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      formData.type === 'on_demand'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <h4 className="font-medium text-white mb-1">On Demand</h4>
                    <p className="text-sm text-gray-400">Generate manually when needed</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setFormData({ ...formData, type: 'scheduled' })}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      formData.type === 'scheduled'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <h4 className="font-medium text-white mb-1">Scheduled</h4>
                    <p className="text-sm text-gray-400">Generate automatically on schedule</p>
                  </motion.div>
                </div>
              </div>

              {/* Schedule Settings */}
              {formData.type === 'scheduled' && (
                <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="font-medium text-white">Schedule Settings</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                      <select
                        value={formData.schedule.frequency}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, frequency: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                      <input
                        type="time"
                        value={formData.schedule.time}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, time: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                      <select
                        value={formData.schedule.timezone}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, timezone: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Recipients</label>
                    <textarea
                      value={formData.recipients.join('\n')}
                      onChange={(e) => setFormData({
                        ...formData,
                        recipients: e.target.value.split('\n').filter(email => email.trim())
                      })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="user@example.com (one per line)"
                    />
                  </div>
                </div>
              )}

              {/* Report Options */}
              <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
                <h4 className="font-medium text-white">Report Options</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.filters.includeTrends}
                      onChange={(e) => setFormData({
                        ...formData,
                        filters: { ...formData.filters, includeTrends: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">Include Trends</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.filters.includeCharts}
                      onChange={(e) => setFormData({
                        ...formData,
                        filters: { ...formData.filters, includeCharts: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">Include Charts</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.filters.includeRawData}
                      onChange={(e) => setFormData({
                        ...formData,
                        filters: { ...formData.filters, includeRawData: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">Include Raw Data</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedTemplate(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    createReportConfig({
                      name: formData.name,
                      description: formData.description,
                      type: formData.type,
                      format: formData.format,
                      schedule: formData.type === 'scheduled' ? formData.schedule : undefined,
                      filters: formData.filters,
                      recipients: formData.type === 'scheduled' ? formData.recipients.filter(email => email.trim()) : undefined
                    });
                    setShowCreateModal(false);
                    setSelectedTemplate(null);
                  }}
                  disabled={!formData.name.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Create Report
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedReports;