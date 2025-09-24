// Tiered Feature Mapping - Basic vs Premium Strategy
// This file defines the clear separation between Basic and Premium features

export const FEATURE_TIERS = {
  // BASIC PLAN - Dashboard Widgets Only
  BASIC: {
    name: 'Basic Plan',
    price: 'Free / $29/month',
    description: 'Essential AI-powered widgets for small businesses',
    
    // Widget-based Features (Dashboard Panel)
    widgets: {
      'seo-widget': {
        name: 'SEO Monitor',
        features: [
          'Basic SEO score (overall)',
          'Top 5 keyword rankings',
          'Basic technical issues (5 max)',
          'Weekly reports',
          'Mobile & Desktop scores'
        ],
        limitations: [
          'Limited to 50 keywords',
          'Weekly refresh only',
          'No historical data (7 days)',
          'Basic insights only'
        ]
      },
      
      'competitor-monitoring': {
        name: 'Competitor Monitoring',
        features: [
          'Track up to 3 competitors',
          'Basic threat level assessment',
          'Weekly alerts (3 max)',
          'Market share overview',
          'Recent changes detection'
        ],
        limitations: [
          'Limited to 3 competitors',
          'Basic data only',
          'Weekly updates',
          '3 alerts per week max'
        ]
      },
      
      'performance-analytics': {
        name: 'Performance Analytics',
        features: [
          'Basic website performance score',
          'Traffic trend (7 days)',
          'Bounce rate & session time',
          'Top 3 performing pages',
          'Basic conversion tracking'
        ],
        limitations: [
          'Last 7 days data only',
          'No custom date ranges',
          'Basic metrics only',
          'Hourly refresh'
        ]
      },
      
      'ai-recommendations': {
        name: 'AI Recommendations',
        features: [
          '3 AI-generated recommendations',
          'Priority scoring',
          'Basic market trends (3)',
          'Impact assessment',
          'Simple implementation guides'
        ],
        limitations: [
          'Max 3 recommendations',
          'Weekly refresh',
          'Basic analysis only',
          'No custom strategies'
        ]
      },
      
      'workflow-status': {
        name: 'Workflow Status',
        features: [
          'View 3 active workflows',
          'Basic execution status',
          'Success rate tracking',
          'Last 24h activity log',
          'Simple scheduling'
        ],
        limitations: [
          'Max 3 workflows visible',
          '24h history only',
          'Basic monitoring',
          'No advanced controls'
        ]
      },
      
      'content-gaps': {
        name: 'Content Gap Analysis',
        features: [
          '5 high-priority content gaps',
          'Basic keyword opportunities',
          'Simple traffic estimates',
          'Competitor content analysis',
          'Topic suggestions'
        ],
        limitations: [
          'Limited to 5 gaps',
          'Basic analysis only',
          'Weekly updates',
          'No custom topics'
        ]
      }
    },
    
    // Basic Plan Global Limitations
    globalLimitations: [
      'No automation workflows creation',
      'No custom integrations',
      'No API access',
      'Basic support only',
      'Weekly data refresh',
      'Limited historical data',
      'No team collaboration',
      'No white-label options'
    ]
  },

  // PREMIUM PLAN - Full Automation Hub Access
  PREMIUM: {
    name: 'Premium Plan',
    price: '$99-$299/month',
    description: 'Advanced AI automation with full workflow management',
    
    // Full Automation Hub Features
    automationHub: {
      'workflow-builder': {
        name: 'Visual Workflow Builder',
        features: [
          'Drag-and-drop workflow creation',
          'Custom trigger conditions',
          'Multi-step automation chains',
          'Conditional logic & branching',
          'Error handling & retries'
        ]
      },
      
      'n8n-integration': {
        name: 'n8n Workflow Integration',
        features: [
          'Full n8n workflow management',
          'Custom webhook endpoints',
          'Real-time data synchronization',
          'Advanced scheduling options',
          'Workflow versioning & rollback'
        ]
      },
      
      'advanced-analytics': {
        name: 'Advanced Analytics Engine',
        features: [
          'Custom dashboard builder',
          'Real-time data streaming',
          'Advanced filtering & segmentation',
          'Historical trend analysis (unlimited)',
          'Predictive analytics & forecasting'
        ]
      },
      
      'ai-automation': {
        name: 'AI-Powered Automations',
        features: [
          'Intelligent content generation',
          'Automated A/B testing',
          'Smart optimization suggestions',
          'Dynamic strategy adjustment',
          'Learning-based improvements'
        ]
      }
    },
    
    // Enhanced Widget Features (Premium Extensions)
    enhancedWidgets: {
      'unlimited-monitoring': {
        features: [
          'Unlimited competitors tracking',
          'Real-time alerts & notifications',
          'Custom alert rules & conditions',
          'Advanced threat assessment',
          'Competitor intelligence reports'
        ]
      },
      
      'advanced-seo': {
        features: [
          'Unlimited keyword tracking',
          'Real-time ranking updates',
          'Technical SEO deep analysis',
          'Custom reporting & exports',
          'White-label reports'
        ]
      },
      
      'comprehensive-analytics': {
        features: [
          'Unlimited historical data',
          'Custom date ranges & filtering',
          'Advanced conversion funnels',
          'User behavior analytics',
          'Performance optimization AI'
        ]
      }
    },
    
    // Premium-Only Features
    exclusiveFeatures: [
      'Custom automation creation',
      'API access & integrations',
      'Team collaboration tools',
      'Priority support & training',
      'White-label options',
      'Custom webhook integrations',
      'Advanced security features',
      'Dedicated account manager'
    ]
  }
};

