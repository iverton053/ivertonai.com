import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Send,
  Users,
  TrendingUp,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Bell,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target,
  Mail,
  MessageSquare,
  Phone,
  Star,
  Filter,
  Download,
  X,
  ExternalLink,
  Copy,
  Eye,
  Database,
  Zap,
  UserPlus,
  DollarSign,
  TrendingDown,
  Activity,
  RefreshCw,
  Link2,
  FileOutput,
  Bot,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Workflow
} from 'lucide-react';
import { EnhancedBadge, StatusIndicator, PriorityIndicator } from '../ui/EnhancedVisualHierarchy';

interface CheckInTemplate {
  id: string;
  name: string;
  description: string;
  type: 'satisfaction' | 'feedback' | 'status' | 'follow-up';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  questions: Array<{
    id: string;
    question: string;
    type: 'rating' | 'text' | 'multiple-choice' | 'yes-no';
    required: boolean;
    options?: string[];
  }>;
  targetAudience: 'all-clients' | 'active-clients' | 'new-clients' | 'high-value' | 'custom';
  isActive: boolean;
  lastSent?: Date;
  nextScheduled?: Date;
  responseRate: number;
  averageRating?: number;
}

interface CheckInResponse {
  id: string;
  templateId: string;
  clientId: string;
  clientName: string;
  sentDate: Date;
  respondedDate?: Date;
  status: 'sent' | 'opened' | 'completed' | 'expired';
  responses?: Array<{
    questionId: string;
    answer: string | number;
  }>;
  overallRating?: number;
  crmData?: {
    leadScore: number;
    accountValue: number;
    nextFollowUp?: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tags: string[];
    lastActivity?: Date;
    salesStage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  };
}

interface CRMIntegration {
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'custom';
  isConnected: boolean;
  lastSync?: Date;
  syncFrequency: 'real-time' | 'hourly' | 'daily';
  clientCount: number;
  leadsSynced: number;
  automatedActions: {
    createLeads: boolean;
    updateContacts: boolean;
    logActivities: boolean;
    triggerWorkflows: boolean;
  };
}

interface AutomatedCheckInsProps {
  onCheckinChange: (count: number) => void;
}

const AutomatedCheckIns: React.FC<AutomatedCheckInsProps> = ({ onCheckinChange }) => {
  const [templates, setTemplates] = useState<CheckInTemplate[]>([]);
  const [responses, setResponses] = useState<CheckInResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'responses' | 'analytics' | 'crm'>('templates');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CheckInTemplate | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [crmIntegration, setCrmIntegration] = useState<CRMIntegration>({
    provider: 'salesforce',
    isConnected: true,
    lastSync: new Date(Date.now() - 30 * 60 * 1000),
    syncFrequency: 'real-time',
    clientCount: 156,
    leadsSynced: 89,
    automatedActions: {
      createLeads: true,
      updateContacts: true,
      logActivities: true,
      triggerWorkflows: false
    }
  });
  const [showCrmSettings, setShowCrmSettings] = useState(false);
  const [leadScoreFilter, setLeadScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: 'satisfaction' as const,
    frequency: 'monthly' as const,
    targetAudience: 'all-clients' as const,
    questions: [
      {
        id: 'q1',
        question: '',
        type: 'rating' as const,
        required: true,
        options: []
      }
    ]
  });

  // Mock data
  useEffect(() => {
    const mockTemplates: CheckInTemplate[] = [
      {
        id: '1',
        name: 'Monthly Satisfaction Survey',
        description: 'Comprehensive monthly satisfaction check-in with all active clients',
        type: 'satisfaction',
        frequency: 'monthly',
        questions: [
          {
            id: 'q1',
            question: 'How satisfied are you with our services this month?',
            type: 'rating',
            required: true
          },
          {
            id: 'q2',
            question: 'What could we improve?',
            type: 'text',
            required: false
          },
          {
            id: 'q3',
            question: 'Would you recommend our services?',
            type: 'yes-no',
            required: true
          }
        ],
        targetAudience: 'active-clients',
        isActive: true,
        lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextScheduled: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        responseRate: 87,
        averageRating: 4.6
      },
      {
        id: '2',
        name: 'Weekly Status Update',
        description: 'Quick weekly check-in for project status and immediate needs',
        type: 'status',
        frequency: 'weekly',
        questions: [
          {
            id: 'q1',
            question: 'How are your current projects progressing?',
            type: 'multiple-choice',
            required: true,
            options: ['Ahead of schedule', 'On track', 'Slightly behind', 'Need assistance']
          },
          {
            id: 'q2',
            question: 'Any immediate concerns or blockers?',
            type: 'text',
            required: false
          }
        ],
        targetAudience: 'active-clients',
        isActive: true,
        lastSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextScheduled: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        responseRate: 76,
        averageRating: 4.2
      },
      {
        id: '3',
        name: 'New Client Onboarding Follow-up',
        description: 'Follow-up check-in for clients in their first 30 days',
        type: 'follow-up',
        frequency: 'weekly',
        questions: [
          {
            id: 'q1',
            question: 'How has your onboarding experience been so far?',
            type: 'rating',
            required: true
          },
          {
            id: 'q2',
            question: 'Is there anything you need help understanding?',
            type: 'text',
            required: false
          },
          {
            id: 'q3',
            question: 'Do you feel supported by our team?',
            type: 'yes-no',
            required: true
          }
        ],
        targetAudience: 'new-clients',
        isActive: true,
        lastSent: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        nextScheduled: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        responseRate: 92,
        averageRating: 4.8
      }
    ];

    const mockResponses: CheckInResponse[] = [
      {
        id: 'r1',
        templateId: '1',
        clientId: 'c1',
        clientName: 'TechCorp Solutions',
        sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        respondedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'completed',
        overallRating: 5,
        responses: [
          { questionId: 'q1', answer: 5 },
          { questionId: 'q2', answer: 'Everything has been great!' },
          { questionId: 'q3', answer: 'Yes' }
        ],
        crmData: {
          leadScore: 95,
          accountValue: 150000,
          nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'high',
          tags: ['enterprise', 'high-value', 'long-term'],
          lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
          salesStage: 'proposal'
        }
      },
      {
        id: 'r2',
        templateId: '2',
        clientId: 'c2',
        clientName: 'RetailPlus Inc',
        sentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'sent',
        crmData: {
          leadScore: 72,
          accountValue: 85000,
          priority: 'medium',
          tags: ['retail', 'growing'],
          lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
          salesStage: 'qualified'
        }
      },
      {
        id: 'r3',
        templateId: '1',
        clientId: 'c3',
        clientName: 'StartupX',
        sentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        respondedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'completed',
        overallRating: 4,
        responses: [
          { questionId: 'q1', answer: 4 },
          { questionId: 'q2', answer: 'Could use more frequent updates' },
          { questionId: 'q3', answer: 'Yes' }
        ],
        crmData: {
          leadScore: 88,
          accountValue: 45000,
          nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          tags: ['startup', 'tech'],
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
          salesStage: 'negotiation'
        }
      }
    ];

    setTemplates(mockTemplates);
    setResponses(mockResponses);
    
    // Calculate pending check-ins
    const pendingCount = mockTemplates.filter(t => t.isActive).length;
    onCheckinChange(pendingCount);
  }, [onCheckinChange]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'satisfaction': return 'purple';
      case 'feedback': return 'blue';
      case 'status': return 'green';
      case 'follow-up': return 'orange';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'satisfaction': return <Star className="w-4 h-4" />;
      case 'feedback': return <MessageSquare className="w-4 h-4" />;
      case 'status': return <CheckCircle className="w-4 h-4" />;
      case 'follow-up': return <Phone className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'sent': return 'warning';
      case 'opened': return 'info';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (filterType === 'all') return true;
    if (filterType === 'active') return template.isActive;
    if (filterType === 'inactive') return !template.isActive;
    return template.type === filterType;
  });

  const filteredResponses = responses.filter(response => {
    if (filterType === 'all') return true;
    return response.status === filterType;
  });

  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isActive: !template.isActive }
        : template
    ));
  };

  const calculateOverallStats = () => {
    const totalTemplates = templates.length;
    const activeTemplates = templates.filter(t => t.isActive).length;
    const totalResponses = responses.length;
    const completedResponses = responses.filter(r => r.status === 'completed').length;
    const averageResponseRate = templates.reduce((sum, t) => sum + t.responseRate, 0) / templates.length || 0;
    const averageRating = templates
      .filter(t => t.averageRating)
      .reduce((sum, t) => sum + t.averageRating!, 0) / templates.filter(t => t.averageRating).length || 0;

    return {
      totalTemplates,
      activeTemplates,
      totalResponses,
      completedResponses,
      averageResponseRate,
      averageRating
    };
  };

  const stats = calculateOverallStats();

  // CRM Utility Functions
  const handleCrmSync = async () => {
    setCrmIntegration(prev => ({ ...prev, lastSync: new Date() }));
    alert(`Syncing with ${crmIntegration.provider}...\nSynced ${crmIntegration.clientCount} contacts and ${crmIntegration.leadsSynced} leads.`);
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getSalesStageColor = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'gray';
      case 'qualified': return 'blue';
      case 'proposal': return 'purple';
      case 'negotiation': return 'orange';
      case 'closed-won': return 'green';
      case 'closed-lost': return 'red';
      default: return 'gray';
    }
  };

  const filteredResponsesByCRM = responses.filter(response => {
    if (leadScoreFilter === 'all') return true;
    if (!response.crmData) return false;

    switch (leadScoreFilter) {
      case 'high': return response.crmData.leadScore >= 80;
      case 'medium': return response.crmData.leadScore >= 50 && response.crmData.leadScore < 80;
      case 'low': return response.crmData.leadScore < 50;
      default: return true;
    }
  });

  const triggerAutomatedFollowUp = (clientId: string, clientName: string) => {
    alert(`Automated follow-up triggered for ${clientName}:\n\n• Email sequence started\n• CRM task created\n• Next check-in scheduled\n• Account manager notified`);
  };

  const calculateCrmMetrics = () => {
    const responsesWithCrm = responses.filter(r => r.crmData);
    const totalValue = responsesWithCrm.reduce((sum, r) => sum + (r.crmData?.accountValue || 0), 0);
    const averageLeadScore = responsesWithCrm.reduce((sum, r) => sum + (r.crmData?.leadScore || 0), 0) / responsesWithCrm.length || 0;
    const highPriorityLeads = responsesWithCrm.filter(r => r.crmData?.priority === 'high' || r.crmData?.priority === 'urgent').length;

    return {
      totalValue,
      averageLeadScore,
      highPriorityLeads,
      totalLeads: responsesWithCrm.length
    };
  };

  const crmMetrics = calculateCrmMetrics();

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.description) {
      alert('Please fill in required fields');
      return;
    }

    if (newTemplate.questions.some(q => !q.question)) {
      alert('Please fill in all questions');
      return;
    }

    const template: CheckInTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      type: newTemplate.type,
      frequency: newTemplate.frequency,
      questions: newTemplate.questions,
      targetAudience: newTemplate.targetAudience,
      isActive: true,
      nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
      responseRate: 0,
      averageRating: newTemplate.questions.some(q => q.type === 'rating') ? 0 : undefined
    };

    setTemplates(prev => [...prev, template]);
    onCheckinChange(templates.filter(t => t.isActive).length + 1);
    
    // Reset form
    setNewTemplate({
      name: '',
      description: '',
      type: 'satisfaction',
      frequency: 'monthly',
      targetAudience: 'all-clients',
      questions: [
        {
          id: 'q1',
          question: '',
          type: 'rating',
          required: true,
          options: []
        }
      ]
    });
    
    setShowCreateModal(false);
    alert('Template created successfully!');
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `q${newTemplate.questions.length + 1}`,
      question: '',
      type: 'text' as const,
      required: false,
      options: []
    };
    setNewTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setNewTemplate(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuestion = (index: number) => {
    if (newTemplate.questions.length > 1) {
      setNewTemplate(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-effect rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <EnhancedBadge variant="purple" size="sm">{stats.activeTemplates}</EnhancedBadge>
          </div>
          <h3 className="text-lg font-semibold text-white">{stats.totalTemplates}</h3>
          <p className="text-gray-400 text-sm">Total Templates</p>
        </div>

        <div className="glass-effect rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Send className="w-5 h-5 text-blue-400" />
            <StatusIndicator status="active" showIcon={false} size="sm" />
          </div>
          <h3 className="text-lg font-semibold text-white">{stats.totalResponses}</h3>
          <p className="text-gray-400 text-sm">Sent This Month</p>
        </div>

        <div className="glass-effect rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <EnhancedBadge variant="success" size="sm">{Math.round(stats.averageResponseRate)}%</EnhancedBadge>
          </div>
          <h3 className="text-lg font-semibold text-white">{stats.completedResponses}</h3>
          <p className="text-gray-400 text-sm">Responses Received</p>
        </div>

        <div className="glass-effect rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <EnhancedBadge variant="warning" size="sm">{stats.averageRating.toFixed(1)}</EnhancedBadge>
          </div>
          <h3 className="text-lg font-semibold text-white">{stats.averageRating.toFixed(1)}</h3>
          <p className="text-gray-400 text-sm">Average Rating</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {[
            { id: 'templates', label: 'Templates', icon: Settings },
            { id: 'responses', label: 'Responses', icon: MessageSquare },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'crm', label: 'CRM Integration', icon: Database }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="all">All</option>
            {activeTab === 'templates' && (
              <>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="satisfaction">Satisfaction</option>
                <option value="feedback">Feedback</option>
                <option value="status">Status</option>
                <option value="follow-up">Follow-up</option>
              </>
            )}
            {activeTab === 'responses' && (
              <>
                <option value="completed">Completed</option>
                <option value="sent">Sent</option>
                <option value="opened">Opened</option>
                <option value="expired">Expired</option>
              </>
            )}
          </select>

          {activeTab === 'templates' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg bg-${getTypeColor(template.type)}-500/20 text-${getTypeColor(template.type)}-400`}>
                          {getTypeIcon(template.type)}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                            <EnhancedBadge 
                              variant={getTypeColor(template.type)} 
                              size="sm"
                            >
                              {template.type}
                            </EnhancedBadge>
                            <StatusIndicator 
                              status={template.isActive ? 'active' : 'inactive'} 
                              size="sm"
                            />
                          </div>
                          
                          <p className="text-gray-400 text-sm">{template.description}</p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Every {template.frequency}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{template.targetAudience.replace('-', ' ')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{template.responseRate}% response rate</span>
                            </div>
                            {template.averageRating && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4" />
                                <span>{template.averageRating}/5 avg rating</span>
                              </div>
                            )}
                          </div>

                          {template.nextScheduled && (
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">
                                Next scheduled: {formatDate(template.nextScheduled)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTemplateStatus(template.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          template.isActive
                            ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10'
                            : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                        }`}
                        title={template.isActive ? 'Pause template' : 'Activate template'}
                      >
                        {template.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTemplate(template)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/200/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="space-y-4">
              {filteredResponses.map((response) => (
                <motion.div
                  key={response.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{response.clientName}</h3>
                        <EnhancedBadge
                          variant={getStatusColor(response.status)}
                          size="sm"
                        >
                          {response.status}
                        </EnhancedBadge>
                        {response.overallRating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-gray-300">{response.overallRating}/5</span>
                          </div>
                        )}
                        {response.crmData && (
                          <>
                            <div className="flex items-center space-x-1">
                              <Target className="w-4 h-4 text-purple-400" />
                              <span className={`text-sm font-medium ${getLeadScoreColor(response.crmData.leadScore)}`}>
                                {response.crmData.leadScore}
                              </span>
                            </div>
                            <EnhancedBadge variant={getPriorityColor(response.crmData.priority)} size="sm">
                              {response.crmData.priority}
                            </EnhancedBadge>
                            <EnhancedBadge variant={getSalesStageColor(response.crmData.salesStage)} size="sm">
                              {response.crmData.salesStage}
                            </EnhancedBadge>
                          </>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>Sent: {formatDate(response.sentDate)}</span>
                            {response.respondedDate && (
                              <span>Responded: {formatDate(response.respondedDate)}</span>
                            )}
                          </div>
                          {response.crmData && (
                            <div className="flex items-center space-x-1 text-sm">
                              <DollarSign className="w-3 h-3 text-green-400" />
                              <span className="text-green-400 font-medium">
                                ${response.crmData.accountValue.toLocaleString()}
                              </span>
                              <span className="text-gray-400">account value</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          {response.crmData?.tags && (
                            <div className="flex flex-wrap gap-1">
                              {response.crmData.tags.map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {response.crmData?.nextFollowUp && (
                            <div className="flex items-center space-x-1 text-sm text-orange-400">
                              <Calendar className="w-3 h-3" />
                              <span>Follow up: {formatDate(response.crmData.nextFollowUp)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {response.responses && (
                        <div className="space-y-2">
                          {response.responses.slice(0, 2).map((resp, index) => (
                            <div key={index} className="text-sm">
                              <span className="text-gray-400">Response {index + 1}: </span>
                              <span className="text-white">{resp.answer}</span>
                            </div>
                          ))}
                          {response.responses.length > 2 && (
                            <span className="text-sm text-purple-400 cursor-pointer hover:text-purple-300">
                              View all {response.responses.length} responses
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CRM Actions */}
                    {response.crmData && (
                      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-600/30">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => triggerAutomatedFollowUp(response.clientId, response.clientName)}
                          className="flex items-center space-x-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                        >
                          <Bot className="w-3 h-3" />
                          <span>Auto Follow-up</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => alert(`Updating ${response.clientName} in ${crmIntegration.provider}...`)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Update CRM</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => alert(`Creating task for ${response.clientName}:\n\n• Follow up on feedback\n• Due: ${response.crmData?.nextFollowUp?.toDateString()}\n• Priority: ${response.crmData?.priority}`)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Create Task</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Response Rate Trends</h3>
                <div className="h-48 bg-gray-700/30 rounded-lg p-4">
                  <div className="h-full flex items-end space-x-2">
                    {templates.map((template, index) => {
                      const height = Math.max((template.responseRate / 100) * 100, 10);
                      return (
                        <div key={template.id} className="flex-1 flex flex-col items-center">
                          <div 
                            className={`w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all duration-1000 delay-${index * 100} relative group cursor-pointer`}
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {template.responseRate}%
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2 text-center">
                            {template.name.split(' ')[0]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Satisfaction Scores</h3>
                <div className="space-y-4">
                  {templates.filter(t => t.averageRating).map((template) => (
                    <div key={template.id} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{template.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (template.averageRating || 0) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-white font-medium">
                          {template.averageRating?.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="space-y-6">
              {/* CRM Status Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Connection Status */}
                <div className="glass-effect rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">CRM Connection</h3>
                    <StatusIndicator
                      status={crmIntegration.isConnected ? 'active' : 'inactive'}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium capitalize">{crmIntegration.provider}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Last sync: {formatDate(crmIntegration.lastSync!)}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCrmSync}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Sync Now</span>
                    </motion.button>
                  </div>
                </div>

                {/* CRM Metrics */}
                <div className="glass-effect rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">CRM Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Total Contacts</span>
                      <span className="text-white font-medium">{crmIntegration.clientCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Leads Synced</span>
                      <span className="text-white font-medium">{crmIntegration.leadsSynced}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Avg Lead Score</span>
                      <span className={`font-medium ${getLeadScoreColor(crmMetrics.averageLeadScore)}`}>
                        {Math.round(crmMetrics.averageLeadScore)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">High Priority</span>
                      <EnhancedBadge variant="orange" size="sm">{crmMetrics.highPriorityLeads}</EnhancedBadge>
                    </div>
                  </div>
                </div>

                {/* Pipeline Value */}
                <div className="glass-effect rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Pipeline Value</h3>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        ${crmMetrics.totalValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Total Pipeline</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Avg Deal Size</span>
                        <span className="text-white">
                          ${Math.round(crmMetrics.totalValue / crmMetrics.totalLeads).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Active Deals</span>
                        <span className="text-white">{crmMetrics.totalLeads}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automation Settings */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Automation Settings</h3>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCrmSettings(!showCrmSettings)}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configure</span>
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(crmIntegration.automatedActions).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          key === 'createLeads' ? 'bg-green-500/20 text-green-400' :
                          key === 'updateContacts' ? 'bg-blue-500/20 text-blue-400' :
                          key === 'logActivities' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {key === 'createLeads' && <UserPlus className="w-4 h-4" />}
                          {key === 'updateContacts' && <RefreshCw className="w-4 h-4" />}
                          {key === 'logActivities' && <Activity className="w-4 h-4" />}
                          {key === 'triggerWorkflows' && <Workflow className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-white font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {key === 'createLeads' && 'Auto-create leads from responses'}
                            {key === 'updateContacts' && 'Update contact info automatically'}
                            {key === 'logActivities' && 'Log check-in activities'}
                            {key === 'triggerWorkflows' && 'Trigger automated workflows'}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCrmIntegration(prev => ({
                            ...prev,
                            automatedActions: {
                              ...prev.automatedActions,
                              [key]: !enabled
                            }
                          }));
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          enabled
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-gray-600/50 text-gray-400 hover:bg-gray-600/70'
                        }`}
                      >
                        {enabled ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Scoring and Management */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Lead Management</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={leadScoreFilter}
                      onChange={(e) => setLeadScoreFilter(e.target.value as any)}
                      className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="all">All Leads</option>
                      <option value="high">High Score (80+)</option>
                      <option value="medium">Medium Score (50-79)</option>
                      <option value="low">Low Score (&lt;50)</option>
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => alert('Exporting lead data to CSV...')}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      <FileOutput className="w-4 h-4" />
                      <span>Export</span>
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredResponsesByCRM.slice(0, 5).map((response) => (
                    <div key={response.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
                          {response.clientName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{response.clientName}</h4>
                          <div className="flex items-center space-x-3 text-sm">
                            <span className={`${getLeadScoreColor(response.crmData!.leadScore)}`}>
                              Score: {response.crmData!.leadScore}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-green-400">
                              ${response.crmData!.accountValue.toLocaleString()}
                            </span>
                            <span className="text-gray-400">•</span>
                            <EnhancedBadge variant={getSalesStageColor(response.crmData!.salesStage)} size="sm">
                              {response.crmData!.salesStage}
                            </EnhancedBadge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {response.overallRating && response.overallRating >= 4 ? (
                          <ThumbsUp className="w-4 h-4 text-green-400" title="Positive feedback" />
                        ) : response.overallRating && response.overallRating <= 2 ? (
                          <ThumbsDown className="w-4 h-4 text-red-400" title="Negative feedback" />
                        ) : null}

                        {response.crmData!.priority === 'urgent' && (
                          <AlertTriangle className="w-4 h-4 text-red-400" title="Urgent priority" />
                        )}

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => alert(`Viewing full CRM profile for ${response.clientName}`)}
                          className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                          title="View CRM Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Create Template Modal Placeholder */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-xl p-6 border border-white/10 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Template Name *</label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                    <textarea
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the purpose of this check-in template"
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                      <select
                        value={newTemplate.type}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="satisfaction">Satisfaction</option>
                        <option value="feedback">Feedback</option>
                        <option value="status">Status</option>
                        <option value="follow-up">Follow-up</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                      <select
                        value={newTemplate.frequency}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, frequency: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                    <select
                      value={newTemplate.targetAudience}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="all-clients">All Clients</option>
                      <option value="active-clients">Active Clients</option>
                      <option value="new-clients">New Clients</option>
                      <option value="high-value">High-Value Clients</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-300">Questions *</label>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addQuestion}
                        className="flex items-center space-x-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Question</span>
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      {newTemplate.questions.map((question, index) => (
                        <div key={question.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-300">Question {index + 1}</span>
                            {newTemplate.questions.length > 1 && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => removeQuestion(index)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/200/10 rounded"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                              placeholder="Enter your question"
                              className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm"
                            />
                            
                            <div className="grid grid-cols-2 gap-3">
                              <select
                                value={question.type}
                                onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                                className="px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                              >
                                <option value="rating">Rating (1-5)</option>
                                <option value="text">Text Response</option>
                                <option value="multiple-choice">Multiple Choice</option>
                                <option value="yes-no">Yes/No</option>
                              </select>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`required-${index}`}
                                  checked={question.required}
                                  onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                                  className="w-4 h-4 text-purple-500 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                                />
                                <label htmlFor={`required-${index}`} className="text-sm text-gray-300">
                                  Required
                                </label>
                              </div>
                            </div>

                            {question.type === 'multiple-choice' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2">Options (comma-separated)</label>
                                <input
                                  type="text"
                                  value={question.options?.join(', ') || ''}
                                  onChange={(e) => updateQuestion(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                                  placeholder="Option 1, Option 2, Option 3"
                                  className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-600">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateTemplate}
                    disabled={!newTemplate.name || !newTemplate.description || newTemplate.questions.some(q => !q.question)}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Create Template
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutomatedCheckIns;