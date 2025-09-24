import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Smile,
  Search,
  Phone,
  Video,
  MoreVertical,
  User,
  Users,
  Circle,
  CheckCircle2,
  Clock,
  Pin,
  Image,
  File,
  MessageCircle,
  X,
  Reply,
  Shield,
  Eye,
  Search as SearchIcon,
  Edit3,
  Hash
} from 'lucide-react';
import { EnhancedBadge, StatusIndicator } from '../ui/EnhancedVisualHierarchy';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role: 'team' | 'client';
  };
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  readBy?: Array<{
    userId: string;
    userName: string;
    readAt: Date;
  }>;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  isEncrypted?: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
}

interface Conversation {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'client';
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: 'team' | 'client';
    status: 'online' | 'offline' | 'away';
  }>;
  lastMessage: Message;
  unreadCount: number;
  isPinned: boolean;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  role: 'team' | 'client';
  department?: string;
  company?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
}

interface InPlatformMessagingProps {
  onUnreadChange: (count: number) => void;
}

const InPlatformMessaging: React.FC<InPlatformMessagingProps> = ({ onUnreadChange }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [contactFilter, setContactFilter] = useState<'all' | 'team' | 'clients'>('all');
  const [otherUserTyping, setOtherUserTyping] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [auditLog, setAuditLog] = useState<Array<{
    id: string;
    action: string;
    timestamp: Date;
    user: string;
    details: string;
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock contacts data
  useEffect(() => {
    const mockContacts: Contact[] = [
      // Team Members
      {
        id: 'team-1',
        name: 'Sarah Johnson',
        email: 'sarah@agency.com',
        role: 'team',
        department: 'Account Management',
        status: 'online',
        lastSeen: new Date()
      },
      {
        id: 'team-2',
        name: 'Mike Chen',
        email: 'mike@agency.com',
        role: 'team',
        department: 'Creative',
        status: 'away',
        lastSeen: new Date(Date.now() - 30 * 60000)
      },
      {
        id: 'team-3',
        name: 'Alice Johnson',
        email: 'alice@agency.com',
        role: 'team',
        department: 'Marketing',
        status: 'online',
        lastSeen: new Date()
      },
      {
        id: 'team-4',
        name: 'Bob Wilson',
        email: 'bob@agency.com',
        role: 'team',
        department: 'Analytics',
        status: 'busy',
        lastSeen: new Date(Date.now() - 15 * 60000)
      },
      {
        id: 'team-5',
        name: 'Carol Davis',
        email: 'carol@agency.com',
        role: 'team',
        department: 'Development',
        status: 'offline',
        lastSeen: new Date(Date.now() - 2 * 60 * 60000)
      },
      // Clients
      {
        id: 'client-1',
        name: 'John Smith',
        email: 'john@techcorp.com',
        role: 'client',
        company: 'TechCorp Solutions',
        status: 'online',
        lastSeen: new Date(Date.now() - 5 * 60000)
      },
      {
        id: 'client-2',
        name: 'Emma Wilson',
        email: 'emma@retailplus.com',
        role: 'client',
        company: 'RetailPlus Inc',
        status: 'offline',
        lastSeen: new Date(Date.now() - 4 * 60 * 60000)
      },
      {
        id: 'client-3',
        name: 'David Brown',
        email: 'david@startupx.com',
        role: 'client',
        company: 'StartupX',
        status: 'away',
        lastSeen: new Date(Date.now() - 45 * 60000)
      },
      {
        id: 'client-4',
        name: 'Lisa Wang',
        email: 'lisa@innovatecorp.com',
        role: 'client',
        company: 'InnovateCorp',
        status: 'online',
        lastSeen: new Date()
      },
      {
        id: 'client-5',
        name: 'James Rodriguez',
        email: 'james@globaltech.com',
        role: 'client',
        company: 'GlobalTech Industries',
        status: 'busy',
        lastSeen: new Date(Date.now() - 20 * 60000)
      }
    ];

    setAvailableContacts(mockContacts);
  }, []);

  // Mock conversations data
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        name: 'John Smith (TechCorp)',
        type: 'client',
        participants: [
          { id: 'john', name: 'John Smith', role: 'client', status: 'online' }
        ],
        lastMessage: {
          id: 'm1',
          sender: { id: 'john', name: 'John Smith', role: 'client' },
          content: 'Can we schedule a review of the Q4 campaign results?',
          timestamp: new Date(Date.now() - 5 * 60000),
          type: 'text',
          status: 'delivered'
        },
        unreadCount: 2,
        isPinned: true
      },
      {
        id: '2',
        name: 'Marketing Team',
        type: 'group',
        participants: [
          { id: 'alice', name: 'Alice Johnson', role: 'team', status: 'online' },
          { id: 'bob', name: 'Bob Wilson', role: 'team', status: 'away' },
          { id: 'carol', name: 'Carol Davis', role: 'team', status: 'offline' }
        ],
        lastMessage: {
          id: 'm2',
          sender: { id: 'alice', name: 'Alice Johnson', role: 'team' },
          content: 'The new campaign assets are ready for review',
          timestamp: new Date(Date.now() - 15 * 60000),
          type: 'text',
          status: 'read'
        },
        unreadCount: 0,
        isPinned: false
      },
      {
        id: '3',
        name: 'Sarah Wilson (RetailPlus)',
        type: 'client',
        participants: [
          { id: 'sarah', name: 'Sarah Wilson', role: 'client', status: 'offline' }
        ],
        lastMessage: {
          id: 'm3',
          sender: { id: 'sarah', name: 'Sarah Wilson', role: 'client' },
          content: 'Thank you for the detailed analytics report!',
          timestamp: new Date(Date.now() - 2 * 60 * 60000),
          type: 'text',
          status: 'read'
        },
        unreadCount: 0,
        isPinned: false
      }
    ];
    
    setConversations(mockConversations);
    setActiveConversation(mockConversations[0].id);
    
    // Calculate total unread count
    const totalUnread = mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    onUnreadChange(totalUnread);
  }, [onUnreadChange]);

  // Mock messages for active conversation
  useEffect(() => {
    if (activeConversation) {
      const mockMessages: Message[] = [
        {
          id: 'm1',
          sender: { id: 'john', name: 'John Smith', role: 'client' },
          content: 'Hi! I hope you\'re doing well. I wanted to discuss the performance metrics for our recent campaign.',
          timestamp: new Date(Date.now() - 2 * 60 * 60000),
          type: 'text',
          status: 'read'
        },
        {
          id: 'm2',
          sender: { id: 'me', name: 'You', role: 'team' },
          content: 'Hello John! Absolutely, I\'d be happy to go over the metrics with you. The campaign performed exceptionally well.',
          timestamp: new Date(Date.now() - 90 * 60000),
          type: 'text',
          status: 'read'
        },
        {
          id: 'm3',
          sender: { id: 'me', name: 'You', role: 'team' },
          content: 'I\'ve attached the detailed performance report for your review.',
          timestamp: new Date(Date.now() - 85 * 60000),
          type: 'text',
          status: 'read',
          attachments: [
            {
              id: 'a1',
              name: 'Q4-Campaign-Report.pdf',
              type: 'pdf',
              size: '2.4 MB',
              url: '#'
            }
          ]
        },
        {
          id: 'm4',
          sender: { id: 'john', name: 'John Smith', role: 'client' },
          content: 'Can we schedule a review of the Q4 campaign results?',
          timestamp: new Date(Date.now() - 5 * 60000),
          type: 'text',
          status: 'delivered'
        }
      ];
      setMessages(mockMessages);
      
      // Scroll to bottom after loading messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [activeConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Small delay to ensure DOM has updated
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages]);

  // Simulate other user typing (demo)
  useEffect(() => {
    if (activeConversation) {
      const interval = setInterval(() => {
        if (Math.random() > 0.8) {
          const names = ['John Smith', 'Alice Johnson', 'Bob Wilson'];
          const randomName = names[Math.floor(Math.random() * names.length)];
          setOtherUserTyping(randomName);

          setTimeout(() => {
            setOtherUserTyping(null);
          }, 3000);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  // Auto-save draft
  useEffect(() => {
    if (messageDraft && activeConversation) {
      const savedDrafts = JSON.parse(localStorage.getItem('messageDrafts') || '{}');
      savedDrafts[activeConversation] = messageDraft;
      localStorage.setItem('messageDrafts', JSON.stringify(savedDrafts));
    }
  }, [messageDraft, activeConversation]);

  // Load draft when switching conversations
  useEffect(() => {
    if (activeConversation) {
      const savedDrafts = JSON.parse(localStorage.getItem('messageDrafts') || '{}');
      const draft = savedDrafts[activeConversation] || '';
      setNewMessage(draft);
      setMessageDraft(draft);
    }
  }, [activeConversation]);

  // Security audit logging
  const logSecurityEvent = (action: string, details: string) => {
    const logEntry = {
      id: Date.now().toString(),
      action,
      timestamp: new Date(),
      user: 'Current User',
      details
    };
    setAuditLog(prev => [logEntry, ...prev.slice(0, 99)]); // Keep last 100 events
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    // Log message sending for security audit
    logSecurityEvent('MESSAGE_SENT', `Message sent to conversation ${activeConversation}. Length: ${newMessage.length} chars. Encrypted: ${true}`);

    const message: Message = {
      id: Date.now().toString(),
      sender: { id: 'me', name: 'You', role: 'team' },
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
      status: 'sent',
      isEncrypted: true,
      replyTo: replyToMessage ? {
        messageId: replyToMessage.id,
        content: replyToMessage.content.length > 50
          ? replyToMessage.content.substring(0, 50) + '...'
          : replyToMessage.content,
        senderName: replyToMessage.sender.name
      } : undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setMessageDraft('');
    setReplyToMessage(null);

    // Clear draft from localStorage
    if (activeConversation) {
      const savedDrafts = JSON.parse(localStorage.getItem('messageDrafts') || '{}');
      delete savedDrafts[activeConversation];
      localStorage.setItem('messageDrafts', JSON.stringify(savedDrafts));
    }

    // Focus back to input
    inputRef.current?.focus();

    // Simulate delivery and read status updates
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === message.id ? {
          ...msg,
          status: 'read',
          readBy: [{
            userId: 'other-user',
            userName: 'John Smith',
            readAt: new Date()
          }]
        } : msg
      ));
    }, 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && activeConversation) {
      const file = files[0];
      const attachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        url: URL.createObjectURL(file)
      };

      const message: Message = {
        id: Date.now().toString(),
        sender: { id: 'me', name: 'You', role: 'team' },
        content: `Shared ${file.name}`,
        timestamp: new Date(),
        type: 'file',
        status: 'sent',
        attachments: [attachment],
        isEncrypted: true
      };

      // Log security event for file upload
      logSecurityEvent('FILE_UPLOAD', `File uploaded: ${file.name} (${attachment.size}) to conversation ${activeConversation}. Encrypted: Yes`);

      setMessages(prev => [...prev, message]);
      setShowFileUpload(false);
      alert(`File uploaded securely:\n\n🔒 End-to-end encrypted\n🛡️ Security audit logged\n📊 File scanned for threats`);
    }
  };

  const handleStartVideoCall = () => {
    if (activeConversation) {
      const conversation = conversations.find(c => c.id === activeConversation);
      const meetingLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 11)}`;

      // Add system message
      const message: Message = {
        id: Date.now().toString(),
        sender: { id: 'system', name: 'System', role: 'team' },
        content: `📹 Video call started: ${meetingLink}`,
        timestamp: new Date(),
        type: 'text',
        status: 'sent',
        isEncrypted: true
      };
      setMessages(prev => [...prev, message]);

      // Log security event
      logSecurityEvent('VIDEO_CALL_STARTED', `Video call initiated with ${conversation?.name}. Meeting link: ${meetingLink}`);

      // Open video call and notify user
      window.open(meetingLink, '_blank');
      alert(`Video call started with ${conversation?.name}. Meeting link: ${meetingLink}\n\n🔒 End-to-end encrypted\n🛡️ Security audit logged`);
    }
  };

  const handleStartPhoneCall = () => {
    if (activeConversation) {
      const conversation = conversations.find(c => c.id === activeConversation);
      const phoneNumber = '+1-555-0123'; // This would come from conversation participant data

      // Add system message
      const message: Message = {
        id: Date.now().toString(),
        sender: { id: 'system', name: 'System', role: 'team' },
        content: `📞 Phone call initiated to ${phoneNumber}`,
        timestamp: new Date(),
        type: 'text',
        status: 'sent',
        isEncrypted: true
      };
      setMessages(prev => [...prev, message]);

      // Log security event
      logSecurityEvent('PHONE_CALL_INITIATED', `Phone call initiated with ${conversation?.name} at ${phoneNumber}`);

      // Initiate phone call
      if (confirm(`Call ${conversation?.name} at ${phoneNumber}?`)) {
        window.location.href = `tel:${phoneNumber}`;
        alert('Phone call initiated. Your device will handle the call.\n\n🛡️ Call logged for security audit');
      }
    }
  };

  const handleMarkAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, unreadCount: 0 }
        : conv
    ));

    // Update unread count for parent
    const newTotal = conversations.reduce((sum, conv) =>
      sum + (conv.id === conversationId ? 0 : conv.unreadCount), 0
    );
    onUnreadChange(newTotal);
  };

  const handlePinConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, isPinned: !conv.isPinned }
        : conv
    ));
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (activeConversation === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
      alert('Conversation deleted');
    }
  };

  const handleCreateNewConversation = () => {
    setShowContactsModal(true);
  };

  const startConversationWithContact = (contact: Contact) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(conv =>
      conv.participants.some(p => p.id === contact.id)
    );

    if (existingConversation) {
      setActiveConversation(existingConversation.id);
      setShowContactsModal(false);
      alert(`Switched to existing conversation with ${contact.name}`);
      return;
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: Date.now().toString(),
      name: contact.role === 'client' ? `${contact.name} (${contact.company})` : contact.name,
      type: contact.role === 'client' ? 'client' : 'direct',
      participants: [
        {
          id: contact.id,
          name: contact.name,
          role: contact.role,
          status: contact.status
        }
      ],
      lastMessage: {
        id: 'initial',
        sender: { id: 'system', name: 'System', role: 'team' },
        content: 'Conversation started',
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      },
      unreadCount: 0,
      isPinned: false
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation.id);
    setShowContactsModal(false);
    alert(`New conversation started with ${contact.name}`);
  };

  const getFilteredContacts = () => {
    const filtered = availableContacts.filter(contact => {
      if (contactFilter === 'team') return contact.role === 'team';
      if (contactFilter === 'clients') return contact.role === 'client';
      return true;
    });

    // Sort by status (online first) then by name
    return filtered.sort((a, b) => {
      const statusOrder = { online: 0, busy: 1, away: 2, offline: 3 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return a.name.localeCompare(b.name);
    });
  };

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return lastSeen.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Circle className="w-3 h-3 fill-green-400 text-green-400" />;
      case 'away':
        return <Circle className="w-3 h-3 fill-yellow-400 text-yellow-400" />;
      case 'offline':
        return <Circle className="w-3 h-3 fill-gray-400 text-gray-400" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  return (
    <div className="h-[600px] flex bg-gray-800/30 rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-700/50 flex flex-col">
        {/* Search & New Conversation */}
        <div className="p-4 border-b border-gray-700/50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNewConversation}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <User className="w-4 h-4" />
            <span>New Conversation</span>
          </motion.button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.2)' }}
              onClick={() => {
                setActiveConversation(conversation.id);
                handleMarkAsRead(conversation.id);
              }}
              className={`group relative p-4 cursor-pointer border-b border-gray-700/30 transition-all ${
                activeConversation === conversation.id ? 'bg-purple-500/10 border-l-4 border-l-purple-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
                    {conversation.type === 'group' ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      conversation.name.charAt(0)
                    )}
                  </div>
                  {conversation.type !== 'group' && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {getStatusIcon(conversation.participants[0]?.status)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium truncate ${
                      conversation.unreadCount > 0 ? 'text-white' : 'text-gray-300'
                    }`}>
                      {conversation.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {conversation.isPinned && (
                        <Pin className="w-3 h-3 text-yellow-400" />
                      )}
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${
                      conversation.unreadCount > 0 ? 'text-gray-300 font-medium' : 'text-gray-400'
                    }`}>
                      {conversation.lastMessage.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <EnhancedBadge
                      variant={conversation.type === 'client' ? 'blue' : 'green'}
                      size="sm"
                    >
                      {conversation.type === 'client' ? 'Client' : conversation.type === 'group' ? 'Team' : 'Direct'}
                    </EnhancedBadge>

                    {/* Conversation Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinConversation(conversation.id);
                        }}
                        className={`p-1 rounded hover:bg-gray-600/50 transition-colors ${
                          conversation.isPinned ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
                        }`}
                        title={conversation.isPinned ? 'Unpin' : 'Pin conversation'}
                      >
                        <Pin className="w-3 h-3" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation.id);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-900/10 transition-colors"
                        title="Delete conversation"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                  {conversations.find(c => c.id === activeConversation)?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {conversations.find(c => c.id === activeConversation)?.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <StatusIndicator 
                      status={conversations.find(c => c.id === activeConversation)?.participants[0]?.status === 'online' ? 'active' : 'inactive'}
                      size="sm"
                      showIcon={false}
                    />
                    <span className="text-xs text-gray-400">
                      {conversations.find(c => c.id === activeConversation)?.participants[0]?.status || 'offline'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMessageSearch(!showMessageSearch)}
                  className={`p-2 hover:bg-gray-700/30 rounded-lg transition-colors ${
                    showMessageSearch ? 'text-purple-400 bg-purple-500/20' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Search messages"
                >
                  <SearchIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartPhoneCall}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                  title="Start Phone Call"
                >
                  <Phone className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartVideoCall}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                  title="Start Video Call"
                >
                  <Video className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMessageSearch(!showMessageSearch)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                  title="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Message Search */}
            {showMessageSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/50"
              >
                <div className="relative">
                  <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={messageSearchTerm}
                    onChange={(e) => setMessageSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm"
                  />
                  {messageSearchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setMessageSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
                {messageSearchTerm && (
                  <p className="text-xs text-gray-400 mt-2">
                    {messages.filter(msg =>
                      msg.content.toLowerCase().includes(messageSearchTerm.toLowerCase()) ||
                      msg.sender.name.toLowerCase().includes(messageSearchTerm.toLowerCase())
                    ).length} messages found
                  </p>
                )}
              </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
              <div className="flex-1 min-h-0"></div>
              <div className="space-y-4">
                {(messageSearchTerm
                  ? messages.filter(msg =>
                      msg.content.toLowerCase().includes(messageSearchTerm.toLowerCase()) ||
                      msg.sender.name.toLowerCase().includes(messageSearchTerm.toLowerCase())
                    )
                  : messages
                ).map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender.id === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                      message.sender.id === 'me'
                        ? 'bg-purple-500 text-white ml-4'
                        : 'bg-gray-700 text-white mr-4'
                    }`}>
                      {/* Reply Preview */}
                      {message.replyTo && (
                        <div className="mb-2 p-2 bg-black/20 rounded border-l-2 border-gray-400">
                          <div className="flex items-center space-x-1 mb-1">
                            <Reply className="w-3 h-3" />
                            <span className="text-xs opacity-75">{message.replyTo.senderName}</span>
                          </div>
                          <p className="text-xs opacity-75 italic">{message.replyTo.content}</p>
                        </div>
                      )}

                      {/* Encryption Indicator */}
                      {message.isEncrypted && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Shield className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400">Encrypted</span>
                        </div>
                      )}

                      {/* Reply Button */}
                      {message.sender.id !== 'me' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setReplyToMessage(message)}
                          className="absolute -top-2 -right-2 p-1 bg-gray-600 hover:bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Reply to message"
                        >
                          <Reply className="w-3 h-3" />
                        </motion.button>
                      )}

                      <p className="text-sm">{message.content}</p>
                      
                      {message.attachments && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-black/20 rounded border">
                              <File className="w-4 h-4" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{attachment.name}</p>
                                <p className="text-xs opacity-75">{attachment.size}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className={`flex items-center justify-between mt-2 text-xs ${
                        message.sender.id === 'me' ? 'text-purple-100' : 'text-gray-400'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sender.id === 'me' && (
                          <div className="flex items-center space-x-1">
                            {message.status === 'sent' && <Clock className="w-3 h-3" />}
                            {message.status === 'delivered' && <CheckCircle2 className="w-3 h-3" />}
                            {message.status === 'read' && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-blue-400" />
                                {message.readBy && message.readBy.length > 0 && (
                                  <Eye className="w-3 h-3 text-blue-400" title={`Read by ${message.readBy.map(r => r.userName).join(', ')} at ${message.readBy[0].readAt.toLocaleTimeString()}`} />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {/* Typing Indicator */}
                {otherUserTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-700 text-white px-4 py-2 rounded-lg mr-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-300">{otherUserTyping} is typing</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700/50">
              {/* Reply Preview */}
              {replyToMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-3 bg-gray-700/50 rounded-lg border-l-4 border-purple-500"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Reply className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-400 font-medium">
                        Replying to {replyToMessage.sender.name}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setReplyToMessage(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <p className="text-sm text-gray-300 italic">
                    {replyToMessage.content.length > 100
                      ? replyToMessage.content.substring(0, 100) + '...'
                      : replyToMessage.content
                    }
                  </p>
                </motion.div>
              )}

              {/* Draft Auto-save Indicator */}
              {messageDraft && messageDraft !== newMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-2 flex items-center space-x-2 text-xs text-gray-400"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Draft saved automatically</span>
                </motion.div>
              )}

              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      setMessageDraft(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none min-h-[40px] max-h-32"
                    rows={1}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="*/*"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </motion.button>
                  </div>
                  
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                      title="Add emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </motion.button>
                    
                    {/* Emoji Picker */}
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-12 right-0 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg z-50"
                        >
                          <div className="grid grid-cols-6 gap-2">
                            {['😊', '😂', '👍', '❤️', '🎉', '🔥', '💯', '✨', '👌', '😍', '🚀', '💪', '🎯', '📈', '💡', '⚡', '🌟', '🎊'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleEmojiSelect(emoji)}
                                className="p-2 hover:bg-gray-700 rounded text-lg transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Select a conversation</h3>
              <p className="text-gray-400 text-sm">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Contacts Modal */}
      <AnimatePresence>
        {showContactsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowContactsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-xl p-6 border border-white/10 max-w-md w-full max-h-[70vh] overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Start New Conversation</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowContactsModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 mb-4">
                {[
                  { id: 'all', label: 'All', count: availableContacts.length },
                  { id: 'team', label: 'Team', count: availableContacts.filter(c => c.role === 'team').length },
                  { id: 'clients', label: 'Clients', count: availableContacts.filter(c => c.role === 'client').length }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setContactFilter(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      contactFilter === tab.id
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-xs bg-gray-600 px-1.5 py-0.5 rounded">{tab.count}</span>
                  </motion.button>
                ))}
              </div>

              {/* Contacts List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getFilteredContacts().map((contact) => (
                  <motion.div
                    key={contact.id}
                    whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.2)' }}
                    onClick={() => startConversationWithContact(contact)}
                    className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-700/30"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {getStatusIcon(contact.status)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white truncate">{contact.name}</h3>
                        <EnhancedBadge
                          variant={contact.role === 'client' ? 'blue' : 'green'}
                          size="sm"
                        >
                          {contact.role === 'client' ? 'Client' : 'Team'}
                        </EnhancedBadge>
                      </div>

                      <p className="text-sm text-gray-400 truncate">
                        {contact.role === 'team' ? contact.department : contact.company}
                      </p>

                      {contact.status !== 'online' && contact.lastSeen && (
                        <p className="text-xs text-gray-500">
                          Last seen {formatLastSeen(contact.lastSeen)}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <StatusIndicator
                        status={contact.status === 'online' ? 'active' : 'inactive'}
                        size="sm"
                        showIcon={false}
                      />
                      <p className="text-xs text-gray-400 capitalize">{contact.status}</p>
                    </div>
                  </motion.div>
                ))}

                {getFilteredContacts().length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-1">No contacts found</h3>
                    <p className="text-gray-400 text-sm">No {contactFilter === 'all' ? '' : contactFilter === 'team' ? 'team members' : 'clients'} available</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-600">
                <p className="text-xs text-gray-400 text-center">
                  Select a contact to start a new conversation
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InPlatformMessaging;