import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/api/AuthService';
import { AuthState, LoginRequest } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();
      let user = authService.getUserData();

      // If authenticated but no user data (happens in production mode), fetch from server
      if (isAuthenticated && !user) {
        user = await authService.fetchUserData();
      }

      setAuthState({
        user,
        isAuthenticated,
        accessToken: null, // We don't expose the actual token
        refreshToken: null, // We don't expose the actual token
        tokenExpiresAt: null,
      });

      // Setup automatic token refresh
      if (isAuthenticated) {
        authService.setupTokenRefresh();
      }
    };

    // Handle automatic logout when ApiService clears tokens
    const handleAuthLogout = () => {
      setAuthState({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
      });

      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });

      navigate('/login');
    };

    initializeAuth();

    // Listen for auth logout events from ApiService
    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [navigate, toast]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const authResponse = await authService.login(credentials);
      
      setAuthState({
        user: authResponse.user,
        isAuthenticated: true,
        accessToken: null, // We don't expose the actual token
        refreshToken: null, // We don't expose the actual token
        tokenExpiresAt: authResponse.token_expires_at,
      });

      // Setup automatic token refresh
      authService.setupTokenRefresh();

      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to dashboard...",
      });

      // Navigate to dashboard
      navigate('/dashboard');
      
      return authResponse;
    } catch (error: any) {
      console.error('Login error:', error);
      
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
      });

      // Clear selected country from localStorage
      localStorage.removeItem('selectedCountry');

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });

      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const checkAuthStatus = useCallback(() => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUserData();
    
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated,
    }));

    return isAuthenticated;
  }, []);

  return {
    ...authState,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };
};
