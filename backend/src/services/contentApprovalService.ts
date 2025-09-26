import mongoose from 'mongoose';
import { ContentItem, IContentItem } from '../models/ContentItem';
import { ApprovalWorkflow, IApprovalWorkflow } from '../models/ApprovalWorkflow';
import { AuditLog } from '../models/AuditLog';
import { CRMCacheService } from './crmCacheService';
import { JobQueue } from './jobQueue';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export class ContentApprovalService {
  private static instance: ContentApprovalService;
  private cacheService?: CRMCacheService;
  private jobQueue?: JobQueue;

  public static getInstance(): ContentApprovalService {
    if (!ContentApprovalService.instance) {
      ContentApprovalService.instance = new ContentApprovalService();
    }
    return ContentApprovalService.instance;
  }

  public setCacheService(cacheService: CRMCacheService): void {
    this.cacheService = cacheService;
  }

  public setJobQueue(jobQueue: JobQueue): void {
    this.jobQueue = jobQueue;
  }

  // ============= CONTENT MANAGEMENT =============

  async createContent(userId: string, contentData: any): Promise<IContentItem> {
    try {
      logger.info(`Creating content item for user ${userId}`);

      // Create initial version
      const initialVersion = {
        versionNumber: 1,
        content: contentData.content || { body: contentData.description || '' },
        changes: ['Initial creation'],
        createdBy: new mongoose.Types.ObjectId(userId),
        createdAt: new Date()
      };

      const contentItem = new ContentItem({
        ...contentData,
        createdBy: new mongoose.Types.ObjectId(userId),
        versions: [initialVersion],
        currentVersionId: initialVersion._id,
        totalComments: 0,
        unresolvedComments: 0,
        remindersSent: 0,
        actions: [{
          actionType: 'status_change',
          toStatus: contentData.status || 'draft',
          performedBy: new mongoose.Types.ObjectId(userId),
          details: 'Content created'
        }]
      });

      // Apply default workflow if none specified
      if (!contentItem.workflowId && contentData.clientId) {
        const defaultWorkflow = await ApprovalWorkflow.getDefaultWorkflow(contentData.clientId);
        if (defaultWorkflow) {
          contentItem.workflowId = defaultWorkflow._id;
          await this.applyWorkflowToContent(contentItem, defaultWorkflow, userId);
        }
      }

      const savedContent = await contentItem.save();

      // Invalidate cache
      if (this.cacheService && contentData.clientId) {
        await this.cacheService.invalidateUserCache(contentData.clientId);
      }

      // Schedule AI analysis job
      if (this.jobQueue) {
        await this.jobQueue.addJob('content-analysis', 'ai_analysis', {
          contentId: savedContent._id.toString(),
          userId
        });
      }

      logger.info(`Content item created successfully: ${savedContent._id}`);
      return savedContent;

    } catch (error: any) {
      logger.error('Error creating content item:', error);
      throw new Error(`Failed to create content: ${error.message}`);
    }
  }

  async getContent(userId: string, contentId: string): Promise<IContentItem | null> {
    try {
      const cacheKey = `content:${contentId}`;

      // Try cache first
      if (this.cacheService) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          return cached as IContentItem;
        }
      }

      const content = await ContentItem.findById(contentId)
        .populate('createdBy', 'name email avatar')
        .populate('assignedTo', 'name email avatar role')
        .populate('approvedBy', 'name email avatar')
        .populate('comments.author', 'name email avatar')
        .populate('workflowId');

      if (!content) {
        return null;
      }

      // Check permissions (simplified - should be more robust)
      const hasAccess = content.createdBy._id.toString() === userId ||
                       content.assignedTo.some((approver: any) => approver._id.toString() === userId) ||
                       content.clientId.toString() === userId;

      if (!hasAccess) {
        throw new Error('Access denied');
      }

      // Cache the result
      if (this.cacheService) {
        await this.cacheService.set(cacheKey, content, 300); // 5 minutes
      }

      return content;

    } catch (error: any) {
      logger.error(`Error getting content ${contentId}:`, error);
      throw error;
    }
  }

  async getContentList(userId: string, filters: any = {}, options: any = {}): Promise<{
    contents: IContentItem[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'lastActivityAt',
        sortOrder = 'desc',
        clientId,
        status,
        contentType,
        priority,
        assignedTo,
        search
      } = { ...filters, ...options };

      // Build query
      const query: any = {};

      if (clientId) {
        query.clientId = new mongoose.Types.ObjectId(clientId);
      }

      if (status && Array.isArray(status) && status.length > 0) {
        query.status = { $in: status };
      }

      if (contentType && Array.isArray(contentType) && contentType.length > 0) {
        query.contentType = { $in: contentType };
      }

      if (priority && Array.isArray(priority) && priority.length > 0) {
        query.priority = { $in: priority };
      }

      if (assignedTo) {
        query.assignedTo = { $in: [new mongoose.Types.ObjectId(assignedTo)] };
      }

      if (search) {
        query.$text = { $search: search };
      }

      // Date filters
      if (filters.dateRange) {
        query.createdAt = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        };
      }

      if (filters.overdue) {
        query.dueDate = { $lt: new Date() };
        query.status = { $nin: ['approved', 'published', 'rejected'] };
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const skip = (page - 1) * limit;

      const [contents, total] = await Promise.all([
        ContentItem.find(query)
          .populate('createdBy', 'name email avatar')
          .populate('assignedTo', 'name email avatar role')
          .populate('approvedBy', 'name email avatar')
          .sort(sort)
          .skip(skip)
          .limit(limit + 1), // Get one extra to check if there are more
        ContentItem.countDocuments(query)
      ]);

      const hasMore = contents.length > limit;
      if (hasMore) {
        contents.pop(); // Remove the extra item
      }

      logger.info(`Retrieved ${contents.length} content items for user ${userId}`);

      return {
        contents: contents.slice(0, limit),
        total,
        hasMore
      };

    } catch (error: any) {
      logger.error('Error getting content list:', error);
      throw new Error(`Failed to get content list: ${error.message}`);
    }
  }

  async updateContent(userId: string, contentId: string, updates: any): Promise<IContentItem | null> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Check permissions
      const hasAccess = content.createdBy.toString() === userId ||
                       content.assignedTo.some(approver => approver.toString() === userId) ||
                       content.clientId.toString() === userId;

      if (!hasAccess) {
        throw new Error('Access denied');
      }

      // Track changes for audit
      const changes: string[] = [];
      const previousState = { ...content.toObject() };

      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && key !== '_id' && key !== 'versions') {
          if (content[key] !== updates[key]) {
            changes.push(`${key}: ${content[key]} → ${updates[key]}`);
            content[key] = updates[key];
          }
        }
      });

      // If content was updated, create new version
      if (updates.content && updates.content !== content.getCurrentVersion()?.content) {
        await this.createNewVersion(userId, contentId, updates.content, updates.versionNotes);
        changes.push('New version created');
      }

      // Add action to history
      if (changes.length > 0) {
        content.actions.push({
          actionType: 'version_update',
          performedBy: new mongoose.Types.ObjectId(userId),
          details: changes.join('; '),
          metadata: { changes }
        });
      }

      const savedContent = await content.save();

      // Invalidate cache
      if (this.cacheService) {
        await this.cacheService.delete(`content:${contentId}`);
        await this.cacheService.invalidateUserCache(content.clientId.toString());
      }

      // Create audit log
      await AuditLog.create({
        userId: new mongoose.Types.ObjectId(userId),
        action: 'UPDATE',
        resource: 'ContentItem',
        resourceId: contentId,
        changes: changes,
        previousState,
        newState: savedContent.toObject()
      });

      logger.info(`Content updated by user ${userId}: ${contentId}`);
      return savedContent;

    } catch (error: any) {
      logger.error(`Error updating content ${contentId}:`, error);
      throw error;
    }
  }

  async deleteContent(userId: string, contentId: string, permanent: boolean = false): Promise<boolean> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        return false;
      }

      // Check permissions
      const hasAccess = content.createdBy.toString() === userId ||
                       content.clientId.toString() === userId;

      if (!hasAccess) {
        throw new Error('Access denied');
      }

      if (permanent) {
        await ContentItem.findByIdAndDelete(contentId);
      } else {
        await content.softDelete(userId);
      }

      // Invalidate cache
      if (this.cacheService) {
        await this.cacheService.delete(`content:${contentId}`);
        await this.cacheService.invalidateUserCache(content.clientId.toString());
      }

      // Create audit log
      await AuditLog.create({
        userId: new mongoose.Types.ObjectId(userId),
        action: 'DELETE',
        resource: 'ContentItem',
        resourceId: contentId,
        metadata: { permanent }
      });

      logger.info(`Content ${permanent ? 'permanently ' : ''}deleted by user ${userId}: ${contentId}`);
      return true;

    } catch (error: any) {
      logger.error(`Error deleting content ${contentId}:`, error);
      throw error;
    }
  }

  // ============= VERSION MANAGEMENT =============

  async createNewVersion(userId: string, contentId: string, contentData: any, notes?: string): Promise<IContentItem | null> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Check permissions
      const hasAccess = content.createdBy.toString() === userId ||
                       content.assignedTo.some(approver => approver.toString() === userId);

      if (!hasAccess) {
        throw new Error('Access denied');
      }

      const currentVersion = content.getCurrentVersion();
      const newVersionNumber = currentVersion ? currentVersion.versionNumber + 1 : 1;

      // Generate changes summary
      const changes: string[] = [];
      if (currentVersion) {
        const oldContent = currentVersion.content;
        if (oldContent.title !== contentData.title) changes.push('Title updated');
        if (oldContent.body !== contentData.body) changes.push('Body content updated');
        if (JSON.stringify(oldContent.hashtags) !== JSON.stringify(contentData.hashtags)) changes.push('Hashtags updated');
        if (oldContent.callToAction !== contentData.callToAction) changes.push('Call to action updated');
        if (JSON.stringify(oldContent.mediaUrls) !== JSON.stringify(contentData.mediaUrls)) changes.push('Media updated');
      }

      const newVersion = {
        _id: new mongoose.Types.ObjectId(),
        versionNumber: newVersionNumber,
        content: contentData,
        changes: changes.length ? changes : ['Content updated'],
        createdBy: new mongoose.Types.ObjectId(userId),
        createdAt: new Date(),
        notes
      };

      content.versions.push(newVersion);
      content.currentVersionId = newVersion._id;

      // Add action
      content.actions.push({
        actionType: 'version_update',
        performedBy: new mongoose.Types.ObjectId(userId),
        details: `Version ${newVersionNumber} created: ${changes.join(', ') || 'Content updated'}`,
        metadata: { versionNumber: newVersionNumber, changes }
      });

      const savedContent = await content.save();

      // Schedule AI analysis for new version
      if (this.jobQueue) {
        await this.jobQueue.addJob('content-analysis', 'version_analysis', {
          contentId: contentId,
          versionId: newVersion._id.toString(),
          userId
        });
      }

      logger.info(`New version created for content ${contentId} by user ${userId}`);
      return savedContent;

    } catch (error: any) {
      logger.error(`Error creating new version for content ${contentId}:`, error);
      throw error;
    }
  }

  async revertToVersion(userId: string, contentId: string, versionId: string): Promise<IContentItem | null> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      const targetVersion = content.versions.find(v => v._id.toString() === versionId);
      if (!targetVersion) {
        throw new Error('Version not found');
      }

      // Check permissions
      const hasAccess = content.createdBy.toString() === userId ||
                       content.assignedTo.some(approver => approver.toString() === userId);

      if (!hasAccess) {
        throw new Error('Access denied');
      }

      content.currentVersionId = targetVersion._id;

      // Add action
      content.actions.push({
        actionType: 'version_update',
        performedBy: new mongoose.Types.ObjectId(userId),
        details: `Reverted to version ${targetVersion.versionNumber}`,
        metadata: {
          previousVersionId: content.currentVersionId,
          targetVersionId: versionId,
          targetVersionNumber: targetVersion.versionNumber
        }
      });

      const savedContent = await content.save();

      // Invalidate cache
      if (this.cacheService) {
        await this.cacheService.delete(`content:${contentId}`);
      }

      logger.info(`Content ${contentId} reverted to version ${targetVersion.versionNumber} by user ${userId}`);
      return savedContent;

    } catch (error: any) {
      logger.error(`Error reverting content ${contentId} to version ${versionId}:`, error);
      throw error;
    }
  }

  // ============= APPROVAL WORKFLOW =============

  async approveContent(userId: string, contentId: string, comments?: string, nextStage?: boolean): Promise<IContentItem | null> {
    try {
      const content = await ContentItem.findById(contentId).populate('workflowId');
      if (!content) {
        throw new Error('Content not found');
      }

      // Check if user is assigned to approve
      const isAssigned = content.assignedTo.some(approver => approver.toString() === userId);
      if (!isAssigned) {
        throw new Error('You are not assigned to approve this content');
      }

      // Check if already approved by this user
      const alreadyApproved = content.approvedBy.some(approver => approver.toString() === userId);
      if (alreadyApproved) {
        throw new Error('You have already approved this content');
      }

      // Add to approved by
      content.approvedBy.push(new mongoose.Types.ObjectId(userId));

      // Add comment if provided
      if (comments) {
        content.comments.push({
          author: new mongoose.Types.ObjectId(userId),
          text: comments,
          type: 'approval',
          status: 'active',
          mentions: [],
          createdAt: new Date()
        });
      }

      // Add action
      content.actions.push({
        actionType: 'approval',
        fromStatus: content.status,
        toStatus: 'approved',
        performedBy: new mongoose.Types.ObjectId(userId),
        details: comments || 'Content approved'
      });

      // Check workflow progression
      if (content.workflowId && nextStage) {
        await this.advanceWorkflowStage(content, userId);
      } else {
        content.status = 'approved';
      }

      const savedContent = await content.save();

      // Send notifications
      if (this.jobQueue) {
        await this.jobQueue.addJob('notifications', 'approval_notification', {
          contentId: contentId,
          approverId: userId,
          action: 'approved',
          comments
        });
      }

      // Invalidate cache
      if (this.cacheService) {
        await this.cacheService.delete(`content:${contentId}`);
        await this.cacheService.invalidateUserCache(content.clientId.toString());
      }

      logger.info(`Content approved by user ${userId}: ${contentId}`);
      return savedContent;

    } catch (error: any) {
      logger.error(`Error approving content ${contentId}:`, error);
      throw error;
    }
  }

  async rejectContent(userId: string, contentId: string, reason: string): Promise<IContentItem | null> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Check if user is assigned to approve
      const isAssigned = content.assignedTo.some(approver => approver.toString() === userId);
      if (!isAssigned) {
        throw new Error('You are not assigned to review this content');
      }

      // Add to rejected by
      if (!content.rejectedBy) content.rejectedBy = [];
      content.rejectedBy.push(new mongoose.Types.ObjectId(userId));

      // Update status
      content.status = 'rejected';

      // Add rejection comment
      content.comments.push({
        author: new mongoose.Types.ObjectId(userId),
        text: reason,
        type: 'approval',
        status: 'active',
        mentions: [],
        isPinned: true,
        createdAt: new Date()
      });

      // Add action
      content.actions.push({
        actionType: 'rejection',
        fromStatus: content.status,
        toStatus: 'rejected',
        performedBy: new mongoose.Types.ObjectId(userId),
        details: `Content rejected: ${reason}`
      });

      const savedContent = await content.save();

      // Send notifications
      if (this.jobQueue) {
        await this.jobQueue.addJob('notifications', 'rejection_notification', {
          contentId: contentId,
          rejectorId: userId,
          reason
        });
      }

      // Invalidate cache
      if (this.cacheService) {
        await this.cacheService.delete(`content:${contentId}`);
        await this.cacheService.invalidateUserCache(content.clientId.toString());
      }

      logger.info(`Content rejected by user ${userId}: ${contentId}`);
      return savedContent;

    } catch (error: any) {
      logger.error(`Error rejecting content ${contentId}:`, error);
      throw error;
    }
  }

  async requestRevision(userId: string, contentId: string, feedback: string): Promise<IContentItem | null> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Check permissions
      const isAssigned = content.assignedTo.some(approver => approver.toString() === userId);
      if (!isAssigned) {
        throw new Error('You are not assigned to review this content');
      }

      // Update status
      content.status = 'revision-requested';

      // Add revision comment
      content.comments.push({
        author: new mongoose.Types.ObjectId(userId),
        text: feedback,
        type: 'revision',
        status: 'active',
        mentions: [content.createdBy],
        isPinned: true,
        createdAt: new Date()
      });

      // Add action
      content.actions.push({
        actionType: 'status_change',
        fromStatus: content.status,
        toStatus: 'revision-requested',
        performedBy: new mongoose.Types.ObjectId(userId),
        details: `Revision requested: ${feedback}`
      });

      const savedContent = await content.save();

      // Send notifications
      if (this.jobQueue) {
        await this.jobQueue.addJob('notifications', 'revision_request_notification', {
          contentId: contentId,
          requesterId: userId,
          feedback
        });
      }

      logger.info(`Revision requested by user ${userId}: ${contentId}`);
      return savedContent;

    } catch (error: any) {
      logger.error(`Error requesting revision for content ${contentId}:`, error);
      throw error;
    }
  }

  // ============= CLIENT REVIEW LINKS =============

  async generateReviewLink(userId: string, contentId: string, clientId: string, settings: any = {}): Promise<string> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const url = `${process.env.APP_URL || 'http://localhost:3000'}/review/${token}`;

      // Default settings
      const linkSettings = {
        allowComments: true,
        allowDownload: false,
        requirePassword: false,
        notifyOnAccess: true,
        ...settings
      };

      const reviewLink = {
        clientId: new mongoose.Types.ObjectId(clientId),
        token,
        url,
        isActive: true,
        expiresAt: new Date(Date.now() + (settings.expirationDays || 7) * 24 * 60 * 60 * 1000),
        accessCount: 0,
        createdAt: new Date(),
        settings: linkSettings
      };

      content.reviewLinks.push(reviewLink);

      // Add action
      content.actions.push({
        actionType: 'link_generated',
        performedBy: new mongoose.Types.ObjectId(userId),
        details: `Review link generated for client`,
        metadata: {
          token,
          expiresAt: reviewLink.expiresAt,
          settings: linkSettings
        }
      });

      await content.save();

      // Send link to client
      if (this.jobQueue && linkSettings.notifyOnAccess) {
        await this.jobQueue.addJob('notifications', 'review_link_notification', {
          contentId: contentId,
          clientId,
          reviewLink: {
            url,
            token,
            expiresAt: reviewLink.expiresAt
          }
        });
      }

      logger.info(`Review link generated for content ${contentId} by user ${userId}`);
      return url;

    } catch (error: any) {
      logger.error(`Error generating review link for content ${contentId}:`, error);
      throw error;
    }
  }

  async accessReviewLink(token: string): Promise<{ content: IContentItem; link: any } | null> {
    try {
      const content = await ContentItem.findOne({ 'reviewLinks.token': token })
        .populate('createdBy', 'name email')
        .populate('comments.author', 'name email avatar');

      if (!content) {
        return null;
      }

      const link = content.reviewLinks.find(l => l.token === token);
      if (!link || !link.isActive || link.expiresAt < new Date()) {
        return null;
      }

      // Update access count
      link.accessCount += 1;
      link.lastAccessedAt = new Date();

      // Add action
      content.actions.push({
        actionType: 'link_accessed',
        performedBy: link.clientId,
        details: `Review link accessed`,
        metadata: {
          token,
          accessCount: link.accessCount
        }
      });

      await content.save();

      logger.info(`Review link accessed: ${token} for content ${content._id}`);

      return {
        content,
        link: {
          settings: link.settings,
          accessCount: link.accessCount,
          expiresAt: link.expiresAt
        }
      };

    } catch (error: any) {
      logger.error(`Error accessing review link ${token}:`, error);
      throw error;
    }
  }

  // ============= COMMENTS SYSTEM =============

  async addComment(userId: string, contentId: string, commentData: any): Promise<IContentItem | null> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      const comment = {
        _id: new mongoose.Types.ObjectId(),
        author: new mongoose.Types.ObjectId(userId),
        text: commentData.text,
        type: commentData.type || 'general',
        status: 'active',
        mentions: commentData.mentions || [],
        attachments: commentData.attachments || [],
        isPinned: commentData.isPinned || false,
        parentId: commentData.parentId,
        createdAt: new Date(),
        reactions: []
      };

      content.comments.push(comment);

      // Add action
      content.actions.push({
        actionType: 'comment',
        performedBy: new mongoose.Types.ObjectId(userId),
        details: `Comment added: ${commentData.text.substring(0, 100)}...`
      });

      const savedContent = await content.save();

      // Send notifications for mentions
      if (commentData.mentions && commentData.mentions.length > 0 && this.jobQueue) {
        await this.jobQueue.addJob('notifications', 'mention_notification', {
          contentId: contentId,
          commentId: comment._id.toString(),
          authorId: userId,
          mentionedUsers: commentData.mentions
        });
      }

      logger.info(`Comment added to content ${contentId} by user ${userId}`);
      return savedContent;

    } catch (error: any) {
      logger.error(`Error adding comment to content ${contentId}:`, error);
      throw error;
    }
  }

  // ============= ANALYTICS =============

  async getApprovalStats(clientId?: string): Promise<any> {
    try {
      const match: any = {};
      if (clientId) {
        match.clientId = new mongoose.Types.ObjectId(clientId);
      }

      const stats = await ContentItem.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalContent: { $sum: 1 },
            byStatus: {
              $push: {
                k: '$status',
                v: 1
              }
            },
            byContentType: {
              $push: {
                k: '$contentType',
                v: 1
              }
            },
            byPlatform: {
              $push: {
                k: '$platform',
                v: 1
              }
            },
            overdueItems: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$dueDate', null] },
                      { $lt: ['$dueDate', new Date()] },
                      { $nin: ['$status', ['approved', 'published', 'rejected']] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            pendingApprovals: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['pending', 'in-review']] },
                  1,
                  0
                ]
              }
            },
            avgApprovalTime: { $avg: '$analytics.averageApprovalTime' }
          }
        }
      ]);

      // Get recent activity
      const recentActivity = await ContentItem.find(match)
        .sort({ lastActivityAt: -1 })
        .limit(10)
        .populate('createdBy', 'name email')
        .select('title status lastActivityAt actions');

      // Get upcoming deadlines
      const upcomingDeadlines = await ContentItem.find({
        ...match,
        dueDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        status: { $nin: ['approved', 'published', 'rejected'] }
      })
        .sort({ dueDate: 1 })
        .limit(10)
        .populate('createdBy assignedTo', 'name email');

      const result = stats[0] || {};

      return {
        totalContent: result.totalContent || 0,
        byStatus: this.arrayToObject(result.byStatus || []),
        byContentType: this.arrayToObject(result.byContentType || []),
        byPlatform: this.arrayToObject(result.byPlatform || []),
        overdueItems: result.overdueItems || 0,
        pendingApprovals: result.pendingApprovals || 0,
        averageApprovalTime: result.avgApprovalTime || 0,
        recentActivity,
        upcomingDeadlines,
        approvalRate: result.totalContent > 0 ?
          ((result.totalContent - result.overdueItems) / result.totalContent * 100) : 100
      };

    } catch (error: any) {
      logger.error('Error getting approval stats:', error);
      throw error;
    }
  }

  // ============= BULK OPERATIONS =============

  async bulkUpdateStatus(userId: string, contentIds: string[], status: string): Promise<{
    updated: number;
    failed: number;
    errors: string[];
  }> {
    const results = { updated: 0, failed: 0, errors: [] as string[] };

    for (const contentId of contentIds) {
      try {
        const content = await ContentItem.findById(contentId);
        if (!content) {
          results.failed++;
          results.errors.push(`${contentId}: Content not found`);
          continue;
        }

        // Check permissions
        const hasAccess = content.createdBy.toString() === userId ||
                         content.assignedTo.some(approver => approver.toString() === userId) ||
                         content.clientId.toString() === userId;

        if (!hasAccess) {
          results.failed++;
          results.errors.push(`${contentId}: Access denied`);
          continue;
        }

        const oldStatus = content.status;
        content.status = status as any;

        // Add action
        content.actions.push({
          actionType: 'status_change',
          fromStatus: oldStatus,
          toStatus: status,
          performedBy: new mongoose.Types.ObjectId(userId),
          details: `Bulk status update: ${oldStatus} → ${status}`
        });

        await content.save();
        results.updated++;

      } catch (error: any) {
        results.failed++;
        results.errors.push(`${contentId}: ${error.message}`);
      }
    }

    // Invalidate cache
    if (this.cacheService) {
      await this.cacheService.flushPattern('content:*');
    }

    logger.info(`Bulk status update completed by user ${userId}: ${results.updated} updated, ${results.failed} failed`);
    return results;
  }

  // ============= HELPER METHODS =============

  private arrayToObject(arr: any[]): Record<string, number> {
    return arr.reduce((acc, item) => {
      acc[item.k] = (acc[item.k] || 0) + item.v;
      return acc;
    }, {});
  }

  private async applyWorkflowToContent(content: IContentItem, workflow: IApprovalWorkflow, userId: string): Promise<void> {
    const firstStage = workflow.stages.find(s => s.order === 0);
    if (firstStage) {
      content.assignedTo = firstStage.approvers;
      content.currentStage = 0;
      content.stageHistory.push({
        stage: 0,
        enteredAt: new Date()
      });
    }
  }

  private async advanceWorkflowStage(content: IContentItem, userId: string): Promise<void> {
    const workflow = content.workflowId as any;
    if (!workflow) return;

    const currentStage = workflow.stages.find((s: any) => s.order === content.currentStage);
    const nextStage = workflow.stages.find((s: any) => s.order === content.currentStage + 1);

    if (nextStage) {
      // Update stage history
      const currentStageHistory = content.stageHistory.find(h => h.stage === content.currentStage);
      if (currentStageHistory) {
        currentStageHistory.exitedAt = new Date();
        currentStageHistory.approver = new mongoose.Types.ObjectId(userId);
        currentStageHistory.action = 'approved';
      }

      // Advance to next stage
      content.currentStage = nextStage.order;
      content.assignedTo = nextStage.approvers;
      content.status = nextStage.status;

      // Add to stage history
      content.stageHistory.push({
        stage: nextStage.order,
        enteredAt: new Date()
      });

      // Add action
      content.actions.push({
        actionType: 'status_change',
        fromStatus: currentStage?.status,
        toStatus: nextStage.status,
        performedBy: new mongoose.Types.ObjectId(userId),
        details: `Advanced to stage: ${nextStage.name}`
      });
    } else {
      // Final stage - mark as approved
      content.status = 'approved';
    }
  }
}

export default ContentApprovalService;