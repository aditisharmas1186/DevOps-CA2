// Server build script for ESKAPE Analysis Application
// This script builds the server using TypeScript compiler

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set production mode
process.env.NODE_ENV = 'production';

// Output formatting
const log = (message) => console.log(`[build] ${message}`);
const error = (message) => console.error(`[build] Error: ${message}`);

// Create output directory
const distDir = path.resolve(__dirname, 'server', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build server
log('Building server with TypeScript...');
try {
  execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });
  log('TypeScript compilation successful');
} catch (err) {
  error('TypeScript compilation failed, falling back to esbuild');
  
  try {
    // Alternative: use esbuild as fallback
    execSync('npx esbuild server/index.prod.ts --platform=node --packages=external --bundle --format=esm --outdir=server/dist', 
      { stdio: 'inherit' });
      
    // Rename the output file if needed
    if (fs.existsSync(path.join(distDir, 'index.prod.js'))) {
      fs.copyFileSync(
        path.join(distDir, 'index.prod.js'),
        path.join(distDir, 'index.js')
      );
    }
    
    log('esbuild compilation successful');
  } catch (esbuildErr) {
    error('Both TypeScript and esbuild compilation failed');
    process.exit(1);
  }
}

// Copy necessary files
log('Copying additional files...');

// Create a simple server entrypoint for CJS compatibility
const cjsWrapper = `
// CJS compatibility wrapper for ESM module
import('./index.js').catch(err => {
  console.error('Failed to import ESM module:', err);
  process.exit(1);
});
`;

fs.writeFileSync(path.join(distDir, 'server.cjs'), cjsWrapper);

log('Server build complete');