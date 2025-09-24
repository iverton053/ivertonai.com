import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import Icon from '../Icon';

const SettingsHistory: React.FC = () => {
  const { history, undoLastChange } = useSettingsStore();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter(entry => {
    const matchesSearch = searchQuery === '' || 
      entry.changes.some(change => 
        change.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        change.key.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesFilter = filter === 'all' || 
      entry.changes.some(change => change.section === filter);
    
    return matchesSearch && matchesFilter;
  });

  const getChangeIcon = (section: string) => {
    switch (section) {
      case 'profile': return 'User';
      case 'dashboard': return 'Layout';
      case 'notifications': return 'Bell';
      case 'privacy': return 'Shield';
      case 'application': return 'Settings';
      case 'system': return 'Server';
      default: return 'Edit';
    }
  };

  const formatValue = (value: any) => {
    if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...';
    return String(value);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search changes..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
        >
          <option value="all">All Changes</option>
          <option value="profile">Profile</option>
          <option value="dashboard">Dashboard</option>
          <option value="notifications">Notifications</option>
          <option value="privacy">Privacy</option>
          <option value="application">Application</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="glass-effect rounded-2xl p-8 border border-white/10 text-center">
            <Icon name="History" className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Changes Found</h3>
            <p className="text-gray-400">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Settings changes will appear here as you modify them'
              }
            </p>
          </div>
        ) : (
          filteredHistory.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-effect rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Icon name={getChangeIcon(entry.changes[0]?.section)} className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {entry.changes.length} change{entry.changes.length > 1 ? 's' : ''}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {new Date(entry.timestamp).toLocaleString()} • {entry.user}
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={undoLastChange}
                    className="px-3 py-1 bg-yellow-600/20 text-yellow-200 border border-yellow-600/30 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm"
                  >
                    Undo
                  </motion.button>
                )}
              </div>

              <div className="space-y-3">
                {entry.changes.map((change, changeIndex) => (
                  <div
                    key={changeIndex}
                    className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-200 text-xs rounded border border-purple-600/30 capitalize">
                        {change.section}
                      </span>
                      <span className="text-gray-400 text-sm">{change.key}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-red-300 font-medium mb-1">From:</div>
                        <div className="p-2 bg-red-900/20 border border-red-700/30 rounded text-red-200 font-mono text-xs break-all">
                          {formatValue(change.oldValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-green-300 font-medium mb-1">To:</div>
                        <div className="p-2 bg-green-900/20 border border-green-700/30 rounded text-green-200 font-mono text-xs break-all">
                          {formatValue(change.newValue)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {entry.reason && (
                <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Icon name="Info" className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-blue-200 font-medium text-sm mb-1">Reason:</div>
                      <div className="text-blue-300 text-sm">{entry.reason}</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Icon name="BarChart3" className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">History Statistics</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <div className="text-xl font-bold text-purple-400 mb-1">{history.length}</div>
              <div className="text-xs text-gray-400">Total Changes</div>
            </div>
            
            <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <div className="text-xl font-bold text-blue-400 mb-1">
                {new Set(history.map(h => h.changes.map(c => c.section)).flat()).size}
              </div>
              <div className="text-xs text-gray-400">Sections Modified</div>
            </div>
            
            <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <div className="text-xl font-bold text-green-400 mb-1">
                {history.filter(h => new Date(h.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-xs text-gray-400">Last 24h</div>
            </div>
            
            <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <div className="text-xl font-bold text-yellow-400 mb-1">
                {new Set(history.map(h => h.user)).size}
              </div>
              <div className="text-xs text-gray-400">Contributors</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsHistory;