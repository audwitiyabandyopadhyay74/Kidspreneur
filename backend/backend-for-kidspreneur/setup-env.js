const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate random secrets
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

// Default configuration
const defaultConfig = {
  // Server
  NODE_ENV: 'development',
  PORT: '5000',
  API_PREFIX: '/api/v1',
  
  // Database
  MONGO_URI: 'mongodb://localhost:27017/kidpreneur',
  MONGO_DEBUG: 'true',
  
  // JWT
  JWT_SECRET: generateSecret(),
  JWT_EXPIRES_IN: '90d',
  JWT_COOKIE_EXPIRES_IN: '90',
  
  // Session
  SESSION_SECRET: generateSecret(),
  COOKIE_DOMAIN: 'localhost',
  
  // Frontend
  FRONTEND_URL: 'http://localhost:3000',
  
  // Rate limiting
  RATE_LIMIT_MAX: '100',
  RATE_LIMIT_WINDOW_MS: '900000', // 15 minutes
  
  // Logging
  LOG_LEVEL: 'info',
  
  // Vercel
  VERCEL: '0',
  VERCEL_ENV: 'development'
};

// Generate .env file content
const generateEnvFile = (config) => {
  return Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
};

// Check if .env exists
if (fs.existsSync('.env')) {
  readline.question('A .env file already exists. Do you want to overwrite it? (y/N) ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      writeEnvFile();
    } else {
      console.log('Operation cancelled.');
    }
    readline.close();
  });
} else {
  writeEnvFile();
}

function writeEnvFile() {
  const envContent = generateEnvFile(defaultConfig);
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file has been created successfully!');
  console.log('\nPlease review the configuration and update any values as needed.');
  console.log('Important: Keep your JWT_SECRET and SESSION_SECRET secure!');
}
