import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import { sidebarItems } from '../utils/constants';
import { useNotificationStore } from '../stores/notificationStore';
import { useAgencyStore } from '../stores/agencyStore';
import { useComprehensiveClientStore } from '../stores/comprehensiveClientStore';
import NotificationPanel from './notifications/NotificationPanel';
import { Globe, Building, CheckCircle, Pause, AlertCircle, Users, Loader2 } from 'lucide-react';

interface TopHeaderProps {
  activeSection?: string;
  currentTime?: Date;
  setShowCommandPalette?: (show: boolean) => void;
  setShowAddWidget?: (show: boolean) => void;
  setActiveSection?: (section: string) => void;
  notifications?: number;
  clientData?: any;
  isMobile?: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({
  activeSection,
  currentTime = new Date(),
  setShowCommandPalette,
  setShowAddWidget,
  setActiveSection,
  notifications,
  clientData,
  isMobile = false
}) => {
  const { unreadCount, isPanelOpen, togglePanel, closePanel } = useNotificationStore();
  const { selectedClientId, clients } = useAgencyStore();
  const { selectedClient: comprehensiveSelectedClient, isLoading: comprehensiveLoading } = useComprehensiveClientStore();
  
  const selectedClient = comprehensiveSelectedClient || clients.find(client => client.id === selectedClientId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'paused':
        return <Pause className="w-3 h-3 text-yellow-400" />;
      case 'prospect':
        return <Users className="w-3 h-3 text-blue-400" />;
      default:
        return <AlertCircle className="w-3 h-3 text-red-400" />;
    }
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`glass-effect border-b border-white/20 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'} premium-shadow sticky top-0 z-30`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
            <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white capitalize flex items-center space-x-2`}>
              <Icon name={sidebarItems.find(item => item.id === activeSection)?.icon || 'Home'} className="w-7 h-7 text-purple-400" />
              <span>{activeSection}</span>
            </h2>
            
            {/* Selected Client Indicator */}
            {selectedClient && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                {comprehensiveLoading ? (
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                ) : (
                  <Building className="w-4 h-4 text-purple-400" />
                )}
                <span className="text-purple-300 font-medium text-sm">
                  {comprehensiveLoading ? 'Switching...' : selectedClient.name}
                </span>
                {!comprehensiveLoading && getStatusIcon(selectedClient.status)}
                {!comprehensiveLoading && selectedClient.website && (
                  <>
                    <span className="text-purple-400/60">•</span>
                    <div className="flex items-center space-x-1">
                      <Globe className="w-3 h-3 text-purple-400/80" />
                      <span className="text-purple-300/80 text-xs">
                        {selectedClient.website.replace(/^https?:\/\//, '')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          <p className="text-gray-400 text-sm">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })} • {currentTime.toLocaleTimeString('en-US', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
            {clientData?.company && <span className="ml-2 text-purple-300">• {clientData.company}</span>}
            {selectedClient && <span className="ml-2 text-blue-300">• Analyzing: {selectedClient.name}</span>}
          </p>
        </div>

        <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection?.('notes')}
            className={`p-2 rounded-xl transition-colors ${
              activeSection === 'notes'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
            }`}
            title="Open Sticky Notes"
          >
            <Icon name="StickyNote" className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePanel}
            className={`p-2 rounded-xl transition-colors relative ${
              isPanelOpen
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <Icon name="Bell" className="w-5 h-5" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{Math.min(unreadCount, 99)}</span>
              </div>
            )}
          </motion.button>

          {/* Add Widget button - only show on AI Console */}
          {activeSection === 'ai-console' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddWidget(true)}
              className={`flex items-center space-x-2 ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors shadow-lg`}
            >
              <Icon name="Plus" className="w-4 h-4" />
              <span className="text-sm">Add Widget</span>
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Notification Panel */}
      <NotificationPanel isOpen={isPanelOpen} onClose={closePanel} />
    </motion.header>
  );
};

export default TopHeader;