import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { ENV } from '@/config/environment';
import { getDeviceFingerprint } from '@/services/utils/fingerprint';
import { ApiResponse } from '@/types/api';

class ApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: ENV.BASE_URL,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Enable credentials (cookies) for production mode
      withCredentials: ENV.APP_MODE === 'PRODUCTION',
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Add device fingerprint header
        const fingerprint = await getDeviceFingerprint();
        config.headers['X-Cf-Requestid'] = fingerprint;

        // Add access token for authenticated requests (but not for auth endpoints)
        if (!config.url?.includes('auth/')) {
          const token = this.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized or session-related 403 errors
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('auth/')) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle 403 Forbidden - distinguish between permission issues and session issues
        if (error.response?.status === 403) {
          const errorMessage = error.response.data?.message || '';

          // Check if it's a session/authentication issue (not a permission issue)
          const isSessionIssue = errorMessage.toLowerCase().includes('session') ||
                                 errorMessage.toLowerCase().includes('expired') ||
                                 errorMessage.toLowerCase().includes('invalid token') ||
                                 errorMessage.toLowerCase().includes('token') ||
                                 errorMessage.toLowerCase().includes('unauthorized') ||
                                 errorMessage.toLowerCase().includes('not authenticated');

          if (isSessionIssue) {
            // Treat as session expiration - logout the user
            console.log('Session expired or invalid token detected (403), logging out user');
            this.logout();
            return Promise.reject(error);
          }

          // Only treat as permission issue if message specifically mentions permissions
          if (errorMessage === "You do not have permission to perform this action.") {
            console.log('403 Forbidden detected, navigating to no permission page');
            // Instead of window.location.href, use a custom event for navigation
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('app:navigate-no-permission'));
            }
            // Return a resolved promise to prevent error propagation and toast display
            return Promise.resolve({
              data: {
                status: false,
                message: "Access denied - handled by interceptor",
                data: []
              },
              status: 403,
              statusText: 'Forbidden',
              headers: error.response.headers,
              config: error.config,
            } as AxiosResponse);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private getAccessToken(): string | null {
    if (ENV.APP_MODE === 'PRODUCTION') {
      return Cookies.get('access_token') || null;
    } else {
      return localStorage.getItem('access_token');
    }
  }

  private getRefreshToken(): string | null {
    if (ENV.APP_MODE === 'PRODUCTION') {
      return Cookies.get('refresh_token') || null;
    } else {
      return localStorage.getItem('refresh_token');
    }
  }

  private setTokens(accessToken: string, refreshToken: string, expiresAt: number) {
    if (ENV.APP_MODE === 'PRODUCTION') {
      // Set cookies with secure options
      const expires = new Date(Date.now() + expiresAt * 1000);
      Cookies.set('access_token', accessToken, { 
        expires, 
        secure: true, 
        sameSite: 'strict' 
      });
      Cookies.set('refresh_token', refreshToken, { 
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        secure: true, 
        sameSite: 'strict' 
      });
    } else {
      // Use localStorage for UAT
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('token_expires_at', expiresAt.toString());
    }
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const fingerprint = await getDeviceFingerprint();
    
    const config: AxiosRequestConfig = {
      headers: {
        'X-Cf-Requestid': fingerprint,
      },
    };

    const requestData = ENV.APP_MODE === 'UAT' 
      ? { refresh_token: refreshToken }
      : {};

    // Add API-Key header for UAT mode
    if (ENV.APP_MODE === 'UAT') {
      config.headers!['API-Key'] = refreshToken;
    }

    try {
      const response = await this.client.post<ApiResponse<any>>('auth/refresh-token', requestData, config);
      
      if (response.data.status && response.data.data?.access_token) {
        const { access_token, refresh_token, token_expires_at } = response.data.data;
        this.setTokens(access_token, refresh_token, token_expires_at);
        return access_token;
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);

      // Check if it's a 403 error indicating the refresh token itself has expired
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log('Refresh token expired or invalid, triggering logout');
        throw new Error('Session expired - refresh token invalid');
      }

      throw new Error('Failed to refresh authentication token');
    }
  }

  private logout() {
    if (ENV.APP_MODE === 'PRODUCTION') {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
      localStorage.removeItem('user_data');
    }
    
    console.warn('Authentication failed - tokens cleared');
    
    // Trigger proper logout flow by dispatching custom event
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  public storeTokens(accessToken: string, refreshToken: string, expiresAt: number) {
    this.setTokens(accessToken, refreshToken, expiresAt);
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete(url, config);
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.patch(url, data, config);
  }
}

const apiServiceInstance = new ApiService();
export default apiServiceInstance;