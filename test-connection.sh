#!/bin/bash

# JK Taxi API Connection Test Script
# Run this to verify backend is accessible from network

echo "🔍 JK Taxi Backend Connection Test"
echo "====================================="
echo ""

# Get current IP
echo "1️⃣  Checking your IP address..."
IP=$(ip addr show wlo1 | grep "inet " | awk '{print $2}' | cut -d'/' -f1)
echo "   ✓ Your IP: $IP"
echo ""

# Check if backend is running
echo "2️⃣  Checking if backend is running..."
if pgrep -f "uvicorn" > /dev/null; then
    echo "   ✓ Backend process found"
    PORT=$(netstat -tlnp 2>/dev/null | grep uvicorn | grep -oP ':\K\d+' | head -1)
    echo "   ✓ Running on port: $PORT"
else
    echo "   ❌ Backend is NOT running!"
    echo "   Start it with: cd backend && source ~/billion/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    exit 1
fi
echo ""

# Test local connection
echo "3️⃣  Testing local connection..."
HEALTH=$(curl -s http://localhost:8000/health 2>&1)
if [[ $HEALTH == *"healthy"* ]]; then
    echo "   ✓ Local connection works: $HEALTH"
else
    echo "   ❌ Local connection failed"
    exit 1
fi
echo ""

# Test network connection
echo "4️⃣  Testing network connection (what phone will use)..."
NETWORK_HEALTH=$(curl -s http://$IP:8000/health 2>&1)
if [[ $NETWORK_HEALTH == *"healthy"* ]]; then
    echo "   ✓ Network connection works: $NETWORK_HEALTH"
else
    echo "   ❌ Network connection failed!"
    echo "   This means phone won't be able to connect"
    echo "   Check firewall: sudo ufw status"
    exit 1
fi
echo ""

# Check config files
echo "5️⃣  Checking app configurations..."
CUSTOMER_CONFIG=$(grep "BASE_URL" app/customer/src/config.ts | grep -oP "'http://.*?'")
DRIVER_CONFIG=$(grep "BASE_URL" app/driver/src/config.ts | grep -oP "'http://.*?'")

echo "   Customer app: $CUSTOMER_CONFIG"
echo "   Driver app:   $DRIVER_CONFIG"
echo "   Expected:     'http://$IP:8000'"

if [[ $CUSTOMER_CONFIG == *"$IP"* ]]; then
    echo "   ✓ Customer config is correct"
else
    echo "   ⚠️  Customer config might be wrong"
fi

if [[ $DRIVER_CONFIG == *"$IP"* ]]; then
    echo "   ✓ Driver config is correct"
else
    echo "   ⚠️  Driver config might be wrong"
fi
echo ""

# Test login endpoint
echo "6️⃣  Testing login endpoint..."
LOGIN_TEST=$(curl -s -X POST http://$IP:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","password":"password123"}' 2>&1)

if [[ $LOGIN_TEST == *"access_token"* ]]; then
    echo "   ✓ Login endpoint works!"
else
    echo "   ⚠️  Login failed - check credentials or backend"
    echo "   Response: $LOGIN_TEST"
fi
echo ""

# Final summary
echo "✅ Connection Test Summary"
echo "=========================="
echo "Backend IP:    $IP"
echo "Backend Port:  8000"
echo "Health Check:  ✓ Working"
echo "Network Access: ✓ Working"
echo ""
echo "📱 On Your Phone:"
echo "1. Connect to the SAME WiFi"
echo "2. Open browser and go to: http://$IP:8000/docs"
echo "3. If that works, open Expo Go apps"
echo ""
echo "🔄 If apps not connecting, restart them:"
echo "   cd app/customer && npm start -- --reset-cache"
echo "   cd app/driver && npm start -- --reset-cache"
echo ""
echo "🎯 Everything looks good! Try the apps now."
