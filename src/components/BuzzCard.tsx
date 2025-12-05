import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Video, {ResizeMode} from 'react-native-video';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {Buzz} from '../context/UserContext';
import {useFeatures} from '../context/FeatureContext';
import {useAuth} from '../context/AuthContext';
import SocialMediaShareModal from './SocialMediaShareModal';
import ApiService from '../services/APIService';
import {API_CONFIG} from '../config/API_CONFIG';

const {width} = Dimensions.get('window');

interface BuzzCardProps {
  buzz: Buzz;
  onLike: () => void;
  onShare: () => void;
  onPress?: () => void;
  isFollowing?: boolean;
  onFollow?: (buzzId: string) => void;
}

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onBlock?: () => void;
  onAbout?: () => void;
  onSave?: () => void;
  onRemove?: () => void;
  isOwnBuzz?: boolean;
}

const MenuModal: React.FC<MenuModalProps> = ({visible, onClose, onBlock, onAbout, onSave, onRemove, isOwnBuzz = false}) => {
  const {theme} = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={[styles.modalContent, {backgroundColor: theme.colors.surface}]}>
          {isOwnBuzz ? (
            // Show only "Remove Buzz" for own buzzes
            <TouchableOpacity
              style={styles.menuItem}
              onPress={onRemove}>
              <Icon name="delete" size={24} color="#E4405F" />
              <Text style={[styles.menuItemText, {color: '#E4405F'}]}>Remove Buzz</Text>
            </TouchableOpacity>
          ) : (
            // Show regular options for other users' buzzes
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={onBlock}>
                <Icon name="block" size={24} color="#E4405F" />
                <Text style={[styles.menuItemText, {color: '#E4405F'}]}>Block Buzzer</Text>
              </TouchableOpacity>
              <View style={[styles.menuDivider, {backgroundColor: theme.colors.border}]} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={onAbout}>
                <Icon name="info-outline" size={24} color={theme.colors.text} />
                <Text style={[styles.menuItemText, {color: theme.colors.text}]}>About Buzzer</Text>
              </TouchableOpacity>
              <View style={[styles.menuDivider, {backgroundColor: theme.colors.border}]} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={onSave}>
                <Icon name="bookmark-outline" size={24} color={theme.colors.text} />
                <Text style={[styles.menuItemText, {color: theme.colors.text}]}>Save Buzz</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const BuzzCard: React.FC<BuzzCardProps> = ({buzz, onLike, onShare, onPress, isFollowing = false, onFollow}) => {
  const {theme} = useTheme();
  const {features} = useFeatures();
  const {user: currentUser} = useAuth();
  const isOwnBuzz = currentUser?.id === buzz.userId;
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [countdown, setCountdown] = useState<string>('');
  const [videoPaused, setVideoPaused] = useState(true);

  const handleShareClick = () => {
    setShowShareModal(true);
    onShare(); // Increment share count
  };

  const handleFollow = () => {
    if (onFollow) {
      onFollow(buzz.id);
    }
    Alert.alert('Success', isFollowing ? 'Unfollowed successfully!' : 'Following!');
  };

  const handleBlock = () => {
    setShowMenuModal(false);
    Alert.alert(
      'Block Buzzer',
      `Are you sure you want to block ${buzz.username}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => Alert.alert('Blocked', `${buzz.username} has been blocked.`),
        },
      ]
    );
  };

  const handleAbout = () => {
    setShowMenuModal(false);
    Alert.alert('About Buzzer', `Username: @${buzz.username}\n\nThis user is sharing content related to your interests.`);
  };

  const handleSave = () => {
    setShowMenuModal(false);
    Alert.alert('Saved', 'This buzz has been saved to your collection!');
  };

  const handleRemove = () => {
    setShowMenuModal(false);
    Alert.alert(
      'Remove Buzz',
      'Are you sure you want to remove this buzz? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deleteBuzz(buzz.id);
              if (response.success) {
                Alert.alert('Success', 'Buzz removed successfully');
                // The buzz will be removed from the list when the parent component refreshes
                // You may want to add a callback to refresh the list here
              } else {
                Alert.alert('Error', response.error || 'Failed to remove buzz');
              }
            } catch (error) {
              console.error('Error removing buzz:', error);
              Alert.alert('Error', 'Failed to remove buzz. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Countdown timer for scheduled streams/events
  useEffect(() => {
    if (buzz.eventDate) {
      const updateCountdown = () => {
        const eventDate = new Date(buzz.eventDate!);
        const now = new Date();
        const diff = eventDate.getTime() - now.getTime();

        if (diff <= 0) {
          setCountdown('Live Now!');
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
          setCountdown(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setCountdown(`${minutes}m ${seconds}s`);
        } else {
          setCountdown(`${seconds}s`);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);

      return () => clearInterval(interval);
    }
  }, [buzz.eventDate]);

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    // Convert to Date if it's a string
    const dateObj = date instanceof Date ? date : new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    // If less than 24 hours, show time only
    if (diffInSeconds < 86400) {
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // If same year, show date and time
    if (dateObj.getFullYear() === now.getFullYear()) {
      const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
      const day = dateObj.getDate();
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      return `${month} ${day}, ${hours}:${minutes}`;
    }
    
    // Different year, show full date and time
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  const deriveRemoteMediaUrl = () => {
    if (buzz.media?.url) {
      return buzz.media.url;
    }
    const legacyMediaUrl = (buzz as any).mediaUrl || (buzz as any).mediaURI || (buzz as any).mediaUri;
    if (typeof legacyMediaUrl === 'string') {
      return legacyMediaUrl;
    }
    return null;
  };

  const inferredMediaUrl = deriveRemoteMediaUrl();

  const resolveMediaUri = (uri: string | null) => {
    if (!uri) {
      return null;
    }
    if (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:')) {
      const productionHost = API_CONFIG.PRODUCTION_BACKEND.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (uri.startsWith(`http://${productionHost}`)) {
        return uri.replace(/^http:\/\//i, 'https://');
      }
      return uri;
    }
    const baseUrl = API_CONFIG.getBackendURL().replace(/\/$/, '');
    return `${baseUrl}${uri.startsWith('/') ? '' : '/'}${uri}`;
  };

  const hasLocalAsset = buzz.localMediaUri && (buzz.localMediaUri.startsWith('file://') || buzz.localMediaUri.startsWith('content://'));
  const remoteMediaUrl = resolveMediaUri(inferredMediaUrl);
  const mediaUri = hasLocalAsset
    ? buzz.localMediaUri
    : remoteMediaUrl || resolveMediaUri(buzz.localMediaUri || null);

  const deriveMediaType = () => {
    if (buzz.media?.type) {
      return buzz.media.type;
    }
    const legacyType = (buzz as any).mediaType || (buzz as any).type;
    if (legacyType && ['image', 'video'].includes(legacyType)) {
      return legacyType;
    }
    if (mediaUri) {
      const extension = mediaUri.split('?')[0].split('.').pop()?.toLowerCase();
      if (extension && ['mp4', 'mov', 'm4v', 'avi', 'webm'].includes(extension)) {
        return 'video';
      }
      return 'image';
    }
    return null;
  };

  const derivedMediaType = deriveMediaType();
  const hasImage = derivedMediaType === 'image' && !!mediaUri;
  const hasVideo = derivedMediaType === 'video' && !!mediaUri;

  // Debug logging for media
  console.log('BuzzCard Debug:', {
    buzzId: buzz.id,
    username: buzz.username,
    mediaUri,
    derivedMediaType,
    hasImage,
    hasVideo,
    hasLocalAsset,
    remoteMediaUrl,
  });

  const normalizeInterests = () => {
    if (!Array.isArray(buzz.interests)) {
      return [];
    }

    return buzz.interests
      .map(interest => {
        if (!interest) {
          return null;
        }

        if (typeof interest === 'string') {
          return {
            id: interest,
            name: interest,
            emoji: '',
          };
        }

        if (typeof interest === 'object') {
          const { id, name, emoji } = interest as any;
          return {
            id: id ?? name ?? '',
            name: name ?? id ?? '',
            emoji: emoji ?? '',
          };
        }

        return null;
      })
      .filter((interest): interest is { id: string; name: string; emoji: string } => !!interest && !!interest.name);
  };

  const normalizedInterests = normalizeInterests();
  const hasInterests = normalizedInterests.length > 0;

  const renderAction = (
    iconName: string,
    label: string,
    active: boolean,
    onPressAction: () => void,
  ) => (
    <TouchableOpacity
      style={[
        styles.actionPill,
        {backgroundColor: active ? theme.colors.primary : 'rgba(15,23,42,0.08)'}
      ]}
      onPress={onPressAction}
      activeOpacity={0.85}
    >
      <Icon
        name={iconName}
        size={18}
        color={active ? '#FFFFFF' : theme.colors.textSecondary}
      />
      <Text
        style={[styles.actionLabel, {color: active ? '#FFFFFF' : theme.colors.textSecondary}]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <Animatable.View
          animation="fadeInUp"
          style={[styles.card, {backgroundColor: theme.colors.surface}]}
        >
          {/* Top Row: Avatar, Username, Timestamp, Menu */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, {backgroundColor: theme.colors.primary + '20'}]}>
                {buzz.userAvatar ? (
                  <Image source={{uri: buzz.userAvatar}} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.avatarText, {color: theme.colors.primary}]}>
                    {buzz.username.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.userTextContainer}>
                <Text style={[styles.username, {color: theme.colors.text}]}>{buzz.username}</Text>
                <Text style={[styles.timestamp, {color: theme.colors.textSecondary}]}>
                  {formatTimeAgo(buzz.createdAt)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowMenuModal(true)}
            >
              <Icon name="more-horiz" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Middle: Content Text */}
          <View style={styles.body}>
            <Text style={[styles.contentText, {color: theme.colors.text}]} numberOfLines={4}>
              {buzz.content}
            </Text>

            {/* Media Thumbnail (if exists) */}
            {hasImage ? (
              <Image
                source={{uri: mediaUri as string}}
                style={styles.mediaThumbnail}
                resizeMode="cover"
                onError={(error) => {
                  console.log('Image load error:', error.nativeEvent.error);
                  console.log('Image URI:', mediaUri);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', mediaUri);
                }}
              />
            ) : hasVideo ? (
              <View style={styles.videoContainer}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setVideoPaused(!videoPaused)}
                  style={styles.mediaThumbnail}>
                  <Video
                    source={{uri: mediaUri as string}}
                    style={styles.mediaThumbnail}
                    resizeMode={ResizeMode.COVER}
                    paused={videoPaused}
                    muted={false}
                    controls={false}
                    repeat={false}
                    onError={(error) => {
                      console.log('Video load error:', error);
                      console.log('Video URI:', mediaUri);
                    }}
                    onLoad={() => {
                      console.log('Video loaded successfully:', mediaUri);
                    }}
                  />
                  {videoPaused && (
                    <View style={styles.videoPlayBadge}>
                      <Icon name="play-circle-filled" size={60} color="#FFFFFF" />
                    </View>
                  )}
                  {!videoPaused && (
                    <View style={styles.videoPauseBadge}>
                      <Icon name="pause-circle-filled" size={60} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
                {!videoPaused && (
                  <TouchableOpacity
                    style={styles.videoStopButton}
                    onPress={() => setVideoPaused(true)}
                    activeOpacity={0.8}>
                    <Icon name="stop" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            {buzz.eventDate && countdown ? (
              <View style={[styles.countdownPill, {backgroundColor: theme.colors.primary + '20'}]}>
                <Icon name="schedule" size={16} color={theme.colors.primary} />
                <Text style={[styles.countdownText, {color: theme.colors.primary}]}>{countdown}</Text>
              </View>
            ) : null}

            {hasInterests && (
              <View style={styles.chipRow}>
                {normalizedInterests.slice(0, 3).map(interest => (
                  <View
                    key={interest.id}
                    style={[styles.chip, {backgroundColor: theme.colors.primary + '15'}]}
                  >
                    <Text style={styles.chipEmoji}>{interest.emoji}</Text>
                    <Text style={[styles.chipLabel, {color: theme.colors.primary}]}>
                      {interest.name}
                    </Text>
                  </View>
                ))}
                {normalizedInterests.length > 3 && (
                  <View style={[styles.chip, {backgroundColor: theme.colors.border}]}>
                    <Text style={[styles.chipLabel, {color: theme.colors.textSecondary}]}>+{normalizedInterests.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Bottom Row: Actions */}
          <View style={styles.actionsRow}>
            <View style={styles.actionsLeft}>
              {features.buzzLikes && (
                <TouchableOpacity style={styles.actionButton} onPress={onLike} activeOpacity={0.7}>
                  <Icon
                    name={buzz.isLiked ? 'favorite' : 'favorite-border'}
                    size={20}
                    color={buzz.isLiked ? '#FF0069' : theme.colors.textSecondary}
                  />
                  <Text style={[styles.actionCount, {color: theme.colors.textSecondary}]}>
                    {buzz.likes}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onPress && onPress()}
                activeOpacity={0.7}>
                <Icon name="chat-bubble-outline" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.actionCount, {color: theme.colors.textSecondary}]}>
                  {buzz.comments}
                </Text>
              </TouchableOpacity>

              {features.buzzShares && (
                <TouchableOpacity style={styles.actionButton} onPress={handleShareClick} activeOpacity={0.7}>
                  <Icon name="share" size={20} color={theme.colors.textSecondary} />
                  <Text style={[styles.actionCount, {color: theme.colors.textSecondary}]}>
                    {buzz.shares}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Go Live button */}
            <TouchableOpacity
              style={[styles.goLiveButton, {borderColor: theme.colors.primary}]}
              onPress={() => {/* Navigate to Go Live */}}
              activeOpacity={0.8}>
              <Text style={[styles.goLiveText, {color: theme.colors.primary}]}>Go Live on this</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </TouchableOpacity>

      <SocialMediaShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        buzzId={buzz.id}
        buzzContent={buzz.content}
        buzzMedia={buzz.media?.url || undefined}
      />

      <MenuModal
        visible={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        onBlock={handleBlock}
        onAbout={handleAbout}
        onSave={handleSave}
        onRemove={handleRemove}
        isOwnBuzz={isOwnBuzz}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  userTextContainer: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  menuButton: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 21,
  },
  mediaThumbnail: {
    width: '100%',
    height: width * 0.5,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
  },
  videoPlayBadge: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  videoPauseBadge: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  videoStopButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  chipEmoji: {
    fontSize: 12,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  goLiveButton: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  goLiveText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Keep old styles for compatibility
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 12,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: width * 0.8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    opacity: 0.08,
    marginVertical: 6,
    marginHorizontal: 16,
  },
});

export default BuzzCard;
