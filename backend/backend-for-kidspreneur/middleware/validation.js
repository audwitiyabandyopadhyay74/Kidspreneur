import { validationResult, body, param, query } from 'express-validator';
import { ValidationError } from '@hapi/joi';
import AppError from '../utils/appError.js';
import { logger } from '../utils/logger.js';

// Ensure logger has all required methods
const log = new Proxy(logger, {
  get(target, level) {
    return (message, ...args) => {
      if (typeof target[level] === 'function') {
        return target[level](message, ...args);
      }
      return target.info(message, ...args);
    };
  }
});

/**
 * Middleware to validate request data using express-validator
 * @param {Array} validations - Array of validation rules
 * @returns {Function} Express middleware function
 */
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));

      // Check for validation errors
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      // Format error messages
      const errorMessages = errors.array().map(err => ({
        field: err.param,
        location: err.location,
        message: err.msg,
        value: err.value
      }));

      // Log validation errors
      logger.warn('Validation failed', {
        path: req.originalUrl,
        method: req.method,
        errors: errorMessages,
        ...(process.env.NODE_ENV === 'development' && {
          body: req.body,
          query: req.query,
          params: req.params
        })
      });

      next(new AppError('Validation failed', 400, { errors: errorMessages }));
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to validate request data using Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} [source='body'] - Request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
exports.validateSchema = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const data = req[source];
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
      });

      if (error) {
        const errorMessages = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/["']/g, ''),
          type: detail.type,
          context: detail.context
        }));

        logger.warn('Joi validation failed', {
          path: req.originalUrl,
          method: req.method,
          errors: errorMessages,
          ...(process.env.NODE_ENV === 'development' && { data })
        });

        return next(new AppError('Validation failed', 400, { errors: errorMessages }));
      }

      // Replace the request data with the validated and sanitized data
      req[source] = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation rules using express-validator
const validationRules = {
  // User validation rules
  user: {
    create: [
      body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
      
      body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
      
      body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character')
    ],
    
    login: [
      body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
      
      body('password')
        .notEmpty().withMessage('Password is required')
    ],
    
    update: [
      body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Name cannot be empty')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
      
      body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail()
    ]
  },
  
  // Idea validation rules
  idea: {
    create: [
      body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters'),
      
      body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
      
      body('category')
        .isIn(['Software & AI', 'Real Life Solutions', 'Robotics', 'Other'])
        .withMessage('Invalid category'),
      
      body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array')
        .custom(tags => {
          if (!tags.every(tag => typeof tag === 'string' && tag.length <= 20)) {
            throw new Error('Each tag must be a string with max 20 characters');
          }
          return true;
        })
    ],
    
    update: [
      body('title')
        .optional()
        .trim()
        .notEmpty().withMessage('Title cannot be empty')
        .isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters'),
      
      body('description')
        .optional()
        .trim()
        .notEmpty().withMessage('Description cannot be empty')
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
      
      body('category')
        .optional()
        .isIn(['Software & AI', 'Real Life Solutions', 'Robotics', 'Other'])
        .withMessage('Invalid category')
    ]
  },
  
  // Comment validation rules
  comment: {
    create: [
      body('text')
        .trim()
        .notEmpty().withMessage('Comment text is required')
        .isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
    ]
  },
  
  // Common ID validation
  id: [
    param('id')
      .isMongoId().withMessage('Invalid ID format')
  ],
  
  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer')
      .toInt(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
      .toInt()
  ]
};

// Export all validation utilities
export {
  validate,
  validateSchema,
  validationRules,
  body,
  param,
  query
};

export default validate;
