import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Share2, 
  Lock, 
  Globe, 
  Eye, 
  Download, 
  MessageSquare,
  Clock,
  User,
  UserPlus,
  Settings,
  Copy,
  ExternalLink,
  Shield,
  Calendar,
  Filter,
  Search,
  Grid3X3,
  List
} from 'lucide-react';
import { useFileManagerStore } from '../../stores/fileManagerStore';
import { FileItem, SharedAccess } from '../../types/fileManagement';

interface SharedLibraryProps {
  teamMode?: boolean;
  clientId?: string;
}

const SharedLibrary: React.FC<SharedLibraryProps> = ({ teamMode = false, clientId }) => {
  const {
    files,
    view,
    setView,
    getSharedFiles
  } = useFileManagerStore();

  const [shareFilter, setShareFilter] = useState<'all' | 'team' | 'clients' | 'public'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const sharedFiles = useMemo(() => {
    let filteredFiles = getSharedFiles();

    if (clientId) {
      filteredFiles = filteredFiles.filter(file => 
        file.sharedWith.some(share => share.userId === clientId)
      );
    }

    if (shareFilter !== 'all') {
      filteredFiles = filteredFiles.filter(file => {
        switch (shareFilter) {
          case 'team':
            return file.sharedWith.some(share => share.role === 'editor' || share.role === 'admin');
          case 'clients':
            return file.sharedWith.some(share => share.role === 'viewer');
          case 'public':
            return file.sharedWith.length === 0; // Publicly accessible
          default:
            return true;
        }
      });
    }

    if (searchQuery) {
      filteredFiles = filteredFiles.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filteredFiles;
  }, [getSharedFiles, shareFilter, searchQuery, clientId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    return '📎';
  };

  const getAccessIcon = (file: FileItem) => {
    if (file.sharedWith.length === 0) return <Globe className="text-green-500" size={16} />;
    if (file.sharedWith.some(share => share.role === 'admin' || share.role === 'editor')) {
      return <Users className="text-blue-500" size={16} />;
    }
    return <User className="text-orange-500" size={16} />;
  };

  const getAccessLevel = (file: FileItem): string => {
    if (file.sharedWith.length === 0) return 'Public';
    if (file.sharedWith.some(share => share.role === 'admin' || share.role === 'editor')) {
      return 'Team';
    }
    return 'Client';
  };

  const ShareModal: React.FC<{ file: FileItem; onClose: () => void }> = ({ file, onClose }) => {
    const [shareEmail, setShareEmail] = useState('');
    const [shareRole, setShareRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
    const [shareExpiry, setShareExpiry] = useState('');
    const [allowReshare, setAllowReshare] = useState(false);

    const handleShare = () => {
      // TODO: Implement sharing logic
      console.log('Sharing file:', file.id, 'with:', shareEmail, 'role:', shareRole);
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
                Share "{file.name}"
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Access Level
                  </label>
                  <select
                    value={shareRole}
                    onChange={(e) => setShareRole(e.target.value as 'viewer' | 'editor' | 'admin')}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="viewer">Viewer - Can view and download</option>
                    <option value="editor">Editor - Can view, download, and edit</option>
                    <option value="admin">Admin - Full access including sharing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Expiry Date (optional)
                  </label>
                  <input
                    type="date"
                    value={shareExpiry}
                    onChange={(e) => setShareExpiry(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowReshare"
                    checked={allowReshare}
                    onChange={(e) => setAllowReshare(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="allowReshare" className="text-sm text-slate-700 dark:text-slate-300">
                    Allow recipient to reshare
                  </label>
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
                  onClick={handleShare}
                  disabled={!shareEmail}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {teamMode ? 'Team Library' : clientId ? 'Client Portal' : 'Shared Library'}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {teamMode 
                ? 'Files shared with your team members'
                : clientId 
                ? 'Files shared specifically with this client'
                : 'Files shared across teams and clients'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {!clientId && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 size={20} />
                Share Files
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Settings size={20} />
              Settings
            </button>
          </div>
        </div>

        {/* Share Filter Pills */}
        <div className="flex items-center gap-2 mb-4">
          {['all', 'team', 'clients', 'public'].map((filter) => (
            <button
              key={filter}
              onClick={() => setShareFilter(filter as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                shareFilter === filter
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {filter === 'all' ? 'All Shared' : 
               filter === 'team' ? 'Team Only' :
               filter === 'clients' ? 'Client Access' : 'Public'}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="text-blue-500" size={20} />
              <span className="font-medium text-slate-900 dark:text-white">Total Shared</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {sharedFiles.length}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-green-500" size={20} />
              <span className="font-medium text-slate-900 dark:text-white">Team Files</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {sharedFiles.filter(f => f.sharedWith.some(s => s.role === 'editor' || s.role === 'admin')).length}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="text-orange-500" size={20} />
              <span className="font-medium text-slate-900 dark:text-white">Client Files</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {sharedFiles.filter(f => f.sharedWith.some(s => s.role === 'viewer')).length}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="text-purple-500" size={20} />
              <span className="font-medium text-slate-900 dark:text-white">Downloads</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {sharedFiles.reduce((sum, file) => sum + file.downloadCount, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search shared files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`p-2 transition-colors ${
                  view === 'grid'
                    ? 'bg-blue-900/200 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 transition-colors ${
                  view === 'list'
                    ? 'bg-blue-900/200 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Files Grid/List */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {sharedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedFile(file)}
                  layout
                >
                  {/* File Preview */}
                  <div className="aspect-square flex items-center justify-center p-4 relative">
                    {file.thumbnailUrl ? (
                      <img
                        src={file.thumbnailUrl}
                        alt={file.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="text-4xl">
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}

                    {/* Access Level Badge */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                      {getAccessIcon(file)}
                      <span className="text-xs font-medium">{getAccessLevel(file)}</span>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate mb-1">
                      {file.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{file.downloadCount} downloads</span>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Shared {formatDate(file.uploadedAt)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Access</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Downloads</div>
                <div className="col-span-1">Actions</div>
              </div>
              {sharedFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedFile(file)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <span className="text-lg">{getFileIcon(file.mimeType)}</span>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{file.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Shared {formatDate(file.uploadedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center gap-2">
                      {getAccessIcon(file)}
                      <span className="text-sm">{getAccessLevel(file)}</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center text-slate-600 dark:text-slate-400">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="col-span-2 flex items-center text-slate-600 dark:text-slate-400">
                    {file.downloadCount} downloads
                  </div>
                  <div className="col-span-1 flex items-center gap-2">
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors">
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(file);
                        setShowShareModal(true);
                      }}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {sharedFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium mb-2">No shared files</h3>
            <p className="text-center">
              {shareFilter === 'all' 
                ? 'No files have been shared yet'
                : `No files shared with ${shareFilter}`
              }
            </p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && selectedFile && (
        <ShareModal
          file={selectedFile}
          onClose={() => {
            setShowShareModal(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
};

export default SharedLibrary;