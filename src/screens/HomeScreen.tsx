import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
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
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useTheme} from '../context/ThemeContext';
import {useUser, Buzz} from '../context/UserContext';
import {useAuth} from '../context/AuthContext';
import {useFeatures} from '../context/FeatureContext';
import BuzzCard from '../components/BuzzCard';
import InterestFilter from '../components/InterestFilter';
import BuzzDetailScreen from './BuzzDetailScreen';
import CreateStreamScreen from './CreateStreamScreen';
import SubscribedChannels from '../components/SubscribedChannels';
import ApiService from '../services/APIService';
import UserRecommendationCard, {UserRecommendation} from '../components/UserRecommendationCard';
import ContactSyncService from '../components/ContactSyncService';
import YourBuzzScreen from './YourBuzzScreen';
import ScreenContainer from '../components/ScreenContainer';
import HeroCard, {TopBuzzer} from '../components/HeroCard';
import FilterChipsRow, {FilterChip} from '../components/FilterChipsRow';
import FilterModal from '../components/FilterModal';
import LiveStreamBar, {LiveStreamBarStream} from '../components/LiveStreamBar';
import {LiveStream} from '../components/LiveStreamCard';

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
  const [userRecommendations, setUserRecommendations] = useState<UserRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [useSmartFeed, setUseSmartFeed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showYourBuzz, setShowYourBuzz] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [buzzliveStreams, setBuzzliveStreams] = useState<LiveStreamBarStream[]>([]);
  const [loadingBuzzliveStreams, setLoadingBuzzliveStreams] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Define renderEmptyState early to ensure it's always available
  const renderEmptyState = useCallback(() => (
    <View
      style={[styles.emptyState, {backgroundColor: theme.colors.background}]}>
      <Icon name="trending-up" size={80} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
        No Buzz Yet!
      </Text>
      <Text style={[styles.emptySubtitle, {color: theme.colors.textSecondary}]}>
        Start following your interests to see buzzes here
      </Text>
    </View>
  ), [theme.colors.background, theme.colors.text, theme.colors.textSecondary]);

  // Legacy alias for backwards compatibility - defined early in component to prevent ReferenceError
  // This ensures compatibility with any cached or external references
  const renderEmptyList = useCallback(() => renderEmptyState(), [renderEmptyState]);

  useEffect(() => {
    try {
      // Load the appropriate feed based on current toggle state
      if (useSmartFeed) {
        loadSmartFeed();
      } else {
        loadBuzzes();
      }
      loadUserRecommendations();
      loadBuzzliveStreams();
    } catch (error) {
      console.error('Error in HomeScreen useEffect:', error);
      // Prevent crash
    }
  }, [user, buzzes, authUser, useSmartFeed]);

  // Refresh buzzes when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Load the appropriate feed based on current toggle state
      if (useSmartFeed) {
        loadSmartFeed();
      } else {
        loadBuzzes();
      }
      loadBuzzliveStreams();
    }, [user, buzzes, useSmartFeed])
  );

  const renderSearchResults = () => {
    if (!searchQuery.trim()) {
      return null;
    }

    return (
      <View
        style={[
          styles.searchResultsContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {searching ? (
          <Text style={[styles.searchResultsLabel, {color: theme.colors.textSecondary}]}>
            Searching...
          </Text>
        ) : searchResults.length === 0 ? (
          <Text style={[styles.searchResultsLabel, {color: theme.colors.textSecondary}]}>
            No matches found
          </Text>
        ) : (
          searchResults.slice(0, 5).map(item => (
            <TouchableOpacity
              key={`${item.type}-${item.id || item.user?.id || item.username}`}
              style={styles.searchResultItem}
              activeOpacity={0.9}
              onPress={() => {
                const targetId = item.id || item.user?.id || item.userId || item.username;
                setSearchQuery('');
                setSearchResults([]);
                if ((item.type === 'user' || item.type === 'channel') && targetId) {
                  handleBuzzerPress(targetId);
                }
              }}
            >
              <View style={styles.searchResultAvatar}>
                {item.avatar ? (
                  <Image source={{uri: item.avatar}} style={styles.searchResultAvatarImage} />
                ) : (
                  <Text style={styles.searchResultAvatarText}>
                    {item.displayName?.charAt(0)?.toUpperCase() || item.username?.charAt(0)?.toUpperCase() || '#'}
                  </Text>
                )}
              </View>
              <View style={styles.searchResultInfo}>
                <Text style={[styles.searchResultTitle, {color: theme.colors.text}]}>
                  {item.displayName || item.searchName || item.username}
                </Text>
                {item.username ? (
                  <Text style={[styles.searchResultSubtitle, {color: theme.colors.textSecondary}]}>
                    @{item.username}
                  </Text>
                ) : null}
              </View>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  // Refresh buzzes more frequently (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // Reload buzzes from context (which will trigger feed refresh)
      if (useSmartFeed) {
        loadSmartFeed();
      } else {
        loadBuzzes();
      }
      // Also refresh buzzlive streams
      loadBuzzliveStreams();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [user, buzzes, useSmartFeed]);

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
    
    // First, filter out buzzes from blocked users AND own buzzes (NORMAL FEED)
    const currentUserId = user?.id || authUser?.id;
    let unblockedBuzzes = buzzes.filter(buzz =>
      !isBlocked(buzz.userId) && buzz.userId !== currentUserId
    );
    console.log('Unblocked buzzes count (excluding own and blocked):', unblockedBuzzes.length);
    
    // Ensure unblockedBuzzes is not undefined
    if (!unblockedBuzzes) {
      unblockedBuzzes = [];
    }
    
    // IMPORTANT: Show ALL buzzes from ALL users by default
    // Only filter by interests if user explicitly selects interests to filter by
    // This ensures users can see buzzes from everyone, not just matching interests
    let filtered: Buzz[];
    
    if (selectedInterests.length > 0) {
      // User explicitly selected interests to filter - show only matching buzzes
      const interestObjects = currentUser.interests.filter(i => 
        selectedInterests.includes(i.id)
      );
      filtered = getBuzzesByInterests(interestObjects).filter(buzz => 
        unblockedBuzzes.some(b => b.id === buzz.id)
      );
      console.log(`Filtering by ${selectedInterests.length} selected interests: ${filtered.length} buzzes`);
    } else {
      // No interests selected - show ALL unblocked buzzes from ALL users
      // This is the default behavior to ensure visibility
      filtered = unblockedBuzzes;
      console.log(`Showing all buzzes (no interest filter): ${filtered.length} buzzes from all users`);
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
    loadBuzzliveStreams();
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
    navigation.navigate('BuzzerProfile' as never, { buzzerId } as never);
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

  const loadBuzzliveStreams = async () => {
    try {
      setLoadingBuzzliveStreams(true);
      const response = await ApiService.getLiveStreams();

      if (response.success && response.data) {
        // Filter to only show BuzzLive streams (IVS streams, not web-based)
        const buzzliveStreamData = response.data
          .filter((stream: any) => {
            if (!stream.isLive) return false;
            
            // Check if it's a BuzzLive/IVS stream
            const isIvsStream = 
              stream.ivsPlaybackUrl ||
              (stream.streamUrl && (
                stream.streamUrl.includes('ivs') ||
                stream.streamUrl.includes('amazonaws.com') ||
                stream.streamUrl.includes('playback.live-video.net')
              ));
            
            // Only show BuzzLive streams (IVS streams)
            return isIvsStream;
          })
          .map((stream: any): LiveStreamBarStream => ({
            id: stream.id,
            userId: stream.userId,
            username: stream.username,
            displayName: stream.displayName,
            title: stream.title,
            viewers: stream.viewers || 0,
            avatar: stream.thumbnailUrl,
          }));
        
        setBuzzliveStreams(buzzliveStreamData);
      }
    } catch (error) {
      console.error('Error loading buzzlive streams:', error);
      setBuzzliveStreams([]);
    } finally {
      setLoadingBuzzliveStreams(false);
    }
  };

  const handleBuzzliveStreamPress = async (stream: LiveStreamBarStream) => {
    try {
      // Fetch full stream data from API to get playback URL
      const response = await ApiService.getLiveStream(stream.id);
      if (response.success && response.data) {
        const fullStream: LiveStream = {
          id: response.data.id,
          userId: response.data.userId,
          username: response.data.username,
          displayName: response.data.displayName,
          title: response.data.title,
          description: response.data.description,
          streamUrl: response.data.ivsPlaybackUrl || response.data.streamUrl || '',
          thumbnailUrl: response.data.thumbnailUrl || stream.avatar || null,
          isLive: response.data.isLive,
          viewers: response.data.viewers || stream.viewers,
          category: response.data.category,
          startedAt: response.data.startedAt || new Date().toISOString(),
          tags: response.data.tags,
          ivsPlaybackUrl: response.data.ivsPlaybackUrl || null,
          restreamPlaybackUrl: response.data.restreamPlaybackUrl || null,
        };
        
        navigation.navigate('StreamViewer' as never, {stream: fullStream} as never);
      } else {
        // Fallback if API call fails
        const fallbackStream: LiveStream = {
          id: stream.id,
          userId: stream.userId,
          username: stream.username,
          displayName: stream.displayName,
          title: stream.title,
          streamUrl: '',
          thumbnailUrl: stream.avatar || null,
          isLive: true,
          viewers: stream.viewers,
          startedAt: new Date().toISOString(),
        };
        navigation.navigate('StreamViewer' as never, {stream: fallbackStream} as never);
      }
    } catch (error) {
      console.error('Error fetching stream data:', error);
      // Fallback navigation
      const fallbackStream: LiveStream = {
        id: stream.id,
        userId: stream.userId,
        username: stream.username,
        displayName: stream.displayName,
        title: stream.title,
        streamUrl: '',
        thumbnailUrl: stream.avatar || null,
        isLive: true,
        viewers: stream.viewers,
        startedAt: new Date().toISOString(),
      };
      navigation.navigate('StreamViewer' as never, {stream: fallbackStream} as never);
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

      // Filter out blocked users AND own buzzes (consistent with normal feed)
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

  const renderBuzz = ({item, index}: {item: Buzz; index: number}) => (
    <View
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
    </View>
  );


  // Wait for auth check to complete first
  if (authLoading) {
    return (
      <View style={{flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: theme.colors.text}}>Loading...</Text>
      </View>
    );
  }
  
  // If not authenticated, navigation should handle redirecting to Login/CreateProfile
  // But we'll show a message just in case
  if (!isAuthenticated) {
    return (
      <View style={{flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20}}>
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

  // Get top buzzers (subscribed channels)
  const getTopBuzzers = (): TopBuzzer[] => {
    // Use the userRecommendations or create dummy data
    if (userRecommendations.length > 0) {
      return userRecommendations.slice(0, 5).map(rec => ({
        id: rec.user.id,
        username: rec.user.username,
        displayName: rec.user.displayName || rec.user.username,
        avatar: rec.user.avatar,
      }));
    }
    return [];
  };

  const renderHero = () => (
    <View style={{paddingTop: insets.top}}>
      <HeroCard
        title="Home"
        subtitle="buzz feed"
        topBuzzers={getTopBuzzers()}
        searchQuery={searchQuery}
        onSearchChange={text => {
          setSearchQuery(text);
          handleSearch(text);
        }}
        onBuzzLivePress={() => navigation.navigate('GoBuzzLive' as never)}
        onBuzzerPress={handleBuzzerPress}
        onRefresh={() => {
          scrollViewRef.current?.scrollTo({y: 0, animated: true});
          onRefresh();
        }}
        username={displayUser.username}
        displayName={displayUser.displayName}
        userAvatar={displayUser.avatar}
      />
    </View>
  );

  const renderHeader = () => {
    try {
      return (
    <>
      {renderHero()}
      {renderSearchResults()}

      {/* BuzzLive Streams Bar */}
      {buzzliveStreams.length > 0 && (
        <View style={styles.buzzliveStreamsContainer}>
          {buzzliveStreams.map((stream) => (
            <LiveStreamBar
              key={stream.id}
              stream={stream}
              onPress={handleBuzzliveStreamPress}
            />
          ))}
        </View>
      )}

      {/* Feed Header with Filter Icon and Mode Toggle */}
      <View style={styles.feedHeadingRow}>
        <View style={styles.feedHeadingLeft}>
          <TouchableOpacity
            style={[
              styles.filterIconButton,
              {
                backgroundColor: selectedInterests.length > 0 ? theme.colors.primary : 'rgba(15,23,42,0.08)',
              },
            ]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.8}>
            <Icon
              name="filter-list"
              size={20}
              color={selectedInterests.length > 0 ? '#FFFFFF' : theme.colors.text}
            />
            {selectedInterests.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedInterests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={[styles.feedHeading, {color: theme.colors.text}]}>buzz feed</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.feedToggle,
            {
              backgroundColor: useSmartFeed ? theme.colors.text : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={handleToggleSmartFeed}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.feedToggleText,
              {color: useSmartFeed ? '#FFFFFF' : theme.colors.text},
            ]}>
            Normal Feed
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Recommendations */}
      {showRecommendations && userRecommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <View style={styles.sectionHeader}>
            <Icon name="people" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>People You May Know</Text>
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
            nestedScrollEnabled
          />
        </View>
      )}


    </>
  );
    } catch (error) {
      console.error('Error rendering header:', error);
      return (
        <View style={{padding: 20, alignItems: 'center'}}>
          <Text style={{color: theme.colors.text}}>Error loading header</Text>
        </View>
      );
    }
  };

  // Ensure we always render something, even if there's an error
  let headerContent = null;
  try {
    headerContent = renderHeader();
  } catch (error) {
    console.error('Error in renderHeader:', error);
    headerContent = (
      <View style={{padding: 20, alignItems: 'center'}}>
        <Icon name="error-outline" size={24} color={theme.colors.primary} />
        <Text style={{color: theme.colors.text, marginTop: 8}}>Error loading header</Text>
      </View>
    );
  }

  // Add console log to verify component is rendering
  console.log('HomeScreen rendering - isAuthenticated:', isAuthenticated, 'user:', user?.username, 'authUser:', authUser?.username);

  // Fallback: If ScreenContainer fails, render a simple view
  try {
  return (
    <View style={{flex: 1}}>
      {/* Background Gradient */}
      <LinearGradient
        colors={theme.gradients?.background || ['#EAF4FF', '#FFFFFF']}
        style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={{paddingBottom: 120}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.sectionSpacing}>
          {headerContent}

          {filteredBuzzes.length === 0 ? (
            renderEmptyState()
          ) : (
            filteredBuzzes.map(item => (
              <BuzzCard
                key={item.id}
                buzz={item}
                onPress={() => handleBuzzPress(item)}
                onLike={() => likeBuzz(item.id)}
                onShare={() => shareBuzz(item.id)}
                onFollow={handleFollow}
              />
            ))
          )}
        </View>
      </ScrollView>

      {selectedBuzz && (
        <BuzzDetailScreen
          buzz={selectedBuzz}
          visible={!!selectedBuzz}
          onClose={handleCloseDetail}
          onNext={handleNextBuzz}
          onPrevious={handlePreviousBuzz}
        />
      )}

      {showYourBuzz && (
        <YourBuzzScreen visible={showYourBuzz} onClose={() => setShowYourBuzz(false)} />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        interests={user?.interests || []}
        selectedInterestIds={selectedInterests}
        onToggleInterest={(interestId) => {
          const newSelection = selectedInterests.includes(interestId)
            ? selectedInterests.filter(id => id !== interestId)
            : [...selectedInterests, interestId];
          handleInterestFilter(newSelection);
        }}
        onClearAll={() => handleInterestFilter([])}
      />
    </View>
  );
  } catch (error) {
    console.error('HomeScreen render error:', error);
    // Ultimate fallback - render a simple view
    return (
      <View style={{flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20}}>
        <Icon name="home" size={48} color={theme.colors.primary} />
        <Text style={{color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 16}}>Home</Text>
        <Text style={{color: theme.colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center'}}>
          {isAuthenticated ? 'Welcome back!' : 'Please login'}
        </Text>
        <Text style={{color: theme.colors.textSecondary, fontSize: 12, marginTop: 20, textAlign: 'center'}}>
          Error: {error?.message || 'Unknown error'}
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  sectionSpacing: {
    paddingHorizontal: 0,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  buzzLiveButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  buzzLiveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  buzzLiveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  searchResultsContainer: {
    borderWidth: 1,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
    marginTop: 12,
  },
  searchResultsLabel: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchResultAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(47,123,255,0.12)',
  },
  searchResultAvatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  searchResultAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F7BFF',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchResultSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
  heroContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    paddingBottom: 16,
    gap: 16,
    shadowColor: 'rgba(0, 0, 0, 0.18)',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.85,
    marginTop: 4,
  },
  heroRefreshButton: {
    padding: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  heroChannels: {
    marginTop: 16,
  },
  heroActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  heroSearchInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 0,
  },
  heroSearchInput: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  heroBuzzLiveButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.18)',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  heroBuzzLiveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  heroBuzzLiveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  feedHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  feedHeadingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF0069',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  feedHeading: {
    fontSize: 20,
    fontWeight: '700',
  },
  feedToggle: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  feedToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  buzzliveStreamsContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
});

export default HomeScreen;
