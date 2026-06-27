import { MAPBOX_ACCESS_TOKEN } from '../config/mapbox-config';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface RouteResponse {
  distance: number; // in meters
  duration: number; // in seconds
  coordinates: Coordinate[];
  isFallback?: boolean; // Flag to indicate if this is a fallback result
}

interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
  placeName: string;
  isFallback?: boolean;
}

/**
 * Calculate straight-line distance in meters using Haversine formula
 * Fallback when Mapbox API is unavailable
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate straight-line coordinates between two points
 * Fallback when Mapbox API is unavailable
 */
function generateFallbackRoute(origin: Coordinate, destination: Coordinate): Coordinate[] {
  const coordinates: Coordinate[] = [];
  const steps = 20; // Number of points along the line

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    coordinates.push({
      latitude: origin.latitude + (destination.latitude - origin.latitude) * t,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * t,
    });
  }

  return coordinates;
}

/**
 * Mapbox Service - Handles all Mapbox API interactions with fallback support
 * Use this for routing, directions, and geocoding
 */
export class MapboxService {
  private static baseUrl = 'https://api.mapbox.com';
  private static requestTimeout = 10000; // 10 seconds timeout

  /**
   * Fetch with timeout
   */
  private static async fetchWithTimeout(url: string, timeout = this.requestTimeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  /**
   * Get driving directions between two points
   * Falls back to straight-line route if Mapbox is unavailable
   */
  static async getDirections(
    origin: Coordinate,
    destination: Coordinate,
    profile: 'driving' | 'driving-traffic' | 'walking' | 'cycling' = 'driving-traffic'
  ): Promise<RouteResponse | null> {
    try {
      // Skip API call if no token
      if (!MAPBOX_ACCESS_TOKEN) {
        console.warn('No Mapbox token available, using fallback route');
        return this.generateFallbackRoute(origin, destination);
      }

      const url = `${this.baseUrl}/directions/v5/mapbox/${profile}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;

      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.warn(`Mapbox API error: ${response.status}, using fallback route`);
        return this.generateFallbackRoute(origin, destination);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: route.distance,
          duration: route.duration,
          coordinates: route.geometry.coordinates.map((coord: [number, number]) => ({
            latitude: coord[1],
            longitude: coord[0],
          })),
          isFallback: false,
        };
      }

      console.warn('No routes found in Mapbox response, using fallback');
      return this.generateFallbackRoute(origin, destination);
    } catch (error) {
      console.warn('Mapbox directions error, using fallback route:', error);
      return this.generateFallbackRoute(origin, destination);
    }
  }

  /**
   * Generate fallback route with approximate distance and duration
   */
  private static generateFallbackRoute(origin: Coordinate, destination: Coordinate): RouteResponse {
    const distance = calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);

    // Assume average speed of 40 km/h for duration estimation
    const duration = (distance / 1000 / 40) * 3600;

    return {
      distance,
      duration,
      coordinates: generateFallbackRoute(origin, destination),
      isFallback: true,
    };
  }

  /**
   * Get multiple route alternatives with fallback
   */
  static async getRouteAlternatives(
    origin: Coordinate,
    destination: Coordinate
  ): Promise<RouteResponse[]> {
    try {
      if (!MAPBOX_ACCESS_TOKEN) {
        console.warn('No Mapbox token available, using single fallback route');
        const fallback = await this.getDirections(origin, destination);
        return fallback ? [fallback] : [];
      }

      const url = `${this.baseUrl}/directions/v5/mapbox/driving-traffic/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&overview=full&alternatives=true&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;

      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.warn(`Mapbox route alternatives error: ${response.status}, using fallback`);
        const fallback = await this.getDirections(origin, destination);
        return fallback ? [fallback] : [];
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        return data.routes.map((route: any) => ({
          distance: route.distance,
          duration: route.duration,
          coordinates: route.geometry.coordinates.map((coord: [number, number]) => ({
            latitude: coord[1],
            longitude: coord[0],
          })),
          isFallback: false,
        }));
      }

      const fallback = await this.getDirections(origin, destination);
      return fallback ? [fallback] : [];
    } catch (error) {
      console.warn('Mapbox route alternatives error, using fallback:', error);
      const fallback = await this.getDirections(origin, destination);
      return fallback ? [fallback] : [];
    }
  }

  /**
   * Reverse geocoding - Convert coordinates to address
   * Falls back to generic coordinate format if API unavailable
   */
  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodingResult | null> {
    try {
      if (!MAPBOX_ACCESS_TOKEN) {
        console.warn('No Mapbox token, using fallback address format');
        return {
          latitude,
          longitude,
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          placeName: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          isFallback: true,
        };
      }

      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;

      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.warn(`Mapbox reverse geocode error: ${response.status}, using fallback`);
        return {
          latitude,
          longitude,
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          placeName: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          isFallback: true,
        };
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          latitude,
          longitude,
          address: feature.place_name,
          placeName: feature.text,
          isFallback: false,
        };
      }

      return {
        latitude,
        longitude,
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        placeName: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        isFallback: true,
      };
    } catch (error) {
      console.warn('Mapbox reverse geocode error, using fallback:', error);
      return {
        latitude,
        longitude,
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        placeName: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        isFallback: true,
      };
    }
  }

  /**
   * Forward geocoding - Convert address to coordinates
   * Returns empty array if API unavailable (user should use manual input)
   */
  static async geocode(address: string): Promise<GeocodingResult[]> {
    try {
      if (!MAPBOX_ACCESS_TOKEN) {
        console.warn('No Mapbox token, geocoding unavailable');
        return [];
      }

      const encodedAddress = encodeURIComponent(address);
      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;

      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.warn(`Mapbox geocode error: ${response.status}`);
        return [];
      }

      const data = await response.json();

      if (data.features) {
        return data.features.map((feature: any) => ({
          latitude: feature.center[1],
          longitude: feature.center[0],
          address: feature.place_name,
          placeName: feature.text,
          isFallback: false,
        }));
      }

      return [];
    } catch (error) {
      console.warn('Mapbox geocode error:', error);
      return [];
    }
  }

  /**
   * Get static map image URL
   * Returns empty string if token unavailable
   */
  static getStaticMapUrl(
    latitude: number,
    longitude: number,
    width: number = 600,
    height: number = 400,
    zoom: number = 14
  ): string {
    if (!MAPBOX_ACCESS_TOKEN) {
      console.warn('No Mapbox token available for static map');
      return '';
    }
    return `${this.baseUrl}/styles/v1/mapbox/streets-v12/static/pin-s+ff0000(${longitude},${latitude})/${longitude},${latitude},${zoom},0/${width}x${height}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
  }

  /**
   * Get static map with route
   * Returns empty string if token unavailable
   */
  static getStaticRouteMapUrl(
    origin: Coordinate,
    destination: Coordinate,
    width: number = 600,
    height: number = 400
  ): string {
    if (!MAPBOX_ACCESS_TOKEN) {
      console.warn('No Mapbox token available for static route map');
      return '';
    }
    const path = `path-5+6B46C1-0.8(${encodeURIComponent(`polyline(${origin.latitude},${origin.longitude},${destination.latitude},${destination.longitude})`)})`;
    return `${this.baseUrl}/styles/v1/mapbox/streets-v12/static/${path}/auto/${width}x${height}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
  }
}
