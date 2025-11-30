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
  if (!url) {
    return false;
  }

  if (url.startsWith('/')) {
    return false;
  }

  if (/^rtmps?:\/\//i.test(url)) {
    // RTMP URLs are ingest endpoints, not playback URLs
    return false;
  }

  if (isBuzzItShareUrl(url)) {
    return false;
  }

  // Allow HLS (.m3u8) and DASH (.mpd) streams - these are valid playback formats
  const isHls = url.includes('.m3u8');
  const isDash = url.includes('.mpd');
  
  // IVS URLs might contain 'ivs', 'amazonaws.com', or 'ivs.video'
  const isIvsUrl = url.includes('ivs') || 
                   url.includes('amazonaws.com') || 
                   url.includes('ivs.video');
  
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const pathname = parsed.pathname || '';
    
    // For HLS/DASH/IVS streams, be more lenient - just need a valid URL with protocol
    if (isHls || isDash || isIvsUrl) {
      return true;
    }
    
    // For other formats, require a pathname
    if (!pathname || pathname === '/') {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const getPlayableStreamUrl = (rawUrl?: string | null): string | null => {
  const sanitized = sanitizeStreamUrl(rawUrl);
  return isValidPlaybackStreamUrl(sanitized) ? sanitized : null;
};

