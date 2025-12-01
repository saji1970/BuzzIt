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
import * as Animatable from 'react-native-animatable';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
import ScreenContainer from '../components/ScreenContainer';
import BuzzLiveViewer from '../components/Buzzlive/BuzzLiveViewer';
import {getPlayableStreamUrl} from '../utils/streamUrl';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showYourBuzz, setShowYourBuzz] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Define renderEmptyState early to ensure it's always available
  const renderEmptyState = useCallback(() => (
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
  ), [theme.colors.background, theme.colors.text, theme.colors.textSecondary]);

  // Legacy alias for backwards compatibility - defined early in component to prevent ReferenceError
  // This ensures compatibility with any cached or external references
  const renderEmptyList = useCallback(() => renderEmptyState(), [renderEmptyState]);

  const primaryLiveStream = useMemo(
    () =>
      liveStreams.find(stream => {
        const playable = getPlayableStreamUrl(
          stream.ivsPlaybackUrl || stream.restreamPlaybackUrl || stream.streamUrl,
        );
        return Boolean(playable);
      }) || null,
    [liveStreams],
  );

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

  // Refresh buzzes more frequently to catch new posts (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // Reload buzzes from context (which will trigger feed refresh)
      if (useSmartFeed) {
        loadSmartFeed();
      } else {
        loadBuzzes();
      }
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
    
    // First, filter out buzzes from blocked users (NORMAL FEED)
    const currentUserId = user?.id || authUser?.id;
    let unblockedBuzzes = buzzes.filter(buzz => 
      !isBlocked(buzz.userId)
    );
    console.log('Unblocked buzzes count (excluding own):', unblockedBuzzes.length);
    
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
      console.log('Normal feed loaded:', filtered.length, 'buzzes (including own)');
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
      console.log('Loading live streams...');
      const response = await ApiService.getLiveStreams();
      console.log('Live streams API response:', response);
      
      if (response && response.success && response.data) {
        console.log('Raw streams from API:', response.data.length);
        
        // Filter to only show streams from subscribed channels/users
        const currentUserData = user || authUser;
        const subscribedIds = currentUserData?.subscribedChannels || [];
        
        // Map response data to LiveStream format and FILTER OUT ENDED STREAMS
        // Only show streams that are currently live (isLive === true)
        // Also verify stream hasn't ended by checking if it exists and is actually live
        const mappedStreams: LiveStream[] = response.data
          .filter((stream: any) => {
            // Only show streams that are explicitly marked as live
            if (!stream.isLive) {
              console.log('Stream not live, filtering out:', stream.id);
              return false;
            }
            
            // Additional check: if stream has an endedAt timestamp, don't show it
            if (stream.endedAt) {
              const endedAt = new Date(stream.endedAt);
              const now = new Date();
              if (endedAt < now) {
                console.log('Stream has ended, filtering out:', stream.id);
                return false; // Stream has ended
              }
            }
            
            return true;
          })
          .map((stream: any) => {
            const normalizedStreamUrl = getPlayableStreamUrl(stream.streamUrl) || '';
            const normalizedRestream = getPlayableStreamUrl(stream.restreamPlaybackUrl) || null;
            const normalizedIvs = getPlayableStreamUrl(stream.ivsPlaybackUrl) || null;

            return {
              id: stream.id,
              userId: stream.userId,
              username: stream.username || 'Unknown',
              displayName: stream.displayName || stream.username || 'Unknown',
              title: stream.title || 'Live Stream',
              description: stream.description,
              streamUrl: normalizedStreamUrl,
              thumbnailUrl: stream.thumbnailUrl,
              isLive: stream.isLive,
              viewers: stream.viewers || 0,
              category: stream.category,
              startedAt: stream.startedAt,
              tags: stream.tags || [],
              endedAt: stream.endedAt, // Include endedAt for additional checking
              restreamPlaybackUrl: normalizedRestream,
              ivsPlaybackUrl: normalizedIvs,
            };
          });
        
        console.log('Mapped live streams:', mappedStreams.length);
        console.log('Stream details:', mappedStreams.map(s => ({
          id: s.id,
          username: s.username,
          isLive: s.isLive,
          hasPlaybackUrl: !!(s.ivsPlaybackUrl || s.restreamPlaybackUrl || s.streamUrl),
        })));
        
        // Show ALL live streams to all users (not just subscribed ones)
        // This allows users to discover new streams from anyone
        // Prioritize streams from subscribed channels, but show all streams
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
          console.log('Subscribed streams:', subscribedStreams.length, 'Other streams:', otherStreams.length);
        } else {
          // If no subscriptions, show ALL streams (for discovery)
          finalStreams = mappedStreams;
          console.log('No subscriptions, showing all streams:', finalStreams.length);
        }
        
        // IMPORTANT: Show streams even if they don't have playback URLs yet
        // Streams might be "starting" and will get playback URLs once streaming begins
        // Update state - this will automatically remove ended streams (not in mappedStreams)
        setLiveStreams(finalStreams);
        console.log('Final live streams set:', finalStreams.length, 'streams visible to all users');
      } else {
        // If API returns no data or error, clear all streams
        console.log('No live streams from API or error:', response?.error);
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

  const renderHero = () => (
    <View style={[styles.heroContainer, {paddingTop: insets.top + 12}]}>
              <LinearGradient
        colors={['#7EB3FF', '#4C7DFF']}
                start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.heroCard}
      >
        <View style={styles.heroHeaderRow}>
          <View>
            <Text style={styles.heroTitle}>Home</Text>
            <Text style={styles.heroSubtitle}>buzz feed</Text>
          </View>
            <TouchableOpacity
            style={styles.heroRefreshButton}
            activeOpacity={0.85}
            onPress={() => {
              scrollViewRef.current?.scrollTo({y: 0, animated: true});
              onRefresh();
            }}
          >
            <Icon name="refresh" size={22} color="#FFFFFF" />
            </TouchableOpacity>
      </View>

        <View style={styles.heroChannels}>
        <SubscribedChannels 
            variant="card"
          onChannelPress={handleBuzzerPress}
          onYourBuzzPress={() => setShowYourBuzz(true)}
        />
      </View>

        <View style={styles.heroActionsRow}>
          <View
            style={[styles.searchInputContainer, styles.heroSearchInputContainer]}
          >
            <Icon name="search" size={18} color="rgba(255,255,255,0.8)" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={[styles.searchInput, styles.heroSearchInput]}
              value={searchQuery}
              onChangeText={text => {
                setSearchQuery(text);
                handleSearch(text);
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.heroBuzzLiveButton}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('GoBuzzLive' as never)}
          >
            <LinearGradient
              colors={['#54A9FF', '#2F7BFF']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.heroBuzzLiveGradient}
            >
              <Icon name="videocam" size={18} color="#FFFFFF" />
              <Text style={styles.heroBuzzLiveText}>BuzzLive</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderHeader = () => {
    try {
      return (
    <>
      {renderHero()}
      {renderSearchResults()}

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

      <View style={styles.feedHeadingRow}>
        <Text style={[styles.feedHeading, {color: theme.colors.text}]}>buzz feed</Text>
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

      <InterestFilter
        onFilterChange={handleInterestFilter}
        selectedInterests={selectedInterests}
      />

      {/* Live Stream Notification Banner - Show in buzz feed */}
      {liveStreams.length > 0 && liveStreams[0] && (
        <TouchableOpacity
          style={[styles.liveStreamBanner, {backgroundColor: theme.colors.primary}]}
          onPress={() => handleStreamPress(liveStreams[0])}
          activeOpacity={0.8}>
          <View style={styles.liveStreamBannerContent}>
            <View style={styles.liveStreamBannerLeft}>
              <View style={styles.liveStreamBannerIcon}>
                <Icon name="videocam" size={20} color="#FFFFFF" />
                <View style={styles.liveStreamBannerDot} />
          </View>
              <View style={styles.liveStreamBannerText}>
                <Text style={styles.liveStreamBannerTitle}>
                  {liveStreams[0].displayName || liveStreams[0].username} is live!
                </Text>
                <Text style={styles.liveStreamBannerSubtitle}>
                  {liveStreams[0].viewers || 0} watching • Tap to join
                </Text>
        </View>
            </View>
            <Icon name="arrow-forward" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
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
    <ScreenContainer
      floatingHeader={false}
      contentStyle={{paddingHorizontal: 0}}
    >
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
              <View key={item.id} style={{marginBottom: theme.layout?.spacing?.lg || 16}}>
                <BuzzCard
                  buzz={item}
                  onPress={() => handleBuzzPress(item)}
                  onLike={() => likeBuzz(item.id)}
                  onShare={() => shareBuzz(item.id)}
                  onFollow={handleFollow}
                  onOpenProfile={() => handleBuzzerPress(item.userId)}
                  onOpenStream={() => handleStreamPress({
                    id: item.id,
                    userId: item.userId,
                    username: item.username,
                    displayName: item.username,
                    title: item.content,
                    streamUrl: '',
                    thumbnailUrl: item.media?.url || '',
                    isLive: false,
                    viewers: 0,
                    category: '',
                    startedAt: String(item.createdAt),
                    tags: [],
                  })}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {selectedBuzz && (
        <Modal transparent animationType="slide" visible={!!selectedBuzz} onRequestClose={handleCloseDetail}>
        <BuzzDetailScreen
          buzz={selectedBuzz}
          onClose={handleCloseDetail}
          onNext={handleNextBuzz}
          onPrevious={handlePreviousBuzz}
        />
        </Modal>
      )}

      {selectedBuzzerId && (
        <Modal transparent animationType="slide" visible={!!selectedBuzzerId} onRequestClose={handleCloseBuzzerProfile}>
          <BuzzerProfileScreen buzzerId={selectedBuzzerId} visible={!!selectedBuzzerId} onClose={handleCloseBuzzerProfile} />
        </Modal>
      )}

      {selectedStream && (
        <Modal transparent animationType="slide" visible={!!selectedStream} onRequestClose={handleCloseStream}>
          <StreamViewerScreen stream={selectedStream} onClose={handleCloseStream} />
        </Modal>
      )}

      {showYourBuzz && (
        <Modal transparent animationType="slide" visible={showYourBuzz} onRequestClose={() => setShowYourBuzz(false)}>
          <YourBuzzScreen visible={showYourBuzz} onClose={() => setShowYourBuzz(false)} />
        </Modal>
      )}

    </ScreenContainer>
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
  liveViewerCard: {
    marginBottom: 16,
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
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  feedHeading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  liveStreamBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  liveStreamBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveStreamBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  liveStreamBannerIcon: {
    position: 'relative',
    marginRight: 12,
  },
  liveStreamBannerDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0069',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  liveStreamBannerText: {
    flex: 1,
  },
  liveStreamBannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  liveStreamBannerSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
});

export default HomeScreen;
