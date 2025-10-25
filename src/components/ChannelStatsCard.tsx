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
import {BuzzChannelStats} from '../context/BuzzChannelContext';

interface ChannelStatsCardProps {
  stats: BuzzChannelStats;
}

const ChannelStatsCard: React.FC<ChannelStatsCardProps> = ({stats}) => {
  const {theme} = useTheme();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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

  const renderTopContent = (content: any, index: number) => (
    <Animatable.View
      key={content.id}
      animation="fadeInRight"
      delay={index * 100}
      style={[styles.topContentItem, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.topContentHeader}>
        <Text style={[styles.topContentTitle, {color: theme.colors.text}]}>
          {content.title}
        </Text>
        <View style={styles.topContentStats}>
          <View style={styles.topContentStat}>
            <Icon name="visibility" size={12} color={theme.colors.textSecondary} />
            <Text style={[styles.topContentStatText, {color: theme.colors.textSecondary}]}>
              {formatNumber(content.engagement.views)}
            </Text>
          </View>
          <View style={styles.topContentStat}>
            <Icon name="favorite" size={12} color={theme.colors.textSecondary} />
            <Text style={[styles.topContentStatText, {color: theme.colors.textSecondary}]}>
              {formatNumber(content.engagement.likes)}
            </Text>
          </View>
        </View>
      </View>
    </Animatable.View>
  );

  const renderAudienceReach = (data: {[key: string]: number}, title: string, color: string) => {
    const entries = Object.entries(data).slice(0, 3);
    if (entries.length === 0) return null;

    return (
      <View style={styles.audienceSection}>
        <Text style={[styles.audienceTitle, {color: theme.colors.text}]}>
          {title}
        </Text>
        <View style={styles.audienceList}>
          {entries.map(([key, value], index) => (
            <Animatable.View
              key={key}
              animation="fadeInLeft"
              delay={index * 100}
              style={styles.audienceItem}>
              <View style={[styles.audienceDot, {backgroundColor: color}]} />
              <Text style={[styles.audienceKey, {color: theme.colors.text}]}>
                {key}
              </Text>
              <Text style={[styles.audienceValue, {color: theme.colors.textSecondary}]}>
                {value}
              </Text>
            </Animatable.View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Animatable.View
      animation="fadeInDown"
      style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <Text style={styles.headerTitle}>📊 Channel Analytics</Text>
        <Text style={styles.headerSubtitle}>Performance Overview</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Stats */}
        <View style={styles.statsGrid}>
          {renderStatItem('play-circle-outline', 'Total Content', stats.totalContent, '#FF6B6B', 0)}
          {renderStatItem('visibility', 'Total Views', stats.totalViews, '#4ECDC4', 1)}
          {renderStatItem('favorite', 'Total Likes', stats.totalLikes, '#45B7D1', 2)}
          {renderStatItem('thumbs-up-down', 'Total Votes', stats.totalVotes, '#96CEB4', 3)}
        </View>

        {/* Engagement Score */}
        <Animatable.View
          animation="fadeInUp"
          delay={400}
          style={styles.engagementCard}>
          <View style={styles.engagementHeader}>
            <Icon name="trending-up" size={24} color={theme.colors.primary} />
            <Text style={[styles.engagementTitle, {color: theme.colors.text}]}>
              Engagement Score
            </Text>
          </View>
          <Text style={[styles.engagementValue, {color: theme.colors.primary}]}>
            {Math.round(stats.averageEngagement)}
          </Text>
          <Text style={[styles.engagementLabel, {color: theme.colors.textSecondary}]}>
            Average engagement per content
          </Text>
        </Animatable.View>

        {/* Top Content */}
        {stats.topContent.length > 0 && (
          <View style={styles.topContentSection}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              🏆 Top Performing Content
            </Text>
            {stats.topContent.map((content, index) => renderTopContent(content, index))}
          </View>
        )}

        {/* Audience Reach */}
        <View style={styles.audienceSection}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            🌍 Audience Reach
          </Text>
          {renderAudienceReach(stats.audienceReach.countries, 'Countries', '#FF6B6B')}
          {renderAudienceReach(stats.audienceReach.ageGroups, 'Age Groups', '#4ECDC4')}
          {renderAudienceReach(stats.audienceReach.interests, 'Interests', '#45B7D1')}
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
  engagementCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    marginBottom: 20,
  },
  engagementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  engagementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  engagementValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  engagementLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  topContentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  topContentItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  topContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topContentTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  topContentStats: {
    flexDirection: 'row',
  },
  topContentStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  topContentStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  audienceSection: {
    marginBottom: 20,
  },
  audienceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  audienceList: {
    marginBottom: 15,
  },
  audienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  audienceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  audienceKey: {
    fontSize: 14,
    flex: 1,
  },
  audienceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChannelStatsCard;
