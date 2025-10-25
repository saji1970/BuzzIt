#!/bin/bash

echo "🚀 Building Buzzit Android App for Play Store"
echo "=============================================="
echo ""

# Check EAS login
echo "Checking EAS login status..."
eas whoami

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Not logged in to EAS"
    echo "Please run: eas login"
    echo "Then run this script again"
    echo ""
    echo "To login, run:"
    echo "  eas login"
    exit 1
fi

echo ""
echo "✅ Logged in to EAS"
echo ""

# Build for Android
echo "📱 Building Android App Bundle for Play Store..."
echo "=================================================="
echo ""
echo "This will build an .aab file ready for Play Store upload"
echo ""

eas build --platform android --profile production

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Download the build: eas build:download --platform android --latest"
    echo "2. Upload the .aab file to Google Play Console"
    echo "3. Complete the store listing"
    echo "4. Submit for review"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo "Please check the error messages above"
fi
