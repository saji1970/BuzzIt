# EAS Build Setup for iOS

## 📱 EAS (Expo Application Services) Setup Guide

EAS Build allows you to build iOS apps in the cloud without needing a Mac.

## 🔧 Setup for Existing React Native App

Your existing React Native app can use EAS Build with the **bare workflow**.

### Step 1: Initialize EAS in Your Project

```bash
cd BuzzIt
eas init --id d537200a-e0fa-4ca6-892f-e5b6b40fb377
```

### Step 2: Configure EAS Build

This will create an `eas.json` file. Update it for your build configuration.

### Step 3: Build iOS App

```bash
eas build --platform ios
```

---

## 🆕 Alternative: Create New Expo App (If Needed)

If you prefer to create a separate Expo app for testing:

```bash
# Create new Expo app
npx create-expo-app buzzit-ios

# Navigate to it
cd buzzit-ios

# Initialize EAS with your project ID
eas init --id d537200a-e0fa-4ca6-892f-e5b6b40fb377
```

---

## 📋 EAS Build Configuration

After running `eas init`, you'll have an `eas.json` file. Example configuration:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "bundleIdentifier": "com.buzzit.app"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

## 🚀 Build Commands

### Build for iOS Simulator
```bash
eas build --platform ios --profile development
```

### Build for iOS Device (Ad-Hoc)
```bash
eas build --platform ios --profile preview
```

### Build for App Store
```bash
eas build --platform ios --profile production
```

### Build Both Platforms
```bash
eas build --platform all
```

## 📦 Download Builds

After build completes:
1. Check build status: `eas build:list`
2. Download from: https://expo.dev/accounts/[your-account]/projects/[project-slug]/builds
3. Or use: `eas build:download`

## 🔐 Code Signing

EAS can automatically manage code signing for you:

1. **Automatic (Recommended)**:
   ```bash
   eas build --platform ios --auto-submit
   ```
   EAS handles certificates and provisioning profiles automatically.

2. **Manual**:
   - Upload certificates via: https://expo.dev/accounts/[account]/credentials
   - Or configure in `eas.json`

## 📱 Install on Device

### Method 1: Direct Download
1. Build completes
2. Download IPA from Expo dashboard
3. Install via:
   - iTunes/Finder (drag & drop)
   - TestFlight (if submitted)
   - Direct install link (for ad-hoc builds)

### Method 2: QR Code
EAS provides a QR code for easy installation on iOS devices.

## 💡 Tips

1. **First Build**: Takes longer (15-20 min) as it sets up environment
2. **Subsequent Builds**: Faster (5-10 min) due to caching
3. **Free Tier**: Limited builds/month, upgrade for more
4. **Credentials**: EAS manages certificates automatically (recommended)
5. **Updates**: Use EAS Update for OTA updates without rebuilding

## 🐛 Troubleshooting

### Build Fails
- Check build logs: `eas build:view [build-id]`
- Verify dependencies in `package.json`
- Check for native module compatibility

### Code Signing Issues
- Use automatic signing (recommended)
- Or upload certificates manually via Expo dashboard

### Native Modules
- EAS supports most React Native native modules
- Some may require custom build configuration
- Check EAS documentation for specific modules

## 📚 Resources

- EAS Documentation: https://docs.expo.dev/build/introduction/
- EAS Build Status: https://expo.dev/accounts/[account]/projects/[project]/builds
- Expo Dashboard: https://expo.dev

---

## 🎯 Quick Start

1. **Login to Expo**:
   ```bash
   eas login
   ```

2. **Initialize EAS**:
   ```bash
   cd BuzzIt
   eas init --id d537200a-e0fa-4ca6-892f-e5b6b40fb377
   ```

3. **Build iOS App**:
   ```bash
   eas build --platform ios --profile preview
   ```

4. **Download & Install**:
   - Wait for build to complete
   - Download IPA from Expo dashboard
   - Install on iPhone

