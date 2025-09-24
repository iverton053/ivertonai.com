import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, X, MoreHorizontal, Pin, PinOff, History, Search } from 'lucide-react';
import Icon from '../Icon';
import { sidebarItems, ExpandedSidebarItem } from '../../utils/constants';

interface QuickAccessItem {
  id: string;
  label: string;
  icon: string;
  category?: string;
  lastUsed?: number;
  useCount?: number;
  isPinned?: boolean;
}

interface QuickAccessToolbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  className?: string;
  maxItems?: number;
  showHistory?: boolean;
}

const QuickAccessToolbar: React.FC<QuickAccessToolbarProps> = ({
  activeSection,
  onNavigate,
  className = '',
  maxItems = 8,
  showHistory = true
}) => {
  const [quickAccessItems, setQuickAccessItems] = useState<QuickAccessItem[]>([]);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentItems, setRecentItems] = useState<QuickAccessItem[]>([]);
  
  // Initialize quick access items from localStorage or defaults
  useEffect(() => {
    const saved = localStorage.getItem('quickAccessItems');
    if (saved) {
      setQuickAccessItems(JSON.parse(saved));
    } else {
      // Default quick access items
      const defaults: QuickAccessItem[] = [
        { id: 'overview', label: 'Overview', icon: 'TrendingUp', isPinned: true, useCount: 5 },
        { id: 'ai-console', label: 'AI Console', icon: 'LayoutDashboard', isPinned: true, useCount: 4 },
        { id: 'crm', label: 'CRM', icon: 'Users', isPinned: true, useCount: 3 },
        { id: 'automations', label: 'Automations', icon: 'Zap', isPinned: true, useCount: 2 }
      ];
      setQuickAccessItems(defaults);
    }
    
    const savedRecent = localStorage.getItem('recentItems');
    if (savedRecent) {
      setRecentItems(JSON.parse(savedRecent));
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    localStorage.setItem('quickAccessItems', JSON.stringify(quickAccessItems));
  }, [quickAccessItems]);

  useEffect(() => {
    localStorage.setItem('recentItems', JSON.stringify(recentItems));
  }, [recentItems]);

  // Track navigation for recent items
  useEffect(() => {
    const currentItem = findItemById(activeSection);
    if (currentItem && !quickAccessItems.find(item => item.id === activeSection)) {
      const now = Date.now();
      setRecentItems(prev => {
        const filtered = prev.filter(item => item.id !== activeSection);
        const newItem = { 
          ...currentItem, 
          lastUsed: now, 
          useCount: (prev.find(item => item.id === activeSection)?.useCount || 0) + 1 
        };
        return [newItem, ...filtered].slice(0, 10); // Keep last 10
      });
    }

    // Update use count for quick access items
    setQuickAccessItems(prev => prev.map(item => 
      item.id === activeSection 
        ? { ...item, lastUsed: Date.now(), useCount: (item.useCount || 0) + 1 }
        : item
    ));
  }, [activeSection]);

  const findItemById = (id: string): QuickAccessItem | null => {
    for (const item of sidebarItems) {
      if (item.id === id) {
        return {
          id: item.id,
          label: item.label,
          icon: item.icon,
          category: item.category
        };
      }
      
      if (item.subItems) {
        const subItem = item.subItems.find(sub => sub.id === id);
        if (subItem) {
          return {
            id: subItem.id,
            label: subItem.label,
            icon: subItem.icon,
            category: item.category
          };
        }
      }
    }
    return null;
  };

  const addToQuickAccess = (item: ExpandedSidebarItem | any) => {
    const newItem: QuickAccessItem = {
      id: item.id,
      label: item.label,
      icon: item.icon,
      category: item.category,
      isPinned: false,
      useCount: 0
    };

    setQuickAccessItems(prev => {
      const exists = prev.find(existing => existing.id === item.id);
      if (exists) return prev;
      
      if (prev.length >= maxItems) {
        // Replace least used unpinned item
        const unpinned = prev.filter(item => !item.isPinned);
        if (unpinned.length > 0) {
          const leastUsed = unpinned.reduce((min, current) => 
            (current.useCount || 0) < (min.useCount || 0) ? current : min
          );
          return [...prev.filter(existing => existing.id !== leastUsed.id), newItem];
        }
        return prev;
      }
      
      return [...prev, newItem];
    });
    setShowCustomizer(false);
  };

  const removeFromQuickAccess = (id: string) => {
    setQuickAccessItems(prev => prev.filter(item => item.id !== id));
  };

  const togglePin = (id: string) => {
    setQuickAccessItems(prev => prev.map(item => 
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    ));
  };

  const filteredSidebarItems = sidebarItems.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return item.label.toLowerCase().includes(searchLower) ||
           item.subItems?.some(sub => sub.label.toLowerCase().includes(searchLower));
  });

  const displayItems = quickAccessItems.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-effect border border-white/10 rounded-xl p-3 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-white">Quick Access</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {showHistory && recentItems.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {/* Show recent items popup */}}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
              title="Recent items"
            >
              <History className="w-4 h-4" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
            title="Customize quick access"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Quick Access Items */}
      <div className="flex items-center space-x-2 min-h-[2.5rem]">
        <AnimatePresence mode="popLayout">
          {displayItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(item.id)}
              className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeSection === item.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/30 border border-gray-600/30'
              }`}
              title={`${item.label}${item.isPinned ? ' (Pinned)' : ''}`}
            >
              <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
              
              {item.isPinned && (
                <Pin className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
              )}
              
              {/* Remove button - shown on hover */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromQuickAccess(item.id);
                }}
                title="Remove from quick access"
              >
                <X className="w-3 h-3" />
              </motion.button>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Customizer Modal */}
      <AnimatePresence>
        {showCustomizer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 shadow-2xl z-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Customize Quick Access</h3>
              <button
                onClick={() => setShowCustomizer(false)}
                className="p-1 text-gray-400 hover:text-white rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Current Quick Access Items */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Current Items</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {quickAccessItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name={item.icon} className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => togglePin(item.id)}
                        className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                        title={item.isPinned ? 'Unpin' : 'Pin'}
                      >
                        {item.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => removeFromQuickAccess(item.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Items */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Add Items</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredSidebarItems.map(item => {
                  const isAdded = quickAccessItems.some(qa => qa.id === item.id);
                  
                  return (
                    <div key={item.id}>
                      {/* Main item */}
                      <div className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                        isAdded ? 'bg-green-500/20 text-green-400' : 'hover:bg-gray-700/30'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <Icon name={item.icon} className="w-4 h-4" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        {!isAdded && (
                          <button
                            onClick={() => addToQuickAccess(item)}
                            className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                            title="Add to quick access"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      
                      {/* Sub items */}
                      {item.subItems?.map(subItem => {
                        const isSubAdded = quickAccessItems.some(qa => qa.id === subItem.id);
                        return (
                          <div key={subItem.id} className={`flex items-center justify-between p-2 pl-8 rounded-lg transition-colors ${
                            isSubAdded ? 'bg-green-500/20 text-green-400' : 'hover:bg-gray-700/30'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <Icon name={subItem.icon} className="w-3 h-3" />
                              <span className="text-xs">{subItem.label}</span>
                            </div>
                            {!isSubAdded && (
                              <button
                                onClick={() => addToQuickAccess(subItem)}
                                className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                title="Add to quick access"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuickAccessToolbar;