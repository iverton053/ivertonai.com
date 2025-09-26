import express from 'express';
import Joi from 'joi';
import { CRMService } from '../services/crmService';
import { AuthRequest, requireSubscription } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorMiddleware';
import RateLimitService from '../middleware/rateLimitMiddleware';
import { logger } from '../utils/logger';
import { websocketService } from '../services/websocketService';

const router = express.Router();
const crmService = CRMService.getInstance();
const rateLimitService = RateLimitService.getInstance();

// Apply general API rate limiting to all CRM routes
router.use(rateLimitService.createAPIRateLimit());

// Validation schemas
const createContactSchema = Joi.object({
  firstName: Joi.string().required().trim().max(100),
  lastName: Joi.string().required().trim().max(100),
  email: Joi.string().required().email().lowercase(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/),
  company: Joi.string().trim().max(200),
  jobTitle: Joi.string().trim().max(150),
  address: Joi.object({
    street: Joi.string().trim(),
    city: Joi.string().trim(),
    state: Joi.string().trim(),
    country: Joi.string().trim(),
    zipCode: Joi.string().trim()
  }),
  socialProfiles: Joi.object({
    linkedin: Joi.string().uri(),
    twitter: Joi.string().uri(),
    facebook: Joi.string().uri(),
    instagram: Joi.string().uri()
  }),
  contactOwner: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  lifecycleStage: Joi.string().valid('subscriber', 'lead', 'marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer', 'evangelist', 'other'),
  leadStatus: Joi.string().valid('new', 'open', 'in_progress', 'open_deal', 'unqualified', 'attempted_to_contact', 'connected', 'bad_timing'),
  tags: Joi.array().items(Joi.string()),
  originalSource: Joi.string().default('manual'),
  sourceDetails: Joi.object({
    campaign: Joi.string(),
    medium: Joi.string(),
    referrer: Joi.string(),
    utm_source: Joi.string(),
    utm_medium: Joi.string(),
    utm_campaign: Joi.string(),
    utm_term: Joi.string(),
    utm_content: Joi.string()
  }),
  customFields: Joi.object().pattern(Joi.string(), Joi.any()),
  preferences: Joi.object({
    emailOptIn: Joi.boolean(),
    phoneOptIn: Joi.boolean(),
    smsOptIn: Joi.boolean(),
    communicationFrequency: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly'),
    preferredContactMethod: Joi.string().valid('email', 'phone', 'sms', 'social')
  })
});

const updateContactSchema = createContactSchema.fork(['firstName', 'lastName', 'email'], (schema) => schema.optional());

const searchContactsSchema = Joi.object({
  query: Joi.string().trim(),
  leadStatus: Joi.string(),
  lifecycleStage: Joi.string(),
  contactOwner: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  company: Joi.string(),
  tags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  leadScoreMin: Joi.number().min(0).max(100),
  leadScoreMax: Joi.number().min(0).max(100),
  source: Joi.string(),
  sortBy: Joi.string().default('updatedAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  limit: Joi.number().min(1).max(100).default(50),
  offset: Joi.number().min(0).default(0)
});

const addActivitySchema = Joi.object({
  type: Joi.string().required().valid('email', 'call', 'meeting', 'note', 'task', 'deal', 'property_change'),
  subject: Joi.string().trim().max(200),
  content: Joi.string().required().trim().max(2000),
  metadata: Joi.object()
});

// GET /api/crm/contacts - Search and list contacts
router.get('/contacts', rateLimitService.createSearchRateLimit(), asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = searchContactsSchema.validate(req.query);
  
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

  // Process tags parameter
  if (value.tags && typeof value.tags === 'string') {
    value.tags = value.tags.split(',').map((tag: string) => tag.trim());
  }

  const { query, tags, leadScoreMin, leadScoreMax, ...otherFilters } = value;
  
  const options = {
    query,
    filters: {
      ...otherFilters,
      ...(tags && { tags }),
      ...(leadScoreMin !== undefined && { leadScoreMin }),
      ...(leadScoreMax !== undefined && { leadScoreMax })
    },
    sortBy: value.sortBy,
    sortOrder: value.sortOrder,
    limit: value.limit,
    offset: value.offset
  };

  const result = await crmService.getContacts(req.userId!, options);
  
  res.json({
    success: true,
    data: result
  });
}));

