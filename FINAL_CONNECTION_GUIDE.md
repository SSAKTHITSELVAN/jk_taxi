# FINAL Connection Guide - Browser Works, App Doesn't

**Status:** Browser can access `http://10.40.122.233:8000/docs` ✅  
**Issue:** Expo Go shows "Login failed" ❌

This is a **cache/config** issue, not a network issue.

---

## ✅ What I've Done

1. ✅ Fixed driver app config (`localhost` → `10.40.122.233`)
2. ✅ Verified customer app config is correct
3. ✅ Added detailed debug logging to both apps
4. ✅ Cleared all cache folders
5. ✅ Killed Metro processes

---

## 🚀 STEP-BY-STEP FIX (Follow Exactly)

### **Step 1: On Your Phone - Clear Expo Go**

**Do this first!**

1. **Open Expo Go app**
2. **Shake phone** (or use 3-finger touch on iOS)
3. Tap **"Settings"** (or Dev Menu)
4. Tap **"Clear cache and reload"** OR **"Clear data"**
5. **Force close Expo Go** (swipe up from recents)
6. **Open Expo Go again** (fresh start)

---

### **Step 2: On Computer - Start Apps Fresh**

**Open 2 terminals:**

**Terminal 1 - Customer App:**
```bash
cd /home/sakthi-selvan/jk_taxi/app/customer
npm start --clear
```

**Terminal 2 - Driver App:**
```bash
cd /home/sakthi-selvan/jk_taxi/app/driver
npm start --clear
```

**Wait for:** "Metro waiting on exp://..."

---

### **Step 3: Scan QR Code Fresh**

1. In Expo Go, tap "Scan QR Code"
2. Scan the NEW QR code from terminal
3. **Wait 1-2 minutes** for app to build
4. App should load

---

### **Step 4: Enable Debug Mode**

**Before trying to login:**

1. **Shake phone** in the app
2. Tap **"Debug Remote JS"**
3. Chrome DevTools will open on your computer
4. Go to **"Console"** tab
5. Now try logging in

**You'll see detailed logs showing exactly what's happening!**

---

## 🔍 What to Look For in Console

When you try to login, you should see:

```
🌐 [API REQUEST] POST /api/auth/login
📍 [BASE URL] http://10.40.122.233:8000
📦 [DATA] {"phone":"9876543210","password":"password123"}
🔓 [AUTH] No token
✅ [API SUCCESS] 200 /api/auth/login
```

**If you see this:** Login is working! ✅

---

## ❌ If You See Errors

### Error: "Network request failed"

**Console shows:**
```
❌ [API ERROR] Network request failed
📍 [BASE URL] http://10.40.122.233:8000
📝 [NO RESPONSE] Request was made but no response received
```

**This means:**
- App is trying wrong URL
- OR cache not cleared properly

**Fix:**
1. Check console shows correct IP: `10.40.122.233`
2. If wrong, config didn't reload - restart with `--clear`
3. Clear Expo Go cache again

---

### Error: HTTP 401/422/500

**Console shows:**
```
❌ [API ERROR] Request failed with status code 422
📝 [STATUS] 422
📝 [DATA] {"detail":"..."}
```

**This means:**
- API is reachable! ✅
- But credentials wrong or validation error

**Fix:**
- Use correct credentials:
  - Customer: `9876543210` / `password123`
  - Driver: `1111111111` / `driver123`

---

### Error: Wrong BASE_URL in console

**Console shows:**
```
📍 [BASE URL] http://localhost:8000
```

**This means:**
- Config didn't reload
- Old cached config is being used

**Fix:**
1. Kill Metro: Press `Ctrl+C` in terminals
2. Clear Expo cache on phone again
3. Start apps again with `--clear` flag
4. Scan QR code fresh

---

## 🧪 Test the Fix

### **On Phone - Test in Browser First:**
```
http://10.40.122.233:8000/docs
```
✅ **This works for you!**

### **In App - Should Also Work:**
1. Open customer app
2. Try login with `9876543210` / `password123`
3. Check console for logs
4. Should see `✅ [API SUCCESS]`

---

## 📊 Debug Checklist

Follow this checklist:

**On Phone:**
- [ ] Expo Go cache cleared (Settings → Clear data)
- [ ] Expo Go force closed and reopened
- [ ] On same WiFi as computer
- [ ] Can access `http://10.40.122.233:8000/docs` in phone browser

**On Computer:**
- [ ] Backend running on port 8000
- [ ] Apps started with `--clear` flag
- [ ] Fresh QR codes displayed
- [ ] Debug Remote JS enabled
- [ ] Chrome DevTools console open

**In Console:**
- [ ] See `🌐 [API REQUEST]` logs
- [ ] See correct IP: `10.40.122.233`
- [ ] See `✅ [API SUCCESS]` or `❌ [API ERROR]` with details

---

## 🎯 Most Common Fix

**If still not working after all this:**

1. **Close Everything:**
   - Kill both terminals (`Ctrl+C`)
   - Force close Expo Go on phone
   - Wait 10 seconds

2. **Start Backend:**
   ```bash
   cd /home/sakthi-selvan/jk_taxi/backend
   source ~/billion/bin/activate
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Start Customer App Only:**
   ```bash
   cd /home/sakthi-selvan/jk_taxi/app/customer
   npm start --clear
   ```

4. **On Phone:**
   - Open Expo Go
   - Clear cache (shake → settings → clear)
   - Scan QR code
   - Enable Debug Remote JS
   - Try login
   - **Check console for exact error**

---

## 💡 What Debug Logs Tell You

| Log Message | Meaning |
|-------------|---------|
| `📍 [BASE URL] http://10.40.122.233:8000` | ✅ Using correct URL |
| `📍 [BASE URL] http://localhost:8000` | ❌ Using old config - restart needed |
| `✅ [API SUCCESS] 200` | ✅ API call worked! |
| `❌ [NO RESPONSE]` | ❌ Can't reach API - network/firewall issue |
| `❌ [STATUS] 422` | ⚠️ API reached but validation error |
| `❌ [STATUS] 401` | ⚠️ API reached but auth failed |

---

## 📞 Still Not Working?

**Take a screenshot of:**
1. Chrome DevTools console (with the error logs)
2. Terminal output (Metro bundler)
3. Phone showing the error

The console logs will show **exactly** what's wrong!

---

## ✅ Expected Working Flow

**What you should see when it works:**

**1. In Terminal:**
```
Metro waiting on exp://10.40.122.233:8081
```

**2. In Phone:**
```
App loads successfully
Shows login screen
```

**3. In Console (after clicking login):**
```
🌐 [API REQUEST] POST /api/auth/login
📍 [BASE URL] http://10.40.122.233:8000
📦 [DATA] {"phone":"9876543210","password":"password123"}
🔓 [AUTH] No token
✅ [API SUCCESS] 200 /api/auth/login
```

**4. In Phone:**
```
Navigate to home screen or OTP screen
```

---

## 🎯 Summary

**The Problem:** Browser works, app doesn't = **Cache issue**

**The Fix:**
1. ✅ Clear Expo Go cache on phone
2. ✅ Start apps with `--clear` flag
3. ✅ Scan QR code fresh
4. ✅ Enable Debug Remote JS
5. ✅ Check console logs to see exact issue

**What I Added:**
- ✅ Detailed logging in both apps
- ✅ Shows exactly what URL it's using
- ✅ Shows all request/response details
- ✅ Easy to debug now!

**Status:** Ready to debug! Check the console logs and you'll see exactly what's happening! 🔍

---

**Files Modified:**
1. `app/customer/src/api/client.ts` - Added detailed logging
2. `app/driver/src/api/client.ts` - Added detailed logging
3. `app/driver/src/config.ts` - Fixed IP address
4. Cache folders cleared

**Next:** Follow the steps above and check console logs!
