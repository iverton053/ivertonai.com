import { supabase } from '../lib/supabase';
import { FileItem, FileUploadProgress } from '../types/fileManagement';

export class FileApiService {
  private readonly BUCKET_NAME = 'file-manager';

  async uploadFile(
    file: File, 
    metadata: Partial<FileItem>,
    onProgress?: (progress: number) => void
  ): Promise<FileItem> {
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${metadata.category || 'uncategorized'}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            if (onProgress) {
              onProgress((progress.loaded / progress.total) * 100);
            }
          }
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      // Create file metadata
      const fileMetadata: FileItem = {
        id: crypto.randomUUID(),
        name: file.name,
        type: this.getFileType(file),
        category: metadata.category || 'uncategorized',
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
        updatedAt: new Date(),
        uploadedBy: 'current_user', // Get from auth context
        url: urlData.publicUrl,
        tags: metadata.tags || [],
        description: metadata.description || '',
        version: 1,
        metadata: {
          originalName: file.name,
          checksum: await this.calculateChecksum(file),
          ...this.extractFileMetadata(file)
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
      const { data: dbData, error: dbError } = await supabase
        .from('files')
        .insert(fileMetadata)
        .select()
        .single();

      if (dbError) throw dbError;

      return dbData;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFiles(filters?: any): Promise<FileItem[]> {
    try {
      let query = supabase.from('files').select('*');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.userId) {
        query = query.eq('uploadedBy', filters.userId);
      }

      const { data, error } = await query.order('uploadedAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get files error:', error);
      throw new Error(`Failed to fetch files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      // Get file info first
      const { data: fileData, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const filePath = this.extractPathFromUrl(fileData.url);
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete metadata from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Delete file error:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async downloadFile(fileId: string): Promise<void> {
    try {
      // Get file info
      const { data: fileData, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      // Increment download count
      await supabase
        .from('files')
        .update({ downloadCount: (fileData.downloadCount || 0) + 1 })
        .eq('id', fileId);

      // Trigger download
      const link = document.createElement('a');
      link.href = fileData.url;
      link.download = fileData.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download file error:', error);
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async shareFile(fileId: string, userIds: string[], permissions: any): Promise<void> {
    try {
      // Update file sharing status
      const { error } = await supabase
        .from('files')
        .update({ 
          isShared: true,
          sharedWith: userIds.map(userId => ({
            userId,
            userEmail: '', // Get from user lookup
            userName: '', // Get from user lookup
            role: permissions.role || 'viewer',
            sharedAt: new Date(),
            canReshare: permissions.canReshare || false
          }))
        })
        .eq('id', fileId);

      if (error) throw error;

      // TODO: Send notification emails to shared users
    } catch (error) {
      console.error('Share file error:', error);
      throw new Error(`Failed to share file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getFileType(file: File): any {
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
  }

  private async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private extractFileMetadata(file: File): any {
    const metadata: any = {
      originalName: file.name,
    };

    // Extract image dimensions if it's an image
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          metadata.dimensions = {
            width: img.width,
            height: img.height
          };
          resolve(metadata);
        };
        img.src = URL.createObjectURL(file);
      });
    }

    return metadata;
  }

  private extractPathFromUrl(url: string): string {
    // Extract file path from Supabase storage URL
    const urlParts = url.split('/');
    return urlParts.slice(-2).join('/'); // category/filename
  }
}

export const fileApiService = new FileApiService();