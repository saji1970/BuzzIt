import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {RadioChannelStats} from '../context/RadioChannelContext';

interface RadioStatsCardProps {
  stats: RadioChannelStats;
}

const RadioStatsCard: React.FC<RadioStatsCardProps> = ({stats}) => {
  const {theme} = useTheme();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderStatItem = (
    icon: string,
    label: string,
    value: number,
    color: string,
    index: number
  ) => (
    <Animatable.View
      key={label}
      animation="fadeInUp"
      delay={index * 100}
      style={styles.statItem}>
      <View style={[styles.statIcon, {backgroundColor: color + '20'}]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, {color: theme.colors.text}]}>
          {formatNumber(value)}
        </Text>
        <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
          {label}
        </Text>
      </View>
    </Animatable.View>
  );

  const renderTopChannel = (channel: any, index: number) => (
    <Animatable.View
      key={channel.id}
      animation="fadeInRight"
      delay={index * 100}
      style={[styles.topChannelItem, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.topChannelHeader}>
        <Text style={[styles.topChannelTitle, {color: theme.colors.text}]}>
          {channel.title}
        </Text>
        <View style={styles.topChannelStats}>
          <View style={styles.topChannelStat}>
            <Icon name="headset" size={12} color={theme.colors.textSecondary} />
            <Text style={[styles.topChannelStatText, {color: theme.colors.textSecondary}]}>
              {formatNumber(channel.engagement.totalListeners)}
            </Text>
          </View>
          <View style={styles.topChannelStat}>
            <Icon name="favorite" size={12} color={theme.colors.textSecondary} />
            <Text style={[styles.topChannelStatText, {color: theme.colors.textSecondary}]}>
              {formatNumber(channel.engagement.likes)}
            </Text>
          </View>
        </View>
      </View>
    </Animatable.View>
  );

  const renderPopularCategory = (category: string, count: number, index: number) => (
    <Animatable.View
      key={category}
      animation="fadeInLeft"
      delay={index * 100}
      style={styles.categoryItem}>
      <View style={[styles.categoryDot, {backgroundColor: theme.colors.primary}]} />
      <Text style={[styles.categoryKey, {color: theme.colors.text}]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
      <Text style={[styles.categoryValue, {color: theme.colors.textSecondary}]}>
        {count}
      </Text>
    </Animatable.View>
  );

  return (
    <Animatable.View
      animation="fadeInDown"
      style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <Text style={styles.headerTitle}>📊 Radio Analytics</Text>
        <Text style={styles.headerSubtitle}>Performance Overview</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Stats */}
        <View style={styles.statsGrid}>
          {renderStatItem('radio', 'Total Channels', stats.totalChannels, '#FF6B6B', 0)}
          {renderStatItem('headset', 'Total Listeners', stats.totalListeners, '#4ECDC4', 1)}
          {renderStatItem('timer', 'Total Duration', formatDuration(stats.totalDuration), '#45B7D1', 2)}
          {renderStatItem('trending-up', 'Avg Listen Time', formatDuration(stats.averageListenTime), '#96CEB4', 3)}
        </View>

        {/* Live Channels */}
        <Animatable.View
          animation="fadeInUp"
          delay={400}
          style={styles.liveChannelsCard}>
          <View style={styles.liveChannelsHeader}>
            <Icon name="fiber-manual-record" size={24} color="#2ECC71" />
            <Text style={[styles.liveChannelsTitle, {color: theme.colors.text}]}>
              Live Channels
            </Text>
          </View>
          <Text style={[styles.liveChannelsValue, {color: '#2ECC71'}]}>
            {stats.liveChannels}
          </Text>
          <Text style={[styles.liveChannelsLabel, {color: theme.colors.textSecondary}]}>
            Currently broadcasting
          </Text>
        </Animatable.View>

        {/* Scheduled Channels */}
        <Animatable.View
          animation="fadeInUp"
          delay={500}
          style={styles.scheduledChannelsCard}>
          <View style={styles.scheduledChannelsHeader}>
            <Icon name="schedule" size={24} color="#F39C12" />
            <Text style={[styles.scheduledChannelsTitle, {color: theme.colors.text}]}>
              Scheduled Channels
            </Text>
          </View>
          <Text style={[styles.scheduledChannelsValue, {color: '#F39C12'}]}>
            {stats.scheduledChannels}
          </Text>
          <Text style={[styles.scheduledChannelsLabel, {color: theme.colors.textSecondary}]}>
            Upcoming broadcasts
          </Text>
        </Animatable.View>

        {/* Top Channels */}
        {stats.topChannels.length > 0 && (
          <View style={styles.topChannelsSection}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              🏆 Top Performing Channels
            </Text>
            {stats.topChannels.map((channel, index) => renderTopChannel(channel, index))}
          </View>
        )}

        {/* Popular Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            📈 Popular Categories
          </Text>
          <View style={styles.categoriesList}>
            {Object.entries(stats.popularCategories)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([category, count], index) => 
                renderPopularCategory(category, count, index)
              )}
          </View>
        </View>
      </ScrollView>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  liveChannelsCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    marginBottom: 15,
  },
  liveChannelsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveChannelsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  liveChannelsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  liveChannelsLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  scheduledChannelsCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    marginBottom: 20,
  },
  scheduledChannelsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduledChannelsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scheduledChannelsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scheduledChannelsLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  topChannelsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  topChannelItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  topChannelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topChannelTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  topChannelStats: {
    flexDirection: 'row',
  },
  topChannelStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  topChannelStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesList: {
    marginBottom: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  categoryKey: {
    fontSize: 14,
    flex: 1,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RadioStatsCard;
