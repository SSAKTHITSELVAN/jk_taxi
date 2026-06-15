# 🧪 Customer App - Testing Guide

**All improvements ready for testing!**

---

## 🚀 Start the App

```bash
cd /home/sakthi-selvan/jk_taxi/app/customer
npm start
```

**If already running:** Press `r` in terminal to reload

---

## ✅ Test Checklist

### 1. Location Permission ✅

**On App Launch:**
- [ ] Alert appears: "Location Permission Required"
- [ ] Two buttons: "Cancel" and "Enable"

**If Allow:**
- [ ] Map shows your actual location
- [ ] Blue marker on your position
- [ ] Location name in floating card (e.g., "New York")

**If Deny:**
- [ ] Map shows default Bangalore location
- [ ] Location card shows "Bangalore"
- [ ] App still works normally

---

### 2. Home Screen Map ✅

- [ ] Real Google Maps visible (not grid)
- [ ] Can zoom in/out
- [ ] Can pan around
- [ ] Smooth performance
- [ ] User location marker (if permission granted)

---

### 3. Floating Location Card ✅

**Visual:**
- [ ] Card has rounded corners
- [ ] Shadow visible below card
- [ ] Margin from screen edges
- [ ] White background

**Content:**
- [ ] Hamburger icon (☰) on left
- [ ] Location icon + name in center
- [ ] Notification bell (🔔) on right

**Test:**
- [ ] Tap hamburger → Drawer opens
- [ ] Tap bell → Works (placeholder)

---

### 4. Side Drawer Menu ✅

**Open Drawer:**
- [ ] Tap hamburger icon
- [ ] Drawer slides from left
- [ ] Smooth animation

**Header:**
- [ ] User avatar with initial
- [ ] User name
- [ ] Phone number
- [ ] Close button (✕)

