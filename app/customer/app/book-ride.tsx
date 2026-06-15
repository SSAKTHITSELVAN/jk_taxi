import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationSearchInput, LocationResult, LocationSearchInputRef } from '../src/components/map/LocationSearchInput';
import { Button } from '../src/components/common/Button';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../src/constants/theme';
import { bookingEnhancedApi } from '../src/api/booking-enhanced';
import { VehicleCategory, TripType, FareBreakdown, RidePreferences, StopLocation } from '../src/types/enhanced';
import { useRideStore } from '../src/store/rideStore';

const DRAFT_KEY = '@booking_draft';

const TRIP_TYPES = [
  { type: TripType.ONE_WAY, label: 'One Way', icon: 'arrow-forward' },
  { type: TripType.ROUND_TRIP, label: 'Round Trip', icon: 'swap-horizontal' },
  { type: TripType.RENTAL, label: 'Rental', icon: 'time' },
  { type: TripType.OUTSTATION, label: 'Outstation', icon: 'car-sport' },
  { type: TripType.AIRPORT_PICKUP, label: 'Airport Pickup', icon: 'airplane' },
  { type: TripType.AIRPORT_DROP, label: 'Airport Drop', icon: 'airplane' },
];

const VEHICLE_OPTIONS = [
  {
    type: VehicleCategory.MINI,
    name: 'Mini',
    icon: 'car-outline',
    capacity: '4 seats',
    examples: ['WagonR', 'Alto', 'Tiago'],
    color: '#4CAF50',
  },
  {
    type: VehicleCategory.SEDAN,
    name: 'Sedan',
    icon: 'car-sport-outline',
    capacity: '4 seats',
    examples: ['Dzire', 'Etios', 'Aura'],
    color: '#2196F3',
  },
  {
    type: VehicleCategory.SUV,
    name: 'SUV',
    icon: 'car',
    capacity: '6-7 seats',
    examples: ['Ertiga', 'Innova', 'Marazzo'],
    color: '#FF9800',
  },
  {
    type: VehicleCategory.PREMIUM,
    name: 'Premium',
    icon: 'car-sport',
    capacity: '4 seats',
    examples: ['Innova Crysta', 'BYD e6'],
    color: '#9C27B0',
  },
];

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 'cash' },
  { id: 'upi', label: 'UPI', icon: 'phone-portrait' },
  { id: 'card', label: 'Card', icon: 'card' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
];

type BookingStep = 'trip_type' | 'locations' | 'timing' | 'booking_for' | 'vehicle' | 'preferences' | 'confirm';

