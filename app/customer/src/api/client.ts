import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config';
import { router } from 'expo-router';

class ApiClient {
  private client: AxiosInstance;
  private inMemoryToken: string | null = null;
  private logoutCallback: (() => void) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        // Debug logging
        console.log('🌐 [API REQUEST]', config.method?.toUpperCase(), config.url);
        console.log('📍 [BASE URL]', config.baseURL);
        console.log('📦 [DATA]', JSON.stringify(config.data));

        try {
          const token = await AsyncStorage.getItem('access_token');
          if (token) {
            this.inMemoryToken = token;
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 [AUTH] Token added from storage');
          } else if (this.inMemoryToken) {
            config.headers.Authorization = `Bearer ${this.inMemoryToken}`;
            console.log('🔑 [AUTH] Token added from memory');
          } else {
            console.log('🔓 [AUTH] No token');
          }
        } catch (error) {
          console.log('⚠️  [STORAGE] Could not access token storage:', error);
          if (this.inMemoryToken) {
            config.headers.Authorization = `Bearer ${this.inMemoryToken}`;
            console.log('🔑 [AUTH] Token added from memory (storage failed)');
          }
        }
        return config;
      },
      (error) => {
        console.error('❌ [REQUEST ERROR]', error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ [API SUCCESS]', response.status, response.config.url);
        return response;
      },
      async (error: AxiosError) => {
        // Handle 401 first and suppress further logs
        if (error.response?.status === 401) {
          console.log('🚪 [401 UNAUTHORIZED] Token expired or invalid - logging out');
          await this.handleUnauthorized();
          return Promise.reject(error);
        }

        // Don't log 404 "No active ride" as error - it's expected
        const isNoActiveRide = error.response?.status === 404 &&
                               error.config?.url?.includes('/active');

        if (!isNoActiveRide) {
          console.error('❌ [API ERROR]', error.message);
          console.error('📍 [URL]', error.config?.url);
          console.error('📍 [BASE URL]', error.config?.baseURL);

          if (error.response) {
            console.error('📝 [STATUS]', error.response.status);
            console.error('📝 [DATA]', JSON.stringify(error.response.data));
          } else if (error.request) {
            console.error('📝 [NO RESPONSE] Request was made but no response received');
            console.error('📝 [REQUEST]', error.request);
          } else {
            console.error('📝 [ERROR]', error.message);
          }
        } else {
          console.log('ℹ️  [NO ACTIVE RIDE] No active ride found (this is normal)');
        }

        return Promise.reject(error);
      }
    );
  }

  private async handleUnauthorized() {
    // Clear tokens
    this.inMemoryToken = null;

    try {
      // Clear all auth data from storage
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      console.log('✅ [LOGOUT] Storage cleared');
    } catch (error) {
      console.log('⚠️  [STORAGE] Could not clear storage:', error);
    }

    // Call logout callback if registered (from auth store)
    if (this.logoutCallback) {
      this.logoutCallback();
    }

    // Navigate to login screen
    try {
      router.replace('/login');
      console.log('✅ [LOGOUT] Redirected to login');
    } catch (error) {
      console.log('⚠️  [NAVIGATION] Could not redirect to login:', error);
    }
  }

  public setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
  }

  public getClient(): AxiosInstance {
    return this.client;
  }

  public setBaseURL(url: string) {
    this.client.defaults.baseURL = url;
  }

  public setToken(token: string) {
    this.inMemoryToken = token;
  }

  public clearToken() {
    this.inMemoryToken = null;
  }
}

const apiClientInstance = new ApiClient();
export const apiClient = apiClientInstance.getClient();
export const setApiToken = (token: string) => apiClientInstance.setToken(token);
export const clearApiToken = () => apiClientInstance.clearToken();
export const setLogoutCallback = (callback: () => void) => apiClientInstance.setLogoutCallback(callback);
export default apiClient;
