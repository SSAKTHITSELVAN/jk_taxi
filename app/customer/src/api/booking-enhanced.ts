import apiClient from './client';
import {
  VehicleCategoryData,
  EnhancedRide,
  FareBreakdown,
  BookingCreateRequest,
  SavedPlaces,
  SavedPlace
} from '../types/enhanced';

export const bookingEnhancedApi = {
  // Get vehicle categories
  getVehicleCategories: async (): Promise<VehicleCategoryData[]> => {
    const response = await apiClient.get<VehicleCategoryData[]>('/api/v2/bookings/vehicle-categories');
    return response.data;
  },

  // Calculate fare estimate
  calculateFare: async (params: {
    pickup_lat: number;
    pickup_lng: number;
    dropoff_lat: number;
    dropoff_lng: number;
    vehicle_category: string;
    scheduled_datetime?: string;
  }): Promise<FareBreakdown> => {
    const response = await apiClient.post<FareBreakdown>(
      '/api/v2/bookings/calculate-fare',
      null,
      { params }
    );
    return response.data;
  },

  // Create booking
  createBooking: async (data: BookingCreateRequest): Promise<EnhancedRide> => {
    const response = await apiClient.post<EnhancedRide>('/api/v2/bookings', data);
    return response.data;
  },

  // Get active ride
  getActiveRide: async (): Promise<EnhancedRide> => {
    const response = await apiClient.get<EnhancedRide>('/api/v2/bookings/active');
    return response.data;
  },

  // Get ride details
  getRide: async (rideId: string): Promise<EnhancedRide> => {
    const response = await apiClient.get<EnhancedRide>(`/api/v2/bookings/${rideId}`);
    return response.data;
  },

  // Cancel ride
  cancelRide: async (rideId: string): Promise<EnhancedRide> => {
    const response = await apiClient.put<EnhancedRide>(`/api/v2/bookings/${rideId}/cancel`);
    return response.data;
  },

  // Get ride history
  getRideHistory: async (): Promise<EnhancedRide[]> => {
    const response = await apiClient.get<EnhancedRide[]>('/api/v2/bookings/history/all');
    return response.data;
  },

  // Get nearby drivers count
  getNearbyDrivers: async (): Promise<{ nearby_count: number }> => {
    const response = await apiClient.get<{ nearby_count: number }>('/api/v2/bookings/nearby-drivers');
    return response.data;
  },
};

export const userEnhancedApi = {
  // Get saved places
  getSavedPlaces: async (): Promise<SavedPlaces> => {
    const response = await apiClient.get<SavedPlaces>('/api/v2/user/saved-places');
    return response.data;
  },

  // Save place
  savePlace: async (placeType: 'home' | 'work', data: SavedPlace) => {
    const response = await apiClient.put(`/api/v2/user/saved-places/${placeType}`, {
      place_type: placeType,
      ...data
    });
    return response.data;
  },

  // Delete place
  deletePlace: async (placeType: 'home' | 'work') => {
    const response = await apiClient.delete(`/api/v2/user/saved-places/${placeType}`);
    return response.data;
  }
};
