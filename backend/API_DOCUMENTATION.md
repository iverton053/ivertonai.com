# CRM Management API Documentation

## Overview
A comprehensive RESTful API for Customer Relationship Management (CRM) built with Express.js and PostgreSQL.

**Base URL:** `http://localhost:3001/api`
**Version:** 1.0.0

## Authentication
The API supports JWT-based authentication. For endpoints that require authentication, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Get Authentication Token
```http
POST /api/auth/token
Content-Type: application/json

{
  "user_id": "your-user-id",
  "email": "your-email@example.com"
}
```

## Endpoints

### Health Check
```http
GET /api/health
```
Returns API status and version information.

### Contacts

#### List Contacts
```http
GET /api/crm/contacts
```
**Query Parameters:**
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)
- `search` - Search in name, email, company
- `status` - Filter by status (new, contacted, qualified, opportunity, customer, inactive)
- `source` - Filter by source (website, referral, cold-call, social-media, advertisement, other)
- `assigned_to` - Filter by assigned user UUID
- `lead_score_min` - Minimum lead score (0-100)
- `lead_score_max` - Maximum lead score (0-100)

#### Get Single Contact
```http
GET /api/crm/contacts/:id
```

#### Create Contact
```http
POST /api/crm/contacts
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "job_title": "CEO",
  "status": "new",
  "source": "website",
  "tags": ["hot-lead", "enterprise"],
  "assigned_to": "user-uuid",
  "custom_fields": {}
}
```

#### Update Contact
```http
PUT /api/crm/contacts/:id
Content-Type: application/json
```

#### Delete Contact
```http
DELETE /api/crm/contacts/:id
```

#### Update Lead Score
```http
PATCH /api/crm/contacts/:id/lead-score
Content-Type: application/json

{
  "lead_score": 85
}
```

### Deals

#### List Deals
```http
GET /api/crm/deals
```
**Query Parameters:**
- `limit`, `offset` - Pagination
- `contact_id` - Filter by contact
- `stage` - Filter by stage (prospecting, qualification, proposal, negotiation, closed-won, closed-lost)
- `assigned_to` - Filter by assigned user
- `value_min`, `value_max` - Filter by deal value range
- `expected_close_after`, `expected_close_before` - Filter by expected close date

#### Create Deal
```http
POST /api/crm/deals
Content-Type: application/json

{
  "title": "Enterprise Software Deal",
  "contact_id": "contact-uuid",
  "value": 50000,
  "currency": "USD",
  "stage": "prospecting",
  "probability": 25,
  "expected_close_date": "2024-12-31",
  "deal_source": "inbound",
  "products_services": ["Software License", "Support"],
  "notes": "Initial discussion completed",
  "assigned_to": "user-uuid"
}
```

#### Update Deal Stage
```http
PATCH /api/crm/deals/:id/stage
Content-Type: application/json

{
  "stage": "qualification",
  "notes": "Qualification call completed"
}
```

### Activities

#### List Activities
```http
GET /api/crm/activities
```
**Query Parameters:**
- `limit`, `offset` - Pagination
- `contact_id` - Filter by contact
- `deal_id` - Filter by deal
- `type` - Filter by type (call, email, meeting, task, note, demo, proposal)
- `assigned_to` - Filter by assigned user
- `completed` - Filter by completion status (true/false)
- `due_date_after`, `due_date_before` - Filter by due date range

#### Create Activity
```http
POST /api/crm/activities
Content-Type: application/json

{
  "type": "call",
  "title": "Follow-up Call",
  "description": "Discuss pricing options",
  "contact_id": "contact-uuid",
  "deal_id": "deal-uuid",
  "assigned_to": "user-uuid",
  "due_date": "2024-01-15T10:00:00Z",
  "duration_minutes": 30,
  "follow_up_required": true,
  "follow_up_date": "2024-01-16T10:00:00Z",
  "created_by": "user-uuid"
}
```

#### Complete Activity
```http
PATCH /api/crm/activities/:id/complete
Content-Type: application/json

{
  "outcome": "positive",
  "notes": "Client interested in premium package"
}
```

### Notes

#### List Notes
```http
GET /api/crm/notes
```
**Query Parameters:**
- `contact_id` - Get notes for specific contact
- `deal_id` - Get notes for specific deal  
- `activity_id` - Get notes for specific activity
- `limit`, `offset` - Pagination

#### Create Note
```http
POST /api/crm/notes
Content-Type: application/json

{
  "contact_id": "contact-uuid",
  "content": "Client expressed interest in enterprise features",
  "is_private": false,
  "created_by": "user-uuid"
}
```

#### Update Note
```http
PUT /api/crm/notes/:id
Content-Type: application/json

{
  "content": "Updated note content",
  "is_private": true
}
```

#### Delete Note
```http
DELETE /api/crm/notes/:id
```

### Pipelines

#### List Pipelines
```http
GET /api/crm/pipelines
```

#### Create Pipeline
```http
POST /api/crm/pipelines
Content-Type: application/json

{
  "name": "Custom Sales Pipeline",
  "is_default": false,
  "stages": [
    {"id": "lead", "name": "Lead", "order": 1, "probability": 10, "color": "#6B7280"},
    {"id": "qualified", "name": "Qualified", "order": 2, "probability": 25, "color": "#F59E0B"},
    {"id": "proposal", "name": "Proposal", "order": 3, "probability": 50, "color": "#3B82F6"},
    {"id": "won", "name": "Won", "order": 4, "probability": 100, "color": "#10B981"}
  ]
}
```

#### Update Pipeline
```http
PUT /api/crm/pipelines/:id
```

#### Delete Pipeline
```http
DELETE /api/crm/pipelines/:id
```

### Analytics

#### Dashboard Stats
```http
GET /api/crm/analytics/dashboard
```
**Query Parameters:**
- `user_id` - Get stats for specific user

#### Advanced Analytics
```http
GET /api/crm/analytics
```
**Query Parameters:**
- `start_date` - Analytics start date
- `end_date` - Analytics end date
- `user_id` - Filter by user

### Search

#### Global Search
```http
GET /api/crm/search?q=search-term
```
**Query Parameters:**
- `q` - Search query (required)
- `type` - Limit search to specific type (contacts, deals, activities)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "pagination": { // For paginated endpoints
    "total": 100,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": ["Additional error details"] // Only in development mode
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting
API requests are limited to 100 requests per 15-minute window per IP address.

## Database Setup
1. Create a PostgreSQL database
2. Run the schema file: `database/crm-schema.sql`
3. Update your `.env` file with database credentials

## Environment Variables
Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Allowed origins for CORS
- `NODE_ENV` - Environment (development/production)

## Running the API
```bash
npm install
npm start
```

For development with auto-reload:
```bash
npm run dev
```