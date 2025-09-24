import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../Icon';
import QuickStatsCard from '../widgets/QuickStatsCard';
import WidgetGrid from '../widgets/WidgetGrid';
import WidgetContent from '../widgets/WidgetContent';
import { useGridWidgetStore } from '../../stores/gridWidgetStore';

interface AIConsoleSectionProps {
  currentTime: Date;
  clientData: any;
  isLoading: boolean;
  error: string | null;
  analyticsLoading: boolean;
  automationsLoading: boolean;
  setActiveSection: (section: string) => void;
  setAddWidgetModalOpen: (open: boolean) => void;
}

const AIConsoleSection: React.FC<AIConsoleSectionProps> = ({
  currentTime,
  clientData,
  isLoading,
  error,
  analyticsLoading,
  automationsLoading,
  setActiveSection,
  setAddWidgetModalOpen
}) => {
  const {
    getVisibleWidgets,
    resizeWidget,
    removeWidget
  } = useGridWidgetStore();

  return (
    <>
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">AI Console</h1>
        <p className="text-gray-400">Monitor your AI automations and performance metrics</p>

        {/* Loading Indicator */}
        {(isLoading || analyticsLoading || automationsLoading) && (
          <div className="flex items-center space-x-2 mt-2">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-purple-300 text-sm">Loading data...</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-2 p-3 bg-red-600/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </motion.div>

      {/* Client Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8 glass-effect premium-shadow rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {clientData?.client_name?.[0] || clientData?.username?.[0] || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">
                Welcome, {clientData?.client_name || clientData?.username || 'User'}!
              </h2>
              <p className="text-gray-400">
                {clientData?.company ? `${clientData.company} - ` : ''}Your personalized AI automation dashboard
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <p className="text-white font-mono text-lg font-bold">
              {currentTime.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Available Categories */}
        {clientData?.available_categories && clientData.available_categories.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <Icon name="Activity" className="w-5 h-5 text-purple-400" />
              <span>Available Automations</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {clientData.available_categories.map((category: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-medium hover:bg-purple-600/30 transition-colors"
                >
                  {category}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Available Widgets */}
        {clientData?.widgets && clientData.widgets.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <Icon name="BarChart3" className="w-5 h-5 text-purple-400" />
              <span>Available Widgets</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {clientData.widgets.map((widget: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-300 text-sm font-medium hover:bg-indigo-600/30 transition-colors"
                >
                  {widget}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
      >
        <QuickStatsCard
          title="Active Automations"
          value={clientData?.metrics?.active_automations?.toString() || "0"}
          change={18.3}
          icon="Zap"
          color="purple"
        />
        <QuickStatsCard
          title="Success Rate"
          value={`${clientData?.metrics?.success_rate || 0}%`}
          change={2.1}
          icon="TrendingUp"
          color="blue"
        />
        <QuickStatsCard
          title="Completed Today"
          value={clientData?.metrics?.completed_today?.toString() || "0"}
          change={-5.4}
          icon="Clock"
          color="green"
        />
        <QuickStatsCard
          title="Time Saved"
          value={`${clientData?.metrics?.time_saved || 0}h`}
          change={32.7}
          icon="Activity"
          color="orange"
        />
      </motion.div>

      {/* Category Tabs & Widget Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <WidgetGrid
          widgets={getVisibleWidgets().map(widget => ({
            ...widget,
            content: <WidgetContent type={widget.type} content={widget.content} onNavigateToAutomations={() => setActiveSection('automations')} />
          }))}
          onWidgetResize={resizeWidget}
          onWidgetRemove={removeWidget}
          showCategoryTabs={true}
        />
      </motion.div>
    </>
  );
};

export default AIConsoleSection;