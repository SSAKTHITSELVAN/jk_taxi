# 🚀 How to Run Customer App with Mapbox

## ✅ Current Status

- **Metro Bundler**: ✅ Running on http://localhost:8081
- **Mapbox Integration**: ✅ Complete
- **Location Permissions**: ✅ Configured
- **API Key**: ✅ Set

---

## 📱 Test on Your Phone

### Step 1: Install Expo Go App

**Android**: 
```
https://play.google.com/store/apps/details?id=host.exp.exponent
```

**iOS**:
```
https://apps.apple.com/app/expo-go/id982107779
```

### Step 2: View the QR Code

The app is already running! Check your terminal for the QR code, or:

```bash
# If you need to see the QR code again
cd /home/sakthi-selvan/jk_taxi/app/customer
npm start
```

The terminal will show something like:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or Camera app (iOS)

┌─────────────────────────┐
│ ████ ▄▄▄▄▄ █ ▀ ▄ ████  │
│ ████ █   █ █▄█ ▀ ████  │
│ ████ █▄▄▄█ █ █▄█ ████  │
└─────────────────────────┘
```

### Step 3: Scan QR Code

**Android (Expo Go)**:
1. Open Expo Go app
2. Tap "Scan QR code"
3. Point camera at QR code in terminal

**iOS (Camera)**:
1. Open Camera app
2. Point at QR code
3. Tap notification that appears
4. Will open in Expo Go

### Step 4: Grant Permissions

When the app opens, you'll see:
```
"JK Taxi" Would Like to Access Your Location
```

**Tap "Allow While Using App"** ✅

### Step 5: See the Map! 🗺️

You should now see:
- Full-screen Mapbox map
- Your location (blue dot)
- "Where to?" search box at bottom
- Menu icon (☰) at top left

---

## 🎯 Quick Test Flow (30 seconds)

1. ✅ See map home screen
2. ✅ Tap "Where to?" button
3. ✅ Type "MG Road" in pickup
4. ✅ Select from dropdown
5. ✅ Type "Koramangala" in dropoff
6. ✅ Select from dropdown
7. ✅ Tap "Continue"
8. ✅ Select vehicle (Mini/Sedan/SUV)
9. ✅ Tap "Book Ride"
10. ✅ Success! 🎉

---

## 🔧 Commands Reference

### Start the App
```bash
cd /home/sakthi-selvan/jk_taxi/app/customer
npm start
```

### Start with Clear Cache
```bash
cd /home/sakthi-selvan/jk_taxi/app/customer
npm start -- --clear
```

### Reload App (in terminal)
Press `r` to reload

### Open Developer Menu (on phone)
- **Android**: Shake device
- **iOS**: Shake device or press Cmd+D (simulator)

### Stop the App
Press `Ctrl+C` in terminal

---

## ⚠️ If You See Errors

### Error: "Cannot find module 'dev'"
**Wrong command!** Use:
```bash
npm start          # ✅ Correct
# NOT: npx run dev  # ❌ Wrong
```

### Error: "Network response timed out"
**Solution**: Make sure phone and computer are on same WiFi
```bash
# Check your computer's IP
hostname -I
```

### Error: "Location permission denied"
**Solution**: Grant permissions
1. Phone Settings → Apps → Expo Go
2. Permissions → Location → Allow

### Error: Map shows blank
**Solution**: 
1. Check internet connection
2. Restart app (press `r` in terminal)
3. Clear cache: `npm start -- --clear`

### Warning: Package version mismatch
**It's OK!** The app will still work. These are just recommendations.

---

## 🗺️ What You'll See

### Home Screen
```
┌──────────────────────────────┐
│ ☰  📍 Current Location   🔔  │ ← Top bar (floating)
└──────────────────────────────┘
│                              │
│       🗺️ INTERACTIVE MAP     │
│                              │
│         📍 (You are here)    │
│                              │
│                              │
│                       ( 📍 ) │ ← Center button
│                              │
┌──────────────────────────────┐
│ 🎯 Where to?                 │
│ ┌──────────────────────────┐ │
│ │ 🔍 Search destination    │ │
│ └──────────────────────────┘ │
│                              │
│ ⏰ Ride    🔄 Round   📦 Pkg │
│    Later     Trip             │
└──────────────────────────────┘
```

### Side Menu (Tap ☰)
```
┌────────────────────────┐
│                        │
│ 👤 Your Name      ✕   │
│    9876543210          │
│                        │
│ ┌────────────────────┐ │
│ │ 🛡️ Your Ride OTP   │ │
│ │                    │ │
│ │    1  2  3  4      │ │ ← Your permanent OTP
│ └────────────────────┘ │
│                        │
│ 💳 Payment Methods     │
│ 🎁 Offers & Promos     │
│ ❓ Help & Support      │
└────────────────────────┘
```

---

## 🎨 Key Features

### ✅ Implemented
- Full-screen Mapbox map
- Real-time location tracking
- Location search with autocomplete
- Visual route display
- Vehicle selection (4 types)
- Real-time fare calculation
- One-tap booking
- Side drawer menu
- Permanent OTP display

### 🔜 Coming Soon
- Nearby driver markers
- Real-time driver tracking
- Turn-by-turn navigation
- Traffic-aware routing

---

## 📊 Performance Tips

### For Best Performance:
1. **Use WiFi** instead of mobile data for development
2. **Close other apps** on phone
3. **Clear cache** if app feels slow: `npm start -- --clear`
4. **Restart** if map doesn't load

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| QR code not scanning | Use manual connection: `exp://YOUR_IP:8081` |
| App crashes on open | Restart Metro: Ctrl+C → `npm start` |
| Map is blank | Check internet, restart app |
| Location not working | Grant permissions in phone settings |
| Can't search locations | Check internet connection |
| Fare not calculating | Backend must be running on port 8000 |

---

## ✅ Pre-Flight Checklist

Before testing, make sure:

- [ ] Backend is running: `http://localhost:8000/health`
- [ ] Metro bundler is running (this terminal)
- [ ] Phone on same WiFi as computer
- [ ] Expo Go app installed on phone
- [ ] Location services enabled on phone

---

## 🎉 Success Indicators

You'll know it's working when you see:

1. ✅ Full map on home screen
2. ✅ Blue dot showing your location
3. ✅ Can drag/zoom map smoothly
4. ✅ Menu opens with your OTP
5. ✅ Search shows suggestions
6. ✅ Route appears on map
7. ✅ Fare calculates correctly
8. ✅ Booking succeeds

---

## 🔗 Useful Links

- **Expo Go**: https://expo.dev/go
- **Mapbox Docs**: https://docs.mapbox.com/
- **React Native Maps**: https://github.com/rnmapbox/maps

---

## 📞 Quick Commands

```bash
# Start app
npm start

# Start with cache clear
npm start -- --clear

# Reload app
# Press 'r' in terminal

# Open dev menu on phone
# Shake device

# Stop app
# Press Ctrl+C
```

---

## ✨ Status

- **Metro Bundler**: ✅ Running
- **Backend**: Check `http://localhost:8000/health`
- **Mapbox**: ✅ Configured
- **Ready**: ✅ YES!

**Next Step**: Scan the QR code and test! 📱

---

**Made with 💙 by Claude Code**  
**Integration Date**: May 22, 2026
