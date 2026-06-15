#!/bin/bash

# Complete Fix for Expo Go Connection Issue
# Run this script to fix the "Login failed" issue

echo "🔧 JK Taxi - Complete Connection Fix"
echo "======================================"
echo ""

# Step 1: Kill Metro processes
echo "1️⃣  Killing all Metro bundler processes..."
pkill -f "react-native" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2
echo "   ✓ Metro processes killed"
echo ""

# Step 2: Clear Customer App cache
echo "2️⃣  Clearing Customer App cache..."
cd /home/sakthi-selvan/jk_taxi/app/customer
rm -rf node_modules/.cache 2>/dev/null
rm -rf .expo 2>/dev/null
rm -rf dist 2>/dev/null
echo "   ✓ Customer app cache cleared"
echo ""

# Step 3: Clear Driver App cache
echo "3️⃣  Clearing Driver App cache..."
cd /home/sakthi-selvan/jk_taxi/app/driver
rm -rf node_modules/.cache 2>/dev/null
rm -rf .expo 2>/dev/null
rm -rf dist 2>/dev/null
echo "   ✓ Driver app cache cleared"
echo ""

# Step 4: Verify backend is running
echo "4️⃣  Checking backend status..."
if pgrep -f "uvicorn" > /dev/null; then
    IP=$(ip addr show wlo1 | grep "inet " | awk '{print $2}' | cut -d'/' -f1)
    echo "   ✓ Backend is running"
    echo "   ✓ Your IP: $IP"

    # Test connection
    HEALTH=$(curl -s http://$IP:8000/health 2>&1)
    if [[ $HEALTH == *"healthy"* ]]; then
        echo "   ✓ Backend is accessible: $HEALTH"
    else
        echo "   ⚠️  Backend might not be accessible on network"
    fi
else
    echo "   ❌ Backend is NOT running!"
    echo "   Start it with:"
    echo "   cd /home/sakthi-selvan/jk_taxi/backend"
    echo "   source ~/billion/bin/activate"
    echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    exit 1
fi
echo ""

# Step 5: Show instructions
echo "✅ Cache cleared successfully!"
echo ""
echo "📱 NEXT STEPS - Do these manually:"
echo ""
echo "===================================="
echo "ON YOUR PHONE:"
echo "===================================="
echo "1. Open Expo Go app"
echo "2. Shake phone (or 3-finger touch)"
echo "3. Tap 'Settings'"
echo "4. Tap 'Clear data'"
echo "5. Close Expo Go completely"
echo "6. Reopen Expo Go"
echo ""
echo "===================================="
echo "ON YOUR COMPUTER:"
echo "===================================="
echo ""
echo "Terminal 1 - Customer App:"
echo "cd /home/sakthi-selvan/jk_taxi/app/customer"
echo "npm start --clear"
echo ""
echo "Terminal 2 - Driver App:"
echo "cd /home/sakthi-selvan/jk_taxi/app/driver"
echo "npm start --clear"
echo ""
echo "===================================="
echo "THEN:"
echo "===================================="
echo "1. Scan QR code with Expo Go"
echo "2. Wait for app to load"
echo "3. Try login"
echo ""
echo "📊 To see debug logs:"
echo "- In Expo Go, shake phone"
echo "- Tap 'Debug Remote JS'"
echo "- Check Chrome DevTools console"
echo ""
echo "🔍 Look for these in console:"
echo "- 🌐 [API REQUEST] - Shows API calls"
echo "- 📍 [BASE URL] - Shows which URL it's using"
echo "- ✅ [API SUCCESS] - Shows successful responses"
echo "- ❌ [API ERROR] - Shows errors with details"
echo ""
echo "Your IP: $IP"
echo "Backend URL: http://$IP:8000"
echo ""
echo "🎯 Everything is ready - now follow the steps above!"
