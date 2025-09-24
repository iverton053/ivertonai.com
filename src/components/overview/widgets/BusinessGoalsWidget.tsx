import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { BusinessGoal } from '../../../types/overview';
import { formatDate, getRelativeTime } from '../../../utils/dateHelpers';

interface BusinessGoalsWidgetProps {
  goals: BusinessGoal[];
}

const BusinessGoalsWidget: React.FC<BusinessGoalsWidgetProps> = ({ goals }) => {
  const getStatusIcon = (status: BusinessGoal['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'on-track':
        return TrendingUp;
      case 'at-risk':
        return AlertTriangle;
      case 'off-track':
        return AlertTriangle;
      default:
        return Target;
    }
  };

  const getStatusColor = (status: BusinessGoal['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'on-track':
        return 'text-blue-400 bg-blue-400/10';
      case 'at-risk':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'off-track':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPriorityColor = (priority: BusinessGoal['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-400/30 bg-red-400/5';
      case 'medium':
        return 'border-yellow-400/30 bg-yellow-400/5';
      case 'low':
        return 'border-green-400/30 bg-green-400/5';
      default:
        return 'border-gray-400/30 bg-gray-400/5';
    }
  };

  const formatGoalValue = (value: number, category: BusinessGoal['category']) => {
    switch (category) {
      case 'revenue':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'engagement':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'from-green-500 to-emerald-400';
    if (progress >= 70) return 'from-blue-500 to-cyan-400';
    if (progress >= 50) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-rose-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-effect rounded-xl p-6 h-fit"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-400" />
            Business Goals
          </h3>
          <p className="text-gray-400 text-sm">{goals.length} active goals</p>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors text-sm">
          Manage Goals
          <ArrowRight className="w-3 h-3 ml-1 inline" />
        </button>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-6">
            <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No business goals set</p>
            <p className="text-gray-500 text-xs">Create goals to track your progress</p>
          </div>
        ) : (
          goals.slice(0, 4).map((goal, index) => {
            const StatusIcon = getStatusIcon(goal.status);
            const isDeadlineNear = new Date(goal.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`border rounded-lg p-4 transition-all hover:border-gray-600/50 ${getPriorityColor(goal.priority)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="text-white text-sm font-medium">{goal.title}</h4>
                      <div className="ml-2 flex items-center gap-1">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {goal.status.replace('-', ' ')}
                        </div>
                        {goal.priority === 'high' && (
                          <div className="px-2 py-1 bg-red-400/10 text-red-400 rounded-full text-xs">
                            High Priority
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 capitalize mb-2">
                      {goal.category.replace('-', ' ')} Goal
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs text-white font-medium">{goal.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                      className={`bg-gradient-to-r ${getProgressColor(goal.progress)} h-2 rounded-full relative`}
                    >
                      {goal.progress > 10 && (
                        <div className="absolute -right-1 -top-1 w-4 h-4 bg-white rounded-full border-2 border-gray-800 shadow-lg"></div>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Current vs Target */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-lg font-bold text-white">
                      {formatGoalValue(goal.current, goal.category)}
                    </div>
                    <div className="text-xs text-gray-400">Current</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-300">
                      {formatGoalValue(goal.target, goal.category)}
                    </div>
                    <div className="text-xs text-gray-400">Target</div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Due {getRelativeTime(goal.deadline)}</span>
                    {isDeadlineNear && (
                      <AlertTriangle className="w-3 h-3 ml-1 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-gray-500">
                    Updated {getRelativeTime(goal.lastUpdated)}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      {goals.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-400">
                {goals.filter(g => g.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-400">
                {goals.filter(g => g.status === 'on-track').length}
              </div>
              <div className="text-xs text-gray-400">On Track</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-400">
                {goals.filter(g => g.status === 'at-risk').length}
              </div>
              <div className="text-xs text-gray-400">At Risk</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BusinessGoalsWidget;