# Troubleshooting Stream Viewing Errors

## Error: Amazon IVS Player SDK Shows Wrong Version

### Symptoms
```
Amazon IVS Player SDK 1.20.0  // Should be 1.46.0
```

### Cause
Browser is caching the old IVS Player SDK script.

### Solution

**Option 1: Hard Refresh (Recommended)**
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

**Option 2: Clear Browser Cache**

**Chrome/Edge:**
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Firefox:**
1. `Ctrl + Shift + Delete`
2. Select "Cached Web Content"
3. Click "Clear Now"

**Safari:**
1. `Cmd + Option + E` (Clear Cache)
2. Then `Cmd + R` (Reload)

**Option 3: Add Cache Busting (Permanent Fix)**

Update the script tags to include version parameter:

```html
<!-- stream-viewer.html and user-streaming.html -->
<script src="https://player.live-video.net/1.46.0/amazon-ivs-player.min.js?v=1.46.0"></script>
```

---

## Error: MasterPlaylist 404 - Failed to Load Playlist

### Symptoms
```
Player stopping playback - error MasterPlaylist:11 (ErrorNotAvailable code 404)
Failed to load resource: the server responded with a status of 404
us-west-2.700880966833.channel.O48M91kSl9qu.m3u8: 404
```

### Cause
The stream URL is not accessible. Possible reasons:
1. Stream is not actually live
2. IVS channel doesn't exist
3. Wrong playback URL
4. IVS channel credentials expired

### Solutions

#### Step 1: Check if Stream is Live

```bash
# Check stream status via API
curl http://localhost:3000/api/live-streams/:streamId

# Expected response:
{
  "success": true,
  "data": {
    "id": "stream-id",
    "isLive": true,
    "ivsPlaybackUrl": "https://...",
    ...
  }
}
```

#### Step 2: Verify IVS Configuration

Check your environment variables:

```bash
# In server directory
cat .env

# Should have:
IVS_INGEST_RTMPS_URL=rtmps://...
IVS_STREAM_KEY=sk_...
IVS_PLAYBACK_URL=https://...m3u8
```

#### Step 3: Test IVS Playback URL Directly

```bash
# Test if the m3u8 URL is accessible
curl -I "https://your-ivs-url.m3u8"

# Expected: 200 OK (if stream is live)
# If 404: Stream is not active
```

#### Step 4: Check AWS IVS Console

1. Log into AWS Console
2. Navigate to Amazon IVS
3. Check channel status
4. Verify stream key is correct
5. Check if stream is currently ingesting

#### Step 5: Start a Test Stream

Use OBS or similar software to test:

1. **Open OBS Studio**
2. **Settings > Stream**
   - Service: Custom
   - Server: Your `IVS_INGEST_RTMPS_URL`
   - Stream Key: Your `IVS_STREAM_KEY`
3. **Click "Start Streaming"**
4. **Check AWS IVS Console** - Should show "Live"
5. **Try viewing** the stream in your app

---

## Error: Admin Dashboard 500

### Symptoms
```
/api/admin/dashboard:1 Failed to load resource: the server responded with a status of 500 ()
```

### Cause
Server-side error in the admin dashboard endpoint.

### Solutions

#### Step 1: Check Server Logs

```bash
# If using Railway or similar
railway logs

# If running locally
# Check the terminal where server is running
```

#### Step 2: Check Database Connection

