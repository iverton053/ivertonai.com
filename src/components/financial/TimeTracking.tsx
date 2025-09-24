import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Filter,
  Download,
  Timer,
  DollarSign,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { financialService } from '../../services/financialService';
import { TimeEntry, TimeTrackingSession, Project } from '../../types/financial';
import { format, parseISO, startOfWeek, endOfWeek, isToday } from 'date-fns';

const TimeTracking: React.FC = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeSessions, setActiveSessions] = useState<TimeTrackingSession[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Manual time entry form
  const [manualEntry, setManualEntry] = useState({
    project_id: '',
    task_description: '',
    hours: 0,
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    billable: true
  });

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadActiveSessions();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [entriesData, projectsData] = await Promise.all([
        financialService.getTimeEntries(),
        financialService.getProjects()
      ]);
      setTimeEntries(entriesData);
      setProjects(projectsData.filter(p => p.status === 'active'));
    } catch (error) {
      console.error('Error loading time tracking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveSessions = async () => {
    try {
      const sessions = await financialService.getActiveTimeSessions();
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Error loading active sessions:', error);
    }
  };

  const startTimer = async () => {
    if (!selectedProject || !taskDescription.trim()) {
      alert('Please select a project and enter a task description');
      return;
    }

    try {
      const session = await financialService.startTimeTracking({
        project_id: selectedProject,
        user_id: 'current_user', // Would get from auth context
        task_description: taskDescription.trim()
      });

      setActiveSessions(prev => [...prev, session]);
      setTaskDescription('');
      setSelectedProject('');
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const stopTimer = async (sessionId: string) => {
    try {
      const timeEntry = await financialService.stopTimeTracking(sessionId);
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      setTimeEntries(prev => [timeEntry, ...prev]);
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const addManualEntry = async () => {
    if (!manualEntry.project_id || !manualEntry.task_description.trim() || manualEntry.hours <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const project = projects.find(p => p.id === manualEntry.project_id);
      if (!project) return;

      const timeEntry = await financialService.createTimeEntry({
        project_id: manualEntry.project_id,
        project: project,
        user_id: 'current_user',
        user_name: 'Current User',
        task_description: manualEntry.task_description.trim(),
        hours: manualEntry.hours,
        billable: manualEntry.billable,
        billable_rate: project.hourly_rate,
        entry_date: manualEntry.entry_date,
        is_running: false
      });

      setTimeEntries(prev => [timeEntry, ...prev]);
      setManualEntry({
        project_id: '',
        task_description: '',
        hours: 0,
        entry_date: format(new Date(), 'yyyy-MM-dd'),
        billable: true
      });
      setShowManualEntry(false);
    } catch (error) {
      console.error('Error adding manual entry:', error);
    }
  };

  const formatDuration = (hours: number): string => {
    const totalMinutes = Math.floor(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const getSessionDuration = (session: TimeTrackingSession): string => {
    const startTime = parseISO(session.start_time);
    const duration = (currentTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return formatDuration(duration);
  };

  // Calculate summary statistics
  const todayEntries = timeEntries.filter(entry => isToday(parseISO(entry.entry_date)));
  const thisWeekEntries = timeEntries.filter(entry => {
    const entryDate = parseISO(entry.entry_date);
    return entryDate >= startOfWeek(selectedDate) && entryDate <= endOfWeek(selectedDate);
  });

  const todayHours = todayEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const thisWeekHours = thisWeekEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const todayEarnings = todayEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + (entry.hours * (entry.billable_rate || 0)), 0);
  const thisWeekEarnings = thisWeekEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + (entry.hours * (entry.billable_rate || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Time Tracking</h1>
          <p className="text-gray-400 mt-1">Track time spent on projects and tasks</p>
        </div>
        <button
          onClick={() => setShowManualEntry(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Time</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Today</p>
              <p className="text-3xl font-bold text-white">{formatDuration(todayHours)}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">This Week</p>
              <p className="text-3xl font-bold text-white">{formatDuration(thisWeekHours)}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Today Earnings</p>
              <p className="text-3xl font-bold text-white">
                ${todayEarnings.toFixed(0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Active Sessions</p>
              <p className="text-3xl font-bold text-white">{activeSessions.length}</p>
            </div>
            <Timer className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Tracker */}
        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Start Time Tracking</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Task Description
              </label>
              <input
                type="text"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="What are you working on?"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={startTimer}
              disabled={!selectedProject || !taskDescription.trim()}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>Start Timer</span>
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Active Sessions</h2>

          {activeSessions.length === 0 ? (
            <div className="text-center py-8">
              <Timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No active sessions</p>
              <p className="text-gray-400 text-sm mt-1">Start tracking time to see sessions here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map(session => {
                const project = projects.find(p => p.id === session.project_id);
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-green-500/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="font-medium text-white">{project?.name}</h3>
                        <p className="text-gray-400 text-sm">{session.task_description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400 text-sm font-mono">
                            {getSessionDuration(session)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => stopTimer(session.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Square className="w-4 h-4" />
                        <span>Stop</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Time Entries */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Time Entries</h2>
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(parseISO(e.target.value))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : timeEntries.length > 0 ? (
          <div className="space-y-4">
            {timeEntries.slice(0, 10).map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-white">{entry.project.name}</h3>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-400 text-sm">{entry.project.client.name}</span>
                    {entry.billable ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-1">{entry.task_description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>{format(parseISO(entry.entry_date), 'MMM dd, yyyy')}</span>
                    {entry.start_time && entry.end_time && (
                      <span>{entry.start_time} - {entry.end_time}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    {formatDuration(entry.hours)}
                  </div>
                  {entry.billable && entry.billable_rate && (
                    <div className="text-sm text-green-400">
                      ${(entry.hours * entry.billable_rate).toFixed(2)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No time entries yet</h3>
            <p className="text-gray-400 mb-6">Start tracking time to see your entries here</p>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showManualEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowManualEntry(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gray-900 rounded-2xl shadow-2xl border border-white/20 p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-6">Add Manual Time Entry</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project
                  </label>
                  <select
                    value={manualEntry.project_id}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, project_id: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Task Description
                  </label>
                  <input
                    type="text"
                    value={manualEntry.task_description}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, task_description: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hours
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={manualEntry.hours}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={manualEntry.entry_date}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, entry_date: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="billable"
                    checked={manualEntry.billable}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, billable: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="billable" className="ml-2 text-sm text-gray-300">
                    Billable time
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowManualEntry(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addManualEntry}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Add Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeTracking;