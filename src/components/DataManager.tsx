import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore, useAppStore, useWidgetStore } from '../stores';
import { useEnhancedUserData, useMigrationStatus, useDataSync } from '../hooks/useEnhancedData';
import { cache, widgetCache, userCache, analyticsCache } from '../services/cache';
import { storage } from '../services/storage';
// import { migrationService } from '../services/migration';
import Icon from './Icon';

/**
 * Data Manager component for monitoring and managing the data layer
 * This component demonstrates the robust data persistence and state management
 */
const DataManager: React.FC = () => {
  const { user } = useUserStore();
  const { addNotification } = useAppStore();
  const { widgets } = useWidgetStore();
  
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    cacheSize: 0,
    storageUsed: 0,
    widgetCount: 0,
    lastSaved: null as number | null,
  });

  // Enhanced data hooks
  const { data: userData, loading: userLoading, error: userError, cacheInfo } = useEnhancedUserData();
  const { needsMigration, currentVersion, targetVersion, runMigration } = useMigrationStatus();
  const { lastSync, syncData } = useDataSync(['user_data', 'widget_configs', 'app_state']);

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      const cacheStats = cache.getStats();
      const storageInfo = storage.getStorageInfo();
      
      setStats({
        cacheSize: cacheStats.size,
        storageUsed: Math.round(storageInfo.used / 1024), // Convert to KB
        widgetCount: widgets.length,
        lastSaved: storage.get('last_save_timestamp') || null,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [widgets.length]);

  // Handle migration if needed
  useEffect(() => {
    if (needsMigration) {
      addNotification({
        type: 'info',
        title: 'Data Migration Available',
        message: `Upgrade from ${currentVersion} to ${targetVersion}`,
        autoClose: false,
      });
    }
  }, [needsMigration, currentVersion, targetVersion, addNotification]);

  const handleClearCache = () => {
    cache.clear();
    widgetCache.clear();
    userCache.clear();
    analyticsCache.clear();
    
    addNotification({
      type: 'success',
      title: 'Cache Cleared',
      message: 'All cached data has been cleared',
    });
  };

  const handleExportData = () => {
    const exportData = storage.exportData();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Data Exported',
      message: 'Dashboard data has been exported successfully',
    });
  };

  const handleRunMigration = async () => {
    try {
      const result = await runMigration();
      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Migration Complete',
          message: `Successfully ran ${result.migrationsRun} migrations`,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Migration Failed',
          message: result.errors.join(', '),
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Migration Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleForceSync = async () => {
    await syncData();
    addNotification({
      type: 'success',
      title: 'Data Synchronized',
      message: 'All data sources have been synchronized',
    });
  };

  const handleTestPersistence = () => {
    // Create a test widget to verify persistence
    const testWidget = {
      title: `Test Widget ${Date.now()}`,
      type: 'stats' as const,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 150 },
      isVisible: true,
      isPinned: false,
      data: {
        title: 'Test Stat',
        value: Math.floor(Math.random() * 1000),
        change: Math.floor(Math.random() * 20) - 10,
        icon: 'Activity',
      },
    };

    useWidgetStore.getState().addWidget(testWidget);
    
    // Test storage persistence
    const storageTest = `test_${Date.now()}`;
    const testData = { message: 'Persistence test', timestamp: Date.now() };
    const saved = storage.set(storageTest, testData);
    const retrieved = storage.get(storageTest);
    
    if (saved && retrieved && JSON.stringify(retrieved) === JSON.stringify(testData)) {
      addNotification({
        type: 'success',
        title: 'Persistence Test Passed',
        message: 'Data persistence is working correctly',
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Persistence Test Failed',
        message: 'Data persistence may not be working correctly',
      });
    }

    // Clean up test data
    storage.remove(storageTest);
  };

  if (!isVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors"
        title="Open Data Manager"
      >
        <Icon name="Settings" className="w-5 h-5" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 left-4 z-50 w-80 max-h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Icon name="Settings" className="w-5 h-5 text-purple-400" />
          <span>Data Manager</span>
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Icon name="X" className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-sm text-gray-400">Cache Size</div>
            <div className="text-lg font-semibold text-white">{stats.cacheSize}</div>
            <div className="text-xs text-purple-400">
              Hit Rate: {Math.round(cacheInfo.hitRate * 100)}%
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-sm text-gray-400">Storage Used</div>
            <div className="text-lg font-semibold text-white">{stats.storageUsed} KB</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-sm text-gray-400">Widgets</div>
            <div className="text-lg font-semibold text-white">{stats.widgetCount}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-sm text-gray-400">Version</div>
            <div className="text-lg font-semibold text-white">{currentVersion}</div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">User Data</span>
            <div className="flex items-center space-x-2">
              {userLoading && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
              {userError && <div className="w-2 h-2 bg-red-400 rounded-full" />}
              {!userLoading && !userError && <div className="w-2 h-2 bg-green-400 rounded-full" />}
              <span className="text-xs text-gray-500">
                {cacheInfo.cached ? `Cached (${Math.round((cacheInfo.cacheAge || 0) / 1000)}s ago)` : 'Fresh'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Migration</span>
            {needsMigration ? (
              <span className="text-xs text-yellow-400">Update Available</span>
            ) : (
              <span className="text-xs text-green-400">Up to Date</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Last Sync</span>
            <span className="text-xs text-gray-500">
              {lastSync ? `${Math.round((Date.now() - lastSync) / 1000)}s ago` : 'Never'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleClearCache}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              Clear Cache
            </button>
            <button
              onClick={handleForceSync}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Force Sync
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportData}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
            >
              Export Data
            </button>
            <button
              onClick={handleTestPersistence}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
            >
              Test Persistence
            </button>
          </div>

          {needsMigration && (
            <button
              onClick={handleRunMigration}
              className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
            >
              Run Migration ({currentVersion} → {targetVersion})
            </button>
          )}
        </div>

        {/* Debug Info */}
        <details className="text-xs">
          <summary className="text-gray-400 cursor-pointer hover:text-white">Debug Info</summary>
          <div className="mt-2 p-2 bg-gray-800 rounded text-gray-300 font-mono text-xs max-h-32 overflow-y-auto">
            <div>Cache Keys: {cache.getKeys().length}</div>
            <div>Widget Cache: {widgetCache.getKeys().length}</div>
            <div>User Cache: {userCache.getKeys().length}</div>
            <div>Storage Keys: {storage.getAllKeys().length}</div>
            {userData && (
              <div>User: {userData.username || 'Unknown'}</div>
            )}
          </div>
        </details>
      </div>
    </motion.div>
  );
};

export default DataManager;