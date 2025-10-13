import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import sharp from "sharp";
import mongoose from 'mongoose';

export async function registerRoutes(app: Express) {
  // Health check endpoint for AWS EC2 monitoring
  app.get("/api/health", (_req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    const uptimeSeconds = process.uptime();
    const uptimeFormatted = new Date(uptimeSeconds * 1000).toISOString().substr(11, 8);
    
    res.json({
      status: "ok",
      mongodb: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      uptime: uptimeFormatted,
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
      },
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        console.warn('Database unavailable, using in-memory storage');
      }

      const { image, classification, notes } = req.body;
      if (!image || !classification) {
        return res.status(400).json({ message: "Missing required data" });
      }

      // Basic image preprocessing with Sharp
      const processedImage = await sharp(Buffer.from(image, 'base64'))
        .resize(512, 512, { fit: 'contain' })
        .normalize()
        .toBuffer();

      const analysisData = {
        imageUrl: `data:image/jpeg;base64,${processedImage.toString('base64')}`,
        results: {
          ec: classification.ec,       // E.coli
          sa: classification.sa,       // S.Aureus  
          kp: classification.kp,       // Klebsiella Pneumonae
          invalid: classification.invalid
        },
        notes
      };

      const result = await storage.createAnalysis(analysisData);
      res.json(result);
    } catch (error) {
      console.error('Error processing analysis:', error);
      res.status(500).json({ message: "Error processing analysis" });
    }
  });

  app.get("/api/analyses", async (_req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.warn('Database unavailable, using in-memory storage');
      }
      const analyses = await storage.getAllAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      res.status(500).json({ 
        message: "Server error",
        details: mongoose.connection.readyState !== 1 ? "Database unavailable" : "Error fetching data"
      });
    }
  });

  app.get("/api/analysis/:id", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.warn('Database unavailable, using in-memory storage');
      }
      const analysis = await storage.getAnalysis(req.params.id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  return createServer(app);
}
