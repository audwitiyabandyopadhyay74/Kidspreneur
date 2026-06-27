// Load environment variables first
import 'dotenv/config';

// Determine the current environment
const env = process.env.NODE_ENV || 'development';

// Default configuration
const defaultConfig = {
  env,
  port: process.env.PORT || 5000,
  host: process.env.HOST || '0.0.0.0',
  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/kidpreneur',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
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
  },
};

// Load the appropriate configuration based on the environment
let config = { ...defaultConfig };

// Load environment-specific config if it exists
try {
  const envConfig = await import(`./${env}.js`);
  const envConfigObj = envConfig.default || {};
  
  // Deep merge with default config
  config = {
    ...defaultConfig,
    ...envConfigObj,
    database: {
      ...defaultConfig.database,
      ...(envConfigObj.database || {}),
      options: {
        ...defaultConfig.database.options,
        ...(envConfigObj.database?.options || {}),
      },
    },
    security: {
      ...defaultConfig.security,
      ...(envConfigObj.security || {}),
      rateLimit: {
        ...defaultConfig.security.rateLimit,
        ...(envConfigObj.security?.rateLimit || {}),
      },
      corsOptions: {
        ...defaultConfig.security.corsOptions,
        ...(envConfigObj.security?.corsOptions || {}),
      },
    },
  };
  
  console.log(`✅ Loaded ${env} configuration`);
} catch (error) {
  console.error(`❌ Error loading ${env} config:`, error.message);
  console.warn(`⚠️  Using default configuration`);
}

export default config;
