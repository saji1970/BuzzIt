import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, ActivityIndicator, Text, Alert} from 'react-native';
import Video, {ResizeMode, OnVideoErrorData} from 'react-native-video';

interface StreamVideoPlayerProps {
  playbackUrl: string;
  streamId: string;
  isLive: boolean;
  style?: any;
  onError?: (error: any) => void;
}

const StreamVideoPlayer: React.FC<StreamVideoPlayerProps> = ({
  playbackUrl,
  streamId,
  isLive,
  style,
  onError,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [retryMessage, setRetryMessage] = useState('');
  const mountedRef = useRef(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoKeyRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, []);

  // Reset state when URL changes
  useEffect(() => {
    setIsReady(false);
    setHasError(false);
    setRetryCount(0);
    setRetryMessage('');
    videoKeyRef.current += 1;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, [playbackUrl]);

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

      console.log(`[StreamVideoPlayer] ⏳ Stream not available yet. Retrying in ${waitTime/1000}s... (Attempt ${nextRetry}/5)`);

      if (mountedRef.current) {
        setRetryMessage(`⏳ Waiting for stream... Retrying in ${waitTime/1000}s (${nextRetry}/5)`);
        setIsReady(false);
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      retryTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          console.log(`[StreamVideoPlayer] 🔄 Retrying stream load (attempt ${nextRetry})...`);
          setRetryCount(nextRetry);
          setHasError(false);
          setRetryMessage('');
          videoKeyRef.current += 1; // Force Video component to reload
        }
      }, waitTime);
    } else {
      // Not a 404 error or retries exhausted
      if (mountedRef.current) {
        if (retryCount >= 5) {
          console.error('[StreamVideoPlayer] ❌ Stream not available after 5 retries');
          setRetryMessage('Stream not available. Please wait 15-20 seconds after starting broadcast, then try again.');
        } else {
          console.error('[StreamVideoPlayer] ❌ Playback error (not retryable):', errorString);
          setRetryMessage('Unable to play stream');
        }
        setHasError(true);
      }

      // Call custom error handler
      if (onError) {
        onError(error);
      }
    }
  };

  if (!playbackUrl || hasError) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>
          {retryMessage || 'Unable to load video'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Video
        key={videoKeyRef.current}
        source={{uri: playbackUrl}}
        style={StyleSheet.absoluteFill}
        controls={true}
        resizeMode={ResizeMode.CONTAIN}
        paused={false}
        muted={false}
        repeat={false}
        playInBackground={false}
        playWhenInactive={false}
        onLoad={() => {
          console.log('[StreamVideoPlayer] ✅ Video loaded successfully');
          if (mountedRef.current) {
            setIsReady(true);
            setRetryCount(0);
            setRetryMessage('');
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
              retryTimeoutRef.current = null;
            }
          }
        }}
        onLoadStart={() => {
          console.log('[StreamVideoPlayer] ⏳ Loading started...');
          if (mountedRef.current) {
            setIsReady(false);
          }
        }}
        onBuffer={(data: any) => {
          const isBuffering = data?.isBuffering ?? false;
          if (isBuffering) {
            console.log('[StreamVideoPlayer] ⏳ Buffering...');
          } else {
            console.log('[StreamVideoPlayer] ✅ Buffering complete');
          }
          if (mountedRef.current) {
            setIsReady(!isBuffering);
          }
        }}
        onError={(error: OnVideoErrorData) => {
          console.error('[StreamVideoPlayer] ❌ Video error:', {
            error: error.error,
            errorCode: error.error?.code,
            errorString: error.error?.errorString || error.error?.localizedDescription,
          });
          if (mountedRef.current) {
            scheduleRetry(error);
          }
        }}
      />
      {(!isReady || retryMessage) && !hasError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>
            {retryMessage || 'Loading stream...'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 14,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default StreamVideoPlayer;

