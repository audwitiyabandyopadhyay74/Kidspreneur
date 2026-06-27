// Load environment variables first
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Log environment variables for debugging
console.log('Environment:', process.env.NODE_ENV);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Built-in Node.js modules
import fs from 'fs';
import { createServer } from 'http';

// Third-party dependencies
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import { Server } from 'socket.io';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Import Swagger configuration
import swaggerSpec from '../config/swagger.js';

// Import passport configuration
import '../config/passport.js';

// Import middleware
import security, { getSessionMiddleware } from '../middleware/security.js';
import { globalErrorHandler, notFoundHandler } from '../middleware/errorHandler.js';
import { logger, requestLogger } from '../utils/logger.js';

// Import application configuration
import config from './config/index.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  // Close server & exit process
  server?.close(() => {
    process.exit(1);
  });
});

// Simple console logger for startup
const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch (level.toLowerCase()) {
    case 'error':
      console.error(logMessage);
      break;
    case 'warn':
      console.warn(logMessage);
      break;
    default:
      console.log(logMessage);
  }
};

// Application configuration
log('Loading configurations...');

// Initialize Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Trust proxy (important for rate limiting and secure cookies)
app.set('trust proxy', 1);

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: config.security.corsOptions.origin,
    methods: config.security.corsOptions.methods,
    allowedHeaders: config.security.corsOptions.allowedHeaders,
    credentials: config.security.corsOptions.credentials,
  }
});

// Import middleware
log('Loading middleware...');

// Initialize security middleware
const initializeSecurity = async () => {
  try {
    log('Initializing security middleware...');
    
    // Get all security middleware
    const { 
      securityMiddleware, 
      sessionMiddleware, 
      securityHeaders, 
      limiter,
      cors: corsMiddleware 
    } = getSessionMiddleware();
    
    // Apply base security middleware
    app.use(securityMiddleware);
    
    // Apply CORS
    app.use(corsMiddleware);
    
    // Body parsing
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    
    // Data sanitization
    app.use(mongoSanitize());
    app.use(xss());
    app.use(hpp());
    
    // Compression
    app.use(compression());
    
    // Session and authentication middleware
    app.use(sessionMiddleware);
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Security headers
    app.use(securityHeaders);
    
    // Request logging
    app.use(requestLogger);
    
    // Apply rate limiting to all routes
    app.use(limiter);
    
    log('Security middleware initialized successfully');
    return true;
  } catch (err) {
    log(`Failed to initialize security middleware: ${err.message}`, 'error');
    log(err.stack, 'error');
    throw err;
  }
};

// Wrap middleware initialization in an async IIFE
(async () => {
  try {
    await initializeSecurity();
    log('Middleware loaded successfully');
  } catch (err) {
    log(`Failed to load middleware: ${err.message}`, 'error');
    log(err.stack, 'error');
    process.exit(1);
  }
})();

// Ensure logs directory exists (skip in serverless environments like Vercel)
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true, mode: 0o755 });
      log(`Created logs directory at: ${logsDir}`);
    }
  } catch (error) {
    log(`Warning: Could not create logs directory: ${error.message}`, 'warn');
  }
}

// Import route handlers
import authRoutes from '../routes/auth.js';
import ideaRoutes from '../routes/idea.js';
import leaderboardRoutes from '../routes/leaderboard.js';
import notificationRoutes from '../routes/notification.js';
import paymentRoutes from '../routes/payment.js';
import settingsRoutes from '../routes/settings.js';
import userRoutes from '../routes/users.js';
import contactRoutes from '../routes/contact.js';

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ideas', ideaRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/contact', contactRoutes);

// Import API documentation
// import swaggerUi from 'swagger-ui-express';
// import swaggerSpec from '../config/swagger.js';

// Passport config
import '../config/passport.js';

// Apply security middleware
app.use(helmet(config.security.helmetOptions));
app.use(cors(config.security.corsOptions));

// Rate limiting

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
  ]
}));

// Compression
if (config.performance.compression) {
  app.use(compression());
}

// ETag
app.set('etag', config.performance.etag);

