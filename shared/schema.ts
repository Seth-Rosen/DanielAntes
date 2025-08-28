import { z } from "zod";

// Image schema
export const imageSchema = z.object({
  id: z.string(),
  filename: z.string(),  // User-defined display name
  originalName: z.string(),
  url: z.string(),  // Path to actual file in /uploads/
  alt: z.string().default(""),  // SEO/accessibility
  projectIds: z.array(z.string()).default([]),  // Many-to-many with projects
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
  coverImage: z.string().optional(),  // Main project image
  images: z.array(z.string()).default([]),  // Gallery image IDs
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  order: z.number().default(0),  // For manual ordering
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
  showInNav: z.boolean().default(true),  // Control nav visibility
  order: z.number().default(0),  // For nav ordering
  parent: z.string().optional(),  // For future hierarchy
  seo: z.object({
    description: z.string().default(""),
    image: z.string().optional(),
  }).default({}),
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
  siteName: z.string().default("Daniel Antes"),
  siteDescription: z.string().default("Master Marquetry & Hardwood Flooring Artisan"),
  theme: z.object({
    primaryColor: z.string().default("hsl(40 50% 65%)"),
    secondaryColor: z.string().default("hsl(30 40% 50%)"),
    fontFamily: z.string().default("system-ui"),
    mode: z.enum(["light", "dark", "auto"]).default("auto"),
  }).default({}),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
  }).default({}),
  socialLinks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
  }).default({}),
  analytics: z.object({
    googleAnalyticsId: z.string().optional(),
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
