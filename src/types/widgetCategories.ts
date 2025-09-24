export interface WidgetCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  widgets: string[];
  priority: number;
}

export interface CategorizedWidget {
  type: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: string;
  requiredIntegrations?: string[];
}

export const widgetCategories: WidgetCategory[] = [
  {
    id: 'business-intelligence',
    title: 'Business Intelligence',
    description: 'Market analysis, competitor monitoring, and business insights',
    icon: 'BarChart3',
    color: 'bg-blue-600',
    priority: 1,
    widgets: [
      'Competitor Monitoring',
      'Performance Analytics',
      'Industry Intelligence Dashboard',
      'Tech Stack Analyzer'
    ]
  },
  {
    id: 'seo-content',
    title: 'SEO & Content Strategy',
    description: 'Search optimization, content analysis, and ranking tracking',
    icon: 'Search',
    color: 'bg-green-600',
    priority: 2,
    widgets: [
      'SEO Ranking Tracker',
      'SEO Audit Dashboard',
      'Content Gap Analysis',
      'Keyword Research Analysis',
      'Backlink Analysis'
    ]
  },
  {
    id: 'social-marketing',
    title: 'Social & Marketing',
    description: 'Social media optimization and marketing automation',
    icon: 'Hash',
    color: 'bg-purple-600',
    priority: 3,
    widgets: [
      'Trending Hashtags Analyzer',
      'SEO Meta Tag Generator'
    ]
  },
  {
    id: 'operations',
    title: 'System Operations',
    description: 'Workflow monitoring, cost tracking, and system management',
    icon: 'Settings',
    color: 'bg-orange-600',
    priority: 4,
    widgets: [
      'Workflow Status',
      'API Cost Tracker',
      'AI Recommendations'
    ]
  }
];

export const categorizedWidgets: CategorizedWidget[] = [
  // Business Intelligence
  {
    type: 'Competitor Monitoring',
    title: 'Competitor Monitoring',
    description: 'Track competitor activities, pricing, and market positioning',
    category: 'business-intelligence',
    icon: 'Users',
    complexity: 'intermediate',
    estimatedSetupTime: '10-15 mins',
    requiredIntegrations: ['Web Scraping APIs', 'Social Media APIs']
  },
  {
    type: 'Performance Analytics',
    title: 'Performance Analytics',
    description: 'Monitor automation performance, success rates, and KPIs',
    category: 'business-intelligence',
    icon: 'TrendingUp',
    complexity: 'beginner',
    estimatedSetupTime: '5 mins'
  },
  {
    type: 'Industry Intelligence Dashboard',
    title: 'Industry Intelligence',
    description: 'Market trends, industry insights, and economic indicators',
    category: 'business-intelligence',
    icon: 'Globe',
    complexity: 'advanced',
    estimatedSetupTime: '20-30 mins',
    requiredIntegrations: ['Financial APIs', 'News APIs']
  },
  {
    type: 'Tech Stack Analyzer',
    title: 'Tech Stack Analyzer',
    description: 'Analyze website technologies and technical infrastructure',
    category: 'business-intelligence',
    icon: 'Code',
    complexity: 'intermediate',
    estimatedSetupTime: '10 mins',
    requiredIntegrations: ['BuiltWith API', 'Wappalyzer']
  },

  // SEO & Content Strategy
  {
    type: 'SEO Ranking Tracker',
    title: 'SEO Ranking Tracker',
    description: 'Track keyword rankings, SERP positions, and SEO performance',
    category: 'seo-content',
    icon: 'Target',
    complexity: 'beginner',
    estimatedSetupTime: '5-10 mins',
    requiredIntegrations: ['Google Search Console', 'SEO APIs']
  },
  {
    type: 'SEO Audit Dashboard',
    title: 'SEO Audit Dashboard',
    description: 'Comprehensive SEO analysis and optimization recommendations',
    category: 'seo-content',
    icon: 'CheckCircle',
    complexity: 'intermediate',
    estimatedSetupTime: '15 mins',
    requiredIntegrations: ['PageSpeed API', 'SEO Tools']
  },
  {
    type: 'Content Gap Analysis',
    title: 'Content Gap Analysis',
    description: 'Identify content opportunities and competitive gaps',
    category: 'seo-content',
    icon: 'FileText',
    complexity: 'advanced',
    estimatedSetupTime: '20 mins',
    requiredIntegrations: ['Content APIs', 'AI Analysis']
  },
  {
    type: 'Keyword Research Analysis',
    title: 'Keyword Research',
    description: 'Discover high-value keywords and search opportunities',
    category: 'seo-content',
    icon: 'Key',
    complexity: 'intermediate',
    estimatedSetupTime: '10-15 mins',
    requiredIntegrations: ['Keyword APIs', 'Search Tools']
  },
  {
    type: 'Backlink Analysis',
    title: 'Backlink Analysis',
    description: 'Monitor backlink profile, domain authority, and link building',
    category: 'seo-content',
    icon: 'Link',
    complexity: 'intermediate',
    estimatedSetupTime: '10 mins',
    requiredIntegrations: ['Backlink APIs', 'SEO Tools']
  },

  // Social & Marketing
  {
    type: 'Trending Hashtags Analyzer',
    title: 'Trending Hashtags',
    description: 'Discover trending hashtags and social media opportunities',
    category: 'social-marketing',
    icon: 'Hash',
    complexity: 'beginner',
    estimatedSetupTime: '5 mins',
    requiredIntegrations: ['Social Media APIs']
  },
  {
    type: 'SEO Meta Tag Generator',
    title: 'Meta Tag Generator',
    description: 'Generate optimized meta tags and social media snippets',
    category: 'social-marketing',
    icon: 'Tag',
    complexity: 'beginner',
    estimatedSetupTime: '5 mins'
  },

  // Operations
  {
    type: 'Workflow Status',
    title: 'Workflow Status',
    description: 'Monitor automation workflows, schedules, and execution status',
    category: 'operations',
    icon: 'Zap',
    complexity: 'beginner',
    estimatedSetupTime: '3 mins'
  },
  {
    type: 'API Cost Tracker',
    title: 'API Cost Tracker',
    description: 'Track API usage, costs, and optimize automation expenses',
    category: 'operations',
    icon: 'DollarSign',
    complexity: 'beginner',
    estimatedSetupTime: '5 mins'
  },
  {
    type: 'AI Recommendations',
    title: 'AI Recommendations',
    description: 'AI-powered suggestions for optimization and improvements',
    category: 'operations',
    icon: 'Brain',
    complexity: 'intermediate',
    estimatedSetupTime: '10 mins',
    requiredIntegrations: ['AI APIs', 'Analytics Data']
  }
];

export const getCategoryById = (categoryId: string): WidgetCategory | undefined => {
  return widgetCategories.find(category => category.id === categoryId);
};

export const getWidgetsByCategory = (categoryId: string): CategorizedWidget[] => {
  return categorizedWidgets.filter(widget => widget.category === categoryId);
};

export const getWidgetByType = (type: string): CategorizedWidget | undefined => {
  return categorizedWidgets.find(widget => widget.type === type);
};