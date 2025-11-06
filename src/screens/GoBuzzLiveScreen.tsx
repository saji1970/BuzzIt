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
import { MaterialIcons as Icon } from '@expo/vector-icons';
// @ts-ignore - react-native-vision-camera will be installed
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {useNavigation} from '@react-navigation/native';
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

const GoBuzzLiveScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user: currentUser} = useAuth();
  const navigation = useNavigation();
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [viewers, setViewers] = useState(0);
  const [comments, setComments] = useState<StreamComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentStream, setCurrentStream] = useState<any>(null);
  
  // Camera state - React Native Vision Camera
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isRecording, setIsRecording] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<Camera>(null);
  
  // Get camera devices
  const device = useCameraDevice(cameraPosition);

  // Request camera permission on mount and log camera status
  useEffect(() => {
    console.log('Camera status:', {
      hasPermission,
      device: device ? device.name : 'null',
      cameraPosition,
    });
    
    if (!hasPermission) {
      console.log('Requesting camera permission...');
      requestPermission();
    }
  }, [hasPermission, device, cameraPosition]);

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

  const handleStartStream = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a stream title');
      return;
    }

    // Request camera permission if not granted
    if (!hasPermission) {
      const result = await requestPermission();
      if (!result) {
        Alert.alert('Permission Required', 'Camera permission is needed to go live.');
        return;
      }
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
        // Start recording first, then set streaming
        await startRecording();
        setIsStreaming(true);
        // Increment viewer when starting
        await ApiService.updateViewers(response.data.id, 'increment');
      } else {
        Alert.alert('Error', response.error || 'Failed to start stream');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start stream');
    }
  };

  const startRecording = async () => {
    if (device && !isRecording) {
      try {
        // Set recording state - camera will activate video/audio when isStreaming becomes true
        setIsRecording(true);
        console.log('Recording started with Vision Camera');
        console.log('Camera device:', device.name, 'Position:', cameraPosition);
      } catch (error) {
        console.error('Error starting recording:', error);
        setIsRecording(false);
        Alert.alert('Error', 'Failed to start recording');
      }
    } else {
      console.warn('Cannot start recording:', {device: !!device, isRecording, hasPermission});
    }
  };

  const stopRecording = async () => {
    if (isRecording) {
      try {
        setIsRecording(false);
        // Stop recording when ending stream
        console.log('Recording stopped');
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  };

  const toggleCameraFacing = () => {
    setCameraPosition(current => (current === 'back' ? 'front' : 'back'));
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
                    // Stop recording first
                    await stopRecording();
                    setIsRecording(false);
                    
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
                    
                    // Navigate back immediately
                    navigation.goBack();
                  } catch (error: any) {
                    console.error('Error ending stream:', error);
                    // Still navigate back even if API call fails
                    setIsStreaming(false);
                    setCurrentStream(null);
                    setIsRecording(false);
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
      const shareUrl = `https://buzzit-production.up.railway.app/stream/${currentStream.id}`;
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

  // Show permission request screen
  if (!hasPermission) {
    return (
      <View style={[styles.container, {backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20}]}>
        <Icon name="videocam-off" size={64} color="#FFFFFF" />
        <Text style={styles.errorText}>Camera Permission Required</Text>
        <Text style={styles.errorSubtext}>
          We need camera access to enable live streaming with Vision Camera
        </Text>
        <TouchableOpacity
          style={[styles.goLiveButton, {backgroundColor: '#FF0069', marginTop: 20}]}
          onPress={async () => {
            const granted = await requestPermission();
            if (!granted) {
              Alert.alert('Permission Denied', 'Camera permission is required for live streaming.');
            }
          }}>
          <Text style={styles.goLiveButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cancelButton, {backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 10}]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show error if no camera device available
  if (!device) {
    return (
      <View style={[styles.container, {backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20}]}>
        <Icon name="videocam-off" size={64} color="#FFFFFF" />
        <Text style={styles.errorText}>Camera Not Available</Text>
        <Text style={styles.errorSubtext}>
          No camera device found. Please check your device.
        </Text>
        <TouchableOpacity
          style={[styles.cancelButton, {backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 20}]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: '#000'}]}>
      <StatusBar barStyle="light-content" />
      
      {/* Camera Preview - React Native Vision Camera */}
      {/* Show camera preview when permission granted, but only activate video/audio when streaming */}
      {hasPermission && device ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true} // Always active for preview
          video={isStreaming} // Only enable video recording when streaming
          audio={isStreaming} // Only enable audio recording when streaming
          enableZoomGesture={false}
          orientation="portrait"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, {backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center'}]}>
          {!hasPermission ? (
            <View style={{alignItems: 'center', padding: 20}}>
              <Icon name="videocam-off" size={64} color="#FFFFFF" />
              <Text style={{color: '#FFFFFF', marginTop: 16, fontSize: 16, textAlign: 'center', marginBottom: 20}}>
                Camera permission required
              </Text>
              <TouchableOpacity
                style={[styles.goLiveButton, {backgroundColor: '#FF0069'}]}
                onPress={async () => {
                  const granted = await requestPermission();
                  if (!granted) {
                    Alert.alert('Permission Denied', 'Camera permission is required for live streaming.');
                  }
                }}>
                <Text style={styles.goLiveButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          ) : !device ? (
            <View style={{alignItems: 'center', padding: 20}}>
              <Icon name="videocam-off" size={64} color="#FFFFFF" />
              <Text style={{color: '#FFFFFF', marginTop: 16, fontSize: 16, textAlign: 'center'}}>
                Camera not available on this device
              </Text>
            </View>
          ) : (
            <Text style={{color: '#FFFFFF', fontSize: 16}}>Initializing camera...</Text>
          )}
        </View>
      )}
      
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
            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {/* Toggle Camera */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleCameraFacing}>
                <Icon name="flip-camera-ios" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Recording Indicator */}
              {isRecording && (
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
    paddingBottom: 10,
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
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    padding: 10,
    fontSize: 12,
    maxHeight: 60,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
});

export default GoBuzzLiveScreen;

