import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  PanResponder,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video, {ResizeMode} from 'react-native-video';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {Buzz, useUser} from '../context/UserContext';
import SocialMediaShareModal from '../components/SocialMediaShareModal';

const {width, height} = Dimensions.get('window');

interface BuzzDetailScreenProps {
  buzz: Buzz;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const BuzzDetailScreen: React.FC<BuzzDetailScreenProps> = ({
  buzz,
  onClose,
  onNext,
  onPrevious,
}) => {
  const {theme} = useTheme();
  const {likeBuzz, shareBuzz} = useUser();
  const [pan] = useState(new Animated.ValueXY());
  const [showShareModal, setShowShareModal] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Reset video state when buzz changes
  useEffect(() => {
    setIsVideoPlaying(false);
  }, [buzz.id]);

  const handleShareClick = () => {
    shareBuzz(buzz.id);
    setShowShareModal(true);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to significant gestures
      return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (evt, gestureState) => {
      const absDx = Math.abs(gestureState.dx);
      const absDy = Math.abs(gestureState.dy);
      
      // Check if the gesture is primarily vertical (pull down to close)
      if (absDy > absDx && gestureState.dy > 100) {
        // Pull down gesture - close the screen
        console.log('Pull down gesture detected - closing buzz');
        Animated.spring(pan, {
          toValue: {x: 0, y: height},
          useNativeDriver: true,
        }).start(() => {
          pan.setValue({x: 0, y: 0});
          onClose();
        });
      }
      // Check if the gesture is primarily horizontal
      else if (absDx > absDy) {
        // Swipe right - next buzz
        if (gestureState.dx > 100 && onNext) {
          Animated.spring(pan, {
            toValue: {x: width, y: 0},
            useNativeDriver: true,
          }).start(() => {
            pan.setValue({x: 0, y: 0});
            onNext();
          });
        }
        // Swipe left - previous buzz
        else if (gestureState.dx < -100 && onPrevious) {
          Animated.spring(pan, {
            toValue: {x: -width, y: 0},
            useNativeDriver: true,
          }).start(() => {
            pan.setValue({x: 0, y: 0});
            onPrevious();
          });
        }
        // Snap back
        else {
          Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            useNativeDriver: true,
          }).start();
        }
      }
      // Snap back for any other case
      else {
        Animated.spring(pan, {
          toValue: {x: 0, y: 0},
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.background},
      ]}
      {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{translateX: pan.x}, {translateY: pan.y}],
          },
        ]}>
        {/* Header */}
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity
            style={[styles.closeButton, {backgroundColor: theme.colors.surface}]}
            onPress={() => {
              console.log('Close button pressed');
              onClose();
            }}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            {onPrevious && (
              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: theme.colors.surface}]}
                onPress={() => {
                  console.log('Previous button pressed');
                  onPrevious();
                }}
                activeOpacity={0.7}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon name="chevron-left" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            )}
            {onNext && (
              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: theme.colors.surface}]}
                onPress={() => {
                  console.log('Next button pressed');
                  onNext();
                }}
                activeOpacity={0.7}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon name="chevron-right" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userSection}>
            <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
              {buzz.userAvatar ? (
                <Image source={{uri: buzz.userAvatar}} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{buzz.username.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.username, {color: theme.colors.text}]}>@{buzz.username}</Text>
              <Text style={[styles.timestamp, {color: theme.colors.textSecondary}]}>
                {formatTimeAgo(buzz.createdAt)}
              </Text>
            </View>
          </View>

          {/* Content */}
          <Text style={[styles.contentText, {color: theme.colors.text}]}>
            {buzz.content}
          </Text>

          {/* Media */}
          {buzz.media && buzz.media.url && (
            <View style={styles.mediaContainer}>
              {buzz.media.type === 'image' ? (
                <Image source={{uri: buzz.media.url}} style={styles.mediaImage} resizeMode="contain" />
              ) : buzz.media.type === 'video' ? (
                <View style={styles.videoWrapper}>
                  <Video
                    source={{ uri: buzz.media.url }}
                    style={styles.video}
                    resizeMode={ResizeMode.CONTAIN}
                    paused={!isVideoPlaying}
                    repeat={false}
                    muted={false}
                    onError={(error) => {
                      console.error('Video playback error:', error);
                      Alert.alert('Video Error', 'Failed to load video. Please check your connection.');
                    }}
                    onEnd={() => setIsVideoPlaying(false)}
                  />
                  <TouchableOpacity
                    style={[
                      styles.playButtonOverlay,
                      isVideoPlaying && styles.transparentOverlay,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setIsVideoPlaying(prev => !prev)}>
                    {!isVideoPlaying && (
                      <View style={[styles.playButton, {backgroundColor: theme.colors.primary}]}>
                        <Icon name="play-arrow" size={60} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}

          {/* Interests */}
          {buzz.interests.length > 0 && (
            <View style={styles.interestsSection}>
              {buzz.interests.map((interest) => (
                <View
                  key={interest.id}
                  style={[
                    styles.interestTag,
                    {backgroundColor: theme.colors.primary + '20'},
                  ]}>
                  <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                  <Text style={[styles.interestName, {color: theme.colors.primary}]}>
                    {interest.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, {borderTopColor: theme.colors.border}]}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => likeBuzz(buzz.id)}>
            <Icon
              name={buzz.isLiked ? 'favorite' : 'favorite-border'}
              size={28}
              color={buzz.isLiked ? theme.colors.error : theme.colors.textSecondary}
            />
            <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
              {buzz.likes > 0 ? buzz.likes : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Icon name="comment" size={28} color={theme.colors.textSecondary} />
            <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
              {buzz.comments > 0 ? buzz.comments : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleShareClick}>
            <Icon name="share" size={28} color={theme.colors.textSecondary} />
            <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
              {buzz.shares > 0 ? buzz.shares : ''}
            </Text>
          </TouchableOpacity>
        </View>

        <SocialMediaShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          buzzContent={buzz.content}
          buzzMedia={buzz.media?.url || undefined}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
  },
  contentText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 20,
  },
  mediaContainer: {
    width: width - 40,
    marginBottom: 20,
  },
  mediaImage: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 12,
  },
  videoWrapper: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  transparentOverlay: {
    backgroundColor: 'transparent',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  interestsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  interestName: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BuzzDetailScreen;
