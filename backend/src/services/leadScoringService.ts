import LeadScore, { ILeadScore } from '../models/Lead';
import { logger } from '../utils/logger';
import { createClient } from 'redis';

export interface LeadScoringConfig {
  demographicWeights: {
    jobTitle: { [key: string]: number };
    companySize: { [key: string]: number };
    industry: { [key: string]: number };
    location: { [key: string]: number };
  };
  behavioralWeights: {
    emailOpen: number;
    emailClick: number;
    websiteVisit: number;
    pageViews: number;
    timeOnSite: number;
    downloadCount: number;
    formSubmissions: number;
    socialShares: number;
  };
  engagementWeights: {
    responseTime: { fast: number; medium: number; slow: number };
    meetingAttendance: number;
    proposalViews: number;
    referrals: number;
  };
}

export class LeadScoringService {
  private static instance: LeadScoringService;
  private redisClient;
  
  private defaultConfig: LeadScoringConfig = {
    demographicWeights: {
      jobTitle: {
        'CEO': 25, 'CTO': 24, 'CMO': 23, 'VP': 22, 'Director': 20,
        'Manager': 15, 'Coordinator': 10, 'Assistant': 5, 'Other': 8
      },
      companySize: {
        '1-10': 10, '11-50': 15, '51-200': 20, '201-1000': 25, '1000+': 25
      },
      industry: {
        'Technology': 25, 'Healthcare': 23, 'Finance': 22, 'Manufacturing': 20,
        'Retail': 18, 'Education': 15, 'Non-profit': 10, 'Other': 12
      },
      location: {
        'North America': 25, 'Europe': 23, 'Asia Pacific': 20, 
        'Latin America': 15, 'Africa': 10, 'Other': 12
      }
    },
    behavioralWeights: {
      emailOpen: 2,
      emailClick: 5,
      websiteVisit: 3,
      pageViews: 1,
      timeOnSite: 2,
      downloadCount: 8,
      formSubmissions: 10,
      socialShares: 4
    },
    engagementWeights: {
      responseTime: { fast: 25, medium: 15, slow: 5 },
      meetingAttendance: 20,
      proposalViews: 15,
      referrals: 25
    }
  };

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redisClient.connect().catch(console.error);
  }

  public static getInstance(): LeadScoringService {
    if (!LeadScoringService.instance) {
      LeadScoringService.instance = new LeadScoringService();
    }
    return LeadScoringService.instance;
  }

  async calculateLeadScore(leadId: string, leadData: any): Promise<ILeadScore> {
    try {
      // Calculate demographic score
      const demographicScore = this.calculateDemographicScore(leadData);
      
      // Calculate behavioral score
      const behavioralScore = await this.calculateBehavioralScore(leadId);
      
      // Calculate engagement score
      const engagementScore = await this.calculateEngagementScore(leadId);
      
      // Calculate composite score with weights
      const compositeScore = Math.round(
        (demographicScore.total * 0.3) +
        (behavioralScore.total * 0.4) +
        (engagementScore.total * 0.3)
      );
      
      // Determine grade
      const scoreGrade = this.getScoreGrade(compositeScore);
      
      // Calculate predictive metrics
      const conversionProbability = await this.calculateConversionProbability(
        demographicScore, behavioralScore, engagementScore
      );
      const estimatedValue = await this.calculateEstimatedValue(leadData, compositeScore);
      const estimatedTimeToClose = await this.calculateTimeToClose(compositeScore, leadData);
      
      // Update or create lead score
      let leadScore = await LeadScore.findOne({ leadId });
      
      const scoreUpdate = {
        demographicScore,
        behavioralScore,
        engagementScore,
        compositeScore,
        scoreGrade,
        conversionProbability,
        estimatedValue,
        estimatedTimeToClose,
        lastUpdated: new Date()
      };
      
      if (leadScore) {
        // Add to history if score changed significantly
        if (Math.abs(leadScore.compositeScore - compositeScore) >= 5) {
          leadScore.scoreHistory.push({
            date: new Date(),
            score: compositeScore,
            reason: 'Automated score update',
            changedFields: this.getChangedFields(leadScore, scoreUpdate)
          });
        }
        
        Object.assign(leadScore, scoreUpdate);
        await leadScore.save();
      } else {
        leadScore = new LeadScore({
          leadId,
          userId: leadData.userId,
          ...scoreUpdate,
          scoreHistory: [{
            date: new Date(),
            score: compositeScore,
            reason: 'Initial score calculation',
            changedFields: ['all']
          }]
        });
        await leadScore.save();
      }
      
      // Cache the result
      await this.redisClient.setEx(
        `lead_score:${leadId}`,
        3600, // 1 hour cache
        JSON.stringify(leadScore)
      );
      
      logger.info(`Lead score calculated: ${leadId} - Score: ${compositeScore}`);
      return leadScore;
      
    } catch (error) {
      logger.error('Error calculating lead score:', error);
      throw error;
    }
  }

  private calculateDemographicScore(leadData: any) {
    const config = this.defaultConfig.demographicWeights;
    
    const jobTitleScore = config.jobTitle[leadData.jobTitle] || config.jobTitle['Other'];
    const companySizeScore = config.companySize[leadData.companySize] || 10;
    const industryScore = config.industry[leadData.industry] || config.industry['Other'];
    const locationScore = config.location[leadData.location] || config.location['Other'];
    
    return {
      total: jobTitleScore + companySizeScore + industryScore + locationScore,
      factors: {
        jobTitle: jobTitleScore,
        companySize: companySizeScore,
        industry: industryScore,
        location: locationScore
      }
    };
  }

  private async calculateBehavioralScore(leadId: string) {
    // This would integrate with your analytics system
    // For now, using mock calculation
    const config = this.defaultConfig.behavioralWeights;
    
    // In real implementation, fetch from analytics database
    const behaviorData = await this.getBehaviorData(leadId);
    
    const emailEngagement = (behaviorData.emailOpens * config.emailOpen) + 
                           (behaviorData.emailClicks * config.emailClick);
    const websiteActivity = (behaviorData.websiteVisits * config.websiteVisit) + 
                           (behaviorData.pageViews * config.pageViews) +
                           (behaviorData.timeOnSite * config.timeOnSite);
    const contentDownloads = behaviorData.downloads * config.downloadCount;
    const formSubmissions = behaviorData.formSubmissions * config.formSubmissions;
    const socialEngagement = behaviorData.socialShares * config.socialShares;
    
    const total = Math.min(100, emailEngagement + websiteActivity + 
                          contentDownloads + formSubmissions + socialEngagement);
    
    return {
      total: Math.round(total),
      factors: {
        emailEngagement: Math.min(20, Math.round(emailEngagement)),
        websiteActivity: Math.min(20, Math.round(websiteActivity)),
        contentDownloads: Math.min(20, Math.round(contentDownloads)),
        formSubmissions: Math.min(20, Math.round(formSubmissions)),
        socialEngagement: Math.min(20, Math.round(socialEngagement))
      }
    };
  }

  private async calculateEngagementScore(leadId: string) {
    const config = this.defaultConfig.engagementWeights;
    
    // In real implementation, fetch from CRM activities
    const engagementData = await this.getEngagementData(leadId);
    
    const responseTimeScore = engagementData.avgResponseTime < 2 ? 
      config.responseTime.fast : 
      engagementData.avgResponseTime < 24 ? 
      config.responseTime.medium : 
      config.responseTime.slow;
    
    const meetingScore = engagementData.meetingsAttended * config.meetingAttendance;
    const proposalScore = engagementData.proposalViews * config.proposalViews;
    const referralScore = engagementData.referrals * config.referrals;
    
    const total = Math.min(100, responseTimeScore + meetingScore + proposalScore + referralScore);
    
    return {
      total: Math.round(total),
      factors: {
        responseTime: responseTimeScore,
        meetingAttendance: Math.min(25, Math.round(meetingScore)),
        proposalEngagement: Math.min(25, Math.round(proposalScore)),
        referralActivity: Math.min(25, Math.round(referralScore))
      }
    };
  }

  private async calculateConversionProbability(demographic: any, behavioral: any, engagement: any): Promise<number> {
    // Machine learning model would go here
    // For now, using weighted algorithm
    const totalScore = (demographic.total * 0.3) + (behavioral.total * 0.4) + (engagement.total * 0.3);
    
    // Convert to probability using sigmoid function
    const probability = 100 / (1 + Math.exp(-(totalScore - 50) / 15));
    
    return Math.round(probability * 100) / 100;
  }

  private async calculateEstimatedValue(leadData: any, score: number): Promise<number> {
    // Base value calculation based on company size and industry
    const baseValue = {
      '1-10': 5000,
      '11-50': 15000,
      '51-200': 35000,
      '201-1000': 75000,
      '1000+': 150000
    }[leadData.companySize] || 10000;
    
    // Adjust based on score
    const scoreMultiplier = score / 100;
    
    return Math.round(baseValue * scoreMultiplier);
  }

  private async calculateTimeToClose(score: number, leadData: any): Promise<number> {
    // Higher score = shorter time to close
    const baseTime = 90; // 90 days default
    const scoreAdjustment = (100 - score) * 0.5; // Reduce days based on score
    
    return Math.max(7, Math.round(baseTime - scoreAdjustment)); // Minimum 7 days
  }

  private getScoreGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  private getChangedFields(oldScore: any, newScore: any): string[] {
    const changed: string[] = [];
    
    if (Math.abs(oldScore.demographicScore.total - newScore.demographicScore.total) >= 2) {
      changed.push('demographic');
    }
    if (Math.abs(oldScore.behavioralScore.total - newScore.behavioralScore.total) >= 2) {
      changed.push('behavioral');
    }
    if (Math.abs(oldScore.engagementScore.total - newScore.engagementScore.total) >= 2) {
      changed.push('engagement');
    }
    
    return changed;
  }

  private async getBehaviorData(leadId: string) {
    // Mock data - replace with actual analytics queries
    return {
      emailOpens: Math.floor(Math.random() * 20),
      emailClicks: Math.floor(Math.random() * 10),
      websiteVisits: Math.floor(Math.random() * 50),
      pageViews: Math.floor(Math.random() * 100),
      timeOnSite: Math.floor(Math.random() * 30),
      downloads: Math.floor(Math.random() * 5),
      formSubmissions: Math.floor(Math.random() * 3),
      socialShares: Math.floor(Math.random() * 8)
    };
  }

  private async getEngagementData(leadId: string) {
    // Mock data - replace with actual CRM queries
    return {
      avgResponseTime: Math.floor(Math.random() * 48) + 1, // 1-48 hours
      meetingsAttended: Math.floor(Math.random() * 5),
      proposalViews: Math.floor(Math.random() * 3),
      referrals: Math.floor(Math.random() * 2)
    };
  }

  async getLeadScoreHistory(leadId: string): Promise<any[]> {
    const leadScore = await LeadScore.findOne({ leadId });
    return leadScore?.scoreHistory || [];
  }

  async getTopLeads(userId: string, limit: number = 50) {
    return LeadScore.find({ userId })
      .sort({ compositeScore: -1 })
      .limit(limit)
      .populate('leadId');
  }
}

export default LeadScoringService;