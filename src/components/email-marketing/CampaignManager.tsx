import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Calendar, Mail, Users, TrendingUp, Play, Pause, Edit, Trash2, Copy, Settings, BarChart3, Eye } from 'lucide-react'
import { useEmailMarketingStore } from '../../stores/emailMarketingStore'
import type { EmailCampaign, CampaignStatus } from '../../types/emailMarketing'

interface CampaignManagerProps {
  onCreateCampaign: () => void
}

const CampaignManager: React.FC<CampaignManagerProps> = ({ onCreateCampaign }) => {
  const { 
    campaigns, 
    loading, 
    error, 
    loadCampaigns, 
    deleteCampaign, 
    updateCampaign,
    duplicateCampaign 
  } = useEmailMarketingStore()

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'sent_at' | 'open_rate' | 'click_rate'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadCampaigns('default-agency-id')
  }, [loadCampaigns])

  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'sent_at':
          aValue = a.sendTime ? new Date(a.sendTime) : new Date(0)
          bValue = b.sendTime ? new Date(b.sendTime) : new Date(0)
          break
        case 'open_rate':
          aValue = 0 // Mock data for now
          bValue = 0 // Mock data for now
          break
        case 'click_rate':
          aValue = 0 // Mock data for now
          bValue = 0 // Mock data for now
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-800/50 text-gray-300 border-gray-600'
      case 'scheduled': return 'bg-blue-900/20 text-blue-300 border-blue-600'
      case 'sending': return 'bg-yellow-900/50 text-yellow-300 border-yellow-600'
      case 'sent': return 'bg-green-900/50 text-green-300 border-green-600'
      case 'paused': return 'bg-orange-900/50 text-orange-300 border-orange-600'
      case 'completed': return 'bg-purple-900/50 text-purple-300 border-purple-600'
      default: return 'bg-gray-800/50 text-gray-300 border-gray-600'
    }
  }

  const getStatusIcon = (status: CampaignStatus) => {
    switch (status) {
      case 'draft': return <Edit className="w-3 h-3" />
      case 'scheduled': return <Calendar className="w-3 h-3" />
      case 'sending': return <Mail className="w-3 h-3" />
      case 'sent': return <TrendingUp className="w-3 h-3" />
      case 'paused': return <Pause className="w-3 h-3" />
      case 'completed': return <BarChart3 className="w-3 h-3" />
      default: return <Edit className="w-3 h-3" />
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCampaignAction = async (campaign: EmailCampaign, action: string) => {
    switch (action) {
      case 'edit':
        // TODO: Navigate to campaign editor
        console.log('Edit campaign:', campaign.id)
        break
      case 'duplicate':
        await duplicateCampaign(campaign.id)
        break
      case 'delete':
        if (window.confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
          await deleteCampaign(campaign.id)
        }
        break
      case 'pause':
        await updateCampaign(campaign.id, { status: 'paused' })
        break
      case 'resume':
        await updateCampaign(campaign.id, { status: campaign.sendTime ? 'scheduled' : 'draft' })
        break
      case 'preview':
        // TODO: Open preview modal
        console.log('Preview campaign:', campaign.id)
        break
    }
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => loadCampaigns('default-agency-id')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Campaign Manager</h2>
          <p className="text-gray-400">Create, manage, and analyze your email campaigns</p>
        </div>
        <button
          onClick={onCreateCampaign}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')}
          className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="sent">Sent</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>

        {/* Sort Options */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
          >
            <option value="created_at">Created Date</option>
            <option value="sent_at">Sent Date</option>
            <option value="open_rate">Open Rate</option>
            <option value="click_rate">Click Rate</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Campaign List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-gray-700/50 rounded-lg">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns found'}
          </h3>
          <p className="text-gray-400 mb-6">
            {campaigns.length === 0 
              ? 'Create your first email campaign to get started' 
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {campaigns.length === 0 && (
            <button
              onClick={onCreateCampaign}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="glass-effect rounded-lg shadow-sm border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="glass-effect divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredCampaigns.map((campaign) => (
                    <motion.tr
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="font-medium text-white truncate">
                            {campaign.name}
                          </div>
                          <div className="text-sm text-gray-400 truncate">
                            {campaign.subject}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          {Math.floor(Math.random() * 10000).toLocaleString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Open:</span>
                            <span className="font-medium">
                              {(Math.random() * 40 + 10).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Click:</span>
                            <span className="font-medium">
                              {(Math.random() * 10 + 2).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-white">
                            {campaign.sendTime ? formatDate(campaign.sendTime) : 'Not scheduled'}
                          </div>
                          {campaign.status === 'sent' && (
                            <div className="text-gray-400">
                              Sent: {formatDate(campaign.createdAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCampaignAction(campaign, 'preview')}
                            className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleCampaignAction(campaign, 'edit')}
                            className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleCampaignAction(campaign, 'duplicate')}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          
                          {(campaign.status === 'sending' || campaign.status === 'scheduled') && (
                            <button
                              onClick={() => handleCampaignAction(campaign, 'pause')}
                              className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Pause"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}
                          
                          {campaign.status === 'paused' && (
                            <button
                              onClick={() => handleCampaignAction(campaign, 'resume')}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Resume"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleCampaignAction(campaign, 'delete')}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                            disabled={campaign.status === 'sending'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignManager