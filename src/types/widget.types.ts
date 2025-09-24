export interface WidgetData {
  id: string;
  type: string;
  title: string;
  content: WidgetContent;
  size: 'standard' | 'expanded';
  isVisible: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WidgetContent {
  // Stats widget content
  value?: number | string;
  change?: number;
  icon?: string;
  unit?: string;

  // Chart widget content
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  data?: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;

  // Automation widget content
  status?: 'running' | 'completed' | 'paused' | 'error';
  progress?: number;
  lastRun?: string;

  // Text widget content
  text?: string;

  // SEO widget content
  summary?: {
    total_keywords?: number;
    average_position?: number;
    top_10_rankings?: number;
    top_3_rankings?: number;
    page_1_rankings?: number;
    not_ranking?: number;
    overallHealth?: string;
    criticalIssues?: number;
    totalIssues?: number;
  };

  keyword_rankings?: Array<{
    keyword: string;
    current_rank: number;
    page: number;
    featured_snippet: boolean;
  }>;

  serp_features?: {
    featured_snippets: number;
    people_also_ask: number;
    local_pack_appearances: number;
    image_pack: number;
    shopping_results: number;
  };

  position_distribution?: {
    positions_1_3: number;
    positions_4_10: number;
    positions_11_20: number;
    positions_21_50: number;
    positions_51_100: number;
    not_found: number;
  };

  // SEO Audit content
  website_url?: string;
  timestamp?: string;
  seoScore?: number;
  avgLoadTime?: number;
  mobileScore?: number;
  desktopScore?: number;
  performanceMetrics?: {
    seo: number;
    performance: number;
    accessibility: number;
    bestPractices: number;
  };

  issuesBreakdown?: {
    critical: number;
    warning: number;
    passed: number;
    info: number;
  };

  detailedIssues?: {
    missingMetaDescription: boolean;
    slowLoadingPages: boolean;
    missingAltTags: boolean;
    h1TagOptimization: boolean;
    brokenLinks: number;
    imageCompression: boolean;
  };

  brokenLinksDetails?: {
    count: number;
    totalChecked: number;
    examples: string[];
  };

  // Content Gap Analysis
  analysis_metadata?: {
    analyzed_date: string;
    client_domain: string;
    competitor_domains: string[];
    total_topics_analyzed: number;
    gaps_identified: number;
    analysis_confidence: number;
    ai_insights_included: boolean;
    client_business_type: string;
  };

  content_gaps?: {
    high_priority: Array<{
      topic: string;
      gap_score: number;
      search_volume_estimate: string;
      estimated_monthly_traffic: string;
    }>;
    medium_priority: Array<{
      topic: string;
      gap_score: number;
      search_volume_estimate: string;
      estimated_monthly_traffic: string;
    }>;
    low_priority: Array<{
      topic: string;
      gap_score: number;
      search_volume_estimate: string;
      estimated_monthly_traffic: string;
    }>;
  };

  strategic_insights?: {
    market_opportunities: {
      high_impact_topics: number;
      total_traffic_potential: string;
      top_opportunity: string;
    };
    competitive_landscape: {
      client_vs_competitor_gap: number;
      average_competitor_topics: number;
    };
  };

  kpi_metrics?: {
    critical_gaps: number;
    total_opportunities: number;
    roi_potential: string;
  };

  // Keyword Research Analysis
  generated_on?: string;
  input_data?: {
    website_url: string;
    domain: string;
    industry: string;
    location: {
      city: string;
      state: string;
      country: string;
      formatted: string;
    };
  };

  ai_summary?: {
    intent: string;
    rationale: string;
    intent_distribution: {
      commercial: number;
      informational: number;
      navigational: number;
    };
    content_opportunities: Array<{
      topic: string;
      search_volume: string;
      difficulty: string;
      opportunity_score: number;
    }>;
    strategic_recommendations: Array<{
      action: string;
      priority: string;
      timeline: string;
    }>;
  };

  keyword_strategy?: {
    primary_keywords: Array<{
      keyword: string;
      search_volume_range: string;
      trend: string;
      intent: string;
      serp_difficulty: string;
      relevance_score: number;
    }>;
    local_keywords: Array<{
      keyword: string;
      search_volume_range: string;
      trend: string;
      intent: string;
      serp_difficulty: string;
      relevance_score: number;
    }>;
    difficulty_analysis: {
      easy: number;
      medium: number;
      hard: number;
    };
  };

  competitor_analysis?: {
    total_competitors: number;
    top_competitors: Array<{
      domain: string;
      title: string;
      rank_position: number;
      competitive_strength: string;
    }>;
    market_position: string;
  };

  website_analysis?: {
    seo_score: number;
  };

  // Backlink Analysis
  analysis_period?: string;
  target_url?: string;
  growth_metrics?: {
    backlinks_growth_rate: string;
    referring_domains_growth_rate: string;
    net_growth_percentage: string;
  };

  top_referring_domains?: Array<{
    domain: string;
    domain_rank: number;
    backlinks_count: number;
    anchor_text: string;
  }>;

  anchor_text_categories?: {
    branded: {
      percentage: number;
      anchors: Array<{
        text: string;
        count: number;
        percentage: string;
      }>;
    };
    exact_match: {
      percentage: number;
      anchors: Array<{
        text: string;
        count: number;
        percentage: string;
      }>;
    };
    generic: {
      percentage: number;
      anchors: Array<{
        text: string;
        count: number;
        percentage: string;
      }>;
    };
  };

  // Industry Intelligence Dashboard
  request?: {
    originalInput: {
      market: string;
      location: string;
      time_range: string;
    };
    market: string;
    location: string;
    timeRange: string;
    symbol: string;
    requestId: string;
  };

  analysis?: string;
  prices?: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;

  processedAt?: string;

  // Trending Hashtags Analyzer
  success?: boolean;
  requestId?: string;
  parameters?: {
    platforms: string[];
    keywords: string[];
    location: string;
    trackingPeriod: string;
    trackingHours: number;
    numHashtags: number;
    startTime: string;
  };

  platforms?: {
    [key: string]: {
      totalHashtagsFound: number;
      topHashtags: Array<{
        hashtag: string;
        count: number;
      }>;
    };
  };

  // Tech Stack Analyzer
  analysis_summary?: {
    domains_analyzed: number;
    total_technologies_found: number;
    unique_categories_found: string[];
    data_sources_detected: string[];
  };

  domains?: Array<{
    domain: string;
    metadata: {
      title: string;
      description: string;
      country: string;
      language: string;
      rank: number;
      performance_score: number;
    };
    technology_stack: {
      [category: string]: Array<{
        name: string;
        version: string;
        is_live: boolean;
        confidence: number;
        last_detected: string;
      }>;
    };
    performance: {
      core_web_vitals: {
        fcp: number;
        lcp: number;
        cls: number;
        fid: number;
        tbt: number;
        tti: number;
        speed_index: number;
      };
      metrics: {
        load_time: number;
        page_size: number;
        requests: number;
      };
      opportunities: Array<{
        title: string;
        potential_savings: string;
      }>;
    };
  }>;

  // Generic fallback
  [key: string]: any;
}

export interface WidgetProps {
  id: string;
  type: string;
  title: string;
  content: WidgetContent;
  size: 'standard' | 'expanded';
  onResize: (id: string, size: 'standard' | 'expanded') => void;
  onRemove: (id: string) => void;
}

export interface WidgetGridProps {
  widgets: WidgetData[];
  onWidgetResize: (id: string, size: 'standard' | 'expanded') => void;
  onWidgetRemove: (id: string) => void;
  onAddWidget: () => void;
}

export interface WidgetContentProps {
  type: string;
  content: WidgetContent;
  onNavigateToAutomations?: () => void;
}