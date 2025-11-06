# React Native Vision Camera Setup

## ✅ Implementation Complete

The live camera feature has been updated to use **React Native Vision Camera** instead of expo-camera.

## 📦 Changes Made

1. **Package.json** - Added `react-native-vision-camera@^3.6.17`
2. **GoBuzzLiveScreen.tsx** - Updated to use Vision Camera API:
   - `Camera` component from react-native-vision-camera
   - `useCameraDevice` hook for camera device management
   - `useCameraPermission` hook for permissions
   - Front/back camera toggle
   - Live recording indicator

3. **app.json** - Removed expo-camera plugin (no longer needed)

## 🚀 Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install `react-native-vision-camera` and all other dependencies.

### 2. Rebuild Native App

Since Vision Camera is a native module, you need to rebuild the app:

**For Android:**
```bash
./build-android-local.sh
```

**For iOS:**
```bash
cd ios && pod install && cd ..
./build-ios-simulator.sh
```

## 📋 Features Implemented

✅ Camera permission handling
✅ Front/back camera toggle
✅ Live camera preview
✅ Recording indicator
✅ Stream management (create/end)
✅ Live comments integration
✅ Viewer count tracking

## 🔧 Technical Details

### Camera Component
```tsx
<Camera
  ref={cameraRef}
  style={StyleSheet.absoluteFill}
  device={device}
  isActive={isStreaming}
  video={true}
  audio={true}
/>
```

### Permission Handling
- Uses `useCameraPermission()` hook
- Shows permission screen if not granted
- Requests permission automatically

### Device Management
- Uses `useCameraDevice(cameraPosition)` to get available camera
- Automatically handles device availability
- Supports front and back cameras

## 📝 Notes

1. **Native Module**: Vision Camera requires native code, so rebuilding is mandatory
2. **Permissions**: Already configured in AndroidManifest.xml and Info.plist
3. **Streaming**: Currently shows camera preview. For actual live streaming to server, you'll need to integrate:
   - RTMP (react-native-rtmp-publisher)
   - WebRTC (react-native-webrtc)
   - Or use Vision Camera's frame processor

## 🐛 Troubleshooting

### Build fails with "module not found"
- Run `npm install` first
- Make sure node_modules includes react-native-vision-camera

### Camera not showing
- Check permissions are granted
- Verify device has camera
- Rebuild native app after installing

### Permission denied
- Check AndroidManifest.xml has CAMERA permission
- Check Info.plist has NSCameraUsageDescription
- Grant permission in device settings

## ✅ Next Steps

After installation:
1. Test camera preview works
2. Test front/back camera toggle
3. Test recording functionality
4. Integrate with streaming server (if needed)

