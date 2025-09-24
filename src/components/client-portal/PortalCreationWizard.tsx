// Portal Creation Wizard - Step-by-step portal creation interface

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Globe,
  Palette,
  Settings,
  Users,
  Eye,
  Upload,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useClientPortalStore } from '../../stores/clientPortalStore';
import { useAgencyStore } from '../../stores/agencyStore';
import { ClientPortal, PortalWidgetType, ClientPortalTemplate } from '../../types/clientPortal';
import { ClientPortalService } from '../../services/clientPortalService';

interface PortalCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WizardData {
  // Step 1: Basic Info
  clientId: string;
  portalName: string;
  subdomain: string;
  customDomain?: string;
  
  // Step 2: Branding
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  companyTagline?: string;
  
  // Step 3: Features
  enabledWidgets: PortalWidgetType[];
  allowCustomization: boolean;
  enableDownloads: boolean;
  
  // Step 4: Access
  authMethod: 'email_link' | 'password';
  requireTwoFA: boolean;
  sessionTimeout: number;
}

const PortalCreationWizard: React.FC<PortalCreationWizardProps> = ({
  isOpen,
  onClose
}) => {
  const { clients } = useAgencyStore();
  const { 
    createPortal, 
    isCreatingPortal, 
    portalTemplates,
    loadPortalTemplates 
  } = useClientPortalStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ClientPortalTemplate | null>(null);
  const [wizardData, setWizardData] = useState<WizardData>({
    clientId: '',
    portalName: '',
    subdomain: '',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    enabledWidgets: ['overview_stats', 'seo_rankings', 'website_traffic'],
    allowCustomization: true,
    enableDownloads: true,
    authMethod: 'email_link',
    requireTwoFA: false,
    sessionTimeout: 480
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadPortalTemplates();
      setCurrentStep(1);
      setErrors({});
    }
  }, [isOpen]);

  const availableWidgets: { type: PortalWidgetType; label: string; description: string }[] = [
    { type: 'overview_stats', label: 'Overview Stats', description: 'Key performance metrics' },
    { type: 'seo_rankings', label: 'SEO Rankings', description: 'Keyword position tracking' },
    { type: 'website_traffic', label: 'Website Traffic', description: 'Visitor analytics' },
    { type: 'keyword_performance', label: 'Keyword Performance', description: 'Keyword insights' },
    { type: 'backlink_growth', label: 'Backlink Growth', description: 'Link building progress' },
    { type: 'social_media_metrics', label: 'Social Media', description: 'Social performance' },
    { type: 'content_performance', label: 'Content Performance', description: 'Content analytics' },
    { type: 'competitor_analysis', label: 'Competitor Analysis', description: 'Competitive insights' },
    { type: 'goals_progress', label: 'Goals Progress', description: 'Target achievement' }
  ];

  const generateSubdomain = (name: string) => {
    return ClientPortalService.generateSubdomain(name);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!wizardData.clientId) newErrors.clientId = 'Please select a client';
        if (!wizardData.portalName) newErrors.portalName = 'Portal name is required';
        if (!wizardData.subdomain) newErrors.subdomain = 'Subdomain is required';
        if (wizardData.customDomain && !ClientPortalService.validateCustomDomain(wizardData.customDomain)) {
          newErrors.customDomain = 'Invalid domain format';
        }
        break;
      
      case 2:
        if (!wizardData.primaryColor) newErrors.primaryColor = 'Primary color is required';
        if (!wizardData.secondaryColor) newErrors.secondaryColor = 'Secondary color is required';
        break;
      
      case 3:
        if (wizardData.enabledWidgets.length === 0) {
          newErrors.enabledWidgets = 'Select at least one widget';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    const portalConfig: Partial<ClientPortal> = {
      subdomain: wizardData.subdomain,
      custom_domain: wizardData.customDomain,
      is_active: true,
      branding: {
        company_name: wizardData.portalName,
        company_tagline: wizardData.companyTagline,
        logo_url: wizardData.logo,
        social_links: {}
      },
      theme: {
        primary_color: wizardData.primaryColor,
        secondary_color: wizardData.secondaryColor,
        accent_color: '#06b6d4',
        background_type: 'solid',
        background_value: '#f8fafc',
        font_family: 'inter',
        layout_style: 'modern',
        sidebar_style: 'dark'
      },
      access_settings: {
        auth_method: wizardData.authMethod,
        require_2fa: wizardData.requireTwoFA,
        session_timeout: wizardData.sessionTimeout,
        max_concurrent_sessions: 3,
        allow_downloads: wizardData.enableDownloads,
        watermark_downloads: false
      },
      dashboard_config: {
        enabled_widgets: wizardData.enabledWidgets,
        widget_settings: {},
        default_layout: {
          grid_size: { columns: 12, rows: 8 },
          widget_positions: {},
          sidebar_collapsed: false
        },
        allow_customization: wizardData.allowCustomization,
        data_refresh_interval: 60,
        historical_data_range: 90,
        available_exports: ['pdf', 'csv']
      },
      communication_settings: {
        email_notifications: true,
        notification_frequency: 'weekly',
        enable_chat: false,
        show_announcements: true,
        show_changelog: false,
        support_widget_enabled: true,
        support_widget_position: 'bottom_right'
      }
    };

    // Apply template if selected
    if (selectedTemplate) {
      portalConfig.theme = { ...portalConfig.theme, ...selectedTemplate.theme };
      portalConfig.dashboard_config = {
        ...portalConfig.dashboard_config!,
        ...selectedTemplate.dashboard_config
      };
    }

    const success = await createPortal(wizardData.clientId, portalConfig);
    
    if (success) {
      onClose();
      setCurrentStep(1);
      setWizardData({
        clientId: '',
        portalName: '',
        subdomain: '',
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        enabledWidgets: ['overview_stats', 'seo_rankings', 'website_traffic'],
        allowCustomization: true,
        enableDownloads: true,
        authMethod: 'email_link',
        requireTwoFA: false,
        sessionTimeout: 480
      });
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information', icon: <Globe className="w-5 h-5" /> },
    { number: 2, title: 'Branding & Theme', icon: <Palette className="w-5 h-5" /> },
    { number: 3, title: 'Features & Widgets', icon: <Settings className="w-5 h-5" /> },
    { number: 4, title: 'Access & Security', icon: <Users className="w-5 h-5" /> }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderBrandingTheme();
      case 3:
        return renderFeaturesWidgets();
      case 4:
        return renderAccessSecurity();
      default:
        return null;
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Basic Information</h3>
        
        <div className="space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Client *
            </label>
            <select
              value={wizardData.clientId}
              onChange={(e) => setWizardData(prev => ({ ...prev, clientId: e.target.value }))}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.clientId ? 'border-red-500' : 'border-gray-600'
              }`}
            >
              <option value="">Choose a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="mt-1 text-sm text-red-400">{errors.clientId}</p>
            )}
          </div>

          {/* Portal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Portal Name *
            </label>
            <input
              type="text"
              value={wizardData.portalName}
              onChange={(e) => {
                const value = e.target.value;
                setWizardData(prev => ({
                  ...prev,
                  portalName: value,
                  subdomain: generateSubdomain(value)
                }));
              }}
              placeholder="Enter portal name"
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.portalName ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.portalName && (
              <p className="mt-1 text-sm text-red-400">{errors.portalName}</p>
            )}
          </div>

          {/* Subdomain */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subdomain *
            </label>
            <div className="flex">
              <input
                type="text"
                value={wizardData.subdomain}
                onChange={(e) => setWizardData(prev => ({ ...prev, subdomain: e.target.value }))}
                placeholder="client-name"
                className={`flex-1 px-3 py-2 bg-gray-700 border rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.subdomain ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              <div className="px-3 py-2 bg-gray-600 border border-l-0 border-gray-600 rounded-r-lg text-gray-300">
                .youragency.com
              </div>
            </div>
            {errors.subdomain && (
              <p className="mt-1 text-sm text-red-400">{errors.subdomain}</p>
            )}
          </div>

          {/* Custom Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Domain (Optional)
            </label>
            <input
              type="text"
              value={wizardData.customDomain || ''}
              onChange={(e) => setWizardData(prev => ({ ...prev, customDomain: e.target.value }))}
              placeholder="reports.clientdomain.com"
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.customDomain ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.customDomain && (
              <p className="mt-1 text-sm text-red-400">{errors.customDomain}</p>
            )}
            <p className="mt-1 text-sm text-gray-400">
              You can set up a custom domain later in DNS settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBrandingTheme = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Branding & Theme</h3>
        
        {/* Templates */}
        {portalTemplates.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Choose a Template (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portalTemplates.slice(0, 4).map(template => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{template.name}</h4>
                    {selectedTemplate?.id === template.id && (
                      <Check className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: template.theme.primary_color }}
                    ></div>
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: template.theme.secondary_color }}
                    ></div>
                    <span className="text-xs text-gray-400 capitalize">
                      {template.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG up to 2MB
              </p>
            </div>
          </div>

          {/* Company Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Tagline (Optional)
            </label>
            <input
              type="text"
              value={wizardData.companyTagline || ''}
              onChange={(e) => setWizardData(prev => ({ ...prev, companyTagline: e.target.value }))}
              placeholder="Your Marketing Performance Dashboard"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Color Scheme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Primary Color *
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={wizardData.primaryColor}
                onChange={(e) => setWizardData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-10 rounded border border-gray-600"
              />
              <input
                type="text"
                value={wizardData.primaryColor}
                onChange={(e) => setWizardData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Secondary Color *
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={wizardData.secondaryColor}
                onChange={(e) => setWizardData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-12 h-10 rounded border border-gray-600"
              />
              <input
                type="text"
                value={wizardData.secondaryColor}
                onChange={(e) => setWizardData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Preview
          </label>
          <div 
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: `${wizardData.primaryColor}10`,
              borderColor: wizardData.primaryColor + '30'
            }}
          >
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: wizardData.primaryColor }}
              >
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  {wizardData.portalName || 'Portal Name'}
                </h4>
                <p className="text-sm text-gray-400">
                  {wizardData.companyTagline || 'Company tagline will appear here'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturesWidgets = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Features & Widgets</h3>
        
        <div className="space-y-6">
          {/* Widget Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Enable Widgets *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableWidgets.map(widget => (
                <div
                  key={widget.type}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    wizardData.enabledWidgets.includes(widget.type)
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => {
                    setWizardData(prev => ({
                      ...prev,
                      enabledWidgets: prev.enabledWidgets.includes(widget.type)
                        ? prev.enabledWidgets.filter(w => w !== widget.type)
                        : [...prev.enabledWidgets, widget.type]
                    }));
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{widget.label}</h4>
                      <p className="text-sm text-gray-400">{widget.description}</p>
                    </div>
                    {wizardData.enabledWidgets.includes(widget.type) && (
                      <Check className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.enabledWidgets && (
              <p className="mt-1 text-sm text-red-400">{errors.enabledWidgets}</p>
            )}
          </div>

          {/* Feature Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Allow Customization</h4>
                <p className="text-sm text-gray-400">
                  Let clients customize their dashboard layout
                </p>
              </div>
              <input
                type="checkbox"
                checked={wizardData.allowCustomization}
                onChange={(e) => setWizardData(prev => ({ ...prev, allowCustomization: e.target.checked }))}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Enable Downloads</h4>
                <p className="text-sm text-gray-400">
                  Allow clients to download reports and data
                </p>
              </div>
              <input
                type="checkbox"
                checked={wizardData.enableDownloads}
                onChange={(e) => setWizardData(prev => ({ ...prev, enableDownloads: e.target.checked }))}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccessSecurity = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Access & Security</h3>
        
        <div className="space-y-6">
          {/* Authentication Method */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Authentication Method
            </label>
            <div className="space-y-3">
              <div
                onClick={() => setWizardData(prev => ({ ...prev, authMethod: 'email_link' }))}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  wizardData.authMethod === 'email_link'
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Email Link</h4>
                    <p className="text-sm text-gray-400">
                      Send secure login links via email
                    </p>
                  </div>
                  {wizardData.authMethod === 'email_link' && (
                    <Check className="w-5 h-5 text-purple-400" />
                  )}
                </div>
              </div>

              <div
                onClick={() => setWizardData(prev => ({ ...prev, authMethod: 'password' }))}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  wizardData.authMethod === 'password'
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Password</h4>
                    <p className="text-sm text-gray-400">
                      Traditional username and password login
                    </p>
                  </div>
                  {wizardData.authMethod === 'password' && (
                    <Check className="w-5 h-5 text-purple-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Require Two-Factor Authentication</h4>
                <p className="text-sm text-gray-400">
                  Add an extra layer of security
                </p>
              </div>
              <input
                type="checkbox"
                checked={wizardData.requireTwoFA}
                onChange={(e) => setWizardData(prev => ({ ...prev, requireTwoFA: e.target.checked }))}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Session Timeout */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={wizardData.sessionTimeout}
              onChange={(e) => setWizardData(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={60}>1 hour</option>
              <option value={240}>4 hours</option>
              <option value={480}>8 hours</option>
              <option value={1440}>24 hours</option>
            </select>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h4 className="font-medium text-white mb-3">Portal Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Client:</span>
                <span className="text-white">
                  {clients.find(c => c.id === wizardData.clientId)?.name || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Portal Name:</span>
                <span className="text-white">{wizardData.portalName || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">URL:</span>
                <span className="text-white">
                  {wizardData.customDomain || `${wizardData.subdomain}.youragency.com` || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Widgets:</span>
                <span className="text-white">{wizardData.enabledWidgets.length} selected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Authentication:</span>
                <span className="text-white capitalize">{wizardData.authMethod.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">Create Client Portal</h2>
                <p className="text-gray-400">Set up a new white-label dashboard for your client</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-4 bg-gray-800/50">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        currentStep === step.number
                          ? 'bg-purple-600 text-white'
                          : currentStep > step.number
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {currentStep > step.number ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="hidden md:block">
                        <div className={`font-medium ${
                          currentStep >= step.number ? 'text-white' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                        currentStep > step.number ? 'bg-green-600' : 'bg-gray-700'
                      }`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              {renderStep()}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isCreatingPortal}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isCreatingPortal ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Create Portal</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PortalCreationWizard;