import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  headers?: Record<string, string>;
  created_at: string;
  last_triggered_at?: string;
  success_count: number;
  failure_count: number;
  retry_count: number;
}

interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  portal_id: string;
  timestamp: string;
}

interface UseWebhooksOptions {
  portalId: string;
  enabled?: boolean;
}

export const useWebhooks = ({ portalId, enabled = true }: UseWebhooksOptions) => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load webhooks from database
  const loadWebhooks = useCallback(async () => {
    if (!enabled || !portalId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('portal_webhooks')
        .select('*')
        .eq('client_portal_id', portalId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWebhooks(data || []);
    } catch (err) {
      console.error('Error loading webhooks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  }, [portalId, enabled]);

  // Save webhook
  const saveWebhook = useCallback(async (webhookData: Omit<WebhookEndpoint, 'id' | 'created_at' | 'success_count' | 'failure_count' | 'retry_count'>) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('portal_webhooks')
        .insert({
          client_portal_id: portalId,
          ...webhookData,
          success_count: 0,
          failure_count: 0,
          retry_count: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setWebhooks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error saving webhook:', err);
      setError(err instanceof Error ? err.message : 'Failed to save webhook');
      throw err;
    }
  }, [portalId]);

  // Update webhook
  const updateWebhook = useCallback(async (id: string, updates: Partial<WebhookEndpoint>) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('portal_webhooks')
        .update(updates)
        .eq('id', id)
        .eq('client_portal_id', portalId)
        .select()
        .single();

      if (error) throw error;

      setWebhooks(prev => prev.map(webhook => webhook.id === id ? data : webhook));
      return data;
    } catch (err) {
      console.error('Error updating webhook:', err);
      setError(err instanceof Error ? err.message : 'Failed to update webhook');
      throw err;
    }
  }, [portalId]);

  // Delete webhook
  const deleteWebhook = useCallback(async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('portal_webhooks')
        .delete()
        .eq('id', id)
        .eq('client_portal_id', portalId);

      if (error) throw error;

      setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
    } catch (err) {
      console.error('Error deleting webhook:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete webhook');
      throw err;
    }
  }, [portalId]);

  // Toggle webhook enabled status
  const toggleWebhook = useCallback(async (id: string) => {
    const webhook = webhooks.find(w => w.id === id);
    if (!webhook) return;

    return updateWebhook(id, { enabled: !webhook.enabled });
  }, [webhooks, updateWebhook]);

  // Generate webhook signature
  const generateSignature = useCallback((payload: string, secret: string): string => {
    // In a real implementation, use crypto to generate HMAC-SHA256 signature
    // const crypto = require('crypto');
    // return crypto.createHmac('sha256', secret).update(payload).digest('hex');

    // For now, return a mock signature
    return `sha256=${btoa(payload + secret).slice(0, 32)}`;
  }, []);

  // Send webhook
  const sendWebhook = useCallback(async (webhookId: string, payload: WebhookPayload) => {
    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook || !webhook.enabled) return { success: false, error: 'Webhook not found or disabled' };

    try {
      const payloadString = JSON.stringify(payload);
      const signature = generateSignature(payloadString, webhook.secret);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': Date.now().toString(),
        'User-Agent': 'ClientPortal-Webhooks/1.0',
        ...webhook.headers
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        timeout: 10000 // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update success count
      await updateWebhook(webhookId, {
        success_count: webhook.success_count + 1,
        last_triggered_at: new Date().toISOString()
      });

      return { success: true, response };
    } catch (err) {
      console.error(`Webhook ${webhookId} failed:`, err);

      // Update failure count
      await updateWebhook(webhookId, {
        failure_count: webhook.failure_count + 1,
        last_triggered_at: new Date().toISOString()
      });

      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }, [webhooks, generateSignature, updateWebhook]);

  // Trigger webhook for specific event
  const triggerWebhooks = useCallback(async (event: string, data: Record<string, any>) => {
    if (!enabled) return;

    const activeWebhooks = webhooks.filter(webhook =>
      webhook.enabled && webhook.events.includes(event)
    );

    const payload: WebhookPayload = {
      event,
      data,
      portal_id: portalId,
      timestamp: new Date().toISOString()
    };

    const results = await Promise.allSettled(
      activeWebhooks.map(webhook => sendWebhook(webhook.id, payload))
    );

    const successCount = results.filter(result =>
      result.status === 'fulfilled' && result.value.success
    ).length;

    const failureCount = results.length - successCount;

    return {
      triggered: results.length,
      successful: successCount,
      failed: failureCount
    };
  }, [webhooks, enabled, portalId, sendWebhook]);

  // Test webhook
  const testWebhook = useCallback(async (webhookId: string) => {
    const payload: WebhookPayload = {
      event: 'webhook.test',
      data: {
        message: 'This is a test webhook from Client Portal',
        test: true
      },
      portal_id: portalId,
      timestamp: new Date().toISOString()
    };

    return sendWebhook(webhookId, payload);
  }, [portalId, sendWebhook]);

  // Load webhooks on mount
  useEffect(() => {
    loadWebhooks();
  }, [loadWebhooks]);

  // Webhook delivery retry logic
  const retryFailedWebhook = useCallback(async (webhookId: string, payload: WebhookPayload, maxRetries = 3) => {
    let retries = 0;
    let lastError: string | null = null;

    while (retries < maxRetries) {
      const result = await sendWebhook(webhookId, payload);

      if (result.success) {
        return result;
      }

      lastError = result.error;
      retries++;

      // Exponential backoff: 1s, 2s, 4s
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }

    // Update retry count
    const webhook = webhooks.find(w => w.id === webhookId);
    if (webhook) {
      await updateWebhook(webhookId, {
        retry_count: webhook.retry_count + retries
      });
    }

    return { success: false, error: lastError };
  }, [sendWebhook, webhooks, updateWebhook]);

  return {
    webhooks,
    loading,
    error,
    loadWebhooks,
    saveWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    testWebhook,
    triggerWebhooks,
    retryFailedWebhook
  };
};

// Webhook event constants
export const WEBHOOK_EVENTS = {
  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  // Portal events
  PORTAL_UPDATED: 'portal.updated',

  // Widget events
  WIDGET_VIEWED: 'widget.viewed',
  WIDGET_INTERACTED: 'widget.interacted',

  // File events
  FILE_UPLOADED: 'file.uploaded',
  FILE_DOWNLOADED: 'file.downloaded',

  // Session events
  SESSION_STARTED: 'session.started',
  SESSION_ENDED: 'session.ended',

  // Analytics events
  ANALYTICS_MILESTONE: 'analytics.milestone',

  // Notification events
  NOTIFICATION_SENT: 'notification.sent',

  // Test event
  WEBHOOK_TEST: 'webhook.test'
} as const;

// Helper functions for common webhook patterns
export const webhookUtils = {
  // Create standardized payload
  createPayload: (event: string, data: Record<string, any>, portalId: string): WebhookPayload => ({
    event,
    data,
    portal_id: portalId,
    timestamp: new Date().toISOString()
  }),

  // Validate webhook URL
  validateUrl: (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:' && parsedUrl.hostname !== 'localhost';
    } catch {
      return false;
    }
  },

  // Generate secure webhook secret
  generateSecret: (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let secret = 'whsec_';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  },

  // Format webhook for display
  formatWebhook: (webhook: WebhookEndpoint) => ({
    ...webhook,
    maskedUrl: webhook.url.replace(/\/\/.*@/, '//***@'), // Mask credentials in URL
    successRate: webhook.success_count + webhook.failure_count > 0
      ? Math.round((webhook.success_count / (webhook.success_count + webhook.failure_count)) * 100)
      : 0
  })
};