import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useRadioChannel, RadioChannel} from '../context/RadioChannelContext';
import RadioChannelCard from '../components/RadioChannelCard';
import RadioCategoryFilter from '../components/RadioCategoryFilter';
import RadioStatsCard from '../components/RadioStatsCard';

const {width} = Dimensions.get('window');

const RadioChannelScreen: React.FC = () => {
  const {theme} = useTheme();
  const {
    radioChannels,
    likeChannel,
    shareChannel,
    getLiveChannels,
    getScheduledChannels,
    getChannelsByCategory,
    getRadioChannelStats,
    categories
  } = useRadioChannel();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'live' | 'scheduled'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredChannels, setFilteredChannels] = useState<RadioChannel[]>([]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    filterChannels();
  }, [selectedCategory, selectedFilter, radioChannels]);

  const filterChannels = () => {
    let filtered = [...radioChannels];

    if (selectedFilter === 'live') {
      filtered = getLiveChannels();
    } else if (selectedFilter === 'scheduled') {
      filtered = getScheduledChannels();
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(channel => channel.category === selectedCategory);
    }

    // Sort by engagement and live status
    filtered.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return b.engagement.totalListeners - a.engagement.totalListeners;
    });

    setFilteredChannels(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    filterChannels();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleChannelPress = (channel: RadioChannel) => {
    // Navigate to channel details or join live channel
    console.log('Channel pressed:', channel.title);
  };

  const handleLike = (channelId: string) => {
    likeChannel(channelId);
  };

  const handleShare = (channelId: string) => {
    shareChannel(channelId);
  };

  const renderChannel = ({item, index}: {item: RadioChannel; index: number}) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.channelContainer}>
      <RadioChannelCard
        channel={item}
        onPress={() => handleChannelPress(item)}
        onLike={() => handleLike(item.id)}
        onShare={() => handleShare(item.id)}
      />
    </Animatable.View>
  );

  const renderEmptyState = () => (
    <Animatable.View
      animation="fadeIn"
      style={[styles.emptyState, {backgroundColor: theme.colors.background}]}>
      <Icon name="radio" size={80} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
        No Radio Channels Yet!
      </Text>
      <Text style={[styles.emptySubtitle, {color: theme.colors.textSecondary}]}>
        Start listening to live podcasts and discussions
      </Text>
    </Animatable.View>
  );

  const stats = getRadioChannelStats();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📻 Radio Channel</Text>
          <Text style={styles.headerSubtitle}>
            Live Podcasts & Discussions
          </Text>
        </View>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => setShowStats(!showStats)}>
          <Icon name="analytics" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {showStats && (
        <Animatable.View animation="fadeInDown" style={styles.statsContainer}>
          <RadioStatsCard stats={stats} />
        </Animatable.View>
      )}

      <RadioCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        selectedFilter={selectedFilter}
        onFilterSelect={setSelectedFilter}
      />

      <FlatList
        data={filteredChannels}
        renderItem={renderChannel}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
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
  statsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    padding: 15,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  channelContainer: {
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

export default RadioChannelScreen;
