import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Link, Check, ExternalLink, AlertCircle, Zap, 
  Globe, Mail, BarChart3, Users, Shield, Settings,
  Twitter, Facebook, Instagram, Linkedin, Youtube,
  Chrome, Database, Smartphone, Clock
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: 'social' | 'email' | 'analytics' | 'crm' | 'automation';
  icon: React.ComponentType<any>;
  description: string;
  status: 'available' | 'connected' | 'error' | 'pending';
  required: boolean;
  features: string[];
  setupTime: number;
  difficulty: 'easy' | 'medium' | 'advanced';
  apiEndpoint?: string;
  authType: 'oauth' | 'api-key' | 'webhook';
}

interface IntegrationSetupWizardProps {
  clientId: string;
  clientName: string;
  onIntegrationsConfigured: (integrations: Integration[]) => void;
}

const IntegrationSetupWizard: React.FC<IntegrationSetupWizardProps> = ({
  clientId,
  clientName,
  onIntegrationsConfigured
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [connectingIntegration, setConnectingIntegration] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1);
  const [autoSetupEnabled, setAutoSetupEnabled] = useState(true);

  const [integrations, setIntegrations] = useState<Integration[]>([
    // Social Media
    {
      id: 'twitter',
      name: 'Twitter/X',
      category: 'social',
      icon: Twitter,
      description: 'Manage posts, track mentions, and analyze engagement',
      status: 'available',
      required: false,
      features: ['Post scheduling', 'Mention tracking', 'Analytics', 'DM management'],
      setupTime: 2,
      difficulty: 'easy',
      authType: 'oauth'
    },
    {
      id: 'facebook',
      name: 'Facebook Business',
      category: 'social',
      icon: Facebook,
      description: 'Manage pages, ads, and business insights',
      status: 'available',
      required: false,
      features: ['Page management', 'Ad campaigns', 'Insights', 'Messenger'],
      setupTime: 3,
      difficulty: 'medium',
      authType: 'oauth'
    },
    {
      id: 'instagram',
      name: 'Instagram Business',
      category: 'social',
      icon: Instagram,
      description: 'Content publishing and story management',
      status: 'available',
      required: false,
      features: ['Post scheduling', 'Story management', 'Analytics', 'Shopping'],
      setupTime: 2,
      difficulty: 'easy',
      authType: 'oauth'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Company',
      category: 'social',
      icon: Linkedin,
      description: 'Professional networking and B2B marketing',
      status: 'available',
      required: false,
      features: ['Company updates', 'Lead generation', 'Analytics', 'Messaging'],
      setupTime: 3,
      difficulty: 'medium',
      authType: 'oauth'
    },
    {
      id: 'youtube',
      name: 'YouTube Channel',
      category: 'social',
      icon: Youtube,
      description: 'Video content management and analytics',
      status: 'available',
      required: false,
      features: ['Video uploads', 'Analytics', 'Comments', 'Live streaming'],
      setupTime: 4,
      difficulty: 'advanced',
      authType: 'oauth'
    },
    // Email Platforms
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      category: 'email',
      icon: Mail,
      description: 'Email marketing and automation platform',
      status: 'available',
      required: true,
      features: ['Email campaigns', 'Automation', 'Analytics', 'Segmentation'],
      setupTime: 3,
      difficulty: 'easy',
      authType: 'api-key'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      category: 'crm',
      icon: Database,
      description: 'CRM and marketing automation platform',
      status: 'available',
      required: false,
      features: ['Contact management', 'Deal tracking', 'Email sequences', 'Reports'],
      setupTime: 5,
      difficulty: 'advanced',
      authType: 'api-key'
    },
    // Analytics
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      category: 'analytics',
      icon: BarChart3,
      description: 'Website traffic and conversion tracking',
      status: 'available',
      required: true,
      features: ['Traffic analysis', 'Goal tracking', 'E-commerce', 'Custom reports'],
      setupTime: 3,
      difficulty: 'medium',
      authType: 'oauth'
    },
    {
      id: 'google-ads',
      name: 'Google Ads',
      category: 'analytics',
      icon: Chrome,
      description: 'PPC campaign management and tracking',
      status: 'available',
      required: false,
      features: ['Campaign management', 'Keyword tracking', 'Conversion tracking', 'Reports'],
      setupTime: 4,
      difficulty: 'advanced',
      authType: 'oauth'
    },
    // Automation
    {
      id: 'zapier',
      name: 'Zapier',
      category: 'automation',
      icon: Zap,
      description: 'Workflow automation between apps',
      status: 'available',
      required: false,
      features: ['App connections', 'Workflow automation', 'Triggers', 'Actions'],
      setupTime: 2,
      difficulty: 'easy',
      authType: 'webhook'
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Integrations', icon: Globe },
    { id: 'social', name: 'Social Media', icon: Users },
    { id: 'email', name: 'Email Marketing', icon: Mail },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'crm', name: 'CRM & Sales', icon: Database },
    { id: 'automation', name: 'Automation', icon: Zap }
  ];

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  const connectIntegration = async (integration: Integration) => {
    setConnectingIntegration(integration.id);
    setProgress(0);

    // Simulate connection process
    const steps = [
      'Redirecting to authorization...',
      'Authenticating with provider...',
      'Retrieving account information...',
      'Configuring permissions...',
      'Testing connection...',
      'Connection established!'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Update integration status
    setIntegrations(prev => prev.map(item => 
      item.id === integration.id 
        ? { ...item, status: 'connected' as const }
        : item
    ));

    setConnectingIntegration(null);
    setProgress(0);
  };

  const runAutoSetup = async () => {
    if (!autoSetupEnabled) return;

    // Auto-connect required integrations
    const requiredIntegrations = integrations.filter(item => item.required && item.status === 'available');
    
    for (const integration of requiredIntegrations) {
      await connectIntegration(integration);
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <Check className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Link className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: Integration['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 bg-red-400/10';
    }
  };

  const connectedCount = integrations.filter(item => item.status === 'connected').length;
  const requiredCount = integrations.filter(item => item.required).length;
  const connectedRequired = integrations.filter(item => item.required && item.status === 'connected').length;

  useEffect(() => {
    if (connectedRequired === requiredCount && requiredCount > 0) {
      onIntegrationsConfigured(integrations);
    }
  }, [connectedRequired, requiredCount, integrations, onIntegrationsConfigured]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Integration Setup</h3>
        <p className="text-gray-400">
          Connect your marketing tools and platforms to streamline workflows
        </p>
        <div className="flex items-center justify-center space-x-4 mt-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-gray-300">{connectedCount} Connected</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-gray-300">{requiredCount} Required</span>
          </div>
        </div>
      </div>

      {/* Auto Setup Toggle */}
      <div className="p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-purple-400" />
            <div>
              <h4 className="text-white font-medium">Smart Auto-Setup</h4>
              <p className="text-gray-400 text-sm">Automatically configure recommended integrations</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSetupEnabled}
                onChange={(e) => setAutoSetupEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
            </label>
            {autoSetupEnabled && (
              <button
                onClick={runAutoSetup}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                Run Auto-Setup
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map(integration => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 bg-gray-800/50 border rounded-lg hover:bg-gray-700/50 transition-colors relative ${
              integration.required ? 'border-yellow-500/30' : 'border-gray-600'
            }`}
          >
            {integration.required && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-black font-bold">!</span>
              </div>
            )}
            
            <div className="flex items-start space-x-3 mb-3">
              <div className="p-2 bg-gray-700 rounded-lg">
                <integration.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-medium">{integration.name}</h4>
                  <div className={`${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)}
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-1">{integration.description}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Setup time: {integration.setupTime} min</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(integration.difficulty)}`}>
                  {integration.difficulty}
                </span>
              </div>
              
              <div className="space-y-1">
                {integration.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-1 h-1 bg-purple-400 rounded-full" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              {integration.status === 'connected' ? (
                <div className="flex items-center space-x-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Connected</span>
                </div>
              ) : (
                <button
                  onClick={() => connectIntegration(integration)}
                  disabled={connectingIntegration === integration.id}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white text-sm rounded-lg transition-colors flex-1"
                >
                  {connectingIntegration === integration.id ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              )}
              
              {integration.status === 'connected' && (
                <button className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>

            {connectingIntegration === integration.id && (
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress Summary */}
      {connectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">
                {connectedCount} Integration{connectedCount !== 1 ? 's' : ''} Connected
              </h4>
              <p className="text-gray-400">
                {connectedRequired === requiredCount && requiredCount > 0
                  ? 'All required integrations are connected! Your setup is complete.'
                  : `${requiredCount - connectedRequired} required integration${requiredCount - connectedRequired !== 1 ? 's' : ''} remaining.`
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default IntegrationSetupWizard;