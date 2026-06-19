import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import Mapbox from '@rnmapbox/maps';
import { useAuthStore } from '../src/store/authStore';
import { useStatusStore } from '../src/store/statusStore';
import { driverEnhancedApi } from '../src/api/driver-enhanced';
import { OTPVerificationModal } from '../src/components/OTPVerificationModal';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../src/constants/theme';
import { EnhancedRide } from '../src/types/enhanced';
import { MAPBOX_ACCESS_TOKEN, MAP_STYLES, ANIMATION_DURATION } from '../src/config/mapbox-config';

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { driver, logout } = useAuthStore();
  const { isOnline, toggleStatus, isUpdating } = useStatusStore();
  const insets = useSafeAreaInsets();

  const [availableRides, setAvailableRides] = useState<EnhancedRide[]>([]);
  const [activeRide, setActiveRide] = useState<EnhancedRide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  // Map state
  const [driverLoc, setDriverLoc] = useState({ latitude: 12.9716, longitude: 77.5946 });
  const [routeCoords, setRouteCoords] = useState<number[][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize location
  useEffect(() => {
    initLocation();
  }, []);

  // Ride polling
  useEffect(() => {
    if (isOnline) {
      loadRides();
      const interval = setInterval(loadRides, 8000);
      return () => clearInterval(interval);
    } else {
      setActiveRide(null);
      setAvailableRides([]);
    }
  }, [isOnline]);

  // Location push when active ride
  useEffect(() => {
    if (activeRide && (activeRide.status === 'accepted' || activeRide.status === 'started')) {
      startLocationPush();
      fetchRoute();
    } else {
      stopLocationPush();
      setRouteCoords(null);
      setRouteInfo(null);
    }
    return () => stopLocationPush();
  }, [activeRide?.status, activeRide?.id]);

  const initLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setDriverLoc({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch {}
  };

  const startLocationPush = () => {
    if (locationIntervalRef.current) return;
    const push = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setDriverLoc({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        await driverEnhancedApi.updateLocation(loc.coords.latitude, loc.coords.longitude);
      } catch {}
    };
    push();
    locationIntervalRef.current = setInterval(push, 5000);
  };

  const stopLocationPush = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };

  const fetchRoute = async () => {
    if (!activeRide) return;
    try {
      let destLat: number, destLng: number;
      if (activeRide.status === 'accepted') {
        destLat = activeRide.pickup_lat;
        destLng = activeRide.pickup_lng;
      } else {
        destLat = activeRide.dropoff_lat || activeRide.pickup_lat;
        destLng = activeRide.dropoff_lng || activeRide.pickup_lng;
      }

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${driverLoc.longitude},${driverLoc.latitude};${destLng},${destLat}?geometries=geojson&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.routes?.[0]) {
        setRouteCoords(data.routes[0].geometry.coordinates);
        setRouteInfo({ distance: data.routes[0].distance / 1000, duration: data.routes[0].duration / 60 });

        if (cameraRef.current) {
          const coords = data.routes[0].geometry.coordinates;
          const lngs = coords.map((c: number[]) => c[0]);
          const lats = coords.map((c: number[]) => c[1]);
          cameraRef.current.fitBounds(
            [Math.max(...lngs), Math.max(...lats)],
            [Math.min(...lngs), Math.min(...lats)],
            [80, 50, 300, 50], ANIMATION_DURATION
          );
        }
      }
    } catch {}
  };

  const loadRides = async () => {
    try {
      try {
        const active = await driverEnhancedApi.getActiveRide();
        setActiveRide(active);
        setAvailableRides([]);
      } catch (e: any) {
        if (e.response?.status === 404) {
          setActiveRide(null);
          try {
            const available = await driverEnhancedApi.getAvailableRides();
            setAvailableRides(available);
          } catch { setAvailableRides([]); }
        }
      }
    } catch {} finally { setIsLoading(false); }
  };

  const handleToggleStatus = async () => {
    if (isOnline && activeRide) {
      Alert.alert('Cannot Go Offline', 'Complete your active ride first.');
      return;
    }
    try { await toggleStatus(); } catch { Alert.alert('Error', 'Failed to update status.'); }
  };

  const handleAcceptRide = async (rideId: string) => {
    try {
      const ride = await driverEnhancedApi.acceptRide(rideId);
      setActiveRide(ride);
      setAvailableRides([]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to accept ride');
      loadRides();
    }
  };

  const handleRejectRide = async (rideId: string) => {
    try {
      await driverEnhancedApi.rejectRide(rideId);
      setAvailableRides(prev => prev.filter(r => r.id !== rideId));
    } catch {}
  };

  const handleVerifyOTP = () => setShowOTPModal(true);

  const handleOTPVerified = () => {
    setShowOTPModal(false);
    loadRides();
  };

  const handleStartRide = async () => {
    if (!activeRide) return;
    if (!activeRide.otp_verified) {
      setShowOTPModal(true);
      return;
    }
    try {
      const ride = await driverEnhancedApi.startRide(activeRide.id);
      setActiveRide(ride);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to start ride');
    }
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;
    Alert.alert('Complete Ride', 'Have you reached the destination?', [
      { text: 'Not Yet', style: 'cancel' },
      { text: 'Yes, Complete', onPress: async () => {
        try {
          await driverEnhancedApi.completeRide(activeRide.id);
          Alert.alert('Ride Completed!', `Fare: ₹${Math.round(activeRide.fare)}\nGreat job!`);
          setActiveRide(null);
          setRouteCoords(null);
          loadRides();
        } catch (e: any) {
          Alert.alert('Error', e.response?.data?.detail || 'Failed to complete');
        }
      }},
    ]);
  };

  const handleNavigate = () => {
    if (!activeRide) return;
    const lat = activeRide.status === 'accepted' ? activeRide.pickup_lat : (activeRide.dropoff_lat || activeRide.pickup_lat);
    const lng = activeRide.status === 'accepted' ? activeRide.pickup_lng : (activeRide.dropoff_lng || activeRide.pickup_lng);
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    });
    if (url) Linking.openURL(url).catch(() => {});
  };

  const handleCallCustomer = () => {
    // In a real app, customer phone would come from API
    Alert.alert('Call Customer', 'Calling customer...', [{ text: 'OK' }]);
  };

  const routeGeoJSON = routeCoords ? {
    type: 'Feature' as const,
    geometry: { type: 'LineString' as const, coordinates: routeCoords },
    properties: {},
  } : null;

  return (
    <View style={styles.container}>
      {/* Full screen map */}
      <Mapbox.MapView style={styles.map} styleURL={MAP_STYLES.STREETS} compassEnabled attributionEnabled={false} logoEnabled={false}>
        <Mapbox.Camera ref={cameraRef} zoomLevel={14} centerCoordinate={[driverLoc.longitude, driverLoc.latitude]} animationDuration={ANIMATION_DURATION} />
        <Mapbox.UserLocation visible showsUserHeadingIndicator />

        {/* Route */}
        {routeGeoJSON && (
          <Mapbox.ShapeSource id="driverRoute" shape={routeGeoJSON}>
            <Mapbox.LineLayer id="driverRouteLine" style={{ lineColor: Colors.primary, lineWidth: 5, lineOpacity: 0.85, lineCap: 'round', lineJoin: 'round' }} />
          </Mapbox.ShapeSource>
        )}

        {/* Pickup marker */}
        {activeRide && (
          <Mapbox.PointAnnotation id="pickup" coordinate={[activeRide.pickup_lng, activeRide.pickup_lat]} title="Pickup">
            <View style={[styles.mapMarker, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.mapMarkerText}>P</Text>
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Dropoff marker */}
        {activeRide && activeRide.dropoff_lat && activeRide.dropoff_lng && (
          <Mapbox.PointAnnotation id="dropoff" coordinate={[activeRide.dropoff_lng, activeRide.dropoff_lat]} title="Dropoff">
            <View style={[styles.mapMarker, { backgroundColor: '#F44336' }]}>
              <Text style={styles.mapMarkerText}>D</Text>
            </View>
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>

      {/* Top bar: driver info + online toggle */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/edit-profile')}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarText}>{(driver?.name || 'D').charAt(0)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.onlineToggle, isOnline && styles.onlineToggleActive]}
          onPress={handleToggleStatus}
          disabled={isUpdating}
        >
          <View style={[styles.toggleDot, isOnline && styles.toggleDotActive]} />
          <Text style={[styles.toggleText, isOnline && styles.toggleTextActive]}>
            {isUpdating ? '...' : isOnline ? 'Online' : 'Offline'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn} onPress={() => {
          Alert.alert('Menu', '', [
            { text: 'My Rides', onPress: () => router.push('/rides-enhanced') },
            { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}>
          <Ionicons name="menu" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Route info badge */}
      {routeInfo && activeRide && (
        <View style={styles.routeInfoBadge}>
          <Ionicons name="navigate" size={14} color={Colors.primary} />
          <Text style={styles.routeInfoText}>
            {routeInfo.distance.toFixed(1)} km • {Math.ceil(routeInfo.duration)} min
            {activeRide.status === 'accepted' ? ' to pickup' : ' to dropoff'}
          </Text>
        </View>
      )}

      {/* Offline overlay */}
      {!isOnline && (
        <View style={styles.offlineOverlay}>
          <View style={styles.offlineCard}>
            <Ionicons name="moon-outline" size={36} color="#666" />
            <Text style={styles.offlineTitle}>You are Offline</Text>
            <Text style={styles.offlineSubtext}>Go online to receive ride requests</Text>
            <TouchableOpacity style={styles.goOnlineBtn} onPress={handleToggleStatus}>
              <Text style={styles.goOnlineBtnText}>Go Online</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Available ride request popup */}
      {isOnline && !activeRide && availableRides.length > 0 && (
        <View style={[styles.rideRequestCard, { bottom: insets.bottom + 16 }]}>
          <View style={styles.rideRequestHeader}>
            <View style={styles.rideRequestBadge}>
              <Ionicons name="notifications" size={14} color="#FFF" />
              <Text style={styles.rideRequestBadgeText}>New Ride</Text>
            </View>
            <Text style={styles.rideRequestFare}>₹{Math.round(availableRides[0].fare)}</Text>
          </View>

          <View style={styles.rideRequestLocations}>
            <View style={styles.rideLocRow}>
              <View style={[styles.locDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.rideLocText} numberOfLines={1}>{String(availableRides[0].pickup_location)}</Text>
            </View>
            <View style={styles.rideLocRow}>
              <View style={[styles.locDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.rideLocText} numberOfLines={1}>{String(availableRides[0].dropoff_location || 'Rental')}</Text>
            </View>
          </View>

          <View style={styles.rideRequestMeta}>
            <Text style={styles.metaText}>{availableRides[0].distance_km?.toFixed(1)} km</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{availableRides[0].vehicle_category}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{availableRides[0].trip_type.replace('_', ' ')}</Text>
          </View>

          <View style={styles.rideRequestActions}>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectRide(availableRides[0].id)}>
              <Ionicons name="close" size={22} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptRide(availableRides[0].id)}>
              <Ionicons name="checkmark" size={22} color="#FFF" />
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Active ride bottom panel */}
      {activeRide && (
        <View style={[styles.activeRidePanel, { paddingBottom: insets.bottom + 12 }]}>
          {/* Status banner */}
          <View style={styles.statusBanner}>
            <View style={[styles.statusDot, {
              backgroundColor: activeRide.status === 'accepted' ? '#3B82F6' : '#8B5CF6'
            }]} />
            <Text style={styles.statusText}>
              {activeRide.status === 'accepted'
                ? (activeRide.otp_verified ? 'Ready to Start' : 'Heading to Pickup')
                : 'Trip In Progress'}
            </Text>
          </View>

          {/* Customer info */}
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Ionicons name="person" size={18} color="#FFF" />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {activeRide.booking_for_self === false ? activeRide.passenger_name || 'Passenger' : 'Customer'}
              </Text>
              <Text style={styles.customerMeta}>
                {activeRide.payment_method === 'cash' ? 'Cash' : 'Online'} • ₹{Math.round(activeRide.fare)}
              </Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallCustomer}>
              <Ionicons name="call" size={18} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={handleNavigate}>
              <Ionicons name="navigate" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Location summary */}
          <View style={styles.activeLocations}>
            {activeRide.status === 'accepted' && (
              <View style={styles.activeLocRow}>
                <View style={[styles.locDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.activeLocText} numberOfLines={1}>{String(activeRide.pickup_location)}</Text>
              </View>
            )}
            {activeRide.status === 'started' && activeRide.dropoff_location && (
              <View style={styles.activeLocRow}>
                <View style={[styles.locDot, { backgroundColor: '#F44336' }]} />
                <Text style={styles.activeLocText} numberOfLines={1}>{String(activeRide.dropoff_location)}</Text>
              </View>
            )}
          </View>

          {/* Action button */}
          {activeRide.status === 'accepted' && !activeRide.otp_verified && (
            <TouchableOpacity style={styles.otpBtn} onPress={handleVerifyOTP}>
              <Ionicons name="shield-checkmark" size={18} color="#FFF" />
              <Text style={styles.otpBtnText}>Verify OTP</Text>
            </TouchableOpacity>
          )}
          {activeRide.status === 'accepted' && activeRide.otp_verified && (
            <TouchableOpacity style={styles.startBtn} onPress={handleStartRide}>
              <Ionicons name="play-circle" size={18} color="#FFF" />
              <Text style={styles.startBtnText}>Start Ride</Text>
            </TouchableOpacity>
          )}
          {activeRide.status === 'started' && (
            <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteRide}>
              <Ionicons name="checkmark-circle" size={18} color="#FFF" />
              <Text style={styles.completeBtnText}>End Ride</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* No rides indicator */}
      {isOnline && !activeRide && availableRides.length === 0 && (
        <View style={styles.waitingBadge}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.waitingText}>Waiting for rides...</Text>
        </View>
      )}

      {/* OTP Modal */}
      {activeRide && (
        <OTPVerificationModal
          visible={showOTPModal}
          rideId={activeRide.id}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // Top bar
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: 'rgba(255,255,255,0.95)', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  profileBtn: {},
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  onlineToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E0E0E0' },
  onlineToggleActive: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  toggleDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#CCC', marginRight: 8 },
  toggleDotActive: { backgroundColor: '#4CAF50' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#666' },
  toggleTextActive: { color: '#2E7D32' },
  menuBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },

  // Route info
  routeInfoBadge: { position: 'absolute', top: 110, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4, gap: 6 },
  routeInfoText: { fontSize: 13, fontWeight: '600', color: '#333' },

  // Offline
  offlineOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  offlineCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 32, alignItems: 'center', width: '100%' },
  offlineTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginTop: 12 },
  offlineSubtext: { fontSize: 14, color: '#666', marginTop: 4, textAlign: 'center' },
  goOnlineBtn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  goOnlineBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Ride request card
  rideRequestCard: { position: 'absolute', left: 16, right: 16, backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 10 },
  rideRequestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rideRequestBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  rideRequestBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  rideRequestFare: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  rideRequestLocations: { marginBottom: 10 },
  rideLocRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  locDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  rideLocText: { fontSize: 14, color: '#333', flex: 1 },
  rideRequestMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  metaText: { fontSize: 12, color: '#999', textTransform: 'capitalize' },
  metaDot: { marginHorizontal: 6, color: '#CCC' },
  rideRequestActions: { flexDirection: 'row', gap: 12 },
  rejectBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EF4444' },
  acceptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', borderRadius: 12, paddingVertical: 14, gap: 6 },
  acceptBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Active ride panel
  activeRidePanel: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 14, fontWeight: '600', color: '#333' },
  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  customerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  customerInfo: { flex: 1, marginLeft: 12 },
  customerName: { fontSize: 15, fontWeight: '600', color: '#000' },
  customerMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  callBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' },
  activeLocations: { marginBottom: 12 },
  activeLocRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  activeLocText: { fontSize: 13, color: '#333', flex: 1, marginLeft: 8 },
  otpBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 14, gap: 6 },
  otpBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 14, gap: 6 },
  startBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 14, gap: 6 },
  completeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Waiting
  waitingBadge: { position: 'absolute', bottom: 32, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, gap: 8 },
  waitingText: { fontSize: 14, color: '#666', fontWeight: '500' },

  // Map markers
  mapMarker: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  mapMarkerText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});
