import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../context/ThemeContext';

export interface TopBuzzer {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
}

interface HeroCardProps {
  title?: string;
  subtitle?: string;
  topBuzzers?: TopBuzzer[];
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchIconPress?: () => void;
  onBuzzLivePress: () => void;
  onBuzzerPress: (buzzerId: string) => void;
  onRefresh?: () => void;
  username?: string;
  displayName?: string;
  userAvatar?: string | null;
}

const HeroCard: React.FC<HeroCardProps> = ({
  title = 'Home',
  subtitle = 'buzz feed',
  topBuzzers = [],
  searchQuery,
  onSearchChange,
  onSearchIconPress,
  onBuzzLivePress,
  onBuzzerPress,
  onRefresh,
  username,
  displayName,
  userAvatar,
}) => {
  const {theme} = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients?.header || ['#2F7BFF', '#5D3BFF']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.card}>
        {/* Row 1: Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.rightSection}>
            {username && (
              <View style={styles.userInfo}>
                {userAvatar ? (
                  <Image source={{uri: userAvatar}} style={styles.userAvatar} />
                ) : (
                  <View style={styles.userAvatarPlaceholder}>
                    <Text style={styles.userAvatarText}>
                      {(displayName || username).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.usernameText} numberOfLines={1}>
                  @{username}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRefresh || onSearchIconPress}
              activeOpacity={0.8}>
              <Icon
                name={onRefresh ? 'refresh' : 'auto-awesome'}
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: Top Buzzers */}
        {topBuzzers.length > 0 && (
          <View style={styles.topBuzzersSection}>
            <Text style={styles.topBuzzersLabel}>Top Buzzers</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topBuzzersList}>
              {topBuzzers.map((buzzer, index) => (
                <TouchableOpacity
                  key={buzzer.id}
                  style={[
                    styles.buzzerAvatar,
                    index === 0 && styles.firstBuzzer,
                  ]}
                  onPress={() => onBuzzerPress(buzzer.id)}
                  activeOpacity={0.8}>
                  {buzzer.avatar ? (
                    <Image
                      source={{uri: buzzer.avatar}}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {buzzer.displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.buzzerName} numberOfLines={1}>
                    {buzzer.username}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Row 3: Actions */}
        <View style={styles.actionsRow}>
          {/* Search Field */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={18} color="rgba(255,255,255,0.8)" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={onSearchChange}
            />
          </View>

          {/* BuzzLive Button */}
          <TouchableOpacity
            style={styles.buzzLiveButton}
            onPress={onBuzzLivePress}
            activeOpacity={0.9}>
            <LinearGradient
              colors={theme.gradients?.accent || ['#54A9FF', '#2F7BFF']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.buzzLiveGradient}>
              <Icon name="videocam" size={18} color="#FFFFFF" />
              <Text style={styles.buzzLiveText}>BuzzLive</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    shadowColor: 'rgba(47, 128, 255, 0.25)',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  userAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  usernameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    maxWidth: 100,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  topBuzzersSection: {
    marginBottom: 16,
  },
  topBuzzersLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    fontWeight: '500',
  },
  topBuzzersList: {
    flexDirection: 'row',
    gap: 12,
  },
  buzzerAvatar: {
    alignItems: 'center',
    gap: 6,
  },
  firstBuzzer: {
    marginLeft: 0,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buzzerName: {
    fontSize: 12,
    color: '#FFFFFF',
    maxWidth: 56,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0,
  },
  buzzLiveButton: {
    borderRadius: 22,
    overflow: 'hidden',
    height: 44,
    shadowColor: 'rgba(47, 128, 255, 0.4)',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buzzLiveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
    height: 44,
  },
  buzzLiveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HeroCard;
