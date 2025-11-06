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
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {Buzz} from '../context/UserContext';
import {useFeatures} from '../context/FeatureContext';
import {useAuth} from '../context/AuthContext';
import SocialMediaShareModal from './SocialMediaShareModal';
import ApiService from '../services/APIService';

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

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Animatable.View
        animation="fadeInUp"
        style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
            {buzz.userAvatar ? (
              <Image source={{uri: buzz.userAvatar}} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {buzz.username.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.username, {color: theme.colors.text}]}>
              {buzz.username}
            </Text>
            <View style={styles.timeContainer}>
              <Text style={[styles.timeAgo, {color: theme.colors.textSecondary}]}>
                {formatTimeAgo(buzz.createdAt)}
              </Text>
              <Text style={[styles.dateTime, {color: theme.colors.textSecondary}]}>
                • {formatDateTime(buzz.createdAt)}
              </Text>
            </View>
          </View>
          {!isOwnBuzz && (
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollow}>
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={() => setShowMenuModal(true)}>
          <Icon name="more-vert" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.buzzText, {color: theme.colors.text}]} numberOfLines={3}>
          {buzz.content}
        </Text>

        {/* Media */}
        {buzz.media && buzz.media.url && (
          <View style={styles.mediaContainer}>
            {buzz.media.type === 'image' ? (
              <Image source={{uri: buzz.media.url}} style={styles.media} />
            ) : (
              <Video
                source={{ uri: buzz.media.url }}
                style={styles.video}
                useNativeControls={true}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
                isLooping={false}
                isMuted={false}
              />
            )}
          </View>
        )}

        {/* Countdown for scheduled streams/events */}
        {buzz.eventDate && countdown && (
          <View style={[styles.countdownContainer, {backgroundColor: theme.colors.primary + '20'}]}>
            <Icon name="schedule" size={16} color={theme.colors.primary} />
            <Text style={[styles.countdownText, {color: theme.colors.primary}]}>
              ⏰ {countdown}
            </Text>
          </View>
        )}

        {/* Interests */}
        {buzz.interests.length > 0 && (
          <View style={styles.interestsContainer}>
            {buzz.interests.slice(0, 3).map((interest, index) => (
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
            {buzz.interests.length > 3 && (
              <View style={[styles.interestTag, {backgroundColor: theme.colors.border}]}>
                <Text style={[styles.interestName, {color: theme.colors.textSecondary}]}>
                  +{buzz.interests.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {features.buzzLikes && (
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <Icon
              name={buzz.isLiked ? 'favorite' : 'favorite-border'}
              size={20}
              color={buzz.isLiked ? theme.colors.error : theme.colors.textSecondary}
            />
            <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
              {buzz.likes}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Icon name="chat-bubble-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            {buzz.comments}
          </Text>
        </TouchableOpacity>

        {features.buzzShares && (
          <TouchableOpacity style={styles.actionButton} onPress={handleShareClick}>
            <Icon name="share" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
              {buzz.shares}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.buzzButton}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.accent]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.buzzButtonGradient}>
            <Icon name="trending-up" size={16} color="#FFFFFF" />
            <Text style={styles.buzzButtonText}>BUZZ IT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

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
    </Animatable.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 10,
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
      timeAgo: {
        fontSize: 12,
        marginTop: 2,
      },
      timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
      },
      dateTime: {
        fontSize: 11,
        marginLeft: 4,
      },
  moreButton: {
    padding: 5,
  },
  content: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  buzzText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  mediaContainer: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  video: {
    width: '100%',
    height: 200,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  interestEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  interestName: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  buzzButton: {
    marginLeft: 'auto',
  },
  buzzButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  buzzButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  followButton: {
    backgroundColor: '#1DA1F2',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '400',
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 20,
  },
});

export default BuzzCard;
