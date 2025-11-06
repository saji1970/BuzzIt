import React, {useState, useEffect, useRef} from 'react';
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
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {LiveStream} from '../components/LiveStreamCard';
import ApiService from '../services/APIService';

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
  stream: LiveStream;
  visible: boolean;
  onClose: () => void;
}

const StreamViewerScreen: React.FC<StreamViewerScreenProps> = ({
  stream,
  visible,
  onClose,
}) => {
  const {theme} = useTheme();
  const {user: currentUser} = useAuth();
  const [comments, setComments] = useState<StreamComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [viewers, setViewers] = useState(stream.viewers || 0);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<Video>(null);
  const commentsEndRef = useRef<View>(null);

  useEffect(() => {
    if (visible && stream) {
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
      const response = await ApiService.getLiveStream(stream.id);
      if (response.success && response.data) {
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
        const response = await ApiService.getLiveStream(stream.id);
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
      await ApiService.updateViewers(stream.id, 'increment');
    } catch (error) {
      console.error('Error incrementing viewer:', error);
    }
  };

  const decrementViewer = async () => {
    try {
      await ApiService.updateViewers(stream.id, 'decrement');
    } catch (error) {
      console.error('Error decrementing viewer:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await ApiService.getStreamComments(stream.id);
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
      const response = await ApiService.addStreamComment(stream.id, comment.comment);
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
      const shareUrl = `https://buzzit-production.up.railway.app/stream/${stream.id}`;
      const result = await Share.share({
        message: `Check out ${stream.displayName}'s live stream: "${stream.title}"\n${shareUrl}`,
        title: stream.title,
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
    if (!url || url.trim() === '') return false;
    // Check if it's a relative path (starts with /)
    if (url.startsWith('/')) {
      console.warn('Invalid stream URL (relative path):', url);
      return false;
    }
    // Check if it contains the backend URL (which means it's a relative path that was converted)
    if (url.includes('buzzit-production.up.railway.app/stream/')) {
      console.warn('Invalid stream URL (backend path, not streaming server):', url);
      return false;
    }
    // Check if it's a valid URL format (http:// or https://)
    try {
      const urlObj = new URL(url);
      // Only allow http/https protocols
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return false;
      }
      // Don't allow backend API URLs as stream URLs
      if (urlObj.hostname.includes('buzzit-production.up.railway.app') && urlObj.pathname.startsWith('/stream/')) {
        console.warn('Invalid stream URL (backend API path, not streaming server):', url);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Invalid stream URL format:', url);
      return false;
    }
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
          {stream.streamUrl && stream.streamUrl.trim() !== '' && stream.isLive && isValidStreamUrl(stream.streamUrl) ? (
            <Video
              ref={videoRef}
              source={{ uri: stream.streamUrl }}
              style={styles.video}
              useNativeControls={true}
              resizeMode="contain"
              shouldPlay={true}
              isLooping={false}
              onLoadStart={() => {
                console.log('Video loading started for stream:', stream.id);
              }}
              onLoad={() => {
                console.log('Video loaded successfully for stream:', stream.id);
              }}
              onError={(error) => {
                console.error('Video playback error:', error);
                // Don't show alert immediately - might be temporary network issue
                // Video component will show error state
              }}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded && status.error) {
                  console.error('Video playback status error:', status.error);
                }
              }}
            />
          ) : stream.isLive ? (
            <View style={styles.placeholderVideo}>
              <Icon name="videocam" size={64} color="#FFFFFF" />
              <Text style={styles.placeholderText}>Live stream starting...</Text>
              <Text style={[styles.placeholderText, { fontSize: 14, marginTop: 8, opacity: 0.7, paddingHorizontal: 20 }]}>
                {!stream.streamUrl || stream.streamUrl.trim() === ''
                  ? 'The broadcaster is setting up their stream. Video will appear once the stream is connected to the media server.'
                  : stream.streamUrl.startsWith('rtmp://')
                  ? 'Streaming server is being configured. Please wait for the stream to connect.'
                  : 'The broadcaster is using their camera. Stream will be available once connected to media server.'}
              </Text>
              {stream.streamUrl && stream.streamUrl.includes('example.com') && (
                <Text style={[styles.placeholderText, { fontSize: 12, marginTop: 8, opacity: 0.5 }]}>
                  Note: A streaming server needs to be configured for live video playback.
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
          {stream.isLive && (
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
              <Text style={styles.streamTitle}>{stream.title}</Text>
              <Text style={styles.streamAuthor}>{stream.displayName}</Text>
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
