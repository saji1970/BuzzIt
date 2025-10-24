# 🚀 Buzz it App - iOS Deployment Guide

## Quick Start (Recommended)

### Option 1: Automated Setup
```bash
# Run the setup script
./setup-ios.sh
```

### Option 2: Manual Setup

#### 1. Install Prerequisites
```bash
# Install Xcode from Mac App Store (required)
# Then install command line tools
sudo xcode-select --install

# Install CocoaPods
sudo gem install cocoapods
```

#### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install iOS dependencies
cd ios
pod install
cd ..
```

#### 3. Run the App
```bash
# Start Metro bundler (Terminal 1)
npx react-native start

# Run iOS simulator (Terminal 2)
npx react-native run-ios
```

## Alternative: Using Xcode Directly

1. Open `ios/Buzzit.xcworkspace` in Xcode
2. Select an iOS simulator (iPhone 14, iPhone 15, etc.)
3. Click the Run button (▶️) or press Cmd+R

## Troubleshooting

### ❌ "xcodebuild: error: tool 'xcodebuild' requires Xcode"
**Solution:** Install Xcode from Mac App Store, then run:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### ❌ "Command 'pod' not found"
**Solution:** Install CocoaPods:
```bash
sudo gem install cocoapods
```

### ❌ Ruby version issues with CocoaPods
**Solution:** Use user installation:
```bash
sudo gem install cocoapods --user-install
```

### ❌ Metro bundler issues
**Solution:** Clear cache and restart:
```bash
npx react-native start --reset-cache
```

## App Features

Once running, you can experience:

### 🎨 **5 Customizable Themes**
- Default (Vibrant)
- Neon (Electric)
- Sunset (Warm)
- Ocean (Cool)
- Forest (Natural)

### 👤 **User Profiles**
- Create and edit profiles
- Select interests
- View statistics

### 🔥 **Create Buzzes**
- Text content
- Image and video attachments
- Interest tagging
- Social media sharing

### 📱 **Smart Feed**
- Interest-based content discovery
- Like, comment, and share
- Real-time interactions

### 🎯 **Social Integration**
- Share to Instagram, Snapchat, Facebook
- Cross-platform compatibility

## Project Structure

```
Buzzit/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # State management
│   └── screens/        # Main app screens
├── ios/               # iOS native code
├── App.tsx            # Main app component
├── package.json       # Dependencies
└── setup-ios.sh       # Automated setup script
```

## Development Tips

### Hot Reloading
- Shake the device/simulator to open developer menu
- Enable "Fast Refresh" for instant updates

### Debugging
- Use React Native Debugger
- Enable Chrome debugging
- Use Flipper for advanced debugging

### Performance
- Use React DevTools
- Monitor memory usage
- Optimize images and videos

## Next Steps

1. **Test on Device**: Connect iPhone and run on physical device
2. **App Store**: Prepare for App Store submission
3. **Backend**: Integrate with real backend services
4. **Push Notifications**: Add real-time notifications
5. **Analytics**: Integrate analytics and crash reporting

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Try clearing cache and restarting
4. Check React Native documentation

---

**Happy Coding! 🎉**

The Buzz it app is now ready to create buzz in social media!
