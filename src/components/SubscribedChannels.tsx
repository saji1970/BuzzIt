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
import { MaterialIcons as Icon } from '@expo/vector-icons';

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
}

const SubscribedChannels: React.FC<SubscribedChannelsProps> = ({onChannelPress}) => {
  const {theme} = useTheme();
  const {user} = useUser();
  const [followedItems, setFollowedItems] = useState<FollowedItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFollowedItems();
  }, [user?.subscribedChannels]);

  const loadFollowedItems = async () => {
    if (!user || !user.subscribedChannels || user.subscribedChannels.length === 0) {
      setFollowedItems([]);
      return;
    }

    setLoading(true);
    try {
      // Get all users from API
      const response = await ApiService.getAllUsers();
      
      if (response.success && response.data) {
        // Filter to only show followed users
        const followed = response.data
          .filter((u: any) => user.subscribedChannels.includes(u.id))
          .map((u: any) => {
            // Determine if this is a channel or user
            // Check multiple indicators: role, isChannel property, or channel-specific fields
            const isChannel = u.role === 'channel' || 
                             u.role === 'Channel' ||
                             u.isChannel === true ||
                             u.type === 'channel' ||
                             (u.username && u.username.toLowerCase().includes('channel')) ||
                             false; // Default to user if no indicator found
            
            return {
              id: u.id,
              username: u.username,
              name: u.displayName || u.username,
              avatar: u.avatar,
              isLive: false, // TODO: Check if user is live via live streams API
              type: isChannel ? 'channel' : 'user',
            } as FollowedItem;
          });
        
        setFollowedItems(followed);
      }
    } catch (error) {
      console.error('Error loading followed items:', error);
      setFollowedItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no user
  if (!user) {
    return null;
  }

  // Show only followed users and channels from database
  const displayItems = followedItems;

  const handleChannelPress = (channelId: string) => {
    if (onChannelPress) {
      onChannelPress(channelId);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}>
        {displayItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.channelItem}
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
                ]}>
                {item.avatar ? (
                  <Image source={{uri: item.avatar}} style={styles.avatarImage} />
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
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 24,
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
  channelName: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 70,
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
