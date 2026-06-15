#!/bin/bash

# JK Taxi - Start Driver App
# This script starts the driver mobile app

echo "========================================="
echo "  JK TAXI - STARTING DRIVER APP"
echo "========================================="
echo ""

# Change to driver app directory
cd "$(dirname "$0")/app/driver"

echo "📍 Current directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
    echo ""
fi

# Clear any previous Metro bundler cache
echo "🧹 Clearing Metro bundler cache..."
npx expo start --clear

# Note: The script will keep running until you press Ctrl+C