export default function BookRideScreen() {
  // Ride store
  const { getActiveRide } = useRideStore();

  // Step management
  const [currentStep, setCurrentStep] = useState<BookingStep>('trip_type');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [hasDraft, setHasDraft] = useState(false);

  // Trip details
  const [tripType, setTripType] = useState<TripType>(TripType.ONE_WAY);

  // Locations
  const [pickupLocation, setPickupLocation] = useState<LocationResult | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationResult | null>(null);
  const [stops, setStops] = useState<StopLocation[]>([]);

  // Timing
  const [rideNow, setRideNow] = useState(true);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string>('');

  // Booking for
  const [bookingForSelf, setBookingForSelf] = useState(true);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerNotes, setPassengerNotes] = useState('');

  // Vehicle & Fare
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCategory>(VehicleCategory.MINI);
  const [fareBreakdown, setFareBreakdown] = useState<FareBreakdown | null>(null);
  const [calculatingFare, setCalculatingFare] = useState(false);

  // Preferences
  const [preferences, setPreferences] = useState<RidePreferences>({
    ac_preferred: false,
    pet_friendly: false,
    silent_ride: false,
    extra_luggage: false,
    wheelchair_support: false,
  });
  const [driverNotes, setDriverNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Loading
  const [loading, setLoading] = useState(false);

  const dropoffInputRef = useRef<LocationSearchInputRef>(null);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Save draft whenever key fields change
  useEffect(() => {
    saveDraft();
  }, [tripType, pickupLocation, dropoffLocation, rideNow, bookingForSelf, selectedVehicle, preferences, paymentMethod]);

  const saveDraft = async () => {
    try {
      const draft = {
        tripType,
        pickupLocation,
        dropoffLocation,
        rideNow,
        scheduledDate: scheduledDate?.toISOString(),
        scheduledTime,
        bookingForSelf,
        passengerName,
        passengerPhone,
        passengerNotes,
        selectedVehicle,
        preferences,
        driverNotes,
        paymentMethod,
        currentStep,
      };
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setHasDraft(true);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const loadDraft = async () => {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_KEY);
      if (draftJson) {
        const draft = JSON.parse(draftJson);
        setHasDraft(true);
        // Don't auto-load, let user decide
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const restoreDraft = async () => {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_KEY);
      if (draftJson) {
        const draft = JSON.parse(draftJson);
        setTripType(draft.tripType);
        setPickupLocation(draft.pickupLocation);
        setDropoffLocation(draft.dropoffLocation);
        setRideNow(draft.rideNow);
        if (draft.scheduledDate) setScheduledDate(new Date(draft.scheduledDate));
        setScheduledTime(draft.scheduledTime);
        setBookingForSelf(draft.bookingForSelf);
        setPassengerName(draft.passengerName);
        setPassengerPhone(draft.passengerPhone);
        setPassengerNotes(draft.passengerNotes);
        setSelectedVehicle(draft.selectedVehicle);
        setPreferences(draft.preferences);
        setDriverNotes(draft.driverNotes);
        setPaymentMethod(draft.paymentMethod);
        setCurrentStep(draft.currentStep);
        setHasDraft(false);
        Alert.alert('Draft Restored', 'Your previous booking draft has been restored');
      }
    } catch (error) {
      console.error('Error restoring draft:', error);
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateFare = async () => {
    if (!pickupLocation || !dropoffLocation) return;

    try {
      setCalculatingFare(true);

      console.log('📊 Calculating fare for:', {
        vehicle: selectedVehicle,
        tripType: tripType,
      });

      const fare = await bookingEnhancedApi.calculateFare({
        pickup_lat: pickupLocation.latitude,
        pickup_lng: pickupLocation.longitude,
        dropoff_lat: dropoffLocation.latitude,
        dropoff_lng: dropoffLocation.longitude,
        vehicle_category: selectedVehicle,
      });

      if (!fare.distance_km) {
        const distance = calculateDistance(
          pickupLocation.latitude,
          pickupLocation.longitude,
          dropoffLocation.latitude,
          dropoffLocation.longitude
        );
        fare.distance_km = distance;
      }

      setFareBreakdown(fare);
    } catch (error) {
      console.error('Error calculating fare:', error);
    } finally {
      setCalculatingFare(false);
    }
  };

  useEffect(() => {
    if (pickupLocation && dropoffLocation && currentStep === 'vehicle') {
      calculateFare();
    }
  }, [selectedVehicle, pickupLocation, dropoffLocation, currentStep]);

  // Note: Removed auto-advance for locations - user should click Continue button

  const handleNext = (delay: number = 0) => {
    const steps: BookingStep[] = ['trip_type', 'locations', 'timing', 'booking_for', 'vehicle', 'preferences', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setTimeout(() => {
        // Fade out, slide, then fade in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -20,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCurrentStep(steps[currentIndex + 1]);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        });
      }, delay);
    }
  };

  const handleBack = () => {
    const steps: BookingStep[] = ['trip_type', 'locations', 'timing', 'booking_for', 'vehicle', 'preferences', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      router.back();
    }
  };

  const canProceedFromStep = (): boolean => {
    switch (currentStep) {
      case 'trip_type':
        return true;
      case 'locations':
        return !!pickupLocation && (tripType === TripType.RENTAL || !!dropoffLocation);
      case 'timing':
        return rideNow || (!!scheduledDate && !!scheduledTime);
      case 'booking_for':
        return bookingForSelf || (!!passengerName && !!passengerPhone);
      case 'vehicle':
        return !!fareBreakdown;
      case 'preferences':
        return true;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  const handleBookRide = async () => {
    if (!pickupLocation || !fareBreakdown) {
      Alert.alert('Missing Information', 'Please complete all required fields');
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        trip_type: tripType,
        pickup_location: pickupLocation.address,
        pickup_lat: pickupLocation.latitude,
        pickup_lng: pickupLocation.longitude,
        dropoff_location: dropoffLocation?.address,
        dropoff_lat: dropoffLocation?.latitude,
        dropoff_lng: dropoffLocation?.longitude,
        vehicle_category: selectedVehicle,
        is_scheduled: !rideNow,
        scheduled_datetime: (scheduledDate && scheduledTime) ? new Date(`${scheduledDate.toISOString().split('T')[0]}T${scheduledTime}`) : undefined,
        booking_for_self: bookingForSelf,
        passenger_name: bookingForSelf ? undefined : passengerName,
        passenger_phone: bookingForSelf ? undefined : passengerPhone,
        passenger_notes: bookingForSelf ? undefined : passengerNotes,
        preferences,
        driver_notes: driverNotes || undefined,
        stops,
        payment_method: paymentMethod,
      };

      console.log('📤 [BOOKING REQUEST]', JSON.stringify(bookingData, null, 2));

      const ride = await bookingEnhancedApi.createBooking(bookingData);

      // Clear draft on success
      await clearDraft();

      // Refresh active ride in store
      await getActiveRide();

      Alert.alert(
        'Ride Booked Successfully',
        `Your ride has been confirmed.\n\nRide OTP: ${ride.ride_otp}\n\nShare this OTP with your driver to start the ride.`,
        [
          {
            text: 'View Rides',
            onPress: () => router.replace('/rides'),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ [BOOKING ERROR]', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      let errorMessage = 'Failed to book ride. Please try again.';

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Booking Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (): string => {
    switch (currentStep) {
      case 'trip_type': return 'Select Trip Type';
      case 'locations': return 'Where to?';
      case 'timing': return 'When?';
      case 'booking_for': return 'Who\'s Riding?';
      case 'vehicle': return 'Choose Vehicle';
      case 'preferences': return 'Ride Preferences';
      case 'confirm': return 'Confirm Booking';
      default: return 'Book a Ride';
    }
  };

  const renderStepIndicator = () => {
    const steps: BookingStep[] = ['trip_type', 'locations', 'timing', 'booking_for', 'vehicle', 'preferences', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              index <= currentIndex && styles.stepDotActive
            ]} />
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                index < currentIndex && styles.stepLineActive
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderTripTypeStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepDescription}>Choose your trip type</Text>
      <View style={styles.tripTypeGrid}>
        {TRIP_TYPES.map((item) => (
          <TouchableOpacity
            key={item.type}
            style={[
              styles.tripTypeCard,
              tripType === item.type && styles.tripTypeCardSelected
            ]}
            onPress={() => {
              setTripType(item.type);
              handleNext(600); // Auto-advance after 600ms
            }}
          >
            <Ionicons
              name={item.icon as any}
              size={28}
              color={tripType === item.type ? Colors.primary : '#666'}
            />
            <Text style={[
              styles.tripTypeLabel,
              tripType === item.type && styles.tripTypeLabelSelected
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderLocationsStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepDescription}>Enter your locations</Text>

      <View style={styles.locationContainer}>
        <View style={styles.locationDots}>
          <View style={styles.pickupDot} />
          <View style={styles.dashedLine} />
          <View style={styles.dropoffDot} />
        </View>

        <View style={styles.locationInputs}>
          <LocationSearchInput
            placeholder="Pickup location"
            icon="radio-button-on"
            onLocationSelect={(loc) => {
              console.log('Pickup location selected:', loc);
              setPickupLocation(loc);
            }}
            initialValue={pickupLocation?.address}
            onFocusNext={() => dropoffInputRef.current?.focus()}
            showCurrentLocation={true}
          />
          <View style={styles.inputSpacer} />
          {tripType !== TripType.RENTAL && (
            <LocationSearchInput
              ref={dropoffInputRef}
              placeholder="Dropoff location"
              icon="location"
              onLocationSelect={(loc) => {
                console.log('Dropoff location selected:', loc);
                setDropoffLocation(loc);
              }}
              initialValue={dropoffLocation?.address}
            />
          )}
          {tripType === TripType.RENTAL && (
            <Text style={styles.rentalNote}>
              For rental, only pickup location is required
            </Text>
          )}
        </View>
      </View>

      {pickupLocation && dropoffLocation && (
        <View style={styles.mapPreview}>
          <Image
            source={{ uri: 'https://www.thestatesman.com/wp-content/uploads/2020/04/googl_ED.jpg' }}
            style={styles.mapImage}
            resizeMode="cover"
          />
          <View style={[styles.mapMarker, styles.pickupMarker]}>
            <Ionicons name="radio-button-on" size={24} color="#4CAF50" />
          </View>
          <View style={[styles.mapMarker, styles.dropoffMarker]}>
            <Ionicons name="location" size={28} color="#F44336" />
          </View>
          <View style={styles.routeLine} />
        </View>
      )}
    </ScrollView>
  );

  const renderTimingStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepDescription}>When do you need the ride?</Text>

      <View style={styles.timingOptions}>
        <TouchableOpacity
          style={[styles.timingCard, rideNow && styles.timingCardSelected]}
          onPress={() => {
            setRideNow(true);
            handleNext(600); // Auto-advance for "Ride Now"
          }}
        >
          <View style={styles.radioOuter}>
            {rideNow && <View style={styles.radioInner} />}
          </View>
          <View style={styles.timingInfo}>
            <Text style={styles.timingLabel}>Ride Now</Text>
            <Text style={styles.timingSubtext}>Get a ride immediately</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timingCard, !rideNow && styles.timingCardSelected]}
          onPress={() => {
            setRideNow(false);
            // Don't auto-advance, user needs to set date/time
          }}
        >
          <View style={styles.radioOuter}>
            {!rideNow && <View style={styles.radioInner} />}
          </View>
          <View style={styles.timingInfo}>
            <Text style={styles.timingLabel}>Schedule Ride</Text>
            <Text style={styles.timingSubtext}>Book for later</Text>
          </View>
        </TouchableOpacity>
      </View>

      {!rideNow && (
        <View style={styles.scheduleInputs}>
          <Text style={styles.inputLabel}>Select Date & Time</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#999"
            value={scheduledDate ? scheduledDate.toLocaleDateString() : ''}
            onChangeText={(text) => {
              // Simple date parsing for demo
              const parts = text.split('/');
              if (parts.length === 3) {
                setScheduledDate(new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])));
              }
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="HH:MM (24-hour format)"
            placeholderTextColor="#999"
            value={scheduledTime}
            onChangeText={setScheduledTime}
          />
        </View>
      )}
    </ScrollView>
  );

  const renderBookingForStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepDescription}>Who is this ride for?</Text>

      <View style={styles.timingOptions}>
        <TouchableOpacity
          style={[styles.timingCard, bookingForSelf && styles.timingCardSelected]}
          onPress={() => {
            setBookingForSelf(true);
            handleNext(600); // Auto-advance for "Book for Myself"
          }}
        >
          <View style={styles.radioOuter}>
            {bookingForSelf && <View style={styles.radioInner} />}
          </View>
          <View style={styles.timingInfo}>
            <Text style={styles.timingLabel}>Book for Myself</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timingCard, !bookingForSelf && styles.timingCardSelected]}
          onPress={() => {
            setBookingForSelf(false);
            // Don't auto-advance, user needs to enter passenger details
          }}
        >
          <View style={styles.radioOuter}>
            {!bookingForSelf && <View style={styles.radioInner} />}
          </View>
          <View style={styles.timingInfo}>
            <Text style={styles.timingLabel}>Book for Someone Else</Text>
          </View>
        </TouchableOpacity>
      </View>

      {!bookingForSelf && (
        <View style={styles.passengerInputs}>
          <Text style={styles.inputLabel}>Passenger Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Passenger Name *"
            placeholderTextColor="#999"
            value={passengerName}
            onChangeText={setPassengerName}
          />
          <TextInput
            style={styles.input}
            placeholder="Passenger Phone *"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={passengerPhone}
            onChangeText={setPassengerPhone}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional Notes (e.g., Call when you arrive)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={passengerNotes}
            onChangeText={setPassengerNotes}
          />
        </View>
      )}
    </ScrollView>
  );

  const renderVehicleStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepDescription}>Choose your vehicle</Text>

      <View style={styles.vehicleList}>
        {VEHICLE_OPTIONS.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.type}
            style={[
              styles.vehicleCard,
              selectedVehicle === vehicle.type && styles.vehicleCardSelected,
            ]}
            onPress={() => {
              setSelectedVehicle(vehicle.type);
            }}
          >
            <View style={styles.vehicleLeft}>
              <View style={[styles.vehicleIconContainer, { backgroundColor: vehicle.color + '15' }]}>
                <Ionicons name={vehicle.icon as any} size={28} color={vehicle.color} />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehicleCapacity}>{vehicle.capacity}</Text>
                <Text style={styles.vehicleExamples}>{vehicle.examples.join(', ')}</Text>
              </View>
            </View>

            <View style={styles.vehicleRight}>
              {calculatingFare && selectedVehicle === vehicle.type ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : fareBreakdown && selectedVehicle === vehicle.type ? (
                <Text style={styles.vehiclePrice}>₹{(fareBreakdown.total || 0).toFixed(0)}</Text>
              ) : (
                <Text style={styles.vehiclePriceEmpty}>-</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {fareBreakdown && selectedVehicle && fareBreakdown.distance_km && (
        <View style={styles.distanceCard}>
          <Ionicons name="navigate" size={16} color={Colors.primary} />
          <Text style={styles.distanceText}>
            {fareBreakdown.distance_km.toFixed(1)} km • ETA: {Math.ceil(fareBreakdown.distance_km * 2)} mins
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderPreferencesStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepDescription}>Customize your ride</Text>

      <View style={styles.preferencesSection}>
        <Text style={styles.sectionTitle}>Ride Preferences</Text>

        {[
          { key: 'ac_preferred', label: 'AC Preferred', icon: 'snow' },
          { key: 'pet_friendly', label: 'Pet Friendly', icon: 'paw' },
          { key: 'silent_ride', label: 'Silent Ride', icon: 'volume-mute' },
          { key: 'extra_luggage', label: 'Extra Luggage', icon: 'bag-handle' },
          { key: 'wheelchair_support', label: 'Wheelchair Support', icon: 'accessibility' },
        ].map((pref) => (
          <TouchableOpacity
            key={pref.key}
            style={styles.preferenceItem}
            onPress={() => setPreferences({
              ...preferences,
              [pref.key]: !preferences[pref.key as keyof RidePreferences]
            })}
          >
            <View style={styles.preferenceLeft}>
              <Ionicons name={pref.icon as any} size={20} color="#666" />
              <Text style={styles.preferenceLabel}>{pref.label}</Text>
            </View>
            <View style={[
              styles.checkbox,
              preferences[pref.key as keyof RidePreferences] && styles.checkboxChecked
            ]}>
              {preferences[pref.key as keyof RidePreferences] && (
                <Ionicons name="checkmark" size={16} color="#FFF" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.notesSection}>
        <Text style={styles.sectionTitle}>Driver Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g., Near temple gate, Call after reaching"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          value={driverNotes}
          onChangeText={setDriverNotes}
        />
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentOptions}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentCard,
                paymentMethod === method.id && styles.paymentCardSelected
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Ionicons
                name={method.icon as any}
                size={24}
                color={paymentMethod === method.id ? Colors.primary : '#666'}
              />
              <Text style={[
                styles.paymentLabel,
                paymentMethod === method.id && styles.paymentLabelSelected
              ]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderConfirmStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepDescription}>Review your booking</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Trip Type</Text>
          <Text style={styles.summaryValue}>
            {TRIP_TYPES.find(t => t.type === tripType)?.label}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pickup</Text>
          <Text style={styles.summaryValue} numberOfLines={2}>
            {pickupLocation?.address}
          </Text>
        </View>

        {dropoffLocation && (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dropoff</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>
                {dropoffLocation?.address}
              </Text>
            </View>
          </>
        )}

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>When</Text>
          <Text style={styles.summaryValue}>
            {rideNow ? 'Now' : `${scheduledDate?.toLocaleDateString()} ${scheduledTime}`}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Vehicle</Text>
          <Text style={styles.summaryValue}>
            {VEHICLE_OPTIONS.find(v => v.type === selectedVehicle)?.name}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment</Text>
          <Text style={styles.summaryValue}>
            {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}
          </Text>
        </View>
      </View>

      {fareBreakdown && (
        <View style={styles.fareCard}>
          <Text style={styles.fareTitle}>Fare Breakdown</Text>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Base fare</Text>
            <Text style={styles.fareValue}>₹{(fareBreakdown.base_fare || 0).toFixed(0)}</Text>
          </View>
          {fareBreakdown.distance_km && (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Distance ({fareBreakdown.distance_km.toFixed(1)} km)</Text>
              <Text style={styles.fareValue}>₹{(fareBreakdown.distance_fare || 0).toFixed(0)}</Text>
            </View>
          )}
          {fareBreakdown.platform_fee > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Platform fee</Text>
              <Text style={styles.fareValue}>₹{fareBreakdown.platform_fee.toFixed(0)}</Text>
            </View>
          )}
          {fareBreakdown.gst > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>GST</Text>
              <Text style={styles.fareValue}>₹{fareBreakdown.gst.toFixed(0)}</Text>
            </View>
          )}
          {fareBreakdown.night_charges > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Night charges</Text>
              <Text style={styles.fareValue}>₹{fareBreakdown.night_charges.toFixed(0)}</Text>
            </View>
          )}
          <View style={[styles.fareRow, styles.fareTotalRow]}>
            <Text style={styles.fareTotalLabel}>Total</Text>
            <Text style={styles.fareTotalValue}>₹{(fareBreakdown.total || 0).toFixed(0)}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'trip_type': return renderTripTypeStep();
      case 'locations': return renderLocationsStep();
      case 'timing': return renderTimingStep();
      case 'booking_for': return renderBookingForStep();
      case 'vehicle': return renderVehicleStep();
      case 'preferences': return renderPreferencesStep();
      case 'confirm': return renderConfirmStep();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getStepTitle()}</Text>
        {hasDraft ? (
          <TouchableOpacity style={styles.draftButton} onPress={restoreDraft}>
            <Ionicons name="document-text" size={20} color={Colors.primary} />
            <Text style={styles.draftText}>Draft</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {renderStepContent()}
      </Animated.View>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {currentStep !== 'confirm' ? (
          <Button
            title="Continue"
            onPress={() => handleNext()}
            fullWidth
            disabled={!canProceedFromStep()}
            style={[
              styles.continueButton,
              !canProceedFromStep() && styles.continueButtonDisabled,
            ]}
          />
        ) : (
          <Button
            title={loading ? 'Booking...' : 'Confirm & Book Ride'}
            onPress={handleBookRide}
            fullWidth
            disabled={loading}
            loading={loading}
            style={styles.bookButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: '#000',
  },
  draftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  draftText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFF',
  },
  stepItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  stepDescription: {
    fontSize: FontSizes.md,
    color: '#666',
    marginBottom: Spacing.lg,
  },
  tripTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tripTypeCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  tripTypeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  tripTypeLabel: {
    fontSize: FontSizes.sm,
    color: '#666',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  tripTypeLabelSelected: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  locationContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  locationDots: {
    width: 24,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  dashedLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  dropoffDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
  },
  locationInputs: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  inputSpacer: {
    height: Spacing.md,
  },
  rentalNote: {
    fontSize: FontSizes.sm,
    color: '#999',
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  mapPreview: {
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.md,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapMarker: {
    position: 'absolute',
  },
  pickupMarker: {
    top: 40,
    left: 60,
  },
  dropoffMarker: {
    bottom: 50,
    right: 70,
  },
  routeLine: {
    position: 'absolute',
    top: 55,
    left: 72,
    width: 180,
    height: 2,
    backgroundColor: Colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  timingOptions: {
    gap: Spacing.md,
  },
  timingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  timingCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
  },
  timingInfo: {
    flex: 1,
  },
  timingLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: '#000',
  },
  timingSubtext: {
    fontSize: FontSizes.sm,
    color: '#666',
    marginTop: 2,
  },
  scheduleInputs: {
    marginTop: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: '#000',
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: Spacing.sm,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  passengerInputs: {
    marginTop: Spacing.lg,
  },
  vehicleList: {
    gap: Spacing.sm,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  vehicleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  vehicleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  vehicleName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: '#000',
  },
  vehicleCapacity: {
    fontSize: FontSizes.sm,
    color: '#666',
    marginTop: 2,
  },
  vehicleExamples: {
    fontSize: FontSizes.xs,
    color: '#999',
    marginTop: 2,
  },
  vehicleRight: {
    alignItems: 'flex-end',
  },
  vehiclePrice: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  vehiclePriceEmpty: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: '#CCC',
  },
  distanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  distanceText: {
    fontSize: FontSizes.sm,
    color: '#000',
    marginLeft: Spacing.xs,
    fontWeight: FontWeights.medium,
  },
  preferencesSection: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: '#000',
    marginBottom: Spacing.md,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  preferenceLabel: {
    fontSize: FontSizes.md,
    color: '#000',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  notesSection: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  paymentSection: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  paymentCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  paymentCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  paymentLabel: {
    fontSize: FontSizes.sm,
    color: '#666',
    marginTop: Spacing.xs,
  },
  paymentLabelSelected: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: '#000',
    flex: 2,
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: Spacing.sm,
  },
  fareCard: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  fareTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: '#000',
    marginBottom: Spacing.sm,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  fareLabel: {
    fontSize: FontSizes.sm,
    color: '#666',
  },
  fareValue: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: '#000',
  },
  fareTotalRow: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  fareTotalLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: '#000',
  },
  fareTotalValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  bottomBar: {
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
  },
  continueButton: {
    backgroundColor: Colors.primary,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  bookButton: {
    backgroundColor: Colors.primary,
  },
});
