import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../Sidebar';
import TopHeader from '../TopHeader';
import CommandPalette from '../modals/CommandPalette';
import AddWidgetModal from '../modals/AddWidgetModal';
import { useUserStore, useAppStore } from '../../stores';
import { useGridWidgetStore } from '../../stores/gridWidgetStore';
import { availableWidgetTypes } from '../../utils/constants';
import { getDefaultWidgetContent } from '../../utils/widgetDefaults';

interface DashboardLayoutProps {
  children: React.ReactNode;
  clientData?: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, clientData: propClientData }) => {
  const { user } = useUserStore();
  const {
    activeSection,
    commandPaletteOpen,
    setCommandPaletteOpen,
    addWidgetModalOpen,
    setAddWidgetModalOpen,
    getUnreadCount,
  } = useAppStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { addWidget, initializeDefaultWidgets } = useGridWidgetStore();

  // Initialize default widgets on first load
  useEffect(() => {
    initializeDefaultWidgets();
  }, [initializeDefaultWidgets]);

  // Optimized time update using requestAnimationFrame
  useEffect(() => {
    let animationId: number;
    let lastSecond = Math.floor(Date.now() / 1000);

    const updateTime = () => {
      const currentSecond = Math.floor(Date.now() / 1000);
      if (currentSecond !== lastSecond) {
        setCurrentTime(new Date());
        lastSecond = currentSecond;
      }
      animationId = requestAnimationFrame(updateTime);
    };

    animationId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationId);
  }, []);

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

  const handleAddWidget = useCallback((widgetType: string) => {
    const widgetTitles = {
      stats: 'Performance Stats',
      chart: 'Analytics Chart',
      automation: 'Automation Status',
      text: 'Text Widget',
      custom: 'Custom Widget'
    };

    addWidget({
      type: widgetType,
      title: widgetTitles[widgetType as keyof typeof widgetTitles] || widgetType,
      content: getDefaultWidgetContent(widgetType),
      size: 'standard',
      isVisible: true
    });
    setAddWidgetModalOpen(false);
  }, [addWidget, setAddWidgetModalOpen]);

  if (!user) {
    return null;
  }

  const clientData = useMemo(() => propClientData || user, [propClientData, user]);
  const unreadNotifications = useMemo(() => getUnreadCount(), [getUnreadCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/15 via-violet-600/10 to-fuchsia-600/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/10 via-indigo-600/15 to-purple-600/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-violet-600/8 to-purple-600/12 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Fixed Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 fixed top-0 left-0 h-screen z-40`}>
        <Sidebar
          activeSection={activeSection}
          setActiveSection={() => {}} // Will be handled by routing in future
          clientData={clientData}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />
      </div>

      {/* Main Content with Left Margin */}
      <div className={`${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300 min-h-screen flex flex-col relative z-10`}>
        <TopHeader
          activeSection={activeSection}
          currentTime={currentTime}
          setShowCommandPalette={setCommandPaletteOpen}
          setShowAddWidget={setAddWidgetModalOpen}
          notifications={unreadNotifications}
          clientData={clientData}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
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

export default DashboardLayout;