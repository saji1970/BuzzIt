# Build iOS IPA for iPhone - Guide

## ✅ iOS Build Requirements

Building iOS apps requires:
- **macOS** (cannot build on Windows)
- **Xcode** (latest version recommended)
- **Apple Developer Account** (for device distribution)
- **CocoaPods** installed

## 📱 IPA Information

**Bundle ID**: `com.buzzit.app`  
**Version**: 1.0.3 (Build: 4)  
**Minimum iOS**: 13.0  

## 🔨 Build Commands

### Prerequisites

1. **Install CocoaPods** (if not already installed):
   ```bash
   sudo gem install cocoapods
   ```

2. **Install Pods**:
   ```bash
   cd BuzzIt/ios
   pod install
   ```

### Method 1: Build Archive via Xcode (Recommended)

1. **Open Xcode**:
   ```bash
   cd BuzzIt/ios
   open Buzzit.xcworkspace
   ```
   ⚠️ **Important**: Open `.xcworkspace`, not `.xcodeproj`

2. **Select Target Device**:
   - In Xcode, select "Any iOS Device (arm64)" from device dropdown

3. **Configure Signing**:
   - Go to **Signing & Capabilities** tab
   - Select your **Team** (requires Apple Developer account)
   - Xcode will automatically manage provisioning profile

4. **Create Archive**:
   - Menu: **Product → Archive**
   - Wait for build to complete (5-10 minutes)

5. **Export IPA**:
   - After archive completes, **Organizer** window opens
   - Click **Distribute App**
   - Select distribution method:
     - **Ad Hoc**: For testing on registered devices
     - **Development**: For development/testing
     - **Enterprise**: For enterprise distribution
     - **App Store**: For App Store submission
   - Follow wizard to export IPA file

### Method 2: Build via Command Line (xcodebuild)

#### Clean Build

```bash
cd BuzzIt/ios
xcodebuild clean -workspace Buzzit.xcworkspace -scheme Buzzit
```

#### Build Archive

```bash
cd BuzzIt/ios
xcodebuild archive \
  -workspace Buzzit.xcworkspace \
  -scheme Buzzit \
  -configuration Release \
  -archivePath build/Buzzit.xcarchive \
  CODE_SIGN_IDENTITY="iPhone Developer" \
  DEVELOPMENT_TEAM="YOUR_TEAM_ID"
```

Replace `YOUR_TEAM_ID` with your Apple Developer Team ID.

#### Export IPA

After creating archive, export IPA:

```bash
xcodebuild -exportArchive \
  -archivePath build/Buzzit.xcarchive \
  -exportPath build/ipa \
  -exportOptionsPlist ExportOptions.plist
```

### Method 3: React Native CLI (Simulator Only)

For iOS Simulator testing:

```bash
cd BuzzIt
npx react-native run-ios
```

This builds and runs on iOS Simulator, but doesn't create an IPA file.

## 📦 Create Export Options Plist

Create `BuzzIt/ios/ExportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
```

Distribution methods:
- `ad-hoc` - For testing on specific devices
- `development` - For development builds
- `enterprise` - For enterprise distribution
- `app-store` - For App Store submission

## 📂 IPA Locations

After export, IPA will be located at:

```
BuzzIt/ios/build/ipa/Buzzit.ipa
```

Or if using Xcode Organizer:
```
~/Library/Developer/Xcode/Archives/[Date]/Buzzit [Date].xcarchive/Products/Applications/Buzzit.app
```

## 📲 Install IPA on iPhone

### Method 1: Via Xcode

1. Connect iPhone to Mac via USB
2. In Xcode: **Window → Devices and Simulators**
3. Select your device
4. Click **+** under **Installed Apps**
5. Select the `.app` file from archive

### Method 2: Via iTunes/Finder

1. Connect iPhone to Mac
2. Open **Finder** (or **iTunes** on older macOS)
3. Select your device
4. Drag and drop IPA file to install

### Method 3: Via TestFlight (Recommended for Distribution)

1. Upload IPA to **App Store Connect**
2. Add testers in **TestFlight** section
3. Testers receive email invitation
4. Install via **TestFlight app** on iPhone

### Method 4: Via Third-Party Tools

