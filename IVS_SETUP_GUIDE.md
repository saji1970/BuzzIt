# Amazon IVS Live Streaming Setup Guide

This guide explains how to configure Amazon IVS (Interactive Video Service) for BuzzIt's live streaming functionality.

## Overview

BuzzIt uses Amazon IVS to provide low-latency live streaming capabilities for both mobile and web platforms. The system supports:

- **RTMP/RTMPS** streaming from mobile devices (via NodeMediaClient)
- **HLS** playback for viewers (mobile and web)
- **SRT** streaming protocol (optional)

## Architecture

```
Mobile App (Publisher)
    ↓ RTMP Stream
Amazon IVS Ingest Endpoint
    ↓ Transcoding & Distribution
Amazon IVS Playback (HLS)
    ↓
Viewers (Mobile & Web)
```

## Configuration Steps

### 1. Railway Environment Variables

Set the following environment variables in your Railway project dashboard:

**Required Variables:**

```bash
# RTMPS Ingest URL (secure streaming)
IVS_INGEST_RTMPS_URL=rtmps://4232ed0fa439.global-contribute.live-video.net:443/app/

# IVS Stream Key
IVS_STREAM_KEY=sk_us-west-2_aJE3SKSY6Wzy_CruB8zI61cLLda7jS7uRE4rTSrJPZ6

# HLS Playback URL (for viewers)
IVS_PLAYBACK_URL=https://4232ed0fa439.us-west-2.playback.live-video.net/api/video/v1/us-west-2.700880966833.channel.O48M91kSl9qu.m3u8
```

**Optional Variables:**

```bash
# SRT Ingest URL (alternative streaming protocol)
IVS_SRT_URL=srt://4232ed0fa439.srt.live-video.net:9000?streamid=sk_us-west-2_aJE3SKSY6Wzy_CruB8zI61cLLda7jS7uRE4rTSrJPZ6

# SRT Passphrase (if encryption is enabled)
IVS_SRT_PASSPHRASE=

# RTMP Ingest URL (non-secure fallback)
IVS_INGEST_URL=rtmp://4232ed0fa439.global-contribute.live-video.net/app/
```

### 2. How to Set Environment Variables on Railway

1. Go to your Railway project dashboard
2. Navigate to your backend service
3. Click on the **Variables** tab
4. Click **+ New Variable**
5. Add each variable name and value
6. Click **Deploy** to apply changes

**Important:** After adding/updating environment variables, Railway will automatically redeploy your service.

### 3. Verify Configuration

After deploying with the new environment variables, you can verify the configuration by:

1. **Check Configuration Endpoint:**
   ```bash
   curl https://buzzit-production.up.railway.app/api/live-streams/config
   ```

   Expected response:
   ```json
   {
     "success": true,
     "data": {
       "hasIvsIngest": true,
       "hasIvsStreamKey": true,
       "hasPlaybackUrl": true,
       "hasSrtCredentials": true,
       "ingestPreview": "rtmps://4232...39.net",
       "streamKeyPreview": "sk_u...PZ6",
       "playbackPreview": "https://4232...m3u8"
     }
   }
   ```

2. **Test Stream Creation:**
   - Open the BuzzIt mobile app
   - Navigate to "Go Buzz Live"
   - Create a test stream
   - Check if the broadcast credentials are displayed correctly

## How It Works

### Mobile App (Publisher)

1. **Stream Creation:**
   - User taps "Go Live" in the mobile app
   - App calls `POST /api/live-streams` to create a stream record
   - Backend returns IVS credentials in the response

2. **RTMP URL Building:**
   ```typescript
   // The app builds the RTMP URL from credentials:
   rtmp://4232ed0fa439.global-contribute.live-video.net/app/sk_us-west-2_aJE3SKSY6Wzy_CruB8zI61cLLda7jS7uRE4rTSrJPZ6
   ```

   **Note:** NodeMediaClient requires RTMP (not RTMPS), so the app automatically:
   - Converts `rtmps://` to `rtmp://`
   - Removes `:443` port specification (uses default RTMP port 1935)

3. **Publishing:**
   - NodeMediaClient publishes the stream to IVS using RTMP
   - IVS transcodes and makes it available via HLS

### Web App (Viewer)

1. **Stream Viewing:**
   - Viewer opens stream URL: `/stream/:streamId`
   - Web app loads stream data from API
   - Amazon IVS Player SDK plays the HLS stream

2. **Player Initialization:**
   ```javascript
   // Web viewer uses IVS Player SDK
   const player = IVSPlayer.create();
   player.attachHTMLVideoElement(videoElement);
   player.load(playbackUrl); // Loads HLS .m3u8 URL
   ```

## Fallback Configuration

The mobile app has hardcoded fallback credentials in `GoBuzzLiveScreen.tsx`:

```typescript
const FALLBACK_IVS_INGEST = 'rtmps://4232ed0fa439.global-contribute.live-video.net:443/app/';
const FALLBACK_IVS_STREAM_KEY = 'sk_us-west-2_aJE3SKSY6Wzy_CruB8zI61cLLda7jS7uRE4rTSrJPZ6';
```

**These fallbacks are used when:**
- Railway environment variables are not set
- Backend returns `null` for IVS credentials

**Security Note:** For production, it's recommended to:
1. Always set environment variables on Railway
2. Remove or rotate the fallback credentials
3. Implement credential rotation policies

## URL Formats

### RTMPS Ingest (Secure)
```
rtmps://4232ed0fa439.global-contribute.live-video.net:443/app/
```

### RTMP Ingest (Used by Mobile App)
```
rtmp://4232ed0fa439.global-contribute.live-video.net/app/sk_us-west-2_aJE3SKSY6Wzy_CruB8zI61cLLda7jS7uRE4rTSrJPZ6
```

### SRT Ingest (Alternative Protocol)
```
srt://4232ed0fa439.srt.live-video.net:9000?streamid=sk_us-west-2_aJE3SKSY6Wzy_CruB8zI61cLLda7jS7uRE4rTSrJPZ6
```

### HLS Playback (For Viewers)
```
https://4232ed0fa439.us-west-2.playback.live-video.net/api/video/v1/us-west-2.700880966833.channel.O48M91kSl9qu.m3u8
```

## Troubleshooting

### Issue: "Streaming URL missing" error

**Cause:** IVS credentials not available to the app

**Solutions:**
1. Verify environment variables are set on Railway
2. Redeploy the backend after setting variables
3. Check the configuration endpoint response
4. Ensure fallback credentials are present in `GoBuzzLiveScreen.tsx`

### Issue: Stream connects but viewers can't see video

**Cause:** Playback URL not configured

**Solutions:**
1. Verify `IVS_PLAYBACK_URL` is set on Railway
2. Check that the playback URL is an HLS (.m3u8) URL
3. Test the playback URL directly in a browser or VLC player

### Issue: "Connection failed" or timeout errors

**Causes:**
- Invalid stream key
- Network connectivity issues
- IVS channel not active

**Solutions:**
1. Verify the stream key matches your IVS channel
2. Check IVS channel status in AWS console
3. Ensure the ingest endpoint is reachable
4. Test with OBS or another RTMP client first

### Issue: Web viewer shows "Stream not found"

**Causes:**
- Stream not created in database
- Incorrect stream ID in URL
- Stream ended or deleted

**Solutions:**
1. Verify stream was created successfully in mobile app
2. Check backend logs for stream creation errors
3. Verify the stream ID in the URL matches the database

## Video Encoding Settings

### Mobile Publisher (NodeMediaClient)

**Video:**
- Codec: H.264 Main Profile
- Resolution: 720x1280 (portrait)
- Frame Rate: 30 fps
- Bitrate: 1.8 Mbps

**Audio:**
- Codec: AAC-LC
- Sample Rate: 44.1 kHz
- Channels: Mono
- Bitrate: 96 kbps

**Features Enabled:**
- Hardware acceleration
- Noise reduction
- Enhanced RTMP mode

### IVS Channel Settings

Ensure your IVS channel in AWS is configured with:
- **Type:** STANDARD or BASIC
- **Latency Mode:** LOW (recommended)
- **Recording:** Optional (configure S3 bucket if needed)
- **Thumbnails:** Optional

## Security Best Practices

1. **Rotate Credentials Regularly:**
   - Generate new stream keys periodically
   - Update environment variables on Railway
   - Update fallback credentials in mobile app

2. **Use RTMPS When Possible:**
   - RTMPS encrypts the stream in transit
   - Current limitation: NodeMediaClient requires RTMP
   - Consider implementing custom streaming with RTMPS support

3. **Implement Rate Limiting:**
   - Limit stream creation per user
   - Monitor concurrent streams
   - Set viewer count limits if needed

4. **Monitor Usage:**
   - Track IVS usage in AWS CloudWatch
   - Set up billing alerts
   - Monitor stream quality metrics

## Cost Optimization

Amazon IVS pricing is based on:
- **Input:** Per GB of video ingested
- **Output:** Per GB of video delivered
- **Channel hours:** Active channel time

**Tips to reduce costs:**
1. End streams promptly when finished
2. Use appropriate bitrate settings (don't over-encode)
3. Monitor and limit concurrent streams
4. Consider using BASIC tier for non-professional streams
5. Implement automatic stream timeout (e.g., 2 hours max)

## Additional Resources

- [Amazon IVS Documentation](https://docs.aws.amazon.com/ivs/)
- [IVS Player SDK Reference](https://docs.aws.amazon.com/ivs/latest/userguide/player.html)
- [RTMP Specification](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)
- [HLS Specification](https://developer.apple.com/streaming/)

## Support

For issues or questions:
1. Check backend logs on Railway
2. Review mobile app logs
3. Test with IVS channel using OBS or other RTMP clients
4. Verify AWS IVS channel is active and healthy
5. Check network connectivity and firewall rules
