import { apiRequest } from "./queryClient";

export interface LoginResponse {
  sessionId: string;
  expires: string;
}

export const api = {
  // Authentication
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", { username, password });
    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout");
  },

  // Images
  getImages: async (filters?: { tag?: string; project?: string }) => {
    const params = new URLSearchParams();
    if (filters?.tag) params.append("tag", filters.tag);
    if (filters?.project) params.append("project", filters.project);
    
    const response = await apiRequest("GET", `/api/images?${params.toString()}`);
    return response.json();
  },

  uploadImage: async (formData: FormData) => {
    const response = await apiRequest("POST", "/api/images", formData);
    return response.json();
  },

  updateImage: async (id: string, data: any) => {
    const response = await apiRequest("PATCH", `/api/images/${id}`, data);
    return response.json();
  },

  deleteImage: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/images/${id}`);
    return response.json();
  },

  // Projects
  getProjects: async () => {
    const response = await apiRequest("GET", "/api/projects");
    return response.json();
  },

  createProject: async (data: any) => {
    const response = await apiRequest("POST", "/api/projects", data);
    return response.json();
  },

  updateProject: async (id: string, data: any) => {
    const response = await apiRequest("PATCH", `/api/projects/${id}`, data);
    return response.json();
  },

  deleteProject: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/projects/${id}`);
    return response.json();
  },

  // Pages
  getPages: async () => {
    const response = await apiRequest("GET", "/api/pages");
    return response.json();
  },

  getPageBySlug: async (slug: string) => {
    const response = await apiRequest("GET", `/api/pages/slug/${slug}`);
    return response.json();
  },

  createPage: async (data: any) => {
    const response = await apiRequest("POST", "/api/pages", data);
    return response.json();
  },

  updatePage: async (id: string, data: any) => {
    const response = await apiRequest("PATCH", `/api/pages/${id}`, data);
    return response.json();
  },

  deletePage: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/pages/${id}`);
    return response.json();
  },

  // Settings
  getSettings: async () => {
    const response = await apiRequest("GET", "/api/settings");
    return response.json();
  },

  updateSettings: async (data: any) => {
    const response = await apiRequest("PATCH", "/api/settings", data);
    return response.json();
  },
};
