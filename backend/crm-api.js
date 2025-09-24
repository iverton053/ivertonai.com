// CRM Management API - Express.js Backend
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/crm_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api', limiter);
app.use(express.json({ limit: '10mb' }));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Optional auth middleware (for endpoints that work with or without auth)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Validation schemas
const contactSchema = Joi.object({
  first_name: Joi.string().min(1).max(100).required(),
  last_name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().max(255).required(),
  phone: Joi.string().max(20).allow(''),
  company: Joi.string().max(255).allow(''),
  job_title: Joi.string().max(255).allow(''),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'opportunity', 'customer', 'inactive'),
  source: Joi.string().valid('website', 'referral', 'cold-call', 'social-media', 'advertisement', 'other'),
  tags: Joi.array().items(Joi.string()),
  assigned_to: Joi.string().uuid().allow(null),
  custom_fields: Joi.object().allow({})
});

const dealSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  contact_id: Joi.string().uuid().required(),
  value: Joi.number().min(0),
  currency: Joi.string().length(3),
  stage: Joi.string().valid('prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'),
  probability: Joi.number().min(0).max(100),
  expected_close_date: Joi.date().allow(null),
  deal_source: Joi.string().valid('inbound', 'outbound', 'referral', 'partner', 'other'),
  products_services: Joi.array().items(Joi.string()),
  notes: Joi.string().allow(''),
  assigned_to: Joi.string().uuid().allow(null)
});

const activitySchema = Joi.object({
  type: Joi.string().valid('call', 'email', 'meeting', 'task', 'note', 'demo', 'proposal').required(),
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow(''),
  contact_id: Joi.string().uuid().allow(null),
  deal_id: Joi.string().uuid().allow(null),
  assigned_to: Joi.string().uuid().allow(null),
  due_date: Joi.date().allow(null),
  duration_minutes: Joi.number().min(0).allow(null),
  follow_up_required: Joi.boolean(),
  follow_up_date: Joi.date().allow(null),
  created_by: Joi.string().uuid().required()
});

const noteSchema = Joi.object({
  contact_id: Joi.string().uuid().allow(null),
  deal_id: Joi.string().uuid().allow(null),
  activity_id: Joi.string().uuid().allow(null),
  content: Joi.string().min(1).required(),
  is_private: Joi.boolean(),
  created_by: Joi.string().uuid().required()
}).custom((value, helpers) => {
  if (!value.contact_id && !value.deal_id && !value.activity_id) {
    return helpers.error('any.custom', {
      message: 'Note must be associated with a contact, deal, or activity'
    });
  }
  return value;
});

