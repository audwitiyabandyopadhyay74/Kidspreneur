// This script is used by Vercel for the build process
const { execSync } = require('child_process');

console.log('Running vercel-build.js...');

// Install production dependencies only
execSync('npm install --production', { stdio: 'inherit' });

console.log('Build completed successfully!');
