import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  Hash, 
  AtSign, 
  MapPin, 
  Smile,
  Upload,
  Trash2,
  Plus,
  Clock,
  Users,
  Send,
  Save
} from 'lucide-react';
import { format } from 'date-fns';
import { SocialMediaPost, SocialPlatform, PostType, MediaType, CreatePostForm } from '../../types/socialMedia';

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: CreatePostForm) => void;
  editingPost?: SocialMediaPost;
  availablePlatforms: SocialPlatform[];
  defaultDate?: Date;
}

const PostComposer: React.FC<PostComposerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPost,
  availablePlatforms,
  defaultDate
}) => {
  const [content, setContent] = useState(editingPost?.content || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(
    editingPost ? [editingPost.platform] : availablePlatforms
  );
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<PostType>(editingPost?.postType || 'feed_post');
  const [scheduledAt, setScheduledAt] = useState<string>(
    editingPost?.scheduledAt ? format(new Date(editingPost.scheduledAt), "yyyy-MM-dd'T'HH:mm") :
    defaultDate ? format(defaultDate, "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [timezone, setTimezone] = useState('America/New_York');
  const [tags, setTags] = useState<string[]>(editingPost?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [isScheduled, setIsScheduled] = useState(!!scheduledAt);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterLimits = {
    facebook: 63206,
    instagram: 2200,
    linkedin: 3000,
    youtube: 5000
  };

  const getPlatformColor = (platform: SocialPlatform) => {
    const colors = {
      facebook: 'border-blue-500 bg-blue-600 text-white',
      instagram: 'border-pink-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      linkedin: 'border-blue-600 bg-blue-700 text-white',
      youtube: 'border-red-500 bg-red-600 text-white'
    };
    return colors[platform];
  };

  const getCharacterCount = (platform: SocialPlatform) => {
    return content.length;
  };

  const getCharacterLimit = (platform: SocialPlatform) => {
    return characterLimits[platform];
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles([...mediaFiles, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };


  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };


  const validatePost = () => {
    const errors: string[] = [];

    if (!content.trim()) errors.push('Content is required');
    if (selectedPlatforms.length === 0) errors.push('At least one platform must be selected');

    // Check character limits
    selectedPlatforms.forEach(platform => {
      if (content.length > getCharacterLimit(platform)) {
        errors.push(`Content exceeds ${platform} character limit`);
      }
    });

    // Check media compatibility
    if (mediaFiles.length > 0) {
      selectedPlatforms.forEach(platform => {
        if (platform === 'linkedin' && mediaFiles.length > 1) {
          errors.push('LinkedIn supports only single media files');
        }
        if (platform === 'youtube' && mediaFiles.some(f => !f.type.startsWith('video/'))) {
          errors.push('YouTube requires video files');
        }
      });
    }

    return errors;
  };

  const isValid = validatePost().length === 0;

  const insertAtCursor = useCallback((text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + text.length, start + text.length);
        }
      }, 0);
    }
  }, [content]);

  const handleSave = () => {
    const postData: CreatePostForm = {
      content,
      mediaFiles,
      platforms: selectedPlatforms,
      scheduledAt: isScheduled ? scheduledAt : undefined,
      timezone,
      postType,
      tags,
      requiresApproval
    };
    
    onSave(postData);
    onClose();
  };

  const handlePublishNow = () => {
    const postData: CreatePostForm = {
      content,
      mediaFiles,
      platforms: selectedPlatforms,
      timezone,
      postType,
      tags,
      requiresApproval: false
    };
    
    onSave(postData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Main Composer */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Platform Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select Platforms
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {availablePlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformToggle(platform)}
                    className={`p-3 rounded-lg border-2 transition-all capitalize font-medium ${
                      selectedPlatforms.includes(platform)
                        ? getPlatformColor(platform)
                        : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Post Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Post Type
              </label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="feed_post">Feed Post</option>
                <option value="story">Story</option>
                <option value="reel">Reel</option>
                <option value="carousel">Carousel</option>
                <option value="video">Video</option>
                <option value="article">Article (LinkedIn)</option>
              </select>
            </div>

            {/* Content Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Post Content
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => insertAtCursor('#')}
                    className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                    title="Add hashtag"
                  >
                    <Hash className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertAtCursor('@')}
                    className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                    title="Add mention"
                  >
                    <AtSign className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertAtCursor('😀')}
                    className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                    title="Add emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-32 px-4 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              
              {/* Character Count */}
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedPlatforms.map(platform => (
                  <div
                    key={platform}
                    className={`text-xs px-2 py-1 rounded-full ${
                      getCharacterCount(platform) > getCharacterLimit(platform)
                        ? 'bg-red-900/50 text-red-300'
                        : getCharacterCount(platform) > getCharacterLimit(platform) * 0.8
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-gray-800/50 text-gray-400'
                    }`}
                  >
                    {platform}: {getCharacterCount(platform)}/{getCharacterLimit(platform)}
                  </div>
                ))}
              </div>
            </div>

            {/* Media Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Media Files
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div className="space-y-3">
                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-400 hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 text-gray-300"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Images or Videos</span>
                </button>

                {/* Preview uploaded files */}
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tags
              </label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 bg-gray-700 p-6 border-l border-gray-700">
            {/* Scheduling */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-medium text-gray-300">
                  Scheduling
                </label>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="scheduling"
                    checked={!isScheduled}
                    onChange={() => setIsScheduled(false)}
                    className="text-purple-400"
                  />
                  <span className="text-sm text-gray-300">Publish now</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="scheduling"
                    checked={isScheduled}
                    onChange={() => setIsScheduled(true)}
                    className="text-purple-400"
                  />
                  <span className="text-sm text-gray-300">Schedule for later</span>
                </label>
                
                {isScheduled && (
                  <div className="ml-6 space-y-3">
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                    
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Approval */}
            <div className="mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                  className="text-purple-400"
                />
                <span className="text-sm text-gray-300">Requires approval</span>
              </label>
            </div>

            {/* Validation Errors */}
            {!isValid && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="text-red-400 text-sm space-y-1">
                  {validatePost().map((error, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-red-400 rounded-full" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-400">AI Suggestions</span>
              </div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>• Consider adding relevant hashtags for better reach</div>
                <div>• Best posting time: 2:00 PM - 4:00 PM for your audience</div>
                <div>• Visual content performs 40% better on {selectedPlatforms[0] || 'social media'}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={!isValid}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isScheduled ? 'Schedule Post' : 'Save Draft'}</span>
              </button>
              
              {!isScheduled && (
                <button
                  onClick={handlePublishNow}
                  disabled={!isValid}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Now</span>
                </button>
              )}

              <div className="pt-3 border-t border-gray-600">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Advanced Options */}
            <details className="group mt-4">
              <summary className="cursor-pointer p-2 text-sm text-gray-400 hover:text-gray-300 flex items-center space-x-2">
                <span>Advanced Options</span>
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </summary>
              <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-600">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-300">Auto-repost to Stories</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-300">Cross-promote on all platforms</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-300">Add to content library</span>
                </label>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Content Category</label>
                  <select className="w-full px-2 py-1 text-xs border border-gray-600 bg-gray-700 text-white rounded">
                    <option>Marketing</option>
                    <option>Educational</option>
                    <option>Entertainment</option>
                    <option>News</option>
                    <option>Behind the Scenes</option>
                  </select>
                </div>
              </div>
            </details>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PostComposer;