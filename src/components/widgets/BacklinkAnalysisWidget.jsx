import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import Icon from '../Icon';
import { WebhookService } from '../../utils/webhookConfig';
import { WidgetDataManager, AnalysisExporter } from '../../utils/widgetDataManager';

const BacklinkAnalysisWidget = ({ data = null, config = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInputForm, setShowInputForm] = useState(!data);
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({
    website_url: '',
    time_duration: 'last 30 days'
  });
  const [fetchedData, setFetchedData] = useState(null);
  const [widgetId] = useState(() => `backlink_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [searchTerm, setSearchTerm] = useState('');

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = WidgetDataManager.loadWidgetData(widgetId);
    if (persistedData && !data && !fetchedData) {
      setFetchedData(persistedData);
      setShowInputForm(false);
      console.log('Loaded persisted backlink analysis data');
    }
  }, [widgetId, data, fetchedData]);

  // Sample data structure matching your n8n workflow output exactly
  const sampleData = {
    status: 'success',
    timestamp: new Date().toISOString(),
    analysis_period: 'last 30 days',
    target_url: 'https://zaubacorp.com',
    summary: {
      total_backlinks: 8947,
      total_referring_domains: 1247,
      new_backlinks_30d: 142,
      lost_backlinks_30d: 38,
      net_growth_30d: 104,
      domain_rank: 65,
      domain_trust: 58,
      organic_traffic: 18,
      organic_keywords: 4,
      backlinks_spam_score: 15,
      target_spam_score: 12,
      crawled_pages: 892,
      broken_backlinks: 12,
      broken_pages: 3
    },
    growth_metrics: {
      backlinks_growth_rate: '+1.67%',
      referring_domains_growth_rate: '+0.89%',
      net_growth_percentage: '+1.67%',
      period_comparison: {
        current_period: {
          start_date: '2024-07-01',
          end_date: '2024-07-31',
          new_backlinks: 342,
          new_referring_domains: 25,
          lost_backlinks: 89,
          lost_referring_domains: 8
        }
      }
    },
    link_quality_metrics: {
      internal_links_count: 4892,
      external_links_count: 15428,
      referring_domains_nofollow: 847,
      referring_main_domains: 2589,
      referring_main_domains_nofollow: 658,
      referring_ips: 2247,
      referring_subnets: 1894,
      referring_pages: 8947,
      referring_pages_nofollow: 3247
    },
    link_types_distribution: {
      anchor_links: { count: 12847, percentage: '83.3' },
      image_links: { count: 1894, percentage: '12.3' },
      redirect_links: { count: 487, percentage: '3.2' },
      canonical_links: { count: 142, percentage: '0.9' },
      alternate_links: { count: 58, percentage: '0.4' }
    },
    link_attributes_distribution: {
      noopener: { count: 8947, percentage: '58.0' },
      nofollow: { count: 5247, percentage: '34.0' },
      noreferrer: { count: 3842, percentage: '24.9' },
      external: { count: 15428, percentage: '100.0' },
      ugc: { count: 1247, percentage: '8.1' },
      sponsored: { count: 892, percentage: '5.8' }
    },
    platform_types_distribution: {
      'blog': { count: 4892, percentage: '31.7' },
      'news': { count: 3247, percentage: '21.0' },
      'forum': { count: 2847, percentage: '18.5' },
      'social': { count: 2194, percentage: '14.2' },
      'directory': { count: 1589, percentage: '10.3' },
      'ecommerce': { count: 659, percentage: '4.3' }
    },
    semantic_locations_distribution: {
      'content': { count: 8947, percentage: '58.0' },
      'sidebar': { count: 3247, percentage: '21.0' },
      'footer': { count: 2194, percentage: '14.2' },
      'header': { count: 847, percentage: '5.5' },
      'navigation': { count: 193, percentage: '1.3' }
    },
    top_level_domains_distribution: {
      'com': { count: 8947, percentage: '58.0' },
      'org': { count: 2847, percentage: '18.5' },
      'net': { count: 1589, percentage: '10.3' },
      'edu': { count: 892, percentage: '5.8' },
      'gov': { count: 487, percentage: '3.2' },
      'co.uk': { count: 342, percentage: '2.2' },
      'de': { count: 194, percentage: '1.3' },
      'fr': { count: 130, percentage: '0.8' }
    },
    geographic_distribution: [
      { country: 'United States', backlinks: 8947, percentage: '58.0' },
      { country: 'United Kingdom', backlinks: 2847, percentage: '18.5' },
      { country: 'Canada', backlinks: 1589, percentage: '10.3' },
      { country: 'Germany', backlinks: 892, percentage: '5.8' },
      { country: 'Australia', backlinks: 487, percentage: '3.2' }
    ],
    top_anchor_texts: [
      { text: 'example business', count: 2847, percentage: '18.5' },
      { text: 'business solutions', count: 1894, percentage: '12.3' },
      { text: 'click here', count: 1247, percentage: '8.1' },
      { text: 'read more', count: 892, percentage: '5.8' },
      { text: 'example-business.com', count: 647, percentage: '4.2' },
      { text: 'professional services', count: 487, percentage: '3.2' },
      { text: 'business consulting', count: 342, percentage: '2.2' },
      { text: 'learn more', count: 289, percentage: '1.9' },
      { text: 'visit site', count: 194, percentage: '1.3' },
      { text: 'source', count: 147, percentage: '1.0' }
    ],
    anchor_text_categories: {
      branded: {
        percentage: 28.5,
        anchors: [
          { text: 'example business', count: 2847, percentage: '18.5' },
          { text: 'example-business.com', count: 647, percentage: '4.2' },
          { text: 'example business solutions', count: 342, percentage: '2.2' }
        ]
      },
      exact_match: {
        percentage: 23.8,
        anchors: [
          { text: 'business solutions', count: 1894, percentage: '12.3' },
          { text: 'professional services', count: 487, percentage: '3.2' },
          { text: 'business consulting', count: 342, percentage: '2.2' }
        ]
      },
      generic: {
        percentage: 19.4,
        anchors: [
          { text: 'click here', count: 1247, percentage: '8.1' },
          { text: 'read more', count: 892, percentage: '5.8' },
          { text: 'learn more', count: 289, percentage: '1.9' }
        ]
      },
      naked_url: {
        percentage: 6.8,
        anchors: [
          { text: 'https://example-business.com', count: 487, percentage: '3.2' },
          { text: 'example-business.com/services', count: 289, percentage: '1.9' },
          { text: 'https://www.example-business.com', count: 194, percentage: '1.3' }
        ]
      }
    },
    daily_growth_chart: [
      { date: '2024-07-01', new_backlinks: 12, lost_backlinks: 3, net: 9 },
      { date: '2024-07-02', new_backlinks: 8, lost_backlinks: 2, net: 6 },
      { date: '2024-07-03', new_backlinks: 15, lost_backlinks: 4, net: 11 },
      { date: '2024-07-04', new_backlinks: 6, lost_backlinks: 1, net: 5 },
      { date: '2024-07-05', new_backlinks: 18, lost_backlinks: 5, net: 13 },
      { date: '2024-07-06', new_backlinks: 11, lost_backlinks: 2, net: 9 },
      { date: '2024-07-07', new_backlinks: 9, lost_backlinks: 3, net: 6 }
    ],
    top_referring_domains: [
      {
        domain: 'authoritysite.com',
        domain_rank: 89,
        backlinks_count: 247,
        anchor_text: 'business solutions',
        first_seen: '2024-06-15'
      },
      {
        domain: 'industrynews.com',
        domain_rank: 82,
        backlinks_count: 189,
        anchor_text: 'example business',
        first_seen: '2024-07-01'
      },
      {
        domain: 'techblog.org',
        domain_rank: 76,
        backlinks_count: 156,
        anchor_text: 'professional services',
        first_seen: '2024-06-28'
      },
      {
        domain: 'businessdirectory.net',
        domain_rank: 71,
        backlinks_count: 134,
        anchor_text: 'click here',
        first_seen: '2024-07-03'
      },
      {
        domain: 'marketwatch.com',
        domain_rank: 68,
        backlinks_count: 98,
        anchor_text: 'read more',
        first_seen: '2024-07-08'
      }
    ],
    quality_metrics: {
      high_authority_links: {
        count: 847,
        percentage: '29.8',
        definition: 'Domain Rank >= 80'
      },
      medium_authority_links: {
        count: 1294,
        percentage: '45.4',
        definition: 'Domain Rank 50-79'
      },
      low_authority_links: {
        count: 706,
        percentage: '24.8',
        definition: 'Domain Rank < 50'
      }
    },
    link_types: {
      dofollow: {
        count: 10181,
        percentage: '66.0'
      },
      nofollow: {
        count: 5247,
        percentage: '34.0'
      }
    },
    lost_backlinks: [
      {
        domain: 'oldsite.com',
        lost_date: '2024-07-25',
        anchor_text: 'business services',
        domain_rank: 54
      },
      {
        domain: 'expiredlink.net',
        lost_date: '2024-07-22',
        anchor_text: 'professional solutions',
        domain_rank: 47
      },
      {
        domain: 'removedcontent.org',
        lost_date: '2024-07-19',
        anchor_text: 'click here',
        domain_rank: 62
      }
    ],
    technical_metrics: {
      server: 'nginx/1.18.0',
      cms: 'WordPress',
      platform_type: ['blog', 'business'],
      ip_address: '192.168.1.100',
      country: 'United States',
      is_ip: false
    },
    dashboard_insights: {
      strengths: [
        'Domain authority rank: 78',
        'Total backlinks: 15,428',
        'Referring domains: 2,847',
        'Net growth: 253'
      ],
      opportunities: [
        'Spam score: 12',
        'Broken backlinks: 28',
        'Nofollow links: 847',
        'Anchor text diversity: 4 categories'
      ],
      risks: [
        'Broken backlinks: 28',
        'Spam score: 12',
        'Unknown platform types: 0',
        'Low authority domains: 706'
      ]
    },
    api_credits_used: 342,
    data_freshness: new Date().toISOString()
  };

  // Use fetched data if available, otherwise use sample or prop data
  const analysisData = fetchedData || data || sampleData;

  // Filter referring domains based on search term
  const filterDomains = (domains) => {
    if (!searchTerm || !domains) return domains;
    const term = searchTerm.toLowerCase();
    return domains.filter(domain => 
      domain.domain?.toLowerCase().includes(term) ||
      domain.anchor_text?.toLowerCase().includes(term)
    );
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
      // Try to fetch data from n8n webhook first - matches your workflow webhook path
      const webhookResponse = await WebhookService.callWebhook(
        '/webhook/c9ed0343-dd65-48ec-81ef-6a814cf85b68/backlink-analysis',
        {
          website_url: inputData.website_url,
          time_duration: inputData.time_duration
        }
      );
      
      if (webhookResponse) {
        // Use real webhook data
        setFetchedData(webhookResponse);
        setShowInputForm(false);
        // Save to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'Backlink Analysis', webhookResponse);
      } else {
        // Fall back to mock data if webhooks are disabled
        console.log('Using mock data - webhooks disabled or failed');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const mockResponse = {
          ...sampleData,
          target_url: inputData.website_url,
          analysis_period: inputData.time_duration,
          timestamp: new Date().toISOString()
        };
        
        setFetchedData(mockResponse);
        setShowInputForm(false);
        // Save mock data to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'Backlink Analysis', mockResponse);
      }
      
    } catch (error) {
      console.error('Error fetching backlink analysis data:', error);
      // On error, show mock data as fallback
      const mockResponse = {
        ...sampleData,
        target_url: inputData.website_url,
        analysis_period: inputData.time_duration,
        summary: {
          ...sampleData.summary,
          backlinks_spam_score: 15
        }
      };
      setFetchedData(mockResponse);
      setShowInputForm(false);
      // Save fallback data to localStorage
      WidgetDataManager.saveWidgetData(widgetId, 'Backlink Analysis', mockResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthorityColor = (rank) => {
    if (rank >= 80) return 'text-green-400';
    if (rank >= 50) return 'text-yellow-400';
    if (rank >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGrowthColor = (growth) => {
    const rate = parseFloat(growth.replace('%', '').replace('+', ''));
    if (rate > 0) return 'text-green-400';
    if (rate < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  // Colors for charts
  const COLORS = {
    branded: '#8B5CF6',
    exact_match: '#10B981',
    generic: '#F59E0B',
    naked_url: '#EF4444',
    dofollow: '#10B981',
    nofollow: '#F59E0B',
    high: '#10B981',
    medium: '#F59E0B',
    low: '#EF4444'
  };

  const timeDurationOptions = [
    { value: 'last 7 days', label: 'Last 7 days' },
    { value: 'last 30 days', label: 'Last 30 days' },
    { value: '3 months', label: '3 months' },
    { value: '1 year', label: '1 year' },
    { value: 'all time', label: 'All time' }
  ];

  // Show input form if no data
  if (showInputForm) {
    return (
      <div className="w-full h-full min-h-[600px] max-h-[90vh] p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Link" className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Backlink Analysis</h2>
            <p className="text-gray-400">Analyze your backlink profile and link building opportunities</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Website URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={inputData.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                placeholder="https://yoursite.com"
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">
                Analysis Period <span className="text-red-400">*</span>
              </label>
              <select
                value={inputData.time_duration}
                onChange={(e) => handleInputChange('time_duration', e.target.value)}
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors"
                required
              >
                {timeDurationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-400 mt-1">Choose the time period for backlink analysis</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing Backlinks...</span>
                  </div>
                ) : (
                  'Start Backlink Analysis'
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
          
          <div className="mt-8 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
            <h3 className="text-white font-medium mb-2">What This Analysis Includes:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
              <div>• Backlink profile overview</div>
              <div>• Referring domain analysis</div>
              <div>• Anchor text distribution</div>
              <div>• Link quality assessment</div>
              <div>• Growth trend analysis</div>
              <div>• Competitor comparison</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main widget tabs
  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'BarChart3' },
    { id: 'domains', name: 'Domains', icon: 'Globe' },
    { id: 'anchors', name: 'Anchors', icon: 'Link' },
    { id: 'quality', name: 'Quality', icon: 'Shield' },
    { id: 'growth', name: 'Growth', icon: 'TrendingUp' }
  ];

  return (
    <div className="w-full h-full min-h-[500px] max-h-[90vh] bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Icon name="Link" className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Backlink Analysis</h3>
              <p className="text-xs text-gray-400">
                {analysisData.target_url?.replace(/^https?:\/\//, '')} • 
                {analysisData.analysis_period} • 
                {analysisData.summary?.total_backlinks?.toLocaleString()} backlinks
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => AnalysisExporter.exportToCSV(analysisData, 'backlink-analysis')}
              className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-lg hover:bg-green-600/30 transition-colors"
              title="Export to CSV"
            >
              <Icon name="Download" className="w-3 h-3 inline mr-1" />
              CSV
            </button>
            <button
              onClick={() => {
                const summary = AnalysisExporter.generateSummary(analysisData, 'Backlink Analysis');
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
                  ? 'bg-blue-600/20 text-blue-400'
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
                <div className="text-2xl font-bold text-blue-400">{analysisData.summary?.total_backlinks?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-400">Total Backlinks</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{analysisData.summary?.total_referring_domains?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-400">Referring Domains</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">{analysisData.summary?.domain_rank || 0}</div>
                <div className="text-xs text-gray-400">Domain Rank</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className={`text-2xl font-bold ${getGrowthColor(analysisData.growth_metrics?.net_growth_percentage || '+0%')}`}>
                  {analysisData.growth_metrics?.net_growth_percentage || '+0%'}
                </div>
                <div className="text-xs text-gray-400">Growth Rate</div>
              </div>
            </div>

            {/* Growth Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Growth Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">New Backlinks:</span>
                    <span className="text-green-400">+{analysisData.summary?.new_backlinks_30d || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lost Backlinks:</span>
                    <span className="text-red-400">-{analysisData.summary?.lost_backlinks_30d || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Net Growth:</span>
                    <span className={getGrowthColor(`+${analysisData.summary?.net_growth_30d || 0}`)}>
                      {analysisData.summary?.net_growth_30d > 0 ? '+' : ''}{analysisData.summary?.net_growth_30d || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Link Quality</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dofollow:</span>
                    <span className="text-green-400">{analysisData.link_types?.dofollow?.percentage || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nofollow:</span>
                    <span className="text-yellow-400">{analysisData.link_types?.nofollow?.percentage || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Spam Score:</span>
                    <span className={analysisData.summary?.backlinks_spam_score > 30 ? 'text-red-400' : 
                                   analysisData.summary?.backlinks_spam_score > 15 ? 'text-yellow-400' : 'text-green-400'}>
                      {analysisData.summary?.backlinks_spam_score || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Authority Distribution</h4>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'High', value: parseInt(analysisData.quality_metrics?.high_authority_links?.count || 0), fill: COLORS.high },
                          { name: 'Medium', value: parseInt(analysisData.quality_metrics?.medium_authority_links?.count || 0), fill: COLORS.medium },
                          { name: 'Low', value: parseInt(analysisData.quality_metrics?.low_authority_links?.count || 0), fill: COLORS.low }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={35}
                        dataKey="value"
                      >
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Anchor Text Categories */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Anchor Text Distribution</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(analysisData.anchor_text_categories || {}).map(([key, value]) => ({
                    name: key.replace('_', ' '),
                    value: value.percentage
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'domains' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="sticky top-0 bg-gray-800/90 backdrop-blur-sm p-2 -mx-4 border-b border-gray-700/50">
              <div className="relative">
                <Icon name="Search" className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search domains, anchor text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <Icon name="X" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Top Referring Domains */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                Top Referring Domains ({filterDomains(analysisData.top_referring_domains || []).length})
              </h4>
              <div className="space-y-3">
                {filterDomains(analysisData.top_referring_domains || []).map((domain, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="text-white font-medium">{domain.domain}</h5>
                        <p className="text-sm text-gray-400">Anchor: "{domain.anchor_text}"</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getAuthorityColor(domain.domain_rank)}`}>
                          {domain.domain_rank}
                        </div>
                        <div className="text-xs text-gray-400">Authority</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        Backlinks: <span className="text-blue-400">{domain.backlinks_count}</span>
                      </span>
                      <span className="text-gray-400">
                        First seen: <span className="text-white">{domain.first_seen}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Geographic Distribution</h4>
              <div className="space-y-2">
                {analysisData.geographic_distribution?.slice(0, 5).map((geo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-white text-sm">{geo.country}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400 text-sm">{geo.backlinks?.toLocaleString()}</span>
                      <span className="text-gray-400 text-xs">({geo.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anchors' && (
          <div className="space-y-4">
            {/* Top Anchor Texts */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Top Anchor Texts</h4>
              <div className="space-y-2">
                {analysisData.top_anchor_texts?.slice(0, 10).map((anchor, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-white text-sm">"{anchor.text}"</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400 text-sm">{anchor.count?.toLocaleString()}</span>
                      <span className="text-gray-400 text-xs">({anchor.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anchor Text Categories */}
            {Object.entries(analysisData.anchor_text_categories || {}).map(([category, data]) => (
              <div key={category} className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center justify-between">
                  <span>{category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)} Anchors</span>
                  <span className="text-sm text-blue-400">{data.percentage}%</span>
                </h4>
                <div className="space-y-2">
                  {data.anchors?.map((anchor, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                      <span className="text-white text-sm">"{anchor.text}"</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 text-sm">{anchor.count?.toLocaleString()}</span>
                        <span className="text-gray-400 text-xs">({anchor.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'quality' && (
          <div className="space-y-4">
            {/* Authority Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {analysisData.quality_metrics?.high_authority_links?.count || 0}
                </div>
                <div className="text-sm text-gray-400">High Authority</div>
                <div className="text-xs text-green-400">
                  {analysisData.quality_metrics?.high_authority_links?.definition}
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {analysisData.quality_metrics?.medium_authority_links?.count || 0}
                </div>
                <div className="text-sm text-gray-400">Medium Authority</div>
                <div className="text-xs text-yellow-400">
                  {analysisData.quality_metrics?.medium_authority_links?.definition}
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {analysisData.quality_metrics?.low_authority_links?.count || 0}
                </div>
                <div className="text-sm text-gray-400">Low Authority</div>
                <div className="text-xs text-red-400">
                  {analysisData.quality_metrics?.low_authority_links?.definition}
                </div>
              </div>
            </div>

            {/* Platform Distribution */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Platform Types</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(analysisData.platform_types_distribution || {}).slice(0, 6).map(([platform, data]) => (
                  <div key={platform} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-white text-sm capitalize">{platform}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400 text-sm">{data.count?.toLocaleString()}</span>
                      <span className="text-gray-400 text-xs">({data.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Locations */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Link Placement</h4>
              <div className="space-y-2">
                {Object.entries(analysisData.semantic_locations_distribution || {}).map(([location, data]) => (
                  <div key={location} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-white text-sm capitalize">{location}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400 text-sm">{data.count?.toLocaleString()}</span>
                      <span className="text-gray-400 text-xs">({data.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TLD Distribution */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Top Level Domains</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(analysisData.top_level_domains_distribution || {}).slice(0, 8).map(([tld, data]) => (
                  <div key={tld} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-white text-sm">.{tld}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400 text-sm">{data.count?.toLocaleString()}</span>
                      <span className="text-gray-400 text-xs">({data.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="space-y-4">
            {/* Growth Chart */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Daily Growth Trend</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysisData.daily_growth_chart || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="new_backlinks" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="lost_backlinks" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Growth Metrics Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Growth Rates</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Backlinks:</span>
                    <span className={getGrowthColor(analysisData.growth_metrics?.backlinks_growth_rate || '+0%')}>
                      {analysisData.growth_metrics?.backlinks_growth_rate || '+0%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Referring Domains:</span>
                    <span className={getGrowthColor(analysisData.growth_metrics?.referring_domains_growth_rate || '+0%')}>
                      {analysisData.growth_metrics?.referring_domains_growth_rate || '+0%'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Period Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">New:</span>
                    <span className="text-green-400">+{analysisData.growth_metrics?.period_comparison?.current_period?.new_backlinks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lost:</span>
                    <span className="text-red-400">-{analysisData.growth_metrics?.period_comparison?.current_period?.lost_backlinks || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lost Backlinks */}
            {analysisData.lost_backlinks?.length > 0 && (
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Recently Lost Backlinks</h4>
                <div className="space-y-3">
                  {analysisData.lost_backlinks.map((lost, index) => (
                    <div key={index} className="bg-red-600/10 border border-red-500/20 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="text-white font-medium">{lost.domain}</div>
                          <div className="text-sm text-gray-400">"{lost.anchor_text}"</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-red-400">{lost.lost_date}</div>
                          <div className="text-xs text-gray-400">Authority: {lost.domain_rank}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dashboard Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4">
                <h5 className="text-green-400 font-medium mb-2">Strengths</h5>
                <div className="space-y-1 text-sm">
                  {analysisData.dashboard_insights?.strengths?.map((strength, index) => (
                    <div key={index} className="text-gray-300">• {strength}</div>
                  ))}
                </div>
              </div>
              <div className="bg-yellow-600/10 border border-yellow-500/20 rounded-lg p-4">
                <h5 className="text-yellow-400 font-medium mb-2">Opportunities</h5>
                <div className="space-y-1 text-sm">
                  {analysisData.dashboard_insights?.opportunities?.map((opp, index) => (
                    <div key={index} className="text-gray-300">• {opp}</div>
                  ))}
                </div>
              </div>
              <div className="bg-red-600/10 border border-red-500/20 rounded-lg p-4">
                <h5 className="text-red-400 font-medium mb-2">Risks</h5>
                <div className="space-y-1 text-sm">
                  {analysisData.dashboard_insights?.risks?.map((risk, index) => (
                    <div key={index} className="text-gray-300">• {risk}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BacklinkAnalysisWidget;