# 🚀 Clean Deploy to Android Emulator - Complete Guide

## ✅ What's Been Done

1. ✅ **Clean build** performed
2. ✅ **Fresh APK** built (version 1.0.3, build 4)
3. ✅ **Deploy scripts** created
4. ✅ **Emulator** starting (Pixel_7a)

## 📱 Quick Deploy (Automated)

### Option 1: Use the Complete Script

```powershell
cd C:\BuzzIt\BuzzIt\android
.\start-emulator-and-deploy.bat
```

This script will:
- Clean build directories
- List available emulators
- Start emulator (asks which one)
- Wait for emulator to boot
- Build fresh APK
- Uninstall old app
- Install new APK
- Launch the app

### Option 2: Use the Clean Deploy Script

```powershell
cd C:\BuzzIt\BuzzIt\android
.\clean-deploy-emulator.bat
```

(Assumes emulator is already running)

## 🔧 Manual Steps

### Step 1: Start Emulator

**From Android Studio:**
1. Open Android Studio
2. **Tools → Device Manager**
3. Click **▶️ Start** next to an emulator (e.g., Pixel_7a)

**From Command Line:**
```powershell
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator -avd Pixel_7a
```

### Step 2: Wait for Emulator

Wait until emulator is fully booted (home screen visible):
```powershell
adb devices
# Should show: emulator-XXXX device
```

### Step 3: Clean Build and Deploy

```powershell
cd C:\BuzzIt\BuzzIt\android

# Clean
.\gradlew.bat clean

# Build
.\gradlew.bat assembleDebug

# Uninstall old app
adb shell pm uninstall com.buzzit.app

# Install new APK
adb install -r "app\build\outputs\apk\debug\app-debug.apk"

# Launch app
adb shell monkey -p com.buzzit.app -c android.intent.category.LAUNCHER 1
```

## 📦 APK Information

**Location**: `C:\BuzzIt\BuzzIt\android\app\build\outputs\apk\debug\app-debug.apk`

**Details**:
- Version: 1.0.3
- Build: 4
- Package: com.buzzit.app
- Size: ~89-90 MB

## 🎯 Complete Deployment Workflow

### Terminal 1: Start Metro Bundler
```powershell
cd C:\BuzzIt\BuzzIt
npm start
```
Keep this running.

### Terminal 2: Deploy to Emulator
```powershell
cd C:\BuzzIt\BuzzIt\android
.\start-emulator-and-deploy.bat
```

## 🔍 Verify Deployment

1. **Check App Installed**:
   ```powershell
   adb shell pm list packages | findstr "buzzit"
   ```
   Should show: `package:com.buzzit.app`

2. **Check App Running**:
   ```powershell
   adb shell dumpsys window windows | findstr "mCurrentFocus"
   ```
   Should show: `com.buzzit.app`

3. **View Logs**:
   ```powershell
   adb logcat | findstr "com.buzzit.app"
   ```

## 🎨 What's New in This Build

- ✨ **Modern UI**: Enhanced HeroCard with improved design
- ✨ **Better Shadows**: Enhanced elevation effects
- ✨ **Updated Version**: 1.0.3 (Build 4)
- ✨ **Clean Build**: Fresh build with all updates

## 🔄 Troubleshooting

### Emulator Won't Start
- Check Android SDK is installed
- Verify AVD exists: `emulator -list-avds`
- Try starting from Android Studio first

### App Won't Install
```powershell
# Uninstall completely
adb shell pm uninstall com.buzzit.app

# Clear app data
adb shell pm clear com.buzzit.app

# Try install again
adb install -r "app\build\outputs\apk\debug\app-debug.apk"
```

### App Won't Connect to Metro
1. Ensure Metro is running: `npm start`
2. In emulator: Press `Ctrl+M` (or `Cmd+M`) to open dev menu
3. Select "Settings" → "Debug server host"
4. Enter your computer's IP address (e.g., `10.0.2.2:8081`)

### Build Fails
```powershell
# Clean everything
.\gradlew.bat clean

# Rebuild
.\gradlew.bat assembleDebug
```

## 📋 Available Emulators

Your available AVDs:
- Pixel_4_API_34
- Pixel_7a ⭐ (Recommended)
- Pixel_9_Pro_XL
- Pixel_9a

## ✅ Deployment Checklist

- [ ] Emulator started and booted
- [ ] Clean build completed
- [ ] APK built successfully
- [ ] Old app uninstalled
- [ ] New app installed
- [ ] App launched successfully
- [ ] Metro bundler running (separate terminal)
- [ ] App connects to Metro (hot reload works)

## 🎉 You're All Set!

The app with the new UI is now deployed to your Android emulator. Enjoy testing! 🚀

