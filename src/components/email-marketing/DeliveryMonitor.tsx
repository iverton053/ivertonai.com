import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Send,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Mail,
  Users,
  Activity,
  Zap,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import { emailMarketingService } from '../../services/emailMarketingService'

interface DeliveryStatus {
  campaign_id: string
  total_subscribers: number
  sent_count: number
  failed_count: number
  pending_count: number
  success_rate: number
  last_activity: string
}

interface ESPStatus {
  id: string
  name: string
  is_active: boolean
  is_primary: boolean
  rate_limit_per_second: number
  rate_limit_per_hour: number
}

interface DeliveryMonitorProps {
  campaignId: string
  onClose?: () => void
}

const DeliveryMonitor: React.FC<DeliveryMonitorProps> = ({ campaignId, onClose }) => {
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(null)
  const [espConfig, setEspConfig] = useState<ESPStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch delivery status
  const fetchDeliveryStatus = async () => {
    try {
      const response = await emailMarketingService.getCampaignDeliveryStatus(campaignId)
      if (response.success) {
        setDeliveryStatus(response.data)
        setError(null)
      } else {
        setError(response.error || 'Failed to fetch delivery status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Fetch ESP configuration
  const fetchESPConfig = async () => {
    try {
      const response = await emailMarketingService.getESPConfiguration()
      if (response.success) {
        setEspConfig(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch ESP config:', err)
    }
  }

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchDeliveryStatus(), fetchESPConfig()])
      setIsLoading(false)
    }
    loadData()
  }, [campaignId])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      if (deliveryStatus && deliveryStatus.pending_count > 0) {
        fetchDeliveryStatus()
      }
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, deliveryStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-emerald-400'
      case 'sending': return 'text-blue-400'
      case 'failed': return 'text-red-400'
      case 'partially_sent': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-5 h-5" />
      case 'sending': return <Send className="w-5 h-5" />
      case 'failed': return <XCircle className="w-5 h-5" />
      case 'partially_sent': return <AlertTriangle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const getDeliveryStatus = () => {
    if (!deliveryStatus) return 'unknown'
    
    if (deliveryStatus.pending_count > 0) return 'sending'
    if (deliveryStatus.failed_count === 0) return 'sent'
    if (deliveryStatus.sent_count === 0) return 'failed'
    return 'partially_sent'
  }

  if (isLoading) {
    return (
      <div className="glass-effect rounded-xl p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mr-3" />
          <span className="text-white">Loading delivery status...</span>
        </div>
      </div>
    )
  }

  const currentStatus = getDeliveryStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Delivery Monitor</h2>
            <p className="text-gray-400">Real-time campaign delivery tracking</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              autoRefresh 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}</span>
          </button>
          <button
            onClick={fetchDeliveryStatus}
            className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Main Status Card */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gray-800 ${getStatusColor(currentStatus)}`}>
              {getStatusIcon(currentStatus)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white capitalize">
                {currentStatus.replace('_', ' ')}
              </h3>
              <p className="text-gray-400">
                Campaign delivery status
              </p>
            </div>
          </div>
          {deliveryStatus && (
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {deliveryStatus.success_rate.toFixed(1)}%
              </p>
              <p className="text-gray-400">Success Rate</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {deliveryStatus && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>
                {deliveryStatus.sent_count + deliveryStatus.failed_count} / {deliveryStatus.total_subscribers}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${((deliveryStatus.sent_count + deliveryStatus.failed_count) / deliveryStatus.total_subscribers) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Delivery Stats */}
        {deliveryStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xl font-bold text-white">{deliveryStatus.total_subscribers}</p>
              <p className="text-xs text-gray-400">Total Recipients</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-emerald-400">{deliveryStatus.sent_count}</p>
              <p className="text-xs text-gray-400">Successfully Sent</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-xl font-bold text-red-400">{deliveryStatus.failed_count}</p>
              <p className="text-xs text-gray-400">Failed Delivery</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-xl font-bold text-yellow-400">{deliveryStatus.pending_count}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
          </div>
        )}
      </div>

      {/* ESP Status */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Email Service Providers</h3>
        </div>
        
        <div className="space-y-3">
          {espConfig.map((esp) => (
            <div key={esp.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${esp.is_active ? 'bg-emerald-400' : 'bg-gray-700/500'}`} />
                <div>
                  <p className="font-medium text-white capitalize">{esp.name}</p>
                  <p className="text-xs text-gray-400">
                    {esp.is_primary ? 'Primary Provider' : 'Backup Provider'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">
                  {esp.rate_limit_per_second}/sec, {esp.rate_limit_per_hour}/hr
                </p>
                <p className="text-xs text-gray-400">Rate Limits</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Timeline */}
      {deliveryStatus && (
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Delivery Timeline</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">Campaign Started</p>
                <p className="text-sm text-gray-400">
                  {new Date(deliveryStatus.last_activity).toLocaleString()}
                </p>
              </div>
            </div>
            
            {deliveryStatus.sent_count > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {deliveryStatus.sent_count} Emails Delivered
                  </p>
                  <p className="text-sm text-gray-400">Successfully sent to recipients</p>
                </div>
              </div>
            )}
            
            {deliveryStatus.failed_count > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {deliveryStatus.failed_count} Delivery Failures
                  </p>
                  <p className="text-sm text-gray-400">Failed to deliver to recipients</p>
                </div>
              </div>
            )}
            
            {deliveryStatus.pending_count === 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Campaign Completed</p>
                  <p className="text-sm text-gray-400">
                    Final success rate: {deliveryStatus.success_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliveryMonitor