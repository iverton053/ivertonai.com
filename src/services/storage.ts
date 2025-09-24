import { StorageKeys, Migration } from '../types';

/**
 * Enhanced localStorage wrapper with error handling, compression, and migration support
 */
export class StorageService {
  private static instance: StorageService;
  private readonly prefix = 'iverton_';
  private readonly version = '1.0.0';

  private constructor() {
    this.init();
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private init(): void {
    this.checkBrowserSupport();
    this.runMigrations();
    this.cleanupExpiredData();
  }

  private checkBrowserSupport(): void {
    if (typeof Storage === 'undefined') {
      console.warn('LocalStorage is not supported in this browser');
      throw new Error('LocalStorage not supported');
    }
  }

  /**
   * Store data with error handling and optional TTL
   */
  set<T>(key: StorageKeys | string, data: T, ttl?: number): boolean {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
        version: this.version,
      };

      const serialized = JSON.stringify(item);
      localStorage.setItem(this.getKey(key), serialized);
      
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, attempting cleanup...');
        this.cleanup();
        
        // Try again after cleanup
        try {
          const item = { data, timestamp: Date.now(), ttl, version: this.version };
          localStorage.setItem(this.getKey(key), JSON.stringify(item));
          return true;
        } catch (retryError) {
          console.error('Failed to store data after cleanup:', retryError);
          return false;
        }
      }
      
      console.error('Failed to store data:', error);
      return false;
    }
  }

  /**
   * Retrieve data with automatic expiration checking
   */
  get<T>(key: StorageKeys | string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      
      if (!item) {
        return defaultValue ?? null;
      }

      const parsed = JSON.parse(item);
      
      // Check if data has expired
      if (parsed.ttl && (Date.now() - parsed.timestamp > parsed.ttl)) {
        this.remove(key);
        return defaultValue ?? null;
      }

      return parsed.data as T;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return defaultValue ?? null;
    }
  }

  /**
   * Remove data from storage
   */
  remove(key: StorageKeys | string): boolean {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Failed to remove data:', error);
      return false;
    }
  }

  /**
   * Clear all app data
   */
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter(key => key.startsWith(this.prefix));
      
      appKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: StorageKeys | string): boolean {
    const data = this.get(key);
    return data !== null;
  }

  /**
   * Get all keys for the app
   */
  getAllKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Failed to get keys:', error);
      return [];
    }
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { used: number; available: number; total: number } {
    try {
      let used = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          used += (localStorage.getItem(key) || '').length;
        }
      });

      // Rough estimate of available storage (5MB typical limit)
      const total = 5 * 1024 * 1024; // 5MB in bytes
      const available = total - used;

      return { used, available, total };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, total: 0 };
    }
  }

  /**
   * Clean up expired data and old cache entries
   */
  private cleanup(): void {
    try {
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter(key => key.startsWith(this.prefix));
      
      appKeys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            
            // Remove expired items
            if (parsed.ttl && (Date.now() - parsed.timestamp > parsed.ttl)) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted items
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  /**
   * Clean up expired data (public method)
   */
  cleanupExpiredData(): void {
    this.cleanup();
  }

  /**
   * Export all app data for backup
   */
  exportData(): string {
    try {
      const data: Record<string, any> = {};
      const keys = Object.keys(localStorage);
      
      keys
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => {
          const item = localStorage.getItem(key);
          if (item) {
            data[key.replace(this.prefix, '')] = JSON.parse(item);
          }
        });

      return JSON.stringify({
        version: this.version,
        timestamp: Date.now(),
        data,
      }, null, 2);
    } catch (error) {
      console.error('Export failed:', error);
      return '';
    }
  }

  /**
   * Import data from backup
   */
  importData(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      
      if (!parsed.data) {
        throw new Error('Invalid backup format');
      }

      // Clear existing data
      this.clear();

      // Import new data
      Object.entries(parsed.data).forEach(([key, value]) => {
        localStorage.setItem(this.getKey(key), JSON.stringify(value));
      });

      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  /**
   * Run data migrations
   */
  private runMigrations(): void {
    const currentVersion = this.get('app_version', '0.0.0');
    
    if (currentVersion !== this.version) {
      console.log(`Migrating data from ${currentVersion} to ${this.version}`);
      
      // Add migration logic here as needed
      const migrations: Migration[] = [
        // Example migration
        {
          version: '1.0.0',
          description: 'Initial data structure',
          up: (data) => data,
          down: (data) => data,
        },
      ];

      migrations.forEach(migration => {
        if (this.shouldRunMigration(currentVersion, migration.version)) {
          console.log(`Running migration: ${migration.description}`);
          // Migration logic would go here
        }
      });

      this.set('app_version', this.version);
    }
  }

  private shouldRunMigration(currentVersion: string, migrationVersion: string): boolean {
    // Simple version comparison (would need proper semver comparison for production)
    return currentVersion < migrationVersion;
  }

  private getKey(key: StorageKeys | string): string {
    return `${this.prefix}${key}`;
  }
}

// Singleton instance
export const storage = StorageService.getInstance();