import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  ArrowLeft,
  ArrowRight,
  Clock,
  User,
  Building,
  Target,
  Search,
  Hash,
  Mail,
  DollarSign,
  Settings,
  FileText,
  Palette
} from 'lucide-react';
import { ONBOARDING_STEPS, OnboardingFormData, OnboardingFlow } from '../types/onboarding';
import { useComprehensiveClientStore } from '../stores/comprehensiveClientStore';
import { WidgetDataPopulationService } from '../services/widgetDataPopulation';

// Step Components (we'll create these next)
import BasicInfoStep from '../components/onboarding/BasicInfoStep';
import ContactDetailsStep from '../components/onboarding/ContactDetailsStep';
import BusinessGoalsStep from '../components/onboarding/BusinessGoalsStep';
import SEOSetupStep from '../components/onboarding/SEOSetupStep';
import SocialMediaStep from '../components/onboarding/SocialMediaStep';
import MarketingAutomationStep from '../components/onboarding/MarketingAutomationStep';
import AdvertisingStep from '../components/onboarding/AdvertisingStep';
import TechnicalIntegrationStep from '../components/onboarding/TechnicalIntegrationStep';
import ReportingStep from '../components/onboarding/ReportingStep';
import BrandingStep from '../components/onboarding/BrandingStep';
import OnboardingComplete from '../components/onboarding/OnboardingComplete';

const STEP_ICONS = {
  'basic-info': User,
  'contact-details': Building,
  'business-goals': Target,
  'seo-setup': Search,
  'social-media': Hash,
  'marketing-automation': Mail,
  'advertising': DollarSign,
  'technical-integration': Settings,
  'reporting': FileText,
  'branding': Palette
};

const STEP_COMPONENTS = {
  BasicInfoStep,
  ContactDetailsStep,
  BusinessGoalsStep,
  SEOSetupStep,
  SocialMediaStep,
  MarketingAutomationStep,
  AdvertisingStep,
  TechnicalIntegrationStep,
  ReportingStep,
  BrandingStep
};

