import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  team_member: {
    id: string;
    email: string;
    name: string;
    role: string;
    merchant_id: string;
  };
}

export interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

class TeamAuthService {
  private api: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Add access token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/team/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>(
      '/api/v1/auth/team/login',
      credentials
    );

    this.setTokens(
      response.data.access_token,
      response.data.refresh_token,
      response.data.team_member
    );

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/api/v1/auth/team/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<RefreshResponse>(
          `${API_BASE_URL}/api/v1/auth/team/refresh`,
          { refresh_token: refreshToken }
        );

        const newAccessToken = response.data.access_token;
        localStorage.setItem('team_access_token', newAccessToken);

        return newAccessToken;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async forgotPassword(email: string): Promise<void> {
    await this.api.post('/api/v1/auth/team/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.api.post('/api/v1/auth/team/reset-password', {
      token,
      new_password: newPassword,
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await this.api.post('/api/v1/auth/team/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  // Token management
  private setTokens(
    accessToken: string,
    refreshToken: string,
    teamMember: LoginResponse['team_member']
  ): void {
    localStorage.setItem('team_access_token', accessToken);
    localStorage.setItem('team_refresh_token', refreshToken);
    localStorage.setItem('team_member', JSON.stringify(teamMember));
  }

  private clearTokens(): void {
    localStorage.removeItem('team_access_token');
    localStorage.removeItem('team_refresh_token');
    localStorage.removeItem('team_member');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('team_access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('team_refresh_token');
  }

  getCurrentUser(): LoginResponse['team_member'] | null {
    const userStr = localStorage.getItem('team_member');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }
}

export const teamAuthService = new TeamAuthService();
