import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  Cell
} from 'recharts';
import { format, subDays } from 'date-fns';
import Icon from './Icon';
import { useHistoryStore } from '../stores/historyStore';
import { TimeSeriesData, DataExportOptions } from '../types';

interface HistoryProps {
  className?: string;
}


const History: React.FC<HistoryProps> = ({ className = '' }) => {
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

  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'details'>('overview');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [showFilters, setShowFilters] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');

  // Load data on component mount and when date range changes
  useEffect(() => {
    loadHistoryData(selectedDateRange);
  }, [selectedDateRange, loadHistoryData]);

  // Generate sample data if no data exists
  useEffect(() => {
    const hasData = Object.keys(timeSeriesData).length > 0;
    if (!hasData && !isLoading) {
      generateSampleData();
    }
  }, [timeSeriesData, isLoading, generateSampleData]);

  // Transform time series data for charts
  const chartData = useMemo(() => {
    // Add null checks
    if (!timeSeriesData || typeof timeSeriesData !== 'object') {
      return [];
    }

    const metrics = Object.values(timeSeriesData);
    if (metrics.length === 0) return [];

    // Get all unique timestamps
    const timestamps = new Set<number>();
    
    try {
      metrics.forEach(metric => {
        if (metric && metric.data && Array.isArray(metric.data)) {
          metric.data.forEach(point => {
            if (point && typeof point.timestamp === 'number') {
              timestamps.add(point.timestamp);
            }
          });
        }
      });

      // Sort timestamps
      const sortedTimestamps = Array.from(timestamps).sort();

      // Create chart data
      return sortedTimestamps.map(timestamp => {
        const dataPoint: any = {
          timestamp,
          date: format(new Date(timestamp), 'MMM dd'),
          fullDate: format(new Date(timestamp), 'MMM dd, yyyy')
        };

        metrics.forEach(metric => {
          if (metric && metric.data && Array.isArray(metric.data)) {
            const point = metric.data.find(p => p && p.timestamp === timestamp);
            dataPoint[metric.metric] = point ? 
              (typeof point.value === 'number' ? point.value : 0) : 0;
          }
        });

        return dataPoint;
      });
    } catch (error) {
      console.error('Error processing chart data:', error);
      return [];
    }
  }, [timeSeriesData]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats: Record<string, any> = {};

    Object.entries(timeSeriesData).forEach(([metric, data]) => {
      const values = data.data
        .map(point => typeof point.value === 'number' ? point.value : 0)
        .filter(v => v !== 0);

      if (values.length > 0) {
        stats[metric] = {
          total: values.reduce((sum, v) => sum + v, 0),
          average: values.reduce((sum, v) => sum + v, 0) / values.length,
          max: Math.max(...values),
          min: Math.min(...values),
          trend: values.length > 1 ? 
            (values[values.length - 1] > values[0] ? 'up' : 'down') : 'neutral'
        };
      }
    });

    return stats;
  }, [timeSeriesData]);

  // Handle export
  const handleExport = async () => {
    const options: DataExportOptions = {
      format: exportFormat,
      dateRange: selectedDateRange,
      metrics: selectedMetrics,
      includeCharts: exportFormat === 'pdf',
      filename: `history_export_${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`
    };

    try {
      await exportData(options);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Chart colors
  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-gray-300 text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey}: {entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
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
          <h1 className="text-3xl font-bold text-white mb-2">Data History</h1>
          <p className="text-gray-400">
            Comprehensive view of your dashboard metrics over time
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Quick date range buttons */}
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map(range => (
              <motion.button
                key={range}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQuickDateRange(range as any)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                {range}
              </motion.button>
            ))}
          </div>

          {/* Filters button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Icon name="Settings" className="w-4 h-4" />
            <span>Filters</span>
          </motion.button>

          {/* Export button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Icon name="DollarSign" className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-effect rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Filters & Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
                <option value="bar">Bar Chart</option>
              </select>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF Report</option>
              </select>
            </div>

            {/* Metrics Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selected Metrics
              </label>
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {['widget_interactions', 'active_sessions', 'page_load_time', 'user_satisfaction'].map(metric => (
                  <label key={metric} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMetrics([...selectedMetrics, metric]);
                        } else {
                          setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">{metric.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-effect rounded-2xl p-8 text-center"
        >
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading historical data...</p>
        </motion.div>
      )}

      {/* Content Tabs */}
      {!isLoading && (
        <>
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl">
            {[
              { id: 'overview', label: 'Overview', icon: 'BarChart3' },
              { id: 'trends', label: 'Trends', icon: 'TrendingUp' },
              { id: 'details', label: 'Details', icon: 'Activity' }
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
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(summaryStats).map(([metric, stats], index) => (
                    <motion.div
                      key={metric}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-effect rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          {metric.replace(/_/g, ' ')}
                        </h3>
                        <Icon 
                          name={stats.trend === 'up' ? 'TrendingUp' : 'TrendingUp'} 
                          className={`w-5 h-5 ${
                            stats.trend === 'up' ? 'text-green-400' : 'text-red-400'
                          }`} 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total:</span>
                          <span className="text-white font-mono">{stats.total.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Average:</span>
                          <span className="text-white font-mono">{stats.average.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max:</span>
                          <span className="text-white font-mono">{stats.max.toFixed(1)}</span>
                        </div>
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
                  <h3 className="text-xl font-semibold text-white mb-6">Metrics Over Time</h3>
                  
                  {chartData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'line' && (
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {selectedMetrics.map((metric, index) => (
                              <Line
                                key={metric}
                                type="monotone"
                                dataKey={metric}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                              />
                            ))}
                          </LineChart>
                        )}
                        
                        {chartType === 'area' && (
                          <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {selectedMetrics.map((metric, index) => (
                              <Area
                                key={metric}
                                type="monotone"
                                dataKey={metric}
                                stroke={colors[index % colors.length]}
                                fill={colors[index % colors.length]}
                                fillOpacity={0.3}
                              />
                            ))}
                          </AreaChart>
                        )}
                        
                        {chartType === 'bar' && (
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {selectedMetrics.map((metric, index) => (
                              <Bar
                                key={metric}
                                dataKey={metric}
                                fill={colors[index % colors.length]}
                              />
                            ))}
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-400">
                      No data available for the selected time range
                    </div>
                  )}
                </motion.div>
              </>
            )}

            {activeTab === 'trends' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Analysis */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <h3 className="text-xl font-semibold text-white mb-6">Trend Analysis</h3>
                  <div className="space-y-4">
                    {analyticsMetrics.map((metric, index) => (
                      <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">{metric.name}</h4>
                          <p className="text-sm text-gray-400">{metric.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {metric.value} {metric.unit}
                          </div>
                          {metric.change !== undefined && (
                            <div className={`text-sm ${
                              metric.changeType === 'increase' ? 'text-green-400' : 
                              metric.changeType === 'decrease' ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Distribution Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <h3 className="text-xl font-semibold text-white mb-6">Metric Distribution</h3>
                  {analyticsMetrics.length > 0 && (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsMetrics.map((metric, index) => ({
                              name: metric.name,
                              value: metric.value,
                              fill: colors[index % colors.length]
                            }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {analyticsMetrics.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {activeTab === 'details' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Detailed Data</h3>
                
                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        {selectedMetrics.map(metric => (
                          <th key={metric} className="px-6 py-3">
                            {metric.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="px-6 py-4 text-white">{row.fullDate}</td>
                          {selectedMetrics.map(metric => (
                            <td key={metric} className="px-6 py-4 text-gray-300">
                              {row[metric]?.toFixed(2) || 0}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {chartData.length > 10 && (
                  <p className="text-gray-400 text-center mt-4">
                    Showing first 10 rows of {chartData.length} total records
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default React.memo(History);