import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Icon';

const CommandPalette = ({ isOpen, onClose, onAddWidget }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const commands = useMemo(() => [
    { name: 'Add Widget', action: 'add-widget', icon: 'Plus' },
    { name: 'Export Data', action: 'export', icon: 'BarChart3' },
    { name: 'View Analytics', action: 'analytics', icon: 'TrendingUp' },
    { name: 'Settings', action: 'settings', icon: 'Settings' },
    { name: 'Notifications', action: 'notifications', icon: 'Bell' },
    { name: 'Search Automations', action: 'search-automations', icon: 'Search' },
  ], []);

  const filteredCommands = useMemo(() => 
    commands.filter(cmd =>
      cmd.name.toLowerCase().includes(query.toLowerCase())
    ),
    [commands, query]
  );

  const handleCommandClick = useCallback((action) => {
    if (action === 'add-widget') {
      onAddWidget();
    }
    onClose();
  }, [onAddWidget, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="glass-effect premium-shadow rounded-2xl p-6 w-full max-w-lg mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Icon name="Command" className="w-5 h-5 text-purple-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-lg placeholder-gray-400 outline-none"
            />
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((command, index) => (
                <motion.div
                  key={command.action}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}
                  onClick={() => handleCommandClick(command.action)}
                  className="flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="p-2 bg-gray-700/50 group-hover:bg-purple-600/20 rounded-lg transition-colors">
                    <Icon name={command.icon} className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <span className="text-white font-medium">{command.name}</span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No commands found</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;