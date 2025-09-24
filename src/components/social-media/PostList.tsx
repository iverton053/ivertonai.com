import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Copy, 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  Video,
  FileText,
  Filter,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { format } from 'date-fns';
import { SocialMediaPost, SocialPlatform, PostStatus } from '../../types/socialMedia';

interface PostListProps {
  posts: SocialMediaPost[];
  onEditPost: (post: SocialMediaPost) => void;
  onDeletePost: (postId: string) => void;
  onDuplicatePost: (post: SocialMediaPost) => void;
  onPublishPost: (postId: string) => void;
  onPausePost: (postId: string) => void;
  selectedPlatforms: SocialPlatform[];
  onPlatformFilter: (platforms: SocialPlatform[]) => void;
}

const PostList: React.FC<PostListProps> = ({
  posts,
  onEditPost,
  onDeletePost,
  onDuplicatePost,
  onPublishPost,
  onPausePost,
  selectedPlatforms,
  onPlatformFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PostStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'scheduled' | 'engagement'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const getPlatformColor = (platform: SocialPlatform) => {
    const colors = {
      facebook: 'bg-blue-600',
      instagram: 'bg-gradient-to-r from-purple-600 to-pink-600',
      linkedin: 'bg-blue-700',
      youtube: 'bg-red-600'
    };
    return colors[platform] || 'bg-gray-600';
  };

  const getStatusColor = (status: PostStatus) => {
    const colors = {
      draft: 'bg-gray-800/50 text-gray-300',
      scheduled: 'bg-blue-900/50 text-blue-300',
      published: 'bg-green-900/50 text-green-300',
      failed: 'bg-red-900/50 text-red-300',
      pending_approval: 'bg-yellow-900/50 text-yellow-300'
    };
    return colors[status] || 'bg-gray-800/50 text-gray-300';
  };

  const getStatusIcon = (status: PostStatus) => {
    const icons = {
      draft: FileText,
      scheduled: Clock,
      published: CheckCircle,
      failed: XCircle,
      pending_approval: AlertCircle
    };
    const Icon = icons[status] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Filter and sort posts
  const filteredAndSortedPosts = posts
    .filter(post => {
      const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
      const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.includes(post.platform);
      
      return matchesSearch && matchesStatus && matchesPlatform;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'scheduled':
          aValue = a.scheduledAt ? new Date(a.scheduledAt) : new Date(0);
          bValue = b.scheduledAt ? new Date(b.scheduledAt) : new Date(0);
          break;
        case 'engagement':
          aValue = (a.metrics?.likes || 0) + (a.metrics?.comments || 0) + (a.metrics?.shares || 0);
          bValue = (b.metrics?.likes || 0) + (b.metrics?.comments || 0) + (b.metrics?.shares || 0);
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredAndSortedPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredAndSortedPosts.map(post => post.id));
    }
  };

  const handleSelectPost = (postId: string) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        selectedPosts.forEach(postId => onDeletePost(postId));
        setSelectedPosts([]);
        break;
      case 'publish':
        selectedPosts.forEach(postId => onPublishPost(postId));
        setSelectedPosts([]);
        break;
      case 'pause':
        selectedPosts.forEach(postId => onPausePost(postId));
        setSelectedPosts([]);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search posts, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Bulk Actions */}
          {selectedPosts.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg">
              <span className="text-sm text-purple-300 font-medium">{selectedPosts.length} selected</span>
              <button
                onClick={() => handleBulkAction('publish')}
                className="px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkAction('pause')}
                className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
              >
                Pause
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedPosts([])}
                className="px-2 py-1 text-gray-400 hover:text-gray-300 text-xs"
              >
                Clear
              </button>
            </div>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as PostStatus | 'all')}
            className="px-3 py-2 bg-gray-800/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
            <option value="pending_approval">Pending Approval</option>
          </select>

          {/* Platform Filter */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Platforms</span>
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-64 glass-effect rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="p-4">
                <h3 className="font-medium text-white mb-3">Filter by Platform</h3>
                <div className="space-y-2">
                  {(['facebook', 'instagram', 'linkedin', 'youtube'] as SocialPlatform[]).map(platform => (
                    <label key={platform} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onPlatformFilter([...selectedPlatforms, platform]);
                          } else {
                            onPlatformFilter(selectedPlatforms.filter(p => p !== platform));
                          }
                        }}
                        className="rounded border-gray-600"
                      />
                      <span className="capitalize text-sm">{platform}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => onPlatformFilter([])}
                  className="w-full mt-3 px-3 py-1 text-sm text-purple-400 hover:text-purple-300"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-800/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="created">Created Date</option>
              <option value="scheduled">Scheduled Date</option>
              <option value="engagement">Engagement</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-300">
              {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('publish')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkAction('pause')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Pause
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Posts List */}
      <div className="glass-effect rounded-xl shadow-sm border">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedPosts.length === filteredAndSortedPosts.length && filteredAndSortedPosts.length > 0}
              onChange={handleSelectAll}
              className="mr-4 rounded border-gray-600"
            />
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-300">
              <span>Select All ({filteredAndSortedPosts.length} posts)</span>
            </div>
          </div>
        </div>

        {/* Posts */}
        <AnimatePresence mode="popLayout">
          {filteredAndSortedPosts.length > 0 ? (
            filteredAndSortedPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                layout
                className="px-6 py-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                      className="mt-1 rounded border-gray-600"
                    />

                    {/* Platform Badge */}
                    <div className={`w-10 h-10 rounded-lg ${getPlatformColor(post.platform)} flex items-center justify-center text-white text-sm font-medium`}>
                      {getMediaTypeIcon(post.mediaType)}
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(post.status)}`}>
                          {getStatusIcon(post.status)}
                          <span className="capitalize">{post.status.replace('_', ' ')}</span>
                        </span>
                        <span className="text-xs text-gray-400 capitalize">{post.platform}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400 capitalize">{post.mediaType}</span>
                      </div>

                      <p className="text-white font-medium mb-1 line-clamp-2">
                        {post.content}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {post.scheduledAt && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(post.scheduledAt), 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                        )}

                        {post.metrics && (
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{post.metrics.likes}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{post.metrics.comments}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Share2 className="w-3 h-3" />
                              <span>{post.metrics.shares}</span>
                            </span>
                          </div>
                        )}

                        {post.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-400">Tags:</span>
                            <div className="flex space-x-1">
                              {post.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 2 && (
                                <span className="text-xs text-gray-400">+{post.tags.length - 2}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(showDropdown === post.id ? null : post.id)}
                      className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showDropdown === post.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 glass-effect rounded-lg shadow-lg border z-10">
                        <div className="py-2">
                          <button
                            onClick={() => {
                              onEditPost(post);
                              setShowDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700/50 transition-colors flex items-center space-x-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              onDuplicatePost(post);
                              setShowDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700/50 transition-colors flex items-center space-x-2"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Duplicate</span>
                          </button>

                          {post.status === 'scheduled' && (
                            <button
                              onClick={() => {
                                onPausePost(post.id);
                                setShowDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-700/50 transition-colors flex items-center space-x-2"
                            >
                              <Pause className="w-4 h-4" />
                              <span>Pause</span>
                            </button>
                          )}

                          {(post.status === 'draft' || post.status === 'scheduled') && (
                            <button
                              onClick={() => {
                                onPublishPost(post.id);
                                setShowDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-700/50 transition-colors flex items-center space-x-2"
                            >
                              <Play className="w-4 h-4" />
                              <span>Publish Now</span>
                            </button>
                          )}

                          <div className="border-t border-gray-700 my-2"></div>
                          
                          <button
                            onClick={() => {
                              onDeletePost(post.id);
                              setShowDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-red-900/20 text-red-400 transition-colors flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No posts found matching your criteria</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {filteredAndSortedPosts.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {filteredAndSortedPosts.length} of {posts.length} posts
          </p>
          
          {/* Add pagination controls here if needed */}
        </div>
      )}
    </div>
  );
};

export default PostList;