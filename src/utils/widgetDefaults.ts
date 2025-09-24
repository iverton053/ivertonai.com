export const getDefaultWidgetContent = (type: string) => {
  switch (type) {
    case 'stats':
      return {
        value: Math.floor(Math.random() * 1000),
        change: (Math.random() - 0.5) * 40,
        icon: 'TrendingUp',
        unit: ''
      };
    case 'chart':
      return {
        chartType: 'line',
        data: Array.from({ length: 7 }, (_, i) => ({
          name: `Day ${i + 1}`,
          value: Math.floor(Math.random() * 100)
        }))
      };
    case 'automation':
      return {
        status: 'running',
        progress: Math.floor(Math.random() * 100),
        lastRun: new Date().toLocaleString()
      };
    case 'SEO Ranking Tracker':
      return {
        summary: {
          total_keywords: 15,
          average_position: 18.4,
          top_10_rankings: 6,
          top_3_rankings: 2,
          page_1_rankings: 6,
          not_ranking: 3,
        },
        keyword_rankings: [
          { keyword: 'dashboard automation', current_rank: 2, page: 1, featured_snippet: true },
          { keyword: 'AI workflow tools', current_rank: 5, page: 1, featured_snippet: false },
          { keyword: 'business analytics', current_rank: 12, page: 2, featured_snippet: false },
          { keyword: 'productivity software', current_rank: 28, page: 3, featured_snippet: false },
        ],
        serp_features: {
          featured_snippets: 3,
          people_also_ask: 12,
          local_pack_appearances: 1,
          image_pack: 5,
          shopping_results: 0,
        },
        position_distribution: {
          positions_1_3: 2,
          positions_4_10: 4,
          positions_11_20: 5,
          positions_21_50: 1,
          positions_51_100: 0,
          not_found: 3,
        }
      };
    case 'SEO Audit Dashboard':
      return {
        website_url: 'https://example-business.com',
        timestamp: new Date().toISOString(),
        seoScore: 84,
        avgLoadTime: 1.8,
        mobileScore: 78,
        desktopScore: 91,
        performanceMetrics: {
          seo: 84,
          performance: 79,
          accessibility: 95,
          bestPractices: 87
        },
        issuesBreakdown: {
          critical: 1,
          warning: 3,
          passed: 22,
          info: 2
        },
        detailedIssues: {
          missingMetaDescription: false,
          slowLoadingPages: false,
          missingAltTags: true,
          h1TagOptimization: false,
          brokenLinks: 1,
          imageCompression: true
        },
        brokenLinksDetails: {
          count: 1,
          totalChecked: 28,
          examples: [
            'https://example-business.com/old-contact-page'
          ]
        },
        summary: {
          overallHealth: 'Good',
          criticalIssues: 1,
          totalIssues: 4
        }
      };
    case 'Content Gap Analysis':
      return {
        analysis_metadata: {
          analyzed_date: new Date().toISOString(),
          client_domain: 'example-business.com',
          competitor_domains: ['competitor1.com', 'competitor2.com', 'competitor3.com'],
          total_topics_analyzed: 32,
          gaps_identified: 12,
          analysis_confidence: 89,
          ai_insights_included: true,
          client_business_type: 'marketing_agency'
        },
        content_gaps: {
          high_priority: [
            {
              topic: 'AI Marketing Automation',
              gap_score: 92,
              search_volume_estimate: 'High',
              estimated_monthly_traffic: '750-1100 potential visitors'
            },
            {
              topic: 'Content Creation AI Tools',
              gap_score: 85,
              search_volume_estimate: 'High',
              estimated_monthly_traffic: '600-850 potential visitors'
            }
          ],
          medium_priority: [
            {
              topic: 'SEO Analytics Automation',
              gap_score: 67,
              search_volume_estimate: 'Medium',
              estimated_monthly_traffic: '300-450 potential visitors'
            }
          ],
          low_priority: [
            {
              topic: 'Business Intelligence Dashboards',
              gap_score: 43,
              search_volume_estimate: 'Low',
              estimated_monthly_traffic: '150-250 potential visitors'
            }
          ]
        },
        strategic_insights: {
          market_opportunities: {
            high_impact_topics: 2,
            total_traffic_potential: '1950+ monthly visitors',
            top_opportunity: 'AI Marketing Automation'
          },
          competitive_landscape: {
            client_vs_competitor_gap: 5,
            average_competitor_topics: 28
          }
        },
        kpi_metrics: {
          critical_gaps: 2,
          total_opportunities: 4,
          roi_potential: 'High'
        }
      };
    case 'Keyword Research Analysis':
      return {
        status: "success",
        generated_on: new Date().toISOString(),
        data: [{
          analysis_metadata: {
            analyzed_date: new Date().toISOString(),
            website_title: "Business Services - Professional Solutions",
            processing_status: "completed"
          },
          input_data: {
            website_url: "https://example-business.com",
            domain: "example-business.com",
            industry: "business services",
            location: {
              city: "Austin",
              state: "TX",
              country: "USA",
              formatted: "Austin, TX, USA"
            }
          },
          ai_summary: {
            intent: "Mixed Intent Analysis",
            rationale: "Balanced commercial and informational intent for business services",
            intent_distribution: {
              commercial: 70,
              informational: 20,
              navigational: 10
            },
            content_opportunities: [
              {
                topic: "Business Automation Solutions Guide",
                search_volume: "5.2K/month",
                difficulty: "medium",
                opportunity_score: 88
              },
              {
                topic: "Local Business Services Comparison",
                search_volume: "2.4K/month",
                difficulty: "low",
                opportunity_score: 92
              }
            ],
            strategic_recommendations: [
              {
                action: "Create local Austin business pages",
                priority: "high",
                timeline: "2-3 weeks"
              }
            ]
          },
          keyword_strategy: {
            primary_keywords: [
              {
                keyword: "business services austin",
                search_volume_range: "3K-5K",
                trend: "stable",
                intent: "commercial",
                serp_difficulty: "medium",
                relevance_score: 89
              },
              {
                keyword: "professional consulting services",
                search_volume_range: "1K-3K",
                trend: "rising",
                intent: "commercial",
                serp_difficulty: "medium",
                relevance_score: 85
              }
            ],
            local_keywords: [
              {
                keyword: "business services near me",
                search_volume_range: "2K-4K",
                trend: "increasing",
                intent: "commercial",
                serp_difficulty: "low",
                relevance_score: 92
              }
            ],
            difficulty_analysis: {
              easy: 2,
              medium: 4,
              hard: 1
            }
          },
          competitor_analysis: {
            total_competitors: 6,
            top_competitors: [
              {
                domain: "competitor1.com",
                title: "Leading Business Solutions",
                rank_position: 3,
                competitive_strength: "medium"
              }
            ],
            market_position: "moderately_competitive"
          },
          website_analysis: {
            seo_score: 78
          }
        }]
      };
    case 'Backlink Analysis':
      return {
        status: 'success',
        timestamp: new Date().toISOString(),
        analysis_period: 'last 30 days',
        target_url: 'https://example-business.com',
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
          backlinks_growth_rate: '+1.23%',
          referring_domains_growth_rate: '+0.89%',
          net_growth_percentage: '+1.23%'
        },
        top_referring_domains: [
          { domain: 'authoritysite.com', domain_rank: 89, backlinks_count: 247, anchor_text: 'business solutions' },
          { domain: 'industrynews.com', domain_rank: 82, backlinks_count: 189, anchor_text: 'example business' },
          { domain: 'techblog.org', domain_rank: 76, backlinks_count: 156, anchor_text: 'professional services' }
        ],
        anchor_text_categories: {
          branded: { percentage: 28.5, anchors: [{ text: 'example business', count: 2847, percentage: '18.5' }] },
          exact_match: { percentage: 23.8, anchors: [{ text: 'business solutions', count: 1894, percentage: '12.3' }] },
          generic: { percentage: 19.4, anchors: [{ text: 'click here', count: 1247, percentage: '8.1' }] }
        }
      };
    case 'Industry Intelligence Dashboard':
      return {
        request: {
          originalInput: {
            market: 'technology',
            location: 'US',
            time_range: '1M'
          },
          market: 'stock',
          location: 'US',
          timeRange: '1M',
          symbol: 'XLK',
          timestamp: new Date().toISOString(),
          requestId: `${Date.now()}-sample`
        },
        summary: {
          firstClose: 185.42,
          lastClose: 198.67,
          change: 13.25,
          pctChange: 7.14,
          high: 201.85,
          low: 182.33,
          avgClose: 192.45,
          dataPoints: 22,
          successfulSources: ['yahoo', 'finnhub'],
          failedSources: ['marketstack'],
          totalDataPoints: 22
        },
        analysis: 'XLK shows bullish trend (+7.14%) over 1M. Range: 182.33 - 201.85 with stable volatility. Data from yahoo, finnhub sources.',
        prices: [
          { date: '2024-08-01', open: 185.42, high: 187.21, low: 184.15, close: 186.78, volume: 1250000 },
          { date: '2024-08-02', open: 186.78, high: 189.34, low: 185.67, close: 188.92, volume: 1340000 },
          { date: '2024-08-05', open: 188.92, high: 191.45, low: 187.23, close: 190.67, volume: 1180000 },
          { date: '2024-08-06', open: 190.67, high: 193.21, low: 189.45, close: 192.34, volume: 1420000 },
          { date: '2024-08-07', open: 192.34, high: 194.78, low: 191.12, close: 193.89, volume: 1350000 }
        ],
        processedAt: new Date().toISOString()
      };
    case 'Trending Hashtags Analyzer':
      return {
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
              { hashtag: '#seo', count: 10 }
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
              { hashtag: '#brandawareness', count: 8 }
            ]
          }
        }
      };
    case 'Tech Stack Analyzer':
      return {
        status: 'success',
        timestamp: new Date().toISOString(),
        analysis_summary: {
          domains_analyzed: 1,
          total_technologies_found: 18,
          unique_categories_found: ['cms', 'analytics', 'hosting_cdn', 'javascript_frameworks', 'ui_frameworks', 'ecommerce', 'advertising'],
          data_sources_detected: ['builtwith', 'dataforseo', 'pagespeed', 'scraperapi']
        },
        domains: [{
          domain: 'sample-business.com',
          metadata: {
            title: 'Sample Business - Leading Solutions Provider',
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
        }]
      };
    default:
      return {
        text: `This is a ${type} widget with sample content.`
      };
  }
};