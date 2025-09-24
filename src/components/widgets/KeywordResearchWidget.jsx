import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadialBarChart, RadialBar, AreaChart, Area } from 'recharts';
import Icon from '../Icon';
import { WebhookService } from '../../utils/webhookConfig';
import { WidgetDataManager, AnalysisExporter } from '../../utils/widgetDataManager';

const KeywordResearchWidget = ({ data = null, config = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInputForm, setShowInputForm] = useState(!data);
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({
    website_url: '',
    industry: '',
    location: ''
  });
  const [fetchedData, setFetchedData] = useState(null);
  const [widgetId] = useState(() => `keyword_research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [searchTerm, setSearchTerm] = useState('');

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = WidgetDataManager.loadWidgetData(widgetId);
    if (persistedData && !data && !fetchedData) {
      setFetchedData(persistedData);
      setShowInputForm(false);
      console.log('Loaded persisted keyword research data');
    }
  }, [widgetId, data, fetchedData]);

  // Enhanced sample data structure matching n8n workflow output
  const sampleData = {
    status: "success",
    generated_on: new Date().toISOString(),
    data: [{
      analysis_metadata: {
        analyzed_date: new Date().toISOString(),
        website_title: "Digital Marketing Agency - Growth Solutions",
        meta_description: "Professional digital marketing services to grow your business online with SEO, content marketing, and automation.",
        word_count: 2847,
        has_content: true,
        processing_status: "completed",
        analysis_version: "2.1",
        errors: []
      },
      input_data: {
        website_url: "https://example-agency.com",
        domain: "example-agency.com",
        industry: "digital marketing",
        location: {
          raw: "San Francisco, CA, USA",
          city: "San Francisco",
          state: "CA", 
          country: "USA",
          formatted: "San Francisco, CA, USA"
        },
        timestamp: new Date().toISOString()
      },
      ai_summary: {
        intent: "Mixed Intent Analysis",
        rationale: "Analysis based on keyword research and competitor analysis showing balanced commercial and informational intent",
        intent_distribution: {
          commercial: 65,
          informational: 25,
          navigational: 10
        },
        content_opportunities: [
          {
            topic: "AI Marketing Automation Guide",
            search_volume: "8.2K/month",
            difficulty: "medium",
            opportunity_score: 85
          },
          {
            topic: "Local SEO Services Comparison",
            search_volume: "3.4K/month", 
            difficulty: "low",
            opportunity_score: 92
          },
          {
            topic: "Marketing Analytics Dashboard Tutorial",
            search_volume: "2.1K/month",
            difficulty: "low",
            opportunity_score: 78
          },
          {
            topic: "Content Marketing ROI Calculator",
            search_volume: "1.8K/month",
            difficulty: "medium",
            opportunity_score: 71
          }
        ],
        long_tail_keywords: [
          {
            keyword: "how to measure digital marketing roi 2024",
            search_volume_range: "500-1K",
            intent: "informational",
            difficulty: "medium"
          },
          {
            keyword: "best marketing automation tools for small business",
            search_volume_range: "1K-5K", 
            intent: "commercial",
            difficulty: "high"
          },
          {
            keyword: "local seo checklist for restaurants",
            search_volume_range: "300-800",
            intent: "informational",
            difficulty: "low"
          }
        ],
        strategic_recommendations: [
          {
            action: "Create localized landing pages for San Francisco marketing services",
            details: "Target 'digital marketing agency san francisco' and related geo-specific terms",
            timeline: "2-3 weeks",
            priority: "high"
          },
          {
            action: "Develop comprehensive AI marketing automation content series", 
            details: "Cover trending AI marketing topics with practical guides and case studies",
            timeline: "4-6 weeks",
            priority: "high"
          }
        ]
      },
      website_analysis: {
        title: "Digital Marketing Agency - Growth Solutions",
        meta_description: "Professional digital marketing services to grow your business online with SEO, content marketing, and automation.",
        word_count: 2847,
        has_content: true,
        seo_score: 85,
        technical_issues: [
          "Some images missing alt tags",
          "Page load speed could be improved"
        ],
        recommendations: [
          "Add schema markup for local business",
          "Optimize images for faster loading",
          "Create more topic clusters around core services"
        ]
      },
      competitor_analysis: {
        total_competitors: 8,
        top_competitors: [
          {
            domain: "competitor1.com",
            title: "Leading Digital Marketing Solutions",
            rank_position: 2,
            competitive_strength: "high"
          },
          {
            domain: "competitor2.com",
            title: "Professional Marketing Services",
            rank_position: 4,
            competitive_strength: "medium"
          },
          {
            domain: "competitor3.com", 
            title: "San Francisco Marketing Agency",
            rank_position: 6,
            competitive_strength: "medium"
          }
        ],
        competitive_gaps: [
          {
            keyword: "marketing automation consultation",
            found_via: "SerpApi Competitor Related"
          },
          {
            keyword: "digital marketing strategy template",
            found_via: "SerpApi Industry Related"
          }
        ],
        market_position: "moderately_competitive"
      },
      keyword_strategy: {
        primary_keywords: [
          {
            keyword: "digital marketing services",
            search_volume_range: "10K-100K",
            trend: "stable",
            intent: "commercial",
            serp_difficulty: "high",
            found_via: "SerpApi Autocomplete",
            relevance_score: 95
          },
          {
            keyword: "marketing automation platform",
            search_volume_range: "5K-10K", 
            trend: "rising",
            intent: "commercial",
            serp_difficulty: "medium",
            found_via: "SerpApi Autocomplete",
            relevance_score: 88
          },
          {
            keyword: "content marketing strategy",
            search_volume_range: "3K-5K",
            trend: "stable",
            intent: "informational", 
            serp_difficulty: "medium",
            found_via: "SerpApi Autocomplete",
            relevance_score: 82
          },
          {
            keyword: "seo consultation services",
            search_volume_range: "1K-3K",
            trend: "increasing",
            intent: "commercial",
            serp_difficulty: "medium", 
            found_via: "SerpApi Autocomplete",
            relevance_score: 79
          }
        ],
        local_keywords: [
          {
            keyword: "digital marketing san francisco",
            search_volume_range: "1K-3K",
            trend: "stable",
            intent: "commercial",
            serp_difficulty: "medium",
            found_via: "Generated Local",
            relevance_score: 91
          },
          {
            keyword: "marketing agency near me",
            search_volume_range: "3K-5K",
            trend: "increasing", 
            intent: "commercial",
            serp_difficulty: "low",
            found_via: "Generated Local",
            relevance_score: 87
          }
        ],
        trending_keywords: [
          {
            keyword: "ai digital marketing",
            trend_direction: "rising",
            interest_growth: "145%",
            peak_months: ["January", "March"],
            source: "pytrends"
          },
          {
            keyword: "automated marketing digital",
            trend_direction: "rising",
            interest_growth: "89%",
            peak_months: ["February", "April"],
            source: "pytrends"
          }
        ],
        content_clusters: [
          {
            cluster_name: "Primary Business Services",
            keywords: [
              {
                keyword: "digital marketing services", 
                search_volume_range: "10K-100K",
                intent: "commercial"
              },
              {
                keyword: "marketing automation platform",
                search_volume_range: "5K-10K",
                intent: "commercial"
              }
            ],
            content_type: "pillar_page",
            priority: "high"
          },
          {
            cluster_name: "Local SEO Focus",
            keywords: [
              {
                keyword: "digital marketing san francisco",
                search_volume_range: "1K-3K", 
                intent: "commercial"
              },
              {
                keyword: "marketing agency near me",
                search_volume_range: "3K-5K",
                intent: "commercial"
              }
            ],
            content_type: "location_pages",
            priority: "high"
          }
        ],
        difficulty_analysis: {
          easy: 3,
          medium: 8,
          hard: 2
        }
      },
      market_insights: {
        seasonal_trends: [
          {
            month: "January",
            search_multiplier: 1.3,
            reason: "New year business planning",
            confidence: 85,
            source: "pytrends"
          },
          {
            month: "April", 
            search_multiplier: 1.5,
            reason: "Q2 marketing budget allocation",
            confidence: 92,
            source: "pytrends"
          }
        ],
        geographic_opportunities: [
          {
            location: "San Francisco",
            relative_interest: 100,
            opportunity: "medium",
            source: "pytrends"
          },
          {
            location: "Oakland",
            relative_interest: 34,
            opportunity: "high",
            source: "pytrends"
          }
        ],
        industry_trends: [
          {
            keyword: "ai digital marketing",
            trend_direction: "rising",
            interest_growth: "145%"
          }
        ],
        search_volume_analysis: {
          peak_season: "April",
          low_season: "December", 
          growth_potential: "145% in AI-related terms"
        }
      },
      actionable_insights: {
        immediate_actions: [
          {
            action: "Create localized landing pages for San Francisco marketing services",
            priority: "high", 
            timeline: "1-2 weeks",
            details: "Target geo-specific commercial intent keywords"
          },
          {
            action: "Develop AI marketing automation content series",
            priority: "high",
            timeline: "2-4 weeks", 
            details: "Capitalize on 145% trend growth in AI marketing terms"
          }
        ],
        short_term_strategy: [
          {
            action: "Create location-specific landing pages",
            timeline: "2-4 weeks",
            expected_impact: "30-50% increase in local search visibility",
            priority: "high"
          },
          {
            action: "Develop educational content for primary keywords", 
            timeline: "1-2 months",
            expected_impact: "Brand awareness + backlink opportunities",
            priority: "medium"
          }
        ],
        long_term_goals: [
          {
            goal: "Establish topical authority in digital marketing services",
            timeline: "6-12 months",
            strategy: "Content silo structure with pillar pages",
            success_metrics: "Top 3 rankings for primary keywords"
          }
        ],
        priority_keywords: [
          {
            keyword: "marketing agency near me",
            search_volume_range: "3K-5K",
            serp_difficulty: "low",
            relevance_score: 87
          },
          {
            keyword: "digital marketing san francisco", 
            search_volume_range: "1K-3K",
            serp_difficulty: "medium",
            relevance_score: 91
          }
        ]
      },
      summary: {
        top_focus_keywords: ["marketing agency near me", "digital marketing san francisco"],
        overall_intent_mix: "65% commercial, 25% informational, 10% navigational",
        keyword_difficulty_snapshot: "8 medium, 2 hard, 3 easy",
        local_opportunity: "High in San Francisco, CA"
      }
    }]
  };

  // Use fetched data if available, otherwise use sample or prop data
  const analysisData = fetchedData || data || sampleData;
  const mainData = analysisData.data?.[0] || analysisData;

  // Filter keywords based on search term
  const filterKeywords = (keywords) => {
    if (!searchTerm) return keywords;
    const term = searchTerm.toLowerCase();
    return keywords.filter(keyword => 
      keyword.keyword?.toLowerCase().includes(term) ||
      keyword.topic?.toLowerCase().includes(term)
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
      // Try to fetch data from n8n webhook first
      const webhookResponse = await WebhookService.callWebhook(
        '/webhook/keyword-analysis',
        {
          website_url: inputData.website_url,
          industry: inputData.industry,
          location: inputData.location
        }
      );
      
      if (webhookResponse) {
        // Use real webhook data
        setFetchedData(webhookResponse);
        setShowInputForm(false);
        // Save to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'Keyword Research Analysis', webhookResponse);
      } else {
        // Fall back to mock data if webhooks are disabled
        console.log('Using mock data - webhooks disabled or failed');
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        const mockResponse = {
          ...sampleData,
          data: [{
            ...sampleData.data[0],
            input_data: {
              ...sampleData.data[0].input_data,
              website_url: inputData.website_url,
              domain: inputData.website_url.replace(/^https?:\/\//, '').split('/')[0],
              industry: inputData.industry,
              location: {
                raw: inputData.location,
                formatted: inputData.location
              }
            }
          }]
        };
        
        setFetchedData(mockResponse);
        setShowInputForm(false);
        // Save mock data to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'Keyword Research Analysis', mockResponse);
      }
      
    } catch (error) {
      console.error('Error fetching keyword research data:', error);
      // On error, show mock data as fallback
      const mockResponse = {
        ...sampleData,
        data: [{
          ...sampleData.data[0],
          input_data: {
            ...sampleData.data[0].input_data,
            website_url: inputData.website_url,
            industry: inputData.industry
          },
          analysis_metadata: {
            ...sampleData.data[0].analysis_metadata,
            processing_status: "completed_with_errors"
          }
        }]
      };
      setFetchedData(mockResponse);
      setShowInputForm(false);
      // Save fallback data to localStorage
      WidgetDataManager.saveWidgetData(widgetId, 'Keyword Research Analysis', mockResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'high': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'rising': return 'text-green-400';
      case 'increasing': return 'text-blue-400';
      case 'stable': return 'text-gray-400';
      case 'declining': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Colors for charts
  const COLORS = {
    commercial: '#10B981',
    informational: '#3B82F6', 
    navigational: '#F59E0B',
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#EF4444',
    purple: '#8B5CF6'
  };

  // Show input form if no data
  if (showInputForm) {
    return (
      <div className="w-full h-full min-h-[600px] max-h-[90vh] p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Search" className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Keyword Research & Analysis</h2>
            <p className="text-gray-400">Discover high-impact keywords and analyze your competition</p>
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
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">
                Industry/Business Type <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={inputData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., digital marketing, restaurant, law firm"
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">
                Target Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={inputData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., San Francisco, CA, USA"
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                required
              />
              <p className="text-sm text-gray-400 mt-1">City, State, Country format works best</p>
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
                    <span>Researching Keywords...</span>
                  </div>
                ) : (
                  'Start Keyword Research'
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
            <h3 className="text-white font-medium mb-2">What This Analysis Includes:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
              <div>• Competitor keyword analysis</div>
              <div>• Search volume estimates</div>
              <div>• Trending keyword opportunities</div>
              <div>• Local SEO keywords</div>
              <div>• Content opportunities</div>
              <div>• Strategic recommendations</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main widget tabs
  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'BarChart3' },
    { id: 'keywords', name: 'Keywords', icon: 'Search' },
    { id: 'competitors', name: 'Competitors', icon: 'Users' },
    { id: 'opportunities', name: 'Opportunities', icon: 'TrendingUp' },
    { id: 'insights', name: 'AI Insights', icon: 'Brain' }
  ];

  return (
    <div className="w-full h-full min-h-[500px] max-h-[90vh] bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Icon name="Search" className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Keyword Research Analysis</h3>
              <p className="text-xs text-gray-400">
                {mainData.input_data?.domain || 'Domain Analysis'} • 
                {mainData.keyword_strategy?.primary_keywords?.length || 0} keywords found
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => AnalysisExporter.exportToCSV(analysisData, 'keyword-research-analysis')}
              className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-lg hover:bg-green-600/30 transition-colors"
              title="Export to CSV"
            >
              <Icon name="Download" className="w-3 h-3 inline mr-1" />
              CSV
            </button>
            <button
              onClick={() => {
                const summary = AnalysisExporter.generateSummary(analysisData, 'Keyword Research Analysis');
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
              className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-lg hover:bg-purple-600/30 transition-colors"
            >
              New Research
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
                <div className="text-2xl font-bold text-purple-400">{mainData.keyword_strategy?.primary_keywords?.length || 0}</div>
                <div className="text-xs text-gray-400">Primary Keywords</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{mainData.keyword_strategy?.local_keywords?.length || 0}</div>
                <div className="text-xs text-gray-400">Local Keywords</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{mainData.competitor_analysis?.total_competitors || 0}</div>
                <div className="text-xs text-gray-400">Competitors Found</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{mainData.website_analysis?.seo_score || 0}%</div>
                <div className="text-xs text-gray-400">SEO Score</div>
              </div>
            </div>

            {/* Intent Distribution */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Search Intent Distribution</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Commercial', value: mainData.ai_summary?.intent_distribution?.commercial || 65, fill: COLORS.commercial },
                        { name: 'Informational', value: mainData.ai_summary?.intent_distribution?.informational || 25, fill: COLORS.informational },
                        { name: 'Navigational', value: mainData.ai_summary?.intent_distribution?.navigational || 10, fill: COLORS.navigational }
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

            {/* Keyword Difficulty */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Keyword Difficulty Analysis</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{mainData.keyword_strategy?.difficulty_analysis?.easy || 0}</div>
                  <div className="text-xs text-gray-400">Easy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{mainData.keyword_strategy?.difficulty_analysis?.medium || 0}</div>
                  <div className="text-xs text-gray-400">Medium</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{mainData.keyword_strategy?.difficulty_analysis?.hard || 0}</div>
                  <div className="text-xs text-gray-400">Hard</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="sticky top-0 bg-gray-800/90 backdrop-blur-sm p-2 -mx-4 border-b border-gray-700/50">
              <div className="relative">
                <Icon name="Search" className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
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

            {/* Primary Keywords */}
            {(() => {
              const filteredPrimary = filterKeywords(mainData.keyword_strategy?.primary_keywords || []);
              return filteredPrimary.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center">
                    <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                    Primary Keywords ({filteredPrimary.length}{searchTerm ? ` of ${mainData.keyword_strategy?.primary_keywords?.length || 0}` : ''})
                  </h4>
                  <div className="space-y-3">
                    {filteredPrimary.map((keyword, index) => (
                      <div key={index} className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-purple-400">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="text-white font-medium">{keyword.keyword}</h5>
                            <p className="text-sm text-gray-400">Volume: {keyword.search_volume_range}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(keyword.serp_difficulty)}`}>
                              {keyword.serp_difficulty}
                            </span>
                            <Icon 
                              name={keyword.trend === 'rising' ? 'TrendingUp' : keyword.trend === 'stable' ? 'Minus' : 'TrendingDown'} 
                              className={`w-4 h-4 ${getTrendColor(keyword.trend)}`} 
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Intent: <span className="text-white">{keyword.intent}</span></span>
                          <span className="text-gray-400">Score: <span className="text-purple-400">{keyword.relevance_score}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Local Keywords */}
            {(() => {
              const filteredLocal = filterKeywords(mainData.keyword_strategy?.local_keywords || []);
              return filteredLocal.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                    Local Keywords ({filteredLocal.length}{searchTerm ? ` of ${mainData.keyword_strategy?.local_keywords?.length || 0}` : ''})
                  </h4>
                  <div className="space-y-3">
                    {filteredLocal.map((keyword, index) => (
                      <div key={index} className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-blue-400">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="text-white font-medium">{keyword.keyword}</h5>
                            <p className="text-sm text-gray-400">Volume: {keyword.search_volume_range}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(keyword.serp_difficulty)}`}>
                            {keyword.serp_difficulty}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Intent: <span className="text-white">{keyword.intent}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'competitors' && (
          <div className="space-y-4">
            {/* Competitor Overview */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Competitive Landscape</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{mainData.competitor_analysis?.total_competitors || 0}</div>
                  <div className="text-sm text-gray-400">Total Competitors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{mainData.competitor_analysis?.market_position || 'Unknown'}</div>
                  <div className="text-sm text-gray-400">Market Position</div>
                </div>
              </div>
            </div>

            {/* Top Competitors */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Top Competitors</h4>
              <div className="space-y-3">
                {mainData.competitor_analysis?.top_competitors?.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-600/30 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{competitor.domain}</div>
                      <div className="text-sm text-gray-400">{competitor.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-400">#{competitor.rank_position}</div>
                      <div className={`text-xs font-medium ${
                        competitor.competitive_strength === 'high' ? 'text-red-400' :
                        competitor.competitive_strength === 'medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {competitor.competitive_strength}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Gaps */}
            {mainData.competitor_analysis?.competitive_gaps?.length > 0 && (
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Competitive Gap Opportunities</h4>
                <div className="space-y-2">
                  {mainData.competitor_analysis.competitive_gaps.slice(0, 5).map((gap, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-600/10 border border-green-500/20 rounded-lg">
                      <span className="text-white text-sm">{gap.keyword}</span>
                      <span className="text-green-400 text-xs">{gap.found_via}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'opportunities' && (
          <div className="space-y-4">
            {/* Content Opportunities */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Content Opportunities</h4>
              <div className="space-y-3">
                {mainData.ai_summary?.content_opportunities?.map((opportunity, index) => (
                  <div key={index} className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="text-white font-medium">{opportunity.topic}</h5>
                        <p className="text-sm text-gray-400">Volume: {opportunity.search_volume}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-400">{opportunity.opportunity_score}</div>
                        <div className="text-xs text-gray-400">Score</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(opportunity.difficulty)}`}>
                        {opportunity.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Clusters */}
            {mainData.keyword_strategy?.content_clusters?.map((cluster, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">
                  {cluster.cluster_name}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    cluster.priority === 'high' ? 'bg-red-400/20 text-red-400' :
                    cluster.priority === 'medium' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-green-400/20 text-green-400'
                  }`}>
                    {cluster.priority}
                  </span>
                </h4>
                <p className="text-sm text-gray-400 mb-3">Content Type: {cluster.content_type}</p>
                <div className="space-y-2">
                  {cluster.keywords?.slice(0, 3).map((keyword, kidx) => (
                    <div key={kidx} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                      <span className="text-white text-sm">{keyword.keyword}</span>
                      <span className="text-gray-400 text-xs">{keyword.search_volume_range}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Icon name="Brain" className="w-4 h-4 mr-2 text-purple-400" />
                AI Strategic Analysis
              </h4>
              <div className="space-y-3 text-gray-300">
                <div>
                  <strong>Intent Analysis:</strong> {mainData.ai_summary?.intent}
                </div>
                <div>
                  <strong>Rationale:</strong> {mainData.ai_summary?.rationale}
                </div>
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">🎯 Strategic Recommendations</h4>
              <div className="space-y-3">
                {mainData.ai_summary?.strategic_recommendations?.map((rec, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="font-medium text-purple-400 mb-1">{rec.action}</div>
                    <div className="text-sm text-gray-300 mb-2">{rec.details}</div>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-gray-400">Timeline: <span className="text-white">{rec.timeline}</span></span>
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        rec.priority === 'high' ? 'bg-red-400/20 text-red-400' : 'bg-yellow-400/20 text-yellow-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Long-tail Keywords */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Long-tail Keyword Opportunities</h4>
              <div className="space-y-2">
                {mainData.ai_summary?.long_tail_keywords?.slice(0, 5).map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-600/10 border border-blue-500/20 rounded">
                    <span className="text-white text-sm">{keyword.keyword}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400 text-xs">{keyword.search_volume_range}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(keyword.difficulty)}`}>
                        {keyword.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h5 className="text-white font-medium mb-3">Seasonal Trends</h5>
                <div className="space-y-2">
                  {mainData.market_insights?.seasonal_trends?.slice(0, 3).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{trend.month}</span>
                      <span className="text-blue-400 text-sm">{trend.search_multiplier}x</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h5 className="text-white font-medium mb-3">Geographic Opportunities</h5>
                <div className="space-y-2">
                  {mainData.market_insights?.geographic_opportunities?.slice(0, 3).map((geo, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{geo.location}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        geo.opportunity === 'very_high' || geo.opportunity === 'high' ? 'bg-green-400/20 text-green-400' :
                        geo.opportunity === 'medium' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-red-400/20 text-red-400'
                      }`}>
                        {geo.opportunity}
                      </span>
                    </div>
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

export default KeywordResearchWidget;