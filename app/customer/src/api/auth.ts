import apiClient from './client';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  VerifyOTPData,
  User,
} from '../types';

export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (data: VerifyOTPData): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/verify-otp', data);
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>('/api/user/profile', data);
    return response.data;
  },
};
