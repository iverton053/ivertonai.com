import React from 'react';
import { motion } from 'framer-motion';
import Widget from './Widget';
import Icon from '../Icon';
import WidgetErrorBoundary from '../common/WidgetErrorBoundary';

interface WidgetData {
  id: string;
  type: string;
  title: string;
  content: React.ReactNode;
  size: 'standard' | 'expanded';
}

interface WidgetGridProps {
  widgets: WidgetData[];
  onWidgetResize: (id: string, size: 'standard' | 'expanded') => void;
  onWidgetRemove: (id: string) => void;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgets,
  onWidgetResize,
  onWidgetRemove
}) => {
  // Check if any widget is expanded (fullscreen)
  const hasExpandedWidget = widgets.some(widget => widget.size === 'expanded');
  const expandedWidget = widgets.find(widget => widget.size === 'expanded');

  return (
    <div className="w-full">

      {/* Header with company branding - always visible */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
            <Icon name="Zap" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Iverton AI</h1>
            <p className="text-gray-400 text-sm">Premium Dashboard</p>
          </div>
        </div>

      </div>

      {/* Widget Container */}
      {hasExpandedWidget && expandedWidget ? (
        // Expanded/Fullscreen mode - single widget takes full space
        <div className="w-full">
          <WidgetErrorBoundary
            widgetType={expandedWidget.type}
            widgetId={expandedWidget.id}
            onRemove={() => onWidgetRemove(expandedWidget.id)}
          >
            <Widget
              {...expandedWidget}
              onResize={onWidgetResize}
              onRemove={onWidgetRemove}
            />
          </WidgetErrorBoundary>
        </div>
      ) : (
        // Standard grid layout
        <div className="widget-grid">
          {widgets.length === 0 ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full min-h-[400px] bg-gray-800/20 border-2 border-dashed border-purple-500/30 rounded-2xl p-8 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="BarChart3" className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Widgets Yet</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Start building your dashboard by adding your first widget.
                </p>
                <p className="text-gray-500 text-sm">
                  Use the horizontal widget navigator above to add your first widget.
                </p>
              </div>
            </motion.div>
          ) : (
            // Grid of widgets
            widgets
              .filter(widget => widget.size === 'standard')
              .map((widget, index) => (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="widget-grid-item"
                >
                  <WidgetErrorBoundary
                    widgetType={widget.type}
                    widgetId={widget.id}
                    onRemove={() => onWidgetRemove(widget.id)}
                  >
                    <Widget
                      {...widget}
                      onResize={onWidgetResize}
                      onRemove={onWidgetRemove}
                    />
                  </WidgetErrorBoundary>
                </motion.div>
              ))
          )}
        </div>
      )}

    </div>
  );
};

export default WidgetGrid;