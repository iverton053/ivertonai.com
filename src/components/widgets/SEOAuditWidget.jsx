import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar } from 'recharts';
import Icon from '../Icon';
import { WebhookService } from '../../utils/webhookConfig';
import { WidgetDataManager, AnalysisExporter } from '../../utils/widgetDataManager';

const SEOAuditWidget = ({ data = null, config = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInputForm, setShowInputForm] = useState(!data); // Show form if no data
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({
    website_url: ''
  });
  const [fetchedData, setFetchedData] = useState(null);
  const [widgetId] = useState(() => `seo_audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [searchTerm, setSearchTerm] = useState('');

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = WidgetDataManager.loadWidgetData(widgetId);
    if (persistedData && !data && !fetchedData) {
      setFetchedData(persistedData);
      setShowInputForm(false);
      console.log('Loaded persisted SEO audit data');
    }
  }, [widgetId, data, fetchedData]);

  // Enhanced sample data structure based on n8n SEO audit workflow output
  const sampleData = {
    website_url: 'https://example.com',
    timestamp: new Date().toISOString(),
    seoScore: 78,
    avgLoadTime: 2.3,
    mobileScore: 82,
    desktopScore: 88,
    
    performanceMetrics: {
      seo: 78,
      performance: 85,
      accessibility: 92,
      bestPractices: 76
    },
    
    issuesBreakdown: {
      critical: 2,
      warning: 5,
      passed: 18,
      info: 3
    },
    
    detailedIssues: {
      missingMetaDescription: true,
      slowLoadingPages: false,
      missingAltTags: true,
      h1TagOptimization: false,
      brokenLinks: 3,
      imageCompression: true
    },
    
    brokenLinksDetails: {
      count: 3,
      totalChecked: 25,
      examples: [
        'https://example.com/old-page',
        'https://example.com/missing-image.jpg',
        'https://example.com/broken-link'
      ]
    },
    
    summary: {
      overallHealth: 'Good',
      criticalIssues: 2,
      totalIssues: 7
    }
  };

  const displayData = fetchedData || data || sampleData;
  
  // Extract data from n8n structure if needed (data might be nested)
  const actualData = displayData.json || displayData;
  
  // Safely destructure with fallbacks
  const website_url = actualData.website_url || 'Unknown Site';
  const seoScore = actualData.seoScore || 0;
  const mobileScore = actualData.mobileScore || 0;
  const desktopScore = actualData.desktopScore || 0;
  const avgLoadTime = actualData.avgLoadTime || 0;
  const performanceMetrics = actualData.performanceMetrics || {};
  const issuesBreakdown = actualData.issuesBreakdown || {};
  const detailedIssues = actualData.detailedIssues || {};
  const brokenLinksDetails = actualData.brokenLinksDetails || {};
  const summary = actualData.summary || {};

  const handleInputChange = (value) => {
    setInputData({ website_url: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Try to fetch data from n8n webhook first
      const webhookResponse = await WebhookService.fetchSEOAuditData(inputData.website_url);
      
      if (webhookResponse) {
        // Use real webhook data
        setFetchedData(webhookResponse);
        setShowInputForm(false);
        // Save to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'SEO Audit Dashboard', webhookResponse);
      } else {
        // Fall back to mock data if webhooks are disabled
        console.log('Using mock data - webhooks disabled or failed');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate delay
        
        const mockResponse = {
          ...sampleData,
          website_url: inputData.website_url,
          seoScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
          mobileScore: Math.floor(Math.random() * 40) + 50,
          desktopScore: Math.floor(Math.random() * 40) + 60,
          avgLoadTime: (Math.random() * 3 + 1).toFixed(1),
          performanceMetrics: {
            seo: Math.floor(Math.random() * 40) + 60,
            performance: Math.floor(Math.random() * 50) + 50,
            accessibility: Math.floor(Math.random() * 30) + 70,
            bestPractices: Math.floor(Math.random() * 40) + 60
          },
          summary: {
            overallHealth: Math.random() > 0.5 ? 'Good' : 'Needs Improvement',
            criticalIssues: Math.floor(Math.random() * 5),
            totalIssues: Math.floor(Math.random() * 10) + 2
          }
        };
        
        setFetchedData(mockResponse);
        setShowInputForm(false);
        // Save mock data to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'SEO Audit Dashboard', mockResponse);
      }
      
    } catch (error) {
      console.error('Error fetching SEO audit data:', error);
      // On error, show mock data as fallback
      const mockResponse = {
        ...sampleData,
        website_url: inputData.website_url,
        seoScore: Math.floor(Math.random() * 40) + 60,
        summary: {
          overallHealth: 'Needs Improvement',
          criticalIssues: Math.floor(Math.random() * 5),
          totalIssues: Math.floor(Math.random() * 10) + 2
        }
      };
      setFetchedData(mockResponse);
      setShowInputForm(false);
      // Save fallback data to localStorage
      WidgetDataManager.saveWidgetData(widgetId, 'SEO Audit Dashboard', mockResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreColorBg = (score) => {
    if (score >= 90) return 'bg-green-600/20 border-green-500/30';
    if (score >= 70) return 'bg-yellow-600/20 border-yellow-500/30';
    if (score >= 50) return 'bg-orange-600/20 border-orange-500/30';
    return 'bg-red-600/20 border-red-500/30';
  };

  const getHealthIcon = (health) => {
    switch(health) {
      case 'Excellent': return 'Award';
      case 'Good': return 'CheckCircle';
      case 'Needs Improvement': return 'AlertTriangle';
      case 'Poor': return 'AlertCircle';
      default: return 'Info';
    }
  };

  // Colors for charts
  const COLORS = {
    green: '#10B981',
    blue: '#3B82F6',
    yellow: '#F59E0B',
    orange: '#F97316',
    red: '#EF4444',
    purple: '#8B5CF6',
    gray: '#6B7280'
  };

  // Performance metrics for radial chart
  const performanceData = [
    { name: 'SEO', score: performanceMetrics.seo || 0, fill: COLORS.purple },
    { name: 'Performance', score: performanceMetrics.performance || 0, fill: COLORS.blue },
    { name: 'Accessibility', score: performanceMetrics.accessibility || 0, fill: COLORS.green },
    { name: 'Best Practices', score: performanceMetrics.bestPractices || 0, fill: COLORS.yellow }
  ];

  // Issues breakdown for pie chart
  const issuesData = [
    { name: 'Passed', value: issuesBreakdown.passed || 0, fill: COLORS.green },
    { name: 'Warning', value: issuesBreakdown.warning || 0, fill: COLORS.yellow },
    { name: 'Critical', value: issuesBreakdown.critical || 0, fill: COLORS.red },
    { name: 'Info', value: issuesBreakdown.info || 0, fill: COLORS.blue }
  ];

  // Show input form if no data
  if (showInputForm) {
    return (
      <div className="w-full h-full min-h-[500px] max-h-[700px] p-6 flex items-center justify-center">
        <div className="bg-gray-800/30 p-8 rounded-2xl border border-gray-700/30 w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-500/20 w-fit mx-auto mb-4">
              <Icon name="Search" className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">SEO Audit Dashboard</h2>
            <p className="text-gray-400">Enter your website URL to run a comprehensive SEO audit</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Website URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={inputData.website_url}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="https://your-website.com"
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
              <p className="text-gray-400 text-sm mt-2">We'll analyze your website's SEO performance, page speed, and more</p>
            </div>
            
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
              <h3 className="text-blue-400 font-medium mb-2 flex items-center space-x-2">
                <Icon name="Info" className="w-4 h-4" />
                <span>What we'll analyze:</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Icon name="Zap" className="w-3 h-3 text-green-400" />
                  <span>PageSpeed (Mobile & Desktop)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Search" className="w-3 h-3 text-blue-400" />
                  <span>SEO Score & Best Practices</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Eye" className="w-3 h-3 text-purple-400" />
                  <span>Accessibility Issues</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Link" className="w-3 h-3 text-orange-400" />
                  <span>Broken Links Detection</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Running SEO Audit...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Play" className="w-5 h-5" />
                    <span>Start SEO Audit</span>
                  </>
                )}
              </motion.button>
              
              {(data || fetchedData) && (
                <motion.button
                  type="button"
                  onClick={() => setShowInputForm(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] max-h-[700px] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-500/20">
            <Icon name="Search" className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">SEO Audit Dashboard</h2>
            <p className="text-gray-400">{website_url}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Overall Score</div>
            <div className={`text-3xl font-bold ${getScoreColor(seoScore)}`}>{seoScore}/100</div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => AnalysisExporter.exportToCSV(analysisData, 'seo-audit-analysis')}
              className="px-3 py-2 bg-green-600/20 text-green-400 text-sm rounded-lg hover:bg-green-600/30 transition-colors"
              title="Export to CSV"
            >
              <Icon name="Download" className="w-4 h-4 inline mr-1" />
              CSV
            </button>
            <button
              onClick={() => {
                const summary = AnalysisExporter.generateSummary(analysisData, 'SEO Audit Analysis');
                navigator.clipboard.writeText(summary).then(() => {
                  console.log('Summary copied to clipboard');
                }).catch(err => {
                  console.error('Failed to copy summary:', err);
                });
              }}
              className="px-3 py-2 bg-purple-600/20 text-purple-400 text-sm rounded-lg hover:bg-purple-600/30 transition-colors"
              title="Copy Summary to Clipboard"
            >
              <Icon name="Copy" className="w-4 h-4 inline mr-1" />
              Copy
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInputForm(true)}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all flex items-center space-x-2"
            >
              <Icon name="Plus" className="w-4 h-4" />
              <span>New Audit</span>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className={`p-3 rounded-xl border ${getScoreColorBg(seoScore)}`}>
          <div className="flex items-center justify-between mb-1">
            <Icon name="TrendingUp" className="w-5 h-5 text-blue-400" />
            <span className={`text-xl font-bold ${getScoreColor(seoScore)}`}>{seoScore}</span>
          </div>
          <p className="text-gray-400 text-xs">SEO Score</p>
        </div>
        
        <div className={`p-3 rounded-xl border ${getScoreColorBg(mobileScore)}`}>
          <div className="flex items-center justify-between mb-1">
            <Icon name="Smartphone" className="w-5 h-5 text-green-400" />
            <span className={`text-xl font-bold ${getScoreColor(mobileScore)}`}>{mobileScore}</span>
          </div>
          <p className="text-gray-400 text-xs">Mobile Score</p>
        </div>
        
        <div className={`p-3 rounded-xl border ${getScoreColorBg(desktopScore)}`}>
          <div className="flex items-center justify-between mb-1">
            <Icon name="Monitor" className="w-5 h-5 text-purple-400" />
            <span className={`text-xl font-bold ${getScoreColor(desktopScore)}`}>{desktopScore}</span>
          </div>
          <p className="text-gray-400 text-xs">Desktop Score</p>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="Clock" className="w-5 h-5 text-yellow-400" />
            <span className="text-xl font-bold text-white">{avgLoadTime}s</span>
          </div>
          <p className="text-gray-400 text-xs">Avg Load Time</p>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="AlertTriangle" className="w-5 h-5 text-red-400" />
            <span className="text-xl font-bold text-white">{summary.criticalIssues || 0}</span>
          </div>
          <p className="text-gray-400 text-xs">Critical Issues</p>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="Link" className="w-5 h-5 text-orange-400" />
            <span className="text-xl font-bold text-white">{brokenLinksDetails.count || 0}</span>
          </div>
          <p className="text-gray-400 text-xs">Broken Links</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-gray-800/20 rounded-2xl p-4 border border-gray-700/30 flex-1">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 bg-gray-800/50 p-1 rounded-xl">
          {[
            { id: 'overview', label: 'Overview', icon: 'BarChart3' },
            { id: 'performance', label: 'Performance', icon: 'Zap' },
            { id: 'issues', label: 'Issues', icon: 'AlertTriangle' },
            { id: 'links', label: 'Broken Links', icon: 'Link' },
            { id: 'recommendations', label: 'Recommendations', icon: 'Lightbulb' }
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Icon name={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[350px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Health Status */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-4">Overall Health</h3>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full ${getScoreColorBg(seoScore)} flex items-center justify-center mx-auto mb-4`}>
                    <Icon name={getHealthIcon(summary.overallHealth)} className={`w-8 h-8 ${getScoreColor(seoScore)}`} />
                  </div>
                  <h4 className={`text-2xl font-bold ${getScoreColor(seoScore)} mb-2`}>{summary.overallHealth || 'Unknown'}</h4>
                  <p className="text-gray-400 text-sm">{summary.totalIssues || 0} issues found</p>
                </div>
              </div>
              
              {/* Performance Metrics Radial Chart */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-3">Performance Metrics</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={performanceData}>
                      <RadialBar 
                        minAngle={15} 
                        label={{ position: 'insideStart', fill: '#fff' }} 
                        background 
                        clockWise 
                        dataKey="score" 
                      />
                      <Tooltip 
                        contentStyle={{
                          background: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Issues Breakdown */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-3">Issues Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={issuesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      />
                      <Tooltip 
                        contentStyle={{
                          background: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Scores */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-4">Core Web Vitals</h3>
                {performanceData.map((metric, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{metric.name}</h4>
                      <span className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                        {metric.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/30 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full relative"
                        style={{ 
                          backgroundColor: metric.fill,
                          width: `${metric.score}%`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mobile vs Desktop Comparison */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-4">Device Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { device: 'Mobile', score: mobileScore, fill: COLORS.green },
                      { device: 'Desktop', score: desktopScore, fill: COLORS.blue }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="device" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{
                          background: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'issues' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold mb-4">Detailed Issues Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { 
                    key: 'missingMetaDescription', 
                    label: 'Missing Meta Description', 
                    icon: 'FileText',
                    severity: 'warning'
                  },
                  { 
                    key: 'slowLoadingPages', 
                    label: 'Slow Loading Pages', 
                    icon: 'Clock',
                    severity: 'critical'
                  },
                  { 
                    key: 'missingAltTags', 
                    label: 'Missing Alt Tags', 
                    icon: 'Image',
                    severity: 'warning'
                  },
                  { 
                    key: 'h1TagOptimization', 
                    label: 'H1 Tag Issues', 
                    icon: 'Type',
                    severity: 'warning'
                  },
                  { 
                    key: 'imageCompression', 
                    label: 'Image Compression', 
                    icon: 'Minimize2',
                    severity: 'info'
                  }
                ].map((issue, index) => {
                  const hasIssue = detailedIssues[issue.key];
                  const severityColors = {
                    critical: 'border-red-500/30 bg-red-600/10',
                    warning: 'border-yellow-500/30 bg-yellow-600/10',
                    info: 'border-blue-500/30 bg-blue-600/10'
                  };
                  const iconColors = {
                    critical: 'text-red-400',
                    warning: 'text-yellow-400',
                    info: 'text-blue-400'
                  };
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border ${
                        hasIssue ? severityColors[issue.severity] : 'border-green-500/30 bg-green-600/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon 
                          name={issue.icon} 
                          className={`w-6 h-6 ${hasIssue ? iconColors[issue.severity] : 'text-green-400'}`} 
                        />
                        <Icon 
                          name={hasIssue ? 'X' : 'Check'} 
                          className={`w-5 h-5 ${hasIssue ? 'text-red-400' : 'text-green-400'}`} 
                        />
                      </div>
                      <h4 className="text-white font-medium mb-1">{issue.label}</h4>
                      <p className={`text-sm ${hasIssue ? 'text-red-300' : 'text-green-300'}`}>
                        {hasIssue ? 'Needs attention' : 'All good'}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
          
          {activeTab === 'links' && (
            <div className="space-y-6">
              {/* Broken Links Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 text-center">
                  <Icon name="Link" className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{brokenLinksDetails.totalChecked || 0}</div>
                  <p className="text-gray-400 text-sm">Links Checked</p>
                </div>
                <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 text-center">
                  <Icon name="CheckCircle" className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {(brokenLinksDetails.totalChecked || 0) - (brokenLinksDetails.count || 0)}
                  </div>
                  <p className="text-gray-400 text-sm">Working Links</p>
                </div>
                <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 text-center">
                  <Icon name="AlertTriangle" className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{brokenLinksDetails.count || 0}</div>
                  <p className="text-gray-400 text-sm">Broken Links</p>
                </div>
              </div>
              
              {/* Broken Links List */}
              {brokenLinksDetails.examples && brokenLinksDetails.examples.length > 0 && (
                <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                  <h3 className="text-white font-semibold mb-4">Broken Links Found</h3>
                  <div className="space-y-3">
                    {brokenLinksDetails.examples.map((link, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-red-600/10 border border-red-500/20 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-red-300 font-mono text-sm break-all">{link}</p>
                        </div>
                        <Icon name="ExternalLink" className="w-4 h-4 text-red-400 ml-2" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <h3 className="text-white font-semibold mb-4">SEO Improvement Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    priority: 'High',
                    title: 'Fix Critical Issues',
                    description: 'Address the critical SEO issues found in the audit',
                    action: 'Fix broken links and missing meta descriptions',
                    impact: 'High',
                    effort: 'Medium'
                  },
                  {
                    priority: 'Medium',
                    title: 'Optimize Images',
                    description: 'Compress images and add missing alt tags',
                    action: 'Implement image optimization and add descriptive alt text',
                    impact: 'Medium',
                    effort: 'Low'
                  },
                  {
                    priority: 'Medium',
                    title: 'Improve Page Speed',
                    description: 'Optimize loading performance for better user experience',
                    action: 'Minimize CSS/JS, enable compression, optimize images',
                    impact: 'High',
                    effort: 'High'
                  },
                  {
                    priority: 'Low',
                    title: 'Content Optimization',
                    description: 'Improve content structure and keyword optimization',
                    action: 'Review and optimize H1 tags and content structure',
                    impact: 'Medium',
                    effort: 'Medium'
                  }
                ].map((recommendation, index) => {
                  const priorityColors = {
                    High: 'border-red-500/30 bg-red-600/10',
                    Medium: 'border-yellow-500/30 bg-yellow-600/10',
                    Low: 'border-blue-500/30 bg-blue-600/10'
                  };
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border ${priorityColors[recommendation.priority]}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">{recommendation.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recommendation.priority === 'High' ? 'bg-red-600/20 text-red-400' :
                          recommendation.priority === 'Medium' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-blue-600/20 text-blue-400'
                        }`}>
                          {recommendation.priority}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{recommendation.description}</p>
                      <div className="text-xs text-gray-400 mb-2">
                        <strong>Action:</strong> {recommendation.action}
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Impact: <span className="text-white">{recommendation.impact}</span></span>
                        <span className="text-gray-400">Effort: <span className="text-white">{recommendation.effort}</span></span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEOAuditWidget;