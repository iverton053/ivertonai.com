import { 
  AppNotification, 
  NotificationType, 
  NotificationPriority, 
  NotificationPreferences,
  SecurityNotification,
  BackupNotification,
  SystemNotification,
  NotificationAction
} from '../types/notifications';

class NotificationService {
  private listeners: Set<(notifications: AppNotification[]) => void> = new Set();
  private notifications: AppNotification[] = [];
  private readonly STORAGE_KEY = 'dashboard_notifications';
  private readonly PREFS_STORAGE_KEY = 'notification_preferences';
  
  private defaultPreferences: NotificationPreferences = {
    enableSound: true,
    enableDesktop: false, // Disabled by default for privacy
    enableInApp: true,
    autoMarkAsRead: false,
    groupSimilar: true,
    maxNotifications: 100,
    retentionDays: 30,
    priorities: {
      low: { sound: false, desktop: false, persistent: false },
      medium: { sound: true, desktop: false, persistent: false },
      high: { sound: true, desktop: true, persistent: true },
      critical: { sound: true, desktop: true, persistent: true },
    },
  };

  private preferences: NotificationPreferences;

  constructor() {
    this.preferences = this.loadPreferences();
    this.loadNotifications();
    this.requestNotificationPermission();
    
    // Clean up old notifications on startup
    this.cleanupOldNotifications();
    
    // Add some initial test notifications if none exist
    this.initializeTestNotifications();
    
  }

  // Load notifications from localStorage
  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  // Save notifications to localStorage
  private saveNotifications(): void {
    try {
      // Keep only the most recent notifications within the limit
      const sortedNotifications = [...this.notifications]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.preferences.maxNotifications);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sortedNotifications));
      this.notifications = sortedNotifications;
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Load preferences
  private loadPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(this.PREFS_STORAGE_KEY);
      if (stored) {
        return { ...this.defaultPreferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
    return this.defaultPreferences;
  }

  // Save preferences
  public updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    try {
      localStorage.setItem(this.PREFS_STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  // Request browser notification permission
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && this.preferences.enableDesktop) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }

  // Clean up old notifications
  private cleanupOldNotifications(): void {
    const cutoffDate = Date.now() - (this.preferences.retentionDays * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(notification => 
      notification.timestamp > cutoffDate || notification.persistent
    );
    this.saveNotifications();
  }

  // Generate unique notification ID
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add notification listener
  public subscribe(listener: (notifications: AppNotification[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.notifications); // Send current notifications immediately
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Play notification sound
  private playNotificationSound(priority: NotificationPriority): void {
    if (!this.preferences.enableSound) return;
    if (!this.preferences.priorities[priority].sound) return;

    try {
      // Create different sounds for different priorities
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different priorities
      const frequencies = {
        low: 400,
        medium: 600,
        high: 800,
        critical: 1000,
      };

      oscillator.frequency.value = frequencies[priority];
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  // Show desktop notification
  private showDesktopNotification(notification: AppNotification): void {
    if (!this.preferences.enableDesktop) return;
    if (!this.preferences.priorities[notification.priority].desktop) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical',
      });

      desktopNotification.onclick = () => {
        window.focus();
        this.markAsRead(notification.id);
        desktopNotification.close();
      };

      // Auto-close after a delay
      if (!notification.persistent) {
        setTimeout(() => desktopNotification.close(), notification.hideDelay || 5000);
      }
    } catch (error) {
      console.warn('Failed to show desktop notification:', error);
    }
  }

  // Add a new notification
  public add(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): string {
    const newNotification: AppNotification = {
      ...notification,
      id: this.generateId(),
      timestamp: Date.now(),
      read: false,
    };

    // Check for similar notifications if grouping is enabled
    if (this.preferences.groupSimilar) {
      const similar = this.notifications.find(n => 
        n.type === notification.type &&
        n.title === notification.title &&
        n.category === notification.category &&
        !n.read &&
        (Date.now() - n.timestamp) < 60000 // Within 1 minute
      );

      if (similar) {
        // Update the existing notification instead of creating a new one
        similar.message = notification.message;
        similar.timestamp = Date.now();
        similar.metadata = { ...similar.metadata, count: (similar.metadata?.count || 1) + 1 };
        this.saveNotifications();
        this.notifyListeners();
        return similar.id;
      }
    }

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    
    // Play sound and show desktop notification
    this.playNotificationSound(notification.priority);
    this.showDesktopNotification(newNotification);
    
    // Auto-hide if configured
    if (newNotification.autoHide && !this.preferences.priorities[notification.priority].persistent) {
      setTimeout(() => {
        this.remove(newNotification.id);
      }, newNotification.hideDelay || 5000);
    }

    this.notifyListeners();
    return newNotification.id;
  }

  // Convenience methods for specific notification types
  public addSecurity(
    securityEvent: SecurityNotification['securityEvent'],
    title: string,
    message: string,
    priority: NotificationPriority = 'high',
    actions?: NotificationAction[]
  ): string {
    return this.add({
      type: 'security',
      securityEvent,
      title,
      message,
      priority,
      actions,
      icon: 'Shield',
      category: 'security',
      persistent: priority === 'critical',
    });
  }

  public addBackup(
    backupEvent: BackupNotification['backupEvent'],
    title: string,
    message: string,
    priority: NotificationPriority = 'medium',
    backupId?: string
  ): string {
    return this.add({
      type: 'backup',
      backupEvent,
      backupId,
      title,
      message,
      priority,
      icon: 'Database',
      category: 'backup',
    });
  }

  public addSystem(
    systemEvent: SystemNotification['systemEvent'],
    title: string,
    message: string,
    priority: NotificationPriority = 'medium'
  ): string {
    return this.add({
      type: 'system',
      systemEvent,
      title,
      message,
      priority,
      icon: 'Settings',
      category: 'system',
    });
  }

  public addSuccess(title: string, message: string, autoHide: boolean = true): string {
    return this.add({
      type: 'success',
      title,
      message,
      priority: 'low',
      icon: 'CheckCircle',
      autoHide,
      hideDelay: 3000,
    });
  }

  public addError(title: string, message: string, actions?: NotificationAction[]): string {
    return this.add({
      type: 'error',
      title,
      message,
      priority: 'high',
      icon: 'AlertTriangle',
      persistent: true,
      actions,
    });
  }

  // Get all notifications
  public getAll(): AppNotification[] {
    return [...this.notifications];
  }

  // Get unread count
  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Get notifications by type
  public getByType(type: NotificationType): AppNotification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Mark notification as read
  public markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Mark all as read
  public markAllAsRead(): void {
    let hasChanges = false;
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Remove notification
  public remove(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Clear all notifications
  public clear(): void {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // Clear notifications by type
  public clearByType(type: NotificationType): void {
    this.notifications = this.notifications.filter(n => n.type !== type);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Get current preferences
  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Initialize test notifications for demonstration (disabled by default)
  private initializeTestNotifications(): void {
    // Only add a welcome notification if no notifications exist
    if (this.notifications.length === 0) {
      this.add({
        type: 'info',
        title: 'Welcome to Dashboard',
        message: 'Your notification center is ready! Click the bell icon to see all notifications.',
        priority: 'low',
        icon: 'Bell',
        category: 'system',
        autoHide: false,
      });
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();