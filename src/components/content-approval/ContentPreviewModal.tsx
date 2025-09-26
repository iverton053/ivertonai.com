import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Download, Share2, MessageSquare, CheckCircle, XCircle, Clock, Eye, ThumbsUp, ThumbsDown, Edit, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  platform: string;
  content_body: string;
  media_urls: string[];
  status: string;
  priority: string;
  deadline: string;
  assignees: Array<{ id: string; name: string; }>;
  tags: string[];
  created_at: string;
  updated_at: string;
  version: number;
  campaign_id?: string;
  target_audience?: string;
  call_to_action?: string;
  objectives: string[];
  metadata: Record<string, any>;
}

export interface Comment {
  id: string;
  user: { id: string; name: string; avatar?: string; };
  content: string;
  created_at: string;
  type: 'comment' | 'approval' | 'revision_request';
  resolved: boolean;
  position?: { x: number; y: number; };
}

interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem | null;
  comments: Comment[];
  onAddComment: (comment: string, position?: { x: number; y: number; }) => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onRequestRevision: (feedback: string) => void;
  onEdit: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  currentUser: { id: string; name: string; };
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  showCommentOverlay: boolean;
  onToggleCommentOverlay: () => void;
}

const platformPreviewSizes = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' }
};

const platformIcons = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone
};

