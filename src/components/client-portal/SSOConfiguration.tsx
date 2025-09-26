import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Key,
  Globe,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Save,
  TestTube,
  ExternalLink,
  Trash2,
  Plus
} from 'lucide-react';

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth' | 'oidc';
  enabled: boolean;
  config: Record<string, any>;
  metadata?: string;
  created_at: string;
  last_used?: string;
}

interface SSOConfigurationProps {
  portalId: string;
  onClose: () => void;
}

const SSO_PROVIDER_TEMPLATES = {
  azure_ad: {
    name: 'Microsoft Azure AD',
    type: 'saml' as const,
    config: {
      entity_id: '',
      sso_url: '',
      slo_url: '',
      certificate: '',
      attribute_mapping: {
        email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        first_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
        last_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
        display_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      }
    }
  },
  google_workspace: {
    name: 'Google Workspace',
    type: 'oauth' as const,
    config: {
      client_id: '',
      client_secret: '',
      domain: '',
      scope: 'openid email profile'
    }
  },
  okta: {
    name: 'Okta',
    type: 'saml' as const,
    config: {
      entity_id: '',
      sso_url: '',
      certificate: '',
      attribute_mapping: {
        email: 'email',
        first_name: 'firstName',
        last_name: 'lastName',
        display_name: 'displayName'
      }
    }
  },
  generic_saml: {
    name: 'Generic SAML 2.0',
    type: 'saml' as const,
    config: {
      entity_id: '',
      sso_url: '',
      slo_url: '',
      certificate: '',
      attribute_mapping: {
        email: 'email',
        first_name: 'firstName',
        last_name: 'lastName'
      }
    }
  }
};

