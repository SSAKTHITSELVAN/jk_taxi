import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_ACCESS_TOKEN } from '../src/config/mapbox-config';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../src/constants/theme';
import { useRideStore } from '../src/store/rideStore';

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function PickOnMapScreen() {
  const { setPendingLocationPick } = useRideStore();
  const params = useLocalSearchParams<{ type: 'pickup' | 'dropoff'; lat?: string; lng?: string }>();
  const [center, setCenter] = useState({
    latitude: params.lat ? parseFloat(params.lat) : 12.9716,
    longitude: params.lng ? parseFloat(params.lng) : 77.5946,
  });
  const [address, setAddress] = useState('Fetching location...');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const cameraRef = useRef<Mapbox.Camera>(null);

  useEffect(() => {
    fetchAddress(center.latitude, center.longitude);
  }, []);

  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.features?.[0]) {
        setAddress(data.features[0].place_name);
      } else {
        setAddress('Unknown location');
      }
    } catch {
      setAddress('Unable to fetch address');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleRegionChange = async (feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    setCenter({ latitude: lat, longitude: lng });
    fetchAddress(lat, lng);
  };

  const handleConfirm = () => {
    setPendingLocationPick({
      name: address.split(',')[0],
      address,
      latitude: center.latitude,
      longitude: center.longitude,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {params.type === 'pickup' ? 'Pick Pickup Location' : 'Pick Drop Location'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <Mapbox.MapView
          style={styles.map}
          styleURL="mapbox://styles/mapbox/streets-v12"
          onRegionDidChange={handleRegionChange}
        >
          <Mapbox.Camera
            ref={cameraRef}
            zoomLevel={15}
            centerCoordinate={[center.longitude, center.latitude]}
            animationMode="flyTo"
            animationDuration={1000}
          />
          <Mapbox.UserLocation visible showsUserHeadingIndicator />
        </Mapbox.MapView>

        {/* Center pin */}
        <View style={styles.centerMarker}>
          <Ionicons
            name={params.type === 'pickup' ? 'radio-button-on' : 'location'}
            size={40}
            color={params.type === 'pickup' ? '#4CAF50' : '#F44336'}
          />
        </View>
      </View>

      {/* Bottom card */}
      <View style={styles.bottomCard}>
        <View style={styles.addressContainer}>
          {isLoadingAddress ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, isLoadingAddress && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={isLoadingAddress}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: '#000',
    textAlign: 'center',
  },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
  },
  bottomCard: {
    backgroundColor: '#FFF',
    padding: Spacing.lg,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    minHeight: 60,
  },
  addressText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: '#333',
    marginLeft: Spacing.sm,
    fontWeight: FontWeights.medium,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: { opacity: 0.6 },
  confirmButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: '#FFF',
  },
});
