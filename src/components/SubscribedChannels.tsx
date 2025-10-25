import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import {useTheme} from '../context/ThemeContext';

const {width} = Dimensions.get('window');

interface Channel {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  isLive?: boolean;
  lastPost?: string;
}

interface SubscribedChannelsProps {
  onChannelPress?: (channelId: string) => void;
}

const SubscribedChannels: React.FC<SubscribedChannelsProps> = ({onChannelPress}) => {
  const {theme} = useTheme();

  // Mock data for subscribed channels
  const subscribedChannels: Channel[] = [
    {
      id: '1',
      username: 'buzzuser',
      name: 'Your Story',
      avatar: null,
    },
    {
      id: '2',
      username: 'techguru',
      name: 'Tech Guru',
      avatar: null,
      isLive: true,
    },
    {
      id: '3',
      username: 'foodie',
      name: 'Food Lover',
      avatar: null,
    },
    {
      id: '4',
      username: 'adventurer',
      name: 'Adventure',
      avatar: null,
      isLive: true,
    },
    {
      id: '5',
      username: 'fitnesspro',
      name: 'Fitness Pro',
      avatar: null,
    },
  ];

  const handleChannelPress = (channelId: string) => {
    if (onChannelPress) {
      onChannelPress(channelId);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}>
        {subscribedChannels.map((channel, index) => (
          <TouchableOpacity
            key={channel.id}
            style={styles.channelItem}
            onPress={() => handleChannelPress(channel.id)}>
            <View
              style={[
                styles.avatarContainer,
                channel.isLive && styles.liveBorder,
              ]}>
              <View
                style={[
                  styles.avatar,
                  {backgroundColor: theme.colors.primary},
                ]}>
                {channel.avatar ? (
                  <Image source={{uri: channel.avatar}} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {channel.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              {channel.id === '1' && (
                <View style={styles.addIcon}>
                  <Icon name="add" size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text
              style={[
                styles.channelName,
                {color: theme.colors.text},
              ]}
              numberOfLines={1}>
              {channel.name}
            </Text>
            {channel.isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scrollView: {
    paddingHorizontal: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  channelItem: {
    marginHorizontal: 6,
    alignItems: 'center',
    width: 70,
  },
  avatarContainer: {
    position: 'relative',
  },
  liveBorder: {
    borderWidth: 2,
    borderColor: '#FF0069',
    borderRadius: 35,
    padding: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 24,
  },
  addIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1DA1F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  channelName: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 70,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FF0069',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 3,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default SubscribedChannels;
