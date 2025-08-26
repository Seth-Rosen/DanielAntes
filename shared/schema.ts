import { z } from "zod";

// Image schema
export const imageSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  projectId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  slideshow: z.boolean().default(false),
  carouselFeature: z.boolean().default(false),
  featured: z.boolean().default(false),
  uploadedAt: z.string(),
});

export const insertImageSchema = imageSchema.omit({ id: true, uploadedAt: true });

// Project schema
export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  images: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertProjectSchema = projectSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Page schema for Puck data
export const pageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  data: z.record(z.any()), // Puck data structure
  published: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertPageSchema = pageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Auth schema
export const authSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Site settings schema
export const siteSettingsSchema = z.object({
  siteName: z.string().default("Daniel Antes Portfolio"),
  tagline: z.string().default("Master Marquetry & Hardwood Flooring Artisan"),
  primaryColor: z.string().default("hsl(40 50% 65%)"),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
  }).default({}),
});

export type Image = z.infer<typeof imageSchema>;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Project = z.infer<typeof projectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Page = z.infer<typeof pageSchema>;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Auth = z.infer<typeof authSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
