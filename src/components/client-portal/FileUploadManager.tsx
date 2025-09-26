import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  File,
  Image,
  X,
  Check,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  FileText,
  Video,
  Music,
  Archive,
  Folder,
  Search,
  Filter,
  Grid,
  List,
  Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FileUploadManagerProps {
  portalId: string;
  onClose: () => void;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  category?: 'logo' | 'background' | 'document' | 'image' | 'video' | 'other';
}

const ALLOWED_TYPES = {
  'image/*': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  'document': ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  'video/*': ['mp4', 'webm', 'ogg', 'avi'],
  'audio/*': ['mp3', 'wav', 'ogg', 'aac'],
  'archive': ['zip', 'rar', '7z', 'tar', 'gz']
};

const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  portalId,
  onClose,
  allowedTypes = ['image/*', 'document', 'video/*'],
  maxFileSize = 10, // 10MB default
  maxFiles = 20
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadFiles();
  }, [portalId]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);

      // In production, this would load from Supabase Storage
      // For now, we'll simulate with localStorage or mock data
      const { data: storageFiles, error } = await supabase.storage
        .from('portal-assets')
        .list(`${portalId}/`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const filesWithUrls = await Promise.all(
        (storageFiles || []).map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from('portal-assets')
            .createSignedUrl(`${portalId}/${file.name}`, 60 * 60); // 1 hour expiry

          return {
            id: file.id || file.name,
            name: file.name,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || '',
            url: urlData?.signedUrl || '',
            uploadedAt: file.created_at || new Date().toISOString(),
            uploadedBy: 'current_user',
            category: detectFileCategory(file.name, file.metadata?.mimetype)
          };
        })
      );

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading files:', error);
      // Fallback to mock data for development
      setFiles([
        {
          id: '1',
          name: 'company-logo.png',
          size: 2048000,
          type: 'image/png',
          url: '/api/placeholder/400/200',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'admin',
          category: 'logo'
        },
        {
          id: '2',
          name: 'monthly-report.pdf',
          size: 5120000,
          type: 'application/pdf',
          url: '/api/placeholder/400/300',
          uploadedAt: new Date(Date.now() - 86400000).toISOString(),
          uploadedBy: 'admin',
          category: 'document'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const detectFileCategory = (fileName: string, mimeType?: string): UploadedFile['category'] => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const name = fileName.toLowerCase();

    if (name.includes('logo') || name.includes('brand')) return 'logo';
    if (name.includes('background') || name.includes('bg')) return 'background';
    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    if (mimeType?.startsWith('video/') || ['mp4', 'webm', 'ogg', 'avi'].includes(extension || '')) return 'video';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) return 'document';
    return 'other';
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
        return false;
      }

      // Check file type
      const extension = file.name.split('.').pop()?.toLowerCase();
      const isAllowed = allowedTypes.some(type => {
        if (type === 'document') {
          return ALLOWED_TYPES.document.includes(extension || '');
        } else if (type === 'archive') {
          return ALLOWED_TYPES.archive.includes(extension || '');
        } else if (type.endsWith('/*')) {
          const mimeCategory = type.split('/')[0];
          return file.type.startsWith(mimeCategory);
        }
        return false;
      });

      if (!isAllowed) {
        alert(`File type ${extension} is not allowed.`);
        return false;
      }

      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      alert(`Cannot upload more than ${maxFiles} files.`);
      return;
    }

    // Upload files
    for (const file of validFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const fileId = `${Date.now()}-${file.name}`;
    setUploading(prev => [...prev, fileId]);

    try {
      const filePath = `${portalId}/${fileId}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('portal-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('portal-assets')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData?.signedUrl || '',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'current_user',
        category: detectFileCategory(file.name, file.type)
      };

      setFiles(prev => [uploadedFile, ...prev]);

      // Log activity
      console.log(`File uploaded: ${file.name}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload ${file.name}`);
    } finally {
      setUploading(prev => prev.filter(id => id !== fileId));
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) return;

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('portal-assets')
        .remove([`${portalId}/${fileId}`]);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const getFileIcon = (type: string, category?: string) => {
    if (category === 'logo' || category === 'background' || type.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (type.startsWith('video/')) {
      return <Video className="w-5 h-5" />;
    } else if (type.startsWith('audio/')) {
      return <Music className="w-5 h-5" />;
    } else if (type === 'application/pdf' || category === 'document') {
      return <FileText className="w-5 h-5" />;
    } else if (type.includes('zip') || type.includes('archive')) {
      return <Archive className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: 'all', label: 'All Files', count: files.length },
    { key: 'logo', label: 'Logos', count: files.filter(f => f.category === 'logo').length },
    { key: 'image', label: 'Images', count: files.filter(f => f.category === 'image').length },
    { key: 'document', label: 'Documents', count: files.filter(f => f.category === 'document').length },
    { key: 'video', label: 'Videos', count: files.filter(f => f.category === 'video').length },
    { key: 'other', label: 'Other', count: files.filter(f => f.category === 'other').length }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden"
      >
        {/* Header */}
        <div className="w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Folder className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">File Manager</h2>
                <p className="text-sm text-gray-500">Manage portal assets and uploads</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.key} value={category.key}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Files</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {/* Upload Area */}
            <div
              className={`m-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports: {allowedTypes.join(', ')} • Max {maxFileSize}MB per file • Max {maxFiles} files
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose Files
              </button>
            </div>

            {/* Files Grid/List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="p-6">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {filteredFiles.map((file) => (
                      <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-gray-600">
                            {getFileIcon(file.type, file.category)}
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => window.open(file.url, '_blank')}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteFile(file.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate mb-1">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className="text-gray-600">
                            {getFileIcon(file.type, file.category)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredFiles.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Folder className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No files found</p>
                    <p className="text-gray-500">
                      {searchQuery || selectedCategory !== 'all'
                        ? 'Try adjusting your search or filter criteria'
                        : 'Upload your first files to get started'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept={allowedTypes.join(',')}
        />
      </motion.div>
    </div>
  );
};

export default FileUploadManager;