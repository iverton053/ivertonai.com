import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from './FileUpload';
import FilePreviewModal from './FilePreviewModal';
import FileContextMenu from './FileContextMenu';
import AdvancedSearchPanel from './AdvancedSearchPanel';
import FileSharingModal from './FileSharingModal';
import {
  Upload,
  Search,
  Filter,
  Grid3X3,
  List,
  Image,
  FolderPlus,
  Download,
  Share2,
  Trash2,
  Star,
  MoreVertical,
  Eye,
  Edit,
  Move,
  Copy,
  Settings,
  CheckSquare,
  Square,
  RefreshCw,
  SortAsc,
  SortDesc,
  Archive,
  FileText,
  Folder
} from 'lucide-react';
import { useFileManagerStore } from '../../stores/fileManagerStore';
import { FileCategory, FileItem } from '../../types/fileManagement';

interface FileManagerProps {
  isMobile?: boolean;
}

const FileManager: React.FC<FileManagerProps> = ({ isMobile = false }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuFile, setContextMenuFile] = useState<FileItem | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [sharingFile, setSharingFile] = useState<FileItem | null>(null);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const {
    files,
    folders,
    selectedFiles,
    currentFolder,
    view,
    sortBy,
    sortOrder,
    isLoading,
    searchFilters,
    quota,
    favoriteFiles,
    setView,
    setSelectedFiles,
    toggleFileSelection,
    clearSelection,
    navigateToFolder,
    setSearchFilters,
    addToFavorites,
    removeFromFavorites,
    refreshFiles,
    getFilesByCategory,
    getRecentFiles,
    getFavoriteFiles,
    downloadFile,
    deleteFile,
    shareFile,
    searchFiles,
    selectAllFiles,
    addFolder
  } = useFileManagerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FileCategory | 'all' | 'recent' | 'favorites'>('all');

  // Load files on component mount
  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const categoryStats = {
    contracts: getFilesByCategory('contracts').length,
    'creative-assets': getFilesByCategory('creative-assets').length,
    invoices: getFilesByCategory('invoices').length,
    documents: getFilesByCategory('documents').length,
    media: getFilesByCategory('media').length,
  };

  const getDisplayFiles = () => {
    switch (activeCategory) {
      case 'recent':
        return getRecentFiles(20);
      case 'favorites':
        return getFavoriteFiles();
      case 'all':
        return files;
      default:
        return getFilesByCategory(activeCategory as FileCategory);
    }
  };

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category: FileCategory) => {
    const icons = {
      contracts: '📄',
      'creative-assets': '🎨',
      invoices: '💰',
      reports: '📊',
      presentations: '📽️',
      templates: '📋',
      media: '🎬',
      documents: '📑',
      uncategorized: '📁'
    };
    return icons[category] || '📁';
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

  const handleFileClick = async (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    // If in bulk select mode or control/cmd key is pressed, toggle selection
    if (bulkSelectMode || event.ctrlKey || event.metaKey) {
      toggleFileSelection(fileId);
      return;
    }

    // Open file in preview modal
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const displayFiles = getDisplayFiles();
    const index = displayFiles.findIndex(f => f.id === fileId);

    setPreviewFile(file);
    setPreviewIndex(index);
    setShowPreviewModal(true);
  };

  const handleFileRightClick = (fileId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const file = files.find(f => f.id === fileId);
    if (!file) return;

    setContextMenuFile(file);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  };

  const handleContextAction = async (action: string, file: FileItem) => {
    try {
      switch (action) {
        case 'preview':
          setPreviewFile(file);
          setShowPreviewModal(true);
          break;
        case 'download':
          await downloadFile(file.id);
          break;
        case 'share':
          setSharingFile(file);
          setShowSharingModal(true);
          break;
        case 'favorite':
          if (favoriteFiles.includes(file.id)) {
            removeFromFavorites(file.id);
          } else {
            addToFavorites(file.id);
          }
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this file?')) {
            await deleteFile(file.id);
          }
          break;
        case 'copy-link':
          await navigator.clipboard.writeText(file.url || '');
          break;
        case 'rename':
          // Handle rename functionality
          break;
        default:
          console.log('Action not implemented:', action);
      }
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handleAdvancedSearch = async (filters: any) => {
    try {
      await searchFiles(filters.query || '');
      // Apply additional filters here
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedFiles.length === 0) return;

    try {
      switch (action) {
        case 'download':
          // Download multiple files (would typically create a zip)
          for (const fileId of selectedFiles) {
            await downloadFile(fileId);
          }
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) {
            for (const fileId of selectedFiles) {
              await deleteFile(fileId);
            }
            clearSelection();
          }
          break;
        case 'share':
          // Handle bulk sharing
          break;
        case 'move':
          // Handle bulk move
          break;
        default:
          console.log('Bulk action not implemented:', action);
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handlePreviewNavigation = (direction: 'next' | 'previous') => {
    const displayFiles = getDisplayFiles();
    const currentIndex = previewIndex;

    if (direction === 'next' && currentIndex < displayFiles.length - 1) {
      const nextIndex = currentIndex + 1;
      setPreviewIndex(nextIndex);
      setPreviewFile(displayFiles[nextIndex]);
    } else if (direction === 'previous' && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setPreviewIndex(prevIndex);
      setPreviewFile(displayFiles[prevIndex]);
    }
  };

  const handleShare = async (shareData: any) => {
    try {
      if (sharingFile) {
        await shareFile(sharingFile.id, shareData.emails || [], shareData.permissions);
        console.log('File shared successfully');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const newFolder = {
        id: `folder_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: newFolderName.trim(),
        parentId: currentFolder,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current_user', // Get from auth context
        permissions: {
          canView: true,
          canEdit: true,
          canDelete: true,
          canShare: true,
        },
        sharedWith: [],
        isShared: false,
      };

      addFolder(newFolder);
      setNewFolderName('');
      setShowNewFolderModal(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/15 via-violet-600/10 to-fuchsia-600/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/10 via-indigo-600/15 to-purple-600/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-violet-600/8 to-purple-600/12 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <div className={`glass-effect border-b border-white/20 ${isMobile ? 'p-4' : 'p-6'} relative z-10`}>
        <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'} mb-6`}>
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white mb-2`}>
              File & Document Manager
            </h1>
            <p className={`${isMobile ? 'text-sm' : ''} text-gray-300`}>
              Organize and share your files with teams and clients
            </p>
          </div>
          <div className={`flex items-center ${isMobile ? 'justify-center' : 'gap-3'} ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <button 
              onClick={() => setShowUploadModal(true)}
              className={`flex items-center gap-2 ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 font-medium`}
            >
              <Upload size={isMobile ? 16 : 20} />
              {isMobile ? 'Upload' : 'Upload Files'}
            </button>
            <button
              onClick={() => setShowNewFolderModal(true)}
              className={`flex items-center gap-2 ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} glass-effect border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-medium`}
            >
              <FolderPlus size={isMobile ? 16 : 20} />
              {isMobile ? 'New' : 'New Folder'}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-5 gap-4'} mb-6`}>
          <motion.div
            className={`${isMobile ? 'p-4' : 'p-6'} rounded-xl cursor-pointer transition-all duration-300 ${
              activeCategory === 'all'
                ? 'glass-effect border-2 border-purple-400/50 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                : 'glass-effect border border-white/20 hover:border-purple-400/30 hover:bg-white/5'
            }`}
            onClick={() => setActiveCategory('all')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`${isMobile ? 'text-2xl mb-2' : 'text-3xl mb-3'}`}>📁</div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 mb-1`}>All Files</div>
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>
              {files.length}
            </div>
          </motion.div>

          <motion.div
            className={`${isMobile ? 'p-4' : 'p-6'} rounded-xl cursor-pointer transition-all duration-300 ${
              activeCategory === 'contracts'
                ? 'glass-effect border-2 border-purple-400/50 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                : 'glass-effect border border-white/20 hover:border-purple-400/30 hover:bg-white/5'
            }`}
            onClick={() => setActiveCategory('contracts')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`${isMobile ? 'text-2xl mb-2' : 'text-3xl mb-3'}`}>📄</div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 mb-1`}>Contracts</div>
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>
              {categoryStats.contracts}
            </div>
          </motion.div>

          <motion.div
            className={`${isMobile ? 'p-4' : 'p-6'} rounded-xl cursor-pointer transition-all duration-300 ${
              activeCategory === 'creative-assets'
                ? 'glass-effect border-2 border-purple-400/50 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                : 'glass-effect border border-white/20 hover:border-purple-400/30 hover:bg-white/5'
            }`}
            onClick={() => setActiveCategory('creative-assets')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`${isMobile ? 'text-2xl mb-2' : 'text-3xl mb-3'}`}>🎨</div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 mb-1`}>Creative Assets</div>
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>
              {categoryStats['creative-assets']}
            </div>
          </motion.div>

          <motion.div
            className={`${isMobile ? 'p-4' : 'p-6'} rounded-xl cursor-pointer transition-all duration-300 ${
              activeCategory === 'invoices'
                ? 'glass-effect border-2 border-purple-400/50 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                : 'glass-effect border border-white/20 hover:border-purple-400/30 hover:bg-white/5'
            }`}
            onClick={() => setActiveCategory('invoices')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`${isMobile ? 'text-2xl mb-2' : 'text-3xl mb-3'}`}>💰</div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 mb-1`}>Invoices</div>
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>
              {categoryStats.invoices}
            </div>
          </motion.div>

          <motion.div
            className={`${isMobile ? 'p-4' : 'p-6'} rounded-xl cursor-pointer transition-all duration-300 ${
              activeCategory === 'media'
                ? 'glass-effect border-2 border-purple-400/50 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                : 'glass-effect border border-white/20 hover:border-purple-400/30 hover:bg-white/5'
            }`}
            onClick={() => setActiveCategory('media')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`${isMobile ? 'text-2xl mb-2' : 'text-3xl mb-3'}`}>🎬</div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 mb-1`}>Media</div>
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>
              {categoryStats.media}
            </div>
          </motion.div>
        </div>

        {/* Storage Usage */}
        <div className={`glass-effect border border-white/20 rounded-xl ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-200">
              Storage Usage
            </span>
            <span className="text-sm text-gray-300">
              {formatFileSize(quota.used)} of {formatFileSize(quota.limit)}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/25"
              style={{ width: `${Math.min(quota.percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`glass-effect border-b border-white/20 ${isMobile ? 'p-4' : 'p-6'} relative z-10`}>
        <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
          <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
              />
            </div>

            {/* Advanced Search */}
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="flex items-center gap-2 px-4 py-3 glass-effect border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
            >
              <Filter size={16} />
              Advanced Search
            </button>

            {/* Refresh */}
            <button
              onClick={refreshFiles}
              className="p-3 glass-effect border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>

            {/* Category Quick Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCategory('recent')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === 'recent'
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                    : 'glass-effect border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setActiveCategory('favorites')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === 'favorites'
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                    : 'glass-effect border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                Favorites
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex glass-effect border border-white/20 rounded-xl overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`p-3 transition-all duration-200 ${
                  view === 'grid'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-3 transition-all duration-200 ${
                  view === 'list'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setView('gallery')}
                className={`p-3 transition-all duration-200 ${
                  view === 'gallery'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Image size={16} />
              </button>
            </div>

            {/* Bulk Selection Toggle */}
            <button
              onClick={() => setBulkSelectMode(!bulkSelectMode)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                bulkSelectMode
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                  : 'glass-effect border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {bulkSelectMode ? <CheckSquare size={16} /> : <Square size={16} />}
              Bulk Select
            </button>

            {/* Bulk Actions */}
            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-gray-300 font-medium">
                  {selectedFiles.length} selected
                </span>
                <button
                  onClick={() => handleBulkAction('download')}
                  className="p-2 text-gray-300 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                  title="Download Selected"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => handleBulkAction('share')}
                  className="p-2 text-gray-300 hover:text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                  title="Share Selected"
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={() => handleBulkAction('move')}
                  className="p-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                  title="Move Selected"
                >
                  <Move size={16} />
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete Selected"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-300 hover:text-white transition-colors px-2"
                >
                  Clear
                </button>
                <button
                  onClick={selectAllFiles}
                  className="text-sm text-gray-300 hover:text-white transition-colors px-2"
                >
                  Select All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === 'grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
              >
                {getDisplayFiles().map((file) => (
                  <motion.div
                    key={file.id}
                    className={`group relative glass-effect rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                      selectedFiles.includes(file.id)
                        ? 'border-purple-400/50 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                        : 'border-white/20 hover:border-purple-400/30 hover:bg-white/5'
                    }`}
                    onClick={(e) => handleFileClick(file.id, e)}
                    onContextMenu={(e) => handleFileRightClick(file.id, e)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    layout
                  >
                    {/* File Preview */}
                    <div className="aspect-square flex items-center justify-center p-4">
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
                    </div>

                    {/* File Info */}
                    <div className="p-4 border-t border-white/10">
                      <div className="text-sm font-medium text-white truncate mb-2">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-300 flex items-center justify-between">
                        <span>{formatFileSize(file.size)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            favoriteFiles.includes(file.id)
                              ? removeFromFavorites(file.id)
                              : addToFavorites(file.id);
                          }}
                          className={`transition-colors ${
                            favoriteFiles.includes(file.id)
                              ? 'text-yellow-400'
                              : 'text-gray-400 hover:text-yellow-400'
                          }`}
                        >
                          <Star size={12} fill={favoriteFiles.includes(file.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {selectedFiles.includes(file.id) && (
                      <div className="absolute top-2 left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckSquare size={14} className="text-white" />
                      </div>
                    )}

                    {/* Bulk Select Mode Indicator */}
                    {bulkSelectMode && !selectedFiles.includes(file.id) && (
                      <div className="absolute top-2 left-2 w-6 h-6 bg-white/20 border-2 border-white/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Square size={14} className="text-white" />
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSharingFile(file);
                            setShowSharingModal(true);
                          }}
                          className="p-1.5 glass-effect border border-white/20 rounded-lg text-white hover:bg-white/10"
                          title="Share"
                        >
                          <Share2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileRightClick(file.id, e);
                          }}
                          className="p-1.5 glass-effect border border-white/20 rounded-lg text-white hover:bg-white/10"
                          title="More actions"
                        >
                          <MoreVertical size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Click to Open Indicator */}
                    {!bulkSelectMode && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-purple-600/20 to-transparent flex items-center justify-center">
                        <div className="bg-purple-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Eye size={12} />
                          Click to preview
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {view === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-effect border border-white/20 rounded-xl overflow-hidden"
              >
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-sm font-medium text-gray-200">
                  <div className="col-span-1">
                    {bulkSelectMode && (
                      <button
                        onClick={selectedFiles.length === getDisplayFiles().length ? clearSelection : selectAllFiles}
                        className="flex items-center justify-center w-6 h-6"
                      >
                        {selectedFiles.length === getDisplayFiles().length ?
                          <CheckSquare size={16} className="text-purple-400" /> :
                          <Square size={16} className="text-gray-400" />
                        }
                      </button>
                    )}
                  </div>
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Modified</div>
                  <div className="col-span-1">Category</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {getDisplayFiles().map((file, index) => (
                  <motion.div
                    key={file.id}
                    className={`grid grid-cols-12 gap-4 p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 cursor-pointer transition-all duration-200 ${
                      selectedFiles.includes(file.id) ? 'bg-purple-500/20' : ''
                    }`}
                    onClick={(e) => handleFileClick(file.id, e)}
                    onContextMenu={(e) => handleFileRightClick(file.id, e)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      {bulkSelectMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFileSelection(file.id);
                          }}
                          className="w-6 h-6 flex items-center justify-center"
                        >
                          {selectedFiles.includes(file.id) ?
                            <CheckSquare size={16} className="text-purple-400" /> :
                            <Square size={16} className="text-gray-400 hover:text-purple-400" />
                          }
                        </button>
                      )}
                    </div>
                    <div className="col-span-5 flex items-center gap-3">
                      <span className="text-lg">{getFileIcon(file.mimeType)}</span>
                      <div>
                        <div className="font-medium text-white">{file.name}</div>
                        {file.description && (
                          <div className="text-sm text-gray-300 truncate">
                            {file.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center text-gray-300">
                      {formatFileSize(file.size)}
                    </div>
                    <div className="col-span-2 flex items-center text-gray-300">
                      {formatDate(file.updatedAt)}
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm bg-white/10 border border-white/20 px-2 py-1 rounded-lg">
                        {getCategoryIcon(file.category)}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {getDisplayFiles().length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-300">
            <div className="text-8xl mb-6 opacity-60">📁</div>
            <h3 className="text-xl font-medium mb-3 text-white">No files found</h3>
            <p className="text-center text-gray-400">
              {activeCategory === 'all' 
                ? 'Upload your first files to get started'
                : `No files in ${activeCategory} category`
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Upload Modal */}
      <FileUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewFile(null);
        }}
        onNext={() => handlePreviewNavigation('next')}
        onPrevious={() => handlePreviewNavigation('previous')}
        hasNext={previewIndex < getDisplayFiles().length - 1}
        hasPrevious={previewIndex > 0}
      />

      {/* Context Menu */}
      <FileContextMenu
        file={contextMenuFile!}
        position={contextMenuPosition}
        isVisible={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        onAction={handleContextAction}
      />

      {/* Advanced Search Panel */}
      <AdvancedSearchPanel
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
      />

      {/* File Sharing Modal */}
      <FileSharingModal
        file={sharingFile}
        isOpen={showSharingModal}
        onClose={() => {
          setShowSharingModal(false);
          setSharingFile(null);
        }}
        onShare={handleShare}
      />

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewFolderModal(false)}
          >
            <motion.div
              className="glass-effect border border-white/20 rounded-xl p-6 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Create New Folder</h3>

              <div className="mb-6">
                <label htmlFor="folderName" className="block text-sm font-medium text-gray-300 mb-2">
                  Folder Name
                </label>
                <input
                  id="folderName"
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                  placeholder="Enter folder name..."
                  className="w-full px-4 py-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowNewFolderModal(false);
                    setNewFolderName('');
                  }}
                  className="px-4 py-2 glass-effect border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Folder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileManager;