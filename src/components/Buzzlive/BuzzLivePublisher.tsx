import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  NativeModules,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NodePublisher} from 'react-native-nodemediaclient';

export type BuzzLivePublisherStatus = 'idle' | 'connecting' | 'live' | 'error';

export interface BuzzLivePublisherHandle {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  switchCamera: () => void;
}

interface BuzzLivePublisherProps {
  rtmpUrl?: string;
  startTrigger?: string | number | null;
  onStatusChange?: (status: BuzzLivePublisherStatus) => void;
  style?: ViewStyle;
  showControls?: boolean;
}

const statusFromCode = (code: number): BuzzLivePublisherStatus => {
  switch (code) {
    case 2000: // connecting
    case 2001:
    case 2002:
      return 'connecting';
    case 2004: // closed
      return 'idle';
    case 2005: // error
      return 'error';
    default:
      if (code >= 200 && code < 300) {
        return 'live';
      }
      return 'idle';
  }
};

type NodePublisherComponent = {
  start: () => void;
  stop: () => void;
  startPreview: () => void;
  stopPreview: () => void;
};

const BuzzLivePublisher = forwardRef<BuzzLivePublisherHandle, BuzzLivePublisherProps>(
  ({rtmpUrl = '', startTrigger, onStatusChange, style, showControls = true}, ref) => {
    const cameraRef = useRef<NodePublisherComponent | null>(null);
    const lastTriggerRef = useRef<typeof startTrigger>(null);
    const [status, setStatus] = useState<BuzzLivePublisherStatus>('idle');
    const [busy, setBusy] = useState(false);
    const [useFrontCamera, setUseFrontCamera] = useState(true);

    const isSimulator = useMemo(() => {
      if (Platform.OS !== 'ios') {
        return false;
      }
      const hasNativePublisher = !!NativeModules?.RCTNodePublisherManager;
      if (!hasNativePublisher) {
        return true;
      }
      const constants: Record<string, unknown> = Platform.constants ?? {};
      const candidate =
        (typeof constants?.deviceName === 'string' && constants.deviceName) ||
        (typeof constants?.model === 'string' && constants.model) ||
        '';
      if (typeof candidate === 'string' && candidate.toLowerCase().includes('simulator')) {
        return true;
      }
      const envName =
        (typeof process !== 'undefined' && typeof process?.env?.SIMULATOR_DEVICE_NAME === 'string'
          ? process.env.SIMULATOR_DEVICE_NAME
          : '') || '';
      return envName.length > 0;
    }, []);

    const normalizedUrl = useMemo(() => {
      if (!rtmpUrl) {
        console.log('[BuzzLivePublisher] No RTMP URL provided');
        return '';
      }
      
      // Improved URL formatting (matching web implementation)
      let url = rtmpUrl.trim();
      console.log('[BuzzLivePublisher] Processing RTMP URL:', {
        original: url.substring(0, 60) + '...',
        length: url.length
      });
      
      // Convert RTMPS to RTMP (NodeMediaClient doesn't support RTMPS)
      if (url.startsWith('rtmps://')) {
        url = url.replace('rtmps://', 'rtmp://');
        // Replace port 443 with 1935 (standard RTMP port)
        if (url.includes(':443')) {
          url = url.replace(':443', ':1935');
          console.log('[BuzzLivePublisher] Converted RTMPS to RTMP, changed port 443 to 1935');
        } else if (!url.match(/:\d+/)) {
          // No port specified, add standard RTMP port
          const hostMatch = url.match(/^rtmp:\/\/([^\/]+)/);
          if (hostMatch) {
            url = url.replace(/^rtmp:\/\/([^\/]+)/, 'rtmp://$1:1935');
            console.log('[BuzzLivePublisher] Converted RTMPS to RTMP, added port 1935');
          }
        } else {
          console.log('[BuzzLivePublisher] Converted RTMPS to RTMP, keeping existing port');
        }
      }
      
      console.log('[BuzzLivePublisher] ✅ Normalized URL:', {
        normalized: url.substring(0, 60) + '...',
        protocol: url.substring(0, 8)
      });
      
      return url;
    }, [rtmpUrl]);

    const ensurePermissions = useCallback(async () => {
      if (Platform.OS !== 'android') {
        return true;
      }
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      return Object.values(results).every(result => result === PermissionsAndroid.RESULTS.GRANTED);
    }, []);

    const updateStatus = useCallback(
      (next: BuzzLivePublisherStatus) => {
        setStatus(next);
        onStatusChange?.(next);
      },
      [onStatusChange],
    );

    const handleStart = useCallback(async () => {
      if (!normalizedUrl) {
        Alert.alert(
          'Streaming URL missing',
          'We could not find an RTMP ingest URL for this stream yet.',
        );
        return;
      }
      if (isSimulator) {
        Alert.alert(
          'Camera not available',
          'iOS Simulator does not provide camera access. Please test BuzzLive on a physical device.',
        );
        return;
      }

      const permitted = await ensurePermissions();
      if (!permitted) {
        Alert.alert('Permissions required', 'Camera and microphone permissions are needed.');
        return;
      }
      if (status === 'live' || busy) {
        return;
      }
      try {
        setBusy(true);
        updateStatus('connecting');
        cameraRef.current?.start();
      } catch (error: any) {
        console.error('[BuzzLivePublisher] Start error:', {
          message: error.message,
          stack: error.stack,
          error,
          rtmpUrl: normalizedUrl.substring(0, 60) + '...'
        });
        updateStatus('error');
        setBusy(false);
        Alert.alert(
          'Stream Start Error',
          `Failed to start broadcasting: ${error.message || 'Unknown error'}\n\n` +
          `Please check:\n` +
          `1. RTMP URL is correct: ${normalizedUrl ? 'Set' : 'Missing'}\n` +
          `2. Network connectivity\n` +
          `3. Camera and microphone permissions\n` +
          `4. Try again`,
        );
      }
    }, [busy, ensurePermissions, normalizedUrl, status, updateStatus]);

    const handleStop = useCallback(async () => {
      try {
        setBusy(true);
        updateStatus('idle');
        // Stop the stream - this should stop both stream and preview
        if (cameraRef.current) {
          try {
            cameraRef.current.stop();
            console.log('Camera stopped successfully');
          } catch (stopError) {
            console.error('Error stopping camera:', stopError);
            // Continue with cleanup even if stop fails
          }
        }
      } catch (error: any) {
        console.error('Error in handleStop:', error);
        updateStatus('error');
      } finally {
        setBusy(false);
        updateStatus('idle');
      }
    }, [updateStatus]);

    const handleSwitch = useCallback(() => {
      if (isSimulator) {
        Alert.alert(
          'Camera not available',
          'Camera switching is unavailable in the iOS Simulator.',
        );
        return;
      }
      setUseFrontCamera(prev => !prev);
    }, [isSimulator]);

    useImperativeHandle(
      ref,
      () => ({
        start: handleStart,
        stop: handleStop,
        switchCamera: handleSwitch,
      }),
      [handleStart, handleStop, handleSwitch],
    );

    useEffect(() => {
      if (!normalizedUrl || isSimulator) {
        return;
      }
      if (startTrigger === undefined || startTrigger === null) {
        return;
      }
      if (lastTriggerRef.current === startTrigger) {
        return;
      }
      lastTriggerRef.current = startTrigger;
      handleStart();
    }, [handleStart, normalizedUrl, startTrigger]);

    return (
      <View style={[styles.root, style]}>
        <LinearGradient
          colors={['#0f172a', '#020617']}
          style={StyleSheet.absoluteFillObject}
        />
        {!isSimulator ? (
          <NodePublisher
          style={StyleSheet.absoluteFill}
          ref={ref => {
            cameraRef.current = ref;
          }}
          url={normalizedUrl}
          frontCamera={useFrontCamera}
          audioParam={{
            codecid: NodePublisher.NMC_CODEC_ID_AAC,
            profile: NodePublisher.NMC_PROFILE_AAC_LC,
            samplerate: 44100,
            channels: 1,
            bitrate: 96000,
          }}
          videoParam={{
            codecid: NodePublisher.NMC_CODEC_ID_H264,
            profile: NodePublisher.NMC_PROFILE_H264_MAIN,
            width: 720,
            height: 1280,
            fps: 30,
            bitrate: 1_800_000,
          }}
          camera={{
            cameraId: useFrontCamera ? 1 : 0,
            cameraFrontMirror: useFrontCamera,
          }}
          HWAccelEnable
          denoiseEnable
          enhancedRtmp
          onEvent={(code: number, msg: string) => {
            const mapped = statusFromCode(code);
            console.log('[BuzzLivePublisher] NodePublisher event:', {
              code,
              msg,
              status: mapped,
              rtmpUrl: normalizedUrl.substring(0, 60) + '...'
            });
            
            if (mapped === 'connecting') {
              updateStatus('connecting');
              console.log('[BuzzLivePublisher] 🔄 Connecting to RTMP server...');
            } else if (mapped === 'live') {
              updateStatus('live');
              setBusy(false);
              console.log('[BuzzLivePublisher] ✅ Stream is now live!');
            } else if (mapped === 'idle') {
              updateStatus('idle');
              setBusy(false);
              console.log('[BuzzLivePublisher] ⏸️ Stream idle');
            } else if (mapped === 'error') {
              console.error('[BuzzLivePublisher] ❌ Streaming error:', {
                code,
                message: msg,
                rtmpUrl: normalizedUrl.substring(0, 60) + '...'
              });
              updateStatus('error');
              setBusy(false);
              Alert.alert(
                'Streaming Error',
                `Broadcasting error: ${msg || `Code ${code}`}\n\n` +
                `Please check:\n` +
                `1. RTMP URL is correct\n` +
                `2. Network connectivity\n` +
                `3. IVS service status\n` +
                `4. Note: IVS may require RTMPS (not RTMP)\n` +
                `5. Try again`,
              );
            }
          }}
        />
        ) : (
          <View style={styles.simulatorOverlay}>
            <Icon name="camera-off" size={48} color="rgba(255,255,255,0.6)" />
            <Text style={styles.simulatorTitle}>Camera Unavailable</Text>
            <Text style={styles.simulatorSubtitle}>
              BuzzLive needs a real device camera. Connect an iPhone or Android device to test live
              streaming.
            </Text>
          </View>
        )}

        {showControls && (
          <>
            <View style={styles.statusPill}>
              <View
                style={[styles.statusDot, status === 'live' ? styles.statusDotLive : styles.statusDotIdle]}
              />
              <Text style={styles.statusText}>
                {status === 'connecting'
                  ? 'Connecting…'
                  : status === 'live'
                  ? 'Live'
                  : status === 'error'
                  ? 'Error'
                  : 'Offline'}
              </Text>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleSwitch}
              >
                <Icon name="camera-switch" size={22} color="#fff" />
                <Text style={styles.buttonLabel}>{useFrontCamera ? 'Front' : 'Rear'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  status === 'live' ? styles.stopButton : styles.startButton,
                ]}
                onPress={status === 'live' ? handleStop : handleStart}
                disabled={busy || !normalizedUrl}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon
                      name={status === 'live' ? 'stop-circle' : 'broadcast'}
                      size={22}
                      color="#fff"
                    />
                    <Text style={styles.buttonLabel}>
                      {status === 'live' ? 'Stop' : 'Go Live'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  },
);

BuzzLivePublisher.displayName = 'BuzzLivePublisher';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  statusPill: {
    position: 'absolute',
    top: 32,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderRadius: 999,
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotLive: {
    backgroundColor: '#ef4444',
  },
  statusDotIdle: {
    backgroundColor: '#64748b',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  controls: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  startButton: {
    backgroundColor: '#22c55e',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  secondaryButton: {
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  simulatorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  simulatorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  simulatorSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BuzzLivePublisher;
