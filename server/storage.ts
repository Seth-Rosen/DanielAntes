import { 
  type Image, 
  type InsertImage, 
  type Project, 
  type InsertProject,
  type Page,
  type InsertPage,
  type SiteSettings,
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  // Images
  getImages(): Promise<Image[]>;
  getImage(id: string): Promise<Image | undefined>;
  getImagesByProject(projectId: string): Promise<Image[]>;
  getImagesByTag(tag: string): Promise<Image[]>;
  createImage(image: InsertImage): Promise<Image>;
  updateImage(id: string, image: Partial<InsertImage>): Promise<Image | undefined>;
  deleteImage(id: string): Promise<boolean>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Pages
  getPages(): Promise<Page[]>;
  getPage(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: string): Promise<boolean>;
  
  // Site Settings
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;
}

export class FileStorage implements IStorage {
  private dataDir = path.resolve(process.cwd(), "data");
  private uploadsDir = path.resolve(process.cwd(), "uploads");

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create directories:", error);
    }
  }

  private async readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return defaultValue;
    }
  }

  private async writeJsonFile<T>(filename: string, data: T): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Failed to write ${filename}:`, error);
      throw error;
    }
  }

  // Images
  async getImages(): Promise<Image[]> {
    return this.readJsonFile("images.json", []);
  }

  async getImage(id: string): Promise<Image | undefined> {
    const images = await this.getImages();
    return images.find(img => img.id === id);
  }

  async getImagesByProject(projectId: string): Promise<Image[]> {
    const images = await this.getImages();
    return images.filter(img => img.projectId === projectId);
  }

  async getImagesByTag(tag: string): Promise<Image[]> {
    const images = await this.getImages();
    return images.filter(img => img.tags.includes(tag));
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const images = await this.getImages();
    const image: Image = {
      ...insertImage,
      id: randomUUID(),
      uploadedAt: new Date().toISOString(),
    };
    images.push(image);
    await this.writeJsonFile("images.json", images);
    return image;
  }

  async updateImage(id: string, updateData: Partial<InsertImage>): Promise<Image | undefined> {
    const images = await this.getImages();
    const index = images.findIndex(img => img.id === id);
    if (index === -1) return undefined;

    images[index] = { ...images[index], ...updateData };
    await this.writeJsonFile("images.json", images);
    return images[index];
  }

  async deleteImage(id: string): Promise<boolean> {
    const images = await this.getImages();
    const index = images.findIndex(img => img.id === id);
    if (index === -1) return false;

    images.splice(index, 1);
    await this.writeJsonFile("images.json", images);
    return true;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.readJsonFile("projects.json", []);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const projects = await this.getProjects();
    return projects.find(p => p.id === id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const projects = await this.getProjects();
    const now = new Date().toISOString();
    const project: Project = {
      ...insertProject,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    projects.push(project);
    await this.writeJsonFile("projects.json", projects);
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    projects[index] = { 
      ...projects[index], 
      ...updateData, 
      updatedAt: new Date().toISOString() 
    };
    await this.writeJsonFile("projects.json", projects);
    return projects[index];
  }

  async deleteProject(id: string): Promise<boolean> {
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    projects.splice(index, 1);
    await this.writeJsonFile("projects.json", projects);
    return true;
  }

  // Pages
  async getPages(): Promise<Page[]> {
    return this.readJsonFile("pages.json", []);
  }

  async getPage(id: string): Promise<Page | undefined> {
    const pages = await this.getPages();
    return pages.find(p => p.id === id);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const pages = await this.getPages();
    return pages.find(p => p.slug === slug);
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const pages = await this.getPages();
    const now = new Date().toISOString();
    const page: Page = {
      ...insertPage,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    pages.push(page);
    await this.writeJsonFile("pages.json", pages);
    return page;
  }

  async updatePage(id: string, updateData: Partial<InsertPage>): Promise<Page | undefined> {
    const pages = await this.getPages();
    const index = pages.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    pages[index] = { 
      ...pages[index], 
      ...updateData, 
      updatedAt: new Date().toISOString() 
    };
    await this.writeJsonFile("pages.json", pages);
    return pages[index];
  }

  async deletePage(id: string): Promise<boolean> {
    const pages = await this.getPages();
    const index = pages.findIndex(p => p.id === id);
    if (index === -1) return false;

    pages.splice(index, 1);
    await this.writeJsonFile("pages.json", pages);
    return true;
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    return this.readJsonFile("settings.json", {
      siteName: "Daniel Antes Portfolio",
      tagline: "Master Marquetry & Hardwood Flooring Artisan",
      primaryColor: "hsl(40 50% 65%)",
      contactInfo: {},
    });
  }

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const currentSettings = await this.getSiteSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await this.writeJsonFile("settings.json", updatedSettings);
    return updatedSettings;
  }
}

export const storage = new FileStorage();
