import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';

import {useTheme} from '../context/ThemeContext';
import {useUser, Buzz} from '../context/UserContext';
import {useAuth} from '../context/AuthContext';
import {useFeatures} from '../context/FeatureContext';
import BuzzCard from '../components/BuzzCard';
import InterestFilter from '../components/InterestFilter';
import BuzzDetailScreen from './BuzzDetailScreen';
import BuzzerProfileScreen from './BuzzerProfileScreen';
import SubscribedChannels from '../components/SubscribedChannels';
import LiveStreamCard, {LiveStream} from '../components/LiveStreamCard';
import ApiService from '../services/APIService';
import UserRecommendationCard, {UserRecommendation} from '../components/UserRecommendationCard';
import ContactSyncService from '../components/ContactSyncService';

const {width} = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user, buzzes, getBuzzesByInterests, likeBuzz, shareBuzz, isBlocked} = useUser();
  const {isAuthenticated, isLoading: authLoading, user: authUser} = useAuth();
  const {features} = useFeatures();
  const [filteredBuzzes, setFilteredBuzzes] = useState<Buzz[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedBuzz, setSelectedBuzz] = useState<Buzz | null>(null);
  const [selectedBuzzerId, setSelectedBuzzerId] = useState<string | null>(null);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [loadingLiveStreams, setLoadingLiveStreams] = useState(false);
  const [userRecommendations, setUserRecommendations] = useState<UserRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [useSmartFeed, setUseSmartFeed] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  // Removed showCreateProfile state - only show for first-time users

  useEffect(() => {
    loadBuzzes();
    loadLiveStreams();
    loadUserRecommendations();
  }, [user, buzzes]);

  // Refresh live streams periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadLiveStreams();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Refresh buzzes when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadBuzzes();
    }, [user, buzzes])
  );

  const loadBuzzes = () => {
    console.log('Loading buzzes, user:', user?.username, 'buzzes count:', buzzes?.length);
    // Allow loading even if user is null - use empty interests array
    if (!buzzes) {
      console.log('No buzzes available yet');
      return;
    }
    
    // Use user if available, otherwise use authUser, otherwise fallback
    const currentUser = user || authUser || {
      id: 'temp-user',
      username: 'User',
      displayName: 'User',
      email: '',
      bio: '',
      avatar: null,
      interests: [],
      followers: 0,
      following: 0,
      buzzCount: 0,
      createdAt: new Date(),
      subscribedChannels: [],
      blockedUsers: [],
    };
    
    // First, filter out buzzes from blocked users
    let unblockedBuzzes = buzzes.filter(buzz => !isBlocked(buzz.userId));
    console.log('Unblocked buzzes count:', unblockedBuzzes.length);
    
    // Ensure unblockedBuzzes is not undefined
    if (!unblockedBuzzes) {
      unblockedBuzzes = [];
    }
    
    // Show all buzzes if no interests selected, otherwise filter by interests
    let filtered: Buzz[];
    
    if (selectedInterests.length > 0) {
      const interestObjects = currentUser.interests.filter(i => 
        selectedInterests.includes(i.id)
      );
      filtered = getBuzzesByInterests(interestObjects).filter(buzz => 
        unblockedBuzzes.some(b => b.id === buzz.id)
      );
    } else if (currentUser.interests && currentUser.interests.length > 0) {
      filtered = getBuzzesByInterests(currentUser.interests).filter(buzz => 
        unblockedBuzzes.some(b => b.id === buzz.id)
      );
    } else {
      // If user has no interests, show all unblocked buzzes
      filtered = unblockedBuzzes;
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    setFilteredBuzzes(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBuzzes();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleInterestFilter = (interestIds: string[]) => {
    setSelectedInterests(interestIds);
    // Reload buzzes when filter changes
    setTimeout(() => {
      loadBuzzes();
    }, 0);
  };

  const handleBuzzPress = (buzz: Buzz) => {
    setSelectedBuzz(buzz);
  };

  const handleCloseDetail = () => {
    setSelectedBuzz(null);
  };

  const handleNextBuzz = () => {
    if (!selectedBuzz) return;
    const currentIndex = filteredBuzzes.findIndex(b => b.id === selectedBuzz.id);
    if (currentIndex < filteredBuzzes.length - 1) {
      setSelectedBuzz(filteredBuzzes[currentIndex + 1]);
    }
  };

  const handlePreviousBuzz = () => {
    if (!selectedBuzz) return;
    const currentIndex = filteredBuzzes.findIndex(b => b.id === selectedBuzz.id);
    if (currentIndex > 0) {
      setSelectedBuzz(filteredBuzzes[currentIndex - 1]);
    }
  };

  const handleFollow = (buzzId: string) => {
    // TODO: Implement follow functionality
    console.log('Follow buzz:', buzzId);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await ApiService.getAllUsers();
      if (response.success && response.data) {
        const filtered = response.data.filter((u: any) =>
          u.username?.toLowerCase().includes(query.toLowerCase()) ||
          u.displayName?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleBuzzerPress = (buzzerId: string) => {
    setSelectedBuzzerId(buzzerId);
  };

  const handleCloseBuzzerProfile = () => {
    setSelectedBuzzerId(null);
  };

  const loadLiveStreams = async () => {
    try {
      setLoadingLiveStreams(true);
      const response = await ApiService.getLiveStreams();
      if (response.success && response.data) {
        setLiveStreams(response.data);
      }
    } catch (error) {
      console.error('Error loading live streams:', error);
    } finally {
      setLoadingLiveStreams(false);
    }
  };

  const handleStreamPress = (stream: LiveStream) => {
    // Increment viewer count when stream is opened
    ApiService.updateViewers(stream.id, 'increment');
    // TODO: Navigate to full-screen stream view
    console.log('Stream pressed:', stream.id);
  };

  const handleStreamUserPress = (userId: string) => {
    setSelectedBuzzerId(userId);
  };

  const loadUserRecommendations = async () => {
    if (!user) return;
    
    try {
      setLoadingRecommendations(true);
      
      // Sync contacts
      const {contacts, socialConnections} = await ContactSyncService.syncContacts();
      
      // Get recommendations
      const response = await ApiService.getUserRecommendations({
        contacts,
        socialConnections,
      });
      
      if (response.success && response.data) {
        setUserRecommendations(response.data.recommendations || []);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSubscribeUser = async (userId: string) => {
    try {
      const isSubscribed = user?.subscribedChannels?.includes(userId) || false;
      
      if (isSubscribed) {
        unsubscribeFromChannel(userId);
      } else {
        subscribeToChannel(userId);
      }
      
      // Remove from recommendations after subscribe
      setUserRecommendations(prev => 
        prev.filter(rec => rec.user.id !== userId)
      );
    } catch (error) {
      console.error('Error subscribing to user:', error);
    }
  };

  const handleToggleSmartFeed = () => {
    setUseSmartFeed(!useSmartFeed);
    if (!useSmartFeed) {
      loadSmartFeed();
    } else {
      loadBuzzes();
    }
  };

  const loadSmartFeed = async () => {
    try {
      setRefreshing(true);
      const response = await ApiService.getSmartFeed(50);
      if (response.success && response.data) {
        setFilteredBuzzes(response.data.buzzes || []);
      }
    } catch (error) {
      console.error('Error loading smart feed:', error);
      // Fallback to regular feed
      loadBuzzes();
    } finally {
      setRefreshing(false);
    }
  };

  const renderRecommendation = ({item}: {item: UserRecommendation}) => (
    <UserRecommendationCard
      recommendation={item}
      onSubscribe={handleSubscribeUser}
      onPress={handleBuzzerPress}
      isSubscribed={user?.subscribedChannels?.includes(item.user.id) || false}
    />
  );

  const renderLiveStream = ({item}: {item: LiveStream}) => (
    <LiveStreamCard
      stream={item}
      onPress={handleStreamPress}
      onUserPress={handleStreamUserPress}
    />
  );

  const renderBuzz = ({item, index}: {item: Buzz; index: number}) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.buzzContainer}>
      <BuzzCard
        buzz={item}
        onLike={async () => {
          likeBuzz(item.id);
          // Record interaction for AI learning
          await ApiService.recordInteraction(item.id, 'like');
        }}
        onShare={async () => {
          shareBuzz(item.id);
          // Record interaction for AI learning
          await ApiService.recordInteraction(item.id, 'share');
        }}
        onPress={async () => {
          handleBuzzPress(item);
          // Record view interaction
          await ApiService.recordInteraction(item.id, 'view');
        }}
        isFollowing={false}
        onFollow={handleFollow}
      />
    </Animatable.View>
  );

  const renderEmptyState = () => (
    <Animatable.View
      animation="fadeIn"
      style={[styles.emptyState, {backgroundColor: theme.colors.background}]}>
      <Icon name="trending-up" size={80} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
        No Buzz Yet!
      </Text>
      <Text style={[styles.emptySubtitle, {color: theme.colors.textSecondary}]}>
        Start following your interests to see buzzes here
      </Text>
    </Animatable.View>
  );

  // Wait for auth check to complete first
  if (authLoading) {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{color: theme.colors.text}}>Loading...</Text>
      </View>
    );
  }
  
  // HomeScreen should only render when authenticated (navigation handles login/profile screens)
  // But we'll still handle the case gracefully if somehow rendered while not authenticated
  if (authLoading) {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{color: theme.colors.text}}>Loading...</Text>
      </View>
    );
  }
  
  // If not authenticated, navigation should handle redirecting to Login/CreateProfile
  // But we'll show a message just in case
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20}]}>
        <Text style={{color: theme.colors.text, fontSize: 16, textAlign: 'center'}}>
          Please login or create a profile to continue.
        </Text>
      </View>
    );
  }
  
  // Create a minimal user object as fallback if user is null
  // Try to use authUser from AuthContext as well
  const displayUser = user || authUser || {
    id: 'loading-user',
    username: 'Loading...',
    displayName: 'Loading...',
    email: '',
    bio: '',
    avatar: null,
    interests: [],
    followers: 0,
    following: 0,
    buzzCount: 0,
    createdAt: new Date(),
    subscribedChannels: [],
    blockedUsers: [],
  };
  
  // Only show loading if we have absolutely no data at all
  // Show loading state while user/buzzes are being loaded (but only if authenticated)
  // Don't block rendering if we have buzzes or user data
  if (!user && !authUser && (!buzzes || buzzes.length === 0)) {
    // This is OK - we'll show an empty state in the render
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Following Section - Instagram Style */}
      <View style={styles.followingContainer}>
        <SubscribedChannels onChannelPress={handleBuzzerPress} />
      </View>

      {/* Smart Feed Toggle */}
      <View style={styles.smartFeedContainer}>
        <TouchableOpacity
          style={[
            styles.smartFeedButton,
            {
              backgroundColor: useSmartFeed 
                ? theme.colors.primary 
                : theme.colors.surface,
            },
          ]}
          onPress={handleToggleSmartFeed}>
          <Icon 
            name="auto-awesome" 
            size={18} 
            color={useSmartFeed ? '#FFFFFF' : theme.colors.text} 
          />
          <Text
            style={[
              styles.smartFeedText,
              {
                color: useSmartFeed ? '#FFFFFF' : theme.colors.text,
              },
            ]}>
            {useSmartFeed ? 'Smart Feed' : 'Normal Feed'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Recommendations */}
      {showRecommendations && userRecommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <View style={styles.sectionHeader}>
            <Icon name="people" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              People You May Know
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRecommendations(false)}>
              <Icon name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={userRecommendations.slice(0, 5)}
            renderItem={renderRecommendation}
            keyExtractor={(item) => item.user.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendationsList}
          />
        </View>
      )}

      <InterestFilter
        onFilterChange={handleInterestFilter}
        selectedInterests={selectedInterests}
      />

      {/* Live Streams Section */}
      {liveStreams.length > 0 && (
        <View style={styles.liveStreamsSection}>
          <View style={styles.sectionHeader}>
            <Icon name="videocam" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Live Now
            </Text>
          </View>
          <FlatList
            data={liveStreams}
            renderItem={renderLiveStream}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.liveStreamsList}
            refreshing={loadingLiveStreams}
            onRefresh={loadLiveStreams}
          />
        </View>
      )}

      <FlatList
        data={filteredBuzzes}
        renderItem={renderBuzz}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {selectedBuzz && (
        <BuzzDetailScreen
          buzz={selectedBuzz}
          onClose={handleCloseDetail}
          onNext={handleNextBuzz}
          onPrevious={handlePreviousBuzz}
        />
      )}

      {selectedBuzzerId && (
        <BuzzerProfileScreen
          buzzerId={selectedBuzzerId}
          visible={!!selectedBuzzerId}
          onClose={handleCloseBuzzerProfile}
        />
      )}

      {/* Search Modal */}
      <Modal
        visible={showSearch}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSearch(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: theme.colors.text}]}>
                Search Users & Channels
              </Text>
              <TouchableOpacity onPress={() => setShowSearch(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.searchInputContainer, {backgroundColor: theme.colors.background}]}>
              <Icon name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, {color: theme.colors.text}]}
                placeholder="Search users or channels..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  handleSearch(text);
                }}
                autoFocus
              />
              {searching && <Icon name="sync" size={20} color={theme.colors.primary} />}
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[styles.userResultItem, {backgroundColor: theme.colors.background}]}
                  onPress={() => {
                    setSelectedBuzzerId(item.id);
                    setShowSearch(false);
                  }}>
                  <View style={[styles.userAvatar, {backgroundColor: theme.colors.primary}]}>
                    {item.avatar ? (
                      <Image source={{uri: item.avatar}} style={styles.userAvatarImage} />
                    ) : (
                      <Text style={styles.userAvatarText}>
                        {item.username?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    )}
                  </View>
                  <View style={styles.userResultInfo}>
                    <Text style={[styles.userResultName, {color: theme.colors.text}]}>
                      {item.displayName || item.username}
                    </Text>
                    <Text style={[styles.userResultUsername, {color: theme.colors.textSecondary}]}>
                      @{item.username}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.trim() && !searching ? (
                  <View style={styles.emptySearch}>
                    <Icon name="person-search" size={48} color={theme.colors.textSecondary} />
                    <Text style={[styles.emptySearchText, {color: theme.colors.textSecondary}]}>
                      No users found
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  followingContainer: {
    backgroundColor: '#F0F0F0',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  // Removed createProfileButton style - no longer needed
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  buzzContainer: {
    marginBottom: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  locationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  liveStreamsSection: {
    marginBottom: 16,
    paddingHorizontal: 15,
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
  liveStreamsList: {
    paddingRight: 15,
  },
  smartFeedContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: 'flex-end',
  },
  smartFeedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  smartFeedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recommendationsSection: {
    marginBottom: 16,
    paddingHorizontal: 15,
  },
  recommendationsList: {
    paddingRight: 15,
  },
  closeButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchButtonText: {
    marginLeft: 8,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  userResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userResultInfo: {
    flex: 1,
  },
  userResultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userResultUsername: {
    fontSize: 14,
  },
  emptySearch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySearchText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default HomeScreen;
