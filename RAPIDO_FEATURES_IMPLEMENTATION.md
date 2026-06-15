# Rapido-Like Features Implementation Guide

## ✅ Completed
1. Driver app polling fixed (no more page flicker)
2. Rejection count column added to database
3. Static user OTP implemented

## 🔄 To Implement

### Customer App Features (Like Rapido):

#### 1. **"Looking for Drivers" Screen**
When ride is PENDING (no driver assigned):
- Show animated "Looking for drivers..." with spinner
- Display rejection count: "X drivers nearby" / "Y drivers rejected"
- Show cancel button
- Auto-refresh every 3 seconds

#### 2. **Active Ride Status Display**
- PENDING: "Looking for drivers..."
- ACCEPTED: "Driver found! Arriving in X minutes"
- STARTED: "Ride in progress"
- Show driver details when accepted

#### 3. **Ride Card Enhancements**
- Show time elapsed since booking
- Show current status with icon
- Show OTP prominently when driver assigned

### Driver App Features (Like Rapido):

#### 1. **Cancel Ride Before Start**
- Show "Cancel Ride" button when status is ACCEPTED (before OTP verification)
- Reason selection: "Customer not responding", "Wrong location", "Other"
- Increment rejection_count when cancelled

#### 2. **Stable UI (No Flicker)**
- Background polling without showing loading spinner
- Smooth ride card updates
- Pull-to-refresh for manual updates

#### 3. **Accept Multiple Rides**
Currently: Driver can only have ONE active ride
Rapido-like: Allow queue (accept next while on current ride)
**Decision:** Keep single ride for v1, add queue in v2

---

## Implementation Steps

### Step 1: Add Driver Reject/Cancel Endpoint

**Backend:** `/api/v2/driver/rides/{ride_id}/reject`

```python
@router.post("/rides/{ride_id}/reject")
async def reject_ride(
    ride_id: UUID,
    reason: str,
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    ride = db.query(RideEnhanced).filter(RideEnhanced.id == ride_id).first()
    
    if not ride:
        raise HTTPException(404, "Ride not found")
    
    if ride.driver_id != current_driver.id:
        raise HTTPException(403, "Not your ride")
    
    if ride.status not in [RideStatus.PENDING, RideStatus.ACCEPTED]:
        raise HTTPException(400, "Ride already started or completed")
    
    # Increment rejection count
    ride.rejection_count += 1
    ride.driver_id = None
    ride.status = RideStatus.PENDING
    
    db.commit()
    
    return {"message": "Ride rejected", "rejection_count": ride.rejection_count}
```

### Step 2: Customer "Looking for Drivers" Component

Create: `app/customer/src/components/LookingForDrivers.tsx`

```typescript
export const LookingForDrivers = ({ rideId, rejectionCount, onCancel }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card style={styles.searchingCard}>
      <ActivityIndicator size="large" color={Colors.primary} />
      
      <Text style={styles.searchingTitle}>Looking for drivers...</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="people" size={20} color={Colors.primary} />
          <Text style={styles.statText}>
            {rejectionCount > 0 
              ? `${rejectionCount} driver${rejectionCount > 1 ? 's' : ''} notified`
              : 'Searching nearby drivers'}
          </Text>
        </View>
        
        <Text style={styles.elapsed}>
          {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
        </Text>
      </View>

      {rejectionCount > 3 && (
        <Text style={styles.warning}>
          Finding a driver is taking longer than usual. You may cancel and try again.
        </Text>
      )}

      <Button
        title="Cancel Ride"
        variant="outline"
        onPress={onCancel}
        icon={<Ionicons name="close-circle" size={20} />}
      />
    </Card>
  );
};
```

### Step 3: Driver Cancel Before Start

Add to `app/driver/app/(tabs)/index.tsx` active ride section:

```typescript
{activeRide && activeRide.status === 'accepted' && !activeRide.otp_verified && (
  <Button
    title="Cancel Ride"
    variant="outline"
    onPress={() => handleCancelRide(activeRide.id)}
    style={styles.cancelButton}
    icon={<Ionicons name="close-circle" size={20} color={Colors.error} />}
  />
)}

const handleCancelRide = async (rideId: string) => {
  Alert.alert(
    'Cancel Ride?',
    'Why are you cancelling this ride?',
    [
      {
        text: 'Customer not responding',
        onPress: () => rejectRide(rideId, 'Customer not responding')
      },
      {
        text: 'Wrong location',
        onPress: () => rejectRide(rideId, 'Wrong location')
      },
      {
        text: 'Other reason',
        onPress: () => rejectRide(rideId, 'Other')
      },
      { text: 'Nevermind', style: 'cancel' }
    ]
  );
};
```

### Step 4: Update RideEnhancedResponse Schema

Add `rejection_count` to schema:

```python
class RideEnhancedResponse(BaseModel):
    # ... existing fields ...
    rejection_count: int = 0
```

### Step 5: Customer Rides Screen Enhancement

Update `app/customer/app/(tabs)/rides.tsx`:

```typescript
const RideCard = ({ ride }) => {
  const isPending = ride.status === 'pending';
  const isAccepted = ride.status === 'accepted';

  if (isPending) {
    return (
      <LookingForDrivers
        rideId={ride.id}
        rejectionCount={ride.rejection_count}
        onCancel={() => handleCancelRide(ride.id)}
      />
    );
  }

  return (
    <Card style={styles.rideCard}>
      {/* Show driver details, OTP, status */}
      <StatusBadge status={ride.status} />
      
      {isAccepted && (
        <View style={styles.otpSection}>
          <Text style={styles.otpLabel}>Your OTP:</Text>
          <Text style={styles.otpValue}>{ride.ride_otp}</Text>
          <Text style={styles.otpHint}>Share with driver to start ride</Text>
        </View>
      )}

      {/* Rest of ride details */}
    </Card>
  );
};
```

---

## UI/UX Improvements

### Colors & Icons (Rapido-like):
- PENDING: Orange color, clock icon
- ACCEPTED: Green color, car icon
- STARTED: Blue color, navigation icon
- COMPLETED: Gray color, checkmark icon
- CANCELLED: Red color, x icon

### Animations:
- Pulsing dot for "searching"
- Smooth transitions between states
- No jarring page refreshes

### Polling Strategy:
- Active/Pending rides: Poll every 3-5 seconds
- Completed rides: No polling
- Background only (no loading spinners)

---

## Testing Checklist

### Customer:
- [ ] Book ride → See "Looking for drivers"
- [ ] Rejection count increases when driver rejects
- [ ] Can cancel while searching
- [ ] See driver details when accepted
- [ ] See OTP when driver assigned
- [ ] Timer shows elapsed time

### Driver:
- [ ] See available rides when online
- [ ] Accept ride → Status changes
- [ ] Can cancel before OTP verification
- [ ] Cannot cancel after ride started
- [ ] Rejection increments on cancel
- [ ] UI doesn't flicker during polling

---

## Files to Modify

### Backend:
1. ✅ `models/ride_enhanced.py` - Add rejection_count
2. ✅ Migration added
3. `schemas/ride_enhanced.py` - Add rejection_count to response
4. `api/driver_enhanced/routes.py` - Add reject endpoint
5. `api/booking_enhanced/routes.py` - Return rejection_count

### Customer App:
1. `src/components/LookingForDrivers.tsx` - NEW
2. `app/(tabs)/rides.tsx` - Add pending state handling
3. `src/types/enhanced.ts` - Add rejection_count to type

### Driver App:
1. `app/(tabs)/index.tsx` - Add cancel button
2. `src/api/driver-enhanced.ts` - Add rejectRide function

---

**Next:** Implement these features one by one. Start with backend reject endpoint, then customer UI, then driver cancel button.
