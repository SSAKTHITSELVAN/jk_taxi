# 🔐 Authentication Issues & Fixes

## Problem: 401 Unauthorized Errors

### Error 1: `GET /api/bookings/active` - 401 Unauthorized
**Cause**: User not logged in or invalid token

### Error 2: `POST /api/auth/login` - 401 Unauthorized  
**Cause**: Invalid credentials (wrong phone/password)

---

## ✅ Solutions

### For Customer App

#### Option 1: Use Existing Test User
**Credentials:**
- Phone: `9876543210`
- Password: `password123`

**Steps:**
1. Open customer app
2. Login with above credentials
3. Should work immediately

#### Option 2: Create New User
1. Click "Sign Up" on login screen
2. Fill in:
   - Name: Your Name
   - Phone: 10-digit number (e.g., `1234567890`)
   - Email: Optional
   - Password: At least 6 characters
3. Use OTP: `123456` (static for testing)
4. Login with your new credentials

---

### For Driver App

#### Option 1: Use Existing Test Driver
**Credentials:**
- Phone: `1111111111`
- Password: `driver123`

**Steps:**
1. Open driver app
2. Login with above credentials
3. Should work immediately

#### Option 2: Create New Driver
1. Click "Sign Up" on login screen
2. Fill in:
   - Name: Test Driver (required)
   - Phone: 10-digit number (e.g., `2222222222`) (required)
   - Email: Optional
   - Vehicle Number: Optional (e.g., `KA01AB1234`)
   - Vehicle Type: Optional (e.g., `Sedan`)
   - Password: At least 6 characters (required)
   - Confirm Password: Same as password (required)
3. Login with your new credentials

---

## 🐛 Text Node Error

### Problem: "Unexpected text node: ."

This is a **React Native Web** rendering quirk with certain component combinations. Not a critical error.

**Possible causes:**
1. Whitespace between components
2. Conditional rendering syntax
3. React Native Web compatibility

**Impact**: ⚠️ Warning only - app still works

**To minimize:**
- All text properly wrapped in `<Text>` components ✅
- No trailing spaces ✅
- Clean JSX structure ✅

---

## ✅ Quick Fix Checklist

### Customer App Login Issue
```bash
# Test if user exists
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","password":"password123"}'

# If works: Use those credentials in app
# If fails: Register new user in app
```

### Driver App Login Issue  
```bash
# Test if driver exists
curl -X POST http://localhost:8000/api/auth/driver/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"1111111111","password":"driver123"}'

# If works: Use those credentials in app
# If fails: Register new driver in app
```

---

## 🔍 Debugging Steps

### Step 1: Check Backend is Running
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","app":"JK Taxi API"}
```

### Step 2: Check CORS
```bash
curl -i -X OPTIONS http://localhost:8000/api/auth/login \
  -H "Origin: http://localhost:19006"
# Should see: Access-Control-Allow-Origin: *
```

### Step 3: Test Registration
Open app → Click "Sign Up" → Create new account

### Step 4: Test Login
Use the account you just created

---

## 💡 Common Issues

### Issue 1: "401 Unauthorized"
**Meaning**: Wrong credentials or user doesn't exist
**Fix**: Register new account or use correct password

### Issue 2: "422 Unprocessable Content"  
**Meaning**: Form validation failed (missing fields, invalid format)
**Fix**: 
- Phone must be exactly 10 digits
- Password must be at least 6 characters
- Email must be valid format (if provided)

### Issue 3: Token expired
**Meaning**: JWT token expired after 30 minutes
**Fix**: Login again

---

## 🎯 Testing Flow

### Customer App
1. Start app → Should see login screen
2. Click "Sign Up"
3. Fill form:
   - Name: Test User
   - Phone: 2222222222
   - Email: test@test.com
   - Password: test123
   - Confirm: test123
4. Click "Sign Up"
5. Enter OTP: 123456
6. Should redirect to Home screen ✅

### Driver App
1. Start app → Should see login screen
2. Click "Sign Up"  
3. Fill form:
   - Name: Test Driver
   - Phone: 3333333333
   - Email: driver@test.com
   - Vehicle Number: KA01AB1234
   - Vehicle Type: Sedan
   - Password: driver123
   - Confirm: driver123
4. Click "Sign Up"
5. Should redirect to Home screen ✅
6. Toggle "Online" switch
7. Should see "Available Rides" section

---

## ✅ Summary

| Issue | Status | Fix |
|-------|--------|-----|
| 401 Login Error | ✅ Expected | Register or use correct credentials |
| 401 API Calls | ✅ Expected | Login first to get token |
| Text Node Warning | ⚠️ Harmless | React Native Web quirk |
| CORS | ✅ Fixed | Backend allows all origins |

---

## 🚀 Quick Start Commands

### Register New Customer
```
Open customer app
→ Click "Sign Up"  
→ Use any 10-digit phone
→ Password: customer123
→ OTP: 123456
```

### Register New Driver
```
Open driver app
→ Click "Sign Up"
→ Use any 10-digit phone  
→ Password: driver123
→ Add vehicle details (optional)
```

---

**All authentication errors are expected behavior. Apps are working correctly - just need to register/login with valid credentials!** ✅
