import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Send, 
  Globe, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Zap,
  Timer,
  BarChart3
} from 'lucide-react'

interface CampaignSchedulerProps {
  sendImmediately: boolean
  scheduledAt?: string
  timezone: string
  onScheduleChange: (sendImmediately: boolean, scheduledAt?: string, timezone?: string) => void
}

interface TimeZoneOption {
  value: string
  label: string
  offset: string
}

const CampaignScheduler: React.FC<CampaignSchedulerProps> = ({
  sendImmediately,
  scheduledAt,
  timezone,
  onScheduleChange
}) => {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedTimezone, setSelectedTimezone] = useState(timezone)
  const [sendOption, setSendOption] = useState<'now' | 'scheduled' | 'optimal'>(
    sendImmediately ? 'now' : 'scheduled'
  )

  // Common timezones
  const timezones: TimeZoneOption[] = [
    { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5/-4' },
    { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6/-5' },
    { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7/-6' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8/-7' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', offset: 'UTC+0/+1' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: 'UTC+9' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', offset: 'UTC+10/+11' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: 'UTC+0' }
  ]

  // Get current date and time in selected timezone
  const getCurrentDateTime = () => {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
      timeZone: selectedTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
    
    const formatter = new Intl.DateTimeFormat('en-CA', options)
    const parts = formatter.formatToParts(now)
    
    const year = parts.find(p => p.type === 'year')?.value
    const month = parts.find(p => p.type === 'month')?.value
    const day = parts.find(p => p.type === 'day')?.value
    const hour = parts.find(p => p.type === 'hour')?.value
    const minute = parts.find(p => p.type === 'minute')?.value
    
    return {
      date: `${year}-${month}-${day}`,
      time: `${hour}:${minute}`,
      datetime: `${year}-${month}-${day}T${hour}:${minute}`
    }
  }

  useEffect(() => {
    if (scheduledAt && !sendImmediately) {
      const scheduleDate = new Date(scheduledAt)
      const dateStr = scheduleDate.toISOString().split('T')[0]
      const timeStr = scheduleDate.toTimeString().slice(0, 5)
      setSelectedDate(dateStr)
      setSelectedTime(timeStr)
    } else {
      const current = getCurrentDateTime()
      setSelectedDate(current.date)
      setSelectedTime(current.time)
    }
  }, [scheduledAt, sendImmediately, selectedTimezone])

  const getOptimalSendTimes = () => {
    const now = new Date()
    const optimalTimes = []
    
    // Best times based on email marketing research
    const bestHours = [9, 10, 11, 14, 15] // 9 AM, 10 AM, 11 AM, 2 PM, 3 PM
    const bestDays = [2, 3, 4] // Tuesday, Wednesday, Thursday (0 = Sunday)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() + i)
      
      if (bestDays.includes(date.getDay())) {
        bestHours.forEach(hour => {
          const optimalDate = new Date(date)
          optimalDate.setHours(hour, 0, 0, 0)
          
          if (optimalDate > now) {
            optimalTimes.push({
              datetime: optimalDate,
              label: optimalDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              }),
              score: calculateEngagementScore(optimalDate)
            })
          }
        })
      }
    }
    
    return optimalTimes
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Top 5 suggestions
  }

  const calculateEngagementScore = (date: Date) => {
    let score = 50 // Base score
    
    const hour = date.getHours()
    const day = date.getDay()
    
    // Time of day scoring
    if (hour >= 9 && hour <= 11) score += 20 // Morning peak
    else if (hour >= 14 && hour <= 16) score += 15 // Afternoon peak
    else if (hour >= 18 && hour <= 20) score += 10 // Evening
    else score -= 10 // Off-peak hours
    
    // Day of week scoring
    if (day >= 2 && day <= 4) score += 15 // Tue-Thu
    else if (day === 1 || day === 5) score += 5 // Mon, Fri
    else score -= 15 // Weekend
    
    // Avoid lunch hour
    if (hour === 12 || hour === 13) score -= 5
    
    return Math.max(0, Math.min(100, score))
  }

  const handleSendOptionChange = (option: 'now' | 'scheduled' | 'optimal') => {
    setSendOption(option)
    
    if (option === 'now') {
      onScheduleChange(true, undefined, selectedTimezone)
    } else if (option === 'scheduled') {
      const scheduledDateTime = `${selectedDate}T${selectedTime}`
      onScheduleChange(false, scheduledDateTime, selectedTimezone)
    } else if (option === 'optimal') {
      const optimalTimes = getOptimalSendTimes()
      if (optimalTimes.length > 0) {
        const bestTime = optimalTimes[0].datetime
        const dateStr = bestTime.toISOString().split('T')[0]
        const timeStr = bestTime.toTimeString().slice(0, 5)
        setSelectedDate(dateStr)
        setSelectedTime(timeStr)
        onScheduleChange(false, bestTime.toISOString(), selectedTimezone)
      }
    }
  }

  const handleScheduleUpdate = () => {
    if (sendOption === 'scheduled') {
      const scheduledDateTime = `${selectedDate}T${selectedTime}`
      onScheduleChange(false, scheduledDateTime, selectedTimezone)
    }
  }

  const validateScheduleTime = () => {
    if (sendOption !== 'scheduled') return { isValid: true, message: '' }
    
    const now = new Date()
    const scheduleTime = new Date(`${selectedDate}T${selectedTime}`)
    
    if (scheduleTime <= now) {
      return { isValid: false, message: 'Scheduled time must be in the future' }
    }
    
    const diffMinutes = (scheduleTime.getTime() - now.getTime()) / (1000 * 60)
    if (diffMinutes < 15) {
      return { isValid: false, message: 'Schedule at least 15 minutes in advance' }
    }
    
    return { isValid: true, message: '' }
  }

  const validation = validateScheduleTime()
  const optimalTimes = getOptimalSendTimes()
  const currentTime = getCurrentDateTime()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Campaign Scheduling
        </h3>
        <p className="text-gray-400">Choose when to send your campaign for maximum impact</p>
      </div>

      {/* Send Options */}
      <div className="space-y-4">
        {/* Send Immediately */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            sendOption === 'now'
              ? 'border-blue-500 bg-blue-900/20'
              : 'border-gray-700 hover:border-gray-600'
          }`}
          onClick={() => handleSendOptionChange('now')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                sendOption === 'now' ? 'bg-blue-900/20 text-purple-400' : 'bg-gray-800/50 text-gray-400'
              }`}>
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Send Immediately</h4>
                <p className="text-sm text-gray-400">Campaign will be sent right after review</p>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 ${
              sendOption === 'now'
                ? 'border-blue-500 bg-blue-900/200'
                : 'border-gray-600'
            }`}>
              {sendOption === 'now' && (
                <div className="w-2 h-2 glass-effect rounded-full m-0.5" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Schedule for Later */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            sendOption === 'scheduled'
              ? 'border-blue-500 bg-blue-900/20'
              : 'border-gray-700 hover:border-gray-600'
          }`}
          onClick={() => handleSendOptionChange('scheduled')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                sendOption === 'scheduled' ? 'bg-blue-900/20 text-purple-400' : 'bg-gray-800/50 text-gray-400'
              }`}>
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Schedule for Later</h4>
                <p className="text-sm text-gray-400">Choose a specific date and time</p>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 ${
              sendOption === 'scheduled'
                ? 'border-blue-500 bg-blue-900/200'
                : 'border-gray-600'
            }`}>
              {sendOption === 'scheduled' && (
                <div className="w-2 h-2 glass-effect rounded-full m-0.5" />
              )}
            </div>
          </div>

          {sendOption === 'scheduled' && (
            <div className="space-y-4 pl-11">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={currentTime.date}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setTimeout(handleScheduleUpdate, 100)
                    }}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => {
                      setSelectedTime(e.target.value)
                      setTimeout(handleScheduleUpdate, 100)
                    }}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Timezone
                </label>
                <select
                  value={selectedTimezone}
                  onChange={(e) => {
                    setSelectedTimezone(e.target.value)
                    onScheduleChange(false, `${selectedDate}T${selectedTime}`, e.target.value)
                  }}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </option>
                  ))}
                </select>
              </div>

              {!validation.isValid && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{validation.message}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Optimal Time */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            sendOption === 'optimal'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-700 hover:border-gray-600'
          }`}
          onClick={() => handleSendOptionChange('optimal')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                sendOption === 'optimal' ? 'bg-green-100 text-green-600' : 'bg-gray-800/50 text-gray-400'
              }`}>
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Send at Optimal Time</h4>
                <p className="text-sm text-gray-400">AI-recommended time for best engagement</p>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 ${
              sendOption === 'optimal'
                ? 'border-green-500 bg-green-500'
                : 'border-gray-600'
            }`}>
              {sendOption === 'optimal' && (
                <div className="w-2 h-2 glass-effect rounded-full m-0.5" />
              )}
            </div>
          </div>

          {sendOption === 'optimal' && optimalTimes.length > 0 && (
            <div className="space-y-3 pl-11">
              <div className="glass-effect p-3 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-white">Recommended Time</h5>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {optimalTimes[0].score}% engagement score
                  </span>
                </div>
                <p className="text-gray-700">{optimalTimes[0].label}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Based on historical engagement patterns
                </p>
              </div>

              {optimalTimes.length > 1 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm text-purple-400 hover:text-blue-800">
                    View other suggested times ({optimalTimes.length - 1} more)
                  </summary>
                  <div className="mt-2 space-y-2">
                    {optimalTimes.slice(1).map((time, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                        <span className="text-sm text-gray-700">{time.label}</span>
                        <span className="text-xs text-gray-500">{time.score}% score</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Schedule Summary */}
      {sendOption !== 'now' && (
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-white mb-1">Schedule Summary</h4>
              <p className="text-sm text-gray-400 mb-2">
                Your campaign will be sent on{' '}
                <span className="font-medium">
                  {new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {' at '}
                <span className="font-medium">
                  {new Date(`${selectedDate}T${selectedTime}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: selectedTimezone
                  })}
                </span>
                {' '}
                <span className="text-gray-500">
                  ({timezones.find(tz => tz.value === selectedTimezone)?.label})
                </span>
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>• You can edit or cancel before sending</span>
                <span>• Recipients will get emails in their local timezone</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Email Scheduling Best Practices
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tuesday-Thursday between 9-11 AM or 2-4 PM typically see highest engagement</li>
          <li>• Avoid Mondays (busy catching up) and Fridays (preparing for weekend)</li>
          <li>• Consider your audience&apos;s timezone and industry</li>
          <li>• Test different send times to find what works best for your audience</li>
        </ul>
      </div>
    </div>
  )
}

export default CampaignScheduler