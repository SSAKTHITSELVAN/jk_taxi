import { create } from 'zustand';
import { Ride, CreateRideData } from '../types';
import { ridesApi } from '../api/rides';
import { bookingEnhancedApi } from '../api/booking-enhanced';

interface RideState {
  activeRide: Ride | null;
  rideHistory: Ride[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createRide: (data: CreateRideData) => Promise<Ride>;
  getActiveRide: () => Promise<void>;
  cancelRide: (rideId: string) => Promise<void>;
  loadRideHistory: () => Promise<void>;
  clearActiveRide: () => void;
  clearError: () => void;
}

export const useRideStore = create<RideState>((set, get) => ({
  activeRide: null,
  rideHistory: [],
  isLoading: false,
  error: null,

  createRide: async (data: CreateRideData) => {
    try {
      set({ isLoading: true, error: null });
      const ride = await ridesApi.createRide(data);
      set({ activeRide: ride, isLoading: false });
      return ride;
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to create ride';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  getActiveRide: async () => {
    try {
      set({ isLoading: true, error: null });
      // Use V2 API to get active ride from rides_enhanced table
      const ride = await bookingEnhancedApi.getActiveRide();
      set({ activeRide: ride as any, isLoading: false });
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ activeRide: null, isLoading: false });
      } else {
        set({ error: 'Failed to fetch active ride', isLoading: false });
      }
    }
  },

  cancelRide: async (rideId: string) => {
    try {
      set({ isLoading: true, error: null });
      // Use V2 API for enhanced bookings
      await bookingEnhancedApi.cancelRide(rideId);
      set({ activeRide: null, isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to cancel ride';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  loadRideHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      // Use V2 API to get history from rides_enhanced table
      const history = await bookingEnhancedApi.getRideHistory();
      set({ rideHistory: history as any, isLoading: false });
    } catch (error: any) {
      set({ error: 'Failed to load ride history', isLoading: false });
    }
  },

  clearActiveRide: () => set({ activeRide: null }),
  clearError: () => set({ error: null }),
}));
