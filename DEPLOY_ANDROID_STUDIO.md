# Deploy App in Android Studio - Step by Step Guide

## Prerequisites
- Android Studio installed
- Android SDK installed
- Java JDK 17 or higher
- Android device connected via USB (with USB debugging enabled) OR Android Emulator running

## Step 1: Open Project in Android Studio

### Option A: From Android Studio
1. Launch **Android Studio**
2. Click **File** → **Open**
3. Navigate to: `C:\BuzzIt\android` (or `C:\BuzzIt\BuzzIt\android` if that's where your project is)
4. Select the `android` folder
5. Click **OK**
6. Wait for Gradle sync to complete (this may take a few minutes on first open)

### Option B: From Command Line
```powershell
# Navigate to Android project
cd C:\BuzzIt\android

# Open in Android Studio (if studio64.exe is in PATH)
studio64.exe .

# Or find Android Studio manually:
# C:\Program Files\Android\Android Studio\bin\studio64.exe
```

### Option C: From File Explorer
1. Navigate to `C:\BuzzIt\android`
2. Right-click on the `android` folder
3. Select **Open in Android Studio** (if available)

## Step 2: Wait for Gradle Sync

- Android Studio will automatically start syncing Gradle
- Look for "Gradle Sync" progress in the bottom status bar
- Wait until it says "Gradle sync completed"
- If sync fails, see Troubleshooting section below

## Step 3: Configure SDK (if needed)

1. Click **Tools** → **SDK Manager**
2. Ensure these are installed:
   - **Android SDK Platform 34**
   - **Android SDK Build-Tools 34.0.0**
   - **NDK 17.2.4988734** (optional but recommended)
3. Click **Apply** and wait for installation

## Step 4: Connect Device or Start Emulator

### Option A: Physical Device
1. Enable **Developer Options** on your Android device:
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times
2. Enable **USB Debugging**:
   - Go to **Settings** → **Developer Options**
   - Enable **USB Debugging**
3. Connect device via USB
4. Accept USB debugging prompt on device
5. In Android Studio, device should appear in device dropdown

### Option B: Android Emulator
1. Click **Tools** → **Device Manager**
2. Click **Create Device** (if no emulator exists)
3. Select a device (e.g., Pixel 5)
4. Select a system image (e.g., Android 13 - API 33)
5. Click **Finish**
6. Click **Play** button next to the emulator to start it
7. Wait for emulator to boot

## Step 5: Build the Project

1. Click **Build** → **Make Project** (or press `Ctrl+F9`)
2. Wait for build to complete
3. Check **Build** tab at bottom for any errors
4. If successful, you'll see "BUILD SUCCESSFUL"

## Step 6: Run the App

### Method 1: Run Button
1. Click the green **Run** button (▶️) in the toolbar
2. Or press `Shift+F10`
3. Select your device/emulator from the dropdown
4. Click **OK**
5. App will build and install automatically

### Method 2: Run Menu
1. Click **Run** → **Run 'app'**
2. Select device/emulator
3. Click **OK**

### Method 3: Debug Mode
1. Click **Run** → **Debug 'app'** (or press `Shift+F9`)
2. Select device/emulator
3. App will launch with debugger attached

## Step 7: Monitor Deployment

- **Build Output**: Shows compilation progress
- **Run Tab**: Shows app logs and console output
- **Logcat**: Shows detailed Android logs (View → Tool Windows → Logcat)

## Building APK for Distribution

### Debug APK
1. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. Click **locate** in the notification
4. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK
1. Click **Build** → **Generate Signed Bundle / APK**
2. Select **APK** → **Next**
3. Create or select a keystore
4. Fill in keystore details
5. Select **release** build variant
6. Click **Finish**
7. APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

### Gradle Sync Failed
1. **Invalidate Caches**:
   - Click **File** → **Invalidate Caches** → **Invalidate and Restart**
2. **Clean Build**:
   - Click **Build** → **Clean Project**
   - Then **Build** → **Rebuild Project**
3. **Delete .gradle folder**:
   - Close Android Studio
   - Delete `android\.gradle` folder
   - Reopen Android Studio

### Build Errors

#### Missing SDK Components
1. Click **Tools** → **SDK Manager**
2. Install missing components shown in error messages
3. Click **Apply**

#### NDK Issues
1. Open `android/local.properties`
2. Add or update:
   ```properties
   sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
   ndk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk\\ndk\\17.2.4988734
   ```
3. Replace `YourUsername` with your actual Windows username

#### Java Version Issues
- Ensure Java JDK 17 is installed
- Set `JAVA_HOME` environment variable
- In Android Studio: **File** → **Project Structure** → **SDK Location** → Set JDK location

### Device Not Detected
1. Check USB connection
2. Enable USB debugging on device
3. Install USB drivers for your device
4. Try different USB port/cable
5. Run: `adb devices` in terminal to check connection

### App Crashes on Launch
1. Check **Logcat** for error messages
2. Ensure all dependencies are installed
3. Check if Metro bundler is running: `npm start` in project root
4. Clear app data: **Settings** → **Apps** → **BuzzIt** → **Clear Data**

## Quick Commands

### From Terminal (in android directory)
```powershell
# Clean build
.\gradlew.bat clean

# Build debug APK
.\gradlew.bat assembleDebug

# Build release APK
.\gradlew.bat assembleRelease

# Install on connected device
.\gradlew.bat installDebug

# Check connected devices
adb devices
```

## Project Configuration

- **Package Name**: `com.buzzit.app`
- **Version Code**: 3
- **Version Name**: 1.0.2
- **Min SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (Android 14)
- **Compile SDK**: 34

## Next Steps After Deployment

1. **Test all features**:
   - Login/Authentication
   - Buzz creation
   - Live streaming (BuzzLive)
   - Video playback with controls
   - Comments and interactions

2. **Monitor performance**:
   - Check Logcat for errors
   - Monitor memory usage
   - Test on different devices

3. **Prepare for release**:
   - Generate signed release APK
   - Test release build thoroughly
   - Submit to Google Play Store (if applicable)

## Useful Android Studio Shortcuts

- **Build Project**: `Ctrl+F9`
- **Run App**: `Shift+F10`
- **Debug App**: `Shift+F9`
- **Sync Gradle**: Click sync icon in toolbar
- **Open Terminal**: `Alt+F12`
- **Show Logcat**: `Alt+6`
- **Find**: `Ctrl+F`
- **Replace**: `Ctrl+R`

## Support

If you encounter issues:
1. Check Android Studio's **Build** tab for detailed error messages
2. Check **Logcat** for runtime errors
3. Verify all prerequisites are installed
4. Ensure React Native Metro bundler is running (`npm start`)



