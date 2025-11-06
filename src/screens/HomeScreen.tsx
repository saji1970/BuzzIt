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
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import {useTheme} from '../context/ThemeContext';
import {useUser, Buzz} from '../context/UserContext';
import {useAuth} from '../context/AuthContext';
import {useFeatures} from '../context/FeatureContext';
import BuzzCard from '../components/BuzzCard';
import InterestFilter from '../components/InterestFilter';
import BuzzDetailScreen from './BuzzDetailScreen';
import BuzzerProfileScreen from './BuzzerProfileScreen';
import StreamViewerScreen from './StreamViewerScreen';
import CreateStreamScreen from './CreateStreamScreen';
import SubscribedChannels from '../components/SubscribedChannels';
import LiveStreamCard, {LiveStream} from '../components/LiveStreamCard';
import ApiService from '../services/APIService';
import UserRecommendationCard, {UserRecommendation} from '../components/UserRecommendationCard';
import ContactSyncService from '../components/ContactSyncService';
import YourBuzzScreen from './YourBuzzScreen';

const {width} = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const {user, buzzes, getBuzzesByInterests, likeBuzz, shareBuzz, isBlocked, subscribeToChannel, unsubscribeFromChannel} = useUser();
  const {isAuthenticated, isLoading: authLoading, user: authUser} = useAuth();
  const {features} = useFeatures();
  const [filteredBuzzes, setFilteredBuzzes] = useState<Buzz[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedBuzz, setSelectedBuzz] = useState<Buzz | null>(null);
  const [selectedBuzzerId, setSelectedBuzzerId] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
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
  const [showYourBuzz, setShowYourBuzz] = useState(false);

  // Mock channel data (same as in SubscribedChannels)
  const mockChannels = [
    {id: '1', username: 'buzzuser', name: 'Your Story', avatar: null, type: 'channel'},
    {id: '2', username: 'techguru', name: 'Tech Guru', avatar: null, type: 'channel'},
    {id: '3', username: 'foodie', name: 'Food Lover', avatar: null, type: 'channel'},
    {id: '4', username: 'adventurer', name: 'Adventure', avatar: null, type: 'channel'},
    {id: '5', username: 'fitnesspro', name: 'Fitness Pro', avatar: null, type: 'channel'},
  ];
  // Removed showCreateProfile state - only show for first-time users

  useEffect(() => {
    try {
      // Load the appropriate feed based on current toggle state
      if (useSmartFeed) {
        loadSmartFeed();
      } else {
        loadBuzzes();
      }
      loadLiveStreams();
      loadUserRecommendations();
    } catch (error) {
      console.error('Error in HomeScreen useEffect:', error);
      // Prevent crash
    }
  }, [user, buzzes, authUser, useSmartFeed]);

  // Refresh live streams periodically - more frequent to catch ended streams
  useEffect(() => {
    const interval = setInterval(() => {
      loadLiveStreams();
    }, 10000); // Every 10 seconds - more frequent to catch ended streams

    return () => clearInterval(interval);
  }, [user, authUser]); // Recreate interval when user changes

  // Refresh buzzes when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Load the appropriate feed based on current toggle state
      if (useSmartFeed) {
        loadSmartFeed();
      } else {
        loadBuzzes();
      }
    }, [user, buzzes, useSmartFeed])
  );

  const loadBuzzes = () => {
    try {
      console.log('Loading buzzes, user:', user?.username, 'buzzes count:', buzzes?.length);
      // Allow loading even if user is null - use empty interests array
      if (!buzzes) {
        console.log('No buzzes available yet');
        setFilteredBuzzes([]);
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
    
    // First, filter out buzzes from blocked users and own buzzes (NORMAL FEED)
    const currentUserId = user?.id || authUser?.id;
    let unblockedBuzzes = buzzes.filter(buzz => 
      !isBlocked(buzz.userId) && buzz.userId !== currentUserId
    );
    console.log('Unblocked buzzes count (excluding own):', unblockedBuzzes.length);
    
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
      // If user has no interests, show all unblocked buzzes (excluding own)
      filtered = unblockedBuzzes;
    }
    
    // Sort by creation date (newest first) - Normal feed is chronological
    filtered.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
      setFilteredBuzzes(filtered);
      console.log('Normal feed loaded:', filtered.length, 'buzzes (excluding own)');
    } catch (error) {
      console.error('Error loading buzzes:', error);
      // Silently fail - don't crash the app
      setFilteredBuzzes([]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Load the appropriate feed based on current toggle state
    if (useSmartFeed) {
      loadSmartFeed();
    } else {
      loadBuzzes();
    }
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
      const queryLower = query.toLowerCase();
      let results: any[] = [];
      
      // Fetch users and channels in parallel
      const [usersResponse, channelsResponse] = await Promise.all([
        ApiService.getAllUsers(),
        ApiService.getAllChannels(),
      ]);
      
      // Add users from API
      if (usersResponse.success && usersResponse.data) {
        const filteredUsers = usersResponse.data.filter((u: any) =>
          u.username?.toLowerCase().includes(queryLower) ||
          u.displayName?.toLowerCase().includes(queryLower)
        ).map((u: any) => ({
          ...u,
          type: 'user',
          searchName: u.displayName || u.username,
        }));
        results.push(...filteredUsers);
      }
      
      // Add channels from API
      if (channelsResponse.success && channelsResponse.data) {
        const filteredChannels = channelsResponse.data.filter((c: any) =>
          c.name?.toLowerCase().includes(queryLower) ||
          c.description?.toLowerCase().includes(queryLower) ||
          c.username?.toLowerCase().includes(queryLower)
        ).map((c: any) => ({
          ...c,
          type: 'channel',
          searchName: c.name,
          // Use channel name as display name, username as username
          displayName: c.name,
          username: c.username || `channel_${c.id}`,
        }));
        results.push(...filteredChannels);
      }
      
      setSearchResults(results);
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
      if (response && response.success && response.data) {
        // Filter to only show streams from subscribed channels/users
        const currentUserData = user || authUser;
        const subscribedIds = currentUserData?.subscribedChannels || [];
        
        // Map response data to LiveStream format and FILTER OUT ENDED STREAMS
        // Only show streams that are currently live (isLive === true)
        // Also verify stream hasn't ended by checking if it exists and is actually live
        const mappedStreams: LiveStream[] = response.data
          .filter((stream: any) => {
            // Only show streams that are explicitly marked as live
            if (!stream.isLive) return false;
            
            // Additional check: if stream has an endedAt timestamp, don't show it
            if (stream.endedAt) {
              const endedAt = new Date(stream.endedAt);
              const now = new Date();
              if (endedAt < now) return false; // Stream has ended
            }
            
            return true;
          })
          .map((stream: any) => ({
            id: stream.id,
            userId: stream.userId,
            username: stream.username,
            displayName: stream.displayName,
            title: stream.title,
            description: stream.description,
            streamUrl: stream.streamUrl && !stream.streamUrl.startsWith('/') ? stream.streamUrl : '', // Only use valid full URLs
            thumbnailUrl: stream.thumbnailUrl,
            isLive: stream.isLive,
            viewers: stream.viewers || 0,
            category: stream.category,
            startedAt: stream.startedAt,
            tags: stream.tags || [],
            endedAt: stream.endedAt, // Include endedAt for additional checking
          }));
        
        // Show all live streams, but prioritize streams from subscribed channels
        // This way users can see streams from people they follow AND discover new streams
        let finalStreams: LiveStream[];
        if (subscribedIds.length > 0) {
          // Separate streams: subscribed first, then others
          const subscribedStreams = mappedStreams.filter((stream: LiveStream) =>
            subscribedIds.includes(stream.userId)
          );
          const otherStreams = mappedStreams.filter((stream: LiveStream) =>
            !subscribedIds.includes(stream.userId)
          );
          // Combine: subscribed streams first, then others
          finalStreams = [...subscribedStreams, ...otherStreams];
        } else {
          // If no subscriptions, show all streams (for discovery)
          finalStreams = mappedStreams;
        }
        
        // Update state - this will automatically remove ended streams (not in mappedStreams)
        setLiveStreams(finalStreams);
      } else {
        // If API returns no data or error, clear all streams
        setLiveStreams([]);
      }
    } catch (error) {
      console.error('Error loading live streams:', error);
      // Silently fail - don't crash the app
      setLiveStreams([]);
    } finally {
      setLoadingLiveStreams(false);
    }
  };

  const handleStreamPress = (stream: LiveStream) => {
    setSelectedStream(stream);
  };

  const handleCloseStream = () => {
    setSelectedStream(null);
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
    const newSmartFeedState = !useSmartFeed;
    setUseSmartFeed(newSmartFeedState);
    // Reload feed based on new state
    if (newSmartFeedState) {
      loadSmartFeed();
    } else {
      loadBuzzes();
    }
  };

  // Smart Feed Algorithm - Ranks buzzes based on multiple factors
  const calculateSmartFeedScore = (buzz: Buzz, currentUser: any): number => {
    let score = 0;
    
    // 1. Interest Match Score (0-40 points)
    const userInterestIds = currentUser.interests?.map((i: any) => i.id) || [];
    const buzzInterestIds = buzz.interests?.map((i: any) => i.id) || [];
    const matchingInterests = buzzInterestIds.filter((id: string) => userInterestIds.includes(id));
    const interestMatchRatio = buzzInterestIds.length > 0 
      ? matchingInterests.length / buzzInterestIds.length 
      : 0;
    score += interestMatchRatio * 40;
    
    // 2. Engagement Score (0-30 points)
    // Normalize engagement metrics (likes, comments, shares)
    const totalEngagement = buzz.likes + buzz.comments + buzz.shares;
    // Use logarithmic scale to prevent very popular posts from dominating
    const engagementScore = Math.min(30, Math.log10(totalEngagement + 1) * 10);
    score += engagementScore;
    
    // 3. Recency Score (0-20 points)
    // Newer posts get higher scores
    const now = new Date().getTime();
    const buzzTime = buzz.createdAt instanceof Date 
      ? buzz.createdAt.getTime() 
      : new Date(buzz.createdAt).getTime();
    const hoursAgo = (now - buzzTime) / (1000 * 60 * 60);
    // Posts within 24 hours get full score, then decay
    const recencyScore = hoursAgo < 24 ? 20 : Math.max(0, 20 - (hoursAgo - 24) * 0.5);
    score += recencyScore;
    
    // 4. Followed User Bonus (0-10 points)
    const subscribedChannels = currentUser.subscribedChannels || [];
    if (subscribedChannels.includes(buzz.userId)) {
      score += 10;
    }
    
    // 5. User Interaction History (liked posts get slight boost)
    if (buzz.isLiked) {
      score += 2;
    }
    
    return score;
  };

  const loadSmartFeed = () => {
    try {
      if (!buzzes || buzzes.length === 0) {
        setFilteredBuzzes([]);
        return;
      }
      
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
      
      const currentUserId = user?.id || authUser?.id;
      
      // Filter out blocked users and own buzzes
      let eligibleBuzzes = buzzes.filter(buzz => 
        !isBlocked(buzz.userId) && buzz.userId !== currentUserId
      );
      
      // Calculate smart feed scores
      const buzzesWithScores = eligibleBuzzes.map(buzz => ({
        buzz,
        score: calculateSmartFeedScore(buzz, currentUser),
      }));
      
      // Sort by score (highest first)
      buzzesWithScores.sort((a, b) => b.score - a.score);
      
      // Extract buzzes from sorted array
      const smartFeedBuzzes = buzzesWithScores.map(item => item.buzz);
      
      setFilteredBuzzes(smartFeedBuzzes);
      console.log('Smart feed loaded:', smartFeedBuzzes.length, 'buzzes');
    } catch (error) {
      console.error('Error loading smart feed:', error);
      // Fallback to regular feed
      loadBuzzes();
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

  // Render header component for FlatList
  const renderHeader = () => (
    <>
      {/* Buzz Banner - Instagram Style */}
      <View style={[styles.buzzBanner, {backgroundColor: theme.colors.surface}]}>
        <View style={styles.buzzBannerContent}>
          <Text style={[styles.buzzText, {color: theme.colors.text, fontWeight: 'bold', fontSize: 24}]}>Buzz</Text>
          <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
            {/* Go Buzz Live Button - More Prominent */}
            <TouchableOpacity
              style={[styles.goLiveButton, {backgroundColor: theme.colors.primary}]}
              onPress={() => navigation.navigate('GoBuzzLive' as never)}>
              <LinearGradient
                colors={['#E4405F', '#FF6B9D']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.goLiveGradient}>
                <Icon name="videocam" size={20} color="#FFFFFF" />
                <Text style={styles.goLiveText}>Go Buzz Live</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.searchIconButton}
              onPress={() => setShowSearch(true)}>
              <Icon name="search" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Following Section - Instagram Style with YourBuzz */}
      <View style={styles.followingContainer}>
        <View style={styles.followingHeader}>
          <Text style={[styles.followingHeaderText, {color: theme.colors.text}]}>
            Follow Users & Subscribed Channels
          </Text>
        </View>
        <SubscribedChannels 
          onChannelPress={handleBuzzerPress}
          onYourBuzzPress={() => setShowYourBuzz(true)}
        />
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
            nestedScrollEnabled={true}
            scrollEnabled={true}
          />
        </View>
      )}

      <InterestFilter
        onFilterChange={handleInterestFilter}
        selectedInterests={selectedInterests}
      />

      {/* Live Streams Section - Only show if user has subscriptions */}
      {((user?.subscribedChannels && user.subscribedChannels.length > 0) || 
        (authUser?.subscribedChannels && authUser.subscribedChannels.length > 0)) && (
        <View style={styles.liveStreamsSection}>
          <View style={styles.sectionHeader}>
            <Icon name="videocam" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Live Now
            </Text>
          </View>
          {liveStreams.length > 0 ? (
            <FlatList
              data={liveStreams}
              renderItem={renderLiveStream}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.liveStreamsList}
              nestedScrollEnabled={true}
              scrollEnabled={true}
            />
          ) : (
            <View style={[styles.emptyStreamsContainer, {backgroundColor: theme.colors.surface}]}>
              <Icon name="videocam-off" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyStreamsText, {color: theme.colors.textSecondary}]}>
                No live streams from your subscribed channels
              </Text>
            </View>
          )}
        </View>
      )}
    </>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background, flex: 1}]}>
      <FlatList
        data={filteredBuzzes}
        renderItem={renderBuzz}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
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

      {/* YourBuzz Screen */}
      <YourBuzzScreen
        visible={showYourBuzz}
        onClose={() => setShowYourBuzz(false)}
      />

      {selectedStream && (
        <StreamViewerScreen
          stream={selectedStream}
          visible={!!selectedStream}
          onClose={handleCloseStream}
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
                    if (item.type === 'channel') {
                      // For channels, navigate to channel owner's profile or show channel details
                      setSelectedBuzzerId(item.userId || item.id);
                    } else {
                      setSelectedBuzzerId(item.id);
                    }
                    setShowSearch(false);
                  }}>
                  <View style={[styles.userAvatar, {backgroundColor: theme.colors.primary}]}>
                    {item.avatar ? (
                      <Image source={{uri: item.avatar}} style={styles.userAvatarImage} />
                    ) : (
                      <Text style={styles.userAvatarText}>
                        {item.type === 'channel' 
                          ? (item.name?.charAt(0).toUpperCase() || '📺')
                          : (item.username?.charAt(0).toUpperCase() || item.displayName?.charAt(0).toUpperCase() || '?')
                        }
                      </Text>
                    )}
                  </View>
                  <View style={styles.userResultInfo}>
                    <View style={styles.userResultHeader}>
                      <Text style={[styles.userResultName, {color: theme.colors.text}]} numberOfLines={1}>
                        {item.type === 'channel' ? item.name : (item.displayName || item.username)}
                      </Text>
                      {item.type === 'channel' && (
                        <View style={[styles.channelBadge, {backgroundColor: theme.colors.primary + '20'}]}>
                          <Icon name="video-library" size={12} color={theme.colors.primary} />
                          <Text style={[styles.channelBadgeText, {color: theme.colors.primary}]}>Channel</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.userResultUsername, {color: theme.colors.textSecondary}]} numberOfLines={1}>
                      {item.type === 'channel' 
                        ? `@${item.username || 'channel'}${item.description ? ' • ' + item.description.substring(0, 30) : ''}`
                        : `@${item.username}`
                      }
                    </Text>
                    {item.type === 'channel' && item.interests && item.interests.length > 0 && (
                      <View style={styles.channelInterests}>
                        {item.interests.slice(0, 3).map((interestId: string, idx: number) => {
                          // Try to find interest name from available interests
                          const interest = user?.interests?.find((i: any) => i.id === interestId);
                          const interestName = interest?.name || interestId;
                          return (
                            <View key={idx} style={[styles.interestChip, {backgroundColor: theme.colors.primary + '15'}]}>
                              <Text style={[styles.interestChipText, {color: theme.colors.primary, fontSize: 10}]}>
                                {interest?.emoji || ''} {interestName}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                  <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.trim() && !searching ? (
                  <View style={styles.emptySearch}>
                    <Icon name="person-search" size={48} color={theme.colors.textSecondary} />
                    <Text style={[styles.emptySearchText, {color: theme.colors.textSecondary}]}>
                      No users or channels found
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
  buzzBanner: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  buzzBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buzzText: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  goLiveButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  goLiveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  goLiveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchIconButton: {
    padding: 4,
  },
  followingContainer: {
    backgroundColor: '#F0F0F0',
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  followingHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  followingHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
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
  emptyStreamsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
  },
  emptyStreamsText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
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
  userResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  userResultName: {
    fontSize: 16,
    fontWeight: '600',
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  channelBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  userResultUsername: {
    fontSize: 14,
  },
  channelInterests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  interestChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  interestChipText: {
    fontSize: 10,
    fontWeight: '600',
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
