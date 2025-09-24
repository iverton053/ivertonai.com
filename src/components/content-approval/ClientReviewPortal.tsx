import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Download, MessageCircle, CheckCircle, XCircle, 
  Clock, Share2, Lock, Copy, ExternalLink, Calendar,
  ThumbsUp, ThumbsDown, Edit2, Palette, Users
} from 'lucide-react';
import { useContentApprovalStore } from '../../stores/contentApprovalStore';
import { ContentItem, ClientReviewLink, ApprovalComment } from '../../types/contentApproval';

interface ClientReviewPortalProps {
  contentId?: string;
  token?: string;
  isClientView?: boolean;
  onClose?: () => void;
}

const ClientReviewPortal: React.FC<ClientReviewPortalProps> = ({ 
  contentId, 
  token,
  isClientView = false,
  onClose 
}) => {
  const {
    contentItems,
    generateReviewLink,
    trackLinkAccess,
    addComment,
    approveContent,
    rejectContent,
    requestRevision
  } = useContentApprovalStore();

  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [selectedLink, setSelectedLink] = useState<ClientReviewLink | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);

  useEffect(() => {
    if (contentId) {
      const content = contentItems.find(item => item.id === contentId);
      setSelectedContent(content || null);
    } else if (token) {
      // Find content by review link token
      for (const content of contentItems) {
        const link = content.reviewLinks.find(link => link.token === token && link.isActive);
        if (link) {
          setSelectedContent(content);
          setSelectedLink(link);
          trackLinkAccess(link.id);
          break;
        }
      }
    }
  }, [contentId, token, contentItems, trackLinkAccess]);

  if (!selectedContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">Content Not Found</h3>
          <p className="text-gray-400">The content you're looking for doesn't exist or the link has expired.</p>
        </div>
      </div>
    );
  }

  const currentVersion = selectedContent.versions.find(v => v.id === selectedContent.currentVersionId) 
    || selectedContent.versions[selectedContent.versions.length - 1];

  const handleApprove = () => {
    if (isClientView && selectedLink) {
      approveContent(selectedContent.id, 'client-reviewer', commentText || 'Approved via client portal');
    } else {
      approveContent(selectedContent.id, 'current-user', commentText || 'Content approved');
    }
    setCommentText('');
    setShowCommentForm(false);
  };

  const handleReject = () => {
    if (isClientView && selectedLink) {
      rejectContent(selectedContent.id, 'client-reviewer', feedback || 'Rejected via client portal');
    } else {
      rejectContent(selectedContent.id, 'current-user', feedback || 'Content rejected');
    }
    setFeedback('');
  };

  const handleRequestRevision = () => {
    if (isClientView && selectedLink) {
      requestRevision(selectedContent.id, 'client-reviewer', feedback);
    } else {
      requestRevision(selectedContent.id, 'current-user', feedback);
    }
    setFeedback('');
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    addComment(selectedContent.id, {
      author: {
        id: isClientView ? 'client-reviewer' : 'current-user',
        name: isClientView ? 'Client Reviewer' : 'Team Member',
        email: isClientView ? 'client@company.com' : 'team@agency.com',
        role: isClientView ? 'client' : 'agency'
      },
      message: commentText,
      mentions: [],
      isResolved: false
    });

    setCommentText('');
    setShowCommentForm(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const generateNewReviewLink = () => {
    const link = generateReviewLink(selectedContent.id, selectedContent.clientId, {
      allowComments: true,
      allowDownload: false,
      requirePassword: false,
      notifyOnAccess: true
    });
    
    // Refresh selected content to get the new link
    const updatedContent = contentItems.find(item => item.id === selectedContent.id);
    if (updatedContent) {
      setSelectedContent(updatedContent);
    }
    
    setShowLinkGenerator(false);
  };

  const ReviewLinkGenerator: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Generate Review Link</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Link Settings
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-300">Allow comments</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-300">Allow download</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-300">Require password</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-300">Notify on access</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowLinkGenerator(false)}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={generateNewReviewLink}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
          >
            Generate Link
          </button>
        </div>
      </div>
    </motion.div>
  );

  const CommentsSection: React.FC = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-white">Comments ({selectedContent.totalComments})</h4>
        {(!isClientView || (selectedLink?.settings.allowComments)) && (
          <button
            onClick={() => setShowCommentForm(true)}
            className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
          >
            <MessageCircle className="w-4 h-4" />
            Add Comment
          </button>
        )}
      </div>

      {/* Comment form */}
      {showCommentForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 border border-white/10 rounded-lg p-4"
        >
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add your comment..."
            rows={3}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white placeholder-gray-400 resize-none"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setShowCommentForm(false)}
              className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-lg transition-colors text-white"
            >
              Post Comment
            </button>
          </div>
        </motion.div>
      )}

      {/* Comments list */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {selectedContent.comments.map((comment) => (
          <div key={comment.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {comment.author.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm">{comment.author.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    comment.author.role === 'client' 
                      ? 'bg-blue-900/200/20 text-blue-300' 
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {comment.author.role}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{comment.message}</p>
                
                {comment.reactions && comment.reactions.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    {comment.reactions.map((reaction, idx) => (
                      <span key={idx} className="text-sm">
                        {reaction.emoji} {reaction.users.length}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {selectedContent.comments.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{selectedContent.title}</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedContent.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                selectedContent.status === 'rejected' ? 'bg-red-900/200/20 text-red-300' :
                selectedContent.status === 'in-review' ? 'bg-purple-500/20 text-purple-300' :
                'bg-yellow-500/20 text-yellow-300'
              }`}>
                {selectedContent.status.replace('-', ' ')}
              </div>
            </div>
            
            {selectedContent.description && (
              <p className="text-gray-400 mb-2">{selectedContent.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="capitalize">{selectedContent.contentType.replace('-', ' ')}</span>
              <span>•</span>
              <span className="capitalize">{selectedContent.platform}</span>
              <span>•</span>
              <span>Priority: {selectedContent.priority}</span>
              {selectedContent.dueDate && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Due {new Date(selectedContent.dueDate).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isClientView && (
              <button
                onClick={() => setShowLinkGenerator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share for Review
              </button>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Content preview */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Content Preview</h3>
            <span className="text-sm text-gray-400">Version {currentVersion.versionNumber}</span>
          </div>

          <div className="space-y-4">
            {currentVersion.content.title && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white">{currentVersion.content.title}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white whitespace-pre-wrap">{currentVersion.content.body}</p>
              </div>
            </div>

            {currentVersion.content.hashtags && currentVersion.content.hashtags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Hashtags</label>
                <div className="flex flex-wrap gap-2">
                  {currentVersion.content.hashtags.map((hashtag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-900/200/20 text-blue-300 rounded-full text-sm">
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentVersion.content.callToAction && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Call to Action</label>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white">{currentVersion.content.callToAction}</p>
                </div>
              </div>
            )}

            {currentVersion.content.mediaUrls && currentVersion.content.mediaUrls.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Media Attachments</label>
                <div className="space-y-2">
                  {currentVersion.content.mediaUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Media file {idx + 1}</span>
                      <button className="ml-auto text-purple-400 hover:text-purple-300">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {(!isClientView || selectedLink?.settings.allowComments) && selectedContent.status !== 'published' && (
          <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-white mb-2">Review Actions</h4>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add your feedback (optional)..."
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white placeholder-gray-400 resize-none"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve
              </button>
              
              <button
                onClick={handleRequestRevision}
                disabled={!feedback.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 rounded-lg transition-colors text-white"
              >
                <Edit2 className="w-4 h-4" />
                Request Changes
              </button>
              
              <button
                onClick={handleReject}
                disabled={!feedback.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 rounded-lg transition-colors text-white"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Review links management */}
        {!isClientView && selectedContent.reviewLinks.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Review Links</h3>
            <div className="space-y-3">
              {selectedContent.reviewLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${link.isActive ? 'bg-green-500/20' : 'bg-red-900/200/20'}`}>
                      {link.isActive ? (
                        <ExternalLink className="w-4 h-4 text-green-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        Client Review Link
                        {!link.isActive && <span className="text-red-400 ml-2">(Expired)</span>}
                      </p>
                      <p className="text-sm text-gray-400">
                        {link.accessCount} views • Expires {new Date(link.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(link.url)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(link.url, '_blank')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <CommentsSection />
        </div>
      </div>

      {/* Review link generator modal */}
      <AnimatePresence>
        {showLinkGenerator && <ReviewLinkGenerator />}
      </AnimatePresence>
    </>
  );
};

export default ClientReviewPortal;