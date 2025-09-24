import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Mail, Key, Server, Shield, CheckCircle, AlertCircle,
  Zap, Globe, Database, Link, Eye, EyeOff, Save, TestTube, Plus, X
} from 'lucide-react';

interface ESPProvider {
  id: string;
  name: string;
  logo: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  features: string[];
  credentials?: {
    apiKey?: string;
    domain?: string;
    region?: string;
    webhookUrl?: string;
  };
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
    currentUsage: number;
  };
  testStatus?: 'pending' | 'success' | 'failed';
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  secret?: string;
  lastTriggered?: string;
}

const ESPConfigurationPanel: React.FC = () => {
  const [providers, setProviders] = useState<ESPProvider[]>([
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      logo: '🐵',
      status: 'connected',
      description: 'All-in-one marketing platform for growing businesses',
      features: ['Automation', 'A/B Testing', 'Landing Pages', 'Reports'],
      credentials: {
        apiKey: 'mc_***************************',
        region: 'us19'
      },
      limits: {
        dailyLimit: 10000,
        monthlyLimit: 50000,
        currentUsage: 2450
      }
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      logo: '📧',
      status: 'disconnected',
      description: 'Cloud-based email delivery service',
      features: ['Transactional Email', 'Marketing Campaigns', 'Email API', 'Analytics'],
      limits: {
        dailyLimit: 100,
        monthlyLimit: 40000,
        currentUsage: 0
      }
    },
    {
      id: 'mailgun',
      name: 'Mailgun',
      logo: '🔫',
      status: 'error',
      description: 'Email automation service built for developers',
      features: ['Email API', 'Email Validation', 'Webhooks', 'Logs'],
      credentials: {
        apiKey: 'mg_***************************',
        domain: 'sandbox123.mailgun.org'
      },
      limits: {
        dailyLimit: 300,
        monthlyLimit: 10000,
        currentUsage: 125
      }
    },
    {
      id: 'aws-ses',
      name: 'Amazon SES',
      logo: '☁️',
      status: 'disconnected',
      description: 'Scalable email sending service',
      features: ['High Deliverability', 'Cost Effective', 'Scalable', 'Flexible'],
      limits: {
        dailyLimit: 200,
        monthlyLimit: 62000,
        currentUsage: 0
      }
    }
  ]);

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Email Opened Webhook',
      url: 'https://api.mydomain.com/webhooks/email/opened',
      events: ['email.opened', 'email.clicked'],
      status: 'active',
      secret: 'whsec_***************************',
      lastTriggered: '2024-09-24 10:30:00'
    },
    {
      id: '2',
      name: 'Subscription Webhook',
      url: 'https://api.mydomain.com/webhooks/subscription',
      events: ['subscriber.added', 'subscriber.unsubscribed'],
      status: 'active',
      secret: 'whsec_***************************',
      lastTriggered: '2024-09-24 09:15:00'
    },
    {
      id: '3',
      name: 'N8N Integration Webhook',
      url: 'https://n8n.webhook.url/email-events',
      events: ['campaign.sent', 'email.bounced', 'email.delivered'],
      status: 'inactive',
      lastTriggered: '2024-09-20 14:22:00'
    }
  ]);

  const [selectedProvider, setSelectedProvider] = useState<ESPProvider | null>(null);
  const [showCredentials, setShowCredentials] = useState<{ [key: string]: boolean }>({});
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [isTestingProvider, setIsTestingProvider] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'providers' | 'webhooks' | 'settings'>('providers');

  const availableEvents = [
    'email.sent', 'email.delivered', 'email.opened', 'email.clicked',
    'email.bounced', 'email.complained', 'subscriber.added', 'subscriber.unsubscribed',
    'campaign.sent', 'automation.triggered', 'list.updated'
  ];

  const toggleCredentialVisibility = (providerId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const testProvider = async (providerId: string) => {
    setIsTestingProvider(providerId);

    setTimeout(() => {
      setProviders(prev => prev.map(provider =>
        provider.id === providerId
          ? { ...provider, testStatus: Math.random() > 0.5 ? 'success' : 'failed' }
          : provider
      ));
      setIsTestingProvider(null);
    }, 2000);
  };

  const connectProvider = (providerId: string) => {
    setProviders(prev => prev.map(provider =>
      provider.id === providerId
        ? { ...provider, status: 'connected' }
        : provider
    ));
  };

  const disconnectProvider = (providerId: string) => {
    setProviders(prev => prev.map(provider =>
      provider.id === providerId
        ? { ...provider, status: 'disconnected', testStatus: undefined }
        : provider
    ));
  };

  const toggleWebhookStatus = (webhookId: string) => {
    setWebhooks(prev => prev.map(webhook =>
      webhook.id === webhookId
        ? { ...webhook, status: webhook.status === 'active' ? 'inactive' : 'active' }
        : webhook
    ));
  };

  const deleteWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
  };

  const renderProviderCard = (provider: ESPProvider) => (
    <motion.div
      key={provider.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{provider.logo}</div>
          <div>
            <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
            <p className="text-sm text-gray-400">{provider.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
            provider.status === 'connected' ? 'bg-green-900 text-green-300' :
            provider.status === 'error' ? 'bg-red-900 text-red-300' :
            'bg-gray-900 text-gray-300'
          }`}>
            {provider.status === 'connected' ? <CheckCircle className="w-3 h-3" /> :
             provider.status === 'error' ? <AlertCircle className="w-3 h-3" /> :
             <Server className="w-3 h-3" />}
            <span className="capitalize">{provider.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-sm text-gray-400 mb-1">Daily Usage</div>
          <div className="text-white font-medium">{provider.limits.currentUsage.toLocaleString()} / {provider.limits.dailyLimit.toLocaleString()}</div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${Math.min((provider.limits.currentUsage / provider.limits.dailyLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-sm text-gray-400 mb-1">Monthly Limit</div>
          <div className="text-white font-medium">{provider.limits.monthlyLimit.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {provider.features.map((feature, index) => (
          <span key={index} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
            {feature}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex space-x-2">
          {provider.status === 'connected' ? (
            <>
              <button
                onClick={() => testProvider(provider.id)}
                disabled={isTestingProvider === provider.id}
                className="px-3 py-2 bg-green-900 hover:bg-green-800 text-green-300 rounded-lg text-sm flex items-center space-x-1 transition-colors disabled:opacity-50"
              >
                <TestTube className={`w-4 h-4 ${isTestingProvider === provider.id ? 'animate-pulse' : ''}`} />
                <span>{isTestingProvider === provider.id ? 'Testing...' : 'Test'}</span>
              </button>
              <button
                onClick={() => disconnectProvider(provider.id)}
                className="px-3 py-2 bg-red-900 hover:bg-red-800 text-red-300 rounded-lg text-sm transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={() => setSelectedProvider(provider)}
              className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-blue-300 rounded-lg text-sm transition-colors"
            >
              Configure
            </button>
          )}
        </div>

        <button
          onClick={() => setSelectedProvider(provider)}
          className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {provider.testStatus && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`mt-4 p-3 rounded-lg border ${
            provider.testStatus === 'success'
              ? 'bg-green-900/20 border-green-700 text-green-300'
              : 'bg-red-900/20 border-red-700 text-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {provider.testStatus === 'success' ?
              <CheckCircle className="w-4 h-4" /> :
              <AlertCircle className="w-4 h-4" />
            }
            <span className="text-sm font-medium">
              {provider.testStatus === 'success' ? 'Connection test successful' : 'Connection test failed'}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const renderWebhookCard = (webhook: WebhookConfig) => (
    <motion.div
      key={webhook.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{webhook.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              webhook.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-900 text-gray-300'
            }`}>
              {webhook.status}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-3 font-mono">{webhook.url}</p>
          {webhook.lastTriggered && (
            <p className="text-xs text-gray-500">Last triggered: {webhook.lastTriggered}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleWebhookStatus(webhook.id)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              webhook.status === 'active'
                ? 'bg-red-900 hover:bg-red-800 text-red-300'
                : 'bg-green-900 hover:bg-green-800 text-green-300'
            }`}
          >
            {webhook.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => deleteWebhook(webhook.id)}
            className="p-2 bg-red-900 hover:bg-red-800 text-red-300 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <div className="flex flex-wrap gap-2">
          {webhook.events.map((event, index) => (
            <span key={index} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
              {event}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">ESP Configuration</h2>
          <p className="text-gray-400 mt-2">Manage email service providers and integrations</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {[
              { key: 'providers', label: 'Providers', icon: Server },
              { key: 'webhooks', label: 'Webhooks', icon: Link },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                  selectedTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {selectedTab === 'webhooks' && (
            <button
              onClick={() => setShowWebhookForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Webhook</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {selectedTab === 'providers' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {providers.map(renderProviderCard)}
            </div>
          )}

          {selectedTab === 'webhooks' && (
            <div className="space-y-4">
              {webhooks.map(renderWebhookCard)}
            </div>
          )}

          {selectedTab === 'settings' && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Global Settings</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Sender Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Your Company"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Reply-To Email
                    </label>
                    <input
                      type="email"
                      defaultValue="noreply@yourcompany.com"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-md font-medium text-white mb-4">Email Tracking</h4>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3 rounded" />
                      <span className="text-gray-300">Track email opens</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3 rounded" />
                      <span className="text-gray-300">Track link clicks</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3 rounded" />
                      <span className="text-gray-300">Enable unsubscribe tracking</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-700">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center space-x-2 transition-colors">
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProvider(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Configure {selectedProvider.name}</h2>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showCredentials[selectedProvider.id] ? 'text' : 'password'}
                      placeholder="Enter API key..."
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white pr-12 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => toggleCredentialVisibility(selectedProvider.id)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showCredentials[selectedProvider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {selectedProvider.id === 'mailgun' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Domain
                    </label>
                    <input
                      type="text"
                      placeholder="your-domain.mailgun.org"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {selectedProvider.id === 'mailchimp' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Server Region
                    </label>
                    <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                      <option value="us1">US East (us1)</option>
                      <option value="us19">US Central (us19)</option>
                      <option value="eu1">Europe (eu1)</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      connectProvider(selectedProvider.id);
                      setSelectedProvider(null);
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ESPConfigurationPanel;