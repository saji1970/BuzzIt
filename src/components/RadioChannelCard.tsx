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
import {RadioChannel} from '../context/RadioChannelContext';

const {width} = Dimensions.get('window');

interface RadioChannelCardProps {
  channel: RadioChannel;
  onPress: () => void;
  onLike: () => void;
  onShare: () => void;
}

const RadioChannelCard: React.FC<RadioChannelCardProps> = ({
  channel,
  onPress,
  onLike,
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: RadioChannel['category']) => {
    switch (category) {
      case 'entertainment': return 'theater-comedy';
      case 'education': return 'school';
      case 'news': return 'article';
      case 'sports': return 'sports';
      case 'music': return 'music-note';
      case 'technology': return 'computer';
      case 'business': return 'business';
      case 'health': return 'local-hospital';
      case 'lifestyle': return 'star';
      case 'comedy': return 'sentiment-very-satisfied';
      case 'politics': return 'account-balance';
      case 'science': return 'science';
      default: return 'radio';
    }
  };

  const getCategoryColor = (category: RadioChannel['category']) => {
    switch (category) {
      case 'entertainment': return '#FF6B6B';
      case 'education': return '#4ECDC4';
      case 'news': return '#45B7D1';
      case 'sports': return '#96CEB4';
      case 'music': return '#FFEAA7';
      case 'technology': return '#DDA0DD';
      case 'business': return '#98D8C8';
      case 'health': return '#F7DC6F';
      case 'lifestyle': return '#BB8FCE';
      case 'comedy': return '#85C1E9';
      case 'politics': return '#F8C471';
      case 'science': return '#82E0AA';
      default: return theme.colors.primary;
    }
  };

  const getStatusColor = (status: RadioChannel['status']) => {
    switch (status) {
      case 'live': return '#2ECC71';
      case 'scheduled': return '#F39C12';
      case 'ended': return '#95A5A6';
      case 'archived': return '#7F8C8D';
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: RadioChannel['status']) => {
    switch (status) {
      case 'live': return 'LIVE';
      case 'scheduled': return 'SCHEDULED';
      case 'ended': return 'ENDED';
      case 'archived': return 'ARCHIVED';
      default: return 'UNKNOWN';
    }
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.hostInfo}>
          <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
            {channel.hostAvatar ? (
              <Image source={{uri: channel.hostAvatar}} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {channel.hostName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.hostDetails}>
            <Text style={[styles.hostName, {color: theme.colors.text}]}>
              @{channel.hostName}
            </Text>
            <Text style={[styles.timeAgo, {color: theme.colors.textSecondary}]}>
              {channel.createdAt ? formatTimeAgo(channel.createdAt) : 'Unknown time'}
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor(channel.status)}]}>
            <Text style={styles.statusText}>
              {getStatusText(channel.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          {channel.title}
        </Text>
        
        {channel.description && (
          <Text style={[styles.description, {color: theme.colors.textSecondary}]}>
            {channel.description}
          </Text>
        )}

        {/* Category and Tags */}
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryBadge, {backgroundColor: getCategoryColor(channel.category) + '20'}]}>
            <Icon 
              name={getCategoryIcon(channel.category)} 
              size={14} 
              color={getCategoryColor(channel.category)} 
            />
            <Text style={[styles.categoryText, {color: getCategoryColor(channel.category)}]}>
              {channel.category.toUpperCase()}
            </Text>
          </View>
          
          {channel.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {channel.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  style={[styles.tag, {backgroundColor: theme.colors.primary + '20'}]}>
                  <Text style={[styles.tagText, {color: theme.colors.primary}]}>
                    #{tag}
                  </Text>
                </View>
              ))}
              {channel.tags.length > 3 && (
                <Text style={[styles.moreTags, {color: theme.colors.textSecondary}]}>
                  +{channel.tags.length - 3} more
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Live Status and Listeners */}
        {channel.isLive && (
          <View style={styles.liveContainer}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={[styles.liveText, {color: '#2ECC71'}]}>
                LIVE
              </Text>
            </View>
            <Text style={[styles.listenerCount, {color: theme.colors.textSecondary}]}>
              {channel.currentListeners} listening
            </Text>
          </View>
        )}

        {/* Scheduled Time */}
        {channel.status === 'scheduled' && channel.scheduledAt && (
          <View style={styles.scheduledContainer}>
            <Icon name="schedule" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.scheduledText, {color: theme.colors.textSecondary}]}>
              Scheduled for {channel.scheduledAt.toLocaleDateString()} at {channel.scheduledAt.toLocaleTimeString()}
            </Text>
          </View>
        )}

        {/* Duration */}
        {channel.duration > 0 && (
          <View style={styles.durationContainer}>
            <Icon name="timer" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.durationText, {color: theme.colors.textSecondary}]}>
              {formatDuration(channel.duration)}
            </Text>
          </View>
        )}

        {/* Target Audience */}
        {!channel.isPublic && (
          <View style={styles.audienceContainer}>
            <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.audienceText, {color: theme.colors.textSecondary}]}>
              Targeted: {channel.targetAudience.geographic.countries.join(', ')}
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
            name={channel.engagement.isLiked ? 'favorite' : 'favorite-border'}
            size={20}
            color={channel.engagement.isLiked ? theme.colors.error : theme.colors.textSecondary}
          />
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            {channel.engagement.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="headset" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            {channel.engagement.totalListeners}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="chat-bubble-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            {channel.engagement.comments}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Icon name="share" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            {channel.engagement.shares}
          </Text>
        </TouchableOpacity>

        {/* Join Button */}
        <TouchableOpacity 
          style={[styles.joinButton, {backgroundColor: theme.colors.primary}]}
          onPress={onPress}>
          <Icon 
            name={channel.isLive ? 'play-arrow' : 'schedule'} 
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.joinButtonText}>
            {channel.isLive ? 'Join Live' : 'View Details'}
          </Text>
        </TouchableOpacity>
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
  hostInfo: {
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
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  listenerCount: {
    fontSize: 12,
  },
  scheduledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduledText: {
    fontSize: 12,
    marginLeft: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 12,
    marginLeft: 4,
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
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 'auto',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default RadioChannelCard;
