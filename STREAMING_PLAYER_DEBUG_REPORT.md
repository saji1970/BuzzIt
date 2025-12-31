# Streaming Player Debug Report

## Issue Summary
The Android streaming player is not displaying video streams, even though the web app can successfully play the same playback URL.

## Findings from Android Logs

### 1. Stream URL is Being Fetched Successfully
- The app successfully retrieves stream data from the API
- Playback URL is valid: `https://4232ed0fa439.us-west-2.playback.live-video.net/api/video/v1/us-west-2.700880966833.channel.O48M91kSl9qu.m3u8`
- This is an HLS stream (.m3u8) from AWS IVS

### 2. No Video Player Errors in Logs
- No `onError` callbacks are being triggered
- No ExoPlayer errors (Android's video player)
- No MediaPlayer errors
- This suggests the Video component might not be attempting to play, or is failing silently

### 3. Current Implementation
- Using `react-native-video@^6.17.0` in `StreamViewerScreen.tsx`
- Video component has error handling, but no errors are logged
- The app also has `amazon-ivs-react-native-player@^1.5.0` in dependencies but it's not being used

### 4. Network Configuration
- AndroidManifest.xml has INTERNET permission ✓
- Network security config allows cleartext traffic ✓
- No network-related errors in logs

## Root Cause Analysis

The most likely issues are:

1. **react-native-video HLS Compatibility**: `react-native-video` may not properly handle AWS IVS HLS streams on Android, especially with certain ExoPlayer configurations.

2. **Missing Video Component Props**: The Video component might need additional props for HLS streams:
   - `hls` prop might be needed
   - `poster` or other initialization props
   - Android-specific configuration

3. **Silent Failure**: The Video component might be failing to initialize without triggering error callbacks.

## Recommendations

### Option 1: Use Amazon IVS Player (Recommended)
Since the app already has `amazon-ivs-react-native-player` installed, switch to using it for AWS IVS streams:

```tsx
import {IVSPlayer} from 'amazon-ivs-react-native-player';

// Replace Video component with:
<IVSPlayer
  streamUrl={playableUrl}
  autoplay
  muted={muted}
  onPlayerStateChange={(state) => {
    console.log('IVS Player state:', state);
  }}
  onError={(error) => {
    console.error('IVS Player error:', error);
  }}
/>
```

### Option 2: Enhance react-native-video Configuration
Add HLS-specific props and better error handling:

```tsx
<Video
  source={{uri: playableUrl}}
  style={styles.video}
  resizeMode="contain"
  paused={paused}
  muted={muted}
  repeat
  controls={false}
  // Add these for HLS:
  hls={true}
  maxBitRate={2000000}
  // Better error handling:
  onError={(error) => {
    console.error('[StreamViewerScreen] Video error:', JSON.stringify(error, null, 2));
    console.error('[StreamViewerScreen] Error details:', {
      errorCode: error?.error?.code,
      errorString: error?.error?.string,
      errorException: error?.error?.exception,
      errorLocalizedDescription: error?.error?.localizedDescription,
      errorLocalizedFailureReason: error?.error?.localizedFailureReason,
      errorLocalizedRecoverySuggestion: error?.error?.localizedRecoverySuggestion,
      errorType: error?.error?.type,
      error: error,
    });
    Alert.alert('Playback Error', `Unable to play this stream. Error: ${JSON.stringify(error?.error || error)}`);
  }}
  onLoad={() => {
    console.log('[StreamViewerScreen] Video loaded successfully');
  }}
  onLoadStart={() => {
    console.log('[StreamViewerScreen] Video load started, URL:', playableUrl);
  }}
  onBuffer={(data) => {
    console.log('[StreamViewerScreen] Video buffer:', data);
  }}
/>
```

### Option 3: Check Android ExoPlayer Configuration
Verify that ExoPlayer (used by react-native-video on Android) is properly configured in `android/app/build.gradle`:

```gradle
dependencies {
    // Ensure ExoPlayer is included
    implementation 'com.google.android.exoplayer:exoplayer:2.x.x'
}
```

## Next Steps

1. **Add Enhanced Logging** (Already done in StreamViewerScreen.tsx)
   - The code now includes detailed logging for video load, errors, and buffer states
   - Reload the app and check logs for these new messages

2. **Test with Amazon IVS Player**
   - Switch to `amazon-ivs-react-native-player` for AWS IVS streams
   - This is the recommended approach for AWS IVS content

3. **Verify ExoPlayer Version**
   - Check if react-native-video's ExoPlayer version is compatible with AWS IVS HLS streams

4. **Test Stream URL Directly**
   - Try opening the stream URL in a browser or VLC to verify it's playable
   - Test with a different HLS stream to isolate the issue

## Debugging Commands

To monitor logs in real-time:
```bash
adb logcat | Select-String -Pattern "StreamViewerScreen|Video|playback|m3u8|ExoPlayer" -CaseSensitive:$false
```

To check for video player errors:
```bash
adb logcat -d *:E | Select-String -Pattern "Video|ExoPlayer|MediaPlayer|HLS" -CaseSensitive:$false
```

## Files Modified

1. `BuzzIt/src/screens/StreamViewerScreen.tsx`
   - Added detailed logging for video component lifecycle
   - Enhanced error handling with detailed error information
   - Added onLoad, onLoadStart, onBuffer callbacks

## Additional Notes

- The web app can play the stream, confirming the URL is valid
- Network permissions are correctly configured
- The issue appears to be specific to the Android video player implementation
- Consider using the native AWS IVS player for better compatibility







