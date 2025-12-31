import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useTheme} from '../context/ThemeContext';
import {useUser} from '../context/UserContext';
import ApiService from '../services/APIService';

const {width} = Dimensions.get('window');

interface FollowedItem {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  isLive?: boolean;
  lastPost?: string;
  type: 'user' | 'channel'; // To distinguish users from channels
}

interface SubscribedChannelsProps {
  onChannelPress?: (channelId: string) => void;
  onYourBuzzPress?: () => void;
  variant?: 'default' | 'card';
}

const SubscribedChannels: React.FC<SubscribedChannelsProps> = ({
  onChannelPress,
  onYourBuzzPress,
  variant = 'default',
}) => {
  const {theme} = useTheme();
  const {user, buzzes} = useUser();
  const [followedItems, setFollowedItems] = useState<FollowedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isCard = variant === 'card';
  
  // Get user's own buzz count
  const userBuzzCount = buzzes?.filter(buzz => buzz.userId === user?.id).length || 0;

  useEffect(() => {
    loadFollowedItems();
  }, [user?.subscribedChannels]);

  const loadFollowedItems = async () => {
    setLoading(true);
    try {
      // Get all users and live streams in parallel
      const [usersResponse, streamsResponse] = await Promise.all([
        ApiService.getAllUsers(),
        ApiService.getLiveStreams(),
      ]);
      
      if (usersResponse.success && usersResponse.data) {
        let itemsToShow: FollowedItem[] = [];
        const subscribedIds = user?.subscribedChannels || [];
        
        // Get web-based live streams (not BuzzLive/IVS)
        const webBasedLiveStreams = (streamsResponse.success && streamsResponse.data) 
          ? streamsResponse.data.filter((stream: any) => {
              if (!stream.isLive) return false;
              
              // Check if stream has a streamUrl
              const hasStreamUrl = stream.streamUrl && stream.streamUrl.trim() !== '';
              
              // Check if it's an IVS/BuzzLive stream
              const isIvsStream = stream.streamUrl && (
                stream.streamUrl.includes('ivs') ||
                stream.streamUrl.includes('amazonaws.com') ||
                stream.streamUrl.includes('playback.live-video.net') ||
                stream.ivsPlaybackUrl
              );
              
              // Only include web-based streams (have streamUrl but NOT IVS)
              return hasStreamUrl && !isIvsStream;
            })
          : [];
        
        // Create a map of userId -> isLive for quick lookup
        const liveUserIds = new Set(
          webBasedLiveStreams.map((stream: any) => stream.userId)
        );
        
        // Always show all users, but prioritize followed users first
        // This way users can see both who they follow AND discover new users
        const allUsers = usersResponse.data
          .filter((u: any) => u.id !== user?.id) // Exclude current user
          .map((u: any) => {
            // Determine if this is a channel or user
            const isChannel = u.role === 'channel' || 
                             u.role === 'Channel' ||
                             u.isChannel === true ||
                             u.type === 'channel' ||
                             (u.username && u.username.toLowerCase().includes('channel')) ||
                             false;
            
            return {
              id: u.id,
              username: u.username,
              name: u.displayName || u.username,
              avatar: u.avatar,
              isLive: liveUserIds.has(u.id), // Only show live for web-based streams
              type: isChannel ? 'channel' : 'user',
              isSubscribed: subscribedIds.includes(u.id), // Mark if subscribed
            } as FollowedItem & {isSubscribed?: boolean};
          });
        
        // Sort: subscribed users first, then others
        itemsToShow = allUsers.sort((a, b) => {
          const aSubscribed = subscribedIds.includes(a.id);
          const bSubscribed = subscribedIds.includes(b.id);
          if (aSubscribed && !bSubscribed) return -1;
          if (!aSubscribed && bSubscribed) return 1;
          return 0;
        }).slice(0, 30); // Show up to 30 users (prioritizing followed ones)
        
        setFollowedItems(itemsToShow);
      }
    } catch (error) {
      console.error('Error loading followed items:', error);
      setFollowedItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Show only followed users and channels from database
  const displayItems = followedItems;
  
  // Always show YourBuzz section, even if user data is still loading
  // This ensures the UI is visible immediately

  const handleChannelPress = (channelId: string) => {
    if (channelId === 'yourbuzz') {
      if (onYourBuzzPress) {
        onYourBuzzPress();
      }
      return;
    }
    if (onChannelPress) {
      onChannelPress(channelId);
    }
  };

  const handleYourBuzzPress = () => {
    if (onYourBuzzPress) {
      onYourBuzzPress();
    }
  };

  return (
    <View style={[
      styles.container,
      isCard && styles.cardContainer,
    ]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}>
        {/* YourBuzz - First item like Instagram Stories */}
        {/* Always show YourBuzz, even if user is still loading */}
        <TouchableOpacity
          style={[styles.channelItem, isCard && styles.cardChannelItem]}
          onPress={handleYourBuzzPress}>
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                {backgroundColor: theme.colors.primary},
                userBuzzCount > 0 && styles.yourBuzzAvatar,
                isCard && styles.cardAvatar,
              ]}>
              {user?.avatar ? (
                <Image source={{uri: user.avatar}} style={[styles.avatarImage, isCard && styles.cardAvatarImage]} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.displayName?.charAt(0).toUpperCase() || 
                   user?.username?.charAt(0).toUpperCase() || 
                   'Y'}
                </Text>
              )}
              {userBuzzCount > 0 && (
                <View style={styles.buzzCountBadge}>
                  <Text style={styles.buzzCountText}>{userBuzzCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.addIcon}>
              <Icon name="add" size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text
            style={[
              styles.channelName,
              {color: theme.colors.text, fontWeight: '600'},
              isCard && styles.cardChannelName,
            ]}
            numberOfLines={1}>
            YourBuzz
          </Text>
        </TouchableOpacity>
        
        {displayItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.channelItem, isCard && styles.cardChannelItem]}
            onPress={() => handleChannelPress(item.id)}>
            <View
              style={[
                styles.avatarContainer,
                item.isLive && styles.liveBorder,
              ]}>
              <View
                style={[
                  styles.avatar,
                  {backgroundColor: theme.colors.primary},
                  isCard && styles.cardAvatar,
                ]}>
                {item.avatar ? (
                  <Image source={{uri: item.avatar}} style={[styles.avatarImage, isCard && styles.cardAvatarImage]} />
                ) : (
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
            </View>
            <Text
              style={[
                styles.channelName,
                  {color: theme.colors.text},
                  isCard && styles.cardChannelName,
              ]}
              numberOfLines={1}>
              {item.name}
            </Text>
            {/* Icon below name to distinguish user vs channel */}
            <View style={styles.typeIconContainer}>
              {item.type === 'channel' ? (
                <Icon name="video-library" size={14} color={theme.colors.primary} />
              ) : (
                <Icon name="person" size={14} color={theme.colors.textSecondary} />
              )}
            </View>
            {item.isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardContainer: {
    borderBottomWidth: 0,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  scrollView: {
    paddingHorizontal: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  channelItem: {
    marginHorizontal: 6,
    alignItems: 'center',
    width: 70,
  },
  cardChannelItem: {
    width: 60,
    marginHorizontal: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  liveBorder: {
    borderWidth: 2,
    borderColor: '#FF0069',
    borderRadius: 35,
    padding: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cardAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 24,
  },
  yourBuzzAvatar: {
    borderWidth: 2,
    borderColor: '#E4405F',
  },
  addIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1DA1F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buzzCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E4405F',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buzzCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  channelName: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 70,
  },
  cardChannelName: {
    fontSize: 11,
    maxWidth: 60,
  },
  typeIconContainer: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FF0069',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 3,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  subscribeButton: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default SubscribedChannels;