// Validation middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific database errors
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      success: false,
      error: 'Resource already exists',
      details: process.env.NODE_ENV === 'development' ? err.detail : undefined
    });
  }

  if (err.code === '23503') { // Foreign key constraint violation
    return res.status(400).json({
      success: false,
      error: 'Invalid reference to related resource',
      details: process.env.NODE_ENV === 'development' ? err.detail : undefined
    });
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.details.map(detail => detail.message)
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Helper functions
const buildWhereClause = (filters, params = []) => {
  const conditions = [];
  let paramIndex = params.length + 1;

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    switch (key) {
      case 'search':
        conditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`);
        params.push(`%${value}%`);
        paramIndex++;
        break;
      case 'status':
      case 'source':
      case 'assigned_to':
      case 'contact_id':
      case 'deal_id':
      case 'type':
        conditions.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
        break;
      case 'stage':
        conditions.push(`stage = $${paramIndex}`);
        params.push(value);
        paramIndex++;
        break;
      case 'tags':
        conditions.push(`tags && $${paramIndex}`);
        params.push(Array.isArray(value) ? value : [value]);
        paramIndex++;
        break;
      case 'lead_score_min':
        conditions.push(`lead_score >= $${paramIndex}`);
        params.push(parseInt(value));
        paramIndex++;
        break;
      case 'lead_score_max':
        conditions.push(`lead_score <= $${paramIndex}`);
        params.push(parseInt(value));
        paramIndex++;
        break;
      case 'value_min':
        conditions.push(`value >= $${paramIndex}`);
        params.push(parseFloat(value));
        paramIndex++;
        break;
      case 'value_max':
        conditions.push(`value <= $${paramIndex}`);
        params.push(parseFloat(value));
        paramIndex++;
        break;
      case 'created_after':
        conditions.push(`created_at >= $${paramIndex}`);
        params.push(value);
        paramIndex++;
        break;
      case 'created_before':
        conditions.push(`created_at <= $${paramIndex}`);
        params.push(value);
        paramIndex++;
        break;
      case 'due_date_after':
        conditions.push(`due_date >= $${paramIndex}`);
        params.push(value);
        paramIndex++;
        break;
      case 'due_date_before':
        conditions.push(`due_date <= $${paramIndex}`);
        params.push(value);
        paramIndex++;
        break;
      case 'expected_close_after':
        conditions.push(`expected_close_date >= $${paramIndex}`);
        params.push(value);
        paramIndex++;
        break;
      case 'expected_close_before':
        conditions.push(`expected_close_date <= $${paramIndex}`);
        params.push(value);
        paramIndex++;
        break;
      case 'completed':
        conditions.push(`completed = $${paramIndex}`);
        params.push(value === 'true' || value === true);
        paramIndex++;
        break;
    }
  });

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
};

// ================== CONTACTS ENDPOINTS ==================

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CRM API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ================== AUTH ENDPOINTS ==================

// POST /api/auth/token - Generate a simple test token
app.post('/api/auth/token', asyncHandler(async (req, res) => {
  const { user_id = 'test-user', email = 'test@example.com' } = req.body;
  
  const token = jwt.sign(
    { 
      user_id, 
      email, 
      iat: Date.now() / 1000,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    },
    process.env.JWT_SECRET || 'fallback-secret-key'
  );

  res.json({
    success: true,
    data: {
      token,
      expires_in: 24 * 60 * 60, // 24 hours in seconds
      token_type: 'Bearer'
    }
  });
}));

// GET /api/crm/contacts
app.get('/api/crm/contacts', optionalAuth, asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, ...filters } = req.query;
  const params = [];
  
  const whereClause = buildWhereClause(filters, params);
  
  // Add pagination
  const limitClause = `LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(parseInt(limit), parseInt(offset));

  const query = `
    SELECT * FROM crm_contacts 
    ${whereClause}
    ORDER BY created_at DESC 
    ${limitClause}
  `;

  const countQuery = `SELECT COUNT(*) FROM crm_contacts ${whereClause}`;

  const [result, countResult] = await Promise.all([
    pool.query(query, params.slice(0, -2).concat(params.slice(-2))),
    pool.query(countQuery, params.slice(0, -2))
  ]);

  const total = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: result.rows,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      has_more: offset + limit < total
    }
  });
}));

// GET /api/crm/contacts/:id
app.get('/api/crm/contacts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await pool.query('SELECT * FROM crm_contacts WHERE id = $1', [id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Contact not found'
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

// POST /api/crm/contacts
app.post('/api/crm/contacts', optionalAuth, validate(contactSchema), asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    company,
    job_title,
    status = 'new',
    source = 'other',
    tags = [],
    assigned_to,
    custom_fields = {}
  } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: first_name, last_name, email'
    });
  }

  const query = `
    INSERT INTO crm_contacts (
      first_name, last_name, email, phone, company, job_title, 
      status, source, tags, assigned_to, custom_fields
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [
      first_name, last_name, email, phone, company, job_title,
      status, source, tags, assigned_to, JSON.stringify(custom_fields)
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'crm_contacts_email_key') {
      return res.status(409).json({
        success: false,
        error: 'Contact with this email already exists'
      });
    }
    throw error;
  }
}));

// PUT /api/crm/contacts/:id
app.put('/api/crm/contacts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Remove id and timestamps from updates
  delete updates.id;
  delete updates.created_at;
  delete updates.updated_at;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No fields to update'
    });
  }

  const setClause = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');

  const query = `
    UPDATE crm_contacts 
    SET ${setClause}
    WHERE id = $1 
    RETURNING *
  `;

  const values = [id, ...Object.values(updates)];

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Contact not found'
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

// DELETE /api/crm/contacts/:id
app.delete('/api/crm/contacts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM crm_contacts WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Contact not found'
    });
  }

  res.json({
    success: true,
    data: { deleted: true }
  });
}));

// PATCH /api/crm/contacts/:id/lead-score
app.patch('/api/crm/contacts/:id/lead-score', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { lead_score } = req.body;

  if (typeof lead_score !== 'number' || lead_score < 0 || lead_score > 100) {
    return res.status(400).json({
      success: false,
      error: 'Lead score must be a number between 0 and 100'
    });
  }

  const result = await pool.query(
    'UPDATE crm_contacts SET lead_score = $1 WHERE id = $2 RETURNING *',
    [lead_score, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Contact not found'
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

// ================== DEALS ENDPOINTS ==================

// GET /api/crm/deals
app.get('/api/crm/deals', asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, ...filters } = req.query;
  const params = [];
  
  const whereClause = buildWhereClause(filters, params);
  
  // Add pagination
  const limitClause = `LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(parseInt(limit), parseInt(offset));

  const query = `
    SELECT d.*, c.first_name, c.last_name, c.email, c.company
    FROM crm_deals d
    LEFT JOIN crm_contacts c ON d.contact_id = c.id
    ${whereClause}
    ORDER BY d.created_at DESC 
    ${limitClause}
  `;

  const result = await pool.query(query, params);

  res.json({
    success: true,
    data: result.rows
  });
}));

