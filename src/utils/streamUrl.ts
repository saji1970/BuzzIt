export const sanitizeStreamUrl = (rawUrl?: string | null): string => {
  if (!rawUrl) {
    return '';
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed;
};

export const isBuzzItShareUrl = (url: string): boolean => {
  return /buzzit-production\.up\.railway\.app\/stream\//i.test(url);
};

export const isValidPlaybackStreamUrl = (rawUrl?: string | null): boolean => {
  const url = sanitizeStreamUrl(rawUrl);
  console.log('[isValidPlaybackStreamUrl] Checking URL:', url);
  
  if (!url) {
    console.log('[isValidPlaybackStreamUrl] No URL provided');
    return false;
  }

  if (url.startsWith('/')) {
    console.log('[isValidPlaybackStreamUrl] URL starts with /, invalid');
    return false;
  }

  if (/^rtmps?:\/\//i.test(url)) {
    // RTMP URLs are ingest endpoints, not playback URLs
    console.log('[isValidPlaybackStreamUrl] RTMP URL detected, invalid for playback');
    return false;
  }

  if (isBuzzItShareUrl(url)) {
    console.log('[isValidPlaybackStreamUrl] BuzzIt share URL detected, invalid');
    return false;
  }

  // Allow HLS (.m3u8) and DASH (.mpd) streams - these are valid playback formats
  const isHls = url.includes('.m3u8');
  const isDash = url.includes('.mpd');
  
  // IVS URLs might contain 'ivs', 'amazonaws.com', 'ivs.video', or 'playback.live-video.net'
  const isIvsUrl = url.includes('ivs') || 
                   url.includes('amazonaws.com') || 
                   url.includes('ivs.video') ||
                   url.includes('playback.live-video.net');
  
  // Check protocol using regex (React Native doesn't fully support URL API)
  const hasValidProtocol = /^https?:\/\//i.test(url);
  
  console.log('[isValidPlaybackStreamUrl] URL analysis:', {
    isHls,
    isDash,
    isIvsUrl,
    hasValidProtocol,
    url: url.substring(0, 100),
  });
  
  // Check protocol first
  if (!hasValidProtocol) {
    console.log('[isValidPlaybackStreamUrl] Invalid or missing protocol');
    return false;
  }
  
  // For HLS/DASH/IVS streams, be more lenient - just need a valid URL with protocol
  if (isHls || isDash || isIvsUrl) {
    console.log('[isValidPlaybackStreamUrl] Valid HLS/DASH/IVS stream');
    return true;
  }
  
  // For other formats, require a pathname (check using regex since URL API may not work)
  // Extract pathname manually: everything after the domain
  const pathnameMatch = url.match(/^https?:\/\/[^\/]+(\/.*)?$/i);
  const pathname = pathnameMatch && pathnameMatch[1] ? pathnameMatch[1] : '';
  
  if (!pathname || pathname === '/') {
    console.log('[isValidPlaybackStreamUrl] No pathname, invalid');
    return false;
  }

  console.log('[isValidPlaybackStreamUrl] Valid URL with pathname');
  return true;
};

export const getPlayableStreamUrl = (rawUrl?: string | null): string | null => {
  const sanitized = sanitizeStreamUrl(rawUrl);
  const isValid = isValidPlaybackStreamUrl(sanitized);
  console.log('[getPlayableStreamUrl] Input:', rawUrl, 'Sanitized:', sanitized, 'IsValid:', isValid);
  return isValid ? sanitized : null;
};

