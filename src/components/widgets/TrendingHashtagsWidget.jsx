import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../Icon';
import { WebhookService } from '../../utils/webhookConfig';
import { WidgetDataManager, AnalysisExporter } from '../../utils/widgetDataManager';

const TrendingHashtagsWidget = ({ data = null, config = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInputForm, setShowInputForm] = useState(!data);
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({
    keywords: ['marketing', 'digitalmarketing'],
    platforms: ['instagram', 'facebook'],
    location: 'global',
    trackingPeriod: '24h',
    numHashtags: 20
  });
  const [fetchedData, setFetchedData] = useState(null);
  const [widgetId] = useState(() => `trending_hashtags_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = WidgetDataManager.loadWidgetData(widgetId);
    if (persistedData && !data && !fetchedData) {
      setFetchedData(persistedData);
      setShowInputForm(false);
      console.log('Loaded persisted hashtag data');
    }
  }, [widgetId, data, fetchedData]);

  // Sample data structure matching n8n workflow output
  const sampleData = {
    success: true,
    timestamp: new Date().toISOString(),
    requestId: Date.now().toString(),
    parameters: {
      platforms: ['instagram', 'facebook'],
      keywords: ['marketing', 'digitalmarketing'],
      location: 'global',
      trackingPeriod: '24h',
      trackingHours: 24,
      numHashtags: 20,
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    platforms: {
      instagram: {
        totalHashtagsFound: 145,
        topHashtags: [
          { hashtag: '#digitalmarketing', count: 28 },
          { hashtag: '#marketing', count: 24 },
          { hashtag: '#socialmediamarketing', count: 19 },
          { hashtag: '#contentmarketing', count: 16 },
          { hashtag: '#onlinemarketing', count: 14 },
          { hashtag: '#marketingtips', count: 12 },
          { hashtag: '#branding', count: 11 },
          { hashtag: '#seo', count: 10 },
          { hashtag: '#marketingstrategy', count: 9 },
          { hashtag: '#businessgrowth', count: 8 },
          { hashtag: '#entrepreneur', count: 7 },
          { hashtag: '#smallbusiness', count: 6 },
          { hashtag: '#leadgeneration', count: 5 },
          { hashtag: '#marketingagency', count: 4 },
          { hashtag: '#digitalstrategy', count: 3 }
        ]
      },
      facebook: {
        totalHashtagsFound: 98,
        topHashtags: [
          { hashtag: '#marketing', count: 22 },
          { hashtag: '#digitalmarketing', count: 18 },
          { hashtag: '#socialmedia', count: 15 },
          { hashtag: '#business', count: 13 },
          { hashtag: '#contentcreation', count: 11 },
          { hashtag: '#marketingtips', count: 9 },
          { hashtag: '#brandawareness', count: 8 },
          { hashtag: '#onlinebusiness', count: 7 },
          { hashtag: '#marketingtools', count: 6 },
          { hashtag: '#digitalstrategy', count: 5 },
          { hashtag: '#growthhacking', count: 4 },
          { hashtag: '#marketingautomation', count: 3 },
          { hashtag: '#conversionrate', count: 2 },
          { hashtag: '#customerengagement', count: 2 },
          { hashtag: '#marketingfunnel', count: 1 }
        ]
      }
    }
  };

  // Use fetched data if available, otherwise use sample or prop data
  const analysisData = fetchedData || data || sampleData;

  const platformOptions = [
    { value: ['instagram'], label: 'Instagram Only' },
    { value: ['facebook'], label: 'Facebook Only' },
    { value: ['instagram', 'facebook'], label: 'Both Platforms' }
  ];

  const locationOptions = [
    { value: 'global', label: 'Global' },
    { value: 'us', label: 'United States' },
    { value: 'in', label: 'India' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' }
  ];

  const trackingPeriodOptions = [
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' }
  ];

  const handleInputChange = (field, value) => {
    setInputData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKeywordChange = (value) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setInputData(prev => ({
      ...prev,
      keywords
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Try to fetch data from n8n webhook
      const webhookResponse = await WebhookService.callWebhook(
        '/webhook/hashtag-analyzer',
        {
          keywords: inputData.keywords,
          platforms: inputData.platforms,
          location: inputData.location,
          trackingPeriod: inputData.trackingPeriod,
          numHashtags: inputData.numHashtags
        }
      );
      
      if (webhookResponse) {
        setFetchedData(webhookResponse);
        setShowInputForm(false);
        WidgetDataManager.saveWidgetData(widgetId, 'Trending Hashtags Analysis', webhookResponse);
      } else {
        console.log('Using mock data - webhooks disabled or failed');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const mockResponse = {
          ...sampleData,
          parameters: {
            ...sampleData.parameters,
            ...inputData,
            startTime: new Date(Date.now() - (inputData.trackingPeriod === '6h' ? 6 : inputData.trackingPeriod === '7d' ? 168 : 24) * 60 * 60 * 1000).toISOString()
          },
          timestamp: new Date().toISOString()
        };
        
        setFetchedData(mockResponse);
        setShowInputForm(false);
        WidgetDataManager.saveWidgetData(widgetId, 'Trending Hashtags Analysis', mockResponse);
      }
      
    } catch (error) {
      console.error('Error fetching hashtag data:', error);
      const mockResponse = {
        ...sampleData,
        parameters: inputData,
        timestamp: new Date().toISOString()
      };
      setFetchedData(mockResponse);
      setShowInputForm(false);
      WidgetDataManager.saveWidgetData(widgetId, 'Trending Hashtags Analysis', mockResponse);
    } finally {
      setIsLoading(false);
    }
  };

  // Get combined hashtag data for charts
  const getCombinedHashtags = () => {
    const combined = {};
    
    if (analysisData.platforms?.instagram?.topHashtags) {
      analysisData.platforms.instagram.topHashtags.forEach(item => {
        const key = item.hashtag.toLowerCase();
        combined[key] = {
          hashtag: item.hashtag,
          instagram: item.count,
          facebook: 0,
          total: item.count
        };
      });
    }
    
    if (analysisData.platforms?.facebook?.topHashtags) {
      analysisData.platforms.facebook.topHashtags.forEach(item => {
        const key = item.hashtag.toLowerCase();
        if (combined[key]) {
          combined[key].facebook = item.count;
          combined[key].total += item.count;
        } else {
          combined[key] = {
            hashtag: item.hashtag,
            instagram: 0,
            facebook: item.count,
            total: item.count
          };
        }
      });
    }
    
    return Object.values(combined).sort((a, b) => b.total - a.total).slice(0, 10);
  };

  const getTopHashtagsByPlatform = (platform) => {
    if (platform === 'all') return getCombinedHashtags();
    return analysisData.platforms?.[platform]?.topHashtags?.slice(0, 10) || [];
  };

  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#F97316'];

  // Show input form if no data
  if (showInputForm) {
    return (
      <div className="w-full h-full min-h-[600px] max-h-[90vh] p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Hash" className="w-10 h-10 text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Trending Hashtags Analyzer</h2>
            <p className="text-gray-400">Discover trending hashtags across Instagram and Facebook for optimal social media reach</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Keywords/Topics <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={inputData.keywords.join(', ')}
                onChange={(e) => handleKeywordChange(e.target.value)}
                placeholder="marketing, digitalmarketing, socialmedia"
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
                required
              />
              <p className="text-sm text-gray-400 mt-1">Separate keywords with commas</p>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">
                Social Media Platforms <span className="text-red-400">*</span>
              </label>
              <select
                value={JSON.stringify(inputData.platforms)}
                onChange={(e) => handleInputChange('platforms', JSON.parse(e.target.value))}
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-pink-500 focus:outline-none transition-colors"
                required
              >
                {platformOptions.map(option => (
                  <option key={JSON.stringify(option.value)} value={JSON.stringify(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Location</label>
                <select
                  value={inputData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-pink-500 focus:outline-none transition-colors"
                >
                  {locationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Time Period</label>
                <select
                  value={inputData.trackingPeriod}
                  onChange={(e) => handleInputChange('trackingPeriod', e.target.value)}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-pink-500 focus:outline-none transition-colors"
                >
                  {trackingPeriodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Number of Hashtags</label>
              <select
                value={inputData.numHashtags}
                onChange={(e) => handleInputChange('numHashtags', parseInt(e.target.value))}
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-pink-500 focus:outline-none transition-colors"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing Hashtags...</span>
                  </div>
                ) : (
                  'Find Trending Hashtags'
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
          
          <div className="mt-8 p-4 bg-pink-600/10 border border-pink-500/20 rounded-xl">
            <h3 className="text-white font-medium mb-2">Social Media Intelligence Features:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
              <div>• Instagram hashtag analysis</div>
              <div>• Facebook trending tags</div>
              <div>• Cross-platform insights</div>
              <div>• Hashtag performance ranking</div>
              <div>• Content strategy optimization</div>
              <div>• Engagement trend analysis</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main widget tabs
  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'BarChart3' },
    { id: 'instagram', name: 'Instagram', icon: 'Camera' },
    { id: 'facebook', name: 'Facebook', icon: 'Users' },
    { id: 'insights', name: 'Insights', icon: 'Brain' }
  ];

  return (
    <div className="w-full h-full min-h-[500px] max-h-[90vh] bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-600/20 rounded-lg flex items-center justify-center">
              <Icon name="Hash" className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Trending Hashtags Analyzer</h3>
              <p className="text-xs text-gray-400">
                {analysisData.parameters?.keywords?.join(', ') || 'N/A'} • 
                {analysisData.parameters?.platforms?.join(' + ') || 'N/A'} • 
                {analysisData.parameters?.trackingPeriod || '24h'} • 
                {analysisData.parameters?.location || 'global'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => AnalysisExporter.exportToCSV(analysisData, 'trending-hashtags')}
              className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-lg hover:bg-green-600/30 transition-colors"
              title="Export to CSV"
            >
              <Icon name="Download" className="w-3 h-3 inline mr-1" />
              CSV
            </button>
            <button
              onClick={() => {
                const summary = AnalysisExporter.generateSummary(analysisData, 'Trending Hashtags Analysis');
                navigator.clipboard.writeText(summary).then(() => {
                  console.log('Hashtags copied to clipboard');
                }).catch(err => {
                  console.error('Failed to copy hashtags:', err);
                });
              }}
              className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-lg hover:bg-purple-600/30 transition-colors"
              title="Copy Hashtags to Clipboard"
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
                  ? 'bg-pink-600/20 text-pink-400'
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
                <div className="text-2xl font-bold text-pink-400">
                  {(analysisData.platforms?.instagram?.totalHashtagsFound || 0) + (analysisData.platforms?.facebook?.totalHashtagsFound || 0)}
                </div>
                <div className="text-xs text-gray-400">Total Hashtags</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">
                  {analysisData.platforms?.instagram?.totalHashtagsFound || 0}
                </div>
                <div className="text-xs text-gray-400">Instagram</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">
                  {analysisData.platforms?.facebook?.totalHashtagsFound || 0}
                </div>
                <div className="text-xs text-gray-400">Facebook</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">
                  {analysisData.parameters?.keywords?.length || 0}
                </div>
                <div className="text-xs text-gray-400">Keywords</div>
              </div>
            </div>

            {/* Top Hashtags Chart */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Top Performing Hashtags</h4>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="text-xs bg-gray-600/50 text-white border border-gray-500/30 rounded px-2 py-1"
                >
                  <option value="all">All Platforms</option>
                  <option value="instagram">Instagram Only</option>
                  <option value="facebook">Facebook Only</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopHashtagsByPlatform(selectedPlatform)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hashtag" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                    />
                    {selectedPlatform === 'all' ? (
                      <>
                        <Bar dataKey="instagram" fill="#3B82F6" name="Instagram" />
                        <Bar dataKey="facebook" fill="#8B5CF6" name="Facebook" />
                      </>
                    ) : (
                      <Bar dataKey="count" fill="#EC4899" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Distribution */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Platform Performance</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { 
                            name: 'Instagram', 
                            value: analysisData.platforms?.instagram?.totalHashtagsFound || 0, 
                            fill: '#3B82F6' 
                          },
                          { 
                            name: 'Facebook', 
                            value: analysisData.platforms?.facebook?.totalHashtagsFound || 0, 
                            fill: '#8B5CF6' 
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        dataKey="value"
                      >
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Analysis Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Keywords Analyzed:</span>
                    <span className="text-white">{analysisData.parameters?.keywords?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Period:</span>
                    <span className="text-white">{analysisData.parameters?.trackingPeriod || '24h'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white">{analysisData.parameters?.location || 'global'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Analyzed At:</span>
                    <span className="text-white">{new Date(analysisData.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'instagram' && (
          <div className="space-y-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Icon name="Camera" className="w-4 h-4 mr-2 text-blue-400" />
                Instagram Trending Hashtags
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysisData.platforms?.instagram?.topHashtags?.map((item, index) => (
                  <div key={index} className="bg-gray-600/30 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">
                        {index + 1}
                      </div>
                      <span className="text-white font-mono">{item.hashtag}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 font-bold">{item.count}</div>
                      <div className="text-xs text-gray-400">posts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'facebook' && (
          <div className="space-y-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Icon name="Users" className="w-4 h-4 mr-2 text-purple-400" />
                Facebook Trending Hashtags
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysisData.platforms?.facebook?.topHashtags?.map((item, index) => (
                  <div key={index} className="bg-gray-600/30 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-400">
                        {index + 1}
                      </div>
                      <span className="text-white font-mono">{item.hashtag}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold">{item.count}</div>
                      <div className="text-xs text-gray-400">mentions</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {/* Marketing Strategy Insights */}
            <div className="bg-gradient-to-r from-pink-600/10 to-purple-600/10 border border-pink-500/20 rounded-lg p-4">
              <h4 className="text-pink-400 font-medium mb-3 flex items-center">
                <Icon name="Brain" className="w-4 h-4 mr-2" />
                Content Strategy Recommendations
              </h4>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <h5 className="text-white font-medium mb-2">🚀 Top Performing Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {getCombinedHashtags().slice(0, 5).map((item, index) => (
                      <span key={index} className="px-2 py-1 bg-pink-600/20 text-pink-300 rounded text-xs font-mono">
                        {item.hashtag}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs mt-2">Use these high-engagement hashtags for maximum reach</p>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-3">
                  <h5 className="text-white font-medium mb-2">📈 Platform Strategy</h5>
                  <div className="text-xs text-gray-300 space-y-1">
                    {(analysisData.platforms?.instagram?.totalHashtagsFound || 0) > (analysisData.platforms?.facebook?.totalHashtagsFound || 0) ? (
                      <div>• <strong>Instagram Focus:</strong> Higher hashtag activity - prioritize Instagram campaigns</div>
                    ) : (
                      <div>• <strong>Facebook Focus:</strong> Strong Facebook presence - leverage Facebook advertising</div>
                    )}
                    <div>• <strong>Cross-platform:</strong> Use common hashtags for consistent brand messaging</div>
                    <div>• <strong>Timing:</strong> Post during peak hashtag activity periods</div>
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-3">
                  <h5 className="text-white font-medium mb-2">💡 Content Ideas</h5>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>• Create posts around trending hashtags: {getCombinedHashtags().slice(0, 3).map(h => h.hashtag).join(', ')}</div>
                    <div>• Mix 3-5 high-volume tags with 2-3 niche-specific hashtags</div>
                    <div>• Monitor competitor usage of these trending tags</div>
                    <div>• Create hashtag-specific content campaigns</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Summary */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Analysis Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="text-white font-medium mb-2">Keywords Analyzed</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.parameters?.keywords?.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-white font-medium mb-2">Analysis Details</h5>
                  <ul className="text-gray-400 space-y-1 text-xs">
                    <li>Tracking Period: {analysisData.parameters?.trackingPeriod || '24h'}</li>
                    <li>Geographic Focus: {analysisData.parameters?.location || 'Global'}</li>
                    <li>Platforms: {analysisData.parameters?.platforms?.join(', ') || 'N/A'}</li>
                    <li>Analysis Time: {new Date(analysisData.timestamp).toLocaleString()}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingHashtagsWidget;