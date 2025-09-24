import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Shield, Check, Settings, 
  Crown, Edit, MessageSquare, FileText, BarChart3,
  Zap, Clock, AlertCircle, CheckCircle2, User
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  expertise: string[];
  workload: number; // percentage
  avatar?: string;
  status: 'available' | 'busy' | 'offline';
}

interface ClientRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  requiredExpertise: string[];
  timeCommitment: number; // hours per week
  priority: 'high' | 'medium' | 'low';
}

interface Assignment {
  roleId: string;
  memberId: string;
  confidence: number; // 0-100
  reasoning: string[];
}

interface TeamAssignmentAutomationProps {
  clientId: string;
  clientName: string;
  clientIndustry: string;
  clientSize: string;
  projectScope: string[];
  onAssignmentComplete: (assignments: Assignment[]) => void;
}

const TeamAssignmentAutomation: React.FC<TeamAssignmentAutomationProps> = ({
  clientId,
  clientName,
  clientIndustry,
  clientSize,
  projectScope,
  onAssignmentComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [recommendedRoles, setRecommendedRoles] = useState<ClientRole[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssignments, setShowAssignments] = useState(false);

  // Mock team members data
  const mockTeamMembers: TeamMember[] = [
    {
      id: 'tm1',
      name: 'Sarah Johnson',
      email: 'sarah@agency.com',
      role: 'Account Manager',
      expertise: ['client-relations', 'project-management', 'strategy'],
      workload: 75,
      status: 'available'
    },
    {
      id: 'tm2',
      name: 'Mike Chen',
      email: 'mike@agency.com',
      role: 'Creative Director',
      expertise: ['design', 'branding', 'creative-strategy', 'video'],
      workload: 60,
      status: 'available'
    },
    {
      id: 'tm3',
      name: 'Emily Davis',
      email: 'emily@agency.com',
      role: 'Digital Marketing Specialist',
      expertise: ['paid-ads', 'social-media', 'analytics', 'seo'],
      workload: 45,
      status: 'available'
    },
    {
      id: 'tm4',
      name: 'Alex Thompson',
      email: 'alex@agency.com',
      role: 'Content Writer',
      expertise: ['copywriting', 'content-strategy', 'email-marketing'],
      workload: 30,
      status: 'available'
    },
    {
      id: 'tm5',
      name: 'Lisa Park',
      email: 'lisa@agency.com',
      role: 'Data Analyst',
      expertise: ['analytics', 'reporting', 'data-analysis', 'automation'],
      workload: 55,
      status: 'available'
    }
  ];

  // Client role templates based on industry and scope
  const getRoleTemplates = (): ClientRole[] => {
    const baseRoles: ClientRole[] = [
      {
        id: 'account-manager',
        name: 'Account Manager',
        description: 'Primary client contact and project coordinator',
        permissions: ['client-communication', 'project-oversight', 'team-coordination'],
        requiredExpertise: ['client-relations', 'project-management'],
        timeCommitment: 10,
        priority: 'high'
      },
      {
        id: 'creative-lead',
        name: 'Creative Lead',
        description: 'Oversees all creative assets and brand consistency',
        permissions: ['creative-direction', 'brand-guidelines', 'asset-approval'],
        requiredExpertise: ['design', 'branding', 'creative-strategy'],
        timeCommitment: 8,
        priority: 'high'
      }
    ];

    // Add scope-specific roles
    if (projectScope.includes('paid-advertising')) {
      baseRoles.push({
        id: 'paid-ads-specialist',
        name: 'Paid Advertising Specialist',
        description: 'Manages all paid advertising campaigns',
        permissions: ['campaign-management', 'budget-control', 'ad-optimization'],
        requiredExpertise: ['paid-ads', 'analytics'],
        timeCommitment: 12,
        priority: 'high'
      });
    }

    if (projectScope.includes('content-marketing')) {
      baseRoles.push({
        id: 'content-strategist',
        name: 'Content Strategist',
        description: 'Develops and executes content strategy',
        permissions: ['content-planning', 'editorial-calendar', 'content-approval'],
        requiredExpertise: ['copywriting', 'content-strategy'],
        timeCommitment: 6,
        priority: 'medium'
      });
    }

    if (projectScope.includes('social-media')) {
      baseRoles.push({
        id: 'social-media-manager',
        name: 'Social Media Manager',
        description: 'Manages social media presence and engagement',
        permissions: ['social-posting', 'community-management', 'social-analytics'],
        requiredExpertise: ['social-media', 'community-management'],
        timeCommitment: 8,
        priority: 'medium'
      });
    }

    if (projectScope.includes('analytics')) {
      baseRoles.push({
        id: 'analytics-specialist',
        name: 'Analytics Specialist',
        description: 'Tracks performance and provides insights',
        permissions: ['data-analysis', 'reporting', 'performance-tracking'],
        requiredExpertise: ['analytics', 'reporting', 'data-analysis'],
        timeCommitment: 4,
        priority: 'medium'
      });
    }

    return baseRoles;
  };

  const analyzeAndAssign = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setTeamMembers(mockTeamMembers);

    const steps = [
      'Analyzing client requirements...',
      'Identifying required roles...',
      'Evaluating team expertise...',
      'Calculating workload capacity...',
      'Matching skills to roles...',
      'Optimizing assignments...',
      'Generating recommendations...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnalysisStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Generate role recommendations
    const roles = getRoleTemplates();
    setRecommendedRoles(roles);

    // Auto-assign team members
    const autoAssignments: Assignment[] = [];

    roles.forEach(role => {
      // Find best match based on expertise and workload
      const suitableMembers = mockTeamMembers.filter(member => 
        role.requiredExpertise.some(skill => member.expertise.includes(skill))
      );

      if (suitableMembers.length > 0) {
        // Sort by workload (prefer less busy members) and expertise match
        const bestMatch = suitableMembers.sort((a, b) => {
          const aExpertiseMatch = role.requiredExpertise.filter(skill => a.expertise.includes(skill)).length;
          const bExpertiseMatch = role.requiredExpertise.filter(skill => b.expertise.includes(skill)).length;
          
          if (aExpertiseMatch !== bExpertiseMatch) {
            return bExpertiseMatch - aExpertiseMatch; // More expertise wins
          }
          
          return a.workload - b.workload; // Less workload wins
        })[0];

        const expertiseMatch = role.requiredExpertise.filter(skill => bestMatch.expertise.includes(skill)).length;
        const confidence = Math.min(95, (expertiseMatch / role.requiredExpertise.length) * 100 - bestMatch.workload * 0.3);

        const reasoning = [
          `${expertiseMatch}/${role.requiredExpertise.length} required skills match`,
          `Current workload: ${bestMatch.workload}%`,
          `${bestMatch.role} background aligns well`
        ];

        autoAssignments.push({
          roleId: role.id,
          memberId: bestMatch.id,
          confidence: Math.round(confidence),
          reasoning
        });
      }
    });

    setAssignments(autoAssignments);
    setShowAssignments(true);
    setIsAnalyzing(false);

    onAssignmentComplete(autoAssignments);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 80) return 'bg-red-500';
    if (workload >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'account-manager': return Crown;
      case 'creative-lead': return Edit;
      case 'paid-ads-specialist': return BarChart3;
      case 'content-strategist': return FileText;
      case 'social-media-manager': return MessageSquare;
      case 'analytics-specialist': return BarChart3;
      default: return User;
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Info Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs font-medium text-gray-400 mb-1">Industry</p>
          <p className="text-white capitalize">{clientIndustry}</p>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs font-medium text-gray-400 mb-1">Company Size</p>
          <p className="text-white">{clientSize}</p>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs font-medium text-gray-400 mb-1">Project Scope</p>
          <p className="text-white">{projectScope.length} services</p>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs font-medium text-gray-400 mb-1">Team Size</p>
          <p className="text-white">{teamMembers.length} members</p>
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
              />
              <span className="text-white font-medium">Analyzing Team & Requirements...</span>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                />
              </div>
              <p className="text-purple-400 text-sm">{analysisStep}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Team Assignments */}
      {showAssignments && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Recommended Team Assignments</span>
            </h4>
            <div className="text-sm text-gray-400">
              {assignments.length} roles assigned
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {assignments.map((assignment, index) => {
                const role = recommendedRoles.find(r => r.id === assignment.roleId);
                const member = teamMembers.find(m => m.id === assignment.memberId);
                const RoleIcon = getRoleIcon(assignment.roleId);
                
                if (!role || !member) return null;

                return (
                  <motion.div
                    key={assignment.roleId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-800/50 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
                  >
                    {/* Role Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <RoleIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">{role.name}</h5>
                          <p className="text-xs text-gray-400">{role.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getConfidenceColor(assignment.confidence)}`}>
                          {assignment.confidence}% match
                        </div>
                        <div className="text-xs text-gray-400">{role.timeCommitment}h/week</div>
                      </div>
                    </div>

                    {/* Assigned Member */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.role}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getWorkloadColor(member.workload)}`} />
                          <span className="text-xs text-gray-400">{member.workload}%</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          member.status === 'available' ? 'bg-green-400' : 
                          member.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`} />
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-400">Why this assignment:</p>
                      {assignment.reasoning.map((reason, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span className="text-xs text-gray-300">{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Permissions Preview */}
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs font-medium text-gray-400 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map(permission => (
                          <span
                            key={permission}
                            className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs"
                          >
                            {permission.replace('-', ' ')}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4 pt-4">
            <button className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              <span>Customize Assignments</span>
            </button>
            
            <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors">
              <UserPlus className="w-4 h-4" />
              <span>Confirm & Notify Team</span>
            </button>
          </div>

          {/* Assignment Summary */}
          <div className="p-4 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-green-400 font-medium">Team Assignment Complete</p>
                <p className="text-gray-400 text-sm mt-1">
                  All team members will receive email notifications with their roles, permissions, and project details. 
                  Access levels will be automatically configured.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Start Analysis Button */}
      {!isAnalyzing && !showAssignments && (
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={analyzeAndAssign}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-colors mx-auto"
          >
            <Zap className="w-5 h-5" />
            <span>Analyze & Auto-Assign Team</span>
          </motion.button>
          <p className="text-gray-400 text-sm mt-2">
            AI will analyze requirements and assign the best team members
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamAssignmentAutomation;