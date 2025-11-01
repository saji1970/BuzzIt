# 🚀 EAS Build Guide - Buzz it App

## ✅ Current Status

- **EAS CLI:** Installed ✓
- **Logged in as:** sajipillai70 ✓
- **Project ID:** 8d899ef2-dbd7-4bdb-8dd7-223105a0a736 ✓
- **Build Profiles:** development, preview, production ✓

## 🏗️ Build Commands

### iOS Builds

#### Preview Build (Internal Testing)
```bash
eas build --platform ios --profile preview
```
- Creates `.ipa` file for TestFlight/internal distribution
- No App Store credentials needed
- ~15-20 minutes

#### Production Build (App Store)
```bash
eas build --platform ios --profile production
```
- Creates `.ipa` file for App Store submission
- Requires Apple Developer account
- ~15-20 minutes

### Android Builds

#### Preview Build (Internal Testing)
```bash
eas build --platform android --profile preview
```
- Creates `.apk` file for direct installation
- No Play Store credentials needed
- ~15-20 minutes

#### Production Build (Play Store)
```bash
eas build --platform android --profile production
```
- Creates `.aab` file for Play Store submission
- Requires Google Play Console account
- ~15-20 minutes

### Build Both Platforms
```bash
eas build --platform all --profile production
```

## 📋 Build Configuration

Your `eas.json` is configured with:

**Production Profile:**
- iOS: Real device builds (no simulator)
- Android: APK format

**Preview Profile:**
- Internal distribution
- Good for testing before production

## 🔐 Credentials Setup

### iOS (Required for Production)
1. **Apple Developer Account** needed
2. EAS can auto-manage certificates, or you can provide your own
3. First build will prompt for Apple ID credentials

### Android (Required for Production)
1. **Google Play Console** account needed
2. Service account key required (configured in `eas.json`)

## 📱 After Build Completes

1. **Download the build:**
   ```bash
   eas build:list
   eas build:download [build-id]
   ```

2. **Install on device:**
   - iOS: Install via TestFlight or Xcode
   - Android: Install APK directly

3. **Submit to stores:**
   ```bash
   eas submit --platform ios --profile production
   eas submit --platform android --profile production
   ```

## 🔍 Monitor Build Progress

```bash
# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

## 🌐 View Builds Online

Visit: https://expo.dev/accounts/sajipillai70/projects/buzzit/builds

## ⚡ Quick Start

For a preview build (fastest):
```bash
eas build --platform ios --profile preview
```

For production build:
```bash
eas build --platform ios --profile production
```

## 📝 Notes

- First build takes longer (~20 minutes)
- Subsequent builds are faster with caching
- Builds happen in the cloud - no local setup needed
- API is configured to use Railway: `https://buzzit-production.up.railway.app`

