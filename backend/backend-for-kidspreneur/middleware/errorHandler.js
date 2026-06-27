// Third-party dependencies
import Joi from '@hapi/joi';
const { ValidationError } = Joi;

// Local imports
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
 * Handle MongoDB CastError (invalid ID format)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB duplicate field error (unique constraint)
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? Object.values(err.keyValue)[0] : 'some value';
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
  const message = `Duplicate ${field} value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB validation errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

/**
 * Handle expired JWT token
 */
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

/**
 * Handle Joi validation errors
 */
const handleJoiValidationError = (err) => {
  const errors = err.details.map((detail) => detail.message);
  const message = `Validation error: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Development error response with stack trace and error details
 */
const sendErrorDev = (err, req, res) => {
  // Log the error for development
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'Not authenticated',
    ...(process.env.NODE_ENV === 'development' && {
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers
    })
  };

  // Special handling for validation errors
  if (err.isJoi) {
    errorDetails.validation = err.details;
  }

  logger.error('Error in development', errorDetails);

  // API response
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      error: {
        message: err.message,
        status: err.status,
        code: err.statusCode || 500,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: err.stack,
          details: errorDetails
        })
      }
    });
  }

  // Rendered website error page (if using server-side rendering)
  return res.status(err.statusCode || 500).render('error', {
    title: 'Something went wrong!',
    statusCode: err.statusCode || 500,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
};

/**
 * Production error response (no stack traces or error details leaked to client)
 */
const sendErrorProd = (err, req, res) => {
  // Log the error for production monitoring
  const errorDetails = {
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode || 500,
    stack: err.stack,
    user: req.user ? req.user.id : 'Not authenticated',
    ...(err.isOperational && { isOperational: true })
  };

  // Special handling for validation errors
  if (err.isJoi) {
    errorDetails.validation = err.details;
  }

  // Log the error with appropriate level
  if (err.isOperational) {
    logger.warn('Operational error', errorDetails);
  } else {
    logger.error('Unexpected error', errorDetails);
  }

  // API response
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message
      });
    }
    
    // Programming or other unknown error: don't leak error details
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }

  // Rendered website error page
  if (err.isOperational) {
    return res.status(err.statusCode || 500).render('error', {
      title: 'Something went wrong!',
      message: err.message
    });
  }
  
  // Programming or other unknown error
  return res.status(500).render('error', {
    title: 'Something went wrong!',
    message: 'Please try again later.'
  });
};

/**
 * Global error handling middleware
 * Centralized error handling for all routes
 */
const globalErrorHandler = (err, req, res, next) => {
  // Set default values if not set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle different environments
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };
    
    // Handle different types of errors
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.isJoi) error = handleJoiValidationError(err);
    
    // Handle Joi validation errors from @hapi/joi
    if (err.details && Array.isArray(err.details)) {
      error = handleJoiValidationError(err);
    }

    sendErrorProd(error, req, res);
  }
};

/**
 * Handle 404 routes
 * This should be placed after all other routes
 */
const notFoundHandler = (req, res) => {
  // Log 404 errors
  logger.warn('Resource not found', {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    ...(process.env.NODE_ENV === 'development' && {
      query: req.query,
      params: req.params,
      headers: req.headers
    })
  });

  // API response
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      status: 'fail',
      message: `Can't find ${req.originalUrl} on this server!`,
      ...(process.env.NODE_ENV === 'development' && {
        method: req.method,
        timestamp: new Date().toISOString()
      })
    });
  }

  // Rendered 404 page (if using server-side rendering)
  return res.status(404).render('404', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
};

export {
  globalErrorHandler,
  notFoundHandler,
  // Export individual error handlers for testing
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleValidationErrorDB,
  handleJWTError,
  handleJWTExpiredError,
  handleJoiValidationError,
  sendErrorDev,
  sendErrorProd,
};

export default globalErrorHandler;