The admin dashboard likely queries the database. Verify:

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Or check in your app
curl http://localhost:3000/api/health
```

#### Step 3: Check Admin Endpoint

Look for the admin dashboard route in your server code:

```javascript
// server/index.js or routes
app.get('/api/admin/dashboard', async (req, res) => {
  // Check for errors here
});
```

Common issues:
- Missing authentication token
- Database query error
- Missing environment variables

---

## Error: NotSupportedError - Fallback Video Failed

### Symptoms
```
Error playing fallback video: NotSupportedError: Failed to load because no supported source was found.
```

### Cause
The fallback to native HTML5 video also failed because:
1. The source URL doesn't exist (404)
2. The video format is not supported by the browser

### Solution

This error is expected when the stream URL returns 404. Fix the primary issue (404 on m3u8) and this will resolve automatically.

---

## Complete Diagnostic Script

Run this in your browser console to diagnose issues:

```javascript
// Paste this in browser DevTools console
(async function diagnoseStream() {
    console.log('🔍 BuzzIt Stream Diagnostics');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check IVS SDK Version
    console.log('1️⃣ Checking IVS SDK Version...');
    if (typeof IVSPlayer !== 'undefined') {
        console.log('✅ IVS SDK Loaded');
        console.log('📦 Version:', IVSPlayer.version || 'Unknown');
        console.log('🎮 Supported:', IVSPlayer.isPlayerSupported);
    } else {
        console.log('❌ IVS SDK Not Loaded!');
    }

    // Check Stream URL
    console.log('\n2️⃣ Checking Stream URL...');
    const streamId = window.location.pathname.split('/').pop();
    console.log('Stream ID:', streamId);

    try {
        const response = await fetch(`/api/live-streams/${streamId}`);
        const data = await response.json();

        if (data.success) {
            console.log('✅ Stream API Response OK');
            console.log('📺 Stream Data:', {
                title: data.data.title,
                isLive: data.data.isLive,
                ivsPlaybackUrl: data.data.ivsPlaybackUrl,
                restreamPlaybackUrl: data.data.restreamPlaybackUrl,
                streamUrl: data.data.streamUrl
            });

            // Test playback URL
            const playbackUrl = data.data.ivsPlaybackUrl ||
                               data.data.restreamPlaybackUrl ||
                               data.data.streamUrl;

            if (playbackUrl) {
                console.log('\n3️⃣ Testing Playback URL...');
                console.log('🔗 URL:', playbackUrl);

                const urlTest = await fetch(playbackUrl, { method: 'HEAD' });
                console.log('📡 Status:', urlTest.status);

                if (urlTest.status === 200) {
                    console.log('✅ Playback URL is accessible!');
                } else {
                    console.log('❌ Playback URL returned:', urlTest.status);
                }
            } else {
                console.log('⚠️ No playback URL available');
            }
        } else {
            console.log('❌ Stream API Error:', data.error);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏁 Diagnostics Complete');
})();
```

---

## Quick Action Checklist

When stream won't play:

- [ ] **Hard refresh browser** (`Ctrl+Shift+R`)
- [ ] **Check stream is live** in database/AWS console
- [ ] **Verify IVS environment variables** are set
- [ ] **Test playback URL** directly with curl
- [ ] **Check server logs** for errors
- [ ] **Verify AWS IVS channel** is active
- [ ] **Test with OBS** to ensure IVS is working
- [ ] **Check browser console** for detailed errors
- [ ] **Try different browser** to rule out browser issues

---

## Common Scenarios

### Scenario 1: Stream Was Live, Now Shows 404
**Cause**: Stream ended but UI still shows it as live.

**Fix**:
1. Check `isLive` flag in database
2. Verify `endedAt` timestamp
3. Update UI to reflect stream ended

### Scenario 2: Never Been Able to View Streams
**Cause**: IVS not configured properly.

**Fix**:
1. Set up Amazon IVS channel in AWS
2. Add credentials to `.env`
3. Restart server
4. Test with OBS

### Scenario 3: Works on Desktop, Fails on Mobile
**Cause**: HTTPS required for mobile, or CORS issues.

**Fix**:
1. Ensure app is served over HTTPS
2. Check CORS headers on stream server
3. Verify mobile browser compatibility

---

## Still Having Issues?

### Collect Debug Information

1. **Browser Console Output**
   - Press F12
   - Copy all error messages

2. **Network Tab**
   - Open DevTools > Network
   - Filter by "m3u8"
   - Check status codes

3. **Server Logs**
   - Check backend logs for errors
   - Look for IVS-related errors

4. **AWS IVS Console**
   - Check channel status
   - Verify stream health
   - Check for any service issues

### Contact Support With:

- Browser and version
- Full console error log
- Network tab screenshot
- Server logs (sanitize credentials!)
- AWS IVS channel status

---

**Last Updated**: 2025-01-18
**Version**: 1.0
