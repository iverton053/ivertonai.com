import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  Search,
  X,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import keyboardShortcutsService, { KeyboardShortcut } from '../../services/keyboardShortcutsService';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editMode, setEditMode] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [newKeys, setNewKeys] = useState('');
  const [config, setConfig] = useState(keyboardShortcutsService.getConfig());

  useEffect(() => {
    setShortcuts(keyboardShortcutsService.getAllShortcuts());
    setConfig(keyboardShortcutsService.getConfig());
  }, [isOpen]);

  const categories = [
    { id: 'all', label: 'All Shortcuts', count: shortcuts.length },
    { id: 'navigation', label: 'Navigation', count: shortcuts.filter(s => s.category === 'navigation').length },
    { id: 'automation', label: 'Automation', count: shortcuts.filter(s => s.category === 'automation').length },
    { id: 'view', label: 'View', count: shortcuts.filter(s => s.category === 'view').length },
    { id: 'search', label: 'Search', count: shortcuts.filter(s => s.category === 'search').length },
    { id: 'bulk', label: 'Bulk Operations', count: shortcuts.filter(s => s.category === 'bulk').length },
    { id: 'export', label: 'Export', count: shortcuts.filter(s => s.category === 'export').length },
    { id: 'general', label: 'General', count: shortcuts.filter(s => s.category === 'general').length }
  ];

  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = searchTerm === '' || 
      shortcut.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.keys.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleEditShortcut = (shortcutId: string) => {
    const shortcut = shortcuts.find(s => s.id === shortcutId);
    if (shortcut) {
      setEditingShortcut(shortcutId);
      setNewKeys(keyboardShortcutsService.getShortcutKeys(shortcutId) || shortcut.keys);
    }
  };

  const handleSaveShortcut = () => {
    if (editingShortcut && newKeys) {
      try {
        keyboardShortcutsService.setShortcutKeys(editingShortcut, newKeys);
        setShortcuts(keyboardShortcutsService.getAllShortcuts());
        setEditingShortcut(null);
        setNewKeys('');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to update shortcut');
      }
    }
  };

  const handleResetShortcut = (shortcutId: string) => {
    keyboardShortcutsService.resetShortcutKeys(shortcutId);
    setShortcuts(keyboardShortcutsService.getAllShortcuts());
  };

  const handleToggleShortcut = (shortcutId: string) => {
    const shortcut = shortcuts.find(s => s.id === shortcutId);
    if (shortcut) {
      keyboardShortcutsService.enableShortcut(shortcutId, !shortcut.enabled);
      setShortcuts(keyboardShortcutsService.getAllShortcuts());
    }
  };

  const handleToggleGlobal = () => {
    const newEnabled = !config.enabled;
    keyboardShortcutsService.setEnabled(newEnabled);
    setConfig({ ...config, enabled: newEnabled });
  };

  const handleToggleHints = () => {
    const newShowHints = !config.showHints;
    keyboardShortcutsService.setShowHints(newShowHints);
    setConfig({ ...config, showHints: newShowHints });
  };

  const handleExport = () => {
    const data = keyboardShortcutsService.exportShortcuts();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-hub-shortcuts.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        if (keyboardShortcutsService.importShortcuts(data)) {
          setShortcuts(keyboardShortcutsService.getAllShortcuts());
          setConfig(keyboardShortcutsService.getConfig());
        } else {
          alert('Failed to import shortcuts. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all shortcuts to defaults?')) {
      keyboardShortcutsService.resetToDefaults();
      setShortcuts(keyboardShortcutsService.getAllShortcuts());
      setConfig(keyboardShortcutsService.getConfig());
    }
  };

  const renderShortcutKey = (keys: string) => {
    return keys.split('+').map((key, index, array) => (
      <React.Fragment key={index}>
        <kbd className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs font-mono text-gray-300">
          {key.trim()}
        </kbd>
        {index < array.length - 1 && <span className="mx-1 text-gray-500">+</span>}
      </React.Fragment>
    ));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <Keyboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                <p className="text-gray-400 text-sm">Boost your productivity with quick actions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`p-2 rounded-lg transition-colors ${
                  editMode 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={editMode ? 'Exit edit mode' : 'Edit shortcuts'}
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Export shortcuts"
              >
                <Download className="w-5 h-5" />
              </button>
              <label className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors cursor-pointer" title="Import shortcuts">
                <Upload className="w-5 h-5" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleReset}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Reset to defaults"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-800/50 border-b border-gray-700">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">Global Shortcuts:</span>
                <button
                  onClick={handleToggleGlobal}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    config.enabled ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                  title={config.enabled ? 'Disable all shortcuts' : 'Enable all shortcuts'}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      config.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">Show Hints:</span>
                <button
                  onClick={handleToggleHints}
                  className={`p-1 rounded transition-colors ${
                    config.showHints 
                      ? 'text-green-400 hover:text-green-300' 
                      : 'text-gray-500 hover:text-gray-400'
                  }`}
                  title={config.showHints ? 'Hide shortcut hints' : 'Show shortcut hints'}
                >
                  {config.showHints ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              {filteredShortcuts.length} of {shortcuts.length} shortcuts
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-700 bg-gray-800/30">
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search shortcuts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <span>{category.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        selectedCategory === category.id
                          ? 'bg-blue-700 text-blue-100'
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {filteredShortcuts.length === 0 ? (
                  <div className="text-center py-12">
                    <Keyboard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No shortcuts found</h3>
                    <p className="text-gray-500">Try adjusting your search or category filter.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredShortcuts.map((shortcut) => (
                      <motion.div
                        key={shortcut.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-gray-800/50 rounded-xl border transition-all ${
                          shortcut.enabled 
                            ? 'border-gray-700 hover:border-gray-600' 
                            : 'border-gray-800 opacity-60'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-white font-medium">{shortcut.name}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  shortcut.category === 'navigation' ? 'bg-blue-100 text-blue-800' :
                                  shortcut.category === 'automation' ? 'bg-green-100 text-green-800' :
                                  shortcut.category === 'view' ? 'bg-purple-100 text-purple-800' :
                                  shortcut.category === 'search' ? 'bg-yellow-100 text-yellow-800' :
                                  shortcut.category === 'bulk' ? 'bg-orange-100 text-orange-800' :
                                  shortcut.category === 'export' ? 'bg-cyan-100 text-cyan-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {shortcut.category}
                                </span>
                                {shortcut.global && (
                                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                    Global
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm mb-3">{shortcut.description}</p>
                              
                              <div className="flex items-center space-x-2">
                                {editingShortcut === shortcut.id ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={newKeys}
                                      onChange={(e) => setNewKeys(e.target.value)}
                                      placeholder="e.g., Ctrl+K"
                                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveShortcut();
                                        if (e.key === 'Escape') setEditingShortcut(null);
                                      }}
                                      autoFocus
                                    />
                                    <button
                                      onClick={handleSaveShortcut}
                                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingShortcut(null)}
                                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1">
                                    {renderShortcutKey(keyboardShortcutsService.getShortcutKeys(shortcut.id) || shortcut.keys)}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {editMode && (
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleToggleShortcut(shortcut.id)}
                                  className={`p-2 rounded transition-colors ${
                                    shortcut.enabled
                                      ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
                                      : 'text-gray-500 hover:text-gray-400 hover:bg-gray-800'
                                  }`}
                                  title={shortcut.enabled ? 'Disable shortcut' : 'Enable shortcut'}
                                >
                                  {shortcut.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleEditShortcut(shortcut.id)}
                                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                                  title="Edit shortcut keys"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleResetShortcut(shortcut.id)}
                                  className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 rounded transition-colors"
                                  title="Reset to default"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default KeyboardShortcutsHelp;