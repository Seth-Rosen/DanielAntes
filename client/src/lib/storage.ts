// Pure static file storage - no localStorage, no API calls
import { Page, Project, Image, SiteSettings } from '@shared/schema';

export interface IStaticStorage {
  // Read-only operations for live site
  getPages(): Promise<Page[]>;
  getPage(id: string): Promise<Page | null>;
  getPageBySlug(slug: string): Promise<Page | null>;
  
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  
  getImages(): Promise<Image[]>;
  getImage(id: string): Promise<Image | null>;
  
  getSettings(): Promise<SiteSettings>;
  
  // Write operations for admin (future: GitHub API)
  savePage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Page>;
  deletePage(id: string): Promise<void>;
  
  saveProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  saveImage(image: Omit<Image, 'id' | 'uploadedAt'> & { id?: string }): Promise<Image>;
  deleteImage(id: string): Promise<void>;
  
  saveSettings(settings: SiteSettings): Promise<void>;
}

export class StaticFileStorage implements IStaticStorage {
  private cache: Map<string, any> = new Map();
  
  private async fetchData<T>(filename: string): Promise<T> {
    // Clear cache for now to ensure fresh data
    // if (this.cache.has(filename)) {
    //   return this.cache.get(filename);
    // }
    
    try {
      const response = await fetch(`/data/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}`);
      }
      const data = await response.json();
      this.cache.set(filename, data);
      return data;
    } catch (error) {
      console.warn(`Could not load ${filename}, using defaults`);
      // Return sensible defaults
      if (filename === 'pages.json') return [] as T;
      if (filename === 'projects.json') return [] as T;
      if (filename === 'images.json') return [] as T;
      if (filename === 'settings.json') {
        return { siteName: 'Daniel Antes', siteDescription: '' } as T;
      }
      return [] as T;
    }
  }
  
  // Read operations (for live site)
  async getPages(): Promise<Page[]> {
    return this.fetchData<Page[]>('pages.json');
  }
  
  async getPage(id: string): Promise<Page | null> {
    const pages = await this.getPages();
    return pages.find(p => p.id === id) || null;
  }
  
  async getPageBySlug(slug: string): Promise<Page | null> {
    const pages = await this.getPages();
    return pages.find(p => p.slug === slug) || null;
  }
  
  async getProjects(): Promise<Project[]> {
    return this.fetchData<Project[]>('projects.json');
  }
  
  async getProject(id: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find(p => p.id === id) || null;
  }
  
  async getImages(): Promise<Image[]> {
    return this.fetchData<Image[]>('images.json');
  }
  
  async getImage(id: string): Promise<Image | null> {
    const images = await this.getImages();
    return images.find(i => i.id === id) || null;
  }
  
  async getSettings(): Promise<SiteSettings> {
    return this.fetchData<SiteSettings>('settings.json');
  }
  
  // Write operations (for admin - will be GitHub API in Phase 3)
  async savePage(pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Page> {
    // Phase 2: In-memory only for testing
    // Phase 3: Will use GitHub API to commit changes
    const pages = await this.getPages();
    const now = new Date().toISOString();
    
    if (pageData.id) {
      const index = pages.findIndex(p => p.id === pageData.id);
      if (index !== -1) {
        const updatedPage: Page = {
          ...pages[index],
          ...pageData,
          updatedAt: now,
        };
        pages[index] = updatedPage;
        // Clear cache so next read gets updated data
        this.cache.delete('pages.json');
        this.cache.set('pages.json', pages);
        console.log('[Admin] Page updated (in-memory only):', updatedPage);
        return updatedPage;
      }
    }
    
    const newPage: Page = {
      ...pageData,
      id: pageData.id || crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    
    pages.push(newPage);
    this.cache.delete('pages.json');
    this.cache.set('pages.json', pages);
    console.log('[Admin] Page created (in-memory only):', newPage);
    return newPage;
  }
  
  async deletePage(id: string): Promise<void> {
    const pages = await this.getPages();
    const filteredPages = pages.filter(p => p.id !== id);
    this.cache.delete('pages.json');
    this.cache.set('pages.json', filteredPages);
    console.log('[Admin] Page deleted (in-memory only):', id);
  }
  
  async saveProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project> {
    const projects = await this.getProjects();
    const now = new Date().toISOString();
    
    if (projectData.id) {
      const index = projects.findIndex(p => p.id === projectData.id);
      if (index !== -1) {
        const updatedProject: Project = {
          ...projects[index],
          ...projectData,
          updatedAt: now,
        };
        projects[index] = updatedProject;
        this.cache.delete('projects.json');
        this.cache.set('projects.json', projects);
        console.log('[Admin] Project updated (in-memory only):', updatedProject);
        return updatedProject;
      }
    }
    
    const newProject: Project = {
      ...projectData,
      id: projectData.id || crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    
    projects.push(newProject);
    this.cache.delete('projects.json');
    this.cache.set('projects.json', projects);
    console.log('[Admin] Project created (in-memory only):', newProject);
    return newProject;
  }
  
  async deleteProject(id: string): Promise<void> {
    const projects = await this.getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    this.cache.delete('projects.json');
    this.cache.set('projects.json', filteredProjects);
    console.log('[Admin] Project deleted (in-memory only):', id);
  }
  
  async saveImage(imageData: Omit<Image, 'id' | 'uploadedAt'> & { id?: string }): Promise<Image> {
    const images = await this.getImages();
    const now = new Date().toISOString();
    
    if (imageData.id) {
      const index = images.findIndex(i => i.id === imageData.id);
      if (index !== -1) {
        const updatedImage: Image = {
          ...images[index],
          ...imageData,
        };
        images[index] = updatedImage;
        this.cache.delete('images.json');
        this.cache.set('images.json', images);
        console.log('[Admin] Image updated (in-memory only):', updatedImage);
        return updatedImage;
      }
    }
    
    const newImage: Image = {
      ...imageData,
      id: imageData.id || crypto.randomUUID(),
      uploadedAt: now,
    };
    
    images.push(newImage);
    this.cache.delete('images.json');
    this.cache.set('images.json', images);
    console.log('[Admin] Image created (in-memory only):', newImage);
    return newImage;
  }
  
  async deleteImage(id: string): Promise<void> {
    const images = await this.getImages();
    const filteredImages = images.filter(i => i.id !== id);
    this.cache.delete('images.json');
    this.cache.set('images.json', filteredImages);
    console.log('[Admin] Image deleted (in-memory only):', id);
  }
  
  async saveSettings(settings: SiteSettings): Promise<void> {
    this.cache.delete('settings.json');
    this.cache.set('settings.json', settings);
    console.log('[Admin] Settings updated (in-memory only):', settings);
  }
}

// Export singleton instance
export const storage = new StaticFileStorage();