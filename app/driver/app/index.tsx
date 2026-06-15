import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/authStore';
import { useStatusStore } from '../src/store/statusStore';
import { driverEnhancedApi } from '../src/api/driver-enhanced';
import { OTPVerificationModal } from '../src/components/OTPVerificationModal';
import { EnhancedRideCard } from '../src/components/EnhancedRideCard';
import { Button } from '../src/components/common/Button';
import { Card } from '../src/components/common/Card';
import { Colors, Spacing, FontSizes, FontWeights } from '../src/constants/theme';
import { EnhancedRide } from '../src/types/enhanced';

export default function HomeScreen() {
  const { driver } = useAuthStore();
  const { isOnline, toggleStatus, isUpdating } = useStatusStore();
  const [availableRides, setAvailableRides] = useState<EnhancedRide[]>([]);
  const [activeRide, setActiveRide] = useState<EnhancedRide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  useEffect(() => {
    if (isOnline) {
      loadRides();
      // Poll every 10 seconds for updates
      const interval = setInterval(loadRides, 10000);
      return () => clearInterval(interval);
    } else {
      // Clear rides when going offline
      setActiveRide(null);
      setAvailableRides([]);
      setIsLoading(false);
    }
  }, [isOnline]);

  const loadRides = async () => {
    // Check current online status from store (avoid stale closure)
    const currentOnlineStatus = useStatusStore.getState().isOnline;

    try {
      // Only show loading spinner on initial load, not on polling
      if (!isRefreshing && availableRides.length === 0 && !activeRide) {
        setIsLoading(true);
      }

      // Always check for active ride (might have one from before going offline)
      try {
        const active = await driverEnhancedApi.getActiveRide();
        setActiveRide(active);
        setAvailableRides([]);
      } catch (error: any) {
        // No active ride, get available rides only if online
        if (error.response?.status === 404) {
          if (currentOnlineStatus) {
            try {
              const available = await driverEnhancedApi.getAvailableRides();
              setAvailableRides(available);
              setActiveRide(null);
            } catch (availError: any) {
              // Ignore 400 "must be online" error - expected when toggling
              if (availError.response?.status !== 400) {
                console.error('Error loading available rides:', availError);
              }
              setActiveRide(null);
              setAvailableRides([]);
            }
          } else {
            setActiveRide(null);
            setAvailableRides([]);
          }
        } else {
          // Some other error (not 404)
          console.log('Unexpected error checking active ride:', error.response?.status, error.message);
          setActiveRide(null);
          setAvailableRides([]);
        }
      }
    } catch (error: any) {
      // All expected errors are handled above, so this catches truly unexpected errors
      // Don't log 400/404 as they're normal offline/no-rides conditions
      if (error.response?.status !== 400 && error.response?.status !== 404) {
        console.log('Unexpected error loading rides:', error.response?.status || error.message);
      }
      // Silently handle expected errors
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRides();
  };

  const handleToggleStatus = async () => {
    // Check if driver has active ride
    if (isOnline && activeRide) {
      Alert.alert(
        'Cannot Go Offline',
        'You have an active ride. Please complete or cancel the ride before going offline.',
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
      return;
    }

    try {
      await toggleStatus();
      if (!isOnline) {
        loadRides();
      } else {
        // Clear rides when going offline
        setAvailableRides([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    try {
      // Check if already has active ride
      if (activeRide) {
        Alert.alert(
          'Active Ride Exists',
          'You already have an active ride. Complete it before accepting a new one.',
          [{ text: 'OK' }]
        );
        return;
      }

      const ride = await driverEnhancedApi.acceptRide(rideId);
      setActiveRide(ride);
      setAvailableRides([]);
      Alert.alert(
        'Ride Accepted!',
        'Now verify the customer\'s OTP to start the ride.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to accept ride';
      Alert.alert('Error', errorMsg);
      loadRides(); // Refresh to get latest state
    }
  };

  const handleRejectRide = async (rideId: string) => {
    Alert.alert(
      'Reject Ride',
      'Are you sure you want to reject this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await driverEnhancedApi.rejectRide(rideId);
              Alert.alert('Success', 'Ride rejected');
              loadRides();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Failed to reject ride');
            }
          },
        },
      ]
    );
  };

  const handleVerifyOTP = () => {
    if (!activeRide) return;
    setShowOTPModal(true);
  };

  const handleOTPVerified = async () => {
    setShowOTPModal(false);
    loadRides();
    Alert.alert(
      'OTP Verified! ✅',
      'You can now start the ride.',
      [{ text: 'OK' }]
    );
  };

  const handleStartRide = async () => {
    if (!activeRide) return;

    if (!activeRide.otp_verified) {
      Alert.alert(
        'OTP Verification Required',
        'Please ask the customer for their 4-digit OTP and verify it before starting the ride.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Verify OTP', onPress: () => setShowOTPModal(true) },
        ]
      );
      return;
    }

    try {
      const ride = await driverEnhancedApi.startRide(activeRide.id);
      setActiveRide(ride);
      Alert.alert('Ride Started! 🚗', 'Drive safely!', [{ text: 'OK' }]);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to start ride';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;

    Alert.alert(
      'Complete Ride',
      'Have you reached the destination?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Complete',
          style: 'default',
          onPress: async () => {
            try {
              await driverEnhancedApi.completeRide(activeRide.id);
              Alert.alert(
                'Ride Completed! 🎉',
                'Great job! You can now accept new rides.',
                [{ text: 'OK' }]
              );
              setActiveRide(null);
              loadRides();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Failed to complete ride');
            }
          },
        },
      ]
    );
  };

  if (isLoading && !isRefreshing && !activeRide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading rides...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Status Toggle */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.driverName}>{driver?.name || 'Driver'}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, isOnline && styles.statusOnline]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleToggleStatus}
            disabled={isUpdating}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Offline State */}
        {!isOnline && (
          <Card style={styles.offlineCard}>
            <Ionicons name="moon-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.offlineTitle}>You are Offline</Text>
            <Text style={styles.offlineText}>
              Toggle online to start receiving ride requests
            </Text>
          </Card>
        )}

        {/* Online but no rides */}
        {isOnline && !activeRide && availableRides.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="car-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No rides available</Text>
            <Text style={styles.emptySubtext}>
              Pull down to refresh or wait for new requests
            </Text>
          </Card>
        )}

        {/* Active Ride Section */}
        {activeRide && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="car-sport" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Active Ride</Text>
            </View>

            <EnhancedRideCard ride={activeRide} />

            {/* OTP Status Card */}
            {activeRide.status === 'accepted' && (
              <Card style={[styles.otpCard, !activeRide.otp_verified && styles.otpCardPending]}>
                <View style={styles.otpHeader}>
                  <View style={styles.otpIconContainer}>
                    <Ionicons
                      name={activeRide.otp_verified ? 'checkmark-circle' : 'lock-closed'}
                      size={24}
                      color={activeRide.otp_verified ? Colors.success : Colors.warning}
                    />
                  </View>
                  <View style={styles.otpContent}>
                    <Text style={styles.otpTitle}>
                      {activeRide.otp_verified ? 'OTP Verified ✓' : 'OTP Verification Required'}
                    </Text>
                    <Text style={styles.otpSubtext}>
                      {activeRide.otp_verified
                        ? 'You can now start the ride'
                        : 'Ask customer for their 4-digit OTP'}
                    </Text>
                  </View>
                  {!activeRide.otp_verified && (
                    <Button
                      title="Verify"
                      size="small"
                      onPress={handleVerifyOTP}
                      style={styles.verifyButton}
                    />
                  )}
                </View>
              </Card>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              {activeRide.status === 'accepted' && (
                <Button
                  title={activeRide.otp_verified ? 'Start Ride' : 'Verify OTP First'}
                  onPress={handleStartRide}
                  fullWidth
                  disabled={!activeRide.otp_verified}
                  icon={
                    <Ionicons
                      name={activeRide.otp_verified ? 'play-circle' : 'lock-closed'}
                      size={20}
                      color={Colors.white}
                    />
                  }
                />
              )}
              {activeRide.status === 'started' && (
                <Button
                  title="Complete Ride"
                  onPress={handleCompleteRide}
                  fullWidth
                  icon={<Ionicons name="checkmark-circle" size={20} color={Colors.white} />}
                />
              )}
            </View>
          </View>
        )}

        {/* Available Rides Section */}
        {isOnline && !activeRide && availableRides.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>
                Available Rides ({availableRides.length})
              </Text>
            </View>
            {availableRides.map((ride) => (
              <EnhancedRideCard
                key={ride.id}
                ride={ride}
                showActions
                onAccept={() => handleAcceptRide(ride.id)}
                onReject={() => handleRejectRide(ride.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* OTP Verification Modal */}
      {activeRide && (
        <OTPVerificationModal
          visible={showOTPModal}
          rideId={activeRide.id}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  driverName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  statusOnline: {
    color: Colors.success,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  otpCard: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  otpCardPending: {
    borderColor: Colors.warning,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otpIconContainer: {
    marginRight: Spacing.md,
  },
  otpContent: {
    flex: 1,
  },
  otpTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  otpSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  verifyButton: {
    minWidth: 80,
  },
  actions: {
    marginTop: Spacing.lg,
  },
  offlineCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  offlineTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  offlineText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
