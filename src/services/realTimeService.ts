import { io, Socket } from 'socket.io-client';

export interface AutomationUpdate {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'fresh' | 'stale';
  progress?: number;
  timestamp: string;
  message?: string;
  error?: string;
  performance?: {
    cpuUsage: number;
    memoryUsage: number;
    executionTime: number;
  };
}

export interface AlertEvent {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  automationId?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
}

class RealTimeService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    try {
      // In development, use mock service. In production, use actual WebSocket URL
      const isProduction = process.env.NODE_ENV === 'production';
      const socketUrl = isProduction 
        ? process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8080'
        : 'mock://localhost';

      if (!isProduction) {
        // Initialize mock service for development
        this.initializeMockService();
        return;
      }

      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.warn('WebSocket connection failed, falling back to mock service:', error);
      this.initializeMockService();
    }
  }

  private initializeMockService() {
    // Mock service for development/demo purposes
    console.log('🔄 Initializing mock real-time service');
    
    // Simulate connection events
    setTimeout(() => {
      this.emit('connected', { status: 'connected', timestamp: new Date().toISOString() });
    }, 100);

    // Simulate periodic automation updates
    this.startMockUpdates();
  }

  private startMockUpdates() {
    // Send mock automation updates every 10 seconds
    setInterval(() => {
      const mockUpdate: AutomationUpdate = {
        id: `automation_${Math.floor(Math.random() * 5) + 1}`,
        status: ['running', 'completed', 'fresh', 'stale'][Math.floor(Math.random() * 4)] as any,
        progress: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString(),
        performance: {
          cpuUsage: Math.floor(Math.random() * 100),
          memoryUsage: Math.floor(Math.random() * 100),
          executionTime: Math.floor(Math.random() * 5000) + 1000,
        }
      };

      this.emit('automation_update', mockUpdate);
    }, 10000);

    // Send mock alerts occasionally
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of alert
        const alertTypes: AlertEvent['type'][] = ['error', 'warning', 'success', 'info'];
        const severities: AlertEvent['severity'][] = ['low', 'medium', 'high', 'critical'];
        
        const mockAlert: AlertEvent = {
          id: `alert_${Date.now()}`,
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          title: 'Automation Alert',
          message: 'Mock alert for testing purposes',
          automationId: `automation_${Math.floor(Math.random() * 5) + 1}`,
          timestamp: new Date().toISOString(),
          severity: severities[Math.floor(Math.random() * severities.length)],
          acknowledged: false
        };

        this.emit('alert', mockAlert);
      }
    }, 30000);
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔗 Connected to real-time service');
      this.reconnectAttempts = 0;
      this.emit('connected', { status: 'connected', timestamp: new Date().toISOString() });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from real-time service:', reason);
      this.emit('disconnected', { status: 'disconnected', reason, timestamp: new Date().toISOString() });
    });

    this.socket.on('automation_update', (update: AutomationUpdate) => {
      this.emit('automation_update', update);
    });

    this.socket.on('alert', (alert: AlertEvent) => {
      this.emit('alert', alert);
    });

    this.socket.on('system_status', (status: any) => {
      this.emit('system_status', status);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Connection error:', error);
      this.handleConnectionError();
    });
  }

  private handleConnectionError() {
    this.reconnectAttempts++;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🔄 Max reconnection attempts reached, falling back to mock service');
      this.initializeMockService();
    }
  }

  // Event emitter functionality
  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // Public API
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const listeners = this.listeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  // Send commands to backend
  sendCommand(command: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(command, data);
    } else {
      console.warn('Cannot send command: not connected to real-time service');
    }
  }

  // Automation control methods
  startAutomation(automationId: string) {
    this.sendCommand('start_automation', { automationId });
  }

  stopAutomation(automationId: string) {
    this.sendCommand('stop_automation', { automationId });
  }

  pauseAutomation(automationId: string) {
    this.sendCommand('pause_automation', { automationId });
  }

  refreshAutomation(automationId: string) {
    this.sendCommand('refresh_automation', { automationId });
  }

  bulkAction(action: string, automationIds: string[]) {
    this.sendCommand('bulk_action', { action, automationIds });
  }

  // Alert management
  acknowledgeAlert(alertId: string) {
    this.sendCommand('acknowledge_alert', { alertId });
  }

  dismissAlert(alertId: string) {
    this.sendCommand('dismiss_alert', { alertId });
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus(): string {
    if (!this.socket) return 'mock';
    return this.socket.connected ? 'connected' : 'disconnected';
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService();
export default realTimeService;