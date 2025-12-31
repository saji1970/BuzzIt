import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../context/ThemeContext';
import SocialMediaService, {SocialPlatform, SocialAccount} from '../services/SocialMediaService';
import {useNavigation} from '@react-navigation/native';

interface SocialPlatformSelectorProps {
  selectedPlatforms: SocialPlatform[];
  onPlatformsChange: (platforms: SocialPlatform[]) => void;
  mediaType?: 'image' | 'video';
  contentLength?: number;
}

const SocialPlatformSelector: React.FC<SocialPlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformsChange,
  mediaType,
  contentLength = 0,
}) => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    setLoading(true);
    try {
      const accounts = await SocialMediaService.getConnectedAccounts();
      setConnectedAccounts(accounts);
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (platform: SocialPlatform) => {
    setRefreshing(platform);
    try {
      const result = await SocialMediaService.refreshToken(platform);
      if (result.success) {
        await loadConnectedAccounts();
        Alert.alert('Success', `${platform.charAt(0).toUpperCase() + platform.slice(1)} token refreshed successfully.`);
      } else {
        Alert.alert('Error', result.error || `Failed to refresh ${platform} token. Please reconnect.`);
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to refresh ${platform} token: ${error.message}`);
    } finally {
      setRefreshing(null);
    }
  };

  const togglePlatform = (platform: SocialPlatform) => {
    const account = connectedAccounts.find(acc => acc.platform === platform);
    
    if (!account || !account.isConnected) {
      Alert.alert(
        'Not Connected',
        `Please connect ${platform.charAt(0).toUpperCase() + platform.slice(1)} in Settings first.`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Go to Settings',
            onPress: () => {
              navigation.navigate('Settings' as never);
            },
          },
        ]
      );
      return;
    }

    if (account.status === 'expired' || account.status === 'error') {
      Alert.alert(
        'Token Expired',
        `Your ${platform} connection has expired. Would you like to refresh it?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Refresh',
            onPress: () => refreshToken(platform),
          },
        ]
      );
      return;
    }

    // Validate platform requirements
    const requirements = SocialMediaService.getPlatformRequirements(platform);
    const validation = SocialMediaService.validateMediaForPlatform(platform, undefined, mediaType);
    
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.error);
      return;
    }

    if (requirements.maxContentLength && contentLength > requirements.maxContentLength) {
      Alert.alert(
        'Content Too Long',
        `${platform.charAt(0).toUpperCase() + platform.slice(1)} has a maximum of ${requirements.maxContentLength} characters. Your content is ${contentLength} characters.`
      );
      return;
    }

    if (selectedPlatforms.includes(platform)) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      onPlatformsChange([...selectedPlatforms, platform]);
    }
  };

  const getPlatformInfo = (platform: SocialPlatform) => {
    const account = connectedAccounts.find(acc => acc.platform === platform);
    const isConnected = account?.isConnected && account?.status === 'connected';
    const isExpired = account?.status === 'expired';
    const hasError = account?.status === 'error';
    const isSelected = selectedPlatforms.includes(platform);

    const platformData = {
      facebook: {
        name: 'Facebook',
        icon: 'facebook',
        colors: ['#1877F2', '#0A66C2'],
        gradient: ['#1877F2', '#0A66C2'],
      },
      instagram: {
        name: 'Instagram',
        icon: 'photo-camera',
        colors: ['#E4405F', '#C13584', '#8E44AD'],
        gradient: ['#E4405F', '#C13584'],
      },
      snapchat: {
        name: 'Snapchat',
        icon: 'camera',
        colors: ['#FFFC00', '#FFF700'],
        gradient: ['#FFFC00', '#FFF700'],
      },
      twitter: {
        name: 'Twitter',
        icon: 'chat-bubble',
        colors: ['#1DA1F2', '#0C8BD9'],
        gradient: ['#1DA1F2', '#0C8BD9'],
      },
    };

    return {
      ...platformData[platform],
      account,
      isConnected,
      isExpired,
      hasError,
      isSelected,
    };
  };

  const getStatusBadge = (platform: SocialPlatform) => {
    const info = getPlatformInfo(platform);
    
    if (!info.account) {
      return {text: 'Not Connected', color: theme.colors.textSecondary, bg: theme.colors.border};
    }
    
    if (info.isExpired) {
      return {text: 'Expired - Tap to Refresh', color: theme.colors.error, bg: theme.colors.error + '20'};
    }
    
    if (info.hasError) {
      return {text: 'Error - Tap to Reconnect', color: theme.colors.error, bg: theme.colors.error + '20'};
    }
    
    if (info.isConnected) {
      return {text: `@${info.account.username}`, color: theme.colors.primary, bg: theme.colors.primary + '20'};
    }
    
    return {text: 'Not Connected', color: theme.colors.textSecondary, bg: theme.colors.border};
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={[styles.loadingText, {color: theme.colors.textSecondary}]}>
          Loading social accounts...
        </Text>
      </View>
    );
  }

  const hasConnectedAccounts = connectedAccounts.some(acc => acc.isConnected && acc.status === 'connected');

  if (!hasConnectedAccounts) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Publish to Social Media
        </Text>
        <Text style={[styles.sectionSubtitle, {color: theme.colors.textSecondary}]}>
          Connect your social media accounts in Settings to publish your buzzes automatically.
        </Text>
        <TouchableOpacity
          style={[styles.connectButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('Settings' as never)}>
          <Icon name="settings" size={20} color="#FFFFFF" />
          <Text style={styles.connectButtonText}>Go to Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Publish to Social Media
        </Text>
        <Text style={[styles.sectionSubtitle, {color: theme.colors.textSecondary}]}>
          Select platforms to automatically publish this buzz
        </Text>
      </View>

      <View style={styles.platformsGrid}>
        {(['facebook', 'instagram', 'twitter', 'snapchat'] as SocialPlatform[]).map(platform => {
          const info = getPlatformInfo(platform);
          const statusBadge = getStatusBadge(platform);
          const isRefreshing = refreshing === platform;

          return (
            <TouchableOpacity
              key={platform}
              style={[
                styles.platformCard,
                {
                  backgroundColor: info.isSelected
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderColor: info.isSelected
                    ? theme.colors.primary
                    : info.isConnected
                    ? theme.colors.border
                    : theme.colors.border,
                  opacity: info.isConnected ? 1 : 0.6,
                },
              ]}
              onPress={() => togglePlatform(platform)}
              disabled={!info.isConnected || isRefreshing}>
              {isRefreshing ? (
                <ActivityIndicator size="small" color={info.isSelected ? '#FFFFFF' : theme.colors.primary} />
              ) : (
                <>
                  <LinearGradient
                    colors={info.isSelected ? ['#FFFFFF', '#FFFFFF'] : info.gradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[
                      styles.platformIcon,
                      {
                        backgroundColor: info.isSelected ? '#FFFFFF' : info.gradient[0],
                      },
                    ]}>
                    <Icon
                      name={info.icon}
                      size={24}
                      color={info.isSelected ? info.gradient[0] : '#FFFFFF'}
                    />
                  </LinearGradient>

                  <Text
                    style={[
                      styles.platformName,
                      {
                        color: info.isSelected ? '#FFFFFF' : theme.colors.text,
                      },
                    ]}>
                    {info.name}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: info.isSelected
                          ? 'rgba(255, 255, 255, 0.3)'
                          : statusBadge.bg,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: info.isSelected ? '#FFFFFF' : statusBadge.color,
                        },
                      ]}
                      numberOfLines={1}>
                      {statusBadge.text}
                    </Text>
                  </View>

                  {info.isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Icon name="check-circle" size={20} color="#FFFFFF" />
                    </View>
                  )}

                  {(info.isExpired || info.hasError) && (
                    <View style={styles.errorIndicator}>
                      <Icon name="error" size={16} color={theme.colors.error} />
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedPlatforms.length > 0 && (
        <View style={[styles.requirementsInfo, {backgroundColor: theme.colors.surface}]}>
          <Icon name="info" size={16} color={theme.colors.primary} />
          <Text style={[styles.requirementsText, {color: theme.colors.textSecondary}]}>
            {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''} selected. 
            Your buzz will be published automatically after creation.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformCard: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    position: 'relative',
  },
  platformIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '100%',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  errorIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  requirementsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  requirementsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default SocialPlatformSelector;



