import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../Icon';

interface WidgetProps {
  id: string;
  title: string;
  type: string;
  content: React.ReactNode;
  size: 'standard' | 'expanded';
  onResize: (id: string, size: 'standard' | 'expanded') => void;
  onRemove: (id: string) => void;
}

const Widget: React.FC<WidgetProps> = ({
  id,
  title,
  type,
  content,
  size,
  onResize,
  onRemove
}) => {
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const isExpanded = size === 'expanded';

  const handleSizeChange = (newSize: 'standard' | 'expanded') => {
    onResize(id, newSize);
    setShowSizeMenu(false);
  };

  const containerClasses = isExpanded
    ? "w-full min-h-[calc(100vh-120px)] glass-effect premium-shadow rounded-2xl overflow-hidden"
    : "w-full h-full glass-effect premium-shadow rounded-2xl overflow-hidden hover:shadow-lg hover:border-purple-400/30 transition-all duration-200";

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1
      }}
      transition={{ 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      whileHover={!isExpanded ? { 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : undefined}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/30 bg-gray-900/30 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <Icon name="BarChart3" className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{title}</h3>
            <p className="text-gray-400 text-xs capitalize">{type} Widget</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Size Selector Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSizeMenu(!showSizeMenu)}
              className="p-2 hover:bg-gray-700 text-gray-400 hover:text-purple-400 rounded-lg transition-all duration-200 flex items-center space-x-1"
              title="Change widget size"
            >
              {isExpanded ? (
                <Icon name="Minimize2" className="w-4 h-4" />
              ) : (
                <Icon name="Maximize2" className="w-4 h-4" />
              )}
              <Icon name="ChevronDown" className="w-3 h-3" />
            </motion.button>

            {/* Size Menu Dropdown */}
            {showSizeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-1 size-dropdown rounded-lg z-50 min-w-[160px]"
              >
                <button
                  onClick={() => handleSizeChange('standard')}
                  className={`size-dropdown-item w-full px-4 py-3 text-left flex items-center space-x-3 ${
                    size === 'standard' ? 'text-purple-400 bg-purple-600/10' : 'text-gray-300'
                  }`}
                >
                  <Icon name="Grid3X3" className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Standard</div>
                    <div className="text-xs text-gray-500">Grid layout</div>
                  </div>
                  {size === 'standard' && <Icon name="Check" className="w-4 h-4 ml-auto" />}
                </button>
                <button
                  onClick={() => handleSizeChange('expanded')}
                  className={`size-dropdown-item w-full px-4 py-3 text-left flex items-center space-x-3 ${
                    size === 'expanded' ? 'text-purple-400 bg-purple-600/10' : 'text-gray-300'
                  }`}
                >
                  <Icon name="Maximize" className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Expanded</div>
                    <div className="text-xs text-gray-500">Full screen</div>
                  </div>
                  {size === 'expanded' && <Icon name="Check" className="w-4 h-4 ml-auto" />}
                </button>
              </motion.div>
            )}
          </div>

          {/* Remove Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(id)}
            className="p-2 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-lg transition-all duration-200"
            title="Remove widget"
          >
            <Icon name="X" className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Widget Content */}
      <div className={`p-4 overflow-auto custom-scrollbar ${
        isExpanded ? 'h-[calc(100%-80px)]' : 'h-[calc(100%-72px)]'
      }`}>
        {content}
      </div>

      {/* Click outside handler for dropdown */}
      {showSizeMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSizeMenu(false)}
        />
      )}
    </motion.div>
  );
};

export default Widget;