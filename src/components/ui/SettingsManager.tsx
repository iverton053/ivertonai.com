import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  FileText,
  X,
  Loader,
  RefreshCw
} from 'lucide-react';
import aiHubSettingsManager from '../../services/aiHubSettingsManager';
import settingsValidationService from '../../services/settingsValidationService';

interface SettingsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'validation' | 'health'>('backup');
  const [backups, setBackups] = useState<Array<{ id: string; name: string; timestamp: string; size: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Load data when component mounts
  useEffect(() => {
    if (isOpen) {
      loadBackups();
      loadHealthStatus();
    }
  }, [isOpen]);

  const loadBackups = () => {
    const availableBackups = aiHubSettingsManager.getAvailableBackups();
    setBackups(availableBackups);
  };

  const loadHealthStatus = async () => {
    setIsLoading(true);
    try {
      const status = await aiHubSettingsManager.performHealthCheck();
      setHealthStatus(status);
    } catch (error) {
      console.error('Failed to load health status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const name = prompt('Enter backup name (optional):');
      await aiHubSettingsManager.createBackup(name || undefined);
      loadBackups();
    } catch (error) {
      alert('Failed to create backup: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('This will replace all current settings. Continue?')) return;
    
    setIsLoading(true);
    try {
      const success = await aiHubSettingsManager.restoreFromBackup(backupId);
      if (success) {
        alert('Settings restored successfully. Page will reload.');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert('Failed to restore backup.');
      }
    } catch (error) {
      alert('Restore failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    if (!confirm('Delete this backup?')) return;
    
    const success = aiHubSettingsManager.deleteBackup(backupId);
    if (success) {
      loadBackups();
    } else {
      alert('Failed to delete backup.');
    }
  };

  const handleExportSettings = async () => {
    setIsLoading(true);
    try {
      await aiHubSettingsManager.exportSettings();
    } catch (error) {
      alert('Export failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSettings = async () => {
    if (!confirm('This will replace all current settings. Continue?')) return;
    
    setIsLoading(true);
    try {
      const success = await aiHubSettingsManager.importSettings();
      if (success) {
        alert('Settings imported successfully. Page will reload.');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      alert('Import failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('This will reset ALL settings to defaults. This cannot be undone. Continue?')) return;
    
    setIsLoading(true);
    try {
      await aiHubSettingsManager.resetToDefaults();
      alert('Settings reset to defaults. Page will reload.');
    } catch (error) {
      alert('Reset failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateSettings = async () => {
    setIsLoading(true);
    try {
      const result = await settingsValidationService.validateAllSettings();
      setValidationResult(result);
    } catch (error) {
      alert('Validation failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoRepair = async () => {
    setIsLoading(true);
    try {
      const result = await settingsValidationService.autoRepairSettings();
      setValidationResult(result);
      loadHealthStatus();
      alert('Auto-repair completed. Check validation results.');
    } catch (error) {
      alert('Auto-repair failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Settings Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'backup', label: 'Backup & Restore', icon: Download },
            { id: 'validation', label: 'Validation', icon: Shield },
            { id: 'health', label: 'Health Check', icon: CheckCircle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCreateBackup}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>Create Backup</span>
                </button>
                <button
                  onClick={handleExportSettings}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export to File</span>
                </button>
                <button
                  onClick={handleImportSettings}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import from File</span>
                </button>
                <button
                  onClick={handleResetToDefaults}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Defaults</span>
                </button>
              </div>

              {/* Backups List */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Available Backups</h3>
                {backups.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    No backups found. Create your first backup to get started.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backups.map(backup => (
                      <div
                        key={backup.id}
                        className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                      >
                        <div>
                          <div className="font-medium text-white">{backup.name}</div>
                          <div className="text-sm text-gray-400">
                            {formatDate(backup.timestamp)} • {formatFileSize(backup.size)}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRestoreBackup(backup.id)}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Restore backup"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(backup.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete backup"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-6">
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleValidateSettings}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  <span>Run Validation</span>
                </button>
                <button
                  onClick={handleAutoRepair}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Auto-Repair</span>
                </button>
              </div>

              {/* Validation Results */}
              {validationResult && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${
                    validationResult.valid
                      ? 'bg-green-900/20 border-green-500/30 text-green-400'
                      : 'bg-red-900/20 border-red-500/30 text-red-400'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {validationResult.valid ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                      <span className="font-medium">
                        {validationResult.valid ? 'All settings are valid' : 'Settings validation failed'}
                      </span>
                    </div>
                  </div>

                  {validationResult.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-2">Issues Found:</h4>
                      <ul className="space-y-1">
                        {validationResult.issues.map((issue, index) => (
                          <li key={index} className="text-red-400 text-sm">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.repaired.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-2">Auto-Repaired:</h4>
                      <ul className="space-y-1">
                        {validationResult.repaired.map((repair, index) => (
                          <li key={index} className="text-green-400 text-sm">• {repair}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-2">Warnings:</h4>
                      <ul className="space-y-1">
                        {validationResult.warnings.map((warning, index) => (
                          <li key={index} className="text-yellow-400 text-sm">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              <button
                onClick={loadHealthStatus}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>Refresh Health Status</span>
              </button>

              {healthStatus && (
                <div className="space-y-4">
                  {/* Overall Status */}
                  <div className={`p-4 rounded-lg border ${
                    healthStatus.healthy
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-yellow-900/20 border-yellow-500/30'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {healthStatus.healthy ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      )}
                      <span className={`font-medium ${
                        healthStatus.healthy ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {healthStatus.healthy ? 'System Healthy' : 'Attention Required'}
                      </span>
                    </div>
                  </div>

                  {/* Service Statuses */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Service Status:</h4>
                    <div className="space-y-2">
                      {healthStatus.services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {service.status === 'healthy' && <CheckCircle className="w-4 h-4 text-green-400" />}
                            {service.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                            {service.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                            <span className="text-white font-medium">{service.name}</span>
                          </div>
                          <div className="text-sm text-gray-400">{service.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {healthStatus.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-3">Recommendations:</h4>
                      <ul className="space-y-1">
                        {healthStatus.recommendations.map((rec, index) => (
                          <li key={index} className="text-blue-400 text-sm">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsManager;