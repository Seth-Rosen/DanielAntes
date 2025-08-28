import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import fs from "fs/promises";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve static data files from public/data directory
  app.use('/data', express.static('public/data'));
  
  // Storage write endpoint for local development
  // This will be replaced by GitHub API in production
  app.post("/api/storage/write", express.json(), async (req, res) => {
    try {
      const { filename, data } = req.body;
      
      if (!filename || !data) {
        return res.status(400).json({ error: "Missing filename or data" });
      }
      
      // Security: Only allow writing to specific JSON files
      const allowedFiles = ['pages.json', 'projects.json', 'images.json', 'settings.json'];
      if (!allowedFiles.includes(filename)) {
        return res.status(403).json({ error: "Invalid filename" });
      }
      
      // Write to public/data directory
      const filePath = path.join(process.cwd(), 'public', 'data', filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      
      console.log(`[Server] Wrote ${filename}`);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to write file:', error);
      res.status(500).json({ error: "Failed to write file" });
    }
  });
  
  // Health check endpoint (useful for deployment monitoring)
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  
  return httpServer;
}