import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Settings,
  Link,
  Bell,
  X,
  Check,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Circle,
  MonitorSpeaker,
  FileText,
  Download,
  Upload,
  Calendar as CalendarIcon,
  Save,
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share,
  BookOpen,
  CloudDownload
} from 'lucide-react';
import { EnhancedBadge, StatusIndicator, PriorityIndicator } from '../ui/EnhancedVisualHierarchy';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'ongoing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  participants: Array<{
    id: string;
    name: string;
    email: string;
    role: 'team' | 'client';
    status: 'pending' | 'accepted' | 'declined';
    isOrganizer?: boolean;
  }>;
  location?: string;
  meetingLink?: string;
  notes?: string;
  meetingNotes?: Array<{
    id: string;
    content: string;
    timestamp: Date;
    author: string;
  }>;
  recordings?: Array<{
    id: string;
    filename: string;
    duration: string;
    size: string;
    url: string;
    timestamp: Date;
  }>;
  isRecording?: boolean;
  hasScreenShare?: boolean;
  calendarIntegration?: {
    googleCalendar?: boolean;
    outlookCalendar?: boolean;
    calendarId?: string;
  };
  template?: {
    id: string;
    name: string;
    agenda: string[];
    defaultDuration: number;
  };
  agenda?: string[];
  recurringPattern?: 'none' | 'daily' | 'weekly' | 'monthly';
}

interface MeetingSchedulerProps {
  onMeetingChange: (count: number) => void;
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({ onMeetingChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    type: 'video' as const,
    participants: '',
    meetingLink: '',
    template: '',
    enableRecording: false,
    calendarSync: true,
    agenda: [''] as string[]
  });
  const [showMeetingNotes, setShowMeetingNotes] = useState(false);
  const [showRecordings, setShowRecordings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedMeetingForNotes, setSelectedMeetingForNotes] = useState<Meeting | null>(null);

  // Meeting templates
  const meetingTemplates = [
    {
      id: 'template-1',
      name: 'Client Review Meeting',
      agenda: [
        'Review previous action items',
        'Discuss project progress',
        'Present campaign performance metrics',
        'Gather client feedback',
        'Define next steps and deliverables'
      ],
      defaultDuration: 60
    },
    {
      id: 'template-2',
      name: 'Team Standup',
      agenda: [
        'What did you work on yesterday?',
        'What will you work on today?',
        'Any blockers or challenges?',
        'Team announcements'
      ],
      defaultDuration: 30
    },
    {
      id: 'template-3',
      name: 'Project Kickoff',
      agenda: [
        'Project overview and objectives',
        'Team introductions and roles',
        'Timeline and milestones review',
        'Communication protocols',
        'Q&A and next steps'
      ],
      defaultDuration: 90
    },
    {
      id: 'template-4',
      name: 'Strategy Session',
      agenda: [
        'Current market analysis',
        'Competitive landscape review',
        'Goal setting and KPIs',
        'Resource allocation',
        'Action plan development'
      ],
      defaultDuration: 120
    }
  ];

  // Mock meetings data
  useEffect(() => {
    const mockMeetings: Meeting[] = [
      {
        id: '1',
        title: 'Q4 Campaign Review with TechCorp',
        description: 'Review campaign performance metrics and discuss optimization strategies',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
        type: 'video',
        status: 'confirmed',
        priority: 'high',
        participants: [
          { id: '1', name: 'John Smith', email: 'john@techcorp.com', role: 'client', status: 'accepted' },
          { id: '2', name: 'You', email: 'you@agency.com', role: 'team', status: 'accepted', isOrganizer: true }
        ],
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notes: 'Prepare campaign performance slides',
        meetingNotes: [
          {
            id: 'note-1',
            content: 'Discussed Q4 campaign performance - 15% increase in conversions',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            author: 'You'
          },
          {
            id: 'note-2',
            content: 'Client requested additional targeting for Q1 campaign',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            author: 'John Smith'
          }
        ],
        recordings: [
          {
            id: 'rec-1',
            filename: 'Q4-Campaign-Review-2024-09-23.mp4',
            duration: '45:32',
            size: '234 MB',
            url: '#',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ],
        calendarIntegration: {
          googleCalendar: true,
          calendarId: 'primary'
        },
        agenda: [
          'Review Q4 campaign metrics',
          'Discuss optimization strategies',
          'Plan Q1 campaign approach',
          'Set follow-up meetings'
        ]
      },
      {
        id: '2',
        title: 'Weekly Team Standup',
        description: 'Weekly progress update and planning session',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // + 30 minutes
        type: 'video',
        status: 'scheduled',
        priority: 'medium',
        participants: [
          { id: '3', name: 'Alice Johnson', email: 'alice@agency.com', role: 'team', status: 'accepted' },
          { id: '4', name: 'Bob Wilson', email: 'bob@agency.com', role: 'team', status: 'pending' },
          { id: '2', name: 'You', email: 'you@agency.com', role: 'team', status: 'accepted', isOrganizer: true }
        ],
        meetingLink: 'https://meet.google.com/xyz-uvw-rst',
        recurringPattern: 'weekly'
      },
      {
        id: '3',
        title: 'Client Onboarding - RetailPlus',
        description: 'Initial strategy session with new client',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // + 90 minutes
        type: 'video',
        status: 'scheduled',
        priority: 'urgent',
        participants: [
          { id: '5', name: 'Sarah Wilson', email: 'sarah@retailplus.com', role: 'client', status: 'pending' },
          { id: '6', name: 'Mike Chen', email: 'mike@retailplus.com', role: 'client', status: 'pending' },
          { id: '2', name: 'You', email: 'you@agency.com', role: 'team', status: 'accepted', isOrganizer: true }
        ],
        meetingLink: 'https://meet.google.com/new-client-123'
      }
    ];
    
    setMeetings(mockMeetings);
    onMeetingChange(mockMeetings.filter(m => m.status === 'scheduled' || m.status === 'confirmed').length);
  }, [onMeetingChange]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'blue';
      case 'phone': return 'green';
      case 'in-person': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'scheduled': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (filterStatus === 'all') return true;
    return meeting.status === filterStatus;
  });

  const upcomingMeetings = filteredMeetings
    .filter(meeting => meeting.startTime > new Date())
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const todaysMeetings = filteredMeetings.filter(meeting => {
    const today = new Date();
    const meetingDate = meeting.startTime;
    return meetingDate.toDateString() === today.toDateString();
  });

  const handleJoinMeeting = (meeting: Meeting) => {
    if (meeting.meetingLink) {
      // Update meeting status to ongoing if it's starting time
      const now = new Date();
      if (now >= meeting.startTime && now <= meeting.endTime) {
        setMeetings(prev => prev.map(m =>
          m.id === meeting.id ? { ...m, status: 'confirmed' as const } : m
        ));
      }

      window.open(meeting.meetingLink, '_blank');
      alert(`Joining meeting: ${meeting.title}`);
    } else {
      alert('Meeting link not available');
    }
  };

  const handleCopyMeetingLink = (meeting: Meeting) => {
    if (meeting.meetingLink) {
      navigator.clipboard.writeText(meeting.meetingLink);
      alert('Meeting link copied to clipboard!');
    } else {
      alert('No meeting link available to copy');
    }
  };

  const handleDeleteMeeting = (meetingId: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      setMeetings(prev => prev.filter(m => m.id !== meetingId));
      onMeetingChange(meetings.length - 1);
      alert('Meeting deleted successfully');
    }
  };

  const handleRescheduleMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setNewMeeting({
      title: meeting.title,
      description: meeting.description || '',
      date: meeting.startTime.toISOString().split('T')[0],
      time: meeting.startTime.toTimeString().slice(0, 5),
      duration: Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / 60000).toString(),
      type: meeting.type,
      participants: meeting.participants.map(p => p.email).join(', '),
      meetingLink: meeting.meetingLink || ''
    });
    setShowNewMeetingModal(true);
  };

  const handleSendReminder = (meetingId: string) => {
    setMeetings(prev => prev.map(meeting =>
      meeting.id === meetingId
        ? { ...meeting, notes: (meeting.notes || '') + ' [Reminder sent]' }
        : meeting
    ));
    alert('Reminder sent to all participants!');
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days from previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = meeting.startTime;
      return meetingDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleCreateMeeting = () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) {
      alert('Please fill in required fields');
      return;
    }

    const startDateTime = new Date(`${newMeeting.date}T${newMeeting.time}`);
    const endDateTime = new Date(startDateTime.getTime() + parseInt(newMeeting.duration) * 60000);

    const meeting: Meeting = {
      id: Date.now().toString(),
      title: newMeeting.title,
      description: newMeeting.description,
      startTime: startDateTime,
      endTime: endDateTime,
      type: newMeeting.type,
      status: 'scheduled',
      priority: 'medium',
      participants: newMeeting.participants.split(',').map((email, index) => ({
        id: `participant-${index}`,
        name: email.trim().split('@')[0],
        email: email.trim(),
        role: 'client' as const,
        status: 'pending' as const,
        isOrganizer: index === 0
      })),
      meetingLink: newMeeting.meetingLink || `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`,
      recurringPattern: 'none',
      calendarIntegration: {
        googleCalendar: newMeeting.calendarSync,
        outlookCalendar: false
      },
      agenda: newMeeting.agenda.filter(item => item.trim()),
      template: newMeeting.template ? meetingTemplates.find(t => t.id === newMeeting.template) : undefined
    };

    setMeetings(prev => [...prev, meeting]);
    onMeetingChange(meetings.length + 1);
    
    // Reset form
    setNewMeeting({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      type: 'video',
      participants: '',
      meetingLink: '',
      template: '',
      enableRecording: false,
      calendarSync: true,
      agenda: ['']
    });
    
    setShowNewMeetingModal(false);
    alert('Meeting scheduled successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Calendar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Users className="w-4 h-4 mr-2 inline" />
              List
            </motion.button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewMeetingModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {viewMode === 'calendar' ? (
            /* Calendar View */
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-sm text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Today
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              {/* Interactive Calendar */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth(currentDate).map((date, index) => {
                    if (!date) {
                      return <div key={index} className="h-10" />;
                    }
                    
                    const dayMeetings = getMeetingsForDate(date);
                    
                    return (
                      <motion.div
                        key={date.getDate()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          h-10 flex items-center justify-center text-sm font-medium cursor-pointer rounded-lg transition-all
                          ${isToday(date) ? 'bg-purple-500 text-white' : 'hover:bg-gray-600/50'}
                          ${isSelected(date) ? 'ring-2 ring-purple-400' : ''}
                          ${dayMeetings.length > 0 ? 'relative' : ''}
                        `}
                      >
                        <span className={isToday(date) ? 'text-white' : 'text-gray-300'}>
                          {date.getDate()}
                        </span>
                        {dayMeetings.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-900/200 rounded-full flex items-center justify-center text-xs text-white">
                            {dayMeetings.length}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Selected Date Info */}
                {selectedDate && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <h4 className="text-white font-medium mb-2">
                      {formatDate(selectedDate)}
                    </h4>
                    {getMeetingsForDate(selectedDate).length > 0 ? (
                      <div className="space-y-2">
                        {getMeetingsForDate(selectedDate).map((meeting) => (
                          <div key={meeting.id} className="flex items-center space-x-2 text-sm">
                            <div className={`w-2 h-2 rounded-full bg-${getMeetingTypeColor(meeting.type)}-400`} />
                            <span className="text-gray-300 truncate">
                              {formatTime(meeting.startTime)} - {meeting.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No meetings scheduled</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg bg-${getMeetingTypeColor(meeting.type)}-500/20 text-${getMeetingTypeColor(meeting.type)}-400`}>
                            {getMeetingTypeIcon(meeting.type)}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                              <PriorityIndicator priority={meeting.priority} size="sm" />
                              <EnhancedBadge variant={getStatusColor(meeting.status)} size="sm">
                                {meeting.status}
                              </EnhancedBadge>
                            </div>
                            
                            {meeting.description && (
                              <p className="text-gray-400 text-sm">{meeting.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(meeting.startTime)} at {formatTime(meeting.startTime)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{meeting.participants.length} participants</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {meeting.participants.slice(0, 3).map((participant) => (
                                <div
                                  key={participant.id}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium"
                                  title={participant.name}
                                >
                                  {participant.name.charAt(0)}
                                </div>
                              ))}
                              {meeting.participants.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
                                  +{meeting.participants.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {/* Advanced Meeting Controls */}
                        {meeting.status === 'ongoing' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => meeting.isRecording ? handleStopRecording(meeting.id) : handleStartRecording(meeting.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                meeting.isRecording
                                  ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30'
                                  : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                              }`}
                              title={meeting.isRecording ? 'Stop recording' : 'Start recording'}
                            >
                              {meeting.isRecording ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => meeting.hasScreenShare ? handleStopScreenShare(meeting.id) : handleStartScreenShare(meeting.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                meeting.hasScreenShare
                                  ? 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/30'
                                  : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                              }`}
                              title={meeting.hasScreenShare ? 'Stop screen share' : 'Start screen share'}
                            >
                              <MonitorSpeaker className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedMeetingForNotes(meeting);
                                setShowMeetingNotes(true);
                              }}
                              className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Meeting notes"
                            >
                              <FileText className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}

                        {/* Recordings Access */}
                        {meeting.recordings && meeting.recordings.length > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedMeetingForNotes(meeting);
                              setShowRecordings(true);
                            }}
                            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                            title="View recordings"
                          >
                            <Play className="w-4 h-4" />
                          </motion.button>
                        )}

                        {/* Calendar Sync */}
                        {!meeting.calendarIntegration?.googleCalendar && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSyncWithCalendar(meeting, 'google')}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Sync with Google Calendar"
                          >
                            <CalendarIcon className="w-4 h-4" />
                          </motion.button>
                        )}

                        {meeting.status === 'scheduled' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSendReminder(meeting.id)}
                            className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors"
                            title="Send reminder"
                          >
                            <Bell className="w-4 h-4" />
                          </motion.button>
                        )}

                        {meeting.meetingLink && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleJoinMeeting(meeting)}
                              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Join</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCopyMeetingLink(meeting)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                              title="Copy meeting link"
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRescheduleMeeting(meeting)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                          title="Reschedule meeting"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                          title="Delete meeting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="glass-effect rounded-xl p-12 border border-white/10 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No upcoming meetings</h3>
                  <p className="text-gray-400 text-sm mb-4">Schedule your first meeting to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNewMeetingModal(true)}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Schedule Meeting
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Meetings */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Schedule</h3>
            {todaysMeetings.length > 0 ? (
              <div className="space-y-3">
                {todaysMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                    <div className={`p-2 rounded bg-${getMeetingTypeColor(meeting.type)}-500/20 text-${getMeetingTypeColor(meeting.type)}-400`}>
                      {getMeetingTypeIcon(meeting.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">{meeting.title}</h4>
                      <p className="text-gray-400 text-xs">{formatTime(meeting.startTime)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No meetings today</p>
              </div>
            )}
          </div>

          {/* Meeting Stats */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Meeting Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">This Week</span>
                <span className="text-white font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">This Month</span>
                <span className="text-white font-medium">45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Avg Duration</span>
                <EnhancedBadge variant="info" size="sm">47 min</EnhancedBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Attendance Rate</span>
                <EnhancedBadge variant="success" size="sm">94%</EnhancedBadge>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const instantMeetingLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`;
                  window.open(instantMeetingLink, '_blank');
                  alert('Instant meeting started!');
                }}
                className="w-full flex items-center space-x-3 p-3 text-left bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all"
              >
                <Video className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">Start Instant Meeting</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNewMeetingModal(true)}
                className="w-full flex items-center space-x-3 p-3 text-left bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-all"
              >
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">Schedule for Later</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('Meeting preferences would open here with settings for default duration, notifications, recording options, and integration preferences.')}
                className="w-full flex items-center space-x-3 p-3 text-left bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-all"
              >
                <Settings className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">Meeting Preferences</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* New Meeting Modal Placeholder */}
      <AnimatePresence>
        {showNewMeetingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewMeetingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-xl p-6 border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">{selectedMeeting ? 'Update Meeting' : 'Schedule New Meeting'}</h2>
                <button
                  onClick={() => {
                    setShowNewMeetingModal(false);
                    setSelectedMeeting(null);
                    setNewMeeting({
                      title: '',
                      description: '',
                      date: '',
                      time: '',
                      duration: '60',
                      type: 'video',
                      participants: '',
                      meetingLink: '',
                      template: '',
                      enableRecording: false,
                      calendarSync: true,
                      agenda: ['']
                    });
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Title *</label>
                    <input
                      type="text"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter meeting title"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newMeeting.description}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Meeting description (optional)"
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                      <input
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time *</label>
                      <input
                        type="time"
                        value={newMeeting.time}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                      <select
                        value={newMeeting.duration}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Type</label>
                      <select
                        value={newMeeting.type}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="video">Video Call</option>
                        <option value="phone">Phone Call</option>
                        <option value="in-person">In Person</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Participants (emails, comma-separated)</label>
                    <input
                      type="text"
                      value={newMeeting.participants}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, participants: e.target.value }))}
                      placeholder="john@example.com, jane@example.com"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Meeting Template */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Template</label>
                    <select
                      value={newMeeting.template}
                      onChange={(e) => {
                        setNewMeeting(prev => ({ ...prev, template: e.target.value }));
                        if (e.target.value) {
                          handleApplyTemplate(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">No template (custom agenda)</option>
                      {meetingTemplates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Meeting Agenda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Agenda</label>
                    <div className="space-y-2">
                      {newMeeting.agenda.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newAgenda = [...newMeeting.agenda];
                              newAgenda[index] = e.target.value;
                              setNewMeeting(prev => ({ ...prev, agenda: newAgenda }));
                            }}
                            placeholder={`Agenda item ${index + 1}`}
                            className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const newAgenda = newMeeting.agenda.filter((_, i) => i !== index);
                              setNewMeeting(prev => ({ ...prev, agenda: newAgenda }));
                            }}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <X className="w-3 h-3" />
                          </motion.button>
                        </div>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setNewMeeting(prev => ({ ...prev, agenda: [...prev.agenda, ''] }));
                        }}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                      >
                        + Add agenda item
                      </motion.button>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-300">Advanced Options</h4>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="enableRecording"
                        checked={newMeeting.enableRecording}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, enableRecording: e.target.checked }))}
                        className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                      />
                      <label htmlFor="enableRecording" className="text-sm text-gray-300 flex items-center space-x-2">
                        <Circle className="w-4 h-4" />
                        <span>Enable automatic recording</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="calendarSync"
                        checked={newMeeting.calendarSync}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, calendarSync: e.target.checked }))}
                        className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                      />
                      <label htmlFor="calendarSync" className="text-sm text-gray-300 flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Sync with Google Calendar</span>
                      </label>
                    </div>
                  </div>

                  {newMeeting.type === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Link (optional)</label>
                      <input
                        type="url"
                        value={newMeeting.meetingLink}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, meetingLink: e.target.value }))}
                        placeholder="https://meet.google.com/xyz-abc-def"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">Leave empty to auto-generate a meeting link</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-600">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowNewMeetingModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (selectedMeeting) {
                        // Update existing meeting
                        const startDateTime = new Date(`${newMeeting.date}T${newMeeting.time}`);
                        const endDateTime = new Date(startDateTime.getTime() + parseInt(newMeeting.duration) * 60000);

                        setMeetings(prev => prev.map(m =>
                          m.id === selectedMeeting.id
                            ? {
                                ...m,
                                title: newMeeting.title,
                                description: newMeeting.description,
                                startTime: startDateTime,
                                endTime: endDateTime,
                                type: newMeeting.type,
                                meetingLink: newMeeting.meetingLink || m.meetingLink,
                                participants: newMeeting.participants.split(',').map((email, index) => ({
                                  id: `participant-${index}`,
                                  name: email.trim().split('@')[0],
                                  email: email.trim(),
                                  role: 'client' as const,
                                  status: 'pending' as const,
                                  isOrganizer: index === 0
                                }))
                              }
                            : m
                        ));
                        setSelectedMeeting(null);
                        alert('Meeting updated successfully!');
                      } else {
                        handleCreateMeeting();
                      }
                    }}
                    disabled={!newMeeting.title || !newMeeting.date || !newMeeting.time}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {selectedMeeting ? 'Update Meeting' : 'Schedule Meeting'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meeting Notes Modal */}
      <AnimatePresence>
        {showMeetingNotes && selectedMeetingForNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowMeetingNotes(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-xl p-6 border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Meeting Notes - {selectedMeetingForNotes.title}</span>
                </h2>
                <button
                  onClick={() => setShowMeetingNotes(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Existing Notes */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium text-white">Meeting Notes</h3>
                {selectedMeetingForNotes.meetingNotes && selectedMeetingForNotes.meetingNotes.length > 0 ? (
                  <div className="space-y-3">
                    {selectedMeetingForNotes.meetingNotes.map((note) => (
                      <div key={note.id} className="p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-400">{note.author}</span>
                          <span className="text-xs text-gray-400">
                            {note.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-300">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No notes yet. Add your first note below.</p>
                )}
              </div>

              {/* Add New Note */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Add Note</h3>
                <div className="space-y-3">
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Enter your meeting note..."
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                  />
                  <div className="flex items-center justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentNote('')}
                      className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                    >
                      Clear
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddMeetingNote(selectedMeetingForNotes.id, currentNote)}
                      disabled={!currentNote.trim()}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Add Note</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recordings Modal */}
      <AnimatePresence>
        {showRecordings && selectedMeetingForNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRecordings(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-xl p-6 border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Meeting Recordings - {selectedMeetingForNotes.title}</span>
                </h2>
                <button
                  onClick={() => setShowRecordings(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedMeetingForNotes.recordings && selectedMeetingForNotes.recordings.length > 0 ? (
                  selectedMeetingForNotes.recordings.map((recording) => (
                    <div key={recording.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                          <Play className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{recording.filename}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>Duration: {recording.duration}</span>
                            <span>Size: {recording.size}</span>
                            <span>Recorded: {recording.timestamp.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open(recording.url, '_blank')}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Play recording"
                        >
                          <Play className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownloadRecording(recording)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Download recording"
                        >
                          <CloudDownload className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Circle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-1">No recordings available</h3>
                    <p className="text-gray-400 text-sm">Recordings will appear here once meetings are recorded</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingScheduler;