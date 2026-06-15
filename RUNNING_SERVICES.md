# 🚀 Running Services

## ✅ Active Services

### 1. Backend API (FastAPI)
- **Status**: ✅ Running
- **URL**: http://localhost:8000
- **Health**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs
- **Port**: 8000

### 2. Customer App (Expo)
- **Status**: ✅ Running
- **Platform**: Expo Dev Server
- **Process**: Running in background

---

## 🔗 Access Points

### Backend API
```bash
# Health Check
curl http://localhost:8000/health

# API Documentation
Open: http://localhost:8000/docs

# Test Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","password":"password123"}'
```

### Customer App

**Access the Expo Dev Server:**

The app should open a QR code in your terminal. You can:

1. **Press `w`** - Open in web browser
2. **Press `a`** - Open in Android emulator
3. **Press `i`** - Open in iOS simulator
4. **Scan QR** - Use Expo Go app on your phone

**Or manually navigate to:**
- Terminal where you ran `npm start`
- Look for the QR code and URL
- Typically: http://localhost:8081 or http://localhost:19006

---

## 📊 Service Status

| Service | Port | Status | URL |
|---------|------|--------|-----|
| Backend API | 8000 | ✅ Running | http://localhost:8000 |
| Expo Dev | 8081 | ✅ Running | Check terminal |
| Metro Bundler | 19000 | ✅ Running | Auto-started |

---

## 🛑 Stop Services

### Stop All
```bash
# Kill all related processes
ps aux | grep -E "uvicorn|expo|node.*expo" | grep -v grep | awk '{print $2}' | xargs kill -9
```

### Stop Backend Only
```bash
ps aux | grep uvicorn | grep -v grep | awk '{print $2}' | xargs kill -9
```

### Stop Frontend Only
```bash
ps aux | grep expo | grep -v grep | awk '{print $2}' | xargs kill -9
```

---

## 🔄 Restart Services

### Restart Backend
```bash
source ~/billion/bin/activate
cd /home/sakthi-selvan/jk_taxi/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Restart Frontend
```bash
cd /home/sakthi-selvan/jk_taxi/app/customer
npm start
```

---

## 📝 Logs

### Backend Logs
```bash
tail -f /tmp/backend.log
```

### Frontend Logs
Check the terminal where `npm start` is running

---

## ✅ Test Connection

### 1. Test Backend
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","app":"JK Taxi API"}
```

### 2. Test Login API
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","password":"password123"}'
# Should return tokens
```

### 3. Test Frontend
- Check terminal for Expo QR code
- Press `w` to open in web browser
- Should see login screen

---

## 🎯 Quick Actions

### Open Web App
```bash
# The Expo terminal should show instructions
# Usually press 'w' in the terminal running npm start
```

### View API Docs
```bash
# Open in browser
xdg-open http://localhost:8000/docs  # Linux
open http://localhost:8000/docs      # Mac
start http://localhost:8000/docs     # Windows
```

---

## ⚙️ Configuration

### Backend
- **Database**: AWS RDS PostgreSQL
- **Port**: 8000
- **CORS**: Enabled for all origins (*)
- **Reload**: Auto-reload on file changes

### Frontend
- **API URL**: http://localhost:8000 (in src/config.ts)
- **Platform**: Expo SDK 54
- **Hot Reload**: Enabled

---

## 📞 Troubleshooting

### Backend not responding
```bash
# Check if running
curl http://localhost:8000/health

# Check logs
tail -f /tmp/backend.log

# Restart
ps aux | grep uvicorn | grep -v grep | awk '{print $2}' | xargs kill -9
source ~/billion/bin/activate
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend not loading
```bash
# Check terminal for errors
# Restart with clear cache
cd app/customer
npx expo start --clear
```

---

## 🎉 Ready to Use!

**Backend API**: ✅ http://localhost:8000  
**Customer App**: ✅ Check terminal for QR code  

**Test Credentials:**
- Phone: `9876543210`
- Password: `password123`
- OTP: `123456`

---

**Both services are running and ready for testing!** 🚀
