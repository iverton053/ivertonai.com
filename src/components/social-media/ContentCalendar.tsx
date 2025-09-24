import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Filter,
  Clock,
  Users,
  Image,
  Video,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { SocialMediaPost, SocialPlatform, ContentCalendarEvent } from '../../types/socialMedia';

interface ContentCalendarProps {
  posts: SocialMediaPost[];
  onCreatePost: (date?: Date) => void;
  onEditPost: (post: SocialMediaPost) => void;
  onDeletePost: (postId: string) => void;
  selectedPlatforms: SocialPlatform[];
  onPlatformFilter: (platforms: SocialPlatform[]) => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({
  posts,
  onCreatePost,
  onEditPost,
  onDeletePost,
  selectedPlatforms,
  onPlatformFilter
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPlatformColor = (platform: SocialPlatform) => {
    const colors = {
      facebook: 'bg-blue-600 text-white',
      instagram: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      linkedin: 'bg-blue-700 text-white',
      youtube: 'bg-red-600 text-white'
    };
    return colors[platform] || 'bg-gray-600 text-white';
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image': return <Image className="w-3 h-3" />;
      case 'video': return <Video className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => 
      post.scheduledAt && 
      isSameDay(new Date(post.scheduledAt), date) &&
      (selectedPlatforms.length === 0 || selectedPlatforms.includes(post.platform))
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreatePost = (date?: Date) => {
    onCreatePost(date || selectedDate || new Date());
  };

  return (
    <div className="glass-effect rounded-xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Platform Filter */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
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
                      <span className="capitalize text-sm text-gray-300">{platform}</span>
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

          {/* View Toggle */}
          <div className="flex border border-gray-600 rounded-lg">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-2 text-sm rounded-l-lg transition-colors ${
                view === 'month' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-2 text-sm rounded-r-lg transition-colors ${
                view === 'week' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Week
            </button>
          </div>

          <button
            onClick={() => handleCreatePost()}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-400 border-b border-gray-600">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map(date => {
          const dayPosts = getPostsForDate(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());

          return (
            <motion.div
              key={date.toISOString()}
              whileHover={{ scale: 1.02 }}
              className={`min-h-24 p-2 border border-gray-700 cursor-pointer transition-all ${
                isSelected ? 'bg-purple-600/20 border-purple-500' : 'hover:bg-gray-700/30'
              } ${!isSameMonth(date, currentDate) ? 'text-gray-400' : 'text-white'}`}
              onClick={() => handleDateClick(date)}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-purple-400' : 'text-white'
              }`}>
                {format(date, 'd')}
              </div>

              {/* Posts for this date */}
              <div className="space-y-1">
                {dayPosts.slice(0, 3).map(post => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs px-2 py-1 rounded-md cursor-pointer hover:opacity-80 transition-opacity ${
                      getPlatformColor(post.platform)
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPost(post);
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      {getMediaTypeIcon(post.mediaType)}
                      <span className="truncate flex-1">
                        {post.content.substring(0, 15)}...
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="w-2 h-2" />
                      <span>
                        {post.scheduledAt && format(new Date(post.scheduledAt), 'HH:mm')}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {dayPosts.length > 3 && (
                  <div className="text-xs text-gray-400 text-center">
                    +{dayPosts.length - 3} more
                  </div>
                )}
              </div>

              {/* Add post button */}
              {dayPosts.length === 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreatePost(date);
                  }}
                  className="w-full h-6 border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center hover:border-purple-400 hover:bg-purple-600/20 transition-colors group"
                >
                  <Plus className="w-3 h-3 text-gray-400 group-hover:text-purple-400" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-300"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {getPostsForDate(selectedDate).map(post => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    getPlatformColor(post.platform)
                  }`}>
                    {getMediaTypeIcon(post.mediaType)}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {post.content.substring(0, 50)}...
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="capitalize">{post.platform}</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {post.scheduledAt && format(new Date(post.scheduledAt), 'h:mm a')}
                        </span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.status === 'scheduled' ? 'bg-blue-900/50 text-blue-300' :
                        post.status === 'published' ? 'bg-green-900/50 text-green-300' :
                        post.status === 'failed' ? 'bg-red-900/50 text-red-300' :
                        'bg-gray-800/50 text-gray-300'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditPost(post)}
                    className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-600/20 rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {getPostsForDate(selectedDate).length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No posts scheduled for this date</p>
                <button
                  onClick={() => handleCreatePost(selectedDate)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Schedule Post
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ContentCalendar;