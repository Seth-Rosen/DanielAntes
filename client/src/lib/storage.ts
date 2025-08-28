// Static file storage implementation for client-side only architecture
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

// Static file storage - reads from /data/*.json files
export class StaticFileStorage implements IStaticStorage {
  private cache: Map<string, any> = new Map();
  
  private async fetchStaticData<T>(filename: string): Promise<T> {
    // Check cache first
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }
    
    try {
      // Fetch from static files in public directory
      const response = await fetch(`/data/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}`);
      }
      const data = await response.json();
      this.cache.set(filename, data);
      return data;
    } catch (error) {
      console.warn(`Could not load ${filename}:`, error);
      // Return empty defaults based on filename
      if (filename === 'pages.json') return [] as T;
      if (filename === 'projects.json') return [] as T;
      if (filename === 'images.json') return [] as T;
      if (filename === 'settings.json') return { siteName: 'Daniel Antes', siteDescription: '' } as T;
      return [] as T;
    }
  }
  
  private async saveToLocalStorage<T>(key: string, data: T): Promise<void> {
    // For admin operations, we'll save to localStorage temporarily
    // In production, this would trigger a rebuild via Netlify Functions
    try {
      localStorage.setItem(`static_data_${key}`, JSON.stringify(data));
      // Update cache
      this.cache.set(key, data);
      console.log(`[StaticFileStorage] Saved ${key}:`, data);
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  }
  
  private async getData<T>(filename: string): Promise<T> {
    // Check localStorage first for admin modifications
    const localKey = `static_data_${filename}`;
    const localData = localStorage.getItem(localKey);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        this.cache.set(filename, parsed);
        return parsed;
      } catch (error) {
        console.warn(`Invalid localStorage data for ${filename}`);
      }
    }
    
    // Fall back to static files
    return this.fetchStaticData<T>(filename);
  }
  
  // Pages
  async getPages(): Promise<Page[]> {
    return await this.getData<Page[]>('pages.json');
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
        await this.saveToLocalStorage('pages.json', pages);
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
    await this.saveToLocalStorage('pages.json', pages);
    return newPage;
  }
  
  async deletePage(id: string): Promise<void> {
    const pages = await this.getPages();
    const filteredPages = pages.filter(p => p.id !== id);
    await this.saveToLocalStorage('pages.json', filteredPages);
  }
  
  // Projects
  async getProjects(): Promise<Project[]> {
    return await this.getData<Project[]>('projects.json');
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
        await this.saveToLocalStorage('projects.json', projects);
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
    await this.saveToLocalStorage('projects.json', projects);
    return newProject;
  }
  
  async deleteProject(id: string): Promise<void> {
    const projects = await this.getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    await this.saveToLocalStorage('projects.json', filteredProjects);
  }
  
  // Images
  async getImages(): Promise<Image[]> {
    return await this.getData<Image[]>('images.json');
  }
  
  async getImage(id: string): Promise<Image | null> {
    const images = await this.getImages();
    return images.find(i => i.id === id) || null;
  }
  
  async saveImage(imageData: Omit<Image, 'id' | 'uploadedAt'> & { id?: string }): Promise<Image> {
    const images = await this.getImages();
    const now = new Date().toISOString();
    
    if (imageData.id) {
      // Update existing image
      const index = images.findIndex(i => i.id === imageData.id);
      if (index !== -1) {
        const updatedImage: Image = {
          ...images[index],
          ...imageData,
        };
        images[index] = updatedImage;
        await this.saveToLocalStorage('images.json', images);
        return updatedImage;
      }
    }
    
    // Create new image
    const newImage: Image = {
      ...imageData,
      id: imageData.id || crypto.randomUUID(),
      uploadedAt: now,
    };
    
    images.push(newImage);
    await this.saveToLocalStorage('images.json', images);
    return newImage;
  }
  
  async deleteImage(id: string): Promise<void> {
    const images = await this.getImages();
    const filteredImages = images.filter(i => i.id !== id);
    await this.saveToLocalStorage('images.json', filteredImages);
  }
  
  // Settings
  async getSettings(): Promise<SiteSettings> {
    return await this.getData<SiteSettings>('settings.json');
  }
  
  async saveSettings(settings: SiteSettings): Promise<void> {
    await this.saveToLocalStorage('settings.json', settings);
  }
}

// Export singleton instance
export const storage = new StaticFileStorage();