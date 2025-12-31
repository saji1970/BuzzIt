# Camera / Photo Picker Fix Guide

## Issue
"TAKE PHOTO" button shows an error when tapped in the Create Buzz screen.

## Diagnosis Steps

### Step 1: Check Real-Time Logs
Run this command and then tap "TAKE PHOTO" in the app:

```bash
adb logcat | findstr "buzzit\|Camera\|Permission\|ImagePicker\|ERROR"
```

Look for error messages that appear right after tapping the button.

### Step 2: Check for Permission Denials
```bash
adb logcat | findstr "Permission\|denied"
```

---

## Common Issues & Fixes

### Issue 1: Camera Permission Not Granted

**Symptoms:**
- No camera opens
- Permission dialog doesn't appear
- Silent failure

**Fix:**
1. Manually grant camera permission:
```bash
adb shell pm grant com.buzzit.app android.permission.CAMERA
```

2. Or grant via device:
   - Go to Settings → Apps → BuzzIt → Permissions
   - Enable Camera permission

### Issue 2: FileProvider Configuration Missing

**Symptoms:**
- Error: "Failed to find configured root"
- Camera opens but can't save photo

**Fix:** Check `android/app/src/main/res/xml/file_paths.xml` exists

### Issue 3: react-native-image-picker Not Linked Properly

**Symptoms:**
- "Cannot read property 'launchCamera' of undefined"
- Module not found errors

**Fix:**
```bash
cd android
.\gradlew.bat clean
cd ..
npx react-native run-android
```

---

## Manual Testing Steps

1. **Test Camera Permission:**
```bash
# Check if permission is granted
adb shell dumpsys package com.buzzit.app | findstr "CAMERA"
```

Should show: `android.permission.CAMERA: granted=true`

2. **Test Photo Library Permission:**
```bash
adb shell dumpsys package com.buzzit.app | findstr "READ_MEDIA"
```

3. **Force Permission Request:**
```bash
# Revoke permission to force new request
adb shell pm revoke com.buzzit.app android.permission.CAMERA

# Restart app and try again
```

---

## Code-Level Fixes

### Fix 1: Add Better Error Logging

Add this to `CreateBuzzScreen.tsx` in the `openCamera` function (around line 297):

```typescript
const result = await launchCamera({
  mediaType: mediaType === 'video' ? 'video' : 'photo',
  includeBase64: false,
  cameraType: 'back',
  saveToPhotos: true,
  quality: 0.8,
  videoQuality: 'high',
  durationLimit: mediaType === 'video' ? 300 : undefined,
});

console.log('Camera result:', JSON.stringify(result, null, 2)); // ADD THIS LINE

if (result.didCancel) {
  console.log('User cancelled camera'); // ADD THIS LINE
  return;
}

if (result.errorCode) {
  console.error('Camera errorCode:', result.errorCode); // ENHANCE THIS LINE
  console.error('Camera errorMessage:', result.errorMessage); // ADD THIS LINE
  Alert.alert('Error', result.errorMessage || 'Failed to open camera. Please try again.');
  return;
}
```

### Fix 2: Add Permission Status Logging

Add to the `ensureCameraPermission` function (around line 169):

```typescript
const ensureCameraPermission = async () => {
  const permission =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

  console.log('Checking camera permission:', permission); // ADD THIS

  const result = await requestPermissionWithPrompt(
    permission,
    'Camera Permission Required',
    'Camera access is required to capture photos.',
  );

  console.log('Camera permission result:', result); // ADD THIS

  return result;
};
```

---

## Alternative: Use Native Camera Intent (Temporary Workaround)

If `react-native-image-picker` is not working, you can use a native camera intent as a workaround:

```typescript
import {NativeModules} from 'react-native';

const openCameraNative = () => {
  const {RNCamera} = NativeModules;
  // This would require custom native module implementation
};
```

---

## Quick Fixes to Try

### Fix A: Reinstall with Permissions
```bash
# Uninstall completely
adb uninstall com.buzzit.app

# Reinstall
cd C:\BuzzIt\BuzzIt\android
.\gradlew.bat installDebug

# Grant permissions immediately
adb shell pm grant com.buzzit.app android.permission.CAMERA
adb shell pm grant com.buzzit.app android.permission.RECORD_AUDIO
adb shell pm grant com.buzzit.app android.permission.READ_MEDIA_IMAGES
adb shell pm grant com.buzzit.app android.permission.READ_MEDIA_VIDEO
```

### Fix B: Check File Provider
Make sure `android/app/src/main/res/xml/file_paths.xml` contains:

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="my_images" path="Pictures" />
    <external-cache-path name="camera_images" path="." />
</paths>
```

### Fix C: Verify AndroidManifest.xml
Ensure these are in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29"/>

<application ...>
  <provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="${applicationId}.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
      android:name="android.support.FILE_PROVIDER_PATHS"
      android:resource="@xml/file_paths" />
  </provider>
</application>
```

---

## Debug Output Analysis

When you tap "TAKE PHOTO" and see logs, look for these patterns:

### Good (Working):
```
Checking camera permission: android.permission.CAMERA
Camera permission result: true
Camera result: { "assets": [{ "uri": "file://..." }] }
```

### Bad (Not Working):
```
Camera permission result: false
Camera errorCode: camera_unavailable
Camera errorMessage: Camera permission denied
```

---

## Next Steps

1. Run the logging command and tap "TAKE PHOTO"
2. Share the error logs you see
3. Try the Quick Fixes above
4. If still not working, we can add more detailed error handling to the code

---

## Contact Points for Debugging

- Check if camera works in other apps (to rule out hardware/OS issues)
- Test on different Android version if possible
- Try "GALLERY" option to see if file picking works
- Try "RECORD VIDEO" to see if video works but photos don't
