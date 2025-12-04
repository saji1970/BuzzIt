import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import IVSPlayer from 'amazon-ivs-react-native-player';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../context/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {LiveStream} from '../components/LiveStreamCard';
import ApiService from '../services/APIService';
import {getPlayableStreamUrl} from '../utils/streamUrl';

const {width, height} = Dimensions.get('window');

interface StreamComment {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  comment: string;
  timestamp: Date;
}

interface StreamViewerScreenProps {
  route: {
    params: {
      stream: LiveStream;
    };
  };
  navigation: any;
}

const StreamViewerScreen: React.FC<StreamViewerScreenProps> = ({
  route,
  navigation,
}) => {
  console.log('[StreamViewerScreen] Component rendering, route:', route);
  const {stream} = route.params;
  console.log('[StreamViewerScreen] Stream from route:', stream);
  const {theme} = useTheme();
  const {user} = useAuth();
  const [comments, setComments] = useState<StreamComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [viewers, setViewers] = useState(stream.viewers || 0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playerState, setPlayerState] = useState<string>('Idle');
  const [isStreamEnded, setIsStreamEnded] = useState(!stream.isLive || !!stream.endedAt);
  const commentListRef = useRef<FlatList>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load initial comments
    loadComments();

    // Poll for new comments every 3 seconds
    const commentInterval = setInterval(() => {
      loadComments();
    }, 3000);

    // Update viewer count every 5 seconds
    const viewerInterval = setInterval(() => {
      updateViewers();
    }, 5000);

    // Increment viewer count when joining
    incrementViewerCount();

    // Auto-hide controls after 3 seconds
    const controlsTimeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      clearInterval(commentInterval);
      clearInterval(viewerInterval);
      clearTimeout(controlsTimeout);
      // Decrement viewer count when leaving
      decrementViewerCount();
    };
  }, [stream.id]);

  const loadComments = async () => {
    try {
      const response = await ApiService.getStreamComments(stream.id);
      if (response.success && response.data) {
        setComments(
          response.data.map((c: any) => ({
            id: c.id,
            userId: c.userId,
            username: c.username,
            displayName: c.displayName,
            comment: c.comment,
            timestamp: new Date(c.timestamp),
          })),
        );
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const updateViewers = async () => {
    try {
      const response = await ApiService.getLiveStream(stream.id);
      if (response.success && response.data) {
        setViewers(response.data.viewers || 0);
        // Check if stream has ended
        const streamEnded = !response.data.isLive || !!response.data.endedAt;
        setIsStreamEnded(prev => {
          if (prev !== streamEnded) {
            console.log('[StreamViewerScreen] Stream ended status changed:', streamEnded);
          }
          return streamEnded;
        });
      }
    } catch (error) {
      console.error('Error updating viewers:', error);
    }
  };

  const incrementViewerCount = async () => {
    try {
      await ApiService.updateViewers(stream.id, 'increment');
    } catch (error) {
      console.error('Error incrementing viewer count:', error);
    }
  };

  const decrementViewerCount = async () => {
    try {
      await ApiService.updateViewers(stream.id, 'decrement');
    } catch (error) {
      console.error('Error decrementing viewer count:', error);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !user) return;

    const comment: StreamComment = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      comment: newComment.trim(),
      timestamp: new Date(),
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');

    // Scroll to bottom
    setTimeout(() => {
      commentListRef.current?.scrollToEnd({animated: true});
    }, 100);

    try {
      const response = await ApiService.addStreamComment(stream.id, comment.comment);
      if (response.success) {
        // Update comment with server response
        setComments(prev =>
          prev.map(c =>
            c.id === comment.id ? {...c, id: response.data.id} : c,
          ),
        );
      }
    } catch (error) {
      console.error('Error sending comment:', error);
      Alert.alert('Error', 'Failed to send comment');
      setComments(prev => prev.filter(c => c.id !== comment.id));
    }
  };

  const formatTime = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    if (seconds > 5) return `${seconds}s ago`;
    return 'now';
  };

  const formatViewers = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  const playableUrl = getPlayableStreamUrl(
    stream.ivsPlaybackUrl || stream.restreamPlaybackUrl || stream.streamUrl,
  );

  console.log('[StreamViewerScreen] Playable URL calculated:', playableUrl);
  console.log('[StreamViewerScreen] Stream URLs:', {
    ivsPlaybackUrl: stream.ivsPlaybackUrl,
    restreamPlaybackUrl: stream.restreamPlaybackUrl,
    streamUrl: stream.streamUrl,
  });

  // Log the URL being used for debugging
  useEffect(() => {
    console.log('[StreamViewerScreen] useEffect - Playable URL:', playableUrl);
    console.log('[StreamViewerScreen] useEffect - Stream data:', {
      ivsPlaybackUrl: stream.ivsPlaybackUrl,
      restreamPlaybackUrl: stream.restreamPlaybackUrl,
      streamUrl: stream.streamUrl,
    });
  }, [playableUrl, stream.ivsPlaybackUrl, stream.restreamPlaybackUrl, stream.streamUrl]);

  const renderComment = ({item}: {item: StreamComment}) => (
    <View style={[styles.commentItem, {backgroundColor: 'rgba(0, 0, 0, 0.6)'}]}>
      <Text style={styles.commentAuthor}>{item.displayName}</Text>
      <Text style={styles.commentText}>{item.comment}</Text>
      <Text style={styles.commentTime}>{formatTime(item.timestamp)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Video Player */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={toggleControls}
        style={styles.videoContainer}>
        {playableUrl && !isStreamEnded ? (
          <IVSPlayer
            ref={playerRef}
            streamUrl={playableUrl}
            autoplay={!paused}
            muted={muted}
            style={styles.video}
            resizeMode="contain"
            onPlayerStateChange={(state) => {
              console.log('[StreamViewerScreen] IVS Player state changed:', state);
              setPlayerState(state);
              // Sync paused state with player state
              if (state === 'Playing' && paused) {
                setPaused(false);
              } else if (state === 'Paused' && !paused) {
                setPaused(true);
              }
              if (state === 'Playing') {
                console.log('[StreamViewerScreen] IVS Player started playing');
              } else if (state === 'Buffering') {
                console.log('[StreamViewerScreen] IVS Player buffering');
              } else if (state === 'Ended') {
                console.log('[StreamViewerScreen] IVS Player ended');
                setIsStreamEnded(true);
              } else if (state === 'Idle') {
                console.log('[StreamViewerScreen] IVS Player state:', state);
              }
            }}
            onError={(error) => {
              console.error('[StreamViewerScreen] IVS Player error:', error);
              console.error('[StreamViewerScreen] Error details:', {
                error: error,
                errorType: typeof error,
                errorString: String(error),
              });
              
              // Check if error is "Failed to load playlist" (404) - likely stream ended
              if (error && (error.includes('Failed to load playlist') || error.includes('404'))) {
                console.log('[StreamViewerScreen] Playlist not available - stream may have ended');
                setIsStreamEnded(true);
                // Don't show error alert for ended streams
                return;
              }
              
              // For other errors, show alert
              Alert.alert(
                'Playback Error',
                `Unable to play this stream. Error: ${error || 'Unknown error'}`,
              );
            }}
            onLoad={(duration) => {
              console.log('[StreamViewerScreen] IVS Player loaded successfully, duration:', duration);
            }}
            onLoadStart={() => {
              console.log('[StreamViewerScreen] IVS Player load started, URL:', playableUrl);
            }}
            onRebuffering={() => {
              console.log('[StreamViewerScreen] IVS Player rebuffering');
            }}
            onDurationChange={(duration) => {
              console.log('[StreamViewerScreen] IVS Player duration:', duration);
            }}
            onProgress={(progress) => {
              // Only log occasionally to avoid spam
              if (progress && progress % 5 < 0.1) {
                console.log('[StreamViewerScreen] IVS Player progress:', progress, 's');
              }
            }}
          />
        ) : (
          <View style={[styles.placeholderContainer, {backgroundColor: theme.colors.background}]}>
            <Icon name="videocam-off" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.placeholderText, {color: theme.colors.textSecondary}]}>
              {isStreamEnded ? 'Stream has ended' : 'Stream not available'}
            </Text>
          </View>
        )}

        {/* Stream Ended Overlay */}
        {isStreamEnded && playableUrl && (
          <View style={[styles.endedOverlay, {backgroundColor: 'rgba(0, 0, 0, 0.8)'}]}>
            <Icon name="stop-circle" size={80} color={theme.colors.textSecondary} />
            <Text style={[styles.endedText, {color: theme.colors.text}]}>
              Stream Ended
            </Text>
            <Text style={[styles.endedSubtext, {color: theme.colors.textSecondary}]}>
              The broadcaster has ended this stream
            </Text>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.topBarInfo}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
                <View style={styles.viewerBadge}>
                  <Icon name="visibility" size={16} color="#FFFFFF" />
                  <Text style={styles.viewerText}>{formatViewers(viewers)}</Text>
                </View>
              </View>
            </View>

            {/* Bottom Bar - Stream Info */}
            <View style={styles.bottomBar}>
              <View style={styles.streamInfo}>
                <View style={styles.streamerInfo}>
                  <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
                    <Text style={styles.avatarText}>
                      {stream.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.streamerName}>{stream.displayName}</Text>
                    <Text style={styles.streamTitle}>{stream.title}</Text>
                  </View>
                </View>

                <View style={styles.videoControls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                      setMuted(!muted);
                      if (playerRef.current) {
                        playerRef.current.setMuted?.(!muted);
                      }
                    }}>
                    <Icon
                      name={muted ? 'volume-off' : 'volume-up'}
                      size={24}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                      const newPausedState = !paused;
                      setPaused(newPausedState);
                      if (playerRef.current) {
                        if (newPausedState) {
                          playerRef.current.pause?.();
                        } else {
                          playerRef.current.play?.();
                        }
                      }
                    }}>
                    <Icon
                      name={paused ? 'play-arrow' : 'pause'}
                      size={24}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Comments Section */}
      <View style={[styles.commentsSection, {backgroundColor: theme.colors.surface}]}>
        <View style={styles.commentsHeader}>
          <Icon name="chat" size={20} color={theme.colors.primary} />
          <Text style={[styles.commentsTitle, {color: theme.colors.text}]}>
            Live Comments
          </Text>
          <Text style={[styles.commentsCount, {color: theme.colors.textSecondary}]}>
            {comments.length}
          </Text>
        </View>

        <FlatList
          ref={commentListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item.id}
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyComments, {color: theme.colors.textSecondary}]}>
              No comments yet. Be the first!
            </Text>
          }
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          <View style={[styles.commentInputContainer, {borderTopColor: theme.colors.border}]}>
            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                },
              ]}
              placeholder="Add a comment..."
              placeholderTextColor={theme.colors.textSecondary}
              value={newComment}
              onChangeText={setNewComment}
              maxLength={500}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {backgroundColor: theme.colors.primary},
                !newComment.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendComment}
              disabled={!newComment.trim()}>
              <Icon name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
  },
  endedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  endedText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  endedSubtext: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
  },
  topBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
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
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  streamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streamerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  streamerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  streamTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
  },
  commentsSection: {
    height: height * 0.35,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentsCount: {
    fontSize: 14,
    marginLeft: 'auto',
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  commentAuthor: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
  },
  emptyComments: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default StreamViewerScreen;
