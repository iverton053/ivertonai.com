import { supabase } from '../lib/supabase';

interface UsageMetrics {
  companyId: string;
  storageUsed: number; // in bytes
  filesCount: number;
  bandwidth: number; // monthly bandwidth in bytes
  apiCalls: number;
  lastCalculated: Date;
}

interface CostCalculation {
  storageUsed: number;
  storageCost: number;
  bandwidthCost: number;
  totalCost: number;
  quotaExceeded: boolean;
  overage: number;
}

export class UsageTrackingService {
  private readonly STORAGE_COST_PER_GB = 0.021; // Supabase pricing
  private readonly BANDWIDTH_COST_PER_GB = 0.09;
  private readonly BASE_QUOTA_GB = 10;

  async trackFileUpload(companyId: string, fileSize: number): Promise<void> {
    try {
      // Update company usage
      const { error } = await supabase.rpc('increment_usage', {
        company_id: companyId,
        storage_bytes: fileSize,
        files_count: 1
      });

      if (error) throw error;

      // Check if quota exceeded
      const usage = await this.getCompanyUsage(companyId);
      if (usage.quotaExceeded) {
        await this.sendQuotaAlert(companyId, usage);
      }
    } catch (error) {
      console.error('Usage tracking error:', error);
    }
  }

  async trackFileDownload(companyId: string, fileSize: number): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_bandwidth', {
        company_id: companyId,
        bandwidth_bytes: fileSize
      });

      if (error) throw error;
    } catch (error) {
      console.error('Bandwidth tracking error:', error);
    }
  }

  async getCompanyUsage(companyId: string): Promise<CostCalculation> {
    try {
      const { data, error } = await supabase
        .from('company_usage')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error) throw error;

      return this.calculateCosts(data);
    } catch (error) {
      console.error('Get usage error:', error);
      return this.getDefaultUsage();
    }
  }

  async getAllCompaniesUsage(): Promise<Map<string, CostCalculation>> {
    try {
      const { data, error } = await supabase
        .from('company_usage')
        .select('*');

      if (error) throw error;

      const usageMap = new Map<string, CostCalculation>();
      data.forEach(usage => {
        usageMap.set(usage.company_id, this.calculateCosts(usage));
      });

      return usageMap;
    } catch (error) {
      console.error('Get all usage error:', error);
      return new Map();
    }
  }

  async generateMonthlyReport(month: string, year: string) {
    try {
      const { data, error } = await supabase
        .from('monthly_usage_reports')
        .select('*')
        .eq('month', month)
        .eq('year', year);

      if (error) throw error;

      const totalCosts = data.reduce((sum, company) => sum + company.total_cost, 0);
      const totalStorage = data.reduce((sum, company) => sum + company.storage_used, 0);
      const totalBandwidth = data.reduce((sum, company) => sum + company.bandwidth_used, 0);

      return {
        companies: data,
        totals: {
          cost: totalCosts,
          storage: totalStorage,
          bandwidth: totalBandwidth
        },
        averages: {
          costPerCompany: totalCosts / data.length,
          storagePerCompany: totalStorage / data.length
        }
      };
    } catch (error) {
      console.error('Monthly report error:', error);
      return null;
    }
  }

  private calculateCosts(usage: any): CostCalculation {
    const storageGB = usage.storage_used / (1024 * 1024 * 1024);
    const bandwidthGB = usage.bandwidth_used / (1024 * 1024 * 1024);
    
    const storageCost = storageGB * this.STORAGE_COST_PER_GB;
    const bandwidthCost = bandwidthGB * this.BANDWIDTH_COST_PER_GB;
    const totalCost = storageCost + bandwidthCost;
    
    const quotaExceeded = storageGB > this.BASE_QUOTA_GB;
    const overage = quotaExceeded ? storageGB - this.BASE_QUOTA_GB : 0;

    return {
      storageUsed: storageGB,
      storageCost,
      bandwidthCost,
      totalCost,
      quotaExceeded,
      overage
    };
  }

  private getDefaultUsage(): CostCalculation {
    return {
      storageUsed: 0,
      storageCost: 0,
      bandwidthCost: 0,
      totalCost: 0,
      quotaExceeded: false,
      overage: 0
    };
  }

  private async sendQuotaAlert(companyId: string, usage: CostCalculation): Promise<void> {
    // TODO: Implement email/notification system
    console.log(`Quota exceeded for company ${companyId}:`, usage);
  }

  // Cost optimization methods
  async identifyOptimizationOpportunities(companyId: string) {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('id, name, size, last_accessed, uploaded_at, type')
        .eq('company_id', companyId);

      if (error) throw error;

      const now = new Date();
      const recommendations = [];

      // Find old, large files that haven't been accessed
      const oldFiles = data.filter(file => {
        const daysSinceAccess = file.last_accessed 
          ? (now.getTime() - new Date(file.last_accessed).getTime()) / (1000 * 60 * 60 * 24)
          : 999;
        return daysSinceAccess > 90 && file.size > 50 * 1024 * 1024; // 50MB+
      });

      if (oldFiles.length > 0) {
        const potentialSavings = oldFiles.reduce((sum, file) => sum + file.size, 0);
        recommendations.push({
          type: 'archive_old_files',
          description: `Archive ${oldFiles.length} old files (>90 days, >50MB)`,
          potentialSavings: potentialSavings / (1024 * 1024 * 1024), // Convert to GB
          files: oldFiles.map(f => ({ id: f.id, name: f.name, size: f.size }))
        });
      }

      // Find duplicate files
      const duplicates = this.findDuplicateFiles(data);
      if (duplicates.length > 0) {
        recommendations.push({
          type: 'remove_duplicates',
          description: `Remove ${duplicates.length} duplicate files`,
          potentialSavings: duplicates.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024 * 1024),
          files: duplicates
        });
      }

      // Find files that could be compressed
      const compressibleFiles = data.filter(file => 
        ['image', 'document', 'video'].includes(file.type) && 
        file.size > 10 * 1024 * 1024 // 10MB+
      );

      if (compressibleFiles.length > 0) {
        recommendations.push({
          type: 'compress_files',
          description: `Compress ${compressibleFiles.length} large media files`,
          potentialSavings: compressibleFiles.reduce((sum, file) => sum + file.size * 0.3, 0) / (1024 * 1024 * 1024), // Assume 30% compression
          files: compressibleFiles.slice(0, 10) // Show top 10
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Optimization analysis error:', error);
      return [];
    }
  }

  private findDuplicateFiles(files: any[]): any[] {
    const sizeGroups = new Map();
    
    // Group files by size
    files.forEach(file => {
      const size = file.size;
      if (!sizeGroups.has(size)) {
        sizeGroups.set(size, []);
      }
      sizeGroups.get(size).push(file);
    });

    // Find groups with multiple files (potential duplicates)
    const duplicates = [];
    sizeGroups.forEach(group => {
      if (group.length > 1) {
        // Add all but the first file as duplicates
        duplicates.push(...group.slice(1));
      }
    });

    return duplicates;
  }
}

export const usageTrackingService = new UsageTrackingService();