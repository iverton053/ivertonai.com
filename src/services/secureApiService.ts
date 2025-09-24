import { csrfService } from './csrfService';
import { securityHeadersService } from './securityHeadersService';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: number;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retryCount?: number;
  requireAuth?: boolean;
  skipCSRF?: boolean;
}

class SecureApiService {
  private baseUrl: string;
  private defaultTimeout = 30000; // 30 seconds
  private defaultRetryCount = 2;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Create secure headers with CSRF protection
  private createSecureHeaders(config: RequestConfig = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
      ...config.headers,
    };

    // Add CSRF token if not explicitly skipped
    if (!config.skipCSRF) {
      const csrfHeaders = csrfService.getHeaders();
      Object.assign(headers, csrfHeaders);
    }

    // Add origin validation
    headers['Origin'] = window.location.origin;
    headers['Referer'] = window.location.href;

    // Add request timestamp for replay attack protection
    headers['X-Request-Time'] = Date.now().toString();

    // Add nonce for CSP compliance
    const nonce = securityHeadersService.getNonce();
    if (nonce) {
      headers['X-CSP-Nonce'] = nonce;
    }

    return headers;
  }

  // Validate response for security issues
  private validateResponse(response: Response): void {
    // Check for security-related status codes
    if (response.status === 403) {
      const csrfInvalid = response.headers.get('X-CSRF-Token-Invalid');
      if (csrfInvalid) {
        throw new Error('CSRF token invalid or expired');
      }
      throw new Error('Access forbidden - insufficient permissions');
    }

    if (response.status === 429) {
      throw new Error('Rate limit exceeded - please try again later');
    }

    // Validate response headers for security
    const contentType = response.headers.get('Content-Type');
    if (contentType && !contentType.includes('application/json')) {
      console.warn('Unexpected content type:', contentType);
    }
  }

  // Enhanced fetch with security features
  private async secureFetch(
    url: string,
    config: RequestConfig = {}
  ): Promise<Response> {
    const {
      method = 'GET',
      body,
      timeout = this.defaultTimeout,
      retryCount = this.defaultRetryCount,
    } = config;

    const headers = this.createSecureHeaders(config);
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
      credentials: 'same-origin',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      referrerPolicy: 'strict-origin-when-cross-origin',
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (typeof body === 'object') {
        requestOptions.body = JSON.stringify(body);
      } else {
        requestOptions.body = body;
      }
    }

    try {
      console.log(`🔒 Secure API Request: ${method} ${fullUrl}`, {
        headers: Object.keys(headers),
        hasCSRF: !config.skipCSRF,
        timestamp: new Date().toISOString(),
      });

      const response = await fetch(fullUrl, requestOptions);
      clearTimeout(timeoutId);

      // Validate response security
      this.validateResponse(response);

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please check your connection');
        }
        
        if (error.message.includes('CSRF')) {
          // Try to refresh CSRF token and retry once
          if (retryCount > 0 && !config.skipCSRF) {
            console.log('🔄 Refreshing CSRF token and retrying request...');
            csrfService.refreshToken();
            
            return this.secureFetch(url, {
              ...config,
              retryCount: retryCount - 1,
            });
          }
        }
      }
      
      throw error;
    }
  }

  // Process API response with security validation
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const text = await response.text();
      
      // Attempt to parse JSON, fallback to text
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      const apiResponse: ApiResponse<T> = {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? (data?.message || data || 'Request failed') : undefined,
        message: data?.message,
        timestamp: Date.now(),
      };

      // Log security-relevant responses
      if (!response.ok) {
        console.warn('🚨 API Error Response:', {
          status: response.status,
          url: response.url,
          error: apiResponse.error,
        });
      }

      return apiResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process response',
        timestamp: Date.now(),
      };
    }
  }

  // Public API methods with security
  async get<T>(url: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    const response = await this.secureFetch(url, { ...config, method: 'GET' });
    return this.processResponse<T>(response);
  }

  async post<T>(url: string, data?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    const response = await this.secureFetch(url, {
      ...config,
      method: 'POST',
      body: data,
    });
    return this.processResponse<T>(response);
  }

  async put<T>(url: string, data?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    const response = await this.secureFetch(url, {
      ...config,
      method: 'PUT',
      body: data,
    });
    return this.processResponse<T>(response);
  }

  async patch<T>(url: string, data?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    const response = await this.secureFetch(url, {
      ...config,
      method: 'PATCH',
      body: data,
    });
    return this.processResponse<T>(response);
  }

  async delete<T>(url: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    const response = await this.secureFetch(url, { ...config, method: 'DELETE' });
    return this.processResponse<T>(response);
  }

  // Batch requests with rate limiting
  async batch<T>(
    requests: Array<{ url: string; config?: RequestConfig }>,
    options: { concurrent: number; delayMs: number } = { concurrent: 3, delayMs: 100 }
  ): Promise<ApiResponse<T>[]> {
    const results: ApiResponse<T>[] = [];
    const { concurrent, delayMs } = options;

    for (let i = 0; i < requests.length; i += concurrent) {
      const batch = requests.slice(i, i + concurrent);
      
      const promises = batch.map(async ({ url, config = {} }) => {
        try {
          const response = await this.secureFetch(url, config);
          return this.processResponse<T>(response);
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Batch request failed',
            timestamp: Date.now(),
          };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);

      // Add delay between batches to prevent overwhelming the server
      if (i + concurrent < requests.length && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  // Upload file with security
  async uploadFile<T>(
    url: string,
    file: File,
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    // Validate file type and size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size exceeds maximum allowed (10MB)',
        timestamp: Date.now(),
      };
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.createSecureHeaders({
      ...config,
      headers: {
        ...config.headers,
        // Remove Content-Type to let browser set it with boundary
      },
    });
    delete headers['Content-Type'];

    const response = await this.secureFetch(url, {
      ...config,
      method: 'POST',
      body: formData,
      headers,
    });

    return this.processResponse<T>(response);
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: number }>> {
    try {
      return await this.get('/health', { 
        timeout: 5000,
        skipCSRF: true, // Health checks typically don't need CSRF
      });
    } catch (error) {
      return {
        success: false,
        error: 'Health check failed',
        timestamp: Date.now(),
      };
    }
  }

  // Set base URL for all requests
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  // Get current security headers (for debugging)
  getSecurityHeaders(config: RequestConfig = {}): Record<string, string> {
    return this.createSecureHeaders(config);
  }
}

// Default instance for the app
export const secureApiService = new SecureApiService();

// Named export for creating additional instances
export { SecureApiService };