import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  AlertCircle,
  Target,
  TrendingUp,
  Calendar,
  Mail,
  UserPlus,
  Settings,
  Eye,
  BarChart3
} from 'lucide-react'
import { useEmailMarketingStore } from '../../stores/emailMarketingStore'
import type { EmailList } from '../../types/emailMarketing'

interface ListSelectorProps {
  selectedLists: string[]
  onSelectionChange: (selectedLists: string[]) => void
  error?: string
}

interface ListStats {
  total_subscribers: number
  active_subscribers: number
  engagement_rate: number
  last_campaign_date?: string
  growth_rate: number
}

const ListSelector: React.FC<ListSelectorProps> = ({
  selectedLists,
  onSelectionChange,
  error
}) => {
  const { lists, fetchLists, createList, loading } = useEmailMarketingStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'active' | 'growing' | 'engaged'>('all')
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  // Mock list statistics (in real app, this would come from the API)
  const getListStats = (listId: string): ListStats => {
    const baseStats = {
      total_subscribers: Math.floor(Math.random() * 10000) + 100,
      active_subscribers: Math.floor(Math.random() * 8000) + 80,
      engagement_rate: Math.random() * 40 + 15, // 15-55%
      growth_rate: (Math.random() - 0.5) * 20, // -10% to +10%
      last_campaign_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
    
    baseStats.active_subscribers = Math.min(baseStats.active_subscribers, baseStats.total_subscribers)
    return baseStats
  }

  const filteredLists = lists.filter(list => {
    const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (list.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    if (!matchesSearch) return false

    const stats = getListStats(list.id)
    
    switch (filterType) {
      case 'active':
        return stats.active_subscribers > 100
      case 'growing':
        return stats.growth_rate > 2
      case 'engaged':
        return stats.engagement_rate > 25
      default:
        return true
    }
  })

  const toggleListSelection = (listId: string) => {
    if (selectedLists.includes(listId)) {
      onSelectionChange(selectedLists.filter(id => id !== listId))
    } else {
      onSelectionChange([...selectedLists, listId])
    }
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListName.trim()) return

    try {
      const newList = await createList({
        name: newListName.trim(),
        description: newListDescription.trim() || undefined,
        type: 'marketing',
        is_active: true
      })
      
      // Auto-select the newly created list
      if (newList) {
        onSelectionChange([...selectedLists, newList.id])
      }
      
      setNewListName('')
      setNewListDescription('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to create list:', error)
    }
  }

  const getTotalSelectedSubscribers = () => {
    return selectedLists.reduce((total, listId) => {
      const stats = getListStats(listId)
      return total + stats.active_subscribers
    }, 0)
  }

  const getEngagementPreview = () => {
    if (selectedLists.length === 0) return null

    const totalSubscribers = getTotalSelectedSubscribers()
    const avgEngagement = selectedLists.reduce((avg, listId) => {
      const stats = getListStats(listId)
      return avg + stats.engagement_rate
    }, 0) / selectedLists.length

    return {
      subscribers: totalSubscribers,
      engagement: avgEngagement,
      estimatedOpens: Math.round(totalSubscribers * (avgEngagement / 100)),
      estimatedClicks: Math.round(totalSubscribers * (avgEngagement / 100) * 0.25) // Assume 25% of opens click
    }
  }

  const preview = getEngagementPreview()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Select Your Audience
        </h3>
        <p className="text-gray-400">
          Choose the email lists to send your campaign to. You can select multiple lists.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search lists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
        >
          <option value="all">All Lists</option>
          <option value="active">Active (100+ subscribers)</option>
          <option value="growing">Growing Lists</option>
          <option value="engaged">High Engagement</option>
        </select>

        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New List</span>
        </button>
      </div>

      {/* Create List Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-700/50 p-4 rounded-lg border border-gray-700"
          >
            <h4 className="font-medium text-white mb-3">Create New Email List</h4>
            <form onSubmit={handleCreateList} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="List name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Description (optional)"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Create List
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lists Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredLists.length === 0 ? (
        <div className="text-center py-12 bg-gray-700/50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {lists.length === 0 ? 'No email lists yet' : 'No lists match your criteria'}
          </h3>
          <p className="text-gray-400 mb-6">
            {lists.length === 0 
              ? 'Create your first email list to start building your audience'
              : 'Try adjusting your search or filter settings'
            }
          </p>
          {lists.length === 0 && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First List
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map(list => {
            const stats = getListStats(list.id)
            const isSelected = selectedLists.includes(list.id)
            
            return (
              <motion.div
                key={list.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-700 hover:border-gray-600 glass-effect'
                }`}
                onClick={() => toggleListSelection(list.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{list.name}</h4>
                    {list.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{list.description}</p>
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-600'
                  }`}>
                    {isSelected && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                {/* List Statistics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Subscribers</span>
                    <span className="text-sm font-medium text-white">
                      {stats.total_subscribers.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Active</span>
                    <span className="text-sm font-medium text-white">
                      {stats.active_subscribers.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Engagement
                    </span>
                    <span className={`text-sm font-medium ${
                      stats.engagement_rate > 25 
                        ? 'text-green-600' 
                        : stats.engagement_rate > 15
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {stats.engagement_rate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Growth
                    </span>
                    <span className={`text-sm font-medium ${
                      stats.growth_rate > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.growth_rate > 0 ? '+' : ''}{stats.growth_rate.toFixed(1)}%
                    </span>
                  </div>

                  {stats.last_campaign_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Last sent
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(stats.last_campaign_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* List Type Badge */}
                <div className="mt-3 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    list.type === 'marketing'
                      ? 'bg-blue-100 text-blue-700'
                      : list.type === 'transactional'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-800/50 text-gray-300'
                  }`}>
                    {list.type === 'marketing' && <Target className="w-3 h-3 mr-1" />}
                    {list.type === 'transactional' && <Mail className="w-3 h-3 mr-1" />}
                    {list.type || 'General'}
                  </span>
                  
                  {!list.is_active && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300">
                      Inactive
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Selection Summary */}
      {preview && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900">
              Campaign Reach Summary
            </h4>
            <span className="text-sm text-blue-700">
              {selectedLists.length} list{selectedLists.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {preview.subscribers.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Total Recipients</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {preview.estimatedOpens.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Est. Opens</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">
                {preview.estimatedClicks.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Est. Clicks</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">
                {preview.engagement.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-700">Avg. Engagement</div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-purple-400">
            * Estimates based on historical performance of selected lists
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {selectedLists.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-300">
              {selectedLists.length} list{selectedLists.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => onSelectionChange([])}
              className="text-sm text-purple-400 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-400 border border-gray-600 rounded hover:bg-gray-800/50 transition-colors">
              <Eye className="w-4 h-4 inline mr-1" />
              Preview
            </button>
            <button className="px-3 py-1 text-sm text-gray-400 border border-gray-600 rounded hover:bg-gray-800/50 transition-colors">
              <Settings className="w-4 h-4 inline mr-1" />
              Segment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListSelector