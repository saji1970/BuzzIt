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
          <View style={styles.coverContainer}>
            {hasImage ? (
              <Image source={{uri: mediaUri as string}} style={styles.coverImage} />
            ) : hasVideo ? (
              <View style={styles.coverImage}>
                <Video
                  source={{uri: mediaUri as string}}
                  style={styles.coverImage}
                  resizeMode={ResizeMode.COVER}
                  paused
                  muted
                />
                <View style={styles.videoBadge}>
                  <Icon name="play-arrow" size={18} color="#FFFFFF" />
                </View>
              </View>
            ) : (
              <LinearGradient
                colors={theme.gradients?.accent || [theme.colors.primary, theme.colors.secondary]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.coverPlaceholder}
              >
                <Icon name="bolt" size={30} color="rgba(255,255,255,0.9)" />
              </LinearGradient>
            )}

            <LinearGradient
              colors={["rgba(15,23,42,0.05)", "rgba(15,23,42,0.75)"]}
              style={styles.coverOverlay}
            />

            <TouchableOpacity
              style={styles.overlayMenuButton}
              onPress={() => setShowMenuModal(true)}
            >
              <Icon name="more-horiz" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.overlayFooter}>
              <View style={styles.overlayUserInfo}>
                <View style={[styles.overlayAvatar, {borderColor: 'rgba(255,255,255,0.35)'}]}>
                  {buzz.userAvatar ? (
                    <Image source={{uri: buzz.userAvatar}} style={styles.overlayAvatarImage} />
                  ) : (
                    <Text style={styles.overlayAvatarText}>
                      {buzz.username.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={styles.overlayTextContainer}>
                  <Text style={styles.overlayName}>{buzz.username}</Text>
                  <Text style={styles.overlayMeta}>
                    {formatTimeAgo(buzz.createdAt)} • {formatDateTime(buzz.createdAt)}
                  </Text>
                </View>
              </View>
              {!isOwnBuzz && (
                <TouchableOpacity
                  style={[styles.followChip, isFollowing && {backgroundColor: '#FFFFFF'}]}
                  onPress={handleFollow}
                >
                  <Text
                    style={[
                      styles.followChipText,
                      isFollowing && {color: theme.colors.primary},
                    ]}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.body}>
            <Text style={[styles.contentText, {color: theme.colors.text}]} numberOfLines={4}>
              {buzz.content}
            </Text>

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
                    style={[styles.chip, {backgroundColor: theme.colors.primary + '18'}]}
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

          <View style={styles.actionsRow}>
            {features.buzzLikes && renderAction(
              buzz.isLiked ? 'favorite' : 'favorite-border',
              `${buzz.likes}`,
              buzz.isLiked,
              onLike,
            )}

            {renderAction(
              'chat-bubble-outline',
              `${buzz.comments}`,
              false,
              () => {
                if (onPress) {
                  onPress();
                }
              },
            )}

            {features.buzzShares && renderAction(
              'share',
              `${buzz.shares}`,
              false,
              handleShareClick,
            )}
          </View>
        </Animatable.View>
      </TouchableOpacity>

      <SocialMediaShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
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

const COVER_HEIGHT = width * 0.9;

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: 'rgba(15,23,42,0.2)',
    shadowOffset: {width: 0, height: 18},
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 12,
  },
  coverContainer: {
    position: 'relative',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: COVER_HEIGHT,
  },
  coverPlaceholder: {
    width: '100%',
    height: COVER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayMenuButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15,23,42,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadge: {
    position: 'absolute',
    top: 18,
    left: 18,
    backgroundColor: 'rgba(15,23,42,0.4)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overlayFooter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlayUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  overlayAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginRight: 12,
  },
  overlayAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  overlayAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  overlayTextContainer: {
    flex: 1,
  },
  overlayName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  overlayMeta: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    marginTop: 2,
  },
  followChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  followChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  body: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    gap: 14,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
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
  },
});

export default BuzzCard;
