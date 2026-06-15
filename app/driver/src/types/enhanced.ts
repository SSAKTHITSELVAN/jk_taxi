// Enhanced driver types for V2 API

export interface EnhancedRide {
  id: string;
  user_id: string;
  driver_id?: string;
  trip_type: string;
  vehicle_category: string;
  pickup_location: string;
  dropoff_location?: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  stops: Array<{
    address: string;
    latitude: number;
    longitude: number;
  }>;
  is_scheduled: boolean;
  scheduled_datetime?: string;
  booking_for_self: boolean;
  passenger_name?: string;
  passenger_phone?: string;
  passenger_notes?: string;
  preferences: {
    ac_preferred: boolean;
    pet_friendly: boolean;
    silent_ride: boolean;
    extra_luggage: boolean;
    wheelchair_support: boolean;
  };
  driver_notes?: string;
  ride_otp: string;
  otp_verified: boolean;
  status: string;
  fare: number;
  base_fare: number;
  distance_fare: number;
  platform_fee: number;
  gst: number;
  toll_charges: number;
  night_charges: number;
  waiting_charges: number;
  payment_status: string;
  payment_method: string;
  transaction_id?: string;
  distance_km: number;
  eta_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface VerifyOTPRequest {
  ride_id: string;
  otp: string;
}
