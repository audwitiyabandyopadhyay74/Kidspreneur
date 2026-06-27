// Production configuration
export default {
  // Environment
  env: 'production',
  
  // Server settings
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    environment: 'production',
  },
  
  // API settings
  api: {
    prefix: '/api',
    version: 'v1',
  },
  
  // Security settings
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    corsOptions: {
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
    },
    helmetOptions: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"].concat(process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            ['http://localhost:3000']
          ),
        },
      },
    },
  },

  // Database settings
  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/kidpreneur',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: false, // Disable in production
    },
  },

  // Session settings
  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // Enable in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'none', // Required for cross-site cookies
    },
  },
  
  // Performance settings
  performance: {
    etag: true,
    compression: true,
  },
  
  // Logging settings
  logging: {
    level: 'info',
    format: 'combined',
  },

  // Logging
  logging: {
    level: 'info',
    format: 'combined',
    file: 'logs/combined.log',
    errorFile: 'logs/error.log',
  },

  // Performance
  performance: {
    compression: true,
    etag: true,
    requestTimeout: 10000, // 10 seconds
  },

  // API settings
  api: {
    prefix: '/api',
    version: 'v1',
    docsPath: '/api-docs',
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8000,
  host: process.env.HOST || '0.0.0.0',
};
