import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, FileText, AlertTriangle, CheckCircle, X, Eye, RefreshCw } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGuard } from '../permissions/PermissionGuard';
import { Contact, Deal } from '../../types/crm';

interface DataImportExportProps {
  userId: string;
}

interface ImportResult {
  success: number;
  errors: number;
  warnings: number;
  details: Array<{
    row: number;
    type: 'success' | 'error' | 'warning';
    message: string;
    data?: any;
  }>;
}

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  includeHeaders: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  fields: string[];
}

const DataImportExport: React.FC<DataImportExportProps> = ({ userId }) => {
  const { can } = usePermissions(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importType, setImportType] = useState<'contacts' | 'deals'>('contacts');
  const [exportType, setExportType] = useState<'contacts' | 'deals'>('contacts');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeHeaders: true,
    fields: ['name', 'email', 'phone', 'company']
  });

  // Available fields for export
  const contactFields = [
    { id: 'name', label: 'Full Name' },
    { id: 'email', label: 'Email Address' },
    { id: 'phone', label: 'Phone Number' },
    { id: 'company', label: 'Company' },
    { id: 'position', label: 'Position' },
    { id: 'lead_score', label: 'Lead Score' },
    { id: 'status', label: 'Status' },
    { id: 'source', label: 'Source' },
    { id: 'tags', label: 'Tags' },
    { id: 'created_at', label: 'Created Date' },
    { id: 'updated_at', label: 'Updated Date' }
  ];

  const dealFields = [
    { id: 'title', label: 'Deal Title' },
    { id: 'value', label: 'Deal Value' },
    { id: 'stage', label: 'Stage' },
    { id: 'probability', label: 'Probability' },
    { id: 'expected_close_date', label: 'Expected Close Date' },
    { id: 'contact_name', label: 'Contact Name' },
    { id: 'company', label: 'Company' },
    { id: 'owner', label: 'Owner' },
    { id: 'created_at', label: 'Created Date' },
    { id: 'updated_at', label: 'Updated Date' }
  ];

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Parse file content
      const content = await readFileContent(file);
      const parsedData = parseCSV(content); // Assuming CSV for demo
      
      setPreviewData(parsedData);
      setShowPreview(true);
    } catch (error) {
      console.error('Error reading file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    
    return data;
  };

  const handleImport = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock import result
      const mockResult: ImportResult = {
        success: Math.floor(previewData.length * 0.8),
        errors: Math.floor(previewData.length * 0.1),
        warnings: Math.floor(previewData.length * 0.1),
        details: previewData.slice(0, 5).map((item, index) => ({
          row: index + 1,
          type: Math.random() > 0.8 ? 'error' : Math.random() > 0.9 ? 'warning' : 'success',
          message: Math.random() > 0.8 
            ? 'Invalid email format' 
            : Math.random() > 0.9 
            ? 'Duplicate entry found'
            : 'Successfully imported',
          data: item
        }))
      };
      
      setImportResult(mockResult);
      setShowPreview(false);
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock data based on export type
      const mockData = generateMockData(exportType, 100);
      const csvContent = convertToCSV(mockData, exportOptions.fields);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${exportType}-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockData = (type: string, count: number) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      if (type === 'contacts') {
        data.push({
          name: `Contact ${i + 1}`,
          email: `contact${i + 1}@example.com`,
          phone: `+1-555-${String(i).padStart(4, '0')}`,
          company: `Company ${String.fromCharCode(65 + (i % 26))}`,
          position: ['Manager', 'Director', 'VP', 'Executive'][i % 4],
          lead_score: Math.floor(Math.random() * 100),
          status: ['new', 'contacted', 'qualified', 'customer'][i % 4],
          source: ['website', 'referral', 'social', 'advertisement'][i % 4],
          created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } else {
        data.push({
          title: `Deal ${i + 1}`,
          value: Math.floor(Math.random() * 100000),
          stage: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'][i % 5],
          probability: Math.floor(Math.random() * 100),
          expected_close_date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          contact_name: `Contact ${i + 1}`,
          company: `Company ${String.fromCharCode(65 + (i % 26))}`,
          owner: `Owner ${(i % 3) + 1}`,
          created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
    return data;
  };

  const convertToCSV = (data: any[], fields: string[]) => {
    const headers = fields.join(',');
    const rows = data.map(item => 
      fields.map(field => `"${item[field] || ''}"`).join(',')
    ).join('\n');
    
    return `${headers}\n${rows}`;
  };

  const getStatusIcon = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <X className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <FileText className="w-7 h-7 text-blue-400" />
            <span>Data Import & Export</span>
          </h2>
          <p className="text-gray-400 mt-1">Import and export your CRM data</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-effect rounded-xl p-2">
        <nav className="flex space-x-2">
          {[
            { id: 'import', label: 'Import Data', icon: Upload },
            { id: 'export', label: 'Export Data', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <PermissionGuard 
          userId={userId} 
          resource={importType} 
          action="import"
          fallback={
            <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700">
              <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Import Permission Required</h3>
              <p className="text-gray-400">You don't have permission to import {importType}.</p>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import Configuration */}
            <div className="glass-effect rounded-xl p-6 space-y-6">
              <h3 className="text-xl font-semibold text-white">Import Configuration</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Import Type</label>
                <select
                  value={importType}
                  onChange={(e) => setImportType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="contacts">Contacts</option>
                  <option value="deals">Deals</option>
                </select>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white">File Upload</h4>
                
                <div
                  onClick={handleFileSelect}
                  className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg p-8 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">Click to upload file</p>
                  <p className="text-sm text-gray-400">Supports CSV, Excel (.xlsx), JSON</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center space-x-2 p-4">
                  <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-blue-400">Processing file...</span>
                </div>
              )}
            </div>

            {/* Import Guidelines */}
            <div className="glass-effect rounded-xl p-6 space-y-4">
              <h3 className="text-xl font-semibold text-white">Import Guidelines</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-gray-300">Use CSV format for best compatibility</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-gray-300">Include headers in the first row</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-gray-300">Email addresses must be valid format</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <p className="text-gray-300">Duplicates will be skipped by default</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <p className="text-gray-300">Maximum file size: 10MB</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                <h4 className="font-medium text-blue-400 mb-2">Required Fields for {importType}</h4>
                <div className="space-y-1 text-sm">
                  {importType === 'contacts' ? (
                    <>
                      <p className="text-gray-300">• name (required)</p>
                      <p className="text-gray-300">• email (required)</p>
                      <p className="text-gray-300">• phone, company, position (optional)</p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-300">• title (required)</p>
                      <p className="text-gray-300">• value (required)</p>
                      <p className="text-gray-300">• stage, contact_name (optional)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <PermissionGuard 
          userId={userId} 
          resource={exportType} 
          action="export"
          fallback={
            <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700">
              <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Export Permission Required</h3>
              <p className="text-gray-400">You don't have permission to export {exportType}.</p>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Configuration */}
            <div className="glass-effect rounded-xl p-6 space-y-6">
              <h3 className="text-xl font-semibold text-white">Export Configuration</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Export Type</label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="contacts">Contacts</option>
                  <option value="deals">Deals</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">File Format</label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fields to Export</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(exportType === 'contacts' ? contactFields : dealFields).map(field => (
                    <label key={field.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.fields.includes(field.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportOptions(prev => ({
                              ...prev,
                              fields: [...prev.fields, field.id]
                            }));
                          } else {
                            setExportOptions(prev => ({
                              ...prev,
                              fields: prev.fields.filter(f => f !== field.id)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-white text-sm">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={isProcessing || exportOptions.fields.length === 0}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Export Data</span>
                  </>
                )}
              </button>
            </div>

            {/* Export Preview */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Export Preview</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <p className="text-gray-400">Total Records</p>
                    <p className="text-xl font-semibold text-white">1,247</p>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <p className="text-gray-400">Selected Fields</p>
                    <p className="text-xl font-semibold text-white">{exportOptions.fields.length}</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <h4 className="font-medium text-blue-400 mb-2">Export Summary</h4>
                  <p className="text-sm text-gray-300">
                    Exporting {exportOptions.fields.length} fields from {exportType} as {exportOptions.format.toUpperCase()} format.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Import Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                    <p className="text-green-400 font-medium">Ready to Import</p>
                    <p className="text-2xl font-bold text-white">{previewData.length}</p>
                  </div>
                  <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                    <p className="text-yellow-400 font-medium">Warnings</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                  <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20">
                    <p className="text-red-400 font-medium">Errors</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        {Object.keys(previewData[0] || {}).map(key => (
                          <th key={key} className="text-left p-2 text-gray-400 font-medium">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="p-2 text-white">{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Import Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Results Modal */}
      <AnimatePresence>
        {importResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Import Results</h3>
                <button
                  onClick={() => setImportResult(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                    <p className="text-green-400 font-medium">Success</p>
                    <p className="text-2xl font-bold text-white">{importResult.success}</p>
                  </div>
                  <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                    <p className="text-yellow-400 font-medium">Warnings</p>
                    <p className="text-2xl font-bold text-white">{importResult.warnings}</p>
                  </div>
                  <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20">
                    <p className="text-red-400 font-medium">Errors</p>
                    <p className="text-2xl font-bold text-white">{importResult.errors}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-white">Import Details</h4>
                  {importResult.details.map((detail, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg">
                      {getStatusIcon(detail.type)}
                      <div className="flex-1">
                        <p className="text-sm text-white">Row {detail.row}: {detail.message}</p>
                        {detail.data && (
                          <p className="text-xs text-gray-400 mt-1">
                            {Object.entries(detail.data).slice(0, 3).map(([key, value]) => `${key}: ${value}`).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setImportResult(null)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataImportExport;