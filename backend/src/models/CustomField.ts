import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomFieldDefinition extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  label: string;
  description?: string;

  // Field type and validation
  fieldType: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect' | 'email' | 'phone' | 'url' | 'textarea' | 'currency' | 'percentage';
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';

  // Applies to which resource types
  appliesTo: ('Contact' | 'Deal' | 'Pipeline')[];

  // Field configuration
  isRequired: boolean;
  isUnique: boolean;
  isSearchable: boolean;

  // Validation rules
  validation: {
    min?: number;
    max?: number;
    pattern?: string;
    maxLength?: number;
    minLength?: number;
  };

  // Select field options
  options?: Array<{
    value: string;
    label: string;
    color?: string;
    isDefault?: boolean;
  }>;

  // Default value
  defaultValue?: any;

  // Display configuration
  displayConfig: {
    showInList: boolean;
    showInDetails: boolean;
    showInCreate: boolean;
    showInEdit: boolean;
    order: number;
    width?: string;
    group?: string;
  };

  // System fields
  isSystem: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const customFieldDefinitionSchema = new Schema<ICustomFieldDefinition>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    match: /^[a-zA-Z][a-zA-Z0-9_]*$/, // Valid field name pattern
    maxlength: 50
  },
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },

  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'number', 'boolean', 'date', 'select', 'multiselect', 'email', 'phone', 'url', 'textarea', 'currency', 'percentage']
  },
  dataType: {
    type: String,
    required: true,
    enum: ['string', 'number', 'boolean', 'date', 'array']
  },

  appliesTo: [{
    type: String,
    enum: ['Contact', 'Deal', 'Pipeline'],
    required: true
  }],

  isRequired: {
    type: Boolean,
    default: false
  },
  isUnique: {
    type: Boolean,
    default: false
  },
  isSearchable: {
    type: Boolean,
    default: true
  },

  validation: {
    min: Number,
    max: Number,
    pattern: String,
    maxLength: {
      type: Number,
      max: 10000
    },
    minLength: {
      type: Number,
      min: 0
    }
  },

  options: [{
    value: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      match: /^#[0-9A-F]{6}$/i
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],

  defaultValue: Schema.Types.Mixed,

  displayConfig: {
    showInList: {
      type: Boolean,
      default: true
    },
    showInDetails: {
      type: Boolean,
      default: true
    },
    showInCreate: {
      type: Boolean,
      default: true
    },
    showInEdit: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 1000
    },
    width: String,
    group: String
  },

  isSystem: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index to ensure unique field names per user and resource type
customFieldDefinitionSchema.index({ userId: 1, name: 1, appliesTo: 1 }, { unique: true });
customFieldDefinitionSchema.index({ userId: 1, isActive: 1 });
customFieldDefinitionSchema.index({ userId: 1, appliesTo: 1, 'displayConfig.order': 1 });

// Validate that select fields have options
customFieldDefinitionSchema.pre('save', function(next) {
  if (['select', 'multiselect'].includes(this.fieldType)) {
    if (!this.options || this.options.length === 0) {
      return next(new Error('Select fields must have at least one option'));
    }
  }

  // Set dataType based on fieldType if not explicitly set
  if (!this.dataType) {
    switch (this.fieldType) {
      case 'number':
      case 'currency':
      case 'percentage':
        this.dataType = 'number';
        break;
      case 'boolean':
        this.dataType = 'boolean';
        break;
      case 'date':
        this.dataType = 'date';
        break;
      case 'multiselect':
        this.dataType = 'array';
        break;
      default:
        this.dataType = 'string';
    }
  }

  next();
});

export const CustomFieldDefinition = mongoose.model<ICustomFieldDefinition>('CustomFieldDefinition', customFieldDefinitionSchema);

// Custom field value validation service
export class CustomFieldValidator {
  static validate(value: any, definition: ICustomFieldDefinition): { valid: boolean; error?: string } {
    // Required field validation
    if (definition.isRequired && (value === null || value === undefined || value === '')) {
      return { valid: false, error: `${definition.label} is required` };
    }

    // Skip validation if value is empty and not required
    if (value === null || value === undefined || value === '') {
      return { valid: true };
    }

    // Type-specific validation
    switch (definition.fieldType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { valid: false, error: `${definition.label} must be a valid email address` };
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          return { valid: false, error: `${definition.label} must be a valid URL` };
        }
        break;

      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value)) {
          return { valid: false, error: `${definition.label} must be a valid phone number` };
        }
        break;

      case 'number':
      case 'currency':
      case 'percentage':
        if (typeof value !== 'number' || isNaN(value)) {
          return { valid: false, error: `${definition.label} must be a valid number` };
        }
        if (definition.validation.min !== undefined && value < definition.validation.min) {
          return { valid: false, error: `${definition.label} must be at least ${definition.validation.min}` };
        }
        if (definition.validation.max !== undefined && value > definition.validation.max) {
          return { valid: false, error: `${definition.label} must be at most ${definition.validation.max}` };
        }
        break;

      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          return { valid: false, error: `${definition.label} must be text` };
        }
        if (definition.validation.minLength && value.length < definition.validation.minLength) {
          return { valid: false, error: `${definition.label} must be at least ${definition.validation.minLength} characters` };
        }
        if (definition.validation.maxLength && value.length > definition.validation.maxLength) {
          return { valid: false, error: `${definition.label} must be at most ${definition.validation.maxLength} characters` };
        }
        if (definition.validation.pattern) {
          const regex = new RegExp(definition.validation.pattern);
          if (!regex.test(value)) {
            return { valid: false, error: `${definition.label} format is invalid` };
          }
        }
        break;

      case 'select':
        const validOption = definition.options?.some(opt => opt.value === value);
        if (!validOption) {
          return { valid: false, error: `${definition.label} must be one of the valid options` };
        }
        break;

      case 'multiselect':
        if (!Array.isArray(value)) {
          return { valid: false, error: `${definition.label} must be an array` };
        }
        const validOptions = definition.options?.map(opt => opt.value) || [];
        const invalidValues = value.filter(v => !validOptions.includes(v));
        if (invalidValues.length > 0) {
          return { valid: false, error: `${definition.label} contains invalid options: ${invalidValues.join(', ')}` };
        }
        break;

      case 'date':
        if (!(value instanceof Date) && !Date.parse(value)) {
          return { valid: false, error: `${definition.label} must be a valid date` };
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return { valid: false, error: `${definition.label} must be true or false` };
        }
        break;
    }

    return { valid: true };
  }

  static async validateCustomFields(
    customFields: Map<string, any>,
    userId: string,
    resourceType: 'Contact' | 'Deal' | 'Pipeline'
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Get all field definitions for this user and resource type
    const definitions = await CustomFieldDefinition.find({
      userId: new mongoose.Types.ObjectId(userId),
      appliesTo: resourceType,
      isActive: true
    });

    // Validate each provided custom field
    for (const [fieldName, value] of customFields) {
      const definition = definitions.find(def => def.name === fieldName);
      if (!definition) {
        errors.push(`Unknown custom field: ${fieldName}`);
        continue;
      }

      const validation = this.validate(value, definition);
      if (!validation.valid) {
        errors.push(validation.error!);
      }
    }

    // Check for missing required fields
    for (const definition of definitions) {
      if (definition.isRequired && !customFields.has(definition.name)) {
        errors.push(`Required field ${definition.label} is missing`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default CustomFieldDefinition;