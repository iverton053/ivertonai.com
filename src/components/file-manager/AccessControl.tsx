import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  UserCheck, 
  UserX,
  Crown,
  Eye,
  Edit,
  Trash2,
  Share2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Copy,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useFileManagerStore } from '../../stores/fileManagerStore';
import { SharedAccess, FileItem } from '../../types/fileManagement';

interface AccessControlProps {
  fileId?: string;
  onClose?: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  department?: string;
  lastActive: Date;
  isOnline: boolean;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar?: string;
  role: 'viewer';
  accountManager: string;
  contractEnd?: Date;
  isActive: boolean;
}

const AccessControl: React.FC<AccessControlProps> = ({ fileId, onClose }) => {
  const { files, updateFile } = useFileManagerStore();
  
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'clients' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteType, setInviteType] = useState<'team' | 'client'>('team');

  // Mock data - in real app this would come from API
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: 'tm1',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'admin',
      department: 'Marketing',
      lastActive: new Date(),
      isOnline: true
    },
    {
      id: 'tm2',
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'editor',
      department: 'Design',
      lastActive: new Date(Date.now() - 3600000),
      isOnline: false
    },
    {
      id: 'tm3',
      name: 'Emily Rodriguez',
      email: 'emily@company.com',
      role: 'editor',
      department: 'Development',
      lastActive: new Date(Date.now() - 1800000),
      isOnline: true
    }
  ]);

  const [clients] = useState<Client[]>([
    {
      id: 'cl1',
      name: 'John Smith',
      email: 'john@clientcorp.com',
      company: 'Client Corp',
      role: 'viewer',
      accountManager: 'Sarah Johnson',
      contractEnd: new Date(Date.now() + 90 * 24 * 3600000),
      isActive: true
    },
    {
      id: 'cl2',
      name: 'Lisa Wang',
      email: 'lisa@techstart.com',
      company: 'TechStart Inc',
      role: 'viewer',
      accountManager: 'Mike Chen',
      isActive: true
    }
  ]);

  useEffect(() => {
    if (fileId) {
      const file = files.find(f => f.id === fileId);
      setSelectedFile(file || null);
    }
  }, [fileId, files]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="text-yellow-500" size={16} />;
      case 'editor': return <Edit className="text-blue-500" size={16} />;
      case 'viewer': return <Eye className="text-green-500" size={16} />;
      default: return <UserCheck className="text-slate-500" size={16} />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-900/50 text-yellow-300 dark:bg-yellow-900 dark:text-yellow-300';
      case 'editor': return 'bg-blue-100 text-blue-300 dark:bg-blue-900 dark:text-blue-300';
      case 'viewer': return 'bg-green-900/50 text-green-300 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const InviteModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
    const [expiryDate, setExpiryDate] = useState('');
    const [message, setMessage] = useState('');

    const handleInvite = () => {
      // TODO: Implement invite logic
      console.log('Inviting:', { email, role, expiryDate, message, type: inviteType });
      onClose();
    };

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Invite {inviteType === 'team' ? 'Team Member' : 'Client'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Access Level
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {inviteType === 'team' && <option value="admin">Admin - Full access</option>}
                    <option value="editor">Editor - Can view, download, and edit</option>
                    <option value="viewer">Viewer - Can view and download only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Access Expiry (optional)
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Personal Message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message to the invitation..."
                    rows={3}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!email}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Access Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-blue-500" size={20} />
            <span className="font-medium text-slate-900 dark:text-white">Team Members</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {teamMembers.length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {teamMembers.filter(m => m.isOnline).length} online
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="text-green-500" size={20} />
            <span className="font-medium text-slate-900 dark:text-white">Clients</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {clients.length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {clients.filter(c => c.isActive).length} active
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="text-purple-500" size={20} />
            <span className="font-medium text-slate-900 dark:text-white">Shared Files</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {files.filter(f => f.isShared).length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total shared
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Access Activity</h3>
        <div className="space-y-3">
          {[
            { user: 'Sarah Johnson', action: 'downloaded', file: 'Q4 Report.pdf', time: '2 minutes ago' },
            { user: 'Mike Chen', action: 'viewed', file: 'Brand Guidelines.sketch', time: '1 hour ago' },
            { user: 'John Smith (Client)', action: 'accessed', file: 'Project Proposal.docx', time: '3 hours ago' },
            { user: 'Emily Rodriguez', action: 'shared', file: 'Mockups v2.zip', time: '1 day ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-slate-900 dark:text-white">
                    <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.file}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TeamTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Team Members</h3>
        <button
          onClick={() => {
            setInviteType('team');
            setShowInviteModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Invite Member
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {member.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white dark:border-slate-800 rounded-full"></div>
                )}
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{member.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{member.email}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {member.department} • Last active {formatTimeAgo(member.lastActive)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                {member.role}
              </span>
              <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ClientsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Client Access</h3>
        <button
          onClick={() => {
            setInviteType('client');
            setShowInviteModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Client
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {clients.map((client) => (
          <div key={client.id} className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{client.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{client.email}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {client.company} • Managed by {client.accountManager}
                  {client.contractEnd && ` • Contract ends ${formatDate(client.contractEnd)}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(client.role)}`}>
                {client.role}
              </span>
              {client.contractEnd && new Date(client.contractEnd).getTime() - Date.now() < 30 * 24 * 3600000 && (
                <AlertTriangle className="text-orange-500" size={16} title="Contract expiring soon" />
              )}
              <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Access Permissions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Default File Sharing</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Allow team members to share files by default</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Client Portal Access</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Enable dedicated client portal for file access</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Download Tracking</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Track file downloads and access logs</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Default Access Expiry
            </label>
            <select className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="never">Never expires</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password Protection
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Require password for external sharing
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              IP Restrictions
            </label>
            <input
              type="text"
              placeholder="192.168.1.0/24, 10.0.0.0/8"
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Comma-separated list of allowed IP ranges (optional)
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-500" size={24} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Access Control
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Manage team and client access to files
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-6 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'clients', label: 'Clients', icon: UserCheck },
            { id: 'settings', label: 'Settings', icon: MoreVertical }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'team' && <TeamTab />}
            {activeTab === 'clients' && <ClientsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
};

export default AccessControl;