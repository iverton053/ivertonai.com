import mongoose from 'mongoose';
import axios from 'axios';
import { logger } from '../utils/logger';

export interface IntegrationApp {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  website: string;
  
  // Authentication
  authType: 'oauth2' | 'api_key' | 'basic' | 'webhook';
  authConfig: {
    authUrl?: string;
    tokenUrl?: string;
    scopes?: string[];
    apiKeyFields?: string[];
  };
  
  // Available triggers and actions
  triggers: IntegrationTrigger[];
  actions: IntegrationAction[];
  
  // Pricing and limits
  pricing: {
    free: { requests: number; };
    paid: { pricePerRequest: number; };
  };
  
  // Status
  status: 'active' | 'beta' | 'deprecated';
  verified: boolean;
  popularity: number;
}

export interface IntegrationTrigger {
  id: string;
  name: string;
  description: string;
  inputFields: IntegrationField[];
  outputSchema: any;
  webhookUrl?: string;
}

export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  inputFields: IntegrationField[];
  outputSchema: any;
}

export interface IntegrationField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'file';
  required: boolean;
  options?: Array<{ label: string; value: string }>;
  helpText?: string;
  defaultValue?: any;
}

export interface IntegrationConnection {
  id: string;
  userId: string;
  appId: string;
  name: string;
  credentials: any; // Encrypted
  status: 'active' | 'error' | 'expired';
  lastUsed: Date;
  createdAt: Date;
}

export interface IntegrationWorkflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'error';
  
  trigger: {
    appId: string;
    triggerId: string;
    connectionId: string;
    config: any;
  };
  
  actions: Array<{
    id: string;
    appId: string;
    actionId: string;
    connectionId: string;
    config: any;
    order: number;
  }>;
  
  // Analytics
  analytics: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastRun?: Date;
    avgExecutionTime: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export class IntegrationMarketplaceService {
  private static instance: IntegrationMarketplaceService;
  
  // Pre-built integrations catalog
  private marketplaceApps: IntegrationApp[] = [
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Create, update, and manage Google Sheets data',
      category: 'Productivity',
      logo: '/integrations/google-sheets.png',
      website: 'https://sheets.google.com',
      authType: 'oauth2',
      authConfig: {
        authUrl: 'https://accounts.google.com/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      },
      triggers: [
        {
          id: 'new-row',
          name: 'New Row Added',
          description: 'Triggers when a new row is added to a spreadsheet',
          inputFields: [
            { key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text', required: true },
            { key: 'sheet_name', label: 'Sheet Name', type: 'text', required: false }
          ],
          outputSchema: { row_data: 'object', row_number: 'number', timestamp: 'date' }
        }
      ],
      actions: [
        {
          id: 'create-row',
          name: 'Create Row',
          description: 'Add a new row to a Google Sheet',
          inputFields: [
            { key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text', required: true },
            { key: 'sheet_name', label: 'Sheet Name', type: 'text', required: false },
            { key: 'values', label: 'Row Values', type: 'text', required: true }
          ],
          outputSchema: { row_number: 'number', updated_range: 'string' }
        }
      ],
      pricing: { free: { requests: 1000 }, paid: { pricePerRequest: 0.001 } },
      status: 'active',
      verified: true,
      popularity: 95
    },
    
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send messages and manage Slack communications',
      category: 'Communication',
      logo: '/integrations/slack.png',
      website: 'https://slack.com',
      authType: 'oauth2',
      authConfig: {
        authUrl: 'https://slack.com/oauth/authorize',
        tokenUrl: 'https://slack.com/api/oauth.access',
        scopes: ['chat:write', 'channels:read']
      },
      triggers: [
        {
          id: 'new-message',
          name: 'New Message',
          description: 'Triggers when a new message is posted in a channel',
          inputFields: [
            { key: 'channel', label: 'Channel', type: 'select', required: true }
          ],
          outputSchema: { message: 'string', user: 'string', channel: 'string', timestamp: 'date' }
        }
      ],
      actions: [
        {
          id: 'send-message',
          name: 'Send Message',
          description: 'Send a message to a Slack channel',
          inputFields: [
            { key: 'channel', label: 'Channel', type: 'select', required: true },
            { key: 'message', label: 'Message', type: 'text', required: true },
            { key: 'username', label: 'Username', type: 'text', required: false }
          ],
          outputSchema: { message_id: 'string', timestamp: 'date' }
        }
      ],
      pricing: { free: { requests: 500 }, paid: { pricePerRequest: 0.002 } },
      status: 'active',
      verified: true,
      popularity: 88
    },

    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Manage email campaigns and subscriber lists',
      category: 'Email Marketing',
      logo: '/integrations/mailchimp.png',
      website: 'https://mailchimp.com',
      authType: 'oauth2',
      authConfig: {
        authUrl: 'https://login.mailchimp.com/oauth2/authorize',
        tokenUrl: 'https://login.mailchimp.com/oauth2/token',
        scopes: ['read', 'write']
      },
      triggers: [
        {
          id: 'new-subscriber',
          name: 'New Subscriber',
          description: 'Triggers when someone subscribes to a list',
          inputFields: [
            { key: 'list_id', label: 'List ID', type: 'select', required: true }
          ],
          outputSchema: { email: 'string', first_name: 'string', last_name: 'string', subscribed_at: 'date' }
        }
      ],
      actions: [
        {
          id: 'add-subscriber',
          name: 'Add Subscriber',
          description: 'Add a new subscriber to a mailing list',
          inputFields: [
            { key: 'list_id', label: 'List ID', type: 'select', required: true },
            { key: 'email', label: 'Email Address', type: 'text', required: true },
            { key: 'first_name', label: 'First Name', type: 'text', required: false },
            { key: 'last_name', label: 'Last Name', type: 'text', required: false }
          ],
          outputSchema: { subscriber_id: 'string', status: 'string' }
        }
      ],
      pricing: { free: { requests: 300 }, paid: { pricePerRequest: 0.003 } },
      status: 'active',
      verified: true,
      popularity: 82
    }
  ];

  public static getInstance(): IntegrationMarketplaceService {
    if (!IntegrationMarketplaceService.instance) {
      IntegrationMarketplaceService.instance = new IntegrationMarketplaceService();
    }
    return IntegrationMarketplaceService.instance;
  }

  // Get available integrations
  async getMarketplaceApps(category?: string): Promise<IntegrationApp[]> {
    let apps = this.marketplaceApps;
    
    if (category) {
      apps = apps.filter(app => app.category === category);
    }
    
    return apps.sort((a, b) => b.popularity - a.popularity);
  }

  // Get specific integration details
  async getIntegrationApp(appId: string): Promise<IntegrationApp | null> {
    return this.marketplaceApps.find(app => app.id === appId) || null;
  }

  // Create new connection to an integration
  async createConnection(userId: string, appId: string, credentials: any): Promise<IntegrationConnection> {
    const app = await this.getIntegrationApp(appId);
    if (!app) {
      throw new Error('Integration app not found');
    }

    // Test the connection
    const isValid = await this.testConnection(appId, credentials);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const connection: IntegrationConnection = {
      id: new mongoose.Types.ObjectId().toString(),
      userId,
      appId,
      name: `${app.name} Connection`,
      credentials: this.encryptCredentials(credentials),
      status: 'active',
      lastUsed: new Date(),
      createdAt: new Date()
    };

    // In real implementation, save to database
    logger.info(`Integration connection created: ${appId} for user ${userId}`);
    
    return connection;
  }

  // Execute integration action
  async executeAction(
    connectionId: string, 
    actionId: string, 
    config: any
  ): Promise<any> {
    // In real implementation:
    // 1. Load connection details
    // 2. Get app configuration
    // 3. Execute the action
    // 4. Return results
    
    logger.info(`Executing action: ${actionId} with connection: ${connectionId}`);
    
    // Mock execution
    return {
      success: true,
      data: { message: 'Action executed successfully' },
      timestamp: new Date()
    };
  }

  // Test connection validity
  private async testConnection(appId: string, credentials: any): Promise<boolean> {
    try {
      const app = await this.getIntegrationApp(appId);
      if (!app) return false;

      // Mock test based on app type
      switch (appId) {
        case 'google-sheets':
          // Test Google Sheets API
          return this.testGoogleSheetsConnection(credentials);
        case 'slack':
          // Test Slack API
          return this.testSlackConnection(credentials);
        case 'mailchimp':
          // Test Mailchimp API
          return this.testMailchimpConnection(credentials);
        default:
          return true; // Mock success
      }
    } catch (error) {
      logger.error(`Connection test failed for ${appId}:`, error);
      return false;
    }
  }

  private async testGoogleSheetsConnection(credentials: any): Promise<boolean> {
    try {
      const response = await axios.get('https://sheets.googleapis.com/v4/spreadsheets/test', {
        headers: { 'Authorization': `Bearer ${credentials.access_token}` }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  private async testSlackConnection(credentials: any): Promise<boolean> {
    try {
      const response = await axios.get('https://slack.com/api/auth.test', {
        headers: { 'Authorization': `Bearer ${credentials.access_token}` }
      });
      return response.data.ok === true;
    } catch (error) {
      return false;
    }
  }

  private async testMailchimpConnection(credentials: any): Promise<boolean> {
    try {
      const response = await axios.get('https://us1.api.mailchimp.com/3.0/ping', {
        headers: { 'Authorization': `Bearer ${credentials.access_token}` }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  private encryptCredentials(credentials: any): any {
    // In real implementation, use proper encryption
    return Buffer.from(JSON.stringify(credentials)).toString('base64');
  }

  // Get integration categories
  getCategories(): string[] {
    const categories = [...new Set(this.marketplaceApps.map(app => app.category))];
    return categories.sort();
  }

  // Search integrations
  searchIntegrations(query: string): IntegrationApp[] {
    const searchTerm = query.toLowerCase();
    return this.marketplaceApps.filter(app => 
      app.name.toLowerCase().includes(searchTerm) ||
      app.description.toLowerCase().includes(searchTerm) ||
      app.category.toLowerCase().includes(searchTerm)
    ).sort((a, b) => b.popularity - a.popularity);
  }

  // Get popular integrations
  getPopularIntegrations(limit: number = 10): IntegrationApp[] {
    return this.marketplaceApps
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }
}

export default IntegrationMarketplaceService;