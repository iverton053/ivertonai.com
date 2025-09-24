import React, { useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Building, Globe, CheckCircle, Pause, AlertCircle, Users, X, Calendar, DollarSign, TrendingUp, Plus, MoreVertical, Edit, Archive, Trash2, Download, Upload, Search, Filter, Clock, Star } from 'lucide-react';
import { useAgencyStore } from '../stores/agencyStore';
import { useComprehensiveClientStore } from '../stores/comprehensiveClientStore';
import Icon from './Icon';

interface ClientSwitcherProps {
  isCollapsed?: boolean;
}

const ClientSwitcher: React.FC<ClientSwitcherProps> = ({ isCollapsed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'prospect' | 'onboarding'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    availableClients,
    selectedClientId,
    setSelectedClient,
    clients,
    loadClients,
    isLoading,
    user,
    hasPermission
  } = useAgencyStore();
  
  const {
    clients: comprehensiveClients,
    selectedClient: comprehensiveSelectedClient,
    switchToClient,
    setShowAddClientModal,
    startEditingClient,
    archiveClient,
    deleteClient,
    exportClientData,
    exportAllClients,
    importClientData,
    getRecentClients,
    getFilteredClients,
    setSearchQuery: setStoreSearchQuery,
    setStatusFilter: setStoreStatusFilter,
    isLoading: comprehensiveLoading,
    error: comprehensiveError,
    clearError
  } = useComprehensiveClientStore();

  // Load clients on component mount
  useEffect(() => {
    if (clients.length === 0) {
      loadClients();
    }
  }, [loadClients, clients.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const selectedClient = comprehensiveSelectedClient || clients.find(client => client.id === selectedClientId);
  
  // Apply search and filters
  const baseClients = comprehensiveClients.length > 0 ? comprehensiveClients : (availableClients.length > 0 ? availableClients : clients);
  const displayClients = baseClients.filter(client => {
    const matchesSearch = !searchQuery || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.website && client.website.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const recentClients = getRecentClients();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'paused':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'prospect':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  const handleContextMenu = (e: React.MouseEvent, clientId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(clientId);
  };

  const handleEditClient = (clientId: string) => {
    startEditingClient(clientId);
    setShowContextMenu(null);
    setShowModal(false);
  };

  const handleArchiveClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to archive this client?')) {
      try {
        const success = await archiveClient(clientId);
        if (success) {
          setShowContextMenu(null);
        }
      } catch (error) {
        console.error('Failed to archive client:', error);
      }
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this client? This action cannot be undone.')) {
      try {
        const success = await deleteClient(clientId);
        if (success) {
          setShowContextMenu(null);
        }
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  const handleExportClient = (clientId: string) => {
    const data = exportClientData(clientId);
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `client-${clientId}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setShowContextMenu(null);
  };

  const handleExportAllClients = () => {
    const data = exportAllClients();
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-clients-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportClients = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const success = await importClientData(text);
          if (success) {
            alert('Clients imported successfully!');
          }
        } catch (error) {
          console.error('Import error:', error);
          alert('Failed to import clients. Please check the file format.');
        }
      }
    };
    input.click();
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(null);
    };
    
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);

  if (isCollapsed) {
    return (
      <div className="p-4 border-b border-gray-700/50 relative" ref={dropdownRef}>
        <div className="relative">
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-base btn-secondary btn-md w-full relative"
            title={selectedClient ? selectedClient.name : 'Select Client'}
          >
            <Building className="w-5 h-5 text-purple-400" />
            {selectedClient && (
              <div className="absolute -top-1 -right-1">
                {getStatusIcon(selectedClient.status)}
              </div>
            )}
          </motion.button>

          {/* Modal is shared for both collapsed and expanded states */}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-700/50" ref={dropdownRef}>
      <div className="relative">
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="btn-base btn-secondary btn-lg w-full justify-between group"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative">
              <Building className="w-5 h-5 text-purple-400" />
              {selectedClient && (
                <div className="absolute -top-1 -right-1">
                  {getStatusIcon(selectedClient.status)}
                </div>
              )}
            </div>
            <div className="flex-1 text-left min-w-0 overflow-hidden">
              {selectedClient ? (
                <>
                  <p className="text-white font-medium text-sm truncate max-w-full">
                    {selectedClient.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-0.5 min-w-0 overflow-hidden">
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(selectedClient.status)}`}>
                      {selectedClient.status}
                    </span>
                    {selectedClient.website && (
                      <span className="text-gray-400 text-xs flex items-center min-w-0 overflow-hidden">
                        <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[8rem]">{selectedClient.website.replace(/^https?:\/\//, '')}</span>
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-gray-400 font-medium text-sm">Select Client</p>
                  <p className="text-purple-300 text-xs">Choose a client to analyze</p>
                </div>
              )}
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: showModal ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          </motion.div>
        </motion.button>

        {/* Portal for Client Selection Modal */}
        {showModal && createPortal(
          <AnimatePresence>
            <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-20">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowModal(false)}
              />
              
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative bg-gray-900/98 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg mx-4"
                style={{ 
                  marginLeft: isCollapsed ? 'calc(5rem + 1rem)' : 'calc(16rem + 1rem)'
                }}
              >
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Select Client</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleExportAllClients}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Export All Clients"
                      >
                        <Download className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                      <button
                        onClick={handleImportClients}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Import Clients"
                      >
                        <Upload className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                      <span className="text-gray-400 text-xs">
                        {displayClients.length} of {baseClients.length}
                      </span>
                      <button
                        onClick={() => setShowModal(false)}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search clients..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="onboarding">Onboarding</option>
                        <option value="paused">Paused</option>
                        <option value="prospect">Prospect</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto relative">
                  {/* Loading Overlay */}
                  {(isLoading || comprehensiveLoading) && (
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-white text-sm font-medium">
                          {isLoading ? 'Loading clients...' : 'Switching client...'}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">Please wait</p>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {comprehensiveError && (
                    <div className="p-4 mx-4 mt-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-red-300 text-sm font-medium">Error</p>
                          <p className="text-red-400 text-xs">{comprehensiveError}</p>
                        </div>
                        <button
                          onClick={() => clearError()}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {isLoading && !comprehensiveLoading ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-400 text-sm">Loading clients...</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {/* Recent Clients */}
                      {recentClients.length > 0 && searchQuery === '' && statusFilter === 'all' && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 px-2 py-1 mb-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400 text-sm font-medium">Recent</span>
                          </div>
                          <div className="space-y-1">
                            {recentClients.slice(0, 3).map((client) => (
                              <motion.button
                                key={`recent-${client.id}`}
                                onClick={async () => {
                                  if (comprehensiveClients.length > 0) {
                                    await switchToClient(client.id);
                                  } else {
                                    setSelectedClient(client.id);
                                  }
                                  setShowModal(false);
                                }}
                                onContextMenu={(e) => handleContextMenu(e, client.id)}
                                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                className={`w-full text-left p-3 rounded-lg transition-all mb-1 ${
                                  selectedClient?.id === client.id
                                    ? 'bg-purple-500/20 border border-purple-500/30'
                                    : 'hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <span className="text-white font-bold text-xs">{client.name.charAt(0)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <h4 className="text-white font-medium text-sm truncate">{client.name}</h4>
                                        <span className={`px-1.5 py-0.5 text-xs rounded-full border font-medium ${getStatusColor(client.status)}`}>
                                          {client.status}
                                        </span>
                                      </div>
                                      <p className="text-gray-400 text-xs truncate">{client.company}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Star className="w-3 h-3 text-yellow-400" />
                                    {selectedClient?.id === client.id && (
                                      <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                          <div className="border-t border-gray-700/50 my-3"></div>
                        </div>
                      )}

                      {/* All Clients */}
                      {displayClients.length === 0 ? (
                        <div className="text-center py-8 px-4">
                          <Building className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                          <p className="text-gray-400 text-sm">
                            {searchQuery || statusFilter !== 'all' ? 'No clients match your search' : 'No clients available'}
                          </p>
                        </div>
                      ) : (
                        <>
                          {(searchQuery !== '' || statusFilter !== 'all' || recentClients.length === 0) && (
                            <div className="flex items-center space-x-2 px-2 py-1 mb-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400 text-sm font-medium">
                                {searchQuery || statusFilter !== 'all' ? 'Search Results' : 'All Clients'}
                              </span>
                            </div>
                          )}
                          <div className="space-y-1">
                            {displayClients.map((client, index) => (
                              <motion.div
                                key={client.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative"
                              >
                                <motion.button
                                  onClick={async () => {
                                    if (comprehensiveClients.length > 0) {
                                      await switchToClient(client.id);
                                    } else {
                                      setSelectedClient(client.id);
                                    }
                                    setShowModal(false);
                                  }}
                                  onContextMenu={(e) => handleContextMenu(e, client.id)}
                                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                  whileTap={{ scale: 0.99 }}
                                  className={`w-full text-left p-4 rounded-xl transition-all mb-2 last:mb-0 relative group ${
                                    selectedClient?.id === client.id
                                      ? 'bg-purple-500/20 border border-purple-500/30'
                                      : 'hover:bg-white/5'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      {/* Client Avatar */}
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm">
                                          {client.name.charAt(0)}
                                        </span>
                                      </div>
                                      
                                      {/* Client Info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h3 className="text-white font-medium truncate">{client.name}</h3>
                                          <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${getStatusColor(client.status)}`}>
                                            {client.status}
                                          </span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                                          {client.website && (
                                            <div className="flex items-center space-x-1">
                                              <Globe className="w-3 h-3" />
                                              <span className="truncate">{client.website.replace(/^https?:\/\//, '')}</span>
                                            </div>
                                          )}
                                          {client.industry && (
                                            <span className="text-purple-300">{client.industry}</span>
                                          )}
                                        </div>
                                        
                                        {/* Quick Stats */}
                                        {(client.monthlyBudget || client.performanceScore) && (
                                          <div className="flex items-center space-x-3 mt-2 text-xs">
                                            {client.monthlyBudget && (
                                              <div className="flex items-center space-x-1 text-green-400">
                                                <DollarSign className="w-3 h-3" />
                                                <span>${client.monthlyBudget.toLocaleString()}/mo</span>
                                              </div>
                                            )}
                                            {client.performanceScore && (
                                              <div className="flex items-center space-x-1 text-blue-400">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>{client.performanceScore}% performance</span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* Services Preview */}
                                        {client.business?.services && client.business.services.length > 0 && (
                                          <div className="flex items-center space-x-1 mt-2">
                                            {client.business.services.slice(0, 2).map(service => (
                                              <span
                                                key={service}
                                                className="px-2 py-0.5 text-xs bg-gray-800/50 text-gray-300 rounded-md"
                                              >
                                                {service}
                                              </span>
                                            ))}
                                            {client.business.services.length > 2 && (
                                              <span className="text-gray-500 text-xs">
                                                +{client.business.services.length - 2} more
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      {/* Context Menu Button */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleContextMenu(e, client.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded"
                                      >
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                      </button>
                                      
                                      {/* Selection Indicator */}
                                      {selectedClient?.id === client.id && (
                                        <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                      )}
                                    </div>
                                  </div>
                                </motion.button>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )}
                      
                      {/* Add Client Button */}
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <motion.button
                          onClick={() => {
                            window.location.href = '/?page=add-client';
                            setShowModal(false);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center space-x-2 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="font-medium">Add New Client</span>
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Context Menu */}
              {showContextMenu && createPortal(
                <div
                  className="fixed z-[99999] bg-gray-800 border border-gray-600 rounded-lg shadow-2xl py-2 min-w-[200px]"
                  style={{
                    left: contextMenuPosition.x,
                    top: contextMenuPosition.y,
                  }}
                >
                  <button
                    onClick={() => handleEditClient(showContextMenu)}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Client</span>
                  </button>
                  <button
                    onClick={() => handleExportClient(showContextMenu)}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                  <div className="border-t border-gray-600 my-1"></div>
                  <button
                    onClick={() => handleArchiveClient(showContextMenu)}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-left text-yellow-300 hover:text-yellow-200 hover:bg-gray-700 transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Archive</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClient(showContextMenu)}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-left text-red-300 hover:text-red-200 hover:bg-gray-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>,
                document.body
              )}
            </div>
          </AnimatePresence>,
          document.body
        )}
      </div>
    </div>
  );
};

export default memo(ClientSwitcher);