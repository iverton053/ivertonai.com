# CRM Management Backend API

A complete, production-ready RESTful API for Customer Relationship Management (CRM) built with Express.js, PostgreSQL, and modern security practices.

## 🚀 Features

### Core CRM Functionality
- **Contacts Management** - Complete CRUD operations with advanced filtering and search
- **Deals Pipeline** - Track deals through customizable sales stages with history
- **Activities & Tasks** - Schedule and manage calls, meetings, emails, and follow-ups
- **Notes System** - Attach notes to contacts, deals, and activities
- **Pipeline Management** - Create and manage custom sales pipelines
- **Analytics Dashboard** - Real-time stats and performance metrics

### Security & Performance
- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevent API abuse with configurable limits
- **Input Validation** - Comprehensive validation using Joi schemas
- **SQL Injection Protection** - Parameterized queries for all database operations
- **CORS Configuration** - Secure cross-origin resource sharing
- **Helmet.js** - Security headers and protection middleware

### Database Features
- **PostgreSQL** - Robust relational database with JSONB support
- **UUID Primary Keys** - Secure, unique identifiers
- **Database Indexes** - Optimized queries for performance
- **Triggers** - Automatic timestamp updates
- **Analytics Views** - Pre-computed statistics for dashboards

## 📋 API Endpoints

### Authentication
- `POST /api/auth/token` - Generate JWT token

### Contacts
- `GET /api/crm/contacts` - List contacts with filtering & pagination
- `POST /api/crm/contacts` - Create new contact
- `GET /api/crm/contacts/:id` - Get contact details
- `PUT /api/crm/contacts/:id` - Update contact
- `DELETE /api/crm/contacts/:id` - Delete contact
- `PATCH /api/crm/contacts/:id/lead-score` - Update lead score

### Deals
- `GET /api/crm/deals` - List deals with filtering
- `POST /api/crm/deals` - Create new deal
- `PATCH /api/crm/deals/:id/stage` - Update deal stage

### Activities
- `GET /api/crm/activities` - List activities with filtering
- `POST /api/crm/activities` - Create new activity
- `PATCH /api/crm/activities/:id/complete` - Mark activity as complete

### Notes
- `GET /api/crm/notes` - List notes
- `POST /api/crm/notes` - Create new note
- `PUT /api/crm/notes/:id` - Update note
- `DELETE /api/crm/notes/:id` - Delete note

### Pipelines
- `GET /api/crm/pipelines` - List pipelines
- `POST /api/crm/pipelines` - Create pipeline
- `PUT /api/crm/pipelines/:id` - Update pipeline
- `DELETE /api/crm/pipelines/:id` - Delete pipeline

### Analytics
- `GET /api/crm/analytics/dashboard` - Dashboard statistics
- `GET /api/crm/analytics` - Advanced analytics

### Search
- `GET /api/crm/search` - Global search across contacts, deals, activities

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Quick Start

1. **Clone and Install**
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb crm_db
   
   # Run database schema
   psql -d crm_db -f ../database/crm-schema.sql
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start the Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

The API will be available at `http://localhost:3001/api`

## ⚙️ Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database (PostgreSQL/Supabase)
DATABASE_URL=postgresql://username:password@localhost:5432/crm_db

# Security
JWT_SECRET=your-jwt-secret-key-here
BCRYPT_ROUNDS=12

# API Configuration
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000,http://localhost:3005
```

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Get authentication token
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test-user","email":"test@example.com"}'

# Test with authentication
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/crm/contacts
```

## 🗄 Database Schema

The CRM system includes the following tables:
- **crm_contacts** - Contact information and lead scoring
- **crm_deals** - Sales opportunities and pipeline tracking
- **crm_pipelines** - Customizable sales pipeline definitions
- **crm_activities** - Tasks, calls, meetings, and follow-ups
- **crm_notes** - Notes attached to contacts, deals, or activities
- **crm_deal_stage_history** - Audit trail for deal progression

### Views for Analytics
- **crm_contact_stats** - Contact statistics and metrics
- **crm_deal_stats** - Deal pipeline and conversion metrics
- **crm_activity_stats** - Activity completion and type breakdown

## 📊 Sample Data

Contact fields:
```json
{
  "first_name": "John",
  "last_name": "Doe", 
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "job_title": "CEO",
  "status": "qualified",
  "source": "website",
  "lead_score": 85,
  "tags": ["enterprise", "hot-lead"],
  "assigned_to": "user-uuid"
}
```

Deal fields:
```json
{
  "title": "Enterprise Software License",
  "contact_id": "contact-uuid",
  "value": 50000,
  "currency": "USD", 
  "stage": "proposal",
  "probability": 75,
  "expected_close_date": "2024-03-31"
}
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Helmet.js**: Security headers for common vulnerabilities
- **Input Validation**: Joi schemas for all POST/PUT endpoints
- **JWT Authentication**: Stateless token authentication
- **SQL Injection Protection**: Parameterized queries only
- **Error Handling**: Secure error responses (no sensitive data in production)

## 📈 Performance

- **Database Indexes**: Optimized for common query patterns
- **Connection Pooling**: PostgreSQL connection pool for scalability  
- **Pagination**: All list endpoints support limit/offset pagination
- **Materialized Views**: Pre-computed analytics for dashboard performance
- **Async/Await**: Non-blocking asynchronous operations throughout

## 🚢 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure `JWT_SECRET`
- [ ] Set up SSL/TLS certificates
- [ ] Configure production database with SSL
- [ ] Set up proper CORS origins
- [ ] Configure reverse proxy (nginx/apache)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📝 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API reference with examples.

## 🤝 Contributing

1. Follow existing code style and patterns
2. Add Joi validation for new endpoints
3. Include error handling for all operations
4. Update API documentation for new features
5. Test all endpoints before submitting

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database and tables exist
- Check firewall and network connectivity

### Authentication Problems  
- Verify JWT_SECRET is set
- Check token format (Bearer \<token\>)
- Ensure token hasn't expired (24 hour default)

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Configure via API_RATE_LIMIT_* environment variables
- Consider using Redis for distributed rate limiting

---

Built with ❤️ for modern CRM needs. Ready for production deployment!