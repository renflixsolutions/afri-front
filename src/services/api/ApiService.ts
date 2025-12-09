import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { ENV } from '@/config/environment';
import { getDeviceFingerprint } from '@/services/utils/fingerprint';
import { ApiResponse } from '@/types/api';

class ApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
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

  private processQueue(error: unknown, token: string | null = null) {
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
      // ensure credentials flag when calling refresh endpoint
      withCredentials: ENV.APP_MODE === 'PRODUCTION',
    };

    const cookieRefresh = Cookies.get('refresh_token') || null;
    // If the server cookie is present prefer server cookie (no body). If cookie is missing but we have a
    // refresh token stored locally (e.g., running frontend on localhost), send it in the body as a fallback.
    const requestData: unknown = (() => {
      if (ENV.APP_MODE === 'UAT') return { refresh_token: refreshToken };
      // PRODUCTION: send empty body when cookie exists, otherwise include local refresh token as fallback
      return cookieRefresh ? {} : { refresh_token: refreshToken };
    })();

    // Add API-Key header for UAT mode (legacy behavior)
    if (ENV.APP_MODE === 'UAT') {
      config.headers!['API-Key'] = refreshToken;
    }

    // Helper to perform a request and return the parsed ApiResponse if successful
    const doRequest = async (body: unknown, cfg: AxiosRequestConfig) => {
      return this.client.post<ApiResponse<unknown>>('auth/refresh-token', body as any, cfg);
    };

    try {
      console.debug('Refreshing token', { url: `${ENV.BASE_URL}auth/refresh-token`, mode: ENV.APP_MODE, withCredentials: config.withCredentials, cookiePresent: !!cookieRefresh, requestData });
      const response = await doRequest(requestData, config);
      console.debug('Refresh token response', { status: response.status, data: response.data });

      if (response.data.status && response.data.data?.access_token) {
        const { access_token, refresh_token, token_expires_at } = response.data.data;
        this.setTokens(access_token, refresh_token, token_expires_at);
        return access_token;
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error: unknown) {
      console.error('Token refresh failed (initial attempt):', error);
      const eResp = (error && typeof error === 'object') ? (error as { response?: { status?: number; data?: unknown } }).response : undefined;
      if (eResp) {
        console.error('Refresh response data (initial):', eResp.data);
      }

      // Prepare variants to try if initial attempt failed and we did send a refresh token
      const sentRefresh = requestData && typeof requestData === 'object' && ((requestData as any).refresh_token || (requestData as any).refreshToken);

      // 1) If we sent refresh_token in JSON and got a 400, try form-urlencoded with refresh_token
      if (eResp?.status === 400 && sentRefresh && (requestData as any).refresh_token) {
        try {
          console.debug('Retrying token refresh using application/x-www-form-urlencoded (refresh_token)');
          const form = new URLSearchParams();
          form.append('refresh_token', (requestData as any).refresh_token);

          const retryConfig: AxiosRequestConfig = {
            headers: {
              ...config.headers,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            withCredentials: config.withCredentials,
          };

          const retryResponse = await this.client.post<ApiResponse<unknown>>('auth/refresh-token', form.toString(), retryConfig);
          console.debug('Refresh token retry response', { status: retryResponse.status, data: retryResponse.data });

          if (retryResponse.data.status && (retryResponse.data.data as any)?.access_token) {
            const { access_token, refresh_token, token_expires_at } = retryResponse.data.data as any;
            this.setTokens(access_token, refresh_token, token_expires_at);
            return access_token;
          } else {
            console.error('Unexpected retry refresh response', retryResponse.data);
            throw new Error((retryResponse.data as any).message || 'Token refresh retry failed');
          }
        } catch (retryErr: unknown) {
          console.error('Token refresh retry failed (form refresh_token):', retryErr);
          const rResp = (retryErr && typeof retryErr === 'object') ? (retryErr as { response?: { data?: unknown } }).response : undefined;
          if (rResp) console.error('Retry response data:', rResp.data);
          // continue to further fallbacks
        }
      }

      // 2) Try camelCase JSON: { refreshToken }
      if (sentRefresh) {
        try {
          console.debug('Retrying token refresh using JSON with camelCase field refreshToken');
          const camelBody = { refreshToken: refreshToken };
          const camelResponse = await doRequest(camelBody, config);
          console.debug('CamelCase JSON response', { status: camelResponse.status, data: camelResponse.data });

          if (camelResponse.data.status && (camelResponse.data.data as any)?.access_token) {
            const { access_token, refresh_token, token_expires_at } = camelResponse.data.data as any;
            this.setTokens(access_token, refresh_token, token_expires_at);
            return access_token;
          }
        } catch (camelErr: unknown) {
          console.error('CamelCase JSON attempt failed:', camelErr);
          const cResp = (camelErr && typeof camelErr === 'object') ? (camelErr as { response?: { data?: unknown } }).response : undefined;
          if (cResp) console.error('CamelCase response data:', cResp.data);
        }

        // 3) Try camelCase form-urlencoded
        try {
          console.debug('Retrying token refresh using form-urlencoded with camelCase field refreshToken');
          const form2 = new URLSearchParams();
          form2.append('refreshToken', refreshToken);
          const retryConfig2: AxiosRequestConfig = {
            headers: {
              ...config.headers,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            withCredentials: config.withCredentials,
          };
          const formResp = await this.client.post<ApiResponse<unknown>>('auth/refresh-token', form2.toString(), retryConfig2);
          console.debug('CamelCase form response', { status: formResp.status, data: formResp.data });

          if (formResp.data.status && (formResp.data.data as any)?.access_token) {
            const { access_token, refresh_token, token_expires_at } = formResp.data.data as any;
            this.setTokens(access_token, refresh_token, token_expires_at);
            return access_token;
          }
        } catch (formErr: unknown) {
          console.error('CamelCase form attempt failed:', formErr);
          const fResp = (formErr && typeof formErr === 'object') ? (formErr as { response?: { data?: unknown } }).response : undefined;
          if (fResp) console.error('CamelCase form response data:', fResp.data);
        }
      }

      // Check if it's a 403/401 error indicating the refresh token itself has expired
      if (eResp?.status === 403 || eResp?.status === 401) {
        console.log('Refresh token expired or invalid, triggering logout');
        throw new Error('Session expired - refresh token invalid');
      }

      // If server returned a message include it
      const serverMsg = eResp?.data && typeof (eResp.data as any).message === 'string' ? (eResp.data as any).message : undefined;
      if (serverMsg) {
        throw new Error(serverMsg);
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

  public async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get(url, config);
  }

  public async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, data as any, config);
  }

  public async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put(url, data as any, config);
  }

  public async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete(url, config);
  }

  public async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.patch(url, data as any, config);
  }
}

const apiServiceInstance = new ApiService();
export default apiServiceInstance;
