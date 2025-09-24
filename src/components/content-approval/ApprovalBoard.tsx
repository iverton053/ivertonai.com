import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, User, MessageCircle, AlertTriangle, 
  CheckCircle, Eye, Edit2, Share2, MoreVertical, 
  Flag, Zap, Users, Tag, GitCompare
} from 'lucide-react';
import { useContentApprovalStore } from '../../stores/contentApprovalStore';
import { ContentItem, ApprovalStatus, Priority } from '../../types/contentApproval';
import VersionComparison from './VersionComparison';
import BulkActions from './BulkActions';

const ApprovalBoard: React.FC = () => {
  const {
    contentItems,
    boardColumns,
    selectedItems,
    updateContent,
    setSelectedItems,
    toggleItemSelection,
    bulkUpdateStatus,
    generateReviewLink,
    advanceToNextStage,
    approveContent,
    rejectContent,
    requestRevision
  } = useContentApprovalStore();

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showVersionComparison, setShowVersionComparison] = useState<string | null>(null);

  // Group content by status
  const contentByStatus = useMemo(() => {
    return boardColumns.reduce((acc, status) => {
      acc[status] = contentItems
        .filter((item) => item.status === status)
        .sort((a, b) => {
          // Sort by priority first, then by due date
          if (a.priority !== b.priority) {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          if (a.dueDate && b.dueDate) {
            const dateA = typeof a.dueDate === 'string' ? new Date(a.dueDate) : a.dueDate;
            const dateB = typeof b.dueDate === 'string' ? new Date(b.dueDate) : b.dueDate;
            return dateA.getTime() - dateB.getTime();
          }
          const createdA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
          const createdB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
          return createdB.getTime() - createdA.getTime();
        });
      return acc;
    }, {} as Record<ApprovalStatus, ContentItem[]>);
  }, [contentItems, boardColumns]);

  const handleDragEnd = (result: DropResult) => {
    setDraggedItemId(null);

    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as ApprovalStatus;
    updateContent(draggableId, { status: newStatus });
  };

  const handleDragStart = (start: any) => {
    setDraggedItemId(start.draggableId);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(targetDate.getTime())) return '';
    
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays}d remaining`;
  };

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      urgent: 'bg-red-900/200',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority];
  };

  const getStatusInfo = (status: ApprovalStatus) => {
    const statusConfig = {
      draft: { name: 'Draft', color: 'bg-gray-500', icon: Edit2 },
      pending: { name: 'Pending', color: 'bg-blue-900/200', icon: Clock },
      'in-review': { name: 'In Review', color: 'bg-purple-500', icon: Eye },
      'revision-requested': { name: 'Revision Requested', color: 'bg-orange-500', icon: AlertTriangle },
      approved: { name: 'Approved', color: 'bg-green-500', icon: CheckCircle },
      rejected: { name: 'Rejected', color: 'bg-red-900/200', icon: AlertTriangle },
      published: { name: 'Published', color: 'bg-emerald-500', icon: Zap },
      scheduled: { name: 'Scheduled', color: 'bg-indigo-500', icon: Calendar }
    };
    return statusConfig[status];
  };

  const ContentCard: React.FC<{ 
    item: ContentItem; 
    index: number; 
    isDragging?: boolean 
  }> = ({ item, index, isDragging = false }) => {
    const isSelected = selectedItems.includes(item.id);
    const dueDate = item.dueDate ? (typeof item.dueDate === 'string' ? new Date(item.dueDate) : item.dueDate) : null;
    const isOverdue = dueDate && dueDate < new Date() && !['approved', 'published'].includes(item.status);
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <Draggable draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`group relative ${isDragging ? 'rotate-2' : ''}`}
          >
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.02 }}
              className={`
                bg-white/10 backdrop-blur-sm border rounded-xl p-4 mb-3 cursor-pointer transition-all
                ${isSelected ? 'border-purple-400 bg-purple-500/20' : 'border-white/20 hover:border-white/40'}
                ${snapshot.isDragging ? 'rotate-3 shadow-2xl z-50' : ''}
                ${isOverdue ? 'border-red-400/50 bg-red-900/200/10' : ''}
              `}
              onClick={() => toggleItemSelection(item.id)}
            >
              {/* Priority indicator */}
              <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${getPriorityColor(item.priority)}`} />
              
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="capitalize">{item.contentType.replace('-', ' ')}</span>
                    <span>•</span>
                    <span className="capitalize">{item.platform}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContentId(item.id);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {item.versions.length >= 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowVersionComparison(item.id);
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Compare versions"
                    >
                      <GitCompare className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      generateReviewLink(item.id, item.clientId);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title="Generate review link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title="More options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content preview */}
              {item.versions.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {item.versions[item.versions.length - 1].content.body}
                  </p>
                </div>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-white/10 text-gray-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-600/50 text-gray-400 rounded-full">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Assignees */}
              {item.assignedTo.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div className="flex -space-x-1">
                    {item.assignedTo.slice(0, 3).map((userId, idx) => (
                      <div
                        key={userId}
                        className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-medium text-white"
                        style={{ zIndex: 10 - idx }}
                      >
                        {userId.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {item.assignedTo.length > 3 && (
                      <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs text-white">
                        +{item.assignedTo.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  {item.dueDate && (
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.dueDate)}</span>
                    </div>
                  )}
                  
                  {item.totalComments > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{item.totalComments}</span>
                      {item.unresolvedComments > 0 && (
                        <span className="text-orange-400">({item.unresolvedComments})</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{item.createdBy.split('.')[0]}</span>
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-purple-400 fill-purple-400" />
                </div>
              )}

              {/* Overdue indicator */}
              {isOverdue && (
                <div className="absolute top-2 left-3">
                  <Flag className="w-4 h-4 text-red-400 fill-red-400" />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </Draggable>
    );
  };

  const StatusColumn: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
    const items = contentByStatus[status] || [];
    const statusInfo = getStatusInfo(status);
    const StatusIcon = statusInfo.icon;

    return (
      <div className="flex flex-col h-full min-w-80">
        {/* Column header */}
        <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${statusInfo.color}/20`}>
              <StatusIcon className={`w-5 h-5 text-${statusInfo.color.split('-')[1]}-400`} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{statusInfo.name}</h3>
              <p className="text-sm text-gray-400">{items.length} items</p>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  // Select all items in this column
                  setSelectedItems(items.map(item => item.id));
                  setShowBulkActions(true);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Select all in column"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Column content */}
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                flex-1 p-4 transition-colors min-h-96
                ${snapshot.isDraggingOver ? 'bg-white/5' : ''}
              `}
            >
              <AnimatePresence>
                {items.map((item, index) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    index={index}
                    isDragging={draggedItemId === item.id}
                  />
                ))}
              </AnimatePresence>
              {provided.placeholder}

              {/* Empty state */}
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <StatusIcon className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">No items in {statusInfo.name.toLowerCase()}</p>
                  <p className="text-xs text-gray-400 mt-1">Drag content here</p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Bulk Actions */}
      <BulkActions 
        selectedItems={selectedItems}
        onClearSelection={() => setSelectedItems([])}
      />

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div className="flex h-full overflow-x-auto">
            {boardColumns.map((status) => (
              <StatusColumn key={status} status={status} />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Quick stats */}
      <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-900/200 rounded-full" />
            <span>{contentItems.filter(item => {
              const dueDate = item.dueDate ? (typeof item.dueDate === 'string' ? new Date(item.dueDate) : item.dueDate) : null;
              return dueDate && dueDate < new Date() && !['approved', 'published'].includes(item.status);
            }).length} Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span>{contentItems.filter(item => ['pending', 'in-review'].includes(item.status)).length} In Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>{contentItems.filter(item => item.status === 'approved').length} Approved Today</span>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          Total: {contentItems.length} content items
        </div>
      </div>

      {/* Version Comparison Modal */}
      <AnimatePresence>
        {showVersionComparison && (
          <VersionComparison
            contentId={showVersionComparison}
            onClose={() => setShowVersionComparison(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApprovalBoard;