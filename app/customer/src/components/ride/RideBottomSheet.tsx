import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Animated,
  Dimensions,
  Platform,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EnhancedRide } from '../../types/enhanced';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../constants/theme';
import { bookingEnhancedApi } from '../../api/booking-enhanced';

const { height } = Dimensions.get('window');
const MIN_HEIGHT = 220;
const MAX_HEIGHT = height * 0.75;

interface RideBottomSheetProps {
  ride: EnhancedRide;
  onRideComplete: () => void;
}

export const RideBottomSheet: React.FC<RideBottomSheetProps> = ({ ride, onRideComplete }) => {
  const [nearbyCount, setNearbyCount] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  const sheetHeight = useRef(new Animated.Value(MIN_HEIGHT)).current;
  const lastHeight = useRef(MIN_HEIGHT);
  const searchPulse = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => { lastHeight.current = (sheetHeight as any)._value; },
      onPanResponderMove: (_, gs) => {
        const h = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, lastHeight.current - gs.dy));
        sheetHeight.setValue(h);
      },
      onPanResponderRelease: (_, gs) => {
        let target;
        if (gs.vy < -0.5) target = MAX_HEIGHT;
        else if (gs.vy > 0.5) target = MIN_HEIGHT;
        else {
          const h = lastHeight.current - gs.dy;
          target = h > (MIN_HEIGHT + MAX_HEIGHT) / 2 ? MAX_HEIGHT : MIN_HEIGHT;
        }
        Animated.spring(sheetHeight, { toValue: target, useNativeDriver: false, tension: 50, friction: 10 }).start();
        lastHeight.current = target;
      },
    })
  ).current;

  // Pulse animation for pending
  useEffect(() => {
    if (ride.status === 'pending') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(searchPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(searchPulse, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [ride.status]);

  // Fetch nearby drivers count
  useEffect(() => {
    if (ride.status === 'pending') {
      fetchNearby();
      const interval = setInterval(fetchNearby, 5000);
      return () => clearInterval(interval);
    }
  }, [ride.status]);

  // Show rating on completion
  useEffect(() => {
    if (ride.status === 'completed') setShowRating(true);
  }, [ride.status]);

  const fetchNearby = async () => {
    try {
      const data = await bookingEnhancedApi.getNearbyDrivers();
      setNearbyCount(data.nearby_count);
    } catch {}
  };

  const handleCancel = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          try {
            await bookingEnhancedApi.cancelRide(ride.id);
            Alert.alert('Cancelled', 'Your ride has been cancelled.');
            onRideComplete();
          } catch (e: any) {
            Alert.alert('Failed', e.response?.data?.detail || 'Could not cancel ride.');
          }
        },
      },
    ]);
  };

  const handleCallDriver = () => {
    if (!ride.driver_phone) {
      Alert.alert('No Driver', 'Driver not assigned yet.');
      return;
    }
    Linking.openURL(`tel:${ride.driver_phone}`).catch(() =>
      Alert.alert('Error', 'Unable to make call.')
    );
  };

  const handleSOS = () => {
    Alert.alert('Emergency SOS', 'Call emergency services?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call 112', style: 'destructive', onPress: () => Linking.openURL('tel:112') },
    ]);
  };

  const handleSubmitRating = () => {
    if (rating === 0) { Alert.alert('Required', 'Please select a rating.'); return; }
    Alert.alert('Thank You!', 'Rating submitted.', [{ text: 'OK', onPress: onRideComplete }]);
  };

  const getStatusConfig = () => {
    switch (ride.status) {
      case 'pending': return { title: 'Searching for Captains', color: '#F59E0B', icon: 'search' };
      case 'accepted': return { title: 'Captain Assigned', color: '#3B82F6', icon: 'checkmark-circle' };
      case 'started': return { title: 'Trip In Progress', color: '#8B5CF6', icon: 'car-sport' };
      case 'completed': return { title: 'Trip Completed', color: '#10B981', icon: 'checkmark-done-circle' };
      case 'cancelled': return { title: 'Trip Cancelled', color: '#EF4444', icon: 'close-circle' };
      default: return { title: 'Unknown', color: '#999', icon: 'help' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Animated.View style={[styles.container, { height: sheetHeight }]}>
      <View style={styles.dragHandleArea}>
        <View style={styles.dragHandle} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Draggable header */}
        <View {...panResponder.panHandlers} style={styles.headerSection}>
          {/* Status badge */}
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
              <Ionicons name={statusConfig.icon as any} size={14} color="#FFF" />
              <Text style={styles.statusText}>{statusConfig.title}</Text>
            </View>
            {(ride.status === 'accepted' || ride.status === 'started') && (
              <View style={styles.etaBadge}>
                <Ionicons name="time" size={12} color={Colors.primary} />
                <Text style={styles.etaText}>{ride.eta_minutes} min</Text>
              </View>
            )}
          </View>

          {/* PENDING STATE */}
          {ride.status === 'pending' && (
            <View style={styles.pendingContainer}>
              <Animated.View style={[styles.pulseCircle, {
                opacity: searchPulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
                transform: [{ scale: searchPulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] }) }],
              }]}>
                <Ionicons name="car" size={28} color={Colors.primary} />
              </Animated.View>

              <View style={styles.liveStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{nearbyCount}</Text>
                  <Text style={styles.statLabel}>Nearby</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{ride.rejection_count || 0}</Text>
                  <Text style={styles.statLabel}>Passed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: '#F59E0B' }]}>Searching</Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
              </View>
            </View>
          )}

          {/* ACCEPTED/STARTED - Driver info */}
          {(ride.status === 'accepted' || ride.status === 'started') && (
            <View style={styles.driverSection}>
              <View style={styles.driverRow}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>
                    {(ride.driver_name || 'D').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{ride.driver_name || 'Captain'}</Text>
                  <Text style={styles.driverVehicle}>
                    {ride.driver_vehicle_number || 'Vehicle'} • {ride.driver_vehicle_type || 'Car'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
                  <Ionicons name="call" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              {ride.status === 'accepted' && (
                <View style={styles.arrivalBanner}>
                  <Ionicons name="navigate" size={16} color={Colors.primary} />
                  <Text style={styles.arrivalText}>Captain is on the way to pickup</Text>
                </View>
              )}
              {ride.status === 'started' && (
                <View style={[styles.arrivalBanner, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="car-sport" size={16} color={Colors.primary} />
                  <Text style={styles.arrivalText}>You are on your way to destination</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.detailsSection}>
          {/* Locations */}
          <View style={styles.locationsCard}>
            <View style={styles.locRow}>
              <View style={[styles.locDot, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.locTextContainer}>
                <Text style={styles.locLabel}>Pickup</Text>
                <Text style={styles.locAddress} numberOfLines={1}>{ride.pickup_location}</Text>
              </View>
            </View>
            {ride.dropoff_location && (
              <View style={styles.locRow}>
                <View style={[styles.locDot, { backgroundColor: '#F44336' }]} />
                <View style={styles.locTextContainer}>
                  <Text style={styles.locLabel}>Dropoff</Text>
                  <Text style={styles.locAddress} numberOfLines={1}>{ride.dropoff_location}</Text>
                </View>
              </View>
            )}
          </View>

          {/* OTP + Fare row */}
          <View style={styles.infoRow}>
            <View style={styles.otpBox}>
              <Text style={styles.otpLabel}>OTP</Text>
              <Text style={styles.otpValue}>{ride.ride_otp}</Text>
            </View>
            <View style={styles.fareBox}>
              <Text style={styles.fareLabel}>Fare</Text>
              <Text style={styles.fareValue}>₹{Math.round(ride.fare)}</Text>
            </View>
            <View style={styles.distBox}>
              <Text style={styles.distLabel}>Distance</Text>
              <Text style={styles.distValue}>{ride.distance_km.toFixed(1)} km</Text>
            </View>
          </View>

          {/* Rating */}
          {showRating && (
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>Rate Your Ride</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setRating(s)}>
                    <Ionicons name={s <= rating ? 'star' : 'star-outline'} size={32} color={s <= rating ? '#F59E0B' : '#CCC'} />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitRating}>
                <Text style={styles.submitBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Actions */}
          {!showRating && ride.status !== 'completed' && ride.status !== 'cancelled' && (
            <View style={styles.actions}>
              {ride.status === 'started' && (
                <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
                  <Ionicons name="warning" size={18} color="#FFF" />
                  <Text style={styles.sosBtnText}>SOS</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Ionicons name="close-circle" size={18} color="#EF4444" />
                <Text style={styles.cancelBtnText}>Cancel Ride</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 20,
  },
  scrollContent: { flex: 1 },
  dragHandleArea: { alignItems: 'center', paddingVertical: 8 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#D0D0D0', borderRadius: 2 },
  headerSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  detailsSection: { paddingHorizontal: Spacing.lg },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#FFF', fontSize: FontSizes.sm, fontWeight: FontWeights.bold, marginLeft: 6 },
  etaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  etaText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.primary, marginLeft: 4 },

  // Pending
  pendingContainer: { alignItems: 'center', paddingVertical: Spacing.sm },
  pulseCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  liveStats: { flexDirection: 'row', backgroundColor: '#F8F9FA', borderRadius: 12, padding: Spacing.md, width: '100%' },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.primary },
  statLabel: { fontSize: FontSizes.xs, color: '#666', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E0E0E0', marginHorizontal: 8 },

  // Driver
  driverSection: { marginBottom: Spacing.sm },
  driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  driverAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  driverAvatarText: { fontSize: 18, fontWeight: FontWeights.bold, color: '#FFF' },
  driverInfo: { flex: 1, marginLeft: Spacing.md },
  driverName: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: '#000' },
  driverVehicle: { fontSize: FontSizes.sm, color: '#666', marginTop: 2 },
  callButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  arrivalBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 8, padding: Spacing.sm, gap: 8 },
  arrivalText: { fontSize: FontSizes.sm, color: '#333', fontWeight: FontWeights.medium },

  // Locations
  locationsCard: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: Spacing.md, marginBottom: Spacing.md },
  locRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  locDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.md },
  locTextContainer: { flex: 1 },
  locLabel: { fontSize: FontSizes.xs, color: '#999' },
  locAddress: { fontSize: FontSizes.sm, color: '#000', fontWeight: FontWeights.medium },

  // Info row
  infoRow: { flexDirection: 'row', marginBottom: Spacing.md, gap: 8 },
  otpBox: { flex: 1, backgroundColor: '#F3E8FF', borderRadius: 10, padding: Spacing.sm, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed' },
  otpLabel: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: FontWeights.semibold },
  otpValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.primary, letterSpacing: 4 },
  fareBox: { flex: 1, backgroundColor: '#E8F5E9', borderRadius: 10, padding: Spacing.sm, alignItems: 'center' },
  fareLabel: { fontSize: FontSizes.xs, color: '#4CAF50', fontWeight: FontWeights.semibold },
  fareValue: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: '#2E7D32' },
  distBox: { flex: 1, backgroundColor: '#E3F2FD', borderRadius: 10, padding: Spacing.sm, alignItems: 'center' },
  distLabel: { fontSize: FontSizes.xs, color: '#1976D2', fontWeight: FontWeights.semibold },
  distValue: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: '#1565C0' },

  // Rating
  ratingSection: { alignItems: 'center', marginTop: Spacing.md },
  ratingTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: '#000', marginBottom: Spacing.md },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  submitBtn: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 20 },
  submitBtnText: { color: '#FFF', fontSize: FontSizes.md, fontWeight: FontWeights.bold },

  // Actions
  actions: { flexDirection: 'row', gap: 10, marginTop: Spacing.md },
  sosBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 10, gap: 6 },
  sosBtnText: { color: '#FFF', fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  cancelBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EF4444', gap: 6 },
  cancelBtnText: { color: '#EF4444', fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
});
