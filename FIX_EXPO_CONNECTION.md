# Fix Expo Go App Connection Issue

**Problem:** Browser can access API, but Expo Go apps show "Login failed"  
**Status:** Browser works ✅, Apps don't work ❌

This means network is fine, but app cache/config needs fixing.

---

## 🔧 Complete Fix Steps

### Step 1: Kill ALL Metro Bundlers

```bash
# Kill any running Metro processes
pkill -f "react-native" || true
pkill -f "metro" || true

# Verify they're gone
ps aux | grep metro
```

---

### Step 2: Clear ALL Caches

```bash
# Customer App
cd /home/sakthi-selvan/jk_taxi/app/customer
rm -rf node_modules/.cache
rm -rf .expo
rm -rf dist

# Driver App
cd /home/sakthi-selvan/jk_taxi/app/driver
rm -rf node_modules/.cache
rm -rf .expo
rm -rf dist
```

---

### Step 3: On Your Phone - Clear Expo Go Cache

**Method 1 (Recommended):**
1. Open Expo Go app
2. Shake phone (or use 3-finger touch on iOS)
3. Tap "Clear cache and restart"
4. OR go to Settings in Expo Go
5. Clear all project data

**Method 2:**
1. Close Expo Go completely (force close)
2. Clear app data (Settings → Apps → Expo Go → Clear Data)
3. Open Expo Go again

---

### Step 4: Start Apps Fresh

**Terminal 1 - Customer App:**
```bash
cd /home/sakthi-selvan/jk_taxi/app/customer
npm start --clear
# When it says "Metro waiting", press 'r' to reload
```

**Terminal 2 - Driver App:**
```bash
cd /home/sakthi-selvan/jk_taxi/app/driver
npm start --clear
# When it says "Metro waiting", press 'r' to reload
```

**Key:** Use `--clear` not `--reset-cache`

---

### Step 5: Scan QR Code Again

1. In Expo Go, scan the NEW QR code
2. Wait for app to build and load
3. Try login

---

## 🐛 If Still Not Working - Add Debug Logging

Let me add detailed logging to see what's happening.

---

## 📝 Summary

Browser works = Network is fine ✅  
Apps don't work = Cache/config issue ❌

**Do this in order:**
1. Kill all Metro processes
2. Delete cache folders
3. Clear Expo Go cache on phone
4. Start apps with `--clear` flag
5. Scan QR code fresh
6. Try login

**Should work after this!**
