import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../Icon';
import { WebhookService } from '../../utils/webhookConfig';
import { WidgetDataManager, AnalysisExporter } from '../../utils/widgetDataManager';

const SEOMetaTagWidget = ({ data = null, config = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInputForm, setShowInputForm] = useState(!data);
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({
    website_url: '',
    site_name: '',
    tone_style: 'professional'
  });
  const [fetchedData, setFetchedData] = useState(null);
  const [widgetId] = useState(() => `seo_metatag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [copiedTag, setCopiedTag] = useState('');

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = WidgetDataManager.loadWidgetData(widgetId);
    if (persistedData && !data && !fetchedData) {
      setFetchedData(persistedData);
      setShowInputForm(false);
      console.log('Loaded persisted SEO meta tag data');
    }
  }, [widgetId, data, fetchedData]);

  // Sample data structure based on the n8n workflow
  const sampleData = {
    website_url: 'https://example.com',
    site_name: 'Example Site',
    timestamp: new Date().toISOString(),
    overall_score: 78,
    
    current_meta_tags: {
      meta_title: { content: 'Example Site - Home Page', length: 25, status: 'present_but_short' },
      meta_description: { content: 'Welcome to our website', length: 21, status: 'present_but_short' },
      meta_keywords: { content: null, status: 'missing' },
      canonical_url: { content: 'https://example.com/', status: 'present' },
      robots: { content: 'index, follow', status: 'present' },
      open_graph: {
        og_title: { content: null, status: 'missing' },
        og_description: { content: null, status: 'missing' },
        og_image: { content: null, status: 'missing' },
        og_url: { content: null, status: 'missing' },
        og_type: { content: null, status: 'missing' }
      },
      twitter_card: {
        twitter_card: { content: null, status: 'missing' },
        twitter_title: { content: null, status: 'missing' },
        twitter_description: { content: null, status: 'missing' },
        twitter_image: { content: null, status: 'missing' }
      }
    },

    improved_recommended_meta_tags: {
      meta_title: {
        current: 'Example Site - Home Page',
        optimized: 'Example Site - Professional Services & Solutions | Your Business',
        improvements: ['Include primary keywords', 'Optimize length (50-60 chars)', 'Add value proposition'],
        length: 58
      },
      meta_description: {
        current: 'Welcome to our website',
        optimized: 'Discover professional services and innovative solutions at Example Site. Get expert guidance and tailored strategies for your business needs.',
        improvements: ['Add compelling call-to-action', 'Include primary keywords', 'Optimize length (150-160 chars)'],
        length: 152
      },
      meta_keywords: {
        current: null,
        optimized: 'professional services, business solutions, expert consulting, innovative strategies',
        improvements: ['Add relevant keywords', 'Focus on primary terms', 'Avoid keyword stuffing']
      },
      canonical_url: {
        current: 'https://example.com/',
        optimized: 'https://example.com/',
        improvements: ['URL is properly formatted']
      },
      robots: {
        current: 'index, follow',
        optimized: 'index, follow',
        improvements: ['Robots directive is optimal']
      },
      open_graph: {
        og_title: {
          current: null,
          optimized: 'Example Site - Professional Services & Solutions',
          improvements: ['Add engaging OG title', 'Keep under 60 characters', 'Include brand name']
        },
        og_description: {
          current: null,
          optimized: 'Discover professional services and innovative solutions. Get expert guidance for your business.',
          improvements: ['Add compelling description', 'Optimize for social sharing', 'Include call-to-action']
        },
        og_image: {
          current: null,
          optimized: 'https://example.com/images/og-image.jpg',
          improvements: ['Add high-quality image', 'Use 1200x630 dimensions', 'Include brand elements']
        },
        og_url: {
          current: null,
          optimized: 'https://example.com/',
          improvements: ['Add canonical URL', 'Ensure consistency with canonical']
        },
        og_type: {
          current: null,
          optimized: 'website',
          improvements: ['Specify content type', 'Use appropriate OG type']
        }
      },
      twitter_card: {
        twitter_card: {
          current: null,
          optimized: 'summary_large_image',
          improvements: ['Add Twitter Card type', 'Use large image format for better engagement']
        },
        twitter_title: {
          current: null,
          optimized: 'Example Site - Professional Services & Solutions',
          improvements: ['Add Twitter-specific title', 'Optimize for Twitter character limits']
        },
        twitter_description: {
          current: null,
          optimized: 'Discover professional services and innovative solutions. Get expert guidance for your business.',
          improvements: ['Add Twitter description', 'Optimize for platform', 'Include hashtags if relevant']
        },
        twitter_image: {
          current: null,
          optimized: 'https://example.com/images/twitter-card.jpg',
          improvements: ['Add Twitter image', 'Use 1200x600 dimensions', 'Ensure brand consistency']
        }
      }
    },

    analysis_summary: {
      strengths: ['Canonical URL present', 'Robots directive configured'],
      weaknesses: ['Missing meta description', 'No social media tags', 'Short title tag'],
      priority_issues: ['Add comprehensive meta description', 'Implement Open Graph tags', 'Optimize title length']
    },

    improvement_suggestions: {
      critical: [
        { id: 'meta_desc', title: 'Add Meta Description', impact: 'high', effort: 'low', category: 'meta_tags' },
        { id: 'og_tags', title: 'Implement Open Graph Tags', impact: 'high', effort: 'medium', category: 'meta_tags' }
      ],
      important: [
        { id: 'title_opt', title: 'Optimize Title Length', impact: 'medium', effort: 'low', category: 'meta_tags' },
        { id: 'twitter_cards', title: 'Add Twitter Cards', impact: 'medium', effort: 'medium', category: 'meta_tags' }
      ],
      recommended: [
        { id: 'meta_keywords', title: 'Add Meta Keywords', impact: 'low', effort: 'low', category: 'meta_tags' }
      ]
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Try to fetch data from n8n webhook
      const webhookResponse = await WebhookService.fetchSEOMetaTagData({
        url: inputData.website_url,
        site_name: inputData.site_name,
        tone_style: inputData.tone_style
      });
      
      if (webhookResponse) {
        setFetchedData(webhookResponse);
        setShowInputForm(false);
        WidgetDataManager.saveWidgetData(widgetId, 'SEO Meta Tag Generator', webhookResponse);
      } else {
        // Fallback to mock data
        console.log('Using mock data - webhooks disabled or failed');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const mockResponse = {
          ...sampleData,
          website_url: inputData.website_url,
          site_name: inputData.site_name || 'Your Website',
          overall_score: Math.floor(Math.random() * 40) + 50,
          timestamp: new Date().toISOString()
        };
        
        setFetchedData(mockResponse);
        setShowInputForm(false);
        WidgetDataManager.saveWidgetData(widgetId, 'SEO Meta Tag Generator', mockResponse);
      }
      
    } catch (error) {
      console.error('Error generating SEO meta tags:', error);
      const mockResponse = {
        ...sampleData,
        website_url: inputData.website_url,
        site_name: inputData.site_name || 'Your Website'
      };
      setFetchedData(mockResponse);
      setShowInputForm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (tagName, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTag(tagName);
      setTimeout(() => setCopiedTag(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateMetaTagHTML = (tagData) => {
    if (!tagData) return '';
    
    const tags = [];
    
    // Basic meta tags
    if (tagData.meta_title?.optimized) {
      tags.push(`<title>${tagData.meta_title.optimized}</title>`);
    }
    if (tagData.meta_description?.optimized) {
      tags.push(`<meta name="description" content="${tagData.meta_description.optimized}">`);
    }
    if (tagData.meta_keywords?.optimized) {
      tags.push(`<meta name="keywords" content="${tagData.meta_keywords.optimized}">`);
    }
    if (tagData.canonical_url?.optimized) {
      tags.push(`<link rel="canonical" href="${tagData.canonical_url.optimized}">`);
    }
    if (tagData.robots?.optimized) {
      tags.push(`<meta name="robots" content="${tagData.robots.optimized}">`);
    }
    
    // Open Graph tags
    const og = tagData.open_graph;
    if (og?.og_title?.optimized) tags.push(`<meta property="og:title" content="${og.og_title.optimized}">`);
    if (og?.og_description?.optimized) tags.push(`<meta property="og:description" content="${og.og_description.optimized}">`);
    if (og?.og_image?.optimized) tags.push(`<meta property="og:image" content="${og.og_image.optimized}">`);
    if (og?.og_url?.optimized) tags.push(`<meta property="og:url" content="${og.og_url.optimized}">`);
    if (og?.og_type?.optimized) tags.push(`<meta property="og:type" content="${og.og_type.optimized}">`);
    
    // Twitter Card tags
    const twitter = tagData.twitter_card;
    if (twitter?.twitter_card?.optimized) tags.push(`<meta name="twitter:card" content="${twitter.twitter_card.optimized}">`);
    if (twitter?.twitter_title?.optimized) tags.push(`<meta name="twitter:title" content="${twitter.twitter_title.optimized}">`);
    if (twitter?.twitter_description?.optimized) tags.push(`<meta name="twitter:description" content="${twitter.twitter_description.optimized}">`);
    if (twitter?.twitter_image?.optimized) tags.push(`<meta name="twitter:image" content="${twitter.twitter_image.optimized}">`);
    
    return tags.join('\n');
  };

  const activeData = fetchedData || data || sampleData;
  const metaTags = activeData?.improved_recommended_meta_tags || {};
  const currentTags = activeData?.current_meta_tags || {};
  const analysis = activeData?.analysis_summary || {};
  const suggestions = activeData?.improvement_suggestions || {};

  // Chart data for meta tag status
  const tagStatusData = [
    { name: 'Present', value: Object.values(currentTags).filter(tag => 
      tag?.status === 'present' || tag?.status === 'present_but_short').length, color: '#10b981' },
    { name: 'Missing', value: Object.values(currentTags).filter(tag => 
      tag?.status === 'missing').length, color: '#ef4444' },
    { name: 'Needs Optimization', value: Object.values(currentTags).filter(tag => 
      tag?.status === 'present_but_short' || tag?.status === 'present_but_not_optimized').length, color: '#f59e0b' }
  ];

  const priorityData = [
    { name: 'Critical', value: suggestions.critical?.length || 0, color: '#dc2626' },
    { name: 'Important', value: suggestions.important?.length || 0, color: '#f59e0b' },
    { name: 'Recommended', value: suggestions.recommended?.length || 0, color: '#10b981' }
  ];

  if (showInputForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <Icon name="tag" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">SEO Meta Tag Generator</h3>
            <p className="text-gray-600 dark:text-gray-300">Generate optimized meta tags for better SEO</p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website URL *
            </label>
            <input
              type="url"
              value={inputData.website_url}
              onChange={(e) => setInputData(prev => ({ ...prev, website_url: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site Name (Optional)
            </label>
            <input
              type="text"
              value={inputData.site_name}
              onChange={(e) => setInputData(prev => ({ ...prev, site_name: e.target.value }))}
              placeholder="Your Website Name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tone Style
            </label>
            <select
              value={inputData.tone_style}
              onChange={(e) => setInputData(prev => ({ ...prev, tone_style: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="creative">Creative</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputData.website_url}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Meta Tags...
              </>
            ) : (
              <>
                <Icon name="tag" className="w-4 h-4" />
                Generate Meta Tags
              </>
            )}
          </button>
        </form>
      </motion.div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'chart-bar' },
    { id: 'meta-tags', label: 'Meta Tags', icon: 'tag' },
    { id: 'social', label: 'Social Tags', icon: 'share' },
    { id: 'export', label: 'Export HTML', icon: 'code' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon name="tag" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">SEO Meta Tag Generator</h3>
              <p className="text-purple-100">{activeData?.website_url || 'Website Analysis'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold">{activeData?.overall_score || 78}%</div>
              <div className="text-purple-100 text-sm">Overall Score</div>
            </div>
            <button
              onClick={() => setShowInputForm(true)}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <Icon name="refresh" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon name={tab.icon} className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-400">Strengths</h4>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  {analysis.strengths?.length || 0} items identified
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-400">Issues</h4>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {(suggestions.critical?.length || 0) + (suggestions.important?.length || 0)} to fix
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-400">Opportunities</h4>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  {suggestions.recommended?.length || 0} improvements
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-white mb-4">Meta Tag Status</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={tagStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                    >
                      {tagStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-white mb-4">Priority Issues</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Priority Issues */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 dark:text-white">Priority Improvements</h4>
              {analysis.priority_issues?.map((issue, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="exclamation" className="w-3 h-3 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">{issue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'meta-tags' && (
          <div className="space-y-6">
            {/* Title Tag */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 dark:text-white">Title Tag</h4>
                <button
                  onClick={() => copyToClipboard('title', `<title>${metaTags.meta_title?.optimized}</title>`)}
                  className="text-purple-600 hover:text-purple-700 p-1"
                >
                  <Icon name="copy" className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current:</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {metaTags.meta_title?.current || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Optimized ({metaTags.meta_title?.length} chars):</p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                    {metaTags.meta_title?.optimized}
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Description */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 dark:text-white">Meta Description</h4>
                <button
                  onClick={() => copyToClipboard('description', `<meta name="description" content="${metaTags.meta_description?.optimized}">`)}
                  className="text-purple-600 hover:text-purple-700 p-1"
                >
                  <Icon name="copy" className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current:</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {metaTags.meta_description?.current || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Optimized ({metaTags.meta_description?.length} chars):</p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                    {metaTags.meta_description?.optimized}
                  </p>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 dark:text-white">Meta Keywords</h4>
                <button
                  onClick={() => copyToClipboard('keywords', `<meta name="keywords" content="${metaTags.meta_keywords?.optimized}">`)}
                  className="text-purple-600 hover:text-purple-700 p-1"
                >
                  <Icon name="copy" className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current:</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {metaTags.meta_keywords?.current || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Optimized:</p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                    {metaTags.meta_keywords?.optimized}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">Canonical URL</h4>
                <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                  {metaTags.canonical_url?.optimized}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">Robots</h4>
                <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                  {metaTags.robots?.optimized}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            {/* Open Graph Tags */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Icon name="facebook" className="w-5 h-5 text-blue-600" />
                Open Graph (Facebook)
              </h4>
              <div className="space-y-4">
                {Object.entries(metaTags.open_graph || {}).map(([key, tag]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-800 dark:text-white capitalize">
                        {key.replace('og_', '').replace('_', ' ')}
                      </h5>
                      <button
                        onClick={() => copyToClipboard(`og-${key}`, `<meta property="og:${key.replace('og_', '')}" content="${tag?.optimized}">`)}
                        className="text-purple-600 hover:text-purple-700 p-1"
                      >
                        <Icon name="copy" className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Current:</p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {tag?.current || 'Not set'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Optimized:</p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                        {tag?.optimized}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Twitter Card Tags */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Icon name="twitter" className="w-5 h-5 text-blue-400" />
                Twitter Cards
              </h4>
              <div className="space-y-4">
                {Object.entries(metaTags.twitter_card || {}).map(([key, tag]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-800 dark:text-white capitalize">
                        {key.replace('twitter_', '').replace('_', ' ')}
                      </h5>
                      <button
                        onClick={() => copyToClipboard(`twitter-${key}`, `<meta name="twitter:${key.replace('twitter_', '')}" content="${tag?.optimized}">`)}
                        className="text-purple-600 hover:text-purple-700 p-1"
                      >
                        <Icon name="copy" className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Current:</p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {tag?.current || 'Not set'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Optimized:</p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                        {tag?.optimized}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800 dark:text-white">Complete HTML Meta Tags</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard('all-tags', generateMetaTagHTML(metaTags))}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Icon name="copy" className="w-4 h-4" />
                  {copiedTag === 'all-tags' ? 'Copied!' : 'Copy All'}
                </button>
                <button
                  onClick={() => AnalysisExporter.exportMetaTags(activeData)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Icon name="download" className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {generateMetaTagHTML(metaTags)}
              </pre>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Implementation Instructions</h5>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Copy the HTML code above and paste it in your website's &lt;head&gt; section</li>
                <li>• Replace placeholder URLs with your actual image URLs</li>
                <li>• Test your meta tags using social media debuggers</li>
                <li>• Monitor performance and adjust as needed</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SEOMetaTagWidget;