// GET /api/crm/contacts/:id - Get single contact
router.get('/contacts/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid contact ID format'
    });
  }

  const contact = await crmService.getContactById(req.userId!, id);
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contact not found'
    });
  }
  
  res.json({
    success: true,
    data: contact
  });
}));

// POST /api/crm/contacts - Create new contact
router.post('/contacts', asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = createContactSchema.validate(req.body);
  
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

  const contact = await crmService.createContact(req.userId!, value);
  
  logger.info(`Contact created by user ${req.userId}: ${contact._id}`);
  
  res.status(201).json({
    success: true,
    data: contact
  });
}));

// PUT /api/crm/contacts/:id - Update contact
router.put('/contacts/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid contact ID format'
    });
  }

  const { error, value } = updateContactSchema.validate(req.body);
  
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

  const contact = await crmService.updateContact(req.userId!, id, value);
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contact not found'
    });
  }
  
  logger.info(`Contact updated by user ${req.userId}: ${id}`);
  
  res.json({
    success: true,
    data: contact
  });
}));

// DELETE /api/crm/contacts/:id - Delete contact
router.delete('/contacts/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid contact ID format'
    });
  }

  const success = await crmService.deleteContact(req.userId!, id);
  
  if (!success) {
    return res.status(404).json({
      success: false,
      error: 'Contact not found'
    });
  }
  
  logger.info(`Contact deleted by user ${req.userId}: ${id}`);
  
  res.json({
    success: true,
    message: 'Contact deleted successfully'
  });
}));

// POST /api/crm/contacts/:id/activities - Add activity to contact
router.post('/contacts/:id/activities', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid contact ID format'
    });
  }

  const { error, value } = addActivitySchema.validate(req.body);
  
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

  const contact = await crmService.addActivity(req.userId!, id, value);
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Contact not found'
    });
  }
  
  logger.info(`Activity added to contact by user ${req.userId}: ${id}`);
  
  res.json({
    success: true,
    data: contact
  });
}));

// POST /api/crm/contacts/:primaryId/merge/:secondaryId - Merge contacts
router.post('/contacts/:primaryId/merge/:secondaryId', 
  requireSubscription(['pro', 'enterprise']),
  asyncHandler(async (req: AuthRequest, res) => {
    const { primaryId, secondaryId } = req.params;
    
    if (!primaryId.match(/^[0-9a-fA-F]{24}$/) || !secondaryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact ID format'
      });
    }

    const contact = await crmService.mergeContacts(req.userId!, primaryId, secondaryId);
    
    logger.info(`Contacts merged by user ${req.userId}: ${secondaryId} into ${primaryId}`);
    
    res.json({
      success: true,
      data: contact
    });
  })
);

// GET /api/crm/analytics - Get CRM analytics
router.get('/analytics', asyncHandler(async (req: AuthRequest, res) => {
  const analytics = await crmService.getContactAnalytics(req.userId!);
  
  res.json({
    success: true,
    data: analytics
  });
}));

// GET /api/crm/contacts/export - Export contacts (CSV)
router.get('/contacts/export', rateLimitService.createExportRateLimit(), asyncHandler(async (req: AuthRequest, res) => {
  const { format = 'csv' } = req.query;
  
  const contacts = await crmService.getContacts(req.userId!, { limit: 10000 });
  
  if (format === 'csv') {
    const csv = convertToCSV(contacts.contacts);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csv);
  } else {
    res.json({
      success: true,
      data: contacts
    });
  }
}));

// Bulk operations validation schema
const bulkOperationSchema = Joi.object({
  operation: Joi.string().required().valid('update', 'delete', 'merge', 'tag', 'untag', 'assign'),
  contactIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).max(1000).required(),
  data: Joi.object().when('operation', {
    is: 'update',
    then: Joi.object({
      lifecycleStage: Joi.string(),
      leadStatus: Joi.string(),
      contactOwner: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      tags: Joi.array().items(Joi.string()),
      customFields: Joi.object()
    }),
    otherwise: Joi.object()
  }),
  tags: Joi.array().items(Joi.string()).when('operation', {
    is: Joi.alternatives().try('tag', 'untag'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  assignTo: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).when('operation', {
    is: 'assign',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  primaryContactId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).when('operation', {
    is: 'merge',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  permanent: Joi.boolean().when('operation', {
    is: 'delete',
    then: Joi.optional(),
    otherwise: Joi.optional()
  })
});

// POST /api/crm/contacts/bulk - Bulk operations on contacts
router.post('/contacts/bulk', rateLimitService.createBulkOperationRateLimit(), asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = bulkOperationSchema.validate(req.body);

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

  const { operation, contactIds, data, tags, assignTo, primaryContactId, permanent } = value;

  try {
    let results: any = {};

    // Generate operation ID for WebSocket tracking
    const operationId = `bulk_${Date.now()}_${req.userId}`;

    // Get WebSocket service for progress updates
    const WebSocketService = require('../services/websocketService').default;
    const wsService = WebSocketService.getInstance();

    // Emit operation start
    if (wsService) {
      wsService.emitBulkOperationProgress(req.userId!, operationId, {
        status: 'started',
        operation,
        total: contactIds.length,
        processed: 0
      });
    }

    switch (operation) {
      case 'update':
        results = await bulkUpdateContacts(req.userId!, contactIds, data, operationId, wsService);
        break;

      case 'delete':
        results = await bulkDeleteContacts(req.userId!, contactIds, permanent || false);
        break;

      case 'tag':
        results = await bulkTagContacts(req.userId!, contactIds, tags);
        break;

      case 'untag':
        results = await bulkUntagContacts(req.userId!, contactIds, tags);
        break;

      case 'assign':
        results = await bulkAssignContacts(req.userId!, contactIds, assignTo);
        break;

      case 'merge':
        if (contactIds.length < 2) {
          return res.status(400).json({
            success: false,
            error: 'Merge operation requires at least 2 contacts'
          });
        }
        const secondaryIds = contactIds.filter(id => id !== primaryContactId);
        results = await bulkMergeContacts(req.userId!, primaryContactId, secondaryIds);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid bulk operation'
        });
    }

    logger.info(`Bulk ${operation} operation completed by user ${req.userId}: ${contactIds.length} contacts`);

    res.json({
      success: true,
      data: results
    });

  } catch (err: any) {
    logger.error(`Bulk ${operation} operation failed:`, err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}));

// POST /api/crm/contacts/import - Import contacts from CSV
router.post('/contacts/import', asyncHandler(async (req: AuthRequest, res) => {
  const { contacts, skipDuplicates = true, updateExisting = false } = req.body;

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Contacts array is required and must not be empty'
    });
  }

  if (contacts.length > 10000) {
    return res.status(400).json({
      success: false,
      error: 'Maximum 10,000 contacts allowed per import'
    });
  }

  try {
    const results = await importContacts(req.userId!, contacts, { skipDuplicates, updateExisting });

    logger.info(`Contact import completed by user ${req.userId}: ${results.imported} imported, ${results.updated} updated, ${results.skipped} skipped`);

    res.json({
      success: true,
      data: results
    });

  } catch (err: any) {
    logger.error('Contact import failed:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}));

// Bulk operation helper functions
async function bulkUpdateContacts(userId: string, contactIds: string[], updateData: any) {
  const results = { updated: 0, failed: 0, errors: [] as string[] };

  for (const contactId of contactIds) {
    try {
      await crmService.updateContact(userId, contactId, updateData);
      results.updated++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${contactId}: ${error.message}`);
    }
  }

  return results;
}

async function bulkDeleteContacts(userId: string, contactIds: string[], permanent: boolean) {
  const results = { deleted: 0, failed: 0, errors: [] as string[] };
  const total = contactIds.length;
  let processed = 0;

  // Emit progress start
  websocketService.emitBulkOperationProgress(userId, {
    operation: 'bulk_delete',
    total,
    processed: 0,
    status: 'started'
  });

  for (const contactId of contactIds) {
    try {
      await crmService.deleteContact(userId, contactId, permanent);
      results.deleted++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${contactId}: ${error.message}`);
    }

    processed++;

    // Emit progress update every 10 items or at completion
    if (processed % 10 === 0 || processed === total) {
      websocketService.emitBulkOperationProgress(userId, {
        operation: 'bulk_delete',
        total,
        processed,
        status: processed === total ? 'completed' : 'processing'
      });
    }
  }

  return results;
}

async function bulkTagContacts(userId: string, contactIds: string[], tags: string[]) {
  const results = { updated: 0, failed: 0, errors: [] as string[] };
  const total = contactIds.length;
  let processed = 0;

  // Emit progress start
  websocketService.emitBulkOperationProgress(userId, {
    operation: 'bulk_tag',
    total,
    processed: 0,
    status: 'started'
  });

  for (const contactId of contactIds) {
    try {
      const contact = await crmService.getContactById(userId, contactId);
      if (contact) {
        const existingTags = contact.tags || [];
        const newTags = [...new Set([...existingTags, ...tags])];
        await crmService.updateContact(userId, contactId, { tags: newTags });
        results.updated++;
      }
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${contactId}: ${error.message}`);
    }

    processed++;

    // Emit progress update every 10 items or at completion
    if (processed % 10 === 0 || processed === total) {
      websocketService.emitBulkOperationProgress(userId, {
        operation: 'bulk_tag',
        total,
        processed,
        status: processed === total ? 'completed' : 'processing'
      });
    }
  }

  return results;
}

async function bulkUntagContacts(userId: string, contactIds: string[], tags: string[]) {
  const results = { updated: 0, failed: 0, errors: [] as string[] };

  for (const contactId of contactIds) {
    try {
      const contact = await crmService.getContactById(userId, contactId);
      if (contact) {
        const existingTags = contact.tags || [];
        const filteredTags = existingTags.filter(tag => !tags.includes(tag));
        await crmService.updateContact(userId, contactId, { tags: filteredTags });
        results.updated++;
      }
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${contactId}: ${error.message}`);
    }
  }

  return results;
}

async function bulkAssignContacts(userId: string, contactIds: string[], assignTo: string) {
  const results = { updated: 0, failed: 0, errors: [] as string[] };

  for (const contactId of contactIds) {
    try {
      await crmService.updateContact(userId, contactId, { contactOwner: assignTo });
      results.updated++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${contactId}: ${error.message}`);
    }
  }

  return results;
}

async function bulkMergeContacts(userId: string, primaryContactId: string, secondaryContactIds: string[]) {
  const results = { merged: 0, failed: 0, errors: [] as string[] };

  for (const secondaryId of secondaryContactIds) {
    try {
      await crmService.mergeContacts(userId, primaryContactId, secondaryId);
      results.merged++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${secondaryId}: ${error.message}`);
    }
  }

  return results;
}

async function importContacts(userId: string, contacts: any[], options: { skipDuplicates: boolean; updateExisting: boolean }) {
  const results = { imported: 0, updated: 0, skipped: 0, failed: 0, errors: [] as string[] };
  const total = contacts.length;
  let processed = 0;

  // Emit progress start
  websocketService.emitBulkOperationProgress(userId, {
    operation: 'import_contacts',
    total,
    processed: 0,
    status: 'started'
  });

  for (const contactData of contacts) {
    try {
      // Check for existing contact by email
      const existingContacts = await crmService.getContacts(userId, {
        query: contactData.email,
        limit: 1
      });

      if (existingContacts.contacts.length > 0) {
        if (options.updateExisting) {
          await crmService.updateContact(userId, existingContacts.contacts[0].id, contactData);
          results.updated++;
        } else if (options.skipDuplicates) {
          results.skipped++;
        } else {
          results.failed++;
          results.errors.push(`${contactData.email}: Contact already exists`);
        }
      } else {
        await crmService.createContact(userId, contactData);
        results.imported++;
      }
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${contactData.email || 'Unknown'}: ${error.message}`);
    }

    processed++;

    // Emit progress update every 10 items or at completion
    if (processed % 10 === 0 || processed === total) {
      websocketService.emitBulkOperationProgress(userId, {
        operation: 'import_contacts',
        total,
        processed,
        status: processed === total ? 'completed' : 'processing'
      });
    }
  }

  return results;
}

// Helper function to convert contacts to CSV
function convertToCSV(contacts: any[]): string {
  if (contacts.length === 0) return '';

  const headers = [
    'firstName', 'lastName', 'email', 'phone', 'company', 'jobTitle',
    'lifecycleStage', 'leadStatus', 'leadScore', 'originalSource',
    'createdAt', 'lastActivityDate'
  ];

  const csvContent = [
    headers.join(','),
    ...contacts.map(contact =>
      headers.map(header => {
        const value = contact[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
}

export default router;