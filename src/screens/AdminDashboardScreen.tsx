import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import ApiService from '../services/APIService';
import AdminStreamPreview from '../components/AdminStreamPreview';

const {width} = Dimensions.get('window');

interface DashboardData {
  overview: {
    totalUsers: number;
    verifiedUsers: number;
    totalBuzzes: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    avgLikesPerBuzz: string;
    avgSharesPerBuzz: string;
  };
  growth: {
    users24h: number;
    users7d: number;
    users30d: number;
    buzzes24h: number;
    buzzes7d: number;
    buzzes30d: number;
  };
  topUsers: Array<{
    id: string;
    username: string;
    displayName: string;
    buzzCount: number;
    followers: number;
    following: number;
  }>;
  topBuzzes: Array<{
    id: string;
    username: string;
    content: string;
    likes: number;
    shares: number;
    comments: number;
    totalEngagement: number;
    createdAt: string;
  }>;
  topInterests: Array<{
    name: string;
    count: number;
  }>;
  dailyActivity: Array<{
    date: string;
    buzzes: number;
    users: number;
    likes: number;
    shares: number;
  }>;
  verificationCodes: number;
  socialAccounts: number;
}

const AdminDashboardScreen: React.FC = () => {
  const {theme} = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'buzzes' | 'streams'>('overview');
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAdminDashboard();

      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        console.error('Dashboard API error:', response.error);
        // Don't show alert for dashboard errors - just log them
        // The user can still use other tabs like Live streams
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      // Don't block the UI - just log the error
      // The Live tab will still work
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    if (activeTab === 'streams') {
      await loadLiveStreams();
    }
    setRefreshing(false);
  };

  const loadLiveStreams = async () => {
    try {
      setLoadingStreams(true);
      const response = await ApiService.getLiveStreams();

      if (response.success && response.data) {
        // Filter only active/live streams
        const activeStreams = response.data.filter((stream: any) => stream.isLive);
        setLiveStreams(activeStreams);
      } else {
        setLiveStreams([]);
      }
    } catch (error) {
      console.error('Error loading live streams:', error);
      setLiveStreams([]);
    } finally {
      setLoadingStreams(false);
    }
  };

  // Load streams when switching to streams tab
  useEffect(() => {
    if (activeTab === 'streams') {
      loadLiveStreams();
    }
  }, [activeTab]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    subtitle?: string;
  }> = ({title, value, icon, color, subtitle}) => (
    <Animatable.View animation="fadeInUp" style={[styles.statCard, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={[styles.statTitle, {color: theme.colors.textSecondary}]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, {color: theme.colors.text}]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, {color: theme.colors.textSecondary}]}>{subtitle}</Text>
      )}
    </Animatable.View>
  );

  const renderOverview = () => {
    if (!dashboardData) return null;

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={dashboardData.overview.totalUsers}
              icon="people"
              color={theme.colors.primary}
              subtitle={`${dashboardData.overview.verifiedUsers} verified`}
            />
            <StatCard
              title="Total Buzzes"
              value={dashboardData.overview.totalBuzzes}
              icon="chat-bubble"
              color={theme.colors.accent}
            />
            <StatCard
              title="Total Likes"
              value={dashboardData.overview.totalLikes}
              icon="favorite"
              color="#e74c3c"
            />
            <StatCard
              title="Total Shares"
              value={dashboardData.overview.totalShares}
              icon="share"
              color="#2ecc71"
            />
          </View>
        </View>

        {/* Growth Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Growth (Last 24h)</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="New Users"
              value={dashboardData.growth.users24h}
              icon="person-add"
              color="#3498db"
            />
            <StatCard
              title="New Buzzes"
              value={dashboardData.growth.buzzes24h}
              icon="add-circle"
              color="#9b59b6"
            />
            <StatCard
              title="Avg Likes/Buzz"
              value={dashboardData.overview.avgLikesPerBuzz}
              icon="trending-up"
              color="#f39c12"
            />
            <StatCard
              title="Avg Shares/Buzz"
              value={dashboardData.overview.avgSharesPerBuzz}
              icon="trending-up"
              color="#1abc9c"
            />
          </View>
        </View>

        {/* Top Users */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Top Users</Text>
          {dashboardData.topUsers.map((user, index) => (
            <Animatable.View
              key={user.id}
              animation="fadeInUp"
              delay={index * 100}
              style={[styles.userCard, {backgroundColor: theme.colors.surface}]}>
              <View style={styles.userInfo}>
                <View style={[styles.userAvatar, {backgroundColor: theme.colors.primary}]}>
                  <Text style={styles.userAvatarText}>{user.username.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={[styles.userName, {color: theme.colors.text}]}>{user.displayName}</Text>
                  <Text style={[styles.userUsername, {color: theme.colors.textSecondary}]}>@{user.username}</Text>
                </View>
              </View>
              <View style={styles.userStats}>
                <Text style={[styles.userStatValue, {color: theme.colors.text}]}>{user.buzzCount}</Text>
                <Text style={[styles.userStatLabel, {color: theme.colors.textSecondary}]}>Buzzes</Text>
              </View>
            </Animatable.View>
          ))}
        </View>

        {/* Top Buzzes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Top Buzzes</Text>
          {dashboardData.topBuzzes.map((buzz, index) => (
            <Animatable.View
              key={buzz.id}
              animation="fadeInUp"
              delay={index * 100}
              style={[styles.buzzCard, {backgroundColor: theme.colors.surface}]}>
              <Text style={[styles.buzzContent, {color: theme.colors.text}]}>{buzz.content}</Text>
              <View style={styles.buzzMeta}>
                <Text style={[styles.buzzAuthor, {color: theme.colors.textSecondary}]}>@{buzz.username}</Text>
                <View style={styles.buzzEngagement}>
                  <View style={styles.engagementItem}>
                    <Icon name="favorite" size={16} color="#e74c3c" />
                    <Text style={[styles.engagementText, {color: theme.colors.textSecondary}]}>{buzz.likes}</Text>
                  </View>
                  <View style={styles.engagementItem}>
                    <Icon name="share" size={16} color="#2ecc71" />
                    <Text style={[styles.engagementText, {color: theme.colors.textSecondary}]}>{buzz.shares}</Text>
                  </View>
                  <View style={styles.engagementItem}>
                    <Icon name="comment" size={16} color="#3498db" />
                    <Text style={[styles.engagementText, {color: theme.colors.textSecondary}]}>{buzz.comments}</Text>
                  </View>
                </View>
              </View>
            </Animatable.View>
          ))}
        </View>

        {/* Top Interests */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Popular Interests</Text>
          <View style={styles.interestsContainer}>
            {dashboardData.topInterests.map((interest, index) => (
              <Animatable.View
                key={interest.name}
                animation="fadeInUp"
                delay={index * 100}
                style={[styles.interestChip, {backgroundColor: theme.colors.primary}]}>
                <Text style={styles.interestText}>{interest.name}</Text>
                <Text style={styles.interestCount}>{interest.count}</Text>
              </Animatable.View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your Buzz it app</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabs, {backgroundColor: theme.colors.surface}]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}>
          <Icon name="dashboard" size={20} color={activeTab === 'overview' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, {color: activeTab === 'overview' ? theme.colors.primary : theme.colors.textSecondary}]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'streams' && styles.activeTab]}
          onPress={() => setActiveTab('streams')}>
          <Icon name="videocam" size={20} color={activeTab === 'streams' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, {color: activeTab === 'streams' ? theme.colors.primary : theme.colors.textSecondary}]}>
            Live
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}>
          <Icon name="people" size={20} color={activeTab === 'users' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, {color: activeTab === 'users' ? theme.colors.primary : theme.colors.textSecondary}]}>
            Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buzzes' && styles.activeTab]}
          onPress={() => setActiveTab('buzzes')}>
          <Icon name="chat-bubble" size={20} color={activeTab === 'buzzes' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, {color: activeTab === 'buzzes' ? theme.colors.primary : theme.colors.textSecondary}]}>
            Buzzes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {loading && !dashboardData ? (
              <View style={styles.centered}>
                <Text style={[styles.loadingText, {color: theme.colors.text}]}>Loading dashboard...</Text>
              </View>
            ) : !dashboardData ? (
              <View style={styles.centered}>
                <Icon name="error-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.comingSoon, {color: theme.colors.text, marginTop: 16}]}>
                  Dashboard Data Unavailable
                </Text>
                <Text style={[styles.comingSoonSub, {color: theme.colors.textSecondary, textAlign: 'center', paddingHorizontal: 40}]}>
                  Unable to load overview data. Please check your admin permissions or try refreshing.
                </Text>
              </View>
            ) : (
              renderOverview()
            )}
          </ScrollView>
        )}
        {activeTab === 'streams' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.streamsContainer}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text, paddingHorizontal: 20, paddingTop: 20}]}>
              Active Live Streams
            </Text>
            {loadingStreams ? (
              <View style={styles.centered}>
                <Text style={[styles.loadingText, {color: theme.colors.text}]}>
                  Loading streams...
                </Text>
              </View>
            ) : liveStreams.length === 0 ? (
              <View style={styles.centered}>
                <Icon name="videocam-off" size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.comingSoon, {color: theme.colors.text, marginTop: 16}]}>
                  No Active Streams
                </Text>
                <Text style={[styles.comingSoonSub, {color: theme.colors.textSecondary}]}>
                  Streams will appear here when users go live
                </Text>
              </View>
            ) : (
              <View style={styles.streamsList}>
                {liveStreams.map((stream, index) => (
                  <Animatable.View
                    key={stream.id}
                    animation="fadeInUp"
                    delay={index * 100}>
                    <AdminStreamPreview
                      playbackUrl={stream.ivsPlaybackUrl || stream.restreamPlaybackUrl || stream.streamUrl || ''}
                      title={stream.title || 'Untitled Stream'}
                      username={stream.username || 'Unknown'}
                      viewers={stream.viewers || 0}
                    />
                  </Animatable.View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
        {activeTab === 'users' && (
          <View style={styles.centered}>
            <Text style={[styles.comingSoon, {color: theme.colors.text}]}>Users Management</Text>
            <Text style={[styles.comingSoonSub, {color: theme.colors.textSecondary}]}>Coming Soon</Text>
          </View>
        )}
        {activeTab === 'buzzes' && (
          <View style={styles.centered}>
            <Text style={[styles.comingSoon, {color: theme.colors.text}]}>Buzzes Management</Text>
            <Text style={[styles.comingSoonSub, {color: theme.colors.textSecondary}]}>Coming Soon</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userUsername: {
    fontSize: 14,
  },
  userStats: {
    alignItems: 'center',
  },
  userStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userStatLabel: {
    fontSize: 12,
  },
  buzzCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  buzzContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  buzzMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buzzAuthor: {
    fontSize: 12,
  },
  buzzEngagement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  engagementText: {
    fontSize: 12,
    marginLeft: 4,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  interestCount: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.8,
  },
  loadingText: {
    fontSize: 16,
  },
  comingSoon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  comingSoonSub: {
    fontSize: 14,
  },
  streamsContainer: {
    paddingBottom: 20,
  },
  streamsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
});

export default AdminDashboardScreen;
