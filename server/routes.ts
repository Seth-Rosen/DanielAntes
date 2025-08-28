import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve static data files from public/data directory
  app.use('/data', express.static('public/data'));
  
  // Health check endpoint (useful for deployment monitoring)
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  
  return httpServer;
}