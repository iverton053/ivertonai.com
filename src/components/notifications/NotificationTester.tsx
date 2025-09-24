import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Database, Settings, CheckCircle, AlertTriangle } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

const NotificationTester: React.FC = () => {
  const addTestNotifications = () => {
    // Success notification
    notificationService.add({
      type: 'success',
      title: 'Operation Completed',
      message: 'Your request has been processed successfully!',
      priority: 'low',
      icon: 'CheckCircle',
      category: 'general',
      autoHide: false,
    });

    // Add multiple notifications to test scrolling
    const notifications = [
      {
        type: 'warning' as const,
        title: 'Storage Space Low',
        message: 'Your storage is 85% full. Consider removing old files to free up space.',
        priority: 'medium' as const,
        icon: 'AlertTriangle',
        category: 'system',
        actions: [{ label: 'Clean Up', style: 'primary' as const, action: () => console.log('Opening cleanup tool...') }]
      },
      {
        type: 'info' as const,
        title: 'Update Available',
        message: 'A new version of the dashboard is available for download.',
        priority: 'low' as const,
        icon: 'Info',
        category: 'system'
      },
      {
        type: 'error' as const,
        title: 'Connection Error',
        message: 'Failed to connect to the remote server. Please check your internet connection.',
        priority: 'high' as const,
        icon: 'AlertTriangle',
        category: 'network'
      }
    ];

    notifications.forEach((notif, index) => {
      setTimeout(() => {
        notificationService.add(notif);
      }, (index + 1) * 500);
    });

    // Security notification
    setTimeout(() => {
      notificationService.addSecurity(
        'failed_attempt',
        'Security Alert',
        'Multiple failed login attempts detected from IP 192.168.1.100. Immediate action required.',
        'high',
        [
          { label: 'Block IP', style: 'danger', action: () => console.log('Blocking IP address...') },
          { label: 'View Details', style: 'secondary', action: () => console.log('Opening security logs...') }
        ]
      );
    }, 2500);

    // Backup notifications
    setTimeout(() => {
      notificationService.addBackup(
        'backup_created',
        'Backup Completed',
        'Daily backup has been created successfully. Size: 15.2 MB',
        'low'
      );
    }, 3000);

    // Critical system notification
    setTimeout(() => {
      notificationService.addSystem(
        'service_down',
        'Critical Service Down',
        'Database connection lost. System functionality may be impacted.',
        'critical'
      );
    }, 3500);

    // More notifications for scrolling test
    setTimeout(() => {
      notificationService.add({
        type: 'success',
        title: 'Task Automated',
        message: 'Weekly report generation has been successfully automated.',
        priority: 'medium',
        icon: 'CheckCircle',
        category: 'automation'
      });
    }, 4000);
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={addTestNotifications}
        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg"
      >
        <Bell className="w-4 h-4" />
        <span className="text-sm font-medium">Test Notifications</span>
      </motion.button>
    </div>
  );
};

export default NotificationTester;