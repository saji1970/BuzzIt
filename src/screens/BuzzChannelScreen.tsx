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
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useBuzzChannel, BuzzChannelContent, BuzzChannelCategory} from '../context/BuzzChannelContext';
import ChannelContentCard from '../components/ChannelContentCard';
import ChannelCategoryFilter from '../components/ChannelCategoryFilter';
import ChannelStatsCard from '../components/ChannelStatsCard';
import LiveStreamingControls from '../components/LiveStreamingControls';

const {width} = Dimensions.get('window');

const BuzzChannelScreen: React.FC = () => {
  const {theme} = useTheme();
  const {
    channelContent,
    likeContent,
    voteContent,
    viewContent,
    shareContent,
    getContentByType,
    getChannelStats,
    categories
  } = useBuzzChannel();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredContent, setFilteredContent] = useState<BuzzChannelContent[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentViewers, setCurrentViewers] = useState(0);

  useEffect(() => {
    filterContent();
  }, [selectedCategory, selectedType, channelContent]);

  const filterContent = () => {
    let filtered = [...channelContent];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(content => content.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(content => content.type === selectedType);
    }

    // Sort by engagement (views + likes + votes)
    filtered.sort((a, b) => {
      const aEngagement = a.engagement.views + a.engagement.likes + a.engagement.votes;
      const bEngagement = b.engagement.views + b.engagement.likes + b.engagement.votes;
      return bEngagement - aEngagement;
    });

    setFilteredContent(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    filterContent();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleContentPress = (content: BuzzChannelContent) => {
    viewContent(content.id);
  };

  const handleLike = (contentId: string) => {
    likeContent(contentId);
  };

  const handleVote = (contentId: string, vote: 'up' | 'down') => {
    voteContent(contentId, vote);
  };

  const handleShare = (contentId: string) => {
    shareContent(contentId);
  };

  const handleStartStream = () => {
    setIsLive(true);
    setCurrentViewers(Math.floor(Math.random() * 100) + 50);
  };

  const handleStopStream = () => {
    setIsLive(false);
    setCurrentViewers(0);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const renderContent = ({item, index}: {item: BuzzChannelContent; index: number}) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.contentContainer}>
      <ChannelContentCard
        content={item}
        onPress={() => handleContentPress(item)}
        onLike={() => handleLike(item.id)}
        onVote={(vote) => handleVote(item.id, vote)}
        onShare={() => handleShare(item.id)}
      />
    </Animatable.View>
  );

  const renderEmptyState = () => (
    <Animatable.View
      animation="fadeIn"
      style={[styles.emptyState, {backgroundColor: theme.colors.background}]}>
      <Icon name="play-circle-outline" size={80} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
        No Content Yet!
      </Text>
      <Text style={[styles.emptySubtitle, {color: theme.colors.textSecondary}]}>
        Start creating amazing content for your audience
      </Text>
    </Animatable.View>
  );

  const stats = getChannelStats();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🎬 Buzz Channel</Text>
          <Text style={styles.headerSubtitle}>
            Create, Share, and Engage with Media Content
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
          <ChannelStatsCard stats={stats} />
        </Animatable.View>
      )}

      <ChannelCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
      />

      <LiveStreamingControls
        isLive={isLive}
        onStartStream={handleStartStream}
        onStopStream={handleStopStream}
        onToggleMute={handleToggleMute}
        isMuted={isMuted}
        viewers={currentViewers}
      />

      <FlatList
        data={filteredContent}
        renderItem={renderContent}
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
  contentContainer: {
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

export default BuzzChannelScreen;
