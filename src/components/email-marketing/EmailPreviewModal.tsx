import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Monitor, 
  Smartphone, 
  Tablet,
  Eye,
  Send,
  Mail,
  User,
  Calendar,
  ExternalLink,
  TestTube,
  Download,
  Share
} from 'lucide-react'

interface EmailPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  campaignData: {
    name: string
    subject_line: string
    preheader_text: string
    from_name: string
    from_email: string
    template_content?: string
  }
  onSendTest?: (email: string) => Promise<void>
}

type PreviewDevice = 'desktop' | 'tablet' | 'mobile'

const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  campaignData,
  onSendTest
}) => {
  const [selectedDevice, setSelectedDevice] = useState<PreviewDevice>('desktop')
  const [testEmail, setTestEmail] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testSent, setTestSent] = useState(false)

  const getDeviceClass = (device: PreviewDevice) => {
    switch (device) {
      case 'desktop':
        return 'max-w-4xl h-full'
      case 'tablet':
        return 'max-w-2xl h-full'
      case 'mobile':
        return 'max-w-sm h-full'
      default:
        return 'max-w-4xl h-full'
    }
  }

  const getDeviceIcon = (device: PreviewDevice) => {
    switch (device) {
      case 'desktop':
        return Monitor
      case 'tablet':
        return Tablet
      case 'mobile':
        return Smartphone
      default:
        return Monitor
    }
  }

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEmail.trim() || !onSendTest) return

    setIsSendingTest(true)
    try {
      await onSendTest(testEmail)
      setTestSent(true)
      setTimeout(() => setTestSent(false), 3000)
    } catch (error) {
      console.error('Failed to send test email:', error)
    } finally {
      setIsSendingTest(false)
    }
  }

  // Generate preview HTML with proper styling
  const generatePreviewHTML = () => {
    const baseHTML = campaignData.template_content || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="padding: 20px; text-align: center; background-color: #f8f9fa; border-bottom: 1px solid #e9ecef;">
          <h1 style="color: #333333; margin: 0; font-size: 24px;">${campaignData.name}</h1>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #333333; font-size: 20px; margin-bottom: 20px;">Welcome to our Newsletter</h2>
          <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for subscribing to our newsletter. We'll keep you updated with our latest news, 
            products, and exclusive offers.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Get Started
            </a>
          </div>
          <p style="color: #666666; font-size: 14px; line-height: 1.6;">
            If you have any questions, feel free to reach out to us at any time.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
          <p style="color: #999999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} ${campaignData.from_name}. All rights reserved.
          </p>
          <p style="color: #999999; font-size: 12px; margin: 5px 0 0 0;">
            <a href="#" style="color: #007bff; text-decoration: none;">Unsubscribe</a> | 
            <a href="#" style="color: #007bff; text-decoration: none;">Update Preferences</a>
          </p>
        </div>
      </div>
    `

    return baseHTML
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-effect rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Eye className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Email Preview</h2>
                <p className="text-gray-400">{campaignData.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Device Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {(['desktop', 'tablet', 'mobile'] as PreviewDevice[]).map((device) => {
                  const Icon = getDeviceIcon(device)
                  return (
                    <button
                      key={device}
                      onClick={() => setSelectedDevice(device)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedDevice === device 
                          ? 'glass-effect text-purple-400 shadow-sm' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      title={`${device.charAt(0).toUpperCase() + device.slice(1)} view`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Email Preview */}
            <div className="flex-1 p-6 overflow-auto bg-gray-700/50">
              {/* Email Client Header */}
              <div className="glass-effect rounded-lg shadow-sm border border-gray-700 mb-4">
                <div className="px-4 py-3 border-b border-gray-700 bg-gray-700/50 rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Inbox Preview</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">
                          {campaignData.from_name} &lt;{campaignData.from_email}&gt;
                        </span>
                        <span className="text-sm text-gray-400">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        <strong>{campaignData.subject_line}</strong>
                        {campaignData.preheader_text && (
                          <span className="text-gray-400 ml-2">
                            {campaignData.preheader_text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Content Preview */}
              <div className="flex justify-center">
                <div className={`transition-all duration-300 ${getDeviceClass(selectedDevice)}`}>
                  <div className="glass-effect rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                    <div 
                      className="email-content"
                      dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l border-gray-700 glass-effect p-6 overflow-auto">
              {/* Campaign Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Campaign Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Campaign Name</label>
                    <p className="text-white">{campaignData.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-400">Subject Line</label>
                    <p className="text-white">{campaignData.subject_line}</p>
                  </div>
                  
                  {campaignData.preheader_text && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">Preheader</label>
                      <p className="text-white text-sm">{campaignData.preheader_text}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-400">From</label>
                    <p className="text-white">{campaignData.from_name} &lt;{campaignData.from_email}&gt;</p>
                  </div>
                </div>
              </div>

              {/* Test Email */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Send Test Email</h3>
                
                <form onSubmit={handleSendTest} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      placeholder="Enter test email address"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSendingTest || !onSendTest}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSendingTest ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4" />
                        <span>Send Test</span>
                      </>
                    )}
                  </button>
                  
                  {testSent && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-600 text-sm flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Test email sent successfully!
                      </p>
                    </div>
                  )}
                </form>
              </div>

              {/* Preview Actions */}
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download HTML</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Browser</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share className="w-4 h-4" />
                  <span>Share Preview Link</span>
                </button>
              </div>

              {/* Preview Tips */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Preview Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Test on different devices and email clients</li>
                  <li>• Check that all links work correctly</li>
                  <li>• Verify images display properly</li>
                  <li>• Review subject line length (50 chars max)</li>
                  <li>• Ensure preheader text is compelling</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default EmailPreviewModal