import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { sampleFiles, sampleFolders } from '../data/sampleFiles';
import {
  FileItem,
  FileFolder,
  FileUploadProgress,
  FileSearchFilters,
  FileManagerSettings,
  StorageQuota,
  FileManagerState,
  FileCategory,
  FileType
} from '../types/fileManagement';

interface FileManagerActions {
  setFiles: (files: FileItem[]) => void;
  addFile: (file: FileItem) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  deleteFile: (id: string) => void;
  deleteFiles: (ids: string[]) => void;
  
  setFolders: (folders: FileFolder[]) => void;
  addFolder: (folder: FileFolder) => void;
  updateFolder: (id: string, updates: Partial<FileFolder>) => void;
  deleteFolder: (id: string) => void;
  
  setSelectedFiles: (fileIds: string[]) => void;
  toggleFileSelection: (fileId: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  
  setCurrentFolder: (folderId?: string) => void;
  navigateToFolder: (folderId?: string) => void;
  
  setSearchFilters: (filters: Partial<FileSearchFilters>) => void;
  clearFilters: () => void;
  
  setView: (view: 'grid' | 'list' | 'gallery') => void;
  setSortBy: (sortBy: 'name' | 'date' | 'size' | 'type') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  addUpload: (upload: FileUploadProgress) => void;
  updateUpload: (fileId: string, updates: Partial<FileUploadProgress>) => void;
  removeUpload: (fileId: string) => void;
  clearUploads: () => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  
  updateSettings: (settings: Partial<FileManagerSettings>) => void;
  updateQuota: (quota: StorageQuota) => void;
  
  addToFavorites: (fileId: string) => void;
  removeFromFavorites: (fileId: string) => void;
  
  refreshFiles: () => Promise<void>;
  searchFiles: (query: string) => Promise<FileItem[]>;
  uploadFiles: (files: File[], folderId?: string) => Promise<void>;
  downloadFile: (fileId: string) => Promise<void>;
  shareFile: (fileId: string, userIds: string[], permissions: any) => Promise<void>;
  
  getFilesByCategory: (category: FileCategory) => FileItem[];
  getFilesByType: (type: FileType) => FileItem[];
  getRecentFiles: (limit?: number) => FileItem[];
  getSharedFiles: () => FileItem[];
  getFavoriteFiles: () => FileItem[];
  getFileSize: (fileId: string) => number;
  getTotalStorageUsed: () => number;
}

const defaultSettings: FileManagerSettings = {
  defaultView: 'grid',
  itemsPerPage: 20,
  autoGenerateThumbnails: true,
  allowedFileTypes: [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
    'mp4', 'mov', 'avi', 'mkv',
    'mp3', 'wav', 'flac',
    'zip', 'rar', '7z',
    'txt', 'md', 'csv', 'json'
  ],
  maxFileSize: 100 * 1024 * 1024, // 100MB
  compressionEnabled: true,
  versioningEnabled: true,
  retentionPeriod: 365,
  watermarkEnabled: false,
  virusScanEnabled: true,
};

// Calculate total size of sample files
const totalSampleSize = sampleFiles.reduce((total, file) => total + file.size, 0);

const defaultQuota: StorageQuota = {
  used: totalSampleSize,
  limit: 10 * 1024 * 1024 * 1024, // 10GB
  percentage: (totalSampleSize / (10 * 1024 * 1024 * 1024)) * 100,
  breakdown: [
    { category: 'documents', size: sampleFiles.filter(f => f.category === 'documents').reduce((sum, f) => sum + f.size, 0) },
    { category: 'media', size: sampleFiles.filter(f => f.category === 'media').reduce((sum, f) => sum + f.size, 0) },
    { category: 'contracts', size: sampleFiles.filter(f => f.category === 'contracts').reduce((sum, f) => sum + f.size, 0) },
    { category: 'invoices', size: sampleFiles.filter(f => f.category === 'invoices').reduce((sum, f) => sum + f.size, 0) },
    { category: 'creative-assets', size: sampleFiles.filter(f => f.category === 'creative-assets').reduce((sum, f) => sum + f.size, 0) },
  ],
};

// Helper function to determine file type
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

export const useFileManagerStore = create<FileManagerState & FileManagerActions>()(
  persist(
    (set, get) => ({
      files: sampleFiles,
      folders: sampleFolders,
      uploads: [],
      selectedFiles: [],
      currentFolder: undefined,
      searchFilters: {},
      view: 'grid',
      sortBy: 'date',
      sortOrder: 'desc',
      isLoading: false,
      error: undefined,
      settings: defaultSettings,
      quota: defaultQuota,
      recentFiles: sampleFiles.slice(0, 5).map(f => f.id),
      sharedFiles: sampleFiles.filter(f => f.isShared).map(f => f.id),
      favoriteFiles: ['sample-2', 'sample-5', 'sample-10'], // Pre-favorite some files

      setFiles: (files) => set({ files }),
      
      addFile: (file) => set((state) => ({ 
        files: [...state.files, file],
        recentFiles: [file, ...state.recentFiles.slice(0, 9)]
      })),
      
      updateFile: (id, updates) => set((state) => ({
        files: state.files.map(file => 
          file.id === id ? { ...file, ...updates } : file
        )
      })),
      
      deleteFile: (id) => set((state) => ({
        files: state.files.filter(file => file.id !== id),
        selectedFiles: state.selectedFiles.filter(fileId => fileId !== id),
        favoriteFiles: state.favoriteFiles.filter(fileId => fileId !== id)
      })),
      
      deleteFiles: (ids) => set((state) => ({
        files: state.files.filter(file => !ids.includes(file.id)),
        selectedFiles: state.selectedFiles.filter(fileId => !ids.includes(fileId)),
        favoriteFiles: state.favoriteFiles.filter(fileId => !ids.includes(fileId))
      })),

      setFolders: (folders) => set({ folders }),
      
      addFolder: (folder) => set((state) => ({ 
        folders: [...state.folders, folder] 
      })),
      
      updateFolder: (id, updates) => set((state) => ({
        folders: state.folders.map(folder => 
          folder.id === id ? { ...folder, ...updates } : folder
        )
      })),
      
      deleteFolder: (id) => set((state) => ({
        folders: state.folders.filter(folder => folder.id !== id),
        currentFolder: state.currentFolder === id ? undefined : state.currentFolder
      })),

      setSelectedFiles: (fileIds) => set({ selectedFiles: fileIds }),
      
      toggleFileSelection: (fileId) => set((state) => ({
        selectedFiles: state.selectedFiles.includes(fileId)
          ? state.selectedFiles.filter(id => id !== fileId)
          : [...state.selectedFiles, fileId]
      })),
      
      selectAllFiles: () => set((state) => ({
        selectedFiles: state.files.map(file => file.id)
      })),
      
      clearSelection: () => set({ selectedFiles: [] }),

      setCurrentFolder: (folderId) => set({ currentFolder: folderId }),
      
      navigateToFolder: (folderId) => set({ 
        currentFolder: folderId,
        selectedFiles: []
      }),

      setSearchFilters: (filters) => set((state) => ({
        searchFilters: { ...state.searchFilters, ...filters }
      })),
      
      clearFilters: () => set({ searchFilters: {} }),

      setView: (view) => set({ view }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),

      addUpload: (upload) => set((state) => ({
        uploads: [...state.uploads, upload]
      })),
      
      updateUpload: (fileId, updates) => set((state) => ({
        uploads: state.uploads.map(upload =>
          upload.fileId === fileId ? { ...upload, ...updates } : upload
        )
      })),
      
      removeUpload: (fileId) => set((state) => ({
        uploads: state.uploads.filter(upload => upload.fileId !== fileId)
      })),
      
      clearUploads: () => set({ uploads: [] }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
      
      updateQuota: (quota) => set({ quota }),

      addToFavorites: (fileId) => set((state) => ({
        favoriteFiles: [...state.favoriteFiles, fileId]
      })),
      
      removeFromFavorites: (fileId) => set((state) => ({
        favoriteFiles: state.favoriteFiles.filter(id => id !== fileId)
      })),

      refreshFiles: async () => {
        set({ isLoading: true, error: undefined });
        try {
          const { data: files, error } = await supabase
            .from('files')
            .select('*')
            .order('uploaded_at', { ascending: false });

          if (error) throw error;

          const transformedFiles = files?.map(file => ({
            ...file,
            uploadedAt: new Date(file.uploaded_at),
            updatedAt: new Date(file.updated_at),
            lastAccessed: file.last_accessed ? new Date(file.last_accessed) : undefined,
            sharedWith: file.shared_with || []
          })) || [];

          set({ files: transformedFiles });
        } catch (error) {
          console.error('Failed to refresh files:', error);
          set({ error: `Failed to refresh files: ${error instanceof Error ? error.message : 'Unknown error'}` });
        } finally {
          set({ isLoading: false });
        }
      },

      searchFiles: async (query) => {
        const { files } = get();
        // Simple client-side search - can be replaced with API call
        return files.filter(file => 
          file.name.toLowerCase().includes(query.toLowerCase()) ||
          file.description?.toLowerCase().includes(query.toLowerCase()) ||
          file.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      },

      uploadFiles: async (files, folderId) => {
        const { currentFolder } = get();
        
        for (const file of files) {
          const fileId = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          
          try {
            // Add upload progress
            addUpload({
              fileId,
              fileName: file.name,
              progress: 0,
              status: 'uploading'
            });

            // Generate file path
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `files/${fileName}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('file-manager')
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Update progress
            updateUpload(fileId, { progress: 75, status: 'processing' });

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('file-manager')
              .getPublicUrl(filePath);

            // Create file metadata
            const newFile: FileItem = {
              id: crypto.randomUUID(),
              name: file.name,
              type: getFileType(file),
              category: get().searchFilters.category?.[0] || 'uncategorized',
              size: file.size,
              mimeType: file.type,
              uploadedAt: new Date(),
              updatedAt: new Date(),
              uploadedBy: 'current_user', // Get from auth context
              url: urlData.publicUrl,
              tags: [],
              description: '',
              version: 1,
              parentId: folderId || currentFolder,
              metadata: {
                originalName: file.name,
                checksum: 'placeholder_checksum',
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

            // Save metadata to database
            const { error: dbError } = await supabase
              .from('files')
              .insert({
                id: newFile.id,
                name: newFile.name,
                type: newFile.type,
                category: newFile.category,
                size: newFile.size,
                mime_type: newFile.mimeType,
                uploaded_by: newFile.uploadedBy,
                url: newFile.url,
                tags: newFile.tags,
                description: newFile.description,
                version: newFile.version,
                parent_id: newFile.parentId,
                metadata: newFile.metadata,
                permissions: newFile.permissions,
                shared_with: newFile.sharedWith,
                is_shared: newFile.isShared,
                download_count: newFile.downloadCount
              });

            if (dbError) throw dbError;

            // Add to store
            addFile(newFile);
            updateUpload(fileId, { progress: 100, status: 'completed' });

            // Remove upload progress after 2 seconds
            setTimeout(() => removeUpload(fileId), 2000);

          } catch (error) {
            console.error('Upload error:', error);
            updateUpload(fileId, { 
              status: 'error', 
              error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
            });
          }
        }
      },

      downloadFile: async (fileId) => {
        try {
          const { files } = get();
          const file = files.find(f => f.id === fileId);
          
          if (!file) {
            throw new Error('File not found');
          }

          // Increment download count in database
          const { error: updateError } = await supabase
            .from('files')
            .update({ 
              download_count: file.downloadCount + 1,
              last_accessed: new Date().toISOString()
            })
            .eq('id', fileId);

          if (updateError) {
            console.error('Failed to update download count:', updateError);
          }

          // Update local state
          updateFile(fileId, { 
            downloadCount: file.downloadCount + 1,
            lastAccessed: new Date()
          });

          // Trigger download
          const link = document.createElement('a');
          link.href = file.url;
          link.download = file.name;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        } catch (error) {
          console.error('Download error:', error);
          set({ error: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
        }
      },

      shareFile: async (fileId, userIds, permissions) => {
        // TODO: Implement file sharing logic
        console.log('Sharing file:', fileId, 'with users:', userIds);
      },

      getFilesByCategory: (category) => {
        const { files } = get();
        return files.filter(file => file.category === category);
      },

      getFilesByType: (type) => {
        const { files } = get();
        return files.filter(file => file.type === type);
      },

      getRecentFiles: (limit = 10) => {
        const { files } = get();
        return files
          .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
          .slice(0, limit);
      },

      getSharedFiles: () => {
        const { files } = get();
        return files.filter(file => file.isShared);
      },

      getFavoriteFiles: () => {
        const { files, favoriteFiles } = get();
        return files.filter(file => favoriteFiles.includes(file.id));
      },

      getFileSize: (fileId) => {
        const { files } = get();
        const file = files.find(f => f.id === fileId);
        return file?.size || 0;
      },

      getTotalStorageUsed: () => {
        const { files } = get();
        return files.reduce((total, file) => total + file.size, 0);
      },
    }),
    {
      name: 'file-manager-storage',
      partialize: (state) => ({
        settings: state.settings,
        view: state.view,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        favoriteFiles: state.favoriteFiles,
      }),
    }
  )
);