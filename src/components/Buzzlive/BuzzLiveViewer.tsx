import React, {useMemo, useState, useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Video, {ResizeMode, OnVideoErrorData} from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {getPlayableStreamUrl, isValidPlaybackStreamUrl} from '../../utils/streamUrl';

interface BuzzLiveViewerProps {
  playbackUrl?: string;
  placeholderImage?: string;
  style?: ViewStyle;
  title?: string;
}

const BuzzLiveViewer: React.FC<BuzzLiveViewerProps> = ({
  playbackUrl,
  placeholderImage,
  style,
  title = 'Buzzlive',
}) => {
  const [paused, setPaused] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [errored, setErrored] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [retryMessage, setRetryMessage] = useState('');
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoKeyRef = useRef(0);

  const playableUrl = useMemo(() => {
    console.log('[BuzzLiveViewer] 🔍 Processing playback URL:', {
      playbackUrl: playbackUrl ? playbackUrl.substring(0, 100) + '...' : null,
      hasUrl: !!playbackUrl,
    });
    
    const playable = getPlayableStreamUrl(playbackUrl);
    
    console.log('[BuzzLiveViewer] 📊 Playback URL result:', {
      hasPlayableUrl: !!playable,
      playableUrl: playable ? playable.substring(0, 100) + '...' : null,
      isValid: isValidPlaybackStreamUrl(playable || undefined),
    });
    
    return playable;
  }, [playbackUrl]);

  const isPlayable = useMemo(
    () => Boolean(playableUrl && !errored),
    [playableUrl, errored],
  );

  // Clean up retry timeout on unmount or URL change
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [playbackUrl]);

  // Reset retry state when URL changes
  useEffect(() => {
    setRetryCount(0);
    setRetryMessage('');
    setErrored(false);
    videoKeyRef.current += 1;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, [playbackUrl]);

  const handleRetry = () => {
    console.log('[BuzzLiveViewer] 🔄 Manual retry triggered');
    setErrored(false);
    setRetryCount(0);
    setRetryMessage('');
    setPaused(false);
    videoKeyRef.current += 1;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const scheduleRetry = (error: OnVideoErrorData) => {
    // Check if error is 404 or stream not available
    const errorString = error?.error?.errorString || error?.error?.localizedDescription || '';
    const isStreamNotAvailable =
      errorString.includes('404') ||
      errorString.includes('not found') ||
      errorString.includes('unavailable') ||
      error?.error?.code === '404';

    if (isStreamNotAvailable && retryCount < 5) {
      const nextRetry = retryCount + 1;
      const waitTime = nextRetry * 3000; // 3s, 6s, 9s, 12s, 15s

      console.log(`[BuzzLiveViewer] ⏳ Stream not available yet. Retrying in ${waitTime/1000}s... (Attempt ${nextRetry}/5)`);

      setRetryMessage(`⏳ Waiting for stream... Retrying in ${waitTime/1000}s (${nextRetry}/5)`);
      setBuffering(true);

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      retryTimeoutRef.current = setTimeout(() => {
        console.log(`[BuzzLiveViewer] 🔄 Retrying stream load (attempt ${nextRetry})...`);
        setRetryCount(nextRetry);
        setErrored(false);
        videoKeyRef.current += 1; // Force Video component to reload
        setRetryMessage('');
      }, waitTime);
    } else {
      // Not a 404 error or retries exhausted
      if (retryCount >= 5) {
        console.error('[BuzzLiveViewer] ❌ Stream not available after 5 retries');
        setRetryMessage('Stream not available. Please try again later.');
      } else {
        console.error('[BuzzLiveViewer] ❌ Playback error (not retryable):', errorString);
        setRetryMessage('Unable to play stream');
      }
      setErrored(true);
      setBuffering(false);
    }
  };

  return (
    <View style={[styles.card, style]}>
      <LinearGradient
        colors={['#0f172a', '#111827']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.liveDot, isPlayable ? styles.liveDotActive : styles.liveDotIdle]} />
          <Text style={styles.headerLabel}>{title}</Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setPaused(prev => !prev)}
          disabled={!isPlayable}>
          <Icon name={paused ? 'play' : 'pause'} size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {isPlayable ? (
        <View style={styles.videoWrapper}>
          <Video
            key={videoKeyRef.current}
            source={{ uri: playableUrl as string }}
            style={StyleSheet.absoluteFill}
            controls={false}
            resizeMode={ResizeMode.COVER}
            paused={paused}
            muted={false}
            repeat={false}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="ignore"
            onLoad={(data) => {
              console.log('[BuzzLiveViewer] ✅ Video Player loaded successfully:', {
                duration: data.duration,
                naturalSize: data.naturalSize,
                playbackUrl: playbackUrl?.substring(0, 60) + '...',
                playableUrl: playableUrl?.substring(0, 60) + '...'
              });
              setBuffering(false);
              setRetryCount(0);
              setRetryMessage('');
              if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
              }
            }}
            onLoadStart={() => {
              console.log('[BuzzLiveViewer] ⏳ Loading started...');
              setBuffering(true);
            }}
            onBuffer={(data) => {
              const isBuffering = data?.isBuffering ?? false;
              setBuffering(isBuffering);
              if (isBuffering) {
                console.log('[BuzzLiveViewer] ⏳ Buffering...');
              } else {
                console.log('[BuzzLiveViewer] ✅ Buffering complete');
                console.log('[BuzzLiveViewer] ▶️ Stream is now playing!');
              }
            }}
            onProgress={(data) => {
              console.log('[BuzzLiveViewer] Progress:', {
                currentTime: data.currentTime,
                playableDuration: data.playableDuration,
              });
            }}
            onError={(error) => {
              console.error('[BuzzLiveViewer] ❌ Video Player error:', {
                error: error.error,
                errorCode: error.error?.code,
                errorString: error.error?.errorString || error.error?.localizedDescription,
                playbackUrl: playbackUrl?.substring(0, 60) + '...',
                playableUrl: playableUrl?.substring(0, 60) + '...',
                isValid: isValidPlaybackStreamUrl(playableUrl || undefined),
              });
              scheduleRetry(error);
            }}
            onEnd={() => {
              console.log('[BuzzLiveViewer] ⏸️ Stream ended');
            }}
          />
          {(buffering || retryMessage) && (
            <View style={styles.bufferOverlay}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.bufferLabel}>
                {retryMessage || 'Buffering…'}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ImageBackground
          style={[styles.videoWrapper, styles.placeholder]}
          imageStyle={styles.placeholderImage}
          source={placeholderImage ? {uri: placeholderImage} : undefined}>
          <Icon name="broadcast-off" size={48} color="#94a3b8" />
          <Text style={styles.placeholderText}>
            {retryMessage || 'Stream offline'}
          </Text>
        </ImageBackground>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => setPaused(prev => !prev)}
          disabled={!isPlayable}>
          <Icon name={paused ? 'play-circle' : 'pause-circle'} size={24} color="#fff" />
          <Text style={styles.footerLabel}>{paused ? 'Play' : 'Pause'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleRetry}>
          <Icon name="refresh" size={22} color="#fff" />
          <Text style={styles.footerLabel}>Reload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Icon name="volume-high" size={22} color="#fff" />
          <Text style={styles.footerLabel}>Volume</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    paddingBottom: 16,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#64748b',
  },
  liveDotActive: {
    backgroundColor: '#f87171',
  },
  liveDotIdle: {
    backgroundColor: '#475569',
  },
  headerLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  headerButton: {
    backgroundColor: 'rgba(148,163,184,0.25)',
    padding: 8,
    borderRadius: 16,
  },
  videoWrapper: {
    height: 210,
    borderRadius: 20,
    marginHorizontal: 16,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  bufferOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.45)',
    gap: 10,
  },
  bufferLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  placeholderImage: {
    borderRadius: 20,
  },
  placeholderText: {
    color: '#cbd5f5',
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerButton: {
    alignItems: 'center',
    gap: 6,
  },
  footerLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BuzzLiveViewer;

