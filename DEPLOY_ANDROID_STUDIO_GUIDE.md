# BuzzIt - Android Studio Deployment Guide

Complete guide to deploy the BuzzIt app using Android Studio on Windows.

---

## 📋 Prerequisites

Before starting, ensure you have:

✅ **Android Studio** installed (latest version)
✅ **Java Development Kit (JDK 17)** installed
✅ **Android SDK (API 34)** installed via Android Studio
✅ **Node.js and npm** installed
✅ **Android device** OR **Android Emulator**

---

## 🚀 Method 1: Deploy using Android Studio (Recommended)

### Step 1: Open Project in Android Studio

1. **Launch Android Studio**

2. **Open the Android folder:**
   - Click **File → Open**
   - Navigate to: `C:\BuzzIt\BuzzIt\android`
   - Click **OK**

3. **Wait for Gradle Sync:**
   - Android Studio will automatically sync Gradle dependencies
   - Wait for "Gradle sync finished" message (may take 5-10 minutes first time)
   - Check for any errors in the **Build** tab at the bottom

### Step 2: Install Dependencies

Open a terminal and run:
```bash
cd C:\BuzzIt\BuzzIt
npm install
```

### Step 3: Start Metro Bundler

**Open a new terminal** and run:
```bash
cd C:\BuzzIt\BuzzIt
npx react-native start
```

Keep this terminal running!

### Step 4A: Deploy to Physical Device

1. **Enable Developer Mode on your phone:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Developer Options will be enabled

2. **Enable USB Debugging:**
   - Go to Settings → Developer Options
   - Turn on "USB Debugging"

3. **Connect device to computer via USB**

4. **Verify connection:**
   - Open a new terminal
   - Run: `adb devices`
   - You should see your device listed

5. **In Android Studio:**
   - Check the device dropdown (top toolbar)
   - Your device should appear
   - Click the green **Run** button (▶️) or press `Shift + F10`

### Step 4B: Deploy to Android Emulator

1. **Create an emulator:**
   - In Android Studio, click **Device Manager** (phone icon on right sidebar)
   - Click **Create Device**
   - Choose **Pixel 5** (or any device)
   - Click **Next**
   - Select **API 34** (download if needed)
   - Click **Next** → **Finish**

2. **Start the emulator:**
   - In Device Manager, click the **Play** button next to your emulator
   - Wait for emulator to fully boot (may take 2-3 minutes)

3. **Deploy app:**
   - In Android Studio, select the emulator from device dropdown
   - Click the green **Run** button (▶️)

---

## 🔨 Method 2: Build APK using Command Line

### Build Debug APK

```bash
cd C:\BuzzIt\BuzzIt\android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

**APK Location:**
```
C:\BuzzIt\BuzzIt\android\app\build\outputs\apk\debug\app-debug.apk
```

### Install APK on Device

```bash
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

### Build Release APK

```bash
.\gradlew.bat assembleRelease
```

**APK Location:**
```
C:\BuzzIt\BuzzIt\android\app\build\outputs\apk\release\app-release.apk
```

---

## 📦 Method 3: Build App Bundle (AAB) for Play Store

```bash
cd C:\BuzzIt\BuzzIt\android
.\gradlew.bat bundleRelease
```

**AAB Location:**
```
C:\BuzzIt\BuzzIt\android\app\build\outputs\bundle\release\app-release.aab
```

Upload this `.aab` file to Google Play Console.

---

## ⚡ Quick Commands

### Clean Build and Deploy
```bash
# Terminal 1 - Metro Bundler
npx react-native start --reset-cache

# Terminal 2 - Build and Deploy
cd android
.\gradlew.bat clean
.\gradlew.bat installDebug
adb shell am start -n com.buzzit.app/.MainActivity
```

### Fast Rebuild
```bash
npx react-native run-android
```

### Check Connected Devices
```bash
adb devices
```

### View App Logs
```bash
adb logcat | findstr "buzzit"
```

---

## 🐛 Troubleshooting

### Issue 1: Metro Bundler Not Starting

**Solution:**
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Restart Metro
npx react-native start --reset-cache
```

### Issue 2: Gradle Build Failed

**Solution:**
```bash
cd C:\BuzzIt\BuzzIt\android
.\gradlew.bat clean
.\gradlew.bat --stop

# Retry build
.\gradlew.bat assembleDebug
```

### Issue 3: Device Not Detected

**Solution:**
```bash
# Restart ADB
adb kill-server
adb start-server
adb devices

# If still not showing, check:
# - USB debugging is enabled on phone
# - Try different USB cable/port
# - Accept "Allow USB debugging" prompt on phone
```

### Issue 4: App Crashes on Launch

**Check logs:**
```bash
adb logcat | findstr "AndroidRuntime"
```

**Common fixes:**
1. Ensure backend server is running
2. Check `.env` file configuration
3. Rebuild: `.\gradlew.bat clean assembleDebug`

### Issue 5: White Screen / React Native Not Loading

**Solution:**
```bash
# Clear all caches
cd C:\BuzzIt\BuzzIt
npx react-native start --reset-cache

# In new terminal
cd android
.\gradlew.bat clean
cd ..
npx react-native run-android
```

### Issue 6: Build Tools Version Error

**Solution:**
- Open Android Studio
- Go to **Tools → SDK Manager**
- Under **SDK Tools** tab, install:
  - Android SDK Build-Tools 34
  - Android SDK Platform-Tools
  - Android SDK Tools

---

## 🎯 Deployment Checklist

Before deploying to production:

- [ ] Test on multiple devices
- [ ] Test on different Android versions (API 21-34)
- [ ] Verify app icon displays correctly
- [ ] Test all major features:
  - [ ] User login/registration
  - [ ] Creating buzzes
  - [ ] BuzzLive streaming
  - [ ] Feed scrolling
  - [ ] Profile viewing
- [ ] Check app permissions (camera, microphone, storage)
- [ ] Test network connectivity (WiFi, mobile data, offline)
- [ ] Generate signed release APK/AAB
- [ ] Test release build before uploading to Play Store

---

## 📱 Current App Configuration

**Package Name:** `com.buzzit.app`
**Version Code:** 3
**Version Name:** 1.0.2
**Min SDK:** API 21 (Android 5.0)
**Target SDK:** API 34 (Android 14)

---

## 🔑 Android Studio Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Build Project | `Ctrl + F9` |
| Run App | `Shift + F10` |
| Open Logcat | `Alt + 6` |
| Open Terminal | `Alt + F12` |
| Clean Project | Build → Clean Project |
| Rebuild Project | Build → Rebuild Project |

---

## 📚 Additional Resources

- [React Native Docs](https://reactnative.dev/docs/running-on-device)
- [Android Studio Guide](https://developer.android.com/studio/run)
- [Publishing to Play Store](https://reactnative.dev/docs/signed-apk-android)

---

## 🎉 Ready to Deploy!

**Quick Start:**

1. Open Android Studio → Open `C:\BuzzIt\BuzzIt\android`
2. Open Terminal → Run `npx react-native start`
3. Connect device or start emulator
4. Click Run ▶️ in Android Studio

Your BuzzIt app will be deployed to your Android device!
