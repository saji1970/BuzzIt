# Redeploy App in Android Studio - Quick Guide

## Quick Steps

### 1. Open Project in Android Studio
- Launch **Android Studio**
- **File** → **Open**
- Navigate to: `C:\BuzzIt\android`
- Select the `android` folder → **OK**

### 2. Clean Build
- Click **Build** → **Clean Project**
- Wait for completion

### 3. Rebuild Project
- Click **Build** → **Rebuild Project**
- Wait for build to complete (check Build tab for progress)

### 4. Connect Device/Emulator
- **Physical Device**: Connect via USB, enable USB debugging
- **Emulator**: **Tools** → **Device Manager** → Start emulator

### 5. Run App
- Click **Run** button (▶️) or press `Shift+F10`
- Select your device/emulator
- App will build and install automatically

## Command Line Alternative

```powershell
cd C:\BuzzIt\android

# Clean build
.\gradlew.bat clean

# Build debug APK
.\gradlew.bat assembleDebug

# Install on connected device
.\gradlew.bat installDebug
```

## Quick Commands

### Full Clean Rebuild
```powershell
cd C:\BuzzIt\android
.\gradlew.bat clean assembleDebug
```

### Install Directly
```powershell
cd C:\BuzzIt\android
.\gradlew.bat installDebug
```

## Troubleshooting

### Build Fails?
1. **Invalidate Caches**: **File** → **Invalidate Caches** → **Invalidate and Restart**
2. **Delete .gradle**: Close Android Studio, delete `android\.gradle` folder, reopen
3. **Sync Gradle**: Click sync icon in toolbar

### Device Not Detected?
- Check USB connection
- Enable USB debugging on device
- Run `adb devices` to verify connection

### App Crashes?
- Check **Logcat** for errors
- Ensure Metro bundler is running: `npm start` in project root
- Clear app data on device

## Build Variants

### Debug Build (Development)
- **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build (Production)
- **Build** → **Generate Signed Bundle / APK**
- Requires signing keystore
- APK: `android/app/build/outputs/apk/release/app-release.apk`

## Status Check

After deployment, verify:
- ✅ Icons display correctly (not Chinese characters)
- ✅ App launches without crashes
- ✅ All features work (login, streaming, video playback)
- ✅ Video controls work (slider, mute, fullscreen)



