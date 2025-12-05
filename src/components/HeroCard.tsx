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
    borderRadius: 24,
    padding: 20,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0,
  },
  buzzLiveButton: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 44,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
