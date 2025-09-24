import mongoose from 'mongoose';
import Campaign, { ICampaign } from '../models/Campaign';
import AdAccount from '../models/AdAccount';
import { logger } from '../utils/logger';
import { AdPlatformService } from './adPlatformService';
import { AnalyticsService } from './analyticsService';

export interface CreateCampaignData {
  name: string;
  platform: string;
  objective: string;
  budget: {
    daily: number;
    currency: string;
  };
  targeting: any;
  schedule: {
    start_date: Date;
    end_date?: Date;
    time_zone: string;
  };
  bidding?: any;
}

export class CampaignService {
  private static instance: CampaignService;
  private adPlatformService: AdPlatformService;
  private analyticsService: AnalyticsService;

  constructor() {
    this.adPlatformService = AdPlatformService.getInstance();
    this.analyticsService = AnalyticsService.getInstance();
  }

  public static getInstance(): CampaignService {
    if (!CampaignService.instance) {
      CampaignService.instance = new CampaignService();
    }
    return CampaignService.instance;
  }

  async createCampaign(userId: string, accountId: string, campaignData: CreateCampaignData): Promise<ICampaign> {
    try {
      // Validate ad account exists and belongs to user
      const adAccount = await AdAccount.findOne({
        _id: accountId,
        userId: new mongoose.Types.ObjectId(userId),
        'connection_status.is_connected': true
      });

      if (!adAccount) {
        throw new Error('Ad account not found or not connected');
      }

      // Create campaign document
      const campaign = new Campaign({
        userId: new mongoose.Types.ObjectId(userId),
        name: campaignData.name,
        platform: campaignData.platform,
        objective: campaignData.objective,
        budget: campaignData.budget,
        targeting: campaignData.targeting,
        schedule: campaignData.schedule,
        bidding: campaignData.bidding || {
          strategy: 'manual_cpc',
          amount: 1.00
        },
        status: 'paused', // Start paused for review
        metrics: {
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          roas: 0,
          conversion_rate: 0,
          last_updated: new Date()
        },
        automation: {
          enabled: false,
          rules: [],
          last_optimization: new Date(),
          optimization_frequency: 24
        }
      });

      await campaign.save();

      // Create campaign on ad platform
      try {
        const platformCampaignId = await this.adPlatformService.createCampaign(
          adAccount,
          this.transformToPlatformFormat(campaign)
        );

        campaign.platform_data = {
          campaign_id: platformCampaignId,
          platform_status: 'paused',
          platform_errors: []
        };
        
        await campaign.save();
        logger.info(`Campaign created successfully on ${campaignData.platform}:`, platformCampaignId);

      } catch (platformError) {
        logger.error('Failed to create campaign on platform:', platformError);
        campaign.platform_data = {
          platform_errors: [platformError instanceof Error ? platformError.message : 'Unknown platform error']
        };
        await campaign.save();
      }

      return campaign;
    } catch (error) {
      logger.error('Error creating campaign:', error);
      throw error;
    }
  }

  async getCampaigns(userId: string, filters?: any): Promise<ICampaign[]> {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
      if (filters) {
        if (filters.platform) query.platform = filters.platform;
        if (filters.status) query.status = filters.status;
        if (filters.objective) query.objective = filters.objective;
      }

      const campaigns = await Campaign.find(query)
        .sort({ updatedAt: -1 })
        .lean();

      return campaigns;
    } catch (error) {
      logger.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  async getCampaignById(userId: string, campaignId: string): Promise<ICampaign | null> {
    try {
      const campaign = await Campaign.findOne({
        _id: campaignId,
        userId: new mongoose.Types.ObjectId(userId)
      });

      return campaign;
    } catch (error) {
      logger.error('Error fetching campaign:', error);
      throw error;
    }
  }

  async updateCampaign(userId: string, campaignId: string, updateData: Partial<ICampaign>): Promise<ICampaign | null> {
    try {
      const campaign = await Campaign.findOne({
        _id: campaignId,
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Update local campaign
      Object.assign(campaign, updateData);
      await campaign.save();

      // Update campaign on platform if connected
      if (campaign.platform_data?.campaign_id) {
        try {
          const adAccount = await AdAccount.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            platform: campaign.platform,
            'connection_status.is_connected': true
          });

          if (adAccount) {
            await this.adPlatformService.updateCampaign(
              adAccount,
              campaign.platform_data.campaign_id,
              this.transformToPlatformFormat(campaign)
            );
          }
        } catch (platformError) {
          logger.error('Failed to update campaign on platform:', platformError);
        }
      }

      return campaign;
    } catch (error) {
      logger.error('Error updating campaign:', error);
      throw error;
    }
  }

  async deleteCampaign(userId: string, campaignId: string): Promise<boolean> {
    try {
      const campaign = await Campaign.findOne({
        _id: campaignId,
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Soft delete - mark as deleted instead of removing
      campaign.status = 'deleted';
      await campaign.save();

      // Pause campaign on platform if active
      if (campaign.platform_data?.campaign_id && campaign.status === 'active') {
        try {
          const adAccount = await AdAccount.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            platform: campaign.platform,
            'connection_status.is_connected': true
          });

          if (adAccount) {
            await this.adPlatformService.pauseCampaign(
              adAccount,
              campaign.platform_data.campaign_id
            );
          }
        } catch (platformError) {
          logger.error('Failed to pause campaign on platform:', platformError);
        }
      }

      return true;
    } catch (error) {
      logger.error('Error deleting campaign:', error);
      throw error;
    }
  }

  async updateCampaignStatus(userId: string, campaignId: string, status: 'active' | 'paused' | 'ended'): Promise<ICampaign | null> {
    try {
      const campaign = await Campaign.findOne({
        _id: campaignId,
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      campaign.status = status;
      await campaign.save();

      // Update status on platform
      if (campaign.platform_data?.campaign_id) {
        try {
          const adAccount = await AdAccount.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            platform: campaign.platform,
            'connection_status.is_connected': true
          });

          if (adAccount) {
            if (status === 'active') {
              await this.adPlatformService.resumeCampaign(adAccount, campaign.platform_data.campaign_id);
            } else {
              await this.adPlatformService.pauseCampaign(adAccount, campaign.platform_data.campaign_id);
            }
          }
        } catch (platformError) {
          logger.error('Failed to update campaign status on platform:', platformError);
        }
      }

      return campaign;
    } catch (error) {
      logger.error('Error updating campaign status:', error);
      throw error;
    }
  }

  async refreshCampaignMetrics(userId: string, campaignId?: string): Promise<void> {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      if (campaignId) {
        query._id = campaignId;
      }

      const campaigns = await Campaign.find(query);

      for (const campaign of campaigns) {
        if (campaign.platform_data?.campaign_id) {
          try {
            const adAccount = await AdAccount.findOne({
              userId: new mongoose.Types.ObjectId(userId),
              platform: campaign.platform,
              'connection_status.is_connected': true
            });

            if (adAccount) {
              const metrics = await this.adPlatformService.getCampaignMetrics(
                adAccount,
                campaign.platform_data.campaign_id
              );

              campaign.metrics = {
                ...campaign.metrics,
                ...metrics,
                last_updated: new Date()
              };

              await campaign.save();
            }
          } catch (platformError) {
            logger.error(`Failed to refresh metrics for campaign ${campaign._id}:`, platformError);
          }
        }
      }
    } catch (error) {
      logger.error('Error refreshing campaign metrics:', error);
      throw error;
    }
  }

  async optimizeCampaign(userId: string, campaignId: string): Promise<{ recommendations: string[]; applied: string[] }> {
    try {
      const campaign = await Campaign.findOne({
        _id: campaignId,
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const recommendations: string[] = [];
      const applied: string[] = [];

      // Analyze performance and generate recommendations
      if (campaign.metrics.ctr < 1.0) {
        recommendations.push('Consider refreshing ad creatives to improve CTR');
      }

      if (campaign.metrics.cpc > 5.0) {
        recommendations.push('CPC is high - optimize targeting or reduce bid');
      }

      if (campaign.metrics.roas > 300) {
        recommendations.push('High ROAS - consider increasing budget');
        
        // Auto-apply budget increase if automation is enabled
        if (campaign.automation.enabled) {
          const newBudget = Math.min(campaign.budget.daily * 1.2, campaign.budget.daily + 100);
          campaign.budget.daily = newBudget;
          await campaign.save();
          applied.push(`Increased daily budget to $${newBudget}`);
        }
      }

      // Update last optimization time
      campaign.automation.last_optimization = new Date();
      await campaign.save();

      return { recommendations, applied };
    } catch (error) {
      logger.error('Error optimizing campaign:', error);
      throw error;
    }
  }

  async getCampaignPerformanceSummary(userId: string): Promise<any> {
    try {
      const campaigns = await Campaign.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), status: { $ne: 'deleted' } } },
        {
          $group: {
            _id: null,
            totalSpend: { $sum: '$metrics.spend' },
            totalImpressions: { $sum: '$metrics.impressions' },
            totalClicks: { $sum: '$metrics.clicks' },
            totalConversions: { $sum: '$metrics.conversions' },
            campaignCount: { $sum: 1 },
            activeCampaigns: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            }
          }
        }
      ]);

      if (campaigns.length === 0) {
        return {
          totalSpend: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          averageCTR: 0,
          averageROAS: 0,
          campaignCount: 0,
          activeCampaigns: 0
        };
      }

      const summary = campaigns[0];
      summary.averageCTR = summary.totalImpressions > 0 
        ? (summary.totalClicks / summary.totalImpressions) * 100 
        : 0;
      summary.averageROAS = summary.totalSpend > 0 
        ? (summary.totalConversions * 50 / summary.totalSpend) * 100 // Assuming $50 avg conversion value
        : 0;

      return summary;
    } catch (error) {
      logger.error('Error getting campaign performance summary:', error);
      throw error;
    }
  }

  private transformToPlatformFormat(campaign: ICampaign): any {
    // Transform internal campaign format to platform-specific format
    // This would vary by platform
    return {
      name: campaign.name,
      status: campaign.status,
      objective: campaign.objective,
      daily_budget: campaign.budget.daily,
      bid_strategy: campaign.bidding.strategy,
      targeting: campaign.targeting,
      start_date: campaign.schedule.start_date,
      end_date: campaign.schedule.end_date,
      time_zone: campaign.schedule.time_zone
    };
  }
}

export default CampaignService;