import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Plus,
  Trash2,
  Copy,
  Link,
  ArrowRight,
  Mail,
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  BarChart3,
  Zap,
  Clock,
  GitBranch,
  Bell,
  Eye,
  CheckCircle,
  AlertTriangle,
  Palette,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Archive,
  FileText,
  Paperclip
} from 'lucide-react';
import { WorkflowStep, TriggerType, ActionType, AutomationWorkflow } from '../../types/automation';

interface EnhancedWorkflowBuilderProps {
  workflow?: AutomationWorkflow;
  onSave: (workflow: Partial<AutomationWorkflow>) => void;
  onExecute: (workflowId: string) => void;
}

// Smart Notifications System
const SmartNotifications: React.FC<{ notifications: any[] }> = ({ notifications }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 space-y-2"
        >
          {notifications.map((notification, index) => (
            <motion.div
              key={index}
              className={`p-4 rounded-lg shadow-xl border ${
                notification.type === 'success' ? 'bg-green-600 border-green-500' :
                notification.type === 'error' ? 'bg-red-600 border-red-500' :
                notification.type === 'warning' ? 'bg-yellow-600 border-yellow-500' :
                'bg-blue-600 border-blue-500'
              } text-white max-w-sm`}
              layout
            >
              <div className="flex items-center space-x-3">
                {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                {notification.type === 'info' && <Bell className="w-5 h-5" />}
                <div className="flex-1">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm opacity-90">{notification.message}</div>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-white/70 hover:text-white"
                >
                  ×
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Progress Indicator Component
const ProgressIndicator: React.FC<{ progress: number; message: string }> = ({ progress, message }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 min-w-[300px]">
        <div className="text-center mb-4">
          <div className="text-lg font-medium text-gray-900 dark:text-white">{message}</div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-center text-sm text-gray-400 dark:text-gray-400">
          {progress}% complete
        </div>
      </div>
    </motion.div>
  );
};

// Client Notes & Memory Component
const ClientNotesPanel: React.FC<{ clientId: string; onClose: () => void }> = ({ clientId, onClose }) => {
  const [notes, setNotes] = useState([
    { id: 1, text: 'Client prefers email notifications over SMS', timestamp: '2 days ago', author: 'John Doe' },
    { id: 2, text: 'Increased budget for Q1 campaigns', timestamp: '1 week ago', author: 'Jane Smith' }
  ]);
  const [newNote, setNewNote] = useState('');

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([{ 
        id: Date.now(), 
        text: newNote, 
        timestamp: 'Just now', 
        author: 'Current User' 
      }, ...notes]);
      setNewNote('');
    }
  };

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-700 dark:border-gray-700 z-40"
    >
      <div className="p-6 border-b border-gray-700 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Client Notes</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-400">×</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {notes.map(note => (
          <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-900 dark:text-white">{note.text}</div>
            <div className="mt-2 text-xs text-gray-400 flex justify-between">
              <span>{note.author}</span>
              <span>{note.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 border-t border-gray-700 dark:border-gray-700">
        <div className="space-y-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <button
            onClick={addNote}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Add Note
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Client Asset Library Component
const AssetLibrary: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [assets] = useState([
    { id: 1, name: 'Brand Guidelines.pdf', type: 'pdf', size: '2.5MB', updated: '3 days ago' },
    { id: 2, name: 'Logo Pack.zip', type: 'zip', size: '15.2MB', updated: '1 week ago' },
    { id: 3, name: 'Campaign Assets', type: 'folder', size: '45MB', updated: '2 days ago' },
    { id: 4, name: 'Social Media Templates', type: 'folder', size: '12MB', updated: '5 days ago' }
  ]);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'zip': return <Archive className="w-5 h-5 text-yellow-500" />;
      case 'folder': return <Calendar className="w-5 h-5 text-blue-500" />;
      default: return <Paperclip className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Client Asset Library</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-400">×</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map(asset => (
            <div key={asset.id} className="p-4 border border-gray-700 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <div className="flex items-center space-x-3">
                {getAssetIcon(asset.type)}
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{asset.name}</div>
                  <div className="text-sm text-gray-400">{asset.size} • {asset.updated}</div>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 dark:border-gray-700">
          <button className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-400 rounded-lg hover:border-blue-500 hover:text-blue-500">
            + Upload New Assets
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Main Enhanced Workflow Builder Component
const EnhancedWorkflowBuilder: React.FC<EnhancedWorkflowBuilderProps> = ({ 
  workflow, 
  onSave, 
  onExecute 
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow?.steps || []);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showStepPanel, setShowStepPanel] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [progress, setProgress] = useState<{ show: boolean; progress: number; message: string }>({ 
    show: false, 
    progress: 0, 
    message: '' 
  });
  const [fieldHistory, setFieldHistory] = useState<Record<string, string[]>>({
    email_subject: ['Welcome to our platform', 'Thanks for signing up', 'Your account is ready'],
    campaign_name: ['Q1 Campaign', 'Holiday Special', 'New Product Launch']
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  const [workflowDetails, setWorkflowDetails] = useState({
    name: workflow?.name || 'New Workflow',
    description: workflow?.description || '',
    category: workflow?.category || 'mixed' as const,
    trigger: workflow?.trigger || 'manual' as TriggerType
  });

  // Smart notification system
  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const notification = { type, title, message, id: Date.now() };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Enhanced export with progress
  const exportToN8nWithProgress = useCallback(async () => {
    setProgress({ show: true, progress: 0, message: 'Preparing workflow...' });
    
    // Simulate progress steps
    const steps = [
      { progress: 20, message: 'Validating workflow structure...' },
      { progress: 40, message: 'Converting to n8n format...' },
      { progress: 60, message: 'Optimizing connections...' },
      { progress: 80, message: 'Generating JSON...' },
      { progress: 100, message: 'Export complete!' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress({ show: true, ...step });
    }

    // Generate n8n workflow
    const n8nWorkflow = {
      name: workflowDetails.name,
      nodes: steps.map((step, index) => ({
        id: step.id,
        name: step.name,
        type: step.type === 'trigger' ? 'n8n-nodes-base.webhook' : 
              step.type === 'action' ? 'n8n-nodes-base.function' :
              step.type === 'condition' ? 'n8n-nodes-base.if' :
              'n8n-nodes-base.wait',
        typeVersion: 1,
        position: [step.position.x, step.position.y],
        parameters: step.action?.parameters || step.trigger?.conditions || {}
      })),
      connections: {},
      active: true,
      settings: { executionOrder: 'v1' }
    };

    const blob = new Blob([JSON.stringify(n8nWorkflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowDetails.name.replace(/\\s+/g, '_').toLowerCase()}_n8n.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setProgress({ show: false, progress: 0, message: '' });
      addNotification('success', 'Export Complete', 'Workflow exported as n8n-compatible JSON');
    }, 1000);
  }, [workflowDetails.name, steps]);

  // Copy/Paste functionality
  const copyStepToClipboard = useCallback((step: WorkflowStep) => {
    navigator.clipboard.writeText(JSON.stringify(step, null, 2));
    addNotification('success', 'Step Copied', 'Step configuration copied to clipboard');
  }, []);

  // Smart field history
  const getFieldHistory = (fieldName: string) => {
    return fieldHistory[fieldName] || [];
  };

  const addToFieldHistory = (fieldName: string, value: string) => {
    if (value.trim()) {
      setFieldHistory(prev => ({
        ...prev,
        [fieldName]: [value, ...(prev[fieldName] || []).filter(v => v !== value).slice(0, 4)]
      }));
    }
  };

  // Dark mode toggle with smooth animation
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} transition-all duration-300`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Smart Notifications */}
        <SmartNotifications notifications={notifications} />

        {/* Progress Indicator */}
        {progress.show && (
          <ProgressIndicator progress={progress.progress} message={progress.message} />
        )}

        {/* Header with enhanced controls */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-700 dark:border-gray-700 px-6 py-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={workflowDetails.name}
                onChange={(e) => {
                  setWorkflowDetails(prev => ({ ...prev, name: e.target.value }));
                  addToFieldHistory('workflow_name', e.target.value);
                }}
                className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white transition-colors"
                list="workflow-name-history"
              />
              <datalist id="workflow-name-history">
                {getFieldHistory('workflow_name').map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-300 dark:text-blue-200 rounded-full">
                n8n Compatible
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-400 dark:text-gray-400 hover:bg-gray-800/50 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-400 dark:text-gray-400 hover:bg-gray-800/50 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Client Notes */}
              <button
                onClick={() => setShowNotesPanel(true)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Notes</span>
              </button>

              {/* Asset Library */}
              <button
                onClick={() => setShowAssetLibrary(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Archive className="w-4 h-4" />
                <span>Assets</span>
              </button>
              
              <button
                onClick={exportToN8nWithProgress}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Export to n8n</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-80px)]'}`}>
          {/* Enhanced Canvas with micro-animations */}
          <div className="flex-1 relative overflow-hidden">
            <div 
              ref={canvasRef}
              className="w-full h-full bg-gray-50 dark:bg-gray-900 relative transition-colors duration-300"
              style={{
                backgroundImage: darkMode 
                  ? `radial-gradient(circle, #374151 1px, transparent 1px)`
                  : `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}
            >
              {/* Steps with enhanced animations */}
              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  className={`absolute w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 cursor-pointer transition-all ${
                    selectedStep?.id === step.id 
                      ? 'border-blue-500 shadow-xl' 
                      : 'border-gray-700 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  style={{
                    left: step.position.x,
                    top: step.position.y
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    rotate: 0.5,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ 
                    boxShadow: selectedStep?.id === step.id 
                      ? '0 0 20px rgba(59, 130, 246, 0.5)' 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    setSelectedStep(step);
                    setShowStepPanel(true);
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">{step.name}</h4>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyStepToClipboard(step);
                          }}
                          className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-all transform hover:scale-110"
                          title="Copy step"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete step logic
                          }}
                          className="p-1 text-red-500 hover:bg-red-900/50 dark:hover:bg-red-900 rounded transition-all transform hover:scale-110"
                          title="Delete step"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Empty state with improved design */}
              {steps.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Zap className="w-20 h-20 text-gray-400 dark:text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
                      Welcome to the Enhanced Workflow Builder
                    </h3>
                    <p className="text-gray-400 dark:text-gray-400 mb-6">
                      Drag and drop components from the sidebar to create your automation workflow
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Start with Template
                      </button>
                      <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-300 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Create from Scratch
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client Notes Panel */}
        <AnimatePresence>
          {showNotesPanel && (
            <ClientNotesPanel 
              clientId="current-client" 
              onClose={() => setShowNotesPanel(false)} 
            />
          )}
        </AnimatePresence>

        {/* Asset Library Modal */}
        <AnimatePresence>
          {showAssetLibrary && (
            <AssetLibrary onClose={() => setShowAssetLibrary(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedWorkflowBuilder;