// Client Portal Sidebar - Navigation sidebar for client portal

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Globe,
  Search,
  ExternalLink,
  Users,
  Activity,
  Target,
  Eye,
  Calendar,
  FileText,
  Settings,
  Download,
  MessageCircle,
  X
} from 'lucide-react';
import { ClientPortal, ClientPortalUser, PortalWidgetType } from '../../types/clientPortal';

interface ClientPortalSidebarProps {
  portal: ClientPortal;
  user: ClientPortalUser;
  isOpen: boolean;
  onClose: () => void;
}

const ClientPortalSidebar: React.FC<ClientPortalSidebarProps> = ({
  portal,
  user,
  isOpen,
  onClose
}) => {
  const getWidgetIcon = (widgetType: PortalWidgetType) => {
    switch (widgetType) {
      case 'overview_stats':
        return <BarChart3 className="w-5 h-5" />;
      case 'seo_rankings':
        return <TrendingUp className="w-5 h-5" />;
      case 'website_traffic':
        return <Globe className="w-5 h-5" />;
      case 'keyword_performance':
        return <Search className="w-5 h-5" />;
      case 'backlink_growth':
        return <ExternalLink className="w-5 h-5" />;
      case 'social_media_metrics':
        return <Users className="w-5 h-5" />;
      case 'content_performance':
        return <Activity className="w-5 h-5" />;
      case 'competitor_analysis':
        return <Target className="w-5 h-5" />;
      case 'goals_progress':
        return <Eye className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getWidgetLabel = (widgetType: PortalWidgetType) => {
    return widgetType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '#dashboard',
      active: true
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5" />,
      href: '#reports'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-5 h-5" />,
      href: '#calendar'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageCircle className="w-5 h-5" />,
      href: '#messages',
      badge: 3
    },
    {
      id: 'downloads',
      label: 'Downloads',
      icon: <Download className="w-5 h-5" />,
      href: '#downloads'
    }
  ];

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-64 z-50 lg:z-30"
            style={{
              backgroundColor: portal.theme.sidebar_style === 'dark' ? '#1f2937' : 
                               portal.theme.sidebar_style === 'colored' ? portal.theme.primary_color : '#ffffff'
            }}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-700 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {portal.branding.logo_url && (
                      <img
                        src={portal.branding.logo_url}
                        alt={portal.branding.company_name}
                        className="h-8 w-auto"
                      />
                    )}
                    <div>
                      <h2 className={`font-semibold ${
                        portal.theme.sidebar_style === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {portal.branding.company_name}
                      </h2>
                    </div>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-colors lg:hidden ${
                      portal.theme.sidebar_style === 'dark' 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-800/50'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        item.active
                          ? portal.theme.sidebar_style === 'dark'
                            ? 'bg-gray-700 text-white'
                            : 'bg-blue-900/20 text-blue-700'
                          : portal.theme.sidebar_style === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-300 hover:text-gray-900 hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-1 text-xs bg-red-900/200 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </div>

                {/* Widget Shortcuts */}
                <div className="mt-8">
                  <h3 className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                    portal.theme.sidebar_style === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`}>
                    Quick Access
                  </h3>
                  <div className="mt-2 space-y-1">
                    {portal.dashboard_config.enabled_widgets.slice(0, 6).map((widgetType) => (
                      <a
                        key={widgetType}
                        href={`#widget-${widgetType}`}
                        className={`group flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          portal.theme.sidebar_style === 'dark'
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                            : 'text-gray-400 hover:text-gray-900 hover:bg-gray-800/50'
                        }`}
                      >
                        {getWidgetIcon(widgetType)}
                        <span className="text-sm">{getWidgetLabel(widgetType)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Info & Support */}
              <div className="p-4 border-t border-gray-700 dark:border-gray-700">
                {/* User Info */}
                <div className={`p-3 rounded-lg mb-4 ${
                  portal.theme.sidebar_style === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-400">
                        {user.full_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        portal.theme.sidebar_style === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user.full_name}
                      </p>
                      <p className={`text-xs truncate ${
                        portal.theme.sidebar_style === 'dark' ? 'text-gray-400' : 'text-gray-400'
                      }`}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Support Links */}
                {portal.branding.support_email && (
                  <a
                    href={`mailto:${portal.branding.support_email}`}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      portal.theme.sidebar_style === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-800/50'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Contact Support</span>
                  </a>
                )}

                {portal.branding.website_url && (
                  <a
                    href={portal.branding.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      portal.theme.sidebar_style === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-800/50'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Visit Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 text-center">
                <p className={`text-xs ${
                  portal.theme.sidebar_style === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`}>
                  {portal.branding.copyright_text || `© ${new Date().getFullYear()} ${portal.branding.company_name}`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ClientPortalSidebar;