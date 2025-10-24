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
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useUser, Buzz} from '../context/UserContext';
import BuzzCard from '../components/BuzzCard';
import InterestFilter from '../components/InterestFilter';

const {width} = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user, getBuzzesByInterests, likeBuzz, shareBuzz} = useUser();
  const [filteredBuzzes, setFilteredBuzzes] = useState<Buzz[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    loadBuzzes();
  }, [user]);

  const loadBuzzes = () => {
    if (user && user.interests.length > 0) {
      const buzzes = getBuzzesByInterests(user.interests);
      setFilteredBuzzes(buzzes);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBuzzes();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleInterestFilter = (interestIds: string[]) => {
    setSelectedInterests(interestIds);
    if (interestIds.length === 0) {
      loadBuzzes();
    } else {
      const filtered = getBuzzesByInterests(
        user?.interests.filter(interest => 
          interestIds.includes(interest.id)
        ) || []
      );
      setFilteredBuzzes(filtered);
    }
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

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <Text style={styles.headerTitle}>🔥 Buzz Feed</Text>
        <Text style={styles.headerSubtitle}>
          What's buzzing in your world?
        </Text>
      </LinearGradient>

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
