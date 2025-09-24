// Browser-compatible crypto functions

export interface CSRFToken {
  token: string;
  timestamp: number;
  expires: number;
}

export interface CSRFConfig {
  secret: string;
  tokenExpiration: number; // milliseconds
  headerName: string;
  cookieName: string;
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
}

class CSRFService {
  private config: CSRFConfig;
  private currentToken: CSRFToken | null = null;

  constructor() {
    this.config = {
      secret: this.generateSecret(),
      tokenExpiration: 30 * 60 * 1000, // 30 minutes
      headerName: 'X-CSRF-Token',
      cookieName: 'csrf-token',
      cookieOptions: {
        httpOnly: true,
        secure: window.location.protocol === 'https:',
        sameSite: 'strict',
        maxAge: 30 * 60 * 1000, // 30 minutes
      },
    };

    this.initializeToken().catch(console.error);
  }

  private generateSecret(): string {
    // In production, this should come from environment variables
    // For browser environment, we'll generate a random secret
    const envSecret = import.meta.env?.VITE_CSRF_SECRET;
    return envSecret || this.generateRandomString(64);
  }

  private generateRandomString(length: number): string {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(length / 2);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback for environments without crypto
      return Array.from({ length }, () => 
        Math.random().toString(36)[2]
      ).join('');
    }
  }

  private async generateTokenValue(): Promise<string> {
    const timestamp = Date.now();
    const randomValue = this.generateRandomString(32);
    const payload = `${timestamp}:${randomValue}`;
    
    try {
      const signature = await this.generateHmac(payload, this.config.secret);
      return `${payload}:${signature}`;
    } catch {
      // Fallback for environments without crypto
      return btoa(payload + ':' + this.generateRandomString(32));
    }
  }

  private async generateHmac(message: string, secret: string): Promise<string> {
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const messageData = encoder.encode(message);
      
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await window.crypto.subtle.sign('HMAC', key, messageData);
      return Array.from(new Uint8Array(signature), byte => 
        byte.toString(16).padStart(2, '0')
      ).join('');
    } else {
      // Simple hash fallback (not cryptographically secure)
      let hash = 0;
      const str = secret + message;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    }
  }

  private async validateTokenSignature(token: string): Promise<boolean> {
    try {
      const parts = token.split(':');
      if (parts.length !== 3) return false;

      const [timestamp, randomValue, signature] = parts;
      const payload = `${timestamp}:${randomValue}`;
      
      const expectedSignature = await this.generateHmac(payload, this.config.secret);
      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  private async initializeToken(): Promise<void> {
    // Try to load existing token from storage
    const stored = this.getStoredToken();
    if (stored && await this.isTokenValid(stored)) {
      this.currentToken = stored;
    } else {
      await this.refreshToken();
    }

    // Set up automatic token refresh
    this.setupTokenRefresh();
  }

  private getStoredToken(): CSRFToken | null {
    try {
      const stored = localStorage.getItem('csrf_token');
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        token: parsed.token,
        timestamp: parsed.timestamp,
        expires: parsed.expires,
      };
    } catch {
      return null;
    }
  }

  private storeToken(token: CSRFToken): void {
    try {
      localStorage.setItem('csrf_token', JSON.stringify(token));
      // Also set as cookie for server-side validation
      document.cookie = `${this.config.cookieName}=${token.token}; max-age=${this.config.cookieOptions.maxAge}; path=/; ${this.config.cookieOptions.secure ? 'secure;' : ''} samesite=${this.config.cookieOptions.sameSite}`;
    } catch (error) {
      console.warn('Failed to store CSRF token:', error);
    }
  }

  private setupTokenRefresh(): void {
    const refreshInterval = this.config.tokenExpiration * 0.8; // Refresh at 80% of expiration
    
    setInterval(async () => {
      if (!this.currentToken || this.shouldRefreshToken(this.currentToken)) {
        await this.refreshToken();
      }
    }, Math.min(refreshInterval, 5 * 60 * 1000)); // At least every 5 minutes
  }

  private shouldRefreshToken(token: CSRFToken): boolean {
    const now = Date.now();
    const refreshTime = token.timestamp + (this.config.tokenExpiration * 0.8);
    return now >= refreshTime;
  }

  private async isTokenValid(token: CSRFToken): Promise<boolean> {
    const now = Date.now();
    return (
      token.expires > now &&
      await this.validateTokenSignature(token.token)
    );
  }

  public async refreshToken(): Promise<CSRFToken> {
    const now = Date.now();
    const token: CSRFToken = {
      token: await this.generateTokenValue(),
      timestamp: now,
      expires: now + this.config.tokenExpiration,
    };

    this.currentToken = token;
    this.storeToken(token);
    
    // Dispatch event for components to react to token refresh
    window.dispatchEvent(new CustomEvent('csrf-token-refreshed', {
      detail: { token: token.token }
    }));

    return token;
  }

  public async getToken(): Promise<string | null> {
    if (!this.currentToken || !(await this.isTokenValid(this.currentToken))) {
      await this.refreshToken();
    }
    
    return this.currentToken?.token || null;
  }

  public async validateToken(token: string): Promise<boolean> {
    if (!token || !this.currentToken) return false;
    
    return (
      token === this.currentToken.token &&
      await this.isTokenValid(this.currentToken)
    );
  }

  public async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return token ? { [this.config.headerName]: token } : {};
  }

  public clearToken(): void {
    this.currentToken = null;
    localStorage.removeItem('csrf_token');
    document.cookie = `${this.config.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  // Security validation methods
  public async validateRequest(headers: Record<string, string>): Promise<boolean> {
    const token = headers[this.config.headerName.toLowerCase()];
    return await this.validateToken(token);
  }

  public getConfig(): Readonly<CSRFConfig> {
    return { ...this.config };
  }

  // Double Submit Cookie validation
  public async validateDoubleSubmit(headerToken: string, cookieToken: string): Promise<boolean> {
    return (
      headerToken &&
      cookieToken &&
      headerToken === cookieToken &&
      await this.validateToken(headerToken)
    );
  }
}

// Singleton instance
export const csrfService = new CSRFService();