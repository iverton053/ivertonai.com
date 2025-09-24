import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Mail, 
  Users, 
  Calendar, 
  Clock, 
  Target, 
  Palette, 
  Eye, 
  Send, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  Image,
  Type,
  Layout,
  Zap,
  Settings,
  Play,
  TestTube,
  Globe
} from 'lucide-react'
import { useEmailMarketingStore } from '../../stores/emailMarketingStore'
import EmailTemplateBuilder from './EmailTemplateBuilder'
import CampaignScheduler from './CampaignScheduler'
import ListSelector from './ListSelector'
import type { EmailCampaign, EmailTemplate, EmailList } from '../../types/emailMarketing'

interface CampaignCreationModalProps {
  isOpen: boolean
  onClose: () => void
  editingCampaign?: EmailCampaign | null
}

type CampaignStep = 'setup' | 'audience' | 'template' | 'schedule' | 'review'

interface CampaignData {
  name: string
  subject_line: string
  preheader_text: string
  from_name: string
  from_email: string
  reply_to_email: string
  campaign_type: 'newsletter' | 'promotional' | 'transactional' | 'automated'
  template_id?: string
  template_content?: string
  selected_lists: string[]
  segment_criteria?: any
  scheduled_at?: string
  send_immediately: boolean
  timezone: string
  tracking_settings: {
    open_tracking: boolean
    click_tracking: boolean
    utm_campaign: string
    utm_source: string
    utm_medium: string
  }
  a_b_test?: {
    enabled: boolean
    test_type: 'subject_line' | 'from_name' | 'content'
    variant_b_subject?: string
    variant_b_from_name?: string
    variant_b_content?: string
    test_percentage: number
    winner_criteria: 'open_rate' | 'click_rate'
    test_duration_hours: number
  }
}

