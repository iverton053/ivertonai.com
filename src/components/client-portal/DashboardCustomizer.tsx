import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Plus,
  Eye,
  EyeOff,
  Move,
  X,
  Grid,
  Layout,
  Palette,
  Save,
  RotateCcw,
  Maximize,
  Minimize
} from 'lucide-react';
import { ClientPortal, PortalWidgetType, PortalWidgetData } from '../../types/clientPortal';
import { clientPortalService } from '../../services/clientPortalService';

interface DashboardCustomizerProps {
  portal: ClientPortal;
  widgets: PortalWidgetData[];
  onSave: (updatedConfig: any) => void;
  onClose: () => void;
}

interface WidgetConfig {
  id: string;
  type: PortalWidgetType;
  title: string;
  isVisible: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  refreshRate: number;
  color?: string;
}

const AVAILABLE_WIDGETS: { [key in PortalWidgetType]: { title: string; description: string; defaultSize: { width: number; height: number } } } = {
  overview_stats: {
    title: 'Overview Statistics',
    description: 'Key metrics and performance indicators',
    defaultSize: { width: 12, height: 4 }
  },
  seo_rankings: {
    title: 'SEO Rankings',
    description: 'Search engine ranking positions',
    defaultSize: { width: 6, height: 6 }
  },
  website_traffic: {
    title: 'Website Traffic',
    description: 'Visitor analytics and trends',
    defaultSize: { width: 6, height: 6 }
  },
  keyword_tracking: {
    title: 'Keyword Performance',
    description: 'Keyword ranking changes and progress',
    defaultSize: { width: 8, height: 5 }
  },
  backlink_analysis: {
    title: 'Backlink Profile',
    description: 'Link building progress and quality',
    defaultSize: { width: 8, height: 5 }
  },
  social_media_metrics: {
    title: 'Social Media',
    description: 'Social platform performance',
    defaultSize: { width: 6, height: 4 }
  },
  conversion_tracking: {
    title: 'Conversions',
    description: 'Goal completions and conversion rates',
    defaultSize: { width: 6, height: 4 }
  },
  competitor_analysis: {
    title: 'Competitor Analysis',
    description: 'Competitive intelligence and benchmarks',
    defaultSize: { width: 12, height: 6 }
  },
  ppc_performance: {
    title: 'PPC Performance',
    description: 'Paid advertising metrics',
    defaultSize: { width: 8, height: 5 }
  },
  local_seo: {
    title: 'Local SEO',
    description: 'Local search visibility',
    defaultSize: { width: 6, height: 4 }
  }
};

const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  portal,
  widgets,
  onSave,
  onClose
}) => {
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize widget configs from portal configuration
    const configs: WidgetConfig[] = [];

    // Add existing widgets
    widgets.forEach((widget, index) => {
      configs.push({
        id: `widget-${index}`,
        type: widget.widget_type,
        title: widget.config.title,
        isVisible: widget.config.is_visible,
        position: widget.config.position,
        refreshRate: widget.config.refresh_rate,
        color: widget.config.color
      });
    });

    // Add available but not configured widgets
    Object.keys(AVAILABLE_WIDGETS).forEach(widgetType => {
      if (!widgets.find(w => w.widget_type === widgetType)) {
        const defaultWidget = AVAILABLE_WIDGETS[widgetType as PortalWidgetType];
        configs.push({
          id: `widget-${widgetType}`,
          type: widgetType as PortalWidgetType,
          title: defaultWidget.title,
          isVisible: false,
          position: {
            x: 0,
            y: Math.max(...configs.map(c => c.position.y + c.position.height), 0),
            width: defaultWidget.defaultSize.width,
            height: defaultWidget.defaultSize.height
          },
          refreshRate: 60
        });
      }
    });

    setWidgetConfigs(configs);
  }, [widgets]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgetConfigs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Recalculate positions
    let currentY = 0;
    const updatedItems = items.map((item, index) => {
      if (item.isVisible) {
        const updatedItem = {
          ...item,
          position: {
            ...item.position,
            y: currentY
          }
        };
        currentY += item.position.height;
        return updatedItem;
      }
      return item;
    });

    setWidgetConfigs(updatedItems);
    setHasChanges(true);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgetConfigs(configs =>
      configs.map(config =>
        config.id === widgetId
          ? { ...config, isVisible: !config.isVisible }
          : config
      )
    );
    setHasChanges(true);
  };

  const updateWidgetConfig = (widgetId: string, updates: Partial<WidgetConfig>) => {
    setWidgetConfigs(configs =>
      configs.map(config =>
        config.id === widgetId
          ? { ...config, ...updates }
          : config
      )
    );
    setHasChanges(true);
  };

  const resetToDefault = () => {
    // Reset to portal's original configuration
    const configs: WidgetConfig[] = [];
    portal.dashboard_config.enabled_widgets.forEach((widgetType, index) => {
      const settings = portal.dashboard_config.widget_settings[widgetType];
      if (settings) {
        configs.push({
          id: `widget-${index}`,
          type: widgetType,
          title: settings.title,
          isVisible: settings.is_visible,
          position: settings.position,
          refreshRate: settings.refresh_rate
        });
      }
    });
    setWidgetConfigs(configs);
    setHasChanges(true);
  };

  const saveConfiguration = async () => {
    try {
      // Convert widget configs to portal dashboard config format
      const enabledWidgets = widgetConfigs
        .filter(config => config.isVisible)
        .map(config => config.type);

      const widgetSettings: any = {};
      widgetConfigs.forEach(config => {
        widgetSettings[config.type] = {
          title: config.title,
          is_visible: config.isVisible,
          position: config.position,
          refresh_rate: config.refreshRate,
          color: config.color
        };
      });

      const updatedConfig = {
        ...portal.dashboard_config,
        enabled_widgets: enabledWidgets,
        widget_settings: widgetSettings
      };

      // Save to database via service
      await clientPortalService.updatePortalConfiguration(portal.id, {
        dashboard_config: updatedConfig
      });

      onSave(updatedConfig);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving dashboard configuration:', error);
    }
  };

  const visibleWidgets = widgetConfigs.filter(config => config.isVisible);
  const availableWidgets = widgetConfigs.filter(config => !config.isVisible);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden"
      >
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Grid className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Dashboard Builder</h2>
                  <p className="text-sm text-gray-500">Customize your layout</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isPreviewMode
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={resetToDefault}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Widget Library */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Active Widgets */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Layout className="w-4 h-4 mr-2" />
                  Active Widgets ({visibleWidgets.length})
                </h3>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="active-widgets">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {visibleWidgets.map((widget, index) => (
                          <Draggable key={widget.id} draggableId={widget.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-3 bg-white rounded-lg border-2 transition-all ${
                                  snapshot.isDragging
                                    ? 'border-blue-400 shadow-lg'
                                    : 'border-gray-200'
                                } ${
                                  selectedWidget === widget.id ? 'ring-2 ring-blue-500' : ''
                                }`}
                                onClick={() => setSelectedWidget(
                                  selectedWidget === widget.id ? null : widget.id
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab active:cursor-grabbing"
                                    >
                                      <Move className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {widget.title}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {AVAILABLE_WIDGETS[widget.type].description}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleWidgetVisibility(widget.id);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <EyeOff className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Widget Settings */}
                                <AnimatePresence>
                                  {selectedWidget === widget.id && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-3 pt-3 border-t border-gray-200 space-y-3"
                                    >
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Title
                                        </label>
                                        <input
                                          type="text"
                                          value={widget.title}
                                          onChange={(e) => updateWidgetConfig(widget.id, { title: e.target.value })}
                                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Width
                                          </label>
                                          <select
                                            value={widget.position.width}
                                            onChange={(e) => updateWidgetConfig(widget.id, {
                                              position: { ...widget.position, width: parseInt(e.target.value) }
                                            })}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                          >
                                            <option value={3}>3 cols</option>
                                            <option value={4}>4 cols</option>
                                            <option value={6}>6 cols</option>
                                            <option value={8}>8 cols</option>
                                            <option value={12}>12 cols</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Height
                                          </label>
                                          <select
                                            value={widget.position.height}
                                            onChange={(e) => updateWidgetConfig(widget.id, {
                                              position: { ...widget.position, height: parseInt(e.target.value) }
                                            })}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                          >
                                            <option value={3}>3 rows</option>
                                            <option value={4}>4 rows</option>
                                            <option value={5}>5 rows</option>
                                            <option value={6}>6 rows</option>
                                            <option value={8}>8 rows</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Refresh Rate (minutes)
                                        </label>
                                        <select
                                          value={widget.refreshRate}
                                          onChange={(e) => updateWidgetConfig(widget.id, { refreshRate: parseInt(e.target.value) })}
                                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        >
                                          <option value={15}>15 min</option>
                                          <option value={30}>30 min</option>
                                          <option value={60}>1 hour</option>
                                          <option value={120}>2 hours</option>
                                        </select>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* Available Widgets */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Available Widgets ({availableWidgets.length})
                </h3>

                <div className="space-y-2">
                  {availableWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {widget.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {AVAILABLE_WIDGETS[widget.type].description}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleWidgetVisibility(widget.id)}
                          className="ml-3 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveConfiguration}
                disabled={!hasChanges}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Layout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-100 overflow-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Layout className="w-5 h-5 mr-2" />
                Dashboard Preview
              </h3>

              {/* Grid Preview */}
              <div className="grid grid-cols-12 gap-4 auto-rows-[60px]">
                {visibleWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center transition-all hover:from-blue-100 hover:to-blue-200`}
                    style={{
                      gridColumn: `span ${widget.position.width}`,
                      gridRow: `span ${widget.position.height}`
                    }}
                  >
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-900">
                        {widget.title}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {widget.position.width} × {widget.position.height}
                      </p>
                    </div>
                  </div>
                ))}

                {visibleWidgets.length === 0 && (
                  <div className="col-span-12 row-span-6 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Grid className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No widgets active</p>
                      <p className="text-sm">Add widgets from the sidebar to build your dashboard</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardCustomizer;