import apiService from './ApiService';
import { encryptPassword } from '@/services/utils/crypto';
import { getDeviceFingerprint } from '@/services/utils/fingerprint';
import { NonceResponse, AuthResponse, LoginRequest, User } from '@/types/api';
import { ENV } from '@/config/environment';

// Helper to safely extract an error message from unknown errors without using `any`
function extractErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (err && typeof err === 'object') {
    const maybe = err as { response?: { data?: { message?: unknown } }; message?: unknown };
    if (maybe.response && maybe.response.data && typeof maybe.response.data.message === 'string') {
      return maybe.response.data.message;
    }
    if (typeof maybe.message === 'string') {
      return maybe.message;
    }
  }
  return fallback;
}

class AuthService {
  async getNonce(): Promise<string> {
    try {
      const response = await apiService.get<NonceResponse>('auth/nonce');
      
      if (response.data.status && response.data.data?.cf) {
        return response.data.data.cf;
      } else {
        throw new Error(response.data.message );
      }
    } catch (err: unknown) {
      // Extract message safely from unknown
      const message = extractErrorMessage(err, 'Failed to get nonce');
      console.error('Get nonce error:', err);
      throw new Error(message);
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Get nonce first
      const nonce = await this.getNonce();
      
      // Encrypt password with nonce
      const encryptedPassword = encryptPassword(credentials.password, nonce);
      
      // Get device fingerprint
      const fingerprint = await getDeviceFingerprint();
      
      // Prepare login request
      const loginData = {
        username: credentials.username,
        password: encryptedPassword,
      };

      const config = {
        headers: {
          'X-Cf-Passport': nonce,
          'X-Cf-Requestid': fingerprint,
        },
      };

      const response = await apiService.post<AuthResponse>('auth/login', loginData, config);
      
      if (response.data.status && response.data.data) {
        const authData = response.data.data;
        
        // Store tokens using ApiService
        apiService.storeTokens(
          authData.access_token,
          authData.refresh_token,
          authData.token_expires_at
        );
        
        // Store user data
        this.storeUserData(authData.user);
        
        return authData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err: unknown) {
      // Normalize error
      const message = extractErrorMessage(err, 'Login failed');
      console.error('Login error:', err);
      throw new Error(message);
    }
  }

  private storeUserData(user: User) {
    // Store user data in sessionStorage for both UAT and PRODUCTION modes
    sessionStorage.setItem('user_data', JSON.stringify(user));
    if (ENV.APP_MODE === 'UAT') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }

  getUserData(): User | null {
    try {
      // Try sessionStorage first (works for both UAT and PRODUCTION)
      const userData = sessionStorage.getItem('user_data');
      if (userData) {
        return JSON.parse(userData);
      }

      // Fallback to localStorage for UAT mode
      if (ENV.APP_MODE === 'UAT') {
        const localData = localStorage.getItem('user_data');
        return localData ? JSON.parse(localData) : null;
      }

      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async fetchUserData(): Promise<User | null> {
    try {
      // Fetch fresh user data from the server
      const response = await apiService.get<User>('user');

      if (response.data.status && response.data.data) {
        const user = response.data.data;
        this.storeUserData(user);
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (ENV.APP_MODE === 'PRODUCTION') {
      // Check for cookies in production
      return document.cookie.includes('access_token=');
    } else {
      // Check localStorage in UAT
      const token = localStorage.getItem('access_token');
      const expiresAt = localStorage.getItem('token_expires_at');
      
      if (!token || !expiresAt) return false;
      
      // Check if token is expired
      const now = Date.now() / 1000;
      const expiry = parseInt(expiresAt);
      
      return now < expiry;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate session on server
      await apiService.post('auth/logout');
    } catch (error) {
      console.error('Server logout error:', error);
      // Continue with local logout even if server call fails
    } finally {
      // Clear session storage (used in both UAT and PRODUCTION)
      sessionStorage.removeItem('user_data');

      // Clear local tokens and data
      if (ENV.APP_MODE === 'PRODUCTION') {
        // Clear cookies
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } else {
        // Clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('user_data');
      }
    }
  }

  // Setup automatic token refresh (call every 20 minutes to refresh before expiration)
  setupTokenRefresh() {
    if (this.isAuthenticated()) {
      const refreshInterval = 20 * 60 * 1000; // 20 minutes in milliseconds
      
      setInterval(() => {
        if (this.isAuthenticated()) {
          // The ApiService will handle token refresh automatically through interceptors
          // We just need to make sure we're still authenticated
          console.log('Token refresh check - still authenticated');
        }
      }, refreshInterval);
    }
  }
}

export const authService = new AuthService();