- **AltStore**: For sideloading without developer account
- **3uTools**: Windows/Mac tool for iOS app installation
- **Cydia Impactor**: (Deprecated, use AltStore instead)

## 🔐 Code Signing Requirements

### For Ad-Hoc Distribution:

1. **Register Device UDID**:
   - Get device UDID from Settings → General → About
   - Add to Apple Developer Portal → Devices

2. **Create Ad-Hoc Provisioning Profile**:
   - Apple Developer Portal → Certificates, Identifiers & Profiles
   - Create new Provisioning Profile (Ad-Hoc type)
   - Select all devices you want to test on
   - Download and install profile

3. **Configure in Xcode**:
   - Xcode will automatically use the profile
   - Or manually select in Signing & Capabilities

### For App Store Distribution:

1. **App Store Connect Setup**:
   - Create app in App Store Connect
   - Set bundle ID, app name, description
   - Prepare screenshots and metadata

2. **Archive and Upload**:
   - Build archive in Xcode
   - Select "App Store Connect" distribution
   - Upload to App Store Connect
   - Submit for review

## 🚀 Quick Build Script

Create `build-ios.sh`:

```bash
#!/bin/bash

set -e

echo "🔨 Building iOS IPA..."

cd "$(dirname "$0")/BuzzIt"

# Install pods if needed
if [ ! -d "ios/Pods" ]; then
    echo "📦 Installing CocoaPods dependencies..."
    cd ios
    pod install
    cd ..
fi

# Build archive
echo "📱 Building archive..."
cd ios
xcodebuild archive \
  -workspace Buzzit.xcworkspace \
  -scheme Buzzit \
  -configuration Release \
  -archivePath build/Buzzit.xcarchive \
  CODE_SIGN_IDENTITY="iPhone Developer"

echo "✅ Archive created at: ios/build/Buzzit.xcarchive"
echo ""
echo "Next step: Export IPA using Xcode Organizer or xcodebuild -exportArchive"
```

Make it executable:
```bash
chmod +x build-ios.sh
./build-ios.sh
```

## 🐛 Troubleshooting

### Build Fails

**Issue**: "No such module 'React' or similar errors
- **Solution**: Run `pod install` in `ios/` directory

**Issue**: Code signing errors
- **Solution**: 
  - Check Team is selected in Xcode
  - Ensure provisioning profile is valid
  - Verify bundle identifier matches

**Issue**: "Command PhaseScriptExecution failed"
- **Solution**: Clean build folder (Cmd+Shift+K) and rebuild

### Pod Install Issues

**Issue**: Pod install fails
- **Solution**: 
  ```bash
  cd ios
  pod deintegrate
  pod install
  ```

**Issue**: CocoaPods version issues
- **Solution**: Update CocoaPods
  ```bash
  sudo gem install cocoapods
  ```

### Export Issues

**Issue**: Export fails with provisioning errors
- **Solution**: 
  - Check ExportOptions.plist has correct method
  - Ensure provisioning profile matches distribution method
  - Verify all certificates are valid in Keychain

## 📋 Build Checklist

- [ ] macOS system with Xcode installed
- [ ] Apple Developer account (for device builds)
- [ ] CocoaPods installed (`pod --version`)
- [ ] Pods installed (`pod install` in ios/)
- [ ] Bundle identifier configured
- [ ] Code signing set up in Xcode
- [ ] Device UDIDs registered (for ad-hoc)
- [ ] Archive created successfully
- [ ] IPA exported
- [ ] IPA installed and tested on device

## 💡 Tips

1. **Use Xcode Organizer**: Easiest way to manage archives and exports
2. **TestFlight**: Best method for distributing to testers
3. **Automated Builds**: Use Fastlane for CI/CD automation
4. **Archives**: Keep archives for each version for debugging
5. **Provisioning Profiles**: Xcode auto-manages them, but check if issues occur

## 🔄 Update Version

To update app version, edit:
- `BuzzIt/ios/Buzzit/Info.plist`:
  - `CFBundleShortVersionString` (version number, e.g., "1.0.3")
  - `CFBundleVersion` (build number, e.g., "4")

---

**Note**: iOS builds must be done on macOS. If you're on Windows, use:
- Remote Mac build service (e.g., MacStadium, MacinCloud)
- GitHub Actions with macOS runner
- CI/CD service with macOS support

