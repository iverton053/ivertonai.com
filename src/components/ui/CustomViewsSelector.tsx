import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Plus,
  Star,
  Settings,
  Search,
  Filter,
  Edit,
  Copy,
  Trash2,
  Pin,
  PinOff,
  BookmarkPlus,
  ChevronDown,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import customViewsService, { CustomView, FilterCriteria, SortOptions, ViewLayout } from '../../services/customViewsService';

interface CustomViewsSelectorProps {
  currentFilters: FilterCriteria;
  currentSort: SortOptions;
  currentLayout: ViewLayout;
  onViewChange: (view: CustomView) => void;
  onFiltersChange: (filters: FilterCriteria) => void;
  onSortChange: (sort: SortOptions) => void;
  onLayoutChange: (layout: ViewLayout) => void;
}

const CustomViewsSelector: React.FC<CustomViewsSelectorProps> = ({
  currentFilters,
  currentSort,
  currentLayout,
  onViewChange,
  onFiltersChange,
  onSortChange,
  onLayoutChange
}) => {
  const [views, setViews] = useState<CustomView[]>([]);
  const [activeView, setActiveView] = useState<CustomView | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Create view form state
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');
  const [newViewColor, setNewViewColor] = useState('purple');
  const [newViewIcon, setNewViewIcon] = useState('Eye');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const unsubscribe = customViewsService.onViewsChange((newViews, newActiveView) => {
      setViews(newViews);
      setActiveView(newActiveView);
      if (newActiveView) {
        onViewChange(newActiveView);
      }
    });

    // Initialize
    setViews(customViewsService.getAllViews());
    setActiveView(customViewsService.getActiveView());

    return unsubscribe;
  }, [onViewChange]);

  const handleViewSelect = (view: CustomView) => {
    customViewsService.setActiveView(view.id);
    setShowDropdown(false);
  };

  const handleCreateView = () => {
    if (!newViewName.trim()) return;

    const viewId = customViewsService.createViewFromCurrentState(
      newViewName.trim(),
      currentFilters,
      currentSort,
      currentLayout,
      {
        description: newViewDescription.trim() || undefined,
        color: newViewColor,
        icon: newViewIcon,
        isPinned
      }
    );

    customViewsService.setActiveView(viewId);
    
    // Reset form
    setNewViewName('');
    setNewViewDescription('');
    setNewViewColor('purple');
    setNewViewIcon('Eye');
    setIsPinned(false);
    setShowCreateModal(false);
  };

  const handleDuplicateView = (view: CustomView) => {
    const newName = prompt(`Duplicate "${view.name}" as:`, `${view.name} (Copy)`);
    if (newName) {
      const newViewId = customViewsService.duplicateView(view.id, newName);
      if (newViewId) {
        customViewsService.setActiveView(newViewId);
      }
    }
  };

  const handleDeleteView = (view: CustomView) => {
    if (confirm(`Are you sure you want to delete the view "${view.name}"?`)) {
      customViewsService.deleteView(view.id);
    }
  };

  const handleTogglePin = (view: CustomView) => {
    customViewsService.togglePin(view.id);
  };

  const handleSetAsDefault = (view: CustomView) => {
    customViewsService.setAsDefault(view.id);
  };

  const filteredViews = views.filter(view =>
    searchTerm === '' || 
    view.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (view.description && view.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pinnedViews = filteredViews.filter(v => v.isPinned);
  const otherViews = filteredViews.filter(v => !v.isPinned);

  const colorOptions = [
    { id: 'purple', name: 'Purple', color: '#a855f7' },
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'green', name: 'Green', color: '#22c55e' },
    { id: 'orange', name: 'Orange', color: '#f97316' },
    { id: 'red', name: 'Red', color: '#ef4444' },
    { id: 'cyan', name: 'Cyan', color: '#06b6d4' },
    { id: 'yellow', name: 'Yellow', color: '#eab308' },
    { id: 'pink', name: 'Pink', color: '#ec4899' }
  ];

  const iconOptions = [
    'Eye', 'Star', 'Bookmark', 'Filter', 'Search', 'Settings', 
    'LayoutGrid', 'List', 'Clock', 'TrendingUp', 'Activity', 
    'AlertTriangle', 'CheckCircle', 'Play', 'Pause'
  ];

  return (
    <div className="relative">
      {/* Current View Display */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg hover:border-purple-500 text-white transition-colors min-w-[200px]"
      >
        <div className="flex items-center space-x-2 flex-1">
          {activeView ? (
            <>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colorOptions.find(c => c.id === activeView.color)?.color || '#a855f7' }}
              />
              <span className="font-medium">{activeView.name}</span>
              {activeView.isPinned && <Pin className="w-3 h-3 text-yellow-400" />}
              {activeView.isDefault && <Star className="w-3 h-3 text-yellow-400" />}
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Select a view</span>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${
          showDropdown ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">Custom Views</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setShowCreateModal(true);
                      setShowDropdown(false);
                    }}
                    className="p-1 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded transition-colors"
                    title="Create new view"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowManageModal(true);
                      setShowDropdown(false);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
                    title="Manage views"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search views..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Views List */}
            <div className="max-h-64 overflow-y-auto">
              {/* Pinned Views */}
              {pinnedViews.length > 0 && (
                <div className="p-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-2">Pinned</div>
                  {pinnedViews.map(view => (
                    <button
                      key={view.id}
                      onClick={() => handleViewSelect(view)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activeView?.id === view.id
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colorOptions.find(c => c.id === view.color)?.color || '#a855f7' }}
                      />
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{view.name}</span>
                          {view.isDefault && <Star className="w-3 h-3 text-yellow-400" />}
                        </div>
                        {view.description && (
                          <p className="text-xs text-gray-500 truncate">{view.description}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{view.usageCount}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Other Views */}
              {otherViews.length > 0 && (
                <div className="p-2">
                  {pinnedViews.length > 0 && (
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-2 border-t border-gray-700 pt-2">Other Views</div>
                  )}
                  {otherViews.map(view => (
                    <button
                      key={view.id}
                      onClick={() => handleViewSelect(view)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activeView?.id === view.id
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colorOptions.find(c => c.id === view.color)?.color || '#a855f7' }}
                      />
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{view.name}</span>
                          {view.isDefault && <Star className="w-3 h-3 text-yellow-400" />}
                        </div>
                        {view.description && (
                          <p className="text-xs text-gray-500 truncate">{view.description}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{view.usageCount}</div>
                    </button>
                  ))}
                </div>
              )}

              {filteredViews.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No views found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create View Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Create Custom View</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    View Name *
                  </label>
                  <input
                    type="text"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    placeholder="Enter view name..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newViewDescription}
                    onChange={(e) => setNewViewDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {colorOptions.slice(0, 8).map(color => (
                      <button
                        key={color.id}
                        onClick={() => setNewViewColor(color.id)}
                        className={`w-8 h-8 rounded-full border-2 transition-colors ${
                          newViewColor === color.id 
                            ? 'border-white scale-110' 
                            : 'border-transparent hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="pin-view"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="pin-view" className="text-sm text-gray-300 flex items-center space-x-1">
                    <Pin className="w-4 h-4" />
                    <span>Pin to top</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500">
                  This will save your current filters, sorting, and layout
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateView}
                    disabled={!newViewName.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Create View
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions (when a view is selected) */}
      {activeView && (
        <div className="absolute -right-2 top-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleDuplicateView(activeView)}
            className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded transition-colors"
            title="Duplicate view"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleTogglePin(activeView)}
            className="p-1 text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/20 rounded transition-colors"
            title={activeView.isPinned ? 'Unpin view' : 'Pin view'}
          >
            {activeView.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomViewsSelector;