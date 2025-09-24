import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ApiCall {
  id: string;
  timestamp: string;
  service: string;
  endpoint: string;
  method: string;
  cost: number;
  success: boolean;
  responseTime: number;
  userId?: string;
}

export interface ApiService {
  id: string;
  name: string;
  category: 'email' | 'crm' | 'social' | 'ads' | 'financial' | 'communication' | 'analytics' | 'ai' | 'seo';
  costStructure: 'per_request' | 'monthly_quota' | 'tiered_usage' | 'pay_as_you_go';
  pricing: {
    free_tier?: number;
    cost_per_request?: number;
    monthly_base?: number;
    tiers?: { limit: number; cost: number }[];
  };
  currentUsage: number;
  monthlyLimit: number;
  costThisMonth: number;
  projectedMonthlyCost: number;
  lastUpdated: string;
  status: 'healthy' | 'warning' | 'critical';
  optimization_suggestions: string[];
}

export interface CostAlert {
  id: string;
  service: string;
  type: 'cost_spike' | 'approaching_limit' | 'inefficient_usage' | 'optimization_opportunity' | 'budget_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  impact: number;
  recommendation: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface BudgetSettings {
  monthly_budget: number;
  alert_thresholds: {
    warning: number; // percentage
    critical: number; // percentage
  };
  auto_optimize: boolean;
  cost_caps: {
    [serviceId: string]: number;
  };
}

export interface ApiCostData {
  calls: ApiCall[];
  services: ApiService[];
  alerts: CostAlert[];
  budget: BudgetSettings;
  monthly_summary: {
    total_spent: number;
    total_calls: number;
    average_cost_per_call: number;
    top_services: { service: string; cost: number }[];
    cost_trend: number; // percentage change from last month
    projected_monthly_cost: number;
  };
  daily_costs: { date: string; amount: number; calls: number }[];
  cost_breakdown: { service: string; cost: number; percentage: number }[];
}

interface ApiCostStore {
  data: ApiCostData;
  timeRange: '24h' | '7d' | '30d' | '90d';
  isLoading: boolean;
  lastUpdated: string;
  
  // Actions
  setTimeRange: (range: '24h' | '7d' | '30d' | '90d') => void;
  trackApiCall: (call: Omit<ApiCall, 'id' | 'timestamp'>) => void;
  updateServiceUsage: (serviceId: string, usage: number, cost: number) => void;
  setBudget: (budget: Partial<BudgetSettings>) => void;
  acknowledgeAlert: (alertId: string) => void;
  fetchCostData: () => Promise<void>;
  exportCostReport: (format: 'json' | 'csv') => void;
  optimizeService: (serviceId: string) => void;
  syncWithN8n: () => Promise<void>;
}

// Default budget settings
const DEFAULT_BUDGET: BudgetSettings = {
  monthly_budget: 500,
  alert_thresholds: {
    warning: 75,
    critical: 90
  },
  auto_optimize: false,
  cost_caps: {}
};

// Default API services configuration
const DEFAULT_SERVICES: ApiService[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    costStructure: 'per_request',
    pricing: { cost_per_request: 0.002 },
    currentUsage: 0,
    monthlyLimit: 100000,
    costThisMonth: 0,
    projectedMonthlyCost: 0,
    lastUpdated: new Date().toISOString(),
    status: 'healthy',
    optimization_suggestions: []
  },
  {
    id: 'google_apis',
    name: 'Google APIs',
    category: 'analytics',
    costStructure: 'per_request',
    pricing: { cost_per_request: 0.001 },
    currentUsage: 0,
    monthlyLimit: 50000,
    costThisMonth: 0,
    projectedMonthlyCost: 0,
    lastUpdated: new Date().toISOString(),
    status: 'healthy',
    optimization_suggestions: []
  },
  {
    id: 'semrush',
    name: 'SEMrush',
    category: 'seo',
    costStructure: 'per_request',
    pricing: { cost_per_request: 0.01 },
    currentUsage: 0,
    monthlyLimit: 10000,
    costThisMonth: 0,
    projectedMonthlyCost: 0,
    lastUpdated: new Date().toISOString(),
    status: 'healthy',
    optimization_suggestions: []
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'email',
    costStructure: 'tiered_usage',
    pricing: {
      free_tier: 100,
      tiers: [
        { limit: 40000, cost: 19.95 },
        { limit: 100000, cost: 89.95 }
      ]
    },
    currentUsage: 0,
    monthlyLimit: 40000,
    costThisMonth: 0,
    projectedMonthlyCost: 0,
    lastUpdated: new Date().toISOString(),
    status: 'healthy',
    optimization_suggestions: []
  }
];

export const useApiCostStore = create<ApiCostStore>()(
  persist(
    (set, get) => ({
      data: {
        calls: [],
        services: DEFAULT_SERVICES,
        alerts: [],
        budget: DEFAULT_BUDGET,
        monthly_summary: {
          total_spent: 0,
          total_calls: 0,
          average_cost_per_call: 0,
          top_services: [],
          cost_trend: 0,
          projected_monthly_cost: 0
        },
        daily_costs: [],
        cost_breakdown: []
      },
      timeRange: '30d',
      isLoading: false,
      lastUpdated: new Date().toISOString(),

      setTimeRange: (range) => {
        set({ timeRange: range });
      },

      trackApiCall: (callData) => {
        const call: ApiCall = {
          id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          ...callData
        };

        set((state) => {
          const newCalls = [...state.data.calls, call];
          const updatedServices = state.data.services.map(service => {
            if (service.id === call.service) {
              return {
                ...service,
                currentUsage: service.currentUsage + 1,
                costThisMonth: service.costThisMonth + call.cost,
                lastUpdated: new Date().toISOString()
              };
            }
            return service;
          });

          // Update daily costs
          const today = new Date().toISOString().split('T')[0];
          const dailyCosts = [...state.data.daily_costs];
          const todayIndex = dailyCosts.findIndex(d => d.date === today);
          
          if (todayIndex >= 0) {
            dailyCosts[todayIndex].amount += call.cost;
            dailyCosts[todayIndex].calls += 1;
          } else {
            dailyCosts.push({
              date: today,
              amount: call.cost,
              calls: 1
            });
          }

          return {
            ...state,
            data: {
              ...state.data,
              calls: newCalls,
              services: updatedServices,
              daily_costs: dailyCosts
            },
            lastUpdated: new Date().toISOString()
          };
        });

        // Check for budget alerts
        get().checkBudgetAlerts();
        
        // Sync with n8n if enabled
        if (Math.random() < 0.1) { // Sync 10% of the time to avoid too many calls
          get().syncWithN8n();
        }
      },

      updateServiceUsage: (serviceId, usage, cost) => {
        set((state) => ({
          ...state,
          data: {
            ...state.data,
            services: state.data.services.map(service =>
              service.id === serviceId
                ? {
                    ...service,
                    currentUsage: usage,
                    costThisMonth: cost,
                    lastUpdated: new Date().toISOString(),
                    status: usage > service.monthlyLimit * 0.9 ? 'critical' :
                           usage > service.monthlyLimit * 0.75 ? 'warning' : 'healthy'
                  }
                : service
            )
          },
          lastUpdated: new Date().toISOString()
        }));
      },

      setBudget: (budgetUpdate) => {
        set((state) => ({
          ...state,
          data: {
            ...state.data,
            budget: { ...state.data.budget, ...budgetUpdate }
          }
        }));
      },

      acknowledgeAlert: (alertId) => {
        set((state) => ({
          ...state,
          data: {
            ...state.data,
            alerts: state.data.alerts.map(alert =>
              alert.id === alertId ? { ...alert, acknowledged: true } : alert
            )
          }
        }));
      },

      fetchCostData: async () => {
        set({ isLoading: true });
        
        try {
          // In a real implementation, this would fetch from your API
          // For now, we'll simulate with the stored data and calculations
          const state = get();
          const now = new Date();
          const timeRangeMs = {
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '90d': 90 * 24 * 60 * 60 * 1000
          }[state.timeRange];

          const cutoffDate = new Date(now.getTime() - timeRangeMs);
          const filteredCalls = state.data.calls.filter(
            call => new Date(call.timestamp) >= cutoffDate
          );

          // Calculate summary statistics
          const totalSpent = filteredCalls.reduce((sum, call) => sum + call.cost, 0);
          const totalCalls = filteredCalls.length;
          const averageCostPerCall = totalCalls > 0 ? totalSpent / totalCalls : 0;

          // Calculate cost breakdown by service
          const serviceSpending = filteredCalls.reduce((acc, call) => {
            acc[call.service] = (acc[call.service] || 0) + call.cost;
            return acc;
          }, {} as Record<string, number>);

          const costBreakdown = Object.entries(serviceSpending)
            .map(([service, cost]) => ({
              service,
              cost,
              percentage: totalSpent > 0 ? (cost / totalSpent) * 100 : 0
            }))
            .sort((a, b) => b.cost - a.cost);

          const topServices = costBreakdown.slice(0, 5);

          set((prevState) => ({
            ...prevState,
            data: {
              ...prevState.data,
              monthly_summary: {
                total_spent: totalSpent,
                total_calls: totalCalls,
                average_cost_per_call: averageCostPerCall,
                top_services: topServices,
                cost_trend: 0, // Would be calculated from historical data
                projected_monthly_cost: totalSpent * (30 / (timeRangeMs / (24 * 60 * 60 * 1000)))
              },
              cost_breakdown: costBreakdown
            },
            isLoading: false,
            lastUpdated: new Date().toISOString()
          }));

        } catch (error) {
          console.error('Failed to fetch cost data:', error);
          set({ isLoading: false });
        }
      },

      exportCostReport: (format) => {
        const state = get();
        const reportData = {
          summary: state.data.monthly_summary,
          services: state.data.services,
          calls: state.data.calls,
          budget: state.data.budget,
          exported_at: new Date().toISOString()
        };

        if (format === 'json') {
          const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `api-cost-report-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else if (format === 'csv') {
          const csvData = [
            ['Service', 'Current Usage', 'Cost This Month', 'Status', 'Last Updated'],
            ...state.data.services.map(service => [
              service.name,
              service.currentUsage.toString(),
              service.costThisMonth.toFixed(2),
              service.status,
              service.lastUpdated
            ])
          ];
          
          const csvContent = csvData.map(row => row.join(',')).join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `api-cost-report-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      },

      optimizeService: (serviceId) => {
        set((state) => ({
          ...state,
          data: {
            ...state.data,
            services: state.data.services.map(service =>
              service.id === serviceId
                ? {
                    ...service,
                    optimization_suggestions: [
                      'Caching enabled for 1 hour',
                      'Request batching implemented',
                      'Rate limiting optimized'
                    ]
                  }
                : service
            )
          }
        }));
      },

      syncWithN8n: async () => {
        try {
          const state = get();
          const payload = {
            user_id: 'current_user',
            cost_data: state.data,
            timestamp: new Date().toISOString()
          };

          // Send to n8n webhook
          await fetch('http://localhost:5678/webhook/api-cost-tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

        } catch (error) {
          console.error('Failed to sync with n8n:', error);
        }
      },

      // Helper method to check budget alerts
      checkBudgetAlerts: () => {
        const state = get();
        const totalSpent = state.data.services.reduce((sum, service) => sum + service.costThisMonth, 0);
        const budget = state.data.budget.monthly_budget;
        const spendingPercentage = (totalSpent / budget) * 100;
        
        const newAlerts: CostAlert[] = [];

        if (spendingPercentage >= state.data.budget.alert_thresholds.critical) {
          newAlerts.push({
            id: `alert_${Date.now()}`,
            service: 'Overall Budget',
            type: 'budget_exceeded',
            severity: 'critical',
            message: `You've spent ${spendingPercentage.toFixed(1)}% of your monthly budget`,
            impact: totalSpent - budget,
            recommendation: 'Consider reducing API usage or increasing budget',
            createdAt: new Date().toISOString(),
            acknowledged: false
          });
        } else if (spendingPercentage >= state.data.budget.alert_thresholds.warning) {
          newAlerts.push({
            id: `alert_${Date.now()}`,
            service: 'Overall Budget',
            type: 'approaching_limit',
            severity: 'medium',
            message: `You've spent ${spendingPercentage.toFixed(1)}% of your monthly budget`,
            impact: 0,
            recommendation: 'Monitor usage closely for the rest of the month',
            createdAt: new Date().toISOString(),
            acknowledged: false
          });
        }

        if (newAlerts.length > 0) {
          set((prevState) => ({
            ...prevState,
            data: {
              ...prevState.data,
              alerts: [...prevState.data.alerts, ...newAlerts]
            }
          }));
        }
      }
    }),
    {
      name: 'api-cost-store',
      partialize: (state) => ({
        data: state.data,
        timeRange: state.timeRange
      })
    }
  )
);