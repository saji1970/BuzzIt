# Android SDK Local Setup Guide

This guide helps you set up and verify your local Android SDK configuration for the BuzzIt project.

## Current Configuration

- **SDK Location**: `C:\Users\saji\AppData\Local\Android\Sdk`
- **local.properties**: Already configured in `android/local.properties`

## Quick Setup

Run the setup script to verify your SDK installation:

```powershell
.\setup-android-sdk.ps1
```

## Required SDK Components

### 1. Platform Tools
- **Location**: `$ANDROID_HOME\platform-tools`
- **Contains**: `adb.exe`, `fastboot.exe`
- **Status**: ✓ Installed

### 2. Build Tools
- **Location**: `$ANDROID_HOME\build-tools`
- **Required Versions**: 30.0.3, 33.0.1, 34.0.0, or higher
- **Status**: ✓ Multiple versions installed

### 3. Android Platforms
- **Location**: `$ANDROID_HOME\platforms`
- **Required**: Android API 33 or 34
- **Check**: Run `.\setup-android-sdk.ps1` to verify

### 4. NDK (Native Development Kit)
- **Location**: `$ANDROID_HOME\ndk`
- **Required Version**: 17.2.4988734 (as specified in local.properties)
- **Status**: ✓ Configured

## Environment Variables

Your system should have these environment variables set:

```powershell
ANDROID_HOME=C:\Users\saji\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\saji\AppData\Local\Android\Sdk
```

## Installing Missing Components

### Option 1: Using Android Studio
1. Open Android Studio
2. Go to **Tools > SDK Manager**
3. Select the required components:
   - Android SDK Platform (API 33 or 34)
   - Android SDK Build-Tools
   - NDK (Side by side)
   - Android SDK Platform-Tools
4. Click **Apply** to install

### Option 2: Using Command Line (sdkmanager)

```powershell
# Navigate to SDK tools
cd $env:ANDROID_HOME\cmdline-tools\latest\bin

# Install platform
.\sdkmanager "platforms;android-34"

# Install build-tools
.\sdkmanager "build-tools;34.0.0"

# Install platform-tools
.\sdkmanager "platform-tools"
```

## Verifying Installation

1. **Check SDK Path**:
   ```powershell
   echo $env:ANDROID_HOME
   ```

2. **Check ADB**:
   ```powershell
   $env:ANDROID_HOME\platform-tools\adb.exe version
   ```

3. **List Installed Platforms**:
   ```powershell
   Get-ChildItem $env:ANDROID_HOME\platforms
   ```

4. **List Build Tools**:
   ```powershell
   Get-ChildItem $env:ANDROID_HOME\build-tools
   ```

## Project Configuration

The `android/local.properties` file contains:
```properties
sdk.dir=C\:\\Users\\saji\\AppData\\Local\\Android\\Sdk
ndk.dir=C:\\Users\\saji\\AppData\\Local\\Android\\Sdk\\ndk\\17.2.4988734
```

**Note**: This file is git-ignored and should not be committed to version control.

## Troubleshooting

### Issue: "SDK location not found"
**Solution**: 
1. Verify `ANDROID_HOME` environment variable
2. Check `android/local.properties` file exists
3. Run `.\setup-android-sdk.ps1` to regenerate

### Issue: "Build tools not found"
**Solution**:
```powershell
.\sdkmanager "build-tools;34.0.0"
```

### Issue: "Platform not found"
**Solution**:
```powershell
.\sdkmanager "platforms;android-34"
```

## Next Steps

After setting up the SDK:
1. Verify installation: `.\setup-android-sdk.ps1`
2. Build the project: `npx react-native run-android`
3. Check for any missing dependencies

## Additional Resources

- [Android SDK Documentation](https://developer.android.com/studio/command-line)
- [React Native Android Setup](https://reactnative.dev/docs/environment-setup)

