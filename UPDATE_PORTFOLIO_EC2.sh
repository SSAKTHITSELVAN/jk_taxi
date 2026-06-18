#!/bin/bash

echo "════════════════════════════════════════════════════════"
echo "  Updating Portfolio on EC2 with Latest Code"
echo "════════════════════════════════════════════════════════"
echo ""

# Step 1: Allow GitHub secrets
echo "⚠️  GitHub Push is blocked by secret scanning"
echo ""
echo "Please visit this URL to allow the Mapbox tokens:"
echo "https://github.com/SSAKTHITSELVAN/jk_taxi/security/secret-scanning/unblock-secret/3FJpXtlFqOsnu8gP3YcwbvmfLJT"
echo ""
echo "Click 'Allow secret' on that page, then press Enter here..."
read

# Step 2: Push to GitHub
echo ""
echo "Pushing latest code to GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Push failed. Please allow the secret and try again."
    exit 1
fi

echo "✅ Code pushed to GitHub"

# Step 3: Pull on EC2 and rebuild
echo ""
echo "Pulling latest code on EC2 and rebuilding portfolio..."
ssh -i ~/Downloads/jk_taxi_server.pem ubuntu@3.7.46.116 << 'ENDSSH'
cd ~/jk_taxi
echo "Current commit:"
git log --oneline -1

echo ""
echo "Pulling latest..."
git pull

echo ""
echo "New commit:"
git log --oneline -1

echo ""
echo "Rebuilding portfolio..."
cd web/portfolio
npm run build

echo ""
echo "Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Portfolio updated!"
ENDSSH

echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅ Portfolio Updated Successfully!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Visit: https://jktaxitamilnadu.com/"
echo ""
