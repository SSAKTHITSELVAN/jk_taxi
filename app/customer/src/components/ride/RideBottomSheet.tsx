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
const MIN_HEIGHT = 180; // Collapsed height
const MAX_HEIGHT = height * 0.75; // Expanded height

interface RideBottomSheetProps {
  ride: EnhancedRide;
  onRideComplete: () => void;
}

export const RideBottomSheet: React.FC<RideBottomSheetProps> = ({ ride, onRideComplete }) => {
  const [driverSearchCount, setDriverSearchCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  const sheetHeight = useRef(new Animated.Value(MIN_HEIGHT)).current;
  const lastHeight = useRef(MIN_HEIGHT);

  // Animation for searching
  const searchRotation = useRef(new Animated.Value(0)).current;
  const dotAnimation = useRef(new Animated.Value(0)).current;

  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // Store current height when drag starts
        lastHeight.current = (sheetHeight as any)._value;
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate new height based on drag distance
        // Negative dy means dragging up (expand), positive means down (collapse)
        const newHeight = lastHeight.current - gestureState.dy;

        // Constrain within MIN and MAX
        const constrainedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));
        sheetHeight.setValue(constrainedHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const finalHeight = lastHeight.current - gestureState.dy;
        const constrainedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, finalHeight));

        // Snap to nearest position based on velocity and position
        let targetHeight;

        if (gestureState.vy < -0.5) {
          // Fast upward swipe - expand
          targetHeight = MAX_HEIGHT;
        } else if (gestureState.vy > 0.5) {
          // Fast downward swipe - collapse
          targetHeight = MIN_HEIGHT;
        } else {
          // Slow drag - snap to nearest
          const midPoint = (MIN_HEIGHT + MAX_HEIGHT) / 2;
          targetHeight = constrainedHeight > midPoint ? MAX_HEIGHT : MIN_HEIGHT;
        }

        Animated.spring(sheetHeight, {
          toValue: targetHeight,
          useNativeDriver: false,
          tension: 50,
          friction: 10,
        }).start();

        lastHeight.current = targetHeight;
      },
    })
  ).current;

  // Status configurations
  const STATUS_INFO = {
    pending: {
      title: 'Searching for Drivers',
      subtitle: 'Please wait while we find a driver',
      color: '#F59E0B',
      icon: 'search',
    },
    accepted: {
      title: 'Driver Assigned',
      subtitle: 'Driver is on the way to pick you up',
      color: '#3B82F6',
      icon: 'checkmark-circle',
    },
    started: {
      title: 'Trip Started',
      subtitle: 'Enjoy your ride',
      color: '#8B5CF6',
      icon: 'car-sport',
    },
    completed: {
      title: 'Trip Completed',
      subtitle: 'Thank you for riding with us',
      color: '#10B981',
      icon: 'checkmark-done-circle',
    },
    cancelled: {
      title: 'Trip Cancelled',
      subtitle: 'Your ride has been cancelled',
      color: '#EF4444',
      icon: 'close-circle',
    },
  };

  const currentStatus = STATUS_INFO[ride.status as keyof typeof STATUS_INFO] || STATUS_INFO.pending;

  // Animate search icon rotation
  useEffect(() => {
    if (ride.status === 'pending') {
      // Rotate icon continuously
      Animated.loop(
        Animated.timing(searchRotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      // Animate dots
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnimation, {
            toValue: 2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnimation, {
            toValue: 3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      searchRotation.setValue(0);
      dotAnimation.setValue(0);
    }
  }, [ride.status]);

  // Simulate driver search updates
  useEffect(() => {
    if (ride.status === 'pending') {
      const interval = setInterval(() => {
        setDriverSearchCount(prev => prev + 1);
        if (Math.random() > 0.7) {
          setRejectedCount(prev => prev + 1);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [ride.status]);

  // Show rating after completion
  useEffect(() => {
    if ((ride.status === 'completed' || ride.status === 'cancelled') && ride.driver_id) {
      if (ride.status === 'completed' || (ride.status === 'cancelled' && ride.otp_verified)) {
        setShowRating(true);
      }
    }
  }, [ride.status]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingEnhancedApi.cancelRide(ride.id);
              Alert.alert('Ride Cancelled', 'Your ride has been cancelled successfully.');
              onRideComplete();
            } catch (error: any) {
              Alert.alert(
                'Cancellation Failed',
                error.response?.data?.detail || 'Failed to cancel ride. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleCallDriver = () => {
    if (!ride.driver_id) {
      Alert.alert('Driver Not Assigned', 'No driver has been assigned yet.');
      return;
    }

    const driverPhone = '+919876543210';
    Linking.openURL(`tel:${driverPhone}`).catch(() => {
      Alert.alert('Error', 'Unable to make call.');
    });
  };

  const handleSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'Call emergency services?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 112',
          style: 'destructive',
          onPress: () => Linking.openURL('tel:112'),
        },
      ]
    );
  };

  const handlePayment = () => {
    Alert.alert(
      'Payment',
      `Total Amount: ₹${ride.fare.toFixed(2)}\n\nPayment Method: ${ride.payment_method === 'cash' ? 'Cash' : 'Online'}`,
      [{ text: 'OK' }]
    );
  };

  const handleSubmitRating = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }
    Alert.alert('Thank You!', 'Your rating has been submitted.', [
      { text: 'OK', onPress: () => onRideComplete() }
    ]);
  };

  return (
    <Animated.View style={[styles.container, { height: sheetHeight }]}>
      {/* Drag Handle */}
      <View style={styles.dragHandleArea}>
        <View style={styles.dragHandle} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEnabled={(sheetHeight as any)._value >= MAX_HEIGHT - 50}
      >
        {/* Header Section - Draggable Area */}
        <View {...panResponder.panHandlers} style={styles.headerSection}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadge, { backgroundColor: currentStatus.color }]}>
            <Ionicons name={currentStatus.icon as any} size={16} color="#FFF" />
            <Text style={styles.statusBadgeText}>{currentStatus.title}</Text>
          </View>

          {(ride.status === 'accepted' || ride.status === 'started') && (
            <View style={styles.etaBadge}>
              <Ionicons name="time" size={14} color={Colors.primary} />
              <Text style={styles.etaText}>
                {ride.status === 'accepted' ? `${ride.eta_minutes} min` : 'In transit'}
              </Text>
            </View>
          )}
        </View>

        {/* Animated Search Indicator for Pending */}
        {ride.status === 'pending' && (
          <View style={styles.searchingContainer}>
            <Animated.View
              style={[
                styles.searchIconContainer,
                {
                  transform: [
                    {
                      rotate: searchRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="search" size={32} color={Colors.primary} />
            </Animated.View>

            <Text style={styles.searchingText}>
              Finding drivers nearby
              <Animated.Text style={{ opacity: dotAnimation.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0, 1, 1, 1] }) }}>.</Animated.Text>
              <Animated.Text style={{ opacity: dotAnimation.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0, 0, 1, 1] }) }}>.</Animated.Text>
              <Animated.Text style={{ opacity: dotAnimation.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0, 0, 0, 1] }) }}>.</Animated.Text>
            </Text>

            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatNumber}>{driverSearchCount}</Text>
                <Text style={styles.quickStatLabel}>Notified</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Text style={styles.quickStatNumber}>{rejectedCount}</Text>
                <Text style={styles.quickStatLabel}>Rejected</Text>
              </View>
            </View>
          </View>
        )}

        {/* Driver Quick Info for Accepted/Started */}
        {ride.driver_id && (ride.status === 'accepted' || ride.status === 'started') && (
          <View style={styles.driverQuickInfo}>
            <View style={styles.driverQuickAvatar}>
              <Text style={styles.driverQuickAvatarText}>D</Text>
            </View>
            <View style={styles.driverQuickDetails}>
              <Text style={styles.driverQuickName}>Driver Name</Text>
              <Text style={styles.driverQuickVehicle}>KA 01 AB 1234 • White Sedan</Text>
            </View>
            <TouchableOpacity style={styles.quickCallButton} onPress={handleCallDriver}>
              <Ionicons name="call" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        </View>

        {/* Details Section - Scrollable Content */}
        <View style={styles.detailsSection}>
          {/* Trip Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Details</Text>

            {/* Locations */}
            <View style={styles.locationsContainer}>
              <View style={styles.locationDots}>
                <View style={styles.pickupDot} />
                <View style={styles.routeLine} />
                <View style={styles.dropoffDot} />
              </View>

              <View style={styles.locations}>
                <View style={styles.locationItem}>
                  <Text style={styles.locationLabel}>Pickup</Text>
                  <Text style={styles.locationText}>{ride.pickup_location}</Text>
                </View>

                {ride.dropoff_location && (
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>Dropoff</Text>
                    <Text style={styles.locationText}>{ride.dropoff_location}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* OTP */}
            <View style={styles.otpContainer}>
              <View style={styles.otpHeader}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
                <Text style={styles.otpLabel}>Ride OTP</Text>
              </View>
              <Text style={styles.otpNumber}>{ride.ride_otp}</Text>
              <Text style={styles.otpHint}>Share with driver to start</Text>
            </View>

            {/* Fare */}
            <View style={styles.fareContainer}>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Total Fare</Text>
                <Text style={styles.fareAmount}>₹{ride.fare.toFixed(2)}</Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.fareSubLabel}>Payment Method</Text>
                <Text style={styles.fareSubValue}>
                  {ride.payment_method === 'cash' ? 'Cash' : 'Online'}
                </Text>
              </View>
            </View>
          </View>

          {/* Driver Details (expanded) */}
          {ride.driver_id && (ride.status === 'accepted' || ride.status === 'started') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Driver Details</Text>
              <View style={styles.driverCard}>
                <View style={styles.driverHeader}>
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverAvatarText}>D</Text>
                  </View>
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>Driver Name</Text>
                    <View style={styles.driverRating}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.driverRatingText}>4.8 (120 trips)</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.driverDetails}>
                  <View style={styles.driverDetailItem}>
                    <Ionicons name="car-sport" size={18} color="#666" />
                    <Text style={styles.driverDetailText}>KA 01 AB 1234</Text>
                  </View>
                  <View style={styles.driverDetailItem}>
                    <Ionicons name="color-palette" size={18} color="#666" />
                    <Text style={styles.driverDetailText}>White Sedan</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Rating Section */}
          {showRating && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rate Your Ride</Text>
              <Text style={styles.ratingSubtitle}>How was your experience?</Text>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={star <= rating ? '#F59E0B' : '#CCC'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitRatingButton} onPress={handleSubmitRating}>
                <Text style={styles.submitRatingText}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons - Inside ScrollView */}
          {(ride.status === 'pending' || ride.status === 'accepted' || ride.status === 'started') && !showRating && (
            <View style={styles.actionsSection}>
              {ride.status === 'started' && (
                <>
                  <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
                    <Ionicons name="warning" size={20} color="#FFF" />
                    <Text style={styles.sosButtonText}>SOS Emergency</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
                    <Ionicons name="card" size={20} color={Colors.primary} />
                    <Text style={styles.paymentButtonText}>View Payment</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={styles.cancelButtonInline} onPress={handleCancel}>
                <Ionicons name="close-circle" size={20} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Cancel Ride</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 80,
  },
  headerSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  detailsSection: {
    paddingHorizontal: Spacing.lg,
  },
  dragHandleArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    marginLeft: 6,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  etaText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginLeft: 4,
  },
  collapsedSubtitle: {
    fontSize: FontSizes.sm,
    color: '#666',
    marginBottom: Spacing.md,
  },
  searchingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  searchIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  searchingText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  quickStatLabel: {
    fontSize: FontSizes.xs,
    color: '#666',
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: Spacing.sm,
  },
  driverQuickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  driverQuickAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverQuickAvatarText: {
    fontSize: 18,
    fontWeight: FontWeights.bold,
    color: '#FFF',
  },
  driverQuickDetails: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  driverQuickName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: '#000',
  },
  driverQuickVehicle: {
    fontSize: FontSizes.xs,
    color: '#666',
    marginTop: 2,
  },
  quickCallButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: '#000',
    marginBottom: Spacing.md,
  },
  locationsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  locationDots: {
    width: 16,
    alignItems: 'center',
    paddingTop: 6,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  dropoffDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F44336',
  },
  locations: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  locationItem: {
    marginBottom: Spacing.sm,
  },
  locationLabel: {
    fontSize: FontSizes.xs,
    color: '#999',
    marginBottom: 2,
  },
  locationText: {
    fontSize: FontSizes.sm,
    color: '#000',
    fontWeight: FontWeights.medium,
  },
  otpContainer: {
    backgroundColor: '#F3E8FF',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  otpLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
  },
  otpNumber: {
    fontSize: 32,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 10,
    marginVertical: Spacing.xs,
  },
  otpHint: {
    fontSize: FontSizes.xs,
    color: '#7C3AED',
    textAlign: 'center',
  },
  fareContainer: {
    backgroundColor: '#F8F9FA',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  fareLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: '#000',
  },
  fareAmount: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  fareSubLabel: {
    fontSize: FontSizes.sm,
    color: '#666',
  },
  fareSubValue: {
    fontSize: FontSizes.sm,
    color: '#000',
    fontWeight: FontWeights.medium,
  },
  driverCard: {
    backgroundColor: '#F8F9FA',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    fontSize: 24,
    fontWeight: FontWeights.bold,
    color: '#FFF',
  },
  driverInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  driverName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: '#000',
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverRatingText: {
    fontSize: FontSizes.sm,
    color: '#666',
    marginLeft: 4,
  },
  driverDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  driverDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverDetailText: {
    fontSize: FontSizes.sm,
    color: '#666',
    marginLeft: Spacing.xs,
  },
  ratingSubtitle: {
    fontSize: FontSizes.md,
    color: '#666',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  starButton: {
    padding: Spacing.xs,
  },
  submitRatingButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  submitRatingText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: '#FFF',
  },
  actionsSection: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sosButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: '#FFF',
    marginLeft: Spacing.xs,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  paymentButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  cancelButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: '#EF4444',
    marginLeft: Spacing.xs,
  },
});
