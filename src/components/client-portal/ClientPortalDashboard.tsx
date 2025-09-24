// Client Portal Dashboard - Main dashboard for client portal users

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Settings,
  Bell,
  User,
  LogOut,
  Eye,
  Shield,
  Clock
} from 'lucide-react';
import { ClientPortalUser, ClientPortal, PortalWidgetType, ClientPortalDashboardData } from '../../types/clientPortal';
import { clientPortalService } from '../../services/clientPortalService';
import ClientPortalWidget from './ClientPortalWidget';
import ClientPortalHeader from './ClientPortalHeader';
import ClientPortalSidebar from './ClientPortalSidebar';
import { format } from 'date-fns';

interface ClientPortalDashboardProps {
  user: ClientPortalUser;
  portal: ClientPortal;
  onLogout: () => void;
}

const ClientPortalDashboard: React.FC<ClientPortalDashboardProps> = ({ user, portal, onLogout }) => {
  const [dashboardData, setDashboardData] = useState<ClientPortalDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('30d');

  useEffect(() => {
    loadDashboardData();
  }, [portal.id]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await clientPortalService.getPortalDashboardData(portal.id);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    onLogout();
  };

  const handleDownloadReport = async (format: 'pdf' | 'csv' | 'excel') => {
    // Implementation would generate and download report
    console.log(`Downloading report in ${format} format`);
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { widgets, recent_activities, analytics_summary } = dashboardData;

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: portal.theme.background_type === 'solid' ? portal.theme.background_value : undefined,
        backgroundImage: portal.theme.background_type === 'gradient' ? portal.theme.background_value : 
                        portal.theme.background_type === 'image' ? `url(${portal.theme.background_value})` : undefined,
        fontFamily: portal.theme.font_family === 'custom' ? `url(${portal.theme.custom_font_url})` : portal.theme.font_family
      }}
    >
      {/* Header */}
      <ClientPortalHeader
        portal={portal}
        user={user}
        onSignOut={handleSignOut}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* Sidebar */}
        <ClientPortalSidebar
          portal={portal}
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className={`flex-1 p-6 ${sidebarOpen ? 'ml-64' : ''} transition-all duration-300`}>
          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-900/20 border border-red-200 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-300">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-300"
              >
                ×
              </button>
            </motion.div>
          )}

          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {portal.branding.logo_url && (
                    <img
                      src={portal.branding.logo_url}
                      alt={portal.branding.company_name}
                      className="h-12 w-auto"
                    />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Welcome back, {user.full_name}!
                    </h1>
                    <p className="text-gray-400">{portal.branding.company_tagline}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Date Range Selector */}
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>

                  {/* Download Report */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                    
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <div className="py-2">
                        <button
                          onClick={() => handleDownloadReport('pdf')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          Download PDF Report
                        </button>
                        <button
                          onClick={() => handleDownloadReport('csv')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          Export CSV Data
                        </button>
                        <button
                          onClick={() => handleDownloadReport('excel')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          Export Excel File
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Visits</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics_summary.total_visits.toLocaleString()}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Unique Visitors</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics_summary.unique_visitors.toLocaleString()}
                      </p>
                    </div>
                    <User className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Avg. Session</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.floor(analytics_summary.average_session_duration / 60)}m {analytics_summary.average_session_duration % 60}s
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Top Widget</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">
                        {analytics_summary.most_viewed_widget.replace('_', ' ')}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Widgets Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
          >
            {widgets.map((widget, index) => (
              <motion.div
                key={widget.widget_type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ClientPortalWidget
                  widget={widget}
                  portal={portal}
                  dateRange={selectedDateRange}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <button className="text-blue-600 hover:text-blue-300 text-sm font-medium">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recent_activities.length > 0 ? (
                recent_activities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        {activity.activity_description}
                      </p>
                      <p className="text-sm text-gray-400">
                        {format(new Date(activity.created_at), 'MMM dd, yyyy at h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No recent activity to show</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Footer */}
          <footer className="mt-12 py-8 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {portal.branding.support_email && (
                  <a
                    href={`mailto:${portal.branding.support_email}`}
                    className="text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    Support
                  </a>
                )}
                {portal.branding.website_url && (
                  <a
                    href={portal.branding.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    Visit Website
                  </a>
                )}
              </div>
              
              <div className="text-sm text-gray-400">
                {portal.branding.copyright_text || `© ${new Date().getFullYear()} ${portal.branding.company_name}`}
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ClientPortalDashboard;