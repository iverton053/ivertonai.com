import express from 'express';
import Joi from 'joi';
import { ContentApprovalService } from '../services/contentApprovalService';
import { AuthRequest } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorMiddleware';
import RateLimitService from '../middleware/rateLimitMiddleware';
import { logger } from '../utils/logger';
import { websocketService } from '../services/websocketService';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const contentApprovalService = ContentApprovalService.getInstance();
const rateLimitService = RateLimitService.getInstance();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/content-approval/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, documents, and design files
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.adobe.photoshop', 'application/postscript', 'image/vnd.adobe.photoshop'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  }
});

// Apply rate limiting
router.use(rateLimitService.createAPIRateLimit());

// Validation schemas
const createContentSchema = Joi.object({
  clientId: Joi.string().required().length(24),
  campaignId: Joi.string().length(24),
  title: Joi.string().required().trim().max(200),
  description: Joi.string().trim().max(1000),
  contentType: Joi.string().required().valid(
    'social-post', 'blog-article', 'email-campaign', 'video-script',
    'advertisement', 'press-release', 'newsletter', 'landing-page',
    'product-description', 'marketing-copy'
  ),
  platform: Joi.string().required().valid(
    'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok',
    'youtube', 'website', 'email', 'print', 'other'
  ),
  status: Joi.string().valid(
    'draft', 'pending', 'in-review', 'revision-requested',
    'approved', 'rejected', 'published', 'scheduled'
  ).default('draft'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  content: Joi.object({
    title: Joi.string().trim(),
    body: Joi.string().required(),
    caption: Joi.string().trim(),
    hashtags: Joi.array().items(Joi.string()),
    callToAction: Joi.string().trim(),
    mediaUrls: Joi.array().items(Joi.string().uri()),
    scheduledDate: Joi.date()
  }).required(),
  workflowId: Joi.string().length(24),
  assignedTo: Joi.array().items(Joi.string().length(24)),
  dueDate: Joi.date(),
  scheduledPublishDate: Joi.date(),
  tags: Joi.array().items(Joi.string()),
  brand: Joi.string().trim(),
  targetAudience: Joi.string().trim(),
  objectives: Joi.array().items(Joi.string()),
  businessValue: Joi.object({
    expectedReach: Joi.number().min(0),
    expectedEngagement: Joi.number().min(0),
    estimatedRevenue: Joi.number().min(0)
  })
});

const updateContentSchema = Joi.object({
  title: Joi.string().trim().max(200),
  description: Joi.string().trim().max(1000),
  status: Joi.string().valid(
    'draft', 'pending', 'in-review', 'revision-requested',
    'approved', 'rejected', 'published', 'scheduled'
  ),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  content: Joi.object({
    title: Joi.string().trim(),
    body: Joi.string(),
    caption: Joi.string().trim(),
    hashtags: Joi.array().items(Joi.string()),
    callToAction: Joi.string().trim(),
    mediaUrls: Joi.array().items(Joi.string().uri()),
    scheduledDate: Joi.date()
  }),
  assignedTo: Joi.array().items(Joi.string().length(24)),
  dueDate: Joi.date().allow(null),
  scheduledPublishDate: Joi.date().allow(null),
  tags: Joi.array().items(Joi.string()),
  brand: Joi.string().trim(),
  targetAudience: Joi.string().trim(),
  objectives: Joi.array().items(Joi.string()),
  businessValue: Joi.object({
    expectedReach: Joi.number().min(0),
    expectedEngagement: Joi.number().min(0),
    estimatedRevenue: Joi.number().min(0)
  }),
  versionNotes: Joi.string().trim()
});

const commentSchema = Joi.object({
  text: Joi.string().required().trim().max(5000),
  type: Joi.string().valid('general', 'approval', 'revision', 'question').default('general'),
  parentId: Joi.string().length(24),
  mentions: Joi.array().items(Joi.string().length(24)),
  attachments: Joi.array().items(Joi.string()),
  isPinned: Joi.boolean().default(false)
});

const bulkUpdateSchema = Joi.object({
  contentIds: Joi.array().items(Joi.string().length(24)).min(1).max(100).required(),
  status: Joi.string().required().valid(
    'draft', 'pending', 'in-review', 'revision-requested',
    'approved', 'rejected', 'published', 'scheduled'
  )
});

const reviewLinkSchema = Joi.object({
  clientId: Joi.string().required().length(24),
  expirationDays: Joi.number().min(1).max(30).default(7),
  allowComments: Joi.boolean().default(true),
  allowDownload: Joi.boolean().default(false),
  requirePassword: Joi.boolean().default(false),
  password: Joi.string().min(4).max(20),
  notifyOnAccess: Joi.boolean().default(true),
  showAnalytics: Joi.boolean().default(false),
  customBranding: Joi.boolean().default(false)
});

// ============= CONTENT MANAGEMENT ROUTES =============

// POST /api/content-approval - Create new content
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = createContentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  const content = await contentApprovalService.createContent(req.userId!, value);

  // Emit real-time notification
  websocketService.emitContentCreated(req.userId!, content);

  logger.info(`Content created by user ${req.userId}: ${content._id}`);

  res.status(201).json({
    success: true,
    data: content
  });
}));

// GET /api/content-approval - Get content list with filtering
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
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
    search,
    dateRange,
    overdue,
    tags
  } = req.query;

  const filters: any = {};

  if (clientId) filters.clientId = clientId;
  if (status) filters.status = Array.isArray(status) ? status : [status];
  if (contentType) filters.contentType = Array.isArray(contentType) ? contentType : [contentType];
  if (priority) filters.priority = Array.isArray(priority) ? priority : [priority];
  if (assignedTo) filters.assignedTo = assignedTo;
  if (search) filters.search = search;
  if (overdue === 'true') filters.overdue = true;
  if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];

  if (dateRange) {
    try {
      const range = JSON.parse(dateRange as string);
      filters.dateRange = range;
    } catch (error) {
      // Ignore invalid date range
    }
  }

  const options = {
    page: parseInt(page as string),
    limit: Math.min(parseInt(limit as string), 100),
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc'
  };

  const result = await contentApprovalService.getContentList(req.userId!, filters, options);

  res.json({
    success: true,
    data: result.contents,
    pagination: {
      page: options.page,
      limit: options.limit,
      total: result.total,
      hasMore: result.hasMore
    }
  });
}));

// GET /api/content-approval/:id - Get specific content
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid content ID format'
    });
  }

  const content = await contentApprovalService.getContent(req.userId!, id);

  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Content not found'
    });
  }

  res.json({
    success: true,
    data: content
  });
}));

// PUT /api/content-approval/:id - Update content
router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = updateContentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  const content = await contentApprovalService.updateContent(req.userId!, id, value);

  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Content not found'
    });
  }

  // Emit real-time notification
  websocketService.emitContentUpdated(req.userId!, id, content);

  res.json({
    success: true,
    data: content
  });
}));

// DELETE /api/content-approval/:id - Delete content
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { permanent = false } = req.query;

  const success = await contentApprovalService.deleteContent(
    req.userId!,
    id,
    permanent === 'true'
  );

  if (!success) {
    return res.status(404).json({
      success: false,
      error: 'Content not found'
    });
  }

  // Emit real-time notification
  websocketService.emitContentDeleted(req.userId!, id);

  res.json({
    success: true,
    message: `Content ${permanent ? 'permanently ' : ''}deleted successfully`
  });
}));

// ============= VERSION MANAGEMENT ROUTES =============

// POST /api/content-approval/:id/versions - Create new version
router.post('/:id/versions', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { content, notes } = req.body;

  if (!content || !content.body) {
    return res.status(400).json({
      success: false,
      error: 'Content body is required'
    });
  }

  const updatedContent = await contentApprovalService.createNewVersion(
    req.userId!,
    id,
    content,
    notes
  );

  if (!updatedContent) {
    return res.status(404).json({
      success: false,
      error: 'Content not found'
    });
  }

  // Emit real-time notification
  websocketService.emitContentUpdated(req.userId!, id, updatedContent);

  res.json({
    success: true,
    data: updatedContent
  });
}));

// PUT /api/content-approval/:id/versions/:versionId/revert - Revert to version
router.put('/:id/versions/:versionId/revert', asyncHandler(async (req: AuthRequest, res) => {
  const { id, versionId } = req.params;

  const content = await contentApprovalService.revertToVersion(req.userId!, id, versionId);

  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Content or version not found'
    });
  }

  // Emit real-time notification
  websocketService.emitContentUpdated(req.userId!, id, content);

  res.json({
    success: true,
    data: content
  });
}));

// ============= APPROVAL WORKFLOW ROUTES =============

