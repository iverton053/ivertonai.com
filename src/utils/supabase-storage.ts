import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  SupabaseConfig,
  FileUploadOptions,
  FileDownloadOptions,
  SupabaseStorageResponse,
  AssetStoragePaths,
  UploadProgressCallback,
  AssetMetadata
} from '../types/supabase';

class SupabaseStorageService {
  private client: SupabaseClient | null = null;
  private config: SupabaseConfig | null = null;
  private bucketName: string = 'brand-assets';

  // Storage paths for different asset types
  private readonly storagePaths: AssetStoragePaths = {
    logos: 'logos',
    icons: 'icons',
    images: 'images',
    documents: 'documents',
    templates: 'templates',
    thumbnails: 'thumbnails',
    versions: 'versions'
  };

  /**
   * Initialize Supabase client with configuration
   */
  initialize(config: SupabaseConfig): void {
    this.config = config;
    this.bucketName = config.bucketName;
    this.client = createClient(config.url, config.anonKey);
  }

  /**
   * Check if Supabase is initialized
   */
  private ensureInitialized(): void {
    if (!this.client || !this.config) {
      throw new Error('Supabase not initialized. Call initialize() first.');
    }
  }

  /**
   * Generate storage path for an asset
   */
  private generateAssetPath(
    clientId: string,
    assetType: keyof AssetStoragePaths,
    fileName: string,
    version?: number
  ): string {
    const basePath = version ? this.storagePaths.versions : this.storagePaths[assetType];
    const versionSuffix = version ? `/v${version}` : '';
    return `${clientId}/${basePath}${versionSuffix}/${fileName}`;
  }

  /**
   * Generate thumbnail path
   */
  private generateThumbnailPath(clientId: string, originalFileName: string): string {
    const name = originalFileName.split('.')[0];
    return `${clientId}/${this.storagePaths.thumbnails}/${name}_thumb.webp`;
  }

  /**
   * Upload a file to Supabase storage
   */
  async uploadFile(
    options: FileUploadOptions,
    onProgress?: UploadProgressCallback
  ): Promise<SupabaseStorageResponse<{ path: string; fullPath: string }>> {
    this.ensureInitialized();

    try {
      // TODO: Implement progress tracking when Supabase supports it
      const { data, error } = await this.client!.storage
        .from(this.bucketName)
        .upload(options.path, options.file, {
          contentType: options.contentType,
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false
        });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return {
        data: {
          path: data.path,
          fullPath: data.fullPath
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Upload failed')
      };
    }
  }

  /**
   * Download a file from Supabase storage
   */
  async downloadFile(options: FileDownloadOptions): Promise<SupabaseStorageResponse<Blob>> {
    this.ensureInitialized();

    try {
      const { data, error } = await this.client!.storage
        .from(this.bucketName)
        .download(options.path);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Download failed')
      };
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(path: string): string {
    this.ensureInitialized();

    const { data } = this.client!.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<SupabaseStorageResponse<string>> {
    this.ensureInitialized();

    try {
      const { data, error } = await this.client!.storage
        .from(this.bucketName)
        .createSignedUrl(path, expiresIn);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data.signedUrl, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to create signed URL')
      };
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(path: string): Promise<SupabaseStorageResponse<null>> {
    this.ensureInitialized();

    try {
      const { error } = await this.client!.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Delete failed')
      };
    }
  }

  /**
   * Upload brand asset with metadata
   */
  async uploadBrandAsset(
    file: File,
    metadata: AssetMetadata,
    onProgress?: UploadProgressCallback
  ): Promise<SupabaseStorageResponse<{ url: string; thumbnailUrl?: string; path: string }>> {
    this.ensureInitialized();

    try {
      // Generate file path
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const assetPath = this.generateAssetPath(
        metadata.clientId,
        metadata.assetType as keyof AssetStoragePaths,
        fileName,
        metadata.version > 1 ? metadata.version : undefined
      );

      // Upload main file
      const uploadResult = await this.uploadFile({
        path: assetPath,
        file,
        contentType: metadata.mimeType
      }, onProgress);

      if (uploadResult.error) {
        return { data: null, error: uploadResult.error };
      }

      // Get public URL
      const publicUrl = this.getPublicUrl(assetPath);

      // Generate thumbnail for images (placeholder implementation)
      let thumbnailUrl: string | undefined;
      if (metadata.mimeType.startsWith('image/')) {
        // TODO: Implement thumbnail generation
        const thumbPath = this.generateThumbnailPath(metadata.clientId, fileName);
        thumbnailUrl = this.getPublicUrl(thumbPath);
      }

      return {
        data: {
          url: publicUrl,
          thumbnailUrl,
          path: assetPath
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Asset upload failed')
      };
    }
  }

  /**
   * Copy file to create a version
   */
  async createAssetVersion(
    originalPath: string,
    metadata: AssetMetadata
  ): Promise<SupabaseStorageResponse<{ url: string; path: string }>> {
    this.ensureInitialized();

    try {
      // Download original file
      const downloadResult = await this.downloadFile({ path: originalPath });
      if (downloadResult.error || !downloadResult.data) {
        return { data: null, error: downloadResult.error || new Error('Failed to download original') };
      }

      // Generate new version path
      const fileName = originalPath.split('/').pop() || 'asset';
      const versionPath = this.generateAssetPath(
        metadata.clientId,
        metadata.assetType as keyof AssetStoragePaths,
        fileName,
        metadata.version
      );

      // Upload as new version
      const uploadResult = await this.uploadFile({
        path: versionPath,
        file: downloadResult.data,
        contentType: metadata.mimeType
      });

      if (uploadResult.error) {
        return { data: null, error: uploadResult.error };
      }

      const publicUrl = this.getPublicUrl(versionPath);

      return {
        data: {
          url: publicUrl,
          path: versionPath
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Version creation failed')
      };
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(path: string = ''): Promise<SupabaseStorageResponse<any[]>> {
    this.ensureInitialized();

    try {
      const { data, error } = await this.client!.storage
        .from(this.bucketName)
        .list(path);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to list files')
      };
    }
  }

  /**
   * Create storage bucket if it doesn't exist
   */
  async createBucket(isPublic: boolean = true): Promise<SupabaseStorageResponse<null>> {
    this.ensureInitialized();

    try {
      const { error } = await this.client!.storage
        .createBucket(this.bucketName, {
          public: isPublic,
          fileSizeLimit: 100 * 1024 * 1024, // 100MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'application/postscript', // .eps
            'application/illustrator', // .ai
            'image/vnd.adobe.photoshop', // .psd
            'video/mp4',
            'video/quicktime',
            'application/zip'
          ]
        });

      if (error && error.message !== 'The resource already exists') {
        return { data: null, error: new Error(error.message) };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Bucket creation failed')
      };
    }
  }
}

// Export singleton instance
export const supabaseStorage = new SupabaseStorageService();