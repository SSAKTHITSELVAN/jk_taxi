# Rapido-Like Implementation - Current Status

## ✅ COMPLETED

### Backend:
1. **Static User OTP** - Every user has one permanent 4-digit OTP for all rides ✅
2. **Rejection Tracking** - `rejection_count` column added to rides_enhanced table ✅
3. **Reject/Cancel Endpoint** - `/api/v2/driver/rides/{ride_id}/reject` ✅
   - Driver can cancel before OTP verification
   - Increments rejection_count
   - Makes ride available again
4. **In-Memory Token System** - Works even when AsyncStorage fails ✅
5. **Clean Logging** - No more scary red errors for normal operations ✅

### Driver App:
1. **Fixed Polling Flicker** - Background updates without UI refresh ✅
2. **Stable UI** - Loading spinner only on initial load ✅
3. **Clean Logs** - Offline/no-rides shown as info, not errors ✅
4. **Online/Offline Toggle** - Works correctly with state management ✅

### Customer App:
1. **Static OTP Display** - Shows on home screen ✅
2. **Login Working** - With in-memory tokens ✅
3. **Booking Flow** - Complete with OTP in confirmation ✅
4. **Rating System** - After ride completion ✅

---

## 🔄 TO IMPLEMENT (Next Steps)

### Customer App - "Looking for Drivers" UI:

**File:** `app/customer/src/components/LookingForDrivers.tsx` (NEW)

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './common/Card';
import { Button } from './common/Button';

interface Props {
  rideId: string;
  rejectionCount: number;
  elapsedSeconds: number;
  onCancel: () => void;
}

export const LookingForDrivers: React.FC<Props> = ({
  rideId,
  rejectionCount,
  elapsedSeconds,
  onCancel
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.title}>Looking for drivers...</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Ionicons name="car" size={24} color="#FF6B35" />
          <Text style={styles.statLabel}>
            {rejectionCount === 0 
              ? 'Searching nearby...'
              : `${rejectionCount} driver${rejectionCount > 1 ? 's' : ''} notified`
            }
          </Text>
        </View>

        <View style={styles.stat}>
          <Ionicons name="time" size={24} color="#666" />
          <Text style={styles.statLabel}>
            {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      </View>

      {rejectionCount > 3 && (
        <View style={styles.warningBox}>
          <Ionicons name="alert-circle" size={20} color="#FFA500" />
          <Text style={styles.warningText}>
            Taking longer than usual. Try cancelling and rebooking.
          </Text>
        </View>
      )}

      <Button
        title="Cancel Ride"
        variant="outline"
        onPress={onCancel}
        icon={<Ionicons name="close-circle" size={20} color="#E74C3C" />}
      />
    </Card>
  );
};
```

**Integrate in:** `app/customer/app/(tabs)/rides.tsx`

```typescript
const RideCard = ({ ride }: { ride: Ride }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (ride.status === 'pending') {
      const createdAt = new Date(ride.created_at);
      const updateElapsed = () => {
        const now = new Date();
        setElapsedSeconds(Math.floor((now.getTime() - createdAt.getTime()) / 1000));
      };
      
      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [ride.status, ride.created_at]);

  // Show "Looking for drivers" for pending rides
  if (ride.status === 'pending') {
    return (
      <LookingForDrivers
        rideId={ride.id}
        rejectionCount={ride.rejection_count || 0}
        elapsedSeconds={elapsedSeconds}
        onCancel={() => handleCancelRide(ride.id)}
      />
    );
  }

  // Show normal ride card for accepted/started rides
  return (
    <Card>{/* existing ride card UI */}</Card>
  );
};
```

---

### Driver App - Cancel Button:

**Add to:** `app/driver/app/(tabs)/index.tsx`

In the active ride section (around line 350):

```typescript
{/* Cancel Ride Button - Only show before OTP verification */}
{activeRide && activeRide.status === 'accepted' && !activeRide.otp_verified && (
  <Button
    title="Cancel Ride"
    variant="outline"
    onPress={() => handleCancelRide(activeRide.id)}
    style={styles.cancelRideButton}
    icon={<Ionicons name="close-circle-outline" size={20} color={Colors.error} />}
  />
)}
```

Add handler function:

```typescript
const handleCancelRide = async (rideId: string) => {
  Alert.alert(
    'Cancel Ride?',
    'Customer will be notified. Why are you cancelling?',
    [
      {
        text: 'Customer not responding',
        onPress: () => rejectRideWithReason(rideId, 'not_responding')
      },
      {
        text: 'Wrong pickup location',
        onPress: () => rejectRideWithReason(rideId, 'wrong_location')
      },
      {
        text: 'Other reason',
        onPress: () => rejectRideWithReason(rideId, 'other')
      },
      { text: 'Nevermind', style: 'cancel' }
    ]
  );
};

const rejectRideWithReason = async (rideId: string, reason: string) => {
  try {
    await driverEnhancedApi.rejectRide(rideId);
    Alert.alert('Ride Cancelled', 'The ride has been cancelled and is now available for other drivers.');
    setActiveRide(null);
    loadRides(); // Refresh to get new available rides
  } catch (error: any) {
    Alert.alert('Error', error.response?.data?.detail || 'Failed to cancel ride');
  }
};
```

Add to API file `app/driver/src/api/driver-enhanced.ts`:

```typescript
export const driverEnhancedApi = {
  // ... existing methods ...

  rejectRide: async (rideId: string) => {
    const response = await apiClient.post(`/api/v2/driver/rides/${rideId}/reject`);
    return response.data;
  },
};
```

---

### Customer Types Update:

**File:** `app/customer/src/types/index.ts`

```typescript
export interface Ride {
  // ... existing fields ...
  rejection_count?: number;  // ADD THIS
}
```

---

## 🎨 UI/UX Improvements Needed

### Status Colors (Rapido-style):
```typescript
const STATUS_COLORS = {
  pending: '#FF6B35',    // Orange
  accepted: '#27AE60',   // Green
  started: '#3498DB',    // Blue
  completed: '#95A5A6',  // Gray
  cancelled: '#E74C3C',  // Red
};

const STATUS_ICONS = {
  pending: 'time-outline',
  accepted: 'car-sport-outline',
  started: 'navigate-circle-outline',
  completed: 'checkmark-circle-outline',
  cancelled: 'close-circle-outline',
};
```

### Animations:
- Pulsing dot for "searching"
- Smooth fade transitions
- No jarring refreshes

---

## 📋 Testing Checklist

### Customer Flow:
1. [ ] Book ride
2. [ ] See "Looking for drivers" screen
3. [ ] See elapsed timer counting up
4. [ ] See rejection count when drivers reject
5. [ ] Can cancel while searching
6. [ ] See driver details when accepted
7. [ ] See OTP clearly displayed
8. [ ] No page flicker during polling

### Driver Flow:
1. [ ] Go online → See available rides
2. [ ] Accept ride → Status changes to accepted
3. [ ] See "Cancel Ride" button (before OTP)
4. [ ] Cancel ride → Back to available rides
5. [ ] Verify OTP → "Cancel" button disappears
6. [ ] Cannot cancel after ride started
7. [ ] No UI flicker during polling

### Edge Cases:
1. [ ] Multiple drivers reject same ride → Count increases
2. [ ] Customer cancels while driver viewing → Ride disappears
3. [ ] Driver goes offline mid-ride → Stays assigned
4. [ ] Network error during cancel → Proper error message
5. [ ] Rejection count > 5 → Show warning to customer

---

## 🚀 Quick Implementation Order

1. ✅ Backend reject endpoint (DONE)
2. ✅ Add rejection_count to schema (DONE)
3. **Next:** Add `LookingForDrivers` component to customer app
4. **Next:** Update customer rides screen to show pending state
5. **Next:** Add cancel button to driver app
6. **Next:** Test full flow customer → driver → rejection → customer sees count

---

## 🔧 Backend Restart Needed

```bash
# Backend already has reject endpoint
# Just restart to load changes:
pkill -f "uvicorn app.main:app"
source ~/billion/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
```

---

## 📱 Frontend Implementation Priority

**High Priority (Do Now):**
1. Customer "Looking for drivers" component
2. Driver cancel button
3. Rejection count display

**Medium Priority (Do Next):**
1. Status color coding
2. Elapsed timer
3. Warning when rejection_count > 3

**Low Priority (Polish):**
1. Animations
2. Sound notifications
3. Haptic feedback

---

**Status:** Backend complete, frontend components designed, ready to implement! 🎉