// Upgrade Path Mapping - What users get when upgrading
export const UPGRADE_BENEFITS = {
  'seo-widget': {
    from: 'Basic SEO monitoring with 50 keywords',
    to: 'Unlimited keywords + real-time tracking + custom reports'
  },
  
  'competitor-monitoring': {
    from: '3 competitors with weekly updates',
    to: 'Unlimited competitors + real-time alerts + intelligence reports'
  },
  
  'performance-analytics': {
    from: '7-day performance overview',
    to: 'Unlimited history + custom dashboards + predictive analytics'
  },
  
  'ai-recommendations': {
    from: '3 weekly AI recommendations',
    to: 'Unlimited AI insights + custom strategies + automated optimization'
  },
  
  'workflow-status': {
    from: 'View 3 workflows with basic monitoring',
    to: 'Unlimited workflows + advanced controls + custom automations'
  }
};

// Feature Gate Helpers
export class FeatureGate {
  static isBasicPlan(userPlan = 'basic') {
    return userPlan.toLowerCase() === 'basic';
  }
  
  static isPremiumPlan(userPlan = 'basic') {
    return ['premium', 'pro', 'enterprise'].includes(userPlan.toLowerCase());
  }
  
  static canAccessFeature(feature, userPlan = 'basic') {
    if (this.isPremiumPlan(userPlan)) return true;
    
    const basicFeatures = Object.keys(FEATURE_TIERS.BASIC.widgets);
    return basicFeatures.includes(feature);
  }
  
  static getFeatureLimits(widgetType, userPlan = 'basic') {
    if (this.isPremiumPlan(userPlan)) {
      return { unlimited: true };
    }
    
    const basicWidget = FEATURE_TIERS.BASIC.widgets[widgetType];
    return {
      limitations: basicWidget?.limitations || [],
      features: basicWidget?.features || []
    };
  }
  
  static shouldShowUpgradePrompt(widgetType, userPlan = 'basic') {
    return this.isBasicPlan(userPlan);
  }
}

// Integration Points for n8n Webhooks
export const N8N_INTEGRATION_POINTS = {
  // Basic Plan - Webhook consumption only (read-only)
  BASIC_ENDPOINTS: {
    'seo-data-receiver': {
      path: '/webhooks/seo-update',
      method: 'POST',
      description: 'Receives SEO analysis results from n8n workflows'
    },
    
    'competitor-data-receiver': {
      path: '/webhooks/competitor-update',
      method: 'POST',
      description: 'Receives competitor monitoring data'
    },
    
    'performance-data-receiver': {
      path: '/webhooks/analytics-update',
      method: 'POST',
      description: 'Receives website performance metrics'
    }
  },
  
  // Premium Plan - Full bi-directional integration
  PREMIUM_ENDPOINTS: {
    'workflow-trigger': {
      path: '/webhooks/trigger-workflow',
      method: 'POST',
      description: 'Triggers custom n8n workflows from dashboard'
    },
    
    'automation-control': {
      path: '/webhooks/automation-control',
      method: 'POST/PUT/DELETE',
      description: 'Full CRUD operations for automation management'
    },
    
    'custom-webhook': {
      path: '/webhooks/custom/:workflowId',
      method: 'ANY',
      description: 'User-defined custom webhook endpoints'
    }
  }
};

// Pricing Strategy
export const PRICING_STRATEGY = {
  basic: {
    monthlyPrice: 29,
    yearlyPrice: 290, // 2 months free
    features: Object.keys(FEATURE_TIERS.BASIC.widgets).length,
    description: 'Perfect for small businesses starting with AI automation'
  },
  
  premium: {
    monthlyPrice: 99,
    yearlyPrice: 990, // 2 months free
    features: 'unlimited',
    description: 'Full automation power for growing businesses'
  },
  
  enterprise: {
    monthlyPrice: 299,
    yearlyPrice: 2990, // 2 months free
    features: 'unlimited + white-label + dedicated support',
    description: 'Complete solution for agencies and enterprises'
  }
};

export default { FEATURE_TIERS, UPGRADE_BENEFITS, FeatureGate, N8N_INTEGRATION_POINTS, PRICING_STRATEGY };