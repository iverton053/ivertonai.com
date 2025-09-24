import { useEffect } from 'react';
import { notificationService } from '../services/notificationService';

// Hook to add demo notifications for testing (disabled to prevent notification mess)
export const useNotificationDemo = () => {
  useEffect(() => {
    // Demo notifications disabled to prevent overwhelming users
    // Use the NotificationTester component instead for manual testing
  }, []);
};

// Export for manual testing
export const addTestNotifications = () => {
  // High priority security alert
  notificationService.addSecurity(
    'failed_attempt',
    'Security Alert',
    'Suspicious login attempt detected from unknown location.',
    'high',
    [{
      label: 'View Details',
      action: () => console.log('Opening security details...'),
      style: 'primary'
    }]
  );

  // Backup notification
  notificationService.addBackup(
    'backup_created',
    'Daily Backup Complete',
    'Your scheduled backup has been created successfully (15.2 MB).',
    'medium',
    'backup_001'
  );

  // Critical system notification
  notificationService.addSystem(
    'maintenance',
    'Scheduled Maintenance',
    'System maintenance window will begin in 2 hours.',
    'high'
  );

  // Error notification with actions
  notificationService.addError(
    'Connection Failed',
    'Unable to connect to backup storage. Please check your connection.',
    [{
      label: 'Retry',
      action: () => console.log('Retrying connection...'),
      style: 'primary'
    }, {
      label: 'Settings',
      action: () => console.log('Opening settings...'),
      style: 'secondary'
    }]
  );
};

export default useNotificationDemo;