**OTP Card (if exists):**
- [ ] Light blue background (#E3F2FD)
- [ ] Blue border and shield icon
- [ ] White dashed box around digits
- [ ] Large 4-digit OTP (48px font)
- [ ] Wide spacing between digits
- [ ] Info icon with text below

**Menu Items:**
- [ ] Home (with home icon)
- [ ] My Rides (with list icon)
- [ ] Profile (with person icon)
- [ ] **NO "OTHER" section**
- [ ] Logout button (red, at bottom)

**Test Navigation:**
- [ ] Tap Home → Navigate to home
- [ ] Tap My Rides → Navigate to rides
- [ ] Tap Profile → Navigate to profile
- [ ] Tap Logout → Confirmation dialog appears

**Close Drawer:**
- [ ] Tap close (✕) → Closes completely
- [ ] Tap overlay → Closes completely
- [ ] No visible edge remaining

---

### 5. Bottom Card ✅

**Text Visibility:**
- [ ] "Where to?" → Black, bold, large
- [ ] Search icon → Black, 22px
- [ ] "Search destination" → Dark gray, readable

**Search Box:**
- [ ] White background
- [ ] Light gray border
- [ ] Good padding
- [ ] Rounded corners

**Quick Actions:**
- [ ] Three buttons in a row
- [ ] "Ride Later", "Round Trip", "Package"
- [ ] Icons on purple background
- [ ] White icon color
- [ ] Shadow effect on icons
- [ ] Black text labels below
- [ ] All labels clearly visible

**Test:**
- [ ] Tap search box → Opens booking
- [ ] Tap "Ride Later" → Opens booking
- [ ] Tap "Round Trip" → Opens booking
- [ ] Tap "Package" → Opens booking

---

### 6. My Rides Screen ✅

**Header:**
- [ ] Hamburger icon on left
- [ ] "My Rides" title centered
- [ ] White background with shadow

**Test:**
- [ ] Tap hamburger → Drawer opens
- [ ] Drawer shows same menu
- [ ] Navigation works

---

### 7. Profile Screen ✅

**Header:**
- [ ] Hamburger icon on left
- [ ] "Profile" title centered
- [ ] White background with shadow

**Test:**
- [ ] Tap hamburger → Drawer opens
- [ ] Drawer shows same menu
- [ ] Navigation works

---

### 8. Booking Flow - Location Step ✅

**Open Booking:**
- [ ] Tap "Search destination"
- [ ] Booking screen appears

**Header:**
- [ ] Back arrow on left
- [ ] "Book Your Ride" title
- [ ] White background

**Progress Bar:**
- [ ] 5 dots showing steps
- [ ] First dot filled (purple)
- [ ] Other dots empty (gray)

**Location Inputs:**
- [ ] Two input fields
- [ ] Pickup: "Enter pickup location"
- [ ] Dropoff: "Enter dropoff location"
- [ ] Dots between inputs

**Test Inputs:**
- [ ] Enter pickup: "MG Road"
- [ ] Select from dropdown
- [ ] Enter dropoff: "Koramangala"
- [ ] Select from dropdown

**Map Preview:**
- [ ] Real Google Maps appears
- [ ] Green marker at pickup
- [ ] Red marker at dropoff
- [ ] Purple line connecting them
- [ ] Map auto-zooms to show both

**Continue Button:**
- [ ] Disabled (gray) before locations set
- [ ] Enabled (purple) after both set
- [ ] Tap Continue → Next step

---

### 9. Booking Flow - All Steps ✅

**Step 2: Trip Type**
- [ ] 6 colorful cards in grid
- [ ] One Way, Round Trip, Rental, Outstation, Airport Pickup, Airport Drop
- [ ] Select one → Border highlights
- [ ] Checkmark appears
- [ ] All text black and visible

**Step 3: Vehicle**
- [ ] 4 vehicle cards
- [ ] Color borders (Mini=green, Sedan=blue, SUV=orange, Premium=purple)
- [ ] Select one → Background changes
- [ ] Fare calculates and displays
- [ ] Fare breakdown card appears
- [ ] All text black and readable

**Step 4: Details**
- [ ] Schedule toggle
- [ ] Booking for toggle
- [ ] Driver notes textarea
- [ ] 5 preference chips
- [ ] All text black
- [ ] Inputs white background

**Step 5: Confirm**
- [ ] Complete summary
- [ ] All details shown
- [ ] Total fare large and prominent
- [ ] Green "Confirm & Book" button

**Test Complete Flow:**
- [ ] Go through all 5 steps
- [ ] Tap Confirm & Book
- [ ] Success alert with OTP
- [ ] Options: "View Rides" or "Book Another"

---

## 🎯 Key Things to Verify

### Contrast & Visibility
- [ ] All text readable
- [ ] No light gray on white
- [ ] All labels black or dark gray
- [ ] Inputs have clear borders
- [ ] Icons visible

### Navigation
- [ ] Hamburger on Home, Rides, Profile
- [ ] All menu items work
- [ ] Back navigation works
- [ ] Drawer closes completely

### Maps
- [ ] Real Google Maps on home
- [ ] Real Google Maps in booking
- [ ] Markers show correctly
- [ ] Polyline connects locations
- [ ] Interactive (zoom, pan)

### Location
- [ ] Permission requested
- [ ] Current location used if granted
- [ ] Default location if denied
- [ ] Can still book rides

### Buttons
- [ ] Continue disabled until valid
- [ ] Visual feedback on press
- [ ] Loading states work
- [ ] Success/error alerts show

---

## 🐛 Common Issues

### "Location Permission" not showing
- Clear app data and reinstall
- Or manually request in Settings → App → Permissions

### Map not loading
- Check internet connection
- Reload app (press 'r')
- Clear cache: `npm start -- --clear`

### Drawer edge still visible
- Already fixed (closes at -320px)
- Reload app to see fix

### Text still light colored
- Already fixed (all text black)
- Reload app to see fix

### OTP still green
- Already fixed (now blue theme)
- Reload app to see fix

---

## 📊 Expected Results

### Home Screen
```
┌─────────────────────────────────┐
│  ╭───────────────────────────╮  │ ← Floating card
│  │ ☰  Bangalore  🔔          │  │
│  ╰───────────────────────────╯  │
│                                 │
│                                 │
│        [Google Maps]            │
│           🔵 You                │
│                                 │
│                                 │
├─────────────────────────────────┤
│ Where to?                       │
│ ┌─────────────────────────────┐ │
│ │ 🔍 Search destination       │ │
│ └─────────────────────────────┘ │
│                                 │
│  ⏰        🔄         📦        │
│  Ride      Round     Package    │
│  Later     Trip                  │
└─────────────────────────────────┘
```

### Side Menu
```
┌────────────────────┐
│ 🔵 John Doe   ✕   │ ← Blue header
│    9876543210      │
│                    │
│ ┌────────────────┐ │
│ │ 🛡️ YOUR RIDE   │ │ ← Blue theme
│ │ ┌────────────┐ │ │
│ │ │ 1  2  3  4 │ │ │ ← Dashed border
│ │ └────────────┘ │ │
│ │ ℹ️  Share with │ │
│ │    driver      │ │
│ └────────────────┘ │
│                    │
│ 🏠 Home          → │
│ 📋 My Rides      → │
│ 👤 Profile       → │
│                    │
│ ┌────────────────┐ │
│ │ 🚪 Logout      │ │ ← Red
│ └────────────────┘ │
└────────────────────┘
```

### Booking Map
```
┌────────────────────┐
│  ← Book Your Ride  │
├────────────────────┤
│ ● ● ○ ○ ○         │ ← Progress
├────────────────────┤
│ 📍 Pickup          │
│ ⋮                  │
│ 📍 Dropoff         │
│                    │
│ ┌────────────────┐ │
│ │ [Google Maps]  │ │
│ │  📍 Green      │ │ ← Real map
│ │  ═══════       │ │
│ │      📍 Red    │ │
│ └────────────────┘ │
│                    │
│ [Continue]         │
└────────────────────┘
```

---

## ✅ Success Criteria

**All these should be true:**
1. ✅ Google Maps visible on home
2. ✅ Location permission requested
3. ✅ Floating card with rounded corners
4. ✅ Blue OTP design
5. ✅ No OTHER section in menu
6. ✅ Black text everywhere
7. ✅ Hamburger on Rides/Profile
8. ✅ Real map in booking
9. ✅ Continue enabled only after locations
10. ✅ All text readable

---

## 🎉 Final Check

**Quick 30-second test:**
1. Open app → Permission alert
2. Allow → See real location
3. Open menu → Blue OTP, no OTHER
4. Close menu → Closes completely
5. Bottom text → All black and visible
6. Tap search → Booking opens
7. Enter locations → Real map appears
8. Continue → Only enabled with locations

**If all pass → Ready for production!** 🚀

---

## 📞 Commands

```bash
# Start
npm start

# Reload
Press 'r'

# Clear cache
npm start -- --clear

# Backend check
curl http://localhost:8000/health
```

**Happy Testing!** 🎊
