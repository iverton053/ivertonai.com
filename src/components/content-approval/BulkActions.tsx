import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, X, Clock, AlertTriangle, 
  Calendar, Send, Users, Tag, Download,
  Copy, Archive, Trash2, Share2, Settings,
  ChevronDown, Filter, Target
} from 'lucide-react';
import { useContentApprovalStore } from '../../stores/contentApprovalStore';
import { ApprovalStatus, Priority } from '../../types/contentApproval';

interface BulkActionsProps {
  selectedItems: string[];
  onClearSelection: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({ selectedItems, onClearSelection }) => {
  const { 
    contentItems,
    bulkUpdateStatus,
    bulkApprove,
    bulkReject,
    bulkAssign,
    bulkSchedule,
    generateReviewLink,
    updateContent
  } = useContentApprovalStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bulkScheduleDate, setBulkScheduleDate] = useState('');
  const [bulkAssignees, setBulkAssignees] = useState<string[]>([]);
  const [bulkTags, setBulkTags] = useState('');
  const [bulkPriority, setBulkPriority] = useState<Priority>('medium');
  const [bulkRejectionReason, setBulkRejectionReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState<{
    action: string;
    items: number;
    callback: () => void;
  } | null>(null);

  // Mock users for assignee selection
  const availableUsers = [
    'sarah.johnson@agency.com',
    'mike.chen@agency.com',
    'emily.davis@agency.com',
    'tom.wilson@agency.com',
    'john.smith@client.com'
  ];

  const selectedContentItems = contentItems.filter(item => selectedItems.includes(item.id));
  const statusCounts = selectedContentItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<ApprovalStatus, number>);

  const handleBulkAction = (action: string, callback: () => void, requiresConfirmation = true) => {
    if (requiresConfirmation) {
      setShowConfirmation({
        action,
        items: selectedItems.length,
        callback
      });
    } else {
      callback();
    }
  };

  const confirmAndExecute = () => {
    if (showConfirmation) {
      showConfirmation.callback();
      setShowConfirmation(null);
    }
  };

  const handleBulkApprove = () => {
    bulkApprove(selectedItems, 'bulk-approver');
    onClearSelection();
  };

