export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security': string;
  'X-Permitted-Cross-Domain-Policies': string;
  'Cross-Origin-Embedder-Policy': string;
  'Cross-Origin-Opener-Policy': string;
  'Cross-Origin-Resource-Policy': string;
}

export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'media-src': string[];
  'object-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'upgrade-insecure-requests': boolean;
  'block-all-mixed-content': boolean;
}

export interface SecurityConfig {
  enforceCSP: boolean;
  enableHSTS: boolean;
  hstsMaxAge: number;
  hstsIncludeSubDomains: boolean;
  hstsPreload: boolean;
  reportUri?: string;
  reportOnlyMode: boolean;
  nonce?: string;
}

class SecurityHeadersService {
  private config: SecurityConfig;
  private nonce: string;

  constructor() {
    const isProduction = import.meta.env?.MODE === 'production';
    this.config = {
      enforceCSP: isProduction, // Only enforce CSP in production
      enableHSTS: window.location.protocol === 'https:',
      hstsMaxAge: 31536000, // 1 year
      hstsIncludeSubDomains: true,
      hstsPreload: true,
      reportOnlyMode: !isProduction, // Report only in development
      nonce: this.generateNonce(),
    };

    this.nonce = this.config.nonce || this.generateNonce();
    this.initializeSecurityHeaders();
  }

  private generateNonce(): string {
    // Generate a cryptographically secure random nonce
    const array = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for older browsers
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return btoa(String.fromCharCode(...array));
  }

  private getCSPDirectives(): CSPDirectives {
    const isProduction = import.meta.env?.MODE === 'production';
    const allowedHosts = ['localhost:3001', 'localhost:3000', '127.0.0.1:3001'];
    
    return {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        `'nonce-${this.nonce}'`,
        ...(isProduction ? [] : ["'unsafe-eval'"]), // Allow eval in development for HMR
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind and styled-components
        `'nonce-${this.nonce}'`,
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net',
        ...(isProduction ? [] : ["'unsafe-eval'"]), // Allow eval in development
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://images.unsplash.com',
        'https://via.placeholder.com',
        `http://${allowedHosts.join(' http://')}`,
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net',
        'data:',
      ],
      'connect-src': [
        "'self'",
        'https://api.supabase.co',
        'https://*.supabase.co',
        'wss://*.supabase.co',
        `http://${allowedHosts.join(' http://')}`,
        `ws://${allowedHosts.join(' ws://')}`,
        ...(isProduction ? [] : ['ws://localhost:*', 'http://localhost:*']), // Dev server
      ],
      'media-src': ["'self'", 'data:', 'blob:'],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': window.location.protocol === 'https:',
      'block-all-mixed-content': window.location.protocol === 'https:',
    };
  }

  private buildCSPHeader(directives: CSPDirectives): string {
    const cspParts: string[] = [];

    Object.entries(directives).forEach(([directive, value]) => {
      if (typeof value === 'boolean') {
        if (value) {
          cspParts.push(directive);
        }
      } else if (Array.isArray(value) && value.length > 0) {
        cspParts.push(`${directive} ${value.join(' ')}`);
      }
    });

    // Add report-uri if configured
    if (this.config.reportUri) {
      cspParts.push(`report-uri ${this.config.reportUri}`);
    }

    return cspParts.join('; ');
  }

  public getSecurityHeaders(): Partial<SecurityHeaders> {
    const cspDirectives = this.getCSPDirectives();
    const cspHeader = this.buildCSPHeader(cspDirectives);
    
    const headers: Partial<SecurityHeaders> = {
      // Content Security Policy
      'Content-Security-Policy': this.config.reportOnlyMode 
        ? undefined 
        : cspHeader,
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // XSS Protection (legacy but still useful)
      'X-XSS-Protection': '1; mode=block',
      
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions policy (feature policy successor)
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'accelerometer=()',
        'gyroscope=()',
        'magnetometer=()',
        'fullscreen=(self)',
      ].join(', '),
      
      // Cross-origin policies
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
    };

    // HSTS (only for HTTPS)
    if (this.config.enableHSTS && window.location.protocol === 'https:') {
      let hstsValue = `max-age=${this.config.hstsMaxAge}`;
      if (this.config.hstsIncludeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      if (this.config.hstsPreload) {
        hstsValue += '; preload';
      }
      headers['Strict-Transport-Security'] = hstsValue;
    }

    // Add CSP Report-Only header if in report-only mode
    if (this.config.reportOnlyMode) {
      (headers as any)['Content-Security-Policy-Report-Only'] = cspHeader;
    }

    return headers;
  }

  private initializeSecurityHeaders(): void {
    // Only apply headers that work via meta tags
    this.addMetaTag('X-Content-Type-Options', 'nosniff');
    this.addMetaTag('X-XSS-Protection', '1; mode=block');
    this.addMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Add CSP meta tag with browser-friendly directives
    if (this.config.enforceCSP) {
      const cspDirectives = this.getCSPDirectives();
      // Remove directives that don't work in meta tags
      const { 'frame-ancestors': _, ...browserCompatibleDirectives } = cspDirectives;
      const cspHeader = this.buildCSPHeader(browserCompatibleDirectives as CSPDirectives);
      this.addMetaTag('Content-Security-Policy', cspHeader);
    }

    // Log security configuration in development
    if (import.meta.env?.MODE === 'development') {
      console.group('🔐 Security Headers Configuration');
      console.table(this.getSecurityHeaders());
      console.log('🎯 CSP Nonce:', this.nonce);
      console.groupEnd();
    }
  }

  private addMetaTag(name: string, content: string): void {
    // Check if meta tag already exists
    const existing = document.querySelector(`meta[http-equiv="${name}"]`);
    if (existing) {
      existing.setAttribute('content', content);
      return;
    }

    // Create new meta tag
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', name);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  }

  public getNonce(): string {
    return this.nonce;
  }

  public refreshNonce(): string {
    this.nonce = this.generateNonce();
    return this.nonce;
  }

  public validateNonce(nonce: string): boolean {
    return nonce === this.nonce;
  }

  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeSecurityHeaders();
  }

  public getConfig(): Readonly<SecurityConfig> {
    return { ...this.config };
  }

  // Method to add script with nonce
  public createSecureScript(src?: string, content?: string): HTMLScriptElement {
    const script = document.createElement('script');
    script.nonce = this.nonce;
    
    if (src) {
      script.src = src;
    }
    
    if (content) {
      script.textContent = content;
    }
    
    return script;
  }

  // Method to add style with nonce
  public createSecureStyle(content: string): HTMLStyleElement {
    const style = document.createElement('style');
    style.nonce = this.nonce;
    style.textContent = content;
    return style;
  }

  // Validate origin for CORS
  public validateOrigin(origin: string): boolean {
    const allowedOrigins = [
      window.location.origin,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
    
    return allowedOrigins.includes(origin);
  }
}

export const securityHeadersService = new SecurityHeadersService();