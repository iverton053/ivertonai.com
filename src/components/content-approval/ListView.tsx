import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Eye, Edit2, Share2, MessageCircle,
  Clock, User, Flag, CheckCircle, XCircle, AlertTriangle,
  MoreVertical, Calendar, Tag, ExternalLink
} from 'lucide-react';
import { useContentApprovalStore } from '../../stores/contentApprovalStore';
import { ContentItem, ApprovalStatus, Priority } from '../../types/contentApproval';
import ContentPreviewModal from './ContentPreviewModal';
import ContentEditModal from './ContentEditModal';

const ListView: React.FC = () => {
  const {
    contentItems,
    selectedItems,
    sortBy,
    sortOrder,
    toggleItemSelection,
    setSorting,
    generateReviewLink,
    approveContent,
    rejectContent,
    requestRevision
  } = useContentApprovalStore();

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const toggleExpanded = useCallback((id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  }, [expandedItems]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSorting(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSorting(field, 'asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className=\"w-4 h-4 text-green-500\" />;
      case 'rejected':
        return <XCircle className=\"w-4 h-4 text-red-500\" />;
      case 'revision-requested':
        return <AlertTriangle className=\"w-4 h-4 text-orange-500\" />;
      case 'pending':
      case 'in-review':
        return <Clock className=\"w-4 h-4 text-blue-500\" />;
      default:
        return <div className=\"w-4 h-4 rounded-full bg-gray-300\" />;
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    return targetDate.toLocaleDateString();
  };

  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return '-';
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleQuickApprove = async (contentId: string) => {
    try {
      await approveContent('current-user-id', contentId, 'Quick approve from list view');
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleQuickReject = async (contentId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await rejectContent('current-user-id', contentId, reason);
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Rejection failed:', error);
    }
  };

  return (
    <div className=\"h-full flex flex-col bg-white\">
      {/* Table Header */}
      <div className=\"border-b border-gray-200 bg-gray-50\">
        <div className=\"grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider\">
          <div className=\"col-span-1 flex items-center\">
            <input
              type=\"checkbox\"
              className=\"rounded border-gray-300\"
              checked={selectedItems.length === contentItems.length && contentItems.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  // Select all logic
                } else {
                  // Clear selection logic
                }
              }}
            />
          </div>
          <div className=\"col-span-3\">
            <button
              onClick={() => handleSort('title')}
              className=\"flex items-center hover:text-gray-700\"
            >
              Title {getSortIcon('title')}
            </button>
          </div>
          <div className=\"col-span-2\">
            <button
              onClick={() => handleSort('status')}
              className=\"flex items-center hover:text-gray-700\"
            >
              Status {getSortIcon('status')}
            </button>
          </div>
          <div className=\"col-span-1\">
            <button
              onClick={() => handleSort('priority')}
              className=\"flex items-center hover:text-gray-700\"
            >
              Priority {getSortIcon('priority')}
            </button>
          </div>
          <div className=\"col-span-2\">
            <button
              onClick={() => handleSort('createdBy')}
              className=\"flex items-center hover:text-gray-700\"
            >
              Creator {getSortIcon('createdBy')}
            </button>
          </div>
          <div className=\"col-span-2\">
            <button
              onClick={() => handleSort('dueDate')}
              className=\"flex items-center hover:text-gray-700\"
            >
              Due Date {getSortIcon('dueDate')}
            </button>
          </div>
          <div className=\"col-span-1\">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className=\"flex-1 overflow-auto\">
        {contentItems.map((item, index) => {
          const isExpanded = expandedItems.has(item.id);
          const isSelected = selectedItems.includes(item.id);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border-b border-gray-100 hover:bg-gray-50 ${
                isSelected ? 'bg-blue-50' : ''
              }`}
            >
              <div className=\"grid grid-cols-12 gap-4 px-6 py-4 items-center\">
                {/* Checkbox */}
                <div className=\"col-span-1 flex items-center\">
                  <input
                    type=\"checkbox\"
                    className=\"rounded border-gray-300\"
                    checked={isSelected}
                    onChange={() => toggleItemSelection(item.id)}
                  />
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className=\"ml-2 p-1 hover:bg-gray-200 rounded\"
                  >
                    {isExpanded ? (
                      <ChevronDown className=\"w-4 h-4 text-gray-400\" />
                    ) : (
                      <ChevronRight className=\"w-4 h-4 text-gray-400\" />
                    )}
                  </button>
                </div>

                {/* Title */}
                <div className=\"col-span-3\">
                  <div className=\"flex items-start space-x-2\">
                    <div>
                      <h3 className=\"text-sm font-medium text-gray-900 line-clamp-1\">
                        {item.title}
                      </h3>
                      <p className=\"text-xs text-gray-500 mt-1 line-clamp-1\">
                        {item.description || 'No description'}
                      </p>
                      <div className=\"flex items-center space-x-2 mt-1\">
                        <span className=\"text-xs text-gray-400\">{item.contentType}</span>
                        <span className=\"text-xs text-gray-400\">•</span>
                        <span className=\"text-xs text-gray-400\">{item.platform}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className=\"col-span-2\">
                  <div className=\"flex items-center space-x-2\">
                    {getStatusIcon(item.status)}
                    <span className=\"text-sm text-gray-900 capitalize\">
                      {item.status.replace('-', ' ')}
                    </span>
                  </div>
                  {item.assignedTo.length > 0 && (
                    <p className=\"text-xs text-gray-500 mt-1\">
                      Assigned to {item.assignedTo.length} user{item.assignedTo.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Priority */}
                <div className=\"col-span-1\">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>

                {/* Creator */}
                <div className=\"col-span-2\">
                  <div className=\"flex items-center space-x-2\">
                    <User className=\"w-4 h-4 text-gray-400\" />
                    <span className=\"text-sm text-gray-900\">{item.createdBy}</span>
                  </div>
                  <p className=\"text-xs text-gray-500 mt-1\">
                    {formatTimeAgo(item.createdAt)}
                  </p>
                </div>

                {/* Due Date */}
                <div className=\"col-span-2\">
                  {item.dueDate ? (
                    <div className=\"flex items-center space-x-2\">
                      <Calendar className=\"w-4 h-4 text-gray-400\" />
                      <span className=\"text-sm text-gray-900\">
                        {formatDate(item.dueDate)}
                      </span>
                    </div>
                  ) : (
                    <span className=\"text-sm text-gray-400\">No due date</span>
                  )}
                  {item.totalComments > 0 && (
                    <div className=\"flex items-center space-x-1 mt-1\">
                      <MessageCircle className=\"w-3 h-3 text-gray-400\" />
                      <span className=\"text-xs text-gray-500\">{item.totalComments}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className=\"col-span-1\">
                  <div className=\"flex items-center space-x-1\">
                    <button
                      onClick={() => setShowPreview(item.id)}
                      className=\"p-1 text-gray-400 hover:text-gray-600 rounded\"
                      title=\"Preview\"
                    >
                      <Eye className=\"w-4 h-4\" />
                    </button>
                    <button
                      onClick={() => setShowEdit(item.id)}
                      className=\"p-1 text-gray-400 hover:text-gray-600 rounded\"
                      title=\"Edit\"
                    >
                      <Edit2 className=\"w-4 h-4\" />
                    </button>
                    <div className=\"relative\">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)}
                        className=\"p-1 text-gray-400 hover:text-gray-600 rounded\"
                      >
                        <MoreVertical className=\"w-4 h-4\" />
                      </button>

                      {actionMenuOpen === item.id && (
                        <div className=\"absolute right-0 top-6 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10\">
                          <button
                            onClick={() => handleQuickApprove(item.id)}
                            className=\"w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center\"
                            disabled={item.status === 'approved'}
                          >
                            <CheckCircle className=\"w-4 h-4 mr-2\" />
                            Quick Approve
                          </button>
                          <button
                            onClick={() => handleQuickReject(item.id)}
                            className=\"w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center\"
                            disabled={item.status === 'rejected'}
                          >
                            <XCircle className=\"w-4 h-4 mr-2\" />
                            Quick Reject
                          </button>
                          <button
                            onClick={async () => {
                              const link = await generateReviewLink('current-user-id', item.id, 'client-id');
                              navigator.clipboard.writeText(link);
                              setActionMenuOpen(null);
                            }}
                            className=\"w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50 flex items-center\"
                          >
                            <Share2 className=\"w-4 h-4 mr-2\" />
                            Generate Review Link
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className=\"border-t border-gray-100 bg-gray-50 px-6 py-4\"
                >
                  <div className=\"grid grid-cols-2 gap-6\">
                    {/* Left Column */}
                    <div>
                      <h4 className=\"text-sm font-medium text-gray-900 mb-3\">Content Details</h4>
                      <div className=\"space-y-2 text-sm\">
                        <div className=\"flex justify-between\">
                          <span className=\"text-gray-500\">Content Type:</span>
                          <span className=\"text-gray-900 capitalize\">{item.contentType}</span>
                        </div>
                        <div className=\"flex justify-between\">
                          <span className=\"text-gray-500\">Platform:</span>
                          <span className=\"text-gray-900 capitalize\">{item.platform}</span>
                        </div>
                        <div className=\"flex justify-between\">
                          <span className=\"text-gray-500\">Versions:</span>
                          <span className=\"text-gray-900\">{item.versions.length}</span>
                        </div>
                        <div className=\"flex justify-between\">
                          <span className=\"text-gray-500\">Last Activity:</span>
                          <span className=\"text-gray-900\">{formatTimeAgo(item.lastActivityAt)}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className=\"mt-4\">
                          <h5 className=\"text-xs font-medium text-gray-500 mb-2\">Tags</h5>
                          <div className=\"flex flex-wrap gap-1\">
                            {item.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className=\"inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700\"
                              >
                                <Tag className=\"w-3 h-3 mr-1\" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div>
                      <h4 className=\"text-sm font-medium text-gray-900 mb-3\">Approval Progress</h4>
                      <div className=\"space-y-3\">
                        {/* Assigned To */}
                        {item.assignedTo.length > 0 && (
                          <div>
                            <p className=\"text-xs text-gray-500 mb-2\">Assigned To:</p>
                            <div className=\"flex flex-wrap gap-2\">
                              {item.assignedTo.slice(0, 3).map((assignee, idx) => (
                                <div key={idx} className=\"flex items-center space-x-1 text-sm\">
                                  <User className=\"w-4 h-4 text-gray-400\" />
                                  <span className=\"text-gray-900\">{assignee}</span>
                                </div>
                              ))}
                              {item.assignedTo.length > 3 && (
                                <span className=\"text-sm text-gray-500\">
                                  +{item.assignedTo.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Approved By */}
                        {item.approvedBy.length > 0 && (
                          <div>
                            <p className=\"text-xs text-gray-500 mb-2\">Approved By:</p>
                            <div className=\"flex flex-wrap gap-2\">
                              {item.approvedBy.slice(0, 3).map((approver, idx) => (
                                <div key={idx} className=\"flex items-center space-x-1 text-sm\">
                                  <CheckCircle className=\"w-4 h-4 text-green-500\" />
                                  <span className=\"text-gray-900\">{approver}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Review Links */}
                        {item.reviewLinks.length > 0 && (
                          <div>
                            <p className=\"text-xs text-gray-500 mb-2\">Review Links:</p>
                            <div className=\"space-y-1\">
                              {item.reviewLinks.slice(0, 2).map((link, idx) => (
                                <div key={idx} className=\"flex items-center justify-between text-sm\">
                                  <span className=\"text-gray-600\">
                                    {link.isActive ? 'Active' : 'Expired'}
                                  </span>
                                  <div className=\"flex items-center space-x-2\">
                                    <span className=\"text-gray-500\">{link.accessCount} views</span>
                                    <button
                                      onClick={() => window.open(link.url, '_blank')}
                                      className=\"text-blue-600 hover:text-blue-700\"
                                    >
                                      <ExternalLink className=\"w-3 h-3\" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {contentItems.length === 0 && (
          <div className=\"flex flex-col items-center justify-center py-12 text-gray-500\">
            <Flag className=\"w-12 h-12 text-gray-300 mb-4\" />
            <p className=\"text-lg font-medium\">No content found</p>
            <p className=\"text-sm\">Try adjusting your filters or create new content</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPreview && (
        <ContentPreviewModal
          contentId={showPreview}
          isOpen={true}
          onClose={() => setShowPreview(null)}
        />
      )}

      {showEdit && (
        <ContentEditModal
          contentId={showEdit}
          isOpen={true}
          onClose={() => setShowEdit(null)}
        />
      )}
    </div>
  );
};

export default ListView;