import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Reply, Heart, MoreVertical, 
  Send, AtSign, Pin, Clock, Check, X, Edit3,
  AlertCircle, ChevronDown, ChevronRight, User
} from 'lucide-react';
import { ApprovalComment, CommentStatus, CommentType } from '../../types/contentApproval';
import { useContentApprovalStore } from '../../stores/contentApprovalStore';

interface CommentSystemProps {
  contentId: string;
  isClientView?: boolean;
  className?: string;
}

interface MentionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const CommentSystem: React.FC<CommentSystemProps> = ({
  contentId,
  isClientView = false,
  className = ''
}) => {
  const { contentItems, addComment, updateComment, resolveComment } = useContentApprovalStore();
  const content = contentItems.find(item => item.id === contentId);
  
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  // Mock users for mentions (in a real app, this would come from your user system)
  const availableUsers: MentionUser[] = [
    { id: 'user1', name: 'Sarah Johnson', email: 'sarah@agency.com' },
    { id: 'user2', name: 'Mike Chen', email: 'mike@agency.com' },
    { id: 'user3', name: 'Emily Davis', email: 'emily@agency.com' },
    { id: 'user4', name: 'Tom Wilson', email: 'tom@agency.com' },
    { id: 'client1', name: 'John Smith', email: 'john@client.com' }
  ];

  const comments = content?.comments || [];

  // Organize comments into threads
  const threadedComments = useMemo(() => {
    const commentMap = new Map<string, ApprovalComment & { replies: ApprovalComment[] }>();
    
    // First pass: create all comments with empty replies array
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into threads
    const rootComments: (ApprovalComment & { replies: ApprovalComment[] })[] = [];
    
    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    // Sort by timestamp
    rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    rootComments.forEach(thread => {
      thread.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    return rootComments;
  }, [comments]);

  const filteredMentions = useMemo(() => {
    if (!mentionQuery) return availableUsers;
    return availableUsers.filter(user =>
      user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(mentionQuery.toLowerCase())
    );
  }, [mentionQuery]);

  const handleCommentSubmit = (parentId?: string) => {
    if (!newComment.trim()) return;

    // Extract mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(newComment)) !== null) {
      const user = availableUsers.find(u => u.name.toLowerCase().includes(match[1].toLowerCase()));
      if (user) mentions.push(user.id);
    }

    const commentData = {
      text: newComment,
      type: 'general' as CommentType,
      mentions,
      parentId
    };

    addComment(contentId, commentData);
    setNewComment('');
    setReplyToId(null);
    setShowMentions(false);
  };

  const handleTextChange = (value: string) => {
    setNewComment(value);
    
    // Check for @ mentions
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const insertMention = (user: MentionUser) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = newComment.substring(0, cursorPosition);
    const textAfterCursor = newComment.substring(cursorPosition);
    
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.substring(0, mentionMatch.index);
      const newText = `${beforeMention}@${user.name} ${textAfterCursor}`;
      setNewComment(newText);
    }
    
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStatusColor = (status: CommentStatus) => {
    const colors = {
      active: 'text-blue-400',
      resolved: 'text-green-400',
      archived: 'text-gray-400'
    };
    return colors[status];
  };

  const getTypeIcon = (type: CommentType) => {
    const icons = {
      general: MessageSquare,
      approval: Check,
      revision: Edit3,
      question: AlertCircle
    };
    return icons[type] || MessageSquare;
  };

  const CommentItem: React.FC<{ 
    comment: ApprovalComment & { replies: ApprovalComment[] };
    isReply?: boolean;
    level?: number;
  }> = ({ comment, isReply = false, level = 0 }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const isCollapsed = collapsedThreads.has(comment.id);
    const TypeIcon = getTypeIcon(comment.type);

    const toggleCollapse = () => {
      const newCollapsed = new Set(collapsedThreads);
      if (isCollapsed) {
        newCollapsed.delete(comment.id);
      } else {
        newCollapsed.add(comment.id);
      }
      setCollapsedThreads(newCollapsed);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          group relative
          ${isReply ? 'ml-8 border-l-2 border-gray-700 pl-4' : ''}
          ${level > 2 ? 'ml-4' : ''}
        `}
      >
        <div
          className={`
            p-4 rounded-lg border transition-all
            ${comment.status === 'resolved' ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}
            ${showActions ? 'border-purple-400/30' : ''}
            ${!isReply ? 'mb-3' : 'mb-2'}
          `}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Comment header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-medium text-white">
                {comment.author.split('.')[0].charAt(0).toUpperCase()}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{comment.author.split('.')[0]}</span>
                  <TypeIcon className={`w-4 h-4 ${getStatusColor(comment.status)}`} />
                  {comment.isPinned && <Pin className="w-4 h-4 text-yellow-400" />}
                  {comment.type !== 'general' && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(comment.status)} bg-current/10`}>
                      {comment.type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(comment.createdAt)}</span>
                  {comment.editedAt && (
                    <span className="text-gray-400">(edited)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
              {!isClientView && comment.status === 'active' && (
                <button
                  onClick={() => resolveComment(contentId, comment.id)}
                  className="p-1.5 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                  title="Resolve comment"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-1.5 rounded-lg transition-colors ${isLiked ? 'text-red-400 bg-red-900/200/20' : 'hover:bg-white/10 text-gray-400'}`}
                title="Like comment"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => setReplyToId(comment.id)}
                className="p-1.5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"
                title="Reply to comment"
              >
                <Reply className="w-4 h-4" />
              </button>

              {!isReply && comment.replies.length > 0 && (
                <button
                  onClick={toggleCollapse}
                  className="p-1.5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"
                  title={isCollapsed ? 'Expand thread' : 'Collapse thread'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}

              <button
                className="p-1.5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"
                title="More actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comment content */}
          <div className="text-gray-300 text-sm mb-3 leading-relaxed whitespace-pre-wrap">
            {comment.text}
          </div>

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {comment.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs"
                >
                  <span>{attachment}</span>
                </div>
              ))}
            </div>
          )}

          {/* Comment footer */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              {comment.replies.length > 0 && (
                <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
              )}
              {comment.likes && comment.likes > 0 && (
                <span>{comment.likes} {comment.likes === 1 ? 'like' : 'likes'}</span>
              )}
            </div>

            {comment.mentions && comment.mentions.length > 0 && (
              <div className="flex items-center gap-1">
                <AtSign className="w-3 h-3" />
                <span>{comment.mentions.length} mentioned</span>
              </div>
            )}
          </div>

          {/* Reply form for this specific comment */}
          {replyToId === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-medium text-white">
                  U
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder={`Reply to ${comment.author.split('.')[0]}...`}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm resize-none"
                    rows={2}
                    ref={textareaRef}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setReplyToId(null);
                        setNewComment('');
                      }}
                      className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCommentSubmit(comment.id)}
                      disabled={!newComment.trim()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Replies */}
        {!isCollapsed && comment.replies.length > 0 && (
          <AnimatePresence>
            <div className="space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={{ ...reply, replies: [] }}
                  isReply={true}
                  level={level + 1}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    );
  };

  if (!content) {
    return <div className="text-gray-400">Content not found</div>;
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">
            Comments ({comments.length})
          </h3>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{comments.filter(c => c.status === 'active').length} active</span>
          <span>•</span>
          <span>{comments.filter(c => c.status === 'resolved').length} resolved</span>
        </div>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {threadedComments.length > 0 ? (
            <div className="space-y-4">
              {threadedComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No comments yet</p>
              <p className="text-sm text-center">
                {isClientView 
                  ? "Start the conversation by leaving your feedback below."
                  : "Be the first to comment on this content."
                }
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* New comment form */}
      {!editingId && (
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-medium text-white">
              U
            </div>
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Add a comment... Use @ to mention someone"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm resize-none focus:border-purple-400 focus:outline-none"
                rows={3}
                ref={textareaRef}
              />

              {/* Mentions dropdown */}
              {showMentions && (
                <motion.div
                  ref={mentionsRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10"
                >
                  {filteredMentions.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => insertMention(user)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center gap-3"
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-medium text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white text-sm">{user.name}</div>
                        <div className="text-gray-400 text-xs">{user.email}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}

              <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-gray-400">
                  Tip: Use @ to mention team members and clients
                </div>
                <button
                  onClick={() => handleCommentSubmit()}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSystem;