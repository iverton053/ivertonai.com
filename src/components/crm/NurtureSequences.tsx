import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Clock, 
  Users, 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  BarChart3,
  Filter,
  Search,
  ArrowRight,
  MessageSquare,
  Phone,
  Calendar,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Settings,
  Zap,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NurtureSequence {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  createdDate: Date;
  lastModified: Date;
  enrolledContacts: number;
  totalSteps: number;
  avgConversionRate: number;
  totalRevenue: number;
  targetAudience: {
    leadScore: { min: number; max: number };
    lifecycleStage: string[];
    source: string[];
    industry: string[];
    behavior: string[];
  };
  steps: NurtureStep[];
  triggers: SequenceTrigger[];
  performance: {
    enrolled: number;
    active: number;
    completed: number;
    converted: number;
    unsubscribed: number;
    avgEngagement: number;
  };
}

interface NurtureStep {
  id: string;
  type: 'email' | 'sms' | 'call' | 'social' | 'wait' | 'condition';
  title: string;
  content?: string;
  subject?: string;
  delay: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
  conditions?: {
    type: 'engagement' | 'score_change' | 'page_visit' | 'form_submit' | 'time_based';
    value: string;
    action: 'continue' | 'skip' | 'end' | 'branch';
  };
  performance: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    converted: number;
  };
  isActive: boolean;
}

interface SequenceTrigger {
  id: string;
  name: string;
  type: 'lead_created' | 'score_threshold' | 'form_submit' | 'page_visit' | 'lifecycle_change' | 'manual';
  conditions: any;
  isActive: boolean;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  currentStep: number;
  enrolledDate: Date;
  lastEngagement: Date;
  status: 'active' | 'paused' | 'completed' | 'unsubscribed';
  score: number;
}

const NurtureSequences: React.FC = () => {
  const [sequences, setSequences] = useState<NurtureSequence[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<NurtureSequence | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'builder' | 'analytics' | 'contacts'>('overview');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setSequences([
      {
        id: '1',
        name: 'New Lead Welcome Series',
        description: 'Comprehensive onboarding sequence for new leads',
        status: 'active',
        createdDate: new Date('2024-01-10'),
        lastModified: new Date('2024-01-20'),
        enrolledContacts: 342,
        totalSteps: 7,
        avgConversionRate: 18.5,
        totalRevenue: 45200,
        targetAudience: {
          leadScore: { min: 50, max: 100 },
          lifecycleStage: ['lead', 'marketing_qualified_lead'],
          source: ['website', 'social_media'],
          industry: ['technology', 'finance'],
          behavior: ['downloaded_content', 'visited_pricing']
        },
        steps: [
          {
            id: 'step1',
            type: 'email',
            title: 'Welcome & Introduction',
            subject: 'Welcome to our community! 🎉',
            content: 'Thank you for your interest in our solution...',
            delay: { value: 0, unit: 'minutes' },
            performance: { sent: 342, delivered: 338, opened: 256, clicked: 89, replied: 12, converted: 8 },
            isActive: true
          },
          {
            id: 'step2',
            type: 'wait',
            title: 'Wait 2 Days',
            delay: { value: 2, unit: 'days' },
            performance: { sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, converted: 0 },
            isActive: true
          },
          {
            id: 'step3',
            type: 'email',
            title: 'Educational Content',
            subject: 'How to maximize your ROI',
            content: 'Here are the key strategies...',
            delay: { value: 0, unit: 'minutes' },
            performance: { sent: 320, delivered: 318, opened: 241, clicked: 76, replied: 8, converted: 15 },
            isActive: true
          }
        ],
        triggers: [
          {
            id: 'trigger1',
            name: 'New Lead Created',
            type: 'lead_created',
            conditions: { source: ['website', 'landing_page'], score: { min: 50 } },
            isActive: true
          }
        ],
        performance: {
          enrolled: 342,
          active: 156,
          completed: 78,
          converted: 23,
          unsubscribed: 12,
          avgEngagement: 24.3
        }
      },
      {
        id: '2',
        name: 'High-Value Prospect Nurture',
        description: 'Targeted sequence for enterprise prospects',
        status: 'active',
        createdDate: new Date('2024-01-05'),
        lastModified: new Date('2024-01-18'),
        enrolledContacts: 89,
        totalSteps: 12,
        avgConversionRate: 35.8,
        totalRevenue: 128500,
        targetAudience: {
          leadScore: { min: 80, max: 100 },
          lifecycleStage: ['sales_qualified_lead'],
          source: ['referral', 'partner'],
          industry: ['enterprise', 'finance'],
          behavior: ['requested_demo', 'spoke_with_sales']
        },
        steps: [
          {
            id: 'step1',
            type: 'email',
            title: 'Personal Introduction',
            subject: 'Personalized solution for {{company}}',
            content: 'Based on your company profile...',
            delay: { value: 0, unit: 'minutes' },
            performance: { sent: 89, delivered: 89, opened: 78, clicked: 45, replied: 23, converted: 12 },
            isActive: true
          }
        ],
        triggers: [
          {
            id: 'trigger2',
            name: 'High Score Achieved',
            type: 'score_threshold',
            conditions: { threshold: 80, change: 'increase' },
            isActive: true
          }
        ],
        performance: {
          enrolled: 89,
          active: 45,
          completed: 31,
          converted: 18,
          unsubscribed: 2,
          avgEngagement: 42.1
        }
      },
      {
        id: '3',
        name: 'Re-engagement Campaign',
        description: 'Win back cold leads and inactive contacts',
        status: 'paused',
        createdDate: new Date('2023-12-15'),
        lastModified: new Date('2024-01-15'),
        enrolledContacts: 156,
        totalSteps: 5,
        avgConversionRate: 8.9,
        totalRevenue: 12300,
        targetAudience: {
          leadScore: { min: 0, max: 40 },
          lifecycleStage: ['lead'],
          source: [],
          industry: [],
          behavior: ['inactive_30_days', 'low_engagement']
        },
        steps: [],
        triggers: [
          {
            id: 'trigger3',
            name: 'Inactive Contact',
            type: 'lifecycle_change',
            conditions: { from: 'active', to: 'inactive', days: 30 },
            isActive: false
          }
        ],
        performance: {
          enrolled: 156,
          active: 0,
          completed: 134,
          converted: 14,
          unsubscribed: 28,
          avgEngagement: 12.7
        }
      }
    ]);
  }, []);

  const filteredSequences = sequences.filter(seq => {
    const matchesSearch = seq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seq.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || seq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStats = {
    totalSequences: sequences.length,
    activeSequences: sequences.filter(s => s.status === 'active').length,
    totalEnrolled: sequences.reduce((sum, s) => sum + s.enrolledContacts, 0),
    avgConversionRate: sequences.reduce((sum, s) => sum + s.avgConversionRate, 0) / sequences.length,
    totalRevenue: sequences.reduce((sum, s) => sum + s.totalRevenue, 0)
  };

  const handleSequenceAction = (sequenceId: string, action: 'pause' | 'activate' | 'duplicate' | 'delete') => {
    setSequences(prev => prev.map(seq => {
      if (seq.id === sequenceId) {
        switch (action) {
          case 'pause':
            return { ...seq, status: 'paused' as const };
          case 'activate':
            return { ...seq, status: 'active' as const };
          case 'duplicate':
            // In real app, would create new sequence
            return seq;
          case 'delete':
            // In real app, would handle deletion
            return seq;
          default:
            return seq;
        }
      }
      return seq;
    }));
  };

  const SequenceCard: React.FC<{ sequence: NurtureSequence }> = ({ sequence }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{sequence.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              sequence.status === 'active' ? 'bg-green-100 text-green-800' :
              sequence.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {sequence.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{sequence.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{sequence.enrolledContacts} enrolled</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>{sequence.totalSteps} steps</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{sequence.avgConversionRate}% conversion</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedSequence(sequence)}
            className="text-blue-600 hover:text-blue-700 p-1 rounded"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-700 p-1 rounded">
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleSequenceAction(sequence.id, sequence.status === 'active' ? 'pause' : 'activate')}
            className={`p-1 rounded ${
              sequence.status === 'active' 
                ? 'text-yellow-600 hover:text-yellow-700' 
                : 'text-green-600 hover:text-green-700'
            }`}
          >
            {sequence.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500">Active</div>
          <div className="text-lg font-semibold text-blue-600">{sequence.performance.active}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Completed</div>
          <div className="text-lg font-semibold text-green-600">{sequence.performance.completed}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Converted</div>
          <div className="text-lg font-semibold text-purple-600">{sequence.performance.converted}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Revenue</div>
          <div className="text-lg font-semibold text-white">${sequence.totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-xs text-gray-500">
          Modified {sequence.lastModified.toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleSequenceAction(sequence.id, 'duplicate')}
            className="text-gray-600 hover:text-gray-700 p-1 rounded"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );

  const SequenceBuilder: React.FC<{ sequence: NurtureSequence }> = ({ sequence }) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-white">{sequence.name}</h3>
          <p className="text-gray-600">{sequence.description}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Step
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Test Sequence
          </button>
        </div>
      </div>

      <div className="glass-effect rounded-lg p-6 shadow-sm border">
        <h4 className="text-lg font-semibold mb-4">Sequence Flow</h4>
        <div className="space-y-4">
          {sequence.steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.type === 'email' ? 'bg-blue-100 text-blue-600' :
                step.type === 'wait' ? 'bg-yellow-100 text-yellow-600' :
                step.type === 'call' ? 'bg-green-100 text-green-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {step.type === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                  {step.type === 'wait' && <Clock className="w-4 h-4 text-yellow-600" />}
                  {step.type === 'call' && <Phone className="w-4 h-4 text-green-600" />}
                  <span className="font-medium">{step.title}</span>
                  {step.subject && <span className="text-sm text-gray-500">- {step.subject}</span>}
                </div>
                
                {step.delay.value > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    Delay: {step.delay.value} {step.delay.unit}
                  </div>
                )}
                
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Sent: {step.performance.sent}</span>
                  <span>Opened: {step.performance.opened}</span>
                  <span>Clicked: {step.performance.clicked}</span>
                  <span>Converted: {step.performance.converted}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="text-blue-600 hover:text-blue-700 p-1 rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-700 p-1 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {index < sequence.steps.length - 1 && (
                <div className="absolute left-4 mt-8 w-0.5 h-6 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <h4 className="text-lg font-semibold mb-4">Target Audience</h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Lead Score Range:</span>
              <span className="ml-2 text-sm text-gray-600">
                {sequence.targetAudience.leadScore.min} - {sequence.targetAudience.leadScore.max}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Lifecycle Stages:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {sequence.targetAudience.lifecycleStage.map((stage) => (
                  <span key={stage} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {stage.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Sources:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {sequence.targetAudience.source.map((source) => (
                  <span key={source} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <h4 className="text-lg font-semibold mb-4">Triggers</h4>
          <div className="space-y-3">
            {sequence.triggers.map((trigger) => (
              <div key={trigger.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium text-white">{trigger.name}</div>
                  <div className="text-sm text-gray-500">{trigger.type.replace('_', ' ')}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trigger.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {trigger.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Nurture Sequences</h2>
          <p className="text-gray-600">Create and manage automated multi-touch sequences</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Sequence
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sequences</p>
              <p className="text-2xl font-bold text-white">{totalStats.totalSequences}</p>
            </div>
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{totalStats.activeSequences}</p>
            </div>
            <Play className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enrolled Contacts</p>
              <p className="text-2xl font-bold text-purple-600">{totalStats.totalEnrolled}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
              <p className="text-2xl font-bold text-orange-600">{totalStats.avgConversionRate.toFixed(1)}%</p>
            </div>
            <Target className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="glass-effect rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalStats.totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'builder', label: 'Builder', icon: Settings },
            { key: 'analytics', label: 'Analytics', icon: TrendingUp },
            { key: 'contacts', label: 'Contacts', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                activeView === key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-white hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search sequences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredSequences.map((sequence) => (
              <SequenceCard key={sequence.id} sequence={sequence} />
            ))}
          </motion.div>
        )}

        {activeView === 'builder' && selectedSequence && (
          <motion.div
            key="builder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SequenceBuilder sequence={selectedSequence} />
          </motion.div>
        )}

        {activeView === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="glass-effect rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Sequence Performance</h3>
              <div className="space-y-4">
                {sequences.map((seq) => (
                  <div key={seq.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{seq.name}</div>
                      <div className="text-sm text-gray-500">{seq.enrolledContacts} enrolled</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{seq.avgConversionRate}%</div>
                      <div className="text-sm text-gray-500">${seq.totalRevenue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-effect rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Open Rate</span>
                  <span className="font-semibold">73.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Click Rate</span>
                  <span className="font-semibold">28.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Response Rate</span>
                  <span className="font-semibold">12.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unsubscribe Rate</span>
                  <span className="font-semibold text-red-600">2.1%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeView === 'contacts' && (
          <motion.div
            key="contacts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-effect rounded-lg shadow-sm border overflow-hidden"
          >
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Enrolled Contacts</h3>
              <p className="text-gray-600">Contacts currently in nurture sequences</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sequence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Step
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="glass-effect divide-y divide-gray-200">
                  {/* Mock contact data would be mapped here */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      No contacts enrolled yet
                    </td>
                    <td colSpan={5}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NurtureSequences;