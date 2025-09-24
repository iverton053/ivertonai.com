import React, { useState, useEffect } from 'react';
import { Users, MapPin, Target, Settings, Plus, Search, Filter, ChevronDown, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Territory {
  id: string;
  name: string;
  description: string;
  regions: string[];
  assignedReps: SalesRep[];
  leadCount: number;
  conversionRate: number;
  avgResponseTime: number;
  status: 'active' | 'inactive';
  autoAssignmentRules: AssignmentRule[];
}

interface SalesRep {
  id: string;
  name: string;
  email: string;
  avatar: string;
  territory: string;
  currentLeads: number;
  maxLeads: number;
  conversionRate: number;
  avgResponseTime: number;
  specialties: string[];
  status: 'available' | 'busy' | 'offline';
  workingHours: {
    timezone: string;
    start: string;
    end: string;
    days: string[];
  };
}

interface AssignmentRule {
  id: string;
  name: string;
  priority: number;
  conditions: {
    leadScore: { min?: number; max?: number };
    source: string[];
    company_size: string[];
    location: string[];
    industry: string[];
  };
  assignTo: 'specific_rep' | 'round_robin' | 'load_balanced' | 'best_match';
  targetReps: string[];
  isActive: boolean;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  score: number;
  source: string;
  location: string;
  industry: string;
  assignedRep?: string;
  assignedDate?: Date;
  status: 'unassigned' | 'assigned' | 'contacted' | 'qualified';
  territory?: string;
}

const LeadAssignment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'territories' | 'reps' | 'rules' | 'leads'>('territories');
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>([]);
  const [unassignedLeads, setUnassignedLeads] = useState<Lead[]>([]);
  const [selectedTerritory, setSelectedTerritory] = useState<string>('');
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setTerritories([
      {
        id: '1',
        name: 'North America East',
        description: 'Eastern US and Canada',
        regions: ['NY', 'MA', 'CT', 'ON', 'QC'],
        assignedReps: [],
        leadCount: 245,
        conversionRate: 23.5,
        avgResponseTime: 2.3,
        status: 'active',
        autoAssignmentRules: []
      },
      {
        id: '2',
        name: 'North America West',
        description: 'Western US and Canada',
        regions: ['CA', 'WA', 'OR', 'BC', 'AB'],
        assignedReps: [],
        leadCount: 189,
        conversionRate: 28.1,
        avgResponseTime: 1.8,
        status: 'active',
        autoAssignmentRules: []
      },
      {
        id: '3',
        name: 'Europe',
        description: 'European Union and UK',
        regions: ['UK', 'DE', 'FR', 'ES', 'IT'],
        assignedReps: [],
        leadCount: 156,
        conversionRate: 19.7,
        avgResponseTime: 3.1,
        status: 'active',
        autoAssignmentRules: []
      }
    ]);

    setSalesReps([
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        avatar: '/api/placeholder/40/40',
        territory: 'North America East',
        currentLeads: 42,
        maxLeads: 50,
        conversionRate: 26.8,
        avgResponseTime: 1.5,
        specialties: ['Enterprise', 'SaaS'],
        status: 'available',
        workingHours: {
          timezone: 'EST',
          start: '09:00',
          end: '17:00',
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        }
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike.chen@company.com',
        avatar: '/api/placeholder/40/40',
        territory: 'North America West',
        currentLeads: 38,
        maxLeads: 45,
        conversionRate: 31.2,
        avgResponseTime: 1.2,
        specialties: ['Tech Startups', 'E-commerce'],
        status: 'available',
        workingHours: {
          timezone: 'PST',
          start: '08:00',
          end: '16:00',
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        }
      },
      {
        id: '3',
        name: 'Emma Wilson',
        email: 'emma.wilson@company.com',
        avatar: '/api/placeholder/40/40',
        territory: 'Europe',
        currentLeads: 35,
        maxLeads: 40,
        conversionRate: 22.4,
        avgResponseTime: 2.8,
        specialties: ['Manufacturing', 'Healthcare'],
        status: 'busy',
        workingHours: {
          timezone: 'GMT',
          start: '09:00',
          end: '17:00',
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        }
      }
    ]);

    setAssignmentRules([
      {
        id: '1',
        name: 'High-Value Enterprise Leads',
        priority: 1,
        conditions: {
          leadScore: { min: 80 },
          source: ['website', 'referral'],
          company_size: ['501-1000', '1001+'],
          location: ['US', 'CA'],
          industry: ['Technology', 'Finance']
        },
        assignTo: 'specific_rep',
        targetReps: ['1'],
        isActive: true
      },
      {
        id: '2',
        name: 'Tech Startup Round Robin',
        priority: 2,
        conditions: {
          leadScore: { min: 60, max: 79 },
          source: ['social_media', 'content'],
          company_size: ['1-10', '11-50'],
          location: ['US', 'CA'],
          industry: ['Technology']
        },
        assignTo: 'round_robin',
        targetReps: ['2', '1'],
        isActive: true
      },
      {
        id: '3',
        name: 'European Load Balanced',
        priority: 3,
        conditions: {
          leadScore: { min: 40 },
          source: [],
          company_size: [],
          location: ['UK', 'DE', 'FR', 'ES', 'IT'],
          industry: []
        },
        assignTo: 'load_balanced',
        targetReps: ['3'],
        isActive: true
      }
    ]);

    setUnassignedLeads([
      {
        id: '1',
        name: 'John Smith',
        email: 'john@techcorp.com',
        company: 'TechCorp Inc.',
        score: 85,
        source: 'website',
        location: 'NY',
        industry: 'Technology',
        status: 'unassigned'
      },
      {
        id: '2',
        name: 'Maria Garcia',
        email: 'maria@startup.io',
        company: 'StartupIO',
        score: 72,
        source: 'social_media',
        location: 'CA',
        industry: 'Technology',
        status: 'unassigned'
      },
      {
        id: '3',
        name: 'Hans Mueller',
        email: 'hans@manufacturing.de',
        company: 'Mueller Manufacturing',
        score: 68,
        source: 'referral',
        location: 'DE',
        industry: 'Manufacturing',
        status: 'unassigned'
      }
    ]);
  }, []);

  const handleAutoAssignLeads = async () => {
    // Simulate auto-assignment logic
    const updatedLeads = unassignedLeads.map(lead => {
      // Find matching rules
      const matchingRules = assignmentRules
        .filter(rule => rule.isActive)
        .filter(rule => {
          const { conditions } = rule;
          return (
            (!conditions.leadScore.min || lead.score >= conditions.leadScore.min) &&
            (!conditions.leadScore.max || lead.score <= conditions.leadScore.max) &&
            (conditions.source.length === 0 || conditions.source.includes(lead.source)) &&
            (conditions.location.length === 0 || conditions.location.includes(lead.location)) &&
            (conditions.industry.length === 0 || conditions.industry.includes(lead.industry))
          );
        })
        .sort((a, b) => a.priority - b.priority);

      if (matchingRules.length > 0) {
        const rule = matchingRules[0];
        let assignedRep = '';

        if (rule.assignTo === 'specific_rep' && rule.targetReps.length > 0) {
          assignedRep = rule.targetReps[0];
        } else if (rule.assignTo === 'round_robin') {
          // Simple round-robin logic
          assignedRep = rule.targetReps[Math.floor(Math.random() * rule.targetReps.length)];
        } else if (rule.assignTo === 'load_balanced') {
          // Find rep with lowest current lead count
          const availableReps = salesReps.filter(rep => rule.targetReps.includes(rep.id));
          availableReps.sort((a, b) => a.currentLeads - b.currentLeads);
          assignedRep = availableReps[0]?.id || '';
        }

        return {
          ...lead,
          assignedRep,
          assignedDate: new Date(),
          status: 'assigned' as const,
          territory: salesReps.find(rep => rep.id === assignedRep)?.territory
        };
      }

      return lead;
    });

    setUnassignedLeads(updatedLeads.filter(lead => lead.status === 'unassigned'));
  };

  const territoryStats = territories.map(territory => {
    const reps = salesReps.filter(rep => rep.territory === territory.name);
    const totalCapacity = reps.reduce((sum, rep) => sum + rep.maxLeads, 0);
    const currentLoad = reps.reduce((sum, rep) => sum + rep.currentLeads, 0);

    return {
      ...territory,
      reps: reps.length,
      capacity: totalCapacity,
      currentLoad,
      utilizationRate: totalCapacity > 0 ? (currentLoad / totalCapacity) * 100 : 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Lead Assignment & Territory Management</h2>
          <p className="text-gray-600">Manage sales territories, reps, and automated lead assignment rules</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAutoAssignLeads}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Auto Assign Leads ({unassignedLeads.length})
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-600">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'territories', label: 'Territories', icon: MapPin },
            { key: 'reps', label: 'Sales Reps', icon: Users },
            { key: 'rules', label: 'Assignment Rules', icon: Settings },
            { key: 'leads', label: 'Unassigned Leads', icon: UserPlus }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'territories' && (
          <motion.div
            key="territories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {territoryStats.map((territory) => (
                <div key={territory.id} className="glass-effect rounded-lg p-6 shadow-sm border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{territory.name}</h3>
                      <p className="text-sm text-gray-600">{territory.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      territory.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {territory.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sales Reps</span>
                      <span className="text-sm font-medium">{territory.reps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Lead Capacity</span>
                      <span className="text-sm font-medium">{territory.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Load</span>
                      <span className="text-sm font-medium">{territory.currentLoad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Utilization</span>
                      <span className="text-sm font-medium">{territory.utilizationRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          territory.utilizationRate > 80 ? 'bg-red-500' :
                          territory.utilizationRate > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(territory.utilizationRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">Regions</div>
                    <div className="flex flex-wrap gap-1">
                      {territory.regions.map((region) => (
                        <span key={region} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'reps' && (
          <motion.div
            key="reps"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {salesReps.map((rep) => (
                <div key={rep.id} className="glass-effect rounded-lg p-6 shadow-sm border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={rep.avatar} 
                        alt={rep.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{rep.name}</h3>
                        <p className="text-sm text-gray-600">{rep.email}</p>
                        <p className="text-sm text-gray-500">{rep.territory}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rep.status === 'available' ? 'bg-green-100 text-green-800' :
                      rep.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Current Leads</div>
                      <div className="text-lg font-semibold">{rep.currentLeads}/{rep.maxLeads}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Conversion Rate</div>
                      <div className="text-lg font-semibold">{rep.conversionRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Avg Response</div>
                      <div className="text-lg font-semibold">{rep.avgResponseTime}h</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Timezone</div>
                      <div className="text-lg font-semibold">{rep.workingHours.timezone}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Specialties</div>
                    <div className="flex flex-wrap gap-1">
                      {rep.specialties.map((specialty) => (
                        <span key={specialty} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    Working Hours: {rep.workingHours.start} - {rep.workingHours.end}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'rules' && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assignment Rules</h3>
              <button 
                onClick={() => setIsCreatingRule(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Rule
              </button>
            </div>

            <div className="space-y-4">
              {assignmentRules.map((rule) => (
                <div key={rule.id} className="glass-effect rounded-lg p-6 shadow-sm border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{rule.name}</h4>
                      <p className="text-sm text-gray-600">Priority: {rule.priority}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-white mb-2">Conditions</h5>
                      <div className="space-y-1 text-sm text-gray-600">
                        {rule.conditions.leadScore.min && (
                          <div>Lead Score: ≥ {rule.conditions.leadScore.min}</div>
                        )}
                        {rule.conditions.leadScore.max && (
                          <div>Lead Score: ≤ {rule.conditions.leadScore.max}</div>
                        )}
                        {rule.conditions.source.length > 0 && (
                          <div>Sources: {rule.conditions.source.join(', ')}</div>
                        )}
                        {rule.conditions.location.length > 0 && (
                          <div>Locations: {rule.conditions.location.join(', ')}</div>
                        )}
                        {rule.conditions.industry.length > 0 && (
                          <div>Industries: {rule.conditions.industry.join(', ')}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-white mb-2">Assignment</h5>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Method: {rule.assignTo.replace('_', ' ')}</div>
                        <div>
                          Target Reps: {rule.targetReps.map(repId => 
                            salesReps.find(rep => rep.id === repId)?.name || repId
                          ).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'leads' && (
          <motion.div
            key="leads"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Unassigned Leads ({unassignedLeads.length})</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="glass-effect divide-y divide-gray-200">
                  {unassignedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {lead.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lead.score >= 80 ? 'bg-green-100 text-green-800' :
                          lead.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {lead.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {lead.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {lead.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {lead.industry}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Assign
                        </button>
                        <button className="text-gray-600 hover:text-white">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadAssignment;