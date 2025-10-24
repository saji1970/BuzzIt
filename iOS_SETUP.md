# iOS Setup Guide for Buzz it App

## Prerequisites

To run the Buzz it app on iOS simulator, you need to install the following:

### 1. Install Xcode
- Download and install Xcode from the Mac App Store
- This is required for iOS development and simulator

### 2. Install Xcode Command Line Tools
```bash
sudo xcode-select --install
```

### 3. Install CocoaPods
```bash
sudo gem install cocoapods
```

## Setup Steps

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install iOS dependencies
cd ios
pod install
cd ..
```

### 2. Set Xcode Developer Directory
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### 3. Run the App
```bash
# Start Metro bundler (in one terminal)
npx react-native start

# Run iOS simulator (in another terminal)
npx react-native run-ios
```

## Alternative: Manual Xcode Setup

If you prefer to use Xcode directly:

1. Open `ios/Buzzit.xcworkspace` in Xcode
2. Select a simulator (iPhone 14, iPhone 15, etc.)
3. Click the Run button (▶️) or press Cmd+R

## Troubleshooting

### If you get "xcodebuild: error: tool 'xcodebuild' requires Xcode"
- Make sure Xcode is installed from the App Store
- Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`

### If you get CocoaPods errors
- Try: `sudo gem install cocoapods`
- If Ruby version issues, try: `sudo gem install cocoapods --user-install`

### If Metro bundler doesn't start
- Clear cache: `npx react-native start --reset-cache`
- Kill any existing Metro processes: `npx react-native start --reset-cache`

## App Features

Once running, you can:

1. **Create Profile**: Set up your user profile with interests
2. **Create Buzz**: Share text, images, and videos
3. **Browse Feed**: See buzzes based on your interests
4. **Customize Theme**: Choose from 5 different themes
5. **Share to Social**: Share your buzzes to other platforms

## Project Structure

```
ios/
├── Buzzit/
│   ├── AppDelegate.h
│   ├── AppDelegate.mm
│   ├── Info.plist
│   └── main.m
├── Buzzit.xcodeproj/
└── Podfile
```

The app is now ready to run on iOS simulator! 🚀
