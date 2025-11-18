# Amazon IVS Web Player - BuzzIt Implementation Guide

## Overview

The BuzzIt web application uses the **Amazon IVS Web Player SDK v1.46.0** for optimal live streaming performance. The player is integrated in both the stream viewer and broadcaster dashboard for seamless live streaming experiences.

## What's Implemented

### Files Updated

1. **stream-viewer.html** (`server/public/stream-viewer.html`)
   - Upgraded IVS Player SDK from v1.20.0 to v1.46.0
   - Enhanced error handling with specific error codes
   - Added comprehensive event logging
   - Implemented quality change tracking
   - Added metadata support
   - Fallback to native HLS when needed

2. **user-streaming.html** (`server/public/user-streaming.html`)
   - Upgraded IVS Player SDK from v1.20.0 to v1.46.0
   - Enhanced stream preview with better error handling
   - Added state change monitoring
   - Implemented quality tracking
   - Enhanced logging for debugging

## SDK Integration

### CDN Implementation

Both files use the latest CDN version:

```html
<!-- Amazon IVS Player SDK - Latest Version -->
<script src="https://player.live-video.net/1.46.0/amazon-ivs-player.min.js"></script>
```

### Alternative: NPM Installation

For build-based projects, you can also use npm:

```bash
npm install amazon-ivs-player
```

Then import in your JavaScript:

```javascript
import { IVSPlayer } from 'amazon-ivs-player';
```

## Features Implemented

### 1. Enhanced Player Initialization

```javascript
const ivsPlayer = IVSPlayer.create();
ivsPlayer.attachHTMLVideoElement(videoElement);
ivsPlayer.setVolume(1.0);
ivsPlayer.load(playbackUrl);
ivsPlayer.play();
```

### 2. Player State Monitoring

The implementation tracks all player states:

- ✅ **READY** - Player loaded and ready
- ▶️ **PLAYING** - Stream is actively playing
- ⏳ **BUFFERING** - Player is buffering content
- ⏸️ **IDLE** - Player is idle
- 🛑 **ENDED** - Stream has ended

### 3. Comprehensive Event Handling

#### Playing Event
```javascript
ivsPlayer.addEventListener(PlayerEventType.PLAYING, () => {
    console.log('▶️ IVS Player: Playing');
    hideError();
});
```

#### Error Handling
```javascript
ivsPlayer.addEventListener(PlayerEventType.ERROR, (error) => {
    console.error('❌ IVS Player error:', {
        type: error?.type || 'unknown',
        message: error?.message || 'Unknown error',
        code: error?.code || 'N/A',
        source: error?.source || 'N/A'
    });

    // User-friendly error messages
    let errorMessage = 'Stream playback error. ';
    if (error?.code === 'ERR_NETWORK') {
        errorMessage += 'Network connection issue detected.';
    } else if (error?.code === 'ERR_NOT_FOUND') {
        errorMessage += 'Stream not found or no longer available.';
    }

    // Fallback to native HLS playback
    if (playbackUrl.includes('.m3u8')) {
        videoElement.src = playbackUrl;
        videoElement.play();
    }
});
```

#### Quality Change Tracking
```javascript
ivsPlayer.addEventListener(PlayerEventType.QUALITY_CHANGED, (quality) => {
    console.log('📊 Quality changed:', {
        name: quality?.name || 'auto',
        width: quality?.width,
        height: quality?.height,
        bitrate: quality?.bitrate,
        framerate: quality?.framerate
    });
});
```

#### Metadata Support
```javascript
ivsPlayer.addEventListener(PlayerEventType.TEXT_METADATA_CUE, (cue) => {
    console.log('📝 IVS Player metadata:', cue.text);
    try {
        const metadata = JSON.parse(cue.text);
        // Display viewer count, chat messages, etc.
    } catch (e) {
        // Not JSON metadata
    }
});
```

### 4. Fallback Strategy

The implementation includes intelligent fallback:

1. **Primary**: Amazon IVS Player SDK
2. **Fallback**: Native HTML5 video element with HLS
3. **Error Recovery**: Automatic retry with fallback on errors

```javascript
// Fallback to native HLS playback if IVS fails
if (videoElement && playbackUrl && playbackUrl.includes('.m3u8')) {
    console.log('Attempting fallback to native HLS playback...');
    videoElement.src = playbackUrl;
    videoElement.play();
}
```

## Player Capabilities

The implementation logs player capabilities for debugging:

```javascript
console.log('🎮 IVS Player capabilities:', {
    version: IVSPlayer?.version || 'unknown',
    isPlayerSupported: IVSPlayer.isPlayerSupported,
    qualities: ivsPlayer.getQualities?.() || 'not available yet'
});
```

## Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `ERR_NETWORK` | Network connection issue | Check internet connection, verify stream is live |
| `ERR_NOT_FOUND` | Stream not found | Verify stream URL is correct and active |
| `ERR_UNSUPPORTED_FORMAT` | Format not supported | Ensure using HLS (.m3u8) format |
| `ERR_ABORTED` | Playback aborted | User action or network interruption |

## Browser Compatibility

The IVS Player SDK is supported on:

- ✅ Chrome/Edge 88+
- ✅ Firefox 87+
- ✅ Safari 14+ (macOS, iOS)
- ✅ Opera 74+
- ❌ Internet Explorer (not supported)

## Testing Checklist

### Stream Viewer (stream-viewer.html)

1. **Basic Playback**
   - [ ] Navigate to `/stream/:id`
   - [ ] Verify video plays automatically
   - [ ] Check audio is working
   - [ ] Verify viewer count updates

2. **Player Controls**
   - [ ] Test play/pause (via browser controls)
   - [ ] Test volume control
   - [ ] Test fullscreen mode
   - [ ] Verify quality adaptation

3. **Error Scenarios**
   - [ ] Test with invalid stream ID
   - [ ] Test with ended stream
   - [ ] Test network disconnection
   - [ ] Verify error messages display correctly

4. **Performance**
   - [ ] Check console for errors
   - [ ] Verify low latency playback
   - [ ] Check quality switches smoothly
   - [ ] Verify no memory leaks on cleanup

### Broadcaster Dashboard (user-streaming.html)

1. **Stream Preview**
   - [ ] Start a new stream
   - [ ] Verify preview loads correctly
   - [ ] Check viewer count updates
   - [ ] Test playback URL display

2. **Quality Monitoring**
   - [ ] Check quality changes logged
   - [ ] Verify bitrate information
   - [ ] Monitor buffering events

3. **Stream Management**
   - [ ] Test ending stream
   - [ ] Verify player cleanup
   - [ ] Check for memory leaks

## Advanced Features

### Custom Quality Selection

```javascript
// Get available qualities
const qualities = ivsPlayer.getQualities();
console.log('Available qualities:', qualities);

// Set specific quality
ivsPlayer.setQuality(qualities[0]);

// Set auto quality
ivsPlayer.setAutoQualityMode(true);
```

### Volume Control

```javascript
// Set volume (0.0 to 1.0)
ivsPlayer.setVolume(0.5);

// Get current volume
const volume = ivsPlayer.getVolume();

// Mute/unmute
ivsPlayer.setMuted(true);
const isMuted = ivsPlayer.isMuted();
```

### Playback Position

```javascript
// Get current position
const position = ivsPlayer.getPosition();

// Seek to position (for VOD)
ivsPlayer.seekTo(30); // 30 seconds

// Get duration
const duration = ivsPlayer.getDuration();
```

### Playback Rate

```javascript
// Speed up/slow down (0.5x to 2.0x)
ivsPlayer.setPlaybackRate(1.5);

// Get current rate
const rate = ivsPlayer.getPlaybackRate();
```

## Performance Optimization

### 1. Preload Strategy

```javascript
// Don't autoplay on mobile to save bandwidth
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (!isMobile) {
    ivsPlayer.play();
}
```

### 2. Memory Management

```javascript
// Always cleanup when done
window.addEventListener('beforeunload', () => {
    if (ivsPlayer) {
        ivsPlayer.delete();
        ivsPlayer = null;
    }
});
```

### 3. Adaptive Bitrate

The player automatically adapts quality based on:
- Available bandwidth
- Screen resolution
- CPU performance

## Troubleshooting

### Issue: Black Screen

**Problem**: Video element shows but no video

**Solutions**:
1. Check console for IVS SDK errors
2. Verify stream URL is valid HLS (.m3u8)
3. Ensure stream is actually live
4. Check CORS headers on stream server
5. Try fallback to native video element

### Issue: Audio But No Video

**Problem**: Audio plays but video is black

**Solutions**:
1. Check video codec compatibility
2. Verify browser supports H.264
3. Check GPU acceleration in browser
4. Try different browser

### Issue: High Latency

**Problem**: Stream has 10+ seconds delay

**Solutions**:
1. Ensure using IVS low-latency stream
2. Check network connection
3. Verify not using VOD URL
4. Check IVS channel configuration

### Issue: Stuttering Playback

**Problem**: Video keeps buffering

**Solutions**:
1. Check available bandwidth
2. Verify stream bitrate isn't too high
3. Let player auto-adapt quality
4. Check CPU usage
5. Close other bandwidth-heavy apps

### Issue: SDK Not Loading

**Problem**: `IVSPlayer is undefined`

**Solutions**:
1. Verify CDN URL is correct
2. Check internet connection
3. Look for browser console errors
4. Try loading from different CDN
5. Check Content Security Policy headers

## Security Considerations

### 1. Content Security Policy

Ensure your CSP allows IVS CDN:

```html
<meta http-equiv="Content-Security-Policy"
      content="script-src 'self' https://player.live-video.net;">
```

### 2. HTTPS Only

IVS Player requires HTTPS in production:
- ✅ `https://your-site.com` - Works
- ❌ `http://your-site.com` - May fail

### 3. Stream URL Validation

Always validate stream URLs server-side:

```javascript
function isValidIVSUrl(url) {
    return url.startsWith('https://') &&
           (url.includes('.m3u8') || url.includes('live-video.net'));
}
```

## Monitoring & Analytics

### Key Metrics to Track

1. **Playback Success Rate**
   - Track PLAYING events vs ERROR events

2. **Time to First Frame**
   - Measure time from load() to PLAYING

3. **Quality Distribution**
   - Log QUALITY_CHANGED events

4. **Error Rate by Type**
   - Group errors by error code

5. **Viewer Engagement**
   - Track view duration
   - Monitor drop-off points

### Example Analytics Implementation

```javascript
let startTime = Date.now();
let hasStartedPlaying = false;

ivsPlayer.addEventListener(PlayerEventType.PLAYING, () => {
    if (!hasStartedPlaying) {
        const timeToFirstFrame = Date.now() - startTime;
        console.log('Time to first frame:', timeToFirstFrame, 'ms');

        // Send to analytics
        analytics.track('stream_playback_started', {
            streamId: currentStream.id,
            timeToFirstFrame,
            quality: ivsPlayer.getQuality()
        });

        hasStartedPlaying = true;
    }
});

ivsPlayer.addEventListener(PlayerEventType.ERROR, (error) => {
    // Send error to analytics
    analytics.track('stream_playback_error', {
        streamId: currentStream.id,
        errorCode: error.code,
        errorType: error.type,
        errorMessage: error.message
    });
});
```

## Resources

- [Amazon IVS Player SDK Documentation](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/player-web.html)
- [IVS Web Player API Reference](https://aws.github.io/amazon-ivs-player-docs/1.46.0/web/)
- [Amazon IVS Release Notes](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/release-notes.html)
- [IVS Player Web Getting Started](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/web-getting-started.html)
- [Browser Support Matrix](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/player.html#player-sdk-web)

## Support

### Debugging Steps

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Look for IVS Player logs (🎬, ▶️, ❌, etc.)
4. Verify network requests in Network tab
5. Check video element in Elements tab

### Getting Help

If you encounter issues:

1. Check console logs for detailed error information
2. Verify stream URL is valid and active
3. Test in different browser
4. Review the troubleshooting section above
5. Check AWS IVS service health status
6. Consult AWS IVS documentation

## Version History

### v1.46.0 (Current)
- Enhanced error handling with specific error codes
- Added comprehensive state monitoring
- Implemented quality change tracking
- Added metadata support
- Improved fallback strategy
- Enhanced logging for debugging

### v1.20.0 (Previous)
- Basic IVS player integration
- Simple error handling
- Basic event listeners

## Next Steps

1. ✅ SDK upgraded to v1.46.0
2. ✅ Enhanced error handling implemented
3. ✅ Comprehensive logging added
4. 🔄 Test on various browsers and devices
5. 🔄 Monitor performance in production
6. 🔄 Implement custom analytics tracking
7. 🔄 Add custom UI controls (optional)

---

**Last Updated**: 2025-01-18
**IVS Player Version**: 1.46.0
**Documentation Version**: 2.0
