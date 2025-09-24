import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password -passwordResetToken -emailVerificationToken');
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token - user not found',
        code: 'INVALID_TOKEN'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account deactivated',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    if (!user.emailVerified) {
      return res.status(401).json({
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Check if account is locked
    if (user.security.account_locked_until && user.security.account_locked_until > new Date()) {
      return res.status(423).json({
        error: 'Account temporarily locked',
        code: 'ACCOUNT_LOCKED',
        unlocked_at: user.security.account_locked_until
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    logger.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: roles,
        user_role: req.user.role
      });
    }

    next();
  };
};

export const requireSubscription = (plans: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!plans.includes(req.user.subscription.plan)) {
      return res.status(403).json({
        error: 'Subscription upgrade required',
        code: 'SUBSCRIPTION_REQUIRED',
        required_plans: plans,
        current_plan: req.user.subscription.plan
      });
    }

    if (req.user.subscription.status !== 'active') {
      return res.status(403).json({
        error: 'Active subscription required',
        code: 'SUBSCRIPTION_INACTIVE',
        status: req.user.subscription.status
      });
    }

    next();
  };
};

export const checkUsageLimits = (resource: 'campaigns' | 'ad_accounts' | 'monthly_spend' | 'ai_generations') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const limits = req.user.subscription.limits;
    const usage = req.user.subscription.usage;

    switch (resource) {
      case 'campaigns':
        if (usage.campaigns_used >= limits.campaigns) {
          return res.status(403).json({
            error: 'Campaign limit reached',
            code: 'LIMIT_REACHED',
            limit: limits.campaigns,
            used: usage.campaigns_used
          });
        }
        break;
      
      case 'ad_accounts':
        if (usage.ad_accounts_used >= limits.ad_accounts) {
          return res.status(403).json({
            error: 'Ad account limit reached',
            code: 'LIMIT_REACHED',
            limit: limits.ad_accounts,
            used: usage.ad_accounts_used
          });
        }
        break;
      
      case 'monthly_spend':
        if (usage.monthly_spend_used >= limits.monthly_spend) {
          return res.status(403).json({
            error: 'Monthly spend limit reached',
            code: 'LIMIT_REACHED',
            limit: limits.monthly_spend,
            used: usage.monthly_spend_used
          });
        }
        break;
      
      case 'ai_generations':
        if (usage.ai_generations_used >= limits.ai_generations) {
          return res.status(403).json({
            error: 'AI generation limit reached',
            code: 'LIMIT_REACHED',
            limit: limits.ai_generations,
            used: usage.ai_generations_used
          });
        }
        break;
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId).select('-password -passwordResetToken -emailVerificationToken');
    
    if (user && user.isActive && user.emailVerified) {
      req.user = user;
      req.userId = user._id.toString();
    }

    next();
  } catch (error) {
    // For optional auth, we just continue without setting user
    next();
  }
};

export default authenticateToken;