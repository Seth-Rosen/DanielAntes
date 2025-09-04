// Pure static file storage with write capabilities
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
  
  // Write operations for admin
  savePage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Page>;
  reorderPages(pagesInOrder: Page[]): Promise<Page[]>;
  deletePage(id: string): Promise<void>;

  saveProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project>;
  reorderProjects(projectsInOrder: Project[]): Promise<Project[]>;
  deleteProject(id: string): Promise<void>;

  saveImage(image: Omit<Image, 'id' | 'uploadedAt'> & { id?: string }): Promise<Image>;
  deleteImage(id: string): Promise<void>;

  saveSettings(settings: SiteSettings): Promise<void>;
}

// Storage backend interface - easily swappable
interface StorageBackend {
  read<T>(filename: string): Promise<T>;
  write<T>(filename: string, data: T): Promise<void>;
}

// Local file storage backend (will switch to GitHub later)
class LocalFileBackend implements StorageBackend {
  async read<T>(filename: string): Promise<T> {
    try {
      const response = await fetch(`/data/${filename}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}`);
      }
      return await response.json();
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
  
  async write<T>(filename: string, data: T): Promise<void> {
    // For local development, write to server endpoint
    // This will be replaced with GitHub API in production
    try {
      const response = await fetch('/api/storage/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, data })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to write ${filename}`);
      }
      
      console.log(`[LocalStorage] Wrote ${filename}`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('storage:update', { detail: { filename } }));
      }
    } catch (error) {
      console.error(`Failed to write ${filename}:`, error);
      throw error;
    }
  }
}

// Future GitHub backend (placeholder for now)
class GitHubBackend implements StorageBackend {
  async read<T>(filename: string): Promise<T> {
    // Will read from GitHub API
    throw new Error('GitHub backend not implemented yet');
  }
  
  async write<T>(filename: string, data: T): Promise<void> {
    // Will commit to GitHub using API
    // const token = process.env.GITHUB_TOKEN;
    // await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/public/data/${filename}`, {
    //   method: 'PUT',
    //   headers: { 
    //     'Authorization': `token ${token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     message: `Update ${filename}`,
    //     content: btoa(JSON.stringify(data, null, 2)),
    //     sha: currentSha // Need to get current file SHA first
    //   })
    // });
    throw new Error('GitHub backend not implemented yet');
  }
}

export class StaticFileStorage implements IStaticStorage {
  private backend: StorageBackend;
  private cache: Map<string, any> = new Map();
  
  constructor() {
    // Use local backend for now, will switch based on environment later
    this.backend = new LocalFileBackend();
  }
  
  private async fetchData<T>(filename: string): Promise<T> {
    // Always fetch fresh for now during development
    const data = await this.backend.read<T>(filename);
    this.cache.set(filename, data);
    return data;
  }
  
  private async saveData<T>(filename: string, data: T): Promise<void> {
    await this.backend.write(filename, data);
    // Clear cache to ensure next read gets fresh data
    this.cache.delete(filename);
  }
  
  // Read operations (for live site)
  async getPages(): Promise<Page[]> {
    const list = await this.fetchData<Page[]>('pages.json');
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  async getPage(id: string): Promise<Page | null> {
    const pages = await this.getPages();
    return pages.find(p => p.id === id) || null;
  }
  
  async getPageBySlug(slug: string): Promise<Page | null> {
    const pages = await this.getPages();
    const normalize = (s: string) => {
      if (!s) return s;
      return s === '/' ? '/' : s.replace(/^\/+/, '');
    };
    const target = normalize(slug);
    return (
      pages.find(p => normalize(p.slug) === target) || null
    );
  }
  
  async getProjects(): Promise<Project[]> {
    const list = await this.fetchData<Project[]>('projects.json');
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
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
  
  // Write operations (for admin)
  async savePage(pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Page> {
    const pages = await this.getPages();
    const now = new Date().toISOString();

    // Normalize slug: homepage is '/', others have no leading '/'
    let normalizedSlug = pageData.slug?.trim() || '';
    if (normalizedSlug === '' || normalizedSlug === '/' || normalizedSlug === '#') {
      normalizedSlug = '/';
    } else {
      normalizedSlug = normalizedSlug.replace(/^\/+/, '');
    }

    const baseData = { ...pageData, slug: normalizedSlug } as typeof pageData;

    let updatedPage: Page;

    if (baseData.id) {
      const index = pages.findIndex(p => p.id === baseData.id);
      if (index !== -1) {
        updatedPage = {
          ...pages[index],
          ...baseData,
          updatedAt: now,
        };
        pages[index] = updatedPage;
      } else {
        // ID provided but not found, create new
        updatedPage = {
          ...baseData,
          id: baseData.id,
          createdAt: now,
          updatedAt: now,
        } as Page;
        pages.push(updatedPage);
      }
    } else {
      // Create new page
      updatedPage = {
        ...baseData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      } as Page;
      pages.push(updatedPage);
    }

    // Ensure deterministic order values
    const normalizedPages = pages
      .map((p, idx) => ({ ...p, order: typeof p.order === 'number' ? p.order : idx }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    await this.saveData('pages.json', normalizedPages);
    console.log('[Storage] Page saved:', updatedPage.id);
    return updatedPage;
  }
  
  async deletePage(id: string): Promise<void> {
    const pages = await this.getPages();
    const filteredPages = pages.filter(p => p.id !== id);
    await this.saveData('pages.json', filteredPages);
    console.log('[Storage] Page deleted:', id);
  }
  
  async saveProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project> {
    const projects = await this.fetchData<Project[]>('projects.json');
    const now = new Date().toISOString();

    let updatedProject: Project;

    if (projectData.id) {
      const index = projects.findIndex(p => p.id === projectData.id);
      if (index !== -1) {
        updatedProject = {
          ...projects[index],
          ...projectData,
          updatedAt: now,
        };
        projects[index] = updatedProject;
      } else {
        updatedProject = {
          ...projectData,
          id: projectData.id,
          createdAt: now,
          updatedAt: now,
        } as Project;
        projects.push(updatedProject);
      }
    } else {
      updatedProject = {
        ...projectData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      } as Project;
      projects.push(updatedProject);
    }

    const normalized = projects
      .map((p, idx) => ({ ...p, order: typeof p.order === 'number' ? p.order : idx }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    await this.saveData('projects.json', normalized);
    console.log('[Storage] Project saved:', updatedProject.id);
    return updatedProject;
  }
  
  async deleteProject(id: string): Promise<void> {
    const projects = await this.getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    await this.saveData('projects.json', filteredProjects);
    console.log('[Storage] Project deleted:', id);
  }
  
  async saveImage(imageData: Omit<Image, 'id' | 'uploadedAt'> & { id?: string }): Promise<Image> {
    const images = await this.getImages();
    const now = new Date().toISOString();
    
    let updatedImage: Image;
    
    if (imageData.id) {
      const index = images.findIndex(i => i.id === imageData.id);
      if (index !== -1) {
        updatedImage = {
          ...images[index],
          ...imageData,
        };
        images[index] = updatedImage;
      } else {
        updatedImage = {
          ...imageData,
          id: imageData.id,
          uploadedAt: now,
        } as Image;
        images.push(updatedImage);
      }
    } else {
      updatedImage = {
        ...imageData,
        id: crypto.randomUUID(),
        uploadedAt: now,
      } as Image;
      images.push(updatedImage);
    }
    
    await this.saveData('images.json', images);
    console.log('[Storage] Image saved:', updatedImage.id);
    return updatedImage;
  }
  
  async deleteImage(id: string): Promise<void> {
    const images = await this.getImages();
    const filteredImages = images.filter(i => i.id !== id);
    await this.saveData('images.json', filteredImages);
    console.log('[Storage] Image deleted:', id);
  }
  
  async saveSettings(settings: SiteSettings): Promise<void> {
    await this.saveData('settings.json', settings);
    console.log('[Storage] Settings saved');
  }
}

// Export singleton instance
export const storage = new StaticFileStorage();
