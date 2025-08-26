import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertImageSchema, insertProjectSchema, insertPageSchema, authSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";
import express from "express";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Simple session storage for admin authentication
const sessions = new Map<string, { userId: string; expires: Date }>();

function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const session = sessions.get(sessionId);
  if (!session || session.expires < new Date()) {
    sessions.delete(sessionId);
    return res.status(401).json({ message: 'Session expired' });
  }
  
  req.userId = session.userId;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = authSchema.parse(req.body);
      
      // Simple hardcoded auth for now
      if (username === "admin" && password === (process.env.ADMIN_PASSWORD || "admin123")) {
        const sessionId = Math.random().toString(36).substring(2);
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        sessions.set(sessionId, { userId: 'admin', expires });
        
        res.json({ sessionId, expires });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ success: true });
  });

  // Images
  app.get("/api/images", async (req, res) => {
    try {
      const { tag, project } = req.query;
      let images = await storage.getImages();
      
      if (tag) {
        images = images.filter(img => img.tags.includes(tag as string));
      }
      
      if (project) {
        images = images.filter(img => img.projectId === project);
      }
      
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch images' });
    }
  });

  app.get("/api/images/:id", async (req, res) => {
    try {
      const image = await storage.getImage(req.params.id);
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
      res.json(image);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch image' });
    }
  });

  app.post("/api/images", requireAuth, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const imageData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        projectId: req.body.projectId || undefined,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        slideshow: req.body.slideshow === 'true',
        carouselFeature: req.body.carouselFeature === 'true',
        featured: req.body.featured === 'true',
      };

      const validatedData = insertImageSchema.parse(imageData);
      const image = await storage.createImage(validatedData);
      
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid image data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create image' });
      }
    }
  });

  app.patch("/api/images/:id", requireAuth, async (req, res) => {
    try {
      const updateData = insertImageSchema.partial().parse(req.body);
      const image = await storage.updateImage(req.params.id, updateData);
      
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      res.json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid image data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update image' });
      }
    }
  });

  app.delete("/api/images/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteImage(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Image not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete image' });
    }
  });

  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid project data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create project' });
      }
    }
  });

  app.patch("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const updateData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, updateData);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid project data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update project' });
      }
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete project' });
    }
  });

  // Pages (for Puck editor)
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.getPages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch pages' });
    }
  });

  app.get("/api/pages/slug/:slug", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch page' });
    }
  });

  app.get("/api/pages/:id", async (req, res) => {
    try {
      const page = await storage.getPage(req.params.id);
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch page' });
    }
  });

  app.post("/api/pages", requireAuth, async (req, res) => {
    try {
      const pageData = insertPageSchema.parse(req.body);
      const page = await storage.createPage(pageData);
      res.status(201).json(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid page data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create page' });
      }
    }
  });

  app.patch("/api/pages/:id", requireAuth, async (req, res) => {
    try {
      const updateData = insertPageSchema.partial().parse(req.body);
      const page = await storage.updatePage(req.params.id, updateData);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      res.json(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid page data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update page' });
      }
    }
  });

  app.delete("/api/pages/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deletePage(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Page not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete page' });
    }
  });

  // Site settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });

  app.patch("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.updateSiteSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update settings' });
    }
  });

  // Serve uploaded images
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  // Render pages by slug (for published pages)
  app.get("/:slug", async (req, res, next) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page || !page.published) {
        return next(); // Let other routes handle this
      }
      
      // In a real implementation, you'd render the page with server-side rendering
      // For now, we'll return the page data as JSON (frontend can handle rendering)
      res.json(page);
    } catch (error) {
      next();
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
