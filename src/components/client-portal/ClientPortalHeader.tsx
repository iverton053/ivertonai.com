// Client Portal Header - Top navigation for client portal

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  Download,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { ClientPortal, ClientPortalUser } from '../../types/clientPortal';

interface ClientPortalHeaderProps {
  portal: ClientPortal;
  user: ClientPortalUser;
  onSignOut: () => void;
  onToggleSidebar: () => void;
}

const ClientPortalHeader: React.FC<ClientPortalHeaderProps> = ({
  portal,
  user,
  onSignOut,
  onToggleSidebar
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: '1',
      title: 'New Report Available',
      message: 'Your monthly SEO report is ready for review',
      time: '2 hours ago',
      unread: true
    },
    {
      id: '2',
      title: 'Keyword Ranking Update',
      message: '5 keywords improved their positions this week',
      time: '1 day ago',
      unread: true
    },
    {
      id: '3',
      title: 'Campaign Performance',
      message: 'Your latest campaign exceeded target by 15%',
      time: '3 days ago',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header 
      className="sticky top-0 z-50 bg-white border-b border-gray-700 shadow-sm"
      style={{
        backgroundColor: portal.theme.sidebar_style === 'light' ? '#ffffff' : portal.theme.primary_color + '10'
      }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo & Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              {portal.branding.logo_url && (
                <img
                  src={portal.branding.logo_url}
                  alt={portal.branding.company_name}
                  className="h-8 w-auto"
                />
              )}
              <div>
                <h1 className="font-semibold text-gray-900">
                  {portal.branding.company_name}
                </h1>
                {portal.branding.company_tagline && (
                  <p className="text-xs text-gray-400">
                    {portal.branding.company_tagline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Actions & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <button
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-800/50 rounded-lg transition-colors"
              title="Download Report"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-800/50 rounded-lg transition-colors"
              title="Help & Support"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-800/50 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-900/200 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-gray-400"
                        >
                          ×
                        </button>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg transition-colors cursor-pointer ${
                                notification.unread 
                                  ? 'bg-blue-900/20 hover:bg-blue-100' 
                                  : 'bg-gray-50 hover:bg-gray-800/50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-blue-900/200 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">No notifications</p>
                          </div>
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="border-t pt-3 mt-4">
                          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-300 font-medium">
                            View All Notifications
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user.full_name}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-50"
                  >
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {user.role} • {user.title}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span>Profile Settings</span>
                      </button>

                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Preferences</span>
                      </button>

                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <HelpCircle className="w-5 h-5" />
                        <span>Help & Support</span>
                      </button>

                      <div className="border-t border-gray-700 my-2"></div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientPortalHeader;