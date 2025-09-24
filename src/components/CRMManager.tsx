import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCRMStore } from '../stores/crmStore';
import { Contact, Deal, Activity } from '../types/crm';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard, AdminGuard, SalesGuard, UnauthorizedAccess } from './permissions/PermissionGuard';
import { Plus, Download, Upload, Edit, Trash2, Shield } from 'lucide-react';
import Icon from './Icon';

interface CRMManagerProps {
  userId?: string;
}

const CRMManager: React.FC<CRMManagerProps> = ({ userId = 'demo-sales-rep' }) => {
  const { can, is, roles } = usePermissions(userId);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'deals' | 'activities' | 'insights'>('overview');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const {
    contacts,
    deals,
    activities,
    analytics,
    insights,
    stats,
    selectedContact,
    selectedDeal,
    isLoading,
    error,
    contactFilters,
    dealFilters,
    loadContacts,
    loadDeals,
    loadActivities,
    createContact,
    createDeal,
    createActivity,
    updateDealStage,
    setSelectedContact,
    setSelectedDeal,
    setContactFilters,
    setDealFilters,
    clearError
  } = useCRMStore();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleContactSubmit = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createContact(contactData);
      setShowContactModal(false);
    } catch (error) {
      console.error('Failed to create contact:', error);
    }
  };

  const handleDealSubmit = async (dealData: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createDeal(dealData);
      setShowDealModal(false);
    } catch (error) {
      console.error('Failed to create deal:', error);
    }
  };

  const handleActivitySubmit = async (activityData: Omit<Activity, 'id' | 'created_at'>) => {
    try {
      await createActivity(activityData);
      setShowActivityModal(false);
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStageColor = (stage: Deal['stage']) => {
    const colors = {
      prospecting: 'bg-blue-500/20 text-blue-400',
      qualification: 'bg-yellow-500/20 text-yellow-400',
      proposal: 'bg-purple-500/20 text-purple-400',
      negotiation: 'bg-orange-500/20 text-orange-400',
      closed_won: 'bg-green-500/20 text-green-400',
      closed_lost: 'bg-red-500/20 text-red-400'
    };
    return colors[stage] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusColor = (status: Contact['status']) => {
    const colors = {
      active: 'bg-green-500/20 text-green-400',
      inactive: 'bg-gray-500/20 text-gray-400',
      prospect: 'bg-blue-500/20 text-blue-400',
      customer: 'bg-purple-500/20 text-purple-400',
      churned: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">CRM Management</h1>
          <p className="text-gray-400">Manage contacts, deals, and customer relationships</p>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
            >
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Revenue This Month</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.revenue_this_month)}</p>
                </div>
                <Icon name="DollarSign" className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Deals Closed This Week</p>
                  <p className="text-2xl font-bold text-white">{stats.deals_closed_this_week}</p>
                </div>
                <Icon name="Target" className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">New Contacts Today</p>
                  <p className="text-2xl font-bold text-white">{stats.contacts_added_today}</p>
                </div>
                <Icon name="Users" className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Activities Completed</p>
                  <p className="text-2xl font-bold text-white">{stats.activities_completed_today}</p>
                </div>
                <Icon name="Activity" className="w-8 h-8 text-orange-400" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/5 backdrop-blur-xl rounded-xl p-2 border border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
            { id: 'contacts', label: 'Contacts', icon: 'Users' },
            { id: 'deals', label: 'Deals', icon: 'Target' },
            { id: 'activities', label: 'Activities', icon: 'Activity' },
            { id: 'insights', label: 'Insights', icon: 'Brain' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon name={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pipeline Overview */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Sales Pipeline</h3>
                    <Icon name="Target" className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {analytics?.pipeline_by_stage.map((stage, index) => (
                      <div key={stage.stage} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStageColor(stage.stage as Deal['stage']).split(' ')[0]}`} />
                          <span className="text-gray-300 capitalize">{stage.stage.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{formatCurrency(stage.value)}</p>
                          <p className="text-gray-400 text-sm">{stage.count} deals</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
                    <button
                      onClick={() => setShowActivityModal(true)}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded-lg text-sm transition-all duration-200"
                    >
                      Add Activity
                    </button>
                  </div>
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'call' ? 'bg-green-400' :
                          activity.type === 'email' ? 'bg-blue-400' :
                          activity.type === 'meeting' ? 'bg-purple-400' :
                          'bg-gray-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.title}</p>
                          <p className="text-gray-400 text-xs">{formatDate(activity.created_at)}</p>
                        </div>
                        {activity.completed && (
                          <Icon name="Check" className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hot Leads */}
                {insights?.hot_leads && insights.hot_leads.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Hot Leads</h3>
                      <Icon name="TrendingUp" className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="space-y-4">
                      {insights.hot_leads.slice(0, 5).map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{lead.name}</p>
                            <p className="text-gray-400 text-sm">{lead.company}</p>
                          </div>
                          <div className="text-right">
                            <div className={`px-2 py-1 rounded text-xs ${getStatusColor(lead.status)}`}>
                              Score: {lead.lead_score}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Actions */}
                {insights?.recommended_actions && insights.recommended_actions.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Recommended Actions</h3>
                      <Icon name="Brain" className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="space-y-4">
                      {insights.recommended_actions.map((action, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            action.priority === 'high' ? 'bg-red-400' :
                            action.priority === 'medium' ? 'bg-yellow-400' :
                            'bg-green-400'
                          }`} />
                          <div className="flex-1">
                            <p className="text-white text-sm">{action.description}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {action.priority} priority
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-6">
                {/* Contacts Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Search contacts..."
                        value={contactFilters.search || ''}
                        onChange={(e) => setContactFilters({ search: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                      />
                      <Icon name="Search" className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      value={contactFilters.status || ''}
                      onChange={(e) => setContactFilters({ status: e.target.value || undefined })}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="prospect">Prospect</option>
                      <option value="customer">Customer</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Icon name="Plus" className="w-4 h-4" />
                    <span>Add Contact</span>
                  </button>
                </div>

                {/* Contacts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      layout
                      className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{contact.name}</h3>
                            <p className="text-gray-400 text-sm">{contact.position}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-300 text-sm">{contact.company}</p>
                        <p className="text-gray-400 text-sm">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-gray-400 text-sm">{contact.phone}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-400">Lead Score: </span>
                          <span className={`font-medium ${
                            contact.lead_score > 80 ? 'text-green-400' :
                            contact.lead_score > 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {contact.lead_score}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {formatDate(contact.last_contact)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'deals' && (
              <div className="space-y-6">
                {/* Deals Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <select
                      value={dealFilters.stage || ''}
                      onChange={(e) => setDealFilters({ stage: e.target.value || undefined })}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="">All Stages</option>
                      <option value="prospecting">Prospecting</option>
                      <option value="qualification">Qualification</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed_won">Closed Won</option>
                      <option value="closed_lost">Closed Lost</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowDealModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Icon name="Plus" className="w-4 h-4" />
                    <span>Add Deal</span>
                  </button>
                </div>

                {/* Deals Pipeline Board */}
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'].map((stage) => (
                    <div key={stage} className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-medium capitalize">{stage.replace('_', ' ')}</h3>
                        <div className={`w-3 h-3 rounded-full ${getStageColor(stage as Deal['stage']).split(' ')[0]}`} />
                      </div>
                      
                      <div className="space-y-3">
                        {deals
                          .filter(deal => deal.stage === stage)
                          .map((deal) => (
                            <motion.div
                              key={deal.id}
                              layout
                              className="bg-white/10 rounded-lg p-3 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                              onClick={() => setSelectedDeal(deal)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-white text-sm font-medium">{deal.title}</h4>
                                <span className="text-green-400 text-xs font-bold">
                                  {formatCurrency(deal.value)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-xs">
                                  {deal.probability}% likely
                                </span>
                                <span className="text-gray-400 text-xs">
                                  {new Date(deal.expected_close_date).toLocaleDateString()}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Activities</h3>
                  <button
                    onClick={() => setShowActivityModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Icon name="Plus" className="w-4 h-4" />
                    <span>Add Activity</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            activity.type === 'call' ? 'bg-green-400' :
                            activity.type === 'email' ? 'bg-blue-400' :
                            activity.type === 'meeting' ? 'bg-purple-400' :
                            'bg-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-white font-medium">{activity.title}</h4>
                              <span className={`px-2 py-1 rounded text-xs capitalize ${
                                activity.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                activity.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {activity.priority}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{activity.description}</p>
                            <div className="flex items-center space-x-4 text-gray-400 text-xs">
                              <span>Type: {activity.type}</span>
                              <span>Created: {formatDate(activity.created_at)}</span>
                              {activity.due_date && (
                                <span>Due: {formatDate(activity.due_date)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {activity.completed ? (
                            <Icon name="Check" className="w-5 h-5 text-green-400" />
                          ) : (
                            <button className="text-gray-400 hover:text-green-400 transition-colors duration-200">
                              <Icon name="Check" className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Insights */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-2 mb-6">
                    <Icon name="Brain" className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                  </div>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {analytics?.conversion_rate.toFixed(1)}%
                      </p>
                      <p className="text-gray-400 text-sm">Conversion Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {formatCurrency(analytics?.average_deal_size || 0)}
                      </p>
                      <p className="text-gray-400 text-sm">Avg Deal Size</p>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Pipeline Health</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-green-400 text-sm">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Lead Quality</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                        <span className="text-blue-400 text-sm">72%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performing Sources */}
                {analytics?.top_performing_sources && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6">Top Performing Sources</h3>
                    <div className="space-y-4">
                      {analytics.top_performing_sources.map((source, index) => (
                        <div key={source.source} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-gold/20 text-gold' :
                              index === 1 ? 'bg-silver/20 text-silver' :
                              index === 2 ? 'bg-bronze/20 text-bronze' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              #{index + 1}
                            </div>
                            <span className="text-gray-300 capitalize">{source.source.replace('_', ' ')}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">{source.count} leads</p>
                            <p className="text-gray-400 text-sm">{formatCurrency(source.value)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Contact Modal */}
        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          onSubmit={handleContactSubmit}
        />

        {/* Deal Modal */}
        <DealModal
          isOpen={showDealModal}
          onClose={() => setShowDealModal(false)}
          onSubmit={handleDealSubmit}
          contacts={contacts}
        />

        {/* Activity Modal */}
        <ActivityModal
          isOpen={showActivityModal}
          onClose={() => setShowActivityModal(false)}
          onSubmit={handleActivitySubmit}
          contacts={contacts}
          deals={deals}
        />
      </div>
    </div>
  );
};

// Contact Modal Component
const ContactModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: 'website' as Contact['source'],
    status: 'prospect' as Contact['status'],
    notes: '',
    tags: [] as string[],
    lifetime_value: 0,
    lead_score: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      last_contact: new Date().toISOString()
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      source: 'website',
      status: 'prospect',
      notes: '',
      tags: [],
      lifetime_value: 0,
      lead_score: 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Add New Contact</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="X" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as Contact['source'] })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="cold_outreach">Cold Outreach</option>
                <option value="social_media">Social Media</option>
                <option value="advertising">Advertising</option>
                <option value="event">Event</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Contact['status'] })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
              >
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="customer">Customer</option>
                <option value="inactive">Inactive</option>
                <option value="churned">Churned</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Add Contact
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Deal Modal Component
const DealModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => void;
  contacts: Contact[];
}> = ({ isOpen, onClose, onSubmit, contacts }) => {
  const [formData, setFormData] = useState({
    contact_id: '',
    title: '',
    value: 0,
    currency: 'USD',
    stage: 'prospecting' as Deal['stage'],
    probability: 25,
    expected_close_date: '',
    source: '',
    description: '',
    assigned_to: 'current_user',
    products: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      notes: []
    });
    setFormData({
      contact_id: '',
      title: '',
      value: 0,
      currency: 'USD',
      stage: 'prospecting',
      probability: 25,
      expected_close_date: '',
      source: '',
      description: '',
      assigned_to: 'current_user',
      products: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Add New Deal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="X" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contact</label>
            <select
              required
              value={formData.contact_id}
              onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="">Select a contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} - {contact.company}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Deal Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Value ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => {
                  const stage = e.target.value as Deal['stage'];
                  const probabilities = {
                    prospecting: 25,
                    qualification: 40,
                    proposal: 60,
                    negotiation: 80,
                    closed_won: 100,
                    closed_lost: 0
                  };
                  setFormData({ 
                    ...formData, 
                    stage,
                    probability: probabilities[stage]
                  });
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
              >
                <option value="prospecting">Prospecting</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Probability ({formData.probability}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Expected Close Date</label>
            <input
              type="date"
              required
              value={formData.expected_close_date}
              onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="e.g., Referral, Website, Cold Call"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Add Deal
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Activity Modal Component
const ActivityModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activity: Omit<Activity, 'id' | 'created_at'>) => void;
  contacts: Contact[];
  deals: Deal[];
}> = ({ isOpen, onClose, onSubmit, contacts, deals }) => {
  const [formData, setFormData] = useState({
    contact_id: '',
    deal_id: '',
    type: 'note' as Activity['type'],
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as Activity['priority'],
    created_by: 'current_user',
    completed: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      contact_id: formData.contact_id || undefined,
      deal_id: formData.deal_id || undefined,
      due_date: formData.due_date || undefined
    });
    setFormData({
      contact_id: '',
      deal_id: '',
      type: 'note',
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      created_by: 'current_user',
      completed: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Add New Activity</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="X" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Activity Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Activity['type'] })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="note">Note</option>
              <option value="email">Email</option>
              <option value="call">Call</option>
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contact (Optional)</label>
            <select
              value={formData.contact_id}
              onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="">No specific contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} - {contact.company}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Deal (Optional)</label>
            <select
              value={formData.deal_id}
              onChange={(e) => setFormData({ ...formData, deal_id: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="">No specific deal</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.title} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.value)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Activity['priority'] })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Add Activity
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CRMManager;