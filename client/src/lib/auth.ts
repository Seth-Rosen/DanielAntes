// Client-side authentication for static admin interface

export interface AuthState {
  isAuthenticated: boolean;
  sessionId?: string;
  expiresAt?: Date;
}

class ClientAuth {
  private authState: AuthState = { isAuthenticated: false };
  private readonly STORAGE_KEY = 'admin_auth';
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  constructor() {
    this.loadAuthState();
  }
  
  private loadAuthState(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        if (authData.expiresAt && new Date(authData.expiresAt) > new Date()) {
          this.authState = {
            isAuthenticated: true,
            sessionId: authData.sessionId,
            expiresAt: new Date(authData.expiresAt)
          };
        } else {
          this.clearAuth();
        }
      }
    } catch (error) {
      console.warn('Failed to load auth state:', error);
      this.clearAuth();
    }
  }
  
  private saveAuthState(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        sessionId: this.authState.sessionId,
        expiresAt: this.authState.expiresAt?.toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save auth state:', error);
    }
  }
  
  private clearAuth(): void {
    this.authState = { isAuthenticated: false };
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  async login(username: string, password: string): Promise<boolean> {
    try {
      // For development - simple hardcoded auth
      // In production, this would validate against hosting provider or encrypted config
      const validCredentials = (
        username === 'admin' && 
        password === (import.meta.env.VITE_ADMIN_PASSWORD || 'admin123')
      );
      
      if (validCredentials) {
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + this.SESSION_DURATION);
        
        this.authState = {
          isAuthenticated: true,
          sessionId,
          expiresAt
        };
        
        this.saveAuthState();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }
  
  logout(): void {
    this.clearAuth();
  }
  
  isAuthenticated(): boolean {
    if (!this.authState.isAuthenticated || !this.authState.expiresAt) {
      return false;
    }
    
    if (this.authState.expiresAt <= new Date()) {
      this.clearAuth();
      return false;
    }
    
    return true;
  }
  
  getSessionId(): string | undefined {
    return this.isAuthenticated() ? this.authState.sessionId : undefined;
  }
  
  getExpiresAt(): Date | undefined {
    return this.isAuthenticated() ? this.authState.expiresAt : undefined;
  }
}

export const auth = new ClientAuth();
