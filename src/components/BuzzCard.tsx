import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {Buzz} from '../context/UserContext';
import SocialMediaShareModal from './SocialMediaShareModal';

const {width} = Dimensions.get('window');

interface BuzzCardProps {
  buzz: Buzz;
  onLike: () => void;
  onShare: () => void;
  onPress?: () => void;
}

const BuzzCard: React.FC<BuzzCardProps> = ({buzz, onLike, onShare, onPress}) => {
  const {theme} = useTheme();
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShareClick = () => {
    setShowShareModal(true);
    onShare(); // Increment share count
  };

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
              @{buzz.username}
            </Text>
            <Text style={[styles.timeAgo, {color: theme.colors.textSecondary}]}>
              {formatTimeAgo(buzz.createdAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-vert" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.buzzText, {color: theme.colors.text}]} numberOfLines={3}>
          {buzz.content}
        </Text>

        {/* Media */}
        {buzz.media.url && (
          <View style={styles.mediaContainer}>
            {buzz.media.type === 'image' ? (
              <Image source={{uri: buzz.media.url}} style={styles.media} />
            ) : (
              <View style={[styles.videoPlaceholder, {backgroundColor: theme.colors.primary}]}>
                <Icon name="play-arrow" size={40} color="#FFFFFF" />
              </View>
            )}
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

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="chat-bubble-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            {buzz.comments}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShareClick}>
          <Icon name="share" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            {buzz.shares}
          </Text>
        </TouchableOpacity>

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
    </Animatable.View>

      <SocialMediaShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        buzzContent={buzz.content}
        buzzMedia={buzz.media.url || undefined}
      />
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
});

export default BuzzCard;
