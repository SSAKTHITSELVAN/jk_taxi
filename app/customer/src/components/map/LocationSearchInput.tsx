import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../constants/theme';

interface LocationSearchInputProps {
  placeholder: string;
  onLocationSelect: (location: LocationResult) => void;
  initialValue?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onFocusNext?: () => void;
  showCurrentLocation?: boolean;
}

export interface LocationResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface LocationSearchInputRef {
  focus: () => void;
}

// Predefined locations for demo
const PREDEFINED_LOCATIONS: LocationResult[] = [
  {
    name: 'MG Road',
    address: 'MG Road, Bangalore',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    name: 'Koramangala',
    address: 'Koramangala, Bangalore',
    latitude: 12.9352,
    longitude: 77.6245,
  },
  {
    name: 'Indiranagar',
    address: 'Indiranagar, Bangalore',
    latitude: 12.9716,
    longitude: 77.6412,
  },
  {
    name: 'Whitefield',
    address: 'Whitefield, Bangalore',
    latitude: 12.9698,
    longitude: 77.7500,
  },
  {
    name: 'Electronic City',
    address: 'Electronic City, Bangalore',
    latitude: 12.8456,
    longitude: 77.6603,
  },
  {
    name: 'Marathahalli',
    address: 'Marathahalli, Bangalore',
    latitude: 12.9591,
    longitude: 77.6974,
  },
  {
    name: 'Jayanagar',
    address: 'Jayanagar, Bangalore',
    latitude: 12.9250,
    longitude: 77.5938,
  },
  {
    name: 'HSR Layout',
    address: 'HSR Layout, Bangalore',
    latitude: 12.9116,
    longitude: 77.6385,
  },
  {
    name: 'BTM Layout',
    address: 'BTM Layout, Bangalore',
    latitude: 12.9165,
    longitude: 77.6101,
  },
  {
    name: 'Banashankari',
    address: 'Banashankari, Bangalore',
    latitude: 12.9250,
    longitude: 77.5485,
  },
  {
    name: 'Silk Board',
    address: 'Silk Board, Bangalore',
    latitude: 12.9180,
    longitude: 77.6229,
  },
  {
    name: 'Malleshwaram',
    address: 'Malleshwaram, Bangalore',
    latitude: 13.0050,
    longitude: 77.5710,
  },
  {
    name: 'Rajajinagar',
    address: 'Rajajinagar, Bangalore',
    latitude: 12.9897,
    longitude: 77.5544,
  },
  {
    name: 'Yeshwanthpur',
    address: 'Yeshwanthpur, Bangalore',
    latitude: 13.0287,
    longitude: 77.5386,
  },
  {
    name: 'Hebbal',
    address: 'Hebbal, Bangalore',
    latitude: 13.0358,
    longitude: 77.5970,
  },
  {
    name: 'Airport',
    address: 'Kempegowda International Airport, Bangalore',
    latitude: 13.1986,
    longitude: 77.7066,
  },
  {
    name: 'Railway Station',
    address: 'Bangalore City Railway Station',
    latitude: 12.9767,
    longitude: 77.5713,
  },
  {
    name: 'Majestic',
    address: 'Majestic Bus Stand, Bangalore',
    latitude: 12.9767,
    longitude: 77.5713,
  },
  {
    name: 'Yelahanka',
    address: 'Yelahanka, Bangalore',
    latitude: 13.1007,
    longitude: 77.5963,
  },
  {
    name: 'JP Nagar',
    address: 'JP Nagar, Bangalore',
    latitude: 12.9075,
    longitude: 77.5854,
  },
];

export const LocationSearchInput = forwardRef<LocationSearchInputRef, LocationSearchInputProps>(({
  placeholder,
  onLocationSelect,
  initialValue = '',
  icon = 'location',
  onFocusNext,
  showCurrentLocation = false,
}, ref) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Update query when initialValue changes
  useEffect(() => {
    if (initialValue && initialValue !== query) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  useEffect(() => {
    if (query.length > 1) {
      searchLocation(query);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  const handleBlur = () => {
    // Delay hiding results to allow tap to register
    setTimeout(() => {
      if (results.length > 0 && query.length > 1) {
        // Keep showing if user is typing
        return;
      }
      setShowResults(false);
    }, 300);
  };

  const searchLocation = (searchQuery: string) => {
    const filtered = PREDEFINED_LOCATIONS.filter((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(filtered);
    setShowResults(true);
  };

  const handleSelectLocation = (location: LocationResult) => {
    console.log('Selected location:', location);
    setQuery(location.address);
    setShowResults(false);
    setResults([]);
    inputRef.current?.blur();
    onLocationSelect(location);

    // Auto-focus next input after a short delay
    if (onFocusNext) {
      setTimeout(() => {
        onFocusNext();
      }, 150);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      // Check current permission status
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();

      if (currentStatus !== 'granted') {
        // Request permission
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();

        if (newStatus !== 'granted') {
          Alert.alert(
            'Location Permission',
            'You can still enter your location manually by typing in the search box.',
            [
              { text: 'OK', style: 'cancel' },
            ]
          );
          setLoadingLocation(false);
          return;
        }
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      const currentLocation: LocationResult = {
        name: 'Current Location',
        address: 'Your current location',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      handleSelectLocation(currentLocation);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Could not get your location. Please enter it manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color={Colors.primary} style={styles.icon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          value={query}
          onChangeText={(text) => {
            console.log('Text changed:', text);
            setQuery(text);
          }}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
          onBlur={handleBlur}
          placeholderTextColor={Colors.textSecondary}
        />
        {showCurrentLocation && query.length === 0 && (
          <TouchableOpacity onPress={handleUseCurrentLocation} disabled={loadingLocation}>
            {loadingLocation ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="navigate-circle" size={24} color={Colors.primary} />
            )}
          </TouchableOpacity>
        )}
        {query.length > 0 && (
          <TouchableOpacity onPress={() => {
            setQuery('');
            setResults([]);
            setShowResults(false);
          }}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          {results.length > 0 ? (
            <ScrollView
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {results.map((item, index) => (
                <TouchableOpacity
                  key={`${item.latitude}-${item.longitude}-${index}`}
                  style={styles.resultItem}
                  onPress={() => handleSelectLocation(item)}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.resultIcon}
                  />
                  <View style={styles.resultText}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultAddress} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={32} color="#CCC" />
              <Text style={styles.noResultsText}>No locations found</Text>
              <Text style={styles.noResultsSubtext}>Try searching for popular areas like MG Road, Koramangala, etc.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: '#000000',
    paddingVertical: Spacing.xs,
    fontWeight: FontWeights.medium,
  },
  resultsContainer: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 300,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  resultIcon: {
    marginRight: Spacing.md,
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: '#000000',
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: FontSizes.sm,
    color: '#666666',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  noResultsText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: '#999',
    marginTop: Spacing.sm,
  },
  noResultsSubtext: {
    fontSize: FontSizes.sm,
    color: '#BBB',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
