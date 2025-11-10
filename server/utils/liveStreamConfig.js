const maskValue = (value, start = 4, end = 4) => {
  if (!value || value.length <= start + end) {
    return value || '';
  }
  return `${value.slice(0, start)}…${value.slice(value.length - end)}`;
};

const getLiveStreamConfig = () => {
  const ingestUrl =
    process.env.IVS_INGEST_RTMPS_URL ||
    process.env.IVS_INGEST_URL ||
    '';
  const streamKey =
    process.env.IVS_STREAM_KEY ||
    process.env.IVS_STREAM_KEY_ARN ||
    '';
  const playbackUrl = process.env.IVS_PLAYBACK_URL || '';
  const srtUrl = process.env.IVS_SRT_URL || '';
  const srtPassphrase = process.env.IVS_SRT_PASSPHRASE || '';

  return {
    hasIvsIngest: !!ingestUrl.trim(),
    hasIvsStreamKey: !!streamKey.trim(),
    hasPlaybackUrl: !!playbackUrl.trim(),
    hasSrtCredentials: !!srtUrl.trim() && !!srtPassphrase.trim(),
    ingestPreview: ingestUrl ? maskValue(ingestUrl, 12, 6) : '',
    streamKeyPreview: streamKey ? maskValue(streamKey, 4, 4) : '',
    playbackPreview: playbackUrl ? maskValue(playbackUrl, 12, 6) : '',
  };
};

module.exports = {
  getLiveStreamConfig,
  maskValue,
};

