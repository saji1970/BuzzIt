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
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useUser, Buzz} from '../context/UserContext';
import BuzzCard from '../components/BuzzCard';
import InterestFilter from '../components/InterestFilter';
import BuzzDetailScreen from './BuzzDetailScreen';
import CreateProfileScreen from './CreateProfileScreen';
import BuzzerProfileScreen from './BuzzerProfileScreen';
import SubscribedChannels from '../components/SubscribedChannels';

const {width} = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user, buzzes, getBuzzesByInterests, likeBuzz, shareBuzz} = useUser();
  const [filteredBuzzes, setFilteredBuzzes] = useState<Buzz[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedBuzz, setSelectedBuzz] = useState<Buzz | null>(null);
  const [selectedBuzzerId, setSelectedBuzzerId] = useState<string | null>(null);
  // Removed showCreateProfile state - only show for first-time users

  useEffect(() => {
    loadBuzzes();
  }, [user, buzzes]);

  const loadBuzzes = () => {
    if (!user || !buzzes) return;
    
    // Show all buzzes if no interests selected, otherwise filter by interests
    let filtered: Buzz[];
    
    if (selectedInterests.length > 0) {
      const interestObjects = user.interests.filter(i => 
        selectedInterests.includes(i.id)
      );
      filtered = getBuzzesByInterests(interestObjects);
    } else if (user.interests.length > 0) {
      filtered = getBuzzesByInterests(user.interests);
    } else {
      // If user has no interests, show all buzzes
      filtered = buzzes;
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

  const handleBuzzerPress = (buzzerId: string) => {
    setSelectedBuzzerId(buzzerId);
  };

  const handleCloseBuzzerProfile = () => {
    setSelectedBuzzerId(null);
  };

  const renderBuzz = ({item, index}: {item: Buzz; index: number}) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.buzzContainer}>
      <BuzzCard
        buzz={item}
        onLike={() => likeBuzz(item.id)}
        onShare={() => shareBuzz(item.id)}
        onPress={() => handleBuzzPress(item)}
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

  // Show Create Profile screen only for first-time users (no interests)
  if (user && user.interests.length === 0) {
    return <CreateProfileScreen />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>🔥 Buzz Feed</Text>
            <Text style={styles.headerSubtitle}>
              What's buzzing in your world?
            </Text>
          </View>
        </View>
      </LinearGradient>

      <SubscribedChannels onChannelPress={handleBuzzerPress} />

      <InterestFilter
        onFilterChange={handleInterestFilter}
        selectedInterests={selectedInterests}
      />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default HomeScreen;
