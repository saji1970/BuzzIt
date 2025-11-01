# 🤖 Android APK Build Guide

## ✅ Build Started!

Your Android APK build is now queued on Expo's servers.

## 📱 Build Configuration

- **Platform:** Android
- **Build Type:** APK (Direct Installation)
- **Profile:** Production
- **Package Name:** com.buzzit.app
- **Version:** 1.0.0 (Version Code: 1)

## 🔍 Check Build Status

### Command Line:
```bash
eas build:list --platform android
```

### Online Dashboard:
https://expo.dev/accounts/sajipillai70/projects/buzzit/builds

### View Latest Build:
```bash
eas build:view
```

## 📥 Download APK When Complete

When the build finishes (~15-20 minutes):

```bash
# List your builds
eas build:list --platform android

# Download the latest build
eas build:download --platform android --latest

# Or download specific build by ID
eas build:download [build-id]
```

The APK file will be downloaded to your current directory.

## 📲 Install APK on Android Device

1. **Transfer APK to your Android device:**
   - Email it to yourself
   - Use USB file transfer
   - Upload to Google Drive/Dropbox

2. **Enable Unknown Sources:**
   - Settings → Security → Allow installation from unknown sources
   - Or Settings → Apps → Special access → Install unknown apps

3. **Tap the APK file** to install

## 🔄 Build Again

To rebuild with changes:

```bash
# Increment version code first in app.json
# Then rebuild
eas build --platform android --profile production
```

## ⚙️ Update Version Before Next Build

Edit `app.json`:
```json
"android": {
  "versionCode": 2  // Increment this for each new build
}
```

## 📋 Build Profiles

### Production (APK for Direct Install)
```bash
eas build --platform android --profile production
```
- Creates `.apk` file
- Ready for direct installation
- No Play Store credentials needed

### Preview (Same as Production for Android)
```bash
eas build --platform android --profile preview
```

### Production (AAB for Play Store)
To build for Play Store, change `eas.json`:
```json
"production": {
  "android": {
    "buildType": "aab"  // Change from "apk" to "aab"
  }
}
```

## ⏱️ Build Timeline

- **Queue:** 1-2 minutes
- **Building:** 15-20 minutes
- **Total:** ~20 minutes

## 🎯 What You Get

- ✅ **APK file** ready for installation
- ✅ **Signed** with EAS credentials
- ✅ **Production-ready** build
- ✅ **Connected to Railway API:** `https://buzzit-production.up.railway.app`

## 📝 Notes

- First build takes longer (~20 minutes)
- Subsequent builds are faster (~10-15 minutes)
- APK can be installed on any Android device (Android 6.0+)
- No Google Play account needed for APK builds
- APK size typically 20-50MB

---

**Your build is processing! Check status with `eas build:list --platform android`** 🚀

