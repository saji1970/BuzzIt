# Android Studio Deployment Guide

## Current Status
✅ Android device connected: `adb-R5CXC314FAH-3lnc2K._adb-tls-connect._tcp`
✅ Project cleaned successfully
🔄 Building and deploying app...

## Method 1: Using React Native CLI (Currently Running)
```bash
cd C:\BuzzIt\BuzzIt
npm run android
```

This will:
1. Start Metro bundler (if not running)
2. Build the Android APK
3. Install it on the connected device
4. Launch the app

## Method 2: Open in Android Studio

### Step 1: Open Android Studio
1. Launch Android Studio
2. Click "Open" or "File > Open"

### Step 2: Select Project Directory
Navigate to and select:
```
C:\BuzzIt\BuzzIt\android
```

### Step 3: Wait for Gradle Sync
- Android Studio will automatically sync Gradle dependencies
- This may take a few minutes on first open
- Wait for "Gradle sync finished" message

### Step 4: Configure SDK (if needed)
1. Go to `File > Project Structure` (or press `Ctrl+Alt+Shift+S`)
2. Under `SDK Location`, verify:
   - Android SDK location is set
   - JDK location is set (should be Java 17)

### Step 5: Select Device/Emulator
1. In the toolbar, click the device dropdown
2. Select your connected device: `adb-R5CXC314FAH-3lnc2K`
3. Or create/start an Android emulator

### Step 6: Build and Run
1. Click the green "Run" button (▶️) or press `Shift+F10`
2. Or go to `Run > Run 'app'`

## Method 3: Build APK Manually

### Debug APK
```bash
cd C:\BuzzIt\BuzzIt\android
.\gradlew.bat assembleDebug
```

The APK will be at:
```
C:\BuzzIt\BuzzIt\android\app\build\outputs\apk\debug\app-debug.apk
```

### Release APK
```bash
cd C:\BuzzIt\BuzzIt\android
.\gradlew.bat assembleRelease
```

The APK will be at:
```
C:\BuzzIt\BuzzIt\android\app\build\outputs\apk\release\app-release.apk
```

### Install APK Manually
```bash
adb install -r C:\BuzzIt\BuzzIt\android\app\build\outputs\apk\debug\app-debug.apk
```

## Important Notes

### After Switching to Amazon IVS Player
Since we switched from `react-native-video` to `amazon-ivs-react-native-player`, you need to:

1. **Rebuild Native Code**: The native Android code has been rebuilt
2. **Sync Gradle**: Android Studio will handle this automatically
3. **Test Streaming**: The IVS player should now work better with AWS IVS streams

### Troubleshooting

#### Gradle Sync Fails
```bash
cd C:\BuzzIt\BuzzIt\android
.\gradlew.bat clean
```
Then sync again in Android Studio.

#### Device Not Detected
1. Enable USB debugging on your device
2. Check connection: `adb devices`
3. In Android Studio: `Tools > Device Manager`

#### Build Errors
1. Clean project: `Build > Clean Project`
2. Rebuild: `Build > Rebuild Project`
3. Invalidate caches: `File > Invalidate Caches / Restart`

#### Metro Bundler Not Running
```bash
cd C:\BuzzIt\BuzzIt
npm start
```
Keep this terminal open while running the app.

## Project Structure
```
C:\BuzzIt\BuzzIt\
├── android\          # Android native project
│   ├── app\
│   │   ├── src\
│   │   │   └── main\
│   │   │       ├── java\com\buzzit\app\
│   │   │       └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── build.gradle
│   └── gradlew.bat
├── src\              # React Native source code
│   └── screens\
│       └── StreamViewerScreen.tsx  # Updated with IVS Player
└── package.json
```

## Next Steps After Deployment

1. **Test Streaming**: Open a live stream and verify playback works
2. **Check Logs**: Monitor Android logs for IVS Player events
3. **Verify Features**: Test play/pause, mute, and comments

## Monitoring Logs

### In Android Studio
1. Open `Logcat` tab at the bottom
2. Filter by: `StreamViewerScreen` or `IVS Player`

### Via Command Line
```bash
adb logcat | Select-String -Pattern "StreamViewerScreen|IVS Player" -CaseSensitive:$false
```

## Build Configuration

- **Application ID**: `com.buzzit.app`
- **Version Code**: 3
- **Version Name**: 1.0.2
- **Min SDK**: Set in `android/build.gradle`
- **Target SDK**: Set in `android/build.gradle`
- **Java Version**: 17

## Dependencies Added
- `amazon-ivs-react-native-player@^1.5.0` - For AWS IVS stream playback







