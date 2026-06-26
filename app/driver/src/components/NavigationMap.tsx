import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_ACCESS_TOKEN } from '../config/mapbox-config';

interface NavigationMapProps {
  driverLocation: { latitude: number; longitude: number };
  destinationLocation: { latitude: number; longitude: number };
  routeCoordinates?: number[][];
  showPickupMarker?: boolean;
  showDropoffMarker?: boolean;
  pickupCoords?: { latitude: number; longitude: number };
  dropoffCoords?: { latitude: number; longitude: number };
  onRouteUpdate?: (coords: number[][], distance: number, duration: number) => void;
}

export const NavigationMap: React.FC<NavigationMapProps> = ({
  driverLocation,
  destinationLocation,
  routeCoordinates,
  showPickupMarker = true,
  showDropoffMarker = false,
  pickupCoords,
  dropoffCoords,
  onRouteUpdate,
}) => {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const mapRef = useRef<Mapbox.MapView>(null);

  // Fetch route from Mapbox Directions API
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${driverLocation.longitude},${driverLocation.latitude};${destinationLocation.longitude},${destinationLocation.latitude}?geometries=geojson&overview=full&steps=true&banner_instructions=true&voice_instructions=true&access_token=${MAPBOX_ACCESS_TOKEN}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.routes?.[0]) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates;
          const distance = route.distance / 1000; // km
          const duration = route.duration / 60; // minutes

          if (onRouteUpdate) {
            onRouteUpdate(coords, distance, duration);
          }

          // Auto-fit camera to show entire route
          if (cameraRef.current) {
            const lngs = coords.map((c: number[]) => c[0]);
            const lats = coords.map((c: number[]) => c[1]);

            const ne = [Math.max(...lngs), Math.max(...lats)];
            const sw = [Math.min(...lngs), Math.min(...lats)];

            // Padding: [top, right, bottom, left]
            cameraRef.current.fitBounds(ne, sw, [150, 60, 450, 60], 1500);
          }
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [driverLocation, destinationLocation]);

  // Route GeoJSON
  const routeGeoJSON = routeCoordinates
    ? {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: routeCoordinates,
        },
        properties: {},
      }
    : null;

  return (
    <Mapbox.MapView
      ref={mapRef}
      style={styles.map}
      styleURL="mapbox://styles/mapbox/navigation-day-v1"
      compassEnabled
      compassViewPosition={3}
      compassViewMargins={{ x: 16, y: 120 }}
      attributionEnabled={false}
      logoEnabled={false}
      pitchEnabled={true}
      rotateEnabled={true}
    >
      <Mapbox.Camera
        ref={cameraRef}
        zoomLevel={14}
        centerCoordinate={[driverLocation.longitude, driverLocation.latitude]}
        animationDuration={1500}
        pitch={60}
        heading={0}
        followUserLocation={true}
        followUserMode="course"
      />

      {/* User Location with Puck */}
      <Mapbox.LocationPuck
        pulsing={{ isEnabled: true }}
        puckBearingEnabled
        puckBearing="course"
      />

      {/* Route Line - Shadow/Border */}
      {routeGeoJSON && (
        <Mapbox.ShapeSource id="routeBorder" shape={routeGeoJSON}>
          <Mapbox.LineLayer
            id="routeBorderLine"
            style={{
              lineColor: '#1e40af',
              lineWidth: 10,
              lineOpacity: 0.3,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </Mapbox.ShapeSource>
      )}

      {/* Route Line - Main */}
      {routeGeoJSON && (
        <Mapbox.ShapeSource id="routeMain" shape={routeGeoJSON}>
          <Mapbox.LineLayer
            id="routeMainLine"
            style={{
              lineColor: '#2563eb',
              lineWidth: 7,
              lineOpacity: 1,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </Mapbox.ShapeSource>
      )}

      {/* Route Line - Casing (white outline) */}
      {routeGeoJSON && (
        <Mapbox.ShapeSource id="routeCasing" shape={routeGeoJSON}>
          <Mapbox.LineLayer
            id="routeCasingLine"
            belowLayerID="routeBorderLine"
            style={{
              lineColor: '#ffffff',
              lineWidth: 12,
              lineOpacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </Mapbox.ShapeSource>
      )}

      {/* Pickup Marker */}
      {showPickupMarker && pickupCoords && (
        <Mapbox.PointAnnotation
          id="pickupMarker"
          coordinate={[pickupCoords.longitude, pickupCoords.latitude]}
        >
          <Mapbox.Callout title="Pickup Location" />
        </Mapbox.PointAnnotation>
      )}

      {/* Dropoff Marker */}
      {showDropoffMarker && dropoffCoords && (
        <Mapbox.PointAnnotation
          id="dropoffMarker"
          coordinate={[dropoffCoords.longitude, dropoffCoords.latitude]}
        >
          <Mapbox.Callout title="Dropoff Location" />
        </Mapbox.PointAnnotation>
      )}
    </Mapbox.MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
