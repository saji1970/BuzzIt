# Amazon IVS React Native Player - BuzzIt Implementation Guide

## Overview

BuzzIt now uses the **Amazon IVS React Native Player** for optimal live streaming performance with Amazon IVS. This provides better performance, lower latency, and improved reliability compared to generic video players.

## What Changed

### Components Updated

1. **StreamViewerScreen** (`src/screens/StreamViewerScreen.tsx`)
   - Replaced `react-native-video` with `amazon-ivs-react-native-player`
   - Enhanced error handling and state management
   - Better support for live HLS streams

2. **BuzzLiveViewer** (`src/components/Buzzlive/BuzzLiveViewer.tsx`)
   - Updated to use IVS Player for live stream viewing
   - Improved buffering state handling
   - Better integration with Amazon IVS playback URLs

## Installation Steps

### 1. Package Installation (✅ Completed)

```bash
npm install amazon-ivs-react-native-player
```

### 2. iOS Setup (⚠️ Requires Mac)

On a Mac with Xcode installed, run:

```bash
cd ios
pod install
cd ..
```

**Note**: This step was skipped on Windows. You'll need to run this on a Mac before building the iOS app.

### 3. Android Setup

No additional setup required for Android. The package auto-links.

## Features

The IVS Player implementation includes:

- ✅ **Autoplay support** - Streams start automatically
- ✅ **Quality selection** - Automatic quality adaptation
- ✅ **Volume control** - Full audio control
- ✅ **Seeking functionality** - Navigate through streams
- ✅ **Event callbacks** - onLoad, onProgress, onPlayerStateChange, onError
- ✅ **Playback controls** - Play, pause, seek
- ✅ **Buffering indicators** - Visual feedback during buffering
- ✅ **Error handling** - Comprehensive error management

## Usage Examples

### Basic Usage (StreamViewerScreen)

```jsx
<IVSPlayer
  streamUrl={playbackUrl}
  style={styles.video}
  autoplay={true}
  muted={false}
  onLoad={(duration) => {
    console.log('Stream loaded, duration:', duration);
  }}
  onPlayerStateChange={(state) => {
    console.log('Player state:', state);
  }}
  onError={(errorType, error) => {
    console.error('Playback error:', errorType, error);
  }}
/>
```

### Advanced Usage with Controls (BuzzLiveViewer)

```jsx
const [paused, setPaused] = useState(false);
const [buffering, setBuffering] = useState(false);

<IVSPlayer
  streamUrl={playbackUrl}
  style={styles.video}
  autoplay={!paused}
  muted={false}
  onLoad={(duration) => {
    setBuffering(false);
  }}
  onPlayerStateChange={(state) => {
    if (state === 'Buffering') {
      setBuffering(true);
    } else if (state === 'Playing' || state === 'Ready') {
      setBuffering(false);
    }
  }}
  onError={(errorType, error) => {
    console.error('Error:', errorType, error);
  }}
/>
```

## Player States

The IVS Player can be in the following states:

- `Idle` - Player is initialized but not loaded
- `Ready` - Stream is loaded and ready to play
- `Buffering` - Player is buffering content
- `Playing` - Stream is actively playing
- `Ended` - Stream has ended

## Error Handling

The player provides detailed error information:

```jsx
onError={(errorType, error) => {
  switch(errorType) {
    case 'ERROR_NETWORK':
      // Handle network errors
      break;
    case 'ERROR_CONTENT':
      // Handle content errors
      break;
    case 'ERROR_UNKNOWN':
      // Handle unknown errors
      break;
  }
}}
```

## Testing

### Test on iOS (Requires Mac)

```bash
npm run ios
```

### Test on Android

```bash
npm run android
```

### What to Test

1. **Stream Viewing**
   - Navigate to an active live stream
   - Verify video plays automatically
   - Check audio is working

2. **Player Controls**
   - Test play/pause functionality
   - Verify buffering indicator appears when needed
   - Check stream quality adaptation

3. **Error Scenarios**
   - Test with invalid stream URL
   - Test with ended stream
   - Test network interruption

## Troubleshooting

### iOS Build Fails

**Problem**: Build fails with "amazon-ivs-react-native-player not found"

**Solution**:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Android Build Fails

**Problem**: Build fails with linking errors

**Solution**:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Stream Not Playing

**Problem**: Stream shows "Live stream starting..." but never plays

**Solution**:
1. Verify the stream URL is a valid HLS (.m3u8) URL
2. Check that the stream is actually live in AWS IVS Console
3. Verify network connectivity
4. Check console logs for error messages

### Black Screen on iOS

**Problem**: Video shows black screen

**Solution**:
1. Ensure pod install was run on iOS
2. Clean build: `cd ios && xcodebuild clean && cd ..`
3. Rebuild the app

## Benefits Over react-native-video

1. **Optimized for Amazon IVS** - Built specifically for IVS streams
2. **Lower Latency** - Better performance with IVS low-latency streams
3. **Better Quality Adaptation** - Smoother quality switching
4. **Native SDK Integration** - Uses official IVS SDKs for iOS/Android
5. **Improved Error Handling** - More detailed error information
6. **Better Live Stream Support** - Optimized for live content

## Next Steps

1. ✅ Package installed
2. ✅ Components updated
3. ⚠️ **Run `pod install` on Mac for iOS support**
4. 🔄 Test on physical devices
5. 🔄 Monitor performance in production

## Resources

- [Amazon IVS React Native Player GitHub](https://github.com/aws/amazon-ivs-react-native-player)
- [Amazon IVS Documentation](https://docs.aws.amazon.com/ivs/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify your stream URL is valid
3. Ensure native dependencies are installed
4. Review the troubleshooting section above
5. Check the GitHub repository for known issues
