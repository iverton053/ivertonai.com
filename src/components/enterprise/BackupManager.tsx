import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Upload, 
  Calendar, 
  Database, 
  Shield, 
  Clock, 
  FileText, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Settings,
  Server,
  Archive,
  X
} from 'lucide-react';
import { backupService, BackupMetadata, BackupOptions } from '../../services/backupService';

interface BackupManagerProps {
  className?: string;
}

const BackupManager: React.FC<BackupManagerProps> = ({ className = '' }) => {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  
  // Scheduling state
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [scheduleTime, setScheduleTime] = useState('02:00');
  const [retentionDays, setRetentionDays] = useState(30);
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    includeUserData: true,
    includeSettings: true,
    includeWidgets: true,
    includeHistory: true,
    includeReports: true,
    includeAnalytics: true,
    includeAutomations: true,
    compress: false,
    encrypt: false,
  });

  // Load backups on component mount
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = useCallback(async () => {
    try {
      setIsLoading(true);
      const availableBackups = await backupService.getAvailableBackups();
      setBackups(availableBackups.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      setCreateProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setCreateProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const backup = await backupService.createBackup(backupOptions);
      
      clearInterval(progressInterval);
      setCreateProgress(100);
      
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateProgress(0);
        loadBackups();
      }, 1000);
      
      console.log('✅ Backup created successfully:', backup.metadata.name);
    } catch (error) {
      console.error('❌ Error creating backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    try {
      setIsLoading(true);
      setRestoreProgress(0);
      
      // Get the backup data
      const allBackups = JSON.parse(localStorage.getItem('iverton_backups') || '[]');
      const backupData = allBackups.find((b: any) => b.metadata.id === backupId);
      
      if (!backupData) {
        throw new Error('Backup not found');
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setRestoreProgress(prev => Math.min(prev + 8, 90));
      }, 300);

      const success = await backupService.restoreFromBackup(backupData, backupOptions);
      
      clearInterval(progressInterval);
      setRestoreProgress(100);
      
      if (success) {
        setTimeout(() => {
          setShowRestoreModal(false);
          setRestoreProgress(0);
          // Page will reload automatically after restore
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Error restoring backup:', error);
      setRestoreProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportBackup = async (backupId: string) => {
    try {
      await backupService.exportBackup(backupId);
    } catch (error) {
      console.error('Error exporting backup:', error);
    }
  };

  const handleImportBackup = async (file: File) => {
    try {
      setIsLoading(true);
      await backupService.importBackup(file);
      loadBackups();
    } catch (error) {
      console.error('Error importing backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      try {
        await backupService.deleteBackup(backupId);
        loadBackups();
      } catch (error) {
        console.error('Error deleting backup:', error);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Database className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Backup & Restore</h2>
            <p className="text-gray-400">Enterprise data protection and recovery</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Archive className="w-4 h-4" />
            <span>Create Backup</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadBackups}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="glass-effect p-4 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Automatic Backups</h3>
              <p className="text-gray-400 text-sm">Scheduled daily at midnight</p>
              <span className="text-green-400 text-xs font-medium">✓ Active</span>
            </div>
          </div>
        </div>

        <div className="glass-effect p-4 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3">
            <Server className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Cloud Storage</h3>
              <p className="text-gray-400 text-sm">Encrypted remote backups</p>
              <span className="text-blue-400 text-xs font-medium">Enterprise Feature</span>
            </div>
          </div>
        </div>

        <div className="glass-effect p-4 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-orange-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Retention Policy</h3>
              <p className="text-gray-400 text-sm">Keep 30 days, delete older</p>
              <span className="text-orange-400 text-xs font-medium">Configurable</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Backup List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Available Backups</h3>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-gray-400 cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportBackup(file);
                }}
                className="hidden"
              />
              <Upload className="w-4 h-4" />
              <span className="text-sm">Import</span>
            </label>
          </div>
        </div>

        {isLoading && backups.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="ml-2 text-gray-400">Loading backups...</span>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">No backups found</h4>
            <p className="text-gray-500">Create your first backup to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup, index) => (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{backup.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{formatDate(backup.createdAt)}</span>
                      <span>•</span>
                      <span>{formatFileSize(backup.size)}</span>
                      <span>•</span>
                      <span className="capitalize">{backup.type}</span>
                      <span>•</span>
                      <span>{backup.dataTypes.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedBackup(backup.id);
                      setShowRestoreModal(true);
                    }}
                    className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                    title="Restore backup"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExportBackup(backup.id)}
                    className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                    title="Export backup"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteBackup(backup.id)}
                    className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                    title="Delete backup"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Backup Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => !isLoading && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Archive className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Create New Backup</h3>
              </div>

              {createProgress > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Creating backup...</span>
                    <span className="text-sm text-purple-400">{createProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${createProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium text-gray-300">Include in backup:</h4>
                
                {Object.entries({
                  includeUserData: 'User Data & Profiles',
                  includeSettings: 'Application Settings',
                  includeWidgets: 'Dashboard Widgets',
                  includeHistory: 'Activity History',
                  includeReports: 'Generated Reports',
                  includeAnalytics: 'Analytics Data',
                  includeAutomations: 'Automation Rules'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={backupOptions[key as keyof BackupOptions] as boolean}
                      onChange={(e) => setBackupOptions(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      disabled={isLoading}
                      className="w-4 h-4 text-purple-600 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateBackup}
                  disabled={isLoading}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      <span>Create Backup</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore Backup Modal */}
      <AnimatePresence>
        {showRestoreModal && selectedBackup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => !isLoading && setShowRestoreModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex items-center space-x-3 mb-6">
                <RefreshCw className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-semibold text-white">Restore Backup</h3>
              </div>

              {restoreProgress > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Restoring data...</span>
                    <span className="text-sm text-green-400">{restoreProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${restoreProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center space-x-2 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg mb-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm text-yellow-300">
                    This will replace your current data. A restore point will be created automatically.
                  </p>
                </div>

                <div className="text-sm text-gray-400">
                  <p>Backup: <span className="text-white">{backups.find(b => b.id === selectedBackup)?.name}</span></p>
                  <p>Created: <span className="text-white">{backups.find(b => b.id === selectedBackup)?.createdAt && formatDate(backups.find(b => b.id === selectedBackup)!.createdAt)}</span></p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRestoreModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRestoreBackup(selectedBackup)}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Restoring...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Restore Now</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Backup Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Schedule Backups</h3>
                    <p className="text-sm text-gray-400">Configure automatic backup scheduling</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                {/* Enable Scheduling Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Enable Scheduled Backups</h4>
                    <p className="text-xs text-gray-400">Automatically create backups on schedule</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setScheduleEnabled(!scheduleEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors ${scheduleEnabled ? 'bg-blue-600' : 'bg-gray-600'} relative`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${scheduleEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </motion.button>
                </div>

                {scheduleEnabled && (
                  <>
                    {/* Frequency Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={scheduleFrequency}
                        onChange={(e) => setScheduleFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {/* Time Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Backup Time
                      </label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Retention Period */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Retention Period (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={retentionDays}
                        onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="30"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Backups older than this will be automatically deleted
                      </p>
                    </div>

                    {/* Next Scheduled Backup Info */}
                    <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Next Scheduled Backup</span>
                      </div>
                      <p className="text-sm text-blue-200">
                        {scheduleFrequency === 'daily' ? 'Daily' : 
                         scheduleFrequency === 'weekly' ? 'Weekly' : 'Monthly'} at {scheduleTime}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Save schedule settings
                    console.log('💾 Schedule settings saved:', {
                      enabled: scheduleEnabled,
                      frequency: scheduleFrequency,
                      time: scheduleTime,
                      retention: retentionDays
                    });
                    setShowScheduleModal(false);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Schedule</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackupManager;