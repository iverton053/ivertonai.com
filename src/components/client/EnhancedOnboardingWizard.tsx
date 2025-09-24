import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, ArrowRight, ArrowLeft, Building, User, Settings, 
  Palette, Link, Target, Users, Mail, Globe, Zap, Clock,
  ChevronDown, Upload, FileText, Sparkles, Shield, Heart,
  ExternalLink, Plus, Minus, AlertTriangle, CheckCircle2,
  Rocket, Briefcase, MessageSquare
} from 'lucide-react';
import { useComprehensiveClientStore } from '../../stores/comprehensiveClientStore';

interface EnhancedOnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  required: boolean;
  completed: boolean;
  automatable: boolean;
  estimatedTime: number; // in minutes
  benefits: string[];
}

interface OnboardingFormData {
  basicInfo: {
    companySize: string;
    industry: string;
    primaryGoals: string[];
    budget: string;
    timeline: string;
  };
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    fonts: string[];
    brandVoice: string;
  };
  integrations: {
    socialPlatforms: { platform: string; connected: boolean; accountId?: string }[];
    emailPlatform: string;
    analytics: string[];
    crmSystem: string;
  };
  teamSetup: {
    teamSize: number;
    roles: { name: string; permissions: string[] }[];
    assignedMembers: { roleId: string; userId: string }[];
  };
  templates: {
    selectedTemplates: string[];
    customizations: Record<string, any>;
  };
}

const EnhancedOnboardingWizard: React.FC = () => {
  const {
    showOnboardingWizard,
    setShowOnboardingWizard,
    selectedClient,
  } = useComprehensiveClientStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>({
    basicInfo: {
      companySize: '',
      industry: '',
      primaryGoals: [],
      budget: '',
      timeline: ''
    },
    branding: {
      logo: '',
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      fonts: [],
      brandVoice: ''
    },
    integrations: {
      socialPlatforms: [
        { platform: 'Facebook', connected: false },
        { platform: 'Instagram', connected: false },
        { platform: 'Twitter', connected: false },
        { platform: 'LinkedIn', connected: false },
        { platform: 'TikTok', connected: false }
      ],
      emailPlatform: '',
      analytics: [],
      crmSystem: ''
    },
    teamSetup: {
      teamSize: 1,
      roles: [],
      assignedMembers: []
    },
    templates: {
      selectedTemplates: [],
      customizations: {}
    }
  });

  const [isAutomating, setIsAutomating] = useState(false);
  const [automationProgress, setAutomationProgress] = useState(0);
  const [automationStep, setAutomationStep] = useState('');

  const enhancedSteps: EnhancedOnboardingStep[] = [
    {
      id: 'company_profile',
      title: 'Company Profile',
      description: 'Tell us about your business to customize your experience',
      icon: Building,
      required: true,
      completed: false,
      automatable: false,
      estimatedTime: 3,
      benefits: ['Personalized dashboard', 'Industry-specific insights', 'Targeted recommendations']
    },
    {
      id: 'brand_identity',
      title: 'Brand Identity',
      description: 'Upload your brand assets and set your visual identity',
      icon: Palette,
      required: true,
      completed: false,
      automatable: true,
      estimatedTime: 2,
      benefits: ['Auto-branded materials', 'Consistent client portals', 'Professional templates']
    },
    {
      id: 'platform_integrations',
      title: 'Platform Connections',
      description: 'Connect your social media, email, and analytics platforms',
      icon: Link,
      required: false,
      completed: false,
      automatable: true,
      estimatedTime: 5,
      benefits: ['Automated data sync', 'Cross-platform insights', 'Unified reporting']
    },
    {
      id: 'team_assignment',
      title: 'Team Setup',
      description: 'Assign team members and define roles automatically',
      icon: Users,
      required: false,
      completed: false,
      automatable: true,
      estimatedTime: 2,
      benefits: ['Clear responsibilities', 'Automated workflows', 'Permission management']
    },
    {
      id: 'template_generation',
      title: 'Template Library',
      description: 'Generate industry-specific campaign templates',
      icon: FileText,
      required: false,
      completed: false,
      automatable: true,
      estimatedTime: 1,
      benefits: ['Ready-to-use campaigns', 'Best practice templates', 'Faster launches']
    },
    {
      id: 'portal_creation',
      title: 'Client Portal',
      description: 'Auto-create a branded client portal with custom domain',
      icon: Globe,
      required: true,
      completed: false,
      automatable: true,
      estimatedTime: 1,
      benefits: ['Professional client experience', 'Branded interface', 'Direct client access']
    },
    {
      id: 'welcome_sequence',
      title: 'Welcome Automation',
      description: 'Set up automated welcome emails and next steps',
      icon: Mail,
      required: false,
      completed: false,
      automatable: true,
      estimatedTime: 1,
      benefits: ['Automated onboarding', 'Professional communication', 'Reduced manual work']
    }
  ];

  const currentStep = enhancedSteps[currentStepIndex];

  // Auto-save form data
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem(`onboarding_${selectedClient?.id}`, JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(saveTimer);
  }, [formData, selectedClient?.id]);

  // Load saved data
  useEffect(() => {
    if (selectedClient?.id) {
      const saved = localStorage.getItem(`onboarding_${selectedClient.id}`);
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    }
  }, [selectedClient?.id]);

  const handleNext = () => {
    if (currentStepIndex < enhancedSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleAutomate = async () => {
    setIsAutomating(true);
    setAutomationProgress(0);

    const automationSteps = [
      'Creating branded portal...',
      'Setting up integrations...',
      'Generating templates...',
      'Configuring team access...',
      'Setting up automation rules...',
      'Sending welcome emails...',
      'Finalizing setup...'
    ];

    for (let i = 0; i < automationSteps.length; i++) {
      setAutomationStep(automationSteps[i]);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate work
      setAutomationProgress(((i + 1) / automationSteps.length) * 100);
    }

    // Complete all automatable steps
    enhancedSteps.forEach((step, index) => {
      if (step.automatable) {
        enhancedSteps[index].completed = true;
      }
    });

    setIsAutomating(false);
    setCurrentStepIndex(enhancedSteps.length - 1); // Go to final step
  };

  const CompanyProfileStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Company Size</label>
          <select 
            value={formData.basicInfo.companySize}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              basicInfo: { ...prev.basicInfo, companySize: e.target.value }
            }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201+">201+ employees</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
          <select 
            value={formData.basicInfo.industry}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              basicInfo: { ...prev.basicInfo, industry: e.target.value }
            }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select industry</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="retail">Retail</option>
            <option value="education">Education</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Primary Goals</label>
        <div className="grid grid-cols-2 gap-2">
          {['Brand Awareness', 'Lead Generation', 'Sales Growth', 'Customer Retention', 'Market Expansion', 'Cost Reduction'].map(goal => (
            <label key={goal} className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.basicInfo.primaryGoals.includes(goal)}
                onChange={(e) => {
                  const goals = formData.basicInfo.primaryGoals;
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, primaryGoals: [...goals, goal] }
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, primaryGoals: goals.filter(g => g !== goal) }
                    }));
                  }
                }}
                className="text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">{goal}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const BrandIdentityStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-white font-medium">Auto-Brand Generation</p>
            <p className="text-gray-400 text-sm">Upload your logo and we'll extract colors and create templates</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Auto-Generate
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Logo Upload</label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Drop your logo here or click to upload</p>
            <p className="text-gray-500 text-xs mt-1">PNG, JPG, SVG up to 5MB</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.branding.primaryColor}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  branding: { ...prev.branding, primaryColor: e.target.value }
                }))}
                className="w-10 h-10 rounded border-2 border-gray-600"
              />
              <input
                type="text"
                value={formData.branding.primaryColor}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  branding: { ...prev.branding, primaryColor: e.target.value }
                }))}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.branding.secondaryColor}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  branding: { ...prev.branding, secondaryColor: e.target.value }
                }))}
                className="w-10 h-10 rounded border-2 border-gray-600"
              />
              <input
                type="text"
                value={formData.branding.secondaryColor}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  branding: { ...prev.branding, secondaryColor: e.target.value }
                }))}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const IntegrationsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Social Media Platforms</h4>
          <div className="space-y-2">
            {formData.integrations.socialPlatforms.map((platform, index) => (
              <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    platform.connected ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    <Link className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white">{platform.platform}</span>
                </div>
                <button
                  onClick={() => {
                    const newPlatforms = [...formData.integrations.socialPlatforms];
                    newPlatforms[index].connected = !newPlatforms[index].connected;
                    setFormData(prev => ({
                      ...prev,
                      integrations: { ...prev.integrations, socialPlatforms: newPlatforms }
                    }));
                  }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    platform.connected 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {platform.connected ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Business Tools</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Platform</label>
              <select 
                value={formData.integrations.emailPlatform}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  integrations: { ...prev.integrations, emailPlatform: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select platform</option>
                <option value="mailchimp">Mailchimp</option>
                <option value="hubspot">HubSpot</option>
                <option value="constantcontact">Constant Contact</option>
                <option value="sendgrid">SendGrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CRM System</label>
              <select 
                value={formData.integrations.crmSystem}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  integrations: { ...prev.integrations, crmSystem: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select CRM</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot CRM</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="zoho">Zoho CRM</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AutomationStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
        <Zap className="w-8 h-8 text-white" />
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold text-white mb-2">Ready for Automation Magic? ✨</h3>
        <p className="text-gray-400 max-w-2xl mx-auto">
          We can automatically complete the remaining setup steps in under 30 seconds. This includes:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {[
          { icon: Globe, title: 'Create Branded Portal', desc: 'Auto-generate client portal with your branding' },
          { icon: FileText, title: 'Generate Templates', desc: 'Industry-specific campaign templates ready to use' },
          { icon: Users, title: 'Setup Team Access', desc: 'Assign roles and permissions automatically' },
          { icon: Mail, title: 'Welcome Sequence', desc: 'Send automated welcome emails to your team' }
        ].map((item, index) => (
          <div key={index} className="p-4 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg">
            <item.icon className="w-6 h-6 text-purple-400 mb-2" />
            <h4 className="text-white font-medium mb-1">{item.title}</h4>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      {isAutomating ? (
        <div className="space-y-4">
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${automationProgress}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
            />
          </div>
          <p className="text-purple-400 font-medium">{automationStep}</p>
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full"
            />
            <span className="text-gray-400">Processing...</span>
          </div>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAutomate}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
        >
          <Rocket className="w-5 h-5" />
          <span>Start Automation (30 seconds)</span>
        </motion.button>
      )}
    </div>
  );

  const CompletionStep = () => (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle2 className="w-10 h-10 text-white" />
      </motion.div>

      <div>
        <h3 className="text-3xl font-semibold text-white mb-2">🎉 Welcome to Your New Dashboard!</h3>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Your client setup is complete! Everything has been configured and your team has been notified.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="p-4 bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-lg">
          <Shield className="w-8 h-8 text-green-400 mb-2 mx-auto" />
          <h4 className="text-white font-medium mb-1">Portal Created</h4>
          <p className="text-gray-400 text-sm">Client portal is live with your branding</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-lg">
          <Link className="w-8 h-8 text-blue-400 mb-2 mx-auto" />
          <h4 className="text-white font-medium mb-1">Integrations Ready</h4>
          <p className="text-gray-400 text-sm">All platforms connected and syncing</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-lg">
          <Heart className="w-8 h-8 text-purple-400 mb-2 mx-auto" />
          <h4 className="text-white font-medium mb-1">Team Notified</h4>
          <p className="text-gray-400 text-sm">Welcome emails sent to all members</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-3">🚀 Next Steps</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Schedule first campaign review</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Set up performance tracking</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Configure automated reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Launch first marketing campaign</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'company_profile': return <CompanyProfileStep />;
      case 'brand_identity': return <BrandIdentityStep />;
      case 'platform_integrations': return <IntegrationsStep />;
      case 'team_assignment':
      case 'template_generation':
      case 'portal_creation': return <AutomationStep />;
      case 'welcome_sequence': return <CompletionStep />;
      default: return <div>Step not found</div>;
    }
  };

  if (!showOnboardingWizard || !selectedClient) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl max-h-[95vh] bg-gray-900 border border-gray-600 rounded-2xl shadow-2xl z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <currentStep.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Client Onboarding - {selectedClient.name}
              </h2>
              <p className="text-gray-400">
                {currentStep.title} • {currentStep.estimatedTime} min • Step {currentStepIndex + 1} of {enhancedSteps.length}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowOnboardingWizard(false)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Progress: {Math.round(((currentStepIndex + 1) / enhancedSteps.length) * 100)}%
            </span>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Est. {enhancedSteps.slice(currentStepIndex).reduce((sum, step) => sum + step.estimatedTime, 0)} min remaining</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / enhancedSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4 overflow-x-auto">
            {enhancedSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = step.completed;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-2 min-w-0 px-2 ${
                    isActive ? 'text-purple-400' : 
                    isCompleted ? 'text-green-400' : 'text-gray-500'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive ? 'border-purple-400 bg-purple-600/20' :
                    isCompleted ? 'border-green-400 bg-green-600/20' : 'border-gray-600'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs text-center whitespace-nowrap">{step.title}</span>
                  {step.automatable && (
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-yellow-400">Auto</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                {currentStep.title}
              </h3>
              <p className="text-gray-400 mb-4">
                {currentStep.description}
              </p>
              
              {/* Benefits */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {currentStep.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs border border-purple-500/30"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            {renderStepContent()}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            {!currentStep.required && (
              <button
                onClick={handleNext}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Skip
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={isAutomating}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <span>
                {currentStepIndex === enhancedSteps.length - 1 ? 'Complete Setup' : 'Continue'}
              </span>
              {currentStepIndex === enhancedSteps.length - 1 ? (
                <Check className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedOnboardingWizard;