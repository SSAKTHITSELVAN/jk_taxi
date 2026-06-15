# 🗺️ Mapbox Integration - Visual Guide

## What the Customer Will See

### 1️⃣ Home Screen (Map View)

```
┌─────────────────────────────────────────┐
│  ☰  📍 Current Location         🔔      │  ← Top Bar (floating)
└─────────────────────────────────────────┘
│                                         │
│              🗺️  MAP                   │
│         (Full Screen)                   │
│                                         │
│            📍 You are here             │
│                                         │
│                                         │
│                                  ( 📍 ) │  ← Center Location Button
│                                         │
┌─────────────────────────────────────────┐
│  🎯 Where to?                          │  ← Bottom Card (rounded)
│  ┌─────────────────────────────────┐  │
│  │ 🔍  Search destination          │  │  ← Search Box
│  └─────────────────────────────────┘  │
│                                         │
│  ⏰ Ride Later  🔄 Round Trip  📦 Pkg  │  ← Quick Actions
└─────────────────────────────────────────┘
```

**Features:**
- Full-screen interactive map
- Your location as blue dot with pulse
- Floating top bar (doesn't block map)
- Rounded bottom card (Rapido-style)
- Quick action buttons

---

### 2️⃣ Side Menu (Slide from Left)

```
┌──────────────────────────────┐
│                              │
│  👤 Sakthi Selvan       ✕   │  ← User Info + Close
│     9876543210               │
│                              │
│  ┌────────────────────────┐ │
│  │ 🛡️  Your Ride OTP      │ │  ← OTP Card
│  │                         │ │
│  │      1  2  3  4         │ │  ← Big OTP Display
│  └────────────────────────┘ │
│                              │
│  💳  Payment Methods         │
│  🎁  Offers & Promos         │
│  ❓  Help & Support          │
│  ⚙️   Settings               │
│                              │
└──────────────────────────────┘
```

**Features:**
- Slides in smoothly
- Shows user name and phone
- Prominent OTP display
- Menu options
- Close button (X)

---

### 3️⃣ Booking Step 1: Location Search

```
┌─────────────────────────────────────────┐
│  ←  Choose Location                     │
└─────────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ 📍  Enter pickup location           │
  └─────────────────────────────────────┘
    ↓ Autocomplete Dropdown
  ┌─────────────────────────────────────┐
  │ 📍 MG Road, Bangalore               │
  │ 📍 MG Road Metro Station            │
  │ 📍 MG Road Shopping Complex         │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ 🎯  Enter dropoff location          │
  └─────────────────────────────────────┘
    ↓ Autocomplete Dropdown
  ┌─────────────────────────────────────┐
  │ 📍 Koramangala, Bangalore           │
  │ 📍 Koramangala 5th Block            │
  │ 📍 Koramangala BDA Complex          │
  └─────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│         🗺️  ROUTE MAP                  │
│                                         │
│      📍 ────────────► 🎯               │
│    (Pickup)        (Dropoff)           │
│                                         │
└─────────────────────────────────────────┘

       [ Continue ] ← Button
```

**Features:**
- Smart autocomplete
- Real-time suggestions
- Map shows route
- Green dot = Pickup
- Red dot = Dropoff
- Blue line = Route

---

### 4️⃣ Booking Step 2: Vehicle Selection

```
┌─────────────────────────────────────────┐
│  ←  Select Vehicle                      │
└─────────────────────────────────────────┘

┌───── Small Map Preview ─────────────────┐
│   📍 ────────► 🎯                      │
│   MG Road → Koramangala                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🚗  Mini              ₹230             │  ← Selected (Blue border)
│  4 seats • Affordable rides             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🚙  Sedan             ₹368             │
│  4 seats • Comfortable sedans            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🚐  SUV               ₹550             │
│  6-7 seats • Spacious SUVs              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🏎️  Premium           ₹720             │
│  4 seats • Luxury experience             │
└─────────────────────────────────────────┘

┌──── Fare Breakdown ─────────────────────┐
│  Base Fare                      ₹50     │
│  Distance (6.3 km)              ₹180    │
│  ───────────────────────────────────    │
│  Total                          ₹230    │
└─────────────────────────────────────────┘

       [ Book Ride ] ← Button
```

**Features:**
- Small map at top
- Vehicle cards with icons
- Real-time pricing
- Selected card highlighted
- Detailed fare breakdown
- One-tap booking

---

### 5️⃣ Active Ride (on Home Screen)

```
┌─────────────────────────────────────────┐
│  ☰  📍 Current Location         🔔      │
└─────────────────────────────────────────┘
│                                         │
│              🗺️  MAP                   │
│                                         │
│         📍 You (Customer)              │
│              ↓                          │
│         🚗 Driver (moving)             │
│              ↓                          │
│         🎯 Destination                 │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🚗 Your Ride    ACCEPTED       →      │  ← Tap to view details
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Map shows driver location (future)
- Active ride banner
- Status indicator
- Tap to view details

---

## 🎨 Color Coding

| Element | Color | Meaning |
|---------|-------|---------|
| 📍 Blue Dot | `#4285F4` | Your location |
| 📍 Green | `#2ECC71` | Pickup point |
| 🎯 Red | `#E74C3C` | Dropoff point |
| ─── Blue Line | `#4285F4` | Route |
| Selected Card | Light Blue | Active selection |
| OTP Card | Light Green | Important info |

---

## 🔄 User Flow

```
1. Open App
   ↓
2. See Map Home Screen
   ↓
3. Tap "Where to?" or Search
   ↓
4. Type pickup location
   ↓
5. Select from dropdown
   ↓
6. Type dropoff location
   ↓
7. Select from dropdown
   ↓
8. See route on map
   ↓
9. Tap "Continue"
   ↓
10. See vehicle options
   ↓
11. Select vehicle (Mini/Sedan/SUV/Premium)
   ↓
12. See fare breakdown
   ↓
13. Tap "Book Ride"
   ↓
14. Ride booked! ✅
   ↓
15. See active ride on map
```

**Time**: ~30 seconds for full booking

---

## 📱 Gestures

| Gesture | Action |
|---------|--------|
| Tap | Select location from dropdown |
| Tap | Select vehicle |
| Swipe Right | Open side menu |
| Tap Outside | Close menu |
| Pinch | Zoom map |
| Drag | Pan map |
| Tap Center Button | Center on your location |

---

## 🎯 Key Differences from Old UI

### Old (List-Based):
- ❌ No map on home
- ❌ Manual location entry
- ❌ No route preview
- ❌ Text-only vehicle list
- ❌ Basic UI

### New (Map-Based):
- ✅ Full-screen map
- ✅ Smart location search
- ✅ Visual route display
- ✅ Rich vehicle cards
- ✅ Rapido-style UI

---

## 🌟 Special Features

### 1. Live Location Tracking
Your location updates in real-time as you move.

### 2. Smart Search
- Biased to your city (Bangalore)
- Shows nearby results first
- India-only results

### 3. Auto-Fit Map
Map automatically zooms to show full route.

### 4. Fare Calculation
Real-time pricing based on:
- Distance
- Vehicle type
- Time of day (future)

### 5. OTP in Menu
Your ride OTP is always accessible in the side menu.

---

## ✅ What Works Now

- ✅ Map displays correctly
- ✅ User location tracking
- ✅ Location search with autocomplete
- ✅ Route visualization
- ✅ Vehicle selection
- ✅ Fare calculation
- ✅ Ride booking
- ✅ Side menu with OTP
- ✅ Active ride detection

---

## 🚀 Ready to Test!

Just run:
```bash
./START_CUSTOMER_MAP.sh
```

Or manually:
```bash
cd app/customer
npm start
```

Then scan the QR code with Expo Go app!

---

**Design inspired by**: Rapido, Uber  
**Map provider**: Mapbox  
**Status**: Production Ready ✅