// POST /api/crm/deals
app.post('/api/crm/deals', optionalAuth, validate(dealSchema), asyncHandler(async (req, res) => {
  const {
    title,
    contact_id,
    value = 0,
    currency = 'USD',
    stage = 'prospecting',
    probability = 0,
    expected_close_date,
    deal_source = 'other',
    products_services = [],
    notes,
    assigned_to
  } = req.body;

  if (!title || !contact_id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: title, contact_id'
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create the deal
    const dealResult = await client.query(`
      INSERT INTO crm_deals (
        title, contact_id, value, currency, stage, probability,
        expected_close_date, deal_source, products_services, notes, assigned_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [title, contact_id, value, currency, stage, probability, expected_close_date, deal_source, products_services, notes, assigned_to]);

    // Create stage history entry
    await client.query(`
      INSERT INTO crm_deal_stage_history (deal_id, to_stage, changed_by)
      VALUES ($1, $2, $3)
    `, [dealResult.rows[0].id, stage, assigned_to || 'system']);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: dealResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

// PATCH /api/crm/deals/:id/stage
app.patch('/api/crm/deals/:id/stage', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stage, notes } = req.body;

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get current stage
    const currentResult = await client.query('SELECT stage FROM crm_deals WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    const currentStage = currentResult.rows[0].stage;

    // Update deal stage
    const updateResult = await client.query(
      'UPDATE crm_deals SET stage = $1 WHERE id = $2 RETURNING *',
      [stage, id]
    );

    // Add to stage history
    await client.query(`
      INSERT INTO crm_deal_stage_history (deal_id, from_stage, to_stage, changed_by, notes)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, currentStage, stage, 'user', notes]);

    await client.query('COMMIT');

    res.json({
      success: true,
      data: updateResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

// ================== ACTIVITIES ENDPOINTS ==================

// GET /api/crm/activities
app.get('/api/crm/activities', asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, ...filters } = req.query;
  const params = [];
  
  const whereClause = buildWhereClause(filters, params);
  
  const query = `
    SELECT a.*, c.first_name, c.last_name, d.title as deal_title
    FROM crm_activities a
    LEFT JOIN crm_contacts c ON a.contact_id = c.id
    LEFT JOIN crm_deals d ON a.deal_id = d.id
    ${whereClause}
    ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC 
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(parseInt(limit), parseInt(offset));

  const result = await pool.query(query, params);

  res.json({
    success: true,
    data: result.rows
  });
}));

// POST /api/crm/activities
app.post('/api/crm/activities', optionalAuth, validate(activitySchema), asyncHandler(async (req, res) => {
  const {
    type,
    title,
    description,
    contact_id,
    deal_id,
    assigned_to,
    due_date,
    duration_minutes,
    follow_up_required = false,
    follow_up_date,
    created_by
  } = req.body;

  if (!type || !title || !created_by) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: type, title, created_by'
    });
  }

  const query = `
    INSERT INTO crm_activities (
      type, title, description, contact_id, deal_id, assigned_to,
      due_date, duration_minutes, follow_up_required, follow_up_date, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;

  const result = await pool.query(query, [
    type, title, description, contact_id, deal_id, assigned_to,
    due_date, duration_minutes, follow_up_required, follow_up_date, created_by
  ]);

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

// PATCH /api/crm/activities/:id/complete
app.patch('/api/crm/activities/:id/complete', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { outcome, notes } = req.body;

  const result = await pool.query(`
    UPDATE crm_activities 
    SET completed = true, completed_at = NOW(), outcome = $1
    WHERE id = $2 
    RETURNING *
  `, [outcome, id]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Activity not found'
    });
  }

  // Add note if provided
  if (notes) {
    await pool.query(`
      INSERT INTO crm_notes (activity_id, content, created_by)
      VALUES ($1, $2, $3)
    `, [id, notes, 'user']);
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

// ================== ANALYTICS ENDPOINTS ==================

// GET /api/crm/analytics/dashboard
app.get('/api/crm/analytics/dashboard', asyncHandler(async (req, res) => {
  const { user_id } = req.query;

  const userFilter = user_id ? 'WHERE assigned_to = $1' : '';
  const params = user_id ? [user_id] : [];

  const queries = [
    `SELECT COUNT(*) as contacts_count FROM crm_contacts ${userFilter}`,
    `SELECT COUNT(*) as deals_count, SUM(value) as total_pipeline_value FROM crm_deals ${userFilter}`,
    `SELECT SUM(value) as monthly_revenue FROM crm_deals WHERE stage = 'closed-won' AND DATE_TRUNC('month', actual_close_date) = DATE_TRUNC('month', CURRENT_DATE) ${userFilter ? 'AND assigned_to = $1' : ''}`,
    `SELECT COUNT(*) as activities_due_today FROM crm_activities WHERE due_date::date = CURRENT_DATE AND completed = false ${userFilter ? 'AND assigned_to = $1' : ''}`,
    `SELECT COUNT(*) as hot_leads FROM crm_contacts WHERE lead_score >= 80 ${userFilter ? 'AND assigned_to = $1' : ''}`
  ];

  const results = await Promise.all(
    queries.map(query => pool.query(query, params))
  );

  const stats = {
    contacts_count: parseInt(results[0].rows[0].contacts_count) || 0,
    deals_count: parseInt(results[1].rows[0].deals_count) || 0,
    total_pipeline_value: parseFloat(results[1].rows[0].total_pipeline_value) || 0,
    monthly_revenue: parseFloat(results[2].rows[0].monthly_revenue) || 0,
    activities_due_today: parseInt(results[3].rows[0].activities_due_today) || 0,
    hot_leads: parseInt(results[4].rows[0].hot_leads) || 0,
    conversion_rate: 0, // Calculate based on closed-won vs total deals
    avg_deal_size: 0
  };

  // Calculate conversion rate and avg deal size
  if (stats.deals_count > 0) {
    const conversionResult = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE stage = 'closed-won') as won_deals,
        AVG(value) FILTER (WHERE stage = 'closed-won') as avg_won_deal_size
      FROM crm_deals 
      ${userFilter}
    `, params);

    const wonDeals = parseInt(conversionResult.rows[0].won_deals) || 0;
    stats.conversion_rate = Math.round((wonDeals / stats.deals_count) * 100);
    stats.avg_deal_size = parseFloat(conversionResult.rows[0].avg_won_deal_size) || 0;
  }

  res.json({
    success: true,
    data: stats
  });
}));

// GET /api/crm/analytics
app.get('/api/crm/analytics', asyncHandler(async (req, res) => {
  const { start_date, end_date, user_id } = req.query;

  // Build date filter
  let dateFilter = '';
  const params = [];
  let paramIndex = 1;

  if (start_date) {
    dateFilter += `AND created_at >= $${paramIndex}`;
    params.push(start_date);
    paramIndex++;
  }

  if (end_date) {
    dateFilter += `AND created_at <= $${paramIndex}`;
    params.push(end_date);
    paramIndex++;
  }

  if (user_id) {
    dateFilter += `AND assigned_to = $${paramIndex}`;
    params.push(user_id);
  }

  // Execute analytics queries
  const [contactsResult, dealsResult, activitiesResult] = await Promise.all([
    pool.query(`SELECT * FROM crm_contact_stats`),
    pool.query(`SELECT * FROM crm_deal_stats`),
    pool.query(`SELECT * FROM crm_activity_stats`)
  ]);

  const analytics = {
    total_contacts: parseInt(contactsResult.rows[0]?.total_contacts) || 0,
    total_deals: parseInt(dealsResult.rows[0]?.total_deals) || 0,
    total_deal_value: parseFloat(dealsResult.rows[0]?.total_pipeline_value) || 0,
    won_deals: parseInt(dealsResult.rows[0]?.won_deals) || 0,
    lost_deals: parseInt(dealsResult.rows[0]?.lost_deals) || 0,
    win_rate: parseFloat(dealsResult.rows[0]?.win_rate) || 0,
    avg_deal_size: parseFloat(dealsResult.rows[0]?.avg_deal_size) || 0,
    avg_sales_cycle: 30, // Placeholder - would need complex calculation
    activity_summary: {
      calls: parseInt(activitiesResult.rows[0]?.calls) || 0,
      emails: parseInt(activitiesResult.rows[0]?.emails) || 0,
      meetings: parseInt(activitiesResult.rows[0]?.meetings) || 0,
      tasks: parseInt(activitiesResult.rows[0]?.tasks) || 0
    }
  };

  res.json({
    success: true,
    data: analytics
  });
}));

// ================== NOTES ENDPOINTS ==================

// GET /api/crm/notes
app.get('/api/crm/notes', asyncHandler(async (req, res) => {
  const { contact_id, deal_id, activity_id, limit = 50, offset = 0 } = req.query;
  const params = [];
  let whereClause = '';
  
  if (contact_id) {
    whereClause = 'WHERE contact_id = $1';
    params.push(contact_id);
  } else if (deal_id) {
    whereClause = 'WHERE deal_id = $1';
    params.push(deal_id);
  } else if (activity_id) {
    whereClause = 'WHERE activity_id = $1';
    params.push(activity_id);
  }

  const query = `
    SELECT n.*, c.first_name, c.last_name
    FROM crm_notes n
    LEFT JOIN crm_contacts c ON n.contact_id = c.id
    ${whereClause}
    ORDER BY n.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(parseInt(limit), parseInt(offset));
  const result = await pool.query(query, params);

  res.json({
    success: true,
    data: result.rows
  });
}));

// POST /api/crm/notes
app.post('/api/crm/notes', optionalAuth, validate(noteSchema), asyncHandler(async (req, res) => {
  const {
    contact_id,
    deal_id,
    activity_id,
    content,
    is_private = false,
    created_by
  } = req.body;

  if (!content || !created_by) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: content, created_by'
    });
  }

  if (!contact_id && !deal_id && !activity_id) {
    return res.status(400).json({
      success: false,
      error: 'Note must be associated with a contact, deal, or activity'
    });
  }

  const query = `
    INSERT INTO crm_notes (contact_id, deal_id, activity_id, content, is_private, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const result = await pool.query(query, [
    contact_id, deal_id, activity_id, content, is_private, created_by
  ]);

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

// PUT /api/crm/notes/:id
app.put('/api/crm/notes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, is_private } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      error: 'Content is required'
    });
  }

  const result = await pool.query(
    'UPDATE crm_notes SET content = $1, is_private = $2 WHERE id = $3 RETURNING *',
    [content, is_private, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

// DELETE /api/crm/notes/:id
app.delete('/api/crm/notes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM crm_notes WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }

  res.json({
    success: true,
    data: { deleted: true }
  });
}));

// ================== PIPELINE ENDPOINTS ==================

// GET /api/crm/pipelines
app.get('/api/crm/pipelines', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM crm_pipelines ORDER BY is_default DESC, created_at ASC');

  res.json({
    success: true,
    data: result.rows
  });
}));

// POST /api/crm/pipelines
app.post('/api/crm/pipelines', asyncHandler(async (req, res) => {
  const { name, stages, is_default = false } = req.body;

  if (!name || !stages) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, stages'
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // If setting as default, unset other defaults
    if (is_default) {
      await client.query('UPDATE crm_pipelines SET is_default = false');
    }

    const result = await client.query(
      'INSERT INTO crm_pipelines (name, stages, is_default) VALUES ($1, $2, $3) RETURNING *',
      [name, JSON.stringify(stages), is_default]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

// PUT /api/crm/pipelines/:id
app.put('/api/crm/pipelines/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, stages, is_default } = req.body;

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // If setting as default, unset other defaults
    if (is_default) {
      await client.query('UPDATE crm_pipelines SET is_default = false WHERE id != $1', [id]);
    }

    const result = await client.query(
      'UPDATE crm_pipelines SET name = $1, stages = $2, is_default = $3 WHERE id = $4 RETURNING *',
      [name, JSON.stringify(stages), is_default, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pipeline not found'
      });
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

// DELETE /api/crm/pipelines/:id
app.delete('/api/crm/pipelines/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if pipeline is default
  const checkResult = await pool.query('SELECT is_default FROM crm_pipelines WHERE id = $1', [id]);
  
  if (checkResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Pipeline not found'
    });
  }

  if (checkResult.rows[0].is_default) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete default pipeline'
    });
  }

  const result = await pool.query('DELETE FROM crm_pipelines WHERE id = $1 RETURNING id', [id]);

  res.json({
    success: true,
    data: { deleted: true }
  });
}));

// ================== SEARCH ENDPOINT ==================

// GET /api/crm/search
app.get('/api/crm/search', asyncHandler(async (req, res) => {
  const { q: query, type } = req.query;

  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required'
    });
  }

  const searchTerm = `%${query}%`;
  const results = { contacts: [], deals: [], activities: [] };

  if (!type || type === 'contacts') {
    const contactsResult = await pool.query(`
      SELECT * FROM crm_contacts 
      WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1
      LIMIT 10
    `, [searchTerm]);
    results.contacts = contactsResult.rows;
  }

  if (!type || type === 'deals') {
    const dealsResult = await pool.query(`
      SELECT d.*, c.first_name, c.last_name 
      FROM crm_deals d
      LEFT JOIN crm_contacts c ON d.contact_id = c.id
      WHERE d.title ILIKE $1 OR d.notes ILIKE $1
      LIMIT 10
    `, [searchTerm]);
    results.deals = dealsResult.rows;
  }

  if (!type || type === 'activities') {
    const activitiesResult = await pool.query(`
      SELECT * FROM crm_activities 
      WHERE title ILIKE $1 OR description ILIKE $1
      LIMIT 10
    `, [searchTerm]);
    results.activities = activitiesResult.rows;
  }

  res.json({
    success: true,
    data: results
  });
}));

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`CRM API server running on port ${port}`);
  console.log(`Available at: http://localhost:${port}/api/crm`);
});

module.exports = app;