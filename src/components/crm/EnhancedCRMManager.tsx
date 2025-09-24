import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Activity,
  Target,
  TrendingUp,
  User,
  Edit,
  Trash2,
  Star,
  Clock,
  MessageSquare,
  BarChart3,
  Settings,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ExternalLink,
  UserPlus,
  Tags,
  Zap,
  GitBranch,
  Database,
  Activity as ActivityIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import PipelineManager from './PipelineManager';
import LeadEnrichment from './LeadEnrichment';
import BehavioralScoring from './BehavioralScoring';
import LeadAssignment from './LeadAssignment';
import NurtureSequences from './NurtureSequences';
import CrossPlatformRetargeting from './CrossPlatformRetargeting';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  leadScore: number;
  lifecycleStage: string;
  leadStatus: string;
  lastActivityDate?: Date;
  contactOwner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  tags: string[];
  originalSource: string;
  createdAt: Date;
  dataQuality: {
    score: number;
    completeness: number;
  };
}

interface CRMFilters {
  query: string;
  leadStatus: string;
  lifecycleStage: string;
  contactOwner: string;
  leadScoreMin: number;
  leadScoreMax: number;
  source: string;
  tags: string[];
}

const EnhancedCRMManager: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'table'>('table');
  
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showMobileDropdown && !target.closest('.mobile-dropdown-container')) {
        setShowMobileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileDropdown]);
  
  const [filters, setFilters] = useState<CRMFilters>({
    query: '',
    leadStatus: '',
    lifecycleStage: '',
    contactOwner: '',
    leadScoreMin: 0,
    leadScoreMax: 100,
    source: '',
    tags: []
  });

  const [analytics, setAnalytics] = useState({
    totalContacts: 1247,
    newThisMonth: 89,
    hotLeads: 34,
    avgLeadScore: 67,
    conversionRate: 12.4,
    byLifecycleStage: [
      { name: 'Lead', value: 450, color: '#8b5cf6' },
      { name: 'MQL', value: 280, color: '#06b6d4' },
      { name: 'SQL', value: 180, color: '#10b981' },
      { name: 'Opportunity', value: 120, color: '#f59e0b' },
      { name: 'Customer', value: 217, color: '#ef4444' }
    ],
    byLeadStatus: [
      { name: 'New', value: 156 },
      { name: 'In Progress', value: 324 },
      { name: 'Connected', value: 445 },
      { name: 'Qualified', value: 234 },
      { name: 'Unqualified', value: 88 }
    ],
    recentActivity: [
      { date: '2024-01-15', contacts: 23, activities: 67 },
      { date: '2024-01-16', contacts: 31, activities: 89 },
      { date: '2024-01-17', contacts: 28, activities: 76 },
      { date: '2024-01-18', contacts: 35, activities: 94 },
      { date: '2024-01-19', contacts: 29, activities: 82 },
      { date: '2024-01-20', contacts: 42, activities: 118 },
      { date: '2024-01-21', contacts: 38, activities: 105 }
    ]
  });

  // Mock data
  useEffect(() => {
    setContacts([
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        fullName: 'John Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1-555-123-4567',
        company: 'TechCorp Solutions',
        jobTitle: 'CTO',
        leadScore: 85,
        lifecycleStage: 'sales_qualified_lead',
        leadStatus: 'connected',
        lastActivityDate: new Date('2024-01-20'),
        contactOwner: { firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@agency.com' },
        tags: ['enterprise', 'hot-lead', 'technology'],
        originalSource: 'website',
        createdAt: new Date('2024-01-10'),
        dataQuality: { score: 92, completeness: 88 }
      },
      {
        id: '2',
        firstName: 'Maria',
        lastName: 'Garcia',
        fullName: 'Maria Garcia',
        email: 'maria.garcia@healthplus.com',
        phone: '+1-555-987-6543',
        company: 'HealthPlus Clinic',
        jobTitle: 'Marketing Director',
        leadScore: 72,
        lifecycleStage: 'marketing_qualified_lead',
        leadStatus: 'in_progress',
        lastActivityDate: new Date('2024-01-19'),
        contactOwner: { firstName: 'Mike', lastName: 'Johnson', email: 'mike@agency.com' },
        tags: ['healthcare', 'warm-lead'],
        originalSource: 'linkedin',
        createdAt: new Date('2024-01-08'),
        dataQuality: { score: 78, completeness: 75 }
      },
      {
        id: '3',
        firstName: 'David',
        lastName: 'Chen',
        fullName: 'David Chen',
        email: 'david.chen@innovate.io',
        company: 'Innovate Labs',
        jobTitle: 'Founder',
        leadScore: 94,
        lifecycleStage: 'opportunity',
        leadStatus: 'qualified',
        lastActivityDate: new Date('2024-01-21'),
        contactOwner: { firstName: 'Lisa', lastName: 'Brown', email: 'lisa@agency.com' },
        tags: ['startup', 'hot-lead', 'high-value'],
        originalSource: 'referral',
        createdAt: new Date('2024-01-05'),
        dataQuality: { score: 96, completeness: 95 }
      }
    ]);
  }, []);

  // Filter contacts
  useEffect(() => {
    let filtered = contacts;

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.jobTitle?.toLowerCase().includes(query)
      );
    }

    if (filters.leadStatus) {
      filtered = filtered.filter(contact => contact.leadStatus === filters.leadStatus);
    }

    if (filters.lifecycleStage) {
      filtered = filtered.filter(contact => contact.lifecycleStage === filters.lifecycleStage);
    }

    if (filters.leadScoreMin > 0 || filters.leadScoreMax < 100) {
      filtered = filtered.filter(contact => 
        contact.leadScore >= filters.leadScoreMin && contact.leadScore <= filters.leadScoreMax
      );
    }

    setFilteredContacts(filtered);
  }, [contacts, filters]);

  const tabs = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'enrichment', label: 'Lead Enrichment', icon: Database },
    { id: 'behavioral', label: 'Behavioral Scoring', icon: ActivityIcon },
    { id: 'assignment', label: 'Lead Assignment', icon: Target },
    { id: 'nurture', label: 'Nurture Sequences', icon: Mail },
    { id: 'retargeting', label: 'Cross-Platform Retargeting', icon: RefreshCw },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const lifecycleStages = [
    { value: '', label: 'All Stages' },
    { value: 'subscriber', label: 'Subscriber' },
    { value: 'lead', label: 'Lead' },
    { value: 'marketing_qualified_lead', label: 'Marketing Qualified Lead' },
    { value: 'sales_qualified_lead', label: 'Sales Qualified Lead' },
    { value: 'opportunity', label: 'Opportunity' },
    { value: 'customer', label: 'Customer' }
  ];

  const leadStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'connected', label: 'Connected' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'unqualified', label: 'Unqualified' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-600/20 border-green-500/30 text-green-400';
    if (score >= 60) return 'bg-yellow-600/20 border-yellow-500/30 text-yellow-400';
    return 'bg-red-600/20 border-red-500/30 text-red-400';
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-400" />
            <span>Enhanced CRM</span>
          </h1>
          <p className="text-gray-400 mt-1">Advanced contact and lead management system</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </motion.button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <ArrowUpRight className="w-4 h-4 text-green-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-400">Total Contacts</h3>
          <p className="text-2xl font-bold text-white">{analytics.totalContacts.toLocaleString()}</p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <UserPlus className="w-8 h-8 text-green-400" />
            <span className="text-xs text-green-400">+{analytics.newThisMonth}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">New This Month</h3>
          <p className="text-2xl font-bold text-white">{analytics.newThisMonth}</p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-orange-400" />
            <Star className="w-4 h-4 text-orange-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-400">Hot Leads</h3>
          <p className="text-2xl font-bold text-white">{analytics.hotLeads}</p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-purple-400" />
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-400">Avg Lead Score</h3>
          <p className="text-2xl font-bold text-white">{analytics.avgLeadScore}</p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <ArrowUpRight className="w-4 h-4 text-green-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-400">Conversion Rate</h3>
          <p className="text-2xl font-bold text-white">{analytics.conversionRate}%</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="glass-effect rounded-xl p-2">
        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden lg:flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile/Tablet Navigation - Horizontal scroll on medium, dropdown on small */}
        <nav className="lg:hidden">
          {/* Tablet - Horizontal scroll */}
          <div className="hidden md:flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 text-sm ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile - Dropdown */}
          <div className="md:hidden relative mobile-dropdown-container">
            <button
              onClick={() => setShowMobileDropdown(!showMobileDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-2">
                {(() => {
                  const activeTabData = tabs.find(tab => tab.id === activeTab);
                  const Icon = activeTabData?.icon || Users;
                  return (
                    <>
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{activeTabData?.label || 'Contacts'}</span>
                    </>
                  );
                })()}
              </div>
              <motion.div
                animate={{ rotate: showMobileDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </button>

            <AnimatePresence>
              {showMobileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 max-h-64 overflow-y-auto"
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setShowMobileDropdown(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
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
          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="glass-effect rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={filters.query}
                      onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <select
                    value={filters.lifecycleStage}
                    onChange={(e) => setFilters(prev => ({ ...prev, lifecycleStage: e.target.value }))}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {lifecycleStages.map(stage => (
                      <option key={stage.value} value={stage.value}>{stage.label}</option>
                    ))}
                  </select>

                  <select
                    value={filters.leadStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, leadStatus: e.target.value }))}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {leadStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Score:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.leadScoreMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, leadScoreMin: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-white w-8">{filters.leadScoreMin}</span>
                  </div>
                </div>
              </div>

              {/* Contacts Table */}
              <div className="glass-effect rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stage</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Owner</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Activity</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredContacts.map((contact, index) => (
                        <motion.tr
                          key={contact.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {contact.firstName[0]}{contact.lastName[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{contact.fullName}</div>
                                <div className="text-sm text-gray-400">{contact.email}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{contact.company || 'No Company'}</div>
                            <div className="text-sm text-gray-400">{contact.jobTitle || 'No Title'}</div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-600/20 text-purple-400">
                              {contact.lifecycleStage.replace(/_/g, ' ')}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-sm font-bold ${getScoreColor(contact.leadScore)}`}>
                                {contact.leadScore}
                              </span>
                              <div className="ml-2 w-16 bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${contact.leadScore >= 80 ? 'bg-green-400' : contact.leadScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                  style={{ width: `${contact.leadScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {contact.contactOwner.firstName} {contact.contactOwner.lastName}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {contact.lastActivityDate ? formatDate(contact.lastActivityDate) : 'No activity'}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setSelectedContact(contact)}
                                className="text-purple-400 hover:text-purple-300 p-1 rounded"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-blue-400 hover:text-blue-300 p-1 rounded">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-400 hover:text-red-300 p-1 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Tab */}
          {activeTab === 'pipeline' && (
            <div className="mt-6">
              <PipelineManager />
            </div>
          )}

          {/* Lead Enrichment Tab */}
          {activeTab === 'enrichment' && (
            <div className="mt-6">
              <LeadEnrichment />
            </div>
          )}

          {/* Behavioral Scoring Tab */}
          {activeTab === 'behavioral' && (
            <div className="mt-6">
              <BehavioralScoring />
            </div>
          )}

          {/* Lead Assignment Tab */}
          {activeTab === 'assignment' && (
            <div className="mt-6">
              <LeadAssignment />
            </div>
          )}

          {/* Nurture Sequences Tab */}
          {activeTab === 'nurture' && (
            <div className="mt-6">
              <NurtureSequences />
            </div>
          )}

          {/* Cross-Platform Retargeting Tab */}
          {activeTab === 'retargeting' && (
            <div className="mt-6">
              <CrossPlatformRetargeting />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lifecycle Stage Distribution */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Lifecycle Stage Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.byLifecycleStage}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.byLifecycleStage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {analytics.byLifecycleStage.map((stage, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }}></div>
                      <span className="text-sm text-gray-300">{stage.name}</span>
                      <span className="text-sm text-white font-medium">{stage.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Trends */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Activity Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.recentActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Line type="monotone" dataKey="contacts" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="activities" stroke="#06b6d4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EnhancedCRMManager;