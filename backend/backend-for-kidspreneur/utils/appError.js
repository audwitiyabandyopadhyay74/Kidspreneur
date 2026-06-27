import { inspect } from 'util';

/**
 * Custom error class for operational errors (errors we can predict might happen)
 * @extends Error
 */
class AppError extends Error {
  /**
   * Create a custom AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {Object} [details] - Additional error details
   * @param {boolean} [isOperational=true] - Whether the error is operational (expected) or programming error
   */
  constructor(message, statusCode = 500, details = {}, isOperational = true) {
    super(message);
    
    // Ensure the error name is the same as the class name
    this.name = this.constructor.name;
    
    // HTTP status code
    this.statusCode = statusCode;
    
    // Status based on status code (fail for 4xx, error for 5xx)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Indicates if this is an operational error (expected) or a programming error
    this.isOperational = isOperational;
    
    // Additional error details
    this.details = details;
    
    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
    
    // Clean up the stack trace in production
    if (process.env.NODE_ENV === 'production') {
      this.cleanupStackTrace();
    }
  }
  
  /**
   * Clean up the stack trace for production
   * Removes sensitive file paths and node_modules from stack traces
   */
  cleanupStackTrace() {
    if (!this.stack) return;
    
    // Remove absolute file paths
    this.stack = this.stack
      .split('\n')
      .map(line => {
        // Remove absolute file paths
        line = line.replace(/\s*at\s+.*\(([^)]+)\)/g, (match, p1) => {
          // Keep only the file name and line number
          const parts = p1.split(':');
          const file = parts[0].split(/[\\/]/).pop();
          return match.replace(p1, `${file}:${parts[1] || '?'}`);
        });
        
        // Remove node_modules from stack traces
        if (line.includes('node_modules')) {
          return null;
        }
        
        return line;
      })
      .filter(Boolean) // Remove null/undefined lines
      .join('\n');
  }
  
  /**
   * Convert the error to a plain object for JSON responses
   * @returns {Object} Plain object representation of the error
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusCode: this.statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
      ...(Object.keys(this.details).length > 0 && { details: this.details })
    };
  }
  
  /**
   * Create a new AppError from another error
   * @param {Error} error - Original error
   * @param {Object} [options] - Additional options
   * @param {number} [options.statusCode=500] - HTTP status code
   * @param {boolean} [options.isOperational=true] - Whether the error is operational
   * @param {Object} [options.details] - Additional error details
   * @returns {AppError} New AppError instance
   */
  static fromError(error, { statusCode = 500, isOperational = true, details = {} } = {}) {
    if (error instanceof AppError) {
      return error;
    }
    
    const appError = new AppError(
      error.message || 'An error occurred',
      statusCode,
      { ...details, originalError: error.name },
      isOperational
    );
    
    // Preserve the stack trace if available
    if (error.stack) {
      appError.stack = error.stack;
    }
    
    return appError;
  }
}

export default AppError;