export const SSOConfiguration: React.FC<SSOConfigurationProps> = ({ portalId, onClose }) => {
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'providers' | 'settings' | 'metadata'>('providers');
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'saml' as 'saml' | 'oauth' | 'oidc',
    enabled: true,
    config: {} as Record<string, any>
  });

  useEffect(() => {
    loadSSOProviders();
  }, [portalId]);

  const loadSSOProviders = async () => {
    try {
      setLoading(true);
      // Mock SSO providers - in real implementation, fetch from database
      const mockProviders: SSOProvider[] = [
        {
          id: '1',
          name: 'Microsoft Azure AD',
          type: 'saml',
          enabled: true,
          config: {
            entity_id: 'urn:federation:MicrosoftOnline',
            sso_url: 'https://login.microsoftonline.com/tenant-id/saml2',
            certificate: '-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----',
            attribute_mapping: {
              email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
              first_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
              last_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'
            }
          },
          created_at: new Date().toISOString(),
          last_used: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          name: 'Google Workspace',
          type: 'oauth',
          enabled: false,
          config: {
            client_id: 'your-client-id.apps.googleusercontent.com',
            client_secret: 'your-client-secret',
            domain: 'yourcompany.com'
          },
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      setProviders(mockProviders);
    } catch (err) {
      setError('Failed to load SSO providers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);

      if (!formData.name.trim()) {
        setError('Provider name is required');
        return;
      }

      // Validation based on provider type
      if (formData.type === 'saml') {
        if (!formData.config.entity_id || !formData.config.sso_url) {
          setError('Entity ID and SSO URL are required for SAML');
          return;
        }
      } else if (formData.type === 'oauth') {
        if (!formData.config.client_id || !formData.config.client_secret) {
          setError('Client ID and Client Secret are required for OAuth');
          return;
        }
      }

      const newProvider: SSOProvider = {
        id: selectedProvider?.id || `sso_${Date.now()}`,
        name: formData.name,
        type: formData.type,
        enabled: formData.enabled,
        config: formData.config,
        created_at: selectedProvider?.created_at || new Date().toISOString(),
        last_used: selectedProvider?.last_used
      };

      if (selectedProvider) {
        setProviders(prev => prev.map(p => p.id === selectedProvider.id ? newProvider : p));
      } else {
        setProviders(prev => [...prev, newProvider]);
      }

      // In real implementation: await ssoService.saveProvider(portalId, newProvider);

      setIsEditing(false);
      setSelectedProvider(newProvider);
      resetForm();
    } catch (err) {
      setError('Failed to save SSO provider');
      console.error(err);
    }
  };

  const handleDelete = async (providerId: string) => {
    if (!window.confirm('Are you sure you want to delete this SSO provider? Users will no longer be able to sign in with this provider.')) return;

    try {
      setProviders(prev => prev.filter(p => p.id !== providerId));
      if (selectedProvider?.id === providerId) {
        setSelectedProvider(null);
      }
      // In real implementation: await ssoService.deleteProvider(portalId, providerId);
    } catch (err) {
      setError('Failed to delete SSO provider');
      console.error(err);
    }
  };

  const toggleProvider = async (providerId: string) => {
    try {
      setProviders(prev => prev.map(p =>
        p.id === providerId ? { ...p, enabled: !p.enabled } : p
      ));
      // In real implementation: await ssoService.toggleProvider(portalId, providerId);
    } catch (err) {
      setError('Failed to toggle SSO provider');
      console.error(err);
    }
  };

  const testSSOConnection = async (provider: SSOProvider) => {
    try {
      setTesting(true);
      setError(null);

      // In real implementation: test SSO connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success
      setProviders(prev => prev.map(p =>
        p.id === provider.id ? { ...p, last_used: new Date().toISOString() } : p
      ));

    } catch (err) {
      setError(`SSO test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const generateMetadata = (provider: SSOProvider) => {
    const baseUrl = `https://portal.${portalId}.clientportal.com`;

    if (provider.type === 'saml') {
      return `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  entityID="${baseUrl}/sso/saml/metadata">
  <SPSSODescriptor AuthnRequestsSigned="true" WantAssertionsSigned="true"
                   protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
        <X509Data>
          <X509Certificate><!-- SP Certificate --></X509Certificate>
        </X509Data>
      </KeyInfo>
    </KeyDescriptor>
    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                        Location="${baseUrl}/sso/saml/sls"/>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                             Location="${baseUrl}/sso/saml/acs" index="1"/>
  </SPSSODescriptor>
</EntityDescriptor>`;
    }

    return JSON.stringify({
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/sso/oauth/authorize`,
      token_endpoint: `${baseUrl}/sso/oauth/token`,
      userinfo_endpoint: `${baseUrl}/sso/oauth/userinfo`,
      jwks_uri: `${baseUrl}/sso/oauth/jwks`
    }, null, 2);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const toggleSecretVisibility = (key: string) => {
    const newShowSecrets = new Set(showSecrets);
    if (newShowSecrets.has(key)) {
      newShowSecrets.delete(key);
    } else {
      newShowSecrets.add(key);
    }
    setShowSecrets(newShowSecrets);
  };

  const loadTemplate = (templateKey: keyof typeof SSO_PROVIDER_TEMPLATES) => {
    const template = SSO_PROVIDER_TEMPLATES[templateKey];
    setFormData({
      name: template.name,
      type: template.type,
      enabled: true,
      config: { ...template.config }
    });
    setIsEditing(true);
    setSelectedProvider(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'saml',
      enabled: true,
      config: {}
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SSO configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Single Sign-On Configuration
            </h2>
            <p className="text-gray-600 mt-1">Configure SSO providers for enterprise authentication</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'providers'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Key className="h-4 w-4 inline mr-2" />
            Providers
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'settings'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe className="h-4 w-4 inline mr-2" />
            Global Settings
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'metadata'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Download className="h-4 w-4 inline mr-2" />
            Service Provider Metadata
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {activeTab === 'providers' && (
            <>
              {/* Sidebar */}
              <div className="w-80 bg-gray-50 border-r flex flex-col">
                <div className="p-4 border-b bg-white">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProvider(null);
                        setIsEditing(true);
                        resetForm();
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Provider
                    </button>
                  </div>

                  {/* Quick Templates */}
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Setup</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(SSO_PROVIDER_TEMPLATES).map(([key, template]) => (
                        <button
                          key={key}
                          onClick={() => loadTemplate(key as any)}
                          className="p-2 text-xs bg-white border border-gray-200 rounded hover:border-blue-300 text-left"
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {providers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No SSO providers configured</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {providers.map(provider => (
                        <div
                          key={provider.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedProvider?.id === provider.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedProvider(provider)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm text-gray-900">{provider.name}</h4>
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  provider.enabled ? 'bg-green-500' : 'bg-gray-400'
                                }`}
                              />
                              <span className="text-xs text-gray-500 uppercase">{provider.type}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">
                            {provider.last_used
                              ? `Last used: ${new Date(provider.last_used).toLocaleDateString()}`
                              : 'Never used'
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                {isEditing ? (
                  // Edit Mode
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-2xl">
                      <h3 className="text-lg font-semibold mb-6">
                        {selectedProvider ? 'Edit SSO Provider' : 'New SSO Provider'}
                      </h3>

                      <div className="space-y-6">
                        {/* Basic Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Provider Name
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Microsoft Azure AD"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Protocol Type
                            </label>
                            <select
                              value={formData.type}
                              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="saml">SAML 2.0</option>
                              <option value="oauth">OAuth 2.0 / OpenID Connect</option>
                              <option value="oidc">OpenID Connect</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.enabled}
                            onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label className="text-sm text-gray-700">Enable this SSO provider</label>
                        </div>

                        {/* Protocol-specific Configuration */}
                        {formData.type === 'saml' && (
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">SAML 2.0 Configuration</h4>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Entity ID (Identity Provider)
                              </label>
                              <input
                                type="text"
                                value={formData.config.entity_id || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  config: { ...prev.config, entity_id: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="urn:federation:MicrosoftOnline"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                SSO URL (Sign-On URL)
                              </label>
                              <input
                                type="url"
                                value={formData.config.sso_url || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  config: { ...prev.config, sso_url: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://login.microsoftonline.com/tenant-id/saml2"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                SLO URL (Single Logout URL) - Optional
                              </label>
                              <input
                                type="url"
                                value={formData.config.slo_url || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  config: { ...prev.config, slo_url: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://login.microsoftonline.com/tenant-id/saml2"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                X.509 Certificate
                              </label>
                              <textarea
                                value={formData.config.certificate || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  config: { ...prev.config, certificate: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                rows={6}
                                placeholder="-----BEGIN CERTIFICATE-----&#10;MIICXjCCAUYCAg...&#10;-----END CERTIFICATE-----"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Paste the X.509 certificate from your identity provider
                              </p>
                            </div>
                          </div>
                        )}

                        {formData.type === 'oauth' && (
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">OAuth 2.0 Configuration</h4>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Client ID
                                </label>
                                <input
                                  type="text"
                                  value={formData.config.client_id || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    config: { ...prev.config, client_id: e.target.value }
                                  }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="your-client-id"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Client Secret
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type={showSecrets.has('client_secret') ? 'text' : 'password'}
                                    value={formData.config.client_secret || ''}
                                    onChange={(e) => setFormData(prev => ({
                                      ...prev,
                                      config: { ...prev.config, client_secret: e.target.value }
                                    }))}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="your-client-secret"
                                  />
                                  <button
                                    onClick={() => toggleSecretVisibility('client_secret')}
                                    className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg"
                                  >
                                    {showSecrets.has('client_secret') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Domain (Optional)
                              </label>
                              <input
                                type="text"
                                value={formData.config.domain || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  config: { ...prev.config, domain: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="yourcompany.com"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Restrict login to specific domain
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-8 pt-6 border-t">
                        <button
                          onClick={handleSave}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save Provider
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            resetForm();
                          }}
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : selectedProvider ? (
                  // View Mode
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {selectedProvider.name}
                            <span
                              className={`w-3 h-3 rounded-full ${
                                selectedProvider.enabled ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            />
                          </h3>
                          <p className="text-gray-600">{selectedProvider.type.toUpperCase()} Provider</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => testSSOConnection(selectedProvider)}
                            disabled={testing}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                          >
                            {testing ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                            Test Connection
                          </button>
                          <button
                            onClick={() => toggleProvider(selectedProvider.id)}
                            className={`px-4 py-2 rounded-lg font-medium ${
                              selectedProvider.enabled
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {selectedProvider.enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => {
                              setFormData({
                                name: selectedProvider.name,
                                type: selectedProvider.type,
                                enabled: selectedProvider.enabled,
                                config: selectedProvider.config
                              });
                              setIsEditing(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(selectedProvider.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Configuration</h4>
                          <div className="space-y-4">
                            {Object.entries(selectedProvider.config).map(([key, value]) => {
                              if (typeof value === 'object') return null;

                              const isSecret = key.includes('secret') || key.includes('password');
                              const displayValue = isSecret && !showSecrets.has(key)
                                ? '•'.repeat(String(value).length)
                                : String(value);

                              return (
                                <div key={key}>
                                  <label className="text-sm font-medium text-gray-700 capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm break-all">
                                      {displayValue}
                                    </code>
                                    {isSecret && (
                                      <button
                                        onClick={() => toggleSecretVisibility(key)}
                                        className="p-2 text-gray-500 hover:text-gray-700"
                                      >
                                        {showSecrets.has(key) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => copyToClipboard(String(value))}
                                      className="p-2 text-gray-500 hover:text-gray-700"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Integration URLs</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Assertion Consumer Service (ACS) URL
                              </label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                                  https://portal.{portalId}.clientportal.com/sso/{selectedProvider.type}/acs
                                </code>
                                <button
                                  onClick={() => copyToClipboard(`https://portal.${portalId}.clientportal.com/sso/${selectedProvider.type}/acs`)}
                                  className="p-2 text-gray-500 hover:text-gray-700"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Entity ID / Audience
                              </label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                                  https://portal.{portalId}.clientportal.com/sso/saml/metadata
                                </code>
                                <button
                                  onClick={() => copyToClipboard(`https://portal.${portalId}.clientportal.com/sso/saml/metadata`)}
                                  className="p-2 text-gray-500 hover:text-gray-700"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Single Logout Service (SLS) URL
                              </label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                                  https://portal.{portalId}.clientportal.com/sso/{selectedProvider.type}/sls
                                </code>
                                <button
                                  onClick={() => copyToClipboard(`https://portal.${portalId}.clientportal.com/sso/${selectedProvider.type}/sls`)}
                                  className="p-2 text-gray-500 hover:text-gray-700"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // No selection
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No SSO provider selected</p>
                      <p>Select a provider from the sidebar or create a new one</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <div className="flex-1 p-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-6">Global SSO Settings</h3>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">SSO Configuration Status</h4>
                    <div className="text-blue-800 text-sm space-y-1">
                      <p>• {providers.filter(p => p.enabled).length} active SSO provider(s)</p>
                      <p>• {providers.filter(p => p.type === 'saml').length} SAML providers configured</p>
                      <p>• {providers.filter(p => p.type === 'oauth').length} OAuth providers configured</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <div>
                        <label className="font-medium text-gray-900">Require SSO for all users</label>
                        <p className="text-sm text-gray-600">Force all users to authenticate via SSO providers</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <div>
                        <label className="font-medium text-gray-900">Allow local authentication fallback</label>
                        <p className="text-sm text-gray-600">Permit username/password login when SSO is unavailable</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <div>
                        <label className="font-medium text-gray-900">Auto-provision users</label>
                        <p className="text-sm text-gray-600">Automatically create accounts for new SSO users</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <div>
                        <label className="font-medium text-gray-900">Update user attributes</label>
                        <p className="text-sm text-gray-600">Sync user profile data from SSO provider on each login</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default user role for auto-provisioned users
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="viewer">Viewer</option>
                      <option value="manager">Manager</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session timeout (minutes)
                    </label>
                    <input
                      type="number"
                      defaultValue={480}
                      min={15}
                      max={1440}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum idle time before requiring re-authentication</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="flex-1 p-6">
              <div className="max-w-4xl">
                <h3 className="text-lg font-semibold mb-6">Service Provider Metadata</h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Configuration Instructions</h4>
                  <div className="text-blue-800 text-sm space-y-1">
                    <p>• Copy the metadata URL and paste it into your Identity Provider configuration</p>
                    <p>• Or download the metadata file and upload it to your IdP</p>
                    <p>• Make sure to configure the correct attribute mappings in your IdP</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metadata URL
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                        https://portal.{portalId}.clientportal.com/sso/saml/metadata
                      </code>
                      <button
                        onClick={() => copyToClipboard(`https://portal.${portalId}.clientportal.com/sso/saml/metadata`)}
                        className="p-2 text-gray-500 hover:text-gray-700 border rounded"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(`https://portal.${portalId}.clientportal.com/sso/saml/metadata`)}
                        className="p-2 text-gray-500 hover:text-gray-700 border rounded"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        SAML Metadata XML
                      </label>
                      <button
                        onClick={() => {
                          const metadata = generateMetadata({ type: 'saml' } as SSOProvider);
                          const blob = new Blob([metadata], { type: 'application/xml' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${portalId}-saml-metadata.xml`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download XML
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={generateMetadata({ type: 'saml' } as SSOProvider)}
                      className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Required Attribute Mappings</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>User Attribute</strong>
                      </div>
                      <div>
                        <strong>SAML Attribute (Example)</strong>
                      </div>
                      <div>Email Address</div>
                      <div><code>http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress</code></div>
                      <div>First Name</div>
                      <div><code>http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname</code></div>
                      <div>Last Name</div>
                      <div><code>http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname</code></div>
                      <div>Display Name</div>
                      <div><code>http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name</code></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};