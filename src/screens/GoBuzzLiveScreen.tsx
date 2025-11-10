import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  StatusBar,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Clipboard from '@react-native-clipboard/clipboard';

import {useTheme} from '../context/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import ApiService from '../services/APIService';
import BuzzLivePublisher, {
  BuzzLivePublisherHandle,
  BuzzLivePublisherStatus,
} from '../components/Buzzlive/BuzzLivePublisher';

const {width, height} = Dimensions.get('window');

interface StreamComment {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  comment: string;
  timestamp: Date;
}

const GoBuzzLiveScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user: currentUser} = useAuth();
  const navigation = useNavigation();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<BuzzLivePublisherStatus>('idle');
  const [showSetup, setShowSetup] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [viewers, setViewers] = useState(0);
  const [comments, setComments] = useState<StreamComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentStream, setCurrentStream] = useState<any>(null);
  const [activeServerStream, setActiveServerStream] = useState<any>(null);
  const [publishUrl, setPublishUrl] = useState('');
  const [publisherTrigger, setPublisherTrigger] = useState(0);
  const [hasIncrementedViewerCount, setHasIncrementedViewerCount] = useState(false);
  const publisherRef = useRef<BuzzLivePublisherHandle>(null);

  const copyToClipboard = async (value: string | null | undefined, label: string) => {
    if (!value) {
      Alert.alert('Unavailable', `${label} is not configured.`);
      return;
    }
    try {
      Clipboard.setString(value);
      Alert.alert('Copied', `${label} copied to clipboard.`);
    } catch (error) {
      console.error('Clipboard error:', error);
      Alert.alert('Error', `Unable to copy ${label}.`);
    }
  };

  const getPlaybackUrl = () => currentStream?.ivsPlaybackUrl || currentStream?.streamUrl || '';

  const buildRtmpIngestUrl = (stream: any): string => {
    if (!stream) {
      return '';
    }
    const baseUrl =
      stream?.ivsIngestRtmpsUrl ||
      stream?.ivsIngestUrl ||
      stream?.restreamRtmpUrl ||
      '';
    const streamKey = stream?.ivsStreamKey || stream?.ivsStreamKeyArn || stream?.restreamKey || '';

    if (!baseUrl || !streamKey) {
      return '';
    }

    let normalized = baseUrl.replace(/\/$/, '');
    if (normalized.startsWith('rtmps://')) {
      normalized = normalized.replace('rtmps://', 'rtmp://');
    }

    return `${normalized}/${streamKey}`;
  };

  const handlePublisherStatusChange = (status: BuzzLivePublisherStatus) => {
    setStreamStatus(status);
    if (status === 'live') {
      if (!hasIncrementedViewerCount && currentStream) {
        ApiService.updateViewers(currentStream.id, 'increment').catch(error =>
          console.error('Error incrementing viewers:', error),
        );
        setHasIncrementedViewerCount(true);
      }
      if (!isStreaming) {
        setIsStreaming(true);
      }
    } else if (status === 'idle' || status === 'error') {
      if (hasIncrementedViewerCount && currentStream) {
        ApiService.updateViewers(currentStream.id, 'decrement').catch(error =>
          console.error('Error decrementing viewers:', error),
        );
      }
      if (isStreaming) {
        setIsStreaming(false);
      }
      setHasIncrementedViewerCount(false);
    }
  };

  useEffect(() => {
    fetchExistingLiveStream();
  }, [currentUser?.id]);

  useEffect(() => {
    if (isStreaming && currentStream) {
      // Load comments
      loadComments();
      // Update viewer count
      updateViewers();
      
      // Poll for comments every 3 seconds
      const commentInterval = setInterval(() => {
        loadComments();
      }, 3000);
      
      // Poll for viewer count every 5 seconds
      const viewerInterval = setInterval(() => {
        updateViewers();
      }, 5000);

      return () => {
        clearInterval(commentInterval);
        clearInterval(viewerInterval);
      };
    }
  }, [isStreaming, currentStream]);

  // Note: Auto-scroll functionality removed - FlatList handles scrolling automatically

  const loadComments = async () => {
    if (!currentStream) return;
    
    try {
      const response = await ApiService.getStreamComments(currentStream.id);
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

  const updateViewers = async () => {
    if (!currentStream) return;
    
    try {
      const response = await ApiService.getLiveStream(currentStream.id);
      if (response.success && response.data) {
        setViewers(response.data.viewers || 0);
      }
    } catch (error) {
      console.error('Error updating viewers:', error);
    }
  };

  const fetchExistingLiveStream = async () => {
    if (!currentUser) {
      return null;
    }
    try {
      const response = await ApiService.getLiveStreams();
      if (response.success && Array.isArray(response.data)) {
        const mine = response.data.find(
          stream =>
            stream?.userId === currentUser.id ||
            stream?.username?.toLowerCase() === currentUser.username?.toLowerCase(),
        );
        if (mine) {
          setActiveServerStream(mine);
          return mine;
        }
      }
    } catch (error) {
      console.error('Error checking existing live stream:', error);
    }
    setActiveServerStream(null);
    return null;
  };

  const resumeExistingStream = (stream: any) => {
    setCurrentStream(stream);
    setShowSetup(false);
    setActiveServerStream(null);
    const ingestUrl = buildRtmpIngestUrl(stream);
    if (ingestUrl) {
      setPublishUrl(ingestUrl);
      setPublisherTrigger(prev => prev + 1);
    } else {
      setPublishUrl('');
      setIsStreaming(true);
    }
    Alert.alert(
      'Stream Resumed',
      'We found your active BuzzLive session and reattached to it.',
      [{text: 'OK'}],
    );
  };

  const forceEndExistingStream = async (stream: any) => {
    try {
      const response = await ApiService.endLiveStream(stream.id);
      if (!response.success) {
        Alert.alert('Error', response.error || 'Failed to end the existing live stream.');
      } else {
        Alert.alert('Stream Ended', 'Your previous live stream was ended. You can start a new one now.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to end the existing live stream.');
    } finally {
      setActiveServerStream(null);
      setCurrentStream(null);
      setPublishUrl('');
      setIsStreaming(false);
      setPublisherTrigger(0);
      setStreamStatus('idle');
    }
  };

  const handleStartStream = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a stream title');
      return;
    }

    try {
      const response = await ApiService.createLiveStream({
        title: title.trim(),
        description: description.trim(),
        category: 'general',
      });

      if (response.success) {
        setCurrentStream(response.data);
        setShowSetup(false);
        setActiveServerStream(null);
        const ingestUrl = buildRtmpIngestUrl(response.data);
        if (ingestUrl) {
          setPublishUrl(ingestUrl);
          setPublisherTrigger(prev => prev + 1);
        } else {
          setPublishUrl('');
          Alert.alert(
            'Streaming credentials unavailable',
            'No RTMP ingest URL or stream key is configured. You can still use these credentials manually from the Broadcast Credentials section.',
          );
        }

        const playbackUrl = response.data.ivsPlaybackUrl || response.data.streamUrl || '';
        if (!playbackUrl.trim()) {
          Alert.alert(
            'Stream Started',
            response.data.ivsIngestRtmpsUrl
              ? 'Your live stream has started! Configure your encoder (OBS or mobile) with the RTMPS server and stream key shown below so viewers can see the video.'
              : 'Your live stream has started! Configure a streaming server so viewers can see the video.',
            [{ text: 'OK' }]
          );
        }
      } else {
        const errorMessage = response.error || 'Failed to start stream';
        if (errorMessage.toLowerCase().includes('active live stream')) {
          const existingStream = (await fetchExistingLiveStream()) || activeServerStream;
          if (existingStream) {
            Alert.alert(
              'Active Stream Detected',
              'You already have an active BuzzLive session. Do you want to resume it or end it?',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Resume',
                  onPress: () => resumeExistingStream(existingStream),
                },
                {
                  text: 'End Stream',
                  style: 'destructive',
                  onPress: () => forceEndExistingStream(existingStream),
                },
              ],
            );
          } else {
            Alert.alert('Active Stream', 'We could not verify the active stream. Please try again.');
          }
        } else {
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start stream');
    }
  };

  const handleEndStream = async () => {
    Alert.alert(
      'End Stream',
      'Are you sure you want to end this live stream?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'End Stream',
          style: 'destructive',
              onPress: async () => {
                if (currentStream) {
                  try {
                    // Stop publishing first
                    await publisherRef.current?.stop();
                    setPublishUrl('');
                    setPublisherTrigger(0);
                    setStreamStatus('idle');

                    // End stream on backend
                    await ApiService.endLiveStream(currentStream.id);

                    // Clear all state
                    setIsStreaming(false);
                    setCurrentStream(null);
                    setShowSetup(true);
                    setTitle('');
                    setDescription('');
                    setComments([]);
                    setViewers(0);
                    setActiveServerStream(null);
                    setPublisherTrigger(0);
                    setStreamStatus('idle');
                    
                    // Navigate back immediately
                    navigation.goBack();
                  } catch (error: any) {
                    console.error('Error ending stream:', error);
                    // Still navigate back even if API call fails
                    setIsStreaming(false);
                    setCurrentStream(null);
                    setActiveServerStream(null);
                    setPublishUrl('');
                    setPublisherTrigger(0);
                    setStreamStatus('idle');
                    navigation.goBack();
                  }
                } else {
                  // No stream to end, just go back
                  navigation.goBack();
                }
              },
        },
      ]
    );
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !currentStream) return;

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

    try {
      const response = await ApiService.addStreamComment(currentStream.id, comment.comment);
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
      setComments(prev => prev.filter(c => c.id !== comment.id));
    }
  };

  const handleShare = async () => {
    if (!currentStream) return;
    
    try {
      const shareUrl = getPlaybackUrl() || `https://buzzit-production.up.railway.app/stream/${currentStream.id}`;
      await Share.share({
        message: `Check out my live stream: "${currentStream.title}"\n${shareUrl}`,
        title: currentStream.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share stream');
    }
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

  const renderComment = ({item}: {item: StreamComment}) => (
    <View style={[styles.commentItem, {backgroundColor: 'rgba(0, 0, 0, 0.6)'}]}>
      <Text style={styles.commentAuthor}>{item.displayName}</Text>
      <Text style={styles.commentText}>{item.comment}</Text>
      <Text style={styles.commentTime}>{formatTime(item.timestamp)}</Text>
    </View>
  );

  const renderBroadcastInfo = () => {
    if (!currentStream) return null;

    const hasIvsCredentials =
      !!currentStream.ivsIngestRtmpsUrl ||
      !!currentStream.ivsStreamKey ||
      !!currentStream.ivsSrtUrl;
    const hasRestreamCredentials =
      !!currentStream.restreamRtmpUrl ||
      !!currentStream.restreamKey;

    if (!hasIvsCredentials && !hasRestreamCredentials) {
      return null;
    }

    const renderRow = (label: string, value?: string | null) => {
      if (!value || value.trim() === '') return null;
      return (
        <View style={styles.broadcastRow} key={`${label}-${value}`}>
          <View style={styles.broadcastTextContainer}>
            <Text style={styles.broadcastInfoLabel}>{label}</Text>
            <Text style={styles.broadcastInfoValue} selectable numberOfLines={3}>
              {value}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(value, label)}>
            <Icon name="content-copy" size={16} color="#FFFFFF" />
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <View style={styles.broadcastInfoContainer}>
        <Text style={styles.broadcastInfoTitle}>Broadcast Credentials</Text>
        <Text style={styles.broadcastInfoHint}>
          Use these values inside your encoder (OBS, Larix, etc.) to send video to Buzz Live.
        </Text>

        {hasIvsCredentials && (
          <View style={styles.broadcastSection}>
            <Text style={styles.broadcastSectionTitle}>Amazon IVS</Text>
            {renderRow('RTMPS Server', currentStream.ivsIngestRtmpsUrl)}
            {renderRow('Stream Key', currentStream.ivsStreamKey)}
            {renderRow('SRT URL', currentStream.ivsSrtUrl)}
            {renderRow('SRT Passphrase', currentStream.ivsSrtPassphrase)}
          </View>
        )}

        {hasRestreamCredentials && (
          <View style={styles.broadcastSection}>
            <Text style={styles.broadcastSectionTitle}>Restream</Text>
            {renderRow('RTMP Server', currentStream.restreamRtmpUrl)}
            {renderRow('Stream Key', currentStream.restreamKey)}
            {renderRow('Playback URL', currentStream.restreamPlaybackUrl)}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: '#000'}]}>
      <StatusBar barStyle="light-content" />
      <BuzzLivePublisher
        ref={publisherRef}
        style={StyleSheet.absoluteFill}
        rtmpUrl={publishUrl}
        startTrigger={publishUrl ? publisherTrigger : null}
        onStatusChange={handlePublisherStatusChange}
        showControls={false}
      />

      {/* Content View */}
      <View style={styles.contentView}>
        {/* Top Overlay */}
        <View style={styles.topOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (isStreaming) {
                handleEndStream();
              } else {
                navigation.goBack();
              }
            }}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {isStreaming && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}

          {isStreaming && (
            <View style={styles.viewerBadge}>
              <Icon name="visibility" size={16} color="#FFFFFF" />
              <Text style={styles.viewerText}>{viewers}</Text>
            </View>
          )}

          {isStreaming && (
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}>
              <Icon name="share" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Setup Form */}
        {showSetup && (
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent']}
            style={styles.setupContainer}>
            <View style={styles.setupContent}>
              <Text style={styles.setupTitle}>Go Buzz Live</Text>
              <Text style={styles.setupSubtitle}>Share what's happening with your audience</Text>
              {!!activeServerStream && (
                <View style={styles.activeStreamCallout}>
                  <Icon name="info" size={18} color="#FFB020" />
                  <View style={styles.activeStreamTextContainer}>
                    <Text style={styles.activeStreamTitle}>You already have a live stream running</Text>
                    <Text style={styles.activeStreamDescription}>
                      Resume it or end it before starting a new session.
                    </Text>
                  </View>
                  <View style={styles.activeStreamActions}>
                    <TouchableOpacity
                      style={styles.activeStreamResumeButton}
                      onPress={() => resumeExistingStream(activeServerStream)}>
                      <Text style={styles.activeStreamResumeText}>Resume</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.activeStreamEndButton}
                      onPress={() => forceEndExistingStream(activeServerStream)}>
                      <Text style={styles.activeStreamEndText}>End</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TextInput
                style={[styles.input, {backgroundColor: 'rgba(255,255,255,0.9)', color: '#000'}]}
                placeholder="What are you going live about?"
                placeholderTextColor="#666"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              <TextInput
                style={[styles.textArea, {backgroundColor: 'rgba(255,255,255,0.9)', color: '#000'}]}
                placeholder="Add a description (optional)"
                placeholderTextColor="#666"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={500}
              />

              <View style={styles.setupButtons}>
                <TouchableOpacity
                  style={[styles.cancelButton, {backgroundColor: 'rgba(255,255,255,0.3)'}]}
                onPress={() => navigation.goBack()}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.goLiveButton, {backgroundColor: '#FF0069'}]}
                  onPress={handleStartStream}>
                  <Text style={styles.goLiveButtonText}>Go Live</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Live Controls */}
        {isStreaming && (
          <>
            {renderBroadcastInfo()}
            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {/* Toggle Camera */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => publisherRef.current?.switchCamera()}>
                <Icon name="flip-camera-ios" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Recording Indicator */}
              {streamStatus === 'live' && (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>LIVE</Text>
                </View>
              )}

              {/* End Stream Button */}
              <TouchableOpacity
                style={[styles.endButton, {backgroundColor: '#FF0069'}]}
                onPress={handleEndStream}>
                <Icon name="stop" size={28} color="#FFFFFF" />
                <Text style={styles.endButtonText}>End</Text>
              </TouchableOpacity>
            </View>

            {/* Comments Sidebar */}
            <View style={styles.commentsContainer}>
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>Live Comments</Text>
                <Text style={styles.commentsCount}>{comments.length}</Text>
              </View>

              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={item => item.id}
                style={styles.commentsList}
                contentContainerStyle={styles.commentsContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyComments}>
                    <Text style={styles.emptyCommentsText}>
                      No comments yet. Be the first!
                    </Text>
                  </View>
                }
              />

              {/* Comment Input */}
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={[styles.commentInput, {backgroundColor: 'rgba(255,255,255,0.9)', color: '#000'}]}
                  placeholder="Add a comment..."
                  placeholderTextColor="#666"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[styles.sendButton, {backgroundColor: '#FF0069'}]}
                  onPress={handleSendComment}
                  disabled={!newComment.trim()}>
                  <Icon
                    name="send"
                    size={20}
                    color={newComment.trim() ? '#FFFFFF' : '#999'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentView: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  errorSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,
  },
  topOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0069',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
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
    gap: 6,
  },
  viewerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  setupContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 50,
  },
  setupTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  setupSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
  },
  activeStreamCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 176, 32, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  activeStreamTextContainer: {
    flex: 1,
  },
  activeStreamTitle: {
    color: '#FFB020',
    fontSize: 14,
    fontWeight: '600',
  },
  activeStreamDescription: {
    color: '#FFDFA5',
    fontSize: 12,
    marginTop: 2,
  },
  activeStreamActions: {
    flexDirection: 'row',
    gap: 8,
  },
  activeStreamResumeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  activeStreamResumeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  activeStreamEndButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 176, 32, 0.2)',
  },
  activeStreamEndText: {
    color: '#FFB020',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  setupButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  goLiveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  goLiveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28,
    gap: 8,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsContainer: {
    position: 'absolute',
    right: 15,
    top: 100,
    bottom: 100,
    width: width * 0.35,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    padding: 12,
    zIndex: 10,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentsCount: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    padding: 12,
    paddingBottom: 80,
  },
  commentItem: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 4,
  },
  commentTime: {
    color: '#FFFFFF',
    fontSize: 10,
    opacity: 0.6,
  },
  emptyComments: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCommentsText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
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
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0069',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  broadcastInfoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  broadcastInfoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  broadcastInfoHint: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 12,
    marginTop: 4,
  },
  broadcastSection: {
    marginTop: 16,
  },
  broadcastSectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  broadcastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  broadcastTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  broadcastInfoLabel: {
    color: '#B0B0B0',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  broadcastInfoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default GoBuzzLiveScreen;