  const handleBulkReject = () => {
    if (!bulkRejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    bulkReject(selectedItems, 'bulk-rejector', bulkRejectionReason);
    setBulkRejectionReason('');
    onClearSelection();
  };

  const handleBulkSchedule = () => {
    if (!bulkScheduleDate) {
      alert('Please select a schedule date');
      return;
    }
    bulkSchedule(selectedItems, new Date(bulkScheduleDate));
    setBulkScheduleDate('');
    onClearSelection();
  };

  const handleBulkAssign = () => {
    if (bulkAssignees.length === 0) {
      alert('Please select at least one assignee');
      return;
    }
    bulkAssign(selectedItems, bulkAssignees);
    setBulkAssignees([]);
    onClearSelection();
  };

  const handleBulkTagUpdate = () => {
    if (!bulkTags.trim()) return;
    
    const tagsArray = bulkTags.split(',').map(tag => tag.trim()).filter(Boolean);
    selectedItems.forEach(id => {
      const content = contentItems.find(item => item.id === id);
      if (content) {
        const uniqueTags = Array.from(new Set([...content.tags, ...tagsArray]));
        updateContent(id, { tags: uniqueTags });
      }
    });
    setBulkTags('');
    onClearSelection();
  };

  const handleBulkPriorityUpdate = () => {
    selectedItems.forEach(id => {
      updateContent(id, { priority: bulkPriority });
    });
    onClearSelection();
  };

  const handleBulkDuplicate = () => {
    // Implementation would depend on duplicate functionality in store
    selectedItems.forEach(id => {
      // duplicateContent(id); // Assuming this method exists
    });
    onClearSelection();
  };

  const handleBulkExport = () => {
    const exportData = selectedContentItems.map(item => ({
      id: item.id,
      title: item.title,
      status: item.status,
      contentType: item.contentType,
      platform: item.platform,
      createdAt: item.createdAt,
      dueDate: item.dueDate
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-export-${selectedItems.length}-items-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkGenerateReviewLinks = () => {
    selectedItems.forEach(id => {
      const content = contentItems.find(item => item.id === id);
      if (content) {
        generateReviewLink(id, content.clientId);
      }
    });
    onClearSelection();
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="sticky top-0 z-40 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 backdrop-blur-sm border-b border-purple-500/30"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Selection Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-purple-200">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <span key={status}>
                        {count} {status.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('Approve All', handleBulkApprove)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve All</span>
              </button>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>More Actions</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={onClearSelection}
                className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Advanced Actions Panel */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/20"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Status Changes */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/90">Status Changes</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleBulkAction('Move to Pending', () => bulkUpdateStatus(selectedItems, 'pending'))}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg text-white text-xs transition-colors"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </button>
                      <button
                        onClick={() => handleBulkAction('Reject All', () => {
                          if (!bulkRejectionReason.trim()) {
                            setBulkRejectionReason(prompt('Rejection reason:') || '');
                          }
                          handleBulkReject();
                        })}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-white text-xs transition-colors"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleBulkAction('Archive All', () => bulkUpdateStatus(selectedItems, 'draft'))}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-600/80 hover:bg-gray-600 rounded-lg text-white text-xs transition-colors"
                      >
                        <Archive className="w-3 h-3" />
                        <span>Archive</span>
                      </button>
                      <button
                        onClick={() => handleBulkAction('Publish All', () => bulkUpdateStatus(selectedItems, 'published'))}
                        className="flex items-center space-x-2 px-3 py-2 bg-emerald-600/80 hover:bg-emerald-600 rounded-lg text-white text-xs transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Publish</span>
                      </button>
                    </div>
                  </div>

                  {/* Scheduling & Assignment */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/90">Schedule & Assign</h4>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="datetime-local"
                          value={bulkScheduleDate}
                          onChange={(e) => setBulkScheduleDate(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                        />
                        <button
                          onClick={() => handleBulkAction('Schedule All', handleBulkSchedule)}
                          disabled={!bulkScheduleDate}
                          className="px-2 py-1 bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-50 rounded text-white text-xs"
                        >
                          <Calendar className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <select
                          multiple
                          value={bulkAssignees}
                          onChange={(e) => setBulkAssignees(Array.from(e.target.selectedOptions, option => option.value))}
                          className="flex-1 px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white"
                          size={2}
                        >
                          {availableUsers.map(user => (
                            <option key={user} value={user} className="bg-gray-800">
                              {user.split('@')[0]}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleBulkAction('Assign All', handleBulkAssign)}
                          disabled={bulkAssignees.length === 0}
                          className="px-2 py-1 bg-purple-600/80 hover:bg-purple-600 disabled:opacity-50 rounded text-white text-xs"
                        >
                          <Users className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metadata & Export */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/90">Metadata & Export</h4>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Add tags (comma separated)"
                          value={bulkTags}
                          onChange={(e) => setBulkTags(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                        />
                        <button
                          onClick={() => handleBulkAction('Add Tags', handleBulkTagUpdate)}
                          disabled={!bulkTags.trim()}
                          className="px-2 py-1 bg-yellow-600/80 hover:bg-yellow-600 disabled:opacity-50 rounded text-white text-xs"
                        >
                          <Tag className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <select
                          value={bulkPriority}
                          onChange={(e) => setBulkPriority(e.target.value as Priority)}
                          className="flex-1 px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent Priority</option>
                        </select>
                        <button
                          onClick={() => handleBulkAction('Update Priority', handleBulkPriorityUpdate)}
                          className="px-2 py-1 bg-orange-600/80 hover:bg-orange-600 rounded text-white text-xs"
                        >
                          <Target className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={handleBulkExport}
                          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-gray-600/80 hover:bg-gray-600 rounded text-white text-xs"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export</span>
                        </button>
                        <button
                          onClick={() => handleBulkAction('Generate Review Links', handleBulkGenerateReviewLinks)}
                          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-blue-600/80 hover:bg-blue-600 rounded text-white text-xs"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Links</span>
                        </button>
                        <button
                          onClick={() => handleBulkAction('Duplicate All', handleBulkDuplicate)}
                          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-teal-600/80 hover:bg-teal-600 rounded text-white text-xs"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Bulk Action
              </h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to <strong>{showConfirmation.action.toLowerCase()}</strong> for{' '}
                <strong>{showConfirmation.items} item{showConfirmation.items !== 1 ? 's' : ''}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmation(null)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAndExecute}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BulkActions;