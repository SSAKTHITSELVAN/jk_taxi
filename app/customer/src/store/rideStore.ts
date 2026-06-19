import { create } from 'zustand';
import { Ride, CreateRideData } from '../types';
import { ridesApi } from '../api/rides';
import { bookingEnhancedApi } from '../api/booking-enhanced';

interface RideState {
  activeRide: Ride | null;
  rideHistory: Ride[];
  isLoading: boolean;
  error: string | null;
  driverLocation: { latitude: number; longitude: number } | null;
  trackingInterval: ReturnType<typeof setInterval> | null;
  pollCount: number;

  createRide: (data: CreateRideData) => Promise<Ride>;
  getActiveRide: () => Promise<void>;
  cancelRide: (rideId: string) => Promise<void>;
  loadRideHistory: () => Promise<void>;
  clearActiveRide: () => void;
  clearError: () => void;
  startTracking: () => void;
  stopTracking: () => void;
}

export const useRideStore = create<RideState>((set, get) => ({
  activeRide: null,
  rideHistory: [],
  isLoading: false,
  error: null,
  driverLocation: null,
  trackingInterval: null,
  pollCount: 0,

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
      await bookingEnhancedApi.cancelRide(rideId);
      set({ activeRide: null, driverLocation: null, isLoading: false });
      get().stopTracking();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to cancel ride';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  loadRideHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      const history = await bookingEnhancedApi.getRideHistory();
      set({ rideHistory: history as any, isLoading: false });
    } catch (error: any) {
      set({ error: 'Failed to load ride history', isLoading: false });
    }
  },

  startTracking: () => {
    const { trackingInterval } = get();
    if (trackingInterval) return;

    const interval = setInterval(async () => {
      const { activeRide, pollCount } = get();
      if (!activeRide) { get().stopTracking(); return; }

      try {
        const tracking = await bookingEnhancedApi.getActiveRideTracking();

        if (tracking.driver_lat && tracking.driver_lng) {
          set({ driverLocation: { latitude: tracking.driver_lat, longitude: tracking.driver_lng } });
        }

        // Check status change every 3rd poll (~12s)
        if (pollCount % 3 === 0) {
          const ride = await bookingEnhancedApi.getActiveRide();
          set({ activeRide: ride as any });

          if (ride.status === 'completed' || ride.status === 'cancelled') {
            get().stopTracking();
          }
        }

        set({ pollCount: pollCount + 1 });
      } catch (error: any) {
        if (error.response?.status === 404) {
          set({ activeRide: null, driverLocation: null });
          get().stopTracking();
        }
      }
    }, 4000);

    set({ trackingInterval: interval, pollCount: 0 });
  },

  stopTracking: () => {
    const { trackingInterval } = get();
    if (trackingInterval) {
      clearInterval(trackingInterval);
      set({ trackingInterval: null, driverLocation: null, pollCount: 0 });
    }
  },

  clearActiveRide: () => { get().stopTracking(); set({ activeRide: null, driverLocation: null }); },
  clearError: () => set({ error: null }),
}));
