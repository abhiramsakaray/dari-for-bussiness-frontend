import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// API Base URL - use relative URL in dev to leverage Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface ApiClientConfig extends AxiosRequestConfig {
  idempotencyKey?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private apiKey: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
      },
      timeout: 30000,
      responseType: 'json',
      responseEncoding: 'utf8',
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add JWT Bearer token for require_merchant endpoints
        const token = localStorage.getItem('merchant_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        const apiKey = this.getApiKey();
        if (apiKey) {
          config.headers['X-API-Key'] = apiKey;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Log detailed error info for debugging
        console.error('🔴 API Error:', {
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });

        if (error.response?.status === 401) {
          console.warn('🔒 Unauthorized - clearing auth and redirecting to login');
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('dari_api_key', key);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      // Login stores key as 'api_key'; also check 'dari_api_key' for setApiKey() callers
      this.apiKey = localStorage.getItem('api_key') || localStorage.getItem('dari_api_key');
    }
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('dari_api_key');
  }

  private handleUnauthorized() {
    this.clearApiKey();
    localStorage.removeItem('merchant_token');
    localStorage.removeItem('api_key');
    localStorage.removeItem('merchant_email');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  // Generic request method with idempotency support
  async request<T>(config: ApiClientConfig): Promise<T> {
    const { idempotencyKey, ...axiosConfig } = config;

    if (idempotencyKey) {
      axiosConfig.headers = {
        ...axiosConfig.headers,
        'Idempotency-Key': idempotencyKey,
      };
    }

    const response = await this.client.request<T>(axiosConfig);
    return response.data;
  }

  // Convenience methods
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET', url });
  }

  post<T>(url: string, data?: unknown, config?: ApiClientConfig): Promise<T> {
    return this.request({ ...config, method: 'POST', url, data });
  }

  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PATCH', url, data });
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE', url });
  }
}

export const apiClient = new ApiClient();
