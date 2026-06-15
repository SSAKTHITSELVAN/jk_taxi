import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SimpleMap } from './SimpleMap';
import { RideBottomSheet } from '../ride/RideBottomSheet';
import { useAuthStore } from '../../store/authStore';
import { useRideStore } from '../../store/rideStore';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../constants/theme';
import { router as expoRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface MapHomeScreenProps {
  onBookRide: () => void;
}

export const MapHomeScreen: React.FC<MapHomeScreenProps> = ({ onBookRide }) => {
  const { user, logout } = useAuthStore();
  const { activeRide, getActiveRide } = useRideStore();

  // Default location (Bangalore city center)
  const [location, setLocation] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
  });
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [locationName, setLocationName] = useState('Bangalore');

  const [menuOpen, setMenuOpen] = useState(false);

  const menuSlideAnim = useRef(new Animated.Value(-320)).current;

  useEffect(() => {
    // Location is optional - app works without it
    setLocationPermission(true);
  }, []);

  const toggleMenu = () => {
    const toValue = menuOpen ? -320 : 0; // Fully hide at -320
    Animated.spring(menuSlideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const handleRideComplete = async () => {
    // Refresh to check if ride is truly complete
    await getActiveRide();
  };

  // Check if we should show active ride in bottom sheet
  const showActiveRideSheet =
    activeRide &&
    activeRide.booking_for_self &&
    (!activeRide.is_scheduled || activeRide.status !== 'pending');

  return (
    <View style={styles.container}>
      {/* Simple Map Preview */}
      <SimpleMap
        latitude={location.latitude}
        longitude={location.longitude}
        showMarker={true}
        markerTitle={locationName}
      />

      {/* Floating Location Card */}
      <View style={styles.floatingLocationCard}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Ionicons name="menu" size={24} color="#000000" />
        </TouchableOpacity>

        <View style={styles.locationInfo}>
          <Ionicons name="location" size={16} color={Colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationName}
          </Text>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={22} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Side Menu Drawer */}
      <Animated.View
        style={[
          styles.menuDrawer,
          { transform: [{ translateX: menuSlideAnim }] },
        ]}
      >
        <View style={styles.menuHeader}>
          <View style={styles.menuHeaderContent}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {(user?.name || 'G').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.menuUserName}>{user?.name || 'Guest'}</Text>
              <Text style={styles.menuUserPhone}>{user?.phone || 'Not logged in'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
          {user?.ride_otp && (
            <View style={styles.menuOtpCard}>
              <View style={styles.otpHeader}>
                <Ionicons name="shield-checkmark" size={18} color="#1976D2" />
                <Text style={styles.menuOtpLabel}>Your Ride OTP</Text>
              </View>
              <View style={styles.otpNumberContainer}>
                <Text style={styles.menuOtpNumber}>{user.ride_otp}</Text>
              </View>
              <View style={styles.otpFooter}>
                <Ionicons name="information-circle" size={14} color="#1976D2" />
                <Text style={styles.otpSubtext}>Share with driver to start ride</Text>
              </View>
            </View>
          )}

          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                router.push('/');
              }}
            >
              <View style={styles.menuItemIconContainer}>
                <Ionicons name="home" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Home</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                router.push('/rides');
              }}
            >
              <View style={styles.menuItemIconContainer}>
                <Ionicons name="list" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>My Rides</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                router.push('/profile');
              }}
            >
              <View style={styles.menuItemIconContainer}>
                <Ionicons name="person" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                      toggleMenu();
                      await logout();
                      expoRouter.replace('/login');
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="log-out" size={24} color="#E74C3C" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>

      {/* Overlay when menu is open */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* Center Location Button */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={() => {
          // In a real app, this would re-center on user location
          console.log('Center on user location');
        }}
      >
        <Ionicons name="locate" size={24} color={Colors.primary} />
      </TouchableOpacity>

      {/* Bottom Booking Card OR Active Ride Sheet */}
      {showActiveRideSheet ? (
        // Active Ride Bottom Sheet (Rapido-style)
        <RideBottomSheet ride={activeRide as any} onRideComplete={handleRideComplete} />
      ) : (
        <View style={styles.bottomCard}>
          {activeRide ? (
            // Banner for scheduled or booked for others
            <TouchableOpacity
              style={styles.activeRideCard}
              onPress={() => router.push('/rides')}
            >
              <View style={styles.activeRideLeft}>
                <Ionicons
                  name={activeRide.is_scheduled ? 'calendar' : 'people'}
                  size={28}
                  color={Colors.primary}
                />
                <View style={styles.activeRideInfo}>
                  <Text style={styles.activeRideTitle}>
                    {activeRide.is_scheduled
                      ? 'Scheduled Ride'
                      : `Ride for ${activeRide.passenger_name}`}
                  </Text>
                  <Text style={styles.activeRideStatus}>
                    {activeRide.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#000" />
            </TouchableOpacity>
          ) : (
            // Book Ride Button
            <>
              <Text style={styles.bookingPrompt}>Where to?</Text>
              <TouchableOpacity style={styles.searchBox} onPress={onBookRide}>
                <Ionicons name="search" size={22} color="#000000" />
                <Text style={styles.searchText}>Search destination</Text>
              </TouchableOpacity>

              {/* Quick Actions */}
              <View style={styles.quickActionsRow}>
                <TouchableOpacity style={styles.quickAction} onPress={onBookRide}>
                  <View style={styles.quickActionIcon}>
                    <Ionicons name="time" size={22} color="#FFFFFF" />
                  </View>
                  <Text style={styles.quickActionText}>Ride Later</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={onBookRide}>
                  <View style={styles.quickActionIcon}>
                    <Ionicons name="swap-horizontal" size={22} color="#FFFFFF" />
                  </View>
                  <Text style={styles.quickActionText}>Round Trip</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={onBookRide}>
                  <View style={styles.quickActionIcon}>
                    <Ionicons name="briefcase" size={22} color="#FFFFFF" />
                  </View>
                  <Text style={styles.quickActionText}>Package</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  floatingLocationCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  locationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: '#000000',
    marginLeft: Spacing.xs,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  menuDrawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 320,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10000,
  },
  menuHeader: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  menuHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  menuUserName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  menuUserPhone: {
    fontSize: FontSizes.md,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: Spacing.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  menuOtpCard: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: '#E3F2FD',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#1976D2',
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  menuOtpLabel: {
    fontSize: FontSizes.sm,
    color: '#1976D2',
    fontWeight: FontWeights.bold,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
  },
  otpNumberContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.xs,
    borderWidth: 1.5,
    borderColor: '#1976D2',
    borderStyle: 'dashed',
  },
  menuOtpNumber: {
    fontSize: 32,
    fontWeight: FontWeights.bold,
    color: '#1976D2',
    letterSpacing: 10,
    textAlign: 'center',
  },
  otpFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  otpSubtext: {
    fontSize: FontSizes.xs,
    color: '#1565C0',
    textAlign: 'center',
    marginLeft: Spacing.xs,
    flex: 1,
  },
  menuSection: {
    marginTop: Spacing.md,
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: '#333333',
    fontWeight: FontWeights.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: '#FFF5F5',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutButtonText: {
    fontSize: FontSizes.md,
    color: '#E74C3C',
    fontWeight: FontWeights.semibold,
    marginLeft: Spacing.sm,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9999,
  },
  centerButton: {
    position: 'absolute',
    right: Spacing.md,
    bottom: 200,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bookingPrompt: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: '#000000',
    marginBottom: Spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchText: {
    fontSize: FontSizes.md,
    color: '#666666',
    marginLeft: Spacing.sm,
    fontWeight: FontWeights.medium,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  quickActionText: {
    fontSize: FontSizes.xs,
    color: '#000000',
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
  },
  activeRideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  activeRideLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeRideInfo: {
    marginLeft: Spacing.md,
  },
  activeRideTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  activeRideStatus: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    marginTop: 2,
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.white,
  },
});
