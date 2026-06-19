import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAPBOX_ACCESS_TOKEN, MAP_STYLES, ANIMATION_DURATION } from '../../config/mapbox-config';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '../../constants/theme';

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface Location {
  latitude: number;
  longitude: number;
}

interface RideTrackingMapProps {
  rideStatus: 'pending' | 'accepted' | 'started';
  pickupLocation: Location;
  dropoffLocation: Location | null;
  driverLocation: Location | null;
  onEtaUpdate?: (distanceKm: number, durationMin: number) => void;
}

interface RouteData {
  coordinates: number[][];
  distance: number;
  duration: number;
}

export const RideTrackingMap: React.FC<RideTrackingMapProps> = ({
  rideStatus,
  pickupLocation,
  dropoffLocation,
  driverLocation,
  onEtaUpdate,
}) => {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Determine route endpoints based on status
  const getRouteEndpoints = (): { from: Location; to: Location } | null => {
    if (rideStatus === 'pending' && dropoffLocation) {
      return { from: pickupLocation, to: dropoffLocation };
    }
    if (rideStatus === 'accepted' && driverLocation) {
      return { from: driverLocation, to: pickupLocation };
    }
    if (rideStatus === 'started' && driverLocation && dropoffLocation) {
      return { from: driverLocation, to: dropoffLocation };
    }
    return null;
  };

  const endpoints = getRouteEndpoints();

  // Fetch route when endpoints change (debounced for driver movement)
  useEffect(() => {
    if (!endpoints) return;

    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;

    // For pending, fetch immediately. For moving driver, debounce to 10s
    if (rideStatus === 'pending' || timeSinceLastFetch > 10000) {
      fetchRoute(endpoints.from, endpoints.to);
      lastFetchRef.current = now;
    }
  }, [
    rideStatus,
    driverLocation?.latitude,
    driverLocation?.longitude,
    pickupLocation.latitude,
    dropoffLocation?.latitude,
  ]);

  // Fit camera when route or driver location changes
  useEffect(() => {
    if (!cameraRef.current) return;

    const points: number[][] = [];
    if (endpoints) {
      points.push([endpoints.from.longitude, endpoints.from.latitude]);
      points.push([endpoints.to.longitude, endpoints.to.latitude]);
    }
    if (driverLocation) {
      points.push([driverLocation.longitude, driverLocation.latitude]);
    }

    if (points.length >= 2) {
      const ne = [Math.max(...points.map(p => p[0])), Math.max(...points.map(p => p[1]))];
      const sw = [Math.min(...points.map(p => p[0])), Math.min(...points.map(p => p[1]))];
      cameraRef.current.fitBounds(ne, sw, [100, 50, 300, 50], ANIMATION_DURATION);
    }
  }, [routeData, driverLocation?.latitude]);

  const fetchRoute = async (from: Location, to: Location) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?geometries=geojson&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes?.[0]) {
        const route = data.routes[0];
        setRouteData({
          coordinates: route.geometry.coordinates,
          distance: route.distance,
          duration: route.duration,
        });
        if (onEtaUpdate) {
          onEtaUpdate(route.distance / 1000, route.duration / 60);
        }
      }
    } catch (error) {
      console.error('Route fetch error:', error);
    }
  };

  const routeGeoJSON = routeData ? {
    type: 'Feature' as const,
    geometry: { type: 'LineString' as const, coordinates: routeData.coordinates },
    properties: {},
  } : null;

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={MAP_STYLES.STREETS}
        compassEnabled
        attributionEnabled={false}
        logoEnabled={false}
      >
        <Mapbox.Camera ref={cameraRef} animationDuration={ANIMATION_DURATION} />
        <Mapbox.UserLocation visible showsUserHeadingIndicator />

        {/* Route polyline */}
        {routeGeoJSON && (
          <Mapbox.ShapeSource id="routeSource" shape={routeGeoJSON}>
            <Mapbox.LineLayer
              id="routeLine"
              style={{
                lineColor: Colors.primary,
                lineWidth: 5,
                lineOpacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* Pickup marker */}
        <Mapbox.PointAnnotation id="pickup" coordinate={[pickupLocation.longitude, pickupLocation.latitude]} title="Pickup">
          <View style={[styles.marker, styles.pickupMarker]}>
            <Text style={styles.markerText}>P</Text>
          </View>
        </Mapbox.PointAnnotation>

        {/* Dropoff marker */}
        {dropoffLocation && (
          <Mapbox.PointAnnotation id="dropoff" coordinate={[dropoffLocation.longitude, dropoffLocation.latitude]} title="Dropoff">
            <View style={[styles.marker, styles.dropoffMarker]}>
              <Text style={styles.markerText}>D</Text>
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Driver marker (car icon) */}
        {driverLocation && (rideStatus === 'accepted' || rideStatus === 'started') && (
          <Mapbox.PointAnnotation id="driver" coordinate={[driverLocation.longitude, driverLocation.latitude]} title="Driver">
            <View style={styles.driverMarker}>
              <Ionicons name="car" size={22} color="#FFF" />
            </View>
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>

      {/* ETA overlay */}
      {routeData && (
        <View style={[styles.etaOverlay, { top: insets.top + 60 }]}>
          <Text style={styles.etaTime}>{Math.ceil(routeData.duration / 60)} min</Text>
          <Text style={styles.etaDist}>{(routeData.distance / 1000).toFixed(1)} km</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
  pickupMarker: { backgroundColor: '#4CAF50' },
  dropoffMarker: { backgroundColor: '#F44336' },
  markerText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  driverMarker: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 6,
  },
  etaOverlay: {
    position: 'absolute', left: Spacing.md,
    backgroundColor: '#FFF', borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  etaTime: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.primary },
  etaDist: { fontSize: FontSizes.sm, color: '#666' },
});
