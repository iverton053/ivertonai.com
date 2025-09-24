// Client Onboarding Flow Types
export interface OnboardingFormData {
  // Section 1: Basic Information
  basicInfo: {
    clientName: string;
    company: string;
    industry: string;
    companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    website: string;
    businessLocation: {
      city: string;
      state: string;
      country: string;
      timezone: string;
    };
  };

  // Section 2: Contact Details
  contactInfo: {
    primary: {
      name: string;
      email: string;
      phone: string;
      position: string;
    };
    secondary?: {
      name: string;
      email: string;
      phone: string;
      position: string;
    };
    businessAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    preferredCommunication: 'email' | 'phone' | 'slack' | 'teams';
  };

  // Section 3: Business Goals
  businessGoals: {
    primaryGoals: string[];
    monthlyBudget: number;
    targetAudience: string;
    keyMetrics: string[];
    currentChallenges: string[];
  };

  // Section 4: SEO & Content
  seoData: {
    targetKeywords: string[];
    competitors: string[];
    googleAnalyticsId?: string;
    googleSearchConsoleConnected: boolean;
    existingContent: string[];
    currentSEOProvider?: string;
  };

  // Section 5: Social Media
  socialMedia: {
    facebook?: {
      pageUrl: string;
      accessToken?: string;
      enabled: boolean;
    };
    instagram?: {
      handle: string;
      accessToken?: string;
      enabled: boolean;
    };
    linkedin?: {
      companyPageUrl: string;
      accessToken?: string;
      enabled: boolean;
    };
    twitter?: {
      handle: string;
      apiAccess: boolean;
      enabled: boolean;
    };
    youtube?: {
      channelUrl: string;
      enabled: boolean;
    };
    tiktok?: {
      handle: string;
      enabled: boolean;
    };
  };

  // Section 6: Marketing Automation
  marketing: {
    emailPlatform: 'mailchimp' | 'constant-contact' | 'hubspot' | 'other' | 'none';
    crmSystem: 'hubspot' | 'salesforce' | 'pipedrive' | 'other' | 'none';
    leadSources: string[];
    pipelineStages: string[];
    emailListSize: number;
    automationTools: string[];
  };

  // Section 7: Advertising
  advertising: {
    googleAds: {
      accountId?: string;
      monthlySpend: number;
      enabled: boolean;
    };
    facebookAds: {
      accountId?: string;
      monthlySpend: number;
      enabled: boolean;
    };
    currentCampaigns: string;
    conversionGoals: string[];
  };

  // Section 8: Technical Integration
  technical: {
    websitePlatform: 'wordpress' | 'shopify' | 'wix' | 'squarespace' | 'custom' | 'other';
    analyticsSetup: {
      googleAnalytics: boolean;
      googleTagManager: boolean;
      facebookPixel: boolean;
    };
    apiPermissions: string[];
    existingIntegrations: string[];
  };

  // Section 9: Reporting
  reporting: {
    frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    preferredFormat: 'pdf' | 'dashboard' | 'email' | 'presentation';
    customMetrics: string[];
    communicationPrefs: {
      slack?: string;
      email: boolean;
      phone: boolean;
    };
  };

  // Section 10: Branding
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    brandGuidelines?: string;
    customDomain?: string;
    portalCustomization: boolean;
  };
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  estimatedTime: number; // in minutes
  dependencies?: string[];
  validation?: Record<string, any>;
}

export interface OnboardingFlow {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  formData: Partial<OnboardingFormData>;
  errors: Record<string, string>;
  isLoading: boolean;
  canProceed: boolean;
}

export interface OnboardingStepProps {
  formData: Partial<OnboardingFormData>;
  onUpdate: (section: keyof OnboardingFormData, data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

// Industry templates for quick setup
export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  defaultGoals: string[];
  commonKeywords: string[];
  typicalBudgetRange: {
    min: number;
    max: number;
  };
  recommendedWidgets: string[];
  sampleCompetitors: string[];
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Online retail and product sales',
    defaultGoals: ['Increase Sales', 'Drive Traffic', 'Improve Conversion Rate', 'Customer Retention'],
    commonKeywords: ['product name', 'buy online', 'shop', 'discount', 'free shipping'],
    typicalBudgetRange: { min: 2000, max: 10000 },
    recommendedWidgets: ['SEO Ranking Tracker', 'Google Ads Analytics', 'Social Media Analytics', 'Conversion Tracking'],
    sampleCompetitors: ['amazon.com', 'competitor1.com', 'competitor2.com']
  },
  {
    id: 'saas',
    name: 'SaaS',
    description: 'Software as a Service companies',
    defaultGoals: ['Lead Generation', 'Trial Conversions', 'User Acquisition', 'Brand Awareness'],
    commonKeywords: ['software', 'solution', 'platform', 'tool', 'free trial'],
    typicalBudgetRange: { min: 5000, max: 25000 },
    recommendedWidgets: ['Content Marketing Analytics', 'Lead Generation Tracking', 'SEO Performance', 'Email Campaign Analytics'],
    sampleCompetitors: ['salesforce.com', 'hubspot.com', 'competitor.com']
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Property sales and real estate services',
    defaultGoals: ['Generate Leads', 'Local Visibility', 'Property Listings', 'Client Acquisition'],
    commonKeywords: ['homes for sale', 'real estate agent', 'property', 'neighborhood', 'mortgage'],
    typicalBudgetRange: { min: 1500, max: 8000 },
    recommendedWidgets: ['Local SEO Tracker', 'Lead Management', 'Social Media Presence', 'Google My Business Analytics'],
    sampleCompetitors: ['zillow.com', 'realtor.com', 'local-competitor.com']
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical practices and healthcare services',
    defaultGoals: ['Patient Acquisition', 'Online Reputation', 'Appointment Bookings', 'Educational Content'],
    commonKeywords: ['doctor', 'medical', 'clinic', 'appointment', 'health'],
    typicalBudgetRange: { min: 2000, max: 12000 },
    recommendedWidgets: ['Reputation Management', 'Local Search Rankings', 'Content Performance', 'Patient Reviews'],
    sampleCompetitors: ['local-clinic.com', 'healthcare-competitor.com']
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    description: 'Legal, consulting, financial services',
    defaultGoals: ['Lead Generation', 'Thought Leadership', 'Client Acquisition', 'Professional Reputation'],
    commonKeywords: ['lawyer', 'consultant', 'advisor', 'services', 'expert'],
    typicalBudgetRange: { min: 3000, max: 15000 },
    recommendedWidgets: ['Content Marketing', 'Professional Network Analytics', 'Lead Tracking', 'SEO Rankings'],
    sampleCompetitors: ['competitor-firm.com', 'local-services.com']
  }
];

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Tell us about your client\'s business',
    component: 'BasicInfoStep',
    required: true,
    estimatedTime: 3
  },
  {
    id: 'contact-details',
    title: 'Contact Details',
    description: 'How can we reach your client?',
    component: 'ContactDetailsStep',
    required: true,
    estimatedTime: 2
  },
  {
    id: 'business-goals',
    title: 'Business Goals',
    description: 'What are your client\'s objectives?',
    component: 'BusinessGoalsStep',
    required: true,
    estimatedTime: 4
  },
  {
    id: 'seo-setup',
    title: 'SEO & Content',
    description: 'Configure SEO tracking and keywords',
    component: 'SEOSetupStep',
    required: false,
    estimatedTime: 5
  },
  {
    id: 'social-media',
    title: 'Social Media',
    description: 'Connect social media accounts',
    component: 'SocialMediaStep',
    required: false,
    estimatedTime: 4
  },
  {
    id: 'marketing-automation',
    title: 'Marketing & CRM',
    description: 'Set up marketing automation',
    component: 'MarketingAutomationStep',
    required: false,
    estimatedTime: 5
  },
  {
    id: 'advertising',
    title: 'Advertising',
    description: 'Configure ad tracking and budgets',
    component: 'AdvertisingStep',
    required: false,
    estimatedTime: 3
  },
  {
    id: 'technical-integration',
    title: 'Technical Setup',
    description: 'Connect analytics and integrations',
    component: 'TechnicalIntegrationStep',
    required: false,
    estimatedTime: 4
  },
  {
    id: 'reporting',
    title: 'Reporting',
    description: 'Set up reports and notifications',
    component: 'ReportingStep',
    required: true,
    estimatedTime: 2
  },
  {
    id: 'branding',
    title: 'Branding',
    description: 'Customize client portal appearance',
    component: 'BrandingStep',
    required: false,
    estimatedTime: 3
  }
];