const CampaignCreationModal: React.FC<CampaignCreationModalProps> = ({
  isOpen,
  onClose,
  editingCampaign
}) => {
  const { 
    createCampaign, 
    updateCampaign, 
    templates, 
    lists, 
    fetchTemplates, 
    fetchLists,
    loading 
  } = useEmailMarketingStore()

  const [currentStep, setCurrentStep] = useState<CampaignStep>('setup')
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    subject_line: '',
    preheader_text: '',
    from_name: '',
    from_email: '',
    reply_to_email: '',
    campaign_type: 'newsletter',
    selected_lists: [],
    send_immediately: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tracking_settings: {
      open_tracking: true,
      click_tracking: true,
      utm_campaign: '',
      utm_source: 'email',
      utm_medium: 'newsletter'
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const steps: Array<{ key: CampaignStep; label: string; icon: any }> = [
    { key: 'setup', label: 'Campaign Setup', icon: Settings },
    { key: 'audience', label: 'Select Audience', icon: Users },
    { key: 'template', label: 'Design Email', icon: Palette },
    { key: 'schedule', label: 'Schedule', icon: Calendar },
    { key: 'review', label: 'Review & Send', icon: Send }
  ]

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
      fetchLists()
      
      if (editingCampaign) {
        setCampaignData({
          name: editingCampaign.name,
          subject_line: editingCampaign.subject_line,
          preheader_text: editingCampaign.preheader_text || '',
          from_name: editingCampaign.from_name,
          from_email: editingCampaign.from_email,
          reply_to_email: editingCampaign.reply_to_email || editingCampaign.from_email,
          campaign_type: editingCampaign.campaign_type,
          template_id: editingCampaign.template_id || undefined,
          template_content: editingCampaign.template_content || undefined,
          selected_lists: editingCampaign.selected_lists || [],
          scheduled_at: editingCampaign.scheduled_at || undefined,
          send_immediately: !editingCampaign.scheduled_at,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          tracking_settings: editingCampaign.tracking_settings || {
            open_tracking: true,
            click_tracking: true,
            utm_campaign: editingCampaign.name.toLowerCase().replace(/\s+/g, '-'),
            utm_source: 'email',
            utm_medium: 'newsletter'
          }
        })
      }
    }
  }, [isOpen, editingCampaign, fetchTemplates, fetchLists])

  const validateStep = (step: CampaignStep): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 'setup':
        if (!campaignData.name.trim()) newErrors.name = 'Campaign name is required'
        if (!campaignData.subject_line.trim()) newErrors.subject_line = 'Subject line is required'
        if (!campaignData.from_name.trim()) newErrors.from_name = 'From name is required'
        if (!campaignData.from_email.trim()) newErrors.from_email = 'From email is required'
        if (campaignData.from_email && !/\S+@\S+\.\S+/.test(campaignData.from_email)) {
          newErrors.from_email = 'Please enter a valid email address'
        }
        break
      
      case 'audience':
        if (campaignData.selected_lists.length === 0) {
          newErrors.audience = 'Please select at least one email list'
        }
        break
      
      case 'template':
        if (!campaignData.template_id && !campaignData.template_content) {
          newErrors.template = 'Please select a template or create custom content'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const stepIndex = steps.findIndex(s => s.key === currentStep)
      if (stepIndex < steps.length - 1) {
        setCurrentStep(steps[stepIndex + 1].key)
      }
    }
  }

  const prevStep = () => {
    const stepIndex = steps.findIndex(s => s.key === currentStep)
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key)
    }
  }

  const handleSaveDraft = async () => {
    if (!validateStep('setup')) return

    setIsSaving(true)
    try {
      const campaignPayload = {
        ...campaignData,
        status: 'draft' as const,
        scheduled_at: null
      }

      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, campaignPayload)
      } else {
        await createCampaign(campaignPayload)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSchedule = async () => {
    if (!validateAllSteps()) return

    setIsSaving(true)
    try {
      const campaignPayload = {
        ...campaignData,
        status: campaignData.send_immediately ? 'sending' as const : 'scheduled' as const
      }

      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, campaignPayload)
      } else {
        await createCampaign(campaignPayload)
      }
      onClose()
    } catch (error) {
      console.error('Failed to schedule campaign:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const validateAllSteps = (): boolean => {
    return steps.every(step => validateStep(step.key))
  }

  const handleClose = () => {
    setCampaignData({
      name: '',
      subject_line: '',
      preheader_text: '',
      from_name: '',
      from_email: '',
      reply_to_email: '',
      campaign_type: 'newsletter',
      selected_lists: [],
      send_immediately: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      tracking_settings: {
        open_tracking: true,
        click_tracking: true,
        utm_campaign: '',
        utm_source: 'email',
        utm_medium: 'newsletter'
      }
    })
    setCurrentStep('setup')
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-effect rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4 bg-gray-700/50 border-b border-gray-700">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = step.key === currentStep
                const isCompleted = steps.findIndex(s => s.key === currentStep) > index
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : isCompleted
                        ? 'bg-green-900/50 text-green-300'
                        : 'text-gray-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Campaign Setup Step */}
            {currentStep === 'setup' && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-600'
                      }`}
                      placeholder="Enter campaign name"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Campaign Type
                    </label>
                    <select
                      value={campaignData.campaign_type}
                      onChange={(e) => setCampaignData(prev => ({ 
                        ...prev, 
                        campaign_type: e.target.value as CampaignData['campaign_type']
                      }))}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                    >
                      <option value="newsletter">Newsletter</option>
                      <option value="promotional">Promotional</option>
                      <option value="transactional">Transactional</option>
                      <option value="automated">Automated</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    value={campaignData.subject_line}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, subject_line: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 ${
                      errors.subject_line ? 'border-red-300' : 'border-gray-600'
                    }`}
                    placeholder="Enter email subject line"
                  />
                  {errors.subject_line && <p className="text-red-600 text-sm mt-1">{errors.subject_line}</p>}
                  <p className="text-gray-400 text-sm mt-1">
                    Keep it under 50 characters for better mobile display
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preheader Text
                  </label>
                  <input
                    type="text"
                    value={campaignData.preheader_text}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, preheader_text: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                    placeholder="Preview text that appears after the subject line"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    This text appears in the inbox preview. Recommended: 90-120 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      From Name *
                    </label>
                    <input
                      type="text"
                      value={campaignData.from_name}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, from_name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 ${
                        errors.from_name ? 'border-red-300' : 'border-gray-600'
                      }`}
                      placeholder="Your Name or Company"
                    />
                    {errors.from_name && <p className="text-red-600 text-sm mt-1">{errors.from_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      From Email *
                    </label>
                    <input
                      type="email"
                      value={campaignData.from_email}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, from_email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 ${
                        errors.from_email ? 'border-red-300' : 'border-gray-600'
                      }`}
                      placeholder="sender@yourcompany.com"
                    />
                    {errors.from_email && <p className="text-red-600 text-sm mt-1">{errors.from_email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    value={campaignData.reply_to_email}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, reply_to_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                    placeholder="replies@yourcompany.com"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Leave blank to use the From Email for replies
                  </p>
                </div>

                {/* Tracking Settings */}
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Tracking Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={campaignData.tracking_settings.open_tracking}
                        onChange={(e) => setCampaignData(prev => ({
                          ...prev,
                          tracking_settings: {
                            ...prev.tracking_settings,
                            open_tracking: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-600 text-purple-400 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-300">Track Email Opens</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={campaignData.tracking_settings.click_tracking}
                        onChange={(e) => setCampaignData(prev => ({
                          ...prev,
                          tracking_settings: {
                            ...prev.tracking_settings,
                            click_tracking: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-600 text-purple-400 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-300">Track Link Clicks</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        UTM Campaign
                      </label>
                      <input
                        type="text"
                        value={campaignData.tracking_settings.utm_campaign}
                        onChange={(e) => setCampaignData(prev => ({
                          ...prev,
                          tracking_settings: {
                            ...prev.tracking_settings,
                            utm_campaign: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        placeholder="campaign-name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        UTM Source
                      </label>
                      <input
                        type="text"
                        value={campaignData.tracking_settings.utm_source}
                        onChange={(e) => setCampaignData(prev => ({
                          ...prev,
                          tracking_settings: {
                            ...prev.tracking_settings,
                            utm_source: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        placeholder="email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        UTM Medium
                      </label>
                      <input
                        type="text"
                        value={campaignData.tracking_settings.utm_medium}
                        onChange={(e) => setCampaignData(prev => ({
                          ...prev,
                          tracking_settings: {
                            ...prev.tracking_settings,
                            utm_medium: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        placeholder="newsletter"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audience Selection Step */}
            {currentStep === 'audience' && (
              <div className="p-6">
                <ListSelector
                  selectedLists={campaignData.selected_lists}
                  onSelectionChange={(selectedLists) => 
                    setCampaignData(prev => ({ ...prev, selected_lists: selectedLists }))
                  }
                  error={errors.audience}
                />
              </div>
            )}

            {/* Template Design Step */}
            {currentStep === 'template' && (
              <div className="p-6">
                <EmailTemplateBuilder
                  templateId={campaignData.template_id}
                  content={campaignData.template_content}
                  onTemplateSelect={(templateId) => 
                    setCampaignData(prev => ({ ...prev, template_id: templateId }))
                  }
                  onContentChange={(content) => 
                    setCampaignData(prev => ({ ...prev, template_content: content }))
                  }
                  error={errors.template}
                />
              </div>
            )}

            {/* Schedule Step */}
            {currentStep === 'schedule' && (
              <div className="p-6">
                <CampaignScheduler
                  sendImmediately={campaignData.send_immediately}
                  scheduledAt={campaignData.scheduled_at}
                  timezone={campaignData.timezone}
                  onScheduleChange={(sendImmediately, scheduledAt, timezone) =>
                    setCampaignData(prev => ({
                      ...prev,
                      send_immediately: sendImmediately,
                      scheduled_at: scheduledAt,
                      timezone: timezone
                    }))
                  }
                />
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="p-6 space-y-6">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4">Campaign Summary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Campaign Name</p>
                      <p className="text-white">{campaignData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">Type</p>
                      <p className="text-white capitalize">{campaignData.campaign_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">Subject Line</p>
                      <p className="text-white">{campaignData.subject_line}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">From</p>
                      <p className="text-white">{campaignData.from_name} &lt;{campaignData.from_email}&gt;</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">Recipients</p>
                      <p className="text-white">{campaignData.selected_lists.length} lists selected</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">Schedule</p>
                      <p className="text-white">
                        {campaignData.send_immediately 
                          ? 'Send immediately' 
                          : `Scheduled for ${new Date(campaignData.scheduled_at!).toLocaleString()}`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview Email</span>
                  </button>

                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <TestTube className="w-4 h-4" />
                    <span>Send Test Email</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 bg-gray-700/50 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              {currentStep !== 'setup' && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800/50 transition-colors flex items-center space-x-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
              
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || loading}
                className="px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800/50 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {currentStep === 'review' ? (
                <button
                  onClick={handleSchedule}
                  disabled={isSaving || loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {campaignData.send_immediately ? <Send className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  <span>
                    {isSaving 
                      ? 'Processing...' 
                      : campaignData.send_immediately 
                      ? 'Send Now' 
                      : 'Schedule Campaign'
                    }
                  </span>
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CampaignCreationModal