import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Users,
  Settings,
  ArrowRight,
  RefreshCw,
  Eye,
  AlertTriangle
} from 'lucide-react'
import type { EmailList } from '../../types/emailMarketing'

interface ImportSubscribersModalProps {
  isOpen: boolean
  onClose: () => void
  lists: EmailList[]
  onImport: (file: File, listId: string, options: ImportOptions) => Promise<void>
}

interface ImportOptions {
  updateExisting: boolean
  skipDuplicates: boolean
  sendWelcomeEmail: boolean
  subscribeToList: boolean
  fieldMapping: Record<string, string>
  defaultStatus: 'subscribed' | 'pending'
}

interface ParsedData {
  headers: string[]
  rows: string[][]
  totalRows: number
  validEmails: number
  duplicates: number
  errors: string[]
}

type ImportStep = 'upload' | 'mapping' | 'options' | 'preview' | 'importing' | 'complete'

const ImportSubscribersModal: React.FC<ImportSubscribersModalProps> = ({
  isOpen,
  onClose,
  lists,
  onImport
}) => {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedListId, setSelectedListId] = useState('')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    updateExisting: false,
    skipDuplicates: true,
    sendWelcomeEmail: false,
    subscribeToList: true,
    fieldMapping: {},
    defaultStatus: 'subscribed'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResults, setImportResults] = useState<{
    imported: number
    skipped: number
    errors: number
    errorDetails: string[]
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const steps = [
    { key: 'upload', label: 'Upload File', description: 'Select your CSV file' },
    { key: 'mapping', label: 'Field Mapping', description: 'Map CSV columns' },
    { key: 'options', label: 'Import Options', description: 'Configure settings' },
    { key: 'preview', label: 'Preview', description: 'Review before import' },
    { key: 'importing', label: 'Importing', description: 'Processing data' },
    { key: 'complete', label: 'Complete', description: 'Import finished' }
  ]

  const requiredFields = ['email']
  const optionalFields = ['first_name', 'last_name', 'phone', 'company', 'job_title', 'location', 'tags']

  // Reset modal state when closed
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentStep('upload')
      setSelectedFile(null)
      setSelectedListId('')
      setParsedData(null)
      setImportOptions({
        updateExisting: false,
        skipDuplicates: true,
        sendWelcomeEmail: false,
        subscribeToList: true,
        fieldMapping: {},
        defaultStatus: 'subscribed'
      })
      setIsProcessing(false)
      setImportResults(null)
    }
  }, [isOpen])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setIsProcessing(true)

    try {
      const text = await file.text()
      const parsed = parseCSV(text)
      setParsedData(parsed)
      
      // Auto-map common fields
      const autoMapping: Record<string, string> = {}
      parsed.headers.forEach(header => {
        const lowerHeader = header.toLowerCase().trim()
        if (lowerHeader.includes('email')) autoMapping.email = header
        else if (lowerHeader.includes('first') && lowerHeader.includes('name')) autoMapping.first_name = header
        else if (lowerHeader.includes('last') && lowerHeader.includes('name')) autoMapping.last_name = header
        else if (lowerHeader.includes('phone')) autoMapping.phone = header
        else if (lowerHeader.includes('company')) autoMapping.company = header
        else if (lowerHeader.includes('title') || lowerHeader.includes('job')) autoMapping.job_title = header
        else if (lowerHeader.includes('location') || lowerHeader.includes('city')) autoMapping.location = header
      })
      
      setImportOptions(prev => ({ ...prev, fieldMapping: autoMapping }))
      setCurrentStep('mapping')
    } catch (error) {
      console.error('Error parsing CSV:', error)
      alert('Error parsing CSV file. Please check the format.')
    } finally {
      setIsProcessing(false)
    }
  }

  const parseCSV = (text: string): ParsedData => {
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')))
    
    const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'))
    const validEmails = emailIndex >= 0 ? rows.filter(row => isValidEmail(row[emailIndex])).length : 0
    
    const emails = emailIndex >= 0 ? rows.map(row => row[emailIndex]).filter(isValidEmail) : []
    const duplicates = emails.length - new Set(emails).size

    return {
      headers,
      rows: rows.filter(row => row.length === headers.length), // Filter out malformed rows
      totalRows: rows.length,
      validEmails,
      duplicates,
      errors: []
    }
  }

  const isValidEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const handleImport = async () => {
    if (!selectedFile || !selectedListId) return

    setCurrentStep('importing')
    setIsProcessing(true)

    try {
      await onImport(selectedFile, selectedListId, importOptions)
      
      // Simulate import results (in real implementation, this would come from the API)
      const results = {
        imported: parsedData?.validEmails || 0,
        skipped: parsedData?.duplicates || 0,
        errors: 0,
        errorDetails: []
      }
      
      setImportResults(results)
      setCurrentStep('complete')
    } catch (error) {
      console.error('Import failed:', error)
      setImportResults({
        imported: 0,
        skipped: 0,
        errors: parsedData?.totalRows || 0,
        errorDetails: ['Import failed. Please try again.']
      })
      setCurrentStep('complete')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `email,first_name,last_name,phone,company,job_title,location
john.doe@example.com,John,Doe,+1234567890,Acme Corp,Manager,New York
jane.smith@example.com,Jane,Smith,+0987654321,Tech Inc,Developer,San Francisco
bob.wilson@example.com,Bob,Wilson,,Startup LLC,CEO,Austin`

    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sample_subscribers.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-effect rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-600"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-600">
            <div className="flex items-center space-x-3">
              <Upload className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Import Subscribers</h2>
                <p className="text-gray-400">Upload a CSV file to add subscribers to your lists</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-700/50">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = step.key === currentStep
                const isCompleted = steps.findIndex(s => s.key === currentStep) > index
                const isDisabled = steps.findIndex(s => s.key === currentStep) < index
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : isCompleted
                        ? 'bg-green-100 text-green-700'
                        : isDisabled
                        ? 'text-gray-400'
                        : 'text-gray-400'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-400'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-sm font-medium">{step.label}</div>
                        <div className="text-xs opacity-75">{step.description}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Upload Step */}
            {currentStep === 'upload' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Upload Your CSV File</h3>
                  <p className="text-gray-400">
                    Select a CSV file containing your subscriber data. The file should include at least an email column.
                  </p>
                </div>

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      <FileText className="w-12 h-12 text-green-600 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-white">{selectedFile.name}</p>
                        <p className="text-gray-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null)
                          setParsedData(null)
                        }}
                        className="text-purple-400 hover:text-blue-800"
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-white">
                          Drop your CSV file here, or{' '}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-purple-400 hover:text-blue-800"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-gray-400">Supports files up to 10MB</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Sample Download */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Need a sample CSV format?</h4>
                      <p className="text-blue-700 text-sm">Download our sample file to see the expected format</p>
                    </div>
                    <button
                      onClick={downloadSampleCSV}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Sample</span>
                    </button>
                  </div>
                </div>

                {/* Processing */}
                {isProcessing && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mr-3" />
                    <span className="text-gray-400">Processing file...</span>
                  </div>
                )}
              </div>
            )}

            {/* Mapping Step */}
            {currentStep === 'mapping' && parsedData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Map Your CSV Columns</h3>
                  <p className="text-gray-400">
                    Match your CSV columns to subscriber fields. Email is required.
                  </p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Rows:</span> {parsedData.totalRows}
                    </div>
                    <div>
                      <span className="font-medium">Valid Emails:</span> {parsedData.validEmails}
                    </div>
                    <div>
                      <span className="font-medium">Duplicates:</span> {parsedData.duplicates}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-white">Required Fields</h4>
                  {requiredFields.map(field => (
                    <div key={field} className="flex items-center space-x-4">
                      <label className="w-24 text-sm font-medium text-gray-300 capitalize">
                        {field.replace('_', ' ')}
                      </label>
                      <select
                        value={importOptions.fieldMapping[field] || ''}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          fieldMapping: { ...prev.fieldMapping, [field]: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select column...</option>
                        {parsedData.headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <h4 className="font-medium text-white mt-6">Optional Fields</h4>
                  {optionalFields.map(field => (
                    <div key={field} className="flex items-center space-x-4">
                      <label className="w-24 text-sm font-medium text-gray-300 capitalize">
                        {field.replace('_', ' ')}
                      </label>
                      <select
                        value={importOptions.fieldMapping[field] || ''}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          fieldMapping: { ...prev.fieldMapping, [field]: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                      >
                        <option value="">Skip this field</option>
                        {parsedData.headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options Step */}
            {currentStep === 'options' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Import Options</h3>
                  <p className="text-gray-400">Configure how the import should be handled</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Email List *
                  </label>
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose a list...</option>
                    {lists.map(list => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Status for New Subscribers
                    </label>
                    <select
                      value={importOptions.defaultStatus}
                      onChange={(e) => setImportOptions(prev => ({
                        ...prev,
                        defaultStatus: e.target.value as 'subscribed' | 'pending'
                      }))}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                    >
                      <option value="subscribed">Subscribed (immediately active)</option>
                      <option value="pending">Pending (requires confirmation)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={importOptions.skipDuplicates}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          skipDuplicates: e.target.checked
                        }))}
                        className="rounded border-gray-600 text-purple-400 focus:ring-purple-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-300">Skip Duplicates</span>
                        <p className="text-xs text-gray-400">Don't import subscribers that already exist</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={importOptions.updateExisting}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          updateExisting: e.target.checked
                        }))}
                        className="rounded border-gray-600 text-purple-400 focus:ring-purple-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-300">Update Existing Subscribers</span>
                        <p className="text-xs text-gray-400">Update information for subscribers that already exist</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={importOptions.sendWelcomeEmail}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          sendWelcomeEmail: e.target.checked
                        }))}
                        className="rounded border-gray-600 text-purple-400 focus:ring-purple-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-300">Send Welcome Email</span>
                        <p className="text-xs text-gray-400">Send welcome email to new subscribers</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Step */}
            {currentStep === 'preview' && parsedData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Preview Import</h3>
                  <p className="text-gray-400">Review the data before importing</p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Import Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Rows:</span>
                      <span className="font-medium ml-2">{parsedData.totalRows}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Valid Emails:</span>
                      <span className="font-medium ml-2">{parsedData.validEmails}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">To Import:</span>
                      <span className="font-medium ml-2">
                        {importOptions.skipDuplicates 
                          ? parsedData.validEmails - parsedData.duplicates 
                          : parsedData.validEmails
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">List:</span>
                      <span className="font-medium ml-2">
                        {lists.find(l => l.id === selectedListId)?.name || 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Sample Data Preview</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-700 rounded-lg">
                      <thead className="bg-gray-700/50">
                        <tr>
                          {Object.entries(importOptions.fieldMapping)
                            .filter(([_, column]) => column)
                            .map(([field, column]) => (
                              <th key={field} className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                                {field.replace('_', ' ')}
                              </th>
                            ))
                          }
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parsedData.rows.slice(0, 5).map((row, index) => (
                          <tr key={index}>
                            {Object.entries(importOptions.fieldMapping)
                              .filter(([_, column]) => column)
                              .map(([field, column]) => {
                                const columnIndex = parsedData.headers.indexOf(column)
                                return (
                                  <td key={field} className="px-4 py-2 text-sm text-white">
                                    {row[columnIndex] || '-'}
                                  </td>
                                )
                              })
                            }
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Showing first 5 rows</p>
                </div>
              </div>
            )}

            {/* Importing Step */}
            {currentStep === 'importing' && (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Importing Subscribers</h3>
                <p className="text-gray-400">Please wait while we process your data...</p>
              </div>
            )}

            {/* Complete Step */}
            {currentStep === 'complete' && importResults && (
              <div className="text-center py-8">
                <div className="space-y-6">
                  {importResults.errors === 0 ? (
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                  ) : (
                    <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto" />
                  )}
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Import {importResults.errors === 0 ? 'Completed' : 'Completed with Issues'}
                    </h3>
                    <p className="text-gray-400">Your subscriber import has finished processing</p>
                  </div>

                  <div className="bg-gray-700/50 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{importResults.imported}</div>
                        <div className="text-sm text-gray-400">Imported</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{importResults.skipped}</div>
                        <div className="text-sm text-gray-400">Skipped</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{importResults.errors}</div>
                        <div className="text-sm text-gray-400">Errors</div>
                      </div>
                    </div>
                  </div>

                  {importResults.errorDetails.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg text-left">
                      <h4 className="font-medium text-red-900 mb-2">Error Details</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {importResults.errorDetails.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {currentStep !== 'importing' && currentStep !== 'complete' && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-700/50 border-t border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex items-center space-x-3">
                {currentStep !== 'upload' && (
                  <button
                    onClick={() => {
                      const currentIndex = steps.findIndex(s => s.key === currentStep)
                      if (currentIndex > 0) {
                        setCurrentStep(steps[currentIndex - 1].key as ImportStep)
                      }
                    }}
                    className="px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    Back
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (currentStep === 'upload' && parsedData) {
                      setCurrentStep('mapping')
                    } else if (currentStep === 'mapping' && importOptions.fieldMapping.email) {
                      setCurrentStep('options')
                    } else if (currentStep === 'options' && selectedListId) {
                      setCurrentStep('preview')
                    } else if (currentStep === 'preview') {
                      handleImport()
                    }
                  }}
                  disabled={
                    (currentStep === 'upload' && !parsedData) ||
                    (currentStep === 'mapping' && !importOptions.fieldMapping.email) ||
                    (currentStep === 'options' && !selectedListId) ||
                    isProcessing
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {currentStep === 'preview' ? (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Start Import</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="flex items-center justify-center px-6 py-4 bg-gray-700/50 border-t border-gray-700">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ImportSubscribersModal