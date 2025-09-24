import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Icon';
import { widgetCategories, getWidgetsByCategory, type WidgetCategory, type CategorizedWidget } from '../../types/widgetCategories';

interface CategorizedWidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: string) => void;
}

const CategorizedWidgetSelector: React.FC<CategorizedWidgetSelectorProps> = ({
  isOpen,
  onClose,
  onAddWidget
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(widgetCategories[0]?.id || '');
  const [selectedWidget, setSelectedWidget] = useState<CategorizedWidget | null>(null);

  const handleWidgetSelect = (widget: CategorizedWidget) => {
    setSelectedWidget(widget);
  };

  const handleAddWidget = () => {
    if (selectedWidget) {
      onAddWidget(selectedWidget.type);
      setSelectedWidget(null);
      onClose();
    }
  };

  const activeWidgets = getWidgetsByCategory(activeCategory);
  const activeCategoryInfo = widgetCategories.find(cat => cat.id === activeCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Add Automation Widget</h2>
              <p className="text-gray-400 text-sm mt-1">Choose from categorized automation tools</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Category Sidebar */}
          <div className="w-80 border-r border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
              Categories
            </h3>
            <div className="space-y-2">
              {widgetCategories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSelectedWidget(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeCategory === category.id
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${category.color}/20 flex-shrink-0`}>
                      <Icon name={category.icon} className={`w-5 h-5 ${category.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium mb-1">{category.title}</div>
                      <div className="text-xs text-gray-400 leading-relaxed">
                        {category.description}
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {category.widgets.length} widget{category.widgets.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Widget Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeCategoryInfo && (
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${activeCategoryInfo.color}/20`}>
                    <Icon name={activeCategoryInfo.icon} className={`w-6 h-6 ${activeCategoryInfo.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{activeCategoryInfo.title}</h3>
                    <p className="text-gray-400 text-sm">{activeCategoryInfo.description}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeWidgets.map((widget) => (
                <motion.div
                  key={widget.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleWidgetSelect(widget)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedWidget?.type === widget.type
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-700 rounded-lg flex-shrink-0">
                      <Icon name={widget.icon} className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white mb-1">{widget.title}</h4>
                      <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                        {widget.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            widget.complexity === 'beginner' ? 'bg-green-600/20 text-green-400' :
                            widget.complexity === 'intermediate' ? 'bg-yellow-600/20 text-yellow-400' :
                            'bg-red-600/20 text-red-400'
                          }`}>
                            {widget.complexity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {widget.estimatedSetupTime}
                          </span>
                        </div>

                        {selectedWidget?.type === widget.type && (
                          <Icon name="Check" className="w-4 h-4 text-purple-400" />
                        )}
                      </div>

                      {widget.requiredIntegrations && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">Integrations:</div>
                          <div className="flex flex-wrap gap-1">
                            {widget.requiredIntegrations.slice(0, 2).map((integration) => (
                              <span key={integration} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                {integration}
                              </span>
                            ))}
                            {widget.requiredIntegrations.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{widget.requiredIntegrations.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {selectedWidget ? (
                <span>Selected: <strong className="text-white">{selectedWidget.title}</strong></span>
              ) : (
                'Select a widget to add to your AI Console'
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddWidget}
                disabled={!selectedWidget}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedWidget
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add Widget
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CategorizedWidgetSelector;