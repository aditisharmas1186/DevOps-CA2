/**
 * Production build environment helper for ESKAPE Analysis Application
 * This file helps detect the right paths for client dist files in production
 */
import path from 'path';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * This function helps locate the client dist directory in various environments
 */
export function getClientDistPath() {
  // Check possible locations for client dist
  const possiblePaths = [
    // Standard build output from vite
    path.resolve(__dirname, '..', 'dist', 'public'),
    
    // Client-specific dist folder
    path.resolve(__dirname, '..', 'client', 'dist'),
    
    // When server is in its own dist folder
    path.resolve(__dirname, '..', '..', 'client', 'dist'),
    
    // Default Replit structure
    path.resolve(__dirname, 'public')
  ];
  
  // Return the first path that exists
  for (const distPath of possiblePaths) {
    if (fs.existsSync(distPath)) {
      console.log(`Found client dist at: ${distPath}`);
      return distPath;
    }
  }
  
  // Default fallback
  console.warn('Could not find client dist, using default path');
  return path.resolve(__dirname, '..', 'dist', 'public');
}

/**
 * Check and create required directories
 */
export function ensureDirectories() {
  const dirs = [
    path.resolve(__dirname, '..', 'client', 'dist'),
    path.resolve(__dirname, 'dist')
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      } catch (err) {
        console.warn(`Failed to create directory ${dir}:`, err);
      }
    }
  }
}

/**
 * Handle env variables in production
 */
export function setupEnv() {
  // Check for .env file
  const envPath = path.resolve(__dirname, '..', '.env');
  const exampleEnvPath = path.resolve(__dirname, '..', '.env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(exampleEnvPath)) {
    try {
      // Copy example env as .env if none exists
      fs.copyFileSync(exampleEnvPath, envPath);
      console.log('Created .env file from .env.example');
    } catch (err) {
      console.warn('Failed to create .env file:', err);
    }
  }
  
  // Set production mode
  process.env.NODE_ENV = 'production';
}