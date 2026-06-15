// Mapbox Configuration
export const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN';

// Default map center (Bangalore)
export const DEFAULT_CENTER = {
  latitude: 12.9716,
  longitude: 77.5946,
};

// Map style
export const MAPBOX_STYLE_URL = 'mapbox://styles/mapbox/streets-v12';

// Zoom levels
export const DEFAULT_ZOOM = 14;
export const PICKUP_ZOOM = 16;
