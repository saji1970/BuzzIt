import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IVSPlayer from 'amazon-ivs-react-native-player';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {LiveStream} from '../components/LiveStreamCard';
import ApiService from '../services/APIService';
import {getPlayableStreamUrl, isValidPlaybackStreamUrl} from '../utils/streamUrl';

const {width, height} = Dimensions.get('window');

interface StreamComment {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  comment: string;
  timestamp: Date;
}

type AugmentedLiveStream = LiveStream & {
  ivsPlaybackUrl?: string | null;
  restreamPlaybackUrl?: string | null;
};

interface StreamViewerScreenProps {
  stream: AugmentedLiveStream;
  visible?: boolean;
  onClose: () => void;
}

const StreamViewerScreen: React.FC<StreamViewerScreenProps> = ({
  stream,
  visible = true,
  onClose,
}) => {
  const {theme} = useTheme();
  const {user: currentUser} = useAuth();
  const [comments, setComments] = useState<StreamComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [viewers, setViewers] = useState(stream.viewers || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [enrichedStream, setEnrichedStream] = useState<AugmentedLiveStream>(stream);
  const commentsEndRef = useRef<View>(null);
  
  // Update enriched stream when prop changes
  useEffect(() => {
    setEnrichedStream(stream);
  }, [stream]);
  const playbackUrl = useMemo(() => {
    // Use enriched stream data (may have been updated from API)
    const currentStream = enrichedStream;
    
    // Prioritize IVS playback URL first if available (since you can see it in IVS)
    const prioritized =
      currentStream.ivsPlaybackUrl || currentStream.restreamPlaybackUrl || currentStream.streamUrl || '';
    
    console.log('[StreamViewer] 🔍 Starting playback URL resolution:', {
      streamId: currentStream.id,
      ivsPlaybackUrl: currentStream.ivsPlaybackUrl ? currentStream.ivsPlaybackUrl.substring(0, 100) + '...' : null,
      restreamPlaybackUrl: currentStream.restreamPlaybackUrl ? currentStream.restreamPlaybackUrl.substring(0, 100) + '...' : null,
      streamUrl: currentStream.streamUrl ? currentStream.streamUrl.substring(0, 100) + '...' : null,
      isLive: currentStream.isLive,
    });
    
    // For IVS URLs, use them directly without sanitization if they're already valid
    let playable = '';
    
    if (currentStream.ivsPlaybackUrl && currentStream.ivsPlaybackUrl.trim()) {
      // IVS URLs are typically HLS (.m3u8) format
      // IVS URLs can be:
      // - Full HLS URL: https://...amazonaws.com/.../channel-id.m3u8
      // - Base playback URL: https://...playback.live-video.net/api/video/v1/...
      // - IVS domain URLs: https://...ivs.video/...
      const ivsUrl = currentStream.ivsPlaybackUrl.trim();
      const isHttp = ivsUrl.startsWith('http://') || ivsUrl.startsWith('https://');
      const hasIvsIndicator = ivsUrl.includes('.m3u8') || 
                              ivsUrl.includes('.mpd') || 
                              ivsUrl.includes('amazonaws.com') || 
                              ivsUrl.includes('ivs') ||
                              ivsUrl.includes('playback.live-video.net') ||
                              ivsUrl.includes('ivs.video');
      
      if (isHttp && hasIvsIndicator) {
        playable = ivsUrl;
        console.log('[StreamViewer] ✅ Using IVS playback URL directly:', playable.substring(0, 100) + '...');
      } else {
        // Try sanitization as fallback
        const sanitized = getPlayableStreamUrl(ivsUrl);
        if (sanitized) {
          playable = sanitized;
          console.log('[StreamViewer] ✅ Using sanitized IVS URL:', playable.substring(0, 100) + '...');
        } else {
          console.warn('[StreamViewer] ⚠️ IVS URL failed validation:', ivsUrl.substring(0, 100));
        }
      }
    }
    
    // Fallback to restream playback URL
    if (!playable && currentStream.restreamPlaybackUrl && currentStream.restreamPlaybackUrl.trim()) {
      const sanitized = getPlayableStreamUrl(currentStream.restreamPlaybackUrl);
      if (sanitized) {
        playable = sanitized;
        console.log('[StreamViewer] ✅ Using restream playback URL:', playable.substring(0, 100) + '...');
      }
    }
    
    // Final fallback to streamUrl
    if (!playable && currentStream.streamUrl && currentStream.streamUrl.trim()) {
      const sanitized = getPlayableStreamUrl(currentStream.streamUrl);
      if (sanitized) {
        playable = sanitized;
        console.log('[StreamViewer] ✅ Using streamUrl as fallback:', playable.substring(0, 100) + '...');
      }
    }
    
    console.log('[StreamViewer] 📊 Final playback URL resolution:', {
      streamId: currentStream.id,
      hasPlayableUrl: !!playable,
      playableUrl: playable ? playable.substring(0, 100) + '...' : null,
      isLive: currentStream.isLive,
      willRenderPlayer: !!(playable && currentStream.isLive && isValidStreamUrl(playable)),
    });
    
    return playable;
  }, [enrichedStream.ivsPlaybackUrl, enrichedStream.restreamPlaybackUrl, enrichedStream.streamUrl, enrichedStream.id, enrichedStream.isLive]);

  useEffect(() => {
    if (visible && stream) {
      // If playback URL is missing, try to fetch fresh stream data
      if (!stream.ivsPlaybackUrl && !stream.restreamPlaybackUrl && !stream.streamUrl && stream.id) {
        console.log('[StreamViewer] ⚠️ Missing playback URLs, fetching fresh stream data...');
        checkStreamStatus();
      }
      
      // Check if stream is still live before loading
      checkStreamStatus();
      loadComments();
      incrementViewer();
      startViewerUpdates();
      
      // Poll for new comments every 3 seconds
      const commentInterval = setInterval(() => {
        loadComments();
      }, 3000);
      
      // Poll for stream status every 5 seconds to catch ended streams
      const statusInterval = setInterval(() => {
        checkStreamStatus();
      }, 5000);
      
      return () => {
        decrementViewer();
        stopViewerUpdates();
        clearInterval(commentInterval);
        clearInterval(statusInterval);
      };
    }
  }, [visible, stream]);
  
  const checkStreamStatus = async () => {
    try {
      const response = await ApiService.getLiveStream(enrichedStream.id);
      if (response.success && response.data) {
        // Update stream data with fresh playback URLs if missing
        if (response.data.ivsPlaybackUrl && !enrichedStream.ivsPlaybackUrl) {
          console.log('[StreamViewer] ✅ Fetched fresh IVS playback URL:', response.data.ivsPlaybackUrl.substring(0, 60) + '...');
          // Update enriched stream state with fresh data
          setEnrichedStream(prev => ({
            ...prev,
            ivsPlaybackUrl: response.data.ivsPlaybackUrl,
            restreamPlaybackUrl: response.data.restreamPlaybackUrl,
            streamUrl: response.data.streamUrl,
          }));
        }
        
        // If stream is no longer live, close the viewer
        if (!response.data.isLive || response.data.endedAt) {
          Alert.alert(
            'Stream Ended',
            'This live stream has ended.',
            [{ text: 'OK', onPress: onClose }]
          );
        }
      }
    } catch (error) {
      console.error('Error checking stream status:', error);
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when new comment arrives
    if (comments.length > 0 && commentsEndRef.current) {
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({behavior: 'smooth'});
      }, 100);
    }
  }, [comments]);

  const startViewerUpdates = () => {
    const interval = setInterval(async () => {
      try {
        const response = await ApiService.getLiveStream(enrichedStream.id);
        if (response.success && response.data) {
          setViewers(response.data.viewers || 0);
        }
      } catch (error) {
        console.error('Error updating viewer count:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  const stopViewerUpdates = () => {
    // Cleanup handled by useEffect return
  };

  const incrementViewer = async () => {
    try {
      await ApiService.updateViewers(enrichedStream.id, 'increment');
    } catch (error) {
      console.error('Error incrementing viewer:', error);
    }
  };

  const decrementViewer = async () => {
    try {
      await ApiService.updateViewers(enrichedStream.id, 'decrement');
    } catch (error) {
      console.error('Error decrementing viewer:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await ApiService.getStreamComments(enrichedStream.id);
      if (response.success && response.data) {
        setComments(response.data.map((c: any) => ({
          id: c.id,
          userId: c.userId,
          username: c.username,
          displayName: c.displayName,
          comment: c.comment,
          timestamp: new Date(c.timestamp),
        })));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const sendComment = async () => {
    if (!newComment.trim()) return;

    const comment: StreamComment = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'current-user',
      username: currentUser?.username || 'currentuser',
      displayName: currentUser?.displayName || currentUser?.username || 'You',
      comment: newComment.trim(),
      timestamp: new Date(),
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');

      // Send to backend API
    try {
      const response = await ApiService.addStreamComment(enrichedStream.id, comment.comment);
      if (response.success && response.data) {
        // Update comment with server response
        setComments(prev => prev.map(c => 
          c.id === comment.id ? {
            ...c,
            id: response.data.id,
            timestamp: new Date(response.data.timestamp),
          } : c
        ));
      }
    } catch (error) {
      console.error('Error sending comment:', error);
      // Remove optimistic comment on error
      setComments(prev => prev.filter(c => c.id !== comment.id));
      Alert.alert('Error', 'Failed to send comment. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://buzzit-production.up.railway.app/stream/${enrichedStream.id}`;
      const result = await Share.share({
        message: `Check out ${enrichedStream.displayName}'s live stream: "${enrichedStream.title}"\n${shareUrl}`,
        title: enrichedStream.title,
      });

      if (result.action === Share.sharedAction) {
        // Comment shared successfully
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share stream link');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Send like to backend
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Check if stream URL is valid (must be a full URL, not a relative path)
  const isValidStreamUrl = (url: string): boolean => {
    if (!url || url.trim() === '') {
      console.warn('[StreamViewer] ❌ Empty stream URL');
      return false;
    }
    
    const trimmedUrl = url.trim();
    const isHttp = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
    
    if (!isHttp) {
      console.warn('[StreamViewer] ❌ URL missing HTTP/HTTPS protocol:', trimmedUrl.substring(0, 50));
      return false;
    }
    
    // Allow HLS (.m3u8) and DASH (.mpd) URLs
    const isHls = trimmedUrl.includes('.m3u8');
    const isDash = trimmedUrl.includes('.mpd');
    
    // IVS URLs might contain 'ivs', 'amazonaws.com', 'ivs.video', or 'playback.live-video.net'
    const isIvsUrl = trimmedUrl.includes('ivs') || 
                     trimmedUrl.includes('amazonaws.com') || 
                     trimmedUrl.includes('ivs.video') ||
                     trimmedUrl.includes('playback.live-video.net');
    
    // For HLS/DASH/IVS streams, be more lenient with validation
    if (isHttp && (isHls || isDash || isIvsUrl)) {
      console.log('[StreamViewer] ✅ Valid playback stream URL detected:', {
        url: trimmedUrl.substring(0, 100) + (trimmedUrl.length > 100 ? '...' : ''),
        isHls,
        isDash,
        isIvsUrl,
      });
      return true;
    }
    
    // Use the utility function for additional validation
    const valid = isValidPlaybackStreamUrl(trimmedUrl);
    if (!valid) {
      console.warn('[StreamViewer] ❌ Invalid stream URL detected:', trimmedUrl.substring(0, 100));
      console.warn('[StreamViewer] URL validation details:', {
        hasProtocol: isHttp,
        isHls,
        isDash,
        isIvsUrl,
        length: trimmedUrl.length,
        urlPreview: trimmedUrl.substring(0, 150),
      });
    } else {
      console.log('[StreamViewer] ✅ URL passed validation:', trimmedUrl.substring(0, 100) + '...');
    }
    return valid;
  };

  const renderComment = ({item}: {item: StreamComment}) => (
    <View style={[styles.commentItem, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.commentHeader}>
        <Text style={[styles.commentAuthor, {color: theme.colors.text}]}>
          {item.displayName}
        </Text>
        <Text style={[styles.commentTime, {color: theme.colors.textSecondary}]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
      <Text style={[styles.commentText, {color: theme.colors.text}]}>
        {item.comment}
      </Text>
    </View>
  );

  if (!visible || !stream) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={[styles.container, {backgroundColor: '#000'}]}>
        {/* Video Player */}
        <View style={styles.videoContainer}>
          {playbackUrl && enrichedStream.isLive && isValidStreamUrl(playbackUrl) ? (
            <IVSPlayer
              streamUrl={playbackUrl}
              style={styles.video}
              autoplay={true}
              muted={false}
              onLoad={(duration) => {
                console.log('[IVS Player] ✅ Loaded successfully for stream:', enrichedStream.id);
                console.log('[IVS Player] Duration:', duration);
                console.log('[IVS Player] Playback URL:', playbackUrl);
              }}
              onPlayerStateChange={(state) => {
                console.log('[IVS Player] State changed:', state);
                if (state === 'playing') {
                  console.log('[IVS Player] ✅ Stream is now playing!');
                } else if (state === 'buffering') {
                  console.log('[IVS Player] ⏳ Buffering...');
                } else if (state === 'error' || state === 'idle') {
                  console.warn('[IVS Player] ⚠️ Player state:', state);
                }
              }}
              onError={(errorType, error) => {
                console.error('[IVS Player] ❌ Error occurred:');
                console.error('[IVS Player] Error Type:', errorType);
                console.error('[IVS Player] Error Details:', error);
                console.error('[IVS Player] Failed URL:', playbackUrl);
                console.error('[IVS Player] Stream Info:', {
                  streamId: enrichedStream.id,
                  isLive: enrichedStream.isLive,
                  ivsPlaybackUrl: enrichedStream.ivsPlaybackUrl ? enrichedStream.ivsPlaybackUrl.substring(0, 100) + '...' : null,
                  restreamPlaybackUrl: enrichedStream.restreamPlaybackUrl ? enrichedStream.restreamPlaybackUrl.substring(0, 100) + '...' : null,
                  streamUrl: enrichedStream.streamUrl ? enrichedStream.streamUrl.substring(0, 100) + '...' : null,
                });
                
                // Show error message to user with more context
                const errorMessage = errorType 
                  ? `Unable to play stream: ${errorType}. ${error || ''}`
                  : 'Unable to play stream. Please check if the stream is active and the playback URL is valid.';
                
                Alert.alert(
                  'Stream Error',
                  errorMessage,
                  [{ text: 'OK' }]
                );
              }}
              onProgress={(position) => {
                // Stream progress tracking (for live streams, position may be 0)
              }}
            />
          ) : enrichedStream.isLive ? (
            <View style={styles.placeholderVideo}>
              <Icon name="videocam" size={64} color="#FFFFFF" />
              <Text style={styles.placeholderText}>Live stream starting...</Text>
              <Text style={[styles.placeholderText, { fontSize: 14, marginTop: 8, opacity: 0.7, paddingHorizontal: 20 }]}>
                {!playbackUrl || playbackUrl.trim() === ''
                  ? 'Waiting for playback URL. The broadcaster is setting up their stream. Video will appear once the stream is connected to the media server.'
                  : playbackUrl.startsWith('rtmp://')
                  ? 'Streaming server is being configured. Please wait for the stream to connect.'
                  : 'The broadcaster is using their camera. Stream will be available once connected to media server.'}
              </Text>
              {playbackUrl && (
                <Text style={[styles.placeholderText, { fontSize: 12, marginTop: 8, opacity: 0.5, paddingHorizontal: 20 }]}>
                  Debug: {playbackUrl.substring(0, 80)}...
                </Text>
              )}
              {(!enrichedStream.ivsPlaybackUrl && !enrichedStream.restreamPlaybackUrl && !enrichedStream.streamUrl) && (
                <Text style={[styles.placeholderText, { fontSize: 12, marginTop: 8, opacity: 0.5, paddingHorizontal: 20 }]}>
                  No playback URL available. Please check server configuration.
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.placeholderVideo}>
              <Icon name="videocam-off" size={64} color="#FFFFFF" />
              <Text style={styles.placeholderText}>Stream has ended</Text>
            </View>
          )}

          {/* Live Badge */}
          {enrichedStream.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}

          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}>
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}>
              <Icon name="share" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Stream Info Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.infoOverlay}>
            <View style={styles.streamInfo}>
              <Text style={styles.streamTitle}>{enrichedStream.title}</Text>
              <Text style={styles.streamAuthor}>{enrichedStream.displayName}</Text>
            </View>
            <View style={styles.streamStats}>
              <View style={styles.statItem}>
                <Icon name="visibility" size={16} color="#FFFFFF" />
                <Text style={styles.statText}>{viewers} viewers</Text>
              </View>
              <TouchableOpacity
                style={[styles.likeButton, isLiked && styles.likeButtonActive]}
                onPress={handleLike}>
                <Icon
                  name={isLiked ? 'favorite' : 'favorite-border'}
                  size={20}
                  color={isLiked ? '#FF0069' : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Comments Section */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.commentsContainer}>
          <View style={[styles.commentsHeader, {backgroundColor: theme.colors.surface}]}>
            <Text style={[styles.commentsTitle, {color: theme.colors.text}]}>
              Live Comments ({comments.length})
            </Text>
          </View>

          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={item => item.id}
            style={[styles.commentsList, {backgroundColor: theme.colors.background}]}
            contentContainerStyle={styles.commentsContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyComments}>
                <Icon name="comment" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyCommentsText, {color: theme.colors.textSecondary}]}>
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            }
          />

          {/* Comment Input */}
          <View style={[styles.commentInputContainer, {backgroundColor: theme.colors.surface}]}>
            <TextInput
              style={[styles.commentInput, {color: theme.colors.text, backgroundColor: theme.colors.background}]}
              placeholder="Add a comment..."
              placeholderTextColor={theme.colors.textSecondary}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, {backgroundColor: theme.colors.primary}]}
              onPress={sendComment}
              disabled={!newComment.trim()}>
              <Icon
                name="send"
                size={20}
                color={newComment.trim() ? '#FFFFFF' : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <View ref={commentsEndRef} />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    height: height * 0.5,
    position: 'relative',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholderVideo: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  liveBadge: {
    position: 'absolute',
    top: 50,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0069',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
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
  topControls: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
  },
  streamInfo: {
    marginBottom: 12,
  },
  streamTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streamAuthor: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  streamStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  likeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButtonActive: {
    backgroundColor: 'rgba(255, 0, 105, 0.3)',
  },
  commentsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  commentsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    padding: 16,
    paddingBottom: 80,
  },
  commentItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCommentsText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    maxHeight: 100,
    padding: 12,
    borderRadius: 20,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StreamViewerScreen;
