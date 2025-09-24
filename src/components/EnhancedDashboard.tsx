import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import Icon from './Icon';
import QuickStatsCard from './widgets/QuickStatsCard';
import CommandPalette from './modals/CommandPalette';
import AddWidgetModal from './modals/AddWidgetModal';
import EnhancedHistory from './EnhancedHistory';
import Analytics from './Analytics';
import EnhancedReports from './EnhancedReports';
import Settings from './Settings';
import TeamManagement from './agency/TeamManagement';
import PortalManagement from './client-portal/PortalManagement';
import FinancialDashboard from './financial/FinancialDashboard';
import PredictiveAnalytics from './PredictiveAnalytics';
import AdCampaignManager from './AdCampaignManager';
import EnhancedCRMManager from './crm/EnhancedCRMManager';
import IntegrationsMarketplace from './integrations/IntegrationsMarketplace';
import WidgetGrid from './widgets/WidgetGrid';
import WidgetContent from './widgets/WidgetContent';
import ClientAwareWidget from './widgets/ClientAwareWidget';
import EmailMarketingDashboard from './email-marketing/EmailMarketingDashboard';
import SocialMediaDashboard from './social-media/SocialMediaDashboard';
import AutomationDashboard from './automation/AutomationDashboard';
import OverviewDashboard from './overview/OverviewDashboard';
import CommunicationHub from './communication/CommunicationHub';
import FileManager from './file-manager/FileManager';
import NotesBoard from './notes/NotesBoard';
import BrandAssetsPage from './brand-assets/BrandAssetsPage';
import ApprovalBoard from './content-approval/ApprovalBoard';
import AIConsoleSection from './dashboard/AIConsoleSection';
import HorizontalWidgetNavigator from './widgets/HorizontalWidgetNavigator';
import HorizontalNavigatorDemo from './demos/HorizontalNavigatorDemo';
import AIScriptGenerator from './content-generation/AIScriptGenerator';
import BlogPostGenerator from './content-generation/BlogPostGenerator';
import LandingPageCopyGenerator from './content-generation/LandingPageCopyGenerator';
import { useUserStore, useAppStore } from '../stores';
import { useContentApprovalStore } from '../stores/contentApprovalStore';
import { useGridWidgetStore } from '../stores/gridWidgetStore';
import { useAnalytics, useAutomations } from '../hooks/useApiData';
import { availableWidgetTypes } from '../utils/constants';

interface EnhancedDashboardProps {
  clientData?: any;
}

