import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useTheme} from '../context/ThemeContext';
import {useUser} from '../context/UserContext';
import {useAuth} from '../context/AuthContext';
import ApiService from '../services/APIService';
import FilterModal, {Interest} from '../components/FilterModal';
import LiveStreamCard, {LiveStream} from '../components/LiveStreamCard';

const {width} = Dimensions.get('window');

interface Channel {
  id: string;
  userId: string;
  name: string;
  description?: string;
  username: string;
  displayName?: string;
  avatar?: string;
  interests?: any[];
  isLive?: boolean;
  streamUrl?: string;
  ivsPlaybackUrl?: string;
  viewers?: number;
  createdAt: Date | string;
}

const ChannelsScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const {subscribeToChannel, unsubscribeFromChannel} = useUser();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [followedChannelsList, setFollowedChannelsList] = useState<Channel[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [followedChannels, setFollowedChannels] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get interests from user context
  const interests: Interest[] = user?.interests || [];

  // Initialize followed channels from user data
  useEffect(() => {
    if (user?.subscribedChannels) {
      setFollowedChannels(new Set(user.subscribedChannels));
    }
  }, [user?.subscribedChannels]);

  useEffect(() => {
    loadChannels();
    loadLiveStreams();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadChannels();
      loadLiveStreams();
    }, [])
  );

  useEffect(() => {
    filterChannels();
    updateFollowedChannelsList();
  }, [channels, searchQuery, selectedInterests, followedChannels]);

  const updateFollowedChannelsList = () => {
    // subscribedChannels contains user IDs, so we match against channel.userId
    const followed = channels.filter(channel =>
      followedChannels.has(channel.userId) || followedChannels.has(channel.id)
    );
    console.log('[ChannelsScreen] Followed channels:', followed.length, 'out of', channels.length);
    console.log('[ChannelsScreen] FollowedChannels Set:', Array.from(followedChannels));
    setFollowedChannelsList(followed);
  };

  const filterChannels = () => {
    let filtered = [...channels];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (channel) =>
          channel.name?.toLowerCase().includes(query) ||
          channel.username?.toLowerCase().includes(query) ||
          channel.description?.toLowerCase().includes(query)
      );
    }

    // Filter by selected interests
    if (selectedInterests.length > 0) {
      filtered = filtered.filter((channel) => {
        const channelInterests = channel.interests || [];
        return channelInterests.some((interest: any) =>
          selectedInterests.includes(interest.id || interest)
        );
      });
    }

    setFilteredChannels(filtered);
  };

  const loadChannels = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAllChannels();

      if (response.success && response.data) {
        // Get all channels (not just live ones)
        const channelData = response.data.map((channel: any) => ({
          id: channel.id,
          userId: channel.userId || channel.user_id,
          name: channel.name,
          description: channel.description,
          username: channel.username,
          displayName: channel.displayName || channel.display_name,
          avatar: channel.avatar,
          interests: channel.interests,
          isLive: false, // Channels are not necessarily live
          streamUrl: channel.streamUrl,
          ivsPlaybackUrl: channel.ivsPlaybackUrl,
          viewers: 0,
          createdAt: channel.createdAt || channel.created_at,
        }));
        setChannels(channelData);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLiveStreams = async () => {
    try {
      setLoadingStreams(true);
      const response = await ApiService.getLiveStreams();

      if (response.success && response.data) {
        // Get only live streams
        const liveStreamData = response.data.filter((stream: any) => stream.isLive);
        setLiveStreams(liveStreamData);
      }
    } catch (error) {
      console.error('Error loading live streams:', error);
      setLiveStreams([]);
    } finally {
      setLoadingStreams(false);
    }
  };


  const handleChannelPress = (channel: Channel) => {
    // Navigate to the channel owner's profile
    navigation.navigate('BuzzerProfile' as never, {buzzerId: channel.userId} as never);
  };

  const handleLiveStreamPress = (stream: LiveStream) => {
    // Navigate to stream viewer
    navigation.navigate('StreamViewer' as never, {stream} as never);
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('BuzzerProfile' as never, {buzzerId: userId} as never);
  };

  const handleToggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleClearFilters = () => {
    setSelectedInterests([]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChannels();
    loadLiveStreams();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={{flex: 1}}>
      {/* Background Gradient */}
      <LinearGradient
        colors={theme.gradients?.background || ['#EAF4FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingBottom: 120}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }>
        {/* Header - Instagram Style */}
        <View style={[styles.header, {paddingTop: insets.top + 12}]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => setShowFilterModal(true)}>
              <Icon name="add-box" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
              Channels
            </Text>
            <TouchableOpacity onPress={() => setShowFilterModal(true)}>
              <Icon
                name={selectedInterests.length > 0 ? "filter-list" : "search"}
                size={28}
                color={selectedInterests.length > 0 ? theme.colors.primary : theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Following Channels Row - Instagram Style Stories */}
        <View style={styles.followingRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.followingRowContent}>
            {/* Your Channel - Create Story */}
            {user && (
              <TouchableOpacity
                style={styles.followingChannelItem}
                onPress={() => navigation.navigate('BuzzerProfile' as never, {buzzerId: user.id} as never)}
                activeOpacity={0.7}>
                <View style={[styles.yourStoryContainer, {borderColor: theme.colors.border}]}>
                  <View style={[styles.followingAvatar, {backgroundColor: theme.colors.primary + '20'}]}>
                    {user.avatar ? (
                      <Image source={{uri: user.avatar}} style={styles.followingAvatarImage} />
                    ) : (
                      <Icon name="person" size={32} color={theme.colors.primary} />
                    )}
                  </View>
                  <View style={[styles.addStoryButton, {backgroundColor: theme.colors.primary}]}>
                    <Icon name="add" size={20} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={[styles.followingChannelName, {color: theme.colors.text}]} numberOfLines={1}>
                  Your channel
                </Text>
              </TouchableOpacity>
            )}

            {/* Followed Channels */}
            {followedChannelsList.length > 0 ? (
              followedChannelsList.map((channel) => (
                <TouchableOpacity
                  key={channel.id}
                  style={styles.followingChannelItem}
                  onPress={() => handleChannelPress(channel)}
                  activeOpacity={0.7}>
                  <LinearGradient
                    colors={['#E1306C', '#C13584', '#833AB4', '#5851DB']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.storyRing}>
                    <View style={[styles.storyInner, {backgroundColor: theme.colors.background}]}>
                      <View style={[styles.followingAvatar, {backgroundColor: theme.colors.primary + '20'}]}>
                        {channel.avatar ? (
                          <Image source={{uri: channel.avatar}} style={styles.followingAvatarImage} />
                        ) : (
                          <Icon name="live-tv" size={28} color={theme.colors.primary} />
                        )}
                      </View>
                    </View>
                  </LinearGradient>
                  <Text style={[styles.followingChannelName, {color: theme.colors.text}]} numberOfLines={1}>
                    {channel.name.length > 10 ? channel.name.substring(0, 10) + '...' : channel.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyFollowing}>
                <Icon name="person-add-alt" size={28} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyFollowingText, {color: theme.colors.textSecondary}]}>
                  Follow channels
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Live Streams Section */}
        {liveStreams.length > 0 && (
          <View style={styles.liveStreamsSection}>
            <View style={styles.sectionHeader}>
              <Icon name="live-tv" size={20} color="#FF0069" />
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Live Now</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.liveStreamsList}
              nestedScrollEnabled>
              {liveStreams.map((stream) => (
                <View key={stream.id} style={styles.liveStreamCardWrapper}>
                  <LiveStreamCard
                    stream={stream}
                    onPress={handleLiveStreamPress}
                    onUserPress={handleUserPress}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filtered Channels Section */}
        {(searchQuery || selectedInterests.length > 0) && (
          <View style={styles.channelsSection}>
            <View style={styles.sectionHeader}>
              <Icon name="search" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                {filteredChannels.length} {filteredChannels.length === 1 ? 'Channel' : 'Channels'} Found
              </Text>
            </View>

            {loading ? (
              <View style={styles.emptyState}>
                <Icon name="live-tv" size={80} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, {color: theme.colors.text}]}>
                  Loading channels...
                </Text>
              </View>
            ) : filteredChannels.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="search-off" size={80} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, {color: theme.colors.text}]}>
                  No channels found
                </Text>
                <Text style={[styles.emptySubtext, {color: theme.colors.textSecondary}]}>
                  Try adjusting your search or filters
                </Text>
              </View>
            ) : (
              <View style={styles.channelsGrid}>
                {filteredChannels.map((channel) => (
                  <TouchableOpacity
                    key={channel.id}
                    style={[styles.channelCard, {backgroundColor: theme.colors.surface}]}
                    onPress={() => handleChannelPress(channel)}
                    activeOpacity={0.7}>
                    <View style={styles.channelHeader}>
                      <View style={[styles.channelAvatar, {backgroundColor: theme.colors.primary + '20'}]}>
                        {channel.avatar ? (
                          <Image source={{uri: channel.avatar}} style={styles.channelAvatarImage} />
                        ) : (
                          <Icon name="live-tv" size={24} color={theme.colors.primary} />
                        )}
                      </View>
                      <View style={styles.channelInfo}>
                        <Text style={[styles.channelName, {color: theme.colors.text}]} numberOfLines={1}>
                          {channel.name}
                        </Text>
                        <Text style={[styles.channelUsername, {color: theme.colors.textSecondary}]} numberOfLines={1}>
                          @{channel.username}
                        </Text>
                        {channel.description && (
                          <Text style={[styles.channelDescription, {color: theme.colors.textSecondary}]} numberOfLines={2}>
                            {channel.description}
                          </Text>
                        )}
                      </View>
                      <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        interests={interests}
        selectedInterestIds={selectedInterests}
        onToggleInterest={handleToggleInterest}
        onClearAll={handleClearFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  followingRow: {
    paddingVertical: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  followingTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  followingRowContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  emptyFollowing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  emptyFollowingText: {
    fontSize: 14,
  },
  followingChannelItem: {
    alignItems: 'center',
    width: 72,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  storyInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followingAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followingAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  followingChannelName: {
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
  searchFilterSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
    flex: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  liveStreamsSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  liveStreamsList: {
    paddingRight: 16,
  },
  liveStreamCardWrapper: {
    width: 280,
    marginRight: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  channelsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  channelsGrid: {
    gap: 12,
  },
  channelCard: {
    borderRadius: 12,
    padding: 12,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  channelUsername: {
    fontSize: 13,
    marginBottom: 4,
  },
  channelDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ChannelsScreen;
