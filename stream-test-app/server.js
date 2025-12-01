require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'IVS Stream Test App is running' });
});

// Get IVS configuration
app.get('/api/config', (req, res) => {
  const config = {
    playbackUrl: process.env.IVS_PLAYBACK_URL || '',
    ingestUrl: process.env.IVS_INGEST_RTMPS_URL || process.env.IVS_INGEST_URL || '',
    streamKey: process.env.IVS_STREAM_KEY ? '••••••••' : '', // Masked for security
    hasConfig: !!(
      process.env.IVS_PLAYBACK_URL &&
      (process.env.IVS_INGEST_RTMPS_URL || process.env.IVS_INGEST_URL) &&
      process.env.IVS_STREAM_KEY
    ),
  };

  res.json(config);
});

// Get stream status (simple implementation)
app.get('/api/stream/status', (req, res) => {
  // In a real implementation, you would check IVS API for actual stream status
  // For this test app, we'll return a basic response
  res.json({
    status: 'ready',
    message: 'Use streaming software (OBS, etc.) to start streaming',
    playbackUrl: process.env.IVS_PLAYBACK_URL || '',
  });
});

// Get full stream instructions
app.get('/api/stream/instructions', (req, res) => {
  const ingestUrl = process.env.IVS_INGEST_RTMPS_URL || process.env.IVS_INGEST_URL || '';
  const streamKey = process.env.IVS_STREAM_KEY || '';

  // Convert RTMPS to RTMP if needed (remove port 443)
  const rtmpUrl = ingestUrl.replace(':443', '').replace('rtmps://', 'rtmp://');

  res.json({
    ingestUrl: rtmpUrl,
    streamKey: streamKey,
    playbackUrl: process.env.IVS_PLAYBACK_URL || '',
    srtUrl: process.env.IVS_SRT_URL || '',
    instructions: [
      '1. Open OBS Studio or your preferred streaming software',
      '2. Go to Settings > Stream',
      '3. Set Service to "Custom"',
      `4. Set Server to: ${rtmpUrl}`,
      `5. Set Stream Key to: ${streamKey}`,
      '6. Click "Start Streaming" in OBS',
      '7. Watch the stream appear in the preview below',
    ],
  });
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 IVS Stream Test App running on port ${PORT}`);
  console.log(`📺 Open http://localhost:${PORT} in your browser`);

  // Log configuration status
  const hasConfig = !!(
    process.env.IVS_PLAYBACK_URL &&
    (process.env.IVS_INGEST_RTMPS_URL || process.env.IVS_INGEST_URL) &&
    process.env.IVS_STREAM_KEY
  );

  if (hasConfig) {
    console.log('✅ IVS configuration loaded successfully');
  } else {
    console.warn('⚠️  Warning: IVS configuration incomplete. Check your .env file');
  }
});