const EnhancedDashboard = ({ clientData: propClientData }: EnhancedDashboardProps) => {
  const { user, updateMetrics } = useUserStore();
  const {
    activeSection,
    setActiveSection,
    commandPaletteOpen,
    setCommandPaletteOpen,
    addWidgetModalOpen,
    setAddWidgetModalOpen,
    getUnreadCount,
    isLoading,
    error,
  } = useAppStore();
  
  const { contentItems, initializeSampleData } = useContentApprovalStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Widget store
  const {
    widgets,
    addWidget,
    addMultipleWidgets,
    removeWidget,
    resizeWidget,
    getVisibleWidgets,
    clearAllWidgets,
    initializeDefaultWidgets
  } = useGridWidgetStore();

  // Fetch data using hooks
  const { data: analytics, loading: analyticsLoading } = useAnalytics('24h');
  const { loading: automationsLoading } = useAutomations();

  // Initialize default widgets on first load
  useEffect(() => {
    initializeDefaultWidgets();
  }, [initializeDefaultWidgets]);

  // Update current time every second for real-time display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
    };
    
    // Update immediately
    updateTime();
    
    // Then update every second for real-time clock display
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setAddWidgetModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, setAddWidgetModalOpen]);

  // Update metrics when analytics data changes
  useEffect(() => {
    if (analytics?.summary) {
      updateMetrics({
        active_automations: analytics.summary.totalSessions || user?.metrics.active_automations || 0,
        // You can update other metrics based on analytics data
      });
    }
  }, [analytics, updateMetrics, user?.metrics.active_automations]);

  // Initialize content approval sample data when accessing for the first time
  useEffect(() => {
    if (activeSection === 'content-approval' && contentItems.length === 0) {
      initializeSampleData();
    }
  }, [activeSection, contentItems.length, initializeSampleData]);

  const handleAddWidget = useCallback((widgetType: string) => {
    const widgetTitles = {
      'AI Hub': 'AI Automation Hub',
      stats: 'Performance Stats',
      chart: 'Analytics Chart',
      automation: 'Automation Status',
      text: 'Text Widget',
      custom: 'Custom Widget'
    };

    addWidget({
      type: widgetType,
      title: widgetTitles[widgetType as keyof typeof widgetTitles] || widgetType,
      content: getDefaultContent(widgetType),
      size: 'standard',
      isVisible: true
    });
    setAddWidgetModalOpen(false);
  }, [addWidget, setAddWidgetModalOpen]);

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'AI Hub':
        return {};
      case 'stats':
        return {
          value: Math.floor(Math.random() * 1000),
          change: (Math.random() - 0.5) * 40,
          icon: 'TrendingUp',
          unit: ''
        };
      case 'chart':
        return {
          chartType: 'line',
          data: Array.from({ length: 7 }, (_, i) => ({
            name: `Day ${i + 1}`,
            value: Math.floor(Math.random() * 100)
          }))
        };
      case 'automation':
        return {
          status: 'running',
          progress: Math.floor(Math.random() * 100),
          lastRun: new Date().toLocaleString()
        };
      default:
        return {
          text: `This is a ${type} widget with sample content.`
        };
    }
  };


  if (!user) {
    return null; // This should be handled by App.tsx
  }

  const clientData = useMemo(() => propClientData || user, [propClientData, user]);
  const unreadNotifications = useMemo(() => getUnreadCount(), [getUnreadCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/15 via-violet-600/10 to-fuchsia-600/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/10 via-indigo-600/15 to-purple-600/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-violet-600/8 to-purple-600/12 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="fixed top-4 left-4 z-50 p-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-colors lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div className={`${
        isMobile 
          ? `fixed top-0 left-0 h-screen z-50 transform transition-transform duration-300 ${
              showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
            } w-64`
          : `${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 fixed top-0 left-0 h-screen z-40`
      }`}>
        <Sidebar 
          activeSection={activeSection}
          setActiveSection={(section) => {
            setActiveSection(section);
            if (isMobile) setShowMobileSidebar(false);
          }}
          clientData={clientData}
          isCollapsed={!isMobile && sidebarCollapsed}
          onToggleCollapse={isMobile ? undefined : setSidebarCollapsed}
          isMobile={isMobile}
        />
      </div>

      {/* Main Content with Left Margin */}
      <div className={`${
        isMobile 
          ? 'ml-0' 
          : sidebarCollapsed ? 'ml-20' : 'ml-64'
      } transition-all duration-300 min-h-screen flex flex-col relative z-10`}>
        <div className={`${isMobile ? 'mt-16' : ''}`}>
          <TopHeader
            activeSection={activeSection}
            currentTime={currentTime}
            setShowCommandPalette={setCommandPaletteOpen}
            setShowAddWidget={setAddWidgetModalOpen}
            setActiveSection={setActiveSection}
            notifications={unreadNotifications}
            clientData={clientData}
            isMobile={isMobile}
          />
        </div>

        <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Render different components based on active section */}
            {activeSection === 'overview' && (
              <OverviewDashboard />
            )}

            {/* AI Console Section (previous overview content) */}
            {activeSection === 'ai-console' && (
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


            {/* Horizontal Widget Navigator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-8"
            >
              <HorizontalWidgetNavigator
                onAddWidget={handleAddWidget}
                onAddAllWidgets={addMultipleWidgets}
                onCloseAllWidgets={clearAllWidgets}
              />
            </motion.div>

            {/* New Grid-Based Widget System */}
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
              />
              
            </motion.div>
              </>
            )}

            {/* History Section */}
            {activeSection === 'history' && (
              <EnhancedHistory />
            )}

            {/* Analytics Section */}
            {activeSection === 'analytics' && (
              <Analytics />
            )}

            {/* Reports Section */}
            {activeSection === 'reports' && (
              <EnhancedReports />
            )}

            {/* Team Management Section */}
            {activeSection === 'team' && (
              <TeamManagement />
            )}

            {/* Financial Management Section */}
            {activeSection === 'financial' && (
              <FinancialDashboard />
            )}

            {/* Client Portals Section */}
            {activeSection === 'portals' && (
              <PortalManagement />
            )}

            {/* Predictive Analytics Section */}
            {activeSection === 'predictive' && (
              <PredictiveAnalytics />
            )}

            {/* Ad Campaign Manager Section */}
            {activeSection === 'campaigns' && (
              <AdCampaignManager />
            )}

            {/* CRM Management Section */}
            {activeSection === 'crm' && (
              <EnhancedCRMManager />
            )}

            {/* Integrations Section */}
            {activeSection === 'integrations' && (
              <IntegrationsMarketplace />
            )}

            {/* Email Marketing Section */}
            {activeSection === 'email-marketing' && (
              <EmailMarketingDashboard />
            )}

            {/* Social Media Section */}
            {activeSection === 'social-media' && (
              <SocialMediaDashboard />
            )}

            {/* Communication Hub Section */}
            {activeSection === 'communication' && (
              <CommunicationHub />
            )}

            {/* File Manager Section */}
            {activeSection === 'file-manager' && (
              <FileManager />
            )}

            {/* Brand Assets Section */}
            {activeSection === 'brand-assets' && (
              <BrandAssetsPage />
            )}

            {/* Content Approval Section */}
            {activeSection === 'content-approval' && (
              <div className="p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <h1 className="text-3xl font-bold text-white mb-2">Content Approval Workflow</h1>
                  <p className="text-gray-400">Streamline your content approval process from creation to publication</p>
                </motion.div>
                <ApprovalBoard />
              </div>
            )}

            {/* Sticky Notes Section */}
            {activeSection === 'notes' && (
              <NotesBoard />
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <Settings />
            )}

            {/* Horizontal Navigator Demo Section */}
            {activeSection === 'widget-navigator-demo' && (
              <HorizontalNavigatorDemo />
            )}

            {/* Automations Section */}
            {activeSection === 'automations' && (
              <AutomationDashboard />
            )}

            {/* AI Script Generator */}
            {activeSection === 'ai-script-generator' && (
              <AIScriptGenerator />
            )}

            {/* Blog Post Generator */}
            {activeSection === 'blog-post-generator' && (
              <BlogPostGenerator />
            )}

            {/* Landing Page Copy Generator */}
            {activeSection === 'landing-page-copy-generator' && (
              <LandingPageCopyGenerator />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)}
        onAddWidget={() => setAddWidgetModalOpen(true)}
      />
      
      <AddWidgetModal
        isOpen={addWidgetModalOpen}
        onClose={() => setAddWidgetModalOpen(false)}
        onAddWidget={handleAddWidget}
        availableWidgets={availableWidgetTypes}
      />
    </div>
  );
};

export default EnhancedDashboard;