import React, {useState} from 'react';
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
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
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

  const handleShareClick = () => {
    shareBuzz(buzz.id);
    setShowShareModal(true);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (evt, gestureState) => {
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
            transform: [{translateX: pan.x}],
          },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.closeButton, {backgroundColor: theme.colors.surface}]}
            onPress={onClose}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: theme.colors.surface}]}
              onPress={onPrevious}>
              <Icon name="chevron-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: theme.colors.surface}]}
              onPress={onNext}>
              <Icon name="chevron-right" size={24} color={theme.colors.text} />
            </TouchableOpacity>
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
          {buzz.media.url && (
            <View style={styles.mediaContainer}>
              {buzz.media.type === 'image' ? (
                <Image source={{uri: buzz.media.url}} style={styles.mediaImage} resizeMode="contain" />
              ) : buzz.media.type === 'video' ? (
                <View style={[styles.videoContainer, {backgroundColor: theme.colors.primary}]}>
                  <Icon name="play-circle-filled" size={80} color="#FFFFFF" />
                  <Text style={styles.videoText}>Video</Text>
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
          buzzMedia={buzz.media.url || undefined}
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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
  videoContainer: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 10,
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
