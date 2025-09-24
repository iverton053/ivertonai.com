import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Link2,
  Users,
  Shield,
  Calendar,
  Eye,
  Edit,
  Download,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Globe,
  Lock,
  Clock,
  User,
  UserPlus,
  Settings,
  Trash2
} from 'lucide-react';
import { FileItem } from '../../types/fileManagement';

interface FileSharingModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (shareData: any) => void;
}

interface SharePermission {
  canView: boolean;
  canEdit: boolean;
  canDownload: boolean;
  canComment: boolean;
  canShare: boolean;
  expiresAt?: Date;
}

interface ShareRecipient {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  permissions: SharePermission;
  sharedAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}

const FileSharingModal: React.FC<FileSharingModalProps> = ({
  file,
  isOpen,
  onClose,
  onShare
}) => {
  const [shareType, setShareType] = useState<'link' | 'email' | 'users'>('link');
  const [emailList, setEmailList] = useState('');
  const [message, setMessage] = useState('');
  const [linkPermissions, setLinkPermissions] = useState<SharePermission>({
    canView: true,
    canEdit: false,
    canDownload: true,
    canComment: false,
    canShare: false
  });
  const [linkExpiry, setLinkExpiry] = useState<string>('');
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [linkPassword, setLinkPassword] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [existingShares, setExistingShares] = useState<ShareRecipient[]>([]);
  const [notifyRecipients, setNotifyRecipients] = useState(true);

  useEffect(() => {
    if (file && isOpen) {
      // Generate share link
      const baseUrl = window.location.origin;
      const linkId = `${file.id}_${Date.now()}`;
      setShareLink(`${baseUrl}/shared/${linkId}`);

      // Load existing shares (would come from API)
      setExistingShares([
        {
          id: '1',
          email: 'john@example.com',
          name: 'John Smith',
          permissions: {
            canView: true,
            canEdit: true,
            canDownload: true,
            canComment: true,
            canShare: false
          },
          sharedAt: new Date(Date.now() - 86400000), // 1 day ago
          status: 'accepted'
        },
        {
          id: '2',
          email: 'sarah@example.com',
          name: 'Sarah Johnson',
          permissions: {
            canView: true,
            canEdit: false,
            canDownload: true,
            canComment: true,
            canShare: false
          },
          sharedAt: new Date(Date.now() - 3600000), // 1 hour ago
          status: 'pending'
        }
      ]);
    }
  }, [file, isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShare = () => {
    const shareData = {
      fileId: file?.id,
      type: shareType,
      emails: shareType === 'email' ? emailList.split(',').map(e => e.trim()) : [],
      message,
      permissions: linkPermissions,
      expiresAt: linkExpiry ? new Date(linkExpiry) : undefined,
      passwordProtected,
      password: passwordProtected ? linkPassword : undefined,
      notifyRecipients
    };

    onShare(shareData);
    onClose();
  };

  const handlePermissionChange = (permission: keyof SharePermission, value: boolean) => {
    setLinkPermissions(prev => ({
      ...prev,
      [permission]: value
    }));
  };

  const handleRemoveShare = (shareId: string) => {
    setExistingShares(prev => prev.filter(share => share.id !== shareId));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !file) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass-effect border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl">
                <Share2 className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Share "{file.name}"
                </h2>
                <p className="text-gray-400 text-sm">
                  Control who can access this file
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
            {/* Share Type Tabs */}
            <div className="flex glass-effect border border-white/20 rounded-xl overflow-hidden">
              <button
                onClick={() => setShareType('link')}
                className={`flex-1 p-3 flex items-center justify-center gap-2 transition-all duration-200 ${
                  shareType === 'link'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Link2 size={16} />
                Share Link
              </button>
              <button
                onClick={() => setShareType('email')}
                className={`flex-1 p-3 flex items-center justify-center gap-2 transition-all duration-200 ${
                  shareType === 'email'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Mail size={16} />
                Email Invite
              </button>
              <button
                onClick={() => setShareType('users')}
                className={`flex-1 p-3 flex items-center justify-center gap-2 transition-all duration-200 ${
                  shareType === 'users'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Users size={16} />
                Team Members
              </button>
            </div>

            {/* Share Link Section */}
            {shareType === 'link' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                        linkCopied
                          ? 'bg-green-500 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                      }`}
                    >
                      {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                      {linkCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Link Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-3">
                      Link Expires
                    </label>
                    <input
                      type="datetime-local"
                      value={linkExpiry}
                      onChange={(e) => setLinkExpiry(e.target.value)}
                      className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-3">
                      Password Protection
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="passwordProtected"
                          checked={passwordProtected}
                          onChange={(e) => setPasswordProtected(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                        />
                        <label htmlFor="passwordProtected" className="text-gray-300 cursor-pointer">
                          Require password
                        </label>
                      </div>
                      {passwordProtected && (
                        <input
                          type="password"
                          value={linkPassword}
                          onChange={(e) => setLinkPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full p-2 glass-effect border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Invite Section */}
            {shareType === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    Email Addresses
                  </label>
                  <textarea
                    value={emailList}
                    onChange={(e) => setEmailList(e.target.value)}
                    placeholder="Enter email addresses separated by commas"
                    rows={3}
                    className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    rows={3}
                    className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="notifyRecipients"
                    checked={notifyRecipients}
                    onChange={(e) => setNotifyRecipients(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="notifyRecipients" className="text-gray-300 cursor-pointer">
                    Send notification email
                  </label>
                </div>
              </div>
            )}

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Permissions
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glass-effect border border-white/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Eye size={16} className="text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Can View</div>
                      <div className="text-gray-400 text-sm">View and preview the file</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={linkPermissions.canView}
                    onChange={(e) => handlePermissionChange('canView', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 glass-effect border border-white/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Edit size={16} className="text-green-400" />
                    <div>
                      <div className="text-white font-medium">Can Edit</div>
                      <div className="text-gray-400 text-sm">Make changes to the file</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={linkPermissions.canEdit}
                    onChange={(e) => handlePermissionChange('canEdit', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 glass-effect border border-white/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Download size={16} className="text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Can Download</div>
                      <div className="text-gray-400 text-sm">Download a copy of the file</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={linkPermissions.canDownload}
                    onChange={(e) => handlePermissionChange('canDownload', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 glass-effect border border-white/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-yellow-400" />
                    <div>
                      <div className="text-white font-medium">Can Comment</div>
                      <div className="text-gray-400 text-sm">Add comments and feedback</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={linkPermissions.canComment}
                    onChange={(e) => handlePermissionChange('canComment', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 glass-effect border border-white/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Share2 size={16} className="text-orange-400" />
                    <div>
                      <div className="text-white font-medium">Can Share</div>
                      <div className="text-gray-400 text-sm">Share with others</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={linkPermissions.canShare}
                    onChange={(e) => handlePermissionChange('canShare', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Existing Shares */}
            {existingShares.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  Currently Shared With ({existingShares.length})
                </label>
                <div className="space-y-2">
                  {existingShares.map(share => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-3 glass-effect border border-white/20 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {share.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{share.name}</div>
                          <div className="text-gray-400 text-sm flex items-center gap-2">
                            {share.email}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              share.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                              share.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {share.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-400">
                          {formatDate(share.sharedAt)}
                        </div>
                        <button
                          onClick={() => handleRemoveShare(share.id)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors text-gray-400 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/20">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 font-medium"
            >
              Share File
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileSharingModal;