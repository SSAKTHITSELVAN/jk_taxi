import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_ACCESS_TOKEN, MAP_STYLES, MAP_PADDING, ANIMATION_DURATION } from '../../config/mapbox-config';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../constants/theme';

try {
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
} catch (error) {
  console.error('Failed to set Mapbox token in MapboxRouteMapNew:', error);
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapboxRouteMapNewProps {
  pickup: Location;
  dropoff: Location;
  onRouteReady?: (distance: number, duration: number) => void;
  showRouteInfo?: boolean;
}

interface RouteData {
  coordinates: number[][];
  distance: number;
  duration: number;
}

/**
 * MapboxRouteMapNew - Displays route between pickup and dropoff using Mapbox Directions API
 * Shows route polyline, markers, and estimated distance/duration
 */
export const MapboxRouteMapNew: React.FC<MapboxRouteMapNewProps> = ({
  pickup,
  dropoff,
  onRouteReady,
  showRouteInfo = true,
}) => {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  useEffect(() => {
    fetchRoute();
  }, [pickup, dropoff]);

  useEffect(() => {
    if (routeData && cameraRef.current) {
      // Fit map to show entire route
      const coordinates = routeData.coordinates;
      const bounds = {
        ne: [
          Math.max(...coordinates.map(c => c[0])),
          Math.max(...coordinates.map(c => c[1])),
        ],
        sw: [
          Math.min(...coordinates.map(c => c[0])),
          Math.min(...coordinates.map(c => c[1])),
        ],
      };

      cameraRef.current.fitBounds(bounds.ne, bounds.sw, MAP_PADDING, ANIMATION_DURATION);
    }
  }, [routeData]);

  const fetchRoute = async () => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;

      const response = await fetch(url);
      const data = await response.json();

      // Check for API errors
      if (data.message) {
        console.error('Mapbox Route API Error:', data.message);
        Alert.alert(
          'Route Calculation Error',
          `Failed to calculate route.\n\nMapbox API Error: ${data.message}\n\nToken preview: ${MAPBOX_ACCESS_TOKEN.substring(0, 20)}...`,
          [{ text: 'OK' }]
        );
        return;
      }

      if (!response.ok) {
        Alert.alert(
          'Route Calculation Error',
          `Failed to calculate route.\n\nHTTP Status: ${response.status}\nToken preview: ${MAPBOX_ACCESS_TOKEN.substring(0, 20)}...`,
          [{ text: 'OK' }]
        );
        return;
      }

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
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert(
        'Route Calculation Error',
        `Failed to calculate route.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nToken preview: ${MAPBOX_ACCESS_TOKEN.substring(0, 20)}...`,
        [{ text: 'OK' }]
      );
    }
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
        styleURL={MAP_STYLES.STREETS}
        compassEnabled
        attributionEnabled={false}
        logoEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          animationDuration={ANIMATION_DURATION}
        />

        <Mapbox.UserLocation visible showsUserHeadingIndicator />

        {/* Pickup marker */}
        <Mapbox.PointAnnotation
          id="pickup"
          coordinate={[pickup.longitude, pickup.latitude]}
          title="Pickup"
        >
          <View style={[styles.marker, styles.pickupMarker]}>
            <Text style={styles.markerText}>P</Text>
          </View>
        </Mapbox.PointAnnotation>

        {/* Dropoff marker */}
        <Mapbox.PointAnnotation
          id="dropoff"
          coordinate={[dropoff.longitude, dropoff.latitude]}
          title="Drop-off"
        >
          <View style={[styles.marker, styles.dropoffMarker]}>
            <Text style={styles.markerText}>D</Text>
          </View>
        </Mapbox.PointAnnotation>

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
      {showRouteInfo && routeData && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.routeInfoText}>
            {(routeData.distance / 1000).toFixed(1)} km • {Math.round(routeData.duration / 60)} min
          </Text>
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    backgroundColor: '#10B981',
  },
  dropoffMarker: {
    backgroundColor: '#EF4444',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
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
});
