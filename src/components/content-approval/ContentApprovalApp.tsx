import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Filter, Search, BarChart3, Settings, Bell,
  Grid, List, Calendar, Download, Upload, RefreshCw
} from 'lucide-react';
import { useContentApprovalStore } from '../../stores/contentApprovalStore';
import { ApprovalFilters, ContentApprovalState } from '../../types/contentApproval';
import ApprovalBoard from './ApprovalBoard';
import ListView from './ListView';
import CalendarView from './CalendarView';
import AnalyticsView from './AnalyticsView';
import CreateContentModal from './CreateContentModal';
import FilterPanel from './FilterPanel';
import BulkActions from './BulkActions';
import NotificationCenter from './NotificationCenter';
import SettingsModal from './SettingsModal';

const ContentApprovalApp: React.FC = () => {
  const {
    currentView,
    selectedItems,
    filters,
    isLoading,
    error,
    notifications,
    stats,
    setView,
    setFilters,
    clearFilters,
    refreshStats,
    clearSelection,
    markAllNotificationsRead
  } = useContentApprovalStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshStats]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ ...filters, searchQuery: searchQuery || undefined });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, setFilters]);

  // Close bulk actions when no items selected
  useEffect(() => {
    if (selectedItems.length === 0) {
      setShowBulkActions(false);
    }
  }, [selectedItems.length]);

  const handleViewChange = (view: ContentApprovalState['currentView']) => {
    setView(view);
    clearSelection();
  };

  const handleExport = async () => {
    try {
      // Implementation would call backend export API
      const response = await fetch('/api/content-approval/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ filters })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content-approval-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className=\"flex h-screen bg-gray-50 overflow-hidden\">
      {/* Sidebar */}
      <div className=\"w-64 bg-white border-r border-gray-200 flex flex-col\">
        {/* Header */}
        <div className=\"p-6 border-b border-gray-200\">
          <h1 className=\"text-xl font-bold text-gray-900 mb-2\">Content Approval</h1>

          {/* Stats Overview */}
          <div className=\"grid grid-cols-2 gap-3 text-sm\">
            <div className=\"bg-blue-50 p-3 rounded-lg\">
              <div className=\"text-blue-600 font-medium\">{stats.pendingApprovals}</div>
              <div className=\"text-blue-500 text-xs\">Pending</div>
            </div>
            <div className=\"bg-red-50 p-3 rounded-lg\">
              <div className=\"text-red-600 font-medium\">{stats.overdueItems}</div>
              <div className=\"text-red-500 text-xs\">Overdue</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className=\"flex-1 p-4\">
          <nav className=\"space-y-2\">
            {[
              { key: 'board', icon: Grid, label: 'Board View' },
              { key: 'list', icon: List, label: 'List View' },
              { key: 'calendar', icon: Calendar, label: 'Calendar' },
              { key: 'analytics', icon: BarChart3, label: 'Analytics' }
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => handleViewChange(key as any)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className=\"w-4 h-4 mr-3\" />
                {label}
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className=\"mt-8 space-y-2\">
            <h3 className=\"text-xs font-medium text-gray-500 uppercase tracking-wider\">
              Quick Actions
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className=\"w-full flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors\"
            >
              <Plus className=\"w-4 h-4 mr-3\" />
              New Content
            </button>
            <button
              onClick={handleExport}
              className=\"w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors\"
            >
              <Download className=\"w-4 h-4 mr-3\" />
              Export Data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className=\"p-4 border-t border-gray-200\">
          <button
            onClick={() => setShowSettings(true)}
            className=\"w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors\"
          >
            <Settings className=\"w-4 h-4 mr-3\" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className=\"flex-1 flex flex-col overflow-hidden\">
        {/* Top Bar */}
        <div className=\"bg-white border-b border-gray-200 px-6 py-4\">
          <div className=\"flex items-center justify-between\">
            <div className=\"flex items-center space-x-4\">
              {/* Search */}
              <div className=\"relative\">
                <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4\" />
                <input
                  type=\"text\"
                  placeholder=\"Search content...\"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className=\"pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80\"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className=\"w-4 h-4 mr-2\" />
                Filters
                {Object.keys(filters).length > 1 && (
                  <span className=\"ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full\">
                    {Object.keys(filters).length - 1}
                  </span>
                )}
              </button>

              {/* Clear Filters */}
              {Object.keys(filters).length > 1 && (
                <button
                  onClick={clearFilters}
                  className=\"text-sm text-gray-500 hover:text-gray-700\"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className=\"flex items-center space-x-3\">
              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <button
                  onClick={() => setShowBulkActions(true)}
                  className=\"flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors\"
                >
                  {selectedItems.length} selected
                </button>
              )}

              {/* Refresh */}
              <button
                onClick={refreshStats}
                disabled={isLoading}
                className=\"p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors\"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className=\"relative p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors\"
              >
                <Bell className=\"w-4 h-4\" />
                {unreadNotifications > 0 && (
                  <span className=\"absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center\">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className=\"mt-4 border-t border-gray-200 pt-4\"
              >
                <FilterPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className=\"flex-1 overflow-hidden relative\">
          {error && (
            <div className=\"absolute top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg\">
              <div className=\"font-medium\">Error</div>
              <div className=\"text-sm\">{error}</div>
            </div>
          )}

          <AnimatePresence mode=\"wait\">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className=\"h-full\"
            >
              {currentView === 'board' && <ApprovalBoard />}
              {currentView === 'list' && <ListView />}
              {currentView === 'calendar' && <CalendarView />}
              {currentView === 'analytics' && <AnalyticsView />}
            </motion.div>
          </AnimatePresence>

          {/* Loading Overlay */}
          {isLoading && (
            <div className=\"absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-40\">
              <div className=\"flex items-center space-x-3 text-gray-600\">
                <RefreshCw className=\"w-5 h-5 animate-spin\" />
                <span>Loading...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className=\"absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-200 z-50 overflow-hidden\"
          >
            <NotificationCenter
              onClose={() => setShowNotifications(false)}
              onMarkAllRead={markAllNotificationsRead}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateContentModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
          />
        )}

        {showBulkActions && (
          <BulkActions
            isOpen={showBulkActions}
            onClose={() => setShowBulkActions(false)}
            selectedItems={selectedItems}
          />
        )}

        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentApprovalApp;