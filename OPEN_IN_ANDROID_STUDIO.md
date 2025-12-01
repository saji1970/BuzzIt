# Opening the Project in Android Studio

## Project Location
The Android project is located at:
```
C:\BuzzIt\BuzzIt\android
```

## Method 1: Open from Android Studio (Recommended)
1. Launch **Android Studio**
2. Click **File** → **Open**
3. Navigate to: `C:\BuzzIt\BuzzIt\android`
4. Select the `android` folder and click **OK**
5. Wait for Android Studio to sync the Gradle project

## Method 2: Open from File Explorer
1. Navigate to: `C:\BuzzIt\BuzzIt\android`
2. Right-click on the `android` folder
3. Select **Open in Android Studio** (if available)

## Method 3: Command Line
If Android Studio is in your PATH:
```powershell
cd C:\BuzzIt\BuzzIt\android
studio64.exe .
```

Or find Android Studio and open manually:
- Common locations:
  - `C:\Program Files\Android\Android Studio\bin\studio64.exe`
  - `C:\Users\<YourUser>\AppData\Local\Programs\Android\Android Studio\bin\studio64.exe`

## After Opening in Android Studio

### 1. Sync Gradle
- Android Studio should automatically sync Gradle
- If not, click **File** → **Sync Project with Gradle Files**

### 2. Build the Project
- Click **Build** → **Make Project** (or press `Ctrl+F9`)
- Or click **Build** → **Rebuild Project**

### 3. Run the App
- Click **Run** → **Run 'app'** (or press `Shift+F10`)
- Select your connected Android device or emulator
- The app will build and install automatically

### 4. Create APK
- Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- Wait for the build to complete
- Click **locate** in the notification to find the APK
- APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## Project Configuration

### SDK Requirements
- **Compile SDK Version**: 34
- **Target SDK Version**: 34
- **Min SDK Version**: 21
- **Build Tools**: 30.0.3 or 34.0.0
- **NDK**: 17.2.4988734

### Gradle Settings
- **Gradle Version**: 8.0.2
- **Android Gradle Plugin**: 7.4.2

### Environment Variables
Ensure these are set:
- `ANDROID_HOME` = `C:\Users\saji\AppData\Local\Android\Sdk`
- `ANDROID_SDK_ROOT` = `C:\Users\saji\AppData\Local\Android\Sdk`

## Troubleshooting

### Gradle Sync Failed
1. Click **File** → **Invalidate Caches** → **Invalidate and Restart**
2. Delete `.gradle` folder in the project root
3. Re-sync Gradle

### Build Errors
1. Check SDK Manager: **Tools** → **SDK Manager**
2. Install missing SDK components
3. Ensure NDK 17.2.4988734 is installed

### NDK Warning
If you see NDK warnings, update `local.properties`:
```properties
sdk.dir=C\:\\Users\\saji\\AppData\\Local\\Android\\Sdk
ndk.dir=C\:\\Users\\saji\\AppData\\Local\\Android\\Sdk\\ndk\\17.2.4988734
```

## Build Variants

### Debug Build
- **Build Variant**: `debug`
- **APK Location**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Signed**: No (auto-signed by debug keystore)

### Release Build
- **Build Variant**: `release`
- **Requires**: Signing configuration
- **APK Location**: `android/app/build/outputs/apk/release/app-release.apk`

## Running in Debug Mode
1. Click **Run** → **Debug 'app'**
2. Select device/emulator
3. App will build and launch with debugger attached

## Useful Android Studio Shortcuts
- **Build**: `Ctrl+F9`
- **Run**: `Shift+F10`
- **Debug**: `Shift+F9`
- **Sync Gradle**: `Ctrl+Shift+O` (on sync button)
- **Terminal**: `Alt+F12`

## Checking Build Status
- **Build Output**: View at bottom panel
- **Gradle Console**: Shows build progress
- **Run Tab**: Shows app logs and output

