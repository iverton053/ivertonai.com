import themeService from './themeService';
import keyboardShortcutsService from './keyboardShortcutsService';
import customViewsService from './customViewsService';
import alertService from './alertService';

interface ValidationResult {
  valid: boolean;
  issues: string[];
  repaired: string[];
  warnings: string[];
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastCheck: Date;
}

class SettingsValidationService {
  private lastValidationTime: Date | null = null;
  private serviceStatuses: Map<string, ServiceStatus> = new Map();

  // Comprehensive settings validation
  async validateAllSettings(): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      issues: [],
      repaired: [],
      warnings: []
    };

    try {
      // Validate theme service
      const themeResult = await this.validateThemeService();
      this.mergeResults(result, themeResult);

      // Validate keyboard shortcuts service
      const shortcutsResult = await this.validateKeyboardShortcutsService();
      this.mergeResults(result, shortcutsResult);

      // Validate custom views service
      const viewsResult = await this.validateCustomViewsService();
      this.mergeResults(result, viewsResult);

      // Validate alert service
      const alertsResult = await this.validateAlertService();
      this.mergeResults(result, alertsResult);

      // Validate localStorage integrity
      const storageResult = await this.validateLocalStorage();
      this.mergeResults(result, storageResult);

      this.lastValidationTime = new Date();
      return result;
    } catch (error) {
      result.valid = false;
      result.issues.push(`Validation error: ${error.message}`);
      return result;
    }
  }

  // Validate theme service
  private async validateThemeService(): Promise<ValidationResult> {
    const result: ValidationResult = { valid: true, issues: [], repaired: [], warnings: [] };

    try {
      const config = themeService.getConfig();
      
      // Check required properties
      if (!config.mode || !['light', 'dark', 'system'].includes(config.mode)) {
        result.issues.push('Invalid theme mode');
        themeService.setMode('system');
        result.repaired.push('Reset theme mode to system');
        result.valid = false;
      }

      if (!config.colorScheme) {
        result.issues.push('Missing color scheme');
        themeService.setColorScheme('purple');
        result.repaired.push('Set color scheme to purple');
        result.valid = false;
      }

      if (typeof config.transparency !== 'number' || config.transparency < 0 || config.transparency > 100) {
        result.issues.push('Invalid transparency value');
        themeService.setTransparency(90);
        result.repaired.push('Reset transparency to 90%');
        result.valid = false;
      }

      // Test theme application
      try {
        const colors = themeService.getColors();
        if (!colors.bg || !colors.text || !colors.border || !colors.status) {
          result.issues.push('Theme color generation failed');
          themeService.reset();
          result.repaired.push('Reset theme to defaults');
          result.valid = false;
        }
      } catch (error) {
        result.issues.push('Theme colors generation error');
        themeService.reset();
        result.repaired.push('Reset theme service');
        result.valid = false;
      }

      this.updateServiceStatus('theme', result.valid ? 'healthy' : 'error', 
        result.valid ? 'Theme service working correctly' : `Issues found: ${result.issues.length}`);

    } catch (error) {
      result.valid = false;
      result.issues.push(`Theme service error: ${error.message}`);
      this.updateServiceStatus('theme', 'error', error.message);
    }

    return result;
  }

  // Validate keyboard shortcuts service
  private async validateKeyboardShortcutsService(): Promise<ValidationResult> {
    const result: ValidationResult = { valid: true, issues: [], repaired: [], warnings: [] };

    try {
      const config = keyboardShortcutsService.getConfig();
      
      if (!config) {
        result.issues.push('Keyboard shortcuts config missing');
        keyboardShortcutsService.resetToDefaults();
        result.repaired.push('Reset shortcuts to defaults');
        result.valid = false;
      } else {
        // Check for shortcut conflicts
        const conflicts = keyboardShortcutsService.getKeyConflicts();
        if (conflicts.length > 0) {
          result.warnings.push(`${conflicts.length} keyboard shortcut conflicts found`);
          // Automatically resolve conflicts by resetting to defaults
          conflicts.forEach(conflict => {
            conflict.shortcuts.slice(1).forEach(shortcut => {
              keyboardShortcutsService.resetShortcutKeys(shortcut.id);
            });
          });
          result.repaired.push('Resolved keyboard shortcut conflicts');
        }

        // Validate essential shortcuts exist
        const essentialShortcuts = ['show_help', 'toggle_theme', 'refresh_all'];
        essentialShortcuts.forEach(shortcutId => {
          const shortcut = keyboardShortcutsService.getShortcut(shortcutId);
          if (!shortcut) {
            result.issues.push(`Missing essential shortcut: ${shortcutId}`);
            result.valid = false;
          }
        });
      }

      this.updateServiceStatus('shortcuts', result.valid ? 'healthy' : 'warning',
        result.valid ? 'Shortcuts working correctly' : `Issues found: ${result.issues.length}`);

    } catch (error) {
      result.valid = false;
      result.issues.push(`Keyboard shortcuts error: ${error.message}`);
      this.updateServiceStatus('shortcuts', 'error', error.message);
    }

    return result;
  }

  // Validate custom views service
  private async validateCustomViewsService(): Promise<ValidationResult> {
    const result: ValidationResult = { valid: true, issues: [], repaired: [], warnings: [] };

    try {
      const views = customViewsService.getAllViews();
      
      // Validate view structure
      views.forEach(view => {
        if (!view.id || !view.name || !view.filters) {
          result.issues.push(`Invalid view structure: ${view.name || 'unknown'}`);
          customViewsService.deleteView(view.id);
          result.repaired.push(`Removed invalid view: ${view.name || 'unknown'}`);
          result.valid = false;
        }
      });

      // Check for duplicate names
      const names = views.map(v => v.name);
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicates.length > 0) {
        result.warnings.push(`Duplicate view names found: ${duplicates.join(', ')}`);
      }

      this.updateServiceStatus('customViews', result.valid ? 'healthy' : 'warning',
        `${views.length} custom views, ${result.issues.length} issues`);

    } catch (error) {
      result.valid = false;
      result.issues.push(`Custom views error: ${error.message}`);
      this.updateServiceStatus('customViews', 'error', error.message);
    }

    return result;
  }

  // Validate alert service
  private async validateAlertService(): Promise<ValidationResult> {
    const result: ValidationResult = { valid: true, issues: [], repaired: [], warnings: [] };

    try {
      const config = alertService.getConfig();
      
      if (!config) {
        result.issues.push('Alert service config missing');
        // Reset alert service would need to be implemented
        result.valid = false;
      } else {
        // Check notification permissions
        if ('Notification' in window) {
          if (Notification.permission === 'denied') {
            result.warnings.push('Browser notifications are denied');
          } else if (Notification.permission === 'default') {
            result.warnings.push('Browser notifications not requested');
          }
        } else {
          result.warnings.push('Browser notifications not supported');
        }

        // Validate alert rules
        const rules = alertService.getRules();
        rules.forEach(rule => {
          if (!rule.id || !rule.condition || !rule.severity) {
            result.issues.push(`Invalid alert rule: ${rule.id || 'unknown'}`);
            alertService.removeRule(rule.id);
            result.repaired.push(`Removed invalid alert rule`);
            result.valid = false;
          }
        });
      }

      this.updateServiceStatus('alerts', result.valid ? 'healthy' : 'warning',
        result.valid ? 'Alert service working correctly' : `Issues found: ${result.issues.length}`);

    } catch (error) {
      result.valid = false;
      result.issues.push(`Alert service error: ${error.message}`);
      this.updateServiceStatus('alerts', 'error', error.message);
    }

    return result;
  }

  // Validate localStorage integrity
  private async validateLocalStorage(): Promise<ValidationResult> {
    const result: ValidationResult = { valid: true, issues: [], repaired: [], warnings: [] };

    try {
      const keys = [
        'ai-hub-theme',
        'ai-hub-shortcuts', 
        'ai-hub-custom-views',
        'ai-hub-alerts',
        'ai-hub-automations',
        'ai-hub-profile'
      ];

      keys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            JSON.parse(data); // Test if it's valid JSON
          }
        } catch (error) {
          result.issues.push(`Corrupted localStorage data: ${key}`);
          localStorage.removeItem(key);
          result.repaired.push(`Removed corrupted data: ${key}`);
          result.valid = false;
        }
      });

      // Check localStorage quota
      try {
        const usage = this.getLocalStorageUsage();
        if (usage.percentage > 90) {
          result.warnings.push(`localStorage usage high: ${usage.percentage}%`);
        }
      } catch (error) {
        result.warnings.push('Could not check localStorage usage');
      }

      this.updateServiceStatus('localStorage', result.valid ? 'healthy' : 'error',
        result.valid ? 'LocalStorage healthy' : `Corrupted data found`);

    } catch (error) {
      result.valid = false;
      result.issues.push(`localStorage validation error: ${error.message}`);
      this.updateServiceStatus('localStorage', 'error', error.message);
    }

    return result;
  }

  // Auto-repair settings
  async autoRepairSettings(): Promise<ValidationResult> {
    const result = await this.validateAllSettings();
    
    if (!result.valid) {
      // Additional repair actions
      if (result.issues.some(issue => issue.includes('theme'))) {
        try {
          themeService.reset();
          themeService.applyPreset('default');
          result.repaired.push('Applied default theme preset');
        } catch (error) {
          result.issues.push(`Failed to repair theme: ${error.message}`);
        }
      }

      if (result.issues.some(issue => issue.includes('shortcuts'))) {
        try {
          keyboardShortcutsService.resetToDefaults();
          result.repaired.push('Reset all shortcuts to defaults');
        } catch (error) {
          result.issues.push(`Failed to repair shortcuts: ${error.message}`);
        }
      }
    }

    return result;
  }

  // Get service health status
  getServiceStatuses(): ServiceStatus[] {
    return Array.from(this.serviceStatuses.values());
  }

  // Get last validation time
  getLastValidationTime(): Date | null {
    return this.lastValidationTime;
  }

  // Start periodic validation
  startPeriodicValidation(intervalMinutes: number = 30): void {
    // Initial validation
    this.validateAllSettings();

    // Schedule periodic validation
    setInterval(() => {
      this.validateAllSettings();
    }, intervalMinutes * 60 * 1000);
  }

  // Emergency reset all settings
  emergencyResetAll(): void {
    try {
      // Clear all AI Hub localStorage data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ai-hub-')) {
          localStorage.removeItem(key);
        }
      });

      // Reset services to defaults
      themeService.reset();
      keyboardShortcutsService.resetToDefaults();
      
      // Reload to reinitialize
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Emergency reset failed:', error);
      // Force page reload as fallback
      window.location.reload();
    }
  }

  // Private helper methods
  private mergeResults(target: ValidationResult, source: ValidationResult): void {
    if (!source.valid) {
      target.valid = false;
    }
    target.issues.push(...source.issues);
    target.repaired.push(...source.repaired);
    target.warnings.push(...source.warnings);
  }

  private updateServiceStatus(name: string, status: ServiceStatus['status'], message: string): void {
    this.serviceStatuses.set(name, {
      name,
      status,
      message,
      lastCheck: new Date()
    });
  }

  private getLocalStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    const total = 5 * 1024 * 1024; // Approximate 5MB limit
    return {
      used,
      total,
      percentage: Math.round((used / total) * 100)
    };
  }
}

// Export singleton instance
export const settingsValidationService = new SettingsValidationService();
export default settingsValidationService;