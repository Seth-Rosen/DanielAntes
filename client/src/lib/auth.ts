import { api } from "./api";

class AuthManager {
  private sessionId: string | null = null;

  constructor() {
    this.sessionId = localStorage.getItem("sessionId");
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await api.login(username, password);
      this.sessionId = response.sessionId;
      localStorage.setItem("sessionId", response.sessionId);
      localStorage.setItem("sessionExpires", response.expires);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    
    this.sessionId = null;
    localStorage.removeItem("sessionId");
    localStorage.removeItem("sessionExpires");
  }

  isAuthenticated(): boolean {
    if (!this.sessionId) return false;
    
    const expires = localStorage.getItem("sessionExpires");
    if (!expires) return false;
    
    return new Date() < new Date(expires);
  }

  getAuthHeaders(): Record<string, string> {
    if (this.sessionId) {
      return {
        "Authorization": `Bearer ${this.sessionId}`,
      };
    }
    return {};
  }
}

export const auth = new AuthManager();

// Override fetch to include auth headers
const originalApiRequest = api;
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const headers = {
    ...init?.headers,
    ...auth.getAuthHeaders(),
  };

  return originalFetch(input, {
    ...init,
    headers,
  });
};
