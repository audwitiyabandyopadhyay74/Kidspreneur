// Development configuration
export default {
  // Environment
  env: 'development',
  
  // Server settings
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    environment: 'development',
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
      max: 1000, // Higher limit for development
    },
    corsOptions: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
    },
    helmetOptions: {
      contentSecurityPolicy: false, // Disable in development for easier debugging
    },
  },

  // Database settings
  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/kidpreneur_dev',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: true, // Enable in development
    },
  },
  
  // Performance settings
  performance: {
    etag: false, // Disable in development for easier debugging
    compression: false, // Disable in development for easier debugging
  },
  
  // Logging settings
  logging: {
    level: 'debug',
    format: 'dev',
  },

  // Session settings
  session: {
    secret: 'dev-secret-key',
    resave: false,
    saveUninitialized: true, // Allow uninitialized sessions in development
    cookie: {
      httpOnly: true,
      secure: false, // Disable in development
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  // Server settings
  server: {
    port: process.env.PORT || 5000,
    host: '0.0.0.0',
    env: 'development',
  },

  // API settings
  api: {
    prefix: '/api',
    version: 'v1',
  },

  // Logging settings
  logging: {
    level: 'debug',
    format: 'dev',
  },

  // Performance settings
  performance: {
    etag: false, // Disable in development
    compression: false, // Disable in development for easier debugging
  },

  // Development-specific settings
  dev: {
    logQueries: true,
    logRequests: true,
  },
};
