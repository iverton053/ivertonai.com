import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: string;
}

export const createError = (statusCode: number, message: string, code?: string): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
  error.isOperational = true;
  error.code = code;
  return error;
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(404, `Route not found - ${req.originalUrl}`, 'ROUTE_NOT_FOUND');
  next(error);
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = createError(404, message, 'INVALID_ID');
  }

  // Mongoose duplicate key
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const message = `${field} already exists`;
    error = createError(400, message, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = createError(400, message, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = createError(401, message, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = createError(401, message, 'TOKEN_EXPIRED');
  }

  // Rate limiting errors
  if (err.name === 'TooManyRequestsError') {
    const message = 'Too many requests, please try again later';
    error = createError(429, message, 'RATE_LIMIT_EXCEEDED');
  }

  // File upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if ((err as any).code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if ((err as any).code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else if ((err as any).code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
    error = createError(400, message, 'FILE_UPLOAD_ERROR');
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  // Don't send stack trace in production
  const response: any = {
    status,
    error: error.message || 'Internal server error'
  };

  if (error.code) {
    response.code = error.code;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.details = error;
  }

  // Handle specific error types with additional data
  if (error.code === 'VALIDATION_ERROR') {
    response.validation_errors = extractValidationErrors(err);
  }

  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    res.set('Retry-After', '900'); // 15 minutes
  }

  res.status(statusCode).json(response);
};

const extractValidationErrors = (err: any) => {
  const errors: any = {};
  
  if (err.errors) {
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
  }
  
  return errors;
};

// Async error handler wrapper
export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    error: err.message,
    stack: err.stack
  });
  
  process.exit(1);
});

process.on('unhandledRejection', (err: Error, promise: Promise<any>) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
    error: err.message,
    stack: err.stack,
    promise
  });
  
  // Give time to log then exit
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

export default errorHandler;