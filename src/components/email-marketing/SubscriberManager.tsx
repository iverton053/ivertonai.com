import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Mail,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Tag,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  MoreHorizontal,
  Check,
  X,
  AlertCircle,
  FileText,
  UserCheck,
  UserX,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  Target,
  Activity,
  AlertTriangle,
  Grid,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useEmailMarketingStore } from '../../stores/emailMarketingStore'
import type { EmailSubscriber, EmailList } from '../../types/emailMarketing'
import AddEditSubscriberModal from './AddEditSubscriberModal'
import ImportSubscribersModal from './ImportSubscribersModal'

interface SubscriberManagerProps {
  selectedListId?: string
}

type ViewMode = 'list' | 'cards' | 'analytics'
type FilterStatus = 'all' | 'active' | 'unsubscribed' | 'bounced' | 'pending'

const SubscriberManager: React.FC<SubscriberManagerProps> = ({ selectedListId }) => {
  const { 
    subscribers, 
    lists, 
    isLoading,
    error,
    loadSubscribers,
    loadLists,
    createSubscriber,
    updateSubscriber,
    deleteSubscriber,
    bulkUnsubscribe,
    updateSubscriberTags,
    importSubscribers
  } = useEmailMarketingStore()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [selectedListFilter, setSelectedListFilter] = useState(selectedListId || 'all')
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingSubscriber, setEditingSubscriber] = useState<EmailSubscriber | null>(null)
  const [sortBy, setSortBy] = useState<'created_at' | 'email' | 'name' | 'last_activity'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)

  // Mock agency data - replace with actual user context
  const agencyId = 'mock-agency-id'
  const clientId = undefined // Show all clients

  useEffect(() => {
    loadSubscribers(agencyId, clientId)
    loadLists(agencyId, clientId)
  }, [agencyId, clientId, loadSubscribers, loadLists])

  // Filter and sort subscribers
  const filteredSubscribers = subscribers
    .filter(subscriber => {
      const matchesSearch = subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (subscriber.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                           (subscriber.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter
      const matchesList = selectedListFilter === 'all' || subscriber.list_ids?.includes(selectedListFilter)
      
      return matchesSearch && matchesStatus && matchesList
    })
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'name':
          aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email
          bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.email
          break
        case 'last_activity':
          aValue = a.lastEngagementAt ? new Date(a.lastEngagementAt) : new Date(0)
          bValue = b.lastEngagementAt ? new Date(b.lastEngagementAt) : new Date(0)
          break
        case 'created_at':
        default:
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage)
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Statistics
  const stats = {
    total: subscribers.length,
    subscribed: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    bounced: subscribers.filter(s => s.status === 'bounced').length,
    pending: subscribers.filter(s => s.status === 'pending').length,
    growth: 12.5, // Mock growth rate
    engagement: 34.2 // Mock engagement rate
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubscribers(paginatedSubscribers.map(s => s.id))
    } else {
      setSelectedSubscribers([])
    }
  }

  const handleSelectSubscriber = (subscriberId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubscribers(prev => [...prev, subscriberId])
    } else {
      setSelectedSubscribers(prev => prev.filter(id => id !== subscriberId))
    }
  }

  const handleBulkAction = async (action: 'delete' | 'unsubscribe' | 'resubscribe' | 'add_to_list') => {
    if (selectedSubscribers.length === 0) return

    try {
      switch (action) {
        case 'delete':
          // Delete subscribers one by one
          for (const subscriberId of selectedSubscribers) {
            await deleteSubscriber(subscriberId)
          }
          break
        case 'unsubscribe':
          await bulkUnsubscribe(selectedSubscribers)
          break
        case 'resubscribe':
          // Reactivate subscribers by updating them individually
          for (const subscriberId of selectedSubscribers) {
            await updateSubscriber(subscriberId, { status: 'active' })
          }
          break
      }
      setSelectedSubscribers([])
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }

  const handleExport = async () => {
    // Create CSV data from filtered subscribers
    const csvHeaders = ['Email', 'First Name', 'Last Name', 'Status', 'Created At', 'Last Engagement']
    const csvRows = filteredSubscribers.map(subscriber => [
      subscriber.email,
      subscriber.firstName || '',
      subscriber.lastName || '',
      subscriber.status,
      subscriber.createdAt,
      subscriber.lastEngagementAt || ''
    ])
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'unsubscribed': return 'bg-gray-700/500/10 text-gray-400 border-gray-500/20'
      case 'bounced': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'complained': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'suppressed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default: return 'bg-gray-700/500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="w-3 h-3" />
      case 'unsubscribed': return <UserX className="w-3 h-3" />
      case 'bounced': return <AlertCircle className="w-3 h-3" />
      case 'pending': return <UserPlus className="w-3 h-3" />
      case 'complained': return <AlertTriangle className="w-3 h-3" />
      case 'suppressed': return <UserMinus className="w-3 h-3" />
      default: return <Users className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Subscriber Management</h2>
          <p className="text-gray-400">Manage your email subscribers and lists</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          
          <button
            onClick={handleExport}
            disabled={filteredSubscribers.length === 0}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscriber</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="glass-effect rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Subscribed</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.subscribed.toLocaleString()}</p>
            </div>
            <UserCheck className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Unsubscribed</p>
              <p className="text-2xl font-bold text-gray-400">{stats.unsubscribed.toLocaleString()}</p>
            </div>
            <UserX className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Bounced</p>
              <p className="text-2xl font-bold text-red-400">{stats.bounced.toLocaleString()}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Growth</p>
              <p className="text-2xl font-bold text-blue-400">+{stats.growth}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Engagement</p>
              <p className="text-2xl font-bold text-purple-400">{stats.engagement}%</p>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="glass-effect rounded-xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={selectedListFilter}
              onChange={(e) => setSelectedListFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
            >
              <option value="all">All Lists</option>
              {lists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
            >
              <option value="created_at">Date Added</option>
              <option value="email">Email</option>
              <option value="name">Name</option>
              <option value="last_activity">Last Activity</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'analytics' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedSubscribers.length > 0 && (
          <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-400">
                {selectedSubscribers.length} subscriber{selectedSubscribers.length !== 1 ? 's' : ''} selected
              </span>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('resubscribe')}
                  className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                >
                  Resubscribe
                </button>
                <button
                  onClick={() => handleBulkAction('unsubscribe')}
                  className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Unsubscribe
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedSubscribers([])}
                  className="px-3 py-1 text-sm text-gray-400 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscriber List/Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : paginatedSubscribers.length === 0 ? (
        <div className="text-center py-12 glass-effect rounded-xl">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {subscribers.length === 0 ? 'No subscribers yet' : 'No subscribers match your filters'}
          </h3>
          <p className="text-gray-400 mb-6">
            {subscribers.length === 0 
              ? 'Add your first subscriber to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {subscribers.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Your First Subscriber
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'list' && (
            <SubscriberListView
              subscribers={paginatedSubscribers}
              selectedSubscribers={selectedSubscribers}
              onSelectAll={handleSelectAll}
              onSelectSubscriber={handleSelectSubscriber}
              onEditSubscriber={setEditingSubscriber}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          )}

          {viewMode === 'cards' && (
            <SubscriberCardsView
              subscribers={paginatedSubscribers}
              selectedSubscribers={selectedSubscribers}
              onSelectSubscriber={handleSelectSubscriber}
              onEditSubscriber={setEditingSubscriber}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          )}

          {viewMode === 'analytics' && (
            <SubscriberAnalyticsView subscribers={filteredSubscribers} />
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubscribers.length)} of {filteredSubscribers.length} subscribers
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-gray-300"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Subscriber Modal */}
      <AddEditSubscriberModal
        isOpen={showAddModal || !!editingSubscriber}
        onClose={() => {
          setShowAddModal(false)
          setEditingSubscriber(null)
        }}
        subscriber={editingSubscriber}
        lists={lists}
        onSave={async (subscriberData) => {
          const dataWithAgency = { ...subscriberData, agencyId, clientId }
          if (editingSubscriber) {
            await updateSubscriber(editingSubscriber.id, dataWithAgency)
          } else {
            await createSubscriber(dataWithAgency)
          }
          setShowAddModal(false)
          setEditingSubscriber(null)
        }}
      />

      {/* Import Modal */}
      <ImportSubscribersModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        lists={lists}
        onImport={async (importData) => {
          await importSubscribers(importData, agencyId)
          setShowImportModal(false)
        }}
      />
    </div>
  )
}

// Sub-components would be defined here...
// I'll create the key ones:

interface SubscriberListViewProps {
  subscribers: EmailSubscriber[]
  selectedSubscribers: string[]
  onSelectAll: (checked: boolean) => void
  onSelectSubscriber: (id: string, checked: boolean) => void
  onEditSubscriber: (subscriber: EmailSubscriber) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
}

const SubscriberListView: React.FC<SubscriberListViewProps> = ({
  subscribers,
  selectedSubscribers,
  onSelectAll,
  onSelectSubscriber,
  onEditSubscriber,
  getStatusColor,
  getStatusIcon
}) => {
  const isAllSelected = subscribers.length > 0 && selectedSubscribers.length === subscribers.length

  return (
    <div className="glass-effect rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50 border-b border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Subscriber
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Lists
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Added
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {subscribers.map((subscriber) => (
              <motion.tr
                key={subscriber.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-700/20 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedSubscribers.includes(subscriber.id)}
                    onChange={(e) => onSelectSubscriber(subscriber.id, e.target.checked)}
                    className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                  />
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-400 font-medium">
                        {subscriber.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {subscriber.firstName || subscriber.lastName 
                          ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                          : subscriber.email
                        }
                      </div>
                      <div className="text-sm text-gray-400">{subscriber.email}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(subscriber.status)}`}>
                    {getStatusIcon(subscriber.status)}
                    {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                  </span>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-300">
                    {/* List count would come from joined data in real implementation */}
                    0 lists
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-300">
                    {new Date(subscriber.createdAt).toLocaleDateString()}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-400">
                    {subscriber.lastEngagementAt 
                      ? new Date(subscriber.lastEngagementAt).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                </td>
                
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onEditSubscriber(subscriber)}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Additional placeholder components for completeness
const SubscriberCardsView: React.FC<any> = () => (
  <div className="glass-effect rounded-xl p-12 text-center">
    <Grid className="w-16 h-16 text-purple-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">Cards View</h3>
    <p className="text-gray-400">Grid view coming soon with enhanced subscriber cards</p>
  </div>
)

const SubscriberAnalyticsView: React.FC<any> = () => (
  <div className="glass-effect rounded-xl p-12 text-center">
    <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">Analytics View</h3>
    <p className="text-gray-400">Subscriber analytics and insights coming soon</p>
  </div>
)

export default SubscriberManager