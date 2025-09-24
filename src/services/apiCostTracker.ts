import { useApiCostStore } from '../stores/apiCostStore';

export interface ApiCallConfig {
  service: string;
  endpoint: string;
  method: string;
  estimatedCost?: number;
  userId?: string;
}

// Cost configuration for different services
export const API_COSTS = {
  openai: {
    'gpt-4': 0.03,
    'gpt-4-turbo': 0.01,
    'gpt-3.5-turbo': 0.002,
    'dall-e-2': 0.020,
    'dall-e-3': 0.040,
    'whisper': 0.006,
    'tts': 0.015,
    'embeddings': 0.0001
  },
  google: {
    'search-console': 0.001,
    'analytics': 0.001,
    'pagespeed': 0.002,
    'places': 0.005,
    'maps': 0.005,
    'translate': 0.020,
    'vision': 0.001,
    'speech': 0.006
  },
  semrush: {
    'keywords': 0.01,
    'backlinks': 0.015,
    'competitors': 0.02,
    'organic-search': 0.01,
    'advertising': 0.015,
    'domain-analytics': 0.02
  },
  ahrefs: {
    'keywords': 0.012,
    'backlinks': 0.018,
    'site-explorer': 0.025,
    'rank-tracker': 0.015,
    'content-gap': 0.020
  },
  sendgrid: {
    'email-send': 0.0005,
    'email-validation': 0.001,
    'template': 0.0001,
    'stats': 0.0001
  },
  hubspot: {
    'contact': 0.002,
    'company': 0.002,
    'deal': 0.003,
    'ticket': 0.002,
    'email': 0.001,
    'form': 0.001
  },
  slack: {
    'message': 0.0001,
    'file-upload': 0.001,
    'user-info': 0.0001,
    'channel-list': 0.0001
  },
  facebook: {
    'ads-insights': 0.001,
    'campaign-data': 0.002,
    'audience-insights': 0.003,
    'creative-insights': 0.001
  },
  twitter: {
    'tweet': 0.001,
    'user-lookup': 0.0005,
    'search': 0.002,
    'analytics': 0.003
  },
  stripe: {
    'payment': 0.005,
    'customer': 0.001,
    'invoice': 0.002,
    'subscription': 0.003
  },
  webhook: {
    'incoming': 0.0001,
    'outgoing': 0.0001
  }
};

class ApiCostTrackerService {
  private static instance: ApiCostTrackerService;
  private store: any;

  private constructor() {
    // Initialize store access
    this.store = useApiCostStore.getState();
  }

  public static getInstance(): ApiCostTrackerService {
    if (!ApiCostTrackerService.instance) {
      ApiCostTrackerService.instance = new ApiCostTrackerService();
    }
    return ApiCostTrackerService.instance;
  }

  /**
   * Calculate cost for an API call based on service and endpoint
   */
  public calculateCost(service: string, endpoint: string, modelOrPlan?: string): number {
    const serviceCosts = API_COSTS[service as keyof typeof API_COSTS];
    if (!serviceCosts) {
      return 0.001; // Default minimal cost
    }

    // For services with multiple pricing tiers
    if (modelOrPlan && serviceCosts[modelOrPlan as keyof typeof serviceCosts]) {
      return serviceCosts[modelOrPlan as keyof typeof serviceCosts];
    }

    // Try to match endpoint to cost category
    const endpointLower = endpoint.toLowerCase();
    for (const [key, cost] of Object.entries(serviceCosts)) {
      if (endpointLower.includes(key) || key.includes(endpointLower.split('/')[0])) {
        return cost;
      }
    }

    // Return first available cost if no match
    return Object.values(serviceCosts)[0];
  }

  /**
   * Track an API call with automatic cost calculation
   */
  public trackApiCall(config: ApiCallConfig, success: boolean = true, responseTime: number = 0): void {
    const cost = config.estimatedCost || this.calculateCost(config.service, config.endpoint);
    
    try {
      this.store = useApiCostStore.getState();
      this.store.trackApiCall({
        service: config.service,
        endpoint: config.endpoint,
        method: config.method,
        cost: success ? cost : 0, // No cost for failed calls
        success,
        responseTime,
        userId: config.userId
      });
    } catch (error) {
      console.error('Failed to track API call:', error);
      // Store locally for retry later
      this.storeCallLocally(config, success, responseTime, cost);
    }
  }

  /**
   * Store API call locally for offline tracking
   */
  private storeCallLocally(config: ApiCallConfig, success: boolean, responseTime: number, cost: number): void {
    try {
      const localCalls = JSON.parse(localStorage.getItem('pending_api_calls') || '[]');
      localCalls.push({
        ...config,
        success,
        responseTime,
        cost,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('pending_api_calls', JSON.stringify(localCalls));
    } catch (error) {
      console.error('Failed to store API call locally:', error);
    }
  }

  /**
   * Sync locally stored API calls
   */
  public syncPendingCalls(): void {
    try {
      const localCalls = JSON.parse(localStorage.getItem('pending_api_calls') || '[]');
      if (localCalls.length === 0) return;

      this.store = useApiCostStore.getState();
      localCalls.forEach((call: any) => {
        this.store.trackApiCall({
          service: call.service,
          endpoint: call.endpoint,
          method: call.method,
          cost: call.cost,
          success: call.success,
          responseTime: call.responseTime,
          userId: call.userId
        });
      });

      // Clear synced calls
      localStorage.removeItem('pending_api_calls');
    } catch (error) {
      console.error('Failed to sync pending calls:', error);
    }
  }

  /**
   * Get current cost statistics
   */
  public getCurrentStats(): {
    todayCost: number;
    monthCost: number;
    totalCalls: number;
    averageCostPerCall: number;
  } {
    try {
      this.store = useApiCostStore.getState();
      const { data } = this.store;
      
      const today = new Date().toISOString().split('T')[0];
      const todayCalls = data.calls.filter(call => 
        call.timestamp.split('T')[0] === today
      );
      const todayCost = todayCalls.reduce((sum, call) => sum + call.cost, 0);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthCalls = data.calls.filter(call => 
        new Date(call.timestamp) >= monthStart
      );
      const monthCost = monthCalls.reduce((sum, call) => sum + call.cost, 0);

      return {
        todayCost,
        monthCost,
        totalCalls: data.calls.length,
        averageCostPerCall: data.calls.length > 0 
          ? data.calls.reduce((sum, call) => sum + call.cost, 0) / data.calls.length 
          : 0
      };
    } catch (error) {
      console.error('Failed to get current stats:', error);
      return {
        todayCost: 0,
        monthCost: 0,
        totalCalls: 0,
        averageCostPerCall: 0
      };
    }
  }

  /**
   * Check if we're approaching budget limits
   */
  public checkBudgetStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    percentage: number;
    remaining: number;
  } {
    try {
      this.store = useApiCostStore.getState();
      const { data } = this.store;
      const monthCost = data.monthly_summary.total_spent;
      const budget = data.budget.monthly_budget;
      const percentage = (monthCost / budget) * 100;
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (percentage >= data.budget.alert_thresholds.critical) {
        status = 'critical';
      } else if (percentage >= data.budget.alert_thresholds.warning) {
        status = 'warning';
      }

      return {
        status,
        percentage,
        remaining: Math.max(0, budget - monthCost)
      };
    } catch (error) {
      console.error('Failed to check budget status:', error);
      return {
        status: 'healthy',
        percentage: 0,
        remaining: 500
      };
    }
  }
}

// Export singleton instance
export const apiCostTracker = ApiCostTrackerService.getInstance();

// Middleware function to wrap API calls
export function withCostTracking<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  config: ApiCallConfig
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    
    try {
      const result = await apiCall(...args);
      const responseTime = Date.now() - startTime;
      
      apiCostTracker.trackApiCall(config, true, responseTime);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      apiCostTracker.trackApiCall(config, false, responseTime);
      throw error;
    }
  }) as T;
}

// Decorator for class methods
export function trackApiCosts(config: ApiCallConfig) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      
      try {
        const result = await method.apply(this, args);
        const responseTime = Date.now() - startTime;
        
        apiCostTracker.trackApiCall(config, true, responseTime);
        return result;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        apiCostTracker.trackApiCall(config, false, responseTime);
        throw error;
      }
    };

    return descriptor;
  };
}

// Auto-sync pending calls on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    apiCostTracker.syncPendingCalls();
  });

  // Sync every 5 minutes
  setInterval(() => {
    apiCostTracker.syncPendingCalls();
  }, 5 * 60 * 1000);
}