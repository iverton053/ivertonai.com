import { format } from 'date-fns';
import { secureApiService } from './secureApiService';
import { notificationService } from './notificationService';

// Types for backup system
export interface BackupMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  version: string;
  size: number;
  type: 'manual' | 'scheduled' | 'auto';
  dataTypes: string[];
  checksum: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: {
    userStore: any;
    appStore: any;
    widgetStore: any;
    historyStore: any;
    settingsStore: any;
    customData: any;
    dashboardConfig: any;
    widgets: any[];
    automations: any[];
    reports: any[];
    analytics: any;
  };
}

export interface BackupOptions {
  includeUserData: boolean;
  includeSettings: boolean;
  includeWidgets: boolean;
  includeHistory: boolean;
  includeReports: boolean;
  includeAnalytics: boolean;
  includeAutomations: boolean;
  compress: boolean;
  encrypt: boolean;
}

class BackupService {
  private readonly BACKUP_VERSION = '1.0.0';
  private readonly STORAGE_KEY = 'iverton_backups';

  // Create a complete backup
  async createBackup(options: Partial<BackupOptions> = {}): Promise<BackupData> {
    const defaultOptions: BackupOptions = {
      includeUserData: true,
      includeSettings: true,
      includeWidgets: true,
      includeHistory: true,
      includeReports: true,
      includeAnalytics: true,
      includeAutomations: true,
      compress: false,
      encrypt: false,
    };

    const finalOptions = { ...defaultOptions, ...options };
    const timestamp = new Date().toISOString();
    const backupId = this.generateBackupId();

    // Collect data from all stores
    const collectedData = await this.collectSystemData(finalOptions);
    
    // Calculate data size and checksum
    const dataString = JSON.stringify(collectedData);
    const size = new Blob([dataString]).size;
    const checksum = await this.calculateChecksum(dataString);

    // Create metadata
    const metadata: BackupMetadata = {
      id: backupId,
      name: `Backup_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`,
      description: 'Automated system backup',
      createdAt: timestamp,
      version: this.BACKUP_VERSION,
      size,
      type: 'manual',
      dataTypes: this.getIncludedDataTypes(finalOptions),
      checksum,
    };

    const backup: BackupData = {
      metadata,
      data: collectedData,
    };

    // Save backup to local storage (for demo - in production would go to server)
    await this.saveBackupLocally(backup);

    // Send success notification
    notificationService.addBackup(
      'backup_created',
      'Backup Created Successfully',
      `Backup "${metadata.name}" created with ${metadata.dataTypes.length} data types (${(metadata.size / 1024 / 1024).toFixed(2)} MB)`,
      'medium',
      metadata.id
    );

    return backup;
  }

  // Restore from backup
  async restoreFromBackup(backupData: BackupData, options: Partial<BackupOptions> = {}): Promise<boolean> {
    try {
      // Verify backup integrity
      const isValid = await this.verifyBackup(backupData);
      if (!isValid) {
        throw new Error('Backup verification failed - corrupt or invalid data');
      }

      // Create restore point before restoration
      const restorePoint = await this.createRestorePoint();
      
      try {
        // Restore data to stores
        await this.restoreSystemData(backupData.data, options);
        
        // Log successful restore
        console.log('✅ Backup restored successfully:', backupData.metadata.name);
        
        // Send success notification
        notificationService.addBackup(
          'restore_completed',
          'Restore Completed Successfully',
          `Data restored from backup "${backupData.metadata.name}". Page will reload shortly.`,
          'high',
          backupData.metadata.id
        );
        
        return true;
      } catch (restoreError) {
        // If restore fails, revert to restore point
        console.error('❌ Restore failed, reverting to restore point:', restoreError);
        await this.restoreFromBackup(restorePoint, {});
        throw restoreError;
      }
    } catch (error) {
      console.error('❌ Backup restoration failed:', error);
      
      // Send error notification
      notificationService.addBackup(
        'restore_failed',
        'Restore Failed',
        `Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'high'
      );
      
      return false;
    }
  }

  // Get all available backups
  async getAvailableBackups(): Promise<BackupMetadata[]> {
    try {
      const backups = localStorage.getItem(this.STORAGE_KEY);
      if (!backups) return [];
      
      const parsedBackups = JSON.parse(backups);
      return parsedBackups.map((backup: BackupData) => backup.metadata);
    } catch (error) {
      console.error('Error fetching backups:', error);
      return [];
    }
  }

  // Delete a backup
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backups = await this.getAllBackups();
      const filteredBackups = backups.filter(backup => backup.metadata.id !== backupId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBackups));
      return true;
    } catch (error) {
      console.error('Error deleting backup:', error);
      return false;
    }
  }

  // Export backup as downloadable file
  async exportBackup(backupId: string): Promise<void> {
    try {
      const backup = await this.getBackupById(backupId);
      if (!backup) throw new Error('Backup not found');

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${backup.metadata.name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting backup:', error);
      throw error;
    }
  }

  // Import backup from file
  async importBackup(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const backupData: BackupData = JSON.parse(content);
          
          // Validate backup format
          if (!this.isValidBackupFormat(backupData)) {
            throw new Error('Invalid backup file format');
          }

          // Save imported backup
          await this.saveBackupLocally(backupData);
          resolve(backupData);
        } catch (error) {
          reject(new Error(`Failed to import backup: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read backup file'));
      reader.readAsText(file);
    });
  }

  // Scheduled backup functionality
  async scheduleBackup(schedule: string, options: BackupOptions): Promise<void> {
    // Implementation would depend on your scheduling system
    // For demo purposes, we'll simulate with setTimeout
    console.log(`📅 Backup scheduled: ${schedule}`);
    
    // In a real application, you'd integrate with a job scheduler
    const scheduleBackup = () => {
      this.createBackup(options).then(backup => {
        console.log('🔄 Scheduled backup created:', backup.metadata.name);
      });
    };

    // Example: daily backup at midnight
    if (schedule === 'daily') {
      setInterval(scheduleBackup, 24 * 60 * 60 * 1000);
    }
  }

  // Private helper methods
  private async collectSystemData(options: BackupOptions): Promise<any> {
    const data: any = {};

    if (options.includeUserData) {
      data.userStore = this.getStoreData('user');
    }

    if (options.includeSettings) {
      data.settingsStore = this.getStoreData('settings');
      data.appStore = this.getStoreData('app');
    }

    if (options.includeWidgets) {
      data.widgetStore = this.getStoreData('widget');
      data.widgets = this.getWidgetsData();
    }

    if (options.includeHistory) {
      data.historyStore = this.getStoreData('history');
    }

    if (options.includeReports) {
      data.reports = this.getReportsData();
    }

    if (options.includeAnalytics) {
      data.analytics = this.getAnalyticsData();
    }

    if (options.includeAutomations) {
      data.automations = this.getAutomationsData();
    }

    // Include dashboard configuration
    data.dashboardConfig = {
      layout: 'grid',
      theme: 'dark',
      version: this.BACKUP_VERSION,
      timestamp: new Date().toISOString(),
    };

    return data;
  }

  private async restoreSystemData(data: any, options: Partial<BackupOptions>): Promise<void> {
    if (data.userStore && options.includeUserData !== false) {
      this.restoreStoreData('user', data.userStore);
    }

    if (data.settingsStore && options.includeSettings !== false) {
      this.restoreStoreData('settings', data.settingsStore);
    }

    if (data.appStore && options.includeSettings !== false) {
      this.restoreStoreData('app', data.appStore);
    }

    if (data.widgetStore && options.includeWidgets !== false) {
      this.restoreStoreData('widget', data.widgetStore);
    }

    if (data.historyStore && options.includeHistory !== false) {
      this.restoreStoreData('history', data.historyStore);
    }

    // Trigger page reload to ensure all stores are properly updated
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  private getStoreData(storeName: string): any {
    // In a real implementation, you'd access your actual stores
    // For now, get from localStorage
    const keys = [
      'user-store',
      'app-store', 
      'widget-store',
      'history-store',
      'settings-store'
    ];
    
    const storeData: any = {};
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          storeData[key] = JSON.parse(data);
        } catch (e) {
          storeData[key] = data;
        }
      }
    });
    
    return storeData;
  }

  private restoreStoreData(storeName: string, data: any): void {
    // Restore data to localStorage (in production would update actual stores)
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]));
      }
    });
  }

  private getWidgetsData(): any[] {
    // Get widgets configuration
    const widgets = localStorage.getItem('dashboard-widgets');
    return widgets ? JSON.parse(widgets) : [];
  }

  private getReportsData(): any[] {
    // Get reports data
    const reports = localStorage.getItem('dashboard-reports');
    return reports ? JSON.parse(reports) : [];
  }

  private getAnalyticsData(): any {
    // Get analytics data
    const analytics = localStorage.getItem('dashboard-analytics');
    return analytics ? JSON.parse(analytics) : {};
  }

  private getAutomationsData(): any[] {
    // Get automations data
    const automations = localStorage.getItem('dashboard-automations');
    return automations ? JSON.parse(automations) : [];
  }

  private async saveBackupLocally(backup: BackupData): Promise<void> {
    try {
      const existingBackups = await this.getAllBackups();
      const updatedBackups = [...existingBackups, backup];
      
      // Keep only last 10 backups to prevent storage overflow
      const limitedBackups = updatedBackups.slice(-10);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedBackups));
    } catch (error) {
      console.error('Error saving backup:', error);
      throw error;
    }
  }

  private async getAllBackups(): Promise<BackupData[]> {
    try {
      const backups = localStorage.getItem(this.STORAGE_KEY);
      return backups ? JSON.parse(backups) : [];
    } catch (error) {
      console.error('Error getting backups:', error);
      return [];
    }
  }

  private async getBackupById(backupId: string): Promise<BackupData | null> {
    const backups = await this.getAllBackups();
    return backups.find(backup => backup.metadata.id === backupId) || null;
  }

  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async calculateChecksum(data: string): Promise<string> {
    // Simple checksum for demo - in production use crypto.subtle.digest
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private async verifyBackup(backup: BackupData): Promise<boolean> {
    try {
      const dataString = JSON.stringify(backup.data);
      const calculatedChecksum = await this.calculateChecksum(dataString);
      return calculatedChecksum === backup.metadata.checksum;
    } catch (error) {
      return false;
    }
  }

  private isValidBackupFormat(data: any): boolean {
    return (
      data &&
      data.metadata &&
      data.data &&
      data.metadata.id &&
      data.metadata.version &&
      data.metadata.createdAt
    );
  }

  private async createRestorePoint(): Promise<BackupData> {
    return await this.createBackup({
      includeUserData: true,
      includeSettings: true,
      includeWidgets: true,
      includeHistory: true,
    });
  }

  private getIncludedDataTypes(options: BackupOptions): string[] {
    const types: string[] = [];
    if (options.includeUserData) types.push('userData');
    if (options.includeSettings) types.push('settings');
    if (options.includeWidgets) types.push('widgets');
    if (options.includeHistory) types.push('history');
    if (options.includeReports) types.push('reports');
    if (options.includeAnalytics) types.push('analytics');
    if (options.includeAutomations) types.push('automations');
    return types;
  }
}

// Export singleton instance
export const backupService = new BackupService();