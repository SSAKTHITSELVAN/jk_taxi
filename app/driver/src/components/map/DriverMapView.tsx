import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_ACCESS_TOKEN, MAP_STYLES, MAP_PADDING, ANIMATION_DURATION } from '../../config/mapbox-config';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../constants/theme';

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface DriverMapViewProps {
  pickup: Location;
  dropoff: Location;
  driverLocation?: Location;
  showRoute?: boolean;
  onRouteReady?: (distance: number, duration: number) => void;
}

interface RouteData {
  coordinates: number[][];
  distance: number;
  duration: number;
}

/**
 * DriverMapView - Map view for drivers showing pickup, dropoff, and route
 * Includes driver's current location marker
 */
export const DriverMapView: React.FC<DriverMapViewProps> = ({
  pickup,
  dropoff,
  driverLocation,
  showRoute = true,
  onRouteReady,
}) => {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallbackRoute, setIsFallbackRoute] = useState(false);

  useEffect(() => {
    if (showRoute) {
      fetchRoute();
    }
  }, [pickup, dropoff, showRoute]);

  useEffect(() => {
    if (routeData && cameraRef.current) {
      // Fit map to show entire route plus driver location
      const coordinates = [...routeData.coordinates];
      if (driverLocation) {
        coordinates.push([driverLocation.longitude, driverLocation.latitude]);
      }

      const lngs = coordinates.map(c => c[0]);
      const lats = coordinates.map(c => c[1]);

      const bounds = {
        ne: [Math.max(...lngs), Math.max(...lats)],
        sw: [Math.min(...lngs), Math.min(...lats)],
      };

      cameraRef.current.fitBounds(
        bounds.ne as [number, number],
        bounds.sw as [number, number],
        [MAP_PADDING.top, MAP_PADDING.right, MAP_PADDING.bottom, MAP_PADDING.left],
        ANIMATION_DURATION
      );
    }
  }, [routeData, driverLocation]);

  const fetchRoute = async () => {
    setIsLoading(true);
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates;

          setRouteData({
            coordinates,
            distance: route.distance,
            duration: route.duration,
          });

          if (onRouteReady) {
            onRouteReady(route.distance / 1000, route.duration / 60);
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        // Use fallback route if API fails
        console.warn('Mapbox API unavailable, using straight-line route:', fetchError);
        const distance = calculateStraightLineDistance(
          pickup.latitude,
          pickup.longitude,
          dropoff.latitude,
          dropoff.longitude
        );
        const coordinates = generateStraightLineRoute(pickup, dropoff);
        const estimatedDuration = (distance / 1000 / 40) * 3600; // 40 km/h average

        setRouteData({
          coordinates,
          distance,
          duration: estimatedDuration,
        });

        setIsFallbackRoute(true);

        if (onRouteReady) {
          onRouteReady(distance / 1000, estimatedDuration / 60);
        }
      }
    } catch (error) {
      console.error('Error in fetchRoute:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Haversine formula for distance calculation
  const calculateStraightLineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
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
  };

  // Generate straight-line coordinates
  const generateStraightLineRoute = (origin: typeof pickup, destination: typeof dropoff) => {
    const coordinates: [number, number][] = [];
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      coordinates.push([
        origin.longitude + (destination.longitude - origin.longitude) * t,
        origin.latitude + (destination.latitude - origin.latitude) * t,
      ]);
    }

    return coordinates;
  };

  const routeGeoJSON = routeData
    ? {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: routeData.coordinates,
        },
        properties: {},
      }
    : null;

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={MAP_STYLES.NAVIGATION_DAY}
        compassEnabled
        attributionEnabled={false}
        logoEnabled={false}
      >
        <Mapbox.Camera ref={cameraRef} animationDuration={ANIMATION_DURATION} />

        <Mapbox.UserLocation visible showsUserHeadingIndicator androidRenderMode="gps" />

        {/* Pickup marker (Green) */}
        <Mapbox.PointAnnotation
          id="pickup"
          coordinate={[pickup.longitude, pickup.latitude]}
          title="Pickup Location"
        >
          <View style={[styles.marker, styles.pickupMarker]}>
            <Text style={styles.markerText}>P</Text>
          </View>
        </Mapbox.PointAnnotation>

        {/* Dropoff marker (Red) */}
        <Mapbox.PointAnnotation
          id="dropoff"
          coordinate={[dropoff.longitude, dropoff.latitude]}
          title="Drop-off Location"
        >
          <View style={[styles.marker, styles.dropoffMarker]}>
            <Text style={styles.markerText}>D</Text>
          </View>
        </Mapbox.PointAnnotation>

        {/* Driver location marker (Purple) */}
        {driverLocation && (
          <Mapbox.PointAnnotation
            id="driver"
            coordinate={[driverLocation.longitude, driverLocation.latitude]}
            title="Your Location"
          >
            <View style={[styles.marker, styles.driverMarker]}>
              <Text style={styles.markerText}>🚗</Text>
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Route line */}
        {routeGeoJSON && (
          <Mapbox.ShapeSource id="routeSource" shape={routeGeoJSON}>
            <Mapbox.LineLayer
              id="routeLine"
              style={{
                lineColor: Colors.primary,
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>

      {/* Route info overlay */}
      {routeData && (
        <View style={[styles.routeInfoContainer, isFallbackRoute && styles.fallbackRouteContainer]}>
          <Text style={styles.routeInfoText}>
            {isFallbackRoute ? '⚠️ ' : '📍 '}
            {(routeData.distance / 1000).toFixed(1)} km • ⏱️ {Math.round(routeData.duration / 60)} min
          </Text>
          {isFallbackRoute && (
            <Text style={styles.fallbackWarningText}>
              (Approximate route - Service unavailable)
            </Text>
          )}
        </View>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pickupMarker: {
    backgroundColor: Colors.success,
  },
  dropoffMarker: {
    backgroundColor: Colors.error,
  },
  driverMarker: {
    backgroundColor: Colors.primary,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  routeInfoContainer: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeInfoText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fallbackRouteContainer: {
    borderColor: '#FFA500', // Orange for warning
  },
  fallbackWarningText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.normal,
    color: '#FFA500',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
