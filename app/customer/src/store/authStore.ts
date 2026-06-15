import { create } from 'zustand';
import storage from '../utils/storage';
import { User, AuthResponse } from '../types';
import { authApi } from '../api/auth';
import { setApiToken, clearApiToken, setLogoutCallback } from '../api/client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, email: string, password: string, emergencyContactName?: string, emergencyContactPhone?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  setTokens: (tokens: AuthResponse) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Register logout callback with API client
  setLogoutCallback(() => {
    // This will be called when API returns 401
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  });

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

  setTokens: async (tokens: AuthResponse) => {
    // Set token in memory FIRST for immediate use
    setApiToken(tokens.access_token);

    // Store tokens (with automatic fallback)
    await storage.setItem('access_token', tokens.access_token);
    await storage.setItem('refresh_token', tokens.refresh_token);

    set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      isAuthenticated: true,
    });
  },

  login: async (phone: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login({ phone, password });

      // Set token in memory FIRST before profile request
      setApiToken(response.access_token);

      // Store tokens (with automatic fallback)
      await storage.setItem('access_token', response.access_token);
      await storage.setItem('refresh_token', response.refresh_token);

      // Load user profile (will now use in-memory token)
      const user = await authApi.getProfile();
      await storage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (name: string, phone: string, email: string, password: string, emergencyContactName?: string, emergencyContactPhone?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.register({
        name,
        phone,
        email,
        password,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
      });

      // Set token in memory FIRST before profile request
      setApiToken(response.access_token);

      // Store tokens (with automatic fallback)
      await storage.setItem('access_token', response.access_token);
      await storage.setItem('refresh_token', response.refresh_token);

      // Load user profile (will now use in-memory token)
      const user = await authApi.getProfile();
      await storage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    clearApiToken();
    await storage.multiRemove(['access_token', 'refresh_token', 'user']);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const token = await storage.getItem('access_token');
      const userStr = await storage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        setApiToken(token);
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.log('⚠️  Storage error during load:', error);
      set({ isLoading: false });
    }
  },

    clearError: () => set({ error: null }),
  };
});
