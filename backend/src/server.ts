import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

import { logger } from './utils/logger';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { authenticateToken } from './middleware/authMiddleware';

// Route imports
import authRoutes from './routes/authRoutes';
import campaignRoutes from './routes/campaignRoutes';
import adAccountRoutes from './routes/adAccountRoutes';
import creativeRoutes from './routes/creativeRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import automationRoutes from './routes/automationRoutes';
import webhookRoutes from './routes/webhookRoutes';
import crmRoutes from './routes/crmRoutes';
import behavioralWebhooks from './routes/behavioralWebhooks';
import overviewRoutes from './routes/overviewRoutes';

// Queue imports
import './services/queueService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Redis client for rate limiting
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

// Rate limiter
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'api_rate_limit',
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000,
});

// Rate limiting middleware
const rateLimitMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: secs
    });
  }
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') 
    : ['http://localhost:3000', 'http://localhost:3005'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// General middleware
app.use(compression());
app.use(morgan('combined', { 
  stream: { write: (message: string) => logger.info(message.trim()) }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes
app.use('/api', rateLimitMiddleware);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Ad Campaign Manager API'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', authenticateToken, campaignRoutes);
app.use('/api/accounts', authenticateToken, adAccountRoutes);
app.use('/api/creatives', authenticateToken, creativeRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/automation', authenticateToken, automationRoutes);
app.use('/api/crm', authenticateToken, crmRoutes);
app.use('/api/overview', overviewRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/behavioral', behavioralWebhooks);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connections
const connectDatabases = async () => {
  try {
    // MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ad_campaign_manager');
    logger.info('Connected to MongoDB');

    // Redis connection
    await redisClient.connect();
    logger.info('Connected to Redis');

  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Starting graceful shutdown...');
  
  try {
    await mongoose.connection.close();
    await redisClient.quit();
    logger.info('Databases disconnected');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    await connectDatabases();
    
    app.listen(PORT, () => {
      logger.info(`Ad Campaign Manager API running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;