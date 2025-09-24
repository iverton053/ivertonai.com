import { z } from 'zod';
import { useState, useCallback } from 'react';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  data?: any;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

/**
 * Validation utility class with comprehensive validation methods
 */
export class ValidationUtils {
  /**
   * Validate using Zod schema
   */
  static validateWithSchema<T>(data: unknown, schema: z.ZodSchema<T>): ValidationResult {
    try {
      const result = schema.parse(data);
      return {
        isValid: true,
        errors: {},
        data: result,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        return {
          isValid: false,
          errors,
        };
      }

      return {
        isValid: false,
        errors: {
          general: ['Validation failed'],
        },
      };
    }
  }

  /**
   * Validate form data with field rules
   */
  static validateForm(
    data: Record<string, any>,
    rules: Record<string, FieldValidation>
  ): ValidationResult {
    const errors: Record<string, string[]> = {};

    for (const [field, validation] of Object.entries(rules)) {
      const value = data[field];
      const fieldErrors: string[] = [];

      // Required validation
      if (validation.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${field} is required`);
        continue;
      }

      // Skip other validations if field is empty and not required
      if (!validation.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      const stringValue = String(value);

      // String length validations
      if (validation.minLength && stringValue.length < validation.minLength) {
        fieldErrors.push(`${field} must be at least ${validation.minLength} characters`);
      }

      if (validation.maxLength && stringValue.length > validation.maxLength) {
        fieldErrors.push(`${field} must not exceed ${validation.maxLength} characters`);
      }

      // Pattern validation
      if (validation.pattern && !validation.pattern.test(stringValue)) {
        fieldErrors.push(`${field} format is invalid`);
      }

      // Email validation
      if (validation.email && !this.isValidEmail(stringValue)) {
        fieldErrors.push(`${field} must be a valid email address`);
      }

      // URL validation
      if (validation.url && !this.isValidUrl(stringValue)) {
        fieldErrors.push(`${field} must be a valid URL`);
      }

      // Numeric validations
      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          fieldErrors.push(`${field} must be at least ${validation.min}`);
        }

        if (validation.max !== undefined && value > validation.max) {
          fieldErrors.push(`${field} must not exceed ${validation.max}`);
        }
      }

      // Custom validation
      if (validation.custom) {
        const customError = validation.custom(value);
        if (customError) {
          fieldErrors.push(customError);
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data,
    };
  }

  /**
   * Email validation
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * URL validation
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Phone number validation (basic)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
  }

  /**
   * Strong password validation
   */
  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate credit card number using Luhn algorithm
   */
  static isValidCreditCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s|-/g, '');
    
    if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  /**
   * Validate and sanitize form data
   */
  static sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'number') {
        sanitized[key] = isNaN(value) ? null : value;
      } else if (typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (value === null || value === undefined) {
        sanitized[key] = null;
      } else {
        // For objects and arrays, convert to string and sanitize
        sanitized[key] = this.sanitizeString(JSON.stringify(value));
      }
    }

    return sanitized;
  }
}

/**
 * Custom validation schemas for common use cases
 */
export const ValidationSchemas = {
  // User data validation
  userProfile: z.object({
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    client_name: z.string().min(2).max(100).optional(),
    company: z.string().max(100).optional(),
  }),

  // Widget configuration validation
  widgetConfig: z.object({
    title: z.string().min(1).max(100),
    type: z.enum(['stats', 'automation', 'chart', 'list', 'text', 'image', 'custom']),
    position: z.object({
      x: z.number().min(0),
      y: z.number().min(0),
    }),
    size: z.object({
      width: z.number().min(100).max(1200),
      height: z.number().min(100).max(800),
    }),
    isVisible: z.boolean().default(true),
    isPinned: z.boolean().default(false),
  }),

  // Preferences validation
  userPreferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    language: z.string().length(2),
    timezone: z.string(),
    notifications: z.boolean(),
    autoSave: z.boolean(),
  }),

  // Dashboard settings validation
  dashboardSettings: z.object({
    columns: z.number().min(1).max(12),
    snapToGrid: z.boolean(),
    gridSize: z.number().min(10).max(50),
    autoSave: z.boolean(),
  }),
};

/**
 * Form validation hook
 */
export function useFormValidation<T>(
  schema: z.ZodSchema<T>,
  initialData: Partial<T> = {}
) {
  const [data, setData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => new Set(prev).add(field as string));
    
    // Clear errors for this field
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const validate = useCallback(() => {
    const result = ValidationUtils.validateWithSchema(data, schema);
    setErrors(result.errors);
    return result;
  }, [data, schema]);

  const submit = useCallback(async (
    onSubmit: (data: T) => Promise<void> | void
  ): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      const result = validate();
      
      if (!result.isValid) {
        setIsSubmitting(false);
        return false;
      }

      await onSubmit(result.data!);
      setIsSubmitting(false);
      return true;
    } catch (error) {
      setErrors({ general: ['Submit failed'] });
      setIsSubmitting(false);
      return false;
    }
  }, [validate]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched(new Set());
    setIsSubmitting(false);
  }, [initialData]);

  const hasErrors = Object.keys(errors).length > 0;
  const isFieldTouched = useCallback((field: keyof T) => 
    touched.has(field as string), [touched]);

  return {
    data,
    errors,
    touched,
    isSubmitting,
    hasErrors,
    updateField,
    validate,
    submit,
    reset,
    isFieldTouched,
  };
}

// Re-export useState for convenience
export { useState } from 'react';