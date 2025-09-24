import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Settings, 
  RefreshCw, 
  Edit3, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Loader,
  Copy,
  Download,
  ExternalLink,
  Filter,
  Search,
  MoreVertical,
  TrendingUp,
  Activity,
  Eye,
  Maximize2,
  Archive,
  Play,
  Pause,
  Square,
  Bell,
  BellOff,
  Wifi,
  WifiOff,
  FileText,
  Table,
  FileSpreadsheet,
  Trash2,
  RotateCcw,
  FolderArchive,
  PlayCircle,
  CheckSquare,
  X,
  GripVertical,
  Shield
} from 'lucide-react';
import { useAutomationHubStore, initializeDefaultAutomations } from '../../stores/automationHubStore';
import AutomationCard from '../AutomationCard';
import QuickSetup from '../QuickSetup';
import AIInsightsPanel from '../AIInsightsPanel';
import PerformanceMonitor from '../PerformanceMonitor';
import realTimeService, { AutomationUpdate, AlertEvent } from '../../services/realTimeService';
import alertService from '../../services/alertService';
import exportService from '../../services/exportService';
import bulkOperationsService, { BulkAction, BulkOperationOptions } from '../../services/bulkOperationsService';
import dragDropService from '../../services/dragDropService';
import themeService from '../../services/themeService';
import customViewsService from '../../services/customViewsService';
import keyboardShortcutsService from '../../services/keyboardShortcutsService';
import ThemeCustomizer from '../ui/ThemeCustomizer';
import KeyboardShortcutsHelp from '../ui/KeyboardShortcutsHelp';
import CustomViewsSelector from '../ui/CustomViewsSelector';
import SettingsManager from '../ui/SettingsManager';
import aiHubSettingsManager from '../../services/aiHubSettingsManager';

interface AIHubWidgetProps {
  onNavigateToAutomations?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
}

const AIHubWidget: React.FC<AIHubWidgetProps> = ({ 
  onNavigateToAutomations, 
  onMaximize, 
  isMaximized = false 
}) => {
  const {
    userProfile,
    automationResults,
    isSetupOpen,
    lastGlobalRefresh,
    toggleSetup,
    refreshAllAutomations,
    getStaleAutomations,
  } = useAutomationHubStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStats, setRefreshStats] = useState({ fresh: 0, stale: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'fresh' | 'stale' | 'running'>('all');
  const [showOptions, setShowOptions] = useState(false);
  
  // Real-time and alert states
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [realtimeUpdates, setRealtimeUpdates] = useState<Map<string, AutomationUpdate>>(new Map());
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  
  // Bulk operations states
  const [selectedAutomations, setSelectedAutomations] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<{ type: BulkAction; progress: number } | null>(null);
  
  // Export states
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Drag & Drop states
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedOverItem, setDraggedOverItem] = useState<string | null>(null);
  const [automationOrder, setAutomationOrder] = useState<string[]>([]);
  
  // UX Enhancement states
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showSettingsManager, setShowSettingsManager] = useState(false);
  const [currentView, setCurrentView] = useState('default');

  // Initialize default automations and services on first load
  useEffect(() => {
    const initializeServices = async () => {
      initializeDefaultAutomations();
      
      // Initialize AI Hub settings manager
      await aiHubSettingsManager.initializeSettings();
      
      // Register keyboard shortcuts
      keyboardShortcutsService.updateShortcutAction('toggle_bulk_mode', toggleBulkMode);
      keyboardShortcutsService.updateShortcutAction('refresh_all', handleRefreshAll);
      keyboardShortcutsService.updateShortcutAction('show_help', () => setShowKeyboardHelp(true));
      keyboardShortcutsService.updateShortcutAction('toggle_theme', () => setShowThemeCustomizer(true));
      keyboardShortcutsService.updateShortcutAction('quick_export_json', () => handleExport('json'));
      keyboardShortcutsService.updateShortcutAction('quick_export_csv', () => handleExport('csv'));
      keyboardShortcutsService.updateShortcutAction('select_all', selectAllAutomations);
      keyboardShortcutsService.updateShortcutAction('clear_selection', clearSelection);
      
      // Start auto backup
      aiHubSettingsManager.startAutoBackup(24); // Every 24 hours
    };

    initializeServices();
    
    return () => {
      // Cleanup shortcuts when component unmounts
      keyboardShortcutsService.destroy();
    };
  }, []);

  // Real-time connection and updates
  useEffect(() => {
    const unsubscribeConnection = realTimeService.on('connected', () => {
      setConnectionStatus('connected');
    });

    const unsubscribeDisconnection = realTimeService.on('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    const unsubscribeUpdates = realTimeService.on('automation_update', (update: AutomationUpdate) => {
      setRealtimeUpdates(prev => {
        const newMap = new Map(prev);
        newMap.set(update.id, update);
        return newMap;
      });
    });

    const unsubscribeAlerts = alertService.onAlert((event: string, alert: AlertEvent) => {
      if (event === 'alert_received') {
        setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      }
    });

    // Initial connection status
    setConnectionStatus(realTimeService.getConnectionStatus());
    setAlerts(alertService.getActiveAlerts().slice(0, 10));

    return () => {
      unsubscribeConnection();
      unsubscribeDisconnection();
      unsubscribeUpdates();
      unsubscribeAlerts();
    };
  }, []);

  // Calculate refresh stats and initialize automation order
  useEffect(() => {
    const results = Object.values(automationResults);
    const fresh = results.filter(r => r.status === 'fresh').length;
    const stale = results.filter(r => r.status === 'stale' || isDataStale(r)).length;
    
    setRefreshStats({
      fresh,
      stale,
      total: results.length
    });

    // Initialize automation order if not set
    if (automationOrder.length === 0 && results.length > 0) {
      setAutomationOrder(results.map(r => r.id));
    }
  }, [automationResults, automationOrder.length]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllAutomations();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyData = async () => {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        stats: refreshStats,
        automations: Object.values(automationResults).map(automation => ({
          id: automation.id,
          title: automation.title,
          status: automation.status,
          lastRun: automation.timestamp
        }))
      };
      
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      
      // Show success feedback
      const button = document.getElementById('copy-button');
      if (button) {
        button.classList.add('bg-green-600');
        setTimeout(() => button.classList.remove('bg-green-600'), 1000);
      }
    } catch (error) {
      console.error('Failed to copy data:', error);
    }
  };

  const handleDownloadData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      stats: refreshStats,
      automations: Object.values(automationResults),
      userProfile
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-hub-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Enhanced export functions
  const handleExport = async (format: 'json' | 'csv' | 'excel' | 'pdf') => {
    try {
      const automationsList = Object.values(automationResults);
      const data = exportService.generateExportData(automationsList, refreshStats, alerts);
      
      await exportService.exportData(data, {
        format,
        includeStats: true,
        includeAlerts: alerts.length > 0
      });
      
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Bulk operations functions
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedAutomations(new Set());
  };

  const toggleAutomationSelection = (automationId: string) => {
    setSelectedAutomations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(automationId)) {
        newSet.delete(automationId);
      } else {
        newSet.add(automationId);
      }
      return newSet;
    });
  };

  const selectAllAutomations = () => {
    const allIds = Object.keys(automationResults);
    setSelectedAutomations(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedAutomations(new Set());
  };

  const executeBulkOperation = async (action: BulkAction, parameters?: any) => {
    if (selectedAutomations.size === 0) return;

    setBulkOperation({ type: action, progress: 0 });

    try {
      const options: BulkOperationOptions = {
        action,
        automationIds: Array.from(selectedAutomations),
        parameters,
        onProgress: (completed, total) => {
          setBulkOperation(prev => prev ? { ...prev, progress: (completed / total) * 100 } : null);
        }
      };

      const result = await bulkOperationsService.executeBulkOperation(options);
      
      if (result.successful > 0) {
        // Refresh data after successful operations
        await refreshAllAutomations();
      }

      // Show result summary (you could add a toast notification here)
      console.log(`Bulk ${action} completed: ${result.successful}/${result.total} successful`);

    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setBulkOperation(null);
      setSelectedAutomations(new Set());
      setBulkMode(false);
    }
  };

  // Alert functions
  const toggleAlerts = () => {
    setShowAlerts(!showAlerts);
  };

  const acknowledgeAlert = (alertId: string) => {
    alertService.acknowledgeAlert(alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    alertService.dismissAlert(alertId);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Drag & Drop handlers
  const handleDragStart = (automationId: string, event: React.DragEvent) => {
    setDraggedItem(automationId);
    dragDropService.startDragOperation({
      id: automationId,
      type: 'automation',
      data: automationResults[automationId]
    }, { 
      clientX: event.clientX, 
      clientY: event.clientY 
    } as MouseEvent);
    
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', automationId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverItem(null);
    dragDropService.endDragOperation();
  };

  const handleDragOver = (automationId: string, event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    if (draggedItem && draggedItem !== automationId) {
      setDraggedOverItem(automationId);
    }
  };

  const handleDrop = (targetId: string, event: React.DragEvent) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain');
    
    if (sourceId && sourceId !== targetId) {
      const newOrder = [...automationOrder];
      const sourceIndex = newOrder.indexOf(sourceId);
      const targetIndex = newOrder.indexOf(targetId);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        // Remove source and insert at target position
        newOrder.splice(sourceIndex, 1);
        const newTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newOrder.splice(newTargetIndex, 0, sourceId);
        
        setAutomationOrder(newOrder);
        
        // Update priorities in drag drop service
        dragDropService.updateItemOrder(sourceId, newTargetIndex);
      }
    }
    
    handleDragEnd();
  };

  const handleDragLeave = (event: React.DragEvent) => {
    // Only clear drag over if leaving the entire component
    const rect = event.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = event;
    
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setDraggedOverItem(null);
    }
  };

  // Keyboard support for drag and drop
  const handleKeyDown = (automationId: string, event: React.KeyboardEvent) => {
    if (bulkMode) return; // Disable keyboard drag in bulk mode
    
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      // Toggle selection for keyboard-based reordering
      if (draggedItem === automationId) {
        setDraggedItem(null);
      } else {
        setDraggedItem(automationId);
      }
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (draggedItem === automationId) {
        event.preventDefault();
        const currentIndex = automationOrder.indexOf(automationId);
        const newIndex = event.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1;
        
        if (newIndex >= 0 && newIndex < automationOrder.length) {
          const newOrder = [...automationOrder];
          newOrder.splice(currentIndex, 1);
          newOrder.splice(newIndex, 0, automationId);
          setAutomationOrder(newOrder);
          dragDropService.updateItemOrder(automationId, newIndex);
        }
      }
    } else if (event.key === 'Escape') {
      setDraggedItem(null);
      setDraggedOverItem(null);
    }
  };

  // Custom view handlers
  const handleViewChange = (viewId: string) => {
    setCurrentView(viewId);
    if (viewId !== 'default') {
      const view = customViewsService.getView(viewId);
      if (view) {
        setSearchTerm(view.filters.search || '');
        setFilterStatus(view.filters.status || 'all');
        // Apply other filters as needed
      }
    } else {
      // Reset to default
      setSearchTerm('');
      setFilterStatus('all');
    }
  };

  const handleSaveCurrentView = () => {
    const name = prompt('Enter a name for this view:');
    if (name && name.trim()) {
      customViewsService.createViewFromCurrentState(
        name.trim(),
        {
          search: searchTerm,
          status: filterStatus,
          // Add other current filter state
        },
        {
          field: 'timestamp',
          direction: 'desc'
        },
        {
          type: isMaximized ? 'grid' : 'list',
          density: 'comfortable',
          showStats: true
        }
      );
    }
  };

  const isDataStale = (automation: any): boolean => {
    const now = new Date();
    const dataAge = (now.getTime() - new Date(automation.timestamp).getTime()) / (1000 * 60);
    return dataAge > automation.refreshInterval;
  };

  const getStatusSummary = () => {
    if (refreshStats.total === 0) return 'No automations configured';
    if (refreshStats.fresh === refreshStats.total) return 'All data is fresh';
    if (refreshStats.stale > 0) return `${refreshStats.stale} need refresh`;
    return `${refreshStats.fresh}/${refreshStats.total} up to date`;
  };

  const getStatusColor = () => {
    if (refreshStats.total === 0) return 'text-gray-400';
    if (refreshStats.fresh === refreshStats.total) return 'text-green-400';
    if (refreshStats.stale > 0) return 'text-yellow-400';
    return 'text-blue-400';
  };

  // Filter automations based on search and status filter, respecting custom order
  const filteredAutomations = automationOrder
    .map(id => automationResults[id])
    .filter(automation => automation && (
      (searchTerm === '' || 
       automation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       automation.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || 
       (filterStatus === 'fresh' && automation.status === 'fresh') ||
       (filterStatus === 'stale' && (automation.status === 'stale' || isDataStale(automation))) ||
       (filterStatus === 'running' && automation.status === 'running'))
    ));

  if (!userProfile.isSetupComplete) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 h-full min-h-[400px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Automation Hub</h3>
              <p className="text-gray-400 text-sm">Your central automation command center</p>
            </div>
          </div>
          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              title="Maximize widget"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-center flex-1 min-h-[300px]">
          <div className="text-center py-12">
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20 max-w-md mx-auto">
              <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Welcome to AI Hub!</h3>
              <p className="text-gray-400 mb-6">
                Complete the quick setup to get personalized AI automation results for your business.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSetup(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium"
              >
                Start Setup
              </motion.button>
            </div>
          </div>
        </div>

        <QuickSetup isOpen={isSetupOpen} onClose={() => toggleSetup(false)} />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 h-full">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
            {/* Connection Status Indicator */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400' : 
              connectionStatus === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'
            }`} title={`Connection: ${connectionStatus}`}>
              <div className={`w-full h-full rounded-full animate-ping ${
                connectionStatus === 'connected' ? 'bg-green-400' : 
                connectionStatus === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'
              }`}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-white">AI Automation Hub</h3>
              {connectionStatus === 'connected' && <Wifi className="w-4 h-4 text-green-400" />}
              {connectionStatus === 'disconnected' && <WifiOff className="w-4 h-4 text-red-400" />}
            </div>
            <div className="flex items-center space-x-4">
              <p className={`text-sm ${getStatusColor()}`}>
                {getStatusSummary()}
                {lastGlobalRefresh && (
                  <span className="ml-2 text-gray-500">
                    • Last: {new Date(lastGlobalRefresh).toLocaleTimeString()}
                  </span>
                )}
              </p>
              {alerts.length > 0 && (
                <button
                  onClick={toggleAlerts}
                  className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-300"
                  title={`${alerts.length} active alerts`}
                >
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">{alerts.length}</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Bulk Mode Toggle */}
          {refreshStats.total > 0 && (
            <button
              onClick={toggleBulkMode}
              className={`p-2 rounded-lg transition-colors ${
                bulkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              title={bulkMode ? 'Exit bulk mode' : 'Enter bulk mode'}
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          )}

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              title="Export options"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[140px]"
                >
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-t-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">JSON</span>
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <Table className="w-4 h-4" />
                    <span className="text-sm">CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-sm">Excel</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-b-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">PDF</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[160px]"
                >
                  <button
                    id="copy-button"
                    onClick={handleCopyData}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-t-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Copy Data</span>
                  </button>
                  <button
                    onClick={() => {
                      setAlertsEnabled(!alertsEnabled);
                      alertService.enableNotifications(alertsEnabled);
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    {alertsEnabled ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    <span className="text-sm">{alertsEnabled ? 'Disable Alerts' : 'Enable Alerts'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowThemeCustomizer(true);
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Theme Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowKeyboardHelp(true);
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm">Keyboard Shortcuts</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSettingsManager(true);
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Settings Manager</span>
                  </button>
                  {onNavigateToAutomations && (
                    <button
                      onClick={() => {
                        onNavigateToAutomations();
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">Full View</span>
                    </button>
                  )}
                  {onMaximize && (
                    <button
                      onClick={() => {
                        onMaximize();
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-b-lg transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span className="text-sm">Maximize</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
              isRefreshing 
                ? 'bg-purple-600/50 text-purple-300 cursor-not-allowed' 
                : 'bg-purple-600/80 hover:bg-purple-600 text-white'
            }`}
            title="Refresh all automations"
          >
            {isRefreshing ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Search, Filter, and Views Bar */}
      {refreshStats.total > 0 && (
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search automations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>
          
          {/* Custom Views Selector */}
          <CustomViewsSelector 
            currentView={currentView}
            onViewChange={handleViewChange}
            onSaveView={handleSaveCurrentView}
          />
          
          <div className="flex items-center space-x-1">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All</option>
              <option value="fresh">Fresh</option>
              <option value="stale">Stale</option>
              <option value="running">Running</option>
            </select>
          </div>
        </div>
      )}

      {/* Alerts Panel */}
      <AnimatePresence>
        {showAlerts && alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-yellow-400 font-medium">Active Alerts ({alerts.length})</h4>
              <button
                onClick={() => setShowAlerts(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between bg-gray-800/50 rounded-lg p-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className={`w-4 h-4 ${
                        alert.severity === 'critical' ? 'text-red-400' :
                        alert.severity === 'high' ? 'text-orange-400' :
                        alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                      }`} />
                      <span className="text-white text-sm font-medium">{alert.title}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{alert.message}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex space-x-1 ml-3">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="p-1 text-green-400 hover:text-green-300"
                        title="Acknowledge"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Operations Bar */}
      <AnimatePresence>
        {bulkMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <h4 className="text-blue-400 font-medium">
                  Bulk Operations ({selectedAutomations.size} selected)
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllAutomations}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-gray-400 hover:text-gray-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <button
                onClick={() => setBulkMode(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {selectedAutomations.size > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => executeBulkOperation('start')}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600/20 border border-green-500/30 text-green-400 rounded text-xs hover:bg-green-600/30"
                  disabled={!!bulkOperation}
                >
                  <Play className="w-3 h-3" />
                  <span>Start</span>
                </button>
                <button
                  onClick={() => executeBulkOperation('pause')}
                  className="flex items-center space-x-1 px-3 py-1 bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 rounded text-xs hover:bg-yellow-600/30"
                  disabled={!!bulkOperation}
                >
                  <Pause className="w-3 h-3" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={() => executeBulkOperation('stop')}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-600/30"
                  disabled={!!bulkOperation}
                >
                  <Square className="w-3 h-3" />
                  <span>Stop</span>
                </button>
                <button
                  onClick={() => executeBulkOperation('refresh')}
                  className="flex items-center space-x-1 px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded text-xs hover:bg-purple-600/30"
                  disabled={!!bulkOperation}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => executeBulkOperation('archive')}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-600/20 border border-gray-500/30 text-gray-400 rounded text-xs hover:bg-gray-600/30"
                  disabled={!!bulkOperation}
                >
                  <FolderArchive className="w-3 h-3" />
                  <span>Archive</span>
                </button>
              </div>
            )}
            
            {bulkOperation && (
              <div className="mt-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-sm text-blue-400">
                    {bulkOperation.type.charAt(0).toUpperCase() + bulkOperation.type.slice(1)}ing automations...
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${bulkOperation.progress}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div className={`flex-1 ${isMaximized ? 'overflow-y-auto max-h-[600px]' : 'overflow-hidden'}`}>
        {refreshStats.total === 0 ? (
          // Empty state
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No Automations Configured</h3>
              <p className="text-gray-500 mb-4">Set up your first automation to get started.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSetup(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
              >
                Configure Automations
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">{refreshStats.fresh}</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Fresh Data</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">{refreshStats.stale}</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Need Refresh</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">{refreshStats.total}</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Total Active</p>
              </div>
            </div>

            {/* Automation Cards */}
            <div className={`${isMaximized ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'} max-h-[400px] overflow-y-auto`}>
              {filteredAutomations.slice(0, isMaximized ? filteredAutomations.length : 4).map((automation, index) => (
                <motion.div
                  key={automation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative ${isMaximized ? '' : 'transform scale-90'} ${
                    draggedItem === automation.id ? 'opacity-50 transform rotate-2' : ''
                  } ${
                    draggedOverItem === automation.id ? 'ring-2 ring-purple-400 ring-opacity-50' : ''
                  }`}
                  draggable={!bulkMode}
                  onDragStart={(e) => handleDragStart(automation.id, e)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(automation.id, e)}
                  onDrop={(e) => handleDrop(automation.id, e)}
                  onDragLeave={handleDragLeave}
                  onKeyDown={(e) => handleKeyDown(automation.id, e)}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`${automation.title} - ${automation.status}. Press space to select for reordering, arrow keys to move.`}
                >
                  {/* Drag handle indicator */}
                  {!bulkMode && (
                    <div className="absolute top-2 left-2 z-10 opacity-60 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Selection checkbox in bulk mode */}
                  {bulkMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedAutomations.has(automation.id)}
                        onChange={() => toggleAutomationSelection(automation.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  )}
                  
                  {/* Real-time status overlay */}
                  {realtimeUpdates.has(automation.id) && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Live updates" />
                    </div>
                  )}
                  
                  <div className={`${bulkMode ? 'ml-6' : 'ml-6'} transition-all cursor-move`}>
                    <AutomationCard automation={automation} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Show more indicator */}
            {!isMaximized && filteredAutomations.length > 4 && (
              <div className="text-center py-2">
                <button
                  onClick={onMaximize || onNavigateToAutomations}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1 mx-auto"
                >
                  <Eye className="w-4 h-4" />
                  <span>View {filteredAutomations.length - 4} more automations</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Setup Modal */}
      <QuickSetup isOpen={isSetupOpen} onClose={() => toggleSetup(false)} />
      
      {/* Theme Customizer Modal */}
      <ThemeCustomizer 
        isOpen={showThemeCustomizer} 
        onClose={() => setShowThemeCustomizer(false)} 
      />
      
      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp 
        isOpen={showKeyboardHelp} 
        onClose={() => setShowKeyboardHelp(false)} 
      />
      
      {/* Settings Manager Modal */}
      <SettingsManager 
        isOpen={showSettingsManager} 
        onClose={() => setShowSettingsManager(false)} 
      />
    </div>
  );
};

export default AIHubWidget;