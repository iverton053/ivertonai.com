import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Star,
  Download,
  Eye,
  Clock,
  Users,
  Mail,
  DollarSign,
  MessageSquare,
  BarChart3,
  Play,
  Zap,
  GitBranch,
  Calendar,
  TrendingUp,
  Award,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { WorkflowTemplate, TriggerType } from '../../types/automation';

interface WorkflowTemplatesProps {
  onUseTemplate: (template: WorkflowTemplate) => void;
  onPreviewTemplate: (template: WorkflowTemplate) => void;
}

// n8n-Compatible Workflow Templates
const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // Dashboard Widget Workflows
  {
    id: 'competitor_monitoring',
    name: 'Competitor Monitoring & Intelligence',
    description: 'Automated competitive analysis using SEMrush, Ahrefs, SpyFu, and BuiltWith APIs. Real-time alerts on competitor ranking changes and new threats.',
    category: 'mixed',
    trigger: 'schedule',
    complexity: 'advanced',
    estimated_time_saved: 40,
    steps: [
      {
        type: 'trigger',
        name: 'Scheduled Analysis',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'schedule',
          schedule: {
            frequency: 'daily',
            time: '09:00'
          }
        },
        next_steps: ['step_semrush_data'],
        previous_steps: []
      },
      {
        type: 'action',
        name: 'Get SEMrush Organic Data',
        position: { x: 350, y: 100 },
        action: {
          type: 'api_call',
          parameters: {
            endpoint: 'https://api.semrush.com/',
            method: 'GET'
          },
          service: 'semrush'
        },
        next_steps: ['step_process_data'],
        previous_steps: ['step_trigger']
      },
      {
        type: 'action',
        name: 'Process Competitor Data',
        position: { x: 600, y: 100 },
        action: {
          type: 'javascript',
          parameters: {
            code: 'return processCompetitorAnalysis($input.all());'
          },
          service: 'n8n'
        },
        next_steps: ['step_send_webhook'],
        previous_steps: ['step_semrush_data']
      },
      {
        type: 'action',
        name: 'Send to Dashboard',
        position: { x: 850, y: 100 },
        action: {
          type: 'webhook',
          parameters: {
            url: 'http://localhost:3001/api/webhooks/competitor-update',
            method: 'POST'
          },
          service: 'webhook'
        },
        next_steps: [],
        previous_steps: ['step_process_data']
      }
    ],
    variables: {
      target_domain: 'example.com',
      competitors: 'competitor1.com,competitor2.com',
      user_plan: 'premium',
      analysis_type: 'full'
    },
    usage_count: 145,
    average_rating: 4.9,
    required_integrations: ['semrush', 'ahrefs', 'spyfu', 'builtwith'],
    required_permissions: ['read_competitor_data', 'send_webhooks'],
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    tags: ['competitor', 'analysis', 'seo', 'intelligence', 'dashboard']
  },
  {
    id: 'performance_analytics',
    name: 'Performance Analytics & Core Web Vitals',
    description: 'Comprehensive website performance monitoring with Google PageSpeed, Analytics, and Search Console integration. Real-time Core Web Vitals tracking.',
    category: 'mixed',
    trigger: 'webhook',
    complexity: 'advanced',
    estimated_time_saved: 35,
    steps: [
      {
        type: 'trigger',
        name: 'Webhook Trigger',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'webhook',
          conditions: []
        },
        next_steps: ['step_pagespeed_mobile'],
        previous_steps: []
      },
      {
        type: 'action',
        name: 'PageSpeed Mobile Analysis',
        position: { x: 350, y: 80 },
        action: {
          type: 'api_call',
          parameters: {
            endpoint: 'https://www.googleapis.com/pagespeedinights/v5/runPagespeed',
            method: 'GET'
          },
          service: 'google'
        },
        next_steps: ['step_process_performance'],
        previous_steps: ['step_trigger']
      },
      {
        type: 'action',
        name: 'PageSpeed Desktop Analysis',
        position: { x: 350, y: 120 },
        action: {
          type: 'api_call',
          parameters: {
            endpoint: 'https://www.googleapis.com/pagespeedinights/v5/runPagespeed',
            method: 'GET'
          },
          service: 'google'
        },
        next_steps: ['step_process_performance'],
        previous_steps: ['step_trigger']
      },
      {
        type: 'action',
        name: 'Process Performance Data',
        position: { x: 600, y: 100 },
        action: {
          type: 'javascript',
          parameters: {
            code: 'return processPerformanceMetrics($input.all());'
          },
          service: 'n8n'
        },
        next_steps: ['step_send_dashboard'],
        previous_steps: ['step_pagespeed_mobile', 'step_pagespeed_desktop']
      }
    ],
    variables: {
      target_url: 'https://example.com',
      user_plan: 'premium',
      time_range: '30d'
    },
    usage_count: 203,
    average_rating: 4.8,
    required_integrations: ['google_pagespeed', 'google_analytics', 'search_console'],
    required_permissions: ['read_performance_data', 'send_webhooks'],
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    tags: ['performance', 'analytics', 'core-web-vitals', 'google', 'dashboard']
  },
  {
    id: 'ai_recommendations',
    name: 'AI-Powered Business Recommendations',
    description: 'Advanced AI analysis using GPT-4 for strategic recommendations, market trends, and content strategy optimization.',
    category: 'mixed',
    trigger: 'webhook',
    complexity: 'advanced',
    estimated_time_saved: 50,
    steps: [
      {
        type: 'trigger',
        name: 'AI Analysis Request',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'webhook',
          conditions: []
        },
        next_steps: ['step_openai_strategic'],
        previous_steps: []
      },
      {
        type: 'action',
        name: 'GPT-4 Strategic Analysis',
        position: { x: 350, y: 80 },
        action: {
          type: 'openai_chat',
          parameters: {
            model: 'gpt-4',
            max_tokens: 2000,
            temperature: 0.7
          },
          service: 'openai'
        },
        next_steps: ['step_process_recommendations'],
        previous_steps: ['step_trigger']
      },
      {
        type: 'action',
        name: 'Market Trends Analysis',
        position: { x: 350, y: 120 },
        action: {
          type: 'openai_chat',
          parameters: {
            model: 'gpt-3.5-turbo',
            max_tokens: 1000,
            temperature: 0.6
          },
          service: 'openai'
        },
        next_steps: ['step_process_recommendations'],
        previous_steps: ['step_trigger']
      },
      {
        type: 'action',
        name: 'Process AI Recommendations',
        position: { x: 600, y: 100 },
        action: {
          type: 'javascript',
          parameters: {
            code: 'return processAIRecommendations($input.all());'
          },
          service: 'n8n'
        },
        next_steps: ['step_send_dashboard'],
        previous_steps: ['step_openai_strategic', 'step_market_trends']
      }
    ],
    variables: {
      business_domain: 'digital_marketing',
      user_plan: 'premium',
      focus_areas: 'seo,content,marketing,performance'
    },
    usage_count: 89,
    average_rating: 4.9,
    required_integrations: ['openai', 'gpt-4'],
    required_permissions: ['use_ai_apis', 'send_webhooks'],
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    tags: ['ai', 'gpt-4', 'recommendations', 'business', 'strategy']
  },
  {
    id: 'workflow_status',
    name: 'Workflow Status & Health Monitoring',
    description: 'Real-time monitoring of all n8n workflows with execution analytics, health scoring, and automated alerting.',
    category: 'mixed',
    trigger: 'schedule',
    complexity: 'intermediate',
    estimated_time_saved: 25,
    steps: [
      {
        type: 'trigger',
        name: 'Status Check Schedule',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'schedule',
          schedule: {
            frequency: 'every_5_minutes'
          }
        },
        next_steps: ['step_get_workflows'],
        previous_steps: []
      },
      {
        type: 'action',
        name: 'Get n8n Workflows List',
        position: { x: 350, y: 100 },
        action: {
          type: 'api_call',
          parameters: {
            endpoint: '/api/v1/workflows',
            method: 'GET'
          },
          service: 'n8n'
        },
        next_steps: ['step_process_status'],
        previous_steps: ['step_trigger']
      },
      {
        type: 'action',
        name: 'Process Workflow Status',
        position: { x: 600, y: 100 },
        action: {
          type: 'javascript',
          parameters: {
            code: 'return processWorkflowStatus($input.all());'
          },
          service: 'n8n'
        },
        next_steps: ['step_send_dashboard'],
        previous_steps: ['step_get_workflows']
      }
    ],
    variables: {
      monitoring_type: 'all_workflows',
      user_plan: 'premium',
      alert_threshold: 'medium'
    },
    usage_count: 167,
    average_rating: 4.7,
    required_integrations: ['n8n_api'],
    required_permissions: ['read_workflows', 'read_executions'],
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    tags: ['monitoring', 'status', 'health', 'workflows', 'automation']
  },
  // Professional Business Automation Templates
  {
    id: 'template_1',
    name: 'Welcome Email Sequence',
    description: 'Automatically send a series of welcome emails to new contacts with personalized content based on their signup source.',
    category: 'email',
    trigger: 'contact_created',
    complexity: 'simple',
    estimated_time_saved: 10,
    steps: [
      {
        type: 'trigger',
        name: 'New Contact Created',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'contact_created',
          conditions: []
        },
        next_steps: ['step_delay_1'],
        previous_steps: []
      },
      {
        type: 'delay',
        name: 'Wait 1 Hour',
        position: { x: 350, y: 100 },
        delay: {
          duration: 1,
          unit: 'hours'
        },
        next_steps: ['step_email_1'],
        previous_steps: ['step_trigger_1']
      },
      {
        type: 'action',
        name: 'Send Welcome Email',
        position: { x: 600, y: 100 },
        action: {
          type: 'send_email',
          parameters: {
            template: 'welcome_template',
            subject: 'Welcome to {{company_name}}!',
            personalize: true
          },
          service: 'email'
        },
        next_steps: ['step_delay_2'],
        previous_steps: ['step_delay_1']
      },
      {
        type: 'delay',
        name: 'Wait 3 Days',
        position: { x: 850, y: 100 },
        delay: {
          duration: 3,
          unit: 'days'
        },
        next_steps: ['step_email_2'],
        previous_steps: ['step_email_1']
      },
      {
        type: 'action',
        name: 'Send Getting Started Guide',
        position: { x: 1100, y: 100 },
        action: {
          type: 'send_email',
          parameters: {
            template: 'getting_started_template',
            subject: 'Your Getting Started Guide',
            attachments: ['guide.pdf']
          },
          service: 'email'
        },
        next_steps: [],
        previous_steps: ['step_delay_2']
      }
    ],
    variables: {
      company_name: 'Your Company',
      sender_name: 'Support Team',
      welcome_discount: '10%'
    },
    usage_count: 1247,
    average_rating: 4.8,
    required_integrations: ['email_service', 'crm'],
    required_permissions: ['send_email', 'read_contacts'],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    tags: ['welcome', 'onboarding', 'email', 'sequence']
  },
  {
    id: 'template_2',
    name: 'Lead Scoring & Assignment',
    description: 'Automatically score leads based on activity and demographics, then assign hot leads to sales reps.',
    category: 'crm',
    trigger: 'contact_updated',
    complexity: 'intermediate',
    estimated_time_saved: 15,
    steps: [
      {
        type: 'trigger',
        name: 'Contact Updated',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'contact_updated',
          conditions: [
            {
              field: 'lead_score',
              operator: 'greater_than',
              value: 80
            }
          ]
        },
        next_steps: ['step_condition_1'],
        previous_steps: []
      },
      {
        type: 'condition',
        name: 'Check Lead Score',
        position: { x: 350, y: 100 },
        condition: {
          field: 'lead_score',
          operator: 'greater_than',
          value: 90
        },
        next_steps: ['step_assign_hot', 'step_assign_warm'],
        previous_steps: ['step_trigger_1']
      },
      {
        type: 'action',
        name: 'Assign to Senior Rep',
        position: { x: 600, y: 50 },
        action: {
          type: 'update_contact',
          parameters: {
            assigned_to: 'senior_sales_rep',
            priority: 'high'
          },
          service: 'crm'
        },
        next_steps: ['step_notify_rep'],
        previous_steps: ['step_condition_1']
      },
      {
        type: 'action',
        name: 'Assign to Junior Rep',
        position: { x: 600, y: 150 },
        action: {
          type: 'update_contact',
          parameters: {
            assigned_to: 'junior_sales_rep',
            priority: 'medium'
          },
          service: 'crm'
        },
        next_steps: ['step_notify_rep'],
        previous_steps: ['step_condition_1']
      },
      {
        type: 'action',
        name: 'Notify Sales Rep',
        position: { x: 850, y: 100 },
        action: {
          type: 'send_notification',
          parameters: {
            recipient: '{{assigned_to}}',
            message: 'New hot lead assigned: {{contact_name}}'
          },
          service: 'email'
        },
        next_steps: [],
        previous_steps: ['step_assign_hot', 'step_assign_warm']
      }
    ],
    variables: {
      hot_lead_threshold: 90,
      warm_lead_threshold: 70,
      senior_rep_email: 'senior@company.com',
      junior_rep_email: 'junior@company.com'
    },
    usage_count: 892,
    average_rating: 4.6,
    required_integrations: ['crm', 'notification_service'],
    required_permissions: ['update_contacts', 'send_notifications'],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-11-15T00:00:00Z',
    tags: ['lead_scoring', 'sales', 'assignment', 'crm']
  },
  {
    id: 'template_3',
    name: 'Social Media Cross-Posting',
    description: 'Automatically cross-post content to multiple social media platforms with platform-specific optimizations.',
    category: 'social',
    trigger: 'manual',
    complexity: 'simple',
    estimated_time_saved: 8,
    steps: [
      {
        type: 'trigger',
        name: 'Manual Trigger',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'manual',
          conditions: []
        },
        next_steps: ['step_facebook', 'step_linkedin', 'step_instagram'],
        previous_steps: []
      },
      {
        type: 'action',
        name: 'Post to Facebook',
        position: { x: 350, y: 50 },
        action: {
          type: 'post_social',
          parameters: {
            platform: 'facebook',
            content: '{{content}}',
            image: '{{image_url}}',
            optimize_for_platform: true
          },
          service: 'social'
        },
        next_steps: [],
        previous_steps: ['step_trigger_1']
      },
      {
        type: 'action',
        name: 'Post to LinkedIn',
        position: { x: 350, y: 100 },
        action: {
          type: 'post_social',
          parameters: {
            platform: 'linkedin',
            content: '{{content}}',
            image: '{{image_url}}',
            add_hashtags: true
          },
          service: 'social'
        },
        next_steps: [],
        previous_steps: ['step_trigger_1']
      },
      {
        type: 'action',
        name: 'Post to Instagram',
        position: { x: 350, y: 150 },
        action: {
          type: 'post_social',
          parameters: {
            platform: 'instagram',
            content: '{{content}}',
            image: '{{image_url}}',
            story: '{{create_story}}'
          },
          service: 'social'
        },
        next_steps: [],
        previous_steps: ['step_trigger_1']
      }
    ],
    variables: {
      content: 'Your post content',
      image_url: '',
      create_story: false
    },
    usage_count: 2156,
    average_rating: 4.4,
    required_integrations: ['facebook', 'linkedin', 'instagram'],
    required_permissions: ['post_social'],
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-12-05T00:00:00Z',
    tags: ['social', 'cross-posting', 'multi-platform']
  },
  {
    id: 'template_4',
    name: 'Ad Campaign Budget Optimizer',
    description: 'Monitor ad performance and automatically adjust budgets based on ROI and conversion rates.',
    category: 'ads',
    trigger: 'schedule',
    complexity: 'advanced',
    estimated_time_saved: 25,
    steps: [
      {
        type: 'trigger',
        name: 'Daily Budget Check',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'schedule',
          schedule: {
            frequency: 'daily',
            time: '09:00'
          }
        },
        next_steps: ['step_get_performance'],
        previous_steps: []
      },
      {
        type: 'action',
        name: 'Get Campaign Performance',
        position: { x: 350, y: 100 },
        action: {
          type: 'api_call',
          parameters: {
            endpoint: '/api/campaigns/performance',
            method: 'GET'
          },
          service: 'ads'
        },
        next_steps: ['step_check_roi'],
        previous_steps: ['step_trigger_1']
      },
      {
        type: 'condition',
        name: 'Check ROI Threshold',
        position: { x: 600, y: 100 },
        condition: {
          field: 'roi',
          operator: 'greater_than',
          value: 3.0
        },
        next_steps: ['step_increase_budget', 'step_check_poor_performance'],
        previous_steps: ['step_get_performance']
      },
      {
        type: 'action',
        name: 'Increase Budget 20%',
        position: { x: 850, y: 50 },
        action: {
          type: 'adjust_ad_budget',
          parameters: {
            adjustment: 1.2,
            max_budget: 1000
          },
          service: 'ads'
        },
        next_steps: ['step_notify_success'],
        previous_steps: ['step_check_roi']
      },
      {
        type: 'condition',
        name: 'Check Poor Performance',
        position: { x: 850, y: 150 },
        condition: {
          field: 'roi',
          operator: 'less_than',
          value: 1.5
        },
        next_steps: ['step_decrease_budget'],
        previous_steps: ['step_check_roi']
      },
      {
        type: 'action',
        name: 'Decrease Budget 30%',
        position: { x: 1100, y: 150 },
        action: {
          type: 'adjust_ad_budget',
          parameters: {
            adjustment: 0.7,
            min_budget: 100
          },
          service: 'ads'
        },
        next_steps: ['step_notify_adjustment'],
        previous_steps: ['step_check_poor_performance']
      },
      {
        type: 'action',
        name: 'Send Success Notification',
        position: { x: 1100, y: 50 },
        action: {
          type: 'send_notification',
          parameters: {
            recipient: 'marketing@company.com',
            subject: 'Budget Increased for High-Performing Campaign'
          },
          service: 'email'
        },
        next_steps: [],
        previous_steps: ['step_increase_budget']
      },
      {
        type: 'action',
        name: 'Send Adjustment Warning',
        position: { x: 1350, y: 150 },
        action: {
          type: 'send_notification',
          parameters: {
            recipient: 'marketing@company.com',
            subject: 'Budget Decreased for Poor-Performing Campaign'
          },
          service: 'email'
        },
        next_steps: [],
        previous_steps: ['step_decrease_budget']
      }
    ],
    variables: {
      roi_threshold_increase: 3.0,
      roi_threshold_decrease: 1.5,
      increase_percentage: 1.2,
      decrease_percentage: 0.7,
      max_daily_budget: 1000,
      min_daily_budget: 100
    },
    usage_count: 543,
    average_rating: 4.9,
    required_integrations: ['google_ads', 'facebook_ads', 'email_service'],
    required_permissions: ['manage_ad_budgets', 'read_campaign_data'],
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-11-20T00:00:00Z',
    tags: ['ads', 'optimization', 'budget', 'roi', 'automation']
  },
  {
    id: 'template_5',
    name: 'Customer Winback Campaign',
    description: 'Identify churned customers and automatically trigger personalized winback email sequences.',
    category: 'mixed',
    trigger: 'deal_lost',
    complexity: 'intermediate',
    estimated_time_saved: 18,
    steps: [
      {
        type: 'trigger',
        name: 'Deal Lost',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'deal_lost',
          conditions: [
            {
              field: 'deal_value',
              operator: 'greater_than',
              value: 1000
            }
          ]
        },
        next_steps: ['step_delay_cooling'],
        previous_steps: []
      },
      {
        type: 'delay',
        name: 'Cooling Off Period',
        position: { x: 350, y: 100 },
        delay: {
          duration: 2,
          unit: 'weeks'
        },
        next_steps: ['step_winback_email_1'],
        previous_steps: ['step_trigger_1']
      },
      {
        type: 'action',
        name: 'Send Winback Email #1',
        position: { x: 600, y: 100 },
        action: {
          type: 'send_email',
          parameters: {
            template: 'winback_template_1',
            subject: 'We miss you, {{first_name}}! Special offer inside',
            discount_code: 'COMEBACK20'
          },
          service: 'email'
        },
        next_steps: ['step_track_open'],
        previous_steps: ['step_delay_cooling']
      },
      {
        type: 'delay',
        name: 'Wait for Response',
        position: { x: 850, y: 100 },
        delay: {
          duration: 1,
          unit: 'weeks'
        },
        next_steps: ['step_check_engagement'],
        previous_steps: ['step_winback_email_1']
      },
      {
        type: 'condition',
        name: 'Check Email Engagement',
        position: { x: 1100, y: 100 },
        condition: {
          field: 'email_opened',
          operator: 'equals',
          value: false
        },
        next_steps: ['step_winback_email_2'],
        previous_steps: ['step_track_open']
      },
      {
        type: 'action',
        name: 'Send Final Winback Email',
        position: { x: 1350, y: 100 },
        action: {
          type: 'send_email',
          parameters: {
            template: 'winback_template_2',
            subject: 'Last chance: 30% off everything',
            discount_code: 'LASTCHANCE30'
          },
          service: 'email'
        },
        next_steps: [],
        previous_steps: ['step_check_engagement']
      }
    ],
    variables: {
      minimum_deal_value: 1000,
      cooling_period_weeks: 2,
      first_discount: 'COMEBACK20',
      final_discount: 'LASTCHANCE30'
    },
    usage_count: 721,
    average_rating: 4.7,
    required_integrations: ['crm', 'email_service'],
    required_permissions: ['read_deals', 'send_email', 'track_engagement'],
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    tags: ['winback', 'retention', 'email', 'deals']
  },
  {
    id: 'template_6',
    name: 'Invoice Follow-up Automation',
    description: 'Automatically send payment reminders and handle overdue invoices with escalating urgency.',
    category: 'mixed',
    trigger: 'schedule',
    complexity: 'intermediate',
    estimated_time_saved: 12,
    steps: [
      {
        type: 'trigger',
        name: 'Daily Invoice Check',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'schedule',
          schedule: {
            frequency: 'daily',
            time: '10:00'
          }
        },
        next_steps: ['step_get_overdue'],
        previous_steps: []
      },
      {
        type: 'action',
        name: 'Get Overdue Invoices',
        position: { x: 350, y: 100 },
        action: {
          type: 'api_call',
          parameters: {
            endpoint: '/api/invoices/overdue',
            method: 'GET'
          },
          service: 'financial'
        },
        next_steps: ['step_check_days_overdue'],
        previous_steps: ['step_trigger_1']
      },
      {
        type: 'condition',
        name: 'Check Days Overdue',
        position: { x: 600, y: 100 },
        condition: {
          field: 'days_overdue',
          operator: 'less_than',
          value: 30
        },
        next_steps: ['step_gentle_reminder', 'step_check_seriously_overdue'],
        previous_steps: ['step_get_overdue']
      },
      {
        type: 'action',
        name: 'Send Gentle Reminder',
        position: { x: 850, y: 50 },
        action: {
          type: 'send_email',
          parameters: {
            template: 'gentle_reminder',
            subject: 'Friendly payment reminder for Invoice {{invoice_number}}'
          },
          service: 'email'
        },
        next_steps: [],
        previous_steps: ['step_check_days_overdue']
      },
      {
        type: 'condition',
        name: 'Seriously Overdue?',
        position: { x: 850, y: 150 },
        condition: {
          field: 'days_overdue',
          operator: 'greater_than',
          value: 60
        },
        next_steps: ['step_urgent_notice', 'step_standard_reminder'],
        previous_steps: ['step_check_days_overdue']
      },
      {
        type: 'action',
        name: 'Send Standard Reminder',
        position: { x: 1100, y: 120 },
        action: {
          type: 'send_email',
          parameters: {
            template: 'standard_reminder',
            subject: 'Payment overdue: Invoice {{invoice_number}}'
          },
          service: 'email'
        },
        next_steps: [],
        previous_steps: ['step_check_seriously_overdue']
      },
      {
        type: 'action',
        name: 'Send Urgent Notice',
        position: { x: 1100, y: 180 },
        action: {
          type: 'send_email',
          parameters: {
            template: 'urgent_notice',
            subject: 'URGENT: Payment required for Invoice {{invoice_number}}'
          },
          service: 'email'
        },
        next_steps: ['step_create_task'],
        previous_steps: ['step_check_seriously_overdue']
      },
      {
        type: 'action',
        name: 'Create Follow-up Task',
        position: { x: 1350, y: 180 },
        action: {
          type: 'create_task',
          parameters: {
            title: 'Call customer about overdue invoice {{invoice_number}}',
            assigned_to: 'collections_team',
            priority: 'high'
          },
          service: 'crm'
        },
        next_steps: [],
        previous_steps: ['step_urgent_notice']
      }
    ],
    variables: {
      gentle_reminder_days: 7,
      standard_reminder_days: 30,
      urgent_notice_days: 60,
      collections_email: 'collections@company.com'
    },
    usage_count: 834,
    average_rating: 4.5,
    required_integrations: ['financial', 'email_service', 'crm'],
    required_permissions: ['read_invoices', 'send_email', 'create_tasks'],
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-11-30T00:00:00Z',
    tags: ['invoicing', 'payments', 'reminders', 'financial']
  },
  // Additional Professional Templates
  {
    id: 'seo_content_optimizer',
    name: 'SEO Content Optimization Pipeline',
    description: 'Automatically analyze content performance, suggest improvements, and optimize for target keywords using AI and SEO tools.',
    category: 'mixed',
    trigger: 'webhook',
    complexity: 'advanced',
    estimated_time_saved: 30,
    steps: [
      {
        type: 'trigger',
        name: 'Content Analysis Trigger',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'webhook',
          conditions: []
        },
        next_steps: ['step_keyword_analysis'],
        previous_steps: []
      },
      {
        type: 'action',
        name: 'Keyword Performance Check',
        position: { x: 350, y: 100 },
        action: {
          type: 'api_call',
          parameters: {
            endpoint: 'https://api.semrush.com/',
            method: 'GET'
          },
          service: 'semrush'
        },
        next_steps: ['step_content_analysis'],
        previous_steps: ['step_trigger']
      },
      {
        type: 'action',
        name: 'AI Content Analysis',
        position: { x: 600, y: 100 },
        action: {
          type: 'openai_chat',
          parameters: {
            model: 'gpt-4',
            prompt: 'Analyze this content for SEO optimization opportunities'
          },
          service: 'openai'
        },
        next_steps: ['step_generate_recommendations'],
        previous_steps: ['step_keyword_analysis']
      },
      {
        type: 'action',
        name: 'Generate SEO Recommendations',
        position: { x: 850, y: 100 },
        action: {
          type: 'javascript',
          parameters: {
            code: 'return generateSEORecommendations($input.all());'
          },
          service: 'n8n'
        },
        next_steps: [],
        previous_steps: ['step_content_analysis']
      }
    ],
    variables: {
      target_keywords: 'digital marketing, SEO, content optimization',
      content_url: '',
      analysis_depth: 'comprehensive'
    },
    usage_count: 312,
    average_rating: 4.7,
    required_integrations: ['semrush', 'openai', 'content_api'],
    required_permissions: ['read_content', 'use_ai_apis'],
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    tags: ['seo', 'content', 'optimization', 'ai', 'keywords']
  },
  {
    id: 'lead_nurturing_sequence',
    name: 'Multi-Channel Lead Nurturing',
    description: 'Intelligent lead nurturing across email, SMS, and social media based on behavior, engagement, and lead score.',
    category: 'mixed',
    trigger: 'contact_updated',
    complexity: 'advanced',
    estimated_time_saved: 45,
    steps: [
      {
        type: 'trigger',
        name: 'Lead Score Updated',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'contact_updated',
          conditions: [
            {
              field: 'lead_score',
              operator: 'greater_than',
              value: 50
            }
          ]
        },
        next_steps: ['step_check_engagement'],
        previous_steps: []
      },
      {
        type: 'condition',
        name: 'Check Engagement Level',
        position: { x: 350, y: 100 },
        condition: {
          field: 'engagement_score',
          operator: 'greater_than',
          value: 70
        },
        next_steps: ['step_high_engagement', 'step_low_engagement'],
        previous_steps: ['step_trigger']
      },
      {
        type: 'action',
        name: 'High-Touch Nurturing',
        position: { x: 600, y: 50 },
        action: {
          type: 'send_email',
          parameters: {
            template: 'high_engagement_nurture',
            personalized: true
          },
          service: 'email'
        },
        next_steps: ['step_schedule_call'],
        previous_steps: ['step_check_engagement']
      },
      {
        type: 'action',
        name: 'Standard Nurturing',
        position: { x: 600, y: 150 },
        action: {
          type: 'send_email',
          parameters: {
            template: 'standard_nurture',
            follow_up_days: 3
          },
          service: 'email'
        },
        next_steps: ['step_track_response'],
        previous_steps: ['step_check_engagement']
      }
    ],
    variables: {
      engagement_threshold: 70,
      nurture_duration_days: 30,
      channels: 'email,sms,linkedin'
    },
    usage_count: 456,
    average_rating: 4.8,
    required_integrations: ['email_service', 'sms_service', 'crm'],
    required_permissions: ['send_email', 'send_sms', 'update_contacts'],
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    tags: ['lead_nurturing', 'multi-channel', 'engagement', 'personalization']
  },
  {
    id: 'social_listening_alerts',
    name: 'Brand Mention & Social Listening',
    description: 'Monitor brand mentions across social platforms, news sites, and forums. Auto-respond to customer service issues.',
    category: 'social',
    trigger: 'schedule',
    complexity: 'intermediate',
    estimated_time_saved: 20,
    steps: [
      {
        type: 'trigger',
        name: 'Hourly Social Check',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'schedule',
          schedule: {
            frequency: 'hourly'
          }
        },
        next_steps: ['step_search_mentions'],
        previous_steps: []
      },
      {
        type: 'action',
        name: 'Search Social Mentions',
        position: { x: 350, y: 100 },
        action: {
          type: 'api_call',
          parameters: {
            platforms: 'twitter,facebook,instagram,linkedin',
            keywords: '{{brand_keywords}}'
          },
          service: 'social_monitoring'
        },
        next_steps: ['step_sentiment_analysis'],
        previous_steps: ['step_trigger']
      },
      {
        type: 'action',
        name: 'Sentiment Analysis',
        position: { x: 600, y: 100 },
        action: {
          type: 'openai_chat',
          parameters: {
            model: 'gpt-3.5-turbo',
            prompt: 'Analyze sentiment of these brand mentions'
          },
          service: 'openai'
        },
        next_steps: ['step_check_negative'],
        previous_steps: ['step_search_mentions']
      },
      {
        type: 'condition',
        name: 'Check for Negative Sentiment',
        position: { x: 850, y: 100 },
        condition: {
          field: 'sentiment',
          operator: 'equals',
          value: 'negative'
        },
        next_steps: ['step_alert_team'],
        previous_steps: ['step_sentiment_analysis']
      }
    ],
    variables: {
      brand_keywords: 'your-brand,company-name',
      alert_threshold: 'negative',
      response_team: 'social@company.com'
    },
    usage_count: 289,
    average_rating: 4.6,
    required_integrations: ['social_apis', 'openai', 'notification_service'],
    required_permissions: ['read_social_data', 'use_ai_apis', 'send_notifications'],
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    tags: ['social_listening', 'brand_monitoring', 'sentiment_analysis', 'customer_service']
  },
  {
    id: 'ecommerce_inventory_sync',
    name: 'Multi-Platform Inventory Sync',
    description: 'Synchronize inventory levels across multiple e-commerce platforms and marketplaces in real-time.',
    category: 'mixed',
    trigger: 'webhook',
    complexity: 'advanced',
    estimated_time_saved: 35,
    steps: [
      {
        type: 'trigger',
        name: 'Inventory Update Webhook',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'webhook',
          conditions: []
        },
        next_steps: ['step_get_current_inventory'],
        previous_steps: []
      },
      {
        type: 'action',
        name: 'Get Current Inventory',
        position: { x: 350, y: 100 },
        action: {
          type: 'api_call',
          parameters: {
            endpoint: '/api/inventory/current',
            method: 'GET'
          },
          service: 'inventory_system'
        },
        next_steps: ['step_update_shopify', 'step_update_amazon', 'step_update_ebay'],
        previous_steps: ['step_trigger']
      },
      {
        type: 'action',
        name: 'Update Shopify Inventory',
        position: { x: 600, y: 50 },
        action: {
          type: 'api_call',
          parameters: {
            platform: 'shopify',
            method: 'PUT'
          },
          service: 'shopify'
        },
        next_steps: ['step_log_update'],
        previous_steps: ['step_get_current_inventory']
      },
      {
        type: 'action',
        name: 'Update Amazon Inventory',
        position: { x: 600, y: 100 },
        action: {
          type: 'api_call',
          parameters: {
            platform: 'amazon',
            method: 'PUT'
          },
          service: 'amazon_mws'
        },
        next_steps: ['step_log_update'],
        previous_steps: ['step_get_current_inventory']
      }
    ],
    variables: {
      platforms: 'shopify,amazon,ebay,etsy',
      sync_threshold: 5,
      low_stock_alert: 10
    },
    usage_count: 178,
    average_rating: 4.9,
    required_integrations: ['shopify', 'amazon_mws', 'ebay_api', 'inventory_system'],
    required_permissions: ['update_inventory', 'read_products'],
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    tags: ['ecommerce', 'inventory', 'sync', 'multi-platform', 'automation']
  },
  {
    id: 'customer_health_scoring',
    name: 'Customer Health Score Automation',
    description: 'Automatically calculate customer health scores based on usage, engagement, and support interactions. Trigger retention workflows.',
    category: 'crm',
    trigger: 'schedule',
    complexity: 'advanced',
    estimated_time_saved: 40,
    steps: [
      {
        type: 'trigger',
        name: 'Daily Health Score Update',
        position: { x: 100, y: 100 },
        trigger: {
          type: 'schedule',
          schedule: {
            frequency: 'daily',
            time: '08:00'
          }
        },
        next_steps: ['step_get_usage_data'],
        previous_steps: []
      },
      {
        type: 'action',
        name: 'Get Usage Analytics',
        position: { x: 350, y: 100 },
        action: {
          type: 'api_call',
          parameters: {
            endpoint: '/api/analytics/usage',
            time_range: '30d'
          },
          service: 'analytics'
        },
        next_steps: ['step_calculate_health'],
        previous_steps: ['step_trigger']
      },
      {
        type: 'action',
        name: 'Calculate Health Score',
        position: { x: 600, y: 100 },
        action: {
          type: 'javascript',
          parameters: {
            code: 'return calculateCustomerHealthScore($input.all());'
          },
          service: 'n8n'
        },
        next_steps: ['step_check_at_risk'],
        previous_steps: ['step_get_usage_data']
      },
      {
        type: 'condition',
        name: 'Check At-Risk Customers',
        position: { x: 850, y: 100 },
        condition: {
          field: 'health_score',
          operator: 'less_than',
          value: 40
        },
        next_steps: ['step_trigger_retention'],
        previous_steps: ['step_calculate_health']
      }
    ],
    variables: {
      health_factors: 'usage,engagement,support,billing',
      at_risk_threshold: 40,
      retention_team: 'success@company.com'
    },
    usage_count: 234,
    average_rating: 4.8,
    required_integrations: ['analytics_api', 'crm', 'support_system'],
    required_permissions: ['read_analytics', 'update_customer_data'],
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    tags: ['customer_success', 'health_scoring', 'retention', 'analytics']
  }
];

const CATEGORY_ICONS = {
  email: Mail,
  crm: Users,
  social: MessageSquare,
  ads: BarChart3,
  mixed: Zap,
  custom: GitBranch
};

const COMPLEXITY_COLORS = {
  simple: 'bg-green-900 text-green-200',
  intermediate: 'bg-yellow-900 text-yellow-200',
  advanced: 'bg-red-900 text-red-200'
};

const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  onUseTemplate,
  onPreviewTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'usage' | 'rating' | 'time_saved' | 'recent'>('usage');
  const [bookmarkedTemplates, setBookmarkedTemplates] = useState<Set<string>>(new Set());

  const categories = ['all', 'email', 'crm', 'social', 'ads', 'mixed', 'custom'];
  const complexities = ['all', 'simple', 'intermediate', 'advanced'];

  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = WORKFLOW_TEMPLATES.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity;
      
      return matchesSearch && matchesCategory && matchesComplexity;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usage_count - a.usage_count;
        case 'rating':
          return b.average_rating - a.average_rating;
        case 'time_saved':
          return b.estimated_time_saved - a.estimated_time_saved;
        case 'recent':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedComplexity, sortBy]);

  const toggleBookmark = (templateId: string) => {
    setBookmarkedTemplates(prev => {
      const updated = new Set(prev);
      if (updated.has(templateId)) {
        updated.delete(templateId);
      } else {
        updated.add(templateId);
      }
      return updated;
    });
  };

  const formatUsageCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Workflow Templates
        </h2>
        <p className="text-gray-400">
          Get started quickly with pre-built automation workflows. All templates are n8n compatible.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Complexity Filter */}
          <div>
            <select
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {complexities.map(complexity => (
                <option key={complexity} value={complexity}>
                  {complexity === 'all' ? 'All Levels' : complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="usage">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="time_saved">Time Saved</option>
              <option value="recent">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAndSortedTemplates.map((template) => {
            const CategoryIcon = CATEGORY_ICONS[template.category];
            const isBookmarked = bookmarkedTemplates.has(template.id);
            
            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-900 rounded-lg">
                        <CategoryIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {template.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${COMPLEXITY_COLORS[template.complexity]}`}>
                            {template.complexity}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full">
                            {template.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleBookmark(template.id)}
                      className="text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                    {template.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium text-white">
                          {template.average_rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Rating</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-blue-500">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium text-white">
                          {formatUsageCount(template.usage_count)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Uses</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-green-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium text-white">
                          {template.estimated_time_saved}h
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Saved/mo</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded">
                        +{template.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onPreviewTemplate(template)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-md transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    
                    <button
                      onClick={() => onUseTemplate(template)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Use Template</span>
                    </button>
                  </div>

                  {/* Requirements */}
                  {template.required_integrations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">Required integrations:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.required_integrations.slice(0, 3).map((integration) => (
                          <span
                            key={integration}
                            className="px-2 py-1 text-xs bg-orange-900 text-orange-200 rounded"
                          >
                            {integration.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {template.required_integrations.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-400">
                            +{template.required_integrations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAndSortedTemplates.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-400 mb-4">
            Try adjusting your search criteria or filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedComplexity('all');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg p-6 border border-blue-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {filteredAndSortedTemplates.length}
            </div>
            <p className="text-sm text-gray-400">Available Templates</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round(filteredAndSortedTemplates.reduce((sum, t) => sum + t.estimated_time_saved, 0) / filteredAndSortedTemplates.length || 0)}h
            </div>
            <p className="text-sm text-gray-400">Avg. Time Saved/Month</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {(filteredAndSortedTemplates.reduce((sum, t) => sum + t.average_rating, 0) / filteredAndSortedTemplates.length || 0).toFixed(1)}
            </div>
            <p className="text-sm text-gray-400">Average Rating</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatUsageCount(filteredAndSortedTemplates.reduce((sum, t) => sum + t.usage_count, 0))}
            </div>
            <p className="text-sm text-gray-400">Total Uses</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTemplates;