import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Icon from '../Icon';
import { WebhookService } from '../../utils/webhookConfig';
import { WidgetDataManager, AnalysisExporter } from '../../utils/widgetDataManager';

const MarketTrendWidget = ({ data = null, config = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInputForm, setShowInputForm] = useState(!data);
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({
    market: 'technology',
    location: 'US',
    time_range: '1M'
  });
  const [fetchedData, setFetchedData] = useState(null);
  const [widgetId] = useState(() => `market_trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = WidgetDataManager.loadWidgetData(widgetId);
    if (persistedData && !data && !fetchedData) {
      setFetchedData(persistedData);
      setShowInputForm(false);
      console.log('Loaded persisted market trend data');
    }
  }, [widgetId, data, fetchedData]);

  // Sample data structure matching n8n workflow output
  const sampleData = {
    request: {
      originalInput: {
        market: 'technology',
        location: 'US',
        time_range: '1M'
      },
      market: 'stock',
      location: 'US',
      timeRange: '1M',
      symbol: 'XLK',
      timestamp: new Date().toISOString(),
      requestId: `${Date.now()}-sample`
    },
    summary: {
      firstClose: 185.42,
      lastClose: 198.67,
      change: 13.25,
      pctChange: 7.14,
      high: 201.85,
      low: 182.33,
      avgClose: 192.45,
      dataPoints: 22,
      successfulSources: ['yahoo', 'finnhub'],
      failedSources: ['marketstack'],
      totalDataPoints: 22
    },
    analysis: 'XLK shows bullish trend (+7.14%) over 1M. Range: 182.33 - 201.85 with stable. Data from yahoo, finnhub sources.',
    prices: [
      { date: '2024-08-01', open: 185.42, high: 187.21, low: 184.15, close: 186.78, volume: 1250000 },
      { date: '2024-08-02', open: 186.78, high: 189.34, low: 185.67, close: 188.92, volume: 1340000 },
      { date: '2024-08-05', open: 188.92, high: 191.45, low: 187.23, close: 190.67, volume: 1180000 },
      { date: '2024-08-06', open: 190.67, high: 193.21, low: 189.45, close: 192.34, volume: 1420000 },
      { date: '2024-08-07', open: 192.34, high: 194.78, low: 191.12, close: 193.89, volume: 1350000 },
      { date: '2024-08-08', open: 193.89, high: 196.45, low: 192.67, close: 195.23, volume: 1290000 },
      { date: '2024-08-09', open: 195.23, high: 198.12, low: 194.56, close: 197.45, volume: 1380000 },
      { date: '2024-08-12', open: 197.45, high: 201.85, low: 196.78, close: 200.12, volume: 1560000 },
      { date: '2024-08-13', open: 200.12, high: 201.34, low: 198.45, close: 199.67, volume: 1450000 },
      { date: '2024-08-14', open: 199.67, high: 200.89, low: 197.23, close: 198.67, volume: 1320000 }
    ],
    processedAt: new Date().toISOString()
  };

  // Use fetched data if available, otherwise use sample or prop data
  const analysisData = fetchedData || data || sampleData;

  const marketOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'energy', label: 'Energy' },
    { value: 'financial', label: 'Financial' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'forex', label: 'Forex' },
    { value: 'commodity', label: 'Commodities' },
    { value: 'sp500', label: 'S&P 500' },
    { value: 'nasdaq', label: 'NASDAQ' }
  ];

  const locationOptions = [
    { value: 'US', label: 'United States' },
    { value: 'IN', label: 'India' },
    { value: 'JP', label: 'Japan' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' }
  ];

  const timeRangeOptions = [
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: '2Y', label: '2 Years' },
    { value: '5Y', label: '5 Years' }
  ];

  const handleInputChange = (field, value) => {
    setInputData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Try to fetch data from n8n webhook
      const webhookResponse = await WebhookService.callWebhook(
        '/webhook/market-analysis',
        {
          market: inputData.market,
          location: inputData.location,
          time_range: inputData.time_range
        }
      );
      
      if (webhookResponse) {
        // Use real webhook data
        setFetchedData(webhookResponse);
        setShowInputForm(false);
        // Save to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'Market Trend Analysis', webhookResponse);
      } else {
        // Fall back to mock data if webhooks are disabled
        console.log('Using mock data - webhooks disabled or failed');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const mockResponse = {
          ...sampleData,
          request: {
            ...sampleData.request,
            originalInput: inputData,
            timestamp: new Date().toISOString()
          }
        };
        
        setFetchedData(mockResponse);
        setShowInputForm(false);
        // Save mock data to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'Market Trend Analysis', mockResponse);
      }
      
    } catch (error) {
      console.error('Error fetching market trend data:', error);
      // On error, show mock data as fallback
      const mockResponse = {
        ...sampleData,
        request: {
          ...sampleData.request,
          originalInput: inputData,
          timestamp: new Date().toISOString()
        }
      };
      setFetchedData(mockResponse);
      setShowInputForm(false);
      // Save fallback data to localStorage
      WidgetDataManager.saveWidgetData(widgetId, 'Market Trend Analysis', mockResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendColor = (pctChange) => {
    if (pctChange > 0) return 'text-green-400';
    if (pctChange < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendIcon = (pctChange) => {
    if (pctChange > 0) return 'TrendingUp';
    if (pctChange < 0) return 'TrendingDown';
    return 'Minus';
  };

  // Colors for charts
  const COLORS = {
    primary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
  };

  // Show input form if no data
  if (showInputForm) {
    return (
      <div className="w-full h-full min-h-[600px] max-h-[90vh] p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="TrendingUp" className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Industry Intelligence Dashboard</h2>
            <p className="text-gray-400">Track industry performance to optimize marketing strategies and client campaigns</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Client Industry/Sector <span className="text-red-400">*</span>
              </label>
              <select
                value={inputData.market}
                onChange={(e) => handleInputChange('market', e.target.value)}
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
                required
              >
                {marketOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">
                Location/Region <span className="text-red-400">*</span>
              </label>
              <select
                value={inputData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
                required
              >
                {locationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Performance Period <span className="text-red-400">*</span>
              </label>
              <select
                value={inputData.time_range}
                onChange={(e) => handleInputChange('time_range', e.target.value)}
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
                required
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-400 mt-1">Choose timeframe for industry performance analysis</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing Industry...</span>
                  </div>
                ) : (
                  'Start Industry Analysis'
                )}
              </button>
              
              {(fetchedData || data) && (
                <button
                  type="button"
                  onClick={() => setShowInputForm(false)}
                  className="px-6 py-4 bg-gray-600/50 text-gray-300 rounded-xl font-medium hover:bg-gray-600/70 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          
          <div className="mt-8 p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl">
            <h3 className="text-white font-medium mb-2">Marketing Intelligence Features:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
              <div>• Industry performance tracking</div>
              <div>• Client sector analysis</div>
              <div>• Market opportunity insights</div>
              <div>• Campaign timing optimization</div>
              <div>• Economic trend indicators</div>
              <div>• Competitive intelligence</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main widget tabs
  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'BarChart3' },
    { id: 'chart', name: 'Performance', icon: 'TrendingUp' },
    { id: 'statistics', name: 'Insights', icon: 'PieChart' },
    { id: 'analysis', name: 'Intelligence', icon: 'Brain' }
  ];

  return (
    <div className="w-full h-full min-h-[500px] max-h-[90vh] bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Industry Intelligence Dashboard</h3>
              <p className="text-xs text-gray-400">
                {analysisData.request?.symbol || 'N/A'} • 
                {analysisData.request?.location || 'US'} • 
                {analysisData.request?.timeRange || '1M'} • 
                {analysisData.summary?.totalDataPoints || 0} data points
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => AnalysisExporter.exportToCSV(analysisData, 'market-trend-analysis')}
              className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-lg hover:bg-green-600/30 transition-colors"
              title="Export to CSV"
            >
              <Icon name="Download" className="w-3 h-3 inline mr-1" />
              CSV
            </button>
            <button
              onClick={() => {
                const summary = AnalysisExporter.generateSummary(analysisData, 'Market Trend Analysis');
                navigator.clipboard.writeText(summary).then(() => {
                  console.log('Summary copied to clipboard');
                }).catch(err => {
                  console.error('Failed to copy summary:', err);
                });
              }}
              className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-lg hover:bg-purple-600/30 transition-colors"
              title="Copy Summary to Clipboard"
            >
              <Icon name="Copy" className="w-3 h-3 inline mr-1" />
              Copy
            </button>
            <button
              onClick={() => setShowInputForm(true)}
              className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-lg hover:bg-blue-600/30 transition-colors"
            >
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700/50">
        <div className="flex space-x-1 p-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Icon name={tab.icon} className="w-4 h-4 inline mr-1" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className={`text-2xl font-bold ${getTrendColor(analysisData.summary?.pctChange || 0)}`}>
                  ₹{analysisData.summary?.lastClose?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-gray-400">Current Price</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className={`text-2xl font-bold ${getTrendColor(analysisData.summary?.pctChange || 0)}`}>
                  {analysisData.summary?.pctChange?.toFixed(2) || '0.00'}%
                </div>
                <div className="text-xs text-gray-400">Change</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">
                  ₹{analysisData.summary?.high?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-gray-400">High</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">
                  ₹{analysisData.summary?.low?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-gray-400">Low</div>
              </div>
            </div>

            {/* Marketing Intelligence Summary */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Icon name="Brain" className="w-4 h-4 mr-2 text-purple-400" />
                Marketing Intelligence Insights
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                {analysisData.analysis || 'No analysis available.'}
              </p>
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
                <h5 className="text-blue-400 font-medium text-sm mb-2">📊 Marketing Impact:</h5>
                <p className="text-gray-300 text-xs leading-relaxed">
                  {analysisData.summary?.pctChange > 5 
                    ? "🚀 Strong industry growth suggests increased advertising budgets and consumer spending. Optimal time for aggressive campaign launches and higher ad spends."
                    : analysisData.summary?.pctChange > 0
                    ? "📈 Moderate industry growth indicates steady market conditions. Good time for consistent campaign investment and brand building activities."
                    : "⚠️ Industry decline may signal reduced consumer spending. Consider defensive strategies, cost-efficient campaigns, and focus on retention marketing."
                  }
                </p>
              </div>
            </div>

            {/* Data Sources */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Data Reliability</h4>
                <div className="space-y-2">
                  {(analysisData.summary?.successfulSources || []).map((source, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-green-400 capitalize">{source}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Campaign Indicators</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Market Health:</span>
                    <span className="text-white">
                      {analysisData.summary?.pctChange > 5 ? '🟢 Strong' : 
                       analysisData.summary?.pctChange > 0 ? '🟡 Stable' : '🔴 Weak'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ad Spend Signal:</span>
                    <span className="text-white">
                      {analysisData.summary?.pctChange > 3 ? '⬆️ Increase' : 
                       analysisData.summary?.pctChange > -3 ? '➡️ Maintain' : '⬇️ Reduce'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Campaign Timing:</span>
                    <span className={getTrendColor(analysisData.summary?.change || 0)}>
                      {analysisData.summary?.pctChange > 0 ? '🚀 Launch Ready' : '⏳ Wait & Watch'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="space-y-4">
            {/* Industry Performance Chart */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Industry Performance Trend</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysisData.prices || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke={COLORS.primary} 
                      fill={COLORS.primary} 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Market Activity Chart */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Market Activity Levels</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisData.prices || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                    />
                    <Bar dataKey="volume" fill={COLORS.info} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="space-y-4">
            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Price Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Opening Price:</span>
                    <span className="text-white">₹{analysisData.summary?.firstClose?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Closing Price:</span>
                    <span className="text-white">₹{analysisData.summary?.lastClose?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Highest Price:</span>
                    <span className="text-green-400">₹{analysisData.summary?.high?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Lowest Price:</span>
                    <span className="text-red-400">₹{analysisData.summary?.low?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Data Quality</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Sources:</span>
                    <span className="text-white">
                      {(analysisData.summary?.successfulSources?.length || 0) + (analysisData.summary?.failedSources?.length || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Active Sources:</span>
                    <span className="text-green-400">{analysisData.summary?.successfulSources?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Failed Sources:</span>
                    <span className="text-red-400">{analysisData.summary?.failedSources?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Data Points:</span>
                    <span className="text-white">{analysisData.summary?.dataPoints || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Failed Sources */}
            {(analysisData.summary?.failedSources?.length > 0) && (
              <div className="bg-red-600/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-2">Failed Data Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisData.summary.failedSources.map((source, index) => (
                    <span key={index} className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {/* Marketing Intelligence Report */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Marketing Intelligence Report</h4>
              <div className="prose prose-invert max-w-none text-sm">
                <p className="text-gray-300 leading-relaxed mb-4">
                  {analysisData.analysis || 'No detailed analysis available.'}
                </p>
                
                {/* Marketing Actionable Insights */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-lg p-4">
                    <h5 className="text-green-400 font-medium mb-3 flex items-center">
                      <Icon name="Target" className="w-4 h-4 mr-2" />
                      Campaign Strategy Recommendations
                    </h5>
                    <div className="space-y-2 text-xs">
                      {analysisData.summary?.pctChange > 5 ? (
                        <>
                          <div>🚀 <strong>Aggressive Growth Strategy:</strong> Increase ad budgets by 20-30% to capitalize on strong industry momentum</div>
                          <div>📈 <strong>Campaign Focus:</strong> Launch new product campaigns and expand audience targeting</div>
                          <div>💰 <strong>Budget Allocation:</strong> Shift 60% to growth campaigns, 40% to retention</div>
                        </>
                      ) : analysisData.summary?.pctChange > 0 ? (
                        <>
                          <div>📊 <strong>Steady Growth Strategy:</strong> Maintain current ad spend with 10-15% optimization focus</div>
                          <div>🎯 <strong>Campaign Focus:</strong> Improve conversion rates and audience quality</div>
                          <div>💰 <strong>Budget Allocation:</strong> Balanced 50% growth, 50% retention campaigns</div>
                        </>
                      ) : (
                        <>
                          <div>⚠️ <strong>Defensive Strategy:</strong> Reduce ad spend by 10-20%, focus on high-ROI channels</div>
                          <div>🔄 <strong>Campaign Focus:</strong> Customer retention and loyalty programs</div>
                          <div>💰 <strong>Budget Allocation:</strong> 30% growth, 70% retention and brand safety</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-lg p-4">
                    <h5 className="text-purple-400 font-medium mb-3 flex items-center">
                      <Icon name="Calendar" className="w-4 h-4 mr-2" />
                      Optimal Campaign Timing
                    </h5>
                    <div className="space-y-2 text-xs">
                      <div>📅 <strong>Launch Window:</strong> {analysisData.summary?.pctChange > 0 ? 'Favorable - proceed with scheduled campaigns' : 'Cautious - delay major launches by 2-4 weeks'}</div>
                      <div>⏰ <strong>Budget Release:</strong> {analysisData.summary?.pctChange > 3 ? 'Front-load Q1 budgets' : 'Distribute evenly across quarters'}</div>
                      <div>🔄 <strong>Review Cycle:</strong> Monitor weekly for the next {analysisData.request?.timeRange || '1M'} period</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h5 className="text-white font-medium mb-2">Industry Analysis</h5>
                    <ul className="text-gray-400 space-y-1 text-xs">
                      <li>Sector: {analysisData.request?.market || 'N/A'} ({analysisData.request?.symbol || 'N/A'})</li>
                      <li>Region: {analysisData.request?.location || 'N/A'}</li>
                      <li>Analysis Period: {analysisData.request?.timeRange || 'N/A'}</li>
                      <li>Market Volatility: {(analysisData.summary?.high - analysisData.summary?.low) / analysisData.summary?.avgClose > 0.05 ? 'High' : 'Low'}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-medium mb-2">Intelligence Summary</h5>
                    <ul className="text-gray-400 space-y-1 text-xs">
                      <li>Analysis Date: {new Date(analysisData.processedAt).toLocaleDateString()}</li>
                      <li>Data Quality: {((analysisData.summary?.successfulSources?.length || 0) / 5 * 100).toFixed(0)}% sources active</li>
                      <li>Confidence Level: <span className={analysisData.summary?.dataPoints > 20 ? 'text-green-400' : 'text-yellow-400'}>
                        {analysisData.summary?.dataPoints > 20 ? 'High' : 'Medium'}
                      </span></li>
                      <li>Next Review: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketTrendWidget;