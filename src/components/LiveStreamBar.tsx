import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../context/ThemeContext';

export interface LiveStreamBarStream {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  title: string;
  viewers: number;
  avatar?: string | null;
}

interface LiveStreamBarProps {
  stream: LiveStreamBarStream;
  onPress: (stream: LiveStreamBarStream) => void;
}

const LiveStreamBar: React.FC<LiveStreamBarProps> = ({stream, onPress}) => {
  const {theme} = useTheme();

  const formatViewers = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: theme.colors.surface}]}
      onPress={() => onPress(stream)}
      activeOpacity={0.8}>
      <LinearGradient
        colors={['#FF0069', '#FF1744']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          {stream.avatar ? (
            <Image source={{uri: stream.avatar}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, {backgroundColor: theme.colors.primary}]}>
              <Text style={styles.avatarText}>
                {stream.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={[styles.username, {color: theme.colors.text}]} numberOfLines={1}>
              {stream.displayName}
            </Text>
            <Text style={[styles.title, {color: theme.colors.textSecondary}]} numberOfLines={1}>
              {stream.title}
            </Text>
          </View>
        </View>

        <View style={styles.viewerInfo}>
          <Icon name="visibility" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.viewerCount, {color: theme.colors.textSecondary}]}>
            {formatViewers(stream.viewers)}
          </Text>
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
  },
  viewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewerCount: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default LiveStreamBar;