const AddClientPage: React.FC = () => {
  const { addClient } = useComprehensiveClientStore();

  const [onboardingFlow, setOnboardingFlow] = useState<OnboardingFlow>({
    currentStep: 0,
    totalSteps: ONBOARDING_STEPS.length,
    completedSteps: [],
    formData: {},
    errors: {},
    isLoading: false,
    canProceed: false
  });

  const [showCompletion, setShowCompletion] = useState(false);

  const currentStepData = ONBOARDING_STEPS[onboardingFlow.currentStep];
  const CurrentStepComponent = STEP_COMPONENTS[currentStepData?.component as keyof typeof STEP_COMPONENTS];

  // Update form data for a specific section
  const handleUpdateFormData = (section: keyof OnboardingFormData, data: any) => {
    setOnboardingFlow(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [section]: data
      },
      errors: {
        ...prev.errors,
        [section]: undefined // Clear errors when data is updated
      }
    }));
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const stepId = currentStepData.id;
    const formData = onboardingFlow.formData;

    // Basic validation rules
    switch (stepId) {
      case 'basic-info':
        return !!(formData.basicInfo?.clientName &&
                 formData.basicInfo?.company &&
                 formData.basicInfo?.website &&
                 formData.basicInfo?.industry);

      case 'contact-details':
        return !!(formData.contactInfo?.primary?.name &&
                 formData.contactInfo?.primary?.email &&
                 formData.contactInfo?.primary?.phone);

      case 'business-goals':
        return !!(formData.businessGoals?.primaryGoals?.length &&
                 formData.businessGoals?.monthlyBudget);

      case 'reporting':
        return !!(formData.reporting?.frequency &&
                 formData.reporting?.recipients?.length);

      default:
        return true; // Optional steps don't require validation
    }
  };

  // Navigate to next step
  const handleNext = () => {
    if (!validateCurrentStep()) {
      setOnboardingFlow(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [currentStepData.id]: 'Please complete all required fields'
        }
      }));
      return;
    }

    const currentStepId = currentStepData.id;

    setOnboardingFlow(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, currentStepId])],
      currentStep: prev.currentStep + 1,
      errors: {}
    }));

    // Check if we've completed all steps
    if (onboardingFlow.currentStep === ONBOARDING_STEPS.length - 1) {
      handleCompleteOnboarding();
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    setOnboardingFlow(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      errors: {}
    }));
  };

  // Jump to specific step
  const handleStepClick = (stepIndex: number) => {
    const stepId = ONBOARDING_STEPS[stepIndex].id;
    const isCompleted = onboardingFlow.completedSteps.includes(stepId);
    const isPrevious = stepIndex < onboardingFlow.currentStep;

    if (isCompleted || isPrevious || stepIndex === onboardingFlow.currentStep) {
      setOnboardingFlow(prev => ({
        ...prev,
        currentStep: stepIndex,
        errors: {}
      }));
    }
  };

  // Complete onboarding and create client
  const handleCompleteOnboarding = async () => {
    setOnboardingFlow(prev => ({ ...prev, isLoading: true }));

    try {
      // Transform form data to ComprehensiveClient format
      const clientData = transformFormDataToClient(onboardingFlow.formData);

      // Add client to store
      await addClient(clientData);

      // Populate widget data with client-specific information
      console.log('Populating widgets with client data...');
      const widgetPopulationSuccess = await WidgetDataPopulationService.populateAllWidgets(
        clientData.id,
        onboardingFlow.formData
      );

      if (widgetPopulationSuccess) {
        console.log('Widget data population successful');
      } else {
        console.warn('Widget data population failed, but client was created successfully');
      }

      // Show completion screen
      setShowCompletion(true);

    } catch (error) {
      console.error('Error creating client:', error);
      setOnboardingFlow(prev => ({
        ...prev,
        errors: {
          general: 'Failed to create client. Please try again.'
        },
        isLoading: false
      }));
    }
  };

  // Transform onboarding form data to ComprehensiveClient format
  const transformFormDataToClient = (formData: Partial<OnboardingFormData>) => {
    return {
      id: `client-${Date.now()}`,
      name: formData.basicInfo?.clientName || '',
      company: formData.basicInfo?.company || '',
      website: formData.basicInfo?.website || '',
      industry: formData.basicInfo?.industry || '',
      company_size: formData.basicInfo?.companySize || 'small',

      contact: {
        primary_name: formData.contactInfo?.primary?.name || '',
        primary_email: formData.contactInfo?.primary?.email || '',
        primary_phone: formData.contactInfo?.primary?.phone || '',
        secondary_name: formData.contactInfo?.secondary?.name,
        secondary_email: formData.contactInfo?.secondary?.email,
        secondary_phone: formData.contactInfo?.secondary?.phone,
        address: formData.contactInfo?.businessAddress || {
          street: '',
          city: '',
          state: '',
          country: '',
          postal_code: ''
        },
        timezone: formData.basicInfo?.businessLocation?.timezone || 'UTC'
      },

      business: {
        monthly_retainer: formData.businessGoals?.monthlyBudget,
        currency: 'USD',
        services: [],
        goals: formData.businessGoals?.primaryGoals || [],
        target_keywords: formData.seoData?.targetKeywords || [],
        target_audience: formData.businessGoals?.targetAudience || '',
        competitors: formData.seoData?.competitors || []
      },

      social_media: {
        facebook: formData.socialMedia?.facebook,
        instagram: formData.socialMedia?.instagram,
        linkedin: formData.socialMedia?.linkedin,
        twitter: formData.socialMedia?.twitter,
        youtube: formData.socialMedia?.youtube,
        tiktok: formData.socialMedia?.tiktok
      },

      crm: {
        leads: [],
        deals: [],
        contacts: [],
        pipeline_stages: formData.marketing?.pipelineStages || []
      },

      dashboard: {
        enabled_widgets: [],
        widget_configurations: [],
        layout: 'grid' as const,
        custom_dashboard: false
      },

      analytics: {
        traffic_data: [],
        conversion_data: [],
        performance_metrics: {
          monthly_visitors: 0,
          conversion_rate: 0,
          avg_session_duration: 0,
          bounce_rate: 0
        },
        google_analytics_id: formData.seoData?.googleAnalyticsId,
        google_ads_id: formData.advertising?.googleAds?.accountId,
        facebook_pixel_id: formData.advertising?.facebookAds?.accountId
      },

      automation: {
        email_campaigns: [],
        social_posts: [],
        workflows: [],
        integrations: {}
      },

      notifications: {
        client_notifications: [],
        notification_preferences: {
          email_reports: formData.reporting?.communicationPrefs?.email || false,
          sms_alerts: false,
          slack_integration: formData.reporting?.communicationPrefs?.slack,
          frequency: formData.reporting?.frequency || 'monthly'
        }
      },

      branding: {
        primary_color: formData.branding?.primaryColor || '#8B5CF6',
        secondary_color: formData.branding?.secondaryColor || '#3B82F6',
        logo_url: formData.branding?.logoUrl,
        company_name: formData.basicInfo?.company || '',
        custom_domain: formData.branding?.customDomain
      },

      reporting: {
        frequency: formData.reporting?.frequency || 'monthly',
        template_id: undefined,
        custom_metrics: formData.reporting?.customMetrics || [],
        auto_send: true,
        recipients: formData.reporting?.recipients || [],
        last_report_sent: undefined
      },

      status: 'onboarding' as const,
      onboarding_completed: false,
      onboarding_step: onboardingFlow.currentStep,

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system',
      last_accessed: new Date().toISOString(),
      access_count: 0
    };
  };

  // Calculate progress percentage
  const progressPercentage = ((onboardingFlow.currentStep + 1) / onboardingFlow.totalSteps) * 100;

  if (showCompletion) {
    return <OnboardingComplete clientData={onboardingFlow.formData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Add New Client</h1>
          <p className="text-gray-300">
            Let's set up your client's dashboard and marketing automation
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gray-800/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {currentStepData?.title}
            </h2>
            <div className="flex items-center space-x-2 text-purple-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm">~{currentStepData?.estimatedTime} min</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Step {onboardingFlow.currentStep + 1} of {onboardingFlow.totalSteps}</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
                className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex flex-wrap gap-2">
            {ONBOARDING_STEPS.map((step, index) => {
              const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS];
              const isActive = index === onboardingFlow.currentStep;
              const isCompleted = onboardingFlow.completedSteps.includes(step.id);
              const isClickable = isCompleted || index <= onboardingFlow.currentStep;

              return (
                <motion.button
                  key={step.id}
                  onClick={() => isClickable && handleStepClick(index)}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : isCompleted
                        ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                        : isClickable
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="hidden md:inline">{step.title}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={onboardingFlow.currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800/50 rounded-2xl p-8 mb-8"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {currentStepData?.title}
            </h3>
            <p className="text-gray-400">
              {currentStepData?.description}
            </p>
          </div>

          {/* Error Display */}
          {onboardingFlow.errors[currentStepData?.id] && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-lg"
            >
              <p className="text-red-300">
                {onboardingFlow.errors[currentStepData?.id]}
              </p>
            </motion.div>
          )}

          {/* Render Current Step Component */}
          {CurrentStepComponent && (
            <CurrentStepComponent
              formData={onboardingFlow.formData}
              onUpdate={handleUpdateFormData}
              onNext={handleNext}
              onPrevious={handlePrevious}
              errors={onboardingFlow.errors}
              isLoading={onboardingFlow.isLoading}
            />
          )}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={handlePrevious}
            disabled={onboardingFlow.currentStep === 0}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-xl font-medium
              transition-all duration-200 ${
                onboardingFlow.currentStep === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }
            `}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={onboardingFlow.isLoading || !validateCurrentStep()}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-xl font-medium
              transition-all duration-200 ${
                onboardingFlow.isLoading || !validateCurrentStep()
                  ? 'bg-purple-600/50 text-purple-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }
            `}
          >
            <span>
              {onboardingFlow.currentStep === ONBOARDING_STEPS.length - 1
                ? 'Complete Setup'
                : 'Next'
              }
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AddClientPage;