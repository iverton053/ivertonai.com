import themeService from './themeService';
import keyboardShortcutsService from './keyboardShortcutsService';
import customViewsService from './customViewsService';
import dragDropService from './dragDropService';
import alertService from './alertService';
import settingsValidationService from './settingsValidationService';

export interface AIHubSettings {
  theme: any;
  shortcuts: any;
  customViews: any;
  dragDropOrder: any;
  alerts: any;
  userProfile: any;
  automations: any;
}

export interface SettingsBackup {
  version: string;
  timestamp: string;
  checksum: string;
  settings: AIHubSettings;
}

class AIHubSettingsManager {
  private readonly VERSION = '1.0.0';
  private readonly SETTINGS_KEY = 'ai-hub-settings';
  private readonly BACKUP_KEY_PREFIX = 'ai-hub-backup-';

  // Initialize settings on app start
  async initializeSettings(): Promise<void> {
    try {
      // Validate existing settings
      const validation = await settingsValidationService.validateAllSettings();
      
      if (!validation.valid) {
        console.warn('Settings validation failed, attempting auto-repair...');
        await settingsValidationService.autoRepairSettings();
      }

      // Start periodic validation
      settingsValidationService.startPeriodicValidation(30);

      // Create initial auto-backup
      await this.createAutoBackup();

      console.log('AI Hub settings initialized successfully');
    } catch (error) {
      console.error('Failed to initialize settings:', error);
      
      // Emergency fallback - reset to defaults
      await this.resetToDefaults();
    }
  }

  // Collect all current settings
  async collectCurrentSettings(): Promise<AIHubSettings> {
    return {
      theme: this.safeGetStorageItem('ai-hub-theme'),
      shortcuts: this.safeGetStorageItem('ai-hub-shortcuts'),
      customViews: this.safeGetStorageItem('ai-hub-custom-views'),
      dragDropOrder: this.safeGetStorageItem('ai-hub-drag-drop'),
      alerts: this.safeGetStorageItem('ai-hub-alerts'),
      userProfile: this.safeGetStorageItem('ai-hub-profile'),
      automations: this.safeGetStorageItem('ai-hub-automations')
    };
  }

  // Create backup of current settings
  async createBackup(name?: string): Promise<string> {
    try {
      const settings = await this.collectCurrentSettings();
      const timestamp = new Date().toISOString();
      
      const backup: SettingsBackup = {
        version: this.VERSION,
        timestamp,
        checksum: this.generateChecksum(settings),
        settings
      };

      const backupId = `${this.BACKUP_KEY_PREFIX}${name || `manual-${Date.now()}`}`;
      localStorage.setItem(backupId, JSON.stringify(backup));

      console.log('Settings backup created:', backupId);
      return backupId;
    } catch (error) {
      console.error('Failed to create settings backup:', error);
      throw error;
    }
  }

  // Restore settings from backup
  async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      const backupData = localStorage.getItem(backupId);
      if (!backupData) {
        throw new Error('Backup not found');
      }

      const backup: SettingsBackup = JSON.parse(backupData);
      
      // Validate backup
      if (!this.validateBackup(backup)) {
        throw new Error('Invalid backup format');
      }

      // Verify checksum
      if (backup.checksum !== this.generateChecksum(backup.settings)) {
        throw new Error('Backup checksum mismatch - data may be corrupted');
      }

      // Restore each setting
      await this.restoreSettings(backup.settings);

      // Reinitialize services
      await this.reinitializeServices();

      console.log('Settings restored successfully from:', backupId);
      return true;
    } catch (error) {
      console.error('Failed to restore settings:', error);
      return false;
    }
  }

  // Export settings to file
  async exportSettings(): Promise<void> {
    try {
      const settings = await this.collectCurrentSettings();
      const backup: SettingsBackup = {
        version: this.VERSION,
        timestamp: new Date().toISOString(),
        checksum: this.generateChecksum(settings),
        settings
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `ai-hub-settings-${timestamp}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Settings exported to:', filename);
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw error;
    }
  }

  // Import settings from file
  async importSettings(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = async (e) => {
        try {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            reject(new Error('No file selected'));
            return;
          }

          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const backup: SettingsBackup = JSON.parse(reader.result as string);
              
              if (!this.validateBackup(backup)) {
                reject(new Error('Invalid settings file format'));
                return;
              }

              // Create backup before importing
              await this.createBackup('pre-import-backup');

              // Restore settings
              await this.restoreSettings(backup.settings);
              await this.reinitializeServices();

              console.log('Settings imported successfully');
              resolve(true);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        } catch (error) {
          reject(error);
        }
      };

      input.click();
    });
  }

  // Get all available backups
  getAvailableBackups(): Array<{ id: string; name: string; timestamp: string; size: number }> {
    const backups = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.BACKUP_KEY_PREFIX)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const backup: SettingsBackup = JSON.parse(data);
            backups.push({
              id: key,
              name: key.replace(this.BACKUP_KEY_PREFIX, ''),
              timestamp: backup.timestamp,
              size: new Blob([data]).size
            });
          }
        } catch (error) {
          console.warn('Invalid backup found:', key);
        }
      }
    }

    return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Delete backup
  deleteBackup(backupId: string): boolean {
    try {
      localStorage.removeItem(backupId);
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  // Create automatic backup
  async createAutoBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const backupId = `auto-${timestamp}`;
      await this.createBackup(backupId);
      
      // Clean up old auto backups (keep last 7 days)
      this.cleanupAutoBackups();
    } catch (error) {
      console.warn('Auto backup failed:', error);
    }
  }

  // Reset all settings to defaults
  async resetToDefaults(): Promise<void> {
    try {
      // Create backup before reset
      await this.createBackup('pre-reset-backup');

      // Clear all AI Hub localStorage data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ai-hub-') && !key.startsWith(this.BACKUP_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });

      // Reset services to defaults
      themeService.reset();
      keyboardShortcutsService.resetToDefaults();

      // Reinitialize
      await this.reinitializeServices();

      console.log('All settings reset to defaults');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }

  // Health check for all settings
  async performHealthCheck(): Promise<{
    healthy: boolean;
    services: Array<{
      name: string;
      status: 'healthy' | 'warning' | 'error';
      message: string;
    }>;
    recommendations: string[];
  }> {
    const validation = await settingsValidationService.validateAllSettings();
    const serviceStatuses = settingsValidationService.getServiceStatuses();
    
    const recommendations = [];
    
    if (!validation.valid) {
      recommendations.push('Run auto-repair to fix detected issues');
    }
    
    if (validation.warnings.length > 0) {
      recommendations.push('Review warnings in settings');
    }
    
    const backups = this.getAvailableBackups();
    if (backups.length === 0) {
      recommendations.push('Create a settings backup');
    } else {
      const latestBackup = new Date(backups[0].timestamp);
      const daysSinceBackup = (Date.now() - latestBackup.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceBackup > 7) {
        recommendations.push('Create a new settings backup (last backup is over a week old)');
      }
    }

    return {
      healthy: validation.valid && validation.issues.length === 0,
      services: serviceStatuses,
      recommendations
    };
  }

  // Private helper methods
  private safeGetStorageItem(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn(`Failed to parse storage item ${key}:`, error);
      return null;
    }
  }

  private async restoreSettings(settings: AIHubSettings): Promise<void> {
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        const storageKey = key === 'userProfile' ? 'ai-hub-profile' :
                          key === 'automations' ? 'ai-hub-automations' :
                          key === 'customViews' ? 'ai-hub-custom-views' :
                          key === 'dragDropOrder' ? 'ai-hub-drag-drop' :
                          `ai-hub-${key}`;
        
        localStorage.setItem(storageKey, JSON.stringify(value));
      }
    });
  }

  private async reinitializeServices(): Promise<void> {
    try {
      // Reinitialize theme service
      themeService.reset();
      themeService.updateConfig(this.safeGetStorageItem('ai-hub-theme') || {});
      
      // Reinitialize other services as needed
      // Note: Some services may need manual reinitialization
      
      // Reload page to fully reinitialize
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to reinitialize services:', error);
    }
  }

  private validateBackup(backup: SettingsBackup): boolean {
    return (
      backup &&
      typeof backup === 'object' &&
      backup.version &&
      backup.timestamp &&
      backup.settings &&
      typeof backup.settings === 'object'
    );
  }

  private generateChecksum(data: any): string {
    // Simple checksum generation
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private cleanupAutoBackups(): void {
    const backups = this.getAvailableBackups().filter(b => b.name.startsWith('auto-'));
    
    // Keep only last 7 auto backups
    if (backups.length > 7) {
      const toDelete = backups.slice(7);
      toDelete.forEach(backup => {
        this.deleteBackup(backup.id);
      });
    }
  }

  // Start periodic auto-backup
  startAutoBackup(intervalHours: number = 24): void {
    // Create initial backup
    this.createAutoBackup();
    
    // Schedule periodic backups
    setInterval(() => {
      this.createAutoBackup();
    }, intervalHours * 60 * 60 * 1000);
  }
}

// Export singleton instance
export const aiHubSettingsManager = new AIHubSettingsManager();
export default aiHubSettingsManager;