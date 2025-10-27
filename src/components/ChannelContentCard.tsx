import React from 'react';
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
import {BuzzChannelContent} from '../context/BuzzChannelContext';

const {width} = Dimensions.get('window');

interface ChannelContentCardProps {
  content: BuzzChannelContent;
  onPress: () => void;
  onLike: () => void;
  onVote: (vote: 'up' | 'down') => void;
  onShare: () => void;
}

const ChannelContentCard: React.FC<ChannelContentCardProps> = ({
  content,
  onPress,
  onLike,
  onVote,
  onShare,
}) => {
  const {theme} = useTheme();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: BuzzChannelContent['type']) => {
    switch (type) {
      case 'music_video': return 'music-video';
      case 'movie': return 'movie';
      case 'song': return 'music-note';
      case 'event_teaser': return 'event';
      case 'voice_snippet': return 'mic';
      case 'announcement': return 'campaign';
      default: return 'play-circle';
    }
  };

  const getTypeColor = (type: BuzzChannelContent['type']) => {
    switch (type) {
      case 'music_video': return '#FF6B6B';
      case 'movie': return '#4ECDC4';
      case 'song': return '#45B7D1';
      case 'event_teaser': return '#96CEB4';
      case 'voice_snippet': return '#FFEAA7';
      case 'announcement': return '#DDA0DD';
      default: return theme.colors.primary;
    }
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
            {content.userAvatar ? (
              <Image source={{uri: content.userAvatar}} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {content.username.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.username, {color: theme.colors.text}]}>
              @{content.username}
            </Text>
            <Text style={[styles.timeAgo, {color: theme.colors.textSecondary}]}>
              {formatTimeAgo(content.createdAt)}
            </Text>
          </View>
        </View>
        <View style={styles.typeIndicator}>
          <Icon 
            name={getTypeIcon(content.type)} 
            size={16} 
            color={getTypeColor(content.type)} 
          />
          <Text style={[styles.typeText, {color: getTypeColor(content.type)}]}>
            {content.type.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Content */}
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          {content.title}
        </Text>
        
        {content.description && (
          <Text style={[styles.description, {color: theme.colors.textSecondary}]}>
            {content.description}
          </Text>
        )}

        {/* Media Preview */}
        {content.media && content.media.url && (
          <View style={styles.mediaContainer}>
            <Image source={{uri: content.media.thumbnail || content.media.url}} style={styles.mediaImage} />
            <View style={styles.mediaOverlay}>
              <View style={styles.playButton}>
                <Icon name="play-arrow" size={24} color="#FFFFFF" />
              </View>
              {content.media.duration && (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {formatDuration(content.media.duration)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Tags */}
        {content.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {content.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, {backgroundColor: theme.colors.primary + '20'}]}>
                <Text style={[styles.tagText, {color: theme.colors.primary}]}>
                  #{tag}
                </Text>
              </View>
            ))}
            {content.tags.length > 3 && (
              <Text style={[styles.moreTags, {color: theme.colors.textSecondary}]}>
                +{content.tags.length - 3} more
              </Text>
            )}
          </View>
        )}

        {/* Target Audience */}
        {content.visibility === 'targeted' && (
          <View style={styles.audienceContainer}>
            <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.audienceText, {color: theme.colors.textSecondary}]}>
              Targeted: {content.targetAudience.geographic.countries.join(', ')}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Engagement Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onLike}>
          <Icon
            name={content.engagement.isLiked ? 'favorite' : 'favorite-border'}
            size={20}
            color={content.engagement.isLiked ? theme.colors.error : theme.colors.textSecondary}
          />
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            {content.engagement.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="visibility" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            {content.engagement.views}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="chat-bubble-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            {content.engagement.comments}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Icon name="share" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            {content.engagement.shares}
          </Text>
        </TouchableOpacity>

        {/* Voting */}
        <View style={styles.votingContainer}>
          <TouchableOpacity 
            style={[styles.voteButton, content.engagement.userVote === 'up' && styles.voteButtonActive]}
            onPress={() => onVote('up')}>
            <Icon 
              name="thumb-up" 
              size={16} 
              color={content.engagement.userVote === 'up' ? '#FFFFFF' : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
          
          <Text style={[styles.voteCount, {color: theme.colors.text}]}>
            {content.engagement.votes}
          </Text>
          
          <TouchableOpacity 
            style={[styles.voteButton, content.engagement.userVote === 'down' && styles.voteButtonActive]}
            onPress={() => onVote('down')}>
            <Icon 
              name="thumb-down" 
              size={16} 
              color={content.engagement.userVote === 'down' ? '#FFFFFF' : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
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
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  mediaContainer: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  audienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  audienceText: {
    fontSize: 12,
    marginLeft: 4,
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
  votingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  voteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  voteButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  voteCount: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChannelContentCard;
