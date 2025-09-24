import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ContentItem, 
  ApprovalWorkflow, 
  ApprovalComment, 
  ApprovalAction, 
  ClientReviewLink, 
  ApprovalNotification, 
  ContentApprovalState, 
  ApprovalFilters, 
  ApprovalStatus,
  ContentType,
  Priority,
  PlatformType,
  ContentVersion,
  ContentApprovalStats,
  DEFAULT_WORKFLOWS,
  CONTENT_TEMPLATES
} from '../types/contentApproval';

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const generateToken = () => 
  Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);

const generateShareUrl = (token: string) => 
  `${window.location.origin}/review/${token}`;

interface ContentApprovalActions {
  // Content management
  addContent: (contentData: Partial<ContentItem>) => string;
  updateContent: (id: string, updates: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  duplicateContent: (id: string) => string;
  bulkUpdateStatus: (ids: string[], status: ApprovalStatus) => void;
  
  // Version control
  createNewVersion: (contentId: string, versionData: Partial<ContentVersion>, notes?: string) => void;
  revertToVersion: (contentId: string, versionId: string) => void;
  compareVersions: (contentId: string, versionId1: string, versionId2: string) => {
    version1: ContentVersion;
    version2: ContentVersion;
    differences: string[];
  } | null;
  
  // Approval workflow
  approveContent: (contentId: string, approverId: string, comments?: string) => void;
  rejectContent: (contentId: string, rejectorId: string, reason: string) => void;
  requestRevision: (contentId: string, requesterId: string, feedback: string) => void;
  advanceToNextStage: (contentId: string) => void;
  assignApprovers: (contentId: string, approverIds: string[]) => void;
  
  // Comments system
  addComment: (contentId: string, comment: Omit<ApprovalComment, 'id' | 'createdAt' | 'contentId' | 'status'>) => void;
  updateComment: (commentId: string, updates: Partial<ApprovalComment>) => void;
  deleteComment: (commentId: string) => void;
  resolveComment: (contentId: string, commentId: string) => void;
  addReaction: (commentId: string, emoji: string, userId: string) => void;
  removeReaction: (commentId: string, emoji: string, userId: string) => void;
  
  // Client review links
  generateReviewLink: (contentId: string, clientId: string, settings?: Partial<ClientReviewLink['settings']>) => string;
  updateReviewLink: (linkId: string, updates: Partial<ClientReviewLink>) => void;
  deactivateReviewLink: (linkId: string) => void;
  trackLinkAccess: (linkId: string) => void;
  
  // Notifications
  addNotification: (notification: Omit<ApprovalNotification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  sendReminders: (contentIds?: string[]) => void;
  
  // Workflows
  createWorkflow: (workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkflow: (workflowId: string, updates: Partial<ApprovalWorkflow>) => void;
  deleteWorkflow: (workflowId: string) => void;
  setDefaultWorkflow: (workflowId: string, clientId: string) => void;
  applyWorkflow: (contentId: string, workflowId: string) => void;
  
  // Filtering and search
  setFilters: (filters: ApprovalFilters) => void;
  clearFilters: () => void;
  searchContent: (query: string) => ContentItem[];
  getContentByStatus: (status: ApprovalStatus) => ContentItem[];
  getOverdueContent: () => ContentItem[];
  getContentByUser: (userId: string, role: 'assigned' | 'created' | 'approved') => ContentItem[];
  
  // View management
  setView: (view: 'board' | 'list' | 'calendar' | 'analytics') => void;
  setSorting: (sortBy: ContentApprovalState['sortBy'], sortOrder: 'asc' | 'desc') => void;
  setSelectedItems: (ids: string[]) => void;
  toggleItemSelection: (id: string) => void;
  selectAll: (filtered?: boolean) => void;
  clearSelection: () => void;
  
  // Analytics and reporting
  refreshStats: () => void;
  getApprovalTimeAnalytics: (clientId?: string) => {
    averageTime: number;
    medianTime: number;
    bottlenecks: { stage: string; averageTime: number }[];
  };
  getPerformanceMetrics: (userId: string) => {
    approvalsCompleted: number;
    averageResponseTime: number;
    approvalRate: number;
  };
  exportReport: (filters: ApprovalFilters, format: 'csv' | 'pdf' | 'excel') => string;
  
  // Bulk operations
  bulkApprove: (contentIds: string[], approverId: string) => void;
  bulkReject: (contentIds: string[], rejectorId: string, reason: string) => void;
  bulkAssign: (contentIds: string[], approverIds: string[]) => void;
  bulkSchedule: (contentIds: string[], scheduleDate: Date) => void;
  
  // Smart features
  suggestApprovers: (contentId: string) => string[];
  predictApprovalTime: (contentId: string) => number;
  detectBottlenecks: () => { stage: string; contentIds: string[]; averageDelay: number }[];
  autoEscalate: () => void;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<ContentApprovalState['settings']>) => void;
  
  // Initialization
  initializeSampleData: () => void;
}

type ContentApprovalStore = ContentApprovalState & ContentApprovalActions;

export const useContentApprovalStore = create<ContentApprovalStore>()(
  persist(
    (set, get) => ({
      // Initial state
      contentItems: [],
      workflows: [],
      notifications: [],
      filters: {},
      selectedItems: [],
      currentView: 'board',
      boardColumns: ['draft', 'pending', 'in-review', 'approved', 'published'],
      sortBy: 'dueDate',
      sortOrder: 'desc',
      isLoading: false,
      error: null,
      settings: {
        defaultWorkflowId: undefined,
        autoAssignReviewers: true,
        enableClientReviewLinks: true,
        linkExpirationDays: 7,
        enableVersionComparison: true,
        enableBulkApprovals: true,
        enableSmartReminders: true,
        reminderSchedule: {
          first: 24,
          subsequent: 12,
          maximum: 3
        },
        emailNotifications: {
          approvalRequests: true,
          statusChanges: true,
          comments: true,
          reminders: true,
          dailyDigest: false
        },
        smsNotifications: {
          enabled: false,
          urgentOnly: true,
          phoneNumber: undefined
        },
        approvalThresholds: {
          autoApprove: false,
          confidenceThreshold: 85,
          requireManualReview: ['advertisement', 'press-release']
        },
        clientPortalSettings: {
          allowDirectApproval: true,
          showAnalytics: false,
          enableFeedback: true,
          customBranding: false
        }
      },
      stats: {
        totalContent: 0,
        byStatus: {
          draft: 0,
          pending: 0,
          'in-review': 0,
          'revision-requested': 0,
          approved: 0,
          rejected: 0,
          published: 0,
          scheduled: 0
        },
        byContentType: {
          'social-post': 0,
          'blog-article': 0,
          'email-campaign': 0,
          'video-script': 0,
          advertisement: 0,
          'press-release': 0,
          newsletter: 0,
          'landing-page': 0,
          'product-description': 0,
          'marketing-copy': 0
        },
        byPlatform: {
          facebook: 0,
          instagram: 0,
          twitter: 0,
          linkedin: 0,
          tiktok: 0,
          youtube: 0,
          website: 0,
          email: 0,
          print: 0,
          other: 0
        },
        averageApprovalTime: 0,
        overdueItems: 0,
        pendingApprovals: 0,
        approvalRate: 0,
        topPerformers: [],
        recentActivity: [],
        upcomingDeadlines: [],
        clientSatisfactionScore: 0,
        bottlenecks: []
      },

      // Content management actions
      addContent: (contentData) => {
        const id = generateId();
        const now = new Date();
        
        const newContent: ContentItem = {
          id,
          clientId: contentData.clientId || 'default-client',
          campaignId: contentData.campaignId,
          title: contentData.title || 'Untitled Content',
          description: contentData.description,
          contentType: contentData.contentType || 'social-post',
          platform: contentData.platform || 'facebook',
          status: 'draft',
          priority: contentData.priority || 'medium',
          versions: [{
            id: generateId(),
            versionNumber: 1,
            content: contentData.versions?.[0]?.content || {
              body: '',
              hashtags: [],
              mediaUrls: []
            },
            changes: ['Initial version'],
            createdAt: now,
            createdBy: contentData.createdBy || 'current-user'
          }],
          currentVersionId: '',
          assignedTo: contentData.assignedTo || [],
          approvedBy: [],
          dueDate: contentData.dueDate,
          scheduledPublishDate: contentData.scheduledPublishDate,
          tags: contentData.tags || [],
          brand: contentData.brand,
          targetAudience: contentData.targetAudience,
          objectives: contentData.objectives || [],
          createdBy: contentData.createdBy || 'current-user',
          createdAt: now,
          updatedAt: now,
          lastActivityAt: now,
          comments: [],
          totalComments: 0,
          unresolvedComments: 0,
          reviewLinks: [],
          actions: [{
            id: generateId(),
            contentId: id,
            actionType: 'status_change',
            toStatus: 'draft',
            performedBy: contentData.createdBy || 'current-user',
            performedAt: now,
            details: 'Content created'
          }],
          remindersSent: 0
        };

        // Set current version ID
        newContent.currentVersionId = newContent.versions[0].id;

        set((state) => ({
          contentItems: [...state.contentItems, newContent]
        }));

        get().refreshStats();
        return id;
      },

      updateContent: (id, updates) => {
        set((state) => ({
          contentItems: state.contentItems.map((item) => 
            item.id === id 
              ? { ...item, ...updates, updatedAt: new Date(), lastActivityAt: new Date() }
              : item
          )
        }));
        get().refreshStats();
      },

      deleteContent: (id) => {
        set((state) => ({
          contentItems: state.contentItems.filter((item) => item.id !== id),
          selectedItems: state.selectedItems.filter((selectedId) => selectedId !== id)
        }));
        get().refreshStats();
      },

      duplicateContent: (id) => {
        const { contentItems } = get();
        const original = contentItems.find((item) => item.id === id);
        if (!original) return '';

        const duplicateId = get().addContent({
          ...original,
          title: `${original.title} (Copy)`,
          status: 'draft',
          approvedBy: [],
          rejectedBy: [],
          actions: [],
          comments: [],
          reviewLinks: [],
          remindersSent: 0,
          lastReminderAt: undefined,
          publishedAt: undefined
        });

        return duplicateId;
      },

      bulkUpdateStatus: (ids, status) => {
        const now = new Date();
        set((state) => ({
          contentItems: state.contentItems.map((item) => {
            if (ids.includes(item.id)) {
              const action: ApprovalAction = {
                id: generateId(),
                contentId: item.id,
                actionType: 'status_change',
                fromStatus: item.status,
                toStatus: status,
                performedBy: 'current-user',
                performedAt: now,
                details: `Bulk status change to ${status}`
              };

              return {
                ...item,
                status,
                updatedAt: now,
                lastActivityAt: now,
                actions: [...item.actions, action]
              };
            }
            return item;
          })
        }));
        get().refreshStats();
      },

      // Version control
      createNewVersion: (contentId, versionData, notes) => {
        const { contentItems } = get();
        const content = contentItems.find((item) => item.id === contentId);
        if (!content) return;

        const newVersionNumber = Math.max(...content.versions.map(v => v.versionNumber)) + 1;
        const newVersion: ContentVersion = {
          id: generateId(),
          versionNumber: newVersionNumber,
          content: {
            title: versionData.content?.title || content.versions[content.versions.length - 1].content.title,
            body: versionData.content?.body || content.versions[content.versions.length - 1].content.body,
            caption: versionData.content?.caption || content.versions[content.versions.length - 1].content.caption,
            hashtags: versionData.content?.hashtags || content.versions[content.versions.length - 1].content.hashtags,
            callToAction: versionData.content?.callToAction || content.versions[content.versions.length - 1].content.callToAction,
            mediaUrls: versionData.content?.mediaUrls || content.versions[content.versions.length - 1].content.mediaUrls,
            scheduledDate: versionData.content?.scheduledDate || content.versions[content.versions.length - 1].content.scheduledDate
          },
          changes: versionData.changes || ['Content updated'],
          createdAt: new Date(),
          createdBy: 'current-user',
          notes
        };

        get().updateContent(contentId, {
          versions: [...content.versions, newVersion],
          currentVersionId: newVersion.id,
          status: 'draft' // Reset to draft when new version is created
        });

        // Add action
        const action: ApprovalAction = {
          id: generateId(),
          contentId,
          actionType: 'version_update',
          performedBy: 'current-user',
          performedAt: new Date(),
          details: `Version ${newVersionNumber} created`
        };

        get().updateContent(contentId, {
          actions: [...content.actions, action]
        });
      },

      revertToVersion: (contentId, versionId) => {
        const { contentItems } = get();
        const content = contentItems.find((item) => item.id === contentId);
        if (!content) return;

        const version = content.versions.find((v) => v.id === versionId);
        if (!version) return;

        get().updateContent(contentId, {
          currentVersionId: versionId,
          status: 'draft'
        });

        // Add action
        const action: ApprovalAction = {
          id: generateId(),
          contentId,
          actionType: 'version_update',
          performedBy: 'current-user',
          performedAt: new Date(),
          details: `Reverted to version ${version.versionNumber}`
        };

        get().updateContent(contentId, {
          actions: [...content.actions, action]
        });
      },

      compareVersions: (contentId, versionId1, versionId2) => {
        const { contentItems } = get();
        const content = contentItems.find((item) => item.id === contentId);
        if (!content) return null;

        const version1 = content.versions.find((v) => v.id === versionId1);
        const version2 = content.versions.find((v) => v.id === versionId2);

        if (!version1 || !version2) return null;

        // Simple difference detection
        const differences: string[] = [];
        
        if (version1.content.title !== version2.content.title) {
          differences.push('Title changed');
        }
        if (version1.content.body !== version2.content.body) {
          differences.push('Body content changed');
        }
        if (JSON.stringify(version1.content.hashtags) !== JSON.stringify(version2.content.hashtags)) {
          differences.push('Hashtags modified');
        }
        if (JSON.stringify(version1.content.mediaUrls) !== JSON.stringify(version2.content.mediaUrls)) {
          differences.push('Media attachments changed');
        }

        return { version1, version2, differences };
      },

      // Approval workflow
      approveContent: (contentId, approverId, comments) => {
        const { contentItems } = get();
        const content = contentItems.find((item) => item.id === contentId);
        if (!content) return;

        const updates: Partial<ContentItem> = {
          approvedBy: [...content.approvedBy, approverId],
          status: 'approved' as ApprovalStatus
        };

        // Add action
        const action: ApprovalAction = {
          id: generateId(),
          contentId,
          actionType: 'status_change',
          fromStatus: content.status,
          toStatus: 'approved',
          performedBy: approverId,
          performedAt: new Date(),
          details: comments || 'Content approved'
        };

        updates.actions = [...content.actions, action];

        if (comments) {
          const comment: ApprovalComment = {
            id: generateId(),
            contentId,
            parentCommentId: undefined,
            author: {
              id: approverId,
              name: 'Approver',
              email: 'approver@company.com',
              role: 'agency'
            },
            message: comments,
            mentions: [],
            isResolved: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          updates.comments = [...content.comments, comment];
          updates.totalComments = (content.totalComments || 0) + 1;
          updates.unresolvedComments = (content.unresolvedComments || 0) + 1;
        }

        get().updateContent(contentId, updates);
      },

      rejectContent: (contentId, rejectorId, reason) => {
        const { contentItems } = get();
        const content = contentItems.find((item) => item.id === contentId);
        if (!content) return;

        const updates: Partial<ContentItem> = {
          rejectedBy: [rejectorId],
          status: 'rejected' as ApprovalStatus
        };

        // Add action
        const action: ApprovalAction = {
          id: generateId(),
          contentId,
          actionType: 'status_change',
          fromStatus: content.status,
          toStatus: 'rejected',
          performedBy: rejectorId,
          performedAt: new Date(),
          details: `Content rejected: ${reason}`
        };

        updates.actions = [...content.actions, action];

        // Add rejection comment
        const comment: ApprovalComment = {
          id: generateId(),
          contentId,
          parentCommentId: undefined,
          author: {
            id: rejectorId,
            name: 'Rejector',
            email: 'rejector@company.com',
            role: 'client'
          },
          message: `Rejection reason: ${reason}`,
          mentions: [],
          isResolved: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        updates.comments = [...content.comments, comment];
        updates.totalComments = (content.totalComments || 0) + 1;
        updates.unresolvedComments = (content.unresolvedComments || 0) + 1;

        get().updateContent(contentId, updates);
      },

      requestRevision: (contentId, requesterId, feedback) => {
        const { contentItems } = get();
        const content = contentItems.find((item) => item.id === contentId);
        if (!content) return;

        get().updateContent(contentId, {
          status: 'revision-requested' as ApprovalStatus
        });

        // Add action
        const action: ApprovalAction = {
          id: generateId(),
          contentId,
          actionType: 'status_change',
          fromStatus: content.status,
          toStatus: 'revision-requested',
          performedBy: requesterId,
          performedAt: new Date(),
          details: `Revision requested: ${feedback}`
        };

        // Add feedback comment
        const comment: ApprovalComment = {
          id: generateId(),
          contentId,
          parentCommentId: undefined,
          author: {
            id: requesterId,
            name: 'Requester',
            email: 'requester@company.com',
            role: 'client'
          },
          message: feedback,
          mentions: [],
          isResolved: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        get().updateContent(contentId, {
          actions: [...content.actions, action],
          comments: [...content.comments, comment],
          totalComments: (content.totalComments || 0) + 1,
          unresolvedComments: (content.unresolvedComments || 0) + 1
        });
      },

      advanceToNextStage: (contentId) => {
        const statusProgression: ApprovalStatus[] = [
          'draft',
          'pending', 
          'in-review',
          'approved',
          'published'
        ];

        const { contentItems } = get();
        const content = contentItems.find((item) => item.id === contentId);
        if (!content) return;

        const currentIndex = statusProgression.indexOf(content.status);
        if (currentIndex >= 0 && currentIndex < statusProgression.length - 1) {
          const nextStatus = statusProgression[currentIndex + 1];
          get().updateContent(contentId, { status: nextStatus });
        }
      },

      assignApprovers: (contentId, approverIds) => {
        get().updateContent(contentId, {
          assignedTo: approverIds
        });

        // Add action
        const action: ApprovalAction = {
          id: generateId(),
          contentId,
          actionType: 'status_change',
          performedBy: 'current-user',
          performedAt: new Date(),
          details: `Assigned to: ${approverIds.join(', ')}`
        };

        const { contentItems } = get();
        const content = contentItems.find((item) => item.id === contentId);
        if (content) {
          get().updateContent(contentId, {
            actions: [...content.actions, action]
          });
        }
      },

      // Comments system
      addComment: (contentId, commentData) => {
        const { contentItems } = get();
        const content = contentItems.find((item) => item.id === contentId);
        if (!content) return;

        const comment: ApprovalComment = {
          id: generateId(),
          contentId,
          status: 'active',
          ...commentData,
          createdAt: new Date(),
        };

        get().updateContent(contentId, {
          comments: [...content.comments, comment],
          totalComments: content.totalComments + 1,
          unresolvedComments: content.unresolvedComments + 1
        });
      },

      updateComment: (commentId, updates) => {
        const { contentItems } = get();
        
        set((state) => ({
          contentItems: state.contentItems.map((item) => ({
            ...item,
            comments: item.comments.map((comment) =>
              comment.id === commentId
                ? { ...comment, ...updates, editedAt: new Date() }
                : comment
            )
          }))
        }));
      },

      deleteComment: (commentId) => {
        set((state) => ({
          contentItems: state.contentItems.map((item) => ({
            ...item,
            comments: item.comments.filter((comment) => comment.id !== commentId),
            totalComments: Math.max(0, item.totalComments - 1),
            unresolvedComments: Math.max(0, item.unresolvedComments - 1)
          }))
        }));
      },

      resolveComment: (contentId, commentId) => {
        const { contentItems } = get();
        
        set((state) => ({
          contentItems: state.contentItems.map((item) => ({
            ...item,
            comments: item.comments.map((comment) =>
              comment.id === commentId
                ? { ...comment, status: 'resolved', editedAt: new Date() }
                : comment
            ),
            unresolvedComments: item.id === contentId
              ? Math.max(0, item.unresolvedComments - 1)
              : item.unresolvedComments
          }))
        }));
      },

      addReaction: (commentId, emoji, userId) => {
        set((state) => ({
          contentItems: state.contentItems.map((item) => ({
            ...item,
            comments: item.comments.map((comment) => {
              if (comment.id === commentId) {
                const reactions = comment.reactions || [];
                const existingReaction = reactions.find(r => r.emoji === emoji);
                
                if (existingReaction) {
                  if (!existingReaction.users.includes(userId)) {
                    existingReaction.users.push(userId);
                  }
                } else {
                  reactions.push({ emoji, users: [userId] });
                }
                
                return { ...comment, reactions };
              }
              return comment;
            })
          }))
        }));
      },

      removeReaction: (commentId, emoji, userId) => {
        set((state) => ({
          contentItems: state.contentItems.map((item) => ({
            ...item,
            comments: item.comments.map((comment) => {
              if (comment.id === commentId && comment.reactions) {
                const reactions = comment.reactions
                  .map(r => r.emoji === emoji 
                    ? { ...r, users: r.users.filter(u => u !== userId) }
                    : r
                  )
                  .filter(r => r.users.length > 0);
                
                return { ...comment, reactions };
              }
              return comment;
            })
          }))
        }));
      },

      // Client review links
      generateReviewLink: (contentId, clientId, settings = {}) => {
        const { contentItems } = get();
        const content = contentItems.find((item) => item.id === contentId);
        if (!content) return '';

        const token = generateToken();
        const url = generateShareUrl(token);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (get().settings.linkExpirationDays || 7));

        const reviewLink: ClientReviewLink = {
          id: generateId(),
          contentId,
          clientId,
          token,
          url,
          isActive: true,
          expiresAt,
          accessCount: 0,
          createdAt: new Date(),
          settings: {
            allowComments: true,
            allowDownload: false,
            requirePassword: false,
            notifyOnAccess: true,
            ...settings
          }
        };

        get().updateContent(contentId, {
          reviewLinks: [...content.reviewLinks, reviewLink]
        });

        return url;
      },

      updateReviewLink: (linkId, updates) => {
        set((state) => ({
          contentItems: state.contentItems.map((item) => ({
            ...item,
            reviewLinks: item.reviewLinks.map((link) =>
              link.id === linkId ? { ...link, ...updates } : link
            )
          }))
        }));
      },

      deactivateReviewLink: (linkId) => {
        get().updateReviewLink(linkId, { isActive: false });
      },

      trackLinkAccess: (linkId) => {
        set((state) => ({
          contentItems: state.contentItems.map((item) => ({
            ...item,
            reviewLinks: item.reviewLinks.map((link) =>
              link.id === linkId 
                ? { 
                    ...link, 
                    accessCount: link.accessCount + 1, 
                    lastAccessedAt: new Date() 
                  }
                : link
            )
          }))
        }));
      },

      // Search and filtering
      setFilters: (filters) => set({ filters }),
      
      clearFilters: () => set({ filters: {} }),

      searchContent: (query) => {
        const { contentItems } = get();
        if (!query.trim()) return contentItems;

        const searchTerm = query.toLowerCase();
        return contentItems.filter((item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          item.versions.some(version => 
            version.content.body.toLowerCase().includes(searchTerm) ||
            version.content.title?.toLowerCase().includes(searchTerm)
          )
        );
      },

      getContentByStatus: (status) => {
        const { contentItems } = get();
        return contentItems.filter((item) => item.status === status);
      },

      getOverdueContent: () => {
        const { contentItems } = get();
        const now = new Date();
        return contentItems.filter((item) => 
          item.dueDate && item.dueDate < now && !['approved', 'published'].includes(item.status)
        );
      },

      getContentByUser: (userId, role) => {
        const { contentItems } = get();
        return contentItems.filter((item) => {
          switch (role) {
            case 'assigned':
              return item.assignedTo.includes(userId);
            case 'created':
              return item.createdBy === userId;
            case 'approved':
              return item.approvedBy.includes(userId);
            default:
              return false;
          }
        });
      },

      // View management
      setView: (view) => set({ currentView: view }),
      
      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

      setSelectedItems: (ids) => set({ selectedItems: ids }),

      toggleItemSelection: (id) => {
        const { selectedItems } = get();
        if (selectedItems.includes(id)) {
          set({ selectedItems: selectedItems.filter((item) => item !== id) });
        } else {
          set({ selectedItems: [...selectedItems, id] });
        }
      },

      selectAll: (filtered = false) => {
        const { contentItems, filters } = get();
        let items = contentItems;
        
        if (filtered && Object.keys(filters).length > 0) {
          // Apply filters logic here
          items = get().searchContent(filters.searchQuery || '');
        }
        
        set({ selectedItems: items.map(item => item.id) });
      },

      clearSelection: () => set({ selectedItems: [] }),

      // Analytics
      refreshStats: () => {
        const { contentItems } = get();
        
        const stats: ContentApprovalStats = {
          totalContent: contentItems.length,
          byStatus: contentItems.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
          }, {} as Record<ApprovalStatus, number>),
          byContentType: contentItems.reduce((acc, item) => {
            acc[item.contentType] = (acc[item.contentType] || 0) + 1;
            return acc;
          }, {} as Record<ContentType, number>),
          byPlatform: contentItems.reduce((acc, item) => {
            acc[item.platform] = (acc[item.platform] || 0) + 1;
            return acc;
          }, {} as Record<PlatformType, number>),
          averageApprovalTime: 24, // Mock calculation
          overdueItems: get().getOverdueContent().length,
          pendingApprovals: contentItems.filter(item => 
            ['pending', 'in-review'].includes(item.status)
          ).length,
          approvalRate: contentItems.length > 0 
            ? (contentItems.filter(item => item.status === 'approved').length / contentItems.length) * 100
            : 0,
          topPerformers: [],
          recentActivity: contentItems
            .flatMap(item => item.actions)
            .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
            .slice(0, 10),
          upcomingDeadlines: contentItems
            .filter(item => item.dueDate && item.dueDate > new Date())
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 5),
          clientSatisfactionScore: 85, // Mock score
          bottlenecks: []
        };

        set({ stats });
      },

      getApprovalTimeAnalytics: (clientId) => {
        // Mock implementation
        return {
          averageTime: 36,
          medianTime: 24,
          bottlenecks: [
            { stage: 'Client Review', averageTime: 48 },
            { stage: 'Internal Review', averageTime: 12 }
          ]
        };
      },

      getPerformanceMetrics: (userId) => {
        // Mock implementation
        return {
          approvalsCompleted: 45,
          averageResponseTime: 6,
          approvalRate: 92
        };
      },

      exportReport: (filters, format) => {
        // Mock implementation - would generate actual report
        console.log('Exporting report with filters:', filters, 'in format:', format);
        return 'report-url';
      },

      // Bulk operations
      bulkApprove: (contentIds, approverId) => {
        contentIds.forEach(id => {
          get().approveContent(id, approverId, 'Bulk approval');
        });
      },

      bulkReject: (contentIds, rejectorId, reason) => {
        contentIds.forEach(id => {
          get().rejectContent(id, rejectorId, reason);
        });
      },

      bulkAssign: (contentIds, approverIds) => {
        contentIds.forEach(id => {
          get().assignApprovers(id, approverIds);
        });
      },

      bulkSchedule: (contentIds, scheduleDate) => {
        contentIds.forEach(id => {
          get().updateContent(id, { scheduledPublishDate: scheduleDate });
        });
      },

      // Smart features
      suggestApprovers: (contentId) => {
        // Mock implementation - would use AI/ML
        return ['user1', 'user2', 'user3'];
      },

      predictApprovalTime: (contentId) => {
        // Mock implementation - would use historical data
        return 24; // hours
      },

      detectBottlenecks: () => {
        // Mock implementation
        return [
          {
            stage: 'Client Review',
            contentIds: ['content1', 'content2'],
            averageDelay: 36
          }
        ];
      },

      autoEscalate: () => {
        // Mock implementation - would escalate overdue items
        console.log('Auto-escalating overdue items');
      },

      // Notifications
      addNotification: (notificationData) => {
        const notification: ApprovalNotification = {
          id: generateId(),
          ...notificationData,
          createdAt: new Date()
        };

        set((state) => ({
          notifications: [...state.notifications, notification]
        }));
      },

      markNotificationRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        }));
      },

      markAllNotificationsRead: (userId) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.userId === userId
              ? { ...notification, isRead: true }
              : notification
          )
        }));
      },

      sendReminders: (contentIds) => {
        const { contentItems } = get();
        const itemsToRemind = contentIds 
          ? contentItems.filter(item => contentIds.includes(item.id))
          : get().getOverdueContent();

        itemsToRemind.forEach(item => {
          get().updateContent(item.id, {
            remindersSent: item.remindersSent + 1,
            lastReminderAt: new Date()
          });

          // Create reminder notification
          get().addNotification({
            userId: item.createdBy,
            contentId: item.id,
            type: 'deadline_reminder',
            title: 'Content Approval Overdue',
            message: `"${item.title}" requires attention`,
            actionUrl: `/content-approval/${item.id}`,
            isRead: false,
            isSent: false,
            channels: ['email', 'in_app']
          });
        });
      },

      // Workflows
      createWorkflow: (workflowData) => {
        const workflow: ApprovalWorkflow = {
          id: generateId(),
          ...workflowData,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        set((state) => ({
          workflows: [...state.workflows, workflow]
        }));
      },

      updateWorkflow: (workflowId, updates) => {
        set((state) => ({
          workflows: state.workflows.map(workflow =>
            workflow.id === workflowId
              ? { ...workflow, ...updates, updatedAt: new Date() }
              : workflow
          )
        }));
      },

      deleteWorkflow: (workflowId) => {
        set((state) => ({
          workflows: state.workflows.filter(workflow => workflow.id !== workflowId)
        }));
      },

      setDefaultWorkflow: (workflowId, clientId) => {
        set((state) => ({
          workflows: state.workflows.map(workflow =>
            workflow.clientId === clientId
              ? { ...workflow, isDefault: workflow.id === workflowId }
              : workflow
          )
        }));
      },

      applyWorkflow: (contentId, workflowId) => {
        const { workflows } = get();
        const workflow = workflows.find(w => w.id === workflowId);
        if (!workflow) return;

        // Apply workflow stages to content
        const firstStage = workflow.stages.find(stage => stage.order === 0);
        if (firstStage) {
          get().updateContent(contentId, {
            status: firstStage.status,
            assignedTo: firstStage.approvers
          });
        }
      },

      // State management
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),

      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings }
        }));
      },

      // Sample data initialization
      initializeSampleData: () => {
        // Initialize workflows first
        DEFAULT_WORKFLOWS.forEach(workflowTemplate => {
          get().createWorkflow({
            ...workflowTemplate,
            clientId: 'client-1'
          });
        });

        // Create sample content items
        const sampleContent = [
          {
            title: 'Summer Sale Campaign - Instagram Post',
            description: 'Promotional post for summer sale featuring new product line',
            contentType: 'social-post' as ContentType,
            platform: 'instagram' as PlatformType,
            status: 'in-review' as ApprovalStatus,
            priority: 'high' as Priority,
            clientId: 'client-1',
            assignedTo: ['client-manager', 'creative-director'],
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            tags: ['summer', 'sale', 'promotion'],
            createdBy: 'sarah.wilson'
          },
          {
            title: 'Product Launch Press Release',
            description: 'Official announcement for new product launch',
            contentType: 'press-release' as ContentType,
            platform: 'website' as PlatformType,
            status: 'pending' as ApprovalStatus,
            priority: 'urgent' as Priority,
            clientId: 'client-1',
            assignedTo: ['legal-counsel', 'client-director'],
            dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day overdue
            tags: ['product-launch', 'press', 'announcement'],
            createdBy: 'mike.johnson'
          },
          {
            title: 'Newsletter - Q3 Updates',
            description: 'Quarterly newsletter with company updates and achievements',
            contentType: 'newsletter' as ContentType,
            platform: 'email' as PlatformType,
            status: 'approved' as ApprovalStatus,
            priority: 'medium' as Priority,
            clientId: 'client-1',
            approvedBy: ['client-manager'],
            scheduledPublishDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            tags: ['newsletter', 'updates', 'quarterly'],
            createdBy: 'emma.davis'
          },
          {
            title: 'Facebook Ad - Target Audience A',
            description: 'Targeted advertisement for demographic segment A',
            contentType: 'advertisement' as ContentType,
            platform: 'facebook' as PlatformType,
            status: 'revision-requested' as ApprovalStatus,
            priority: 'high' as Priority,
            clientId: 'client-1',
            assignedTo: ['creative-director'],
            tags: ['facebook', 'ad', 'targeted'],
            createdBy: 'alex.brown'
          },
          {
            title: 'Blog Post - Industry Trends 2024',
            description: 'Thought leadership article on emerging industry trends',
            contentType: 'blog-article' as ContentType,
            platform: 'website' as PlatformType,
            status: 'draft' as ApprovalStatus,
            priority: 'medium' as Priority,
            clientId: 'client-1',
            tags: ['blog', 'trends', 'thought-leadership'],
            createdBy: 'john.smith'
          }
        ];

        sampleContent.forEach(contentData => {
          const contentId = get().addContent({
            ...contentData,
            versions: [{
              id: generateId(),
              versionNumber: 1,
              content: {
                title: contentData.title,
                body: 'Sample content body with engaging copy that captures audience attention...',
                hashtags: contentData.platform === 'instagram' ? ['#summer', '#sale', '#newcollection'] : [],
                mediaUrls: ['https://example.com/sample-image.jpg'],
                scheduledDate: contentData.scheduledPublishDate
              },
              changes: ['Initial version created'],
              createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
              createdBy: contentData.createdBy
            }]
          });

          // Add some sample comments
          if (contentData.status === 'revision-requested') {
            get().addComment(contentId, {
              author: {
                id: 'client-manager',
                name: 'Client Manager',
                email: 'client@company.com',
                role: 'client'
              },
              message: 'Please adjust the call-to-action text to be more compelling. Also, can we try a different color scheme?',
              mentions: [contentData.createdBy],
              isResolved: false
            });
          }
        });

        get().refreshStats();
      }
    }),
    {
      name: 'content-approval-storage',
      partialize: (state) => ({
        contentItems: state.contentItems,
        workflows: state.workflows,
        notifications: state.notifications,
        settings: state.settings,
        filters: state.filters,
        currentView: state.currentView,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      })
    }
  )
);