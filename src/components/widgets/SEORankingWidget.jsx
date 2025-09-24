import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import Icon from '../Icon';
import { WebhookService } from '../../utils/webhookConfig';
import { WidgetDataManager, AnalysisExporter } from '../../utils/widgetDataManager';

const SEORankingWidget = ({ data = null, config = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInputForm, setShowInputForm] = useState(!data); // Show form if no data
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({
    url: '',
    keywords: ''
  });
  const [fetchedData, setFetchedData] = useState(null);
  const [widgetId] = useState(() => `seo_ranking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [searchTerm, setSearchTerm] = useState('');

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = WidgetDataManager.loadWidgetData(widgetId);
    if (persistedData && !data && !fetchedData) {
      setFetchedData(persistedData);
      setShowInputForm(false);
      console.log('Loaded persisted SEO ranking data');
    }
  }, [widgetId, data, fetchedData]);

  // Enhanced sample data structure based on n8n workflow output
  const sampleData = {
    summary: {
      total_keywords: 25,
      average_position: 12.7,
      top_10_rankings: 8,
      top_3_rankings: 3,
      page_1_rankings: 8,
      not_ranking: 4,
    },
    keyword_rankings: [
      { keyword: 'automation tool', current_rank: 2, page: 1, featured_snippet: true, url: 'https://example.com/automation', title: 'Best Automation Tools 2024', snippet: 'Discover the top automation tools...' },
      { keyword: 'workflow automation', current_rank: 5, page: 1, featured_snippet: false, url: 'https://example.com/workflow', title: 'Workflow Automation Guide', snippet: 'Learn how to automate your workflows...' },
      { keyword: 'no-code platform', current_rank: 8, page: 1, featured_snippet: false, url: 'https://example.com/nocode', title: 'No-Code Platform Reviews', snippet: 'Compare the best no-code platforms...' },
      { keyword: 'integration platform', current_rank: 15, page: 2, featured_snippet: false, url: 'https://example.com/integration', title: 'API Integration Made Easy', snippet: 'Seamless integration solutions...' },
      { keyword: 'business automation', current_rank: 3, page: 1, featured_snippet: true, url: 'https://example.com/business', title: 'Business Automation Solutions', snippet: 'Transform your business processes...' },
      { keyword: 'process automation', current_rank: 12, page: 2, featured_snippet: false, url: 'https://example.com/process', title: 'Process Automation Tools', snippet: 'Streamline your operations...' },
      { keyword: 'data automation', current_rank: 23, page: 3, featured_snippet: false, url: 'https://example.com/data', title: 'Data Automation Best Practices', snippet: 'Automate your data workflows...' },
      { keyword: 'marketing automation', current_rank: 6, page: 1, featured_snippet: false, url: 'https://example.com/marketing', title: 'Marketing Automation Guide', snippet: 'Scale your marketing efforts...' }
    ],
    serp_features: {
      featured_snippets: 4,
      people_also_ask: 18,
      local_pack_appearances: 2,
      image_pack: 7,
      shopping_results: 1,
    },
    position_distribution: {
      positions_1_3: 3,
      positions_4_10: 5,
      positions_11_20: 8,
      positions_21_50: 5,
      positions_51_100: 0,
      not_found: 4,
    },
    competitors: [
      { domain: 'competitor1.com', rankings_above_you: 12, average_position: 4.2, keywords_they_rank_for: ['automation', 'workflow', 'integration'] },
      { domain: 'competitor2.com', rankings_above_you: 8, average_position: 6.7, keywords_they_rank_for: ['no-code', 'business tools', 'automation'] },
      { domain: 'competitor3.com', rankings_above_you: 5, average_position: 8.1, keywords_they_rank_for: ['process automation', 'workflow'] }
    ],
    trends: {
      ranking_changes: [
        { date: '2024-01-01', average_position: 18.5 },
        { date: '2024-01-08', average_position: 16.2 },
        { date: '2024-01-15', average_position: 14.8 },
        { date: '2024-01-22', average_position: 13.1 },
        { date: '2024-01-29', average_position: 12.7 }
      ],
      keyword_movement: [
        { keyword: 'automation tool', previous_rank: 4, current_rank: 2, change: 2 },
        { keyword: 'workflow automation', previous_rank: 8, current_rank: 5, change: 3 },
        { keyword: 'no-code platform', previous_rank: 12, current_rank: 8, change: 4 },
        { keyword: 'business automation', previous_rank: 5, current_rank: 3, change: 2 }
      ]
    }
  };

  // Handle n8n data structure - ensure compatibility with webhook response
  const displayData = fetchedData || data || sampleData;
  
  // Extract data from n8n structure if needed (data might be nested)
  const actualData = displayData.json || displayData;
  
  // Safely destructure with fallbacks
  const summary = actualData.summary || {};
  const keyword_rankings = actualData.keyword_rankings || [];
  const serp_features = actualData.serp_features || {};
  const position_distribution = actualData.position_distribution || {};
  const competitors = actualData.competitors || [];
  const trends = actualData.trends || null;

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
      const webhookResponse = await WebhookService.fetchSEORankingData(
        inputData.url, 
        inputData.keywords
      );
      
      if (webhookResponse) {
        // Use real webhook data
        setFetchedData(webhookResponse);
        setShowInputForm(false);
        // Save to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'SEO Ranking Tracker', webhookResponse);
      } else {
        // Fall back to mock data if webhooks are disabled
        console.log('Using mock data - webhooks disabled or failed');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
        
        const keywordList = inputData.keywords.split(',').map(k => k.trim()).filter(k => k);
        const mockResponse = {
          ...sampleData,
          target_url: inputData.url,
          summary: {
            ...sampleData.summary,
            total_keywords: keywordList.length || sampleData.summary.total_keywords
          },
          keyword_rankings: keywordList.length > 0 
            ? keywordList.map((keyword, index) => ({
                keyword: keyword,
                current_rank: Math.floor(Math.random() * 50) + 1,
                page: Math.ceil((Math.floor(Math.random() * 50) + 1) / 10),
                featured_snippet: Math.random() > 0.8,
                url: `${inputData.url}/page-${index + 1}`,
                title: `${keyword} - Best Guide 2024`,
                snippet: `Learn everything about ${keyword} in this comprehensive guide...`
              }))
            : sampleData.keyword_rankings
        };
        
        setFetchedData(mockResponse);
        setShowInputForm(false);
        // Save mock data to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'SEO Ranking Tracker', mockResponse);
      }
      
    } catch (error) {
      console.error('Error fetching SEO data:', error);
      // On error, show mock data as fallback
      const keywordList = inputData.keywords.split(',').map(k => k.trim()).filter(k => k);
      const mockResponse = {
        ...sampleData,
        target_url: inputData.url,
        summary: {
          ...sampleData.summary,
          total_keywords: keywordList.length || sampleData.summary.total_keywords
        }
      };
      setFetchedData(mockResponse);
      setShowInputForm(false);
      // Save fallback data to localStorage
      WidgetDataManager.saveWidgetData(widgetId, 'SEO Ranking Tracker', mockResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (!rank) return 'text-gray-500';
    if (rank <= 3) return 'text-green-400';
    if (rank <= 10) return 'text-blue-400';
    if (rank <= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRankBadgeColor = (rank) => {
    if (!rank) return 'bg-gray-600/20 text-gray-400';
    if (rank <= 3) return 'bg-green-600/20 text-green-400';
    if (rank <= 10) return 'bg-blue-600/20 text-blue-400';
    if (rank <= 20) return 'bg-yellow-600/20 text-yellow-400';
    return 'bg-red-600/20 text-red-400';
  };

  // Colors for charts
  const COLORS = {
    green: '#10B981',
    blue: '#3B82F6',
    yellow: '#F59E0B',
    orange: '#F97316',
    red: '#EF4444',
    purple: '#8B5CF6'
  };

  // Show input form if no data
  if (showInputForm) {
    return (
      <div className="w-full h-full min-h-[500px] max-h-[700px] p-6 flex items-center justify-center">
        <div className="bg-gray-800/30 p-8 rounded-2xl border border-gray-700/30 w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="p-4 bg-green-600/20 rounded-xl border border-green-500/20 w-fit mx-auto mb-4">
              <Icon name="TrendingUp" className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">SEO Ranking Tracker</h2>
            <p className="text-gray-400">Enter your website and keywords to track rankings</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Website URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={inputData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://example.com"
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">
                Keywords <span className="text-red-400">*</span>
              </label>
              <textarea
                value={inputData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="automation tool, workflow software, productivity app"
                rows={3}
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors resize-none"
                required
              />
              <p className="text-gray-400 text-sm mt-2">Enter keywords separated by commas</p>
            </div>
            
            <div className="flex space-x-4">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Rankings...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Search" className="w-5 h-5" />
                    <span>Track Rankings</span>
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
          <div className="p-4 bg-green-600/20 rounded-xl border border-green-500/20">
            <Icon name="TrendingUp" className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">SEO Ranking Tracker</h2>
            <p className="text-gray-400">Comprehensive keyword performance analytics</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Keywords</div>
            <div className="text-2xl font-bold text-white">{summary.total_keywords || 0}</div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => AnalysisExporter.exportToCSV(analysisData, 'seo-ranking-analysis')}
              className="px-3 py-2 bg-green-600/20 text-green-400 text-sm rounded-lg hover:bg-green-600/30 transition-colors"
              title="Export to CSV"
            >
              <Icon name="Download" className="w-4 h-4 inline mr-1" />
              CSV
            </button>
            <button
              onClick={() => {
                const summary = AnalysisExporter.generateSummary(analysisData, 'SEO Ranking Analysis');
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
              className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-lg transition-all flex items-center space-x-2"
            >
              <Icon name="Plus" className="w-4 h-4" />
              <span>New Search</span>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Quick Stats Grid - Horizontal Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="Target" className="w-5 h-5 text-blue-400" />
            <span className="text-xl font-bold text-white">{summary.total_keywords || 0}</span>
          </div>
          <p className="text-gray-400 text-xs">Total Keywords</p>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="Award" className="w-5 h-5 text-green-400" />
            <span className="text-xl font-bold text-white">{summary.average_position || 0}</span>
          </div>
          <p className="text-gray-400 text-xs">Avg Position</p>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="Crown" className="w-5 h-5 text-yellow-400" />
            <span className="text-xl font-bold text-white">{summary.top_3_rankings || 0}</span>
          </div>
          <p className="text-gray-400 text-xs">Top 3 Rankings</p>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <Icon name="Medal" className="w-5 h-5 text-purple-400" />
            <span className="text-xl font-bold text-white">{summary.top_10_rankings || 0}</span>
          </div>
          <p className="text-gray-400 text-xs">Top 10 Rankings</p>
        </div>
      </div>
      
      {/* Main Content - Horizontal Layout */}
      <div className="bg-gray-800/20 rounded-2xl p-4 border border-gray-700/30 flex-1">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 bg-gray-800/50 p-1 rounded-xl">
          {[
            { id: 'overview', label: 'Overview', icon: 'BarChart3' },
            { id: 'keywords', label: 'Keywords', icon: 'Search' },
            { id: 'features', label: 'SERP Features', icon: 'Star' },
            { id: 'competitors', label: 'Competitors', icon: 'Users' },
            { id: 'trends', label: 'Trends', icon: 'TrendingUp' }
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
              {/* Position Distribution Pie Chart */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-3">Position Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Top 3', value: position_distribution.positions_1_3 || 0, fill: COLORS.green },
                          { name: 'Page 1 (4-10)', value: position_distribution.positions_4_10 || 0, fill: COLORS.blue },
                          { name: 'Page 2 (11-20)', value: position_distribution.positions_11_20 || 0, fill: COLORS.yellow },
                          { name: 'Page 3-5 (21-50)', value: position_distribution.positions_21_50 || 0, fill: COLORS.orange },
                          { name: 'Not Found', value: position_distribution.not_found || 0, fill: COLORS.red },
                        ]}
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
              
              {/* Top Keywords */}
              <div className="lg:col-span-2 bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-3">Top Performing Keywords</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {keyword_rankings.slice(0, 8).map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-medium">{keyword.keyword}</h4>
                          {keyword.featured_snippet && (
                            <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                              FS
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">Page {keyword.page}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${getRankColor(keyword.current_rank)}`}>
                          #{keyword.current_rank || 'NR'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'keywords' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {keyword_rankings.map((keyword, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-white">{keyword.keyword}</h4>
                        {keyword.featured_snippet && (
                          <span className="bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                            Featured Snippet
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 mb-2">Page {keyword.page} • {keyword.url}</p>
                      {keyword.title && (
                        <p className="text-blue-400 font-medium mb-2">{keyword.title}</p>
                      )}
                      {keyword.snippet && (
                        <p className="text-gray-300 text-sm">{keyword.snippet}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${getRankColor(keyword.current_rank)}`}>
                        #{keyword.current_rank || 'NR'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {activeTab === 'features' && (
            <div className="space-y-6">
              {/* SERP Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { name: 'Featured Snippets', count: serp_features.featured_snippets || 0, icon: 'Star', color: 'text-yellow-400' },
                  { name: 'People Also Ask', count: serp_features.people_also_ask || 0, icon: 'HelpCircle', color: 'text-blue-400' },
                  { name: 'Image Pack', count: serp_features.image_pack || 0, icon: 'Image', color: 'text-green-400' },
                  { name: 'Local Pack', count: serp_features.local_pack_appearances || 0, icon: 'MapPin', color: 'text-red-400' },
                  { name: 'Shopping Results', count: serp_features.shopping_results || 0, icon: 'ShoppingCart', color: 'text-purple-400' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 text-center hover:bg-gray-800/50 transition-all"
                  >
                    <Icon name={feature.icon} className={`w-8 h-8 ${feature.color} mx-auto mb-2`} />
                    <h3 className="text-white font-semibold mb-1 text-sm">{feature.name}</h3>
                    <span className={`text-2xl font-bold ${feature.color}`}>{feature.count}</span>
                    <p className="text-gray-400 text-sm mt-2">
                      {summary.total_keywords ? ((feature.count / summary.total_keywords) * 100).toFixed(1) : 0}% of keywords
                    </p>
                  </motion.div>
                ))}
              </div>
              
              {/* SERP Features Chart */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-4">SERP Features Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Featured Snippets', count: serp_features.featured_snippets || 0, fill: COLORS.yellow },
                      { name: 'People Also Ask', count: serp_features.people_also_ask || 0, fill: COLORS.blue },
                      { name: 'Image Pack', count: serp_features.image_pack || 0, fill: COLORS.green },
                      { name: 'Local Pack', count: serp_features.local_pack_appearances || 0, fill: COLORS.red },
                      { name: 'Shopping', count: serp_features.shopping_results || 0, fill: COLORS.purple },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          background: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'competitors' && competitors && competitors.length > 0 && (
            <div className="space-y-4">
              {/* Competitors Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {competitors.map((competitor, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold truncate">{competitor.domain}</h3>
                      <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                        #{index + 1}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-center">
                        <span className="text-3xl font-bold text-red-400">{competitor.rankings_above_you}</span>
                        <p className="text-gray-400 text-sm">Rankings Above You</p>
                      </div>
                      
                      <div className="text-center">
                        <span className="text-2xl font-bold text-white">{competitor.average_position}</span>
                        <p className="text-gray-400 text-sm">Avg Position</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Competing Keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          {competitor.keywords_they_rank_for.map((keyword, kIndex) => (
                            <span key={kIndex} className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Competitor Comparison Chart */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-4">Competitor Comparison</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={competitors.map(c => ({
                      domain: c.domain.replace('.com', ''),
                      rankings: c.rankings_above_you,
                      avgPosition: c.average_position
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="domain" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          background: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                      <Bar dataKey="rankings" fill={COLORS.red} name="Rankings Above You" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'trends' && trends && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ranking Trends Over Time */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-4">Average Position Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends.ranking_changes}>
                      <defs>
                        <linearGradient id="positionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} reversed />
                      <Tooltip 
                        contentStyle={{
                          background: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="average_position" 
                        stroke={COLORS.purple}
                        fillOpacity={1} 
                        fill="url(#positionGradient)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Keyword Movement */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                <h3 className="text-white font-semibold mb-4">Recent Keyword Movement</h3>
                <div className="space-y-3">
                  {trends.keyword_movement.map((movement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{movement.keyword}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-gray-400 text-sm">Previous: #{movement.previous_rank}</span>
                          <span className="text-white text-sm font-medium">Current: #{movement.current_rank}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {movement.change > 0 ? (
                          <Icon name="TrendingUp" className="w-5 h-5 text-green-400" />
                        ) : movement.change < 0 ? (
                          <Icon name="TrendingDown" className="w-5 h-5 text-red-400" />
                        ) : (
                          <Icon name="Minus" className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`text-lg font-bold ${
                          movement.change > 0 ? 'text-green-400' : 
                          movement.change < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {movement.change > 0 ? '+' : ''}{movement.change}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEORankingWidget;