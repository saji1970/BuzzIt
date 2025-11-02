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
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import ApiService from '../services/APIService';

const {width} = Dimensions.get('window');

export interface UserRecommendation {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    bio?: string;
    followers: number;
    following: number;
    buzzCount: number;
    isVerified: boolean;
    interests?: any[];
    location?: {
      city?: string;
      country?: string;
    };
  };
  score: number;
  reasons: string[];
}

interface UserRecommendationCardProps {
  recommendation: UserRecommendation;
  onSubscribe: (userId: string) => void;
  onPress?: (userId: string) => void;
  isSubscribed?: boolean;
}

const UserRecommendationCard: React.FC<UserRecommendationCardProps> = ({
  recommendation,
  onSubscribe,
  onPress,
  isSubscribed = false,
}) => {
  const {theme} = useTheme();
  const {user, reasons, score} = recommendation;

  const handleSubscribe = () => {
    onSubscribe(user.id);
  };

  const handlePress = () => {
    if (onPress) {
      onPress(user.id);
    }
  };

  return (
    <Animatable.View
      animation="fadeInRight"
      style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.7}>
        {/* Avatar */}
        <View style={[styles.avatarContainer, {backgroundColor: theme.colors.primary}]}>
          {user.avatar ? (
            <Image source={{uri: user.avatar}} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarText}>
              {user.displayName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
            </Text>
          )}
          {user.isVerified && (
            <View style={styles.verifiedBadge}>
              <Icon name="verified" size={14} color="#1DA1F2" />
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.displayName, {color: theme.colors.text}]}>
              {user.displayName || user.username}
            </Text>
            {user.isVerified && (
              <Icon name="verified" size={16} color="#1DA1F2" style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={[styles.username, {color: theme.colors.textSecondary}]}>
            @{user.username}
          </Text>
          
          {user.bio && (
            <Text 
              style={[styles.bio, {color: theme.colors.textSecondary}]}
              numberOfLines={2}>
              {user.bio}
            </Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, {color: theme.colors.text}]}>
                {user.buzzCount || 0}
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Buzzes
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, {color: theme.colors.text}]}>
                {user.followers || 0}
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Followers
              </Text>
            </View>
          </View>

          {/* Reasons */}
          {reasons && reasons.length > 0 && (
            <View style={styles.reasonsContainer}>
              {reasons.map((reason, index) => (
                <View
                  key={index}
                  style={[styles.reasonTag, {backgroundColor: theme.colors.primary + '20'}]}>
                  <Icon name="check-circle" size={12} color={theme.colors.primary} />
                  <Text style={[styles.reasonText, {color: theme.colors.primary}]}>
                    {reason}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Location */}
          {user.location?.city && (
            <View style={styles.locationRow}>
              <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.locationText, {color: theme.colors.textSecondary}]}>
                {user.location.city}
                {user.location.country && `, ${user.location.country}`}
              </Text>
            </View>
          )}

          {/* Match Score */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreFill,
                  {
                    width: `${score * 100}%`,
                    backgroundColor: score > 0.7 ? '#4CAF50' : score > 0.5 ? '#FF9800' : theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.scoreText, {color: theme.colors.textSecondary}]}>
              {Math.round(score * 100)}% match
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Subscribe Button */}
      <TouchableOpacity
        style={[
          styles.subscribeButton,
          {
            backgroundColor: isSubscribed
              ? theme.colors.error
              : theme.colors.primary,
          },
        ]}
        onPress={handleSubscribe}>
        <Text style={styles.subscribeButtonText}>
          {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  reasonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  reasonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
  },
  scoreContainer: {
    marginBottom: 8,
  },
  scoreBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 2,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '500',
  },
  subscribeButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UserRecommendationCard;

