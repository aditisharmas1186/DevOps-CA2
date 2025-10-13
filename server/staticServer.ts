/**
 * Static file server for production build
 * This provides an alternative to the development mode Vite server
 */
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configure static file serving for production build
 */
export function setupStaticServer(app: Express) {
  // Check different potential client build locations
  const potentialPaths = [
    path.resolve(__dirname, '..', 'dist', 'public'),
    path.resolve(__dirname, '..', 'client', 'dist'),
    path.resolve(__dirname, '..', '..', 'client', 'dist'),
    path.resolve(__dirname, 'public')
  ];
  
  let distPath = '';
  
  // Find the first valid path
  for (const potentialPath of potentialPaths) {
    if (fs.existsSync(potentialPath) && 
        fs.existsSync(path.join(potentialPath, 'index.html'))) {
      distPath = potentialPath;
      console.log(`Using client build from: ${distPath}`);
      break;
    }
  }
  
  if (!distPath) {
    console.warn('Client build not found. Application will serve API endpoints only.');
    return;
  }
  
  // Serve static files
  app.use(express.static(distPath));
  
  // Serve index.html for all routes except /api routes
  app.use('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    
    res.sendFile(path.join(distPath, 'index.html'));
  });
}