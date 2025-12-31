#!/bin/bash

# iOS Build Script for BuzzIt App
# This script builds an iOS archive ready for IPA export

set -e

echo "🚀 BuzzIt iOS Build Script"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
IOS_DIR="$PROJECT_DIR/ios"

cd "$PROJECT_DIR"

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ Error: iOS builds require macOS${NC}"
    echo "Please run this script on a Mac with Xcode installed"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Error: Xcode is not installed${NC}"
    echo "Please install Xcode from the App Store"
    exit 1
fi

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    echo -e "${YELLOW}⚠️  CocoaPods not found. Installing...${NC}"
    sudo gem install cocoapods
fi

cd "$IOS_DIR"

# Check if Pods are installed
if [ ! -d "Pods" ]; then
    echo -e "${YELLOW}📦 Installing CocoaPods dependencies...${NC}"
    pod install
    echo ""
else
    echo -e "${GREEN}✅ CocoaPods dependencies already installed${NC}"
fi

echo ""
echo "📱 Building iOS Archive..."
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
xcodebuild clean -workspace Buzzit.xcworkspace -scheme Buzzit -quiet

# Build archive
ARCHIVE_PATH="$IOS_DIR/build/Buzzit.xcarchive"

echo "🔨 Creating archive..."
xcodebuild archive \
  -workspace Buzzit.xcworkspace \
  -scheme Buzzit \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  CODE_SIGN_IDENTITY="iPhone Developer" \
  DEVELOPMENT_TEAM="" \
  -allowProvisioningUpdates \
  | xcpretty || {
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
  }

if [ -d "$ARCHIVE_PATH" ]; then
    echo ""
    echo -e "${GREEN}✅ Archive created successfully!${NC}"
    echo ""
    echo "📦 Archive location: $ARCHIVE_PATH"
    echo ""
    echo "Next steps:"
    echo "1. Open Xcode Organizer: Window → Organizer"
    echo "2. Select your archive"
    echo "3. Click 'Distribute App'"
    echo "4. Choose distribution method (Ad-Hoc, App Store, etc.)"
    echo "5. Export IPA file"
    echo ""
    echo "Or use command line:"
    echo "  xcodebuild -exportArchive \\"
    echo "    -archivePath \"$ARCHIVE_PATH\" \\"
    echo "    -exportPath \"$IOS_DIR/build/ipa\" \\"
    echo "    -exportOptionsPlist ExportOptions.plist"
else
    echo -e "${RED}❌ Archive was not created${NC}"
    exit 1
fi

