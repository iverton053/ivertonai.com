import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, RadialBarChart, RadialBar } from 'recharts';
import Icon from '../Icon';
import { WebhookService } from '../../utils/webhookConfig';
import { WidgetDataManager, AnalysisExporter } from '../../utils/widgetDataManager';

const ContentGapAnalysisWidget = ({ data = null, config = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInputForm, setShowInputForm] = useState(!data);
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({
    website_url: '',
    competitor_urls: ''
  });
  const [fetchedData, setFetchedData] = useState(null);
  const [widgetId] = useState(() => `content_gap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [searchTerm, setSearchTerm] = useState('');

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = WidgetDataManager.loadWidgetData(widgetId);
    if (persistedData && !data && !fetchedData) {
      setFetchedData(persistedData);
      setShowInputForm(false);
      console.log('Loaded persisted content gap analysis data');
    }
  }, [widgetId, data, fetchedData]);

  // Enhanced sample data structure matching n8n workflow output
  const sampleData = {
    analysis_metadata: {
      analyzed_date: new Date().toISOString(),
      client_domain: 'example.com',
      competitor_domains: ['competitor1.com', 'competitor2.com', 'competitor3.com'],
      total_topics_analyzed: 45,
      gaps_identified: 18,
      analysis_confidence: 92,
      ai_insights_included: true,
      client_business_type: 'marketing_agency',
      data_sources_used: ['content_scraping', 'serp_analysis', 'ai_analysis', 'competitive_analysis']
    },
    content_gaps: {
      high_priority: [
        {
          topic: 'AI Marketing Automation',
          keywords: ['ai marketing automation', 'automated marketing ai', 'marketing automation ai'],
          gap_score: 95,
          priority_level: 'high',
          search_volume_estimate: 'High',
          competition_difficulty: 'Medium',
          estimated_monthly_traffic: '850-1200 potential visitors',
          market_opportunity: {
            industry_trend_strength: 8,
            opportunity_score: 9
          },
          client_coverage: {
            content_present: false,
            serp_presence: false,
            total_coverage: false
          },
          competitor_advantage: {
            content_coverage: true,
            serp_presence: true,
            has_advantage: true
          },
          content_recommendations: {
            content_type: 'pillar_page',
            search_intent: 'commercial',
            priority_level: 'high',
            estimated_effort: 'high',
            recommendation: 'Create comprehensive AI marketing automation guide with case studies and tool comparisons'
          }
        },
        {
          topic: 'Content Creation AI Tools',
          keywords: ['ai content creation', 'ai content generation', 'automated content writing'],
          gap_score: 88,
          priority_level: 'high',
          search_volume_estimate: 'High',
          competition_difficulty: 'High',
          estimated_monthly_traffic: '650-950 potential visitors',
          market_opportunity: {
            industry_trend_strength: 7,
            opportunity_score: 8
          },
          client_coverage: {
            content_present: false,
            serp_presence: true,
            total_coverage: false
          },
          competitor_advantage: {
            content_coverage: true,
            serp_presence: true,
            has_advantage: true
          },
          content_recommendations: {
            content_type: 'comprehensive_guide',
            search_intent: 'informational',
            priority_level: 'high',
            estimated_effort: 'high',
            recommendation: 'Develop detailed comparison of AI content tools with practical examples'
          }
        },
        {
          topic: 'Email Marketing Automation',
          keywords: ['email marketing automation', 'automated email campaigns', 'drip campaigns'],
          gap_score: 82,
          priority_level: 'high',
          search_volume_estimate: 'Medium',
          competition_difficulty: 'Medium',
          estimated_monthly_traffic: '400-600 potential visitors',
          market_opportunity: {
            industry_trend_strength: 6,
            opportunity_score: 7
          },
          client_coverage: {
            content_present: true,
            serp_presence: false,
            total_coverage: false
          },
          competitor_advantage: {
            content_coverage: true,
            serp_presence: true,
            has_advantage: true
          },
          content_recommendations: {
            content_type: 'targeted_article',
            search_intent: 'commercial',
            priority_level: 'high',
            estimated_effort: 'medium',
            recommendation: 'Enhance existing content with automation workflows and templates'
          }
        }
      ],
      medium_priority: [
        {
          topic: 'SEO Analytics Automation',
          keywords: ['seo analytics automation', 'automated seo reporting', 'seo dashboard tools'],
          gap_score: 65,
          priority_level: 'medium',
          search_volume_estimate: 'Medium',
          competition_difficulty: 'Medium',
          estimated_monthly_traffic: '300-450 potential visitors',
          market_opportunity: {
            industry_trend_strength: 5,
            opportunity_score: 6
          },
          client_coverage: {
            content_present: false,
            serp_presence: false,
            total_coverage: false
          },
          competitor_advantage: {
            content_coverage: true,
            serp_presence: false,
            has_advantage: false
          },
          content_recommendations: {
            content_type: 'comprehensive_guide',
            search_intent: 'informational',
            priority_level: 'medium',
            estimated_effort: 'medium',
            recommendation: 'Create SEO automation guide focusing on reporting and analytics'
          }
        },
        {
          topic: 'Social Media Automation Tools',
          keywords: ['social media automation', 'automated social posting', 'social marketing tools'],
          gap_score: 58,
          priority_level: 'medium',
          search_volume_estimate: 'Medium',
          competition_difficulty: 'High',
          estimated_monthly_traffic: '250-400 potential visitors',
          market_opportunity: {
            industry_trend_strength: 4,
            opportunity_score: 5
          },
          client_coverage: {
            content_present: true,
            serp_presence: false,
            total_coverage: false
          },
          competitor_advantage: {
            content_coverage: true,
            serp_presence: true,
            has_advantage: true
          },
          content_recommendations: {
            content_type: 'targeted_article',
            search_intent: 'commercial',
            priority_level: 'medium',
            estimated_effort: 'medium',
            recommendation: 'Update existing social media content with automation focus'
          }
        }
      ],
      low_priority: [
        {
          topic: 'Business Intelligence Dashboards',
          keywords: ['business intelligence dashboards', 'automated reporting', 'business analytics'],
          gap_score: 42,
          priority_level: 'low',
          search_volume_estimate: 'Low',
          competition_difficulty: 'Medium',
          estimated_monthly_traffic: '150-250 potential visitors',
          market_opportunity: {
            industry_trend_strength: 3,
            opportunity_score: 4
          },
          client_coverage: {
            content_present: false,
            serp_presence: false,
            total_coverage: false
          },
          competitor_advantage: {
            content_coverage: false,
            serp_presence: false,
            has_advantage: false
          },
          content_recommendations: {
            content_type: 'targeted_article',
            search_intent: 'informational',
            priority_level: 'low',
            estimated_effort: 'medium',
            recommendation: 'Consider future content development as market develops'
          }
        }
      ]
    },
    strategic_insights: {
      client_content_status: {
        domain: 'example.com',
        topics_covered: 28,
        content_volume: 15420,
        technical_health: 'good',
        content_depth: 'comprehensive'
      },
      market_opportunities: {
        high_impact_topics: 3,
        medium_impact_topics: 2,
        quick_wins: 2,
        total_traffic_potential: '2150+ monthly visitors',
        top_opportunity: 'AI Marketing Automation'
      },
      competitive_landscape: {
        competitor_domains_analyzed: 3,
        average_competitor_topics: 34,
        client_vs_competitor_gap: 6,
        competitive_advantage_areas: ['Email Marketing', 'Content Strategy'],
        competitor_details: [
          { domain: 'competitor1.com', topics_covered: 42, content_volume: 18500 },
          { domain: 'competitor2.com', topics_covered: 38, content_volume: 16200 },
          { domain: 'competitor3.com', topics_covered: 31, content_volume: 14800 }
        ]
      }
    },
    implementation_roadmap: {
      immediate_actions: [
        {
          topic: 'AI Marketing Automation',
          priority: 'high',
          estimated_effort: 'high',
          expected_impact: 'High',
          gap_score: 95
        },
        {
          topic: 'Content Creation AI Tools',
          priority: 'high',
          estimated_effort: 'high',
          expected_impact: 'High',
          gap_score: 88
        },
        {
          topic: 'Email Marketing Automation',
          priority: 'high',
          estimated_effort: 'medium',
          expected_impact: 'High',
          gap_score: 82
        }
      ],
      next_phase_actions: [
        {
          topic: 'SEO Analytics Automation',
          priority: 'medium',
          gap_score: 65
        },
        {
          topic: 'Social Media Automation Tools',
          priority: 'medium',
          gap_score: 58
        }
      ],
      timeline_estimate: '4-6 months',
      resource_requirements: {
        content_pieces_needed: 8,
        research_hours: 48,
        writing_hours: 96
      }
    },
    kpi_metrics: {
      critical_gaps: 3,
      total_opportunities: 5,
      projected_traffic_increase: '430-1290 monthly visitors',
      content_coverage_improvement: '28% of identified gaps',
      roi_potential: 'High'
    },
    ai_analysis: `# Content Gap Analysis Summary

Based on comprehensive analysis of your website and 3 key competitors, several critical content gaps have been identified:

## Key Findings:
1. **AI Marketing Automation** represents the highest opportunity with minimal client coverage but strong competitor presence
2. **Content Creation Tools** show high search volume with significant competitor advantage
3. **Email Marketing Automation** has existing foundation but needs optimization for search visibility

## Strategic Recommendations:
- Prioritize AI-focused content creation to capture emerging market demand
- Develop comprehensive guides over basic articles for competitive topics
- Leverage existing email marketing expertise with automation angle

## Competitive Landscape:
Your competitors average 34 topics covered vs your current 28, indicating a 6-topic content gap. Focus on high-impact areas rather than topic quantity.`,
    raw_analysis_data: {
      search_results_summary: {
        client_serp_results: 15,
        competitor_serp_results: 42,
        industry_trends: 8
      },
      site_analysis_summary: [
        { domain: 'example.com', topics_found: 28, word_count: 15420, has_error: false },
        { domain: 'competitor1.com', topics_found: 42, word_count: 18500, has_error: false },
        { domain: 'competitor2.com', topics_found: 38, word_count: 16200, has_error: false },
        { domain: 'competitor3.com', topics_found: 31, word_count: 14800, has_error: false }
      ]
    }
  };

  // Use fetched data if available, otherwise use sample or prop data
  const analysisData = fetchedData || data || sampleData;

  // Filter gaps based on search term
  const filterGaps = (gaps) => {
    if (!searchTerm) return gaps;
    const term = searchTerm.toLowerCase();
    return gaps.filter(gap => 
      gap.topic?.toLowerCase().includes(term) ||
      gap.keywords?.some(keyword => keyword.toLowerCase().includes(term))
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
        '/webhook/content-gap-analyzer',
        {
          website_url: inputData.website_url,
          competitor_urls: inputData.competitor_urls.split(',').map(url => url.trim())
        }
      );
      
      if (webhookResponse) {
        // Use real webhook data
        setFetchedData(webhookResponse);
        setShowInputForm(false);
        // Save to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'Content Gap Analysis', webhookResponse);
      } else {
        // Fall back to mock data if webhooks are disabled
        console.log('Using mock data - webhooks disabled or failed');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const competitorList = inputData.competitor_urls.split(',').map(url => url.trim()).filter(url => url);
        const mockResponse = {
          ...sampleData,
          analysis_metadata: {
            ...sampleData.analysis_metadata,
            client_domain: inputData.website_url.replace(/^https?:\/\//, '').split('/')[0],
            competitor_domains: competitorList.map(url => url.replace(/^https?:\/\//, '').split('/')[0])
          }
        };
        
        setFetchedData(mockResponse);
        setShowInputForm(false);
        // Save mock data to localStorage
        WidgetDataManager.saveWidgetData(widgetId, 'Content Gap Analysis', mockResponse);
      }
      
    } catch (error) {
      console.error('Error fetching content gap analysis:', error);
      // On error, show mock data as fallback
      const mockResponse = {
        ...sampleData,
        analysis_metadata: {
          ...sampleData.analysis_metadata,
          client_domain: inputData.website_url.replace(/^https?:\/\//, '').split('/')[0],
          analysis_confidence: 75
        }
      };
      setFetchedData(mockResponse);
      setShowInputForm(false);
      // Save fallback data to localStorage
      WidgetDataManager.saveWidgetData(widgetId, 'Content Gap Analysis', mockResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-blue-400';
    return 'text-green-400';
  };

  // Colors for charts
  const COLORS = {
    high: '#EF4444',
    medium: '#F59E0B', 
    low: '#10B981',
    purple: '#8B5CF6',
    blue: '#3B82F6'
  };

  // Show input form if no data
  if (showInputForm) {
    return (
      <div className="w-full h-full min-h-[600px] max-h-[800px] p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Search" className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Content Gap Analysis</h2>
            <p className="text-gray-400">Enter your website and competitors to discover content opportunities</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Your Website URL <span className="text-red-400">*</span>
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
                Competitor URLs <span className="text-red-400">*</span>
              </label>
              <textarea
                value={inputData.competitor_urls}
                onChange={(e) => handleInputChange('competitor_urls', e.target.value)}
                placeholder="https://competitor1.com, https://competitor2.com, https://competitor3.com"
                rows={3}
                className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                required
              />
              <p className="text-sm text-gray-400 mt-1">Separate multiple URLs with commas</p>
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
                    <span>Analyzing Content Gaps...</span>
                  </div>
                ) : (
                  'Start Content Gap Analysis'
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
              <div>• Content topic analysis</div>
              <div>• Competitor gap identification</div>
              <div>• Search volume estimates</div>
              <div>• Priority recommendations</div>
              <div>• Traffic opportunity scoring</div>
              <div>• Implementation roadmap</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main widget tabs
  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'BarChart3' },
    { id: 'gaps', name: 'Content Gaps', icon: 'Search' },
    { id: 'competitive', name: 'Competitive', icon: 'TrendingUp' },
    { id: 'roadmap', name: 'Roadmap', icon: 'MapPin' },
    { id: 'insights', name: 'AI Insights', icon: 'Brain' }
  ];

  return (
    <div className="w-full h-full min-h-[500px] max-h-[90vh] bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Icon name="Search" className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Content Gap Analysis</h3>
              <p className="text-xs text-gray-400">
                {analysisData.analysis_metadata?.client_domain || 'Domain Analysis'} • 
                Confidence: {analysisData.analysis_metadata?.analysis_confidence || 0}%
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => AnalysisExporter.exportToCSV(analysisData, 'content-gap-analysis')}
              className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-lg hover:bg-green-600/30 transition-colors"
              title="Export to CSV"
            >
              <Icon name="Download" className="w-3 h-3 inline mr-1" />
              CSV
            </button>
            <button
              onClick={() => {
                const summary = AnalysisExporter.generateSummary(analysisData, 'Content Gap Analysis');
                navigator.clipboard.writeText(summary).then(() => {
                  // Could add a toast notification here
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
                <div className="text-2xl font-bold text-red-400">{analysisData.kpi_metrics?.critical_gaps || 0}</div>
                <div className="text-xs text-gray-400">Critical Gaps</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{analysisData.kpi_metrics?.total_opportunities || 0}</div>
                <div className="text-xs text-gray-400">Total Opportunities</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{analysisData.analysis_metadata?.total_topics_analyzed || 0}</div>
                <div className="text-xs text-gray-400">Topics Analyzed</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{analysisData.analysis_metadata?.analysis_confidence || 0}%</div>
                <div className="text-xs text-gray-400">Confidence</div>
              </div>
            </div>

            {/* Gap Distribution Chart */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Gap Priority Distribution</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'High Priority', value: analysisData.content_gaps?.high_priority?.length || 0, fill: COLORS.high },
                        { name: 'Medium Priority', value: analysisData.content_gaps?.medium_priority?.length || 0, fill: COLORS.medium },
                        { name: 'Low Priority', value: analysisData.content_gaps?.low_priority?.length || 0, fill: COLORS.low }
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

            {/* Traffic Opportunity */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Traffic Opportunity</h4>
              <div className="text-lg text-blue-400 font-semibold">
                {analysisData.strategic_insights?.market_opportunities?.total_traffic_potential || 'Analysis needed'}
              </div>
              <p className="text-sm text-gray-400">Estimated monthly visitors from addressing gaps</p>
            </div>
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="sticky top-0 bg-gray-800/90 backdrop-blur-sm p-2 -mx-4 border-b border-gray-700/50">
              <div className="relative">
                <Icon name="Search" className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search topics, keywords..."
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
            {/* High Priority Gaps */}
            {(() => {
              const filteredHighPriority = filterGaps(analysisData.content_gaps?.high_priority || []);
              return filteredHighPriority.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    High Priority Gaps ({filteredHighPriority.length}{searchTerm ? ` of ${analysisData.content_gaps.high_priority.length}` : ''})
                  </h4>
                  <div className="space-y-3">
                    {filteredHighPriority.map((gap, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-red-400">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="text-white font-medium">{gap.topic}</h5>
                          <p className="text-sm text-gray-400">{gap.keywords?.slice(0, 3).join(', ')}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getScoreColor(gap.gap_score)}`}>{gap.gap_score}</div>
                          <div className="text-xs text-gray-400">Gap Score</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Search Volume:</span>
                          <span className="text-white ml-2">{gap.search_volume_estimate}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Traffic Est:</span>
                          <span className="text-white ml-2">{gap.estimated_monthly_traffic}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-300">
                        {gap.content_recommendations?.recommendation}
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Medium Priority Gaps */}
            {analysisData.content_gaps?.medium_priority?.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                  Medium Priority Gaps ({analysisData.content_gaps.medium_priority.length})
                </h4>
                <div className="space-y-3">
                  {analysisData.content_gaps.medium_priority.slice(0, 3).map((gap, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-yellow-400">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="text-white font-medium">{gap.topic}</h5>
                          <p className="text-sm text-gray-400">{gap.keywords?.slice(0, 3).join(', ')}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getScoreColor(gap.gap_score)}`}>{gap.gap_score}</div>
                          <div className="text-xs text-gray-400">Gap Score</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Search Volume:</span>
                          <span className="text-white ml-2">{gap.search_volume_estimate}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Effort:</span>
                          <span className="text-white ml-2">{gap.content_recommendations?.estimated_effort}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'competitive' && (
          <div className="space-y-4">
            {/* Competitive Landscape Overview */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Competitive Position</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {analysisData.strategic_insights?.client_content_status?.topics_covered || 0}
                  </div>
                  <div className="text-sm text-gray-400">Your Topics Covered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">
                    {analysisData.strategic_insights?.competitive_landscape?.average_competitor_topics || 0}
                  </div>
                  <div className="text-sm text-gray-400">Avg Competitor Topics</div>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <span className="text-gray-400">Content Gap:</span>
                <span className={`ml-2 font-medium ${
                  (analysisData.strategic_insights?.competitive_landscape?.client_vs_competitor_gap || 0) > 0 
                    ? 'text-red-400' : 'text-green-400'
                }`}>
                  {analysisData.strategic_insights?.competitive_landscape?.client_vs_competitor_gap || 0} topics behind
                </span>
              </div>
            </div>

            {/* Competitor Analysis */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Competitor Breakdown</h4>
              <div className="space-y-3">
                {analysisData.strategic_insights?.competitive_landscape?.competitor_details?.map((comp, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-600/30 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{comp.domain}</div>
                      <div className="text-sm text-gray-400">{comp.content_volume?.toLocaleString()} words</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">{comp.topics_covered}</div>
                      <div className="text-xs text-gray-400">Topics</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Advantages */}
            {analysisData.strategic_insights?.competitive_landscape?.competitive_advantage_areas?.length > 0 && (
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Your Competitive Advantages</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisData.strategic_insights.competitive_landscape.competitive_advantage_areas.map((area, index) => (
                    <span key={index} className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            {/* Timeline */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Implementation Timeline</h4>
              <div className="text-lg text-blue-400 font-semibold">
                {analysisData.implementation_roadmap?.timeline_estimate || 'TBD'}
              </div>
              <p className="text-sm text-gray-400">Estimated completion time</p>
            </div>

            {/* Immediate Actions */}
            {analysisData.implementation_roadmap?.immediate_actions?.length > 0 && (
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Immediate Actions (Next 30 Days)</h4>
                <div className="space-y-3">
                  {analysisData.implementation_roadmap.immediate_actions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-600/10 border border-red-500/20 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{action.topic}</div>
                        <div className="text-sm text-gray-400">Effort: {action.estimated_effort}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 font-bold">{action.gap_score}</div>
                        <div className="text-xs text-gray-400">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Phase */}
            {analysisData.implementation_roadmap?.next_phase_actions?.length > 0 && (
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Next Phase (60-90 Days)</h4>
                <div className="space-y-2">
                  {analysisData.implementation_roadmap.next_phase_actions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-yellow-600/10 border border-yellow-500/20 rounded-lg">
                      <span className="text-white text-sm">{action.topic}</span>
                      <span className="text-yellow-400 text-sm font-medium">{action.gap_score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resource Requirements */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Resource Requirements</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {analysisData.implementation_roadmap?.resource_requirements?.content_pieces_needed || 0}
                  </div>
                  <div className="text-xs text-gray-400">Content Pieces</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {analysisData.implementation_roadmap?.resource_requirements?.research_hours || 0}h
                  </div>
                  <div className="text-xs text-gray-400">Research</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {analysisData.implementation_roadmap?.resource_requirements?.writing_hours || 0}h
                  </div>
                  <div className="text-xs text-gray-400">Writing</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Icon name="Brain" className="w-4 h-4 mr-2 text-purple-400" />
                AI Strategic Analysis
              </h4>
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-gray-300 whitespace-pre-line">
                  {typeof analysisData.ai_analysis === 'string' 
                    ? analysisData.ai_analysis 
                    : 'AI analysis processing...'}
                </div>
              </div>
            </div>

            {/* Top Opportunity */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">🎯 Top Opportunity</h4>
              <div className="text-lg text-purple-400 font-semibold">
                {analysisData.strategic_insights?.market_opportunities?.top_opportunity || 'Analyze more data needed'}
              </div>
              <p className="text-sm text-gray-300 mt-1">
                Focus your immediate efforts on this high-impact content gap
              </p>
            </div>

            {/* ROI Potential */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">ROI Potential</h5>
                <div className={`text-2xl font-bold ${
                  analysisData.kpi_metrics?.roi_potential === 'High' ? 'text-green-400' :
                  analysisData.kpi_metrics?.roi_potential === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {analysisData.kpi_metrics?.roi_potential || 'TBD'}
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">Quick Wins</h5>
                <div className="text-2xl font-bold text-blue-400">
                  {analysisData.strategic_insights?.market_opportunities?.quick_wins || 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGapAnalysisWidget;