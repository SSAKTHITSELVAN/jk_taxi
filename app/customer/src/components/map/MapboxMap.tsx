import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox, { Camera, MapView, ShapeSource, CircleLayer, UserLocation } from '@rnmapbox/maps';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL } from '../../config/mapbox';

// Initialize Mapbox
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface MapboxMapProps {
  latitude: number;
  longitude: number;
  showMarker?: boolean;
  markerTitle?: string;
  zoom?: number;
  onRegionChange?: (latitude: number, longitude: number) => void;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  latitude,
  longitude,
  showMarker = true,
  markerTitle,
  zoom = 14,
  onRegionChange,
}) => {
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: zoom,
        animationDuration: 1000,
      });
    }
  }, [latitude, longitude, zoom]);

  // GeoJSON for marker
  const markerGeoJSON = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    properties: {
      title: markerTitle,
    },
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={MAPBOX_STYLE_URL}
        compassEnabled={false}
        scaleBarEnabled={false}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={zoom}
          centerCoordinate={[longitude, latitude]}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* Show user's current location as blue dot */}
        <UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
          androidRenderMode="compass"
        />

        {/* Custom marker */}
        {showMarker && (
          <ShapeSource id="markerSource" shape={markerGeoJSON as any}>
            <CircleLayer
              id="markerLayer"
              style={{
                circleRadius: 12,
                circleColor: '#FF4444',
                circleStrokeColor: '#FFFFFF',
                circleStrokeWidth: 3,
              }}
            />
          </ShapeSource>
        )}
      </MapView>
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
});
