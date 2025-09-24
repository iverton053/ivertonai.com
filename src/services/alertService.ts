import { realTimeService, AlertEvent } from './realTimeService';

export interface AlertRule {
  id: string;
  name: string;
  condition: {
    field: string; // 'status' | 'success_rate' | 'execution_time' | 'cpu_usage' | 'memory_usage'
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldownMinutes: number; // Prevent alert spam
  lastTriggered?: string;
}

export interface AlertHistory {
  id: string;
  alert: AlertEvent;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  dismissedAt?: string;
  resolvedAt?: string;
}

class AlertService {
  private alerts: Map<string, AlertEvent> = new Map();
  private history: AlertHistory[] = [];
  private rules: AlertRule[] = [];
  private lastTriggered: Map<string, number> = new Map();
  private listeners: Function[] = [];
  private soundEnabled = true;
  private notificationsEnabled = true;

  constructor() {
    this.initializeDefaultRules();
    this.setupRealtimeListeners();
  }

  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'automation_failure',
        name: 'Automation Failure',
        condition: {
          field: 'status',
          operator: 'equals',
          value: 'failed'
        },
        severity: 'high',
        enabled: true,
        cooldownMinutes: 5
      },
      {
        id: 'low_success_rate',
        name: 'Low Success Rate',
        condition: {
          field: 'success_rate',
          operator: 'less_than',
          value: 85
        },
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 15
      },
      {
        id: 'high_execution_time',
        name: 'High Execution Time',
        condition: {
          field: 'execution_time',
          operator: 'greater_than',
          value: 300000 // 5 minutes in ms
        },
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 10
      },
      {
        id: 'high_cpu_usage',
        name: 'High CPU Usage',
        condition: {
          field: 'cpu_usage',
          operator: 'greater_than',
          value: 80
        },
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 5
      },
      {
        id: 'high_memory_usage',
        name: 'High Memory Usage',
        condition: {
          field: 'memory_usage',
          operator: 'greater_than',
          value: 90
        },
        severity: 'high',
        enabled: true,
        cooldownMinutes: 5
      }
    ];
  }

  private setupRealtimeListeners() {
    realTimeService.on('alert', (alert: AlertEvent) => {
      this.handleIncomingAlert(alert);
    });

    realTimeService.on('automation_update', (update: any) => {
      this.checkAutomationRules(update);
    });
  }

  private handleIncomingAlert(alert: AlertEvent) {
    // Add to active alerts
    this.alerts.set(alert.id, alert);
    
    // Add to history
    this.history.unshift({
      id: alert.id,
      alert,
    });

    // Keep history size manageable
    if (this.history.length > 1000) {
      this.history = this.history.slice(0, 1000);
    }

    // Notify listeners
    this.notifyListeners('alert_received', alert);

    // Handle notifications
    this.handleNotification(alert);
  }

  private checkAutomationRules(update: any) {
    this.rules.forEach(rule => {
      if (!rule.enabled) return;

      // Check cooldown
      const lastTriggered = this.lastTriggered.get(rule.id);
      const now = Date.now();
      if (lastTriggered && (now - lastTriggered) < rule.cooldownMinutes * 60 * 1000) {
        return;
      }

      // Evaluate condition
      if (this.evaluateCondition(rule.condition, update)) {
        this.triggerAlert(rule, update);
      }
    });
  }

  private evaluateCondition(condition: AlertRule['condition'], data: any): boolean {
    let fieldValue = data[condition.field];
    
    // Handle nested fields (e.g., performance.cpuUsage)
    if (!fieldValue && condition.field.includes('.')) {
      const parts = condition.field.split('.');
      fieldValue = parts.reduce((obj, key) => obj?.[key], data);
    }

    if (fieldValue === undefined || fieldValue === null) {
      return false;
    }

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      default:
        return false;
    }
  }

  private triggerAlert(rule: AlertRule, data: any) {
    const alert: AlertEvent = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.getSeverityType(rule.severity),
      title: rule.name,
      message: this.generateAlertMessage(rule, data),
      automationId: data.id,
      timestamp: new Date().toISOString(),
      severity: rule.severity,
      acknowledged: false
    };

    // Update last triggered time
    this.lastTriggered.set(rule.id, Date.now());

    // Handle the alert
    this.handleIncomingAlert(alert);
  }

  private getSeverityType(severity: string): AlertEvent['type'] {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  }

  private generateAlertMessage(rule: AlertRule, data: any): string {
    const automationName = data.title || data.name || data.id;
    
    switch (rule.id) {
      case 'automation_failure':
        return `Automation "${automationName}" has failed. Error: ${data.error || 'Unknown error'}`;
      case 'low_success_rate':
        return `Automation "${automationName}" has a success rate of ${data.success_rate || 0}%, which is below the threshold of ${rule.condition.value}%`;
      case 'high_execution_time':
        return `Automation "${automationName}" took ${Math.round((data.performance?.executionTime || 0) / 1000)}s to execute, which exceeds the ${rule.condition.value / 1000}s threshold`;
      case 'high_cpu_usage':
        return `Automation "${automationName}" is using ${data.performance?.cpuUsage || 0}% CPU, which exceeds the ${rule.condition.value}% threshold`;
      case 'high_memory_usage':
        return `Automation "${automationName}" is using ${data.performance?.memoryUsage || 0}% memory, which exceeds the ${rule.condition.value}% threshold`;
      default:
        return `Alert triggered for automation "${automationName}"`;
    }
  }

  private handleNotification(alert: AlertEvent) {
    // Browser notification
    if (this.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: this.getAlertIcon(alert.severity),
        tag: alert.id,
        requireInteraction: alert.severity === 'critical'
      });
    }

    // Sound notification
    if (this.soundEnabled) {
      this.playAlertSound(alert.severity);
    }
  }

  private getAlertIcon(severity: string): string {
    // Return appropriate icon based on severity
    return '/icons/alert-' + severity + '.png';
  }

  private playAlertSound(severity: string) {
    try {
      const audio = new Audio();
      switch (severity) {
        case 'critical':
          audio.src = '/sounds/critical-alert.mp3';
          break;
        case 'high':
          audio.src = '/sounds/error-alert.mp3';
          break;
        case 'medium':
          audio.src = '/sounds/warning-alert.mp3';
          break;
        default:
          audio.src = '/sounds/info-alert.mp3';
      }
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      });
    } catch (error) {
      // Audio not supported or files not found
      console.warn('Could not play alert sound:', error);
    }
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in alert listener:', error);
      }
    });
  }

  // Public API
  getActiveAlerts(): AlertEvent[] {
    return Array.from(this.alerts.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getAlertHistory(): AlertHistory[] {
    return [...this.history];
  }

  acknowledgeAlert(alertId: string, userId?: string) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      
      // Update history
      const historyItem = this.history.find(h => h.id === alertId);
      if (historyItem) {
        historyItem.acknowledgedAt = new Date().toISOString();
        historyItem.acknowledgedBy = userId;
      }

      // Notify backend
      realTimeService.acknowledgeAlert(alertId);
      
      // Notify listeners
      this.notifyListeners('alert_acknowledged', alert);
    }
  }

  dismissAlert(alertId: string) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      this.alerts.delete(alertId);
      
      // Update history
      const historyItem = this.history.find(h => h.id === alertId);
      if (historyItem) {
        historyItem.dismissedAt = new Date().toISOString();
      }

      // Notify backend
      realTimeService.dismissAlert(alertId);
      
      // Notify listeners
      this.notifyListeners('alert_dismissed', alert);
    }
  }

  clearAllAlerts() {
    const alertIds = Array.from(this.alerts.keys());
    alertIds.forEach(id => this.dismissAlert(id));
  }

  // Settings
  enableSound(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  enableNotifications(enabled: boolean) {
    this.notificationsEnabled = enabled;
    
    // Request permission if enabling
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // Rules management
  getRules(): AlertRule[] {
    return [...this.rules];
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>) {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex > -1) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    }
  }

  addRule(rule: Omit<AlertRule, 'id'>): string {
    const newRule: AlertRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...rule
    };
    this.rules.push(newRule);
    return newRule.id;
  }

  deleteRule(ruleId: string) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  // Event listeners
  onAlert(callback: (event: string, data: any) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Statistics
  getAlertStats() {
    const active = this.getActiveAlerts();
    const total = this.history.length;
    const acknowledged = this.history.filter(h => h.acknowledgedAt).length;
    const bySeverity = active.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      activeCount: active.length,
      totalCount: total,
      acknowledgedCount: acknowledged,
      bySeverity
    };
  }
}

// Export singleton instance
export const alertService = new AlertService();
export default alertService;