# API Connection Troubleshooting Guide - Expo Go

**Issue:** "Login failed" or network errors when using Expo Go on phone  
**Date:** 2026-05-20  
**Status:** ✅ SOLUTION PROVIDED

---

## 🔍 Problem Analysis

When using **Expo Go on a physical phone**, you need to ensure:
1. ✅ Backend is running and accessible
2. ✅ Phone and computer are on the same network
3. ✅ Correct IP address is configured
4. ✅ Firewall is not blocking connections
5. ✅ Backend is listening on `0.0.0.0` (not just `127.0.0.1`)

---

## ✅ Your Current Status

**Backend Status:**
- ✅ Running on port 8000
- ✅ Health endpoint accessible
- ✅ Listening on `0.0.0.0:8000` (accepts external connections)

**Your Local IP:**
- ✅ `10.40.122.233`

**Configuration:**
- ✅ Customer app: Configured correctly (`http://10.40.122.233:8000`)
- ✅ Driver app: **NOW FIXED** (was `localhost`, changed to `10.40.122.233`)

---

## 🔧 Step-by-Step Fix

### Step 1: Verify Backend is Running

```bash
# Check if backend is running
ps aux | grep uvicorn

# Test from terminal
curl http://10.40.122.233:8000/health

# Expected: {"status":"healthy","app":"JK Taxi API"}
```

✅ **Your backend is running correctly!**

---

### Step 2: Update Driver App Config (FIXED)

**File:** `app/driver/src/config.ts`

**Changed from:**
```typescript
BASE_URL: 'http://localhost:8000',
```

**Changed to:**
```typescript
BASE_URL: 'http://10.40.122.233:8000',
```

✅ **Driver app config is now fixed!**

---

### Step 3: Ensure Backend Accepts External Connections

Your backend should start with:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Key:** `--host 0.0.0.0` allows connections from other devices on the network.

✅ **Your backend is already configured correctly!**

---

### Step 4: Check Firewall (if still having issues)

If you're still having connection issues, the firewall might be blocking:

**Ubuntu/Linux:**
```bash
# Check if firewall is active
sudo ufw status

# If active, allow port 8000
sudo ufw allow 8000

# Or temporarily disable (for testing only!)
sudo ufw disable
```

**Windows:**
```powershell
# Allow port 8000 through Windows Firewall
netsh advfirewall firewall add rule name="FastAPI 8000" dir=in action=allow protocol=TCP localport=8000
```

---

## 📱 Testing the Connection

### From Your Phone (using browser):

1. Open phone browser
2. Go to: `http://10.40.122.233:8000/docs`
3. You should see the Swagger API documentation

**If this works:** Apps should work too!  
**If this doesn't work:** Check firewall/network

---

### Test API Endpoints:

**Health Check:**
```
http://10.40.122.233:8000/health
```

**API Docs:**
```
http://10.40.122.233:8000/docs
```

---

## 🔄 Restart Apps After Config Change

After changing the config, you need to **restart the Metro bundler**:

### Customer App:
```bash
cd app/customer
# Stop Metro (Ctrl+C if running)
# Clear cache and restart
npm start -- --reset-cache
```

### Driver App:
```bash
cd app/driver
# Stop Metro (Ctrl+C if running)
# Clear cache and restart
npm start -- --reset-cache
```

**OR** in Expo Go, shake phone → Reload app

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network request failed"

**Cause:** Phone can't reach the IP address

**Solutions:**
1. Verify phone and computer on same WiFi
2. Check IP address: `ip addr` or `ifconfig`
3. Update config if IP changed
4. Check firewall settings

---

### Issue 2: "Login failed" but no other error

**Cause:** API might be reachable, but wrong credentials or API error

**Test:**
```bash
# Test login endpoint from terminal
curl -X POST http://10.40.122.233:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","password":"password123"}'
```

**Expected:** Should return tokens

**If fails:** Check backend logs for actual error

---

### Issue 3: Connection works sometimes but not always

**Cause:** IP address changed (DHCP)

**Solutions:**
1. Set static IP on your computer
2. Or check IP each time: `ip addr show wlo1 | grep inet`
3. Update config files if IP changed

---

### Issue 4: Works on WiFi but not mobile data

**Cause:** Apps need to be on same network as backend

**Solution:**
- Use same WiFi for phone and computer
- OR deploy backend to public server
- OR use ngrok (tunneling service)

---

## 🔍 Debug Mode

Add logging to see what's happening:

### In `app/customer/src/api/client.ts`:

```typescript
// Add this inside constructor, after creating client
this.client.interceptors.request.use(
  async (config) => {
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📍 Base URL:', config.baseURL);
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Update response interceptor
this.client.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ API Error:', error.message);
    console.error('📍 URL:', error.config?.url);
    console.error('📝 Response:', error.response?.data);
    // ... rest of error handling
  }
);
```

This will show exactly what's being called in the console.

---

## ✅ Quick Fix Checklist

Run through this checklist:

- [x] Backend running: `ps aux | grep uvicorn` ✅
- [x] Backend accessible: `curl http://10.40.122.233:8000/health` ✅
- [x] Backend on `0.0.0.0`: Check uvicorn command ✅
- [x] Customer app config: `http://10.40.122.233:8000` ✅
- [x] Driver app config: `http://10.40.122.233:8000` ✅ (JUST FIXED)
- [ ] Phone on same WiFi as computer
- [ ] Firewall allows port 8000
- [ ] Apps restarted with cache clear
- [ ] Can access `http://10.40.122.233:8000/docs` from phone browser

---

## 🧪 Test Credentials

Once connection works, test with:

**Customer App:**
- Phone: `9876543210`
- Password: `password123`

**Driver App:**
- Phone: `1111111111`
- Password: `driver123`

**OTP (when asked):**
- Always: `123456`

---

## 🚀 Quick Start Commands

**Terminal 1 - Backend:**
```bash
cd /home/sakthi-selvan/jk_taxi/backend
source ~/billion/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Customer App:**
```bash
cd /home/sakthi-selvan/jk_taxi/app/customer
npm start -- --reset-cache
```

**Terminal 3 - Driver App:**
```bash
cd /home/sakthi-selvan/jk_taxi/app/driver
npm start -- --reset-cache
```

---

## 📱 On Your Phone

1. Open Expo Go app
2. Scan QR code from terminal
3. Wait for app to load
4. Try login with test credentials

**If "Login failed":**
1. Check phone browser can access `http://10.40.122.233:8000/docs`
2. If browser works but app doesn't, restart app with cache clear
3. Check Expo Go console logs (shake phone → Show Dev Menu → Debug Remote JS)

---

## 🔧 If IP Address Changes

Your IP might change if you reconnect to WiFi. To check current IP:

```bash
ip addr show wlo1 | grep "inet "
```

If it changed, update both config files:
- `app/customer/src/config.ts`
- `app/driver/src/config.ts`

Then restart apps with `--reset-cache`.

---

## 📊 Network Diagram

```
Phone (Expo Go)  →  WiFi  →  Computer (10.40.122.233)
                                      ↓
                              Backend (Port 8000)
                                      ↓
                              Database (AWS RDS)
```

All devices must be on the **same WiFi network** for local testing.

---

## ✅ What I Fixed

1. ✅ Updated driver app config to use `10.40.122.233`
2. ✅ Verified backend is running correctly
3. ✅ Confirmed backend accepts external connections
4. ✅ Created this troubleshooting guide

---

## 🎯 Next Steps

1. **Restart driver app** with cache clear:
   ```bash
   cd app/driver
   npm start -- --reset-cache
   ```

2. **Test from phone browser:**
   - Go to `http://10.40.122.233:8000/docs`
   - Should see API documentation

3. **If browser works, try apps:**
   - Customer app should now work
   - Driver app should now work

4. **If still not working:**
   - Check firewall: `sudo ufw status`
   - Ensure phone on same WiFi
   - Check backend logs for errors

---

## 📝 Summary

**Your Issue:** Driver app had wrong config (`localhost` instead of your IP)

**What I Fixed:**
- ✅ Changed driver app config to `http://10.40.122.233:8000`
- ✅ Verified customer app config is correct
- ✅ Confirmed backend is accessible
- ✅ Created comprehensive troubleshooting guide

**What You Need to Do:**
1. Restart driver app with `--reset-cache`
2. Ensure phone is on same WiFi
3. Test in phone browser first
4. Then test apps

**Status:** Should work now! If not, check firewall and network.

---

**Created:** 2026-05-20  
**Your IP:** 10.40.122.233  
**Backend Port:** 8000  
**Status:** ✅ Configuration Fixed
