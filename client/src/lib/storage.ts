// Storage abstraction layer for static-first architecture
import { Page, Project, Image, SiteSettings } from '@shared/schema';

export interface IStaticStorage {
  // Pages
  getPages(): Promise<Page[]>;
  getPage(id: string): Promise<Page | null>;
  getPageBySlug(slug: string): Promise<Page | null>;
  savePage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Page>;
  deletePage(id: string): Promise<void>;
  
  // Projects  
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  saveProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Images
  getImages(): Promise<Image[]>;
  getImage(id: string): Promise<Image | null>;
  saveImage(image: Omit<Image, 'id' | 'uploadedAt'> & { id?: string }): Promise<Image>;
  deleteImage(id: string): Promise<void>;
  
  // Settings
  getSettings(): Promise<SiteSettings>;
  saveSettings(settings: SiteSettings): Promise<void>;
}

// Local file storage implementation for development
export class LocalFileStorage implements IStaticStorage {
  private dataCache: Map<string, any> = new Map();
  
  private async loadFile<T>(filename: string, defaultValue: T): Promise<T> {
    if (this.dataCache.has(filename)) {
      return this.dataCache.get(filename);
    }
    
    try {
      // In development, load from existing data files
      const response = await fetch(`/api/${filename.replace('.json', '')}`);
      if (response.ok) {
        const data = await response.json();
        this.dataCache.set(filename, data);
        return data;
      }
    } catch (error) {
      console.warn(`Could not load ${filename}, using default:`, error);
    }
    
    this.dataCache.set(filename, defaultValue);
    return defaultValue;
  }
  
  private async saveFile<T>(filename: string, data: T): Promise<void> {
    this.dataCache.set(filename, data);
    // In a real static implementation, this would save to the hosting provider
    console.log(`[LocalFileStorage] Saved ${filename}:`, data);
  }
  
  // Pages
  async getPages(): Promise<Page[]> {
    return await this.loadFile('pages.json', []);
  }
  
  async getPage(id: string): Promise<Page | null> {
    const pages = await this.getPages();
    return pages.find(p => p.id === id) || null;
  }
  
  async getPageBySlug(slug: string): Promise<Page | null> {
    const pages = await this.getPages();
    return pages.find(p => p.slug === slug) || null;
  }
  
  async savePage(pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Page> {
    const pages = await this.getPages();
    const now = new Date().toISOString();
    
    if (pageData.id) {
      // Update existing page
      const index = pages.findIndex(p => p.id === pageData.id);
      if (index !== -1) {
        const updatedPage: Page = {
          ...pages[index],
          ...pageData,
          updatedAt: now,
        };
        pages[index] = updatedPage;
        await this.saveFile('pages.json', pages);
        return updatedPage;
      }
    }
    
    // Create new page
    const newPage: Page = {
      ...pageData,
      id: pageData.id || crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    
    pages.push(newPage);
    await this.saveFile('pages.json', pages);
    return newPage;
  }
  
  async deletePage(id: string): Promise<void> {
    const pages = await this.getPages();
    const filteredPages = pages.filter(p => p.id !== id);
    await this.saveFile('pages.json', filteredPages);
  }
  
  // Projects
  async getProjects(): Promise<Project[]> {
    return await this.loadFile('projects.json', []);
  }
  
  async getProject(id: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find(p => p.id === id) || null;
  }
  
  async saveProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project> {
    const projects = await this.getProjects();
    const now = new Date().toISOString();
    
    if (projectData.id) {
      // Update existing project
      const index = projects.findIndex(p => p.id === projectData.id);
      if (index !== -1) {
        const updatedProject: Project = {
          ...projects[index],
          ...projectData,
          updatedAt: now,
        };
        projects[index] = updatedProject;
        await this.saveFile('projects.json', projects);
        return updatedProject;
      }
    }
    
    // Create new project
    const newProject: Project = {
      ...projectData,
      id: projectData.id || crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    
    projects.push(newProject);
    await this.saveFile('projects.json', projects);
    return newProject;
  }
  
  async deleteProject(id: string): Promise<void> {
    const projects = await this.getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    await this.saveFile('projects.json', filteredProjects);
  }
  
  // Images
  async getImages(): Promise<Image[]> {
    return await this.loadFile('images.json', []);
  }
  
  async getImage(id: string): Promise<Image | null> {
    const images = await this.getImages();
    return images.find(i => i.id === id) || null;
  }
  
  async saveImage(imageData: Omit<Image, 'id' | 'uploadedAt'> & { id?: string }): Promise<Image> {
    const images = await this.getImages();
    const now = new Date().toISOString();
    
    const newImage: Image = {
      ...imageData,
      id: imageData.id || crypto.randomUUID(),
      uploadedAt: now,
    };
    
    if (imageData.id) {
      // Update existing
      const index = images.findIndex(i => i.id === imageData.id);
      if (index !== -1) {
        images[index] = newImage;
      } else {
        images.push(newImage);
      }
    } else {
      images.push(newImage);
    }
    
    await this.saveFile('images.json', images);
    return newImage;
  }
  
  async deleteImage(id: string): Promise<void> {
    const images = await this.getImages();
    const filteredImages = images.filter(i => i.id !== id);
    await this.saveFile('images.json', filteredImages);
  }
  
  // Settings
  async getSettings(): Promise<SiteSettings> {
    return await this.loadFile('settings.json', {
      siteName: "Daniel Antes Portfolio",
      tagline: "Master Marquetry & Hardwood Flooring Artisan",
      primaryColor: "hsl(40 50% 65%)",
      contactInfo: {},
    });
  }
  
  async saveSettings(settings: SiteSettings): Promise<void> {
    await this.saveFile('settings.json', settings);
  }
}

// Global storage instance
export const storage = new LocalFileStorage();