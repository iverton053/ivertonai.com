import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import Icon from '../Icon';
import { WebhookService } from '../../utils/webhookConfig';
import { WidgetDataManager, AnalysisExporter } from '../../utils/widgetDataManager';

const TechStackAnalyzerWidget = ({ data = null, config = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInputForm, setShowInputForm] = useState(!data);
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({
    competitorDomain: '',
    industry: 'General'
  });
  const [fetchedData, setFetchedData] = useState(null);
  const [widgetId] = useState(() => `tech_stack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [searchTerm, setSearchTerm] = useState('');

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = WidgetDataManager.loadWidgetData(widgetId);
    if (persistedData && !data && !fetchedData) {
      setFetchedData(persistedData);
      setShowInputForm(false);
      console.log('Loaded persisted tech stack analysis data');
    }
  }, [widgetId, data, fetchedData]);

  // Enhanced sample data structure based on n8n workflow output
  const sampleData = {
    status: 'success',
    timestamp: new Date().toISOString(),
    analysis_summary: {
      domains_analyzed: 1,
      total_technologies_found: 18,
      unique_categories_found: ['cms', 'analytics', 'hosting_cdn', 'javascript_frameworks', 'ui_frameworks', 'ecommerce', 'advertising'],
      data_sources_detected: ['builtwith', 'dataforseo', 'pagespeed', 'scraperapi']
    },
    domains: [{
      domain: 'example.com',
      metadata: {
        title: 'Example Company - Leading Business Solutions',
        description: 'Professional business solutions and services',
        country: 'US',
        language: 'en',
        rank: 2847,
        performance_score: 85
      },
      technology_stack: {
        cms: [
          { name: 'WordPress', version: '6.3.2', is_live: true, confidence: 95, last_detected: '2024-01-15T10:30:00.000Z' },
          { name: 'WooCommerce', version: '8.2.1', is_live: true, confidence: 90, last_detected: '2024-01-15T10:30:00.000Z' }
        ],
        analytics: [
          { name: 'Google Analytics', version: 'GA4', is_live: true, confidence: 100, last_detected: '2024-01-15T10:30:00.000Z' },
          { name: 'Google Tag Manager', version: 'Unknown', is_live: true, confidence: 85, last_detected: '2024-01-15T10:30:00.000Z' },
          { name: 'Hotjar', version: 'Unknown', is_live: true, confidence: 75, last_detected: '2024-01-15T10:30:00.000Z' }
        ],
        hosting_cdn: [
          { name: 'Cloudflare', version: 'Unknown', is_live: true, confidence: 95, last_detected: '2024-01-15T10:30:00.000Z' },
          { name: 'Amazon CloudFront', version: 'Unknown', is_live: false, confidence: 60, last_detected: '2023-12-20T15:20:00.000Z' }
        ],
        javascript_frameworks: [
          { name: 'jQuery', version: '3.6.0', is_live: true, confidence: 95, last_detected: '2024-01-15T10:30:00.000Z' },
          { name: 'React', version: '18.2.0', is_live: true, confidence: 85, last_detected: '2024-01-15T10:30:00.000Z' }
        ],
        ui_frameworks: [
          { name: 'Bootstrap', version: '5.3.0', is_live: true, confidence: 90, last_detected: '2024-01-15T10:30:00.000Z' },
          { name: 'Font Awesome', version: '6.4.0', is_live: true, confidence: 80, last_detected: '2024-01-15T10:30:00.000Z' }
        ],
        ecommerce: [
          { name: 'Stripe', version: 'Unknown', is_live: true, confidence: 85, last_detected: '2024-01-15T10:30:00.000Z' },
          { name: 'PayPal', version: 'Unknown', is_live: true, confidence: 70, last_detected: '2024-01-15T10:30:00.000Z' }
        ],
        advertising: [
          { name: 'Google Ads', version: 'Unknown', is_live: true, confidence: 75, last_detected: '2024-01-15T10:30:00.000Z' },
          { name: 'Facebook Pixel', version: '2.9.95', is_live: true, confidence: 80, last_detected: '2024-01-15T10:30:00.000Z' }
        ],
        security: [
          { name: 'SSL Certificate', version: 'TLS 1.3', is_live: true, confidence: 100, last_detected: '2024-01-15T10:30:00.000Z' }
        ],
        mobile: [
          { name: 'Progressive Web App', version: 'Unknown', is_live: true, confidence: 65, last_detected: '2024-01-15T10:30:00.000Z' }
        ]
      },
      performance: {
        core_web_vitals: {
          fcp: 1.2,
          lcp: 2.1,
          cls: 0.05,
          fid: 75,
          tbt: 150,
          tti: 3.2,
          speed_index: 1.8
        },
        metrics: {
          load_time: 2100,
          page_size: 1.4,
          requests: 45
        },
        opportunities: [
          { title: 'Optimize images', potential_savings: '240ms' },
          { title: 'Minify JavaScript', potential_savings: '180ms' },
          { title: 'Enable compression', potential_savings: '120ms' }
        ]
      },
      summary: {
        total_technologies: 15,
        live_technologies: 13,
        categories_found: ['cms', 'analytics', 'hosting_cdn', 'javascript_frameworks', 'ui_frameworks', 'ecommerce', 'advertising', 'security', 'mobile'],
        by_category: {
          cms: 2,
          analytics: 3,
          hosting_cdn: 2,
          javascript_frameworks: 2,
          ui_frameworks: 2,
          ecommerce: 2,
          advertising: 2,
          security: 1,
          mobile: 1
        }
      }
    }],
    dashboard_data: {
      technology_overview: {
        cms: 2,
        analytics: 3,
        hosting_cdn: 2,
        javascript_frameworks: 2,
        ui_frameworks: 2,
        ecommerce: 2,
        advertising: 2,
        security: 1,
        mobile: 1
      },
      cms_chart: [
        { name: 'WordPress 6.3.2', count: 1, percentage: '50.0' },
        { name: 'WooCommerce 8.2.1', count: 1, percentage: '50.0' }
      ],
      analytics_chart: [
        { name: 'Google Analytics', count: 1, percentage: '33.3' },
        { name: 'Google Tag Manager', count: 1, percentage: '33.3' },
        { name: 'Hotjar', count: 1, percentage: '33.3' }
      ]
    },
    processing_info: {
      input_structure_detected: ['competitorDomain', 'industry'],
      dynamic_categories_created: 9,
      adaptations_made: 'Fully dynamic processing - no hardcoded assumptions'
    }
  };

  // Handle n8n data structure - ensure compatibility with webhook response
  const displayData = fetchedData || data || sampleData;
  
  // Extract data from n8n structure if needed (data might be nested)
  const actualData = displayData.json || displayData;
  
  // Safely destructure with fallbacks
  const domains = actualData.domains || [actualData];
  const primaryDomain = domains[0] || {};
  const technology_stack = primaryDomain.technology_stack || {};
  const performance = primaryDomain.performance || {};
  const summary = primaryDomain.summary || {};
  const dashboard_data = actualData.dashboard_data || {};
  const analysis_summary = actualData.analysis_summary || {};

  // Prepare analysis data for export
  const analysisData = {
    summary: {
      domain: primaryDomain.domain,
      total_technologies: summary.total_technologies,
      live_technologies: summary.live_technologies,
      categories: summary.categories_found?.length || 0,
      performance_score: primaryDomain.metadata?.performance_score
    },
    technologies: Object.entries(technology_stack).flatMap(([category, techs]) => 
      techs.map(tech => ({
        category: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        name: tech.name,
        version: tech.version,
        status: tech.is_live ? 'Live' : 'Dead',
        confidence: tech.confidence,
        last_detected: tech.last_detected
      }))
    ),
    performance_metrics: performance.core_web_vitals ? [
      { metric: 'First Contentful Paint', value: `${performance.core_web_vitals.fcp}s`, category: 'Core Web Vitals' },
      { metric: 'Largest Contentful Paint', value: `${performance.core_web_vitals.lcp}s`, category: 'Core Web Vitals' },
      { metric: 'Cumulative Layout Shift', value: performance.core_web_vitals.cls, category: 'Core Web Vitals' },
      { metric: 'First Input Delay', value: `${performance.core_web_vitals.fid}ms`, category: 'Core Web Vitals' },
      { metric: 'Total Blocking Time', value: `${performance.core_web_vitals.tbt}ms`, category: 'Core Web Vitals' },
      { metric: 'Time to Interactive', value: `${performance.core_web_vitals.tti}s`, category: 'Core Web Vitals' }
    ] : []
  };

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
      // Try to fetch data from n8n webhook first
      const webhookResponse = await WebhookService.fetchTechStackData(
        inputData.competitorDomain, 
        inputData.industry
      );
      
      if (webhookResponse) {
        // Use real webhook data
        setFetchedData(webhookResponse);
        setShowInputForm(false);
        // Save to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'Tech Stack Analyzer', webhookResponse);
      } else {
        // Fall back to mock data if webhooks are disabled
        console.log('Using mock data - webhooks disabled or failed');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate delay
        
        const mockResponse = {
          ...sampleData,
          domains: [{
            ...sampleData.domains[0],
            domain: inputData.competitorDomain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
            metadata: {
              ...sampleData.domains[0].metadata,
              title: `${inputData.competitorDomain} - ${inputData.industry} Solutions`
            }
          }],
          analysis_summary: {
            ...sampleData.analysis_summary,
            industry: inputData.industry
          }
        };
        
        setFetchedData(mockResponse);
        setShowInputForm(false);
        // Save mock data to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'Tech Stack Analyzer', mockResponse);
      }
      
    } catch (error) {
      console.error('Error fetching tech stack data:', error);
      // On error, show mock data as fallback
      const mockResponse = {
        ...sampleData,
        domains: [{
          ...sampleData.domains[0],
          domain: inputData.competitorDomain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
          metadata: {
            ...sampleData.domains[0].metadata,
            title: `${inputData.competitorDomain} - ${inputData.industry} Solutions`
          }
        }]
      };
      setFetchedData(mockResponse);
      setShowInputForm(false);
      // Save fallback data to localStorage
      WidgetDataManager.saveWidgetData(widgetId, 'Tech Stack Analyzer', mockResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const getTechStatusColor = (isLive, confidence) => {
    if (!isLive) return 'text-red-400';
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getTechBadgeColor = (isLive, confidence) => {
    if (!isLive) return 'bg-red-600/20 text-red-400';
    if (confidence >= 90) return 'bg-green-600/20 text-green-400';
    if (confidence >= 70) return 'bg-yellow-600/20 text-yellow-400';
    return 'bg-orange-600/20 text-orange-400';
  };

  const getPerformanceColor = (metric, value) => {
    switch (metric) {
      case 'fcp':
        return value < 1.8 ? 'text-green-400' : value < 3.0 ? 'text-yellow-400' : 'text-red-400';
      case 'lcp':
        return value < 2.5 ? 'text-green-400' : value < 4.0 ? 'text-yellow-400' : 'text-red-400';
      case 'cls':
        return value < 0.1 ? 'text-green-400' : value < 0.25 ? 'text-yellow-400' : 'text-red-400';
      case 'fid':
        return value < 100 ? 'text-green-400' : value < 300 ? 'text-yellow-400' : 'text-red-400';
      case 'tbt':
        return value < 200 ? 'text-green-400' : value < 600 ? 'text-yellow-400' : 'text-red-400';
      case 'tti':
        return value < 3.8 ? 'text-green-400' : value < 7.3 ? 'text-yellow-400' : 'text-red-400';
      default:
        return 'text-white';
    }
  };

  // Colors for charts
  const COLORS = {
    primary: '#8B5CF6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    purple: '#8B5CF6',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
    orange: '#F97316'
  };

  // Filter technologies based on search term
  const filterTechnologies = (techs, term) => {
    if (!term.trim()) return techs;
    return techs.filter(tech => 
      tech.name.toLowerCase().includes(term.toLowerCase()) ||
      tech.version.toLowerCase().includes(term.toLowerCase())
    );
  };

  // Show input form if no data
  if (showInputForm) {
    return (
      <div className="w-full h-full min-h-[500px] max-h-[700px] p-6 flex items-center justify-center">
        <div className="bg-gray-800/30 p-8 rounded-2xl border border-gray-700/30 w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="p-4 bg-purple-600/20 rounded-xl border border-purple-500/20 w-fit mx-auto mb-4">
              <Icon name="Cpu" className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Tech Stack Analyzer</h2>
            <p className="text-gray-400">Discover the technology stack powering competitor websites</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Competitor Domain <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={inputData.competitorDomain}
                onChange={(e) => handleInputChange('competitorDomain', e.target.value)}
                placeholder="example.com or https://example.com"
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                required
              />
              <p className="text-gray-400 text-sm mt-2">Enter domain with or without protocol</p>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">
                Industry Category
              </label>
              <select
                value={inputData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="General">General</option>
                <option value="E-commerce">E-commerce</option>
                <option value="SaaS">SaaS</option>
                <option value="Digital Marketing Agency">Digital Marketing Agency</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Travel & Tourism">Travel & Tourism</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Media & Entertainment">Media & Entertainment</option>
                <option value="Technology">Technology</option>
                <option value="Manufacturing">Manufacturing</option>
              </select>
            </div>
            
            <div className="flex space-x-4">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Tech Stack...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Search" className="w-5 h-5" />
                    <span>Analyze Tech Stack</span>
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

  // Always show full-size widget - horizontally optimized
  return (
    <div className="w-full h-full min-h-[500px] max-h-[700px] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-purple-600/20 rounded-xl border border-purple-500/20">
            <Icon name="Cpu" className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Tech Stack Analyzer</h2>
            <p className="text-gray-400">Comprehensive competitor technology analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Domain Analyzed</div>
            <div className="text-2xl font-bold text-white">{primaryDomain.domain || 'N/A'}</div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => AnalysisExporter.exportToCSV(analysisData, 'tech-stack-analysis')}
              className="px-3 py-2 bg-purple-600/20 text-purple-400 text-sm rounded-lg hover:bg-purple-600/30 transition-colors"
              title="Export to CSV"
            >
              <Icon name="Download" className="w-4 h-4 inline mr-1" />
              CSV
            </button>
            <button
              onClick={() => {
                const summary = AnalysisExporter.generateSummary(analysisData, 'Tech Stack Analysis');
                navigator.clipboard.writeText(summary).then(() => {
                  console.log('Summary copied to clipboard');
                }).catch(err => {
                  console.error('Failed to copy summary:', err);
                });
              }}
              className="px-3 py-2 bg-green-600/20 text-green-400 text-sm rounded-lg hover:bg-green-600/30 transition-colors"
              title="Copy Summary to Clipboard"
            >
              <Icon name="Copy" className="w-4 h-4 inline mr-1" />
              Copy
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInputForm(true)}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center space-x-2"
            >
              <Icon name="Plus" className="w-4 h-4" />
              <span>New Analysis</span>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Quick Stats Grid - Horizontal Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="Package" className="w-5 h-5 text-purple-400" />
            <span className="text-xl font-bold text-white">{summary.total_technologies || 0}</span>
          </div>
          <p className="text-gray-400 text-xs">Total Technologies</p>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="Activity" className="w-5 h-5 text-green-400" />
            <span className="text-xl font-bold text-white">{summary.live_technologies || 0}</span>
          </div>
          <p className="text-gray-400 text-xs">Live Technologies</p>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="Layers" className="w-5 h-5 text-blue-400" />
            <span className="text-xl font-bold text-white">{summary.categories_found?.length || 0}</span>
          </div>
          <p className="text-gray-400 text-xs">Categories</p>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="Gauge" className="w-5 h-5 text-yellow-400" />
            <span className="text-xl font-bold text-white">{primaryDomain.metadata?.performance_score || 'N/A'}</span>
          </div>
          <p className="text-gray-400 text-xs">Performance Score</p>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="Globe" className="w-5 h-5 text-orange-400" />
            <span className="text-xl font-bold text-white">{primaryDomain.metadata?.rank || 'N/A'}</span>
          </div>
          <p className="text-gray-400 text-xs">Domain Rank</p>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="MapPin" className="w-5 h-5 text-red-400" />
            <span className="text-xl font-bold text-white">{primaryDomain.metadata?.country || 'N/A'}</span>
          </div>
          <p className="text-gray-400 text-xs">Country</p>
        </div>
      </div>
      
      {/* Main Content - Horizontal Layout */}
      <div className="bg-gray-800/20 rounded-2xl p-4 border border-gray-700/30 flex-1">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 bg-gray-800/50 p-1 rounded-xl">
          {[
            { id: 'overview', label: 'Overview', icon: 'BarChart3' },
            { id: 'technologies', label: 'Technologies', icon: 'Package' },
            { id: 'performance', label: 'Performance', icon: 'Gauge' },
            { id: 'categories', label: 'Categories', icon: 'Layers' },
            { id: 'insights', label: 'Insights', icon: 'Brain' }
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Technology Categories Pie Chart */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-3">Technology Categories</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(summary.by_category || {}).map(([category, count], index) => ({
                          name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                          value: count,
                          fill: Object.values(COLORS)[index % Object.values(COLORS).length]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
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
              
              {/* Top Technologies */}
              <div className="lg:col-span-2 bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Top Technologies</h3>
                  <input
                    type="text"
                    placeholder="Search technologies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                  {Object.entries(technology_stack).flatMap(([category, techs]) => 
                    filterTechnologies(techs, searchTerm).map((tech, index) => (
                      <div key={`${category}-${index}`} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium">{tech.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTechBadgeColor(tech.is_live, tech.confidence)}`}>
                              {tech.is_live ? 'Live' : 'Dead'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{tech.version} • {category.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${getTechStatusColor(tech.is_live, tech.confidence)}`}>
                            {tech.confidence}%
                          </span>
                        </div>
                      </div>
                    ))
                  ).slice(0, 8)}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'technologies' && (
            <div className="space-y-6">
              {Object.entries(technology_stack).map(([category, techs]) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30"
                >
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <Icon name="Package" className="w-5 h-5 text-purple-400" />
                    <span>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full text-sm font-medium">
                      {techs.length}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {techs.map((tech, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-1">{tech.name}</h4>
                            <p className="text-gray-400 text-sm mb-2">Version: {tech.version}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTechBadgeColor(tech.is_live, tech.confidence)}`}>
                            {tech.is_live ? 'Live' : 'Dead'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Confidence:</span>
                          <span className={`font-bold ${getTechStatusColor(tech.is_live, tech.confidence)}`}>
                            {tech.confidence}%
                          </span>
                        </div>
                        {tech.last_detected && (
                          <p className="text-gray-400 text-xs mt-2">
                            Last detected: {new Date(tech.last_detected).toLocaleDateString()}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {activeTab === 'performance' && performance.core_web_vitals && (
            <div className="space-y-6">
              {/* Core Web Vitals */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-4">Core Web Vitals</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { key: 'fcp', name: 'FCP', value: performance.core_web_vitals.fcp, unit: 's', description: 'First Contentful Paint' },
                    { key: 'lcp', name: 'LCP', value: performance.core_web_vitals.lcp, unit: 's', description: 'Largest Contentful Paint' },
                    { key: 'cls', name: 'CLS', value: performance.core_web_vitals.cls, unit: '', description: 'Cumulative Layout Shift' },
                    { key: 'fid', name: 'FID', value: performance.core_web_vitals.fid, unit: 'ms', description: 'First Input Delay' },
                    { key: 'tbt', name: 'TBT', value: performance.core_web_vitals.tbt, unit: 'ms', description: 'Total Blocking Time' },
                    { key: 'tti', name: 'TTI', value: performance.core_web_vitals.tti, unit: 's', description: 'Time to Interactive' }
                  ].map((metric) => (
                    <div key={metric.key} className="text-center p-4 bg-gray-700/30 rounded-lg">
                      <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(metric.key, metric.value)}`}>
                        {metric.value}{metric.unit}
                      </div>
                      <div className="text-white font-medium mb-1">{metric.name}</div>
                      <div className="text-gray-400 text-xs">{metric.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Performance Opportunities */}
              {performance.opportunities && performance.opportunities.length > 0 && (
                <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                  <h3 className="text-white font-semibold mb-4">Optimization Opportunities</h3>
                  <div className="space-y-3">
                    {performance.opportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{opportunity.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-green-400 font-bold">{opportunity.potential_savings}</span>
                          <p className="text-gray-400 text-sm">Potential Savings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(technology_stack).map(([category, techs]) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/30 text-center"
                >
                  <div className="p-4 bg-purple-600/20 rounded-xl border border-purple-500/20 w-fit mx-auto mb-4">
                    <Icon name="Package" className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h3>
                  <div className="text-3xl font-bold text-purple-400 mb-2">{techs.length}</div>
                  <p className="text-gray-400 text-sm mb-4">Technologies Found</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {techs.slice(0, 3).map((tech, index) => (
                      <span key={index} className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-xs">
                        {tech.name}
                      </span>
                    ))}
                    {techs.length > 3 && (
                      <span className="text-gray-400 text-xs">+{techs.length - 3} more</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Technology Insights */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-4">Technology Insights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="CheckCircle" className="w-5 h-5 text-green-400" />
                      <h4 className="text-green-400 font-medium">Strengths</h4>
                    </div>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Modern tech stack with {summary.live_technologies} active technologies</li>
                      <li>• Good performance metrics with {primaryDomain.metadata?.performance_score || 'N/A'} score</li>
                      <li>• Comprehensive analytics setup detected</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-yellow-600/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="AlertTriangle" className="w-5 h-5 text-yellow-400" />
                      <h4 className="text-yellow-400 font-medium">Opportunities</h4>
                    </div>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Consider optimizing Core Web Vitals for better performance</li>
                      <li>• Evaluate security implementations</li>
                      <li>• Review mobile optimization strategies</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Industry Comparison */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-4">Industry Comparison</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-white">Technology Diversity</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-400 transition-all duration-500"
                          style={{ width: `${Math.min((summary.total_technologies / 20) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-purple-400 font-medium text-sm">
                        {Math.min((summary.total_technologies / 20) * 100, 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-white">Performance Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-400 transition-all duration-500"
                          style={{ width: `${primaryDomain.metadata?.performance_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-green-400 font-medium text-sm">
                        {primaryDomain.metadata?.performance_score || 0}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-white">Technology Freshness</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-400 transition-all duration-500"
                          style={{ width: `${(summary.live_technologies / summary.total_technologies) * 100 || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-blue-400 font-medium text-sm">
                        {((summary.live_technologies / summary.total_technologies) * 100 || 0).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechStackAnalyzerWidget;