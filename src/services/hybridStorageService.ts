import { supabase } from '../lib/supabase';
import AWS from 'aws-sdk';

interface StorageProvider {
  uploadFile(file: File, path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getFileUrl(path: string): string;
  calculateCost(sizeGB: number): number;
}

class SupabaseStorageProvider implements StorageProvider {
  private readonly BUCKET_NAME = 'file-manager';
  private readonly COST_PER_GB = 0.021;

  async uploadFile(file: File, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(path, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path]);

    if (error) throw error;
  }

  getFileUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  calculateCost(sizeGB: number): number {
    return sizeGB * this.COST_PER_GB;
  }
}

class AWSStorageProvider implements StorageProvider {
  private s3: AWS.S3;
  private readonly BUCKET_NAME = process.env.AWS_S3_BUCKET || 'file-manager-production';
  private readonly COST_PER_GB = 0.023;
  private readonly CDN_URL = process.env.CLOUDFRONT_URL;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async uploadFile(file: File, path: string): Promise<string> {
    const params = {
      Bucket: this.BUCKET_NAME,
      Key: path,
      Body: file,
      ContentType: file.type,
      CacheControl: 'max-age=31536000', // 1 year cache
    };

    const result = await this.s3.upload(params).promise();
    
    // Return CDN URL if available, otherwise S3 URL
    return this.CDN_URL 
      ? `${this.CDN_URL}/${path}`
      : result.Location;
  }

  async deleteFile(path: string): Promise<void> {
    const params = {
      Bucket: this.BUCKET_NAME,
      Key: path
    };

    await this.s3.deleteObject(params).promise();
  }

  getFileUrl(path: string): string {
    return this.CDN_URL 
      ? `${this.CDN_URL}/${path}`
      : `https://${this.BUCKET_NAME}.s3.amazonaws.com/${path}`;
  }

  calculateCost(sizeGB: number): number {
    return sizeGB * this.COST_PER_GB;
  }
}

export class HybridStorageService {
  private supabaseProvider: SupabaseStorageProvider;
  private awsProvider: AWSStorageProvider;
  private readonly MIGRATION_THRESHOLD_GB = 500; // Switch to AWS after 500GB total

  constructor() {
    this.supabaseProvider = new SupabaseStorageProvider();
    this.awsProvider = new AWSStorageProvider();
  }

  async uploadFile(file: File, metadata: any): Promise<string> {
    const totalUsage = await this.getTotalStorageUsage();
    const provider = this.selectProvider(totalUsage, file.size);
    
    const path = this.generateFilePath(file, metadata);
    const url = await provider.uploadFile(file, path);

    // Always store metadata in Supabase regardless of storage provider
    await this.storeMetadata({
      ...metadata,
      url,
      storageProvider: provider === this.awsProvider ? 'aws' : 'supabase',
      path
    });

    return url;
  }

  async deleteFile(fileId: string): Promise<void> {
    // Get file metadata to determine provider
    const { data: fileData } = await supabase
      .from('files')
      .select('storage_provider, path')
      .eq('id', fileId)
      .single();

    if (!fileData) throw new Error('File not found');

    const provider = fileData.storage_provider === 'aws' 
      ? this.awsProvider 
      : this.supabaseProvider;

    await provider.deleteFile(fileData.path);

    // Delete metadata
    await supabase.from('files').delete().eq('id', fileId);
  }

  async migrateToAWS(companyId?: string): Promise<void> {
    console.log('Starting migration to AWS...');
    
    let query = supabase
      .from('files')
      .select('*')
      .eq('storage_provider', 'supabase');

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data: files } = await query;

    if (!files) return;

    for (const file of files) {
      try {
        // Download from Supabase
        const response = await fetch(file.url);
        const blob = await response.blob();
        const fileObj = new File([blob], file.name, { type: file.mime_type });

        // Upload to AWS
        const newUrl = await this.awsProvider.uploadFile(fileObj, file.path);

        // Update metadata
        await supabase
          .from('files')
          .update({
            url: newUrl,
            storage_provider: 'aws'
          })
          .eq('id', file.id);

        // Delete from Supabase storage
        await this.supabaseProvider.deleteFile(file.path);

        console.log(`Migrated file: ${file.name}`);
      } catch (error) {
        console.error(`Failed to migrate file ${file.name}:`, error);
      }
    }

    console.log('Migration completed');
  }

  async getCostAnalysis(): Promise<any> {
    const { data: files } = await supabase
      .from('files')
      .select('storage_provider, size');

    if (!files) return null;

    const supabaseFiles = files.filter(f => f.storage_provider === 'supabase');
    const awsFiles = files.filter(f => f.storage_provider === 'aws');

    const supabaseGB = supabaseFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024 * 1024);
    const awsGB = awsFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024 * 1024);

    const supabaseCost = this.supabaseProvider.calculateCost(supabaseGB);
    const awsCost = this.awsProvider.calculateCost(awsGB);

    return {
      supabase: {
        storageGB: supabaseGB,
        monthlyCost: supabaseCost,
        fileCount: supabaseFiles.length
      },
      aws: {
        storageGB: awsGB,
        monthlyCost: awsCost,
        fileCount: awsFiles.length
      },
      total: {
        storageGB: supabaseGB + awsGB,
        monthlyCost: supabaseCost + awsCost,
        fileCount: files.length
      },
      recommendations: this.generateCostRecommendations(supabaseGB, awsGB)
    };
  }

  private selectProvider(totalUsageGB: number, fileSizeBytes: number): StorageProvider {
    // Use AWS for large files or when total usage exceeds threshold
    if (totalUsageGB > this.MIGRATION_THRESHOLD_GB || fileSizeBytes > 100 * 1024 * 1024) {
      return this.awsProvider;
    }
    return this.supabaseProvider;
  }

  private async getTotalStorageUsage(): Promise<number> {
    const { data } = await supabase
      .from('files')
      .select('size');

    if (!data) return 0;

    const totalBytes = data.reduce((sum, file) => sum + file.size, 0);
    return totalBytes / (1024 * 1024 * 1024); // Convert to GB
  }

  private generateFilePath(file: File, metadata: any): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = file.name.split('.').pop();
    return `${metadata.category || 'uncategorized'}/${timestamp}-${random}.${ext}`;
  }

  private async storeMetadata(metadata: any): Promise<void> {
    await supabase.from('files').insert(metadata);
  }

  private generateCostRecommendations(supabaseGB: number, awsGB: number): string[] {
    const recommendations = [];

    if (supabaseGB > 500) {
      const potentialSavings = (supabaseGB * 0.021) - (supabaseGB * 0.023);
      recommendations.push(
        `Migrate ${supabaseGB.toFixed(1)}GB from Supabase to AWS to save $${Math.abs(potentialSavings).toFixed(2)}/month`
      );
    }

    if (awsGB > 1000) {
      recommendations.push(
        `Consider implementing intelligent tiering for ${awsGB.toFixed(1)}GB to save 20-40% on storage costs`
      );
    }

    if (supabaseGB + awsGB > 2000) {
      recommendations.push(
        'Consider implementing file compression and deduplication to reduce storage by 30-50%'
      );
    }

    return recommendations;
  }
}

export const hybridStorageService = new HybridStorageService();