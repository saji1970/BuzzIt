import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';

const {width} = Dimensions.get('window');

export interface LiveStream {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  title: string;
  description?: string;
  streamUrl: string;
  thumbnailUrl?: string | null;
  isLive: boolean;
  viewers: number;
  category?: string;
  startedAt: string | Date;
  tags?: string[];
}

interface LiveStreamCardProps {
  stream: LiveStream;
  onPress?: (stream: LiveStream) => void;
  onUserPress?: (userId: string) => void;
}

const LiveStreamCard: React.FC<LiveStreamCardProps> = ({
  stream,
  onPress,
  onUserPress,
}) => {
  const {theme} = useTheme();
  const [videoRef, setVideoRef] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Auto-play video when stream is live and has URL
    if (stream.isLive && stream.streamUrl && videoRef) {
      videoRef.playAsync().catch((error) => {
        console.log('Auto-play prevented or failed:', error);
      });
    }
    
    return () => {
      if (videoRef) {
        videoRef.unloadAsync().catch(() => {});
      }
    };
  }, [stream.isLive, stream.streamUrl]);

  const handlePlayPause = async () => {
    if (!videoRef) return;

    try {
      if (isPlaying) {
        await videoRef.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Play/pause error:', error);
    }
  };

  const formatViewers = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDuration = (startedAt: string | Date): string => {
    const start = typeof startedAt === 'string' ? new Date(startedAt) : startedAt;
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress && onPress(stream)}
        onLongPress={() => setShowControls(!showControls)}>
        {/* Video Player or Thumbnail */}
        <View style={styles.videoContainer}>
          {stream.streamUrl && stream.isLive ? (
            <Video
              ref={(ref) => {
                setVideoRef(ref);
                if (ref && stream.isLive) {
                  // Try to play when ref is set
                  setTimeout(() => {
                    ref.playAsync().catch(() => {});
                  }, 100);
                }
              }}
              source={{ uri: stream.streamUrl }}
              style={styles.video}
              useNativeControls={false}
              resizeMode="cover"
              shouldPlay={stream.isLive}
              isLooping={false}
              isMuted={true}
              onLoad={() => {
                if (videoRef && stream.isLive) {
                  setIsPlaying(true);
                  videoRef.playAsync().catch(() => {});
                }
              }}
              onError={(error) => {
                console.log('Video playback error:', error);
              }}
            />
          ) : (
            <View style={[styles.thumbnail, {backgroundColor: theme.colors.background}]}>
              {stream.thumbnailUrl ? (
                <Image
                  source={{ uri: stream.thumbnailUrl }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              ) : (
                <Icon name="videocam" size={48} color={theme.colors.textSecondary} />
              )}
            </View>
          )}

          {/* Live Badge */}
          {stream.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}

          {/* Viewer Count */}
          <View style={styles.viewerBadge}>
            <Icon name="visibility" size={14} color="#FFFFFF" />
            <Text style={styles.viewerText}>{formatViewers(stream.viewers)}</Text>
          </View>

          {/* Play/Pause Overlay */}
          {showControls && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}>
              <Icon
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={40}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}

          {/* Duration */}
          {!stream.isLive && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>
                {formatDuration(stream.startedAt)}
              </Text>
            </View>
          )}
        </View>

        {/* Stream Info */}
        <View style={styles.infoContainer}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => onUserPress && onUserPress(stream.userId)}>
            <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
              <Text style={styles.avatarText}>
                {stream.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.username, {color: theme.colors.text}]}>
                {stream.displayName}
              </Text>
              {stream.category && (
                <Text style={[styles.category, {color: theme.colors.textSecondary}]}>
                  {stream.category}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text
              style={[styles.title, {color: theme.colors.text}]}
              numberOfLines={2}>
              {stream.title}
            </Text>
          </View>

          {/* Tags */}
          {stream.tags && stream.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {stream.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  style={[styles.tag, {backgroundColor: theme.colors.primary + '20'}]}>
                  <Text style={[styles.tagText, {color: theme.colors.primary}]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0069',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  viewerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  viewerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default LiveStreamCard;

