// Third-party dependencies
import jwt from 'jsonwebtoken';

// Local imports
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
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
 * Middleware to protect routes that require authentication
 * Verifies JWT token and attaches user to request object
 */
const protect = catchAsync(async (req, res, next) => {
  let token;
  
  // 1) Get token from header
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    // 2) Or get token from cookie
    token = req.cookies.jwt;
  }

  // 3) Check if token exists
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  try {
    // Debug: Log environment variables and token
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    console.log('Token to verify:', token.substring(0, 10) + '...');
    
    // 4) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully');

    // 5) Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 6) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }

    // 7) GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser; // For templates if needed
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error);
    return next(new AppError('Invalid token or session expired', 401));
  }
});

/**
 * Middleware to restrict routes to specific roles
 * @param {...String} roles - Allowed user roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

/**
 * Middleware to check if user is logged in (for frontend)
 * Similar to protect but doesn't throw error, just sets res.locals.user
 */
const isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1) Verify token
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
    }
  } catch (err) {
    // Do nothing, just move to next middleware
  }
  next();
};

// Export all auth middleware
export { protect, restrictTo, isLoggedIn };

export default protect;