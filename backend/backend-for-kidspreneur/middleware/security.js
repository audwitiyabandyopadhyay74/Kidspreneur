// Third-party security middleware
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import csrf from 'csurf';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import express from 'express';
import session from 'express-session';
import memorystore from 'memorystore';
import bodyParser from 'body-parser';
import yaml from 'yamljs';
// Local imports
import AppError from '../utils/appError.js';
import { logger } from '../utils/logger.js';

// Create a proxy to ensure all log levels are available
const log = new Proxy(logger, {
  get(target, level) {
    return (message, ...args) => {
      if (typeof target[level] === 'function') {
        return target[level](message, ...args);
      }
      // Fallback to 'info' level if the requested level doesn't exist
      return target.info(message, ...args);
    };
  }
});

// Initialize MemoryStore for session storage
const MemoryStore = memorystore(session);
const sessionStore = new MemoryStore({
  checkPeriod: 86400000 // Prune expired entries every 24h
});

log.warn('Using in-memory session store (not suitable for production)');

/**
 * Rate limiting configuration
 * Limits the number of requests from a single IP address
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    log.warn(`Rate limit exceeded for IP: ${req.ip}`);
    next(
      new AppError(
        'Too many requests from this IP, please try again after 15 minutes',
        429
      )
    );
  }
});

/**
 * CORS configuration
 * Controls which domains can access the API
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      log.warn(`CORS blocked request from origin: ${origin}`);
      callback(new AppError('Not allowed by CORS', 403));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Access-Token',
    'X-Refresh-Token',
    'X-XSRF-TOKEN'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count',
    'X-Request-Id',
    'X-Powered-By',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 600, // 10 minutes
  preflightContinue: false,
  optionsSuccessStatus: 204
};

/**
 * Content Security Policy configuration
 * Controls which resources can be loaded
 */
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com',
      'https://unpkg.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com'
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com'
    ],
    fontSrc: [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com'
    ],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https://*.google-analytics.com',
      'https://*.doubleclick.net',
      'https://*.gstatic.com',
      'https://*.google.com',
      'https://*.githubusercontent.com',
      'https://*.cloudinary.com',
      'https://*.stripe.com'
    ],
    connectSrc: [
      "'self'",
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.doubleclick.net',
      'https://*.stripe.com',
      'ws://localhost:*',
      'wss://*',
      'http://127.0.0.1:*',
      `${process.env.API_URL || 'http://localhost:3000'}`
    ],
    frameSrc: [
      "'self'",
      'https://js.stripe.com',
      'https://hooks.stripe.com',
      'https://www.youtube.com',
      'https://www.google.com',
      'https://www.facebook.com',
      'https://web.facebook.com'
    ],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'", 'data:', 'blob:'],
    frameAncestors: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : []
  }
};

// Security middleware array
const securityMiddleware = [
  // 1) Rate limiting - Apply to all requests
  limiter,
  
  // 2) Set security HTTP headers
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? cspConfig : false,
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    crossOriginOpenerPolicy: process.env.NODE_ENV === 'production',
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true
  }),
  
  // 3) Enable CORS
  cors(corsOptions),
  
  // 4) Body parser, reading data from body into req.body
  express.json({
    limit: process.env.BODY_PARSER_LIMIT || '10kb',
    verify: (req, res, buf) => {
      // Save raw body for signature verification (e.g., for Stripe webhooks)
      if (req.originalUrl.startsWith('/api/v1/webhooks/')) {
        req.rawBody = buf.toString();
      }
    }
  }),
  
  // 5) Parse URL-encoded bodies (for form submissions)
  express.urlencoded({ 
    extended: true, 
    limit: process.env.BODY_PARSER_LIMIT || '10kb' 
  }),
  
  // 6) Data sanitization against NoSQL query injection
  mongoSanitize({
    onSanitize: ({ req, key }) => {
      log.warn(`NoSQL Injection attempt detected: ${key}`, {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        user: req.user ? req.user.id : 'anonymous'
      });
    }
  }),
  
  // 7) Data sanitization against XSS
  xss({
    // Whitelist certain HTML tags and attributes
    whitelist: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      // Add more tags and attributes as needed
    },
    // Additional XSS protection options
    stripIgnoreTag: true, // Strip all HTML not in the whitelist
    stripIgnoreTagBody: ['script', 'style'], // Strip these tags and their content
  }),
  
  // 8) Prevent parameter pollution
  hpp({
    whitelist: [
      // Whitelist parameters you want to allow multiple values for
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
      'createdAt',
      'updatedAt',
      'startDates',
      'locations',
      'guides',
      'reviews'
    ]
  })
];

/**
 * CSRF protection configuration
 * Protects against Cross-Site Request Forgery attacks
 */
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600, // 1 hour
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    path: '/',
    signed: true
  },
  value: (req) => {
    // Get CSRF token from header, query string, or body
    return (
      req.headers['x-csrf-token'] ||
      req.headers['xsrf-token'] ||
      req.body._csrf ||
      req.query._csrf ||
      ''
    );
  }
});

/**
 * Session configuration
 * Secure session management using in-memory store
 */
const sessionConfig = {
  name: 'kidpreneur.sid',
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // Using in-memory store
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    signed: true
  }
};

/**
 * Initialize session middleware with in-memory store
 */
const initSessionMiddleware = () => {
  return session(sessionConfig);
};

/**
 * Security headers middleware
 * Adds additional security headers to responses
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS filtering in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Disable browser caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Enable HSTS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Content Security Policy Report-Only mode (for testing)
  if (process.env.CSP_REPORT_ONLY === 'true') {
    res.setHeader(
      'Content-Security-Policy-Report-Only',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';"
    );
  }
  
  next();
};

/**
 * Request validation middleware
 * Validates incoming requests against a schema
 */
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req[property], {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/['"]/g, '')
        }));

        return next(new AppError('Validation error', 400, errors));
      }

      // Replace the request body with the validated and sanitized data
      req[property] = schema.validate(req[property], {
        stripUnknown: true
      }).value;

      next();
    } catch (error) {
      log.error('Request validation error:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
      next(error);
    }
  };
};

// Get session middleware
const getSessionMiddleware = () => {
  return {
    securityMiddleware,
    csrfProtection,
    sessionMiddleware: initSessionMiddleware(),
    securityHeaders,
    validateRequest,
    limiter,
    cors: cors(corsOptions)
  };
};

// Export the session config for reference
const getSessionConfig = () => sessionConfig;

// Export all middleware components
export {
  getSessionMiddleware,
  getSessionConfig,
  securityHeaders,
  validateRequest,
  csrfProtection,
  corsOptions,
  securityMiddleware
};

export default securityMiddleware;
