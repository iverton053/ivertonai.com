import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Icon';
import { widgetCategories, categorizedWidgets, type WidgetCategory, type CategorizedWidget } from '../../types/widgetCategories';

interface HorizontalWidgetNavigatorProps {
  onAddWidget: (widgetType: string) => void;
  onAddAllWidgets?: (widgetTypes: string[]) => void;
  onCloseAllWidgets?: () => void;
  className?: string;
}

const HorizontalWidgetNavigator: React.FC<HorizontalWidgetNavigatorProps> = ({
  onAddWidget,
  onAddAllWidgets,
  onCloseAllWidgets,
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAllWidgets, setShowAllWidgets] = useState(false);
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleCategoryHover = (categoryId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveCategory(categoryId);
    setShowAllWidgets(false);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
      setShowAllWidgets(false);
    }, 150);
  };

  const handleDropdownEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleAllWidgetsClick = () => {
    setShowAllWidgets(!showAllWidgets);
    setActiveCategory(null);
  };

  const handleWidgetSelect = (widgetType: string) => {
    onAddWidget(widgetType);
    setActiveCategory(null);
    setShowAllWidgets(false);
  };

  const handleAddAllWidgets = (categoryId: string) => {
    if (!onAddAllWidgets) return;

    const widgets = getWidgetsByCategory(categoryId);
    const widgetTypes = widgets.map(widget => widget.type);
    onAddAllWidgets(widgetTypes);
    setActiveCategory(null);
    setShowAllWidgets(false);
  };

  const getWidgetsByCategory = (categoryId: string): CategorizedWidget[] => {
    return categorizedWidgets.filter(widget => widget.category === categoryId);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-600/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-500/30';
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Horizontal Navigation Bar */}
      <div className="glass-effect premium-shadow premium-glow rounded-2xl p-2 border border-purple-500/20">
        <div className="flex items-center space-x-2">
          {/* All Widgets Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAllWidgetsClick}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
              showAllWidgets
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25'
                : 'text-gray-300 hover:text-white hover:bg-purple-600/10 border border-gray-700/50 hover:border-purple-500/30'
            }`}
          >
            <div className="flex items-center space-x-2 relative z-10">
              <Icon name="Grid3X3" className="w-4 h-4" />
              <span>All Widgets</span>
              <div className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                {categorizedWidgets.length}
              </div>
            </div>
            {showAllWidgets && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>

          {/* Elegant Separator */}
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />

          {/* Category Buttons */}
          {widgetCategories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02, y: -1 }}
              onMouseEnter={() => {
                handleCategoryHover(category.id);
                setHoveredCategory(category.id);
              }}
              onMouseLeave={() => {
                handleMouseLeave();
                setHoveredCategory(null);
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden border ${
                activeCategory === category.id
                  ? `bg-gradient-to-r ${category.color} to-${category.color.replace('bg-', 'bg-')}-700 text-white shadow-lg border-purple-500/30`
                  : 'text-gray-300 hover:text-white hover:bg-purple-600/10 border-gray-700/50 hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-center space-x-2 relative z-10">
                <div className={`p-1.5 rounded-lg ${hoveredCategory === category.id ? 'bg-white/20' : 'bg-transparent'} transition-all duration-300`}>
                  <Icon name={category.icon} className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline">{category.title}</span>
                <div className="text-xs bg-white/20 text-white px-2 py-1 rounded-full font-semibold">
                  {category.widgets.length}
                </div>
              </div>
              {activeCategory === category.id && (
                <motion.div
                  layoutId="activeCategoryTab"
                  className={`absolute inset-0 bg-gradient-to-r ${category.color} to-${category.color.replace('bg-', 'bg-')}-700 rounded-xl`}
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Close All Button */}
      {onCloseAllWidgets && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCloseAllWidgets}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700/40 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium rounded-lg transition-all duration-300 border border-gray-600/30 hover:border-gray-500/50 text-sm"
          >
            <Icon name="X" className="w-4 h-4" />
            <span>Close All</span>
          </motion.button>
        </motion.div>
      )}

      {/* Dropdown Content */}
      <AnimatePresence>
        {(activeCategory || showAllWidgets) && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute top-full left-0 right-0 mt-4 z-50"
          >
            <div className="glass-effect premium-shadow premium-glow rounded-2xl border border-purple-500/20 overflow-hidden backdrop-blur-xl">
              {showAllWidgets ? (
                /* All Widgets View */
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl">
                          <Icon name="Grid3X3" className="w-6 h-6 text-white" />
                        </div>
                        <span>All Available Widgets</span>
                      </h3>
                      <p className="text-gray-400">Choose from {categorizedWidgets.length} powerful automation widgets to enhance your dashboard</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowAllWidgets(false)}
                      className="p-3 text-gray-400 hover:text-white hover:bg-purple-600/20 rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50"
                    >
                      <Icon name="X" className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {categorizedWidgets.map((widget, index) => {
                      const category = widgetCategories.find(cat => cat.id === widget.category);
                      return (
                        <motion.div
                          key={widget.type}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onMouseEnter={() => setHoveredWidget(widget.type)}
                          onMouseLeave={() => setHoveredWidget(null)}
                          onClick={() => handleWidgetSelect(widget.type)}
                          className="glass-effect premium-shadow premium-glow rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 cursor-pointer transition-all duration-300 group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl border ${category?.color}/20 border-${category?.color.replace('bg-', '')}/30 flex-shrink-0 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-${category?.color.replace('bg-', '')}/25`}>
                              <Icon name={widget.icon} className={`w-6 h-6 ${category?.color.replace('bg-', 'text-')}`} />
                            </div>
                            {hoveredWidget === widget.type && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl"
                              >
                                <Icon name="Plus" className="w-5 h-5 text-white" />
                              </motion.div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-bold text-white text-lg mb-2 group-hover:text-purple-300 transition-colors">
                                {widget.title}
                              </h4>
                              <p className="text-gray-400 text-sm leading-relaxed">
                                {widget.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getComplexityColor(widget.complexity)}`}>
                                {widget.complexity}
                              </span>
                              <span className="text-xs text-gray-500 font-medium bg-gray-800/50 px-2 py-1 rounded-full">
                                ⏱ {widget.estimatedSetupTime}
                              </span>
                            </div>

                            {widget.requiredIntegrations && (
                              <div className="pt-2 border-t border-gray-700/50">
                                <div className="text-xs text-gray-500 mb-2">Required Integrations:</div>
                                <div className="flex flex-wrap gap-1">
                                  {widget.requiredIntegrations.slice(0, 2).map((integration) => (
                                    <span key={integration} className="text-xs bg-purple-600/10 text-purple-300 px-2 py-1 rounded-full border border-purple-500/20">
                                      {integration}
                                    </span>
                                  ))}
                                  {widget.requiredIntegrations.length > 2 && (
                                    <span className="text-xs text-purple-400 font-medium">
                                      +{widget.requiredIntegrations.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : activeCategory && (
                /* Category-specific View */
                (() => {
                  const category = widgetCategories.find(cat => cat.id === activeCategory);
                  const widgets = getWidgetsByCategory(activeCategory);

                  return (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2.5 rounded-lg border ${category?.color}/20 border-${category?.color.replace('bg-', '')}/30`}>
                            <Icon name={category?.icon || 'Grid3X3'} className={`w-5 h-5 ${category?.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{category?.title}</h3>
                            <span className="text-xs bg-purple-600/10 text-purple-300 px-2 py-1 rounded-full border border-purple-500/20">
                              {widgets.length} widgets
                            </span>
                          </div>
                        </div>
                        {onAddAllWidgets && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAddAllWidgets(activeCategory)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg transition-all duration-300 border border-purple-500/30 hover:border-purple-400/50 text-sm"
                          >
                            <Icon name="Plus" className="w-4 h-4" />
                            <span>Add All</span>
                          </motion.button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                        {widgets.map((widget, index) => (
                          <motion.div
                            key={widget.type}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleWidgetSelect(widget.type)}
                            className="glass-effect rounded-lg p-3 border border-purple-500/20 hover:border-purple-400/40 cursor-pointer transition-all duration-200 group"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <div className={`p-1.5 rounded border ${category?.color}/20 border-${category?.color.replace('bg-', '')}/30 flex-shrink-0`}>
                                <Icon name={widget.icon} className={`w-4 h-4 ${category?.color.replace('bg-', 'text-')}`} />
                              </div>
                              <h4 className="font-medium text-white text-sm leading-tight group-hover:text-purple-300 transition-colors">
                                {widget.title}
                              </h4>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getComplexityColor(widget.complexity)}`}>
                                {widget.complexity}
                              </span>
                              <span className="text-xs text-gray-500">
                                {widget.estimatedSetupTime}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 15, 35, 0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border-radius: 4px;
          border: 1px solid rgba(124, 58, 237, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #8b5cf6, #c084fc);
        }
      `}</style>
    </div>
  );
};

export default HorizontalWidgetNavigator;