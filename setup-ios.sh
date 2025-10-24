#!/bin/bash

echo "🚀 Setting up Buzz it app for iOS deployment..."

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed. Please install Xcode from the Mac App Store first."
    echo "   After installation, run this script again."
    exit 1
fi

echo "✅ Xcode found"

# Set Xcode developer directory
echo "🔧 Setting Xcode developer directory..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install CocoaPods if not installed
if ! command -v pod &> /dev/null; then
    echo "📦 Installing CocoaPods..."
    sudo gem install cocoapods
else
    echo "✅ CocoaPods already installed"
fi

# Install iOS dependencies
echo "📱 Installing iOS dependencies..."
cd ios
pod install
cd ..

echo "🎉 Setup complete!"
echo ""
echo "To run the app:"
echo "1. Start Metro bundler: npx react-native start"
echo "2. In another terminal, run: npx react-native run-ios"
echo ""
echo "Or open ios/Buzzit.xcworkspace in Xcode and run from there."
