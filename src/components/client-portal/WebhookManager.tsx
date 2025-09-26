import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Webhook,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Globe,
  Shield,
  Clock,
  Activity,
  RefreshCw,
  Eye,
  EyeOff,
  TestTube,
  Send
} from 'lucide-react';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  created_at: string;
  last_triggered_at?: string;
  success_count: number;
  failure_count: number;
  retry_count: number;
  headers?: Record<string, string>;
}

interface WebhookManagerProps {
  portalId: string;
  onClose: () => void;
}

const AVAILABLE_EVENTS = [
  { id: 'user.created', name: 'User Created', description: 'When a new user is added to the portal' },
  { id: 'user.updated', name: 'User Updated', description: 'When user information is modified' },
  { id: 'user.deleted', name: 'User Deleted', description: 'When a user is removed from the portal' },
  { id: 'portal.updated', name: 'Portal Updated', description: 'When portal settings are changed' },
  { id: 'widget.viewed', name: 'Widget Viewed', description: 'When a widget is viewed by a user' },
  { id: 'widget.interacted', name: 'Widget Interacted', description: 'When a user interacts with a widget' },
  { id: 'file.uploaded', name: 'File Uploaded', description: 'When a file is uploaded to the portal' },
  { id: 'file.downloaded', name: 'File Downloaded', description: 'When a file is downloaded' },
  { id: 'session.started', name: 'Session Started', description: 'When a user logs into the portal' },
  { id: 'session.ended', name: 'Session Ended', description: 'When a user logs out' },
  { id: 'analytics.milestone', name: 'Analytics Milestone', description: 'When certain analytics thresholds are reached' },
  { id: 'notification.sent', name: 'Notification Sent', description: 'When a notification is delivered' }
];

export const WebhookManager: React.FC<WebhookManagerProps> = ({ portalId, onClose }) => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: '',
    enabled: true,
    headers: {} as Record<string, string>
  });

  useEffect(() => {
    loadWebhooks();
  }, [portalId]);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      // Mock webhook data - in real implementation, fetch from database
      const mockWebhooks: WebhookEndpoint[] = [
        {
          id: '1',
          name: 'Slack Notifications',
          url: 'https://example.com/webhook/slack',
          events: ['user.created', 'portal.updated', 'session.started'],
          secret: 'whsec_1234567890abcdef',
          enabled: true,
          created_at: new Date().toISOString(),
          last_triggered_at: new Date(Date.now() - 3600000).toISOString(),
          success_count: 45,
          failure_count: 2,
          retry_count: 1
        },
        {
          id: '2',
          name: 'Analytics Tracker',
          url: 'https://api.example.com/webhooks/analytics',
          events: ['widget.viewed', 'widget.interacted', 'analytics.milestone'],
          secret: 'whsec_abcdef1234567890',
          enabled: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          success_count: 123,
          failure_count: 5,
          retry_count: 0
        }
      ];

      setWebhooks(mockWebhooks);
    } catch (err) {
      setError('Failed to load webhooks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSecret = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let secret = 'whsec_';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const handleSave = async () => {
    try {
      setError(null);

      // Validation
      if (!formData.name.trim()) {
        setError('Webhook name is required');
        return;
      }

      if (!formData.url.trim()) {
        setError('Webhook URL is required');
        return;
      }

      try {
        new URL(formData.url);
      } catch {
        setError('Please enter a valid URL');
        return;
      }

      if (formData.events.length === 0) {
        setError('Please select at least one event');
        return;
      }

      const newWebhook: WebhookEndpoint = {
        id: selectedWebhook?.id || `webhook_${Date.now()}`,
        name: formData.name,
        url: formData.url,
        events: formData.events,
        secret: formData.secret || generateSecret(),
        enabled: formData.enabled,
        headers: formData.headers,
        created_at: selectedWebhook?.created_at || new Date().toISOString(),
        success_count: selectedWebhook?.success_count || 0,
        failure_count: selectedWebhook?.failure_count || 0,
        retry_count: selectedWebhook?.retry_count || 0,
        last_triggered_at: selectedWebhook?.last_triggered_at
      };

      if (selectedWebhook) {
        setWebhooks(hooks => hooks.map(hook => hook.id === selectedWebhook.id ? newWebhook : hook));
      } else {
        setWebhooks(hooks => [...hooks, newWebhook]);
      }

      // In real implementation: await webhookService.saveWebhook(portalId, newWebhook);

      setIsEditing(false);
      setSelectedWebhook(newWebhook);
      resetForm();
    } catch (err) {
      setError('Failed to save webhook');
      console.error(err);
    }
  };

  const handleEdit = (webhook: WebhookEndpoint) => {
    setSelectedWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      enabled: webhook.enabled,
      headers: webhook.headers || {}
    });
    setIsEditing(true);
  };

  const handleDelete = async (webhookId: string) => {
    if (!window.confirm('Are you sure you want to delete this webhook?')) return;

    try {
      setWebhooks(hooks => hooks.filter(hook => hook.id !== webhookId));
      if (selectedWebhook?.id === webhookId) {
        setSelectedWebhook(null);
      }
      // In real implementation: await webhookService.deleteWebhook(portalId, webhookId);
    } catch (err) {
      setError('Failed to delete webhook');
      console.error(err);
    }
  };

  const toggleWebhook = async (webhookId: string) => {
    try {
      setWebhooks(hooks => hooks.map(hook =>
        hook.id === webhookId ? { ...hook, enabled: !hook.enabled } : hook
      ));
      // In real implementation: await webhookService.toggleWebhook(portalId, webhookId);
    } catch (err) {
      setError('Failed to toggle webhook');
      console.error(err);
    }
  };

  const testWebhook = async (webhook: WebhookEndpoint) => {
    try {
      setTestingWebhook(webhook.id);
      setError(null);

      const testPayload = {
        event: 'webhook.test',
        data: {
          portal_id: portalId,
          timestamp: new Date().toISOString(),
          test: true
        }
      };

      // In real implementation: send actual HTTP request
      // const response = await fetch(webhook.url, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'X-Webhook-Signature': generateSignature(JSON.stringify(testPayload), webhook.secret),
      //     ...webhook.headers
      //   },
      //   body: JSON.stringify(testPayload)
      // });

      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update success count
      setWebhooks(hooks => hooks.map(hook =>
        hook.id === webhook.id
          ? { ...hook, success_count: hook.success_count + 1, last_triggered_at: new Date().toISOString() }
          : hook
      ));

    } catch (err) {
      setError(`Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      // Update failure count
      setWebhooks(hooks => hooks.map(hook =>
        hook.id === webhook.id
          ? { ...hook, failure_count: hook.failure_count + 1 }
          : hook
      ));
    } finally {
      setTestingWebhook(null);
    }
  };

  const copyToClipboard = async (text: string, webhookId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show copied feedback (you could use a toast here)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const toggleSecretVisibility = (webhookId: string) => {
    const newShowSecrets = new Set(showSecrets);
    if (newShowSecrets.has(webhookId)) {
      newShowSecrets.delete(webhookId);
    } else {
      newShowSecrets.add(webhookId);
    }
    setShowSecrets(newShowSecrets);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      events: [],
      secret: '',
      enabled: true,
      headers: {}
    });
  };

  const addHeader = () => {
    const key = prompt('Header name:');
    const value = prompt('Header value:');
    if (key && value) {
      setFormData(prev => ({
        ...prev,
        headers: { ...prev.headers, [key]: value }
      }));
    }
  };

  const removeHeader = (key: string) => {
    setFormData(prev => ({
      ...prev,
      headers: Object.fromEntries(Object.entries(prev.headers).filter(([k]) => k !== key))
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading webhooks...</p>
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
              <Webhook className="h-6 w-6" />
              Webhook Manager
            </h2>
            <p className="text-gray-600 mt-1">Configure webhooks to receive real-time notifications</p>
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

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-r flex flex-col">
            <div className="p-4 border-b bg-white">
              <button
                onClick={() => {
                  setSelectedWebhook(null);
                  setIsEditing(true);
                  resetForm();
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Webhook
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {webhooks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Webhook className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No webhooks configured</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {webhooks.map(webhook => (
                    <div
                      key={webhook.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedWebhook?.id === webhook.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedWebhook(webhook)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{webhook.name}</h4>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              webhook.enabled ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 truncate">{webhook.url}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{webhook.events.length} events</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">{webhook.success_count}</span>
                          <span className="text-red-600">{webhook.failure_count}</span>
                        </div>
                      </div>
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
                    {selectedWebhook ? 'Edit Webhook' : 'Create Webhook'}
                  </h3>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="My Webhook"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.enabled ? 'enabled' : 'disabled'}
                          onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.value === 'enabled' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="enabled">Enabled</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://api.example.com/webhooks/endpoint"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook Secret
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.secret}
                          onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                          placeholder="whsec_..."
                        />
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, secret: generateSecret() }))}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Generate
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Used to verify webhook authenticity</p>
                    </div>

                    {/* Events */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Events to Subscribe
                      </label>
                      <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                        {AVAILABLE_EVENTS.map(event => (
                          <label key={event.id} className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={formData.events.includes(event.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    events: [...prev.events, event.id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    events: prev.events.filter(id => id !== event.id)
                                  }));
                                }
                              }}
                              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">{event.name}</div>
                              <div className="text-xs text-gray-500">{event.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Custom Headers */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Custom Headers
                        </label>
                        <button
                          onClick={addHeader}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + Add Header
                        </button>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(formData.headers).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={key}
                              readOnly
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                            />
                            <span className="text-gray-400">:</span>
                            <input
                              type="text"
                              value={value}
                              readOnly
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                            />
                            <button
                              onClick={() => removeHeader(key)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {Object.keys(formData.headers).length === 0 && (
                          <p className="text-sm text-gray-500">No custom headers configured</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8 pt-6 border-t">
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Save Webhook
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
            ) : selectedWebhook ? (
              // View Mode
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {selectedWebhook.name}
                        <span
                          className={`w-3 h-3 rounded-full ${
                            selectedWebhook.enabled ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </h3>
                      <p className="text-gray-600">{selectedWebhook.url}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => testWebhook(selectedWebhook)}
                        disabled={testingWebhook === selectedWebhook.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {testingWebhook === selectedWebhook.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Test
                      </button>
                      <button
                        onClick={() => toggleWebhook(selectedWebhook.id)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          selectedWebhook.enabled
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {selectedWebhook.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleEdit(selectedWebhook)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedWebhook.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">Success</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900">{selectedWebhook.success_count}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-800">Failures</span>
                      </div>
                      <div className="text-2xl font-bold text-red-900">{selectedWebhook.failure_count}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Retries</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">{selectedWebhook.retry_count}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Configuration</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">URL</label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">{selectedWebhook.url}</code>
                            <button
                              onClick={() => copyToClipboard(selectedWebhook.url, selectedWebhook.id)}
                              className="p-2 text-gray-500 hover:text-gray-700"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Secret</label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                              {showSecrets.has(selectedWebhook.id)
                                ? selectedWebhook.secret
                                : '•'.repeat(selectedWebhook.secret.length)
                              }
                            </code>
                            <button
                              onClick={() => toggleSecretVisibility(selectedWebhook.id)}
                              className="p-2 text-gray-500 hover:text-gray-700"
                            >
                              {showSecrets.has(selectedWebhook.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(selectedWebhook.secret, selectedWebhook.id)}
                              className="p-2 text-gray-500 hover:text-gray-700"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Last Triggered</label>
                          <p className="text-gray-600 mt-1">
                            {selectedWebhook.last_triggered_at
                              ? new Date(selectedWebhook.last_triggered_at).toLocaleString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Subscribed Events</h4>
                      <div className="space-y-2">
                        {selectedWebhook.events.map(eventId => {
                          const event = AVAILABLE_EVENTS.find(e => e.id === eventId);
                          return (
                            <div key={eventId} className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
                              <div className="font-medium text-blue-900 text-sm">{event?.name || eventId}</div>
                              {event && <div className="text-blue-700 text-xs">{event.description}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // No selection
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No webhook selected</p>
                  <p>Select a webhook from the sidebar or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};