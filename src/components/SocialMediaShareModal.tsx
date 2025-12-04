import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useTheme} from '../context/ThemeContext';
import ApiService from '../services/APIService';

interface SocialAccount {
  platform: string;
  username: string;
  isConnected: boolean;
  profilePicture?: string;
}

interface SocialMediaShareModalProps {
  visible: boolean;
  onClose: () => void;
  buzzId: string;
  buzzContent: string;
  buzzMedia?: string;
}

const SocialMediaShareModal: React.FC<SocialMediaShareModalProps> = ({
  visible,
  onClose,
  buzzId,
  buzzContent,
  buzzMedia,
}) => {
  const {theme} = useTheme();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSocialAccounts();
    }
  }, [visible]);

  const loadSocialAccounts = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getConnectedSocialAccounts();

      // Initialize with all platforms
      const allPlatforms = ['instagram', 'facebook', 'snapchat'];
      const connectedPlatforms = response.accounts || [];

      const accounts: SocialAccount[] = allPlatforms.map(platform => {
        const connected = connectedPlatforms.find((acc: any) => acc.platform === platform);
        if (connected) {
          return {
            platform: connected.platform,
            username: connected.username,
            isConnected: true,
            profilePicture: connected.profilePicture,
          };
        }
        return {
          platform,
          username: '',
          isConnected: false,
        };
      });

      setSocialAccounts(accounts);
    } catch (error) {
      console.error('Error loading social accounts:', error);
      // Initialize default accounts on error
      const defaultAccounts: SocialAccount[] = [
        {platform: 'instagram', username: '', isConnected: false},
        {platform: 'facebook', username: '', isConnected: false},
        {platform: 'snapchat', username: '', isConnected: false},
      ];
      setSocialAccounts(defaultAccounts);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    try {
      const response = await ApiService.getSocialAuthUrl(platform);
      if (response.success && response.authUrl) {
        Alert.alert(
          `Connect ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
          'This feature requires opening a web browser for OAuth authentication. Please go to Settings > Privacy & Social to connect your accounts.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Go to Settings',
              onPress: () => {
                onClose();
                // Navigate to settings - this would require navigation prop
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || `${platform} integration is not configured.`);
      }
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      Alert.alert('Error', `Failed to connect to ${platform}. Please try again later.`);
    }
  };

  const handleShare = async (platform: string) => {
    const account = socialAccounts.find(acc => acc.platform === platform);

    if (!account || !account.isConnected) {
      // Prompt to connect
      Alert.alert(
        'Connect Account',
        `You need to connect your ${platform} account first. Would you like to connect now?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Connect', onPress: () => handleConnect(platform)},
        ]
      );
      return;
    }

    // Share to social media
    setSharing(true);
    try {
      const response = await ApiService.shareBuzzToSocial(buzzId, [platform]);

      if (response.success && response.results) {
        const result = response.results.find((r: any) => r.platform === platform);
        if (result && result.success) {
          Alert.alert(
            'Success!',
            `Your buzz has been shared to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`,
            [{text: 'OK', onPress: onClose}]
          );
        } else {
          Alert.alert('Error', result?.error || `Failed to share to ${platform}.`);
        }
      } else {
        Alert.alert('Error', response.error || 'Failed to share buzz.');
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      Alert.alert('Error', `Failed to share to ${platform}. Please try again.`);
    } finally {
      setSharing(false);
    }
  };

  const handleShareToAll = async () => {
    const connectedPlatforms = socialAccounts
      .filter(acc => acc.isConnected)
      .map(acc => acc.platform);

    if (connectedPlatforms.length === 0) {
      Alert.alert('No Connected Accounts', 'Please connect at least one social media account to share.');
      return;
    }

    setSharing(true);
    try {
      const response = await ApiService.shareBuzzToSocial(buzzId, connectedPlatforms);

      if (response.success && response.results) {
        const successCount = response.results.filter((r: any) => r.success).length;
        const failCount = response.results.length - successCount;

        if (successCount > 0) {
          Alert.alert(
            'Sharing Complete',
            `Successfully shared to ${successCount} platform${successCount > 1 ? 's' : ''}${failCount > 0 ? `, ${failCount} failed` : ''}.`,
            [{text: 'OK', onPress: onClose}]
          );
        } else {
          Alert.alert('Error', 'Failed to share to any platforms.');
        }
      } else {
        Alert.alert('Error', response.error || 'Failed to share buzz.');
      }
    } catch (error) {
      console.error('Error sharing to multiple platforms:', error);
      Alert.alert('Error', 'Failed to share buzz. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'camera-alt';
      case 'facebook':
        return 'facebook';
      case 'twitter':
        return 'alternate-email';
      case 'snapchat':
        return 'photo-camera';
      default:
        return 'share';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return ['#E4405F', '#C13584', '#8E44AD'];
      case 'facebook':
        return ['#1877F2', '#0A66C2'];
      case 'twitter':
        return ['#1DA1F2', '#0D8BD9'];
      case 'snapchat':
        return ['#FFFC00', '#FFF700'];
      default:
        return [theme.colors.primary, theme.colors.secondary];
    }
  };

  const renderSocialButton = (platform: string) => {
    const account = socialAccounts.find(acc => acc.platform === platform);
    const isConnected = account?.isConnected || false;

    return (
      <TouchableOpacity
        key={platform}
        onPress={() => handleShare(platform)}
        disabled={sharing}
        style={[styles.socialButton, {borderColor: theme.colors.border}]}>
        <LinearGradient
          colors={getPlatformColor(platform)}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.iconGradient}>
          <Icon name={getPlatformIcon(platform)} size={32} color="#FFFFFF" />
        </LinearGradient>

        <View style={styles.platformInfo}>
          <Text style={[styles.platformName, {color: theme.colors.text}]}>
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </Text>
          {isConnected && account?.username && (
            <Text style={[styles.platformUsername, {color: theme.colors.textSecondary}]}>
              @{account.username}
            </Text>
          )}
          <View style={[styles.statusBadge, {backgroundColor: isConnected ? '#4ECDC4' : theme.colors.textSecondary}]}>
            <Text style={styles.statusText}>
              {isConnected ? 'Tap to Share' : 'Connect to Share'}
            </Text>
          </View>
        </View>

        <Icon
          name={isConnected ? 'send' : 'add-circle'}
          size={24}
          color={isConnected ? theme.colors.primary : theme.colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, {backgroundColor: theme.colors.surface}]}>
          <View style={[styles.header, {backgroundColor: theme.colors.primary}]}>
            <Text style={styles.headerTitle}>Share to Social Media</Text>
            <TouchableOpacity onPress={onClose} disabled={sharing}>
              <Icon name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
              {loading ? 'Loading connected accounts...' : 'Select platform to share your buzz'}
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{marginVertical: 30}} />
            ) : (
              <>
                {socialAccounts.map(account => renderSocialButton(account.platform))}

                {socialAccounts.some(acc => acc.isConnected) && (
                  <TouchableOpacity
                    style={[styles.shareAllButton, {backgroundColor: theme.colors.primary}]}
                    onPress={handleShareToAll}
                    disabled={sharing}>
                    {sharing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Icon name="share" size={24} color="#FFFFFF" />
                        <Text style={styles.shareAllText}>Share to All Connected</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.previewButton, {backgroundColor: theme.colors.background}]}
                  onPress={() => {
                    Alert.alert('Buzz Preview', buzzContent);
                  }}>
                  <Icon name="preview" size={24} color={theme.colors.primary} />
                  <Text style={[styles.previewText, {color: theme.colors.text}]}>
                    Preview Buzz
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 15,
  },
  iconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  platformUsername: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  shareAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  shareAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default SocialMediaShareModal;
