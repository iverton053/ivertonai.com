import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Zap, 
  Users, 
  TrendingUp, 
  Settings, 
  Play, 
  Pause, 
  Eye, 
  Edit, 
  Copy, 
  Trash2,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Database,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RetargetingCampaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  createdDate: Date;
  lastModified: Date;
  triggerConditions: {
    leadScoreThreshold: number;
    inactivityDays: number;
    lifecycleStages: string[];
    excludeStages: string[];
    behaviorTriggers: string[];
  };
  platforms: {
    facebook: PlatformConfig;
    google: PlatformConfig;
    linkedin: PlatformConfig;
    email: PlatformConfig;
  };
  audienceSize: number;
  budget: {
    total: number;
    daily: number;
    allocation: {
      facebook: number;
      google: number;
      linkedin: number;
      email: number;
    };
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    ctr: number;
    conversionRate: number;
    roas: number;
    reactivatedLeads: number;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    timezone: string;
    dayParting: {
      enabled: boolean;
      hours: number[];
    };
  };
}

interface PlatformConfig {
  enabled: boolean;
  audienceId?: string;
  campaignType: string;
  creative: {
    headline: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
    ctaText: string;
    landingPageUrl: string;
  };
  targeting: {
    demographics: any;
    interests: string[];
    behaviors: string[];
    customAudiences: string[];
  };
  bidding: {
    strategy: 'cpc' | 'cpm' | 'cpa' | 'roas';
    amount: number;
    optimization: string;
  };
  performance: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  };
}

interface ColdLead {
  id: string;
  name: string;
  email: string;
  company: string;
  lastActivity: Date;
  leadScore: number;
  lifecycleStage: string;
  inactivityDays: number;
  originalSource: string;
  estimatedValue: number;
  retargetingStatus: 'eligible' | 'active' | 'reactivated' | 'excluded';
  platforms: string[];
  lastTouchpoint: string;
}