// Socket.IO connection handler
io.on('connection', (socket) => {
  logger.info('New client connected');
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
  
  // Add your socket event handlers here
});

// Add socket.io to app locals
app.set('io', io);

// API Documentation
if (config.env !== 'production') {
  app.use(
    `${config.api.docsPath}`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Kidpreneur API Documentation',
      customfavIcon: '/favicon.ico',
    })
  );
  
  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// Quick check to see if the server is alive
app.get('/', (req, res) => {
  res.send('Kidpreneur backend is running!');
});

// Health check endpoint
app.get(`${config.api.prefix}/health`, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API Routes
app.use(`${config.api.prefix}/auth`, authRoutes);
app.use(`${config.api.prefix}/ideas`, ideaRoutes);
app.use(`${config.api.prefix}/leaderboard`, leaderboardRoutes);
app.use(`${config.api.prefix}/payments`, paymentRoutes);
app.use(`${config.api.prefix}/settings`, settingsRoutes);
app.use(`${config.api.prefix}/users`, userRoutes);
app.use(`${config.api.prefix}/contact`, contactRoutes);

// Serve static files in production
if (config.env === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

// Handle 404 routes - This should be after all other routes
app.all('*', notFoundHandler);

// Global error handler - This should be the last middleware
app.use(globalErrorHandler);

// Connect to the database and start the server
const connectDB = async () => {
  try {
    // Log environment for debugging
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Get MongoDB URI
    const mongoUri = process.env.MONGO_URI || config.database.uri;
    log(`Connecting to MongoDB at ${mongoUri.replace(/:[^:]*?@/, ':*****@')}`);
    
    // Connect to MongoDB with retry logic
    let retries = 5;
    while (retries > 0) {
      try {
        const conn = await mongoose.connect(mongoUri, {
          ...config.database.options,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        log(`MongoDB Connected: ${conn.connection.host}`, 'success');
        break;
      } catch (error) {
        retries--;
        log(`MongoDB connection failed. Retries left: ${retries}`, 'warn');
        log(`Error: ${error.message}`, 'error');
        
        if (retries === 0) {
          throw error;
        }
        
        // Wait for 5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Start HTTP server
    httpServer.listen(config.port, config.host, (error) => {
      if (error) {
        log(`Failed to start server: ${error.message}`, 'error');
        process.exit(1);
      }
      
      log(`Server running in ${config.env} mode on http://${config.host}:${config.port}`, 'success');
      
      // Set up socket.io
      io.on('connection', (socket) => {
        log('New client connected', 'info');
        
        socket.on('disconnect', () => {
          log('Client disconnected', 'info');
        });
      });
      
      // Make io accessible to routes
      app.set('io', io);
      
      // Log routes
      log('Available routes:', 'info');
      app._router.stack
        .filter(r => r.route)
        .map(r => `[${Object.keys(r.route.methods).join(', ').toUpperCase()}] ${r.route.path}`)
        .forEach(route => log(`  ${route}`, 'debug'));
    });
  } catch (error) {
    log(`Database connection failed: ${error.message}`, 'error');
    log(`Error details: ${JSON.stringify(error, null, 2)}`, 'error');
    process.exit(1);
  }
};

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Start the server
    const server = httpServer.listen(config.port, () => {
      log(`Server running in ${config.env} mode on port ${config.port}...`);
      
      // Log environment information
      log(`Environment: ${config.env}`);
      log(`Database: ${config.database.uri.replace(/:[^:]*?@/, ':*****@')}`);
      log(`API Documentation: http://localhost:${config.port}${config.api.docsPath}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      log(`UNHANDLED REJECTION! 💥 Shutting down...`);
      log(err.name, err.message);
      // Close server & exit process
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      log(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM (For Heroku)
    process.on('SIGTERM', () => {
      log('👋 SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        log('💥 Process terminated!');
        process.exit(0);
      });
    });
  } catch (error) {
    log(`Failed to start server: ${error.message}`, 'error');
    log(error.stack, 'error');
    process.exit(1);
  }
};

// Start the server
startServer();