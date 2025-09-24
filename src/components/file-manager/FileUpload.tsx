import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  File, 
  CheckCircle, 
  AlertCircle,
  Folder,
  Tag,
  Image,
  FileText,
  Film,
  Music,
  Archive
} from 'lucide-react';
import { useFileManagerStore } from '../../stores/fileManagerStore';
import { FileCategory, FileType, FileUploadProgress } from '../../types/fileManagement';

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string;
  defaultCategory?: FileCategory;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  isOpen, 
  onClose, 
  folderId,
  defaultCategory = 'uncategorized' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<FileCategory>(defaultCategory);
  const [uploadTags, setUploadTags] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');

  const { 
    uploads, 
    settings,
    addUpload, 
    updateUpload, 
    removeUpload,
    addFile 
  } = useFileManagerStore();

  const getFileType = (file: File): FileType => {
    const mimeType = file.type;
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
    return 'other';
  };

  const getFileIcon = (file: File) => {
    const type = getFileType(file);
    switch (type) {
      case 'image': return <Image className="text-green-500" size={20} />;
      case 'video': return <Film className="text-purple-500" size={20} />;
      case 'audio': return <Music className="text-blue-500" size={20} />;
      case 'document':
      case 'pdf': return <FileText className="text-red-500" size={20} />;
      case 'archive': return <Archive className="text-orange-500" size={20} />;
      default: return <File className="text-slate-500" size={20} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > settings.maxFileSize) {
      return `File size exceeds ${formatFileSize(settings.maxFileSize)} limit`;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && !settings.allowedFileTypes.includes(fileExtension)) {
      return `File type .${fileExtension} is not allowed`;
    }

    return null;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      // Handle errors - could show toast notifications
      console.error('File validation errors:', errors);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, [settings]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateUpload = async (file: File): Promise<void> => {
    const fileId = `upload_${Date.now()}_${Math.random()}`;
    
    const uploadProgress: FileUploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'pending'
    };

    addUpload(uploadProgress);

    try {
      // Simulate upload progress
      updateUpload(fileId, { status: 'uploading' });
      
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateUpload(fileId, { 
          progress, 
          estimatedTime: progress < 100 ? (100 - progress) / 10 : 0 
        });
      }

      updateUpload(fileId, { status: 'processing' });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create file object and add to store
      const newFile = {
        id: fileId,
        name: file.name,
        type: getFileType(file),
        category: uploadCategory,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
        updatedAt: new Date(),
        uploadedBy: 'current_user', // Should come from auth context
        tags: uploadTags ? uploadTags.split(',').map(tag => tag.trim()) : [],
        description: uploadDescription,
        version: 1,
        parentId: folderId,
        metadata: {
          originalName: file.name,
          checksum: 'placeholder_checksum', // Would be generated server-side
        },
        permissions: {
          canView: true,
          canEdit: true,
          canDelete: true,
          canShare: true,
          canDownload: true,
          canComment: true,
        },
        sharedWith: [],
        isShared: false,
        downloadCount: 0,
      };

      addFile(newFile);
      updateUpload(fileId, { status: 'completed' });

      // Remove upload progress after completion
      setTimeout(() => removeUpload(fileId), 2000);

    } catch (error) {
      updateUpload(fileId, { 
        status: 'error', 
        error: 'Upload failed. Please try again.' 
      });
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      // Upload files concurrently
      await Promise.all(selectedFiles.map(file => simulateUpload(file)));
      
      // Reset form
      setSelectedFiles([]);
      setUploadTags('');
      setUploadDescription('');
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  if (!isOpen) return null;

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
            <h2 className="text-2xl font-semibold text-white">
              Upload Files
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative overflow-hidden ${
                isDragOver
                  ? 'border-purple-400 bg-purple-500/10 scale-[1.02]'
                  : 'border-white/30 hover:border-purple-400/50 hover:bg-white/5'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              {isDragOver && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-700/20 flex items-center justify-center">
                  <div className="text-white font-semibold">Drop files here!</div>
                </div>
              )}
              <Upload className="mx-auto mb-4 text-gray-300" size={56} />
              <h3 className="text-xl font-medium text-white mb-2">
                Drop files here or click to browse
              </h3>
              <p className="text-gray-300 mb-4">
                Supported formats: {settings.allowedFileTypes.join(', ')}
              </p>
              <p className="text-sm text-gray-400">
                Maximum file size: {formatFileSize(settings.maxFileSize)}
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept={settings.allowedFileTypes.map(ext => `.${ext}`).join(',')}
              />
            </div>

            {/* File Metadata */}
            {selectedFiles.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium text-white">
                  File Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Category
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as FileCategory)}
                      className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                    >
                      <option value="contracts">📄 Contracts</option>
                      <option value="creative-assets">🎨 Creative Assets</option>
                      <option value="invoices">💰 Invoices</option>
                      <option value="reports">📊 Reports</option>
                      <option value="presentations">📽️ Presentations</option>
                      <option value="templates">📋 Templates</option>
                      <option value="media">🎬 Media</option>
                      <option value="documents">📑 Documents</option>
                      <option value="uncategorized">📁 Uncategorized</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      placeholder="e.g., project, client, draft"
                      className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Brief description of the files..."
                    rows={3}
                    className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  Selected Files ({selectedFiles.length})
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <motion.div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-4 glass-effect border border-white/20 rounded-xl"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <div className="font-medium text-white">
                            {file.name}
                          </div>
                          <div className="text-sm text-gray-300">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploads.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Upload Progress
                </h3>
                <div className="space-y-2">
                  {uploads.map((upload) => (
                    <div
                      key={upload.fileId}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {upload.status === 'completed' ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : upload.status === 'error' ? (
                          <AlertCircle className="text-red-500" size={20} />
                        ) : (
                          <File className="text-blue-500" size={20} />
                        )}
                        
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {upload.fileName}
                          </div>
                          {upload.status === 'error' && upload.error && (
                            <div className="text-sm text-red-500">{upload.error}</div>
                          )}
                          {upload.status !== 'error' && upload.status !== 'completed' && (
                            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${upload.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {upload.status === 'completed' ? (
                          'Completed'
                        ) : upload.status === 'error' ? (
                          'Failed'
                        ) : (
                          `${upload.progress}%`
                        )}
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
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-purple-500/25 font-medium"
            >
              Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'}` : 'Files'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileUpload;