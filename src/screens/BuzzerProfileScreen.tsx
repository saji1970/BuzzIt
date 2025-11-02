import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useUser, Buzz} from '../context/UserContext';
import BuzzCard from '../components/BuzzCard';
import ApiService from '../services/APIService';

const {width, height} = Dimensions.get('window');

interface Buzzer {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string;
  followers: number;
  following: number;
  buzzCount: number;
  isVerified: boolean;
  isFollowing: boolean;
  isLive?: boolean;
  website?: string;
}

interface BuzzerProfileScreenProps {
  buzzerId: string;
  visible: boolean;
  onClose: () => void;
}

const BuzzerProfileScreen: React.FC<BuzzerProfileScreenProps> = ({
  buzzerId,
  visible,
  onClose,
}) => {
  const {theme} = useTheme();
  const {buzzes, likeBuzz, shareBuzz, subscribeToChannel, unsubscribeFromChannel, blockUser, isSubscribed, isBlocked} = useUser();
  const [buzzer, setBuzzer] = useState<Buzzer | null>(null);
  const [buzzerBuzzes, setBuzzerBuzzes] = useState<Buzz[]>([]);
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'tagged'>('grid');

  useEffect(() => {
    if (visible && buzzerId) {
      loadBuzzerData();
    }
  }, [visible, buzzerId]);

  const loadBuzzerData = async () => {
    try {
      // Fetch real user data from API
      const response = await ApiService.getUserById(buzzerId);
      
      if (response.success && response.data) {
        const userData = response.data;
        const buzzerData: Buzzer = {
          id: userData.id,
          username: userData.username,
          displayName: userData.displayName,
          avatar: userData.avatar,
          bio: userData.bio || '',
          followers: userData.followers || 0,
          following: userData.following || 0,
          buzzCount: userData.buzzCount || 0,
          isVerified: userData.isVerified || false,
          isFollowing: isSubscribed(buzzerId),
          isLive: false, // TODO: Check live stream status
          website: userData.website || undefined,
        };
        
        setBuzzer(buzzerData);
      } else {
        console.error('Failed to load buzzer data:', response.error);
        // Show error or fallback
      }
    } catch (error) {
      console.error('Error loading buzzer data:', error);
    }

    // Filter buzzes for this buzzer
    const userBuzzes = buzzes.filter(buzz => buzz.userId === buzzerId);
    setBuzzerBuzzes(userBuzzes);
  };

  const handleFollow = async () => {
    if (buzzer) {
      const newFollowingState = !buzzer.isFollowing;
      
      if (newFollowingState) {
        await subscribeToChannel(buzzer.id);
      } else {
        await unsubscribeFromChannel(buzzer.id);
      }
      
      setBuzzer({
        ...buzzer,
        isFollowing: newFollowingState,
        followers: newFollowingState ? buzzer.followers + 1 : buzzer.followers - 1,
      });
    }
  };

  const handleShare = () => {
    // TODO: Implement share profile functionality
  };

  const handleBlock = () => {
    if (buzzer) {
      Alert.alert(
        'Block User',
        `Are you sure you want to block ${buzzer.username}? Their buzzes will be hidden from your feed.`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Block',
            style: 'destructive',
            onPress: async () => {
              await blockUser(buzzer.id);
              Alert.alert('Blocked', `${buzzer.username} has been blocked.`);
              onClose();
            },
          },
        ]
      );
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderBuzzGrid = () => {
    const gridData = buzzerBuzzes.slice(0, 6); // Show first 6 buzzes
    
    return (
      <View style={styles.gridContainer}>
        {gridData.map((buzz, index) => (
          <TouchableOpacity
            key={buzz.id}
            style={[
              styles.gridItem,
              {backgroundColor: theme.colors.surface},
            ]}
            onPress={() => {/* TODO: Open buzz detail */}}>
            {buzz.media && buzz.media.url ? (
              <Image
                source={{uri: buzz.media.url}}
                style={styles.gridImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.gridPlaceholder, {backgroundColor: theme.colors.border}]}>
                <Icon name="image" size={24} color={theme.colors.textSecondary} />
              </View>
            )}
            {buzz.media.type === 'video' && (
              <View style={styles.videoIcon}>
                <Icon name="play-arrow" size={16} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReels = () => (
    <View style={styles.emptyState}>
      <Icon name="video-library" size={48} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
        No reels yet
      </Text>
    </View>
  );

  const renderTagged = () => (
    <View style={styles.emptyState}>
      <Icon name="person" size={48} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
        No tagged posts
      </Text>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'grid':
        return renderBuzzGrid();
      case 'reels':
        return renderReels();
      case 'tagged':
        return renderTagged();
      default:
        return renderBuzzGrid();
    }
  };

  if (!buzzer) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        {/* Header */}
        <View style={[styles.header, {backgroundColor: theme.colors.surface}]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            {buzzer.username}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="notifications-none" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="more-vert" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileTop}>
              {/* Profile Picture */}
              <View style={styles.avatarContainer}>
                <View
                  style={[
                    styles.avatar,
                    {backgroundColor: theme.colors.primary},
                    buzzer.isLive && styles.liveBorder,
                  ]}>
                  {buzzer.avatar ? (
                    <Image source={{uri: buzzer.avatar}} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {buzzer.displayName.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                {buzzer.isLive && (
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live</Text>
                  </View>
                )}
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, {color: theme.colors.text}]}>
                    {buzzer.buzzCount}
                  </Text>
                  <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                    posts
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, {color: theme.colors.text}]}>
                    {formatNumber(buzzer.followers)}
                  </Text>
                  <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                    followers
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, {color: theme.colors.text}]}>
                    {buzzer.following}
                  </Text>
                  <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                    following
                  </Text>
                </View>
              </View>
            </View>

            {/* Bio */}
            <View style={styles.bioContainer}>
              <View style={styles.nameContainer}>
                <Text style={[styles.displayName, {color: theme.colors.text}]}>
                  {buzzer.displayName}
                </Text>
                {buzzer.isVerified && (
                  <Icon name="verified" size={16} color="#1DA1F2" style={styles.verifiedIcon} />
                )}
              </View>
              <Text style={[styles.bio, {color: theme.colors.text}]}>
                {buzzer.bio}
              </Text>
              {buzzer.website && (
                <TouchableOpacity>
                  <Text style={[styles.website, {color: theme.colors.primary}]}>
                    {buzzer.website}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  buzzer.isFollowing && styles.followingButton,
                  {backgroundColor: buzzer.isFollowing ? theme.colors.surface : theme.colors.primary},
                ]}
                onPress={handleFollow}>
                <Text
                  style={[
                    styles.followButtonText,
                    {color: buzzer.isFollowing ? theme.colors.text : '#FFFFFF'},
                  ]}>
                  {buzzer.isFollowing ? 'Following' : 'Follow'}
                </Text>
                {buzzer.isFollowing && (
                  <Icon name="keyboard-arrow-down" size={16} color={theme.colors.text} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.blockButton, {backgroundColor: theme.colors.surface}]}
                onPress={handleBlock}>
                <Icon name="block" size={16} color={theme.colors.error} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareButton, {backgroundColor: theme.colors.surface}]}
                onPress={handleShare}>
                <Icon name="person-add" size={16} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Story Highlights */}
            <View style={styles.highlightsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.highlightItem}>
                  <View style={[styles.highlightCircle, {backgroundColor: theme.colors.border}]}>
                    <Icon name="add" size={20} color={theme.colors.textSecondary} />
                  </View>
                  <Text style={[styles.highlightText, {color: theme.colors.textSecondary}]}>
                    New
                  </Text>
                </View>
                <View style={styles.highlightItem}>
                  <View style={[styles.highlightCircle, {backgroundColor: theme.colors.primary}]}>
                    <Text style={styles.highlightEmoji}>👋</Text>
                  </View>
                  <Text style={[styles.highlightText, {color: theme.colors.textSecondary}]}>
                    It's ya girl
                  </Text>
                </View>
                <View style={styles.highlightItem}>
                  <View style={[styles.highlightCircle, {backgroundColor: theme.colors.secondary}]}>
                    <Text style={styles.highlightEmoji}>🌊</Text>
                  </View>
                  <Text style={[styles.highlightText, {color: theme.colors.textSecondary}]}>
                    Vibez
                  </Text>
                </View>
                <View style={styles.highlightItem}>
                  <View style={[styles.highlightCircle, {backgroundColor: theme.colors.accent}]}>
                    <Text style={styles.highlightEmoji}>🗼</Text>
                  </View>
                  <Text style={[styles.highlightText, {color: theme.colors.textSecondary}]}>
                    Vibes
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Content Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'grid' && styles.activeTab]}
              onPress={() => setActiveTab('grid')}>
              <Icon
                name="grid-on"
                size={24}
                color={activeTab === 'grid' ? theme.colors.text : theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reels' && styles.activeTab]}
              onPress={() => setActiveTab('reels')}>
              <Icon
                name="video-library"
                size={24}
                color={activeTab === 'reels' ? theme.colors.text : theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'tagged' && styles.activeTab]}
              onPress={() => setActiveTab('tagged')}>
              <Icon
                name="person"
                size={24}
                color={activeTab === 'tagged' ? theme.colors.text : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentArea}>
            {renderContent()}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    padding: 16,
  },
  profileTop: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  liveBorder: {
    borderWidth: 3,
    borderColor: '#FF0069',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 32,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#FF0069',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  bioContainer: {
    marginBottom: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  website: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  followingButton: {
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  blockButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  shareButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  highlightsContainer: {
    marginBottom: 16,
  },
  highlightItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  highlightCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  highlightEmoji: {
    fontSize: 24,
  },
  highlightText: {
    fontSize: 12,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#000000',
  },
  contentArea: {
    minHeight: height * 0.4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
  },
  gridItem: {
    width: (width - 2) / 3,
    height: (width - 2) / 3,
    margin: 0.5,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});

export default BuzzerProfileScreen;
