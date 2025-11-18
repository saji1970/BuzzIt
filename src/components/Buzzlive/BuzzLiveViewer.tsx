import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Video from 'react-native-video';
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

  const playableUrl = useMemo(
    () => getPlayableStreamUrl(playbackUrl),
    [playbackUrl],
  );

  const isPlayable = useMemo(
    () => Boolean(playableUrl && !errored),
    [playableUrl, errored],
  );

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
            source={{uri: playableUrl as string}}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            paused={paused}
            controls={false}
            muted={false}
            onBuffer={({isBuffering}) => setBuffering(isBuffering)}
            onError={error => {
              console.error('BuzzLive viewer error', {
                error,
                playbackUrl,
                playableUrl,
                isValid: isValidPlaybackStreamUrl(playableUrl || undefined),
              });
              setErrored(true);
            }}
            repeat
          />
          {buffering && (
            <View style={styles.bufferOverlay}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.bufferLabel}>Buffering…</Text>
            </View>
          )}
        </View>
      ) : (
        <ImageBackground
          style={[styles.videoWrapper, styles.placeholder]}
          imageStyle={styles.placeholderImage}
          source={placeholderImage ? {uri: placeholderImage} : undefined}>
          <Icon name="broadcast-off" size={48} color="#94a3b8" />
          <Text style={styles.placeholderText}>Stream offline</Text>
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
          onPress={() => {
            setErrored(false);
            setPaused(false);
          }}>
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

