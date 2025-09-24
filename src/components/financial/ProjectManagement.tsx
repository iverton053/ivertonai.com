import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  Edit3,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';
import { financialService } from '../../services/financialService';
import { Project, ProjectAnalytics } from '../../types/financial';
import { format, parseISO, differenceInDays } from 'date-fns';

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<Record<string, ProjectAnalytics>>({});

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter, priorityFilter]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await financialService.getProjects();
      setProjects(data);
      
      // Load analytics for each project
      const analytics: Record<string, ProjectAnalytics> = {};
      for (const project of data) {
        try {
          analytics[project.id] = await financialService.getProjectAnalytics(project.id);
        } catch (error) {
          console.error(`Error loading analytics for project ${project.id}:`, error);
        }
      }
      setProjectAnalytics(analytics);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'on_hold':
        return <Pause className="w-4 h-4 text-yellow-400" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'completed':
        return 'text-blue-400 bg-blue-900/200/10 border-blue-500/20';
      case 'on_hold':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'cancelled':
        return 'text-red-400 bg-red-900/200/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-900/200/10 border-red-500/20';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const calculateProgress = (project: Project): number => {
    const analytics = projectAnalytics[project.id];
    if (!analytics || !project.estimated_hours) return 0;
    return Math.min(100, (analytics.total_hours / project.estimated_hours) * 100);
  };

  const calculateDaysRemaining = (project: Project): number | null => {
    if (!project.end_date) return null;
    return differenceInDays(parseISO(project.end_date), new Date());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Summary stats calculation
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Project Management</h1>
          <p className="text-gray-400 mt-1">Track and manage client projects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Projects</p>
              <p className="text-3xl font-bold text-white">{totalProjects}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Active Projects</p>
              <p className="text-3xl font-bold text-white">{activeProjects}</p>
            </div>
            <Play className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Completed</p>
              <p className="text-3xl font-bold text-white">{completedProjects}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Budget</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalBudget)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-effect rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => {
            const analytics = projectAnalytics[project.id];
            const progress = calculateProgress(project);
            const daysRemaining = calculateDaysRemaining(project);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-effect rounded-xl p-6 hover:bg-gray-800/50 transition-all cursor-pointer group"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{project.client.name}</p>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setShowAnalytics(project.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    <span>{project.status}</span>
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>

                {/* Project Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Budget</span>
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(project.budget)}
                    </span>
                  </div>

                  {analytics && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Hours Logged</span>
                      <span className="text-sm font-medium text-white">
                        {analytics.total_hours}h
                        {project.estimated_hours && (
                          <span className="text-gray-400">
                            /{project.estimated_hours}h
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {daysRemaining !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Days Remaining</span>
                      <span className={`text-sm font-medium ${
                        daysRemaining < 0 ? 'text-red-400' : 
                        daysRemaining < 7 ? 'text-yellow-400' : 'text-white'
                      }`}>
                        {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {project.estimated_hours && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm font-medium text-white">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          progress >= 100 ? 'bg-green-500' :
                          progress >= 75 ? 'bg-blue-900/200' :
                          progress >= 50 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Team Members */}
                {project.team_members.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Team</span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">{project.team_members.length}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-effect rounded-xl p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first project to get started'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Project</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;