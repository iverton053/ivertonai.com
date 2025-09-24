import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import Icon from './Icon';
import { useHistoryStore } from '../stores/historyStore';
import { ReportConfig, GeneratedReport } from '../types';

interface ReportsProps {
  className?: string;
}

const Reports: React.FC<ReportsProps> = ({ className = '' }) => {
  const {
    reportConfigs,
    generatedReports,
    isLoading,
    error,
    createReportConfig,
    updateReportConfig,
    deleteReportConfig,
    generateReport,
    clearError
  } = useHistoryStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'scheduled'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportConfig | null>(null);
  
  // Form state for creating/editing reports
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'on_demand' as 'scheduled' | 'on_demand',
    format: 'pdf' as 'pdf' | 'csv' | 'json' | 'html',
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
      metrics: ['widget_interactions', 'active_sessions'],
      widgets: []
    },
    recipients: ['']
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!showCreateModal && !editingReport) {
      setFormData({
        name: '',
        description: '',
        type: 'on_demand',
        format: 'pdf',
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
          metrics: ['widget_interactions', 'active_sessions'],
          widgets: []
        },
        recipients: ['']
      });
    }
  }, [showCreateModal, editingReport]);

  // Populate form when editing
  useEffect(() => {
    if (editingReport) {
      setFormData({
        name: editingReport.name,
        description: editingReport.description || '',
        type: editingReport.type,
        format: editingReport.format,
        schedule: editingReport.schedule || {
          frequency: 'weekly',
          time: '09:00',
          timezone: 'UTC'
        },
        filters: editingReport.filters,
        recipients: editingReport.recipients || ['']
      });
    }
  }, [editingReport]);

  const handleCreateReport = () => {
    if (!formData.name.trim()) return;

    const reportData = {
      ...formData,
      recipients: formData.recipients.filter(email => email.trim())
    };

    if (editingReport) {
      updateReportConfig(editingReport.id, reportData);
      setEditingReport(null);
    } else {
      createReportConfig(reportData);
      setShowCreateModal(false);
    }
  };

  const handleGenerateReport = async (configId: string) => {
    try {
      await generateReport(configId);
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const handleDeleteReport = (id: string) => {
    if (window.confirm('Are you sure you want to delete this report configuration?')) {
      deleteReportConfig(id);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
          <p className="text-gray-400">
            Create, schedule, and manage comprehensive dashboard reports
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Icon name="Plus" className="w-4 h-4" />
          <span>New Report</span>
        </motion.button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Icon name="AlertCircle" className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-300 hover:text-red-100 transition-colors"
          >
            <Icon name="X" className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl">
        {[
          { id: 'overview', label: 'All Reports', icon: 'FileText' },
          { id: 'create', label: 'Quick Reports', icon: 'Plus' },
          { id: 'scheduled', label: 'Scheduled', icon: 'Clock' }
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
            <Icon name={tab.icon as any} className="w-4 h-4" />
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
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
            {/* Report Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-600/20 rounded-xl">
                    <Icon name="FileText" className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Total Reports</h3>
                    <p className="text-2xl font-bold text-purple-400">{reportConfigs.length}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-effect rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-600/20 rounded-xl">
                    <Icon name="Clock" className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Scheduled</h3>
                    <p className="text-2xl font-bold text-green-400">
                      {reportConfigs.filter(r => r.type === 'scheduled').length}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-effect rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-600/20 rounded-xl">
                    <Icon name="DollarSign" className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Generated</h3>
                    <p className="text-2xl font-bold text-blue-400">{generatedReports.length}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Report Configurations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Report Configurations</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors"
                >
                  <Icon name="Plus" className="w-4 h-4" />
                  <span>Add Report</span>
                </motion.button>
              </div>

              {reportConfigs.length > 0 ? (
                <div className="space-y-4">
                  {reportConfigs.map((config, index) => (
                    <motion.div
                      key={config.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{config.name}</h4>
                          <p className="text-sm text-gray-400">{config.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            config.type === 'scheduled' 
                              ? 'bg-green-600/20 text-green-400' 
                              : 'bg-blue-600/20 text-blue-400'
                          }`}>
                            {config.type}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                            {config.format.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Created: {format(new Date(config.createdAt), 'MMM dd, yyyy')}</span>
                          {config.lastGenerated && (
                            <span>Last: {format(new Date(config.lastGenerated), 'MMM dd, yyyy')}</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleGenerateReport(config.id)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-sm transition-colors"
                          >
                            Generate
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditingReport(config)}
                            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm transition-colors"
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteReport(config.id)}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm transition-colors"
                          >
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="FileText" className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No reports configured</h3>
                  <p className="text-gray-500 mb-4">Create your first report to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Create Report
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* Generated Reports */}
            {generatedReports.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Generated Reports</h3>
                
                <div className="space-y-4">
                  {generatedReports.slice(0, 5).map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30"
                    >
                      <div>
                        <h4 className="font-medium text-white">{report.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{formatFileSize(report.size)}</span>
                          <span>Generated: {format(new Date(report.generatedAt), 'MMM dd, yyyy HH:mm')}</span>
                          <span>Downloads: {report.downloadCount}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                          {report.format.toUpperCase()}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm transition-colors"
                        >
                          Download
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {activeTab === 'create' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Report Templates */}
            {[
              {
                name: 'Weekly Performance Summary',
                description: 'Comprehensive weekly performance report with key metrics',
                icon: 'TrendingUp',
                color: 'purple',
                template: {
                  name: 'Weekly Performance Summary',
                  type: 'on_demand' as const,
                  format: 'pdf' as const,
                  filters: {
                    dateRange: {
                      start: subDays(new Date(), 7).getTime(),
                      end: new Date().getTime()
                    },
                    metrics: ['widget_interactions', 'active_sessions', 'page_load_time']
                  }
                }
              },
              {
                name: 'Monthly Analytics Report',
                description: 'Detailed monthly analytics with trends and insights',
                icon: 'BarChart3',
                color: 'blue',
                template: {
                  name: 'Monthly Analytics Report',
                  type: 'on_demand' as const,
                  format: 'pdf' as const,
                  filters: {
                    dateRange: {
                      start: subDays(new Date(), 30).getTime(),
                      end: new Date().getTime()
                    },
                    metrics: ['widget_interactions', 'active_sessions', 'user_satisfaction']
                  }
                }
              },
              {
                name: 'Data Export (CSV)',
                description: 'Export raw data in CSV format for external analysis',
                icon: 'DollarSign',
                color: 'green',
                template: {
                  name: 'Data Export',
                  type: 'on_demand' as const,
                  format: 'csv' as const,
                  filters: {
                    dateRange: {
                      start: subDays(new Date(), 30).getTime(),
                      end: new Date().getTime()
                    },
                    metrics: ['widget_interactions', 'active_sessions', 'page_load_time', 'user_satisfaction']
                  }
                }
              }
            ].map((template, index) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass-effect rounded-2xl p-6 cursor-pointer border border-white/10 hover:border-purple-500/30 transition-all"
                onClick={() => {
                  createReportConfig(template.template);
                  // Auto-generate the report after creating it
                  setTimeout(() => {
                    const newConfig = reportConfigs[reportConfigs.length - 1];
                    if (newConfig) {
                      handleGenerateReport(newConfig.id);
                    }
                  }, 100);
                }}
              >
                <div className={`p-3 rounded-xl mb-4 ${
                  template.color === 'purple' ? 'bg-purple-600/20' :
                  template.color === 'blue' ? 'bg-blue-600/20' :
                  'bg-green-600/20'
                }`}>
                  <Icon 
                    name={template.icon as any} 
                    className={`w-8 h-8 ${
                      template.color === 'purple' ? 'text-purple-400' :
                      template.color === 'blue' ? 'text-blue-400' :
                      'text-green-400'
                    }`} 
                  />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                    {template.template.format.toUpperCase()}
                  </span>
                  <Icon name="Plus" className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'scheduled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Scheduled Reports</h3>
            
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
                      <div>
                        <h4 className="font-semibold text-white">{config.name}</h4>
                        <p className="text-sm text-gray-400">{config.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white">
                          {config.schedule?.frequency} at {config.schedule?.time}
                        </div>
                        <div className="text-xs text-gray-400">{config.schedule?.timezone}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {config.recipients && config.recipients.length > 0 && (
                          <span>Recipients: {config.recipients.length}</span>
                        )}
                        {config.lastGenerated && (
                          <span>Last: {format(new Date(config.lastGenerated), 'MMM dd')}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditingReport(config)}
                          className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm transition-colors"
                        >
                          Edit Schedule
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Clock" className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No scheduled reports</h3>
                <p className="text-gray-500 mb-4">Set up automated reports to be generated regularly</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Schedule Report
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Create/Edit Report Modal */}
      {(showCreateModal || editingReport) && (
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
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingReport ? 'Edit Report' : 'Create New Report'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingReport(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Icon name="X" className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Report Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter report name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Format
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
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
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'on_demand', label: 'On Demand', description: 'Generate manually when needed' },
                    { id: 'scheduled', label: 'Scheduled', description: 'Generate automatically on schedule' }
                  ].map(type => (
                    <motion.div
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setFormData({ ...formData, type: type.id as any })}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.type === type.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                      }`}
                    >
                      <h4 className="font-medium text-white mb-1">{type.label}</h4>
                      <p className="text-sm text-gray-400">{type.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Schedule (only for scheduled reports) */}
              {formData.type === 'scheduled' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Schedule Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Frequency
                      </label>
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Time
                      </label>
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Timezone
                      </label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Recipients (one per line)
                    </label>
                    <textarea
                      value={formData.recipients.join('\n')}
                      onChange={(e) => setFormData({
                        ...formData,
                        recipients: e.target.value.split('\n').filter(email => email.trim())
                      })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
              )}

              {/* Metrics Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Include Metrics
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['widget_interactions', 'active_sessions', 'page_load_time', 'user_satisfaction'].map(metric => (
                    <label key={metric} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.filters.metrics?.includes(metric)}
                        onChange={(e) => {
                          const metrics = formData.filters.metrics || [];
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              filters: {
                                ...formData.filters,
                                metrics: [...metrics, metric]
                              }
                            });
                          } else {
                            setFormData({
                              ...formData,
                              filters: {
                                ...formData.filters,
                                metrics: metrics.filter(m => m !== metric)
                              }
                            });
                          }
                        }}
                        className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-300">{metric.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReport(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateReport}
                  disabled={!formData.name.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {editingReport ? 'Update Report' : 'Create Report'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(Reports);