export type NotificationType = 
  | 'security' 
  | 'backup' 
  | 'system' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface BaseNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: NotificationPriority;
  persistent?: boolean; // Won't auto-dismiss
  autoHide?: boolean; // Auto-hide after delay
  hideDelay?: number; // ms to auto-hide
  actions?: NotificationAction[];
  icon?: string;
  category?: string;
  metadata?: Record<string, any>;
}

// Specific notification types for better type safety
export interface SecurityNotification extends BaseNotification {
  type: 'security';
  securityEvent: 'session_warning' | 'account_locked' | 'csrf_refresh' | 'failed_attempt' | 'session_expired';
}

export interface BackupNotification extends BaseNotification {
  type: 'backup';
  backupEvent: 'backup_created' | 'backup_failed' | 'restore_completed' | 'restore_failed' | 'schedule_updated';
  backupId?: string;
}

export interface SystemNotification extends BaseNotification {
  type: 'system';
  systemEvent: 'maintenance' | 'update_available' | 'connection_lost' | 'connection_restored';
}

// Rename to avoid conflict with browser Notification API
export type AppNotification = SecurityNotification | BackupNotification | SystemNotification | BaseNotification;

export interface NotificationFilter {
  types?: NotificationType[];
  priority?: NotificationPriority[];
  read?: boolean;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface NotificationPreferences {
  enableSound: boolean;
  enableDesktop: boolean;
  enableInApp: boolean;
  autoMarkAsRead: boolean;
  groupSimilar: boolean;
  maxNotifications: number;
  retentionDays: number;
  priorities: {
    [key in NotificationPriority]: {
      sound: boolean;
      desktop: boolean;
      persistent: boolean;
    };
  };
}