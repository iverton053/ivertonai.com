import React, { useState, useEffect } from 'react';
import { Paintbrush, Code, Eye, AlertTriangle, Save, Download, Upload, Trash2 } from 'lucide-react';
import { useClientPortalStore } from '../../stores/clientPortalStore';
import { clientPortalService } from '../../services/clientPortalService';

interface CustomCode {
  id: string;
  name: string;
  type: 'css' | 'javascript';
  code: string;
  enabled: boolean;
  position: 'head' | 'body-start' | 'body-end';
  created_at: string;
  updated_at: string;
}

interface CustomCodeEditorProps {
  portalId: string;
  onClose: () => void;
}

export const CustomCodeEditor: React.FC<CustomCodeEditorProps> = ({ portalId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'css' | 'javascript'>('css');
  const [customCodes, setCustomCodes] = useState<CustomCode[]>([]);
  const [selectedCode, setSelectedCode] = useState<CustomCode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'css' as 'css' | 'javascript',
    code: '',
    enabled: true,
    position: 'head' as 'head' | 'body-start' | 'body-end'
  });

  useEffect(() => {
    loadCustomCodes();
  }, [portalId]);

  const loadCustomCodes = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the database
      const mockCodes: CustomCode[] = [
        {
          id: '1',
          name: 'Brand Colors Override',
          type: 'css',
          code: `/* Custom brand colors */
:root {
  --brand-primary: #3b82f6;
  --brand-secondary: #8b5cf6;
  --brand-accent: #f59e0b;
}

.portal-header {
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
}

.widget {
  border-left: 3px solid var(--brand-accent);
}`,
          enabled: true,
          position: 'head',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Analytics Tracking',
          type: 'javascript',
          code: `// Google Analytics tracking
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-XXXXXXXX-X', 'auto');
ga('send', 'pageview');

// Custom portal events
window.addEventListener('portal-widget-click', function(e) {
  ga('send', 'event', 'Widget', 'Click', e.detail.widgetType);
});`,
          enabled: false,
          position: 'head',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setCustomCodes(mockCodes);
    } catch (err) {
      setError('Failed to load custom codes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);

      if (!formData.name.trim() || !formData.code.trim()) {
        setError('Name and code are required');
        return;
      }

      const newCode: CustomCode = {
        id: selectedCode?.id || `code_${Date.now()}`,
        name: formData.name,
        type: formData.type,
        code: formData.code,
        enabled: formData.enabled,
        position: formData.position,
        created_at: selectedCode?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Update the local state
      if (selectedCode) {
        setCustomCodes(codes => codes.map(code =>
          code.id === selectedCode.id ? newCode : code
        ));
      } else {
        setCustomCodes(codes => [...codes, newCode]);
      }

      // In a real implementation, this would save to the database
      // await clientPortalService.saveCustomCode(portalId, newCode);

      setIsEditing(false);
      setSelectedCode(newCode);
      setFormData({
        name: '',
        type: 'css',
        code: '',
        enabled: true,
        position: 'head'
      });
    } catch (err) {
      setError('Failed to save custom code');
      console.error(err);
    }
  };

  const handleEdit = (code: CustomCode) => {
    setSelectedCode(code);
    setFormData({
      name: code.name,
      type: code.type,
      code: code.code,
      enabled: code.enabled,
      position: code.position
    });
    setIsEditing(true);
  };

  const handleDelete = async (codeId: string) => {
    if (!window.confirm('Are you sure you want to delete this custom code?')) return;

    try {
      setCustomCodes(codes => codes.filter(code => code.id !== codeId));
      if (selectedCode?.id === codeId) {
        setSelectedCode(null);
      }
      // In a real implementation: await clientPortalService.deleteCustomCode(portalId, codeId);
    } catch (err) {
      setError('Failed to delete custom code');
      console.error(err);
    }
  };

  const toggleEnabled = async (codeId: string) => {
    try {
      setCustomCodes(codes => codes.map(code =>
        code.id === codeId ? { ...code, enabled: !code.enabled } : code
      ));
      // In a real implementation: await clientPortalService.toggleCustomCode(portalId, codeId);
    } catch (err) {
      setError('Failed to toggle custom code');
      console.error(err);
    }
  };

  const exportCode = () => {
    if (!selectedCode) return;

    const dataStr = JSON.stringify(selectedCode, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${selectedCode.name.toLowerCase().replace(/\s+/g, '-')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setFormData({
          name: imported.name || '',
          type: imported.type || 'css',
          code: imported.code || '',
          enabled: imported.enabled !== false,
          position: imported.position || 'head'
        });
        setIsEditing(true);
        setSelectedCode(null);
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const cssTemplates = [
    {
      name: 'Custom Theme Colors',
      code: `:root {
  --brand-primary: #your-color;
  --brand-secondary: #your-color;
  --brand-accent: #your-color;
}

.portal-header { background: var(--brand-primary); }
.widget { border-color: var(--brand-accent); }`
    },
    {
      name: 'Custom Fonts',
      code: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body, .portal-content {
  font-family: 'Inter', sans-serif;
}

.portal-title {
  font-weight: 600;
  letter-spacing: -0.025em;
}`
    }
  ];

  const jsTemplates = [
    {
      name: 'Google Analytics',
      code: `// Replace UA-XXXXXXXX-X with your tracking ID
gtag('config', 'UA-XXXXXXXX-X');

// Track custom portal events
window.addEventListener('portal-event', function(e) {
  gtag('event', e.detail.action, {
    event_category: 'Portal',
    event_label: e.detail.label
  });
});`
    },
    {
      name: 'Custom Portal Behavior',
      code: `// Add custom interactivity
document.addEventListener('DOMContentLoaded', function() {
  // Custom welcome message
  console.log('Welcome to your custom portal!');

  // Add click tracking to widgets
  document.querySelectorAll('.widget').forEach(widget => {
    widget.addEventListener('click', function() {
      // Custom tracking logic
    });
  });
});`
    }
  ];

  const filteredCodes = customCodes.filter(code => code.type === activeTab);
  const templates = activeTab === 'css' ? cssTemplates : jsTemplates;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading custom code editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Code className="h-6 w-6" />
              Custom Code Editor
            </h2>
            <p className="text-gray-600 mt-1">Add custom CSS and JavaScript to your portal</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-r flex flex-col">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('css')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'css'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Paintbrush className="h-4 w-4 inline mr-2" />
                CSS
              </button>
              <button
                onClick={() => setActiveTab('javascript')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'javascript'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code className="h-4 w-4 inline mr-2" />
                JavaScript
              </button>
            </div>

            {/* Code List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Custom Code</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setSelectedCode(null);
                      setFormData({
                        name: '',
                        type: activeTab,
                        code: '',
                        enabled: true,
                        position: 'head'
                      });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + New
                  </button>
                  <label className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer">
                    <Upload className="h-4 w-4 inline mr-1" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={importCode}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                {filteredCodes.map(code => (
                  <div
                    key={code.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCode?.id === code.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCode(code)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-gray-900">{code.name}</h4>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            code.enabled ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        <span className="text-xs text-gray-500 uppercase">{code.position}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {code.code.slice(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>

              {/* Templates */}
              <div className="mt-8">
                <h3 className="font-medium text-gray-900 mb-4">Templates</h3>
                <div className="space-y-2">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          name: template.name,
                          code: template.code
                        }));
                        setIsEditing(true);
                        setSelectedCode(null);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-dashed border-gray-300 hover:border-blue-500 transition-colors"
                    >
                      <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">Click to use template</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {isEditing ? (
              // Edit Mode
              <div className="flex-1 flex flex-col p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {selectedCode ? 'Edit' : 'New'} {formData.type.toUpperCase()} Code
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter code name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="head">Head (Recommended for CSS)</option>
                      <option value="body-start">Body Start</option>
                      <option value="body-end">Body End (Recommended for JS)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enable this code</span>
                  </label>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.type.toUpperCase()} Code
                  </label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full h-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                    placeholder={`Enter your ${formData.type} code here...`}
                  />
                </div>
              </div>
            ) : selectedCode ? (
              // View Mode
              <div className="flex-1 flex flex-col p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedCode.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${selectedCode.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {selectedCode.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span>Position: {selectedCode.position}</span>
                      <span>Type: {selectedCode.type.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleEnabled(selectedCode.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedCode.enabled
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {selectedCode.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={exportCode}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                    <button
                      onClick={() => handleEdit(selectedCode)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedCode.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm font-mono overflow-auto h-full">
                    <code>{selectedCode.code}</code>
                  </pre>
                </div>
              </div>
            ) : (
              // No selection
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No code selected</p>
                  <p>Select a custom code from the sidebar or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};