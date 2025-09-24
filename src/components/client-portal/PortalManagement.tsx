// Portal Management - Main interface for agencies to manage client portals

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  Globe,
  Calendar,
  TrendingUp,
  ExternalLink,
  Settings,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react';
import { useClientPortalStore } from '../../stores/clientPortalStore';
import { useAgencyStore } from '../../stores/agencyStore';
import { ClientPortal } from '../../types/clientPortal';
import { format } from 'date-fns';
import PortalCreationWizard from './PortalCreationWizard';
import PortalSettingsModal from './PortalSettingsModal';

const PortalManagement: React.FC = () => {
  const {
    portals,
    isLoading,
    error,
    currentPage,
    hasMore,
    loadPortals,
    deletePortal,
    clearError
  } = useClientPortalStore();

  const { clients } = useAgencyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<ClientPortal | null>(null);
  const [actionMenuPortalId, setActionMenuPortalId] = useState<string | null>(null);

  useEffect(() => {
    loadPortals();
  }, []);

  const filteredPortals = portals.filter(portal => {
    const matchesSearch = portal.branding.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         portal.subdomain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clients.find(c => c.id === portal.client_id)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && portal.is_active) ||
                         (statusFilter === 'inactive' && !portal.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleDeletePortal = async (portal: ClientPortal) => {
    if (window.confirm(`Are you sure you want to delete the portal for ${portal.branding.company_name}?`)) {
      await deletePortal(portal.id);
    }
  };

  const handleCopyPortalUrl = (portal: ClientPortal) => {
    const url = portal.custom_domain 
      ? `https://${portal.custom_domain}`
      : `https://${portal.subdomain}.youragency.com`;
    
    navigator.clipboard.writeText(url);
    // Show toast notification
    alert('Portal URL copied to clipboard!');
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getPortalUrl = (portal: ClientPortal) => {
    return portal.custom_domain 
      ? `https://${portal.custom_domain}`
      : `https://${portal.subdomain}.youragency.com`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Client Portals</h1>
          <p className="text-gray-400 mt-1">
            Manage white-label client dashboards and access
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              // Open client portal demo in new tab
              const demoUrl = `${window.location.origin}?demo=portal`;
              window.open(demoUrl, '_blank');
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5" />
            <span>Demo Portal</span>
          </button>
          
          <button
            onClick={() => setShowCreateWizard(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Portal</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Portals</p>
              <p className="text-3xl font-bold text-white">{portals.length}</p>
            </div>
            <Globe className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Active Portals</p>
              <p className="text-3xl font-bold text-white">
                {portals.filter(p => p.is_active).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-white">
                {portals.reduce((acc, p) => acc + (p.dashboard_config.max_users_per_portal || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">This Month</p>
              <p className="text-3xl font-bold text-white">
                {portals.filter(p => {
                  const created = new Date(p.created_at);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search portals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => loadPortals()}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-effect rounded-xl p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-900/200 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">!</span>
              </div>
              <span className="text-red-400">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Portals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading && portals.length === 0 ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-effect rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : filteredPortals.length > 0 ? (
          filteredPortals.map((portal, index) => (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect rounded-xl p-6 hover:bg-gray-800/50 transition-all cursor-pointer group"
            >
              {/* Portal Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {portal.branding.logo_url ? (
                    <img
                      src={portal.branding.logo_url}
                      alt={portal.branding.company_name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white">
                      {portal.branding.company_name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {getClientName(portal.client_id)}
                    </p>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => setActionMenuPortalId(actionMenuPortalId === portal.id ? null : portal.id)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {actionMenuPortalId === portal.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10"
                      >
                        <div className="py-2">
                          <button
                            onClick={() => window.open(getPortalUrl(portal), '_blank')}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Portal</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedPortal(portal);
                              setShowSettingsModal(true);
                              setActionMenuPortalId(null);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit Settings</span>
                          </button>

                          <button
                            onClick={() => {
                              handleCopyPortalUrl(portal);
                              setActionMenuPortalId(null);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy URL</span>
                          </button>

                          <div className="border-t border-gray-700 my-1"></div>

                          <button
                            onClick={() => {
                              handleDeletePortal(portal);
                              setActionMenuPortalId(null);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Portal</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Portal Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    portal.is_active 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {portal.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">URL</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white truncate max-w-32">
                      {portal.subdomain || 'Not set'}
                    </span>
                    <button
                      onClick={() => handleCopyPortalUrl(portal)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Widgets</span>
                  <span className="text-sm text-white">
                    {portal.dashboard_config.enabled_widgets.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Created</span>
                  <span className="text-sm text-white">
                    {format(new Date(portal.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(getPortalUrl(portal), '_blank')}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Portal</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedPortal(portal);
                      setShowSettingsModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          // Empty state
          <div className="col-span-full">
            <div className="glass-effect rounded-xl p-12 text-center">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No portals found' : 'No client portals yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first client portal to get started'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <button
                  onClick={() => setShowCreateWizard(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Portal</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && filteredPortals.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => loadPortals(currentPage + 1)}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Modals */}
      <PortalCreationWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
      />

      <PortalSettingsModal
        isOpen={showSettingsModal}
        portal={selectedPortal}
        onClose={() => {
          setShowSettingsModal(false);
          setSelectedPortal(null);
        }}
      />
    </div>
  );
};

export default PortalManagement;