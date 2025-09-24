import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, RefreshCw, CheckCircle, AlertCircle, Clock, ExternalLink,
  User, Building, Mail, Phone, MapPin, Globe, Linkedin, 
  Database, Target, TrendingUp, Award, Search, Filter,
  Download, Upload, Settings, Eye, Edit, Play, Pause
} from 'lucide-react';

interface EnrichmentData {
  id: string;
  contactId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  progress: number;
  lastEnriched: string;
  sources: {
    hunter: {
      status: 'pending' | 'success' | 'failed';
      data?: {
        emailVerified: boolean;
        emailScore: number;
        company: string;
        domain: string;
      };
    };
    clearbit: {
      status: 'pending' | 'success' | 'failed';
      data?: {
        name: string;
        role: string;
        seniority: string;
        company: {
          name: string;
          domain: string;
          industry: string;
          size: string;
          founded: number;
        };
      };
    };
    linkedin: {
      status: 'pending' | 'success' | 'failed';
      data?: {
        profile: string;
        connections: number;
        experience: Array<{
          company: string;
          title: string;
          duration: string;
        }>;
      };
    };
    googlePlaces: {
      status: 'pending' | 'success' | 'failed';
      data?: {
        businessName: string;
        address: string;
        phone: string;
        website: string;
        rating: number;
        reviews: number;
      };
    };
  };
  enhancedScore: {
    before: number;
    after: number;
    factors: Array<{
      name: string;
      impact: number;
      reason: string;
    }>;
  };
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  leadScore: number;
  enrichmentData?: EnrichmentData;
}

const LeadEnrichment: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [enrichmentQueue, setEnrichmentQueue] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        company: 'TechCorp Solutions',
        leadScore: 85,
        enrichmentData: {
          id: 'enr_1',
          contactId: '1',
          status: 'completed',
          progress: 100,
          lastEnriched: '2024-01-20T10:30:00Z',
          sources: {
            hunter: {
              status: 'success',
              data: {
                emailVerified: true,
                emailScore: 92,
                company: 'TechCorp Solutions Inc.',
                domain: 'techcorp.com'
              }
            },
            clearbit: {
              status: 'success',
              data: {
                name: 'John Smith',
                role: 'CTO',
                seniority: 'Executive',
                company: {
                  name: 'TechCorp Solutions Inc.',
                  domain: 'techcorp.com',
                  industry: 'Software',
                  size: '201-500',
                  founded: 2015
                }
              }
            },
            linkedin: {
              status: 'success',
              data: {
                profile: 'https://linkedin.com/in/johnsmith-cto',
                connections: 1250,
                experience: [
                  { company: 'TechCorp Solutions', title: 'CTO', duration: '3 years' },
                  { company: 'StartupX', title: 'VP Engineering', duration: '2 years' }
                ]
              }
            },
            googlePlaces: {
              status: 'success',
              data: {
                businessName: 'TechCorp Solutions Inc.',
                address: '123 Tech Street, San Francisco, CA 94105',
                phone: '+1-555-123-4567',
                website: 'https://techcorp.com',
                rating: 4.8,
                reviews: 127
              }
            }
          },
          enhancedScore: {
            before: 65,
            after: 85,
            factors: [
              { name: 'Executive Role', impact: +15, reason: 'CTO position indicates decision-making authority' },
              { name: 'Company Size', impact: +10, reason: 'Mid-size company (201-500 employees)' },
              { name: 'Email Verification', impact: +5, reason: 'High deliverability score (92%)' },
              { name: 'Professional Network', impact: +8, reason: 'Strong LinkedIn presence (1250 connections)' },
              { name: 'Company Reputation', impact: +7, reason: 'High-rated business (4.8 stars)' }
            ]
          }
        }
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@startup.io',
        company: 'Startup Labs',
        leadScore: 42,
        enrichmentData: {
          id: 'enr_2',
          contactId: '2',
          status: 'processing',
          progress: 65,
          lastEnriched: '2024-01-21T15:45:00Z',
          sources: {
            hunter: { status: 'success', data: { emailVerified: true, emailScore: 78, company: 'Startup Labs', domain: 'startup.io' } },
            clearbit: { status: 'success', data: { name: 'Sarah Johnson', role: 'Marketing Manager', seniority: 'Manager', company: { name: 'Startup Labs', domain: 'startup.io', industry: 'Technology', size: '11-50', founded: 2020 } } },
            linkedin: { status: 'processing' },
            googlePlaces: { status: 'pending' }
          },
          enhancedScore: {
            before: 42,
            after: 42,
            factors: []
          }
        }
      },
      {
        id: '3',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'mbrown@example.com',
        company: 'Unknown Corp',
        leadScore: 28,
        enrichmentData: {
          id: 'enr_3',
          contactId: '3',
          status: 'failed',
          progress: 0,
          lastEnriched: '2024-01-19T09:15:00Z',
          sources: {
            hunter: { status: 'failed' },
            clearbit: { status: 'failed' },
            linkedin: { status: 'failed' },
            googlePlaces: { status: 'failed' }
          },
          enhancedScore: {
            before: 28,
            after: 28,
            factors: []
          }
        }
      }
    ];

    setContacts(mockContacts);
    setLoading(false);
  }, []);

  const handleEnrichContact = async (contactId: string) => {
    setEnrichmentQueue(prev => [...prev, contactId]);
    
    // Update contact status to processing
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? {
            ...contact,
            enrichmentData: {
              ...contact.enrichmentData!,
              status: 'processing',
              progress: 0
            }
          }
        : contact
    ));

    // Simulate enrichment process
    const stages = [
      { progress: 25, message: 'Verifying email...' },
      { progress: 50, message: 'Fetching company data...' },
      { progress: 75, message: 'Getting professional info...' },
      { progress: 100, message: 'Calculating enhanced score...' }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? {
              ...contact,
              enrichmentData: {
                ...contact.enrichmentData!,
                progress: stage.progress
              }
            }
          : contact
      ));
    }

    // Complete enrichment
    setTimeout(() => {
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? {
              ...contact,
              enrichmentData: {
                ...contact.enrichmentData!,
                status: 'completed',
                progress: 100
              }
            }
          : contact
      ));
      setEnrichmentQueue(prev => prev.filter(id => id !== contactId));
    }, 500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'partial': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'processing': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'partial': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchQuery === '' || 
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contact.enrichmentData?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Lead Enrichment</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Automatically enhance lead profiles with external data sources
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Configure Sources
          </button>
          <button
            onClick={() => {
              const unenrichedContacts = contacts.filter(c => !c.enrichmentData || c.enrichmentData.status === 'failed');
              unenrichedContacts.forEach(contact => handleEnrichContact(contact.id));
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Zap className="w-4 h-4 mr-2" />
            Enrich All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Contacts</p>
              <p className="text-2xl font-bold text-white">{contacts.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Enriched</p>
              <p className="text-2xl font-bold text-green-600">
                {contacts.filter(c => c.enrichmentData?.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Processing</p>
              <p className="text-2xl font-bold text-blue-600">
                {contacts.filter(c => c.enrichmentData?.status === 'processing').length}
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Score Improvement</p>
              <p className="text-2xl font-bold text-purple-600">+18.5</p>
              <p className="text-sm text-gray-500">avg increase</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
        >
          <option value="all">All Status</option>
          <option value="completed">Enriched</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Contacts List */}
      <div className="glass-effect rounded-xl border border-gray-600">
        <div className="p-6 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-white">Contact Enrichment Status</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sources
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Score Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Enriched
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredContacts.map(contact => (
                <motion.tr
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(contact.enrichmentData?.status || 'pending')}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.enrichmentData?.status || 'pending')}`}>
                        {contact.enrichmentData?.status || 'pending'}
                      </span>
                    </div>
                    {contact.enrichmentData?.status === 'processing' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${contact.enrichmentData.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{contact.enrichmentData.progress}%</div>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {contact.enrichmentData?.sources && (
                        <>
                          <div className={`w-2 h-2 rounded-full ${
                            contact.enrichmentData.sources.hunter.status === 'success' ? 'bg-green-500' :
                            contact.enrichmentData.sources.hunter.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} title="Hunter.io" />
                          <div className={`w-2 h-2 rounded-full ${
                            contact.enrichmentData.sources.clearbit.status === 'success' ? 'bg-green-500' :
                            contact.enrichmentData.sources.clearbit.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} title="Clearbit" />
                          <div className={`w-2 h-2 rounded-full ${
                            contact.enrichmentData.sources.linkedin.status === 'success' ? 'bg-green-500' :
                            contact.enrichmentData.sources.linkedin.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} title="LinkedIn" />
                          <div className={`w-2 h-2 rounded-full ${
                            contact.enrichmentData.sources.googlePlaces.status === 'success' ? 'bg-green-500' :
                            contact.enrichmentData.sources.googlePlaces.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} title="Google Places" />
                        </>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.enrichmentData?.enhancedScore && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {contact.enrichmentData.enhancedScore.before}
                        </span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-sm font-medium text-green-600">
                          {contact.enrichmentData.enhancedScore.after}
                        </span>
                        <span className="ml-2 text-xs text-green-600">
                          (+{contact.enrichmentData.enhancedScore.after - contact.enrichmentData.enhancedScore.before})
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {contact.enrichmentData?.lastEnriched 
                      ? new Date(contact.enrichmentData.lastEnriched).toLocaleDateString()
                      : 'Never'
                    }
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedContact(contact)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEnrichContact(contact.id)}
                        disabled={enrichmentQueue.includes(contact.id)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enrichmentQueue.includes(contact.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Detail Modal */}
      <AnimatePresence>
        {selectedContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedContact(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-effect rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {selectedContact.firstName} {selectedContact.lastName} - Enrichment Details
                </h3>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              {selectedContact.enrichmentData && (
                <div className="space-y-6">
                  {/* Score Enhancement */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg">
                    <h4 className="font-semibold text-white mb-4">Score Enhancement</h4>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                          {selectedContact.enrichmentData.enhancedScore.before}
                        </div>
                        <div className="text-sm text-gray-500">Before</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          +{selectedContact.enrichmentData.enhancedScore.after - selectedContact.enrichmentData.enhancedScore.before}
                        </div>
                        <div className="text-sm text-gray-500">Improvement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedContact.enrichmentData.enhancedScore.after}
                        </div>
                        <div className="text-sm text-gray-500">After</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {selectedContact.enrichmentData.enhancedScore.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                          <span className="text-sm font-medium text-white">{factor.name}</span>
                          <div className="flex items-center">
                            <span className={`text-sm font-bold mr-2 ${factor.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {factor.impact > 0 ? '+' : ''}{factor.impact}
                            </span>
                            <span className="text-xs text-gray-500">{factor.reason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Sources */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(selectedContact.enrichmentData.sources).map(([source, data]) => (
                      <div key={source} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-white capitalize">{source}</h5>
                          {getStatusIcon(data.status)}
                        </div>
                        
                        {data.status === 'success' && data.data && (
                          <div className="space-y-2 text-sm">
                            {Object.entries(data.data).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="text-white">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {data.status === 'failed' && (
                          <div className="text-sm text-red-600 dark:text-red-400">
                            Enrichment failed for this source
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEnrichContact(selectedContact.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Re-enrich Contact
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadEnrichment;