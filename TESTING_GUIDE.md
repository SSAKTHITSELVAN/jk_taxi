# 🧪 JK Taxi - Complete Testing Guide

**Date**: May 19, 2026  
**Status**: Ready for Testing  

---

## 📋 Overview

This guide provides step-by-step instructions to test all enhanced features of the JK Taxi platform.

---

## 🚀 Setup Instructions

### Backend Setup

```bash
cd /home/sakthi-selvan/jk_taxi/backend
source ~/billion/bin/activate
uvicorn app.main:app --reload
```

**Verify Backend:**
- Open http://localhost:8000/docs
- You should see all V2 API endpoints

### Customer App Setup

```bash
cd /home/sakthi-selvan/jk_taxi/app/customer
npm start
```

### Driver App Setup

```bash
cd /home/sakthi-selvan/jk_taxi/app/driver
npm start
```

### Admin Panel

```bash
# Open in browser:
file:///home/sakthi-selvan/jk_taxi/app/admin/index.html

# Or serve with Python:
cd /home/sakthi-selvan/jk_taxi/app/admin
python3 -m http.server 3000
# Then open: http://localhost:3000
```

---

## ✅ Test Checklist

### 1. Backend API Tests

#### Vehicle Categories
- [ ] GET `/api/v2/bookings/vehicle-categories`
  - Should return 4 categories (Mini, Sedan, SUV, Premium)
  - Each should have base_fare, per_km_rate, features

#### Fare Calculation (Requires Auth)
- [ ] POST `/api/v2/bookings/calculate-fare`
  - Test with different vehicle categories
  - Test with night time (scheduled after 10 PM)
  - Verify night charges added (15% surcharge)

#### Create Booking (Requires Auth)
- [ ] POST `/api/v2/bookings`
  - Create booking with all fields
  - Verify OTP generated (4-digit)
  - Check fare breakdown returned

#### Driver Operations (Requires Auth)
- [ ] GET `/api/v2/driver/rides/available`
- [ ] POST `/api/v2/driver/rides/{id}/accept`
- [ ] POST `/api/v2/driver/rides/{id}/verify-otp`
  - Test with correct OTP
  - Test with wrong OTP (should fail)
- [ ] POST `/api/v2/driver/rides/{id}/start`
  - Without OTP verification (should fail)
  - After OTP verification (should succeed)
- [ ] POST `/api/v2/driver/rides/{id}/complete`

#### Admin Analytics (Requires Admin Auth)
- [ ] GET `/api/v2/admin/analytics/overview?days=7`
- [ ] GET `/api/v2/admin/analytics/trip-types?days=7`
- [ ] GET `/api/v2/admin/analytics/vehicle-categories?days=7`
- [ ] GET `/api/v2/admin/analytics/preferences?days=7`
- [ ] GET `/api/v2/admin/rides/recent?limit=50`

---

### 2. Customer App Tests

#### Navigate to Enhanced Booking
- [ ] Open app and navigate to `/book-ride-enhanced`
- [ ] Should see "Book Your Ride" header

#### Step 1: Trip Type Selection
- [ ] Should see 6 trip type cards in grid:
  - One Way
  - Round Trip
  - Rental
  - Outstation
  - Airport Pickup
  - Airport Drop
- [ ] Select "One Way"
- [ ] Should show selected state (border highlight)
- [ ] Click "Continue" to proceed

#### Step 2: Location Details
- [ ] Enter pickup location: "MG Road, Bangalore"
- [ ] Enter dropoff location: "Koramangala, Bangalore"
- [ ] Enter driver notes: "Near metro station"
- [ ] All fields should accept text input
- [ ] Click "Continue"

#### Step 3: Scheduling
- [ ] Should see "Ride Now" selected by default
- [ ] Toggle to "Schedule Ride"
- [ ] Date and time pickers should appear
- [ ] Select a future date/time
- [ ] Toggle back to "Ride Now"
- [ ] Click "Continue"

#### Step 4: Booking For
- [ ] Should see "For Myself" selected by default
- [ ] Toggle to "For Someone Else"
- [ ] Passenger form should appear:
  - Name field
  - Phone field
  - Notes field
- [ ] Fill in passenger details
- [ ] Toggle back to "For Myself"
- [ ] Click "Continue"

#### Step 5: Vehicle Selection
- [ ] Should see 4 vehicle category cards:
  - Mini (₹80 base + ₹14/km)
  - Sedan (₹120 base + ₹16/km)
  - SUV (₹180 base + ₹22/km)
  - Premium (₹250 base + ₹28/km)
- [ ] Each card shows:
  - Display name
  - Features (AC, Seater count)
  - Example vehicles
  - Estimated fare
- [ ] Select "Sedan"
- [ ] Click "View Fare Breakdown"
- [ ] Modal should open showing:
  - Base Fare: ₹120
  - Distance Fare: ~₹210 (varies)
  - Platform Fee: ₹20
  - GST (5%): ~₹18
  - Total: ~₹368
- [ ] Close modal
- [ ] Click "Continue"

#### Step 6: Ride Preferences
- [ ] Should see 5 preference checkboxes:
  - AC Preferred
  - Pet Friendly
  - Silent Ride
  - Extra Luggage
  - Wheelchair Support
- [ ] Check "AC Preferred"
- [ ] Click "Book Ride"

#### Booking Confirmation
- [ ] Should show loading state
- [ ] Alert should appear with:
  - "Booking Confirmed!"
  - 4-digit OTP (e.g., "3847")
  - Message to share with driver
- [ ] Note down the OTP for driver test
- [ ] Click OK

#### Error Handling
- [ ] Go back and try to book without selecting trip type
  - Should show validation error
- [ ] Try to proceed without locations
  - Should show validation error
- [ ] Try to book without selecting vehicle
  - Should show validation error

---

### 3. Driver App Tests

#### Navigate to Enhanced Rides
- [ ] Open driver app
- [ ] Navigate to `/rides-enhanced`
- [ ] Should see "Available Rides" header

#### Available Rides Display
- [ ] Should see the ride created in customer test
- [ ] Ride card should show:
  - Trip type badge: "One Way"
  - Vehicle category badge: "Sedan"
  - Fare: ₹368 (approximately)
  - Distance: ~15 km
  - Pickup: "MG Road, Bangalore"
  - Dropoff: "Koramangala, Bangalore"
  - Preference chip: "AC"
  - Driver notes: "Near metro station"
- [ ] If booking was for someone else, should show passenger details
- [ ] Should see "Accept" and "Reject" buttons

#### Accept Ride
- [ ] Click "Accept" button
- [ ] Should show success alert: "Ride accepted!"
- [ ] Available rides list should clear
- [ ] Should show "Active Ride" section

#### Active Ride Display
- [ ] Should see same ride card with all details
- [ ] Should see OTP status card:
  - "🔒 OTP Required"
  - "Ask customer for 4-digit OTP to start the ride"
  - "Verify OTP" button
- [ ] "Start Ride" button should be DISABLED (grayed out)

#### OTP Verification - Wrong OTP
- [ ] Click "Verify OTP" button
- [ ] Modal should open: "Enter Ride OTP"
- [ ] Should see:
  - Shield icon
  - "Ask the customer for the 4-digit OTP" text
  - Large OTP input field
  - "Verify & Enable Start" button
  - "Cancel" button
- [ ] Enter wrong OTP: "0000"
- [ ] Click "Verify & Enable Start"
- [ ] Should show error: "Invalid OTP. Please try again."

#### OTP Verification - Correct OTP
- [ ] Enter the correct OTP from customer booking (e.g., "3847")
- [ ] Input should only accept numbers
- [ ] Should accept exactly 4 digits
- [ ] Click "Verify & Enable Start"
- [ ] Should show success alert: "OTP Verified!"
- [ ] Modal should close
- [ ] OTP status card should update:
  - "✅ OTP Verified"
  - Verify button should disappear
- [ ] "Start Ride" button should now be ENABLED (blue)

#### Start Ride
- [ ] Click "Start Ride" button
- [ ] Should show success alert: "Ride started!"
- [ ] "Start Ride" button should disappear
- [ ] Should see "Complete Ride" button

#### Complete Ride
- [ ] Click "Complete Ride" button
- [ ] Should show confirmation dialog:
  - "Complete Ride"
  - "Are you sure you want to complete this ride?"
  - "Cancel" and "Complete" buttons
- [ ] Click "Complete"
- [ ] Should show success alert: "Ride completed!"
- [ ] Active ride should disappear
- [ ] Should show "No rides available" message

#### Auto-refresh
- [ ] Wait 10 seconds
- [ ] Should automatically check for new rides
- [ ] Pull down to manually refresh
- [ ] Should show refresh indicator

---

### 4. Admin Panel Tests

#### Access Admin Dashboard
- [ ] Open http://localhost:3000 (or file:// URL)
- [ ] Should see "JK Taxi Admin Dashboard" header

#### Overview Stats (Top Cards)
- [ ] Should see 4 stat cards:
  - Total Rides
  - Total Revenue
  - Completion Rate
  - Average Fare
- [ ] Values should reflect test data
- [ ] Subtitle should say "Last 7 days"

#### Analytics Tab (Default)
- [ ] Should be on "Analytics" tab by default
- [ ] Should see period selector: 7 Days, 30 Days, 90 Days
- [ ] "7 Days" should be active

#### Chart: Revenue by Trip Type
- [ ] Should see bar chart
- [ ] If you completed test rides, should show data
- [ ] Each bar shows:
  - Revenue amount at top
  - Trip type at bottom
- [ ] Hover should highlight bar

#### Chart: Revenue by Vehicle Category
- [ ] Should see bar chart for vehicles
- [ ] Should show "Sedan" with your test ride revenue
- [ ] Bars should be proportional

#### Chart: Popular Preferences
- [ ] Should see bar chart for preferences
- [ ] Should show "AC Preferred" with count: 1
- [ ] Other preferences should show 0 or small values

#### Period Selection
- [ ] Click "30 Days" button
- [ ] Button should become active (blue)
- [ ] Charts should reload
- [ ] Stats at top should update
- [ ] Click "90 Days"
- [ ] Should reload again

#### Vehicle Categories Tab
- [ ] Click "Vehicle Categories" tab
- [ ] Should see "Manage Vehicle Categories" header
- [ ] Should see "+ Add New Category" button
- [ ] Should see 4 vehicle cards:

**Mini Card:**
- [ ] Display Name: "Mini / Hatchback"
- [ ] Description: "Small car for budget rides"
- [ ] Base Fare: ₹80
- [ ] Per KM: ₹14
- [ ] Capacity: 4 seats
- [ ] Features: AC, 4 Seater, Budget Friendly
- [ ] Examples: WagonR, Alto, Tiago
- [ ] "Edit" and "Delete" buttons

**Sedan Card:**
- [ ] Display Name: "Sedan"
- [ ] Base Fare: ₹120
- [ ] Per KM: ₹16
- [ ] Examples: Dzire, Etios, Aura

**SUV Card:**
- [ ] Display Name: "SUV"
- [ ] Base Fare: ₹180
- [ ] Per KM: ₹22
- [ ] Capacity: 7 seats
- [ ] Examples: Ertiga, Innova, Marazzo

**Premium Card:**
- [ ] Display Name: "Premium"
- [ ] Base Fare: ₹250
- [ ] Per KM: ₹28
- [ ] Examples: Innova Crysta, BYD e6

#### Add Vehicle Modal
- [ ] Click "+ Add New Category"
- [ ] Modal should open: "Add Vehicle Category"
- [ ] Should see form fields:
  - Name
  - Display Name
  - Description
  - Seater Capacity
  - Base Fare
  - Per KM Rate
  - Example Vehicles
  - Features
  - Display Order
- [ ] Click "Cancel" - modal should close
- [ ] Note: Save functionality requires authentication

#### Recent Rides Tab
- [ ] Click "Recent Rides" tab
- [ ] Should see table with columns:
  - Trip Type
  - Vehicle
  - Route
  - Fare
  - Status
  - Date
- [ ] Should see your test ride:
  - Trip Type: "one way"
  - Vehicle: "sedan"
  - Route: MG Road → Koramangala
  - Fare: ₹368
  - Status: "completed" (green badge)
  - Date: Today's date
- [ ] Status badge should be color-coded:
  - Green for completed
  - Orange for started
  - Blue for pending
  - Red for cancelled

---

## 🎯 End-to-End Flow Test

This is the complete flow from customer booking to ride completion:

### Customer: Create Booking
1. Open `/book-ride-enhanced`
2. Select "One Way"
3. Enter pickup: "MG Road, Bangalore"
4. Enter dropoff: "Koramangala, Bangalore"
5. Select "Ride Now"
6. Select "For Myself"
7. Choose "Sedan" vehicle
8. View fare breakdown (₹368)
9. Check "AC Preferred"
10. Click "Book Ride"
11. **Note the 4-digit OTP** (e.g., "3847")

### Driver: Accept & Verify
1. Open `/rides-enhanced`
2. See new ride with all details
3. Click "Accept"
4. See OTP required status
5. Click "Verify OTP"
6. Enter customer's OTP (e.g., "3847")
7. Click "Verify & Enable Start"
8. See "OTP Verified" success
9. See "Start Ride" button enabled

### Driver: Start Ride
1. Click "Start Ride"
2. See "Ride started!" success
3. See "Complete Ride" button

### Driver: Complete Ride
1. Click "Complete Ride"
2. Confirm in dialog
3. See "Ride completed!" success
4. Ride disappears from active

### Admin: View Analytics
1. Open admin panel
2. See stats updated (1 completed ride, ₹368 revenue)
3. Check "Recent Rides" - see completed ride
4. Check charts - see data for "One Way" and "Sedan"

**✅ Complete flow test passed!**

---

## 🐛 Bug Testing

### Negative Test Cases

#### Customer App
- [ ] Try booking without authentication
- [ ] Try booking without selecting trip type
- [ ] Try booking without locations
- [ ] Try booking without vehicle
- [ ] Try scheduling in the past
- [ ] Try invalid phone numbers for passenger

#### Driver App
- [ ] Try starting ride without OTP verification
- [ ] Try entering 3-digit OTP (should be blocked)
- [ ] Try entering 5-digit OTP (should be blocked)
- [ ] Try entering letters in OTP field (should be blocked)
- [ ] Try wrong OTP 3 times
- [ ] Try accepting already accepted ride

#### API Tests
- [ ] Try accessing admin endpoints without admin role
- [ ] Try verifying OTP for wrong ride
- [ ] Try completing non-started ride
- [ ] Try creating booking with negative fare
- [ ] Try creating vehicle category with duplicate name

---

## 📊 Performance Testing

- [ ] Load 100+ rides in database
- [ ] Check admin panel loads smoothly
- [ ] Check recent rides table performance
- [ ] Check driver app with 50+ available rides
- [ ] Check auto-refresh doesn't cause lag

---

## 🔒 Security Testing

- [ ] Verify OTP is different for each booking
- [ ] Verify OTP cannot be reused
- [ ] Verify driver cannot start ride without OTP
- [ ] Verify customer cannot see other users' rides
- [ ] Verify driver cannot see other drivers' rides
- [ ] Verify admin endpoints require admin role

---

## 📱 UI/UX Testing

### Responsiveness
- [ ] Test customer app on small screen (iPhone SE size)
- [ ] Test customer app on large screen (iPad)
- [ ] Test driver app on different screen sizes
- [ ] Test admin panel on mobile browser
- [ ] Test admin panel on desktop

### Accessibility
- [ ] All buttons have clear labels
- [ ] All inputs have placeholders
- [ ] Error messages are readable
- [ ] Success messages are noticeable
- [ ] Color contrast is sufficient

### Loading States
- [ ] Customer booking shows loading during API call
- [ ] Driver rides show loading on refresh
- [ ] Admin charts show "Loading..." initially
- [ ] All loading states have clear indicators

---

## ✅ Feature Coverage Summary

| Feature | Backend | Customer | Driver | Admin | Status |
|---------|---------|----------|--------|-------|--------|
| Trip Types (6) | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Vehicle Categories (4) | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Fare Breakdown (7) | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Ride OTP | ✅ | ✅ | ✅ | N/A | **Complete** |
| OTP Verification | ✅ | N/A | ✅ | N/A | **Complete** |
| Ride Scheduling | ✅ | ✅ | ✅ | N/A | **Complete** |
| Proxy Booking | ✅ | ✅ | ✅ | N/A | **Complete** |
| Preferences (5) | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Multiple Stops | ✅ | ⏳ | ✅ | N/A | **90%** |
| Driver Notes | ✅ | ✅ | ✅ | N/A | **Complete** |
| Saved Places | ✅ | ⏳ | N/A | N/A | **90%** |
| Distance/ETA | ✅ | ✅ | ✅ | N/A | **Complete** |
| Admin Analytics | ✅ | N/A | N/A | ✅ | **Complete** |
| Admin Dashboard | ✅ | N/A | N/A | ✅ | **Complete** |

**Overall: 98% Complete** ✅

---

## 📝 Test Results Log

Use this template to log your test results:

```
Test Date: _______________
Tester: _______________

Backend API Tests: ☐ Pass ☐ Fail
Notes: ________________________________

Customer App Tests: ☐ Pass ☐ Fail
Notes: ________________________________

Driver App Tests: ☐ Pass ☐ Fail
Notes: ________________________________

Admin Panel Tests: ☐ Pass ☐ Fail
Notes: ________________________________

End-to-End Flow: ☐ Pass ☐ Fail
Notes: ________________________________

Bugs Found:
1. ________________________________
2. ________________________________
3. ________________________________
```

---

## 🎉 Success Criteria

All tests pass when:
- ✅ All backend APIs return correct responses
- ✅ Customer can complete full booking flow
- ✅ Driver can accept, verify OTP, and complete ride
- ✅ Admin can view all analytics and manage vehicles
- ✅ OTP verification works correctly
- ✅ No critical bugs found
- ✅ UI is responsive and user-friendly

---

**Happy Testing! 🚀**
