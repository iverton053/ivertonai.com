import { Migration } from '../types';
import { storage } from './storage';
import { cache } from './cache';

/**
 * Data migration service for handling schema and data structure changes
 */
export class MigrationService {
  private static instance: MigrationService;
  private readonly currentVersion = '1.0.0';
  private readonly migrationKey = 'migration_version';

  private constructor() {}

  static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  /**
   * Register and run migrations
   */
  async runMigrations(): Promise<{ success: boolean; migrationsRun: number; errors: string[] }> {
    const errors: string[] = [];
    let migrationsRun = 0;

    try {
      const currentStoredVersion = storage.get<string>(this.migrationKey, '0.0.0');
      
      if (currentStoredVersion === this.currentVersion) {
        return { success: true, migrationsRun: 0, errors: [] };
      }

      console.log(`Running migrations from ${currentStoredVersion} to ${this.currentVersion}`);

      const migrations = this.getMigrations();
      
      for (const migration of migrations) {
        if (this.shouldRunMigration(currentStoredVersion, migration.version)) {
          try {
            console.log(`Running migration: ${migration.description} (${migration.version})`);
            await this.runMigration(migration);
            migrationsRun++;
          } catch (error) {
            const errorMsg = `Migration ${migration.version} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error(errorMsg);
            errors.push(errorMsg);
          }
        }
      }

      // Update migration version
      storage.set(this.migrationKey, this.currentVersion);

      return {
        success: errors.length === 0,
        migrationsRun,
        errors,
      };
    } catch (error) {
      const errorMsg = `Migration process failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      return {
        success: false,
        migrationsRun,
        errors: [errorMsg],
      };
    }
  }

  /**
   * Define all migrations in chronological order
   */
  private getMigrations(): Migration[] {
    return [
      {
        version: '0.1.0',
        description: 'Initial data structure setup',
        up: (data) => {
          // Initialize basic structure
          return {
            ...data,
            version: '0.1.0',
            createdAt: Date.now(),
          };
        },
        down: (data) => {
          const { version, createdAt, ...rest } = data;
          return rest;
        },
      },
      {
        version: '0.2.0',
        description: 'Add widget positioning system',
        up: (data) => {
          if (data.widgets && Array.isArray(data.widgets)) {
            data.widgets = data.widgets.map((widget: any, index: number) => ({
              ...widget,
              position: widget.position || {
                x: (index % 3) * 300 + 20,
                y: Math.floor(index / 3) * 200 + 20,
              },
              size: widget.size || {
                width: 280,
                height: 180,
              },
            }));
          }
          return data;
        },
        down: (data) => {
          if (data.widgets && Array.isArray(data.widgets)) {
            data.widgets = data.widgets.map((widget: any) => {
              const { position, size, ...rest } = widget;
              return rest;
            });
          }
          return data;
        },
      },
      {
        version: '0.3.0',
        description: 'Add user preferences structure',
        up: (data) => {
          if (data.user && !data.user.preferences) {
            data.user.preferences = {
              theme: 'dark',
              language: 'en',
              timezone: 'UTC',
              notifications: true,
              autoSave: true,
            };
          }
          return data;
        },
        down: (data) => {
          if (data.user && data.user.preferences) {
            delete data.user.preferences;
          }
          return data;
        },
      },
      {
        version: '0.4.0',
        description: 'Migrate widget data to new schema',
        up: (data) => {
          if (data.widgets && Array.isArray(data.widgets)) {
            data.widgets = data.widgets.map((widget: any) => ({
              ...widget,
              id: widget.id || `widget_${Date.now()}_${Math.random()}`,
              isVisible: widget.isVisible !== undefined ? widget.isVisible : true,
              isPinned: widget.isPinned !== undefined ? widget.isPinned : false,
              settings: widget.settings || {},
              createdAt: widget.createdAt || Date.now(),
              updatedAt: widget.updatedAt || Date.now(),
            }));
          }
          return data;
        },
        down: (data) => {
          if (data.widgets && Array.isArray(data.widgets)) {
            data.widgets = data.widgets.map((widget: any) => {
              const { isVisible, isPinned, settings, createdAt, updatedAt, ...rest } = widget;
              return rest;
            });
          }
          return data;
        },
      },
      {
        version: '0.5.0',
        description: 'Add dashboard layout configuration',
        up: (data) => {
          if (!data.layout) {
            data.layout = {
              id: `layout_${Date.now()}`,
              name: 'Default Layout',
              widgets: data.widgets || [],
              settings: {
                theme: 'dark',
                columns: 12,
                snapToGrid: true,
                gridSize: 20,
                autoSave: true,
              },
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
          }
          return data;
        },
        down: (data) => {
          if (data.layout) {
            const widgets = data.layout.widgets || [];
            delete data.layout;
            data.widgets = widgets;
          }
          return data;
        },
      },
      {
        version: '1.0.0',
        description: 'Finalize schema and add validation',
        up: (data) => {
          // Ensure all required fields are present
          if (data.user) {
            data.user = {
              id: data.user.id || `user_${Date.now()}`,
              username: data.user.username || 'User',
              ...data.user,
              updatedAt: Date.now(),
            };
          }

          if (data.layout) {
            data.layout.updatedAt = Date.now();
          }

          // Add migration metadata
          data.migrationHistory = data.migrationHistory || [];
          data.migrationHistory.push({
            version: '1.0.0',
            timestamp: Date.now(),
            description: 'Upgraded to final schema',
          });

          return data;
        },
        down: (data) => {
          if (data.migrationHistory) {
            delete data.migrationHistory;
          }
          return data;
        },
      },
    ];
  }

  /**
   * Run a single migration
   */
  private async runMigration(migration: Migration): Promise<void> {
    try {
      // Get all relevant data that needs migration
      const userData = storage.get('iverton_user_data');
      const appState = storage.get('iverton_app_state');
      const widgetConfigs = storage.get('iverton_widget_configs');
      const dashboardLayout = storage.get('iverton_dashboard_layout');

      // Combine all data for migration
      const allData = {
        user: userData,
        appState,
        widgets: widgetConfigs,
        layout: dashboardLayout,
      };

      // Run the migration
      const migratedData = await migration.up(allData);

      // Save migrated data back to storage
      if (migratedData.user) {
        storage.set('iverton_user_data', migratedData.user);
      }
      if (migratedData.appState) {
        storage.set('iverton_app_state', migratedData.appState);
      }
      if (migratedData.widgets) {
        storage.set('iverton_widget_configs', migratedData.widgets);
      }
      if (migratedData.layout) {
        storage.set('iverton_dashboard_layout', migratedData.layout);
      }

      // Clear cache after migration to ensure fresh data
      cache.clear();

      console.log(`✓ Migration ${migration.version} completed successfully`);
    } catch (error) {
      console.error(`✗ Migration ${migration.version} failed:`, error);
      throw error;
    }
  }

  /**
   * Check if migration should run based on version comparison
   */
  private shouldRunMigration(currentVersion: string, migrationVersion: string): boolean {
    return this.compareVersions(currentVersion, migrationVersion) < 0;
  }

  /**
   * Simple semantic version comparison
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }

    return 0;
  }

  /**
   * Rollback to a previous version (dangerous operation)
   */
  async rollbackToVersion(targetVersion: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentVersion = storage.get<string>(this.migrationKey, '0.0.0');
      
      if (this.compareVersions(targetVersion, currentVersion) >= 0) {
        return { success: false, error: 'Cannot rollback to same or newer version' };
      }

      const migrations = this.getMigrations();
      const rollbackMigrations = migrations
        .filter(m => this.compareVersions(targetVersion, m.version) < 0)
        .reverse(); // Run rollbacks in reverse order

      // Get current data
      const userData = storage.get('iverton_user_data');
      const appState = storage.get('iverton_app_state');
      const widgetConfigs = storage.get('iverton_widget_configs');
      const dashboardLayout = storage.get('iverton_dashboard_layout');

      let allData = {
        user: userData,
        appState,
        widgets: widgetConfigs,
        layout: dashboardLayout,
      };

      // Run rollback migrations
      for (const migration of rollbackMigrations) {
        console.log(`Rolling back migration: ${migration.description} (${migration.version})`);
        allData = await migration.down(allData);
      }

      // Save rolled back data
      if (allData.user) storage.set('iverton_user_data', allData.user);
      if (allData.appState) storage.set('iverton_app_state', allData.appState);
      if (allData.widgets) storage.set('iverton_widget_configs', allData.widgets);
      if (allData.layout) storage.set('iverton_dashboard_layout', allData.layout);

      // Update migration version
      storage.set(this.migrationKey, targetVersion);

      // Clear cache
      cache.clear();

      console.log(`✓ Successfully rolled back to version ${targetVersion}`);
      return { success: true };
    } catch (error) {
      const errorMsg = `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Get current migration version
   */
  getCurrentVersion(): string {
    return storage.get<string>(this.migrationKey, '0.0.0');
  }

  /**
   * Get target version
   */
  getTargetVersion(): string {
    return this.currentVersion;
  }

  /**
   * Check if migrations are needed
   */
  needsMigration(): boolean {
    const currentVersion = this.getCurrentVersion();
    return this.compareVersions(currentVersion, this.currentVersion) < 0;
  }

  /**
   * Get migration history
   */
  getMigrationHistory(): Array<{ version: string; timestamp: number; description: string }> {
    const userData = storage.get<any>('iverton_user_data');
    return userData?.migrationHistory || [];
  }

  /**
   * Export migration info for debugging
   */
  exportMigrationInfo(): string {
    return JSON.stringify({
      currentVersion: this.getCurrentVersion(),
      targetVersion: this.getTargetVersion(),
      needsMigration: this.needsMigration(),
      migrationHistory: this.getMigrationHistory(),
      availableMigrations: this.getMigrations().map(m => ({
        version: m.version,
        description: m.description,
      })),
    }, null, 2);
  }

  /**
   * Create backup before migration
   */
  createBackup(): string {
    const backupData = {
      timestamp: Date.now(),
      version: this.getCurrentVersion(),
      data: {
        userData: storage.get('iverton_user_data'),
        appState: storage.get('iverton_app_state'),
        widgetConfigs: storage.get('iverton_widget_configs'),
        dashboardLayout: storage.get('iverton_dashboard_layout'),
      },
    };

    const backupJson = JSON.stringify(backupData, null, 2);
    
    // Save backup to storage
    const backupKey = `backup_${Date.now()}`;
    storage.set(backupKey, backupData);
    
    console.log(`Backup created with key: ${backupKey}`);
    return backupJson;
  }

  /**
   * Restore from backup
   */
  restoreFromBackup(backupData: string): { success: boolean; error?: string } {
    try {
      const backup = JSON.parse(backupData);
      
      if (!backup.data) {
        throw new Error('Invalid backup format');
      }

      // Restore data
      if (backup.data.userData) {
        storage.set('iverton_user_data', backup.data.userData);
      }
      if (backup.data.appState) {
        storage.set('iverton_app_state', backup.data.appState);
      }
      if (backup.data.widgetConfigs) {
        storage.set('iverton_widget_configs', backup.data.widgetConfigs);
      }
      if (backup.data.dashboardLayout) {
        storage.set('iverton_dashboard_layout', backup.data.dashboardLayout);
      }

      // Restore migration version
      storage.set(this.migrationKey, backup.version);

      // Clear cache
      cache.clear();

      console.log(`✓ Restored from backup (version ${backup.version})`);
      return { success: true };
    } catch (error) {
      const errorMsg = `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  }
}

// Export singleton instance
export const migrationService = MigrationService.getInstance();

// Auto-run migrations on import (for production use)
// Remove this or make it conditional for development
if (typeof window !== 'undefined') {
  // Run migrations when the service is first loaded
  migrationService.runMigrations().then((result) => {
    if (!result.success) {
      console.error('Migration failed:', result.errors);
    } else if (result.migrationsRun > 0) {
      console.log(`✓ Successfully ran ${result.migrationsRun} migrations`);
    }
  });
}