// POST /api/content-approval/:id/approve - Approve content
router.post('/:id/approve', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { comments, nextStage = true } = req.body;

  const content = await contentApprovalService.approveContent(
    req.userId!,
    id,
    comments,
    nextStage
  );

  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Content not found'
    });
  }

  // Emit real-time notification
  websocketService.emitContentApproved(req.userId!, id, content);

  res.json({
    success: true,
    data: content,
    message: 'Content approved successfully'
  });
}));

// POST /api/content-approval/:id/reject - Reject content
router.post('/:id/reject', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Rejection reason is required'
    });
  }

  const content = await contentApprovalService.rejectContent(req.userId!, id, reason);

  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Content not found'
    });
  }

  // Emit real-time notification
  websocketService.emitContentRejected(req.userId!, id, content, reason);

  res.json({
    success: true,
    data: content,
    message: 'Content rejected'
  });
}));

// POST /api/content-approval/:id/request-revision - Request revision
router.post('/:id/request-revision', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { feedback } = req.body;

  if (!feedback || feedback.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Revision feedback is required'
    });
  }

  const content = await contentApprovalService.requestRevision(req.userId!, id, feedback);

  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Content not found'
    });
  }

  // Emit real-time notification
  websocketService.emitRevisionRequested(req.userId!, id, content, feedback);

  res.json({
    success: true,
    data: content,
    message: 'Revision requested'
  });
}));

// ============= COMMENTS ROUTES =============

// POST /api/content-approval/:id/comments - Add comment
router.post('/:id/comments', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = commentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  const content = await contentApprovalService.addComment(req.userId!, id, value);

  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Content not found'
    });
  }

  // Emit real-time notification
  websocketService.emitCommentAdded(req.userId!, id, content);

  res.json({
    success: true,
    data: content,
    message: 'Comment added successfully'
  });
}));

// ============= CLIENT REVIEW LINKS =============

// POST /api/content-approval/:id/review-links - Generate review link
router.post('/:id/review-links', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { error, value } = reviewLinkSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  const { clientId, ...settings } = value;
  const reviewUrl = await contentApprovalService.generateReviewLink(
    req.userId!,
    id,
    clientId,
    settings
  );

  res.json({
    success: true,
    data: {
      url: reviewUrl,
      expiresAt: new Date(Date.now() + (settings.expirationDays || 7) * 24 * 60 * 60 * 1000)
    },
    message: 'Review link generated successfully'
  });
}));

// GET /api/content-approval/review/:token - Access review link (public route)
router.get('/review/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  const result = await contentApprovalService.accessReviewLink(token);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: 'Review link not found or expired'
    });
  }

  res.json({
    success: true,
    data: {
      content: result.content,
      linkSettings: result.link
    }
  });
}));

// ============= BULK OPERATIONS =============

// POST /api/content-approval/bulk/update-status - Bulk update status
router.post('/bulk/update-status',
  rateLimitService.createBulkOperationRateLimit(),
  asyncHandler(async (req: AuthRequest, res) => {
    const { error, value } = bulkUpdateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const results = await contentApprovalService.bulkUpdateStatus(
      req.userId!,
      value.contentIds,
      value.status
    );

    // Emit real-time progress notification
    websocketService.emitBulkOperationCompleted(req.userId!, 'bulk-update-status', results);

    res.json({
      success: true,
      data: results,
      message: `Bulk update completed: ${results.updated} updated, ${results.failed} failed`
    });
  })
);

// ============= ANALYTICS ROUTES =============

// GET /api/content-approval/stats - Get approval statistics
router.get('/stats', asyncHandler(async (req: AuthRequest, res) => {
  const { clientId } = req.query;

  const stats = await contentApprovalService.getApprovalStats(
    clientId ? clientId as string : undefined
  );

  res.json({
    success: true,
    data: stats
  });
}));

// ============= FILE UPLOAD ROUTES =============

// POST /api/content-approval/upload - Upload files for content
router.post('/upload',
  upload.array('files', 10),
  asyncHandler(async (req: AuthRequest, res) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const fileUrls = files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      url: `/uploads/content-approval/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    logger.info(`${files.length} files uploaded by user ${req.userId}`);

    res.json({
      success: true,
      data: fileUrls,
      message: `${files.length} files uploaded successfully`
    });
  })
);

// ============= HEALTH CHECK =============

// GET /api/content-approval/health - Health check
router.get('/health', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    service: 'Content Approval API',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
}));

export default router;