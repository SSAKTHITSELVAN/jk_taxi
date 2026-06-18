# JK Taxi - Complete Testing Guide

## 📋 Pre-Testing Setup

### 1. Build Both Apps
```bash
# Customer App
cd /home/sakthi-selvan/jk_taxi/app/customer
eas build --profile development --platform android

# Driver App
cd /home/sakthi-selvan/jk_taxi/app/driver
eas build --profile development --platform android
```

### 2. Install on Devices
- Download APKs from EAS build links
- Install customer app on Device 1
- Install driver app on Device 2
- Grant all permissions (Location, Notifications)

### 3. Test Accounts
Create test accounts or use:
```
Customer:
- Phone: +91 9999999991
- Name: Test Customer

Driver:
- Phone: +91 8888888881
- Name: Test Driver
- Vehicle: KA01AB1234
```

## 🧪 Testing Scenarios

### Scenario 1: Customer Books Ride

**Customer App Testing**:

1. **Launch & Login** ✓
   - [ ] App opens without crashing
   - [ ] Splash screen displays
   - [ ] Can navigate to login
   - [ ] Phone number input works
   - [ ] OTP received (or skip for test)
   - [ ] Successfully logged in

2. **Home Screen** ✓
   - [ ] Map loads correctly
   - [ ] Current location marker shows
   - [ ] User's location detected
   - [ ] "Book Ride" button visible
   - [ ] Menu/profile accessible

3. **Book Ride** ✓
   - [ ] Tap "Book Ride"
   - [ ] Pickup location auto-filled
   - [ ] Can search for dropoff location
   - [ ] Location suggestions appear
   - [ ] Selected location shows on map
   - [ ] Route draws between pickup/dropoff
   - [ ] Distance shown correctly

4. **Select Vehicle** ✓
   - [ ] Vehicle types load
   - [ ] Can select different types
   - [ ] Prices update per selection
   - [ ] Vehicle info displayed clearly

5. **Confirm Booking** ✓
   - [ ] Fare breakdown shown
   - [ ] Can add preferences
   - [ ] Can add notes
   - [ ] "Confirm Booking" button works
   - [ ] Booking created successfully

6. **Wait for Driver** ✓
   - [ ] "Searching for driver" shown
   - [ ] OTP displayed
   - [ ] Can cancel booking

**Expected Result**: Ride created, waiting for driver

---

### Scenario 2: Driver Accepts Ride

**Driver App Testing**:

1. **Launch & Login** ✓
   - [ ] App opens without crashing
   - [ ] Can log in as driver
   - [ ] Profile loads

2. **Go Online** ✓
   - [ ] Toggle shows "Offline" initially
   - [ ] Can toggle to "Online"
   - [ ] Status updates

3. **View Available Rides** ✓
   - [ ] Available rides list shows
   - [ ] Customer ride appears
   - [ ] Customer name visible
   - [ ] Pickup/dropoff addresses shown
   - [ ] Fare amount displayed
   - [ ] Distance shown

4. **Accept Ride** ✓
   - [ ] Tap "Accept" button
   - [ ] Ride moves to "Active Ride"
   - [ ] Available rides list clears
   - [ ] Success message shown

5. **View Ride Details** ✓
   - [ ] Tap ride card to see details
   - [ ] Map loads with route
   - [ ] Pickup marker (green) visible
   - [ ] Dropoff marker (red) visible
   - [ ] Driver marker (purple) visible
   - [ ] Route line drawn
   - [ ] Distance and duration shown

6. **Customer Information** ✓
   - [ ] Customer name displayed
   - [ ] Customer phone number shown
   - [ ] "Call" button works (initiates call)

7. **OTP Display** ✓
   - [ ] OTP card visible
   - [ ] OTP number shown clearly
   - [ ] Warning about verification shown

8. **Navigate to Pickup** ✓
   - [ ] "Navigate" button works
   - [ ] Opens device maps app
   - [ ] Correct destination set

**Expected Result**: Driver sees ride, can navigate to pickup

---

### Scenario 3: Customer Sees Driver

**Customer App Testing**:

1. **Driver Assigned** ✓
   - [ ] Notification received
   - [ ] Driver info appears
   - [ ] Driver name shown
   - [ ] Driver vehicle info shown
   - [ ] Driver rating displayed

2. **Track Driver** ✓
   - [ ] Map updates with driver location
   - [ ] Driver marker moves in real-time
   - [ ] ETA updates
   - [ ] Route to pickup shown

3. **Driver Arriving** ✓
   - [ ] Notification when driver near
   - [ ] OTP prominently displayed
   - [ ] "Share OTP" reminder shown

**Expected Result**: Customer tracks driver approaching

---

### Scenario 4: OTP Verification

**Driver App Testing**:

1. **Ask for OTP** ✓
   - [ ] Driver asks customer for OTP
   - [ ] Tap "Verify OTP" button
   - [ ] OTP input modal appears

2. **Enter OTP** ✓
   - [ ] Can type 4-digit OTP
   - [ ] Submit button enabled
   - [ ] Tap submit

3. **Verification Success** ✓
   - [ ] Success message shown
   - [ ] OTP card turns green
   - [ ] "Verified ✓" badge appears
   - [ ] "Start Ride" button enabled

**Expected Result**: OTP verified, can start ride

---

### Scenario 5: Ride in Progress

**Driver App Testing**:

1. **Start Ride** ✓
   - [ ] Tap "Start Ride" button
   - [ ] Confirmation shown
   - [ ] Status changes to "Started"
   - [ ] Map updates to show destination

2. **Navigate to Destination** ✓
   - [ ] Tap "Navigate" again
   - [ ] Maps opens with dropoff location
   - [ ] Can follow directions

**Customer App Testing**:

1. **Ride Started Notification** ✓
   - [ ] Notification received
   - [ ] Status changes to "In Progress"

2. **Track to Destination** ✓
   - [ ] Map shows route to destination
   - [ ] Driver location updates
   - [ ] ETA updates
   - [ ] Can see progress

**Expected Result**: Both users see ride in progress

---

### Scenario 6: Complete Ride

**Driver App Testing**:

1. **Arrive at Destination** ✓
   - [ ] Tap "Complete Ride"
   - [ ] Confirmation dialog appears
   - [ ] Confirm completion

2. **Ride Completed** ✓
   - [ ] Success message shown
   - [ ] Returns to home screen
   - [ ] Earnings updated
   - [ ] Back online, can accept new rides

**Customer App Testing**:

1. **Ride Completed Notification** ✓
   - [ ] Notification received
   - [ ] Ride summary shown
   - [ ] Fare amount displayed

2. **Rate Driver** ✓
   - [ ] Rating modal appears
   - [ ] Can select stars
   - [ ] Can add feedback
   - [ ] Submit rating
   - [ ] Thank you message

**Expected Result**: Ride completed successfully

---

## 🔍 Feature-Specific Testing

### Map Features

**Customer App**:
- [ ] Map loads correctly
- [ ] Can pan and zoom
- [ ] User location marker
- [ ] Pickup/dropoff markers
- [ ] Route polyline drawn
- [ ] Distance calculated
- [ ] ETA shown

**Driver App**:
- [ ] Full-screen map
- [ ] Three marker types (P, D, Driver)
- [ ] Route with traffic
- [ ] Auto-fit to show all markers
- [ ] Smooth animations
- [ ] Real-time location updates

### Location Search

**Customer App Only**:
- [ ] Search input appears
- [ ] Can type address
- [ ] Suggestions load quickly
- [ ] Can select suggestion
- [ ] Map moves to selection
- [ ] Address saved correctly

### Navigation

**Driver App Only**:
- [ ] "Navigate" button works
- [ ] Opens Google/Apple Maps
- [ ] Correct coordinates passed
- [ ] Can return to app
- [ ] Location still tracking

### Communication

**Driver App Only**:
- [ ] "Call" button visible
- [ ] Tap initiates phone call
- [ ] Correct number dialed
- [ ] Can return to app after call

### Notifications

**Both Apps**:
- [ ] Push notifications enabled
- [ ] Ride status updates notify
- [ ] Driver arrival notifies
- [ ] Ride complete notifies
- [ ] Can tap to open app

## 🚨 Error Testing

### Network Errors

1. **No Internet**:
   - [ ] Turn off WiFi/Data
   - [ ] Try to book ride
   - [ ] Error message shown
   - [ ] Can retry when back online

2. **Slow Connection**:
   - [ ] Use slow 3G
   - [ ] Operations show loading
   - [ ] Eventually complete
   - [ ] No crashes

### Location Errors

1. **Location Denied**:
   - [ ] Deny location permission
   - [ ] App requests permission
   - [ ] Shows error if denied
   - [ ] Can enable in settings

2. **GPS Off**:
   - [ ] Turn off GPS
   - [ ] App detects issue
   - [ ] Prompts to enable
   - [ ] Works when enabled

### Edge Cases

1. **Cancel Booking**:
   - [ ] Customer cancels after booking
   - [ ] Driver notified
   - [ ] Driver returned to available rides
   - [ ] Customer can book again

2. **Driver Rejects**:
   - [ ] Driver rejects ride
   - [ ] Customer notified
   - [ ] Searches for new driver
   - [ ] Can cancel search

3. **App Backgrounded**:
   - [ ] Put app in background
   - [ ] Leave for 5 minutes
   - [ ] Return to app
   - [ ] State preserved
   - [ ] Still works correctly

4. **Low Battery**:
   - [ ] Test with <20% battery
   - [ ] App still functional
   - [ ] Location tracking works
   - [ ] No excessive drain

## 📊 Performance Testing

### Startup Time
- [ ] Cold start < 3 seconds
- [ ] Warm start < 1 second
- [ ] Splash screen smooth

### Map Performance
- [ ] Map loads < 2 seconds
- [ ] Smooth panning
- [ ] Smooth zooming
- [ ] No lag on route draw
- [ ] Location updates smooth

### Memory Usage
- [ ] Check in device settings
- [ ] Should be < 150MB
- [ ] No memory leaks
- [ ] Stable over time

### Battery Usage
- [ ] Monitor battery drain
- [ ] < 5% per hour active use
- [ ] Location tracking efficient

## ✅ Final Checklist

### Customer App
- [ ] All screens accessible
- [ ] No crashes
- [ ] Maps working
- [ ] Booking flow complete
- [ ] Tracking works
- [ ] Ratings work
- [ ] History loads

### Driver App
- [ ] All screens accessible
- [ ] No crashes
- [ ] Maps working
- [ ] Can toggle online/offline
- [ ] Can accept/reject rides
- [ ] OTP verification works
- [ ] Start/complete works
- [ ] Earnings show

### Integration
- [ ] Customer booking reaches driver
- [ ] Driver acceptance reaches customer
- [ ] Real-time updates work
- [ ] OTP system works
- [ ] Completion syncs

## 🐛 Bug Reporting

If you find issues, report with:
1. Device model and Android version
2. App version
3. Steps to reproduce
4. Expected vs actual behavior
5. Screenshots/screen recording
6. Logs if possible

## 📝 Test Results Log

Date: __________
Tester: __________

| Feature | Status | Notes |
|---------|--------|-------|
| Customer Login | ⬜ Pass ⬜ Fail | |
| Book Ride | ⬜ Pass ⬜ Fail | |
| Track Driver | ⬜ Pass ⬜ Fail | |
| Driver Login | ⬜ Pass ⬜ Fail | |
| Accept Ride | ⬜ Pass ⬜ Fail | |
| OTP Verify | ⬜ Pass ⬜ Fail | |
| Complete Ride | ⬜ Pass ⬜ Fail | |
| Maps | ⬜ Pass ⬜ Fail | |
| Navigation | ⬜ Pass ⬜ Fail | |
| Notifications | ⬜ Pass ⬜ Fail | |

## 🎯 Success Criteria

✅ **Ready for Production** if:
- [ ] All critical flows work
- [ ] No crashes in testing
- [ ] Maps load correctly
- [ ] Real-time updates work
- [ ] OTP verification works
- [ ] Ride complete end-to-end
- [ ] Performance acceptable
- [ ] Battery usage reasonable

---

*Happy Testing!* 🚀
