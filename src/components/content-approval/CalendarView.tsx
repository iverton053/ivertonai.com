import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle, CheckCircle, Users, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  platform: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  assignees: Array<{ id: string; name: string; }>;
  created_at: string;
  updated_at: string;
}

interface CalendarViewProps {
  contentItems: ContentItem[];
  onContentClick: (content: ContentItem) => void;
  onDateChange: (contentId: string, newDate: string) => void;
  onCreateContent: (date: string) => void;
  filters: {
    status: string[];
    priority: string[];
    assignees: string[];
  };
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  type: 'content' | 'deadline' | 'milestone';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  data: ContentItem;
}

const priorityColors = {
  low: 'bg-green-100 border-green-300 text-green-800',
  medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  high: 'bg-orange-100 border-orange-300 text-orange-800',
  urgent: 'bg-red-100 border-red-300 text-red-800'
};

const statusColors = {
  draft: 'bg-gray-100 border-gray-300',
  in_review: 'bg-blue-100 border-blue-300',
  approved: 'bg-green-100 border-green-300',
  rejected: 'bg-red-100 border-red-300',
  published: 'bg-purple-100 border-purple-300'
};

export default function CalendarView({
  contentItems,
  onContentClick,
  onDateChange,
  onCreateContent,
  filters,
  viewMode,
  onViewModeChange
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showOverdue, setShowOverdue] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredItems = useMemo(() => {
    return contentItems.filter(item => {
      if (filters.status.length > 0 && !filters.status.includes(item.status)) return false;
      if (filters.priority.length > 0 && !filters.priority.includes(item.priority)) return false;
      if (filters.assignees.length > 0 && !item.assignees.some(a => filters.assignees.includes(a.id))) return false;
      return true;
    });
  }, [contentItems, filters]);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return filteredItems.map(item => ({
      id: item.id,
      title: item.title,
      startDate: new Date(item.deadline),
      endDate: new Date(item.deadline),
      type: 'content' as const,
      priority: item.priority,
      status: item.status,
      data: item
    }));
  }, [filteredItems]);

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
      if (days.length >= 42) break;
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getDayEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => {
      const eventDate = event.startDate.toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const isOverdue = (date: Date) => {
    return date < today;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date, referenceDate: Date) => {
    return date.getMonth() === referenceDate.getMonth() &&
           date.getFullYear() === referenceDate.getFullYear();
  };

  const handleDragStart = (e: React.DragEvent, contentId: string) => {
    e.dataTransfer.setData('text/plain', contentId);
    setDraggedItem(contentId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const contentId = e.dataTransfer.getData('text/plain');
    if (contentId && draggedItem) {
      const newDate = date.toISOString().split('T')[0] + 'T12:00:00.000Z';
      onDateChange(contentId, newDate);
    }
    setDraggedItem(null);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }

    setCurrentDate(newDate);
  };

  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };

    if (viewMode === 'week') {
      const weekStart = getWeekDays(currentDate)[0];
      const weekEnd = getWeekDays(currentDate)[6];
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (viewMode === 'day') {
      options.weekday = 'long';
      options.day = 'numeric';
    }

    return currentDate.toLocaleDateString('en-US', options);
  };

  const renderEvent = (event: CalendarEvent, isCompact: boolean = false) => (
    <motion.div
      key={event.id}
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      draggable
      onDragStart={(e) => handleDragStart(e, event.id)}
      onClick={() => onContentClick(event.data)}
      className={`
        cursor-pointer border-l-4 p-1 mb-1 text-xs rounded-sm transition-all hover:shadow-sm
        ${priorityColors[event.priority]}
        ${isOverdue(event.startDate) ? 'ring-2 ring-red-200' : ''}
        ${draggedItem === event.id ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center space-x-1">
        {isOverdue(event.startDate) && (
          <AlertTriangle className="w-3 h-3 text-red-600" />
        )}
        {event.data.status === 'approved' && (
          <CheckCircle className="w-3 h-3 text-green-600" />
        )}
        <span className={`truncate ${isCompact ? 'max-w-16' : 'max-w-full'}`}>
          {event.title}
        </span>
      </div>

      {!isCompact && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-75">
            {event.data.platform}
          </span>
          {event.data.assignees.length > 0 && (
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{event.data.assignees.length}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );

  const renderMonthView = () => {
    const days = getMonthDays(currentDate);

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const events = getDayEvents(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <div
              key={index}
              className={`
                bg-white min-h-32 p-2 relative transition-colors hover:bg-gray-50
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                ${isDayToday ? 'bg-blue-50 ring-2 ring-blue-200' : ''}
              `}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              onDoubleClick={() => onCreateContent(day.toISOString())}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${isDayToday ? 'font-bold text-blue-600' : ''}`}>
                  {day.getDate()}
                </span>
                {events.some(e => isOverdue(e.startDate)) && (
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                )}
              </div>

              <div className="space-y-1">
                <AnimatePresence>
                  {events.slice(0, 3).map(event => renderEvent(event, true))}
                </AnimatePresence>

                {events.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays(currentDate);

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {days.map((day, index) => {
          const events = getDayEvents(day);
          const isDayToday = isToday(day);

          return (
            <div
              key={index}
              className={`
                bg-white min-h-96 p-3
                ${isDayToday ? 'bg-blue-50 ring-2 ring-blue-200' : ''}
              `}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              onDoubleClick={() => onCreateContent(day.toISOString())}
            >
              <div className="mb-3">
                <div className={`text-sm font-medium ${isDayToday ? 'text-blue-600' : 'text-gray-700'}`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg ${isDayToday ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                  {day.getDate()}
                </div>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {events.map(event => renderEvent(event, false))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const events = getDayEvents(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
        </div>

        <div className="p-4">
          {events.length === 0 ? (
            <div
              className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-colors"
              onDoubleClick={() => onCreateContent(currentDate.toISOString())}
            >
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>No content scheduled for this day</p>
              <p className="text-sm">Double-click to create new content</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 mb-3">
                Scheduled Content ({events.length})
              </h4>
              <AnimatePresence>
                {events.map(event => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">{event.title}</h5>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                          </span>
                          <span>{event.data.platform}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[event.priority]}`}>
                            {event.priority}
                          </span>
                        </div>

                        {event.data.assignees.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {event.data.assignees.map(a => a.name).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onContentClick(event.data)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-semibold text-gray-900">
            {formatDateHeader()}
          </h2>

          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {showOverdue && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>
                {calendarEvents.filter(e => isOverdue(e.startDate)).length} overdue
              </span>
            </div>
          )}

          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {['month', 'week', 'day'].map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode as 'month' | 'week' | 'day')}
                className={`
                  px-3 py-1 text-sm capitalize transition-colors
                  ${viewMode === mode
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 p-4 bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-sm" />
              <span className="text-gray-600">Urgent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded-sm" />
              <span className="text-gray-600">High Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-gray-600">Overdue</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Approved</span>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Double-click on any day to create new content • Drag events to reschedule
          </div>
        </div>
      </div>
    </div>
  );
}