export default function ContentPreviewModal({
  isOpen,
  onClose,
  content,
  comments,
  onAddComment,
  onApprove,
  onReject,
  onRequestRevision,
  onEdit,
  onDownload,
  onShare,
  currentUser,
  previewMode,
  onPreviewModeChange,
  showCommentOverlay,
  onToggleCommentOverlay
}: ContentPreviewModalProps) {
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number; } | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content) {
      setSelectedMedia(0);
      setIsPlaying(false);
    }
  }, [content]);

  if (!isOpen || !content) return null;

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|avi|mov)$/i.test(url);
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  const isAudio = (url: string) => {
    return /\.(mp3|wav|ogg|aac|flac)$/i.test(url);
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    if (showCommentOverlay && previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCommentPosition({ x, y });
    }
  };

  const addComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment, commentPosition || undefined);
      setNewComment('');
      setCommentPosition(null);
    }
  };

  const handleApprove = () => {
    onApprove();
    onClose();
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      setShowRejectForm(false);
      setRejectReason('');
      onClose();
    }
  };

  const handleRequestRevision = () => {
    if (revisionFeedback.trim()) {
      onRequestRevision(revisionFeedback);
      setShowRevisionForm(false);
      setRevisionFeedback('');
      onClose();
    }
  };

  const renderMediaPreview = () => {
    if (!content.media_urls || content.media_urls.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-2" />
            <p>No media to preview</p>
          </div>
        </div>
      );
    }

    const currentMedia = content.media_urls[selectedMedia];

    return (
      <div
        className="relative bg-black rounded-lg overflow-hidden cursor-pointer"
        onClick={handlePreviewClick}
        ref={previewRef}
        style={{
          aspectRatio: previewMode === 'mobile' ? '9/16' : previewMode === 'tablet' ? '4/3' : '16/9'
        }}
      >
        {isImage(currentMedia) && (
          <img
            src={currentMedia}
            alt="Content preview"
            className="w-full h-full object-contain"
          />
        )}

        {isVideo(currentMedia) && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={currentMedia}
              className="w-full h-full object-contain"
              controls={false}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVideoPlay();
                }}
                className="bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-4 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </button>
            </div>

            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVideoMute();
                }}
                className="bg-black bg-opacity-50 hover:bg-opacity-75 rounded p-2 transition-all"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullscreen(true);
                }}
                className="bg-black bg-opacity-50 hover:bg-opacity-75 rounded p-2 transition-all"
              >
                <Maximize className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {isAudio(currentMedia) && (
          <div className="flex items-center justify-center h-48 bg-gradient-to-r from-purple-400 to-pink-400">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8" />
              </div>
              <p className="font-medium">Audio Content</p>
              <audio src={currentMedia} controls className="mt-4" />
            </div>
          </div>
        )}

        {/* Comment Overlays */}
        <AnimatePresence>
          {showCommentOverlay && comments
            .filter(comment => comment.position)
            .map(comment => (
              <motion.div
                key={comment.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white cursor-pointer hover:bg-blue-600 transition-colors"
                style={{
                  left: `${comment.position!.x}%`,
                  top: `${comment.position!.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={comment.content}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 text-white" />
                </div>
              </motion.div>
            ))
          }
        </AnimatePresence>

        {/* New Comment Marker */}
        {commentPosition && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute w-6 h-6 bg-yellow-500 rounded-full border-2 border-white"
            style={{
              left: `${commentPosition.x}%`,
              top: `${commentPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </div>
    );
  };

  const renderMediaThumbnails = () => {
    if (!content.media_urls || content.media_urls.length <= 1) return null;

    return (
      <div className="flex space-x-2 mt-4 overflow-x-auto">
        {content.media_urls.map((url, index) => (
          <button
            key={index}
            onClick={() => setSelectedMedia(index)}
            className={`
              flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
              ${selectedMedia === index ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'}
            `}
          >
            {isImage(url) && (
              <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            )}
            {isVideo(url) && (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <Play className="w-4 h-4 text-gray-600" />
              </div>
            )}
            {isAudio(url) && (
              <div className="w-full h-full bg-purple-300 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-purple-600" />
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderComments = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          Comments ({comments.length})
        </h4>
        <button
          onClick={onToggleCommentOverlay}
          className={`
            px-3 py-1 text-sm rounded transition-colors
            ${showCommentOverlay
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {showCommentOverlay ? 'Hide Overlay' : 'Show Overlay'}
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.map(comment => (
          <div key={comment.id} className="flex space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {comment.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {comment.user.name}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
                {comment.type === 'approval' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {comment.type === 'revision_request' && (
                  <Clock className="w-4 h-4 text-orange-500" />
                )}
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {currentUser.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            {commentPosition && (
              <p className="text-xs text-gray-500 mt-1">
                Comment will be placed at position ({Math.round(commentPosition.x)}%, {Math.round(commentPosition.y)}%)
              </p>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                {commentPosition && (
                  <button
                    onClick={() => setCommentPosition(null)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Remove position
                  </button>
                )}
              </div>
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="inline-block w-full max-w-7xl px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {content.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="capitalize">{content.content_type}</span>
                  <span>•</span>
                  <span>{content.platform}</span>
                  <span>•</span>
                  <span className="capitalize">{content.status}</span>
                  <span>•</span>
                  <span>Version {content.version}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 ml-4">
                {/* Preview Mode Selector */}
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  {(['desktop', 'tablet', 'mobile'] as const).map((mode) => {
                    const Icon = platformIcons[mode];
                    return (
                      <button
                        key={mode}
                        onClick={() => onPreviewModeChange(mode)}
                        className={`
                          px-3 py-2 text-sm capitalize transition-colors flex items-center space-x-1
                          ${previewMode === mode
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{mode}</span>
                      </button>
                    );
                  })}
                </div>

                {onDownload && (
                  <button
                    onClick={onDownload}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}

                {onShare && (
                  <button
                    onClick={onShare}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Preview Area */}
              <div className="lg:col-span-2">
                <div
                  className="mx-auto"
                  style={{
                    maxWidth: previewMode === 'mobile' ? '375px' : previewMode === 'tablet' ? '768px' : '100%'
                  }}
                >
                  {renderMediaPreview()}
                  {renderMediaThumbnails()}

                  {/* Content Body */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Content Body</h4>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {content.content_body}
                    </div>

                    {content.call_to_action && (
                      <div className="mt-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          CTA: {content.call_to_action}
                        </span>
                      </div>
                    )}

                    {content.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {content.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={handleApprove}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => setShowRevisionForm(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Request Revision</span>
                    </button>

                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={onEdit}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Content</span>
                    </button>
                  </div>
                </div>

                {/* Content Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Content Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`
                        capitalize px-2 py-1 rounded text-xs
                        ${content.priority === 'urgent' ? 'bg-red-100 text-red-800' : ''}
                        ${content.priority === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                        ${content.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${content.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                      `}>
                        {content.priority}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadline:</span>
                      <span>{new Date(content.deadline).toLocaleDateString()}</span>
                    </div>

                    {content.assignees.length > 0 && (
                      <div>
                        <span className="text-gray-600">Assignees:</span>
                        <div className="mt-1 space-y-1">
                          {content.assignees.map(assignee => (
                            <div key={assignee.id} className="text-gray-700">
                              {assignee.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {content.target_audience && (
                      <div>
                        <span className="text-gray-600">Target Audience:</span>
                        <p className="mt-1 text-gray-700">{content.target_audience}</p>
                      </div>
                    )}

                    {content.objectives.length > 0 && (
                      <div>
                        <span className="text-gray-600">Objectives:</span>
                        <ul className="mt-1 space-y-1">
                          {content.objectives.map((objective, index) => (
                            <li key={index} className="text-gray-700 text-sm">
                              • {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {renderComments()}
                </div>
              </div>
            </div>

            {/* Reject Form Modal */}
            <AnimatePresence>
              {showRejectForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Reject Content
                    </h3>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectReason('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={!rejectReason.trim()}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Revision Form Modal */}
            <AnimatePresence>
              {showRevisionForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Request Revision
                    </h3>
                    <textarea
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      placeholder="Please provide feedback for revision..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => {
                          setShowRevisionForm(false);
                          setRevisionFeedback('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRequestRevision}
                        disabled={!revisionFeedback.trim()}
                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Request Revision
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}