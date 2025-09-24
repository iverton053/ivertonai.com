import React, { useState } from 'react';
import { motion } from 'framer-motion';
import HorizontalWidgetNavigator from '../widgets/HorizontalWidgetNavigator';
import Icon from '../Icon';

const HorizontalNavigatorDemo: React.FC = () => {
  const [addedWidgets, setAddedWidgets] = useState<string[]>([]);
  const [showNavigator, setShowNavigator] = useState(true);

  const handleAddWidget = (widgetType: string) => {
    setAddedWidgets(prev => [...prev, widgetType]);
  };

  const handleAddAllWidgets = (widgetTypes: string[]) => {
    setAddedWidgets(prev => [...prev, ...widgetTypes]);

    // Show a toast-like notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-[100] bg-green-600/90 backdrop-blur-md text-white px-6 py-3 rounded-xl border border-green-500/30 shadow-2xl';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-medium">Widget Added!</span>
      </div>
      <div class="text-sm text-green-200 mt-1">${widgetTypes.length} widgets have been added to your dashboard</div>
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds with fade animation
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s ease-out';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const clearWidgets = () => {
    setAddedWidgets([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Demo Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Horizontal Widget Navigator
            <span className="text-purple-400"> Demo</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Beautiful, categorized widget selection with hover dropdowns and smooth animations
          </p>

          <div className="flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNavigator(!showNavigator)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                showNavigator
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name={showNavigator ? 'EyeOff' : 'Eye'} className="w-5 h-5" />
                <span>{showNavigator ? 'Hide' : 'Show'} Navigator</span>
              </div>
            </motion.button>

            {addedWidgets.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearWidgets}
                className="px-6 py-3 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                <div className="flex items-center space-x-2">
                  <Icon name="Trash2" className="w-5 h-5" />
                  <span>Clear ({addedWidgets.length})</span>
                </div>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Navigator Demo */}
        {showNavigator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12"
          >
            <HorizontalWidgetNavigator
              onAddWidget={handleAddWidget}
              onAddAllWidgets={handleAddAllWidgets}
              onCloseAllWidgets={clearWidgets}
            />
          </motion.div>
        )}

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              icon: 'Grid3X3',
              title: 'All Widgets View',
              description: 'Browse all 15 available widgets in a comprehensive grid layout'
            },
            {
              icon: 'BarChart3',
              title: 'Smart Categories',
              description: 'Widgets organized into 4 logical categories: Business Intelligence, SEO & Content, Social & Marketing, System Operations'
            },
            {
              icon: 'MousePointer',
              title: 'Hover Interactions',
              description: 'Smooth hover animations reveal category-specific widgets with detailed information'
            },
            {
              icon: 'Zap',
              title: 'Quick Selection',
              description: 'One-click widget addition with immediate feedback and smooth transitions'
            },
            {
              icon: 'Palette',
              title: 'Beautiful Design',
              description: 'Glass morphism effects, gradient backgrounds, and professional styling'
            },
            {
              icon: 'Smartphone',
              title: 'Responsive Layout',
              description: 'Optimized for all screen sizes with adaptive grid layouts'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all"
            >
              <div className="p-3 bg-purple-600/20 rounded-xl inline-block mb-4">
                <Icon name={feature.icon} className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Added Widgets Display */}
        {addedWidgets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6"
          >
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
              <Icon name="CheckCircle" className="w-6 h-6 text-green-400" />
              <span>Added Widgets ({addedWidgets.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {addedWidgets.map((widget, index) => (
                <motion.div
                  key={`${widget}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-green-600/20 border border-green-500/30 rounded-xl p-4 text-center"
                >
                  <p className="text-green-300 font-medium">{widget}</p>
                  <p className="text-green-400/70 text-sm mt-1">Added successfully</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 text-gray-500"
        >
          <p>🚀 Horizontal Widget Navigator - Making widget management beautiful and intuitive</p>
        </motion.div>
      </div>
    </div>
  );
};

export default HorizontalNavigatorDemo;