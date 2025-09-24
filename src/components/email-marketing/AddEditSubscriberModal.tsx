import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  User, 
  Mail, 
  Tag, 
  MapPin, 
  Phone, 
  Calendar,
  Globe,
  Briefcase,
  Save,
  UserPlus,
  AlertCircle,
  Check
} from 'lucide-react'
import type { EmailSubscriber, EmailList } from '../../types/emailMarketing'

interface AddEditSubscriberModalProps {
  isOpen: boolean
  onClose: () => void
  subscriber?: EmailSubscriber | null
  lists: EmailList[]
  onSave: (subscriberData: Partial<EmailSubscriber>) => Promise<void>
}

interface SubscriberFormData {
  email: string
  first_name: string
  last_name: string
  status: 'subscribed' | 'unsubscribed' | 'pending'
  list_ids: string[]
  phone: string
  company: string
  job_title: string
  website: string
  location: string
  birthday: string
  tags: string[]
  custom_fields: Record<string, any>
  preferences: {
    email_frequency: 'daily' | 'weekly' | 'monthly'
    content_types: string[]
    timezone: string
  }
}

const AddEditSubscriberModal: React.FC<AddEditSubscriberModalProps> = ({
  isOpen,
  onClose,
  subscriber,
  lists,
  onSave
}) => {
  const [formData, setFormData] = useState<SubscriberFormData>({
    email: '',
    first_name: '',
    last_name: '',
    status: 'subscribed',
    list_ids: [],
    phone: '',
    company: '',
    job_title: '',
    website: '',
    location: '',
    birthday: '',
    tags: [],
    custom_fields: {},
    preferences: {
      email_frequency: 'weekly',
      content_types: ['newsletter'],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [currentTab, setCurrentTab] = useState<'basic' | 'preferences' | 'custom'>('basic')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (subscriber) {
      setFormData({
        email: subscriber.email || '',
        first_name: subscriber.first_name || '',
        last_name: subscriber.last_name || '',
        status: subscriber.status || 'subscribed',
        list_ids: subscriber.list_ids || [],
        phone: subscriber.phone || '',
        company: subscriber.company || '',
        job_title: subscriber.job_title || '',
        website: subscriber.website || '',
        location: subscriber.location || '',
        birthday: subscriber.birthday || '',
        tags: subscriber.tags || [],
        custom_fields: subscriber.custom_fields || {},
        preferences: subscriber.preferences || {
          email_frequency: 'weekly',
          content_types: ['newsletter'],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      })
    } else {
      // Reset form for new subscriber
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        status: 'subscribed',
        list_ids: [],
        phone: '',
        company: '',
        job_title: '',
        website: '',
        location: '',
        birthday: '',
        tags: [],
        custom_fields: {},
        preferences: {
          email_frequency: 'weekly',
          content_types: ['newsletter'],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      })
    }
    setErrors({})
    setCurrentTab('basic')
  }, [subscriber, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.list_ids.length === 0) {
      newErrors.lists = 'Please select at least one list'
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Please enter a valid URL (include http:// or https://)'
    }

    if (formData.phone && !formData.phone.match(/^[+]?[1-9][\d]{0,15}$/)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSaving(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Failed to save subscriber:', error)
      setErrors({ submit: 'Failed to save subscriber. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleListToggle = (listId: string) => {
    setFormData(prev => ({
      ...prev,
      list_ids: prev.list_ids.includes(listId)
        ? prev.list_ids.filter(id => id !== listId)
        : [...prev.list_ids, listId]
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleContentTypeToggle = (contentType: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        content_types: prev.preferences.content_types.includes(contentType)
          ? prev.preferences.content_types.filter(ct => ct !== contentType)
          : [...prev.preferences.content_types, contentType]
      }
    }))
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Tag },
    { id: 'custom', label: 'Custom Fields', icon: Briefcase }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-effect rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-600"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-600">
            <div className="flex items-center space-x-3">
              <UserPlus className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                {subscriber ? 'Edit Subscriber' : 'Add New Subscriber'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id as typeof currentTab)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      currentTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Info Tab */}
              {currentTab === 'basic' && (
                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-600'
                        }`}
                        placeholder="subscriber@example.com"
                        required
                      />
                    </div>
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as typeof formData.status }))}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                    >
                      <option value="subscribed">Subscribed</option>
                      <option value="unsubscribed">Unsubscribed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  {/* Lists */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Lists *
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-700 rounded-lg p-3">
                      {lists.map(list => (
                        <label key={list.id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.list_ids.includes(list.id)}
                            onChange={() => handleListToggle(list.id)}
                            className="rounded border-gray-600 text-purple-400 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-300">{list.name}</span>
                          {list.description && (
                            <span className="text-xs text-gray-400">({list.description})</span>
                          )}
                        </label>
                      ))}
                    </div>
                    {errors.lists && <p className="text-red-600 text-sm mt-1">{errors.lists}</p>}
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 ${
                            errors.phone ? 'border-red-300' : 'border-gray-600'
                          }`}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="pl-10 pr-4 py-2 w-full border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                          placeholder="New York, NY"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        placeholder="Acme Corp"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={formData.job_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        placeholder="Marketing Manager"
                      />
                    </div>
                  </div>

                  {/* Website & Birthday */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 ${
                            errors.website ? 'border-red-300' : 'border-gray-600'
                          }`}
                          placeholder="https://example.com"
                        />
                      </div>
                      {errors.website && <p className="text-red-600 text-sm mt-1">{errors.website}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Birthday
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="date"
                          value={formData.birthday}
                          onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                          className="pl-10 pr-4 py-2 w-full border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        placeholder="Add a tag..."
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 text-purple-400 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {currentTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Frequency
                    </label>
                    <select
                      value={formData.preferences.email_frequency}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          email_frequency: e.target.value as typeof formData.preferences.email_frequency
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content Types
                    </label>
                    <div className="space-y-2">
                      {['newsletter', 'promotional', 'updates', 'events'].map(contentType => (
                        <label key={contentType} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.preferences.content_types.includes(contentType)}
                            onChange={() => handleContentTypeToggle(contentType)}
                            className="rounded border-gray-600 text-purple-400 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-300 capitalize">{contentType}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={formData.preferences.timezone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          timezone: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Custom Fields Tab */}
              {currentTab === 'custom' && (
                <div className="space-y-6">
                  <p className="text-gray-400">Custom fields allow you to store additional information about your subscribers.</p>
                  
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">
                      Custom fields functionality will be available in the next update. 
                      Contact support if you need specific custom fields for your campaigns.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="px-6 py-3 bg-red-50 border-t border-red-200">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-700/50 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{subscriber ? 'Update Subscriber' : 'Add Subscriber'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AddEditSubscriberModal