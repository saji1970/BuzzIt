import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

const Tab = createBottomTabNavigator();

// Theme colors
const colors = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#45B7D1',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#2C3E50',
  textSecondary: '#6C757D',
  border: '#E0E0E0',
  error: '#E74C3C',
  success: '#2ECC71',
  warning: '#F39C12',
};

// Simple placeholder screens
const HomeScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>🔥 Buzz it</Text>
      <Text style={styles.headerSubtitle}>Create Buzz in Social Media</Text>
    </View>
    
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>What's Buzzing?</Text>
      
      <View style={styles.buzzCard}>
        <View style={styles.buzzHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.buzzInfo}>
            <Text style={styles.username}>@username</Text>
            <Text style={styles.timeAgo}>2h ago</Text>
          </View>
        </View>
        <Text style={styles.buzzContent}>
          Just discovered this amazing new feature in Buzz it! The interest-based content discovery is incredible! 🚀
        </Text>
        <View style={styles.buzzActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>1.2K</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>89</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>23</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </ScrollView>
);

const CreateScreen = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Create Buzz</Text>
      <Text style={styles.headerSubtitle}>Share your thoughts with the world</Text>
    </View>
    
    <View style={styles.content}>
      <TouchableOpacity style={styles.createButton}>
        <Ionicons name="add-circle" size={24} color={colors.primary} />
        <Text style={styles.createButtonText}>Create New Buzz</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.createButton}>
        <Ionicons name="camera" size={24} color={colors.primary} />
        <Text style={styles.createButtonText}>Add Photo/Video</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.createButton}>
        <Ionicons name="mic" size={24} color={colors.primary} />
        <Text style={styles.createButtonText}>Record Voice Note</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ChannelScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>🎬 Buzz Channel</Text>
      <Text style={styles.headerSubtitle}>Media Content Platform</Text>
    </View>
    
    <View style={styles.content}>
      <View style={styles.categoryRow}>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryEmoji}>🎵</Text>
          <Text style={styles.categoryText}>Music</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryEmoji}>🎬</Text>
          <Text style={styles.categoryText}>Movies</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryEmoji}>🎪</Text>
          <Text style={styles.categoryText}>Events</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.channelCard}>
        <View style={styles.channelHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🎵</Text>
          </View>
          <View style={styles.channelInfo}>
            <Text style={styles.channelTitle}>New Song Release!</Text>
            <Text style={styles.channelUser}>@musician</Text>
          </View>
        </View>
        <View style={styles.mediaPreview}>
          <Text style={styles.mediaText}>🎵 Music Video</Text>
        </View>
        <View style={styles.channelActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>2.1K</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>8.7K</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>45</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </ScrollView>
);

const RadioScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>📻 Radio Channel</Text>
      <Text style={styles.headerSubtitle}>Live Podcasts & Discussions</Text>
    </View>
    
    <View style={styles.content}>
      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>3 Live Channels</Text>
      </View>
      
      <View style={styles.radioCard}>
        <View style={styles.radioHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🎭</Text>
          </View>
          <View style={styles.radioInfo}>
            <Text style={styles.radioTitle}>Comedy Show Tonight!</Text>
            <Text style={styles.radioUser}>@comedian</Text>
          </View>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        </View>
        <View style={styles.radioStats}>
          <Text style={styles.radioStatsText}>🎤 3 speakers</Text>
          <Text style={styles.radioStatsText}>👥 1.2K listening</Text>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Ionicons name="play" size={16} color="#FFFFFF" />
          <Text style={styles.joinButtonText}>Join Live</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
);

const ProfileScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Profile</Text>
      <Text style={styles.headerSubtitle}>Your Buzz Profile</Text>
    </View>
    
    <View style={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>👤</Text>
        </View>
        <Text style={styles.profileName}>@yourusername</Text>
        <Text style={styles.profileBio}>Creating buzz in social media! 🔥</Text>
        
        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Buzzes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.2K</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>856</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.interestsSection}>
        <Text style={styles.sectionTitle}>Your Interests</Text>
        <View style={styles.interestsRow}>
          <TouchableOpacity style={styles.interestTag}>
            <Text style={styles.interestText}>🎵 Music</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interestTag}>
            <Text style={styles.interestText}>🎬 Movies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interestTag}>
            <Text style={styles.interestText}>💻 Technology</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </ScrollView>
);

const SettingsScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Settings</Text>
      <Text style={styles.headerSubtitle}>Customize your experience</Text>
    </View>
    
    <View style={styles.content}>
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Themes</Text>
        <View style={styles.themeRow}>
          <TouchableOpacity style={[styles.themeButton, styles.themeActive]}>
            <Text style={styles.themeEmoji}>🔥</Text>
            <Text style={styles.themeName}>Default</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.themeButton}>
            <Text style={styles.themeEmoji}>⚡</Text>
            <Text style={styles.themeName}>Neon</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.themeButton}>
            <Text style={styles.themeEmoji}>🌅</Text>
            <Text style={styles.themeName}>Sunset</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.settingText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="shield-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.settingText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
);

const App = () => {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              switch (route.name) {
                case 'Home':
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case 'Create':
                  iconName = focused ? 'add-circle' : 'add-circle-outline';
                  break;
                case 'Channel':
                  iconName = focused ? 'play-circle' : 'play-circle-outline';
                  break;
                case 'Radio':
                  iconName = focused ? 'radio' : 'radio-outline';
                  break;
                case 'Profile':
                  iconName = focused ? 'person' : 'person-outline';
                  break;
                case 'Settings':
                  iconName = focused ? 'settings' : 'settings-outline';
                  break;
                default:
                  iconName = 'home';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Create" component={CreateScreen} />
          <Tab.Screen name="Channel" component={ChannelScreen} />
          <Tab.Screen name="Radio" component={RadioScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
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
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  buzzCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buzzHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  buzzInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  buzzContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 15,
  },
  buzzActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: colors.textSecondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  channelCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  channelInfo: {
    flex: 1,
  },
  channelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  channelUser: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mediaPreview: {
    backgroundColor: colors.border,
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  mediaText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  channelActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  liveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  radioCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  radioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioInfo: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  radioUser: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  liveBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  radioStats: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  radioStatsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 15,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 32,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  profileBio: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  interestsSection: {
    marginBottom: 20,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  settingsSection: {
    marginBottom: 30,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  themeButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 15,
    minWidth: 80,
  },
  themeActive: {
    backgroundColor: colors.primary,
  },
  themeEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  themeName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
});

export default App;