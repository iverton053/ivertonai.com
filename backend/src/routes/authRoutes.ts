import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().required().min(3).max(30).alphanum(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])')),
  firstName: Joi.string().max(50),
  lastName: Joi.string().max(50),
  company: Joi.string().max(100)
});

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().required().email()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
});

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register - Register new user
router.post('/register', asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  
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

  const { username, email, password, firstName, lastName, company } = value;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    return res.status(409).json({
      success: false,
      error: `User with this ${field} already exists`,
      code: 'USER_EXISTS'
    });
  }

  // Create new user
  const user = new User({
    username,
    email,
    password,
    profile: {
      firstName,
      lastName,
      company,
      timezone: 'UTC'
    },
    preferences: {
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        campaign_alerts: true,
        performance_reports: true,
        budget_alerts: true
      },
      dashboard: {
        default_date_range: '7d',
        auto_refresh: true,
        refresh_interval: 300
      }
    },
    subscription: {
      plan: 'free',
      status: 'active',
      limits: {
        campaigns: 3,
        ad_accounts: 1,
        monthly_spend: 500,
        ai_generations: 10
      },
      usage: {
        campaigns_used: 0,
        ad_accounts_used: 0,
        monthly_spend_used: 0,
        ai_generations_used: 0
      }
    },
    security: {
      last_login: new Date(),
      failed_login_attempts: 0,
      password_changed_at: new Date(),
      two_factor_enabled: false
    },
    role: 'user',
    isActive: true,
    emailVerified: false // In production, send verification email
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id.toString());

  logger.info(`New user registered: ${user.email}`);

  res.status(201).json({
    success: true,
    data: {
      user: user.toJSON(),
      token
    }
  });
}));

// POST /api/auth/login - Login user
router.post('/login', asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  
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

  const { email, password } = value;

  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Check if account is locked
  if (user.security.account_locked_until && user.security.account_locked_until > new Date()) {
    return res.status(423).json({
      success: false,
      error: 'Account temporarily locked due to multiple failed login attempts',
      code: 'ACCOUNT_LOCKED',
      unlocked_at: user.security.account_locked_until
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment failed login attempts
    user.security.failed_login_attempts += 1;
    
    // Lock account after 5 failed attempts
    if (user.security.failed_login_attempts >= 5) {
      user.security.account_locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      logger.warn(`Account locked due to failed login attempts: ${email}`);
    }
    
    await user.save();
    
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      error: 'Account deactivated',
      code: 'ACCOUNT_INACTIVE'
    });
  }

  // Reset failed login attempts and update last login
  user.security.failed_login_attempts = 0;
  user.security.account_locked_until = undefined;
  user.security.last_login = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id.toString());

  logger.info(`User logged in: ${user.email}`);

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      token
    }
  });
}));

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: req.user
  });
}));

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const updateSchema = Joi.object({
    profile: Joi.object({
      firstName: Joi.string().max(50),
      lastName: Joi.string().max(50),
      company: Joi.string().max(100),
      phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/),
      timezone: Joi.string(),
      avatar: Joi.string()
    }),
    preferences: Joi.object({
      currency: Joi.string().length(3),
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
        campaign_alerts: Joi.boolean(),
        performance_reports: Joi.boolean(),
        budget_alerts: Joi.boolean()
      }),
      dashboard: Joi.object({
        default_date_range: Joi.string(),
        auto_refresh: Joi.boolean(),
        refresh_interval: Joi.number().min(60).max(3600)
      })
    })
  });

  const { error, value } = updateSchema.validate(req.body);
  
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

  // Update user
  if (value.profile) {
    Object.assign(req.user!.profile, value.profile);
  }
  
  if (value.preferences) {
    if (value.preferences.notifications) {
      Object.assign(req.user!.preferences.notifications, value.preferences.notifications);
    }
    if (value.preferences.dashboard) {
      Object.assign(req.user!.preferences.dashboard, value.preferences.dashboard);
    }
    if (value.preferences.currency) {
      req.user!.preferences.currency = value.preferences.currency;
    }
  }

  await req.user!.save();

  logger.info(`Profile updated for user: ${req.user!.email}`);

  res.json({
    success: true,
    data: req.user!.toJSON()
  });
}));

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
  });

  const { error, value } = changePasswordSchema.validate(req.body);
  
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

  const { currentPassword, newPassword } = value;

  // Verify current password
  const isCurrentPasswordValid = await req.user!.comparePassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect',
      code: 'INVALID_CURRENT_PASSWORD'
    });
  }

  // Update password
  req.user!.password = newPassword;
  await req.user!.save();

  logger.info(`Password changed for user: ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
}));

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { error, value } = forgotPasswordSchema.validate(req.body);
  
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

  const { email } = value;
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent'
    });
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // In production, send email with reset link
  logger.info(`Password reset requested for: ${email}`);

  res.json({
    success: true,
    message: 'If an account with this email exists, a password reset link has been sent',
    // For development only - remove in production
    ...(process.env.NODE_ENV === 'development' && { resetToken })
  });
}));

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { error, value } = resetPasswordSchema.validate(req.body);
  
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

  const { token, password } = value;

  // Hash the token to match stored token
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired reset token',
      code: 'INVALID_RESET_TOKEN'
    });
  }

  // Reset password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.info(`Password reset completed for: ${user.email}`);

  res.json({
    success: true,
    message: 'Password reset successful'
  });
}));

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

export default router;