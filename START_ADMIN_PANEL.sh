#!/bin/bash

# JK Taxi Admin Panel Launcher
# This script starts a local web server for the admin panel

echo "🚖 JK Taxi Admin Panel Launcher"
echo "================================"
echo ""

cd /home/sakthi-selvan/jk_taxi/app/admin

echo "✅ Starting admin panel server on port 3000..."
echo ""
echo "📊 Admin Dashboard will be available at:"
echo "   http://localhost:3000"
echo ""
echo "🔑 Note: Some features require admin authentication"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 3000
