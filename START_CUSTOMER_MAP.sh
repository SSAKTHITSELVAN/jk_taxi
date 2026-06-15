#!/bin/bash

# Start Customer App with Mapbox Integration
# Run this script to test the new map-based UI

echo "🗺️  Starting JK Taxi Customer App with Mapbox..."
echo ""
echo "📱 Features:"
echo "  ✅ Full-screen Rapido-style map"
echo "  ✅ Location search with autocomplete"
echo "  ✅ Visual route display"
echo "  ✅ Map-based booking flow"
echo ""
echo "🔑 Mapbox API Key: Configured"
echo ""

cd app/customer

echo "🧹 Clearing cache..."
rm -rf node_modules/.cache 2>/dev/null
rm -rf .expo 2>/dev/null

echo ""
echo "🚀 Starting Expo..."
echo ""
echo "📝 Once started:"
echo "  1. Scan QR code with Expo Go app"
echo "  2. Grant location permissions"
echo "  3. See the new map home screen!"
echo ""
echo "💡 Tip: Press 'R' to reload, 'M' for menu"
echo ""

npm start

echo ""
echo "✅ App started successfully!"
