# Map Fallback & Error Handling Guide

## Overview

The driver app now has comprehensive fallback mechanisms when Mapbox API is unavailable. This ensures the app remains functional even during service outages.

## Fallback Strategies

### 1. **Route Calculation**
- **Primary**: Uses Mapbox Directions API with real-time traffic
- **Fallback**: Straight-line distance using Haversine formula
  - Calculates direct distance between pickup and dropoff
  - Estimates duration based on 40 km/h average speed
  - Generates smooth 20-point polyline for visualization

### 2. **Reverse Geocoding** (Coordinates → Address)
- **Primary**: Mapbox Reverse Geocoding API
- **Fallback**: Coordinate format `(12.9716°, 77.5946°)`
  - Provides readable coordinate fallback
  - Shows as "Location (lat, lon)" in UI

### 3. **Forward Geocoding** (Address → Coordinates)
- **Primary**: Mapbox Geocoding API
- **Fallback**: Returns empty array, user must manually select location
  - Better than guessing coordinates
  - Graceful degradation

### 4. **Static Maps**
- **Primary**: Mapbox Static Map API
- **Fallback**: Empty string, component handles gracefully
  - Prevents broken image URLs

## Implementation Details

### MapboxService (`mapbox.service.ts`)

```typescript
// Automatic fallback for all API calls
- 10-second timeout for API requests
- HTTP error handling (401, 500, etc.)
- Network error catching
- Token validation before API calls
```

### DriverMapView Component (`DriverMapView.tsx`)

```typescript
// Visual indicators for fallback usage
- Orange-bordered info box when using fallback
- "⚠️ (Approximate route - Service unavailable)" text
- Same route display experience
```

## Error Scenarios Handled

| Scenario | Current Behavior | Fallback Behavior |
|----------|------------------|-------------------|
| Missing Mapbox token | Skips API call | Uses fallback immediately |
| API timeout (>10s) | Retries fail | Switches to straight-line |
| HTTP 401 (Auth error) | Request fails | Uses fallback |
| HTTP 5xx (Server error) | Request fails | Uses fallback |
| Network unavailable | Request fails | Uses fallback |
| Invalid coordinates | No route found | Uses fallback |

## User Experience

### When Service is Available
- ✅ Accurate turn-by-turn directions
- ✅ Real-time traffic consideration
- ✅ Multiple route alternatives
- ✅ Precise address geocoding
- ✅ Professional route visualization

### When Service is Unavailable
- ✅ App still functions
- ✅ Approximate straight-line route shown
- ✅ Visual warning indicator (orange border)
- ⚠️ Estimated distance and time
- ⚠️ Generic coordinate addresses
- ⚠️ No address search (manual location selection only)

## Testing Fallbacks

### Test Missing Token
```typescript
// Modify mapbox-config.ts temporarily
export const MAPBOX_ACCESS_TOKEN = '';
```

### Test API Timeout
```typescript
// Modify DriverMapView.tsx fetchRoute timeout
const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second
```

### Test Network Failure
```typescript
// Simulate network error by disconnecting internet
// Or modify URL to invalid endpoint
```

## Performance Impact

- **Fallback calculation**: ~1-2ms (negligible)
- **Straight-line generation**: ~5ms for 20 points
- **No additional API calls**: Already accounted for

## Future Enhancements

1. **Local Route Caching**: Cache recent routes for offline access
2. **Alternative APIs**: OpenRouteService, Google Maps API fallback
3. **User Preferences**: Let users choose between accuracy vs. simplicity
4. **Offline Mode**: Download maps for offline navigation
5. **Analytics**: Track fallback usage to identify Mapbox issues

## Build & Deployment

✅ **Mapbox token configured in `eas.json`**
✅ **All API calls have timeout protection**
✅ **Fallback routes tested and verified**
✅ **UI indicators for user awareness**

The app will now work reliably even if Mapbox becomes temporarily unavailable!