const CrossPlatformRetargeting: React.FC = () => {
  const [campaigns, setCampaigns] = useState<RetargetingCampaign[]>([]);
  const [coldLeads, setColdLeads] = useState<ColdLead[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<RetargetingCampaign | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'campaigns' | 'audiences' | 'analytics' | 'leads'>('overview');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setCampaigns([
      {
        id: '1',
        name: 'High-Value Lead Reactivation',
        description: 'Retarget enterprise leads who went cold after demo',
        status: 'active',
        createdDate: new Date('2024-01-10'),
        lastModified: new Date('2024-01-20'),
        triggerConditions: {
          leadScoreThreshold: 70,
          inactivityDays: 30,
          lifecycleStages: ['sales_qualified_lead', 'opportunity'],
          excludeStages: ['customer', 'unqualified'],
          behaviorTriggers: ['demo_completed', 'proposal_viewed', 'pricing_page_visited']
        },
        platforms: {
          facebook: {
            enabled: true,
            audienceId: 'fb_audience_123',
            campaignType: 'conversion',
            creative: {
              headline: 'Still thinking about {{solution}}?',
              description: 'See how {{similar_company}} achieved 40% cost savings',
              imageUrl: '/assets/retargeting-facebook.jpg',
              ctaText: 'Learn More',
              landingPageUrl: 'https://yoursite.com/retargeting-offer'
            },
            targeting: {
              demographics: { age: '25-54', income: 'top_25_percent' },
              interests: ['business_software', 'enterprise_solutions'],
              behaviors: ['technology_early_adopters'],
              customAudiences: ['website_visitors', 'email_subscribers']
            },
            bidding: {
              strategy: 'cpa',
              amount: 45,
              optimization: 'conversions'
            },
            performance: { impressions: 45230, clicks: 892, spend: 2341, conversions: 23 }
          },
          google: {
            enabled: true,
            audienceId: 'google_audience_456',
            campaignType: 'display',
            creative: {
              headline: 'Complete Your {{company}} Solution',
              description: 'Exclusive offer for qualified prospects',
              imageUrl: '/assets/retargeting-google.jpg',
              ctaText: 'Get Started',
              landingPageUrl: 'https://yoursite.com/exclusive-offer'
            },
            targeting: {
              demographics: { age: '30-65' },
              interests: ['b2b_software', 'business_solutions'],
              behaviors: ['in_market_for_software'],
              customAudiences: ['crm_prospects']
            },
            bidding: {
              strategy: 'cpc',
              amount: 2.50,
              optimization: 'clicks'
            },
            performance: { impressions: 67820, clicks: 1245, spend: 3112, conversions: 31 }
          },
          linkedin: {
            enabled: true,
            audienceId: 'li_audience_789',
            campaignType: 'sponsored_content',
            creative: {
              headline: '{{first_name}}, ready to transform {{company}}?',
              description: 'Join 500+ companies already seeing results',
              imageUrl: '/assets/retargeting-linkedin.jpg',
              ctaText: 'Schedule Demo',
              landingPageUrl: 'https://yoursite.com/demo-retargeting'
            },
            targeting: {
              demographics: { job_titles: ['CTO', 'VP Engineering', 'Director'] },
              interests: ['software_development', 'digital_transformation'],
              behaviors: ['recently_changed_jobs'],
              customAudiences: ['engaged_prospects']
            },
            bidding: {
              strategy: 'cpm',
              amount: 15.00,
              optimization: 'awareness'
            },
            performance: { impressions: 23456, clicks: 567, spend: 1890, conversions: 18 }
          },
          email: {
            enabled: true,
            campaignType: 'winback',
            creative: {
              headline: 'We miss you, {{first_name}}',
              description: 'Special offer just for {{company}}',
              ctaText: 'Claim Offer',
              landingPageUrl: 'https://yoursite.com/winback'
            },
            targeting: {
              demographics: {},
              interests: [],
              behaviors: [],
              customAudiences: []
            },
            bidding: {
              strategy: 'cpc',
              amount: 0,
              optimization: 'opens'
            },
            performance: { impressions: 1250, clicks: 234, spend: 0, conversions: 12 }
          }
        },
        audienceSize: 1247,
        budget: {
          total: 15000,
          daily: 250,
          allocation: {
            facebook: 35,
            google: 40,
            linkedin: 20,
            email: 5
          }
        },
        performance: {
          impressions: 137756,
          clicks: 2938,
          conversions: 84,
          spend: 7343,
          ctr: 2.13,
          conversionRate: 2.86,
          roas: 4.2,
          reactivatedLeads: 84
        },
        schedule: {
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-02-15'),
          timezone: 'EST',
          dayParting: {
            enabled: true,
            hours: [9, 10, 11, 12, 13, 14, 15, 16, 17]
          }
        }
      },
      {
        id: '2',
        name: 'Content Engagement Retargeting',
        description: 'Re-engage leads who downloaded content but didn\'t convert',
        status: 'active',
        createdDate: new Date('2024-01-12'),
        lastModified: new Date('2024-01-19'),
        triggerConditions: {
          leadScoreThreshold: 40,
          inactivityDays: 14,
          lifecycleStages: ['lead', 'marketing_qualified_lead'],
          excludeStages: ['customer'],
          behaviorTriggers: ['content_download', 'webinar_attended', 'email_clicked']
        },
        platforms: {
          facebook: {
            enabled: true,
            audienceId: 'fb_content_audience',
            campaignType: 'traffic',
            creative: {
              headline: 'Get more insights like this',
              description: 'Exclusive content for {{industry}} professionals',
              imageUrl: '/assets/content-retargeting.jpg',
              ctaText: 'Access Now',
              landingPageUrl: 'https://yoursite.com/premium-content'
            },
            targeting: {
              demographics: { age: '25-54' },
              interests: ['industry_insights', 'professional_development'],
              behaviors: ['engaged_with_content'],
              customAudiences: ['content_downloaders']
            },
            bidding: {
              strategy: 'cpc',
              amount: 1.80,
              optimization: 'link_clicks'
            },
            performance: { impressions: 32145, clicks: 645, spend: 1161, conversions: 15 }
          },
          google: {
            enabled: true,
            audienceId: 'google_content_audience',
            campaignType: 'search',
            creative: {
              headline: 'Advanced {{topic}} Strategies',
              description: 'Get the complete guide',
              ctaText: 'Download Guide',
              landingPageUrl: 'https://yoursite.com/advanced-guide'
            },
            targeting: {
              demographics: {},
              interests: [],
              behaviors: [],
              customAudiences: ['content_engagers']
            },
            bidding: {
              strategy: 'cpc',
              amount: 3.20,
              optimization: 'conversions'
            },
            performance: { impressions: 15678, clicks: 456, spend: 1459, conversions: 22 }
          },
          linkedin: {
            enabled: false,
            audienceId: '',
            campaignType: '',
            creative: {
              headline: '',
              description: '',
              ctaText: '',
              landingPageUrl: ''
            },
            targeting: {
              demographics: {},
              interests: [],
              behaviors: [],
              customAudiences: []
            },
            bidding: {
              strategy: 'cpc',
              amount: 0,
              optimization: ''
            },
            performance: { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
          },
          email: {
            enabled: true,
            campaignType: 'nurture',
            creative: {
              headline: 'More resources for {{first_name}}',
              description: 'Based on your interest in {{topic}}',
              ctaText: 'Explore More',
              landingPageUrl: 'https://yoursite.com/resource-hub'
            },
            targeting: {
              demographics: {},
              interests: [],
              behaviors: [],
              customAudiences: []
            },
            bidding: {
              strategy: 'cpc',
              amount: 0,
              optimization: 'engagement'
            },
            performance: { impressions: 892, clicks: 167, spend: 0, conversions: 8 }
          }
        },
        audienceSize: 578,
        budget: {
          total: 8000,
          daily: 150,
          allocation: {
            facebook: 45,
            google: 50,
            linkedin: 0,
            email: 5
          }
        },
        performance: {
          impressions: 48715,
          clicks: 1268,
          conversions: 45,
          spend: 2620,
          ctr: 2.60,
          conversionRate: 3.55,
          roas: 3.8,
          reactivatedLeads: 45
        },
        schedule: {
          startDate: new Date('2024-01-20'),
          timezone: 'EST',
          dayParting: {
            enabled: false,
            hours: []
          }
        }
      }
    ]);

    setColdLeads([
      {
        id: '1',
        name: 'John Smith',
        email: 'john@techcorp.com',
        company: 'TechCorp Inc.',
        lastActivity: new Date('2023-12-15'),
        leadScore: 78,
        lifecycleStage: 'sales_qualified_lead',
        inactivityDays: 37,
        originalSource: 'demo_request',
        estimatedValue: 45000,
        retargetingStatus: 'active',
        platforms: ['facebook', 'linkedin', 'email'],
        lastTouchpoint: 'demo_completed'
      },
      {
        id: '2',
        name: 'Maria Garcia',
        email: 'maria@healthplus.com',
        company: 'HealthPlus Clinic',
        lastActivity: new Date('2024-01-05'),
        leadScore: 65,
        lifecycleStage: 'marketing_qualified_lead',
        inactivityDays: 16,
        originalSource: 'content_download',
        estimatedValue: 25000,
        retargetingStatus: 'eligible',
        platforms: ['facebook', 'google'],
        lastTouchpoint: 'pricing_page_visited'
      },
      {
        id: '3',
        name: 'David Chen',
        email: 'david@innovate.io',
        company: 'Innovate Labs',
        lastActivity: new Date('2023-11-28'),
        leadScore: 82,
        lifecycleStage: 'opportunity',
        inactivityDays: 54,
        originalSource: 'referral',
        estimatedValue: 85000,
        retargetingStatus: 'reactivated',
        platforms: ['linkedin', 'email'],
        lastTouchpoint: 'proposal_viewed'
      }
    ]);
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStats = {
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalAudience: campaigns.reduce((sum, c) => sum + c.audienceSize, 0),
    totalSpend: campaigns.reduce((sum, c) => sum + c.performance.spend, 0),
    totalReactivated: campaigns.reduce((sum, c) => sum + c.performance.reactivatedLeads, 0),
    avgROAS: campaigns.reduce((sum, c) => sum + c.performance.roas, 0) / campaigns.length,
    coldLeadsEligible: coldLeads.filter(l => l.retargetingStatus === 'eligible').length
  };

  const CampaignCard: React.FC<{ campaign: RetargetingCampaign }> = ({ campaign }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              campaign.status === 'active' ? 'bg-green-100 text-green-800' :
              campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {campaign.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{campaign.audienceSize.toLocaleString()} audience</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>${campaign.budget.daily}/day</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{campaign.performance.roas.toFixed(1)}x ROAS</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCampaign(campaign)}
            className="text-blue-600 hover:text-blue-700 p-1 rounded"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-300 p-1 rounded">
            <Edit className="w-4 h-4" />
          </button>
          <button className={`p-1 rounded ${
            campaign.status === 'active' 
              ? 'text-yellow-600 hover:text-yellow-700' 
              : 'text-green-600 hover:text-green-700'
          }`}>
            {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400">Impressions</div>
          <div className="text-lg font-semibold text-blue-600">{campaign.performance.impressions.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Clicks</div>
          <div className="text-lg font-semibold text-green-600">{campaign.performance.clicks.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Conversions</div>
          <div className="text-lg font-semibold text-purple-600">{campaign.performance.conversions}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Spend</div>
          <div className="text-lg font-semibold text-white">${campaign.performance.spend.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          {campaign.platforms.facebook.enabled && (
            <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">f</div>
          )}
          {campaign.platforms.google.enabled && (
            <div className="w-6 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center">G</div>
          )}
          {campaign.platforms.linkedin.enabled && (
            <div className="w-6 h-6 bg-blue-700 rounded text-white text-xs flex items-center justify-center">in</div>
          )}
          {campaign.platforms.email.enabled && (
            <div className="w-6 h-6 bg-gray-600 rounded text-white text-xs flex items-center justify-center">@</div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {campaign.performance.reactivatedLeads} reactivated
          </span>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );

  const PlatformPerformance: React.FC<{ campaign: RetargetingCampaign }> = ({ campaign }) => (
    <div className="space-y-4">
      {Object.entries(campaign.platforms).map(([platform, config]) => {
        if (!config.enabled) return null;
        
        const platformNames = {
          facebook: 'Facebook',
          google: 'Google Ads',
          linkedin: 'LinkedIn',
          email: 'Email'
        };

        const platformColors = {
          facebook: 'bg-blue-600',
          google: 'bg-red-500',
          linkedin: 'bg-blue-700',
          email: 'bg-gray-600'
        };

        return (
          <div key={platform} className="glass-effect rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${platformColors[platform as keyof typeof platformColors]} rounded text-white text-sm flex items-center justify-center font-bold`}>
                  {platform === 'facebook' ? 'f' : 
                   platform === 'google' ? 'G' : 
                   platform === 'linkedin' ? 'in' : '@'}
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{platformNames[platform as keyof typeof platformNames]}</h4>
                  <p className="text-sm text-gray-600">{config.campaignType}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Budget Allocation</div>
                <div className="text-lg font-semibold">{campaign.budget.allocation[platform as keyof typeof campaign.budget.allocation]}%</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400">Impressions</div>
                <div className="text-lg font-semibold">{config.performance.impressions.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Clicks</div>
                <div className="text-lg font-semibold">{config.performance.clicks.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Spend</div>
                <div className="text-lg font-semibold">${config.performance.spend.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Conversions</div>
                <div className="text-lg font-semibold">{config.performance.conversions}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded p-4">
              <h5 className="font-medium mb-2">Creative</h5>
              <div className="text-sm text-gray-600">
                <div><strong>Headline:</strong> {config.creative.headline}</div>
                <div><strong>Description:</strong> {config.creative.description}</div>
                <div><strong>CTA:</strong> {config.creative.ctaText}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Cross-Platform Retargeting</h2>
          <p className="text-gray-600">Re-engage cold leads across Facebook, Google, LinkedIn, and Email</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-blue-600">{totalStats.activeCampaigns}</p>
            </div>
            <Play className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Audience</p>
              <p className="text-2xl font-bold text-purple-600">{totalStats.totalAudience.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spend</p>
              <p className="text-2xl font-bold text-red-600">${totalStats.totalSpend.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reactivated</p>
              <p className="text-2xl font-bold text-green-600">{totalStats.totalReactivated}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg ROAS</p>
              <p className="text-2xl font-bold text-orange-600">{totalStats.avgROAS.toFixed(1)}x</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cold Leads</p>
              <p className="text-2xl font-bold text-gray-600">{totalStats.coldLeadsEligible}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'campaigns', label: 'Campaigns', icon: Target },
            { key: 'audiences', label: 'Audiences', icon: Users },
            { key: 'analytics', label: 'Analytics', icon: TrendingUp },
            { key: 'leads', label: 'Cold Leads', icon: AlertCircle }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                activeView === key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-white hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </motion.div>
        )}

        {activeView === 'campaigns' && selectedCampaign && (
          <motion.div
            key="campaigns"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedCampaign.name}</h3>
                <p className="text-gray-600">{selectedCampaign.description}</p>
              </div>
              <div className="flex gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Edit Campaign
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Duplicate
                </button>
              </div>
            </div>
            
            <PlatformPerformance campaign={selectedCampaign} />
          </motion.div>
        )}

        {activeView === 'audiences' && (
          <motion.div
            key="audiences"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="glass-effect rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Audience Breakdown</h3>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-gray-400">{campaign.audienceSize.toLocaleString()} leads</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {Object.entries(campaign.platforms).map(([platform, config]) => 
                        config.enabled && (
                          <div key={platform} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {platform}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-effect rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Sync Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span>Facebook Custom Audiences</span>
                  </div>
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Synced
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Google Remarketing Lists</span>
                  </div>
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Synced
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-700 rounded-full"></div>
                    <span>LinkedIn Matched Audiences</span>
                  </div>
                  <span className="text-yellow-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Pending
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    <span>Email Segments</span>
                  </div>
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Synced
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeView === 'leads' && (
          <motion.div
            key="leads"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-effect rounded-lg shadow-sm border overflow-hidden"
          >
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Cold Leads for Retargeting</h3>
              <p className="text-gray-600">Leads eligible for cross-platform retargeting campaigns</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Platforms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="glass-effect divide-y divide-gray-200">
                  {coldLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{lead.name}</div>
                          <div className="text-sm text-gray-400">{lead.email}</div>
                          <div className="text-sm text-gray-400">{lead.company}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <div>{lead.lastActivity.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{lead.inactivityDays} days ago</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lead.leadScore >= 80 ? 'bg-green-100 text-green-800' :
                          lead.leadScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {lead.leadScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {lead.lifecycleStage.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {lead.platforms.map((platform) => (
                            <span key={platform} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                              {platform}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lead.retargetingStatus === 'active' ? 'bg-blue-100 text-blue-800' :
                          lead.retargetingStatus === 'eligible' ? 'bg-green-100 text-green-800' :
                          lead.retargetingStatus === 'reactivated' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.retargetingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Add to Campaign
                        </button>
                        <button className="text-gray-600 hover:text-white">
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrossPlatformRetargeting;