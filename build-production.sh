#!/bin/bash

# Build Production Script for Buzzit App
# This script will build for both iOS and Android

echo "🚀 Starting Production Build Process for Buzzit App"
echo "=================================================="
echo ""

# Check if logged in
echo "Checking EAS login status..."
eas whoami

if [ $? -ne 0 ]; then
    echo "❌ Not logged in to EAS"
    echo "Please run: eas login"
    echo "Then run this script again"
    exit 1
fi

echo ""
echo "✅ Logged in to EAS"
echo ""

# Build for iOS
echo "📱 Building for iOS (App Store)..."
echo "===================================="
eas build --platform ios --profile production

if [ $? -eq 0 ]; then
    echo "✅ iOS build completed successfully!"
else
    echo "❌ iOS build failed!"
fi

echo ""
echo "📱 Building for Android (Google Play Store)..."
echo "=============================================="
eas build --platform android --profile production

if [ $? -eq 0 ]; then
    echo "✅ Android build completed successfully!"
else
    echo "❌ Android build failed!"
fi

echo ""
echo "=========================================="
echo "Build process completed!"
echo ""
echo "Next steps:"
echo "1. Check build status: eas build:list"
echo "2. Download builds: eas build:download -p ios"
echo "3. Submit to stores: eas submit --platform ios --latest"
echo "=========================================="
